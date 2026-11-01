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
const actions = { // keyed by step id, so adding or removing a reading step never shifts the script
  answer_brother: () => must(Sim.commit(s, msgId(), 'confirm_dest'), 'name Atlanta'),
  call_aircraft: () => must(Sim.commit(s, 'call:aircraft'), 'call aircraft'),
  leave_house: () => must(Sim.commit(s, 'decoy'), 'decoy'),
  call_sponsor: () => must(Sim.commit(s, 'call:permission'), 'call permission'),
  hire_driver: () => must(Sim.commit(s, 'second_driver'), 'second driver'),
  nona_rosa: () => must(Sim.commit(s, 'help_host'), 'help host'),
  call_reception: () => must(Sim.commit(s, 'call:reception'), 'call reception'),
  freight_crate: () => must(Sim.commit(s, 'crate'), 'Holt'),
  board_freight: () => must(Sim.commit(s, 'board'), 'board'),
  post_rail: () => must(Sim.commit(s, 'post_rail'), 'second passport'),
};
Tutorial.start('escape');
Tutorial.STEPS.forEach((st, i) => {
  if (st.allow.next) { console.log(`${String(i + 1).padStart(2)} read   ${st.title}   [${Sim.clockText(s.hour)}, level ${s.pos}, exposure ${s.exposure}]`); Tutorial.next(); return; }
  if (!actions[st.id]) throw new Error(`no action scripted for act step ${st.id}`);
  const r = actions[st.id](); const rolls = r.events.filter(e => e.type === 'roll').map(e => `${e.who || 'you'}:${e.die}/${e.need}${e.won ? '✓' : '✗'}`).join(' ');
  if (!Tutorial.check(st.done, s)) throw new Error(`step ${i + 1} "${st.title}" not done after its action`);
  if (!Tutorial.sync(s)) throw new Error(`tutorial did not advance at step ${i + 1}`);
  console.log(`${String(i + 1).padStart(2)} act    ${st.title}   [${Sim.clockText(s.hour)}, level ${s.pos}, exposure ${s.exposure}] ${rolls}`);
});
if (s._dice.length || s._enemy.length) console.log(`note: ${s._dice.length} dice and ${s._enemy.length} enemy actions unused`);
console.log('end:', Sim.clockText(s.hour), 'level', s.pos, 'aircraft', s.arr.aircraft.stage, 'permission', s.arr.permission.stage, 'reception', s.arr.reception.stage, 'exposure', s.exposure, 'over', !!s.over);
