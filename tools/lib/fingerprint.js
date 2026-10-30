// Plays fixed seeded runs on both sides and prints a rules fingerprint: per action, the event types,
// dice, needs, clock, position, exposure and search. With "perturb", every narrative and interface
// string is altered first (data records, catalog, markers), so a C14 test can compare the two.
'use strict';
const path = require('path'), fs = require('fs');
const perturb = process.argv[2] === 'perturb', X = (s) => 'Ω' + [...s].reverse().join(''); // reversed: no original word survives
const src = path.join(__dirname, '..', '..', 'src'), cdir = path.join(__dirname, '..', '..', 'content', 'coalition');
// the content package, perturbed before the runtime reads it
const man = JSON.parse(fs.readFileSync(path.join(cdir, 'manifest.json'), 'utf8')), pkg = { manifest: man };
for (const k in man.files) pkg[k] = JSON.parse(fs.readFileSync(path.join(cdir, man.files[k]), 'utf8'));
if (perturb) { for (const e of pkg.ui.entries) e.text = X(e.text); for (const m of pkg.markers.markers) m.text = X(m.text); for (const t of pkg.tutorials.tutorials) for (const s of t.steps) { s.title = X(s.title); s.body = X(s.body); } }
global.CONTENT_PKG = pkg; global.Content = require(path.join(src, 'content.js'));
global.Data = require(path.join(src, 'data.js'));
const TEXT = new Set(['title', 'text', 'label', 'say', 'effect', 'blurb', 'objective', 'role', 'works', 'why', 'what']);
if (perturb) { const seen = new Set(); const walk = (o) => { if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o); for (const k of Object.keys(o)) { if (TEXT.has(k) && typeof o[k] === 'string') o[k] = X(o[k]); else walk(o[k]); } }; for (const k of ['EVENTS', 'GOV_EVENTS', 'HOLDS', 'LEVELS', 'PEOPLE', 'GOV_CARDS', 'CARDS', 'ARRANGEMENTS', 'GOV_ORDERS']) walk(Data[k]); }
global.Sim = require(path.join(src, 'sim.js')); const Gov = require(path.join(src, 'gov.js'));
const rule = (evs) => evs.map(e => [e.type, e.die, e.need, e.won, e.to, e.delta, e.rung, e.kind].filter(x => x !== undefined).join(':')).join(',');
const out = [`sample ${Content.t('action.commit')} | ${Data.EVENTS[0].title} | ${Sim.eventView(Object.assign(Sim.newRun(1, 'woman'), { event: { id: Data.EVENTS[0].id, kind: 'event' } })).choices[0].tags.map(x => x.t).join(' ')}`];
for (let i = 0; i < 12; i++) {
  const s = Sim.newRun(500 + i, i % 2 ? 'man' : 'woman'); let n = 0;
  while (!s.over && n < 300) { n++; const A = Sim.actions(s); let r;
    if (A.event) r = Sim.commit(s, 'evt:' + A.event.choices.filter(c => c.ok)[n % A.event.choices.filter(c => c.ok).length].id);
    else if (A.messages.length) r = Sim.commit(s, A.messages[0].id, A.messages[0].options.find(o => o.ok).id);
    else if (n % 3 === 0 && A.calls.some(c => c.ok)) r = Sim.commit(s, A.calls.find(c => c.ok).id);
    else { const a = A.approaches.filter(a => a.ok).sort((x, y) => x.need - y.need || x.id.localeCompare(y.id))[0]; r = Sim.commit(s, a ? a.id : 'wait'); }
    out.push(`e${i} ${s.hour} ${s.pos} ${s.exposure} ${s.belief} ${s.hold} ${rule(r.events)}`); }
  out.push(`e${i} end ${s.over && s.over.kind}`);
}
for (let i = 0; i < 6; i++) {
  const g = Gov.newRun(900 + i, 'woman'); let n = 0;
  while (!g.over && n < 200) { n++; const v = Gov.view(g); let r;
    if (v.event) r = Gov.commit(g, 'evt:' + v.event.choices.filter(c => c.ok)[n % v.event.choices.filter(c => c.ok).length].id);
    else if (v.messages.length) r = Gov.commit(g, v.messages[0].id, v.messages[0].options[n % v.messages[0].options.length].id);
    else { const o = v.orders.filter(o => o.ok).sort((a, b) => a.id.localeCompare(b.id))[n % Math.max(1, v.orders.filter(o => o.ok).length)]; r = Gov.commit(g, o ? o.id : 'wait'); }
    out.push(`g${i} ${g.c.hour} ${g.belief} ${g.c.pos} ${g.reports.length} ${rule(r.events)}`); }
  out.push(`g${i} end ${g.over && g.over.kind}`);
}
process.stdout.write(out.join('\n') + '\n');
