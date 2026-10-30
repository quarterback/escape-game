#!/usr/bin/env node
/* Projects the Coalition content package into a pbbg-content-schema bundle so the
   owner's standalone checker (quarterback/pbbg-content-schema) can run over the
   game's copy. The package keeps its own contract; this is a view of it, never a
   second source.   node tools/pbbg-bundle.js > out.json
   Then: node <schema repo>/bin/pbbg-content.js check out.json --policy tools/pbbg-policy.json */
'use strict';
const fs = require('fs'), path = require('path');
const C = path.join(__dirname, '..', 'content', 'coalition');
const json = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
global.Data = require(path.join(__dirname, '..', 'src', 'data.js'));
const D = global.Data;
// P01-P14 are the fourteen patterns of the package in the order the schema lists them
const PAT = ['action-label', 'navigation-heading', 'action-preview', 'blocked-action', 'arrangement-status', 'report', 'dialogue', 'scene', 'card', 'action-result', 'technical-error', 'empty-state', 'tutorial', 'ending'];
const pat = (p) => PAT[parseInt(p.slice(1), 10) - 1];
const NARR = new Set(['dialogue', 'scene', 'ending', 'card', 'report']);
const facts = new Map(), content = [];
const safeId = (s) => s.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^[^a-zA-Z]/, 'x$&');
function add(id, pattern, text, audience, speaker) {
  if (!text || !text.trim()) return;
  const e = { id: safeId(id), domain: NARR.has(pattern) ? 'narrative' : 'interface', pattern, text, audience, phases: ['run'] };
  const args = [...new Set((text.match(/\{(\w+)\}/g) || []).map(a => a.slice(1, -1)))];
  if (args.length) { e.bindings = {}; for (const a of args) { facts.set(a, 1); e.bindings[a] = { source: 'fact', ref: 'arg.' + a }; } }
  if (speaker) e.speakerRef = speaker;
  content.push(e);
}
// the catalog
for (const e of json(path.join(C, 'ui.json')).entries) add(e.id, pat(e.pattern), e.text, [e.id.startsWith('gov.') ? 'government' : 'player'], e.speaker);
// tutorial steps
for (const t of json(path.join(C, 'tutorials.json')).tutorials) for (const st of t.steps) { add(`tutorial.${t.id}.${st.id}.title`, 'navigation-heading', st.title, [t.id === 'gov' ? 'government' : 'player']); add(`tutorial.${t.id}.${st.id}.body`, 'tutorial', st.body, [t.id === 'gov' ? 'government' : 'player']); }
// records in src/data.js: levels, approaches, options, events, destinations, posts, stage lines
const P = ['player'];
D.LEVELS.forEach((L, i) => {
  add(`level.${L.id}.name`, 'navigation-heading', L.name, P); add(`level.${L.id}.objective`, 'scene', L.objective, P); add(`level.${L.id}.arrive`, 'scene', L.arrive, P);
  for (const a of L.approaches || []) { add(`level.${L.id}.${a.id}.name`, 'action-label', a.name, P); add(`level.${L.id}.${a.id}.text`, 'action-preview', a.text, P); if (a.success && a.success.say) add(`level.${L.id}.${a.id}.success`, 'action-result', a.success.say, P); if (a.fail && a.fail.say) add(`level.${L.id}.${a.id}.fail`, 'action-result', a.fail.say, P); }
  if (L.received) { add(`level.${L.id}.received.name`, 'action-label', L.received.name, P); add(`level.${L.id}.received.say`, 'action-result', L.received.say, P); }
  if (L.bought) add(`level.${L.id}.bought.say`, 'action-result', L.bought.say, P);
});
for (const k in D.DESTS) { const d = D.DESTS[k], s = d.sponsor; add(`dest.${k}.asks`, 'card', s.asks, P); add(`dest.${k}.terms`, 'arrangement-status', s.terms, P); add(`dest.${k}.demand`, 'dialogue', s.demand.text, P, 'sponsor'); add(`dest.${k}.accept`, 'action-label', s.demand.accept, P); add(`dest.${k}.effect`, 'action-preview', s.demand.effect, P); add(`dest.${k}.kept`, 'ending', s.kept, P); add(`dest.${k}.broke`, 'ending', s.broke, P); add(`dest.${k}.landing`, 'ending', d.landing, P); }
for (const k in D.POSTS) add(`post.${k}`, 'navigation-heading', D.POSTS[k], P);
for (const k in D.STAGE_LINES) D.STAGE_LINES[k].forEach((t, i) => add(`stage.${k}.${i}`, 'dialogue', t, P, k === 'aircraft' || k === 'reception' ? 'sibling' : 'sponsor'));
for (const k in D.ARRANGEMENTS) { add(`arr.${k}.what`, 'arrangement-status', D.ARRANGEMENTS[k].what, P); D.ARRANGEMENTS[k].stages.forEach((t, i) => add(`arr.${k}.stage.${i}`, 'arrangement-status', t, P)); }
for (const k in D.CARDS) { add(`card.${k}.name`, 'navigation-heading', D.CARDS[k].name, P); add(`card.${k}.text`, 'card', D.CARDS[k].text, P); add(`card.${k}.works`, 'card', D.CARDS[k].works, P); }
for (const k in D.PEOPLE) { add(`person.${k}.role`, 'card', D.PEOPLE[k].role, P); if (D.PEOPLE[k].terms) add(`person.${k}.terms`, 'arrangement-status', D.PEOPLE[k].terms, P); }
for (const [pre, list] of [['event', D.EVENTS], ['hold', D.HOLDS], ['govevent', D.GOV_EVENTS]]) for (const [n, e] of (Array.isArray(list) ? list : Object.values(list || {})).flat().entries()) { e.id = e.id || String(n); const aud = pre === 'govevent' ? ['government'] : P; const txt = typeof e.text === 'function' ? e.text() : e.text; add(`${pre}.${e.id}.text`, 'report', txt, aud); if (e.title) add(`${pre}.${e.id}.title`, 'navigation-heading', e.title, aud); for (const c of e.choices || []) { add(`${pre}.${e.id}.${c.id}.label`, 'action-label', c.label, aud); if (c.fx && c.fx.say) add(`${pre}.${e.id}.${c.id}.say`, 'action-result', c.fx.say, aud); } }
const bundle = {
  schemaVersion: '0.5.0', id: 'coalition', roles: ['player', 'government'], phases: ['run'],
  entities: [...['sponsor', 'official', 'aide', 'pilot', 'press', 'enemy', 'holt', 'narrator', 'ally', 'minister', 'embassy', 'aviation', 'desk'].map(id => ({ id, name: id, kind: 'speaker' })), { id: 'sibling', name: 'The sibling', kind: 'person' }, { id: 'aircraft', name: 'The aircraft', kind: 'arrangement' }, { id: 'reception', name: 'Reception', kind: 'arrangement' }, { id: 'permission', name: 'Entry visa', kind: 'arrangement' }],
  facts: [...facts.keys()].map(a => ({ id: 'arg.' + a, type: 'string', audience: ['player', 'government'], phases: ['run'] })),
  effectTypes: [], actions: [], content, scenes: [], events: [], outcomes: [],
};
process.stdout.write(JSON.stringify(bundle, null, 1) + '\n');
