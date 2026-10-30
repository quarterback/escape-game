// Every string the rules hand to the interface over fixed seeded runs on both sides: event text, action
// views (names, reasons, previews), messages and options, government views and the debrief. A migration
// that only moves wording into the content package must leave this output identical.
'use strict';
const path = require('path'), src = path.join(__dirname, '..', '..', 'src');
global.Data = require(path.join(src, 'data.js')); const Sim = require(path.join(src, 'sim.js')), Gov = require(path.join(src, 'gov.js'));
const out = [], keep = (o) => JSON.stringify(o, (k, v) => typeof v === 'function' ? undefined : v);
const evText = (evs) => evs.map(e => [e.type, e.text, e.title, e.label, e.name, e.reason, e.dueText].filter(x => x !== undefined).join('|')).join(' / ');
for (let i = 0; i < 14; i++) {
  const s = Sim.newRun(700 + i, i % 2 ? 'man' : 'woman'); out.push(evText(s._boot || [])); let n = 0;
  while (!s.over && n < 300) { n++; const A = Sim.actions(s); out.push(keep(A)); let r;
    if (A.event) r = Sim.commit(s, 'evt:' + A.event.choices.filter(c => c.ok)[n % A.event.choices.filter(c => c.ok).length].id);
    else if (A.messages.length) { const m = A.messages[0], ok = m.options.filter(o => o.ok); r = Sim.commit(s, m.id, ok[n % ok.length].id); }
    else if (n % 3 === 0 && A.calls.some(c => c.ok)) r = Sim.commit(s, A.calls.find(c => c.ok).id);
    else { const a = A.approaches.filter(a => a.ok).sort((x, y) => x.need - y.need || x.id.localeCompare(y.id))[n % 2]; r = Sim.commit(s, a ? a.id : 'wait'); }
    out.push(evText(r.events)); out.push(keep(s.inbox)); }
  out.push(keep(s.over));
}
for (let i = 0; i < 8; i++) {
  const g = Gov.newRun(800 + i, i % 2 ? 'man' : 'woman'); out.push(evText(g._boot)); let n = 0;
  while (!g.over && n < 200) { n++; const v = Gov.view(g); out.push(keep(v)); let r;
    if (v.event) r = Gov.commit(g, 'evt:' + v.event.choices.filter(c => c.ok)[n % v.event.choices.filter(c => c.ok).length].id);
    else if (v.messages.length) r = Gov.commit(g, v.messages[0].id, v.messages[0].options[n % v.messages[0].options.length].id);
    else if (n % 4 === 0 && v.calls.some(c => c.ok)) r = Gov.commit(g, v.calls.find(c => c.ok).id);
    else { const o = v.orders.filter(o => o.ok).sort((a, b) => a.id.localeCompare(b.id))[n % Math.max(1, v.orders.filter(o => o.ok).length)]; r = Gov.commit(g, o ? o.id : 'wait'); }
    out.push(evText(r.events)); }
  out.push(Gov.debrief(g));
}
process.stdout.write(out.join('\n') + '\n');
