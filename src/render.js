/* ============================================================
   COALITION renderer (p5). Reads Sim state and a decorative View.
   One pixel-art scene per level, drawn to a 320x112 buffer and scaled.
   HUD at native resolution: the route with two markers (where you are,
   where they think you are), exposure, arrangement badges.
   ============================================================ */
'use strict';
const Render = (() => {
  const W = 320, H = 112, SCALE = 3, GROUND = 92;
  let pg, p, hotspots = [], hover = null, hooks = {};
  const view = { s: null, queue: [], current: null, t: 0, flashes: {}, floats: [], shake: 0, ring: 0, die: null, fade: 0, sceneAlpha: 1, enemyPulse: 0, over: null };
  function setState(s) { view.s = s; }
  function enqueue(item) { view.queue.push(item); }
  function busy() { return view.queue.length > 0 || view.current !== null; }
  function stepQueue(dt) {
    if (!view.current && view.queue.length) { view.current = view.queue.shift(); view.t = 0; if (view.current.start) view.current.start(view); }
    if (view.current) { view.t += dt; const k = Math.min(1, view.t / view.current.dur); if (view.current.update) view.current.update(view, k); if (k >= 1) { if (view.current.end) view.current.end(view); view.current = null; } }
  }
  function float(x, y, text, color) { enqueue({ dur: 100, start(v) { v.floats.push({ x, y, text, color, t: 0, life: 1500 }); } }); }
  function dice(die, need, won) { enqueue({ dur: 900, start(v) { v.die = { die, need, won, t: 0 }; }, update(v, k) { v.die.t = k; }, end(v) { v.die = null; } }); }
  function travel() { enqueue({ dur: 700, update(v, k) { v.fade = Math.sin(k * Math.PI); } , end(v) { v.fade = 0; } }); }
  function enemy() { enqueue({ dur: 600, update(v, k) { v.enemyPulse = Math.sin(k * Math.PI); v.shake = (1 - k) * 2; }, end(v) { v.enemyPulse = 0; v.shake = 0; } }); }
  function ring() { enqueue({ dur: 500, update(v, k) { v.ring = 1 - k; }, end(v) { v.ring = 0; } }); }
  function pause(ms) { enqueue({ dur: ms }); }
  function gameOver(over) { enqueue({ dur: 300, start(v) { v.over = over; } }); }

  // ---- pixel helpers ----------------------------------------
  function px(g, x, y, rows, pal) { for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) { const c = rows[j][i]; if (c === '.' || !pal[c]) continue; g.fill(pal[c]); g.rect(x + i, y + j, 1, 1); } }
  const PERSON = ['..HHH..', '.HHHHH.', '.SSSSS.', '..SSS..', '.CCCCC.', 'CCCCCCC', 'C.CCC.C', '.CCCCC.', '..L.L..', '..L.L..', '..B.B..'];
  function person(g, x, y, coat, hat, skin) { px(g, x - 3, y - 11, PERSON, { H: hat, S: skin || '#e0b48c', C: coat, L: '#2a2430', B: '#111' }); }
  function car(g, x, y, col) { g.fill(col); g.rect(x, y - 6, 22, 5); g.rect(x + 5, y - 10, 11, 4); g.fill('#9ad'); g.rect(x + 6, y - 9, 4, 3); g.rect(x + 11, y - 9, 4, 3); g.fill('#111'); g.rect(x + 3, y - 2, 4, 3); g.rect(x + 15, y - 2, 4, 3); }
  const lerpC = (a, b, k) => `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`;
  function sky(g, t, night, top, bottom) {
    for (let y = 0; y < GROUND; y++) { g.fill(lerpC(top, bottom, y / GROUND)); g.rect(0, y, W, 1); }
    if (night) { g.fill('#cfd6ff'); for (let i = 0; i < 40; i++) { const x = (i * 97 + 13) % W, y = (i * 53 + 7) % 60; if (((i + Math.floor(t / 500)) % 7) !== 0) g.rect(x, y, 1, 1); } }
  }
  function ground(g, col, col2) { g.fill(col); g.rect(0, GROUND, W, H - GROUND); g.fill(col2); for (let x = 0; x < W; x += 6) g.rect(x + (Math.floor(x / 6) % 2) * 3, GROUND + 2 + (Math.floor(x / 6) % 3) * 5, 4, 2); }
  function lamp(g, x) { g.fill('#555'); g.rect(x, GROUND - 26, 1, 26); g.rect(x - 2, GROUND - 27, 5, 2); g.fill('#ffd27a'); g.rect(x - 1, GROUND - 30, 3, 3); g.fill('rgba(255,210,120,0.08)'); g.ellipse(x + 1, GROUND - 14, 36, 36); }

  // ---- scenes: one per level. People positions double as hotspots. ----
  const SCENES = {
    residence(g, s, t, night) {
      sky(g, t, night, night ? [10, 12, 34] : [120, 160, 210], night ? [38, 26, 60] : [230, 200, 160]);
      g.fill('#3b2f3f'); g.rect(40, GROUND - 60, 110, 60); g.fill('#2a2130'); g.triangle(36, GROUND - 60, 154, GROUND - 60, 95, GROUND - 76);
      for (let i = 0; i < 4; i++) { g.fill(night ? '#ffd27a' : '#cde'); g.rect(52 + i * 24, GROUND - 48, 10, 10); g.rect(52 + i * 24, GROUND - 28, 10, 12); }
      g.fill('#55434f'); g.rect(88, GROUND - 16, 14, 16); g.fill('#2a2130'); g.rect(89, GROUND - 15, 12, 15);
      g.fill('#6a6a72'); g.rect(160, GROUND - 14, 1, 14); g.rect(160, GROUND - 14, 60, 1); // service lane fence
      g.fill('#8a6a3a'); g.rect(200, GROUND - 22, 40, 22); g.fill('#2a2130'); g.rect(210, GROUND - 12, 8, 12); // kitchen wing
      ground(g, '#2c2a33', '#3a3742'); lamp(g, 30); lamp(g, 290);
      car(g, 236, GROUND, '#2b3450'); car(g, 268, GROUND, '#2b3450'); // the watch
      person(g, 300, GROUND, '#3b3f55', '#1b2a45', '#d8a070'); person(g, 262, GROUND - 1, '#3b3f55', '#1b2a45');
      people(g, s, [['nando', 24, '#8a6a3a', '#4a3a1a'], ['aide', 120, '#5a2d5a', '#2b1d3a']]);
      car(g, 8, GROUND, '#6a2d2d');
    },
    road(g, s, t, night) {
      sky(g, t, night, night ? [10, 12, 34] : [150, 180, 220], night ? [38, 26, 60] : [240, 220, 180]);
      g.fill('#1f2d44'); g.rect(0, GROUND - 20, W, 20); g.fill('#2b3f5c'); for (let x = 0; x < W; x += 9) g.rect(x, GROUND - 14 + (x % 3), 5, 1); // the river
      g.fill('#6a6a72'); g.rect(100, GROUND - 24, 120, 6); for (let x = 104; x < 220; x += 12) g.rect(x, GROUND - 18, 2, 18); // bridge
      g.fill('#4a4a52'); g.rect(228, GROUND - 30, 30, 30); g.fill('#ffd27a'); g.rect(236, GROUND - 24, 8, 6); // post
      for (let i = 0; i < 20; i += 4) { g.fill(i % 8 ? '#d9d9d9' : '#c83a3a'); g.rect(258 + i, GROUND - 15, 4, 2); } g.fill('#555'); g.rect(256, GROUND - 16, 2, 16);
      g.fill('#2c2a33'); g.rect(0, GROUND, W, H - GROUND); g.fill('#e8d8a0'); for (let x = 0; x < W; x += 14) g.rect(x, GROUND + 8, 7, 1);
      g.fill('#3b2f3f'); g.rect(10, GROUND - 40, 60, 40); g.fill('#ffd27a'); g.rect(20, GROUND - 30, 8, 8); g.fill('#cfd0dd'); g.rect(30, GROUND - 38, 28, 4); // registry on the square
      car(g, 150, GROUND, '#c8c84a'); car(g, 60, GROUND, '#6a2d2d');
      people(g, s, [['registry', 40, '#5f8a4a', '#2f4a22'], ['nando', 84, '#8a6a3a', '#4a3a1a']]);
      person(g, 270, GROUND, '#3b5d8f', '#1b2a45', '#d8a070');
    },
    colonia(g, s, t, night) {
      sky(g, t, night, night ? [10, 12, 34] : [140, 170, 215], night ? [38, 26, 60] : [235, 210, 170]);
      g.fill('#2f4a22'); for (let r = 0; r < 4; r++) for (let x = 0; x < W; x += 10) g.rect(x + r * 3, GROUND - 40 + r * 6, 6, 4); // vines
      g.fill('#e8e0d0'); g.rect(220, GROUND - 50, 40, 50); g.fill('#b05030'); g.triangle(216, GROUND - 50, 264, GROUND - 50, 240, GROUND - 66); g.fill('#e8e0d0'); g.rect(236, GROUND - 78, 8, 14); g.fill('#b05030'); g.triangle(234, GROUND - 78, 246, GROUND - 78, 240, GROUND - 86); // church
      g.fill('#c8a070'); g.rect(60, GROUND - 36, 70, 36); g.fill('#8a4a30'); g.rect(56, GROUND - 40, 78, 5); g.fill('#ffd27a'); g.rect(70, GROUND - 28, 10, 10); g.rect(108, GROUND - 28, 10, 10); g.fill('#5a3a2a'); g.rect(88, GROUND - 16, 12, 16); // the house, veranda
      g.fill('#5a3a2a'); g.rect(40, GROUND - 8, 100, 2); for (let x = 40; x < 140; x += 20) g.rect(x, GROUND - 8, 2, 8);
      ground(g, '#4a3a2a', '#5a4a3a');
      g.fill('#6a6a4a'); g.rect(150, GROUND - 14, 36, 10); g.fill('#3a3a2a'); g.rect(152, GROUND - 12, 32, 6); g.fill('#111'); g.rect(154, GROUND - 3, 5, 3); g.rect(176, GROUND - 3, 5, 3); // the grape truck, impounded or not
      people(g, s, [['host', 100, '#7a4ea8', '#eee', '#c89060']]);
      g.fill('#8a6a3a'); g.rect(20, GROUND - 6, 6, 6); // mate on the step
    },
    salta(g, s, t, night) {
      sky(g, t, night, [10, 12, 34], [38, 26, 60]);
      g.fill('#141126'); for (let x = 0; x < W; x += 13) { const h = 12 + ((x * 7) % 11); g.rect(x, GROUND - 28 - h, 13, h + 30); }
      g.fill('#3a3a44'); g.rect(40, GROUND - 34, 36, 34); g.fill('#ffe28a'); g.rect(44, GROUND - 26, 12, 12);
      g.fill('#6a6a6a'); g.rect(80, GROUND - 3, 240, 1); g.rect(80, GROUND - 1, 240, 1); g.fill('#4a3a2a'); for (let x = 80; x < W; x += 5) g.rect(x, GROUND - 4, 2, 4);
      g.fill('#6a2d2d'); g.rect(160, GROUND - 30, 70, 24); g.rect(240, GROUND - 30, 70, 24); g.fill('#4a1f1f'); g.rect(160, GROUND - 32, 150, 2); g.fill('#e8e8e8'); g.rect(190, GROUND - 24, 3, 3);
      g.fill('#2a2a2a'); g.rect(164, GROUND - 6, 6, 6); g.rect(220, GROUND - 6, 6, 6); g.rect(244, GROUND - 6, 6, 6); g.rect(300, GROUND - 6, 6, 6);
      ground(g, '#2c2a33', '#3a3742'); lamp(g, 100);
      people(g, s, [['theo', 120, '#8a6a3a', '#4a3a1a', '#c89060'], ['holt', 150, '#444c5a', '#222630']]);
    },
    border(g, s, t, night) {
      sky(g, t, night, night ? [10, 12, 34] : [160, 180, 210], night ? [38, 26, 60] : [220, 220, 230]);
      g.fill('#cfd6e0'); g.triangle(0, GROUND, 90, GROUND - 70, 180, GROUND); g.triangle(140, GROUND, 250, GROUND - 60, 330, GROUND); // peaks
      g.fill('#eef3f8'); g.rect(0, GROUND, W, H - GROUND); g.fill('#dde3ea'); for (let x = 0; x < W; x += 7) g.rect(x, GROUND + 3 + (x % 5), 4, 1);
      g.fill('#4a4a52'); g.rect(60, GROUND - 30, 40, 30); g.fill('#ffd27a'); g.rect(70, GROUND - 24, 8, 6); g.fill('#333'); g.rect(104, GROUND - 6, 6, 6); g.fill('#ff8a2a'); g.rect(105, GROUND - 10, 4, 4); // post and stove
      g.fill('#555'); g.rect(156, GROUND - 16, 2, 16); for (let i = 0; i < 24; i += 4) { g.fill(i % 8 ? '#d9d9d9' : '#c83a3a'); g.rect(158 + i, GROUND - 15, 4, 2); } // barrier
      g.fill('#2a3a2a'); g.rect(240, GROUND - 28, 40, 28); g.fill('#ffe28a'); g.rect(250, GROUND - 22, 8, 6); // the Esmeraldan hut
      g.fill('#c83a3a'); g.rect(170, GROUND - 40, 1, 40); g.fill('#5cd65c'); g.rect(172, GROUND - 40, 1, 40); // the line
      person(g, 120, GROUND, '#3b5d8f', '#1b2a45', '#d8a070'); person(g, 140, GROUND, '#3b5d8f', '#1b2a45');
      people(g, s, s.arr.reception.stage >= 3 ? [['official', 220, '#8a2f3a', '#2b1d3a']] : []);
    },
    airfield(g, s, t, night) {
      sky(g, t, night, night ? [10, 12, 34] : [120, 130, 150], night ? [38, 26, 60] : [170, 175, 185]);
      g.fill('#3a4a5a'); g.rect(0, GROUND - 30, W, 30); g.fill('#4a5a6a'); for (let x = 0; x < W; x += 11) g.rect(x, GROUND - 24 + (x % 4), 6, 1); // the sea
      g.fill('#555'); g.rect(10, GROUND - 60, 14, 60); g.fill('#777'); g.rect(4, GROUND - 66, 26, 10); g.fill('#ffd27a'); g.rect(8, GROUND - 64, 18, 6); // tower
      ground(g, '#3a3a40', '#4a4a50'); g.fill('#ffd27a'); for (let x = 0; x < W; x += 20) g.rect(x, GROUND + 9, 10, 1);
      const st = s.arr.aircraft.stage;
      if (st >= 1) { const jx = st >= 4 ? 170 : st >= 3 ? 220 : 270; g.fill('#e8e8f0'); g.rect(jx, GROUND - 16, 70, 10); g.triangle(jx + 70, GROUND - 16, jx + 70, GROUND - 6, jx + 84, GROUND - 10); g.rect(jx + 6, GROUND - 28, 6, 12); g.fill('#2b3450'); g.rect(jx + 20, GROUND - 14, 36, 3); g.fill('#555'); g.rect(jx + 30, GROUND - 10, 14, 6); g.fill('#111'); g.rect(jx + 12, GROUND - 4, 4, 4); g.rect(jx + 52, GROUND - 4, 4, 4); if (st >= 3) { g.fill('#c8c84a'); g.rect(jx - 20, GROUND - 8, 14, 8); } }
      people(g, s, [['pilot', 120, '#2b3450', '#1b2a45']]);
    },
  };
  const PLAYER_X = { residence: 96, road: 112, colonia: 70, salta: 100, border: 118, airfield: 90 };
  function people(g, s, list) {
    for (const [id, x, coat, hat, skin] of list) {
      const pr = s.people[id]; person(g, x, GROUND, pr && pr.turned ? '#555' : coat, hat, skin);
      hotspots.push({ id, x: (x - 4) * SCALE, y: (GROUND - 13) * SCALE, w: 9 * SCALE, h: 14 * SCALE, label: `${Sim.personName(s, id)}, ${Data.PEOPLE[id].role}${pr && pr.turned ? ' (talked to the inquiry)' : pr && pr.trust >= 2 ? ' (trusts you)' : ''}` });
    }
  }
  function player(g, s, t) {
    const x = PLAYER_X[Data.LEVELS[s.pos].scene] || 100;
    person(g, x, GROUND, s.who === 'woman' ? '#8a2f3a' : '#2b3450', s.who === 'woman' ? '#3a2418' : '#111');
    g.fill('#ffd24a'); g.rect(x - 1, GROUND - 16 + Math.round(Math.sin(t / 300)), 3, 2);
    hotspots.push({ id: 'self', x: (x - 4) * SCALE, y: (GROUND - 13) * SCALE, w: 9 * SCALE, h: 14 * SCALE, label: `${Data.CHARACTERS[s.who].name}, you` });
  }

  // ---- HUD ------------------------------------------------------
  function hud(s, t) {
    // Route and arrangement text lives in HTML so it does not shrink with the scene.
    p.textFont('GCNorthSans-Regular'); p.noStroke();
    // phone
    if (s.inbox.length) { const k = 0.5 + 0.5 * Math.sin(t / 200); p.fill(`rgba(255,210,74,${0.6 + 0.4 * k})`); p.rect(p.width - 44, p.height - 24, 20, 14, 3); p.fill('#111'); p.textAlign(p.CENTER, p.CENTER); p.textSize(14); p.text(s.inbox.length, p.width - 34, p.height - 17); }
    if (hover && !busy()) { p.textSize(16); const w = Math.min(p.width - 24, p.textWidth(hover.label) + 20); const tx = Math.min(p.width - w - 12, Math.max(12, hover.x + hover.w / 2 - w / 2)); p.fill('rgba(12,12,20,0.96)'); p.rect(tx, hover.y - 40, w, 30, 3); p.fill('#fff'); p.textAlign(p.LEFT, p.CENTER); p.text(hover.label, tx + 10, hover.y - 25); }

    p.textSize(16); p.textAlign(p.CENTER, p.BOTTOM);
    for (const f of view.floats) { const k = f.t / f.life; p.fill(f.color); p.text(f.text, f.x, f.y - k * 30); }
    if (view.die) { const d = view.die, cx = p.width / 2, cy = p.height / 2 - 20, k = Math.min(1, d.t * 3); const face = k < 1 ? 1 + Math.floor(Math.random() * 6) : d.die; p.fill(k < 1 ? '#eee' : d.won ? '#5cd65c' : '#ff6a6a'); p.rect(cx - 22, cy - 22, 44, 44, 6); p.fill('#111'); p.textSize(26); p.textAlign(p.CENTER, p.CENTER); p.text(face, cx, cy); p.textSize(16); p.fill('#eee'); p.text(`needs ${d.need}`, cx, cy + 36); }
    if (view.enemyPulse > 0) { p.fill(`rgba(220,40,40,${0.18 * view.enemyPulse})`); p.rect(0, 0, p.width, p.height); }
    if (view.fade > 0) { p.fill(`rgba(8,8,14,${0.9 * view.fade})`); p.rect(0, 0, p.width, p.height); }
    if (view.over) { p.fill('rgba(8,8,14,0.72)'); p.rect(0, 0, p.width, p.height); p.textAlign(p.CENTER, p.CENTER); p.textSize(26); p.fill(view.over.win ? '#ffd24a' : '#ff6a6a'); p.text(view.over.win ? 'Out of Esmeraldan airspace' : 'The inquiry wins', p.width / 2, p.height / 2 - 14); p.textSize(12); p.fill('#eee'); p.text('', p.width / 2, p.height / 2 + 14); }
  }
  function hitTest(mx, my) { let best = null; for (const h of hotspots) if (mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) best = h; return best; }
  let last = 0;
  const sketch = (pp) => {
    p = pp;
    pp.setup = () => { if (document.fonts && document.fonts.load) document.fonts.load("16px 'GCNorthSans-Regular'"); const c = pp.createCanvas(W * SCALE, H * SCALE); c.parent('scene'); pp.pixelDensity(1); pp.noSmooth(); pp.frameRate(60); pg = pp.createGraphics(W, H); pg.pixelDensity(1); pg.noSmooth(); pg.noStroke(); last = pp.millis(); };
    pp.draw = () => {
      const now = pp.millis(), dt = Math.min(50, now - last); last = now; const s = view.s; if (!s) return;
      stepQueue(dt); for (const f of view.floats) f.t += dt; view.floats = view.floats.filter(f => f.t < f.life);
      hotspots = []; const g = pg; g.noStroke(); g.push(); g.translate(Math.round((Math.random() - 0.5) * view.shake), 0);
      SCENES[Data.LEVELS[s.pos].scene](g, s, now, Sim.isNight(s)); player(g, s, now); g.pop();
      pp.background('#0a0a12'); pp.image(pg, 0, 0, pp.width, pp.height);
      hover = hitTest(pp.mouseX, pp.mouseY); hud(s, now);
    };
    pp.mousePressed = () => { const h = hitTest(pp.mouseX, pp.mouseY); if (h && hooks.onPick) hooks.onPick(h.id); };
  };
  // A still of one level with no HUD, as a data URL, for the title screen. Null until p5 has set up.
  function still(s) { if (!pg) return null; const g = pg; g.noStroke(); SCENES[Data.LEVELS[s.pos].scene](g, s, 4000, Sim.isNight(s)); player(g, s, 4000); return g.canvas.toDataURL('image/png'); }
  function start(hk) { Object.assign(hooks, hk); new p5(sketch); }
  return { start, still, setState, enqueue, busy, float, dice, travel, enemy, ring, pause, gameOver, view, SCALE, W, H };
})();
