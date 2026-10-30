/* Runway family photo for the start screen. Reference code from the design pass.
   Drawn on a 320x180 buffer with GROUND = 144, using render.js helpers:
   sky, ground, person and px (with the PERSON sprite). The output is
   docs/design-assets/runway-still.png. The phone start screen crops x 58 to 142
   (the family). The desktop start screen crops x 48 to 256, y 64 to 180
   (the family and the jet). Move this into render.js as a title still. */
function runwayStill(g, R) {
  const W = 320, G = 144; // ground line
  g.noStroke();
  R.sky(g, 0, false, [44, 30, 88], [255, 168, 104]); // dusk
  g.fill('#ffd27a'); g.ellipse(232, G - 26, 26, 26); // sun
  g.fill('rgba(255,210,122,0.18)'); g.ellipse(232, G - 26, 60, 60);
  g.fill('#3a2f66'); g.rect(0, G - 20, W, 20); // sea
  g.fill('#5a4a8a'); for (let x = 0; x < W; x += 11) g.rect(x, G - 14 + (x % 4), 6, 1);
  g.fill('#4a4458'); g.rect(12, G - 62, 14, 62); // tower
  g.fill('#6a6478'); g.rect(6, G - 68, 26, 10);
  g.fill('#ffd27a'); g.rect(10, G - 66, 18, 6);
  R.ground(g, '#34323e', '#403e4a'); // runway
  g.fill('#ffd27a'); for (let x = 0; x < W; x += 22) g.rect(x, G + 18, 11, 2); // centerline
  for (let x = 4; x < W; x += 16) { g.fill('#ffcf6a'); g.rect(x, G + 3, 1, 1); } // edge lights

  const jx = 146; // the jet
  g.fill('#ecebf4'); g.rect(jx, G - 18, 82, 12);
  g.triangle(jx + 82, G - 18, jx + 82, G - 6, jx + 98, G - 12);
  g.rect(jx + 6, G - 32, 7, 14); g.triangle(jx + 6, G - 32, jx + 13, G - 32, jx + 13, G - 38);
  g.fill('#2b3450'); g.rect(jx + 24, G - 15, 42, 3);
  g.fill('#9ad'); for (let i = 0; i < 6; i++) g.rect(jx + 26 + i * 7, G - 14, 3, 2);
  g.fill('#555'); g.rect(jx + 34, G - 10, 16, 5);
  g.fill('#111'); g.rect(jx + 14, G - 5, 4, 5); g.rect(jx + 60, G - 5, 4, 5);
  g.fill('#2a2833'); g.rect(jx + 70, G - 6, 3, 6);
  g.fill('#b8b8c4'); for (let i = 0; i < 6; i++) g.rect(jx + 64 + i * 2, G - 6 + i, 3, 1); // stairs

  const KID = ['.HHH.', '.SSS.', '.SSS.', 'CCCCC', 'C.C.C', '.CCC.', '.L.L.', '.B.B.'];
  const kid = (x, coat, hair, skin) => R.px(g, x - 2, G - 8, KID, { H: hair, S: skin, C: coat, L: '#2a2430', B: '#111' });
  g.fill('rgba(0,0,0,0.25)'); g.rect(62, G, 80, 2); // shadow under the family
  R.person(g, 72, G, '#2b3450', '#1b1b22', '#d8a070');
  kid(82, '#2ea88a', '#2a1a14', '#c89060');
  R.person(g, 92, G, '#8a2d3d', '#2a1a14', '#e0b48c');
  R.person(g, 102, G, '#4a5a3a', '#3a2a1a', '#c89060');
  kid(111, '#e0a030', '#2a1a14', '#e0b48c');
  R.person(g, 121, G, '#7a4ea8', '#dddde4', '#d8a070');
  g.fill('#8a6a3a'); g.rect(129, G - 5, 6, 5); g.fill('#6a4a2a'); g.rect(131, G - 6, 2, 1); // suitcase
  g.fill('#3a5a8a'); g.rect(60, G - 4, 5, 4); // bag
  R.person(g, 220, G, '#2b3450', '#1b2a45', '#d8a070'); // pilot at the stairs
}
