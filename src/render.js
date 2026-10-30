/* ============================================================
   COALITION renderer (PixiJS 8). Reads Sim state and a decorative View.

   Each level is pixel art drawn on a 320x150 buffer by the scene
   functions below, then shown through PixiJS at 3x:
   - the static scene (sky, buildings, ground) is painted once per state
     change into a canvas texture;
   - people are sprites, so they breathe, walk in and can be pointed at;
   - lights glow and flicker, stars twinkle, clouds drift, and each place
     has its own weather (snow at the line, steam at Salta, fireflies at
     the colônia, glints on water);
   - the hour grades the scene: warm at dusk, blue at night;
   - the dice, floating numbers, tooltips and the end card draw on top.

   If WebGL is unavailable the same scene draws on a plain 2D canvas.
   The public interface is unchanged: ui.js calls start, still,
   runwayStill, setState, enqueue, busy, float, dice, travel, enemy, ring,
   pause and gameOver, and reads view, SCALE, W and H.
   ============================================================ */
'use strict';
const Render = (() => {
  // Every scene draws relative to GROUND, so a taller buffer is more sky. The deep foreground (56 px)
  // keeps people above the level heading that sits on the bottom of the scene.
  const W = 320, H = 150, SCALE = 3, GROUND = H - 56, CW = W * SCALE, CH = H * SCALE;
  const FONT = "'GCNorthSans-Regular', Arial, sans-serif";
  const view = { s: null, gov: null, queue: [], current: null, t: 0, floats: [], shake: 0, ring: 0, die: null, fade: 0, enemyPulse: 0, over: null, walk: null };
  let hooks = {}, hotspots = [], hover = null, el = null, mode = 'none', last = 0;

  // ---- the animation queue (ui.js waits on busy()) ----------------
  function setState(s, gov) { view.s = s; view.gov = gov || null; }
  function enqueue(item) { view.queue.push(item); }
  function busy() { return view.queue.length > 0 || view.current !== null; }
  function stepQueue(dt) {
    if (!view.current && view.queue.length) { view.current = view.queue.shift(); view.t = 0; if (view.current.start) view.current.start(view); }
    if (view.current) { view.t += dt; const k = Math.min(1, view.t / view.current.dur); if (view.current.update) view.current.update(view, k); if (k >= 1) { if (view.current.end) view.current.end(view); view.current = null; } }
  }
  function float(x, y, text, color) { enqueue({ dur: 100, start(v) { v.floats.push({ x, y, text, color, t: 0, life: 1500, obj: null }); } }); }
  function dice(die, need, won) { enqueue({ dur: 900, start(v) { v.die = { die, need, won, t: 0 }; }, update(v, k) { v.die.t = k; }, end(v) { v.die = null; } }); }
  function travel() { enqueue({ dur: 700, update(v, k) { v.fade = Math.sin(k * Math.PI); }, end(v) { v.fade = 0; v.walk = { t: 0, dur: 1100 }; } }); }
  function enemy() { enqueue({ dur: 600, update(v, k) { v.enemyPulse = Math.sin(k * Math.PI); v.shake = (1 - k) * 2; }, end(v) { v.enemyPulse = 0; v.shake = 0; } }); }
  function ring() { enqueue({ dur: 500, update(v, k) { v.ring = 1 - k; }, end(v) { v.ring = 0; } }); }
  function pause(ms) { enqueue({ dur: ms }); }
  function gameOver(over) { enqueue({ dur: 300, start(v) { v.over = over; } }); }

  // ---- a small painter with the drawing calls the scenes use ------
  // collect = true: people, lights, stars and weather are recorded for PixiJS
  // instead of painted, so they can move. collect = false paints everything flat.
  function painter(canvas, collect) {
    const c = canvas.getContext('2d');
    return {
      canvas, collect, actors: [], glows: [], stars: [], fx: [], spots: [],
      noStroke() {}, fill(col) { c.fillStyle = col; },
      rect(x, y, w, h) { c.fillRect(x, y, w, h); },
      triangle(a, b, d, e, f, h) { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.lineTo(f, h); c.closePath(); c.fill(); },
      ellipse(x, y, w, h) { c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2); c.fill(); },
      push() { c.save(); }, pop() { c.restore(); }, translate(x, y) { c.translate(x, y); },
      clear() { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, canvas.width, canvas.height); },
    };
  }
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  // ---- pixel helpers ----------------------------------------------
  function px(g, x, y, rows, pal) { for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) { const c = rows[j][i]; if (c === '.' || !pal[c]) continue; g.fill(pal[c]); g.rect(x + i, y + j, 1, 1); } }
  const PERSON = ['..HHH..', '.HHHHH.', '.SSSSS.', '..SSS..', '.CCCCC.', 'CCCCCCC', 'C.CCC.C', '.CCCCC.', '..L.L..', '..L.L..', '..B.B..'];
  const STRIDE = ['..HHH..', '.HHHHH.', '.SSSSS.', '..SSS..', '.CCCCC.', 'CCCCCCC', 'C.CCC.C', '.CCCCC.', '.L...L.', '.L...L.', 'B.....B'];
  const KID = ['.HHH.', '.SSS.', '.SSS.', 'CCCCC', 'C.C.C', '.CCC.', '.L.L.', '.B.B.'];
  const pal = (coat, hat, skin) => ({ H: hat, S: skin || '#e0b48c', C: coat, L: '#2a2430', B: '#111' });
  function person(g, x, y, coat, hat, skin, extra) {
    if (g.collect) { g.actors.push(Object.assign({ x, y, coat, hat, skin: skin || '#e0b48c' }, extra || {})); return; }
    px(g, x - 3, y - 11, PERSON, pal(coat, hat, skin));
  }
  function car(g, x, y, col) { g.fill(col); g.rect(x, y - 6, 22, 5); g.rect(x + 5, y - 10, 11, 4); g.fill('#9ad'); g.rect(x + 6, y - 9, 4, 3); g.rect(x + 11, y - 9, 4, 3); g.fill('#111'); g.rect(x + 3, y - 2, 4, 3); g.rect(x + 15, y - 2, 4, 3); }
  const lerpC = (a, b, k) => `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`;
  // A light source. Painted flat as nothing (the art already has the lit pixel); collected as a glow.
  function glow(g, x, y, r, col, a, flicker) { if (g.collect) g.glows.push({ x, y, r, col, a: a == null ? 1 : a, flicker: flicker || 0 }); }
  function fx(g, type, opts) { if (g.collect) g.fx.push(Object.assign({ type }, opts || {})); }
  function sky(g, t, night, top, bottom) {
    for (let y = 0; y < GROUND; y++) { g.fill(lerpC(top, bottom, y / GROUND)); g.rect(0, y, W, 1); }
    if (night) {
      for (let i = 0; i < 40; i++) { const x = (i * 97 + 13) % W, y = (i * 53 + 7) % 60; if (g.collect) g.stars.push({ x, y, ph: i * 1.7 }); else if (((i + Math.floor(t / 500)) % 7) !== 0) { g.fill('#cfd6ff'); g.rect(x, y, 1, 1); } }
    } else fx(g, 'clouds');
  }
  function ground(g, col, col2) { g.fill(col); g.rect(0, GROUND, W, H - GROUND); g.fill(col2); for (let x = 0; x < W; x += 6) g.rect(x + (Math.floor(x / 6) % 2) * 3, GROUND + 2 + (Math.floor(x / 6) % 3) * 5, 4, 2); }
  function lamp(g, x) {
    g.fill('#555'); g.rect(x, GROUND - 26, 1, 26); g.rect(x - 2, GROUND - 27, 5, 2); g.fill('#ffd27a'); g.rect(x - 1, GROUND - 30, 3, 3);
    if (g.collect) glow(g, x + 0.5, GROUND - 28.5, 26, '#ffd27a', 1, 0.08); else { g.fill('rgba(255,210,120,0.08)'); g.ellipse(x + 1, GROUND - 14, 36, 36); }
  }

  // ---- scenes: one per level. People positions double as hotspots. ----
  const SCENES = {
    residence(g, s, t, night) {
      sky(g, t, night, night ? [10, 12, 34] : [120, 160, 210], night ? [38, 26, 60] : [230, 200, 160]);
      g.fill('#3b2f3f'); g.rect(40, GROUND - 60, 110, 60); g.fill('#2a2130'); g.triangle(36, GROUND - 60, 154, GROUND - 60, 95, GROUND - 76);
      for (let i = 0; i < 4; i++) { g.fill(night ? '#ffd27a' : '#cde'); g.rect(52 + i * 24, GROUND - 48, 10, 10); g.rect(52 + i * 24, GROUND - 28, 10, 12); if (night) { glow(g, 57 + i * 24, GROUND - 43, 11, '#ffd27a', 0.55, 0.04); glow(g, 57 + i * 24, GROUND - 22, 11, '#ffd27a', 0.55, 0.04); } }
      g.fill('#55434f'); g.rect(88, GROUND - 16, 14, 16); g.fill('#2a2130'); g.rect(89, GROUND - 15, 12, 15);
      g.fill('#6a6a72'); g.rect(160, GROUND - 14, 1, 14); g.rect(160, GROUND - 14, 60, 1); // service lane fence
      g.fill('#8a6a3a'); g.rect(200, GROUND - 22, 40, 22); g.fill('#2a2130'); g.rect(210, GROUND - 12, 8, 12); // kitchen wing
      ground(g, '#2c2a33', '#3a3742'); lamp(g, 30); lamp(g, 290);
      car(g, 236, GROUND, '#2b3450'); car(g, 268, GROUND, '#2b3450'); // the watch
      person(g, 300, GROUND, '#3b3f55', '#1b2a45', '#d8a070'); person(g, 262, GROUND - 1, '#3b3f55', '#1b2a45');
      if (night) { glow(g, 244, GROUND - 4, 5, '#ff9a6a', 0.5, 0.3); } // a cigarette in the watch car
      people(g, s, [['nando', 24, '#8a6a3a', '#4a3a1a'], ['aide', 120, '#5a2d5a', '#2b1d3a']]);
      car(g, 8, GROUND, '#6a2d2d');
      if (night) fx(g, 'moths', { lamps: [30, 290] });
    },
    road(g, s, t, night) {
      sky(g, t, night, night ? [10, 12, 34] : [150, 180, 220], night ? [38, 26, 60] : [240, 220, 180]);
      g.fill('#1f2d44'); g.rect(0, GROUND - 20, W, 20); g.fill('#2b3f5c'); for (let x = 0; x < W; x += 9) g.rect(x, GROUND - 14 + (x % 3), 5, 1); // the river
      fx(g, 'glints', { x0: 0, x1: W, y0: GROUND - 19, y1: GROUND - 2, col: night ? '#8fa8d8' : '#e8f2ff', rate: 7 });
      g.fill('#6a6a72'); g.rect(100, GROUND - 24, 120, 6); for (let x = 104; x < 220; x += 12) g.rect(x, GROUND - 18, 2, 18); // bridge
      g.fill('#4a4a52'); g.rect(228, GROUND - 30, 30, 30); g.fill('#ffd27a'); g.rect(236, GROUND - 24, 8, 6); glow(g, 240, GROUND - 21, 12, '#ffd27a', 0.7, 0.03); // post
      for (let i = 0; i < 20; i += 4) { g.fill(i % 8 ? '#d9d9d9' : '#c83a3a'); g.rect(258 + i, GROUND - 15, 4, 2); } g.fill('#555'); g.rect(256, GROUND - 16, 2, 16);
      g.fill('#2c2a33'); g.rect(0, GROUND, W, H - GROUND); g.fill('#e8d8a0'); for (let x = 0; x < W; x += 14) g.rect(x, GROUND + 8, 7, 1);
      g.fill('#3b2f3f'); g.rect(10, GROUND - 40, 60, 40); g.fill('#ffd27a'); g.rect(20, GROUND - 30, 8, 8); glow(g, 24, GROUND - 26, 12, '#ffd27a', 0.7, 0.03); g.fill('#cfd0dd'); g.rect(30, GROUND - 38, 28, 4); // the town hall on the square
      car(g, 150, GROUND, '#c8c84a'); car(g, 60, GROUND, '#6a2d2d');
      if (night) { glow(g, 172, GROUND - 5, 9, '#fff2c0', 0.6, 0); glow(g, 82, GROUND - 5, 9, '#fff2c0', 0.6, 0); } // headlights
      people(g, s, [['nando', 84, '#8a6a3a', '#4a3a1a']]);
      person(g, 40, GROUND, '#5f8a4a', '#2f4a22'); // a clerk on the steps
      person(g, 270, GROUND, '#3b5d8f', '#1b2a45', '#d8a070');
    },
    colonia(g, s, t, night) {
      sky(g, t, night, night ? [10, 12, 34] : [140, 170, 215], night ? [38, 26, 60] : [235, 210, 170]);
      g.fill('#2f4a22'); for (let r = 0; r < 4; r++) for (let x = 0; x < W; x += 10) g.rect(x + r * 3, GROUND - 40 + r * 6, 6, 4); // vines
      g.fill('#e8e0d0'); g.rect(220, GROUND - 50, 40, 50); g.fill('#b05030'); g.triangle(216, GROUND - 50, 264, GROUND - 50, 240, GROUND - 66); g.fill('#e8e0d0'); g.rect(236, GROUND - 78, 8, 14); g.fill('#b05030'); g.triangle(234, GROUND - 78, 246, GROUND - 78, 240, GROUND - 86); // church
      g.fill('#c8a070'); g.rect(60, GROUND - 36, 70, 36); g.fill('#8a4a30'); g.rect(56, GROUND - 40, 78, 5); g.fill('#ffd27a'); g.rect(70, GROUND - 28, 10, 10); g.rect(108, GROUND - 28, 10, 10); g.fill('#5a3a2a'); g.rect(88, GROUND - 16, 12, 16); // the house, veranda
      glow(g, 75, GROUND - 23, 13, '#ffcf70', 0.65, 0.06); glow(g, 113, GROUND - 23, 13, '#ffcf70', 0.65, 0.06);
      g.fill('#5a3a2a'); g.rect(40, GROUND - 8, 100, 2); for (let x = 40; x < 140; x += 20) g.rect(x, GROUND - 8, 2, 8);
      ground(g, '#4a3a2a', '#5a4a3a');
      g.fill('#6a6a4a'); g.rect(150, GROUND - 14, 36, 10); g.fill('#3a3a2a'); g.rect(152, GROUND - 12, 32, 6); g.fill('#111'); g.rect(154, GROUND - 3, 5, 3); g.rect(176, GROUND - 3, 5, 3); // the grape truck
      people(g, s, [['host', 100, '#7a4ea8', '#eee', '#c89060']]);
      g.fill('#8a6a3a'); g.rect(20, GROUND - 6, 6, 6); // mate on the step
      fx(g, night ? 'fireflies' : 'pollen', { y0: GROUND - 46, y1: GROUND - 4 });
    },
    salta(g, s, t, night) {
      sky(g, t, true, [10, 12, 34], [38, 26, 60]);
      g.fill('#141126'); for (let x = 0; x < W; x += 13) { const h = 12 + ((x * 7) % 11); g.rect(x, GROUND - 28 - h, 13, h + 30); }
      g.fill('#3a3a44'); g.rect(40, GROUND - 34, 36, 34); g.fill('#ffe28a'); g.rect(44, GROUND - 26, 12, 12); glow(g, 50, GROUND - 20, 16, '#ffe28a', 0.8, 0.05);
      g.fill('#6a6a6a'); g.rect(80, GROUND - 3, 240, 1); g.rect(80, GROUND - 1, 240, 1); g.fill('#4a3a2a'); for (let x = 80; x < W; x += 5) g.rect(x, GROUND - 4, 2, 4);
      g.fill('#6a2d2d'); g.rect(160, GROUND - 30, 70, 24); g.rect(240, GROUND - 30, 70, 24); g.fill('#4a1f1f'); g.rect(160, GROUND - 32, 150, 2); g.fill('#e8e8e8'); g.rect(190, GROUND - 24, 3, 3); glow(g, 191.5, GROUND - 22.5, 8, '#fff6d8', 0.6, 0);
      g.fill('#2a2a2a'); g.rect(164, GROUND - 6, 6, 6); g.rect(220, GROUND - 6, 6, 6); g.rect(244, GROUND - 6, 6, 6); g.rect(300, GROUND - 6, 6, 6);
      ground(g, '#2c2a33', '#3a3742'); lamp(g, 100);
      fx(g, 'steam', { x: 236, y: GROUND - 33 });
      people(g, s, [['theo', 120, '#8a6a3a', '#4a3a1a', '#c89060'], ['holt', 150, '#444c5a', '#222630']]);
      glow(g, 153, GROUND - 6, 7, '#ffcf70', 0.7, 0.15); // Holt's lantern
    },
    border(g, s, t, night) {
      sky(g, t, night, night ? [10, 12, 34] : [160, 180, 210], night ? [38, 26, 60] : [220, 220, 230]);
      g.fill('#cfd6e0'); g.triangle(0, GROUND, 90, GROUND - 70, 180, GROUND); g.triangle(140, GROUND, 250, GROUND - 60, 330, GROUND); // peaks
      g.fill('#eef3f8'); g.rect(0, GROUND, W, H - GROUND); g.fill('#dde3ea'); for (let x = 0; x < W; x += 7) g.rect(x, GROUND + 3 + (x % 5), 4, 1);
      g.fill('#4a4a52'); g.rect(60, GROUND - 30, 40, 30); g.fill('#ffd27a'); g.rect(70, GROUND - 24, 8, 6); glow(g, 74, GROUND - 21, 12, '#ffd27a', 0.7, 0.03);
      g.fill('#333'); g.rect(104, GROUND - 6, 6, 6); g.fill('#ff8a2a'); g.rect(105, GROUND - 10, 4, 4); glow(g, 107, GROUND - 8, 11, '#ff8a2a', 0.9, 0.3); // post and stove
      g.fill('#555'); g.rect(156, GROUND - 16, 2, 16); for (let i = 0; i < 24; i += 4) { g.fill(i % 8 ? '#d9d9d9' : '#c83a3a'); g.rect(158 + i, GROUND - 15, 4, 2); } // barrier
      g.fill('#2a3a2a'); g.rect(240, GROUND - 28, 40, 28); g.fill('#ffe28a'); g.rect(250, GROUND - 22, 8, 6); glow(g, 254, GROUND - 19, 12, '#ffe28a', 0.7, 0.03); // the Esmeraldan hut
      g.fill('#c83a3a'); g.rect(170, GROUND - 40, 1, 40); g.fill('#5cd65c'); g.rect(172, GROUND - 40, 1, 40); // the line
      person(g, 120, GROUND, '#3b5d8f', '#1b2a45', '#d8a070'); person(g, 140, GROUND, '#3b5d8f', '#1b2a45');
      people(g, s, s.arr.reception.stage >= 3 ? [['official', 220, '#8a2f3a', '#2b1d3a']] : []);
      fx(g, 'snow');
    },
    airfield(g, s, t, night) {
      sky(g, t, night, night ? [10, 12, 34] : [120, 130, 150], night ? [38, 26, 60] : [170, 175, 185]);
      g.fill('#3a4a5a'); g.rect(0, GROUND - 30, W, 30); g.fill('#4a5a6a'); for (let x = 0; x < W; x += 11) g.rect(x, GROUND - 24 + (x % 4), 6, 1); // the sea
      fx(g, 'glints', { x0: 0, x1: W, y0: GROUND - 29, y1: GROUND - 2, col: night ? '#9fb0d0' : '#f0f6ff', rate: 9 });
      g.fill('#555'); g.rect(10, GROUND - 60, 14, 60); g.fill('#777'); g.rect(4, GROUND - 66, 26, 10); g.fill('#ffd27a'); g.rect(8, GROUND - 64, 18, 6); glow(g, 17, GROUND - 61, 16, '#ffd27a', 0.8, 0.02); // tower
      fx(g, 'beacon', { x: 17, y: GROUND - 68, col: '#ff4d4d', period: 1400 });
      ground(g, '#3a3a40', '#4a4a50'); g.fill('#ffd27a'); for (let x = 0; x < W; x += 20) g.rect(x, GROUND + 9, 10, 1);
      const st = s.arr.aircraft.stage;
      if (st >= 1) {
        const jx = st >= 4 ? 170 : st >= 3 ? 220 : 270; g.fill('#e8e8f0'); g.rect(jx, GROUND - 16, 70, 10); g.triangle(jx + 70, GROUND - 16, jx + 70, GROUND - 6, jx + 84, GROUND - 10); g.rect(jx + 6, GROUND - 28, 6, 12); g.fill('#2b3450'); g.rect(jx + 20, GROUND - 14, 36, 3); g.fill('#555'); g.rect(jx + 30, GROUND - 10, 14, 6); g.fill('#111'); g.rect(jx + 12, GROUND - 4, 4, 4); g.rect(jx + 52, GROUND - 4, 4, 4); if (st >= 3) { g.fill('#c8c84a'); g.rect(jx - 20, GROUND - 8, 14, 8); }
        if (st >= 4) { fx(g, 'beacon', { x: jx + 9, y: GROUND - 29, col: '#ff5a5a', period: 1100 }); fx(g, 'beacon', { x: jx + 83, y: GROUND - 10, col: '#7dffb0', period: 1100, offset: 550 }); }
      }
      people(g, s, [['pilot', 120, '#2b3450', '#1b2a45']]);
    },
  };
  const PLAYER_X = { residence: 96, road: 112, colonia: 70, salta: 100, border: 118, airfield: 90 };
  function people(g, s, list) {
    for (const [id, x, coat, hat, skin] of list) {
      const pr = s.people && s.people[id], label = s.hidden ? null : `${Sim.personName(s, id)}, ${Data.PEOPLE[id].role}${pr && pr.turned ? ' (talked to the inquiry)' : pr && pr.trust >= 2 ? ' (trusts you)' : ''}`;
      person(g, x, GROUND, pr && pr.turned ? '#555' : coat, hat, skin, { id });
      if (label) g.spots.push({ id, x: (x - 4) * SCALE, y: (GROUND - 13) * SCALE, w: 9 * SCALE, h: 14 * SCALE, label });
    }
  }

  // ---- what the scene shows ---------------------------------------
  // The escape side sees where they are. The government side sees the stop it suspects,
  // its own search team and nothing of the candidate's hidden arrangements.
  function frame() {
    const s = view.s; if (!s) return null;
    const g = view.gov;
    if (g) {
      const pos = g.belief >= 0 ? g.belief : 0;
      const shown = { hidden: true, who: s.who, pos, hour: s.hour, people: {}, arr: { aircraft: { stage: 0 }, reception: { stage: 0 } } };
      return { s: shown, real: s, pos, gov: true, night: Sim.isNight(s), hour: s.hour };
    }
    return { s, real: s, pos: s.pos, gov: false, night: Sim.isNight(s), hour: s.hour };
  }
  function sceneKey(f) {
    const s = f.s; const turned = s.people ? Object.keys(s.people).map(k => (s.people[k].turned ? 1 : 0) + (s.people[k].trust >= 2 ? 2 : 0)).join('') : '';
    return [f.pos, f.night ? 1 : 0, f.gov ? 1 : 0, s.arr.aircraft.stage, s.arr.reception.stage, turned, s.who].join('|');
  }
  function paintScene(g, f, t) {
    g.clear(); g.noStroke();
    SCENES[Data.LEVELS[f.pos].scene](g, f.s, t, f.night);
  }
  // The player: the candidate with a gold marker, or the government's search team with a coral one.
  function playerSpec(f) {
    const x = PLAYER_X[Data.LEVELS[f.pos].scene] || 100;
    if (f.gov) return { x, list: [{ dx: 0, coat: '#2b3450', hat: '#1b2a45', skin: '#d8a070' }, { dx: 10, coat: '#3b3f55', hat: '#1b2a45', skin: '#c89060' }], marker: '#FF7A90', label: `${Data.GOV ? Data.GOV.name : 'Your search team'}, you` };
    const w = f.s.who === 'woman';
    return { x, list: [{ dx: 0, coat: w ? '#8a2f3a' : '#2b3450', hat: w ? '#3a2418' : '#111', skin: '#e0b48c' }], marker: '#FFD24A', label: `${Data.CHARACTERS[f.s.who].name}, you` };
  }
  // 0 to 1 through the hour for colour grading: night, dusk, dawn, day.
  function grade(f) {
    const h = (Sim.START_HOUR + f.hour) % 24;
    if (f.night) return { col: 0x4a56b8, a: 0.42, light: 1 };
    if (h >= 17 && h < 22) return { col: 0xff9a6a, a: 0.22 + (h - 17) * 0.03, light: 0.55 };
    if (h >= 5 && h < 8) return { col: 0xffb0c0, a: 0.18, light: 0.45 };
    return { col: 0xffffff, a: 0, light: 0.18 };
  }

  // ---- stills for the title, start screen and debrief (2D, synchronous) ----
  function still(s) {
    const c = mkCanvas(W, H), g = painter(c, false), f = { s, pos: s.pos, gov: false, night: Sim.isNight(s), hour: s.hour };
    paintScene(g, f, 4000); const p = playerSpec(f); for (const m of p.list) person(g, p.x + m.dx, GROUND, m.coat, m.hat, m.skin);
    g.fill(p.marker); g.rect(p.x - 1, GROUND - 16, 3, 2);
    return c.toDataURL('image/png');
  }
  // The runway family photo: six people, luggage, the jet, the pilot at the stairs.
  function runwayStill() {
    const c = mkCanvas(W, H), g = painter(c, false), G = GROUND; g.noStroke();
    sky(g, 0, false, [44, 30, 88], [255, 168, 104]);
    g.fill('#ffd27a'); g.ellipse(232, G - 26, 26, 26); g.fill('rgba(255,210,122,0.18)'); g.ellipse(232, G - 26, 60, 60);
    g.fill('#3a2f66'); g.rect(0, G - 20, W, 20); g.fill('#5a4a8a'); for (let x = 0; x < W; x += 11) g.rect(x, G - 14 + (x % 4), 6, 1);
    g.fill('#4a4458'); g.rect(12, G - 62, 14, 62); g.fill('#6a6478'); g.rect(6, G - 68, 26, 10); g.fill('#ffd27a'); g.rect(10, G - 66, 18, 6);
    ground(g, '#34323e', '#403e4a'); g.fill('#ffd27a'); for (let x = 0; x < W; x += 22) g.rect(x, G + 18, 11, 2); g.fill('#ffcf6a'); for (let x = 4; x < W; x += 16) g.rect(x, G + 3, 1, 1);
    const jx = 146;
    g.fill('#ecebf4'); g.rect(jx, G - 18, 82, 12); g.triangle(jx + 82, G - 18, jx + 82, G - 6, jx + 98, G - 12); g.rect(jx + 6, G - 32, 7, 14); g.triangle(jx + 6, G - 32, jx + 13, G - 32, jx + 13, G - 38);
    g.fill('#2b3450'); g.rect(jx + 24, G - 15, 42, 3); g.fill('#9ad'); for (let i = 0; i < 6; i++) g.rect(jx + 26 + i * 7, G - 14, 3, 2);
    g.fill('#555'); g.rect(jx + 34, G - 10, 16, 5); g.fill('#111'); g.rect(jx + 14, G - 5, 4, 5); g.rect(jx + 60, G - 5, 4, 5); g.fill('#2a2833'); g.rect(jx + 70, G - 6, 3, 6);
    g.fill('#b8b8c4'); for (let i = 0; i < 6; i++) g.rect(jx + 64 + i * 2, G - 6 + i, 3, 1);
    const kid = (x, coat, hair, skin) => px(g, x - 2, G - 8, KID, pal(coat, hair, skin));
    g.fill('rgba(0,0,0,0.25)'); g.rect(62, G, 80, 2);
    person(g, 72, G, '#2b3450', '#1b1b22', '#d8a070'); kid(82, '#2ea88a', '#2a1a14', '#c89060'); person(g, 92, G, '#8a2d3d', '#2a1a14', '#e0b48c');
    person(g, 102, G, '#4a5a3a', '#3a2a1a', '#c89060'); kid(111, '#e0a030', '#2a1a14', '#e0b48c'); person(g, 121, G, '#7a4ea8', '#dddde4', '#d8a070');
    g.fill('#8a6a3a'); g.rect(129, G - 5, 6, 5); g.fill('#6a4a2a'); g.rect(131, G - 6, 2, 1); g.fill('#3a5a8a'); g.rect(60, G - 4, 5, 4);
    person(g, 220, G, '#2b3450', '#1b2a45', '#d8a070');
    return c.toDataURL('image/png');
  }

  // ---- pointer: map the cropped, scaled canvas back to scene pixels ----
  // The canvas is shown with object-fit: cover, anchored at the bottom centre (style.css).
  function fit(canvas) {
    const r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return null;
    const k = Math.max(r.width / CW, r.height / CH), dw = CW * k, dh = CH * k;
    return { r, k, ox: (r.width - dw) / 2, oy: r.height - dh };
  }
  function toCanvas(canvas, e) { const m = fit(canvas); if (!m) return null; return { x: (e.clientX - m.r.left - m.ox) / m.k, y: (e.clientY - m.r.top - m.oy) / m.k }; }
  // The part of the canvas the player can actually see, for keeping labels on screen.
  function visibleBox(canvas) { const m = fit(canvas); if (!m) return { x0: 0, x1: CW, y0: 0, y1: CH }; return { x0: Math.max(0, -m.ox / m.k), x1: Math.min(CW, (m.r.width - m.ox) / m.k), y0: Math.max(0, -m.oy / m.k), y1: CH }; }
  function hitTest(p) { if (!p) return null; let best = null; for (const h of hotspots) if (p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h) best = h; return best; }
  function wirePointer(canvas) {
    let tapTimer = 0;
    canvas.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') hover = hitTest(toCanvas(canvas, e)); });
    canvas.addEventListener('pointerleave', () => { hover = null; });
    canvas.addEventListener('pointerdown', (e) => {
      const h = hitTest(toCanvas(canvas, e)); if (!h) return;
      if (e.pointerType !== 'mouse') { hover = h; clearTimeout(tapTimer); tapTimer = setTimeout(() => { hover = null; }, 2200); }
      if (hooks.onPick) hooks.onPick(h.id);
    });
  }

  // ---- the PixiJS renderer -----------------------------------------
  const X = {}; // PixiJS objects
  const texCache = new Map();
  function canvasTexture(canvas, linear) { return new PIXI.Texture({ source: new PIXI.CanvasSource({ resource: canvas, scaleMode: linear ? 'linear' : 'nearest' }) }); }
  function spriteTex(rows, palette) {
    const key = rows.join('') + JSON.stringify(palette); if (texCache.has(key)) return texCache.get(key);
    const c = mkCanvas(rows[0].length, rows.length), g = painter(c, false); px(g, 0, 0, rows, palette);
    const t = canvasTexture(c); texCache.set(key, t); return t;
  }
  function radialTex(size, stops) {
    const c = mkCanvas(size, size), x = c.getContext('2d'), gr = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (const [o, col] of stops) gr.addColorStop(o, col); x.fillStyle = gr; x.fillRect(0, 0, size, size); return canvasTexture(c, true);
  }
  function cloudTex(seed) {
    const c = mkCanvas(40, 12), g = painter(c, false); g.fill('rgba(255,255,255,0.85)');
    for (let i = 0; i < 6; i++) { const cx = 6 + ((seed * 7 + i * 11) % 28), cy = 6 + ((seed + i * 3) % 3) - 1, r = 3 + ((seed + i) % 3); g.ellipse(cx, cy, r * 2.4, r * 1.6); }
    g.fill('rgba(255,255,255,0.95)'); g.rect(4, 8, 32, 3); return canvasTexture(c);
  }
  const hexNum = (h) => parseInt(h.replace('#', '').replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3'), 16);
  const dot = (layer, col, w, h) => { const sp = new PIXI.Sprite(PIXI.Texture.WHITE); sp.tint = col; sp.width = w || 1; sp.height = h || 1; layer.addChild(sp); return sp; };

  async function startPixi() {
    if (typeof PIXI === 'undefined') throw new Error('PixiJS missing');
    PIXI.TextureSource.defaultOptions.scaleMode = 'nearest';
    const app = new PIXI.Application();
    await app.init({ width: CW, height: CH, background: '#0a0a12', antialias: false, resolution: 1, autoStart: false, preference: 'webgl', powerPreference: 'low-power' });
    app.ticker.stop();
    X.app = app; el.appendChild(app.canvas); app.canvas.setAttribute('aria-hidden', 'true'); wirePointer(app.canvas);
    // Scene pixels are drawn at 1 unit = 1 pixel inside `world`, scaled 3x.
    X.world = new PIXI.Container(); X.world.scale.set(SCALE); app.stage.addChild(X.world);
    X.bgCanvas = mkCanvas(W, H); X.bgPaint = painter(X.bgCanvas, true); X.bgTex = canvasTexture(X.bgCanvas);
    X.bg = new PIXI.Sprite(X.bgTex); X.world.addChild(X.bg);
    X.sky = new PIXI.Container(); X.world.addChild(X.sky);       // stars, clouds
    X.actors = new PIXI.Container(); X.world.addChild(X.actors); // people
    X.weather = new PIXI.Container(); X.world.addChild(X.weather);
    X.grade = new PIXI.Graphics().rect(0, 0, W, H).fill(0xffffff); X.grade.blendMode = 'multiply'; X.world.addChild(X.grade);
    X.lights = new PIXI.Container(); X.world.addChild(X.lights);
    X.glowTex = radialTex(64, [[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.45)'], [1, 'rgba(255,255,255,0)']]);
    X.clouds = [cloudTex(1), cloudTex(4), cloudTex(9)];
    // Screen-space layers at canvas resolution: vignette, pulses, dice, labels.
    X.vignette = new PIXI.Sprite(radialTex(256, [[0, 'rgba(10,6,24,0)'], [0.62, 'rgba(10,6,24,0)'], [1, 'rgba(10,6,24,0.75)']]));
    X.vignette.width = CW * 1.25; X.vignette.height = CH * 1.6; X.vignette.anchor.set(0.5); X.vignette.position.set(CW / 2, CH / 2); app.stage.addChild(X.vignette);
    X.fxScreen = new PIXI.Graphics(); app.stage.addChild(X.fxScreen);
    X.ui = new PIXI.Container(); app.stage.addChild(X.ui);
    X.die = new PIXI.Container(); X.dieBox = new PIXI.Graphics(); X.dieNeed = new PIXI.Text({ text: '', style: { fontFamily: FONT, fontSize: 18, fill: 0xf6f1ff, dropShadow: { color: 0x150f2e, distance: 2, blur: 0, alpha: 1, angle: Math.PI / 2 } } });
    X.dieNeed.anchor.set(0.5, 0); X.die.addChild(X.dieBox, X.dieNeed); X.die.visible = false; X.ui.addChild(X.die);
    X.tip = new PIXI.Container(); X.tipBox = new PIXI.Graphics(); X.tipText = new PIXI.Text({ text: '', style: { fontFamily: FONT, fontSize: 18, fill: 0xffffff } });
    X.tip.addChild(X.tipBox, X.tipText); X.tip.visible = false; X.ui.addChild(X.tip); X.tipFor = null;
    X.over = new PIXI.Container(); X.overDim = new PIXI.Graphics().rect(0, 0, CW, CH).fill({ color: 0x150f2e, alpha: 0.72 });
    X.overText = new PIXI.Text({ text: '', style: { fontFamily: FONT, fontSize: 34, fill: 0xffc93c, align: 'center', dropShadow: { color: 0x000000, distance: 3, blur: 0, alpha: 0.8, angle: Math.PI / 2 } } });
    X.overText.anchor.set(0.5); X.overText.position.set(CW / 2, CH / 2); X.over.addChild(X.overDim, X.overText); X.over.visible = false; X.ui.addChild(X.over);
    X.key = null; X.part = []; mode = 'pixi';
  }

  // Rebuild the static scene, the people and the weather when the state changes.
  function rebuild(f) {
    const g = X.bgPaint; g.actors = []; g.glows = []; g.stars = []; g.fx = []; g.spots = [];
    paintScene(g, f, 0); X.bgTex.source.update();
    for (const layer of [X.sky, X.actors, X.weather, X.lights]) layer.removeChildren().forEach(c => c.destroy());
    X.part = []; X.people = []; X.lightList = []; X.starList = []; X.fxList = g.fx;
    for (const st of g.stars) { const sp = dot(X.sky, 0xcfd6ff); sp.position.set(st.x, st.y); X.starList.push({ sp, ph: st.ph }); }
    if (g.fx.some(e => e.type === 'clouds')) for (let i = 0; i < 4; i++) { const sp = new PIXI.Sprite(X.clouds[i % 3]); sp.alpha = 0.55 + (i % 2) * 0.2; sp.position.set((i * 97) % W, 6 + i * 9); X.sky.addChild(sp); X.part.push({ kind: 'cloud', sp, v: 1.2 + i * 0.5 }); }
    for (const a of g.actors) {
      const sp = new PIXI.Sprite(spriteTex(PERSON, pal(a.coat, a.hat, a.skin))); sp.position.set(a.x - 3, a.y - 11); X.actors.addChild(sp);
      X.people.push({ sp, y: a.y - 11, ph: (a.x * 37) % 4000 });
    }
    // The player or the search team.
    const p = playerSpec(f); X.player = { x: p.x, sprites: [], marker: null };
    for (const m of p.list) { const a = new PIXI.Sprite(spriteTex(PERSON, pal(m.coat, m.hat, m.skin))), b = spriteTex(STRIDE, pal(m.coat, m.hat, m.skin)); a.position.set(p.x + m.dx - 3, GROUND - 11); X.actors.addChild(a); X.player.sprites.push({ sp: a, still: a.texture, stride: b, dx: m.dx }); }
    X.player.marker = dot(X.actors, hexNum(p.marker), 3, 2);
    hotspots = g.spots.concat([{ id: 'self', x: (p.x - 4) * SCALE, y: (GROUND - 13) * SCALE, w: (9 + (p.list.length - 1) * 10) * SCALE, h: 14 * SCALE, label: p.label }]);
    for (const L of g.glows) { const sp = new PIXI.Sprite(X.glowTex); sp.anchor.set(0.5); sp.position.set(L.x, L.y); sp.width = sp.height = L.r * 2; sp.tint = hexNum(L.col); sp.blendMode = 'add'; X.lights.addChild(sp); X.lightList.push({ sp, a: L.a, flicker: L.flicker, ph: L.x * 13 }); }
    for (const e of g.fx) {
      if (e.type === 'snow') for (let i = 0; i < 70; i++) { const sp = dot(X.weather, 0xffffff); sp.alpha = 0.7 + Math.random() * 0.3; sp.position.set(Math.random() * W, Math.random() * H); X.part.push({ kind: 'snow', sp, v: 7 + Math.random() * 9, ph: Math.random() * 6 }); }
      if (e.type === 'fireflies') for (let i = 0; i < 14; i++) { const sp = dot(X.weather, 0xe8ff8a); sp.blendMode = 'add'; const hx = Math.random() * W, hy = e.y0 + Math.random() * (e.y1 - e.y0); sp.position.set(hx, hy); X.part.push({ kind: 'fly', sp, hx, hy, ph: Math.random() * 10 }); }
      if (e.type === 'pollen') for (let i = 0; i < 10; i++) { const sp = dot(X.weather, 0xfff3c4); sp.alpha = 0.6; sp.position.set(Math.random() * W, e.y0 + Math.random() * (e.y1 - e.y0)); X.part.push({ kind: 'pollen', sp, ph: Math.random() * 10, y0: e.y0, y1: e.y1 }); }
      if (e.type === 'moths') for (const lx of e.lamps) for (let i = 0; i < 3; i++) { const sp = dot(X.weather, 0xf3e6c0); X.part.push({ kind: 'moth', sp, cx: lx + 0.5, cy: GROUND - 29, ph: Math.random() * 10, r: 3 + Math.random() * 4 }); }
      if (e.type === 'glints') X.part.push({ kind: 'glintSpawner', e, acc: 0 });
      if (e.type === 'steam') X.part.push({ kind: 'steamSpawner', e, acc: 0 });
      if (e.type === 'beacon') { const sp = dot(X.lights, hexNum(e.col), 2, 2); sp.position.set(e.x - 1, e.y - 1); const gl = new PIXI.Sprite(X.glowTex); gl.anchor.set(0.5); gl.position.set(e.x, e.y); gl.width = gl.height = 14; gl.tint = hexNum(e.col); gl.blendMode = 'add'; X.lights.addChild(gl); X.part.push({ kind: 'beacon', sp, gl, period: e.period, offset: e.offset || 0 }); }
    }
  }

  function updateParticles(now, dt) {
    const sec = dt / 1000, born = [];
    for (const p of X.part) {
      switch (p.kind) {
        case 'cloud': p.sp.x += p.v * sec; if (p.sp.x > W) p.sp.x = -42; break;
        case 'snow': p.sp.y += p.v * sec; p.sp.x += Math.sin(now / 900 + p.ph) * 4 * sec; if (p.sp.y > H) { p.sp.y = -2; p.sp.x = Math.random() * W; } break;
        case 'fly': { const k = now / 1000 + p.ph; p.sp.x = Math.round(p.hx + Math.sin(k * 0.7) * 8); p.sp.y = Math.round(p.hy + Math.sin(k * 1.1) * 4); p.sp.alpha = Math.max(0, Math.sin(k * 2.3)) ** 2; break; }
        case 'pollen': { const k = now / 1000 + p.ph; p.sp.x = (p.sp.x + 3 * sec + W) % W; p.sp.y = p.y0 + (p.y1 - p.y0) * (0.5 + 0.5 * Math.sin(k * 0.4)); break; }
        case 'moth': { const k = now / 230 + p.ph; p.sp.position.set(Math.round(p.cx + Math.cos(k) * p.r), Math.round(p.cy + Math.sin(k * 1.3) * p.r * 0.6)); break; }
        case 'beacon': { const on = ((now + p.offset) % p.period) < p.period * 0.18; p.sp.alpha = on ? 1 : 0.2; p.gl.alpha = on ? 0.9 : 0; break; }
        case 'glintSpawner': p.acc += sec * p.e.rate; while (p.acc >= 1) { p.acc -= 1; const sp = dot(X.weather, hexNum(p.e.col), 1 + (Math.random() < 0.3 ? 1 : 0), 1); sp.position.set(Math.floor(p.e.x0 + Math.random() * (p.e.x1 - p.e.x0)), Math.floor(p.e.y0 + Math.random() * (p.e.y1 - p.e.y0))); born.push({ kind: 'glint', sp, t: 0, life: 700 }); } break;
        case 'steamSpawner': p.acc += sec * 2.2; while (p.acc >= 1) { p.acc -= 1; const sp = dot(X.weather, 0xb8b8c8, 2, 2); sp.position.set(p.e.x, p.e.y); born.push({ kind: 'puff', sp, t: 0, life: 2600, x: p.e.x + Math.random() * 2, y: p.e.y }); } break;
        case 'glint': p.t += dt; p.sp.alpha = Math.sin(Math.PI * Math.min(1, p.t / p.life)); if (p.t >= p.life) p.dead = true; break;
        case 'puff': { p.t += dt; const k = p.t / p.life, s = 2 + Math.round(k * 4); p.sp.width = p.sp.height = s; p.sp.position.set(Math.round(p.x + k * 10 - s / 2), Math.round(p.y - k * 22 - s / 2)); p.sp.alpha = 0.55 * (1 - k); if (p.t >= p.life) p.dead = true; break; }
      }
    }
    if (born.length) X.part.push(...born);
    if (X.part.some(p => p.dead)) X.part = X.part.filter(p => { if (p.dead) { p.sp.destroy(); return false; } return true; });
  }

  function drawPixi(now, dt) {
    const f = frame(); if (!f) { X.app.render(); return; }
    const key = sceneKey(f); if (key !== X.key) { X.key = key; rebuild(f); }
    // Hour grading and light strength.
    const gr = grade(f); X.grade.tint = gr.a ? gr.col : 0xffffff; X.grade.alpha = gr.a ? 1 : 0;
    if (gr.a) { const k = gr.a; X.grade.tint = ((Math.round(255 - (255 - ((gr.col >> 16) & 255)) * k) << 16) | (Math.round(255 - (255 - ((gr.col >> 8) & 255)) * k) << 8) | Math.round(255 - (255 - (gr.col & 255)) * k)); }
    for (const L of X.lightList) L.sp.alpha = Math.max(0, gr.light * L.a * (1 - L.flicker * (0.5 + 0.5 * Math.sin(now / 90 + L.ph) * Math.sin(now / 230 + L.ph * 0.7))));
    for (const st of X.starList) st.sp.alpha = 0.35 + 0.65 * Math.max(0, Math.sin(now / 700 + st.ph));
    // People breathe: a one-pixel rise every few seconds, out of step with each other.
    for (const p of X.people) p.sp.y = p.y - (((now + p.ph) % 3600) < 260 ? 1 : 0);
    // The player walks in after travel, then idles with a bobbing marker.
    let px0 = X.player.x, striding = false;
    if (view.walk) { view.walk.t += dt; const k = Math.min(1, view.walk.t / view.walk.dur), e = 1 - (1 - k) * (1 - k); px0 = Math.round(X.player.x - 70 * (1 - e)); striding = k < 1 && Math.floor(view.walk.t / 140) % 2 === 0; if (k >= 1) view.walk = null; }
    for (const m of X.player.sprites) { m.sp.texture = striding ? m.stride : m.still; m.sp.x = px0 + m.dx - 3; m.sp.y = GROUND - 11 - (!view.walk && ((now % 3600) > 1800 && (now % 3600) < 2060) ? 1 : 0); }
    X.player.marker.position.set(px0 - 1, GROUND - 16 + Math.round(Math.sin(now / 300)));
    updateParticles(now, dt);
    X.world.x = Math.round((Math.random() - 0.5) * view.shake) * SCALE;
    // Screen effects: the inquiry's red pulse, a lavender edge when the phone rings, the travel fade.
    const fxg = X.fxScreen; fxg.clear();
    if (view.enemyPulse > 0) fxg.rect(0, 0, CW, CH).fill({ color: 0xdc2828, alpha: 0.2 * view.enemyPulse });
    if (view.ring > 0) { const a = 0.5 * view.ring; fxg.rect(0, 0, CW, 6).fill({ color: 0xc9a4f5, alpha: a }).rect(0, CH - 6, CW, 6).fill({ color: 0xc9a4f5, alpha: a }); }
    if (view.fade > 0) fxg.rect(0, 0, CW, CH).fill({ color: 0x08080e, alpha: 0.92 * view.fade });
    drawDie(now); drawFloats(dt); drawTip(); drawOver();
    X.app.render();
  }
  function drawDie(now) {
    const d = view.die; X.die.visible = !!d; if (!d) return;
    const k = Math.min(1, d.t * 3), settled = k >= 1, face = settled ? d.die : 1 + (Math.floor(now / 70) % 6);
    const box = X.dieBox, S = 56, col = settled ? (d.won ? 0x3bd15e : 0xff4d6d) : 0xf6f1ff;
    box.clear().roundRect(-S / 2 + 4, -S / 2 + 6, S, S, 10).fill({ color: 0x000000, alpha: 0.35 }).roundRect(-S / 2, -S / 2, S, S, 10).fill(col);
    const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[face];
    for (const [x, y] of P) box.rect(x * 14 - 4, y * 14 - 4, 8, 8).fill(0x150f2e);
    const pop = settled ? 1 + 0.18 * Math.max(0, 1 - (d.t - 1 / 3) * 6) : 1;
    X.die.position.set(CW / 2, CH / 2 - 24); X.die.rotation = settled ? 0 : Math.sin(now / 45) * 0.35; X.die.scale.set(pop);
    X.dieNeed.text = `needs ${d.need}`; X.dieNeed.position.set(0, S / 2 + 10);
  }
  function drawFloats(dt) {
    for (const f of view.floats) {
      f.t += dt;
      if (!f.obj) { f.obj = new PIXI.Text({ text: f.text, style: { fontFamily: FONT, fontSize: 22, fill: hexNum(f.color), dropShadow: { color: 0x150f2e, distance: 2, blur: 0, alpha: 1, angle: Math.PI / 2 } } }); f.obj.anchor.set(0.5, 1); X.ui.addChild(f.obj); }
      const k = f.t / f.life; f.obj.position.set(f.x, f.y - k * 36); f.obj.alpha = 1 - Math.max(0, (k - 0.6) / 0.4);
    }
    view.floats = view.floats.filter(f => { if (f.t < f.life) return true; if (f.obj) f.obj.destroy(); return false; });
  }
  function drawTip() {
    const h = !busy() ? hover : null; X.tip.visible = !!h; if (!h) { X.tipFor = null; return; }
    if (X.tipFor !== h.label) { X.tipFor = h.label; X.tipText.text = h.label; X.tipBox.clear().roundRect(0, 0, X.tipText.width + 20, 34, 6).fill({ color: 0x0c0c14, alpha: 0.95 }); X.tipText.position.set(10, 6); }
    const vb = visibleBox(X.app.canvas), w = X.tipText.width + 20;
    X.tip.position.set(Math.round(Math.min(vb.x1 - w - 8, Math.max(vb.x0 + 8, h.x + h.w / 2 - w / 2))), Math.round(Math.max(vb.y0 + 6, h.y - 44)));
  }
  function overText(o) { return view.gov ? (o.win ? 'In custody' : 'She got out') : (o.win ? 'Out of Esmeraldan airspace' : 'The inquiry wins'); }
  function drawOver() {
    const o = view.over; X.over.visible = !!o; if (!o) return;
    const t = overText(o); if (X.overText.text !== t) X.overText.text = t;
    X.overText.style.fill = (view.gov ? !o.win : o.win) ? 0xffc93c : 0xff7a90;
  }

  // ---- the 2D fallback: the same scene, flat, with the same overlays ----
  function start2D() {
    const c = mkCanvas(CW, CH); c.setAttribute('aria-hidden', 'true'); el.appendChild(c); wirePointer(c);
    const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
    X.c2 = c; X.ctx = ctx; X.flat = mkCanvas(W, H); X.key = null; mode = '2d';
  }
  function draw2D(now, dt) {
    const f = frame(), ctx = X.ctx; if (!f) return;
    const key = sceneKey(f) + '|' + (view.walk ? 'w' : '');
    if (key !== X.key) {
      X.key = key; const g = painter(X.flat, false); g.spots = []; paintScene(g, f, 4000);
      const p = playerSpec(f); for (const m of p.list) person(g, p.x + m.dx, GROUND, m.coat, m.hat, m.skin); g.fill(p.marker); g.rect(p.x - 1, GROUND - 16, 3, 2);
      const sp = painter(mkCanvas(1, 1), true); sp.spots = []; SCENES[Data.LEVELS[f.pos].scene](sp, f.s, 0, f.night);
      hotspots = sp.spots.concat([{ id: 'self', x: (p.x - 4) * SCALE, y: (GROUND - 13) * SCALE, w: 9 * SCALE, h: 14 * SCALE, label: p.label }]);
    }
    view.walk = null; for (const fl of view.floats) fl.t += dt; view.floats = view.floats.filter(fl => fl.t < fl.life);
    ctx.save(); ctx.translate(Math.round((Math.random() - 0.5) * view.shake) * SCALE, 0); ctx.drawImage(X.flat, 0, 0, CW, CH); ctx.restore();
    const gr = grade(f); if (gr.a) { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = gr.a; ctx.fillStyle = '#' + gr.col.toString(16).padStart(6, '0'); ctx.fillRect(0, 0, CW, CH); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
    if (view.enemyPulse > 0) { ctx.fillStyle = `rgba(220,40,40,${0.2 * view.enemyPulse})`; ctx.fillRect(0, 0, CW, CH); }
    if (view.fade > 0) { ctx.fillStyle = `rgba(8,8,14,${0.92 * view.fade})`; ctx.fillRect(0, 0, CW, CH); }
    ctx.font = `22px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    for (const fl of view.floats) { ctx.fillStyle = fl.color; ctx.fillText(fl.text, fl.x, fl.y - (fl.t / fl.life) * 36); }
    if (view.die) { const d = view.die, k = Math.min(1, d.t * 3), face = k < 1 ? 1 + (Math.floor(now / 70) % 6) : d.die; ctx.fillStyle = k < 1 ? '#f6f1ff' : d.won ? '#3bd15e' : '#ff4d6d'; ctx.fillRect(CW / 2 - 28, CH / 2 - 52, 56, 56); ctx.fillStyle = '#150f2e'; ctx.font = `28px ${FONT}`; ctx.textBaseline = 'middle'; ctx.fillText(String(face), CW / 2, CH / 2 - 24); ctx.font = `18px ${FONT}`; ctx.fillStyle = '#f6f1ff'; ctx.fillText(`needs ${d.need}`, CW / 2, CH / 2 + 22); }
    const h = !busy() ? hover : null;
    if (h) { ctx.font = `18px ${FONT}`; const w = ctx.measureText(h.label).width + 20, vb = visibleBox(X.c2), tx = Math.min(vb.x1 - w - 8, Math.max(vb.x0 + 8, h.x + h.w / 2 - w / 2)), ty = Math.max(vb.y0 + 6, h.y - 44); ctx.fillStyle = 'rgba(12,12,20,0.95)'; ctx.fillRect(tx, ty, w, 34); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(h.label, tx + 10, ty + 17); }
    if (view.over) { ctx.fillStyle = 'rgba(21,15,46,0.72)'; ctx.fillRect(0, 0, CW, CH); ctx.font = `34px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = (view.gov ? !view.over.win : view.over.win) ? '#FFC93C' : '#FF7A90'; ctx.fillText(overText(view.over), CW / 2, CH / 2); }
  }

  // ---- the loop -----------------------------------------------------
  function loop(now) {
    const dt = Math.min(50, now - (last || now)); last = now;
    stepQueue(dt);
    try { if (mode === 'pixi') drawPixi(now, dt); else if (mode === '2d') draw2D(now, dt); else for (const fl of view.floats) fl.t += dt; }
    catch (err) { console.error('Render error, switching to 2D', err); if (mode === 'pixi') { try { X.app.canvas.remove(); } catch (e) { /* already gone */ } start2D(); } }
    requestAnimationFrame(loop);
  }
  function start(hk) {
    Object.assign(hooks, hk); el = document.getElementById('scene');
    if (document.fonts && document.fonts.load) document.fonts.load(`16px ${FONT}`);
    requestAnimationFrame(loop);
    startPixi().catch((err) => { console.warn('PixiJS unavailable, drawing in 2D', err); start2D(); });
  }
  return { start, still, runwayStill, setState, enqueue, busy, float, dice, travel, enemy, ring, pause, gameOver, view, SCALE, W, H };
})();
