#!/usr/bin/env node
/* Replays the practice night's 23-step path against the real Sim with the
   tutorial deck and asserts every step's done() test passes in order.
   Run after any change to src/sim.js or src/tutorial.js:  node tools/tutorial-check.js */
'use strict';
const path = require('path');
const Sim = require(path.join(__dirname, '..', 'src', 'sim.js'));
const Tutorial = require(path.join(__dirname, '..', 'src', 'tutorial.js'));
const s = Sim.newGame(Tutorial.SEED, Tutorial.PERSONA, { deck: Tutorial.DECK, tutorial: true });
const card = (t) => { const c = s.hand.find(x => x.type === t); if (!c) throw new Error(`no ${t} in hand at tick ${s.tick}`); return c; };
const must = (r, what) => { if (!r.ok) throw new Error(`${what}: ${r.why}`); };
// what the player does at each action step, keyed by step index (0-based)
const actions = {
  4:  () => must(Sim.move(s, 1), 'walk to market'),
  6:  () => ({ selCard: 'forgery' }),
  7:  () => ({ selCard: 'forgery', selTarget: 'forger' }),
  8:  () => must(Sim.play(s, card('forgery').uid, 'forger'), 'forgery'),
  10: () => must(Sim.play(s, card('sellmaps').uid, 'stall'), 'sell maps'),
  12: () => must(Sim.play(s, card('distract').uid, 'lookout'), 'distract Pipô'),
  14: () => must(Sim.move(s, 1), 'walk to customs'),
  15: () => must(Sim.move(s, 1), 'walk to yard'),
  17: () => must(Sim.wait(s, card('picklock').uid), 'swap pick lock'),
  18: () => must(Sim.play(s, card('talk').uid, 'teo'), 'sweet talk Theo'),
  19: () => must(Sim.move(s, 1), 'walk to platform'),
  20: () => must(Sim.play(s, card('bribe').uid, 'brakeman'), 'bribe Holt'),
  21: () => must(Sim.board(s), 'board'),
};
Tutorial.STEPS.forEach((st, i) => {
  if (st.allow.next) { console.log(`${String(i + 1).padStart(2)} read   ${st.title}`); return; }
  const ctx = actions[i] ? (actions[i]() || {}) : {};
  if (!st.done(s, Object.assign({ selCard: null, selTarget: null }, ctx))) throw new Error(`step ${i + 1} "${st.title}" did not complete`);
  console.log(`${String(i + 1).padStart(2)} action ${st.title.padEnd(32)} ${Sim.clockText(s.tick)}  coin ${s.coin} favor ${s.favor} heat ${s.heat}`);
});
if (!s.over || !s.over.win) throw new Error('did not board');
console.log(`ok: boards at ${Sim.clockText(s.tick)} with ${s.coin} australs, heat ${s.heat}`);
