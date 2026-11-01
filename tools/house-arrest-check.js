#!/usr/bin/env node
/* Climbing out of house arrest must not put the player straight back under house arrest.
   Run: node tools/house-arrest-check.js */
'use strict';
const path = require('path');
global.Data = require(path.join(__dirname, '..', 'src', 'data.js'));
const Sim = require(path.join(__dirname, '..', 'src', 'sim.js'));
let bad = 0, n = 0;
for (let seed = 1; seed <= 40; seed++) for (const who of ['woman', 'man']) {
  const s = Sim.newRun(seed, who); s.pos = 2; s.hour = 30; s.nextEventAt = 999; s.lastEnemy = 30;
  s.hold = 2; s.exposure = 4; s.event = { kind: 'hold', rung: 3 }; s.hold = 3; s.holds = 3; s.lastHoldAt = 30;
  s._dice = [6, 1, 1, 1, 1, 1, 1, 1];
  const r = Sim.commit(s, 'evt:climb'); if (!r.ok) { console.log('climb refused:', r.why); process.exit(1); }
  n += 1; const after = s.event && s.event.kind === 'hold' ? s.event.rung : 0;
  // pass a few quiet hours; a fresh house arrest within them means the climb bought nothing
  let rearrest = after === 3; for (let h = 0; h < 3 && !rearrest && !s.over; h++) { Sim.commit(s, 'wait'); if (s.event && s.event.kind === 'hold' && s.event.rung === 3) rearrest = true; }
  if (rearrest) bad += 1;
}
console.log(`house arrest climb: ${n} escapes tried, ${bad} put straight back under house arrest`);
process.exit(bad ? 1 : 0);
