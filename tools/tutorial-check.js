#!/usr/bin/env node
/* Replays the demo's path against the real Sim with the scripted die and inquiry,
   and asserts every act-step's done() test passes in order. Run after any change
   to src/sim.js, src/data.js or src/tutorial.js:  node tools/tutorial-check.js */
'use strict';
const path = require('path');
global.Data = require(path.join(__dirname, '..', 'src', 'data.js'));
const Sim = require(path.join(__dirname, '..', 'src', 'sim.js'));
const Tutorial = require(path.join(__dirname, '..', 'src', 'tutorial.js'));
const s = Sim.newRun(Tutorial.SEED, Tutorial.WHO, { dice: Tutorial.DICE, enemy: Tutorial.ENEMY, tutorial: true });
const must = (r, what) => { if (!r.ok) throw new Error(`${what}: ${r.why}`); return r; };
const msgId = () => { const m = Sim.actions(s).messages[0]; if (!m) throw new Error('no message at hour ' + s.hour); return m.id; };
const actions = {
  3:  () => must(Sim.commit(s, msgId(), 'name_atlanta'), 'name Atlanta'),
  4:  () => must(Sim.commit(s, 'call:aircraft'), 'call aircraft'),
  6:  () => must(Sim.commit(s, 'decoy'), 'decoy'),
  8:  () => must(Sim.commit(s, msgId(), 'sign_person'), 'sign in person'),
  10: () => must(Sim.commit(s, 'call:permission'), 'call permission'),
  11: () => must(Sim.commit(s, 'second_driver'), 'second driver'),
  13: () => must(Sim.commit(s, 'help_host'), 'help host'),
  15: () => must(Sim.commit(s, 'call:reception'), 'call reception'),
  16: () => must(Sim.commit(s, 'crate'), 'Holt'),
  17: () => must(Sim.commit(s, 'board'), 'board'),
  19: () => must(Sim.commit(s, 'civil_doc'), 'civil record'),
};
Tutorial.start();
Tutorial.STEPS.forEach((st, i) => {
  if (st.allow.next) { console.log(`${String(i + 1).padStart(2)} read   ${st.title}   [${Sim.clockText(s.hour)}, level ${s.pos}, exposure ${s.exposure}]`); Tutorial.next(); return; }
  if (!actions[i]) throw new Error(`no action scripted for act step ${i + 1}`);
  const r = actions[i](); const rolls = r.events.filter(e => e.type === 'roll').map(e => `${e.who || 'you'}:${e.die}/${e.need}${e.won ? '✓' : '✗'}`).join(' ');
  if (!st.done(s)) throw new Error(`step ${i + 1} "${st.title}" not done after its action`);
  if (!Tutorial.sync(s)) throw new Error(`tutorial did not advance at step ${i + 1}`);
  console.log(`${String(i + 1).padStart(2)} act    ${st.title}   [${Sim.clockText(s.hour)}, level ${s.pos}, exposure ${s.exposure}] ${rolls}`);
});
if (s._dice.length || s._enemy.length) console.log(`note: ${s._dice.length} dice and ${s._enemy.length} enemy actions unused`);
console.log('end:', Sim.clockText(s.hour), 'level', s.pos, 'aircraft', s.arr.aircraft.stage, 'document', s.arr.document.stage, 'permission', s.arr.permission.stage, 'reception', s.arr.reception.stage, 'exposure', s.exposure, 'over', !!s.over);
