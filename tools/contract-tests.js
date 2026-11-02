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
// ---- C03: every move's roll uses its hidden target, at every stop, on both candidates (nothing is displayed)
{ let checked = 0, wrong = [];
  for (const who of ['woman', 'man']) for (let pos = 0; pos < Data.LEVELS.length; pos++) for (const night of [14, 22]) {
    const base = Sim.newRun(77, who); base.pos = pos; base.hour = night - 14 + 24; base.event = null; base.nextEventAt = 999;
    for (const a of Sim.actions(base).approaches.filter(a => a.ok && !a.noRoll && a.real >= 2 && a.real <= 20)) {
      for (const die of [a.real, a.real - 1]) {
        const s = Sim.restore(Sim.serialize(base)); s._dice = [die]; s.nextEventAt = 999;
        const r = Sim.commit(s, a.id); const roll = r.events.find(e => e.type === 'roll' && !e.who); checked += 1;
        if (!roll || roll.won !== Data.DICE.wins(die, a.real)) wrong.push(`${who} ${Data.LEVELS[pos].short} ${a.id}: hidden target ${a.real}, die ${die}, won ${roll && roll.won}`);
      }
    }
  }
  ok(!wrong.length && checked > 0, `C03 escape: ${checked} rolls use the move's hidden target${wrong.length ? ': ' + wrong.slice(0, 3).join('; ') : ''}`); }
{ const L = Data.LEVELS[1], a = L.approaches.find(x => x.id === 'known_car') || L.approaches[0], before = a.hours;
  const s = Sim.newRun(77, 'woman'); s.pos = 1; const shown = () => Sim.actions(s).approaches.find(x => x.id === a.id);
  const h0 = shown().hours; a.hours = before + 3; const after = shown(); a.hours = before;
  ok(after.hours === h0 + 3 && after.preview.join(' ').includes(String(h0 + 3)), `C03 escape: changing ${a.id} from ${h0} to ${h0 + 3} hours changes the button and the preview without editing text`); }
{ let checked = 0, wrong = [];
  for (let i = 0; i < 20; i++) { const g = Gov.newRun(300 + i, 'woman'); g.belief = i % 5; g.c.hour = 13;
    for (const o of Gov.view(g).orders.filter(o => o.ok && o.real >= 2 && o.real <= 20)) { const h = Gov.restore(Gov.serialize(g)); h._dice = [o.real]; const r = Gov.commit(h, o.id); const roll = r.events.find(e => e.type === 'roll'); checked += 1; if (!roll || !roll.won) wrong.push(`${o.id}: hidden target ${o.real} did not win on a die of ${o.real}`); } }
  ok(!wrong.length && checked > 0, `C03 government: ${checked} orders roll against their hidden target${wrong.length ? ': ' + wrong.slice(0, 3).join('; ') : ''}`); }

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


