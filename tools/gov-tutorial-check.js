#!/usr/bin/env node
/* Replays the government tutorial against the real Gov run with its scripted dice and event,
   and asserts each act step's declarative condition passes in order. node tools/gov-tutorial-check.js */
'use strict';
const path = require('path');
global.Data = require(path.join(__dirname, '..', 'src', 'data.js'));
const Gov = require(path.join(__dirname, '..', 'src', 'gov.js'));
const Tutorial = require(path.join(__dirname, '..', 'src', 'tutorial.js'));
const T = Tutorial.RUNS.gov;
const g = Gov.newRun(T.seed, 'woman', { dice: T.dice, events: T.eventQueue, tutorial: true });
const must = (r, what) => { if (!r.ok) throw new Error(`${what}: ${r.why}`); return r; };
const v = () => Gov.view(g);
// each act step does exactly what its body tells the player to do
const actions = {
  minister: () => must(Gov.commit(g, v().messages[0].id, 'ask_time'), 'ask for time'),
  hold: () => must(Gov.commit(g, 'req:hold'), 'ask Esmeralda'),
  ban: () => must(Gov.commit(g, 'circulate'), 'circulate'),
  news: () => { if (!v().event) throw new Error('no news waiting at ' + g.c.hour); return must(Gov.commit(g, 'evt:plates'), 'plates'); },
  confirm: () => must(Gov.commit(g, 'req:ban'), 'confirm ban'),
  search: () => { const o = v().orders.find(x => x.id === 'follow' && x.ok) || v().orders.find(x => x.id === 'search'); return must(Gov.commit(g, o.id), o.id); },
};
Tutorial.start('gov');
for (const st of T.steps) {
  const at = `[hour ${g.c.hour}, looking at ${g.belief}, she is at ${g.c.pos}]`;
  if (st.kind === 'read') { console.log(`read  ${st.id} ${at}`); Tutorial.next(); continue; }
  if (!actions[st.id]) throw new Error('no action scripted for ' + st.id);
  const allowed = [...(st.allow.approaches || []), ...(st.allow.calls || []), ...(st.allow.options || [])];
  const r = actions[st.id]();
  const rolls = r.events.filter(e => e.type === 'roll').map(e => `${e.die}/${e.need}${e.won ? '✓' : '✗'}`).join(' ');
  if (!Tutorial.check(st.done, g)) throw new Error(`step ${st.id} not done after its action`);
  if (!Tutorial.sync(g)) throw new Error(`tutorial did not advance at ${st.id}`);
  console.log(`act   ${st.id} ${at} allowed: ${allowed.join(',')} ${rolls}`);
}
if (g.over) throw new Error('the run ended during the tutorial');
console.log(`end: hour ${g.c.hour}, reports ${g.reports.length}, ban ${g.req.ban}, hold ${g.req.hold}, dice left ${(g._dice || []).length}`);
