// Headless runs of the government side with a sensible player policy, played in rounds:
// news, then one desk action (a message or a request), then one order. Reports how often she escapes.
// Usage: node tools/gov-calibrate.js [runs] [--companion=bruno|...|all]
'use strict';
const Gov = require('../src/gov.js');

const score = (c) => c.tags.reduce((n, t) => n + ({ gain: 2, roll: -0.5, time: -0.6, lose: -1.5, risk: -1.5 }[t.k] || 0), 0);

function round(g) {
  let v = Gov.view(g);
  while (v.event && !g.over) { const ch = v.event.choices.filter(c => c.ok).sort((a, b) => score(b) - score(a))[0]; Gov.commit(g, 'evt:' + ch.id); v = Gov.view(g); }
  if (g.over) return;
  // desk: messages first, then one request
  while (v.messages.length && !g.over) { const m = v.messages[0]; const fresh = v.reports[0] && v.reports[0].age === 'just now'; const o = m.options.find(x => x.id === (fresh ? 'tell_now' : 'ask_time')) || m.options.find(x => x.id === 'admit') || m.options[0]; Gov.commit(g, m.id, o.id); v = Gov.view(g); }
  if (g.over) return;
  const call = ['req:ban', 'req:hold', 'req:operator'].map(id => v.calls.find(c => c.id === id && c.ok)).find(Boolean);
  if (call) { Gov.commit(g, call.id); v = Gov.view(g); }
  if (g.over || v.event) return;
  // order: follow a newer lead, circulate the ban, then search or block
  const has = (id) => v.orders.find(o => o.id === id && o.ok);
  // a companion's records order when the newest report is stale, at most every third round
  const stale = !v.reports[0] || v.reports[0].age !== 'just now', info = ['exchange', 'clinics', 'registers', 'appeal'].map(has).find(Boolean);
  const useInfo = stale && info && (g._lastInfo === undefined || g.c.hour - g._lastInfo >= 9);
  if (useInfo) g._lastInfo = g.c.hour;
  const pick = (v.reports[0] && v.reports[0].at !== g.belief && has('follow')) || (!g.c.flags.restriction && has('circulate')) || (useInfo && info) || (g.belief >= 4 && has('roadblock')) || has('search') || has('roadblock');
  Gov.commit(g, pick ? pick.id : 'wait');
}

const N = +process.argv[2] || 200, MATE = (process.argv.find(a => a.startsWith('--companion=')) || '--companion=').slice(12) || null;
function runAll(mate) {
  const out = {}; let esc = 0, rounds = 0;
  for (let i = 0; i < N; i++) {
    const g = Gov.newRun(1000 + i, i % 2 ? 'man' : 'woman', { companion: mate }); let r = 0;
    while (!g.over && r < 80) { round(g); r += 1; }
    if (!g.over) { out.stuck = (out.stuck || 0) + 1; continue; }
    rounds += r; const k = g.over.win ? 'escaped' : g.over.kind; out[k] = (out[k] || 0) + 1; if (g.over.win) esc += 1;
  }
  return { esc, rounds, out };
}
if (MATE === 'all') for (const mate of [null].concat(Object.keys(require('../src/data.js').COMPANIONS))) { const r = runAll(mate); console.log(`${(mate || 'none').padEnd(7)} she escaped ${(100 * r.esc / N).toFixed(1).padStart(5)}%`, r.out); }
else { const { esc, rounds, out } = runAll(MATE); console.log(`runs ${N}  she escaped ${(100 * esc / N).toFixed(1)}%  rounds/run ${(rounds / N).toFixed(1)}`, out); }
