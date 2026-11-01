#!/usr/bin/env node
/* Plays one seeded run with the harness policy and writes it as a run file the game can
   replay (the same shape "Save this run" downloads).  node tools/sample-run.js SEED [woman|man] [atlanta|tarun|zaryanova] > run.json
   --win: scan seeds upward from SEED until the policy wins, then write that run. */
'use strict';
const path = require('path');
global.Data = require(path.join(__dirname, '..', 'src', 'data.js'));
const Sim = require(path.join(__dirname, '..', 'src', 'sim.js'));
const args = process.argv.slice(2).filter(a => !a.startsWith('--')), wantWin = process.argv.includes('--win');
let seed = parseInt(args[0], 10) || 1; const who = args[1] || 'woman', dest = args[2] || 'atlanta';
const PREF = { confirm_dest: 1, sign_person: 1, keep_calling: 1, via_sponsor: 0, keep_word: 1, crew_bonus: 1, velez_word: 0 };
function play(seed) { return playAs(seed, who, dest); }
function playAs(seed, who, dest) {
  const s = Sim.newRun(seed, who, { dest }); let guard = 0;
  while (!s.over && guard++ < 800) {
    const A = Sim.actions(s);
    if (A.event) { const score = (c) => (c.rolls ? 1 : 0) + c.tags.reduce((n, t) => n + ({ risk: 4, up: 2, lose: 2, time: 1 }[t.k] || 0) - ({ down: 1, gain: 1 }[t.k] || 0), 0); const c = A.event.choices.filter(x => x.ok).sort((a, b) => score(a) - score(b))[0]; Sim.commit(s, 'evt:' + c.id); continue; }
    if (A.messages.length) { const m = A.messages[0]; const opt = m.options.filter(o => o.ok).sort((a, b) => (PREF[b.id] || 0) - (PREF[a.id] || 0))[0]; Sim.commit(s, m.id, opt.id); continue; }
    const calls = A.calls.filter(c => c.ok), lvl = s.pos;
    if (calls.length && (lvl < 4 || (lvl === 4 && s.arr.reception.stage < 3) || (lvl === 5 && (s.arr.aircraft.stage < 4 || s.arr.permission.stage < 2)))) { const order = ['permission', 'aircraft', 'reception']; calls.sort((a, b) => order.indexOf(a.arr) - order.indexOf(b.arr)); Sim.commit(s, calls[0].id); continue; }
    const L = Data.LEVELS[s.pos];
    const apps = A.approaches.filter(a => a.ok && (a.noRoll || a.real <= 20)).filter(a => { const d = L.approaches.find(x => x.id === a.id); return !(d.success.card && s.hand.includes(d.success.card)); }).sort((a, b) => ((Sim.EXITS[L.id] && !Sim.EXITS[L.id].includes(a.id)) - (Sim.EXITS[L.id] && !Sim.EXITS[L.id].includes(b.id))) || a.real - b.real); // moves that leave the stop first, as the government side's candidate already plays (owner bug report, Nov. 1, 2026: the bot sat at Nonā Rosa's)
    if (apps.length && (lvl !== 5 || apps[0].id !== 'fuel_now' || s.arr.aircraft.stage < 3)) { Sim.commit(s, apps[0].id); continue; }
    Sim.commit(s, 'wait');
  }
  return s;
}
// --cut border: keep only the actions taken before the run reached the border, so a clip or the title
// screen never shows which country was chosen or how it ended.
function cutAtBorder(seed, who, dest, actions) {
  const s = Sim.newRun(seed, who, { dest }); let n = 0;
  for (const a of actions) { if (s.pos >= 4) break; Sim.commit(s, a[0], a[1]); n += 1; }
  return actions.slice(0, n);
}
const rec = (seed, who, dest, s, cut) => ({ v: 1, game: 'coalition', kind: 'escape', seed, who, dest, actions: cut ? cutAtBorder(seed, who, dest, s.actions) : s.actions, ended: cut ? null : (s.over ? s.over.kind : null) });
if (process.argv.includes('--attract')) {
  // three title-screen runs, one per destination, two characters, each cut before the border
  const out = [];
  [['woman', 'atlanta'], ['man', 'tarun'], ['woman', 'zaryanova']].forEach(([w, d], i) => { const sd = seed + i * 7; out.push(rec(sd, w, d, playAs(sd, w, d), true)); });
  process.stdout.write(JSON.stringify(out) + '\n'); console.error('attract runs:', out.map(r => `${r.who}/${r.dest} ${r.actions.length} actions`).join(', '));
} else {
  let s = play(seed);
  while (wantWin && !(s.over && s.over.win) && seed < 100000) s = play(++seed);
  process.stdout.write(JSON.stringify(rec(seed, who, dest, s, process.argv.includes('--cut')), null, 1) + '\n');
  console.error(`seed ${seed}: ${s.over ? (s.over.win ? 'win' : s.over.kind) : 'unfinished'}, ${s.actions.length} actions, ${s.hour} hours`);
}
