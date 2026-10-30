#!/usr/bin/env node
/* COALITION harness: plays many seeded runs with a simple policy and reports
   win rate, loss causes, hours used, and which approaches carried the wins.
   It describes the tables; it fits nothing.   node tools/calibrate.js [runs] */
'use strict';
const path = require('path');
global.Data = require(path.join(__dirname, '..', 'src', 'data.js'));
const Sim = require(path.join(__dirname, '..', 'src', 'sim.js'));
const N = parseInt(process.argv[2], 10) || 300;
const PREF = { name_atlanta: 1, sign_person: 1, keep_calling: 1, via_sponsor: 0, keep_word: 1, crew_bonus: 1, velez_word: 0 };
function play(seed, who) {
  const s = Sim.newRun(seed, who); let guard = 0; const used = [];
  while (!s.over && guard++ < 400) {
    const A = Sim.actions(s);
    // answer messages first, preferring the committed options above
    if (A.messages.length) { const m = A.messages[0]; const opt = m.options.filter(o => o.ok).sort((a, b) => (PREF[b.id] || 0) - (PREF[a.id] || 0))[0]; Sim.commit(s, m.id, opt.id); continue; }
    // push arrangements that are not pending and not complete, before trying the border or the airfield
    const calls = A.calls.filter(c => c.ok);
    const lvl = s.pos;
    if (calls.length && (lvl < 4 || (lvl === 4 && s.arr.reception.stage < 3 && s.arr.document.stage < 2) || (lvl === 5 && (s.arr.aircraft.stage < 4 || s.arr.permission.stage < 2)))) {
      const order = ['permission', 'aircraft', 'reception', 'document'];
      calls.sort((a, b) => order.indexOf(a.arr) - order.indexOf(b.arr)); Sim.commit(s, calls[0].id); continue;
    }
    // best approach: highest odds among ok ones, certain first; never the impossible
    const apps = A.approaches.filter(a => a.ok && a.need <= 6).sort((a, b) => a.need - b.need);
    if (apps.length && (lvl !== 5 || apps[0].id !== 'fuel_now' || s.arr.aircraft.stage < 3)) { used.push(`${s.pos}:${apps[0].id}`); Sim.commit(s, apps[0].id); continue; }
    Sim.commit(s, 'wait');
  }
  if (!s.over) throw new Error('stuck seed ' + seed);
  return { win: s.over.win, reason: s.over.reason.includes('arrive') ? 'intercepted' : s.over.win ? 'win' : 'clock', hour: s.hour, exposure: s.exposure, used, arr: Object.fromEntries(Object.entries(s.arr).map(([k, v]) => [k, v.stage])) };
}
for (const who of ['woman', 'man']) {
  const rows = []; for (let i = 1; i <= N; i++) rows.push(play(i, who));
  const wins = rows.filter(r => r.win); const causes = {}; rows.filter(r => !r.win).forEach(r => causes[r.reason] = (causes[r.reason] || 0) + 1);
  const mean = (k, xs) => xs.length ? (xs.reduce((a, r) => a + r[k], 0) / xs.length).toFixed(1) : '-';
  const carried = {}; wins.forEach(r => r.used.forEach(u => carried[u] = (carried[u] || 0) + 1));
  console.log(`${who.padEnd(6)} win ${(100 * wins.length / N).toFixed(1).padStart(5)}%  losses ${JSON.stringify(causes).padEnd(34)} hours ${mean('hour', wins)}  exposure ${mean('exposure', rows)}`);
  console.log('       approaches in wins:', Object.entries(carried).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '));
}
const a = JSON.stringify(Object.assign({}, Sim.newRun(5, 'man'), { _rng: null })), b = JSON.stringify(Object.assign({}, Sim.newRun(5, 'man'), { _rng: null }));
console.log('deterministic:', a === b);