// ---- C16: one 20-sided die everywhere (owner, Oct. 31, 2026: aggregate win rates hid four six-sided leftovers,
// so every roll target, preview, news chip, computer decision and scripted demo is checked directly)
{ const fs = require('fs'), R = path.join(__dirname, '..');
  // 1. no six-sided arithmetic left in the game or its bots
  const SIX = [/need\s*<=\s*\(?[56]\b/, /need\s*<=\s*\(\s*\w+\s*\?\s*[56]/, /need\s*>\s*6\b/, /need\s*<\s*7\b/, /_rng\(\)\s*\*\s*6\b/, /%\s*6\)\s*\]/, /\bin 6\b/, /chances in six/, /7\s*-\s*need/, /one more on the die/, /on a [1-6] or better/];
  const files = ['src/sim.js', 'src/gov.js', 'src/ui.js', 'src/data.js', 'content/coalition/tutorials.json', 'src/render.js', 'tools/calibrate.js', 'tools/gov-calibrate.js', 'tools/sample-run.js', 'content/coalition/ui.json', 'content/coalition/markers.json'];
  const hits = []; for (const f of files) { if (!fs.existsSync(path.join(R, f))) continue; fs.readFileSync(path.join(R, f), 'utf8').split('\n').forEach((l, i) => { for (const re of SIX) if (re.test(l)) hits.push(`${f}:${i + 1} ${re}`); }); }
  ok(!hits.length, `C16 no six-sided rule is left in the game, catalog or bots${hits.length ? ': ' + hits.slice(0, 4).join('; ') : ''}`);
  // 2. no move or order view shows a target or a chance; the roll still uses the hidden real target (owner, Nov. 1, 2026: no odds anywhere)
  let shown = 0, bad = [];
  const leaks = (txt) => /\b(or higher|\d+% chance|roll \d+|needed \d+|needs \d+)\b/i.test(txt.replace(/police attention is \d+ or higher/g, '')); // a police attention threshold is a rule, not a die target
  for (let i = 0; i < 6; i++) { const s = Sim.newRun(900 + i, i % 2 ? 'man' : 'woman'); for (let p = 0; p < Data.LEVELS.length; p++) { s.pos = p;
    for (const a of Sim.actions(s).approaches) { if (a.noRoll) continue; shown += 1; if (leaks(a.odds + ' ' + a.preview.join(' ')) || /\d/.test(a.odds)) bad.push(`${a.id}: "${a.odds}"`);
      const die = a.real <= 20 ? a.real : 20, h = Sim.restore(Sim.serialize(s)); h.nextEventAt = 999; h._dice = [die]; const r = Sim.commit(h, a.id); const roll = r.ok && r.events.find(e => e.type === 'roll' && !e.who); if (r.ok && roll && roll.won !== Data.DICE.wins(die, a.real)) bad.push(`${a.id}: roll ignores the real target`); } } }
  for (let i = 0; i < 4; i++) { const g = Gov.newRun(300 + i, 'woman'); g.belief = i % 5; g.c.hour = 13; for (const o of Gov.view(g).orders) { shown += 1; if (leaks(o.odds + ' ' + o.preview.join(' ')) || /\d/.test(o.odds)) bad.push(`order ${o.id}: "${o.odds}"`); } }
  ok(!bad.length && shown > 40, `C16 ${shown} move and order views carry no target or chance, and rolls use the hidden target${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}`);
  // 3. news chips, result lines and logs carry no target either
  let news = 0; bad = [];
  for (const def of Data.EVENTS) for (const c of def.choices) { const s = Sim.newRun(77, 'woman'); s.event = { kind: 'event', id: def.id }; const v = Sim.actions(s).event; const vc = v && v.choices.find(x => x.id === c.id); if (!vc) continue; news += 1; if (vc.tags.some(t => leaks(t.t) || /\d+ or/.test(t.t))) bad.push(`escape ${def.id}/${c.id}`); }
  for (const def of Data.GOV_EVENTS) for (const c of def.choices) { const g = Gov.newRun(77, 'woman'); g.event = { id: def.id }; const v = Gov.view(g).event; const vc = v && v.choices.find(x => x.id === c.id); if (!vc) continue; news += 1; if ((vc.tags || []).some(t => leaks(t.t))) bad.push(`government ${def.id}/${c.id}`); }
  { const fs = require('fs'), cat = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content/coalition/ui.json'), 'utf8')).entries; for (const e of cat) if (/\{need\}|\{pct\}|\{odds\}|\{turned\}/.test(e.text)) bad.push(`catalog ${e.id} still carries a target`); }
  ok(!bad.length && news > 10, `C16 ${news} news choices, and every catalog line, carry no target or chance${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}`);
  // 4. the computer-played candidate on the government side takes moves harder than the old six-sided cut (target above 6)
  let hard = 0, moves = 0; const orig = Sim.commit;
  Sim.commit = function (st, id, o) { const r = orig.apply(this, arguments); if (st._probe) for (const e of (r.events || [])) if (e.type === 'roll' && !e.who && !e.auto) { moves += 1; if (e.hard) hard += 1; } return r; };
  for (let i = 0; i < 12; i++) { const g = Gov.newRun(400 + i, 'woman'); g.c._probe = true; for (let k = 0; k < 40 && !g.over; k++) { const v = Gov.view(g); if (v.event) Gov.commit(g, 'evt:' + v.event.choices.find(c => c.ok).id); else if (v.messages.length) Gov.commit(g, v.messages[0].id, v.messages[0].options[0].id); else Gov.commit(g, 'wait'); } }
  Sim.commit = orig;
  ok(moves > 20 && hard > 0, `C16 the computer-played candidate rolled ${moves} moves, ${hard} of them with a target above 6`);
  // 5. scripted demos roll 20-sided values
  const T2 = JSON.parse(fs.readFileSync(path.join(R, 'content/coalition/tutorials.json'), 'utf8')); const dice = []; JSON.stringify(T2, (k, v) => { if (k === 'dice' && Array.isArray(v)) dice.push(...v); return v; });
  ok(dice.length > 5 && dice.every(d => Number.isInteger(d) && d >= 1 && d <= 20) && dice.some(d => d > 6), `C16 ${dice.length} scripted demo dice are 20-sided values`); }


// ---- C04b: what the government player is told never carries her hidden state (owner, Nov. 1, 2026)
{ const bad = []; let seen = 0;
  for (let i = 0; i < 16; i++) { const g = Gov.newRun(700 + i, i % 2 ? 'man' : 'woman');
    for (let k = 0; k < 40 && !g.over; k++) { const v = Gov.view(g); let r;
      if (v.event) r = Gov.commit(g, 'evt:' + v.event.choices.find(c => c.ok).id);
      else if (v.messages.length) r = Gov.commit(g, v.messages[0].id, v.messages[0].options[k % v.messages[0].options.length].id);
      else { const o = v.orders.filter(o => o.ok); r = Gov.commit(g, o.length ? o[k % o.length].id : 'wait'); }
      for (const e of (r.events || [])) { seen += 1;
        if (['exposure', 'stage', 'card', 'cardlost', 'travel', 'betrayal', 'hold'].includes(e.type)) bad.push(`seed ${700 + i}: ${e.type} event`);
        if (e.type === 'roll' && e.who && !e.pressed) bad.push(`seed ${700 + i}: her ally's roll`);
        if ((e.type === 'enemy' || e.type === 'say') && /\b(you are(?! not told)|your (jet|last call|own|yacht)|find you|seen you|hold you)\b(?! not told)/i.test(e.text || '')) bad.push(`seed ${700 + i}: "${e.text.slice(0, 60)}"`); } } }
  ok(!bad.length && seen > 200, `C04b government: ${seen} events carry none of her hidden state and never speak to her as "you"${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}`); }
// ---- C17: no code hidden behind a line comment (a comment swallowed a "break" twice on Nov. 1, 2026)
{ const fs = require('fs'), hits = [];
  for (const f of ['src/sim.js', 'src/gov.js', 'src/ui.js', 'src/render.js', 'src/tutorial.js']) fs.readFileSync(path.join(__dirname, '..', f), 'utf8').split('\n').forEach((l, i) => { const c = l.indexOf(' // '); if (c >= 0 && /\b(break;|case '|Render\.enqueue\(|return [^;]*;)/.test(l.slice(c)) && !/['"`]/.test(l.slice(c).split(/break;|case '/)[0].slice(4, 6))) hits.push(`${f}:${i + 1}`); });
  ok(!hits.length, `C17 no statement sits inside a line comment${hits.length ? ': ' + hits.slice(0, 4).join(', ') : ''}`); }

// ---- C20: every answered choice names itself; a rumor answer once read "You chose \"undefined.\"" (owner screenshot, Nov. 1, 2026)
{ let n = 0; const bad = [];
  for (let seed = 1; seed <= 40; seed++) { const s = Sim.newRun(seed, seed % 2 ? 'man' : 'woman', { dest: 'atlanta' });
    for (let k = 0; k < 160 && !s.over; k++) { const A = Sim.actions(s);
      if (A.event) { const cs = A.event.choices.filter(x => x.ok); const r = Sim.commit(s, 'evt:' + cs[k % cs.length].id); for (const e of r.events || []) if (e.type === 'chose') { n += 1; if (!e.label || /undefined|null/.test(e.label)) bad.push(`seed ${seed}: ${A.event.kind}`); } continue; }
      if (A.messages.length) { Sim.commit(s, A.messages[0].id, A.messages[0].options.find(o => o.ok).id); continue; }
      const a = A.approaches.find(x => x.ok); Sim.commit(s, a ? a.id : 'wait'); } }
  ok(!bad.length && n > 100, `C20 ${n} answered choices all carry their label${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}`); }

// ---- C18: the player is never told in advance that a move will or will not work (owner, Nov. 1, 2026)
{ const fs = require('fs'), R = path.join(__dirname, '..'), hits = [];
  const texts = [fs.readFileSync(path.join(R, 'content/coalition/ui.json'), 'utf8'), fs.readFileSync(path.join(R, 'content/coalition/markers.json'), 'utf8'), fs.readFileSync(path.join(R, 'content/coalition/tutorials.json'), 'utf8'), fs.readFileSync(path.join(R, 'src/data.js'), 'utf8')].join('\n');
  for (const re of [/cannot succeed/i, /will (not )?work\b/i, /guaranteed/i, /\bnever pay\b/i, /this (will|cannot) (fail|succeed)/i, /impossible/i, /\b0% chance/]) if (re.test(texts)) hits.push(String(re));
  // and no move or order shows a target above 20 or a chance of 0
  for (let i = 0; i < 4; i++) { const s = Sim.newRun(950 + i, 'woman'); for (let p = 0; p < Data.LEVELS.length; p++) { s.pos = p; for (const a of Sim.actions(s).approaches) if (!a.noRoll && (a.need > 20 || a.pct <= 0 || /impossible|cannot/i.test(a.odds + a.preview.join(' ')))) hits.push(`${a.id}: need ${a.need}, ${a.odds}`); } }
  ok(!hits.length, `C18 no text or move view tells the player an outcome in advance${hits.length ? ': ' + hits.slice(0, 4).join('; ') : ''}`); }


// ---- C19: the bots and the computer-played candidate decide from facts, never from display chips (a removed chip moved calibration on Nov. 1, 2026)
{ const fs = require('fs'), hits = [];
  for (const f of ['src/gov.js', 'tools/calibrate.js', 'tools/sample-run.js']) fs.readFileSync(path.join(__dirname, '..', f), 'utf8').split('\n').forEach((l, i) => { if (/\.tags\.reduce\([^)]*\broll\b/.test(l) || /\btags\.(some|find)\([^)]*(roll|need)/.test(l)) hits.push(`${f}:${i + 1}`); });
  ok(!hits.length, `C19 no bot reads a roll from a display chip${hits.length ? ': ' + hits.join(', ') : ''}`); }

// ---- C21: companions (owner, Nov. 1 and Nov. 2, 2026). Eleven people, each with one escape-side card that never leaves the
// hand, one police-side card of their own, picker wording, a sprite, and an effect on both sides.
{ const fs = require('fs'), R = path.join(__dirname, '..'), cat = new Set(JSON.parse(fs.readFileSync(path.join(R, 'content/coalition/ui.json'), 'utf8')).entries.map(e => e.id));
  const art = fs.readFileSync(path.join(R, 'src/art.js'), 'utf8'), M = Data.COMPANIONS, keys = Object.keys(M), bad = [];
  const ROSTER = ['bruno', 'clara', 'rita', 'marta', 'ines', 'paulo', 'celina', 'tomas', 'nadia', 'emilio', 'joana'];
  if (keys.join() !== ROSTER.join()) bad.push(`roster is ${keys.join(', ')}`);
  const govCards = new Set();
  for (const k of keys) { const m = M[k], c = Data.CARDS[m.card], gc = Data.GOV_CARDS[m.gov];
    if (!c || !c.companion) bad.push(`${k}: escape card`); if (!gc) bad.push(`${k}: police card`); else if (govCards.has(m.gov)) bad.push(`${k}: shares a police card`); govCards.add(m.gov);
    for (const f of ['title', 'escape', 'gov']) if (!cat.has(`mate.${k}.${f}`)) bad.push(`${k}: no mate.${k}.${f}`);
    if (!new RegExp(`\\n\\s+${m.sprite}: \\{`).test(art)) bad.push(`${k}: no sprite`);
    for (const t of [c && c.tag, gc && gc.tag]) if (t && !cat.has('tag.' + t)) bad.push(`${k}: tag.${t} has no player words`); }
  // the eight later companions each carry a kind of help no other card has (Bruno, Clara and Rita keep theirs)
  for (const k of keys.slice(3)) { const t = Data.CARDS[M[k].card].tag; if (Object.keys(Data.CARDS).some(id => id !== M[k].card && Data.CARDS[id].tag === t)) bad.push(`${k}: tag ${t} is shared`); }
  ok(!bad.length, `C21 ${keys.length} companions each have a card, a police card, picker wording, a sprite and player words for their help${bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''}`);
  // a companion travels with you: losing a card at random, or the best card at the station, never takes theirs
  let tries = 0; const lost = [];
  for (const k of keys) for (let i = 0; i < 6; i++) { const s = Sim.newRun(40 + i, 'woman', { companion: k }); s.event = { kind: 'hold', rung: 2 }; s.nextEventAt = 999; s._dice = [1, 1];
    for (const id of ['wait_lawyer']) Sim.commit(s, 'evt:' + id); s.event = { kind: 'event', id: 'flood' }; s._dice = [1]; Sim.commit(s, 'evt:ford'); tries += 1; if (!s.hand.includes(M[k].card)) lost.push(k); }
  ok(!lost.length && tries > 0, `C21 ${tries} stations and floods never take a companion's card${lost.length ? ': ' + [...new Set(lost)].join(', ') : ''}`);
  // every companion changes play on both sides (seeded runs with a fixed simple policy differ from the same runs without them)
  // the calibration bot's policy: news by cheapest markers, messages first, calls before the line, then the easiest move that leaves the stop
  const escape = (seed, who, mate) => { const s = Sim.newRun(seed, who, { dest: 'atlanta', companion: mate });
    for (let k = 0; k < 400 && !s.over; k++) { const A = Sim.actions(s);
      if (A.event) { const score = (c) => (c.rolls ? 1 : 0) + c.tags.reduce((n, t) => n + ({ risk: 4, up: 2, lose: 2, time: 1 }[t.k] || 0) - ({ down: 1, gain: 1 }[t.k] || 0), 0); Sim.commit(s, 'evt:' + A.event.choices.filter(x => x.ok).sort((a, b) => score(a) - score(b))[0].id); continue; }
      if (A.messages.length) { const o = A.messages[0].options.filter(x => x.ok); Sim.commit(s, A.messages[0].id, (o.find(x => x.id.startsWith('celina')) || o[0]).id); continue; }
      { const want = Sim.lodgePick(s); if (want && A.lodge.ok) { Sim.commit(s, 'lodge'); Sim.commit(s, 'evt:' + want); continue; } }
      const calls = A.calls.filter(c => c.ok); if (calls.length && s.pos < 4) { Sim.commit(s, calls[0].id); continue; }
      const L = Data.LEVELS[s.pos], ex = Sim.EXITS[L.id], out = (a) => ex && !ex.includes(a.id) ? 1 : 0;
      const apps = A.approaches.filter(a => a.ok && (a.noRoll || a.real <= 20)).filter(a => { const d = L.approaches.find(x => x.id === a.id); return !(d.success.card && s.hand.includes(d.success.card)); }).sort((a, b) => out(a) - out(b) || (a.real || 0) - (b.real || 0));
      Sim.commit(s, apps.length ? apps[0].id : 'wait'); }
    return Sim.serialize(s).replace(/"companion":"?\w*"?,?/, '').replace(/"hand":\[[^\]]*\],?/, ''); };
  const police = (seed, mate) => { const g = Gov.newRun(seed, 'woman', { companion: mate });
    for (let k = 0; k < 40 && !g.over; k++) { const v = Gov.view(g);
      if (v.event) { const c = v.event.choices.filter(x => x.ok); Gov.commit(g, 'evt:' + c[c.length - 1].id); continue; }
      if (v.messages.length) { Gov.commit(g, v.messages[0].id, 'ask_time'); continue; }
      const call = v.calls.find(c => c.ok); if (call && k % 3 === 0) { Gov.commit(g, call.id); continue; }
      const o = v.orders.filter(x => x.ok); Gov.commit(g, o.length ? o[(k * 7) % o.length].id : 'wait'); }
    return JSON.stringify({ over: g.over && g.over.kind, hour: g.c.hour, reports: g.reports.map(r => r.text), pos: g.c.pos }); };
  const flat = [];
  for (const k of keys) { const esc = [], gov = [];
    for (let seed = 1; seed <= 30; seed++) { if (escape(seed, seed % 2 ? 'man' : 'woman', k) !== escape(seed, seed % 2 ? 'man' : 'woman', null)) esc.push(seed); if (police(500 + seed, k) !== police(500 + seed, null)) gov.push(seed); }
    if (!esc.length) flat.push(`${k} changes no escape run`); if (!gov.length) flat.push(`${k} changes no police run`); }
  ok(!flat.length, `C21 every companion changes seeded runs on the escape side and the police side${flat.length ? ': ' + flat.join('; ') : ''}`);
  // the police view with each companion still ignores her hidden state (C04 with every companion's card in hand)
  let views = 0; const leaks = [];
  for (const k of keys) for (let i = 0; i < 3; i++) { const g = Gov.newRun(620 + i, 'woman', { companion: k });
    for (let step = 0; step < 8 && !g.over; step++) { const v = Gov.view(g); if (v.event) Gov.commit(g, 'evt:' + v.event.choices.find(c => c.ok).id); else if (v.messages.length) Gov.commit(g, v.messages[0].id, 'ask_time'); else { const o = v.orders.filter(o => o.ok); Gov.commit(g, o.length ? o[step % o.length].id : 'wait'); } }
    if (g.over) continue;
    const want = JSON.stringify(Gov.view(g)), real = { pos: g.c.pos, exp: g.c.exposure, arr: JSON.stringify(g.c.arr), hand: g.c.hand.slice() };
    for (let p = 0; p < Data.LEVELS.length; p++) { g.c.pos = p; g.c.exposure = (p * 3) % 10; for (const a in g.c.arr) g.c.arr[a].stage = p % 3; g.c.hand = p % 2 ? [] : real.hand; views += 1; if (JSON.stringify(Gov.view(g)) !== want) leaks.push(`${k} seed ${620 + i}`); }
    g.c.pos = real.pos; g.c.exposure = real.exp; g.c.arr = JSON.parse(real.arr); g.c.hand = real.hand; }
  ok(!leaks.length && views > 100, `C21 ${views} police views with each companion stay identical when her hidden state changes${leaks.length ? ': ' + leaks.slice(0, 3).join('; ') : ''}`);
  // a saved run with a companion resumes with them, on both sides
  const sv = Sim.restore(Sim.serialize(Sim.newRun(9, 'man', { companion: 'joana' }))), gv = Gov.restore(Gov.serialize(Gov.newRun(9, 'woman', { companion: 'nadia' })));
  ok(sv.companion === 'joana' && sv.hand.includes('comp_joana') && gv.companion === 'nadia' && gv.hand.includes('exchange'), 'C21 saved runs keep the companion on both sides'); }

console.log(fails ? `${fails} contract test(s) failed` : 'all contract tests pass');
process.exit(fails ? 1 : 0);
