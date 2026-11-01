/* ============================================================
   COALITION renderer (PixiJS 8). Reads Sim state and a decorative View.

   The art lives in src/art.js: 12x22 pixel sprites with idle and walk
   frames, and six scenes painted in four layers (sky, far, mid, near).
   This file shows them through PixiJS at 3x:
   - each layer is a canvas texture, painted once per state change, with a
     little parallax while the player walks in after travel;
   - people are sprites that breathe; the player walks; police walk up for
     a detention (detain);
   - lights glow and flicker, stars twinkle, clouds drift, and each place
     has its own weather;
   - the hour grades the scene: warm at dusk, blue at night;
   - the dice, floating numbers, tooltips and the end card draw on top.

   If WebGL and WebGPU are unavailable the same scene draws on a 2D canvas.
   Public interface: start, still, runwayStill, setState(s, gov), enqueue,
   busy, float, dice, travel, enemy, detain, ring, pause, gameOver, view,
   SCALE, W, H.
   ============================================================ */
'use strict';
const Render = (() => {
  const W = Art.W, H = Art.H, SCALE = 3, GROUND = Art.GROUND, CW = W * SCALE, CH = H * SCALE, PAD = -Art.X0, LW = Art.X1 - Art.X0;
  const FONT = "'GCNorthSans-Regular', Arial, sans-serif";
  const LAYERS = ['sky', 'far', 'mid', 'near'], PARALLAX = { sky: 0, far: 2, mid: 5, near: 9 };
  const view = { s: null, gov: null, queue: [], current: null, t: 0, floats: [], shake: 0, ring: 0, die: null, fade: 0, enemyPulse: 0, over: null, walk: null, detain: null };
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
  function travel() { enqueue({ dur: 700, update(v, k) { v.fade = Math.sin(k * Math.PI); }, end(v) { v.fade = 0; v.walk = { t: 0, dur: 1300 }; } }); }
  function enemy() { enqueue({ dur: 600, update(v, k) { v.enemyPulse = Math.sin(k * Math.PI); v.shake = (1 - k) * 2; }, end(v) { v.enemyPulse = 0; v.shake = 0; } }); }
  // Police walk up to the player. kind: 'questioned' | 'held' | 'arrest'.
  function detain(kind) { enqueue({ dur: 2200, start(v) { v.detain = { kind: kind || 'questioned', k: 0 }; }, update(v, k) { v.detain.k = k; v.enemyPulse = k > 0.55 ? 0.6 * Math.sin((k - 0.55) / 0.45 * Math.PI) : 0; }, end(v) { v.detain = null; v.enemyPulse = 0; } }); }
  function ring() { enqueue({ dur: 500, update(v, k) { v.ring = 1 - k; }, end(v) { v.ring = 0; } }); }
  function pause(ms) { enqueue({ dur: ms }); }
  function gameOver(over) { enqueue({ dur: 300, start(v) { v.over = over; } }); }
  const T = (id, args) => Content.t(id, args); // scene wording from content/coalition/ui.json
  const DETAIN_TEXT = { questioned: 'render.detain_questioned', held: 'render.detain_held', arrest: 'render.detain_arrest' };

  // ---- the painter Art draws through -------------------------------
  // collect = true: four layer canvases (padded for parallax); people, lights, stars and
  // weather are recorded for PixiJS. collect = false: one canvas, everything painted flat.
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  function painter(target, collect, shown) {
    const ctxs = {};
    if (collect) for (const k of LAYERS) { const c = target[k].getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, LW, H); c.translate(PAD, 0); ctxs[k] = c; }
    else { const c = target.getContext('2d'); for (const k of LAYERS) ctxs[k] = c; }
    let c = ctxs.sky, cur = 'sky';
    const g = {
      collect, actors: [], glows: [], stars: [], fxList: [], spots: [], state: shown,
      layer(name) { cur = name; c = ctxs[name]; },
      fill(col) { c.fillStyle = col; },
      rect(x, y, w, h) { c.fillRect(x, y, w, h); },
      triangle(a, b, d, e, f, h) { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.lineTo(f, h); c.closePath(); c.fill(); },
      ellipse(x, y, w, h) { c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2); c.fill(); },
      px(x, y, rows, pal) { for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) { const ch = rows[j][i]; if (ch === '.' || !pal[ch]) continue; c.fillStyle = pal[ch]; c.fillRect(x + i, y + j, 1, 1); } },
      glow(x, y, r, col, a, flicker) { if (collect) g.glows.push({ x, y, r, col, a: a == null ? 1 : a, flicker: flicker || 0, layer: cur }); },
      star(x, y, ph, big) { if (collect) g.stars.push({ x, y, ph, big }); else if ((Math.floor(ph * 3) % 7) !== 0) { c.fillStyle = '#cfd6ff'; c.fillRect(x, y, 1, 1); } },
      fx(type, opts) { if (collect) g.fxList.push(Object.assign({ type, layer: cur }, opts || {})); },
      figure(role, x, opts) {
        opts = opts || {};
        if (collect) { g.actors.push({ role, x, turned: !!opts.turned, ph: (x * 37) % 4000 }); return; }
        const prev = cur; g.layer('near'); Art.drawSprite(g, role, x, GROUND, 'idle0', opts.turned); g.layer(prev);
      },
      // An ally of the candidate: drawn, labelled for the tooltip, greyed if they talked to the inquiry.
      // The government view passes a hidden state: no labels, no loyalties.
      ally(id, x, role) {
        const s = g.state || {}, pr = !s.hidden && s.people ? s.people[id] : null;
        g.figure(role, x, { turned: !!(pr && pr.turned) });
        if (!s.hidden && typeof Sim !== 'undefined' && Data.PEOPLE[id]) g.spots.push({ id, x: (x - 6) * SCALE, y: (GROUND - 23) * SCALE, w: 12 * SCALE, h: 23 * SCALE, label: pr && (pr.turned || pr.trust >= 2) ? T('render.person_status', { name: Sim.personName(s, id), role: Data.PEOPLE[id].role, status: T(pr.turned ? 'who.talked' : 'who.trusted') }) : T('render.person', { name: Sim.personName(s, id), role: Data.PEOPLE[id].role }) });
      },
    };
    return g;
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
      return { s: shown, pos, gov: true, night: Sim.isNight(s), hour: s.hour };
    }
    return { s, pos: s.pos, gov: false, night: Sim.isNight(s), hour: s.hour };
  }
  function sceneKey(f) {
    const s = f.s; const turned = s.people ? Object.keys(s.people).map(k => (s.people[k].turned ? 1 : 0) + (s.people[k].trust >= 2 ? 2 : 0)).join('') : '';
    return [f.pos, f.night ? 1 : 0, f.gov ? 1 : 0, s.arr.aircraft.stage, s.arr.reception.stage, turned, s.who].join('|');
  }
  const sceneId = (f) => Data.LEVELS[f.pos].scene;
  // The player: the candidate with a gold marker, or the government's search team with a coral one.
  function playerSpec(f) {
    const x = Art.PLAYER_X[sceneId(f)] || 110;
    if (f.gov) return { x, list: [{ dx: -7, role: 'agent1' }, { dx: 7, role: 'agent2' }], marker: '#FF7A90', label: T('render.you', { name: Data.GOV ? Data.GOV.name : T('render.search_team') }), w: 26 };
    return { x, list: [{ dx: 0, role: f.s.who === 'woman' ? 'teresa' : 'mateu' }], marker: '#FFD24A', label: T('render.you', { name: Data.CHARACTERS[f.s.who].name }), w: 12 };
  }
  function grade(f) {
    const h = (Sim.START_HOUR + f.hour) % 24;
    if (f.night) return { col: 0x4a56b8, a: 0.4, light: 1 };
    if (h >= 17 && h < 22) return { col: 0xff9a6a, a: 0.2 + (h - 17) * 0.03, light: 0.55 };
    if (h >= 5 && h < 8) return { col: 0xffb0c0, a: 0.16, light: 0.45 };
    return { col: 0xffffff, a: 0, light: 0.18 };
  }

  // ---- stills for the title, start screen and debrief (2D, synchronous) ----
  function flatScene(c, f) {
    const g = painter(c, false, f.s); Art.SCENES[sceneId(f)](g, f.s, 4000, f.night);
    const p = playerSpec(f); g.layer('near'); for (const m of p.list) Art.drawSprite(g, m.role, p.x + m.dx, GROUND, 'idle0');
    g.fill(p.marker); g.rect(p.x - 1, GROUND - 26, 3, 2); return g;
  }
  function still(s) { const c = mkCanvas(W, H); flatScene(c, { s, pos: s.pos, gov: false, night: Sim.isNight(s), hour: s.hour }); return c.toDataURL('image/png'); }
  function runwayStill() { const c = mkCanvas(W, H), g = painter(c, false, null); Art.runway(g); return c.toDataURL('image/png'); }

  // ---- pointer: map the cropped, scaled canvas back to scene pixels ----
  function fit(canvas) {
    const r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return null;
    const k = Math.max(r.width / CW, r.height / CH), dw = CW * k, dh = CH * k;
    return { r, k, ox: (r.width - dw) / 2, oy: r.height - dh };
  }
  function toCanvas(canvas, e) { const m = fit(canvas); if (!m) return null; return { x: (e.clientX - m.r.left - m.ox) / m.k, y: (e.clientY - m.r.top - m.oy) / m.k }; }
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
  const X = {};
  const texCache = new Map();
  function canvasTexture(canvas, linear) { return new PIXI.Texture({ source: new PIXI.CanvasSource({ resource: canvas, scaleMode: linear ? 'linear' : 'nearest' }) }); }
  function spriteTex(role, frameName, turned) {
    const key = role + '|' + frameName + '|' + (turned ? 1 : 0); if (texCache.has(key)) return texCache.get(key);
    const sz = Art.size(role), c = mkCanvas(sz.w, sz.h), g = painter(c, false, null);
    g.px(0, 0, Art.rows(role, frameName), Art.palette(Art.KIDS[role] || Art.ROLES[role] || Art.ROLES.local, turned));
    const t = canvasTexture(c); texCache.set(key, t); return t;
  }
  function radialTex(size, stops) {
    const c = mkCanvas(size, size), x = c.getContext('2d'), gr = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (const [o, col] of stops) gr.addColorStop(o, col); x.fillStyle = gr; x.fillRect(0, 0, size, size); return canvasTexture(c, true);
  }
  function cloudTex(seed) {
    const c = mkCanvas(44, 14), x = c.getContext('2d'); x.fillStyle = 'rgba(255,255,255,0.82)';
    for (let i = 0; i < 7; i++) { const cx = 7 + ((seed * 7 + i * 11) % 30), cy = 7 + ((seed + i * 3) % 3) - 1, r = 3 + ((seed + i) % 3); x.beginPath(); x.ellipse(cx, cy, r * 1.2, r * 0.8, 0, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = 'rgba(255,255,255,0.95)'; x.fillRect(5, 9, 34, 3); x.fillStyle = 'rgba(200,210,230,0.6)'; x.fillRect(5, 12, 34, 1); return canvasTexture(c);
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
    X.world = new PIXI.Container(); X.world.scale.set(SCALE); app.stage.addChild(X.world);
    X.layerCanvas = {}; X.layerTex = {}; X.layerSprite = {};
    const addLayer = (k) => { const c = mkCanvas(LW, H); X.layerCanvas[k] = c; X.layerTex[k] = canvasTexture(c); const sp = new PIXI.Sprite(X.layerTex[k]); sp.x = -PAD; X.world.addChild(sp); X.layerSprite[k] = sp; };
    addLayer('sky');
    X.sky = new PIXI.Container(); X.world.addChild(X.sky);          // stars, clouds
    addLayer('far'); X.farFx = new PIXI.Container(); X.world.addChild(X.farFx);
    addLayer('mid'); X.midFx = new PIXI.Container(); X.world.addChild(X.midFx);
    addLayer('near');
    X.actors = new PIXI.Container(); X.world.addChild(X.actors);    // people
    X.weather = new PIXI.Container(); X.world.addChild(X.weather);
    X.grade = new PIXI.Graphics().rect(-PAD, 0, LW, H).fill(0xffffff); X.grade.blendMode = 'multiply'; X.world.addChild(X.grade);
    X.lights = new PIXI.Container(); X.world.addChild(X.lights);
    X.glowTex = radialTex(64, [[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.45)'], [1, 'rgba(255,255,255,0)']]);
    X.clouds = [cloudTex(1), cloudTex(4), cloudTex(9)];
    X.vignette = new PIXI.Sprite(radialTex(256, [[0, 'rgba(10,6,24,0)'], [0.62, 'rgba(10,6,24,0)'], [1, 'rgba(10,6,24,0.75)']]));
    X.vignette.width = CW * 1.25; X.vignette.height = CH * 1.6; X.vignette.anchor.set(0.5); X.vignette.position.set(CW / 2, CH / 2); app.stage.addChild(X.vignette);
    X.fxScreen = new PIXI.Graphics(); app.stage.addChild(X.fxScreen);
    X.ui = new PIXI.Container(); app.stage.addChild(X.ui);
    const shadow = { color: 0x150f2e, distance: 2, blur: 0, alpha: 1, angle: Math.PI / 2 };
    X.die = new PIXI.Container(); X.dieBox = new PIXI.Graphics(); X.dieNeed = new PIXI.Text({ text: '', style: { fontFamily: FONT, fontSize: 18, fill: 0xf6f1ff, dropShadow: shadow } });
    X.dieNum = new PIXI.Text({ text: '', style: { fontFamily: FONT, fontSize: 28, fill: 0x150f2e } }); X.dieNum.anchor.set(0.5, 0.5);
    X.dieNeed.anchor.set(0.5, 0); X.die.addChild(X.dieBox, X.dieNum, X.dieNeed); X.die.visible = false; X.ui.addChild(X.die);
    X.tip = new PIXI.Container(); X.tipBox = new PIXI.Graphics(); X.tipText = new PIXI.Text({ text: '', style: { fontFamily: FONT, fontSize: 18, fill: 0xffffff } });
    X.tip.addChild(X.tipBox, X.tipText); X.tip.visible = false; X.ui.addChild(X.tip); X.tipFor = null;
    X.det = new PIXI.Container(); X.detBox = new PIXI.Graphics(); X.detText = new PIXI.Text({ text: '', style: { fontFamily: FONT, fontSize: 24, fill: 0x2a0610 } });
    X.detText.anchor.set(0.5); X.det.addChild(X.detBox, X.detText); X.det.visible = false; X.ui.addChild(X.det);
    X.over = new PIXI.Container(); X.overDim = new PIXI.Graphics().rect(0, 0, CW, CH).fill({ color: 0x150f2e, alpha: 0.72 });
    X.overText = new PIXI.Text({ text: '', style: { fontFamily: FONT, fontSize: 34, fill: 0xffc93c, align: 'center', dropShadow: { color: 0x000000, distance: 3, blur: 0, alpha: 0.8, angle: Math.PI / 2 } } });
    X.overText.anchor.set(0.5); X.overText.position.set(CW / 2, CH / 2); X.over.addChild(X.overDim, X.overText); X.over.visible = false; X.ui.addChild(X.over);
    X.key = null; X.part = []; mode = 'pixi';
  }

  // Rebuild the layers, the people and the weather when the state changes.
  function rebuild(f) {
    const g = painter(X.layerCanvas, true, f.s);
    Art.SCENES[sceneId(f)](g, f.s, 0, f.night);
    for (const k of LAYERS) X.layerTex[k].source.update();
    for (const layer of [X.sky, X.farFx, X.midFx, X.actors, X.weather, X.lights]) layer.removeChildren().forEach(c => c.destroy());
    X.part = []; X.people = []; X.lightList = []; X.starList = [];
    const fxLayer = (name) => name === 'far' || name === 'sky' ? X.farFx : name === 'mid' ? X.midFx : X.weather;
    for (const st of g.stars) { const sp = dot(X.sky, 0xcfd6ff, st.big ? 2 : 1, 1); sp.position.set(st.x, st.y); X.starList.push({ sp, ph: st.ph }); }
    if (g.fxList.some(e => e.type === 'clouds')) for (let i = 0; i < 4; i++) { const sp = new PIXI.Sprite(X.clouds[i % 3]); sp.alpha = 0.5 + (i % 2) * 0.22; sp.position.set((i * 97) % W, 6 + i * 8); X.sky.addChild(sp); X.part.push({ kind: 'cloud', sp, v: 1.1 + i * 0.5 }); }
    for (const a of g.actors) {
      const sz = Art.size(a.role), sp = new PIXI.Sprite(spriteTex(a.role, 'idle0', a.turned)); sp.position.set(Math.round(a.x - sz.w / 2), GROUND - sz.h); X.actors.addChild(sp);
      X.people.push({ sp, role: a.role, turned: a.turned, x0: sp.x, ph: a.ph, f: 0 });
    }
    const p = playerSpec(f); X.player = { x: p.x, sprites: [], marker: null };
    for (const m of p.list) { const sp = new PIXI.Sprite(spriteTex(m.role, 'idle0')); sp.position.set(p.x + m.dx - 6, GROUND - 22); X.actors.addChild(sp); X.player.sprites.push({ sp, role: m.role, dx: m.dx, f: '' }); }
    X.player.marker = dot(X.actors, hexNum(p.marker), 3, 2);
    X.cops = [0, 1].map(i => { const sp = new PIXI.Sprite(spriteTex('police', 'idle0')); sp.visible = false; X.actors.addChild(sp); return { sp, f: '' }; });
    hotspots = g.spots.concat([{ id: 'self', x: (p.x - p.w / 2) * SCALE, y: (GROUND - 23) * SCALE, w: p.w * SCALE, h: 23 * SCALE, label: p.label }]);
    for (const L of g.glows) { const sp = new PIXI.Sprite(X.glowTex); sp.anchor.set(0.5); sp.position.set(L.x, L.y); sp.width = sp.height = L.r * 2; sp.tint = hexNum(L.col); sp.blendMode = 'add'; X.lights.addChild(sp); X.lightList.push({ sp, a: L.a, flicker: L.flicker, ph: L.x * 13, x0: L.x, layer: L.layer }); }
    for (const e of g.fxList) {
      const layer = fxLayer(e.layer);
      if (e.type === 'snow') for (let i = 0; i < 80; i++) { const sp = dot(X.weather, 0xffffff); sp.alpha = 0.7 + Math.random() * 0.3; sp.position.set(Math.random() * W, Math.random() * H); X.part.push({ kind: 'snow', sp, v: 7 + Math.random() * 9, ph: Math.random() * 6 }); }
      if (e.type === 'fireflies') for (let i = 0; i < 16; i++) { const sp = dot(X.weather, 0xe8ff8a); sp.blendMode = 'add'; const hx = Math.random() * W, hy = e.y0 + Math.random() * (e.y1 - e.y0); sp.position.set(hx, hy); X.part.push({ kind: 'fly', sp, hx, hy, ph: Math.random() * 10 }); }
      if (e.type === 'pollen') for (let i = 0; i < 12; i++) { const sp = dot(X.weather, 0xfff3c4); sp.alpha = 0.6; sp.position.set(Math.random() * W, e.y0 + Math.random() * (e.y1 - e.y0)); X.part.push({ kind: 'pollen', sp, ph: Math.random() * 10, y0: e.y0, y1: e.y1 }); }
      if (e.type === 'moths') for (const [lx, ly] of e.lamps) for (let i = 0; i < 3; i++) { const sp = dot(X.weather, 0xf3e6c0); X.part.push({ kind: 'moth', sp, cx: lx + 0.5, cy: ly, ph: Math.random() * 10, r: 3 + Math.random() * 4 }); }
      if (e.type === 'glints') X.part.push({ kind: 'glintSpawner', e, acc: 0, layer });
      if (e.type === 'steam') X.part.push({ kind: 'steamSpawner', e, acc: 0, layer });
      if (e.type === 'beacon') { const sp = dot(layer, hexNum(e.col), 2, 2); sp.position.set(e.x - 1, e.y - 1); const gl = new PIXI.Sprite(X.glowTex); gl.anchor.set(0.5); gl.position.set(e.x, e.y); gl.width = gl.height = 14; gl.tint = hexNum(e.col); gl.blendMode = 'add'; layer.addChild(gl); X.part.push({ kind: 'beacon', sp, gl, period: e.period, offset: e.offset || 0 }); }
    }
  }

  function updateParticles(now, dt) {
    const sec = dt / 1000, born = [];
    for (const p of X.part) {
      switch (p.kind) {
        case 'cloud': p.sp.x += p.v * sec; if (p.sp.x > W) p.sp.x = -46; break;
        case 'snow': p.sp.y += p.v * sec; p.sp.x += Math.sin(now / 900 + p.ph) * 4 * sec; if (p.sp.y > H) { p.sp.y = -2; p.sp.x = Math.random() * W; } break;
        case 'fly': { const k = now / 1000 + p.ph; p.sp.x = Math.round(p.hx + Math.sin(k * 0.7) * 8); p.sp.y = Math.round(p.hy + Math.sin(k * 1.1) * 4); p.sp.alpha = Math.max(0, Math.sin(k * 2.3)) ** 2; break; }
        case 'pollen': { const k = now / 1000 + p.ph; p.sp.x = (p.sp.x + 3 * sec + W) % W; p.sp.y = p.y0 + (p.y1 - p.y0) * (0.5 + 0.5 * Math.sin(k * 0.4)); break; }
        case 'moth': { const k = now / 230 + p.ph; p.sp.position.set(Math.round(p.cx + Math.cos(k) * p.r), Math.round(p.cy + Math.sin(k * 1.3) * p.r * 0.6)); break; }
        case 'beacon': { const on = ((now + p.offset) % p.period) < p.period * 0.18; p.sp.alpha = on ? 1 : 0.2; p.gl.alpha = on ? 0.9 : 0; break; }
        case 'glintSpawner': p.acc += sec * p.e.rate; while (p.acc >= 1) { p.acc -= 1; const sp = dot(p.layer, hexNum(p.e.col), 1 + (Math.random() < 0.3 ? 1 : 0), 1); sp.position.set(Math.floor(p.e.x0 + Math.random() * (p.e.x1 - p.e.x0)), Math.floor(p.e.y0 + Math.random() * (p.e.y1 - p.e.y0))); born.push({ kind: 'glint', sp, t: 0, life: 700 }); } break;
        case 'steamSpawner': p.acc += sec * (p.e.rate || 2.2); while (p.acc >= 1) { p.acc -= 1; const sp = dot(p.layer, hexNum(p.e.col || '#b8b8c8'), 2, 2); sp.position.set(p.e.x, p.e.y); born.push({ kind: 'puff', sp, t: 0, life: 2600, x: p.e.x + Math.random() * 2, y: p.e.y }); } break;
        case 'glint': p.t += dt; p.sp.alpha = Math.sin(Math.PI * Math.min(1, p.t / p.life)); if (p.t >= p.life) p.dead = true; break;
        case 'puff': { p.t += dt; const k = p.t / p.life, s = 2 + Math.round(k * 4); p.sp.width = p.sp.height = s; p.sp.position.set(Math.round(p.x - k * 10 - s / 2), Math.round(p.y - k * 22 - s / 2)); p.sp.alpha = 0.55 * (1 - k); if (p.t >= p.life) p.dead = true; break; }
      }
    }
    if (born.length) X.part.push(...born);
    if (X.part.some(p => p.dead)) X.part = X.part.filter(p => { if (p.dead) { p.sp.destroy(); return false; } return true; });
  }
  const setFrame = (o, role, name, turned) => { if (o.f !== name) { o.f = name; o.sp.texture = spriteTex(role, name, turned); } };

  function drawPixi(now, dt) {
    const f = frame(); if (!f) { X.app.render(); return; }
    const key = sceneKey(f); if (key !== X.key) { X.key = key; rebuild(f); }
    const gr = grade(f);
    if (gr.a) { const k = gr.a; X.grade.alpha = 1; X.grade.tint = ((Math.round(255 - (255 - ((gr.col >> 16) & 255)) * k) << 16) | (Math.round(255 - (255 - ((gr.col >> 8) & 255)) * k) << 8) | Math.round(255 - (255 - (gr.col & 255)) * k)); } else X.grade.alpha = 0;
    // Parallax: the camera settles as the player walks in after travel.
    let pk = 0, px0 = X.player.x, striding = false;
    if (view.walk) { view.walk.t += dt; const k = Math.min(1, view.walk.t / view.walk.dur), e = 1 - (1 - k) * (1 - k); pk = 1 - e; px0 = Math.round(X.player.x - 80 * (1 - e)); striding = k < 1; if (k >= 1) view.walk = null; }
    for (const k of LAYERS) X.layerSprite[k].x = -PAD + Math.round(PARALLAX[k] * pk);
    X.farFx.x = Math.round(PARALLAX.far * pk); X.midFx.x = Math.round(PARALLAX.mid * pk); X.weather.x = 0; X.actors.x = Math.round(PARALLAX.near * pk);
    for (const L of X.lightList) { L.sp.x = L.x0 + Math.round((PARALLAX[L.layer] || 0) * pk); L.sp.alpha = Math.max(0, gr.light * L.a * (1 - L.flicker * (0.5 + 0.5 * Math.sin(now / 90 + L.ph) * Math.sin(now / 230 + L.ph * 0.7)))); }
    for (const st of X.starList) st.sp.alpha = 0.35 + 0.65 * Math.max(0, Math.sin(now / 700 + st.ph));
    // People breathe out of step with each other.
    for (const p of X.people) setFrame(p, p.role, ((now + p.ph) % 3200) < 420 ? 'idle1' : 'idle0', p.turned);
    // The player walks in, then breathes; the marker bobs over the head.
    for (const m of X.player.sprites) { setFrame(m, m.role, striding ? 'walk' + (Math.floor(view.walk.t / 120) % 4) : (((now + m.dx * 97) % 3600) > 1800 && ((now + m.dx * 97) % 3600) < 2240 ? 'idle1' : 'idle0')); m.sp.x = px0 + m.dx - 6 - X.actors.x; }
    X.player.marker.position.set(px0 - 1 - X.actors.x, GROUND - 27 + Math.round(Math.sin(now / 300)));
    // A detention: two officers walk in from the right and stop beside the player.
    const d = view.detain;
    X.cops.forEach((c, i) => {
      c.sp.visible = !!d; if (!d) return;
      const target = X.player.x + 16 + i * 14, k = Math.min(1, d.k / 0.55), e = 1 - (1 - k) * (1 - k), x = Math.round(W + 14 + i * 16 - (W + 14 + i * 16 - target) * e);
      setFrame(c, 'police', k < 1 ? 'walk' + (Math.floor(now / 120 + i * 2) % 4) : 'idle0'); c.sp.x = x - 6 - X.actors.x; c.sp.y = GROUND - 22;
    });
    updateParticles(now, dt);
    X.world.x = Math.round((Math.random() - 0.5) * view.shake) * SCALE;
    const fxg = X.fxScreen; fxg.clear();
    if (view.enemyPulse > 0) fxg.rect(0, 0, CW, CH).fill({ color: 0xdc2828, alpha: 0.2 * view.enemyPulse });
    if (view.ring > 0) { const a = 0.5 * view.ring; fxg.rect(0, 0, CW, 6).fill({ color: 0xc9a4f5, alpha: a }).rect(0, CH - 6, CW, 6).fill({ color: 0xc9a4f5, alpha: a }); }
    if (view.fade > 0) fxg.rect(0, 0, CW, CH).fill({ color: 0x08080e, alpha: 0.92 * view.fade });
    drawDie(now); drawFloats(dt); drawTip(); drawDetain(); drawOver();
    X.app.render();
  }
  function drawDie(now) {
    const d = view.die; X.die.visible = !!d; if (!d) return;
    const k = Math.min(1, d.t * 3), settled = k >= 1, face = settled ? d.die : 1 + (Math.floor(now / 50) % 20);
    const box = X.dieBox, S = 64, col = settled ? (d.won ? 0x3bd15e : 0xff4d6d) : 0xf6f1ff;
    // a 20-sided die drawn as a hexagon with its number in the middle
    const hex = (ox, oy) => [0, -S / 2, S / 2, -S / 4, S / 2, S / 4, 0, S / 2, -S / 2, S / 4, -S / 2, -S / 4].map((v, i) => v + (i % 2 ? oy : ox));
    box.clear().poly(hex(4, 6)).fill({ color: 0x000000, alpha: 0.35 }).poly(hex(0, 0)).fill(col);
    X.dieNum.text = String(face);
    const pop = settled ? 1 + 0.18 * Math.max(0, 1 - (d.t - 1 / 3) * 6) : 1;
    X.die.position.set(CW / 2, CH / 2 - 34); X.die.rotation = settled ? 0 : Math.sin(now / 45) * 0.35; X.die.scale.set(pop);
    X.dieNeed.text = '';
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
  function drawDetain() {
    const d = view.detain; X.det.visible = !!(d && d.k > 0.5); if (!X.det.visible) return;
    const t = T(DETAIN_TEXT[d.kind] || DETAIN_TEXT.questioned); if (X.detText.text !== t) { X.detText.text = t; X.detBox.clear().roundRect(-X.detText.width / 2 - 18, -24, X.detText.width + 36, 48, 10).fill(0xff7a90); }
    const vb = visibleBox(X.app.canvas); X.det.position.set(Math.round((vb.x0 + vb.x1) / 2), Math.round(CH * 0.3)); X.det.alpha = Math.min(1, (d.k - 0.5) * 8);
  }
  function overText(o) { return (view.gov ? !o.win : o.win) ? T('over.win') : T('over.lose'); }
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
    const key = sceneKey(f);
    if (key !== X.key) {
      X.key = key; const fc = X.flat.getContext('2d'); fc.clearRect(0, 0, W, H); const g = flatScene(X.flat, f), p = playerSpec(f);
      hotspots = g.spots.concat([{ id: 'self', x: (p.x - p.w / 2) * SCALE, y: (GROUND - 23) * SCALE, w: p.w * SCALE, h: 23 * SCALE, label: p.label }]);
    }
    view.walk = null; for (const fl of view.floats) fl.t += dt; view.floats = view.floats.filter(fl => fl.t < fl.life);
    ctx.save(); ctx.translate(Math.round((Math.random() - 0.5) * view.shake) * SCALE, 0); ctx.drawImage(X.flat, 0, 0, CW, CH); ctx.restore();
    const gr = grade(f); if (gr.a) { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = gr.a; ctx.fillStyle = '#' + gr.col.toString(16).padStart(6, '0'); ctx.fillRect(0, 0, CW, CH); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
    if (view.enemyPulse > 0) { ctx.fillStyle = `rgba(220,40,40,${0.2 * view.enemyPulse})`; ctx.fillRect(0, 0, CW, CH); }
    if (view.fade > 0) { ctx.fillStyle = `rgba(8,8,14,${0.92 * view.fade})`; ctx.fillRect(0, 0, CW, CH); }
    ctx.font = `22px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    for (const fl of view.floats) { ctx.fillStyle = fl.color; ctx.fillText(fl.text, fl.x, fl.y - (fl.t / fl.life) * 36); }
    if (view.die) { const d = view.die, k = Math.min(1, d.t * 3), face = k < 1 ? 1 + (Math.floor(now / 50) % 20) : d.die; ctx.fillStyle = k < 1 ? '#f6f1ff' : d.won ? '#3bd15e' : '#ff4d6d'; ctx.fillRect(CW / 2 - 28, CH / 2 - 62, 56, 56); ctx.fillStyle = '#150f2e'; ctx.font = `28px ${FONT}`; ctx.textBaseline = 'middle'; ctx.fillText(String(face), CW / 2, CH / 2 - 34); ctx.font = `18px ${FONT}`; ctx.fillStyle = '#f6f1ff'; void 0; }
    if (view.detain && view.detain.k > 0.5) { const t = T(DETAIN_TEXT[view.detain.kind] || DETAIN_TEXT.questioned), vb = visibleBox(X.c2); ctx.font = `24px ${FONT}`; const w = ctx.measureText(t).width + 36, cx = (vb.x0 + vb.x1) / 2; ctx.fillStyle = '#ff7a90'; ctx.fillRect(cx - w / 2, CH * 0.3 - 24, w, 48); ctx.fillStyle = '#2a0610'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, cx, CH * 0.3); }
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
  return { start, still, runwayStill, setState, enqueue, busy, float, dice, travel, enemy, detain, ring, pause, gameOver, view, SCALE, W, H };
})();
