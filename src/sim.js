/* ============================================================
   COALITION simulation. Pure: no DOM, no p5, no audio. Node-loadable.
   Owns all truth; returns event lists the UI narrates and animates.
   Depth comes from people: who controls what, what they need first,
   what they have confirmed, and what an earlier promise now costs.
   ============================================================ */
'use strict';
const Sim = (() => {
  const D = (typeof Data !== 'undefined') ? Data : require('./data.js');
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const HOURS_TOTAL = 72, EXPOSURE_LIMIT = 10, START_HOUR = 14; // the run opens Saturday 14:00
  const EXITS = { residence: null, road: null, colonia: null, salta: ['crate', 'foreman', 'buy_seat'], border: null, airfield: ['depart', 'depart_nopermit'] }; // null = every success exits
  const ESMERALDA_FROM = 5; // level index where Valdórian influence stops counting
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // opts.dice: a queue of die results used before the rng (the demo). opts.enemy: a queue of
  // enemy action ids used before the weighted draw (the demo). opts.tutorial: a flag the UI reads.
  function newRun(seed, who, opts) {
    opts = opts || {};
    const ch = D.CHARACTERS[who] || D.CHARACTERS.woman;
    const rng = mulberry32(seed >>> 0);
    const s = {
      seed, who: ch.id, hour: 0, pos: 0, belief: 0, exposure: 1, over: null,
      arr: {}, people: {}, hand: ['decoy_cars', 'aide_word'], used: [], commitments: [], inbox: [], jobs: [],
      flags: { destination: false, restriction: false, asked: false, leaned: false, enemyDone: {} },
      nextMsg: 1, lastEnemy: 0, visited: [0], tutorial: !!opts.tutorial,
    };
    s._dice = opts.dice ? opts.dice.slice() : null;
    s._enemy = opts.enemy ? opts.enemy.slice() : null;
    for (const k in D.ARRANGEMENTS) s.arr[k] = { stage: 0 };
    for (const k in D.PEOPLE) s.people[k] = { trust: k === 'sibling' || k === 'nando' ? 2 : 0, turned: false };
    s._rng = rng;
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
  const personName = (s, id) => id === 'sibling' ? ch(s).sibling.name : (D.PEOPLE[id] && D.PEOPLE[id].name) || id;

  // ---- messages (the phone) ---------------------------------
  function msg(s, events, from, text, options) {
    const m = { id: s.nextMsg++, from, text, options };
    s.inbox.push(m); events.push(ev('message', { id: m.id, from, text }));
  }
  function arrive(s, events, first) {
    const L = level(s);
    events.push(ev('arrive', { level: s.pos }));
    say(events, 'narrator', L.arrive);
    // scripted arrivals: what the phone brings at each level
    if (s.pos === 0 && first) {
      msg(s, events, 'sibling', `"Jet found in Susana. The crew needs a destination. Atlanta, or wait for Salek?"`, [
        { id: 'name_atlanta', label: 'Name Atlanta now', hours: 0, effect: 'Crew booking can proceed. Atlanta has not granted permission yet.' },
        { id: 'wait_sponsor', label: 'Wait until Salek answers', hours: 0, effect: 'Crew booking waits until Salek is engaged.' },
        { id: 'delegate_sibling', label: `Let ${ch(s).sibling.short} decide`, hours: 0, effect: `Needs a ${D.PEOPLE.sibling.reliability}+ roll to name Atlanta; failure delays work six hours.` },
      ]);
    }
    if (s.pos === 1) {
      msg(s, events, 'registry', `"I can issue your civil record. Sign in person, or have Gianlūka ask."`, [
        { id: 'sign_person', label: 'Go in person, one hour', hours: 1, effect: 'Request the record at the main-square registry. Due in eight hours.' },
        { id: 'aide_asks', label: 'Have Gianlūka ask her', hours: 0, effect: 'Owe Gianlūka a favor. The record takes twelve hours.' },
        { id: 'skip_doc', label: 'Skip it', hours: 0, effect: 'Keep only your restricted passport.' },
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
      const c = s.commitments.find(x => x.to === 'aide' && x.kept === null);
      if (c) msg(s, events, 'aide', `"The party meets tonight. Send your endorsement before midnight. You gave your word."`, [
        { id: 'keep_word', label: 'Send the statement', hours: 1, effect: 'Keep Gianlūka’s support and gain his informant’s help.' },
        { id: 'break_word', label: 'Put him off', hours: 0, effect: 'Lose Gianlūka’s cards. He reveals your location; exposure rises.' },
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
  function mods(s, L) {
    const out = {};
    for (const id of s.hand) {
      const c = D.CARDS[id]; if (!c) continue;
      if (c.tag === 'influence' && s.pos >= ESMERALDA_FROM) continue; // the party means nothing in Esmeralda
      out[c.tag] = (out[c.tag] || 0) + 1;
    }
    return out;
  }
  function hasTag(s, tag) { return s.hand.some(id => D.CARDS[id] && D.CARDS[id].tag === tag && !(tag === 'influence' && s.pos >= ESMERALDA_FROM)); }
  function isNight(s) { const t = (START_HOUR + s.hour) % 24; return t >= 22 || t < 5; }
  function needText(s, n) {
    if (n.card) return hasTag(s, n.card) ? null : (n.card === 'influence' && s.pos >= ESMERALDA_FROM ? 'Your party card is not recognized here.' : `Requires a ${n.card} card.`);
    if (n.night) return isNight(s) ? null : `Available at night. Current time: ${clockText(s.hour).split(' ')[1]}. Shift change: 22:00.`;
    if (n.arr) { const a = s.arr[n.arr]; return a.stage >= n.stage ? null : `Requires ${D.ARRANGEMENTS[n.arr].name}: "${D.ARRANGEMENTS[n.arr].stages[n.stage]}". Now: "${D.ARRANGEMENTS[n.arr].stages[a.stage]}".`; }
    return null;
  }
  function approachList(s) {
    const L = level(s), m = mods(s, L), out = [];
    for (const a of L.approaches) {
      const whys = a.needs.map(n => needText(s, n)).filter(Boolean);
      let bonus = 0; const used = [];
      for (const tag in a.mods) if (m[tag]) { bonus += a.mods[tag]; used.push(tag); }
      let dc = a.dc;
      if (L.border && s.flags.restriction && !hasTag(s, 'delay')) dc += 1;
      if (L.final && s.flags.asked && s.arr.reception.stage < 2) dc += 2;
      const need = Math.max(1, dc - bonus);
      out.push({ kind: 'approach', id: a.id, name: a.name, hours: a.hours, ok: whys.length === 0, why: whys.join(' '), text: a.text,
        odds: need <= 1 ? 'certain' : need > 6 ? 'impossible' : `${7 - need} in 6`, need, bonusFrom: used, pay: !!a.pay,
        preview: [a.text, need <= 1 ? 'Succeeds without a roll.' : need > 6 ? 'Cannot succeed with your current help.' : `Die needs ${need} or more (${7 - need} in 6).${used.length ? ' Helped by: ' + used.join(', ') + '.' : ''}`, `Takes ${a.hours} hour${a.hours === 1 ? '' : 's'}.`] });
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
      out.push({ kind: 'call', id: 'call:' + k, name: `Call ${personName(s, ally)} about ${def.name.toLowerCase()}`, ally, arr: k, ok: whys.length === 0, why: whys.join(' '), hours: 1,
        preview: [text, `Next: ${def.stages[a.stage + 1]}. Reply in ${jobHours(k)} hours. ${personName(s, ally)} needs a roll of ${D.PEOPLE[ally].reliability + (s.people[ally].turned ? 6 : 0)} or more before trust bonuses.`] });
    };
    add('aircraft', 'sibling', [A.aircraft.stage === 1 && !s.flags.destination && A.permission.stage < 1 ? 'Name a destination or engage Salek first.' : null, s.people.sibling.turned ? 'Not answering.' : null].filter(Boolean),
      'Arrange the next stage: charter, crew, fuel or positioning.');
    add('reception', A.reception.stage < 2 ? 'sibling' : 'official',
      [A.reception.stage === 2 && s.pos < 3 ? 'Call from Salta to request officials at the border.' : null].filter(Boolean),
      'Arrange reception through your sibling, then Vélez.');
    add('document', 'registry', [A.document.stage === 0 ? 'Answer Mārtā’s message in Santa Laura first.' : null].filter(Boolean),
      'Ask Mārtā to finish your civil record.');
    add('permission', 'sponsor', [s.pos >= ESMERALDA_FROM && A.permission.stage === 0 ? 'Contact Salek before reaching Susana.' : null].filter(Boolean),
      'Ask Salek to seek Atlanta’s permission. His terms apply.');
    return out;
  }
  const jobHours = (k) => ({ aircraft: 6, reception: 6, document: 8, permission: 10 })[k];
  function inboxList(s) {
    return s.inbox.map(m => ({ kind: 'message', id: 'msg:' + m.id, msgId: m.id, from: m.from, name: `${personName(s, m.from)}: ${m.text}`, ok: true, hours: 0,
      options: m.options.map(o => Object.assign({}, o, { ok: optionOk(s, o), why: optionWhy(s, o) })) }));
  }
  function optionWhy(s, o) {
    if (o.id === 'via_sponsor' && s.arr.permission.stage < 1) return 'Salek is not engaged yet.';
    if (o.id === 'velez_word' && !hasTag(s, 'introduction')) return "You do not have Vélez's card.";
    if (o.id === 'aide_asks' && !hasTag(s, 'influence')) return 'Gianlūka is not taking your calls.';
    return '';
  }
  const optionOk = (s, o) => !optionWhy(s, o);
  function actions(s) { return { approaches: approachList(s), calls: callList(s), messages: inboxList(s), wait: { kind: 'wait', id: 'wait', name: 'Wait one hour', ok: !s.over, hours: 1 } }; }

  // ---- commit ----------------------------------------------------
  function commit(s, actionId, optionId) {
    if (s.over) return { ok: false, why: 'The run is over.' };
    const events = [];
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
    if (won && a.success.win) { s.over = { win: true, reason: `${a.success.say} You escaped.` }; events.push(ev('over', s.over)); return { ok: true, events }; }
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
    const line = (D.STAGE_LINES[k] || [])[to]; if (line && to > s.arr[k].low) say(events, k === 'aircraft' || k === 'reception' ? 'sibling' : k === 'document' ? 'registry' : 'sponsor', line);
    if (k === 'document' && to === 2) gain(s, 'civil_record', events);
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
    const due = s.hour + 1 + jobHours(k);
    s.jobs.push({ arr: k, ally: c.ally, target: s.arr[k].stage + 1, due });
    events.push(ev('job', { arr: k, ally: c.ally, due, dueText: clockText(due) }));
    say(events, c.ally, k === 'aircraft' ? `"Leave it with me. Six hours."` : k === 'reception' ? (c.ally === 'official' ? `"I will see what the minister can spare. Call it a courtesy."` : `"I have a name in Baca. Give me six hours."`) : k === 'document' ? `"Eight hours. The stamp is the slow part."` : `"Ten hours, and you understand what I asked."`);
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
      case 'sign_person': stage(s, 'document', 1, events); s.jobs.push({ arr: 'document', ally: 'registry', target: 2, due: s.hour + 8 }); say(events, 'registry', `"Sign here, and here. Come back for it, or send someone with your face."`); break;
      case 'aide_asks': stage(s, 'document', 1, events); s.jobs.push({ arr: 'document', ally: 'registry', target: 2, due: s.hour + 12 }); if (!s.commitments.some(c => c.to === 'aide')) { s.commitments.push({ to: 'aide', text: D.PEOPLE.aide.terms, kept: null }); events.push(ev('commit', { to: 'aide', text: D.PEOPLE.aide.terms })); } say(events, 'registry', `"Your chief of staff has a way of asking. Twelve hours."`); break;
      case 'skip_doc': say(events, 'narrator', 'You keep driving. The passport in your pocket is the one on the order.'); break;
      case 'keep_calling': s.jobs.push({ arr: 'reception', ally: 'sibling', target: 2, due: s.hour + 6 }); break;
      case 'via_sponsor': stage(s, 'reception', 2, events); say(events, 'sponsor', `"Her uncle banks with me. She will answer within the hour. That is two things now."`); break;
      case 'wait_velez': break;
      case 'keep_word': { const c = s.commitments.find(x => x.to === 'aide'); c.kept = true; s.people.aide.trust = 3; gain(s, 'informant', events); say(events, 'aide', `"Thank you. Sosā's people are in Santa Laura tonight, by the way. Not here."`); s.belief = 1; events.push(ev('belief', { belief: 1 })); } break;
      case 'break_word': { const c = s.commitments.find(x => x.to === 'aide'); c.kept = false; s.people.aide.turned = true; for (const id of s.hand.slice()) if (D.CARDS[id].from === 'aide') lose(s, id, events); s.belief = s.pos; heat(s, 2, events); say(events, 'narrator', 'Gianlūka does not answer again. By the afternoon the inquiry has a town and a street.'); } break;
      case 'crew_bonus': stage(s, 'aircraft', 4, events); heat(s, 1, events); say(events, 'pilot', `"The crew is happy. The apron saw you pay them."`); break;
      case 'velez_word': stage(s, 'aircraft', 4, events); say(events, 'pilot', `"The operator just had a call from the minister's office. We are good."`); break;
      case 'ignore_pilot': break;
    }
    pass(s, o.hours || 0, events); return finish(s, events);
  }

  // ---- time: jobs resolve, the enemy acts, exposure drifts ------
  function pass(s, hours, events) {
    for (let i = 0; i < hours && !s.over; i++) {
      s.hour += 1; events.push(ev('hour', { hour: s.hour, clock: clockText(s.hour) }));
      for (const j of s.jobs.slice()) if (j.due <= s.hour) resolveJob(s, j, events);
      if (s.belief === s.pos && s.hour % 3 === 0) heat(s, 1, events);
      if (s.hour - s.lastEnemy >= 4) { s.lastEnemy = s.hour; enemyTurn(s, events); }
      if (s.exposure >= EXPOSURE_LIMIT) { s.over = { win: false, reason: `${D.ENEMY.name}'s people arrive at ${level(s).name} at ${clockText(s.hour)}. They found your location.` }; events.push(ev('over', s.over)); }
      else if (s.hour >= HOURS_TOTAL) { s.over = { win: false, reason: `${clockText(s.hour)}. An arrest warrant is out. Esmeralda has closed its airfields to your flight.` }; events.push(ev('over', s.over)); }
    }
  }
  function resolveJob(s, j, events) {
    s.jobs = s.jobs.filter(x => x !== j);
    if (j.stall) return;
    const rel = D.PEOPLE[j.ally].reliability + (s.people[j.ally].turned ? 6 : 0) - (s.people[j.ally].trust >= 2 ? 1 : 0);
    const d = roll(s), good = d >= rel;
    events.push(ev('roll', { die: d, need: rel, won: good, who: j.ally }));
    if (good) { if (j.arr === 'aircraft' && j.target === 2 && !s.flags.destination && s.arr.permission.stage < 1) { say(events, 'sibling', `"The crew will not confirm without a destination. Decide."`); return; } stage(s, j.arr, j.target, events); if (j.arr === 'permission' && j.target === 1) s.flags.destination = true; }
    else say(events, j.ally, j.ally === 'sibling' ? `"Nothing yet. They want more time."` : j.ally === 'sponsor' ? `"The ministry has not called back. I will try again if you ask."` : j.ally === 'official' ? `"The minister has other guests this weekend."` : `"The stamp is not ready."`);
  }
  function enemyTurn(s, events) {
    const cands = D.ENEMY_ACTIONS.filter(a => !(a.once && s.flags.enemyDone[a.id]) && !(a.after && s.hour < a.after));
    const total = cands.reduce((n, a) => n + a.w, 0); let r = s._rng() * total, pick = cands[0];
    for (const a of cands) { r -= a.w; if (r <= 0) { pick = a; break; } }
    if (s._enemy && s._enemy.length) { const want = s._enemy.shift(); pick = cands.find(a => a.id === want) || pick; }
    if (pick.once) s.flags.enemyDone[pick.id] = true;
    let text = '';
    switch (pick.id) {
      case 'check_belief': { const where = D.LEVELS[Math.max(0, s.belief)].short; text = pick.text(where); if (s.belief === s.pos) { heat(s, 2, events); text += ' They are close.'; } else text += ' Nobody there has seen you.'; break; }
      case 'circulate': s.flags.restriction = true; text = pick.text(); break;
      case 'lean_operator': s.flags.leaned = true; if (s.arr.aircraft.stage >= 3) { stage(s, 'aircraft', s.arr.aircraft.stage - 1, events); text = pick.text() + ' The operator withdraws the crew until you reassure him.'; } else text = pick.text(); break;
      case 'press_ally': { const pool = Object.keys(s.people).filter(k => k !== 'sibling' && k !== 'sponsor' && !s.people[k].turned && s.hand.some(id => D.CARDS[id] && D.CARDS[id].from === k)); if (!pool.length) { text = `${D.ENEMY.name} reviews the passenger lists at Portô Venla airport. Nothing.`; break; } const who = pool[Math.floor(s._rng() * pool.length)]; text = pick.text(personName(s, who)); const d = roll(s); const holds = d <= 3 + s.people[who].trust; events.push(ev('roll', { die: d, need: 4 + s.people[who].trust, won: holds, who, pressed: true })); if (holds) text += ` ${personName(s, who).split(' ')[0]} says nothing useful.`; else { s.people[who].turned = true; s.belief = s.pos; heat(s, 2, events); text += ` ${personName(s, who).split(' ')[0]} tells them where you were last seen.`; } break; }
      case 'ask_esmeralda': s.flags.asked = true; text = pick.text(); break;
      case 'press_story': { s.belief = s.pos === 0 ? 1 : 0; heat(s, -1, events); text = pick.text(); break; }
    }
    events.push(ev('enemy', { id: pick.id, text, belief: s.belief }));
  }
  function finish(s, events) { return { ok: true, events }; }

  return { HOURS_TOTAL, EXPOSURE_LIMIT, START_HOUR, ESMERALDA_FROM, newRun, actions, commit, clockText, isNight, personName };
})();
if (typeof module !== 'undefined') module.exports = Sim;
