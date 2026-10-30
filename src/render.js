/* ============================================================
   p5 renderer. Reads Sim state + an animation View; never
   mutates game truth. Pixel art drawn to a small buffer and
   scaled; HUD text drawn at native resolution.
   ============================================================ */
'use strict';
const Render = (() => {
  const W = 320, H = 112, SCALE = 3;
  const GROUND = 92;
  const STX = [32, 96, 160, 224, 288];
  let pg, p, hotspots = [], hover = null, hooks = { onPick: null, onHover: null };
  // ---- view: everything decorative --------------------------
  const view = {
    s: null, playerX: STX[0], playerTarget: STX[0], walking: false, stepPhase: 0,
    pipX: STX[1] + 16, pipTarget: STX[1] + 16,
    courier: null,      // {x, tx, t}
    floats: [],         // {x, y, text, color, t, life}
    flashes: {},        // id -> t
    patrol: 0,          // 0..1 red sweep
    shake: 0,
    highlight: null,    // {ok:Set, bad:Set, selected:id}
    queue: [], current: null, t: 0, over: null, winT: 0,
  };
  function setState(s) { view.s = s; view.playerX = view.playerTarget = STX[s.pos]; }

  // ---- animation queue ----------------------------------------
  // item: {dur, start(view), update(view, k)}
  function enqueue(item) { view.queue.push(item); }
  function busy() { return view.queue.length > 0 || view.current !== null; }
  function stepQueue(dt) {
    if (!view.current && view.queue.length) { view.current = view.queue.shift(); view.t = 0; if (view.current.start) view.current.start(view); }
    if (view.current) {
      view.t += dt;
      const k = Math.min(1, view.t / view.current.dur);
      if (view.current.update) view.current.update(view, k);
      if (k >= 1) { if (view.current.end) view.current.end(view); view.current = null; }
    }
  }
  // ---- helpers for the UI to enqueue common things ------------
  function entityPos(id) {
    const s = view.s; if (!s) return { x: 160, y: GROUND };
    const P = s.people, O = s.objects;
    const off = { forger: -18, lookout: 18, guard: -10, clerk: -22, teo: 14, brakeman: 10, papers: -18, stall: 4, gate: 20, crate: -20, attic: 0 };
    if (id === 'self' || id === 'player') return { x: view.playerX, y: GROUND - 12 };
    if (id === 'lookout') return { x: view.pipX, y: GROUND - 8 };
    if (P[id]) return { x: STX[P[id].station] + off[id], y: GROUND - 12 };
    if (O[id]) return { x: STX[O[id].station] + off[id], y: GROUND - 8 };
    if (id === 'attic') return { x: STX[0], y: GROUND - 30 };
    if (typeof id === 'number') return { x: STX[id], y: GROUND - 12 };
    return { x: view.playerX, y: GROUND - 12 };
  }
  function float(id, text, color) {
    enqueue({ dur: 120, start(v) { const pos = entityPos(id); v.floats.push({ x: pos.x, y: pos.y - 6, text, color, t: 0, life: 1400 }); } });
  }
  function walk(from, to) {
    enqueue({ dur: 700, start(v) { v.walking = true; v.playerTarget = STX[to]; },
      update(v, k) { v.playerX = STX[from] + (STX[to] - STX[from]) * k; v.stepPhase += 0.25; if (Math.floor(v.t / 140) !== Math.floor((v.t - 16) / 140)) Sfx.step(Math.floor(v.t / 140)); },
      end(v) { v.walking = false; v.playerX = STX[to]; } });
  }
  function flash(id) { enqueue({ dur: 260, start(v) { v.flashes[id] = 1; }, update(v, k) { v.flashes[id] = 1 - k; }, end(v) { delete v.flashes[id]; } }); }
  function patrol() { enqueue({ dur: 600, update(v, k) { v.patrol = Math.sin(k * Math.PI); v.shake = (1 - k) * 2; }, end(v) { v.patrol = 0; v.shake = 0; } }); }
  function courier(toId) {
    enqueue({ dur: 800, start(v) { v.courier = { x: v.playerX, tx: entityPos(toId).x, t: 0 }; },
      update(v, k) { v.courier.t = k; v.courier.x = v.courier.x0 == null ? (v.courier.x0 = v.courier.x, v.courier.x) : v.courier.x0 + (v.courier.tx - v.courier.x0) * k; },
      end(v) { v.courier = null; } });
  }
  function pipRun(to) { enqueue({ dur: 600, start(v) { v.pipTarget = to === 2 ? STX[2] + 22 : STX[1] + 18; v.pipX0 = v.pipX; }, update(v, k) { v.pipX = v.pipX0 + (v.pipTarget - v.pipX0) * k; } }); }
  function pause(ms) { enqueue({ dur: ms }); }
  function gameOver(over) { enqueue({ dur: 400, start(v) { v.over = over; v.winT = 0; } }); }

  // ---- pixel helpers ------------------------------------------
  function px(g, x, y, rows, pal) {
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
      const c = rows[j][i]; if (c === '.' || !pal[c]) continue;
      g.fill(pal[c]); g.rect(x + i, y + j, 1, 1);
    }
  }
  const PERSON = [
    '..HHH..', '.HHHHH.', '.SSSSS.', '..SSS..', '.CCCCC.', 'CCCCCCC', 'C.CCC.C', '.CCCCC.', '..L.L..', '..L.L..', '..B.B..'];
  const PERSON_WALK = PERSON.slice(0, 8).concat(['.L...L.', '.L...L.', 'B.....B']);
  const SMALL = ['.HHH.', '.SSS.', '.CCC.', 'CCCCC', '.L.L.', '.B.B.'];
  function person(g, x, y, coat, hat, opts = {}) {
    const rows = opts.walk ? PERSON_WALK : PERSON;
    const skin = opts.skin || '#e0b48c';
    px(g, x - 3, y - 11, rows, { H: hat, S: skin, C: coat, L: '#2a2430', B: '#111' });
    if (opts.scarf) { g.fill(opts.scarf); g.rect(x - 2, y - 7, 5, 1); }
  }
  function small(g, x, y, coat, hat) { px(g, x - 2, y - 6, SMALL, { H: hat, S: '#e0b48c', C: coat, L: '#2a2430', B: '#111' }); }

  // ---- scene --------------------------------------------------
  function sky(g, t) {
    for (let y = 0; y < GROUND; y++) {
      const k = y / GROUND;
      g.fill(lerpC([10, 12, 34], [38, 26, 60], k)); g.rect(0, y, W, 1);
    }
    // stars (deterministic)
    g.fill('#cfd6ff');
    for (let i = 0; i < 46; i++) { const x = (i * 97 + 13) % W, y = (i * 53 + 7) % 60; if (((i + Math.floor(t / 500)) % 7) !== 0) g.rect(x, y, 1, 1); }
    // moon
    g.fill('#f1e9c6'); g.ellipse(292, 16, 10, 10); g.fill(lerpC([10, 12, 34], [38, 26, 60], 16 / GROUND)); g.ellipse(295, 14, 8, 8);
    // distant roofline
    g.fill('#141126');
    for (let x = 0; x < W; x += 13) { const h = 12 + ((x * 7) % 11); g.rect(x, GROUND - 28 - h, 13, h + 30); }
  }
  function lerpC(a, b, k) { return `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`; }
  function ground(g) {
    g.fill('#2c2a33'); g.rect(0, GROUND, W, H - GROUND);
    g.fill('#3a3742'); for (let x = 0; x < W; x += 6) g.rect(x + (Math.floor(x / 6) % 2) * 3, GROUND + 2 + (Math.floor(x / 6) % 3) * 5, 4, 2);
    g.fill('#1a1820'); g.rect(0, GROUND, W, 1);
  }
  function lamp(g, x, lit = true) {
    g.fill('#555'); g.rect(x, GROUND - 26, 1, 26); g.rect(x - 2, GROUND - 27, 5, 2);
    if (lit) { g.fill('#ffd27a'); g.rect(x - 1, GROUND - 30, 3, 3); g.fill('rgba(255,210,120,0.08)'); g.ellipse(x + 1, GROUND - 14, 36, 36); }
  }
  function attic(g, s, t) {
    const cx = STX[0];
    g.fill('#3b2f3f'); g.rect(cx - 22, GROUND - 44, 44, 44);
    g.fill('#2a2130'); g.triangle(cx - 25, GROUND - 44, cx + 25, GROUND - 44, cx, GROUND - 58);
    g.fill(s.heat >= 6 ? '#ff9a5c' : '#ffd27a'); g.rect(cx - 4, GROUND - 52, 8, 6);            // attic window
    g.fill('#1a1420'); g.rect(cx - 3, GROUND - 49, 1, 3); g.rect(cx, GROUND - 52, 1, 6);
    g.fill('#55434f'); g.rect(cx - 6, GROUND - 14, 12, 14); g.fill('#2a2130'); g.rect(cx - 5, GROUND - 13, 10, 13);
    g.fill('#8a7a4a'); g.rect(cx - 18, GROUND - 36, 10, 8); g.rect(cx + 8, GROUND - 36, 10, 8);
    g.fill('#2a2130'); g.rect(cx - 13, GROUND - 36, 1, 8); g.rect(cx + 13, GROUND - 36, 1, 8);
  }
  function market(g, s) {
    const cx = STX[1], O = s.objects;
    // stall
    g.fill('#5a3a2a'); g.rect(cx - 2, GROUND - 14, 20, 14);
    for (let i = 0; i < 20; i += 4) { g.fill(i % 8 ? '#c84a4a' : '#e8e0d0'); g.rect(cx - 3 + i, GROUND - 22, 4, 5); }
    g.fill('#3a2418'); g.rect(cx - 3, GROUND - 17, 22, 3);
    if (O.stall.state === 'stocked') { g.fill('#e8dcb0'); g.rect(cx + 1, GROUND - 13, 4, 2); g.rect(cx + 6, GROUND - 13, 4, 2); g.rect(cx + 11, GROUND - 13, 4, 2); g.fill('#b0423a'); g.rect(cx + 7, GROUND - 13, 1, 2); }
    // forger's bench with papers
    g.fill('#4a3828'); g.rect(cx - 26, GROUND - 10, 16, 2); g.rect(cx - 25, GROUND - 8, 1, 8); g.rect(cx - 12, GROUND - 8, 1, 8);
    const ps = O.papers.state;
    g.fill(ps === 'blank' ? '#efe6cc' : '#efe6cc'); g.rect(cx - 21, GROUND - 13, 6, 4);
    if (ps === 'inking') { g.fill('#5b3a8a'); g.rect(cx - 20, GROUND - 12, 3, 1); g.rect(cx - 19, GROUND - 10, 2, 1); }
    if (ps === 'stamped') { g.fill('#5b3a8a'); g.rect(cx - 20, GROUND - 12, 4, 1); g.rect(cx - 20, GROUND - 10, 4, 1); g.fill('#d23a3a'); g.rect(cx - 17, GROUND - 13, 2, 2); }
    g.fill('#2a2130'); g.rect(cx - 30, GROUND - 40, 60, 20); g.fill('#ffd27a'); g.rect(cx - 20, GROUND - 36, 5, 5); g.rect(cx + 14, GROUND - 36, 5, 5);
  }
  function checkpoint(g, s, t) {
    const cx = STX[2], O = s.objects;
    g.fill('#4a4a52'); g.rect(cx - 30, GROUND - 30, 24, 30); g.fill('#2a2a30'); g.rect(cx - 24, GROUND - 24, 10, 8);
    g.fill('#ffd27a'); g.rect(cx - 23, GROUND - 23, 8, 6);
    // barrier
    g.fill('#555'); g.rect(cx - 4, GROUND - 16, 2, 16);
    for (let i = 0; i < 20; i += 4) { g.fill(i % 8 ? '#d9d9d9' : '#c83a3a'); g.rect(cx - 2 + i, GROUND - 15, 4, 2); }
    // brazier
    g.fill('#333'); g.rect(cx - 16, GROUND - 6, 6, 6);
    if (s.people.guard.state === 'distracted') { g.fill(Math.floor(t / 90) % 2 ? '#ff8a2a' : '#ffd24a'); g.rect(cx - 15, GROUND - 10, 4, 4); g.rect(cx - 14, GROUND - 13, 2, 3); g.fill('#777'); g.rect(cx - 13 + (Math.floor(t / 300) % 3), GROUND - 18, 2, 4); }
    // fence + side gate
    g.fill('#6a6a72'); for (let x = cx + 8; x < cx + 34; x += 3) g.rect(x, GROUND - 12, 1, 12);
    g.rect(cx + 8, GROUND - 12, 26, 1); g.rect(cx + 8, GROUND - 6, 26, 1);
    const gx = cx + 16;
    g.fill('#9a8a5a');
    if (O.gate.state === 'locked') { g.rect(gx, GROUND - 13, 8, 13); g.fill('#2c2a33'); g.rect(gx + 1, GROUND - 12, 6, 11); g.fill('#9a8a5a'); g.rect(gx + 3, GROUND - 12, 2, 11); g.fill('#c8b040'); g.rect(gx + 6, GROUND - 7, 2, 2); }
    else { g.rect(gx, GROUND - 13, 2, 13); g.rect(gx + 2, GROUND - 14, 5, 2); g.rect(gx + 6, GROUND - 14, 2, 14); g.fill('#2c2a33'); }
  }
  function yard(g, s) {
    const cx = STX[3];
    g.fill('#3a3a44'); g.rect(cx - 30, GROUND - 34, 36, 34); g.fill('#1f1f28'); g.rect(cx - 30, GROUND - 38, 38, 4);
    const open = s.people.clerk.state === 'open';
    g.fill(open ? '#ffe28a' : '#1a1a22'); g.rect(cx - 27, GROUND - 26, 12, 12);
    g.fill('#4a4a56'); g.rect(cx - 27, GROUND - 14, 12, 2);
    if (!open) { g.fill('#555'); g.rect(cx - 27, GROUND - 26, 12, 1); g.rect(cx - 27, GROUND - 21, 12, 1); g.rect(cx - 27, GROUND - 16, 12, 1); }
    // rails
    g.fill('#6a6a6a'); g.rect(cx + 4, GROUND - 3, 60, 1); g.rect(cx + 4, GROUND - 1, 60, 1);
    g.fill('#4a3a2a'); for (let x = cx + 4; x < cx + 64; x += 5) g.rect(x, GROUND - 4, 2, 4);
    g.fill('#2a2a30'); g.rect(cx + 20, GROUND - 20, 10, 20); // signal post
    g.fill(s.people.teo.state === 'friendly' ? '#5cd65c' : '#d64040'); g.rect(cx + 23, GROUND - 18, 4, 4);
  }
  function platform(g, s, t) {
    const cx = STX[4], O = s.objects;
    g.fill('#555'); g.rect(cx - 36, GROUND - 2, 72, 2);
    // freight car
    g.fill('#6a2d2d'); g.rect(cx - 20, GROUND - 30, 56, 24);
    g.fill('#4a1f1f'); g.rect(cx - 20, GROUND - 32, 56, 2); g.rect(cx + 2, GROUND - 28, 12, 20);
    g.fill('#2a2a2a'); g.rect(cx - 16, GROUND - 6, 6, 6); g.rect(cx + 26, GROUND - 6, 6, 6);
    g.fill('#e8e8e8'); g.rect(cx + 20, GROUND - 24, 3, 3); // chalk mark
    if (view.over && view.over.win) { const k = Math.min(1, view.winT / 2000); g.fill('#ccc'); g.ellipse(cx + 40 - k * 20, GROUND - 40 - k * 20, 8 + k * 12, 8 + k * 12); }
    // crate
    const kx = cx - 20;
    g.fill('#8a6a3a'); g.rect(kx - 5, GROUND - 10, 10, 10); g.fill('#5a4420'); g.rect(kx - 5, GROUND - 5, 10, 1); g.rect(kx, GROUND - 10, 1, 10);
    if (O.crate.state === 'prepared') { g.fill('#8a6a3a'); g.rect(kx - 3, GROUND - 13, 10, 2); g.fill('#e0c060'); g.rect(kx - 4, GROUND - 11, 8, 1); }
    else { g.fill('#8a6a3a'); g.rect(kx - 6, GROUND - 12, 12, 2); }
  }
  function indicator(g, x, y, kind, t, pips) {
    // speech-bubble style marker above a head
    g.fill('#f4f1e8'); g.rect(x - 3, y - 8, 7, 6); g.rect(x - 1, y - 2, 2, 1);
    if (kind === 'busy') { g.fill('#5b3a8a'); g.rect(x - 1 + (Math.floor(t / 150) % 2), y - 6, 2, 2); }
    if (kind === '!') { g.fill('#d23a3a'); g.rect(x, y - 7, 1, 3); g.rect(x, y - 3, 1, 1); }
    if (kind === '?') { g.fill('#3b5d8f'); g.rect(x - 1, y - 7, 3, 1); g.rect(x + 1, y - 6, 1, 1); g.rect(x, y - 5, 1, 1); g.rect(x, y - 3, 1, 1); }
    if (kind === 'coin') { g.fill('#e8b040'); g.rect(x - 1, y - 6, 3, 3); }
    if (kind === 'ok') { g.fill('#3aa84a'); g.rect(x - 2, y - 5, 1, 1); g.rect(x - 1, y - 4, 1, 1); g.rect(x, y - 5, 1, 1); g.rect(x + 1, y - 6, 1, 1); g.rect(x + 2, y - 7, 1, 1); }
    if (kind === 'x') { g.fill('#d23a3a'); g.rect(x - 2, y - 7, 1, 1); g.rect(x - 1, y - 6, 1, 1); g.rect(x, y - 5, 1, 1); g.rect(x + 1, y - 4, 1, 1); g.rect(x + 2, y - 3, 1, 1); g.rect(x + 2, y - 7, 1, 1); g.rect(x + 1, y - 6, 1, 1); g.rect(x - 1, y - 4, 1, 1); g.rect(x - 2, y - 3, 1, 1); }
    if (pips) { for (let i = 0; i < pips; i++) { g.fill('#ffd27a'); g.rect(x - 3 + i * 2, y - 10, 1, 1); } }
  }
  function people(g, s, t) {
    const P = s.people, jobs = s.jobs;
    const bob = (id) => (Math.floor(t / 400 + id.length) % 2);
    const rem = (type) => { const j = jobs.find(j => j.type === type); return j ? j.remaining : 0; };
    // forger
    let e = entityPos('forger'); person(g, e.x, GROUND, P.forger.coat, P.forger.hat);
    if (P.forger.state === 'busy') { g.fill('#5b3a8a'); g.rect(e.x + 3 + (Math.floor(t / 150) % 2), GROUND - 8, 1, 3); indicator(g, e.x, GROUND - 14, 'busy', t, rem('forge')); }
    // lookout
    e = entityPos('lookout'); small(g, e.x, GROUND, P.lookout.coat, P.lookout.hat);
    if (P.lookout.state === 'running') indicator(g, e.x, GROUND - 9, '!', t, rem('lookout'));
    // guard
    e = entityPos('guard'); person(g, e.x, GROUND, P.guard.coat, P.guard.hat, { skin: '#d8a070' });
    g.fill('#c8c8d0'); g.rect(e.x - 4, GROUND - 7, 1, 1); // badge
    if (P.guard.state === 'alert') { g.fill('#555'); g.rect(e.x + 4, GROUND - 14, 1, 12); }
    if (P.guard.state === 'distracted') indicator(g, e.x, GROUND - 14, '?', t, rem('distract'));
    if (P.guard.state === 'bribed') indicator(g, e.x, GROUND - 14, 'coin', t);
    // clerk (in window) — only drawn when window open or as silhouette
    e = entityPos('clerk');
    if (P.clerk.state === 'open') { px(g, e.x - 2, GROUND - 24, ['.HHH.', 'HHHHH', '.SSS.', 'CCCCC'], { H: P.clerk.hat, S: '#e0b48c', C: P.clerk.coat }); indicator(g, e.x + 1, GROUND - 28, 'ok', t); }
    else { g.fill('#333'); g.rect(e.x - 1, GROUND - 22, 3, 5); }
    // teo
    e = entityPos('teo'); person(g, e.x, GROUND, P.teo.coat, P.teo.hat, { skin: '#c89060' });
    g.fill('#777'); g.rect(e.x + 4, GROUND - 10 + bob('teo'), 1, 8); // shovel
    indicator(g, e.x, GROUND - 14, P.teo.state === 'friendly' ? 'ok' : 'x', t);
    // brakeman
    e = entityPos('brakeman'); person(g, e.x, GROUND, P.brakeman.coat, P.brakeman.hat);
    g.fill(P.brakeman.state === 'agreed' ? '#ffd27a' : '#664'); g.rect(e.x + 4, GROUND - 9, 2, 3); // lantern
    if (P.brakeman.state === 'agreed') indicator(g, e.x, GROUND - 14, 'ok', t);
    // courier
    if (view.courier) small(g, Math.round(view.courier.x), GROUND, '#3a6a9a', '#223');
    // player — Ines
    const walk = view.walking && Math.floor(view.stepPhase) % 2 === 0;
    person(g, Math.round(view.playerX) + 2, GROUND, '#8a2f3a', '#3a2418', { scarf: '#d94f5c', walk });
    if (s.objects.papers.state === 'stamped' && !view.walking) { g.fill('#efe6cc'); g.rect(Math.round(view.playerX) + 6, GROUND - 7, 2, 3); }
  }
  function highlights(g, t) {
    const h = view.highlight; if (!h) return;
    const pulse = 0.5 + 0.5 * Math.sin(t / 160);
    const box = (id, col, w) => {
      const e = entityPos(id); const r = hotRect(id);
      g.noFill(); g.stroke(col); g.strokeWeight(w);
      g.rect(r.x, r.y, r.w, r.h); g.noStroke();
      // pointer
      if (col !== '#55535e') { g.fill(col); g.triangle(e.x, r.y - 2, e.x - 2, r.y - 5, e.x + 2, r.y - 5); }
    };
    for (const id of h.bad) box(id, '#55535e', 1);
    for (const id of h.ok) box(id, h.selected === id ? '#ffffff' : (pulse > 0.5 ? '#ffd24a' : '#ff9a2a'), 1);
  }
  function hotRect(id) {
    const e = entityPos(id);
    if (id === 'attic') return { x: STX[0] - 23, y: GROUND - 58, w: 46, h: 58 };
    if (id === 'self' || id === 'player') return { x: e.x - 2, y: GROUND - 13, w: 9, h: 14 };
    if (view.s.objects[id]) return id === 'gate' ? { x: e.x - 1, y: GROUND - 15, w: 10, h: 15 } : id === 'crate' ? { x: e.x - 7, y: GROUND - 14, w: 14, h: 14 } : id === 'stall' ? { x: e.x - 4, y: GROUND - 23, w: 24, h: 23 } : { x: e.x - 4, y: GROUND - 15, w: 9, h: 7 };
    if (id === 'lookout') return { x: e.x - 3, y: GROUND - 8, w: 7, h: 9 };
    if (id === 'clerk') return { x: e.x - 5, y: GROUND - 27, w: 12, h: 14 };
    return { x: e.x - 4, y: GROUND - 13, w: 9, h: 14 };
  }

  // ---- HUD (native resolution) --------------------------------
  function hud(s, t) {
    p.textFont('monospace'); p.noStroke();
    // route presentation along the top
    const y = 14;
    for (let i = 0; i < 5; i++) {
      const x = STX[i] * SCALE;
      if (i < 4) {
        const nx = STX[i + 1] * SCALE;
        const gate = (i === 1 && !Sim.arrangements(s).passage.done) || (i === 2 && !Sim.arrangements(s).yard.done);
        p.stroke(gate ? '#6a3a3a' : (s.pos > i ? '#5cd65c' : '#6a6a7a')); p.strokeWeight(2); p.line(x + 8, y, nx - 8, y);
        if (gate) { p.noStroke(); p.fill('#d23a3a'); p.rect((x + nx) / 2 - 3, y - 4, 6, 8); }
      }
      p.noStroke();
      p.fill(i === s.pos ? '#ffd24a' : (i < s.pos ? '#5cd65c' : '#9a9aaa')); p.ellipse(x, y, i === s.pos ? 10 : 7);
      p.fill('#cfd0dd'); p.textSize(10); p.textAlign(p.CENTER, p.TOP); p.text(Sim.STATIONS[i].short.toUpperCase(), x, y + 7);
    }
    // arrangement badges (bottom-left)
    const A = Sim.arrangements(s); let bx = 8;
    p.textSize(10); p.textAlign(p.LEFT, p.CENTER);
    for (const k of ['papers', 'passage', 'yard', 'berth']) {
      const a = A[k]; const label = (a.done ? '✓ ' : '○ ') + a.name;
      const w = p.textWidth(label) + 10;
      p.fill(a.done ? 'rgba(60,150,80,0.85)' : 'rgba(40,40,52,0.85)'); p.rect(bx, p.height - 20, w, 14, 3);
      p.fill(a.done ? '#eafbe8' : '#aab'); p.text(label, bx + 5, p.height - 13);
      bx += w + 6;
    }
    // hover tooltip
    if (hover && !busy()) {
      const e = entityPos(hover.id); const label = hover.label;
      p.textSize(11); const w = p.textWidth(label) + 10;
      let tx = Math.min(p.width - w - 4, Math.max(4, e.x * SCALE - w / 2));
      p.fill('rgba(12,12,20,0.92)'); p.rect(tx, e.y * SCALE - 40, w, 16, 3);
      p.fill('#fff'); p.textAlign(p.LEFT, p.CENTER); p.text(label, tx + 5, e.y * SCALE - 32);
    }
    // floats
    p.textSize(11); p.textAlign(p.CENTER, p.BOTTOM);
    for (const f of view.floats) { const k = f.t / f.life; p.fill(f.color); p.text(f.text, f.x * SCALE, (f.y - k * 12) * SCALE); }
    // patrol sweep
    if (view.patrol > 0) { p.fill(`rgba(220,40,40,${0.18 * view.patrol})`); p.rect(0, 0, p.width, p.height); }
    // game over
    if (view.over) {
      p.fill('rgba(8,8,14,0.72)'); p.rect(0, 0, p.width, p.height);
      p.textAlign(p.CENTER, p.CENTER); p.textSize(26); p.fill(view.over.win ? '#ffd24a' : '#ff6a6a');
      p.text(view.over.win ? 'YOU MADE THE FREIGHT' : 'CAUGHT IN VERLANE', p.width / 2, p.height / 2 - 14);
      p.textSize(12); p.fill('#eee'); p.text('see the panel below to read what happened', p.width / 2, p.height / 2 + 14);
    }
  }

  // ---- hotspots / input ---------------------------------------
  function rebuildHotspots(s) {
    hotspots = [];
    const add = (id, label) => { const r = hotRect(id); hotspots.push({ id, label, x: r.x * SCALE, y: r.y * SCALE, w: r.w * SCALE, h: r.h * SCALE }); };
    for (const id in s.people) add(id, `${s.people[id].name} — ${Sim.STATE_LABEL[id][s.people[id].state]}`);
    for (const id in s.objects) add(id, `${s.objects[id].name} — ${Sim.STATE_LABEL[id][s.objects[id].state]}`);
    add('attic', 'Your hideout');
    add('self', 'Ines (you)');
  }
  function hitTest(mx, my) {
    // selected-card targets take priority, then everything else; last drawn wins
    const h = view.highlight;
    let best = null;
    for (const hs of hotspots) if (mx >= hs.x && mx <= hs.x + hs.w && my >= hs.y && my <= hs.y + hs.h) {
      if (h && (h.ok.has(hs.id) || h.bad.has(hs.id))) return hs;
      best = hs;
    }
    return best;
  }

  // ---- p5 sketch ---------------------------------------------
  let last = 0;
  const sketch = (pp) => {
    p = pp;
    pp.setup = () => {
      const c = pp.createCanvas(W * SCALE, H * SCALE); c.parent('scene');
      pp.pixelDensity(1); pp.noSmooth(); pp.frameRate(60);
      pg = pp.createGraphics(W, H); pg.pixelDensity(1); pg.noSmooth(); pg.noStroke();
      last = pp.millis();
    };
    pp.draw = () => {
      const now = pp.millis(), dt = Math.min(50, now - last); last = now;
      const s = view.s; if (!s) return;
      stepQueue(dt);
      for (const f of view.floats) f.t += dt; view.floats = view.floats.filter(f => f.t < f.life);
      if (view.over && view.over.win) view.winT += dt;
      const g = pg; g.noStroke();
      g.push(); g.translate(Math.round((Math.random() - 0.5) * view.shake), 0);
      sky(g, now); attic(g, s, now); market(g, s); checkpoint(g, s, now); yard(g, s); platform(g, s, now); ground(g);
      [64, 128, 192, 256].forEach(x => lamp(g, x));
      people(g, s, now); highlights(g, now);
      g.pop();
      pp.background('#0a0a12'); pp.image(pg, 0, 0, pp.width, pp.height);
      rebuildHotspots(s);
      hover = hitTest(pp.mouseX, pp.mouseY);
      pp.cursor(hover && view.highlight && view.highlight.ok.has(hover.id) ? 'pointer' : 'default');
      hud(s, now);
    };
    pp.mousePressed = () => {
      if (pp.mouseX < 0 || pp.mouseY < 0 || pp.mouseX > pp.width || pp.mouseY > pp.height) return;
      const hs = hitTest(pp.mouseX, pp.mouseY);
      if (hs && hooks.onPick) hooks.onPick(hs.id);
    };
  };

  function start(hk) { Object.assign(hooks, hk); new p5(sketch); }
  function setHighlight(h) { view.highlight = h; }
  return { start, setState, setHighlight, enqueue, busy, float, walk, flash, patrol, courier, pipRun, pause, gameOver, view, STX };
})();
