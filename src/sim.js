/* ============================================================
   COALITION simulation. Pure: no DOM, no p5, no audio. Node-loadable.
   Owns all truth; returns event lists the UI narrates and animates.
   Depth comes from people: who controls what, what they need first,
   what they have confirmed, and what an earlier promise now costs.
   ============================================================ */
'use strict';
const Sim = (() => {
  const D = (typeof Data !== 'undefined') ? Data : require('./data.js');
  // mulberry32 with its state kept ON the run (s._rngState), so a saved run resumes with the same die.
  function attachRng(s) { s._rng = function () { let a = (s._rngState + 0x6D2B79F5) | 0; s._rngState = a; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; return s; }
  const HOURS_TOTAL = 72, EXPOSURE_LIMIT = 10, START_HOUR = 14; // the run opens Saturday 14:00
  const EXITS = { residence: null, road: null, colonia: ['help_host', 'leave'], salta: ['board'], border: null, airfield: ['depart', 'depart_nopermit'] }; // null = every success exits
  const ENEMY_EVERY = 3; // hours between inquiry actions
  const ESMERALDA_FROM = 5; // level index where Valdórian influence stops counting
  const DEADLINE = 46; // Monday 12:00: the passports were due; after it the own passport is cancelled and the ban is everywhere
  const SUSPECTS = ['aide', 'nando', 'host', 'holt', 'theo', 'pilot', 'official'];
  const EVENT_EVERY = 6; // hours at one stop between dispatches
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // opts.dice: a queue of die results used before the rng (the demo). opts.enemy: a queue of
  // enemy action ids used before the weighted draw (the demo). opts.tutorial: a flag the UI reads.
  function newRun(seed, who, opts) {
    opts = opts || {};
    const ch = D.CHARACTERS[who] || D.CHARACTERS.woman;
    const s = {
      seed, who: ch.id, hour: 0, pos: 0, belief: 0, exposure: 1, over: null,
      arr: {}, people: {}, hand: (ch.hand || ['passport', 'decoy_cars', 'aide_word']).slice(), used: [], commitments: [], inbox: [], jobs: [],
      flags: { destination: false, restriction: false, asked: false, leaned: false, enemyDone: {} },
      nextMsg: 1, lastEnemy: 0, visited: [0], tutorial: !!opts.tutorial,
      // the deeper game: one dispatch or hold waits at a time; holds climb a ladder; the passport deadline is Monday noon.
      event: null, seenEvents: [], hold: 0, holds: 0, deadline: DEADLINE, nextEventAt: 6, calledAt: -99, mods: {}, daily: !!opts.daily,
    };
    s.exposure = ch.exposure || 1;
    s._manual = !!opts.manualEnemy; // the government player chooses the inquiry's moves
    s._dice = opts.dice ? opts.dice.slice() : null;
    s._enemy = opts.enemy ? opts.enemy.slice() : null;
    for (const k in D.ARRANGEMENTS) s.arr[k] = { stage: 0 };
    for (const k in D.PEOPLE) s.people[k] = { trust: k === 'sibling' || k === 'nando' ? 2 : 0, turned: false, doubt: false, cut: false, known: false, bad: false };
    s._rngState = seed >>> 0; attachRng(s);
    // Two people on the ground are secretly working for the inquiry. Which two changes every run.
    if (!s.tutorial) { const pool = SUSPECTS.slice(); for (let i = 0; i < 2; i++) { const k = pool.splice(Math.floor(s._rng() * pool.length), 1)[0]; s.people[k].bad = true; } }
    const events = [];
    arrive(s, events, true);
    s._boot = events;
    return s;
  }
  const ev = (type, data) => Object.assign({ type }, data);
  const say = (events, who, text) => { if (text) events.push(ev('say', { who, text })); };
  const roll = (s) => (s._dice && s._dice.length) ? s._dice.shift() : 1 + Math.floor(s._rng() * 6);
  function clockText(h) {
    const t = START_HOUR + h, day = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'][Math.floor(t / 24)];
    return `${day} ${String(t % 24).padStart(2, '0')}:00`;
  }
  const level = (s) => D.LEVELS[s.pos];
  const ch = (s) => D.CHARACTERS[s.who];
  const personName = (s, id) => id === 'sibling' ? ch(s).sibling.name : id === 'self' ? 'you' : (D.PEOPLE[id] && D.PEOPLE[id].name) || id;

  // ---- messages (the phone) ---------------------------------
  function msg(s, events, from, text, options) {
    const m = { id: s.nextMsg++, from, text, options };
    s.inbox.push(m); events.push(ev('message', { id: m.id, from, text }));
  }
  function arrive(s, events, first) {
    const L = level(s);
    events.push(ev('arrive', { level: s.pos }));
    say(events, 'narrator', L.arrive);
    s.nextEventAt = s.hour + EVENT_EVERY; drawEvent(s, events);
    // scripted arrivals: what the phone brings at each level
    if (s.pos === 0 && first) {
      msg(s, events, 'sibling', `"Jet found in Susana. The crew needs a destination. Atlanta, or wait for Salek?"`, [
        { id: 'name_atlanta', label: 'Name Atlanta now', hours: 0, effect: 'Crew booking can proceed. Atlanta has not granted permission yet.' },
        { id: 'wait_sponsor', label: 'Wait until Salek answers', hours: 0, effect: 'Crew booking waits until Salek is engaged.' },
        { id: 'delegate_sibling', label: `Let ${ch(s).sibling.short} decide`, hours: 0, effect: `Needs a ${D.PEOPLE.sibling.reliability}+ roll to name Atlanta; failure delays work six hours.` },
      ]);
    }
    if (s.pos === 1) {
      msg(s, events, 'press', `"Rādiô Portô Venla. We hear you are on a yacht off the coast. Can you confirm?"`, [
        { id: 'confirm_yacht', label: 'Confirm it, from the yacht', hours: 0, effect: 'The inquiry believes the coast for a while. If a friend later turns, the lie costs you.' },
        { id: 'deny_yacht', label: 'Deny it. You are at home.', hours: 0, effect: 'Sends them to the house you just left. Buys less time, costs nothing later.' },
        { id: 'no_comment', label: 'Hang up', hours: 0, effect: 'Nothing changes.' },
      ]);
    }
    if (s.pos === 2 && s.arr.permission.stage >= 1 && !s.flags.salekDue) {
      s.flags.salekDue = true;
      msg(s, events, 'sponsor', `"The transfer papers are with your brother. Sign tonight, or I stop making calls."`, [
        { id: 'sign_accounts', label: 'Sign. Move the family accounts.', hours: 1, effect: 'Salek keeps working. Your family will not forgive this quickly.' },
        { id: 'stall_salek', label: 'Ask for a week', hours: 0, effect: 'Permission stalls twelve hours. He keeps your line open, for now.' },
        { id: 'refuse_salek', label: 'Refuse', hours: 0, effect: 'Lose Salek and his line. Atlanta will not answer. You can still fly without its yes.' },
      ]);
    }
    if (s.pos === 2 && s.arr.reception.stage === 1) {
      msg(s, events, 'sibling', `"Vélez is not answering. I can try again, or ask Salek to reach her uncle."`, [
        { id: 'keep_calling', label: `${ch(s).sibling.short} keeps calling`, hours: 0, effect: 'Try again in six hours. Your sibling must pass a reliability roll.' },
        { id: 'via_sponsor', label: 'Ask Salek to reach the uncle', hours: 0, effect: 'Requires Salek’s help. Confirms reception; you owe him another favor.' },
        { id: 'wait_velez', label: 'Wait', hours: 0, effect: 'Nothing moves until you call her yourself.' },
      ]);
    }
    if (s.pos === 3) {
      msg(s, events, 'holt', `"Two men in a car at the yard gate, asking about a woman. Or a man. Midnight or never."`, [
        { id: 'go_midnight', label: 'Midnight it is', hours: 0, effect: 'Nothing changes. You know the clock now.' },
        { id: 'send_decoy_yard', label: 'Send Nando past the gate first', hours: 0, effect: 'Needs the decoy card. The men follow the sedan; exposure drops.' },
      ]);
      const c = s.commitments.find(x => x.to === 'aide' && x.kept === null);
      if (c) msg(s, events, 'aide', `"The party meets tonight. Send your endorsement before midnight. You gave your word."`, [
        { id: 'keep_word', label: 'Send the statement', hours: 1, effect: 'Keep Gianlūka’s support and gain his informant’s help.' },
        { id: 'break_word', label: 'Put him off', hours: 0, effect: 'Lose Gianlūka’s cards. He reveals your location; exposure rises.' },
      ]);
    }
    if (s.pos === 4 && s.commitments.some(x => x.to === 'official')) {
      msg(s, events, 'official', `"Before my people meet you: you will say, on the record, that Esmeralda receives you as a guest. Not a government."`, [
        { id: 'guest_yes', label: 'Say it', hours: 0, effect: 'Reception stands. The party at home will read it.' },
        { id: 'guest_no', label: 'Refuse', hours: 0, effect: 'Vélez withdraws her officials. Her card still opens the tower, not the post.' },
      ]);
    }
    if (s.pos === 5) {
      msg(s, events, 'enemy', `"Inspector Sosā. Come back for the hearing and this ends quietly. Stay, and your brother's name goes on the warrant too."`, [
        { id: 'sosa_talk', label: 'Keep him talking', hours: 1, effect: 'An hour on the phone. He skips his next move while he thinks you are wavering.' },
        { id: 'sosa_hang', label: 'Hang up', hours: 0, effect: 'Nothing changes.' },
      ]);
    }
    if (s.pos === 5 && s.flags.leaned) {
      msg(s, events, 'pilot', `"Your ministry threatened the operator’s license. He wants Esmeraldan backing or a crew bonus."`, [
        { id: 'crew_bonus', label: 'Pay the crew bonus', hours: 1, effect: 'Restores the aircraft to ready. Exposure rises.' },
        { id: 'velez_word', label: 'Have Vélez call the operator', hours: 0, effect: 'Requires Vélez’s card. Restores the aircraft without raising exposure.' },
        { id: 'ignore_pilot', label: 'Ignore it', hours: 0, effect: 'Aircraft preparations stay on hold.' },
      ]);
    }
  }

  // ---- what you can do right now ------------------------------
  // A card counts only inside its reach. Authority is local: the party stops at the line, Vélez starts there.
  const reaches = (s, id) => { const c = D.CARDS[id]; return !!c && c.reach.includes(level(s).id); };
  function mods(s, L) {
    const out = {};
    for (const id of s.hand) { if (!reaches(s, id)) continue; const c = D.CARDS[id]; out[c.tag] = (out[c.tag] || 0) + 1; }
    return out;
  }
  function hasTag(s, tag) { return s.hand.some(id => D.CARDS[id] && D.CARDS[id].tag === tag && reaches(s, id)); }
  const heldTag = (s, tag) => s.hand.some(id => D.CARDS[id] && D.CARDS[id].tag === tag);
  function isNight(s) { const t = (START_HOUR + s.hour) % 24; return t >= 22 || t < 5; }
  function needText(s, n) {
    if (n.card) return hasTag(s, n.card) ? null : (heldTag(s, n.card) ? `Your ${n.card} card is not recognized here.` : `Needs a ${n.card} card.`);
    if (n.night) return isNight(s) ? null : 'After 22:00.';
    if (n.arr) { const a = s.arr[n.arr]; return a.stage >= n.stage ? null : `Needs: ${D.ARRANGEMENTS[n.arr].stages[n.stage]}.`; }
    return null;
  }
  function approachList(s) {
    const L = level(s), m = mods(s, L), out = [];
    for (const a of L.approaches) {
      const whys = a.needs.map(n => needText(s, n)).filter(Boolean);
      if (s.event) whys.unshift(s.event.kind === 'hold' ? 'You are being held.' : 'Answer the news first.');
      if (a.with && s.people[a.with] && s.people[a.with].cut) whys.push(`You cut off ${personName(s, a.with)}.`);
      else if (a.with && s.people[a.with] && s.people[a.with].turned) whys.push(`${personName(s, a.with)} talked to the inquiry.`);
      let bonus = 0; const used = [];
      for (const tag in a.mods) if (m[tag]) { bonus += a.mods[tag]; used.push({ tag, bonus: a.mods[tag] }); }
      let dc = a.dc;
      if (L.border && s.flags.restriction && !hasTag(s, 'delay')) dc += 1; // the sheet is on the desk unless Gianlūka's contact held it
    if (s.flags.roadblock && s.flags.roadblock.pos === s.pos && s.hour < s.flags.roadblock.until) dc += 1;
      if (L.final && s.flags.asked && s.arr.reception.stage < 2) dc += 2;
      dc += s.mods[s.pos] || 0;
      if (ch(s).faceKnown && L.border && a.id !== 'received') dc += 1; // every officer knows Teresā's face
      if (a.id === 'own_passport' && s.flags.cancelled) dc = 7; // cancelled at Monday noon
      const need = Math.max(1, dc - bonus);
      out.push({ kind: 'approach', id: a.id, name: a.name, hours: a.hours, ok: whys.length === 0, why: whys.join(' '), text: a.text, with: a.with || null, night: a.needs.some(n => n.night),
        odds: need <= 1 ? 'certain' : need > 6 ? 'impossible' : `${7 - need} in 6`, need, dc, bonusFrom: used.map(u => u.tag), bonus: used, pay: !!a.pay,
        preview: [a.text, need <= 1 ? 'Succeeds without a roll.' : need > 6 ? 'Cannot succeed with your current help.' : `Die needs ${need} or more (${7 - need} in 6).${used.length ? ' Your cards lower it: ' + used.map(u => `${u.tag} ${u.bonus}`).join(', ') + '.' : ''}`, `Takes ${a.hours} hour${a.hours === 1 ? '' : 's'}.`] });
    }
    return out;
  }
  // phone calls that push a continuing arrangement one stage, by the ally who controls it
  function callList(s) {
    const out = [], A = s.arr;
    const pending = (k) => s.jobs.find(j => j.arr === k);
    const add = (k, ally, whys, text) => {
      const a = A[k], def = D.ARRANGEMENTS[k];
      if (a.stage >= def.stages.length - 1) return;
      const p = pending(k);
      if (p) { out.push({ kind: 'call', id: 'call:' + k, name: `${def.name}: ${personName(s, ally)} is on it`, ok: false, why: `Resolves at ${clockText(p.due)}.`, hours: 0, preview: [text] }); return; }
      if (s.event) whys.unshift('Answer the news first.');
      out.push({ kind: 'call', id: 'call:' + k, name: `Call ${personName(s, ally)} about ${def.name.toLowerCase()}`, ally, arr: k, ok: whys.length === 0, why: whys.join(' '), hours: 1,
        preview: [text, `Next: ${def.stages[a.stage + 1]}. Reply in ${jobHours(k)} hours. ${personName(s, ally)} needs a roll of ${D.PEOPLE[ally].reliability + (s.people[ally].turned ? 6 : 0)} or more before trust bonuses.`] });
    };
    add('aircraft', 'sibling', [A.aircraft.stage === 1 && !s.flags.destination && A.permission.stage < 1 ? 'Name a destination or engage Salek first.' : null, s.people.sibling.turned ? 'Not answering.' : null].filter(Boolean),
      'Arrange the next stage: charter, crew, fuel or positioning.');
    add('reception', A.reception.stage < 2 ? 'sibling' : 'official',
      [A.reception.stage === 2 && s.pos < 3 ? 'Call from Salta to request officials at the border.' : null].filter(Boolean),
      'Arrange reception through your sibling, then Vélez.');
    add('permission', 'sponsor', [s.pos >= ESMERALDA_FROM && A.permission.stage === 0 ? 'Contact Salek before reaching Susana.' : null].filter(Boolean),
      'Ask Salek to seek Atlanta’s permission. His terms apply.');
    return out;
  }
  const jobHours = (k) => ({ aircraft: 6, reception: 6, permission: 10 })[k];
  function inboxList(s) {
    return s.inbox.map(m => ({ kind: 'message', id: 'msg:' + m.id, msgId: m.id, from: m.from, name: `${personName(s, m.from)}: ${m.text}`, ok: true, hours: 0,
      options: m.options.map(o => Object.assign({}, o, { ok: optionOk(s, o), why: optionWhy(s, o) })) }));
  }
  function optionWhy(s, o) {
    if (o.id === 'via_sponsor' && !heldTag(s, 'permission')) return "You do not have Salek's line yet. Call him about permission first.";
    if (o.id === 'velez_word' && !hasTag(s, 'introduction')) return "You do not have Vélez's card.";
    if (o.id === 'send_decoy_yard' && !heldTag(s, 'decoy')) return 'Nando and the spare cars are gone.';
    if (o.id === 'via_sponsor' && s.people.sponsor.turned) return 'Salek is not taking your calls.';
    return '';
  }
  const optionOk = (s, o) => !optionWhy(s, o) && !s.event;
  function actions(s) { return { event: eventView(s), approaches: approachList(s), calls: callList(s), messages: inboxList(s), wait: { kind: 'wait', id: 'wait', name: 'Lie low one hour', ok: !s.over && !s.event, hours: 1 } }; }

  // ---- dispatches and holds: the News phase --------------------
  const fill = (s, t) => String(t).replace(/\{sib\}/g, ch(s).sibling.short).replace(/\{here\}/g, level(s).short);
  function drawEvent(s, events) {
    if (s.event || s.tutorial || s.over) return;
    const L = level(s);
    // a rumor about someone here, more often about someone who really is selling you out
    const here = Object.keys(D.PEOPLE).filter(k => D.PEOPLE[k].where === s.pos && !s.people[k].known && !s.people[k].turned && !s.people[k].cut && !s.people[k].rumored);
    if (here.length && s._rng() < 0.4) {
      const bad = here.filter(k => s.people[k].bad), who = bad.length && s._rng() < 0.65 ? bad[0] : here[Math.floor(s._rng() * here.length)];
      s.people[who].rumored = true; s.people[who].doubt = true;
      s.event = { kind: 'rumor', who, line: Math.floor(s._rng() * D.RUMORS.length) };
      const v = eventView(s); events.push(ev('dispatch', { id: 'rumor', title: v.title, text: v.text })); return;
    }
    const pool = D.EVENTS.filter(e => (!e.at || e.at.includes(L.id)) && !s.seenEvents.includes(e.id) && (!e.cond || e.cond(s)));
    if (!pool.length) return;
    const pick = pool[Math.floor(s._rng() * pool.length)];
    s.seenEvents.push(pick.id); s.event = { kind: 'event', id: pick.id };
    events.push(ev('dispatch', { id: pick.id, title: fill(s, pick.title), text: fill(s, pick.text) }));
  }
  function climbHold(s, events) {
    if (s.tutorial || s.over) return;
    let r = s.hold + 1; if (s.flags.cancelled && s.hold === 0) r = 2; // after Monday noon the first hold is a station, not a roadside
    s.hold = Math.min(3, r); s.holds += 1; s.belief = s.pos;
    s.event = { kind: 'hold', rung: s.hold };
    events.push(ev('hold', { rung: s.hold, title: D.HOLDS[s.hold].title, text: fill(s, D.HOLDS[s.hold].text) }));
  }
  function choiceWhy(s, c) { for (const n of c.needs || []) { const w = needText(s, n); if (w) return w; } if (c.id === 'embassy' && s.people.sibling.turned) return `${ch(s).sibling.short} is not answering.`; return ''; }
  // Markers: what a choice costs or gives, as short tags the UI shows instead of sentences.
  function fxTags(s, fx, out) {
    out = out || []; if (!fx) return out;
    if (fx.roll) { const need = fx.roll.need + (fx.roll.face && ch(s).faceKnown ? 1 : 0) - (fx.roll.decoy && hasTag(s, 'decoy') ? 1 : 0); out.push({ k: 'roll', t: `Roll ${need}+` }); const lose = fxTags(s, fx.roll.lose, []); if (lose.length) out.push({ k: 'risk', t: 'Fail: ' + lose.map(x => x.t.toLowerCase()).join(', ') }); return out; }
    if (fx.hours) out.push({ k: 'time', t: `${fx.hours} h` });
    if (fx.exposure) out.push({ k: fx.exposure > 0 ? 'up' : 'down', t: `Exposure ${fx.exposure > 0 ? '+' : ''}${fx.exposure}` });
    if (fx.belief === 'away') out.push({ k: 'down', t: 'Sosā looks elsewhere' });
    if (fx.belief === 'here') out.push({ k: 'up', t: 'Sosā finds you' });
    if (fx.card) out.push({ k: 'gain', t: `Card: ${D.CARDS[fx.card].name}` });
    if (fx.lose) out.push({ k: 'lose', t: fx.lose === 'random' || fx.lose === 'best' ? 'Lose a card' : `Lose: ${D.CARDS[fx.lose].name}` });
    if (fx.trust) for (const k in fx.trust) out.push({ k: fx.trust[k] > 0 ? 'gain' : 'lose', t: `${personName(s, k).split(' ')[0]} ${fx.trust[k] > 0 ? 'trusts you more' : 'trusts you less'}` });
    if (fx.doubt) out.push({ k: 'risk', t: `Rely on ${personName(s, fx.doubt).split(' ')[0]}` });
    if (fx.cut) out.push({ k: 'lose', t: `Cut off ${personName(s, fx.cut).split(' ')[0]}` });
    if (fx.test) out.push({ k: 'time', t: 'Learn the truth' });
    if (fx.stage) out.push({ k: 'gain', t: 'Reception moves' });
    if (fx.deadline) out.push({ k: 'up', t: `Deadline ${fx.deadline < 0 ? 'sooner' : 'later'}` });
    if (fx.skipEnemy) out.push({ k: 'down', t: 'Sosā loses a move' });
    if (fx.mod) out.push({ k: fx.mod < 0 ? 'down' : 'up', t: `Rolls here ${fx.mod < 0 ? 'easier' : 'harder'}` });
    if (fx.hold) out.push({ k: 'risk', t: 'Held' });
    if (fx.advance) out.push({ k: 'gain', t: 'Reach the next stop' });
    if (fx.end) out.push({ k: 'risk', t: 'Ends the run' });
    if (fx.flag && fx.flag.dark) out.push({ k: 'up', t: 'Allies slower' });
    return out;
  }
  function eventView(s) {
    const e = s.event; if (!e) return null;
    let def, kind = e.kind;
    if (kind === 'hold') def = D.HOLDS[e.rung];
    else if (kind === 'rumor') { const n = personName(s, e.who); def = { title: `A rumor about ${n.split(' ')[0]}`, text: D.RUMORS[e.line](n), choices: [
      { id: 'trust', label: `Keep trusting ${n.split(' ')[0]}`, fx: { doubt: e.who } },
      { id: 'test', label: 'Test them quietly', fx: { hours: 2, test: e.who } },
      { id: 'cut', label: 'Cut them off', fx: { cut: e.who } } ] }; }
    else def = D.EVENTS.find(x => x.id === e.id);
    return { kind, rung: e.rung || 0, title: fill(s, def.title), text: fill(s, def.text), choices: def.choices.map(c => { const why = choiceWhy(s, c); return { id: c.id, label: fill(s, c.label), ok: !why, why, tags: fxTags(s, c.fx) }; }) };
  }
  function eventDef(s) { const v = s.event; if (v.kind === 'hold') return D.HOLDS[v.rung]; if (v.kind === 'rumor') return { choices: eventView(s).choices.map((c, i) => ({ id: c.id, fx: [{ doubt: v.who }, { hours: 2, test: v.who }, { cut: v.who }][i] })) }; return D.EVENTS.find(x => x.id === v.id); }
  function resolveEvent(s, choiceId, events) {
    if (!s.event) return { ok: false, why: 'No news waiting.' };
    const def = eventDef(s), c = def.choices.find(x => x.id === choiceId); if (!c) return { ok: false, why: 'Pick one of the choices.' };
    const why = choiceWhy(s, c); if (why) return { ok: false, why };
    const was = s.event; s.event = null;
    events.push(ev('chose', { kind: was.kind, label: fill(s, c.label) }));
    if (was.kind === 'hold' && s.hold < 3) s.exposure = Math.max(s.exposure, 0);
    applyFx(s, c.fx, events);
    return finish(s, events);
  }
  function applyFx(s, fx, events) {
    if (!fx || s.over) return;
    if (fx.roll) {
      const need = fx.roll.need + (fx.roll.face && ch(s).faceKnown ? 1 : 0) - (fx.roll.decoy && hasTag(s, 'decoy') ? 1 : 0);
      const die = roll(s), won = die >= need; events.push(ev('roll', { die, need, won }));
      applyFx(s, won ? fx.roll.win : fx.roll.lose, events); return;
    }
    say(events, 'narrator', fx.say);
    if (fx.exposure) heat(s, fx.exposure, events);
    if (fx.belief === 'away') { s.belief = s.pos === 0 ? 1 : s.pos - 1; events.push(ev('belief', { belief: s.belief })); }
    if (fx.belief === 'here') { s.belief = s.pos; events.push(ev('belief', { belief: s.belief })); }
    if (fx.card) gain(s, fx.card, events);
    if (fx.lose) { const pool = s.hand.filter(id => fx.lose === 'best' ? true : id !== 'passport'); let id = fx.lose; if (fx.lose === 'random') id = pool[Math.floor(s._rng() * pool.length)]; if (fx.lose === 'best') id = s.hand.includes('passport') ? 'passport' : pool[Math.floor(s._rng() * pool.length)]; if (id) { lose(s, id, events); s.used.push(id); } }
    if (fx.trust) for (const k in fx.trust) { s.people[k].trust = Math.max(-2, Math.min(3, s.people[k].trust + fx.trust[k])); events.push(ev('trust', { who: k, trust: s.people[k].trust })); }
    if (fx.doubt) s.people[fx.doubt].doubt = true;
    if (fx.cut) { s.people[fx.cut].cut = true; for (const id of s.hand.slice()) if (D.CARDS[id].from === fx.cut) lose(s, id, events); say(events, 'narrator', `You stop answering ${personName(s, fx.cut)}.`); }
    if (fx.test) { const p = s.people[fx.test]; p.known = true; p.doubt = false; if (p.bad) { p.turned = true; for (const id of s.hand.slice()) if (D.CARDS[id].from === fx.test) lose(s, id, events); say(events, 'narrator', `${personName(s, fx.test)} was working for Sosā. You find out before it costs you.`); } else { p.trust = Math.max(p.trust, 2); say(events, 'narrator', `${personName(s, fx.test)} is clean. And offended you asked.`); } }
    if (fx.stage) for (const k in fx.stage) stage(s, k, s.arr[k].stage + fx.stage[k], events);
    if (fx.flag) Object.assign(s.flags, fx.flag);
    if (fx.deadline) { s.deadline = Math.max(s.hour + 1, s.deadline + fx.deadline); }
    if (fx.skipEnemy) s.lastEnemy = s.hour + 3;
    if (fx.mod) s.mods[s.pos] = (s.mods[s.pos] || 0) + fx.mod;
    if (fx.rung !== undefined) s.hold = fx.rung;
    if (fx.end) { s.over = { win: false, kind: fx.end.kind || 'arrest', reason: `${fx.end.reason} ${epilogue(s, false)}` }; events.push(ev('over', s.over)); return; }
    if (fx.hold) climbHold(s, events);
    if (fx.advance) advanceLevel(s, events);
    if (fx.hours) pass(s, fx.hours, events);
  }

  // ---- commit ----------------------------------------------------
  function commit(s, actionId, optionId) {
    if (s.over) return { ok: false, why: 'The run is over.' };
    const events = [];
    if (actionId.startsWith('evt:')) return resolveEvent(s, actionId.slice(4), events);
    if (s.event) return { ok: false, why: s.event.kind === 'hold' ? 'You are being held.' : 'Answer the news first.' };
    if (actionId === 'wait') { pass(s, 1, events); return finish(s, events); }
    if (actionId.startsWith('msg:')) return answer(s, +actionId.slice(4), optionId, events);
    if (actionId.startsWith('call:')) return call(s, actionId.slice(5), events);
    const a = level(s).approaches.find(x => x.id === actionId);
    if (!a) return { ok: false, why: 'Not something you can do here.' };
    const view = approachList(s).find(x => x.id === actionId);
    if (!view.ok) return { ok: false, why: view.why };
    events.push(ev('attempt', { id: a.id, name: a.name }));
    const die = view.need <= 1 ? 6 : roll(s);
    const won = view.need > 6 ? false : die >= view.need;
    events.push(ev('roll', { die, need: view.need, won, bonus: view.bonusFrom }));
    apply(s, won ? a.success : a.fail, events, a);
    // the wrong person to trust: a compromised ally may sell the move
    if (a.with && s.people[a.with] && s.people[a.with].bad && !s.people[a.with].known && s._rng() < 0.6) {
      const p = s.people[a.with]; p.known = true; p.turned = true; s.belief = s.pos; heat(s, 3, events); events.push(ev('belief', { belief: s.belief }));
      say(events, 'narrator', `${personName(s, a.with)} sold you out. Sosā knows where you are.`); events.push(ev('betrayal', { who: a.with }));
    }
    if (won && a.success.win) { s.over = { win: true, kind: 'out', reason: `${a.success.say} ${epilogue(s, true)}` }; events.push(ev('over', s.over)); return { ok: true, events }; }
    pass(s, a.hours + ((won ? a.success : a.fail).hours || 0), events);
    if (won && !s.over) { const exits = EXITS[level(s).id]; if (!exits || exits.includes(a.id)) advanceLevel(s, events); }
    return finish(s, events);
  }
  function apply(s, fx, events, a) {
    if (!fx) return;
    say(events, 'narrator', fx.say);
    if (fx.exposure) heat(s, fx.exposure, events);
    if (fx.belief !== undefined) { s.belief = fx.belief; events.push(ev('belief', { belief: s.belief })); }
    if (fx.card) gain(s, fx.card, events);
    if (fx.trust) { s.people[fx.trust].trust += 1; events.push(ev('trust', { who: fx.trust, trust: s.people[fx.trust].trust })); }
    if (fx.commit) { if (!s.commitments.some(c => c.to === fx.commit)) { s.commitments.push({ to: fx.commit, text: D.PEOPLE[fx.commit].terms, kept: null }); events.push(ev('commit', { to: fx.commit, text: D.PEOPLE[fx.commit].terms })); gain(s, 'delay_report', events); } }
    if (fx.advance) for (const k of fx.advance) stage(s, k, s.arr[k].stage + 1, events);
  }
  function gain(s, id, events) { if (!D.CARDS[id] || s.hand.includes(id) || s.used.includes(id)) return; s.hand.push(id); events.push(ev('card', { id, name: D.CARDS[id].name, from: D.CARDS[id].from })); }
  function lose(s, id, events) { const i = s.hand.indexOf(id); if (i < 0) return; s.hand.splice(i, 1); events.push(ev('cardlost', { id, name: D.CARDS[id].name })); }
  function heat(s, d, events) { s.exposure = Math.max(0, Math.min(EXPOSURE_LIMIT, s.exposure + d)); events.push(ev('exposure', { delta: d, exposure: s.exposure })); }
  function stage(s, k, to, events) {
    const def = D.ARRANGEMENTS[k]; to = Math.max(0, Math.min(def.stages.length - 1, to));
    if (to === s.arr[k].stage) return; s.arr[k].stage = to;
    events.push(ev('stage', { arr: k, stage: to, label: def.stages[to] }));
    const line = (D.STAGE_LINES[k] || [])[to]; if (line && to > s.arr[k].low) say(events, k === 'aircraft' || k === 'reception' ? 'sibling' : 'sponsor', line);
    if (k === 'reception' && to >= 2) gain(s, 'intro_vel', events);
    if (k === 'permission' && to === 1) gain(s, 'sponsor_line', events);
  }
  function advanceLevel(s, events) {
    if (s.pos >= D.LEVELS.length - 1) return;
    s.pos += 1; s.visited.push(s.pos); events.push(ev('travel', { to: s.pos }));
    for (const id of s.hand.slice()) { const c = D.CARDS[id]; if (c && c.tag === 'passage') { lose(s, id, events); s.used.push(id); } }
    arrive(s, events, false);
  }
  function call(s, k, events) {
    const c = callList(s).find(x => x.id === 'call:' + k);
    if (!c || !c.ok) return { ok: false, why: c ? c.why : 'Nothing to call about.' };
    if (k === 'permission' && s.arr.permission.stage === 0 && !s.commitments.some(x => x.to === 'sponsor')) { s.commitments.push({ to: 'sponsor', text: D.PEOPLE.sponsor.terms, kept: true }); events.push(ev('commit', { to: 'sponsor', text: D.PEOPLE.sponsor.terms })); }
    if (k === 'reception' && s.arr.reception.stage === 1 && !s.commitments.some(x => x.to === 'official')) { s.commitments.push({ to: 'official', text: D.PEOPLE.official.terms, kept: true }); events.push(ev('commit', { to: 'official', text: D.PEOPLE.official.terms })); }
    s.calledAt = s.hour;
    const due = s.hour + 1 + jobHours(k) + (s.flags.dark ? 2 : 0);
    s.jobs.push({ arr: k, ally: c.ally, target: s.arr[k].stage + 1, due });
    events.push(ev('job', { arr: k, ally: c.ally, due, dueText: clockText(due) }));
    say(events, c.ally, k === 'aircraft' ? `"Leave it with me. Six hours."` : k === 'reception' ? (c.ally === 'official' ? `"I will see what the minister can spare. Call it a courtesy."` : `"I have a name in Baca. Give me six hours."`) : `"Ten hours, and you understand what I asked."`);
    pass(s, 1, events); return finish(s, events);
  }
  function answer(s, id, optionId, events) {
    const i = s.inbox.findIndex(m => m.id === id); if (i < 0) return { ok: false, why: 'That message is gone.' };
    const m = s.inbox[i], o = m.options.find(x => x.id === optionId); if (!o) return { ok: false, why: 'Pick one of the answers.' };
    if (!optionOk(s, o)) return { ok: false, why: optionWhy(s, o) };
    s.inbox.splice(i, 1); events.push(ev('answered', { id, option: o.id, label: o.label }));
    switch (o.id) {
      case 'name_atlanta': s.flags.destination = true; stage(s, 'aircraft', 1, events); say(events, 'sibling', `"Atlanta. I will tell the operator."`); break;
      case 'wait_sponsor': stage(s, 'aircraft', 1, events); say(events, 'sibling', `"Then call Salek soon. The crew will not wait on us forever."`); break;
      case 'delegate_sibling': stage(s, 'aircraft', 1, events); { const d = roll(s); const good = d >= D.PEOPLE.sibling.reliability; events.push(ev('roll', { die: d, need: D.PEOPLE.sibling.reliability, won: good, who: 'sibling' })); if (good) { s.flags.destination = true; say(events, 'sibling', `"I told them Atlanta. Do not make me a liar."`); } else { s.jobs.push({ arr: 'aircraft', ally: 'sibling', target: 1, due: s.hour + 6, stall: true }); say(events, 'sibling', `"I could not decide for you. Six hours lost."`); } } break;
      case 'keep_calling': s.jobs.push({ arr: 'reception', ally: 'sibling', target: 2, due: s.hour + 6 }); break;
      case 'via_sponsor': stage(s, 'reception', 2, events); lose(s, 'sponsor_line', events); s.used.push('sponsor_line'); say(events, 'sponsor', `"Her uncle banks with me. She will answer within the hour. That is two things now."`); break;
      case 'wait_velez': break;
      case 'keep_word': { const c = s.commitments.find(x => x.to === 'aide'); c.kept = true; s.people.aide.trust = 3; gain(s, 'informant', events); say(events, 'aide', `"Thank you. Sosā's people are in Santa Laura tonight, by the way. Not here."`); s.belief = 1; events.push(ev('belief', { belief: 1 })); } break;
      case 'break_word': { const c = s.commitments.find(x => x.to === 'aide'); c.kept = false; s.people.aide.turned = true; for (const id of s.hand.slice()) if (D.CARDS[id].from === 'aide') lose(s, id, events); s.belief = s.pos; heat(s, 2, events); say(events, 'narrator', 'Gianlūka does not answer again. By the afternoon the inquiry has a town and a street.'); } break;
      case 'crew_bonus': stage(s, 'aircraft', 4, events); heat(s, 1, events); say(events, 'pilot', `"The crew is happy. The apron saw you pay them."`); break;
      case 'velez_word': stage(s, 'aircraft', 4, events); say(events, 'pilot', `"The operator just had a call from the minister's office. We are good."`); break;
      case 'ignore_pilot': break;
      case 'confirm_yacht': s.belief = 0; s.flags.lied = true; heat(s, -1, events); events.push(ev('belief', { belief: 0 })); say(events, 'narrator', 'The radio has you at sea for the evening. Nando laughs in the front seat.'); break;
      case 'deny_yacht': s.belief = 0; events.push(ev('belief', { belief: 0 })); say(events, 'narrator', 'They go to the house. The house is empty.'); break;
      case 'no_comment': break;
      case 'sign_accounts': { const c = s.commitments.find(x => x.to === 'sponsor'); if (c) c.kept = true; s.people.sponsor.trust = 2; s.flags.signed = true; say(events, 'sponsor', `"Good. The ministry will hear from me in the morning."`); } break;
      case 'stall_salek': for (const j of s.jobs) if (j.arr === 'permission') j.due += 12; say(events, 'sponsor', `"A week. I am not a patient man, but I am a curious one."`); break;
      case 'refuse_salek': { const c = s.commitments.find(x => x.to === 'sponsor'); if (c) c.kept = false; s.people.sponsor.turned = true; lose(s, 'sponsor_line', events); s.jobs = s.jobs.filter(j => j.arr !== 'permission'); say(events, 'sponsor', `"Then we have nothing to discuss. Good luck with the pilot."`); } break;
      case 'go_midnight': break;
      case 'send_decoy_yard': lose(s, 'decoy_cars', events); s.used.push('decoy_cars'); heat(s, -2, events); s.belief = 1; events.push(ev('belief', { belief: 1 })); say(events, 'narrator', 'The sedan rolls past the gate at a crawl. The car follows it north. Nando waves without looking.'); break;
      case 'guest_yes': s.flags.guest = true; say(events, 'official', `"Thank you. My people will be at the post."`); break;
      case 'guest_no': { const c = s.commitments.find(x => x.to === 'official'); if (c) c.kept = false; if (s.arr.reception.stage >= 2) stage(s, 'reception', 1, events); s.jobs = s.jobs.filter(j => j.arr !== 'reception'); say(events, 'official', `"Then you will cross like anyone else."`); } break;
      case 'sosa_talk': s.lastEnemy = s.hour + 2; say(events, 'enemy', `"Think about it. I will call again."`); break;
      case 'sosa_hang': break;
    }
    pass(s, o.hours || 0, events); return finish(s, events);
  }

  // ---- time: jobs resolve, the enemy acts, exposure drifts ------
  function pass(s, hours, events) {
    for (let i = 0; i < hours && !s.over; i++) {
      s.hour += 1; events.push(ev('hour', { hour: s.hour, clock: clockText(s.hour) }));
      for (const j of s.jobs.slice()) if (j.due <= s.hour) resolveJob(s, j, events);
      if (s.hour === s.deadline && !s.flags.cancelled) { s.flags.cancelled = true; s.flags.restriction = true; events.push(ev('enemy', { id: 'deadline', text: 'Monday noon. Your own passport is cancelled and the ban is at every post.', belief: s.belief })); }
      if (s.belief === s.pos && s.hour % 2 === 0) heat(s, 1, events);
      if (!s._manual && s.hour - s.lastEnemy >= ENEMY_EVERY) { s.lastEnemy = s.hour; enemyTurn(s, events); }
      if (s.exposure >= EXPOSURE_LIMIT) { if (s.tutorial) s.exposure = EXPOSURE_LIMIT - 1; else { s.exposure = 6; climbHold(s, events); } }
      if (!s.over && s.hour >= HOURS_TOTAL) { s.over = { win: false, kind: 'clock', reason: `${clockText(s.hour)}. Your immunity is gone, a warrant is out and Esmeralda has closed its airfields to your flight. ${epilogue(s, false)}` }; events.push(ev('over', s.over)); }
      if (!s.over && !s.event && s.hour >= s.nextEventAt) { s.nextEventAt = s.hour + EVENT_EVERY; drawEvent(s, events); }
    }
  }
  function resolveJob(s, j, events) {
    s.jobs = s.jobs.filter(x => x !== j);
    if (j.stall) return;
    const rel = D.PEOPLE[j.ally].reliability + (s.people[j.ally].turned ? 6 : 0) - (s.people[j.ally].trust >= 2 ? 1 : 0);
    const d = roll(s), good = d >= rel;
    events.push(ev('roll', { die: d, need: rel, won: good, who: j.ally }));
    if (good) { if (j.arr === 'aircraft' && j.target === 2 && !s.flags.destination && s.arr.permission.stage < 1) { say(events, 'sibling', `"The crew will not confirm without a destination. Decide."`); return; } stage(s, j.arr, j.target, events); if (j.arr === 'permission' && j.target === 1) s.flags.destination = true; }
    else say(events, j.ally, j.ally === 'sibling' ? `"Nothing yet. They want more time."` : j.ally === 'sponsor' ? `"The ministry has not called back. I will try again if you ask."` : `"The minister has other guests this weekend."`);
  }
  function enemyTurn(s, events, forced) {
    const cands = D.ENEMY_ACTIONS.filter(a => !(a.once && s.flags.enemyDone[a.id]) && !(a.after && s.hour < a.after));
    const total = cands.reduce((n, a) => n + a.w, 0); let r = s._rng() * total, pick = cands[0];
    for (const a of cands) { r -= a.w; if (r <= 0) { pick = a; break; } }
    if (s._enemy && s._enemy.length) { const want = s._enemy.shift(); pick = cands.find(a => a.id === want) || pick; }
    if (forced) { pick = D.ENEMY_ACTIONS.find(a => a.id === forced); if (!pick) return null; }
    if (pick.once) s.flags.enemyDone[pick.id] = true;
    let text = '';
    switch (pick.id) {
      case 'check_belief': { const where = D.LEVELS[Math.max(0, s.belief)].short; text = pick.text(where); if (s.belief === s.pos) { if (s.exposure >= 6 && !s._manual) { text += ' They find you.'; events.push(ev('enemy', { id: pick.id, text, belief: s.belief })); climbHold(s, events); return text; } heat(s, 2, events); text += ' They are close.'; } else text += ' Nobody there has seen you.'; break; }
      case 'trace': { text = pick.text(); if (s.hour - s.calledAt <= 3) { s.belief = s.pos; events.push(ev('belief', { belief: s.belief })); text += ' The last call came from where you are.'; } else text += ' Nothing new.'; break; }
      case 'circulate': s.flags.restriction = true; text = pick.text(); break;
      case 'lean_operator': s.flags.leaned = true; if (s.arr.aircraft.stage >= 3) { stage(s, 'aircraft', s.arr.aircraft.stage - 1, events); text = pick.text() + ' The operator withdraws the crew until you reassure him.'; } else text = pick.text(); break;
      case 'press_ally': { const pool = Object.keys(s.people).filter(k => k !== 'sibling' && k !== 'sponsor' && !s.people[k].turned && s.hand.some(id => D.CARDS[id] && D.CARDS[id].from === k)); if (!pool.length) { text = `${D.ENEMY.name} reviews the passenger lists at Portô Venla airport. Nothing.`; break; } const who = pool[Math.floor(s._rng() * pool.length)]; text = pick.text(personName(s, who)); const d = roll(s); const holds = d <= 3 + s.people[who].trust; events.push(ev('roll', { die: d, need: 4 + s.people[who].trust, won: holds, who, pressed: true })); if (holds) text += ` ${personName(s, who).split(' ')[0]} says nothing useful.`; else { s.people[who].turned = true; s.belief = s.pos; heat(s, s.flags.lied ? 3 : 2, events); text += ` ${personName(s, who).split(' ')[0]} tells them where you were last seen.${s.flags.lied ? ' The yacht story is dead, and the papers say so.' : ''}`; } break; }
      case 'ask_esmeralda': s.flags.asked = true; text = pick.text(); break;
      case 'press_story': { s.belief = s.pos === 0 ? 1 : 0; heat(s, -1, events); text = pick.text(); break; }
      case 'roadblock': { s.flags.roadblock = { pos: s.belief, until: s.hour + 6 }; text = pick.text(D.LEVELS[Math.max(0, s.belief)].short); break; }
      case 'watch_sibling': { text = pick.text(personName(s, 'sibling')); for (const j of s.jobs) if (j.ally === 'sibling') j.due += 4; break; }
    }
    events.push(ev('enemy', { id: pick.id, text, belief: s.belief }));
    return text;
  }
  // The government side: run one named inquiry action now, and pass time without the automatic inquiry.
  function enemyAct(s, id, events) { if (id === 'roadblock' || id === 'check_belief') s.lastEnemy = s.hour; return enemyTurn(s, events, id); }
  function passHours(s, hours, events) { pass(s, hours, events); }
  function finish(s, events) { return { ok: true, events }; }
  // Save and resume: everything but the rng closure and the boot events is plain data.
  function serialize(s) { const o = Object.assign({}, s); delete o._rng; delete o._boot; return JSON.stringify(o); }
  function restore(json) { const s = JSON.parse(json); s._boot = []; return attachRng(s); }
  // The ending names what the run cost. Built from the state, so every run reads differently.
  function epilogue(s, win) {
    const out = [], first = (id) => personName(s, id).split(' ')[0];
    const turned = Object.keys(s.people).filter(k => s.people[k].turned && k !== 'sponsor');
    if (win) {
      out.push(s.arr.permission.stage >= 2 ? 'A car meets the aircraft at Lāyūna.' : 'Atlanta lets the jet land and asks questions for a week.');
      if (s.flags.signed) out.push('The family accounts sit in Salek\'s house. He calls on the first of every month.');
    }
    for (const c of s.commitments) {
      if (c.to === 'aide') out.push(c.kept === false ? `${first('aide')} leads the party now and says your name only to deny it.` : c.kept ? `${first('aide')} leads the party in your name. He expects you to remember that.` : `${first('aide')} is still waiting for the statement you promised.`);
      if (c.to === 'official' && c.kept === false) out.push('Baca reads your refusal as a government in exile. The guest room closes.');
      if (c.to === 'sponsor' && c.kept === false) out.push('Salek tells his clients you do not keep terms.');
    }
    if (turned.length) out.push(`${turned.map(first).join(' and ')} talked to the inquiry. ${turned.length > 1 ? 'They' : first(turned[0])} will not be forgiven at home.`);
    if (s.people.host.trust > 0) out.push('Nonā Rosa\'s truck runs to Salta every week. Nobody at the colônia says who rode in it.');
    if (s.holds) out.push(s.holds === 1 ? 'You were held once along the way.' : `You were held ${s.holds} times along the way.`);
    if (!win) out.push(`${personName(s, 'sibling')} is named on the warrant by Monday.`);
    return out.join(' ');
  }

  return { HOURS_TOTAL, EXPOSURE_LIMIT, START_HOUR, ESMERALDA_FROM, ENEMY_EVERY, DEADLINE, reaches, eventView, fxTags, newRun, serialize, restore, enemyAct, passHours, actions, commit, clockText, isNight, personName };
})();
if (typeof module !== 'undefined') module.exports = Sim;
