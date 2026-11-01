#!/usr/bin/env node
/* Contract tests from docs/content/patterns.md (acceptance evidence):
   C03  a shown cost or chance is the one the rules apply, and changing the rule changes the display
   C04  the government view does not change when only hidden state changes
   C14  altering every narrative and interface string leaves the rules untouched
   node tools/contract-tests.js */
'use strict';
const path = require('path'), { execFileSync } = require('child_process');
global.Data = require('../src/data.js'); const Sim = require('../src/sim.js'), Gov = require('../src/gov.js');
let fails = 0; const ok = (cond, msg) => { console.log(`${cond ? 'pass' : 'FAIL'}  ${msg}`); if (!cond) fails += 1; };

// ---- C03 (20-sided die): a 1 always fails, a 20 always succeeds, and targets keep the six-sided odds
{ const W = Data.DICE.wins, t = Data.DICE.target, odds = [2, 3, 4, 5, 6].map(n => [n, Math.round((7 - n) / 6 * 100), Data.DICE.chance(t(n))]);
  ok(!W(1, 2) && W(20, 20) && !W(20, 21) && t(1) === 2 && t(7) === 21 && odds.every(([, a, b]) => Math.abs(a - b) <= 5), `C03 dice: natural 1 and 20 rules hold, and every target is within 5 points of its old chance (${odds.map(o => o[1] + '→' + o[2]).join(', ')})`); }
// ---- C03: every approach's displayed need is the need its roll uses, at every stop, on both candidates
{ let checked = 0, wrong = [];
  for (const who of ['woman', 'man']) for (let pos = 0; pos < Data.LEVELS.length; pos++) for (const night of [14, 22]) {
    const base = Sim.newRun(77, who); base.pos = pos; base.hour = night - 14 + 24; base.event = null; base.nextEventAt = 999;
    for (const a of Sim.actions(base).approaches.filter(a => a.ok && !a.noRoll && a.need >= 2 && a.need <= 20)) {
      for (const die of [a.need, a.need - 1]) {
        const s = Sim.restore(Sim.serialize(base)); s._dice = [die]; s.nextEventAt = 999;
        const r = Sim.commit(s, a.id); const roll = r.events.find(e => e.type === 'roll' && !e.who); checked += 1;
        if (!roll || roll.need !== a.need || roll.won !== Data.DICE.wins(die, a.need)) wrong.push(`${who} ${Data.LEVELS[pos].short} ${a.id}: shown ${a.need}+, rolled ${roll && roll.need}`);
      }
    }
  }
  ok(!wrong.length && checked > 0, `C03 escape: ${checked} rolls use the need shown on the approach${wrong.length ? ': ' + wrong.slice(0, 3).join('; ') : ''}`); }
{ const L = Data.LEVELS[1], a = L.approaches.find(x => x.id === 'known_car') || L.approaches[0], before = a.hours;
  const s = Sim.newRun(77, 'woman'); s.pos = 1; const shown = () => Sim.actions(s).approaches.find(x => x.id === a.id);
  const h0 = shown().hours; a.hours = before + 3; const after = shown(); a.hours = before;
  ok(after.hours === h0 + 3 && after.preview.join(' ').includes(String(h0 + 3)), `C03 escape: changing ${a.id} from ${h0} to ${h0 + 3} hours changes the button and the preview without editing text`); }
{ let checked = 0, wrong = [];
  for (let i = 0; i < 20; i++) { const g = Gov.newRun(300 + i, 'woman'); g.belief = i % 5; g.c.hour = 13;
    for (const o of Gov.view(g).orders.filter(o => o.ok && o.need >= 2 && o.need <= 20)) { const h = Gov.restore(Gov.serialize(g)); h._dice = [o.need]; const r = Gov.commit(h, o.id); const roll = r.events.find(e => e.type === 'roll'); checked += 1; if (!roll || roll.need !== o.need || !roll.won) wrong.push(`${o.id}: shown ${o.need}, rolled ${roll && roll.need}`); } }
  ok(!wrong.length && checked > 0, `C03 government: ${checked} orders roll against the need they show${wrong.length ? ': ' + wrong.slice(0, 3).join('; ') : ''}`); }

// ---- C04: hidden state never reaches the government view
{ let views = 0, leaks = [];
  for (let i = 0; i < 12; i++) { const g = Gov.newRun(600 + i, i % 2 ? 'man' : 'woman');
    for (let step = 0; step < 6 && !g.over; step++) { const v = Gov.view(g); if (v.event) Gov.commit(g, 'evt:' + v.event.choices.find(c => c.ok).id); else if (v.messages.length) Gov.commit(g, v.messages[0].id, 'ask_time'); else Gov.commit(g, (v.orders.find(o => o.ok && o.id === 'search') || { id: 'wait' }).id); }
    if (g.over) continue;
    const want = JSON.stringify(Gov.view(g)), real = { pos: g.c.pos, exp: g.c.exposure, arr: JSON.stringify(g.c.arr), hand: g.c.hand.slice() };
    for (let p = 0; p < Data.LEVELS.length; p++) { g.c.pos = p; g.c.exposure = (p * 3) % 10; for (const k in g.c.arr) g.c.arr[k].stage = p % 3; g.c.hand = p % 2 ? [] : real.hand;
      views += 1; if (JSON.stringify(Gov.view(g)) !== want) leaks.push(`seed ${600 + i}: view changed when she was moved to ${Data.LEVELS[p].short}`); }
    g.c.pos = real.pos; g.c.exposure = real.exp; g.c.arr = JSON.parse(real.arr); g.c.hand = real.hand; }
  ok(!leaks.length && views > 0, `C04 government: ${views} views stay identical when her position, exposure, arrangements and cards change${leaks.length ? ': ' + leaks.slice(0, 2).join('; ') : ''}`); }

// ---- C14: text-only changes preserve rules
{ const fp = (mode) => execFileSync(process.execPath, [path.join(__dirname, 'lib', 'fingerprint.js')].concat(mode ? [mode] : []), { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n');
  const a = fp(), b = fp('perturb');
  ok(a[0] !== b[0] && b[0].includes('Ω'), `C14 the perturbation reached catalog, record and marker text (${b[0].slice(0, 60)}...)`);
  const diff = a.slice(1).filter((l, i) => l !== b[i + 1]).length;
  ok(a.length === b.length && diff === 0, `C14 ${a.length - 1} recorded actions across 18 seeded runs are identical with every narrative and interface string altered`); }

console.log(fails ? `${fails} contract test(s) failed` : 'all contract tests pass');
process.exit(fails ? 1 : 0);
