#!/usr/bin/env node
/* Content check for the Coalition content package (contract coalition-content/0.5).
   Rules follow docs/content/patterns.md. Each finding carries ruleId, severity, file,
   contentId, fieldPath, expected, observed and a repair hint.
     node tools/content-check.js            check; exit 1 on any error
     node tools/content-check.js --json     machine-readable findings
     node tools/content-check.js --shrink   drop strings that left the code from the C12 baseline
     node tools/content-check.js --fixtures run the invalid fixtures and confirm each is caught
   The baseline can only shrink. New player-facing prose belongs in content/coalition/ui.json. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), CDIR = path.join(ROOT, 'content'), PKG = path.join(CDIR, 'coalition');
const { literals, prose } = require('./lib/strings.js');
const rd = (p) => fs.readFileSync(p, 'utf8'), json = (p) => JSON.parse(rd(p));

function loadPackage() {
  const manifest = json(path.join(PKG, 'manifest.json')), pkg = { manifest };
  for (const k in manifest.files) pkg[k] = json(path.join(PKG, manifest.files[k]));
  pkg.policy = json(path.join(CDIR, 'policy.json'));
  pkg.schemas = {}; for (const f of fs.readdirSync(path.join(CDIR, 'schema'))) pkg.schemas[f.replace('.schema.json', '')] = json(path.join(CDIR, 'schema', f));
  pkg.sources = {}; for (const f of fs.readdirSync(path.join(ROOT, 'src'))) pkg.sources['src/' + f] = rd(path.join(ROOT, 'src', f));
  pkg.baseline = fs.existsSync(path.join(CDIR, 'c12-baseline.json')) ? json(path.join(CDIR, 'c12-baseline.json')) : null;
  delete require.cache[require.resolve('../src/data.js')];
  pkg.data = require('../src/data.js');
  return pkg;
}

// ---- a small JSON Schema subset: type, required, properties, additionalProperties, enum, pattern, minLength, minItems, items, $ref
function schemaErrors(schema, value, at, root, out) {
  root = root || schema; out = out || [];
  if (schema.$ref) { const ref = schema.$ref.replace('#/', '').split('/').reduce((o, k) => o[k], root); return schemaErrors(ref, value, at, root, out); }
  const type = Array.isArray(value) ? 'array' : value === null ? 'null' : Number.isInteger(value) ? 'integer' : typeof value;
  if (schema.type && !(schema.type === type || (schema.type === 'number' && type === 'integer'))) { out.push({ at, expected: `type ${schema.type}`, observed: type }); return out; }
  if (schema.enum && !schema.enum.includes(value)) out.push({ at, expected: `one of ${schema.enum.join(', ')}`, observed: JSON.stringify(value) });
  if (schema.pattern && typeof value === 'string' && !new RegExp(schema.pattern).test(value)) out.push({ at, expected: `match ${schema.pattern}`, observed: value });
  if (schema.minLength && typeof value === 'string' && value.length < schema.minLength) out.push({ at, expected: `at least ${schema.minLength} characters`, observed: value.length });
  if (type === 'object') {
    for (const k of schema.required || []) if (!(k in value)) out.push({ at: at + '.' + k, expected: 'present', observed: 'missing' });
    if (schema.minProperties && Object.keys(value).length < schema.minProperties) out.push({ at, expected: `${schema.minProperties}+ properties`, observed: Object.keys(value).length });
    for (const k in value) {
      if (schema.properties && schema.properties[k]) schemaErrors(schema.properties[k], value[k], at + '.' + k, root, out);
      else if (schema.additionalProperties === false) out.push({ at: at + '.' + k, expected: 'a declared field', observed: k });
    }
  }
  if (type === 'array') {
    if (schema.minItems && value.length < schema.minItems) out.push({ at, expected: `${schema.minItems}+ items`, observed: value.length });
    if (schema.items && !Array.isArray(schema.items)) value.forEach((v, i) => schemaErrors(schema.items, v, `${at}[${i}]`, root, out));
  }
  return out;
}

function check(pkg) {
  const F = [], add = (ruleId, severity, file, contentId, fieldPath, expected, observed, hint) => F.push({ ruleId, severity, file, contentId, fieldPath, expected, observed, hint });
  const P = 'content/coalition/', D = pkg.data, pol = pkg.policy;
  const contract = pkg.manifest.contract;

  // C15: every file declares the package contract
  for (const k of Object.keys(pkg.manifest.files)) if (pkg[k].contract !== contract) add('C15', 'error', P + pkg.manifest.files[k], k, 'contract', contract, pkg[k].contract, 'Update the file to the package contract or migrate it.');
  if (pol.contract !== contract) add('C15', 'error', 'content/policy.json', 'policy', 'contract', contract, pol.contract, 'Policy and package must share a contract.');

  // schemas (structural failures are C01: the field is not a declared, well-formed content field)
  for (const k of ['ui', 'markers', 'tutorials', 'glossary', 'facts', 'credits']) for (const e of schemaErrors(pkg.schemas[k], pkg[k], k)) add('C01', 'error', P + pkg.manifest.files[k], k, e.at, e.expected, e.observed, 'Fix the field to match content/schema/' + k + '.schema.json.');

  // C01: unique IDs
  const dup = (list, key, file, label) => { const seen = new Set(); list.forEach((e, i) => { if (seen.has(e[key])) add('C01', 'error', file, e[key], `${label}[${i}].${key}`, 'a unique ID', e[key], 'Rename one of the entries; IDs never repeat.'); seen.add(e[key]); }); };
  dup(pkg.ui.entries, 'id', P + 'ui.json', 'entries'); dup(pkg.markers.markers, 'code', P + 'markers.json', 'markers');
  for (const t of pkg.tutorials.tutorials) dup(t.steps, 'id', P + 'tutorials.json', `tutorials.${t.id}.steps`);
  for (const [coll, list] of [['EVENTS', D.EVENTS], ['GOV_EVENTS', D.GOV_EVENTS]]) { dup(list, 'id', 'src/data.js', coll); for (const e of list) dup(e.choices, 'id', 'src/data.js', `${coll}.${e.id}.choices`); }

  // C02: placeholders and declared arguments agree
  const UI = {}; for (const e of pkg.ui.entries) UI[e.id] = e;
  const MK = {}; for (const e of pkg.markers.markers) MK[e.code] = e;
  for (const [file, list, key] of [[P + 'ui.json', pkg.ui.entries, 'id'], [P + 'markers.json', pkg.markers.markers, 'code']]) for (const e of list) {
    const used = [...new Set((e.text.match(/\{(\w+)\}/g) || []).map(x => x.slice(1, -1)))], decl = e.args || [];
    for (const a of used) if (!decl.includes(a)) add('C02', 'error', file, e[key], 'text', `{${a}} declared in args`, `undeclared {${a}}`, `Add "${a}" to args or remove the placeholder.`);
    for (const a of decl) if (!used.includes(a)) add('C02', 'warn', file, e[key], 'args', `{${a}} used in text`, 'declared but unused', 'Remove the argument or use it.');
  }

  // C02: code references resolve, and calls pass the declared arguments
  for (const [file, src] of Object.entries(pkg.sources)) {
    const re = /\b(?:T|H|C\.t|Content\.t|Content\.html)\(\s*'([a-z0-9_.]+)'\s*(?:,\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\})?/g; let m;
    while ((m = re.exec(src))) {
      const id = m[1], line = src.slice(0, m.index).split('\n').length;
      if (!UI[id]) { add('C02', 'error', file, id, `line ${line}`, 'an ID in ui.json', 'unknown ID', 'Add the entry to content/coalition/ui.json or fix the ID.'); continue; }
      const passed = m[2] === undefined ? [] : m[2].split(/,(?![^{(]*[})])/).map(x => x.trim().split(':')[0].trim()).filter(Boolean);
      for (const a of UI[id].args || []) if (!passed.includes(a)) add('C02', 'error', file, id, `line ${line}`, `argument ${a}`, `passed ${passed.join(', ') || 'nothing'}`, `Pass ${a} from the evaluated rules.`);
    }
    const re2 = /\bM\(\s*[^,]+,\s*'([a-z]+\.[a-z_]+)'/g;
    while ((m = re2.exec(src))) if (!MK[m[1]]) add('C02', 'error', file, m[1], `line ${src.slice(0, m.index).split('\n').length}`, 'a code in markers.json', 'unknown marker', 'Add the marker wording or fix the code.');
    for (const r of src.matchAll(/\{\{[cb]:([a-z0-9_.]+)\}\}/g)) if (!UI[r[1]]) add('C02', 'error', file, r[1], 'markup', 'an ID in ui.json', 'unknown ID', 'Add the entry to ui.json.');
  }

  // C02: tutorial references point at real actions, calls, options and controls
  const approaches = new Set([...D.LEVELS.flatMap(L => L.approaches.map(a => a.id)), ...D.GOV_ORDERS.map(o => o.id)]);
  const calls = new Set([...Object.keys(D.ARRANGEMENTS), 'req:hold', 'req:ban', 'req:operator']);
  const ids = new Set(); for (const s of [pkg.sources['src/data.js'], pkg.sources['src/sim.js'], pkg.sources['src/gov.js']]) for (const r of s.matchAll(/\bid: '([a-z_0-9]+)'/g)) ids.add(r[1]);
  const shell = pkg.sources['src/shell.html'] || '';
  for (const t of pkg.tutorials.tutorials) for (const st of t.steps) {
    const cid = `tutorial.${t.id}.${st.id}`, a = st.allow || {};
    for (const x of a.approaches || []) if (!approaches.has(x)) add('C02', 'error', P + 'tutorials.json', cid, 'allow.approaches', 'an approach or order ID', x, 'Use an ID from LEVELS or GOV_ORDERS.');
    for (const x of a.calls || []) if (!calls.has(x)) add('C02', 'error', P + 'tutorials.json', cid, 'allow.calls', 'an arrangement or request', x, 'Use an arrangement ID or req:hold, req:ban, req:operator.');
    for (const x of a.options || []) if (!ids.has(x)) add('C02', 'error', P + 'tutorials.json', cid, 'allow.options', 'a message or choice option ID', x, 'Use an option ID the rules define.');
    for (const q of st.highlight || []) { const id = (q.match(/#([\w-]+)/) || [])[1]; if (id && !new RegExp(`id="${id}"`).test(shell)) add('C02', 'error', P + 'tutorials.json', cid, 'highlight', 'a control in the page', q, 'Point at an element that exists at every width.'); }
    if (st.kind === 'act' && !st.done) add('C02', 'error', P + 'tutorials.json', cid, 'done', 'a completion condition', 'missing', 'Act steps need a done condition.');
  }

  // C02: rule records reference real effects, cards and people
  const fxKeys = pkg.schemas.records.effects;
  const walkFx = (fx, side, cid, at) => { if (!fx) return; for (const k in fx) {
    if (!fxKeys[side].includes(k)) add('C02', 'error', 'src/data.js', cid, at + '.' + k, `an effect in records.schema effects.${side}`, k, 'Use a known effect or add it to the rules and schema together.');
    if (k === 'roll') { for (const rk in fx.roll) if (!fxKeys.roll.includes(rk)) add('C02', 'error', 'src/data.js', cid, `${at}.roll.${rk}`, 'need, win or lose', rk, 'Fix the roll field.'); walkFx(fx.roll.win, side, cid, at + '.roll.win'); walkFx(fx.roll.lose, side, cid, at + '.roll.lose'); }
    if (k === 'card') { const cards = side === 'gov' ? D.GOV_CARDS : D.CARDS; if (!cards[fx.card]) add('C02', 'error', 'src/data.js', cid, at + '.card', 'a card ID', fx.card, 'Use a card that exists.'); }
    if (k === 'trust') for (const p in fx.trust) if (!D.PEOPLE[p]) add('C02', 'error', 'src/data.js', cid, at + '.trust.' + p, 'a person ID', p, 'Use a person from PEOPLE.');
  } };
  for (const e of D.EVENTS) { for (const e2 of schemaErrors(pkg.schemas.records.$defs.event, e, 'EVENTS.' + e.id, pkg.schemas.records)) add('C01', 'error', 'src/data.js', 'event.' + e.id, e2.at, e2.expected, e2.observed, 'Fix the record shape.'); for (const c of e.choices) walkFx(c.fx, 'escape', `event.${e.id}.${c.id}`, 'fx'); }
  for (const e of D.GOV_EVENTS) { for (const e2 of schemaErrors(pkg.schemas.records.$defs.event, e, 'GOV_EVENTS.' + e.id, pkg.schemas.records)) add('C01', 'error', 'src/data.js', 'gov_event.' + e.id, e2.at, e2.expected, e2.observed, 'Fix the record shape.'); for (const c of e.choices) walkFx(c.fx, 'gov', `gov_event.${e.id}.${c.id}`, 'fx'); }
  // C02: declarative conditions name a declared fact, and the operator and value suit its type (pbbg-content-schema CONDITION)
  const FACTS = {}; for (const f of pkg.facts.facts) FACTS[f.id] = f;
  for (const [coll, list, pre] of [['EVENTS', D.EVENTS, 'event'], ['GOV_EVENTS', D.GOV_EVENTS, 'gov_event']]) for (const e of list) {
    if (typeof e.cond === 'function') add('C02', 'error', 'src/data.js', `${pre}.${e.id}`, 'cond', 'a declarative when condition', 'a function', 'Express the test as { ref, op, value } against a fact in content/coalition/facts.json.');
    (e.when || []).forEach((c, i) => { const f = FACTS[c.ref], at = `when[${i}]`;
      if (!f) { add('C02', 'error', 'src/data.js', `${pre}.${e.id}`, at + '.ref', 'a fact declared in facts.json', c.ref, 'Declare the fact or correct the reference.'); return; }
      if (typeof c.value !== f.type || (c.op === 'gte' && f.type !== 'number') || (c.op === 'contains' && f.type !== 'string')) add('C02', 'error', 'src/data.js', `${pre}.${e.id}`, at, `eq for any type, gte for numbers, contains for strings; value of type ${f.type}`, `${c.op} ${JSON.stringify(c.value)}`, 'Match the operator and value to the fact type.'); });
  }

  // texts by scope for C05, C06, C10, C11
  const texts = [];
  for (const e of pkg.ui.entries) texts.push({ file: P + 'ui.json', id: e.id, field: 'text', text: e.text, scope: 'system', pattern: e.pattern, fragment: !!e.fragment });
  for (const e of pkg.markers.markers) texts.push({ file: P + 'markers.json', id: e.code, field: 'text', text: e.text, scope: 'system', pattern: e.pattern });
  for (const t of pkg.tutorials.tutorials) for (const st of t.steps) for (const f of ['title', 'body']) texts.push({ file: P + 'tutorials.json', id: `tutorial.${t.id}.${st.id}`, field: f, text: st[f], scope: 'system', pattern: 'P13' });
  { const cr = pkg.credits; for (const f of ['title', 'lede', 'licenses', 'back']) texts.push({ file: P + 'credits.json', id: 'credits', field: f, text: cr[f], scope: 'system', pattern: 'P02' });
    cr.sections.forEach((s, i) => { texts.push({ file: P + 'credits.json', id: `credits.${i}`, field: 'heading', text: s.heading, scope: 'system', pattern: 'P02' }); if (s.note) texts.push({ file: P + 'credits.json', id: `credits.${i}`, field: 'note', text: s.note, scope: 'system', pattern: 'P09' });
      s.items.forEach((it, n) => { for (const f of ['role', 'name', 'note']) if (it[f]) texts.push({ file: P + 'credits.json', id: `credits.${i}.${n}`, field: f, text: it[f], scope: 'system', pattern: 'P09' }); }); }); }
  for (const [coll, list, pre] of [['EVENTS', D.EVENTS, 'event'], ['GOV_EVENTS', D.GOV_EVENTS, 'gov_event']]) for (const e of list) {
    for (const f of ['title', 'text']) texts.push({ file: 'src/data.js', id: `${pre}.${e.id}`, field: f, text: e[f], scope: 'narrative', pattern: f === 'title' ? 'P10' : 'P07' });
    for (const c of e.choices) { texts.push({ file: 'src/data.js', id: `${pre}.${e.id}.${c.id}`, field: 'label', text: c.label, scope: 'narrative', pattern: 'P01' }); const says = []; const walk = (fx) => { if (!fx) return; if (fx.say) says.push(fx.say); if (fx.roll) { walk(fx.roll.win); walk(fx.roll.lose); } }; walk(c.fx); says.forEach((s, i) => texts.push({ file: 'src/data.js', id: `${pre}.${e.id}.${c.id}`, field: `say[${i}]`, text: s, scope: 'narrative', pattern: 'P10' })); }
  }
  for (const x of texts) {
    if (typeof x.text !== 'string') continue;
    for (const p of pol.prohibited) { const hit = p.regex ? new RegExp(p.match, p.flags || '').test(x.text) : x.text.includes(p.match); if (hit) add(p.rule, p.severity, x.file, x.id, x.field, `no ${p.id}`, x.text.slice(0, 80), p.hint); }
    if (/<[a-z/][^>]*>/i.test(x.text)) add('C10', 'error', x.file, x.id, x.field, 'plain text with **bold** only', x.text.slice(0, 80), 'Remove the markup; use **bold** or a blank line for a new paragraph.');
    for (const c of pkg.glossary.concepts) { if (c.scope === 'system' && x.scope !== 'system') continue; for (const bad of c.prohibited) if (new RegExp(`\\b${bad}\\b`, 'i').test(x.text)) add('C05', 'error', x.file, x.id, x.field, `use ${c.approved[0]}`, bad, `Use the approved term for ${c.id}.`); }
    if (x.pattern === 'P01' && x.scope === 'system') {
      if (/[.!]$/.test(x.text.trim())) add('C06', 'error', x.file, x.id, x.field, 'no terminal punctuation on a label', x.text, 'Drop the final period.');
      if (/^[a-z]/.test(x.text) && !/^\{/.test(x.text) && !x.fragment) add('C06', 'warn', x.file, x.id, x.field, 'sentence case', x.text, 'Start labels with a capital unless the label is a fragment inside another label.');
      const w = x.text.replace(/\{\w+\}/g, 'X').split(/\s+/).length; if (w > pol.budgets.P01.maxWords) add('C06', 'warn', x.file, x.id, x.field, `${pol.budgets.P01.maxWords} words or fewer`, `${w} words`, 'Shorten the label or move the detail into the preview.');
    }
    if (x.pattern === 'P13' && x.field === 'body') { const n = (x.text.match(/\b(Choose|Select|Press|Call|Tap)\b/g) || []).length; if (n > pol.budgets.P13.maxInstructions + 1) add('C13', 'warn', x.file, x.id, x.field, `${pol.budgets.P13.maxInstructions} instruction per step`, `${n} instructions`, 'Split the step or cut an instruction.'); }
  }

  // C12: prose written into code. The baseline lists what predates the catalog and can only shrink.
  const scanned = Object.keys(pkg.sources).filter(f => f.endsWith('.js') && !/data\.js$|content\.js$/.test(f));
  const found = {};
  for (const f of scanned) { found[f] = []; for (const l of literals(pkg.sources[f])) { const p = prose(l.text); if (p && !pol.technical.includes(l.text) && !pol.technical.includes(p)) found[f].push({ p, line: l.line }); } }
  const base = pkg.baseline || {};
  for (const f of scanned) { const allowed = new Set(base[f] || []); for (const x of found[f]) if (!allowed.has(x.p)) add('C12', 'error', f, f + ':' + x.line, `line ${x.line}`, 'player-facing text from content/coalition/ui.json', x.p.slice(0, 80), "Add a catalog entry and call T('id', values). The C12 baseline does not take new strings."); }
  return { findings: F, found };
}

function report(F) {
  const order = { error: 0, warn: 1, info: 2 };
  F.sort((a, b) => order[a.severity] - order[b.severity] || a.ruleId.localeCompare(b.ruleId));
  for (const f of F) if (f.severity !== 'info') console.log(`${f.severity.toUpperCase()} ${f.ruleId} ${f.file} ${f.contentId} ${f.fieldPath}\n  expected: ${f.expected}\n  observed: ${f.observed}\n  hint: ${f.hint}`);
  const n = (s) => F.filter(f => f.severity === s).length;
  console.log(`content-check: ${n('error')} errors, ${n('warn')} warnings`);
  return n('error');
}

if (require.main === module) {
  const arg = process.argv[2];
  const pkg = loadPackage();
  if (arg === '--init-baseline') {
    if (pkg.baseline) { console.error('A baseline exists. It can only shrink: use --shrink.'); process.exit(1); }
    const { found } = check(Object.assign({}, pkg, { baseline: {} })); const b = {}; for (const f in found) b[f] = [...new Set(found[f].map(x => x.p))].sort();
    fs.writeFileSync(path.join(CDIR, 'c12-baseline.json'), JSON.stringify(b, null, 1) + '\n'); console.log('baseline written:', Object.entries(b).map(([f, l]) => `${f} ${l.length}`).join(', ')); process.exit(0);
  }
  if (arg === '--shrink') {
    const { found } = check(pkg); const b = {}; for (const f in pkg.baseline) { const still = new Set((found[f] || []).map(x => x.p)); b[f] = pkg.baseline[f].filter(p => still.has(p)); }
    fs.writeFileSync(path.join(CDIR, 'c12-baseline.json'), JSON.stringify(b, null, 1) + '\n'); console.log('baseline now:', Object.entries(b).map(([f, l]) => `${f} ${l.length}`).join(', ')); process.exit(0);
  }
  if (arg === '--fixtures') {
    let bad = 0; const dir = path.join(CDIR, 'fixtures');
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json')).sort()) {
      const fx = json(path.join(dir, f)), p = JSON.parse(JSON.stringify(Object.assign({}, pkg, { data: null }))); p.data = pkg.data;
      const apply = (target, patch) => { for (const k in patch) { if (Array.isArray(patch[k]) && k.endsWith('+')) target[k.slice(0, -1)].push(...patch[k]); else if (patch[k] && typeof patch[k] === 'object' && !Array.isArray(patch[k]) && target[k] && typeof target[k] === 'object') apply(target[k], patch[k]); else target[k] = patch[k]; } };
      apply(p, fx.patch || {});
      if (fx.records) { p.data = Object.assign({}, pkg.data); for (const k in fx.records) p.data[k] = pkg.data[k].concat(fx.records[k]); }
      const got = check(p).findings.filter(x => x.severity === 'error').map(x => x.ruleId);
      const ok = fx.expect.every(r => got.includes(r));
      console.log(`${ok ? 'caught ' : 'MISSED '} ${f}: expected ${fx.expect.join(', ')}; got ${[...new Set(got)].join(', ') || 'nothing'}`);
      if (!ok) bad += 1;
    }
    process.exit(bad ? 1 : 0);
  }
  const { findings } = check(pkg);
  if (arg === '--json') { console.log(JSON.stringify(findings, null, 1)); process.exit(findings.some(f => f.severity === 'error') ? 1 : 0); }
  process.exit(report(findings) ? 1 : 0);
}
module.exports = { check, loadPackage, schemaErrors };
