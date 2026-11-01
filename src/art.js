/* ============================================================
   COALITION art. Pixel sprites and layered scene backgrounds, all drawn
   in code so the game stays one offline file.

   Sprites are 12x22 (children 8x14), built from a head, a body and legs,
   with two idle frames (breathing) and four walk frames.

   Scenes paint into four layers through the painter render.js passes in:
   sky, far, mid and near. The painter also records lights (g.glow),
   weather (g.fx), stars (g.star), people (g.figure) and allies (g.ally),
   so render.js can animate them. Nothing here reads hidden game state
   beyond what the scene shows.
   ============================================================ */
'use strict';
const Art = (() => {
  const W = 320, H = 150, GROUND = H - 56, X0 = -10, X1 = W + 10;

  // ---- colour helpers ----------------------------------------------
  const hex = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  const toHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const shade = (h, k) => { const [r, g, b] = hex(h); return toHex(r * (1 - k), g * (1 - k), b * (1 - k)); };
  const tint = (h, k) => { const [r, g, b] = hex(h); return toHex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k); };
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return toHex(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k); };
  const gray = (h) => { const [r, g, b] = hex(h); const v = (r * 0.3 + g * 0.59 + b * 0.11) * 0.85 + 20; return toHex(v, v, v + 6); };

  // ---- sprite parts --------------------------------------------------
  const HEADS = {
    bare: ['............', '....HHHH....', '...HHHHHH...', '...HSSSSH...', '...SESSES...', '...SSSSSS...', '....SssS....', '.....SS.....'],
    glasses: ['............', '....HHHH....', '...HHHHHH...', '...HSSSSH...', '...GEGGEG...', '...SSSSSS...', '....SssS....', '.....SS.....'],
    long: ['....HHHH....', '...HHHHHH...', '..HHSSSSHH..', '..HSESSESH..', '..HSSSSSSH..', '..HHSssSHH..', '..HH.SS.HH..', '..H..SS..H..'],
    bob: ['............', '....HHHH....', '...HHHHHH...', '..HHSSSSHH..', '..HSESSESH..', '..HSSSSSSH..', '...HSssSH...', '.....SS.....'],
    bun: ['.....HH.....', '....HHHH....', '...HHHHHH...', '...HSSSSH...', '...SESSES...', '...SSSSSS...', '....SssS....', '.....SS.....'],
    cap: ['............', '....KKKK....', '...KKKKKK...', '..kkkkkkkk..', '...SESSES...', '...SSSSSS...', '....SssS....', '.....SS.....'],
    badge: ['............', '....KKKK....', '...KKYKKK...', '..kkkkkkkk..', '...SESSES...', '...SSSSSS...', '....SssS....', '.....SS.....'],
    hard: ['....YYYY....', '...YYYYYY...', '..yyyyyyyy..', '...HSSSSH...', '...SESSES...', '...SSSSSS...', '....SssS....', '.....SS.....'],
    fedora: ['....KKKK....', '...KKKKKK...', '...ZZZZZZ...', '.kkkkkkkkkk.', '...SESSES...', '...SSSSSS...', '....SssS....', '.....SS.....'],
  };
  const BODIES = {
    suit: ['...CCTTCC...', '..CCCTTCCC..', '.CCCCRRCCCC.', '.CcCCRRCCcC.', '.CcCCCCCCcC.', '.ScCCCCCCcS.', '..CCCCCCCC..', '..cccccccc..'],
    coat: ['...TTTTTT...', '..CCTTTTCC..', '.CCCCTTCCCC.', '.CcCCCCCCcC.', '.CcCCCCCCcC.', '.ScCCCCCCcS.', '..CCCCCCCC..', '..CCCCCCCC..'],
    uniform: ['...CCTTCC...', '..CCCTTCCC..', '.CYCCCCCCYC.', '.CcCYCCCCcC.', '.CcCCCCCCcC.', '.ScCCCCCCcS.', '..RRRYYRRR..', '..CCCCCCCC..'],
    pilot: ['...CCTTCC...', '..CCCTRCCC..', '.CCCCTRCCCC.', '.CcCCCCCCcC.', '.YcCCCCCCcY.', '.ScCCCCCCcS.', '..CCCCCCCC..', '..cccccccc..'],
    jacket: ['...CCSSCC...', '..CCCSSCCC..', '.CCCTTTTCCC.', '.CcCTTTTCcC.', '.CcCTTTTCcC.', '.ScCCCCCCcS.', '..CCCCCCCC..', '..cccccccc..'],
    vest: ['...CCSSCC...', '..CCCSSCCC..', '.TCYCCCCYCT.', '.TcYCCCCYcT.', '.TcCCCCCCcT.', '.ScYYYYYYcS.', '..CCCCCCCC..', '..cccccccc..'],
    shawl: ['..WWWWWWWW..', '.WWWWWWWWWW.', '.WWCCCCCCWW.', '.WwCCCCCCwW.', '.WCCCCCCCCW.', '.SCCCCCCCCS.', '..CCCCCCCC..', '..CCCCCCCC..'],
    blazer: ['...CCTTCC...', '..CCCTTCCC..', '.CCCCTTCCCC.', '.CcCCTTCCcC.', '.CcCCCCCCcC.', '.ScCCCCCCcS.', '..CCCCCCCC..', '..CCCCCCCC..'],
    trench: ['...CCTTCC...', '..CCCTTCCC..', '.CCCCCCCCCC.', '.CcCCcCCCcC.', '.CcCCcCCCcC.', '.ScCRRRRCcS.', '..CCCcCCCC..', '..CCCcCCCC..'],
  };
  const mirror = (rows) => rows.map(r => r.split('').reverse().join(''));
  const LEG = {
    trousers: [
      ['...LLLLLL...', '...LLLLLL...', '...LL..LL...', '...LL..LL...', '...LL..LL...', '..BBB..BBB..'],
      ['...LLLLLL...', '..LLL..LLL..', '..LL....LL..', '.LL......LL.', '.LL......LL.', 'BBB......BBB'],
      ['...LLLLLL...', '...LLL.LL...', '..LL...LL...', '..LL...LL...', '..BB...LL...', '.......BBB..'],
    ],
    coat: [
      ['..CCCCCCCC..', '..CCCCCCCC..', '..CcC..CcC..', '...LL..LL...', '...LL..LL...', '..BBB..BBB..'],
      ['..CCCCCCCC..', '.CCCC..CCCC.', '.CcC....CcC.', '..LL....LL..', '.LL......LL.', 'BBB......BBB'],
      ['..CCCCCCCC..', '..CCCC.CCC..', '..CcC..CcC..', '..LL...LL...', '..BB...LL...', '.......BBB..'],
    ],
    skirt: [
      ['..CCCCCCCC..', '..CCCCCCCC..', '...CCCCCC...', '....L..L....', '....L..L....', '...BB..BB...'],
      ['..CCCCCCCC..', '..CCCCCCCC..', '...CCCCCC...', '...L....L...', '..L......L..', '.BB......BB.'],
      ['..CCCCCCCC..', '..CCCCCCCC..', '...CCCCCC...', '...L...L....', '...BB..L....', '.......BB...'],
    ],
  };
  // frames: idle0, idle1 (exhale: the upper body drops a pixel), walk0..walk3
  function legFrames(kind) { const [idle, open, lift] = LEG[kind]; return { idle, walk: [open, lift, open, mirror(lift)] }; }
  const BLANK = '............';

  // ---- the cast ------------------------------------------------------
  const ROLES = {
    teresa: { head: 'long', body: 'coat', legs: 'coat', H: '#2a1a14', S: '#e0b48c', C: '#8a2f3a', T: '#e8c050', L: '#2a2430', B: '#141018' },
    mateu: { head: 'bare', body: 'suit', legs: 'trousers', H: '#1a1210', S: '#d8a070', C: '#2b3450', T: '#e8e8f0', R: '#9a3a3a', L: '#23283a', B: '#141018' },
    nando: { head: 'cap', body: 'jacket', legs: 'trousers', K: '#4a3a1a', S: '#c89060', C: '#8a6a3a', T: '#d8d0b8', L: '#3a3428', B: '#1a1410' },
    sofia: { head: 'bun', body: 'suit', legs: 'trousers', H: '#3a2418', S: '#e0b48c', W: '#3a2418', C: '#1f3f5a', T: '#f0e8f0', R: '#c8a83a', L: '#1a2430', B: '#0e1018' },
    aide: { head: 'glasses', body: 'suit', legs: 'trousers', H: '#2b1d24', S: '#e0b48c', G: '#c8c8d0', C: '#5a2d5a', T: '#f0e8f0', R: '#c8a83a', L: '#2a2030', B: '#141018' },
    host: { head: 'bun', body: 'shawl', legs: 'skirt', H: '#dcdce4', S: '#c89060', W: '#7a4ea8', C: '#3a2a3a', L: '#5a4a40', B: '#2a1a14' },
    holt: { head: 'cap', body: 'jacket', legs: 'trousers', K: '#2a2e38', S: '#d8a070', C: '#444c5a', T: '#8a8a7a', L: '#2a2e38', B: '#141018', extra: [[11, 13, 'k'], [10, 14, 'A'], [11, 14, 'A'], [10, 15, 'a'], [11, 15, 'a']], A: '#ffd27a' },
    theo: { head: 'hard', body: 'vest', legs: 'trousers', Y: '#f2c230', S: '#c89060', H: '#2a1a14', C: '#e0762a', T: '#6a7a8a', L: '#2f3a4a', B: '#1a1410' },
    pilot: { head: 'badge', body: 'pilot', legs: 'trousers', K: '#1b2a45', Y: '#e8c050', S: '#d8a070', C: '#1f2c48', T: '#e8eef8', R: '#1b2a45', L: '#1b2338', B: '#0e1018' },
    official: { head: 'bob', body: 'blazer', legs: 'skirt', H: '#1a1210', S: '#c89060', C: '#8a2f3a', T: '#f0e0e0', L: '#3a2a30', B: '#141018' },
    police: { head: 'badge', body: 'uniform', legs: 'trousers', K: '#1b2a45', Y: '#d8c060', S: '#d8a070', C: '#33405a', T: '#c8d0e0', R: '#141820', L: '#232a3a', B: '#0e1018' },
    watch: { head: 'fedora', body: 'trench', legs: 'coat', K: '#2a2a32', Z: '#3a3a44', S: '#d8a070', C: '#4a4a52', T: '#c8c8c0', R: '#2a2a32', L: '#2a2a32', B: '#141018' },
    clerk: { head: 'bare', body: 'jacket', legs: 'trousers', H: '#3a2a1a', S: '#e0b48c', C: '#5f8a4a', T: '#e8e8d8', L: '#3a3a30', B: '#1a1410' },
    local: { head: 'bare', body: 'jacket', legs: 'trousers', H: '#1a1210', S: '#d8a070', C: '#3b5d8f', T: '#d8d8e0', L: '#2a3040', B: '#141018' },
    guard: { head: 'badge', body: 'uniform', legs: 'trousers', K: '#2c3a2a', Y: '#d8c060', S: '#d8a070', C: '#3a4a36', T: '#c8d0b8', R: '#141810', L: '#283224', B: '#0e1008' },
    esmguard: { head: 'badge', body: 'uniform', legs: 'trousers', K: '#2a3a5a', Y: '#e8e8e8', S: '#c89060', C: '#4a6a8a', T: '#e8eef8', R: '#141820', L: '#2a3448', B: '#0e1018' },
    agent1: { head: 'fedora', body: 'trench', legs: 'coat', K: '#2b2b33', Z: '#FF7A90', S: '#d8a070', C: '#3b3f55', T: '#d8d8e0', R: '#2b2b33', L: '#22242e', B: '#101018' },
    agent2: { head: 'fedora', body: 'trench', legs: 'coat', K: '#3a3030', Z: '#FF7A90', S: '#c89060', C: '#2b3450', T: '#d8d8e0', R: '#22242e', L: '#22242e', B: '#101018' },
    // the family for the runway still
    famDad: { head: 'bare', body: 'suit', legs: 'trousers', H: '#1b1b22', S: '#d8a070', C: '#2b3450', T: '#e8e8f0', R: '#3a5a8a', L: '#23283a', B: '#141018' },
    famMum: { head: 'long', body: 'coat', legs: 'coat', H: '#2a1a14', S: '#e0b48c', C: '#8a2d3d', T: '#e8c050', L: '#2a2430', B: '#141018' },
    famUncle: { head: 'bare', body: 'jacket', legs: 'trousers', H: '#3a2a1a', S: '#c89060', C: '#4a5a3a', T: '#e8e0d0', L: '#2f3428', B: '#1a1410' },
    famGran: { head: 'bun', body: 'shawl', legs: 'skirt', H: '#dddde4', S: '#d8a070', W: '#7a4ea8', C: '#4a3a5a', L: '#5a4a40', B: '#2a1a14' },
  };
  const KID = ['..HHHH..', '.HHHHHH.', '.HSSSSH.', '.SESSES.', '..SssS..', '...SS...', '.CCCCCC.', 'CCCCCCCC', 'SCCCCCCS', '.CCCCCC.', '.LL..LL.', '.LL..LL.', '.LL..LL.', 'BBB..BBB'];
  const KIDS = { kidA: { H: '#2a1a14', S: '#c89060', C: '#2ea88a', L: '#2a3a4a', B: '#141018' }, kidB: { H: '#2a1a14', S: '#e0b48c', C: '#e0a030', L: '#4a3a5a', B: '#141018' } };

  function palette(spec, turned) {
    const p = Object.assign({ E: '#1a1420', B: '#141018', L: '#2a2430', T: '#e8e8e8', R: '#2a2430', G: '#c8c8d0', Y: '#d8c060', A: '#ffd27a', W: '#7a4ea8', Z: '#3a3a44' }, spec);
    p.c = spec.c || shade(p.C || '#555', 0.28); p.s = shade(p.S || '#e0b48c', 0.18); p.k = shade(p.K || '#333', 0.32); p.w = shade(p.W, 0.25); p.y = shade(p.Y, 0.22); p.a = shade(p.A, 0.3);
    if (turned) for (const k in p) if (typeof p[k] === 'string' && p[k][0] === '#' && k !== 'E') p[k] = gray(p[k]);
    return p;
  }
  // rows for one frame: 'idle0', 'idle1', 'walk0'..'walk3'
  function rows(roleId, frame) {
    if (KIDS[roleId]) return KID;
    const r = ROLES[roleId] || ROLES.local, head = HEADS[r.head], body = BODIES[r.body], legs = legFrames(r.legs);
    let out;
    if (frame === 'idle1') out = [BLANK].concat(head, body.slice(0, 7), legs.idle);
    else if (frame && frame.startsWith('walk')) out = head.concat(body, legs.walk[+frame.slice(4) % 4]);
    else out = head.concat(body, legs.idle);
    if (r.extra) { out = out.slice(); for (const [x, y, c] of r.extra) { const row = out[y]; out[y] = row.slice(0, x) + c + row.slice(x + 1); } }
    return out;
  }
  const size = (roleId) => KIDS[roleId] ? { w: 8, h: 14 } : { w: 12, h: 22 };
  function drawSprite(g, roleId, x, y, frame, turned) {
    const sz = size(roleId), p = palette(KIDS[roleId] || ROLES[roleId] || ROLES.local, turned);
    g.px(Math.round(x - sz.w / 2), y - sz.h, rows(roleId, frame), p);
  }

  // ---- drawing helpers -------------------------------------------------
  function sky(g, top, bottom, night, t) {
    g.layer('sky');
    for (let y = 0; y < GROUND + 2; y++) { const k = y / GROUND; g.fill(mix(top, bottom, k * k * 0.4 + k * 0.6)); g.rect(X0, y, X1 - X0, 1); }
    if (night) { for (let i = 0; i < 48; i++) { const x = (i * 97 + 13) % W, y = (i * 53 + 7) % 64; g.star(x, y, i * 1.7, i % 9 === 0); } }
    else g.fx('clouds');
  }
  // A ridge line: a silhouette from layered sines, filled down to `base`.
  function ridge(g, col, base, top, amp, seed, step) {
    g.fill(col); step = step || 1;
    for (let x = X0; x < X1; x += step) { const h = top + amp * (0.5 + 0.28 * Math.sin((x + seed) / 23) + 0.16 * Math.sin((x * 1.7 + seed * 3) / 11) + 0.06 * Math.sin((x * 3.1 + seed) / 5)); g.rect(x, base - h, step, h); }
  }
  function box(g, x, y, w, h, col, light, dark) { g.fill(col); g.rect(x, y, w, h); g.fill(light || tint(col, 0.14)); g.rect(x, y, w, 1); g.rect(x, y, 1, h); g.fill(dark || shade(col, 0.25)); g.rect(x + w - 1, y, 1, h); g.rect(x, y + h - 1, w, 1); }
  function windowPane(g, x, y, w, h, lit, night, frame) {
    g.fill(frame || '#2a2130'); g.rect(x - 1, y - 1, w + 2, h + 2);
    const glass = lit ? (night ? '#ffd27a' : '#f2e2b0') : (night ? '#1e2238' : '#9ab4cc');
    g.fill(glass); g.rect(x, y, w, h);
    if (!night || !lit) { g.fill(tint(glass, 0.35)); g.rect(x, y, Math.max(1, w >> 2), h); }
    g.fill(frame || '#2a2130'); g.rect(x + (w >> 1), y, 1, h); g.rect(x, y + (h >> 1), w, 1);
    if (lit && night) g.glow(x + w / 2, y + h / 2, Math.max(w, h) * 1.15, '#ffd27a', 0.5, 0.04);
  }
  function lamp(g, x, night, h) {
    h = h || 30; g.fill('#3a3a42'); g.rect(x, GROUND - h, 1, h); g.rect(x - 1, GROUND - 2, 3, 2); g.rect(x - 3, GROUND - h - 1, 7, 1); g.fill('#5a5a62'); g.rect(x - 2, GROUND - h - 2, 5, 1);
    g.fill(night ? '#ffe4a0' : '#d8d0b0'); g.rect(x - 1, GROUND - h, 3, 2);
    g.glow(x + 0.5, GROUND - h + 1, 30, '#ffd27a', 1, 0.08);
  }
  function car(g, x, col, night, dir) {
    const y = GROUND; g.fill(shade(col, 0.15)); g.rect(x, y - 8, 28, 6); g.fill(col); g.rect(x + 1, y - 9, 26, 5); g.rect(x + 6, y - 14, 15, 5); g.fill(tint(col, 0.2)); g.rect(x + 6, y - 14, 15, 1);
    g.fill(night ? '#2a3048' : '#9ab8d0'); g.rect(x + 7, y - 13, 6, 4); g.rect(x + 14, y - 13, 6, 4);
    g.fill('#101014'); g.rect(x + 3, y - 3, 6, 3); g.rect(x + 19, y - 3, 6, 3); g.fill('#5a5a62'); g.rect(x + 5, y - 2, 2, 1); g.rect(x + 21, y - 2, 2, 1);
    const fx = dir < 0 ? x : x + 27; g.fill('#f2e8c0'); g.rect(fx, y - 8, 1, 2); g.fill('#c83a3a'); g.rect(dir < 0 ? x + 27 : x, y - 8, 1, 2);
    if (night) g.glow(fx + (dir < 0 ? -2 : 2), y - 7, 10, '#fff2c0', 0.55, 0);
  }
  function palm(g, x, h) {
    g.fill('#5a4030'); for (let i = 0; i < h; i++) g.rect(x + Math.round(Math.sin(i / 9) * 2), GROUND - i, 2, 1);
    const tx = x + Math.round(Math.sin(h / 9) * 2), ty = GROUND - h; g.fill('#2f5a32');
    for (const [dx, dy] of [[-9, 2], [-6, -1], [0, -3], [6, -1], [9, 2], [-11, 5], [11, 5]]) { g.rect(tx + Math.min(0, dx), ty + Math.min(0, dy) + 1, Math.abs(dx) + 1, 2); }
    g.fill('#3f7a42'); g.rect(tx - 7, ty, 15, 1);
  }
  function pine(g, x, h, col, snow) {
    g.fill('#3a2a20'); g.rect(x, GROUND - 3, 2, 3);
    for (let i = 0; i < h; i++) { const w = Math.round((h - i) * 0.45) + 1; g.fill(i % 4 === 0 ? shade(col, 0.2) : col); g.rect(x + 1 - w, GROUND - 3 - i, w * 2, 1); if (snow && i % 4 === 1) { g.fill('#eef3f8'); g.rect(x + 1 - w, GROUND - 3 - i, Math.max(1, w - 1), 1); } }
  }
  function sidewalk(g, top, curb, street, mark) {
    g.layer('near');
    g.fill(top); g.rect(X0, GROUND, X1 - X0, 6); g.fill(shade(top, 0.12)); for (let x = X0; x < X1; x += 9) g.rect(x, GROUND, 1, 6);
    g.fill(curb); g.rect(X0, GROUND + 6, X1 - X0, 2);
    g.fill(street); g.rect(X0, GROUND + 8, X1 - X0, H - GROUND - 8);
    g.fill(shade(street, 0.12)); for (let x = X0; x < X1; x += 7) g.rect(x + ((x * 13) % 5), GROUND + 12 + ((x * 7) % 9), 3, 1);
    if (mark) { g.fill(mark); for (let x = X0; x < X1; x += 22) g.rect(x, GROUND + 26, 12, 2); }
  }

  // ---- scenes ------------------------------------------------------------
  // Positions of the player and each ally, in scene pixels; people stand on GROUND.
  const PLAYER_X = { residence: 112, road: 132, colonia: 92, salta: 112, border: 116, airfield: 102 };

  const SCENES = {
    residence(g, s, t, night) {
      sky(g, night ? '#0a0c22' : '#6f9ad0', night ? '#2a1e44' : '#f0c8a0', night, t);
      // far: the capital's skyline and a TV mast
      g.layer('far');
      const sk = night ? '#1c1a34' : '#8a94b8';
      for (let x = X0, i = 0; x < X1; i++) { const w = 10 + (i * 7) % 12, h = 18 + (i * 13) % 30; g.fill(i % 3 ? sk : shade(sk, 0.08)); g.rect(x, GROUND - 22 - h, w, h + 22); if (night) { g.fill('#e8c87a'); for (let wy = GROUND - 20 - h; wy < GROUND - 24; wy += 4) for (let wx = x + 2; wx < x + w - 1; wx += 3) if (((wx * 31 + wy * 17 + i) % 7) === 0) g.rect(wx, wy, 1, 1); } x += w + 1; }
      g.fill(night ? '#24203c' : '#7a84a8'); g.rect(268, GROUND - 82, 2, 60); g.rect(265, GROUND - 60, 8, 3);
      g.fx('beacon', { x: 269, y: GROUND - 83, col: '#ff4d4d', period: 1800 });
      // mid: the residence, its garden wall and the kitchen wing
      g.layer('mid');
      g.fill(night ? '#2a2638' : '#a8a0a0'); g.rect(X0, GROUND - 16, X1 - X0, 16); // garden wall
      g.fill(night ? '#353046' : '#bab2b0'); g.rect(X0, GROUND - 17, X1 - X0, 2);
      const wall = night ? '#3c3448' : '#d8c8b0';
      box(g, 46, GROUND - 66, 128, 66, wall);
      g.fill(night ? '#2a1e2c' : '#8a3a2a'); for (let i = 0; i < 12; i++) g.rect(40 + i, GROUND - 66 - i, 140 - i * 2, 1); // tiled roof
      g.fill(night ? '#3a2834' : '#a84a34'); for (let i = 0; i < 12; i += 3) g.rect(41 + i, GROUND - 67 - i, 138 - i * 2, 1);
      g.fill(night ? '#2c2434' : '#c0ae98'); g.rect(46, GROUND - 36, 128, 2); // floor band
      for (let i = 0; i < 5; i++) { const wx = 54 + i * 24; if (i === 2) continue; windowPane(g, wx, GROUND - 60, 10, 16, night, night); windowPane(g, wx, GROUND - 30, 10, 16, night && i !== 4, night); g.fill(night ? '#2a3a2a' : '#4a6a4a'); g.rect(wx - 4, GROUND - 60, 3, 16); g.rect(wx + 11, GROUND - 60, 3, 16); }
      windowPane(g, 102, GROUND - 60, 16, 16, night, night);
      g.fill('#4a3428'); g.rect(102, GROUND - 28, 16, 28); g.fill('#5c4232'); g.rect(103, GROUND - 27, 6, 26); g.rect(111, GROUND - 27, 6, 26); g.fill('#d8b060'); g.rect(108, GROUND - 14, 1, 2); g.rect(111, GROUND - 14, 1, 2); // door
      g.fill(night ? '#4a4050' : '#c8bca8'); g.rect(98, GROUND - 3, 24, 3); g.rect(100, GROUND - 5, 20, 2); // steps
      g.fill('#e8d090'); g.rect(109, GROUND - 32, 2, 2); g.glow(110, GROUND - 31, 12, '#ffd27a', night ? 0.8 : 0.3, 0.05);
      box(g, 192, GROUND - 36, 52, 36, night ? '#3a3038' : '#c8a878'); g.fill(night ? '#2a2028' : '#8a5a3a'); g.rect(188, GROUND - 40, 60, 4);
      windowPane(g, 200, GROUND - 28, 9, 9, night, night); g.fill('#3a2a24'); g.rect(222, GROUND - 22, 10, 22); g.fill(night ? '#ffd27a' : '#6a5040'); g.rect(224, GROUND - 20, 6, 4); // service door with a lit pane
      if (night) g.glow(227, GROUND - 18, 8, '#ffd27a', 0.6, 0.1);
      palm(g, 22, 52); palm(g, 182, 44);
      // near: street furniture and the watch
      sidewalk(g, night ? '#3a3844' : '#b0aaa4', night ? '#55525e' : '#d8d2c8', night ? '#1e1c26' : '#4a4652', night ? '#8a7a40' : '#e8d070');
      lamp(g, 40, night, 34); lamp(g, 296, night, 34);
      g.fill(night ? '#2e2c36' : '#6a6872'); for (let x = 128; x < 188; x += 5) g.rect(x, GROUND - 13, 1, 13); g.rect(128, GROUND - 13, 60, 1); // service lane gate
      car(g, 4, '#6a2d2d', night, 1); car(g, 238, '#24304a', night, -1); car(g, 272, '#24304a', night, -1);
      if (night) g.glow(250, GROUND - 11, 4, '#ff9a6a', 0.6, 0.35); // a cigarette in the watch car
      g.figure('watch', 268, {}); g.figure('police', 306, {});
      g.ally('nando', 36, 'nando'); g.ally('aide', 146, 'aide');
      if (night) g.fx('moths', { lamps: [[40, GROUND - 34], [296, GROUND - 34]] });
    },
    road(g, s, t, night) {
      sky(g, night ? '#0a0c22' : '#86b0dc', night ? '#2a1e44' : '#f2dcb0', night, t);
      g.layer('far');
      ridge(g, night ? '#1a2034' : '#7a9ab0', GROUND - 18, 18, 22, 7); ridge(g, night ? '#202a3a' : '#5f8a74', GROUND - 18, 8, 14, 41);
      g.fill(night ? '#2a2e40' : '#e8e0d0'); g.rect(250, GROUND - 52, 8, 16); g.fill(night ? '#2a2030' : '#b05030'); g.triangle(248, GROUND - 52, 260, GROUND - 52, 254, GROUND - 60); // distant chapel
      g.layer('mid');
      g.fill(night ? '#14203a' : '#2f5a7a'); g.rect(X0, GROUND - 18, X1 - X0, 18); g.fill(night ? '#20304c' : '#4a7a9a'); for (let x = X0; x < X1; x += 9) g.rect(x, GROUND - 13 + (x % 3), 5, 1); // the river
      g.fx('glints', { x0: 0, x1: W, y0: GROUND - 17, y1: GROUND - 2, col: night ? '#8fa8d8' : '#e8f2ff', rate: 8 });
      g.fill(night ? '#4a4a56' : '#8a8a92'); g.rect(118, GROUND - 26, 120, 6); g.fill(night ? '#5a5a66' : '#a8a8b0'); g.rect(118, GROUND - 27, 120, 1); for (let x = 124; x < 238; x += 14) { g.fill(night ? '#3a3a46' : '#6a6a72'); g.rect(x, GROUND - 20, 3, 20); } // bridge
      box(g, 6, GROUND - 52, 70, 52, night ? '#3a3040' : '#d8b890'); g.fill(night ? '#2a2030' : '#8a4a3a'); g.rect(2, GROUND - 56, 78, 4); g.rect(30, GROUND - 66, 22, 10); g.fill(night ? '#e8d8a0' : '#f0ead8'); g.rect(37, GROUND - 64, 8, 8); g.fill('#2a2030'); g.rect(41, GROUND - 63, 1, 4); g.rect(41, GROUND - 60, 3, 1); // town hall and its clock
      for (let i = 0; i < 3; i++) windowPane(g, 14 + i * 20, GROUND - 42, 8, 12, night, night);
      g.fill('#3a2a24'); g.rect(34, GROUND - 22, 14, 22);
      box(g, 250, GROUND - 38, 36, 38, night ? '#3a3a46' : '#9aa0a8'); g.fill(night ? '#2a2a36' : '#5a6068'); g.rect(246, GROUND - 42, 44, 4); windowPane(g, 258, GROUND - 30, 12, 8, true, night); g.glow(264, GROUND - 26, 14, '#ffd27a', 0.7, 0.03); // the police post
      g.fill('#e8e8e8'); g.rect(252, GROUND - 36, 30, 3); g.fill('#3b5d8f'); g.rect(254, GROUND - 35, 26, 1);
      g.layer('near');
      g.fill(night ? '#24222c' : '#4a4652'); g.rect(X0, GROUND, X1 - X0, H - GROUND); g.fill(night ? '#8a7a40' : '#e8d8a0'); for (let x = X0; x < X1; x += 16) g.rect(x, GROUND + 14, 8, 2); g.fill(night ? '#2c2a34' : '#5a5662'); g.rect(X0, GROUND, X1 - X0, 3);
      g.fill('#555'); g.rect(290, GROUND - 18, 2, 18); for (let i = 0; i < 26; i += 4) { g.fill(i % 8 ? '#e8e8e8' : '#c83a3a'); g.rect(292 + i, GROUND - 17, 4, 2); } // barrier
      g.fill(night ? '#2a3a2a' : '#5a7a3a'); for (let x = X0; x < 110; x += 3) g.rect(x, GROUND - 4 - ((x * 7) % 5), 1, 4 + ((x * 7) % 5)); // reeds
      car(g, 176, '#c8c84a', night, -1); car(g, 70, '#6a2d2d', night, 1);
      g.ally('nando', 104, 'nando');
      g.figure('clerk', 58, {}); g.figure('police', 300, {});
    },
    colonia(g, s, t, night) {
      sky(g, night ? '#0a0c22' : '#8ab2dc', night ? '#2a1e44' : '#f0d6a8', night, t);
      g.layer('far');
      ridge(g, night ? '#1a2234' : '#8aa6b8', GROUND - 20, 16, 24, 3); ridge(g, night ? '#1c2a26' : '#5f8a52', GROUND - 14, 10, 12, 29);
      g.fill(night ? '#22301e' : '#4a7a3a'); for (let r = 0; r < 4; r++) for (let x = X0; x < X1; x += 8) g.rect(x + r * 4, GROUND - 24 + r * 4, 5, 2); // vineyard rows
      g.layer('mid');
      // the church
      box(g, 240, GROUND - 54, 44, 54, night ? '#4a4652' : '#ece4d4'); g.fill(night ? '#3a2830' : '#b0503a'); g.triangle(236, GROUND - 54, 288, GROUND - 54, 262, GROUND - 70);
      box(g, 256, GROUND - 80, 12, 26, night ? '#4a4652' : '#ece4d4'); g.fill(night ? '#3a2830' : '#b0503a'); g.triangle(254, GROUND - 80, 270, GROUND - 80, 262, GROUND - 89);
      g.fill(night ? '#2a2030' : '#5a4a40'); g.rect(260, GROUND - 74, 4, 6); g.fill(night ? '#d8c060' : '#c8a840'); g.rect(261, GROUND - 71, 2, 2); // the bell
      g.fill('#4a3428'); g.rect(256, GROUND - 22, 12, 22); windowPane(g, 246, GROUND - 40, 6, 12, night, night); windowPane(g, 272, GROUND - 40, 6, 12, night, night);
      // the farmhouse and veranda
      box(g, 54, GROUND - 42, 90, 42, night ? '#4a3a34' : '#d8b080'); g.fill(night ? '#3a2420' : '#9a4a30'); for (let i = 0; i < 8; i++) g.rect(48 + i, GROUND - 42 - i, 102 - i * 2, 1);
      windowPane(g, 66, GROUND - 32, 12, 12, true, night); windowPane(g, 120, GROUND - 32, 12, 12, true, night);
      g.fill('#4a3020'); g.rect(94, GROUND - 24, 14, 24); g.fill(night ? '#ffcf70' : '#6a4a30'); g.rect(96, GROUND - 22, 10, 6);
      g.fill(night ? '#3a2820' : '#6a4a30'); g.rect(48, GROUND - 14, 102, 2); for (let x = 50; x < 150; x += 16) g.rect(x, GROUND - 12, 2, 12); // veranda rail
      g.fill('#8a6a3a'); g.rect(36, GROUND - 7, 7, 7); g.fill('#6a5030'); g.rect(36, GROUND - 7, 7, 1); // a mate gourd on the step
      g.layer('near');
      g.fill(night ? '#3a2e24' : '#7a5e40'); g.rect(X0, GROUND, X1 - X0, H - GROUND); g.fill(night ? '#2e241c' : '#6a4e34'); for (let x = X0; x < X1; x += 6) g.rect(x + ((x * 13) % 4), GROUND + 3 + ((x * 7) % 12), 3, 1);
      g.fill(night ? '#4a4a3a' : '#7a7a5a'); g.rect(160, GROUND - 16, 46, 12); g.fill(night ? '#3a3a2a' : '#5a5a3a'); g.rect(162, GROUND - 14, 30, 8); g.rect(194, GROUND - 22, 12, 8); g.fill(night ? '#2a3048' : '#9ab8d0'); g.rect(196, GROUND - 20, 8, 4); g.fill('#101014'); g.rect(166, GROUND - 4, 6, 4); g.rect(194, GROUND - 4, 6, 4); // the grape truck
      g.fill('#6a4a2a'); for (const cx of [214, 224]) { g.rect(cx, GROUND - 8, 8, 8); g.fill('#5a2a5a'); g.rect(cx + 1, GROUND - 9, 6, 2); g.fill('#6a4a2a'); } // grape crates
      g.fill(night ? '#3a2a20' : '#6a4a30'); for (let x = X0; x < 40; x += 10) g.rect(x, GROUND - 14, 2, 14);
      g.ally('host', 120, 'host');
      g.fx(night ? 'fireflies' : 'pollen', { y0: GROUND - 46, y1: GROUND - 4 });
    },
    salta(g, s, t, night) {
      sky(g, '#080a1e', '#261a3e', true, t);
      g.layer('far');
      ridge(g, '#141228', GROUND - 26, 22, 30, 11); ridge(g, '#1a1830', GROUND - 20, 10, 16, 57);
      g.fill('#e8c87a'); for (let i = 0; i < 26; i++) g.rect((i * 53) % W, GROUND - 24 - ((i * 7) % 8), 1, 1); // town lights on the slope
      g.layer('mid');
      box(g, 26, GROUND - 40, 58, 40, '#3a3444'); g.fill('#2a2434'); g.rect(22, GROUND - 44, 66, 4); windowPane(g, 34, GROUND - 32, 14, 14, true, true); windowPane(g, 60, GROUND - 32, 14, 14, true, true); // the station
      g.fill('#e8e0c0'); g.rect(40, GROUND - 42, 30, 3); g.fill('#3a3444'); for (let i = 0; i < 6; i++) g.rect(43 + i * 5, GROUND - 41, 2, 1);
      g.fill('#4a4250'); g.rect(98, GROUND - 58, 4, 58); g.rect(118, GROUND - 58, 4, 58); box(g, 94, GROUND - 74, 32, 18, '#5a4a40'); g.fill('#4a3a30'); g.rect(94, GROUND - 70, 32, 1); g.rect(94, GROUND - 64, 32, 1); // water tower
      // the freight and its engine
      const cars = [[150, '#6a2d2d'], [200, '#5a3a2a']];
      for (const [cx, col] of cars) { box(g, cx, GROUND - 32, 46, 26, col); g.fill(shade(col, 0.3)); for (let x = cx + 4; x < cx + 44; x += 6) g.rect(x, GROUND - 30, 1, 22); g.fill('#2a2a2a'); g.rect(cx + 16, GROUND - 28, 14, 20); g.fill('#1a1a1a'); g.rect(cx + 4, GROUND - 6, 7, 6); g.rect(cx + 35, GROUND - 6, 7, 6); }
      g.fill('#e8e8e8'); g.rect(212, GROUND - 26, 3, 3); // Holt's chalk mark
      // the locomotive, facing the passes
      box(g, 250, GROUND - 28, 52, 20, '#2a2e36'); box(g, 250, GROUND - 40, 20, 14, '#343842'); g.fill('#ffd27a'); g.rect(254, GROUND - 37, 6, 5); g.rect(262, GROUND - 37, 5, 5);
      g.fill('#1e2228'); g.rect(286, GROUND - 40, 6, 12); g.rect(284, GROUND - 42, 10, 2); g.fill('#8a2a2a'); g.rect(250, GROUND - 12, 54, 2);
      g.fill('#111'); for (const wx of [256, 270, 284, 296]) { g.ellipse(wx, GROUND - 4, 9, 9); } g.fill('#4a4a52'); for (const wx of [256, 270, 284, 296]) g.rect(wx - 1, GROUND - 5, 2, 2);
      g.fill('#fff6d8'); g.rect(302, GROUND - 22, 2, 3); g.glow(305, GROUND - 21, 14, '#fff6d8', 0.8, 0);
      g.glow(258, GROUND - 35, 10, '#ffd27a', 0.6, 0.05);
      g.fx('steam', { x: 289, y: GROUND - 44 });
      g.layer('near');
      g.fill('#24222c'); g.rect(X0, GROUND, X1 - X0, H - GROUND); g.fill('#5a5a5a'); g.rect(X0, GROUND - 3, X1 - X0, 1); g.rect(X0, GROUND - 1, X1 - X0, 1); g.fill('#3a2a20'); for (let x = X0; x < X1; x += 5) g.rect(x, GROUND - 4, 2, 4);
      g.fill('#2e2c36'); for (let x = X0; x < X1; x += 8) g.rect(x + ((x * 13) % 5), GROUND + 6 + ((x * 7) % 14), 3, 1);
      lamp(g, 136, true, 36);
      g.fill('#2a2a32'); g.rect(10, GROUND - 30, 2, 30); g.rect(7, GROUND - 34, 8, 6); g.fx('beacon', { x: 9, y: GROUND - 32, col: '#ff4d4d', period: 2200 }); g.fx('beacon', { x: 13, y: GROUND - 32, col: '#5cff8a', period: 2200, offset: 1100 }); // a signal
      g.fill('#6a4a2a'); g.rect(286, GROUND - 10, 12, 10); g.rect(298, GROUND - 7, 8, 7);
      g.ally('theo', 142, 'theo'); g.ally('holt', 176, 'holt');
      g.glow(181, GROUND - 7, 8, '#ffcf70', 0.75, 0.15); // Holt's lantern
    },
    border(g, s, t, night) {
      sky(g, night ? '#0a0c22' : '#9ab4d4', night ? '#2a1e44' : '#e4e8f0', night, t);
      g.layer('far');
      const peak = (x0, w, h, col, snow) => { for (let i = 0; i < w; i++) { const d = Math.abs(i - w / 2) / (w / 2), hh = Math.round(h * (1 - d) + Math.sin(i / 3) * 2); g.fill(col); g.rect(x0 + i, GROUND - 20 - hh, 1, hh + 20); if (hh > h * 0.55) { g.fill(snow); g.rect(x0 + i, GROUND - 20 - hh, 1, Math.round((hh - h * 0.55) * 0.8) + 1); } } };
      peak(-20, 140, 70, night ? '#2a3044' : '#8a96b0', night ? '#8a90a8' : '#f4f6fa'); peak(110, 150, 58, night ? '#242a3c' : '#7a88a4', night ? '#7a8098' : '#eef2f8'); peak(230, 120, 74, night ? '#2a3044' : '#8a96b0', night ? '#8a90a8' : '#f4f6fa');
      g.layer('mid');
      g.fill(night ? '#c8d0e0' : '#f2f5fa'); g.rect(X0, GROUND - 6, X1 - X0, 6);
      for (const [px, ph] of [[8, 26], [22, 32], [296, 30], [312, 24]]) pine(g, px, ph, night ? '#1e3a2e' : '#2f5a42', true);
      box(g, 52, GROUND - 34, 48, 34, night ? '#4a4652' : '#8a8a92'); g.fill(night ? '#e8eef8' : '#ffffff'); g.rect(48, GROUND - 38, 56, 4); windowPane(g, 60, GROUND - 26, 12, 9, true, night); g.glow(66, GROUND - 22, 14, '#ffd27a', 0.7, 0.03); // the Valdórian post
      g.fill('#3a3a3a'); g.rect(92, GROUND - 48, 4, 14); g.fx('steam', { x: 94, y: GROUND - 50, col: '#cfd4dc', rate: 1.2 });
      g.fill('#333'); g.rect(104, GROUND - 8, 8, 8); g.fill('#ff8a2a'); g.rect(106, GROUND - 6, 4, 3); g.glow(108, GROUND - 5, 12, '#ff8a2a', 0.9, 0.3); // the stove
      g.fill('#c83a3a'); g.rect(182, GROUND - 46, 2, 46); g.fill('#5cd65c'); g.rect(186, GROUND - 46, 2, 46); // the line
      g.fill(night ? '#c83a3a' : '#d84a4a'); g.rect(170, GROUND - 46, 10, 6); g.fill(night ? '#3a8a4a' : '#4aa85a'); g.rect(190, GROUND - 46, 10, 6); // two flags
      box(g, 244, GROUND - 32, 44, 32, night ? '#2e4034' : '#4a6a52'); g.fill(night ? '#e8eef8' : '#ffffff'); g.rect(240, GROUND - 36, 52, 4); windowPane(g, 252, GROUND - 24, 10, 8, true, night); g.glow(257, GROUND - 20, 12, '#ffe28a', 0.7, 0.03); // the Costamaran hut
      g.layer('near');
      g.fill(night ? '#d8deea' : '#f4f7fb'); g.rect(X0, GROUND, X1 - X0, H - GROUND); g.fill(night ? '#b8c0d0' : '#dde3ea'); for (let x = X0; x < X1; x += 7) g.rect(x, GROUND + 3 + ((x * 3) % 9), 4, 1);
      g.fill(night ? '#9aa4b8' : '#c8d0dc'); g.rect(X0, GROUND + 18, X1 - X0, 6); // the road through the snow
      g.fill('#555'); g.rect(150, GROUND - 18, 3, 18); for (let i = 0; i < 28; i += 4) { g.fill(i % 8 ? '#e8e8e8' : '#c83a3a'); g.rect(153 + i, GROUND - 17, 4, 2); } // the barrier
      g.fill(night ? '#e8eef8' : '#ffffff'); for (const [bx, bw] of [[X0, 30], [120, 18], [214, 22], [300, 30]]) { g.ellipse(bx + bw / 2, GROUND, bw, 8); }
      g.figure('guard', 144, {}); g.figure('guard', 168, {});
      if (s.arr.reception.stage >= 3) g.ally('official', 232, 'official'); else g.figure('esmguard', 232, {});
      g.fx('snow');
    },
    airfield(g, s, t, night) {
      sky(g, night ? '#0a0c22' : '#8090b0', night ? '#2a1e44' : '#d8c8c0', night, t);
      g.layer('far');
      g.fill(night ? '#1a2238' : '#4a6080'); g.rect(X0, GROUND - 30, X1 - X0, 30); g.fill(night ? '#24304a' : '#6a82a0'); for (let x = X0; x < X1; x += 11) g.rect(x, GROUND - 24 + (x % 5), 6, 1); // the sea
      g.fx('glints', { x0: 0, x1: W, y0: GROUND - 29, y1: GROUND - 10, col: night ? '#9fb0d0' : '#f0f6ff', rate: 9 });
      g.fill(night ? '#20283e' : '#7a8aa4'); for (let x = 180, i = 0; x < 320; i++) { const w = 6 + (i * 5) % 8, h = 6 + (i * 11) % 14; g.rect(x, GROUND - 30 - h, w, h); x += w + 1; } // Portalba across the bay
      if (night) { g.fill('#e8c87a'); for (let i = 0; i < 24; i++) g.rect(182 + (i * 37) % 136, GROUND - 32 - (i * 7) % 12, 1, 1); }
      g.layer('mid');
      box(g, 12, GROUND - 66, 16, 66, night ? '#3a3a44' : '#9aa0a8'); box(g, 4, GROUND - 78, 32, 14, night ? '#4a4a56' : '#b8bec6'); g.fill(night ? '#ffd27a' : '#c8e0f0'); g.rect(7, GROUND - 75, 26, 7); g.glow(20, GROUND - 71, 18, '#ffd27a', 0.8, 0.02); // the tower
      g.fx('beacon', { x: 20, y: GROUND - 80, col: '#ff4d4d', period: 1400 });
      g.fill(night ? '#3a3e4a' : '#a8adb5'); g.rect(40, GROUND - 36, 70, 36); g.fill(night ? '#4a4e5a' : '#c0c4cc'); for (let i = 0; i < 10; i++) g.rect(40 + i, GROUND - 36 - Math.round(Math.sin((i / 10) * Math.PI / 2) * 10), 70 - i * 2, 1); // hangar roof
      g.fill(night ? '#1a1c24' : '#4a4e58'); g.rect(52, GROUND - 26, 46, 26); g.fill(night ? '#2a2e38' : '#6a6e78'); for (let x = 54; x < 98; x += 6) g.rect(x, GROUND - 26, 1, 26);
      const st = s.arr.aircraft.stage;
      if (st >= 1) {
        const jx = st >= 4 ? 170 : st >= 3 ? 212 : 248, y = GROUND;
        g.fill('#d8d8e4'); g.rect(jx, y - 20, 96, 12); g.fill('#ecebf4'); g.rect(jx, y - 21, 96, 6); g.triangle(jx + 96, y - 21, jx + 96, y - 9, jx + 116, y - 14); g.fill('#2b3450'); g.rect(jx + 108, y - 18, 6, 2); // fuselage and cockpit
        g.fill('#ecebf4'); g.rect(jx + 4, y - 38, 9, 18); g.triangle(jx + 4, y - 38, jx + 13, y - 38, jx + 13, y - 44); g.fill('#2b3450'); g.rect(jx + 5, y - 34, 7, 3); // tail
        g.fill('#c8c8d4'); g.rect(jx + 40, y - 12, 30, 3); g.fill('#9a9aa8'); g.rect(jx + 14, y - 24, 16, 6); // wing and engine
        g.fill('#2b3450'); g.rect(jx + 24, y - 18, 60, 2); g.fill(night ? '#ffd27a' : '#9ab8d0'); for (let i = 0; i < 8; i++) g.rect(jx + 30 + i * 8, y - 18, 4, 3);
        g.fill('#111'); g.rect(jx + 20, y - 5, 4, 5); g.rect(jx + 80, y - 5, 4, 5);
        if (st >= 4) { g.fill('#b8b8c4'); for (let i = 0; i < 8; i++) g.rect(jx + 70 + i * 2, y - 8 + i, 3, 1); g.fx('beacon', { x: jx + 8, y: y - 44, col: '#ff5a5a', period: 1100 }); g.fx('beacon', { x: jx + 115, y: y - 14, col: '#7dffb0', period: 1100, offset: 550 }); }
        if (st >= 3) { g.fill('#c8b040'); g.rect(jx - 34, y - 12, 26, 10); g.fill('#a89030'); g.rect(jx - 34, y - 16, 10, 4); g.fill('#111'); g.rect(jx - 30, y - 3, 5, 3); g.rect(jx - 16, y - 3, 5, 3); } // fuel truck
      }
      g.layer('near');
      g.fill(night ? '#26262e' : '#4a4a54'); g.rect(X0, GROUND, X1 - X0, H - GROUND); g.fill(night ? '#8a7a40' : '#e8d070'); for (let x = X0; x < X1; x += 24) g.rect(x, GROUND + 22, 12, 2);
      g.fill(night ? '#ffcf6a' : '#c8b060'); for (let x = 2; x < W; x += 18) g.rect(x, GROUND + 3, 2, 1);
      g.fill('#5a5a62'); g.rect(300, GROUND - 24, 1, 24); g.fill('#e8762a'); g.rect(301, GROUND - 24, 10, 3); g.fill('#ececec'); g.rect(303, GROUND - 24, 2, 3); g.rect(307, GROUND - 24, 2, 3); // windsock
      g.ally('pilot', 126, 'pilot');
    },
  };

  // ---- the runway family photo ---------------------------------------------
  function runway(g) {
    const G = GROUND; sky(g, '#2c1e58', '#ffa868', false, 0);
    g.layer('far');
    g.fill('#ffd27a'); g.ellipse(236, G - 28, 28, 28); g.fill('rgba(255,210,122,0.18)'); g.ellipse(236, G - 28, 64, 64);
    g.fill('#3a2f66'); g.rect(X0, G - 22, X1 - X0, 22); g.fill('#5a4a8a'); for (let x = X0; x < X1; x += 11) g.rect(x, G - 16 + (x % 4), 6, 1);
    g.fill('#ffcf8a'); for (let x = 210; x < 262; x += 3) g.rect(x + ((x * 7) % 3), G - 20 + ((x * 5) % 6), 2, 1); // the sun on the water
    g.layer('mid');
    box(g, 10, G - 66, 16, 66, '#4a4458'); box(g, 2, G - 78, 32, 14, '#5a5470'); g.fill('#ffd27a'); g.rect(5, G - 75, 26, 7);
    const jx = 150, y = G;
    g.fill('#d8d8e4'); g.rect(jx, y - 20, 96, 12); g.fill('#ecebf4'); g.rect(jx, y - 21, 96, 6); g.triangle(jx + 96, y - 21, jx + 96, y - 9, jx + 116, y - 14); g.fill('#2b3450'); g.rect(jx + 108, y - 18, 6, 2);
    g.fill('#ecebf4'); g.rect(jx + 4, y - 38, 9, 18); g.triangle(jx + 4, y - 38, jx + 13, y - 38, jx + 13, y - 44); g.fill('#2b3450'); g.rect(jx + 5, y - 34, 7, 3);
    g.fill('#c8c8d4'); g.rect(jx + 40, y - 12, 30, 3); g.fill('#9a9aa8'); g.rect(jx + 14, y - 24, 16, 6);
    g.fill('#2b3450'); g.rect(jx + 24, y - 18, 60, 2); g.fill('#ffd27a'); for (let i = 0; i < 8; i++) g.rect(jx + 30 + i * 8, y - 18, 4, 3);
    g.fill('#111'); g.rect(jx + 20, y - 5, 4, 5); g.rect(jx + 80, y - 5, 4, 5); g.fill('#b8b8c4'); for (let i = 0; i < 8; i++) g.rect(jx + 70 + i * 2, y - 8 + i, 3, 1);
    g.layer('near');
    g.fill('#34323e'); g.rect(X0, G, X1 - X0, H - G); g.fill('#ffd27a'); for (let x = X0; x < X1; x += 24) g.rect(x, G + 22, 12, 2); g.fill('#ffcf6a'); for (let x = 2; x < W; x += 18) g.rect(x, G + 3, 2, 1);
    g.fill('rgba(0,0,0,0.25)'); g.rect(48, G, 100, 2);
    for (const [id, x] of [['famDad', 58], ['kidA', 72], ['famMum', 84], ['famUncle', 100], ['kidB', 113], ['famGran', 126]]) g.figure(id, x, {});
    g.fill('#8a6a3a'); g.rect(136, G - 7, 8, 7); g.fill('#6a4a2a'); g.rect(139, G - 8, 2, 1); g.fill('#3a5a8a'); g.rect(42, G - 5, 6, 5);
    g.figure('pilot', 232, {});
  }

  return { W, H, GROUND, X0, X1, ROLES, KIDS, SCENES, PLAYER_X, rows, size, palette, drawSprite, runway, shade, tint, gray };
})();
if (typeof module !== 'undefined') module.exports = Art;
