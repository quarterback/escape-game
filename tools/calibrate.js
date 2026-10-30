#!/usr/bin/env node
/* COALITION harness: plays many seeded runs with a simple policy and reports
   win rate, loss causes, hours used, and which approaches carried the wins.
   It describes the tables; it fits nothing.   node tools/calibrate.js [runs] [--dest=atlanta|tarun|zaryanova] */
'use strict';
const path = require('path');
global.Data = require(path.join(__dirname, '..', 'src', 'data.js'));
const Sim = require(path.join(__dirname, '..', 'src', 'sim.js'));
const N = parseInt(process.argv[2], 10) || 300;
const DEST = (process.argv.find(a => a.startsWith('--dest=')) || '--dest=atlanta').slice(7); // which country the policy flies to
const PREF = { confirm_dest: 1, sign_person: 1, keep_calling: 1, via_sponsor: 0, keep_word: 1, crew_bonus: 1, velez_word: 0 };
function play(seed, who) {
  const s = Sim.newRun(seed, who, { dest: DEST }); let guard = 0; const used = [], cards = {}, lvlHours = {}; let lastPos = 0, lastHour = 0;
  while (!s.over && guard++ < 800) {
    const A = Sim.actions(s);
    // dispatches and holds come first; take the choice whose markers look cheapest
    if (A.event) { const score = (c) => c.tags.reduce((n, t) => n + ({ risk: 4, up: 2, lose: 2, time: 1, roll: 1 }[t.k] || 0) - ({ down: 1, gain: 1 }[t.k] || 0), 0); const c = A.event.choices.filter(x => x.ok).sort((a, b) => score(a) - score(b))[0]; Sim.commit(s, 'evt:' + c.id); continue; }
    // answer messages first, preferring the committed options above
    if (A.messages.length) { const m = A.messages[0]; const opt = m.options.filter(o => o.ok).sort((a, b) => (PREF[b.id] || 0) - (PREF[a.id] || 0))[0]; Sim.commit(s, m.id, opt.id); continue; }
    // push arrangements that are not pending and not complete, before trying the border or the airfield
    const calls = A.calls.filter(c => c.ok);
    const lvl = s.pos;
    if (calls.length && (lvl < 4 || (lvl === 4 && s.arr.reception.stage < 3) || (lvl === 5 && (s.arr.aircraft.stage < 4 || s.arr.permission.stage < 2)))) {
      const order = ['permission', 'aircraft', 'reception'];
      calls.sort((a, b) => order.indexOf(a.arr) - order.indexOf(b.arr)); Sim.commit(s, calls[0].id); continue;
    }
    // best approach: highest odds among ok ones, certain first; never the impossible
    // never repeat an approach whose only product is a card already in hand (the harness used to pay Holt five times)
    const L = Data.LEVELS[s.pos];
    const apps = A.approaches.filter(a => a.ok && a.need <= 6).filter(a => { const d = L.approaches.find(x => x.id === a.id); return !(d.success.card && s.hand.includes(d.success.card)); }).sort((a, b) => a.need - b.need);
    if (apps.length && (lvl !== 5 || apps[0].id !== 'fuel_now' || s.arr.aircraft.stage < 3)) { used.push(`${s.pos}:${apps[0].id}`); (apps[0].bonusFrom || []).forEach(t => cards[t] = (cards[t] || 0) + 1); Sim.commit(s, apps[0].id); if (s.pos !== lastPos) { lvlHours[lastPos] = (lvlHours[lastPos] || 0) + (s.hour - lastHour); lastPos = s.pos; lastHour = s.hour; } continue; }
    Sim.commit(s, 'wait');
  }
  if (!s.over) throw new Error('stuck seed ' + seed + ' ' + JSON.stringify({ hour: s.hour, pos: s.pos, ev: s.event }));
  lvlHours[lastPos] = (lvlHours[lastPos] || 0) + (s.hour - lastHour);
  return { cards, lvlHours, win: s.over.win, reason: s.over.win ? 'win' : s.over.kind === 'clock' ? 'clock' : s.over.kind === 'deal' ? 'deal' : s.over.kind === 'landed' ? 'landed' : 'house arrest', holds: s.holds, hour: s.hour, exposure: s.exposure, used, arr: Object.fromEntries(Object.entries(s.arr).map(([k, v]) => [k, v.stage])) };
}
for (const who of ['woman', 'man']) {
  const rows = []; for (let i = 1; i <= N; i++) rows.push(play(i, who));
  const wins = rows.filter(r => r.win); const causes = {}; rows.filter(r => !r.win).forEach(r => causes[r.reason] = (causes[r.reason] || 0) + 1);
  const mean = (k, xs) => xs.length ? (xs.reduce((a, r) => a + r[k], 0) / xs.length).toFixed(1) : '-';
  const carried = {}; wins.forEach(r => r.used.forEach(u => carried[u] = (carried[u] || 0) + 1));
  console.log(`${who.padEnd(6)} win ${(100 * wins.length / N).toFixed(1).padStart(5)}%  losses ${JSON.stringify(causes).padEnd(34)} hours ${mean('hour', wins)}  exposure ${mean('exposure', rows)}  holds/run ${mean('holds', rows)}`);
  console.log('       approaches in wins:', Object.entries(carried).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '));
  const cu = {}; rows.forEach(r => Object.entries(r.cards).forEach(([k, v]) => cu[k] = (cu[k] || 0) + v));
  console.log('       card bonuses used per run:', Object.entries(cu).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(v / N).toFixed(2)}`).join(' · '));
  const lh = {}; rows.forEach(r => Object.entries(r.lvlHours).forEach(([k, v]) => lh[k] = (lh[k] || 0) + v));
  console.log('       mean hours per level:', Object.entries(lh).sort().map(([k, v]) => `${Data.LEVELS[k].short} ${(v / N).toFixed(1)}`).join(' · '));
}
const a = Sim.serialize(Sim.newRun(5, 'man')), b = Sim.serialize(Sim.newRun(5, 'man'));
console.log('deterministic:', a === b);
