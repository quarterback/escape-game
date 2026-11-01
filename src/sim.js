/* ============================================================
   COALITION simulation. Pure: no DOM, no p5, no audio. Node-loadable.
   Owns all truth; returns event lists the UI narrates and animates.
   Depth comes from people: who controls what, what they need first,
   what they have confirmed, and what an earlier promise now costs.
   ============================================================ */
'use strict';
const Sim = (() => {
  const D = (typeof Data !== 'undefined') ? Data : require('./data.js');
  const C = (typeof Content !== 'undefined') ? Content : require('./content.js');
  const hrsText = (n) => n === 1 ? T('scene.hours_one') : T('scene.hours', { n: num(n) }); // a duration in words for effect chips
  const M = (k, code, args) => C.marker(k, code, args);
  // a chip inside a longer chip: lowercase only a common first word, never names (Sosā, Costamar, a person)
  const chipLower = (t) => /^(You|Your|The|A|An|If|Takes|Passport|Moves|Her|Orders|Minister|Roll|Police|Search|Lose|Learn|Reach|Harder|Ban|Post)\b/.test(t) ? t[0].toLowerCase() + t.slice(1) : t;
  const T = (id, args) => C.t(id, args); // narrative and interface wording from content/coalition/ui.json
  // mulberry32 with its state kept ON the run (s._rngState), so a saved run resumes with the same die.
  function attachRng(s) { s._rng = function () { let a = (s._rngState + 0x6D2B79F5) | 0; s._rngState = a; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; return s; }
  const HOURS_TOTAL = 72, EXPOSURE_LIMIT = 10, START_HOUR = 14; // the run opens Saturday 14:00
  const EXITS = { residence: null, road: null, colonia: ['help_host', 'leave'], salta: ['board'], border: null, airfield: ['depart', 'depart_nopermit'] };
  const POST_IDS = ['rail', 'high', 'coast']; // null = every success exits
  const ENEMY_EVERY = 3; // hours between inquiry actions
  const ESMERALDA_FROM = 5; // level index where Valdórian influence stops counting
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
      nextMsg: 1, lastEnemy: 0, visited: [0], tutorial: !!opts.tutorial, ledger: [],
      dest: D.DESTS[opts.dest] ? opts.dest : 'atlanta',
      // the deeper game: one dispatch or hold waits at a time; holds climb a ladder; the travel ban carries what Monday noon used to.
      event: null, seenEvents: [], hold: 0, holds: 0, lastHoldAt: -99, nextEventAt: 6, calledAt: -99, mods: {}, daily: !!opts.daily,
    };
    s.exposure = ch.exposure || 1;
    s._manual = !!opts.manualEnemy; // the government player chooses the inquiry's moves
    s._dice = opts.dice ? opts.dice.slice() : null;
    s._enemy = opts.enemy ? opts.enemy.slice() : null;
    for (const k in D.ARRANGEMENTS) s.arr[k] = { stage: 0 };
    for (const k in D.PEOPLE) s.people[k] = { trust: k === 'sibling' || k === 'nando' ? 2 : 0, turned: false, doubt: false, cut: false, known: false, bad: false };
    s._rngState = seed >>> 0; attachRng(s);
    // the final boss: one Costamaran post has taken Valdória's money, and Vélez's people cover one of the others
    s.boughtPost = opts.tutorial ? 'coast' : POST_IDS[Math.floor(s._rng() * 3)];
    s.escortPost = POST_IDS.filter(x => x !== s.boughtPost)[Math.floor(s._rng() * 2)];
    // Two people on the ground are secretly working for the inquiry. Which two changes every run.
    // how many allies have already gone over: two, or one to three on a daily
    const approached = opts.daily ? 1 + Math.floor(s._rng() * 3) : 2;
    if (!s.tutorial) { const pool = SUSPECTS.slice(); for (let i = 0; i < approached; i++) { const k = pool.splice(Math.floor(s._rng() * pool.length), 1)[0]; s.people[k].bad = true; } }
    if (opts.daily) {
      // the daily draws more from its date: how hot the morning starts, where Sosā is looking, and the fourth card
      s.exposure = Math.max(0, Math.min(4, (ch.exposure || 1) + Math.floor(s._rng() * 3) - 1));
      s.belief = s._rng() < 0.3 ? 1 : 0;
      const alts = [s.hand[3]].concat(ch.handAlt || []); s.hand[3] = alts[Math.floor(s._rng() * alts.length)];
    }
    const events = [];
    arrive(s, events, true);
    s._boot = events;
    return s;
  }
  const ev = (type, data) => Object.assign({ type }, data);
  const say = (events, who, text, featured) => { if (text) events.push(ev('say', { who, text, featured: !!featured })); };
  const roll = (s) => (s._dice && s._dice.length) ? s._dice.shift() : 1 + Math.floor(s._rng() * D.DICE.sides);
  const tgt = (n6) => D.DICE.target(n6), wins = (d, t) => D.DICE.wins(d, t);
  function clockText(h) {
    const t = START_HOUR + h, day = [T('sim.day.saturday'), T('sim.day.sunday'), T('sim.day.monday'), T('sim.day.tuesday'), T('sim.day.wednesday')][Math.floor(t / 24)];
    const hr = t % 24, when = hr === 0 ? T('sim.time.midnight') : hr === 12 ? T('sim.time.noon') : `${hr % 12} ${hr < 12 ? 'a.m.' : 'p.m.'}`;
    return `${day} ${when}`;
  }
  const level = (s) => D.LEVELS[s.pos];
  const dest = (s) => D.DESTS[s.dest] || D.DESTS.atlanta;
  const postName = (id) => D.POSTS[id];
  const num = (n) => (n >= 0 && n < 10) ? T('sim.num.words').split('|')[n] : String(n); // AP: words below 10
  const sponsor = (s) => dest(s).sponsor;
  const ch = (s) => D.CHARACTERS[s.who];
  // how a person is named mid-sentence: the name people use for them, never a lone first word like "Nonā"
  const shortName = (s, id) => id === 'sponsor' ? sponsor(s).short : (D.PEOPLE[id] && D.PEOPLE[id].short) || personName(s, id).split(' ')[0];
  const personName = (s, id) => id === 'enemy' ? D.ENEMY.name : id === 'sibling' ? ch(s).sibling.name : id === 'self' ? 'you' : id === 'sponsor' ? sponsor(s).name : (D.PEOPLE[id] && D.PEOPLE[id].name) || id;
  const personRole = (s, id) => id === 'sponsor' ? sponsor(s).role : (D.PEOPLE[id] || {}).role || '';

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
      msg(s, events, 'sibling', T('sim.line.jet_found_in_susana_the'), [
        { id: 'confirm_dest', label: T('sim.opt.confirm_destination', { city: dest(s).city }), hours: 0, effect: T('sim.effect.crew_booking_can_proceed', { city: dest(s).city }) },
        { id: 'wait_sponsor', label: T('sim.opt.wait_until_salek_answers', { sponsor: sponsor(s).short }), hours: 0, effect: T('sim.effect.crew_booking_waits_until_salek', { sponsor: sponsor(s).short }) },
        { id: 'delegate_sibling', label: T('sim.opt.let_decide', { place: ch(s).sibling.short }), hours: 0, effect: T('sim.effect.needs_roll_to_confirm', { need: tgt(D.PEOPLE.sibling.reliability), place: ch(s).sibling.short }) },
      ]);
    }
    if (s.pos === 1) {
      msg(s, events, 'press', T('sim.line.radi_port_venla_we_hear'), [
        { id: 'confirm_yacht', label: T('sim.opt.confirm_it_from_the_yacht'), hours: 0, effect: T('sim.effect.the_inquiry_believes_the_coast') },
        { id: 'deny_yacht', label: T('sim.opt.deny_it_you_are_at'), hours: 0, effect: T('sim.effect.sends_them_to_the_house') },
        { id: 'no_comment', label: T('sim.opt.hang_up'), hours: 0, effect: T('sim.effect.nothing_changes') },
      ]);
    }
    if (s.pos === 2 && s.arr.permission.stage >= 1 && !s.flags.salekDue) {
      s.flags.salekDue = true;
      const sp = sponsor(s);
      msg(s, events, 'sponsor', sp.demand.text, [
        { id: 'sign_accounts', label: sp.demand.accept, hours: 1, effect: sp.demand.effect },
        { id: 'refuse_salek', label: T('sim.opt.refuse'), hours: 0, effect: T('sim.effect.refuse_demand', { sponsor: sp.short }) },
      ]);
    }
    if (s.pos === 2 && s.arr.reception.stage === 1) {
      msg(s, events, 'sibling', T('sim.line.v_lez_is_not_answering', { sponsor: sponsor(s).short }), [
        { id: 'keep_calling', label: `${ch(s).sibling.short} keeps calling`, hours: 0, effect: T('sim.effect.try_again_in_six_hours', { sib: ch(s).sibling.short }) },
        { id: 'via_sponsor', label: T('sim.opt.ask_salek_to_reach_the', { sponsor: sponsor(s).short }), hours: 0, effect: T('sim.effect.requires_sponsor_help', { sponsor: sponsor(s).short }) },
        { id: 'wait_velez', label: T('sim.opt.wait'), hours: 0, effect: T('sim.effect.nothing_moves_until_you_call') },
      ]);
    }
    // Holt's warning is a choice only while you still have Nando's spare cars to send; without them its one answer changes nothing
    if (s.pos === 3 && heldTag(s, 'decoy')) {
      msg(s, events, 'holt', T('sim.line.two_men_in_a_car'), [
        { id: 'go_midnight', label: T('sim.opt.midnight_it_is'), hours: 0, effect: T('sim.effect.nothing_changes_you_know_the') },
        { id: 'send_decoy_yard', label: T('sim.opt.send_nando_past_the_gate'), hours: 0, effect: T('sim.effect.decoy_at_the_yard') },
      ]);
    }
    if (s.pos === 3) {
      const c = s.commitments.find(x => x.to === 'aide' && x.kept === null);
      if (c) msg(s, events, 'aide', T('sim.line.the_party_meets_tonight_send'), [
        { id: 'keep_word', label: T('sim.opt.send_the_statement'), hours: 1, effect: T('sim.effect.keep_gianluka_s_support_and') },
        { id: 'break_word', label: T('sim.opt.put_him_off'), hours: 0, effect: T('sim.effect.break_word') },
      ]);
    }
    if (s.pos === 4 && s.commitments.some(x => x.to === 'official')) {
      msg(s, events, 'official', T('sim.line.before_my_people_meet_you'), [
        { id: 'guest_yes', label: T('sim.opt.say_it'), hours: 0, effect: T('sim.effect.reception_stands_the_party_at') },
        { id: 'guest_no', label: T('sim.opt.refuse'), hours: 0, effect: T('sim.effect.v_lez_withdraws_her_officials') },
      ]);
    }
    if (s.pos === 5) {
      msg(s, events, 'enemy', T('sim.line.inspector_sosa_come_back_for', { rel: ch(s).sibling.rel }), [
        { id: 'sosa_talk', label: T('sim.opt.keep_him_talking'), hours: 1, effect: T('sim.effect.an_hour_on_the_phone') },
        { id: 'sosa_hang', label: T('sim.opt.hang_up'), hours: 0, effect: T('sim.effect.nothing_changes') },
      ]);
    }
    if (s.pos === 5 && s.flags.leaned) {
      msg(s, events, 'pilot', T('sim.line.your_ministry_threatened_the_operator'), [
        { id: 'crew_bonus', label: T('sim.opt.pay_the_crew_bonus'), hours: 1, effect: T('sim.effect.restores_the_aircraft_to_ready') },
        { id: 'velez_word', label: T('sim.opt.have_v_lez_call_the'), hours: 0, effect: T('sim.effect.requires_v_lez_s_card') },
        { id: 'ignore_pilot', label: T('sim.opt.ignore_it'), hours: 0, effect: T('sim.effect.aircraft_preparations_stay_on_hold') },
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
  // a card kind in player words, never the internal tag
  const kindWord = (tag) => { const w = ({ boat: T('tag.boat'), decoy: T('tag.decoy'), delay: T('tag.delay'), document: T('tag.document'), influence: T('tag.influence'), information: T('tag.information'), introduction: T('tag.introduction'), operator: T('tag.operator'), passage: T('tag.passage'), patrol: T('tag.patrol'), permission: T('tag.permission'), rail: T('tag.rail'), records: T('tag.records'), vehicle: T('tag.vehicle'), watch: T('tag.watch') })[tag] || tag; return w[0].toLowerCase() + w.slice(1); };
  function needText(s, n) {
    // what is missing, named as the thing in the story (the barges, Gianlūka's help), never as a card
    if (n.card) { if (hasTag(s, n.card)) return null; const id = ['sim', 'why', 'need', n.card].join('_').replace(/_/, '.').replace(/_/, '.'); return heldTag(s, n.card) ? T('sim.why.not_here_help') : C.has(id) ? T(id) : T('sim.why.needs_a_card', { card: kindWord(n.card) }); }
    if (n.night) return isNight(s) ? null : T('need.night');
    if (n.arr) { const a = s.arr[n.arr]; return a.stage >= n.stage ? null : T('sim.why.needs_step', { step: D.ARRANGEMENTS[n.arr].stages[n.stage] }); }
    return null;
  }
  function approachList(s) {
    const L = level(s), m = mods(s, L), out = [];
    for (const a of L.approaches) {
      const whys = a.needs.map(n => needText(s, n)).filter(Boolean);
      if (a.once && (s.flags.onceDone || {})[a.id]) whys.push(T('sim.why.already_done'));
      else if (a.success && a.success.advance && !a.success.advance.some(k => s.arr[k].stage < D.ARRANGEMENTS[k].stages.length - 1)) whys.push(T('sim.why.nothing_left_to_move'));
      if (s.event) whys.unshift(s.event.kind === 'hold' ? T('sim.why.you_are_being_held') : T('sim.why.answer_the_news_first'));
      if (a.with && s.people[a.with] && s.people[a.with].cut) whys.push(T('sim.why.you_cut_off', { name: personName(s, a.with) }));
      else if (a.with && s.people[a.with] && s.people[a.with].turned) whys.push(T('sim.why.talked_to_the_inquiry', { name: personName(s, a.with) }));
      let bonus = 0; const used = [];
      for (const tag in a.mods) if (m[tag]) { bonus += a.mods[tag]; used.push({ tag, bonus: a.mods[tag] }); }
      // every change to the roll is named in the preview, so nothing about the odds is hidden
      let dc = a.dc; const why = [];
      const escorted = !!(a.post && s.arr.reception.stage >= 3 && s.escortPost === a.post);
      if (L.border && s.flags.restriction && !hasTag(s, 'delay')) { dc += 1; why.push(T('sim.preview.harder_ban')); } // the sheet is on the desk unless Gianlūka's contact held it
      if (s.flags.roadblock && s.flags.roadblock.pos === s.pos && s.hour < s.flags.roadblock.until) { dc += 1; why.push(T('sim.preview.harder_checkpoint', { time: clockText(s.flags.roadblock.until) })); }
      if (L.final && s.flags.asked && s.arr.reception.stage < 2) { dc += 2; why.push(T('sim.preview.harder_asked')); }
      const news = s.mods[s.pos] || 0;
      if (news) { dc += news; why.push(T(news > 0 ? 'sim.preview.harder_news' : 'sim.preview.easier_news')); }
      if (ch(s).faceKnown && L.border && a.id !== 'received') { dc += 1; why.push(T('sim.preview.harder_face')); } // every officer knows Teresā's face
      // no failure written, or Vélez's officials walk you through: commit() never rolls these
      const free = !!a.noRoll || escorted;
      const need = tgt(dc - bonus), pct = free ? 100 : D.DICE.chance(need); // the 20-sided target and its chance in percent
      if (free) why.length = 0;
      if (escorted) why.push(T('sim.preview.escorted'));
      out.push({ kind: 'approach', id: a.id, name: a.name, hours: a.hours, ok: whys.length === 0, why: whys.join(' '), text: a.text, with: a.with || null, night: a.needs.some(n => n.night),
        odds: free ? '' : pct ? `${pct}%` : 'impossible', pct, need: free ? null : need, dc, noRoll: free, bonusFrom: escorted ? [] : used.map(u => u.tag), bonus: escorted ? [] : used, pay: !!a.pay,
        preview: [a.text, escorted ? '' : free ? T('sim.preview.no_roll') : !pct ? T('sim.preview.cannot_succeed_with_your_current') : T('sim.preview.die_needs_or_more_in', { need, pct, bonus: '' /* the move card names the cards that make it easier */ })].filter(Boolean).concat(why, [T('sim.preview.takes_hour', { hours: a.hours, s: a.hours === 1 ? '' : 's' })]) });
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
      if (p) { out.push({ kind: 'call', id: 'call:' + k, name: T('sim.status.is_on_it', { name: personName(s, ally) }), ok: false, why: T('sim.why.resolves_at', { time: clockText(p.due) }), hours: 0, preview: [text] }); return; }
      if (s.event) whys.unshift(T('sim.why.answer_the_news_first'));
      out.push({ kind: 'call', id: 'call:' + k, name: T('sim.label.call_about', { name: ally === 'sibling' ? T('phone.your_sibling') : personName(s, ally), what: ({ aircraft: T('arr.what_aircraft'), reception: T('arr.what_reception'), permission: T('arr.what_permission') })[k] }), ally, arr: k, ok: whys.length === 0, why: whys.join(' '), hours: 1,
        preview: [text, T('sim.preview.next_reply_in_hours_needs', { stage: def.stages[a.stage + 1], k: jobHours(k), name: personName(s, ally), turned: Math.min(20, tgt(D.PEOPLE[ally].reliability + (s.people[ally].turned ? 6 : 0) - (s.people[ally].trust >= 2 ? 1 : 0))) })] });
    };
    add('aircraft', 'sibling', [A.aircraft.stage === 1 && !s.flags.destination && A.permission.stage < 1 ? T('sim.why.name_a_destination_or_engage', { sponsor: sponsor(s).short }) : null, s.people.sibling.turned ? T('sim.why.not_answering') : null].filter(Boolean),
      T('sim.status.arrange_the_next_stage_charter'));
    add('reception', A.reception.stage < 2 ? 'sibling' : 'official',
      [A.reception.stage === 2 && s.pos < 3 ? T('sim.status.call_from_salta_to_request') : null].filter(Boolean),
      T('sim.status.arrange_reception_through_your_sibling'));
    add('permission', 'sponsor', [s.pos >= ESMERALDA_FROM && A.permission.stage === 0 ? T('sim.status.contact_salek_before_reaching_susana', { sponsor: sponsor(s).short }) : null].filter(Boolean),
      T('sim.status.ask_salek_to_seek_visa', { name: dest(s).name, sponsor: sponsor(s).short, wants: sponsor(s).wants }));
    return out;
  }
  const jobHours = (k) => ({ aircraft: 6, reception: 6, permission: 10 })[k];
  function inboxList(s) {
    return s.inbox.map(m => ({ kind: 'message', id: 'msg:' + m.id, msgId: m.id, from: m.from, name: `${personName(s, m.from)}: ${m.text}`, ok: true, hours: 0,
      options: m.options.map(o => Object.assign({}, o, { ok: optionOk(s, o), why: optionWhy(s, o) })) }));
  }
  function optionWhy(s, o) {
    if (o.id === 'via_sponsor' && !heldTag(s, 'permission')) return T('sim.why.you_do_not_have_salek', { sponsor: sponsor(s).short });
    if (o.id === 'velez_word' && !hasTag(s, 'introduction')) return T('sim.why.you_do_not_have_v');
    if (o.id === 'send_decoy_yard' && !heldTag(s, 'decoy')) return T('sim.why.nando_and_the_spare_cars');
    if (o.id === 'via_sponsor' && s.people.sponsor.turned) return T('sim.why.salek_is_not_taking_your', { sponsor: sponsor(s).short });
    return '';
  }
  const optionOk = (s, o) => !optionWhy(s, o) && !s.event;
  // hours from now until 10 p.m., when the night moves open
  const hoursToDark = (s) => (22 - (START_HOUR + s.hour) % 24 + 24) % 24;
  // waiting for dark is the same as lying low hour by hour: news or a police stop ends it, as it would block the next hour
  function waitDark(s) { const night = level(s).approaches.some(a => a.needs.some(n => n.night)); return { kind: 'wait', id: 'wait_dark', hours: hoursToDark(s), ok: !s.over && !s.event && night && !isNight(s) }; }
  function actions(s) { return { event: eventView(s), approaches: approachList(s), calls: callList(s), messages: inboxList(s), wait: { kind: 'wait', id: 'wait', name: T('sim.label.lie_low_one_hour'), ok: !s.over && !s.event, hours: 1 }, waitDark: waitDark(s) }; }

  // ---- dispatches and holds: the News phase --------------------
  const fill = (s, t) => String(t).replace(/\{sib\}/g, ch(s).sibling.short).replace(/\{here\}/g, s.pos === 0 ? 'the residence' : s.pos === 4 ? 'the line' : level(s).short);
  // declarative conditions (pbbg-content-schema shape): { ref, op: eq | gte | contains, value } against declared facts
  function fact(s, ref) {
    if (ref === 'clock.hoursLeft') return HOURS_TOTAL - s.hour;
    if (ref.startsWith('hand.')) return s.hand.includes(ref.slice(5));
    if (ref.startsWith('flag.')) return !!s.flags[ref.slice(5)];
    return undefined;
  }
  function holds(s, c) { const v = fact(s, c.ref); return c.op === 'eq' ? v === c.value : c.op === 'gte' ? typeof v === 'number' && v >= c.value : c.op === 'contains' ? typeof v === 'string' && v.includes(c.value) : false; }
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
    const pool = D.EVENTS.filter(e => (!e.at || e.at.includes(L.id)) && !s.seenEvents.includes(e.id) && (!e.when || e.when.every(c => holds(s, c))));
    if (!pool.length) return;
    const pick = pool[Math.floor(s._rng() * pool.length)];
    s.seenEvents.push(pick.id); s.event = { kind: 'event', id: pick.id };
    events.push(ev('dispatch', { id: pick.id, title: fill(s, pick.title), text: fill(s, pick.text) }));
  }
  function climbHold(s, events) {
    if (s.tutorial || s.over) return;
    let r = s.hold + 1; if (s.flags.restriction && s.hold === 0) r = 2; // once the travel ban is out, the first hold is a station, not a roadside
    // Jurisdiction: across the line a Valdórian court holds nobody. Costamar questions you only once Sosā has asked it to, and never climbs past that.
    if (s.pos >= ESMERALDA_FROM) { if (!s.flags.asked) return; r = 1; }
    s.hold = Math.min(3, r); s.holds += 1; s.belief = s.pos; s.lastHoldAt = s.hour;
    s.event = { kind: 'hold', rung: s.hold };
    events.push(ev('hold', { rung: s.hold, title: D.HOLDS[s.hold].title, text: fill(s, D.HOLDS[s.hold].text) }));
  }
  function choiceWhy(s, c) { for (const n of c.needs || []) { const w = needText(s, n); if (w) return w; } if (c.id === 'embassy' && s.people.sibling.turned) return T('sim.why.is_not_answering', { name: ch(s).sibling.short }); return ''; }
  // Markers: what a choice costs or gives, as short tags the UI shows instead of sentences.
  function fxTags(s, fx, out) {
    out = out || []; if (!fx) return out;
    const first = (id) => shortName(s, id);
    if (fx.roll) { const need = fx.roll.need + (fx.roll.face && ch(s).faceKnown ? 1 : 0) - (fx.roll.decoy && hasTag(s, 'decoy') ? 1 : 0); out.push(M('roll', 'roll.need', { need: tgt(need) })); const lose = fxTags(s, fx.roll.lose, []); if (lose.length) out.push(M('risk', 'roll.fail', { list: lose.map(x => chipLower(x.t)).join(', ') })); return out; }
    if (fx.hours) out.push(M('time', fx.hours === 1 ? 'time.hour' : 'time.hours', { hours: hrsText(fx.hours) }));
    if (fx.exposure) out.push(M(fx.exposure > 0 ? 'up' : 'down', 'exposure.change', { signed: (fx.exposure > 0 ? '+' : '') + fx.exposure }));
    if (fx.belief === 'away') out.push(M('down', 'search.elsewhere'));
    if (fx.belief === 'here') out.push(M('up', 'search.finds'));
    if (fx.card) out.push(M('gain', 'card.gain', { card: D.CARDS[fx.card].name }));
    if (fx.lose) out.push(fx.lose === 'random' || fx.lose === 'best' ? M('lose', 'card.lose_any') : M('lose', 'card.lose', { card: D.CARDS[fx.lose].name }));
    if (fx.trust) for (const k in fx.trust) out.push(M(fx.trust[k] > 0 ? 'gain' : 'lose', fx.trust[k] > 0 ? 'trust.more' : 'trust.less', { person: first(k) }));
    if (fx.doubt) out.push(M('risk', 'trust.rely', { person: first(fx.doubt) }));
    if (fx.cut) out.push(M('lose', 'trust.cut', { person: first(fx.cut) }));
    if (fx.test) out.push(M('time', 'trust.test'));
    if (fx.stage) out.push(M('gain', 'arrangement.moves'));
    if (fx.ban) out.push(M('up', 'ban.now'));
    if (fx.skipEnemy) out.push(M('down', 'search.loses_move'));
    if (fx.mod) out.push(M(fx.mod < 0 ? 'down' : 'up', fx.mod < 0 ? 'rolls.easier' : 'rolls.harder'));
    if (fx.hold) out.push(M('risk', 'hold.climb'));
    if (fx.advance) out.push(M('gain', 'route.advance'));
    if (fx.end) out.push(M('risk', 'run.ends'));
    if (fx.flag && fx.flag.dark) out.push(M('up', 'allies.slower'));
    return out;
  }
  function eventView(s) {
    const e = s.event; if (!e) return null;
    let def, kind = e.kind;
    if (kind === 'hold') def = D.HOLDS[e.rung];
    else if (kind === 'rumor') { const n = personName(s, e.who); const first = shortName(s, e.who); def = { title: n, text: D.RUMORS[e.line](first), choices: [
      { id: 'trust', label: T('sim.opt.keep_trusting', { split: first }), fx: { doubt: e.who } },
      { id: 'test', label: T('sim.opt.test_them_quietly', { first }), fx: { hours: 2, test: e.who } },
      { id: 'cut', label: T('sim.opt.cut_them_off', { first }), fx: { cut: e.who } } ] }; }
    else def = D.EVENTS.find(x => x.id === e.id);
    return { kind, rung: e.rung || 0, title: fill(s, def.title), text: fill(s, def.text), choices: def.choices.map(c => { const why = choiceWhy(s, c); return { id: c.id, label: fill(s, c.label), ok: !why, why, tags: fxTags(s, c.fx) }; }) };
  }
  function eventDef(s) { const v = s.event; if (v.kind === 'hold') return D.HOLDS[v.rung]; if (v.kind === 'rumor') return { choices: eventView(s).choices.map((c, i) => ({ id: c.id, fx: [{ doubt: v.who }, { hours: 2, test: v.who }, { cut: v.who }][i] })) }; return D.EVENTS.find(x => x.id === v.id); }
  function resolveEvent(s, choiceId, events) {
    if (!s.event) return { ok: false, why: T('sim.why.no_news_waiting') };
    const def = eventDef(s), c = def.choices.find(x => x.id === choiceId); if (!c) return { ok: false, why: T('sim.why.pick_one_of_the_choices') };
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
      const t = tgt(need), die = roll(s), won = wins(die, t); events.push(ev('roll', { die, need: t, won }));
      applyFx(s, won ? fx.roll.win : fx.roll.lose, events); return;
    }
    say(events, 'narrator', fx.say);
    if (fx.exposure) heat(s, fx.exposure, events);
    if (fx.belief === 'away') { s.belief = s.pos === 0 ? 1 : s.pos - 1; events.push(ev('belief', { belief: s.belief })); }
    if (fx.belief === 'here') { s.belief = s.pos; events.push(ev('belief', { belief: s.belief })); }
    if (fx.card) gain(s, fx.card, events);
    if (fx.lose) { const pool = s.hand.filter(id => fx.lose === 'best' ? true : id !== 'passport'); let id = fx.lose; if (fx.lose === 'random') id = pool[Math.floor(s._rng() * pool.length)]; if (fx.lose === 'best') id = s.hand.includes('passport') ? 'passport' : pool[Math.floor(s._rng() * pool.length)]; if (id) { lose(s, id, events); s.used.push(id); } }
    if (fx.trust) for (const k in fx.trust) { s.people[k].trust = Math.max(-2, Math.min(3, s.people[k].trust + fx.trust[k])); events.push(ev('trust', { who: k, trust: s.people[k].trust, delta: fx.trust[k] })); }
    if (fx.doubt) s.people[fx.doubt].doubt = true;
    if (fx.cut) { s.people[fx.cut].cut = true; for (const id of s.hand.slice()) if (D.CARDS[id].from === fx.cut) lose(s, id, events); say(events, 'narrator', T('sim.say.you_stop_answering', { name: personName(s, fx.cut) })); }
    if (fx.test) { const p = s.people[fx.test]; p.known = true; p.doubt = false; if (p.bad) { p.turned = true; for (const id of s.hand.slice()) if (D.CARDS[id].from === fx.test) lose(s, id, events); say(events, 'narrator', T('sim.say.was_working_for_sosa_you', { name: personName(s, fx.test) })); } else { p.trust = Math.max(p.trust, 2); say(events, 'narrator', T('sim.say.is_clean_and_offended_you', { name: personName(s, fx.test) })); } }
    if (fx.stage) for (const k in fx.stage) stage(s, k, s.arr[k].stage + fx.stage[k], events);
    if (fx.flag) Object.assign(s.flags, fx.flag);
    if (fx.ban) { s.flags.restriction = true; s.flags.enemyDone.circulate = true; } // the court sends the ban itself; Sosā has nothing left to send
    if (fx.skipEnemy) s.lastEnemy = s.hour + 3;
    if (fx.mod) s.mods[s.pos] = (s.mods[s.pos] || 0) + fx.mod;
    if (fx.rung !== undefined) s.hold = fx.rung;
    if (fx.end) { const after = epilogue(s, false, fx.end.kind); s.over = { win: false, kind: fx.end.kind || 'arrest', story: fx.end.reason, after, reason: `${fx.end.reason} ${after}` }; events.push(ev('over', s.over)); return; }
    if (fx.hold) climbHold(s, events);
    if (fx.advance) advanceLevel(s, events);
    if (fx.hours) pass(s, fx.hours, events);
  }

  // ---- commit ----------------------------------------------------
  // Every accepted action goes on s.actions, so seed + actions replays the run (the replay link, the recorder).
  function commit(s, actionId, optionId) {
    const r = _commit(s, actionId, optionId);
    if (r.ok) (s.actions = s.actions || []).push(optionId === undefined ? [actionId] : [actionId, optionId]);
    return r;
  }
  function _commit(s, actionId, optionId) {
    if (s.over) return { ok: false, why: T('sim.why.the_run_is_over') };
    const events = [];
    if (actionId.startsWith('evt:')) return resolveEvent(s, actionId.slice(4), events);
    if (s.event) return { ok: false, why: s.event.kind === 'hold' ? T('sim.why.you_are_being_held') : T('sim.why.answer_the_news_first') };
    if (actionId === 'wait') { pass(s, 1, events); return finish(s, events); }
    if (actionId === 'wait_dark') { if (!waitDark(s).ok) return { ok: false, why: T('sim.why.not_something_you_can_do') }; while (!isNight(s) && !s.event && !s.over) pass(s, 1, events); return finish(s, events); }
    if (actionId.startsWith('msg:')) return answer(s, +actionId.slice(4), optionId, events);
    if (actionId.startsWith('call:')) return call(s, actionId.slice(5), events);
    const a = level(s).approaches.find(x => x.id === actionId);
    if (!a) return { ok: false, why: T('sim.why.not_something_you_can_do') };
    const view = approachList(s).find(x => x.id === actionId);
    if (!view.ok) return { ok: false, why: view.why };
    events.push(ev('attempt', { id: a.id, name: a.name }));
    if (a.once) { s.flags.onceDone = s.flags.onceDone || {}; s.flags.onceDone[a.id] = true; }
    if (a.post && s.arr.reception.stage >= 3 && s.escortPost === a.post) {
      events.push(ev('roll', { die: null, need: 1, won: true, auto: true, escort: true, bonus: [] })); say(events, 'narrator', level(s).received.say); pass(s, level(s).received.hours, events); if (!s.over) advanceLevel(s, events); return finish(s, events);
    }
    // every move rolls the 20-sided die, except the few with no failure written; cards lower the target but never remove the roll
    let won;
    if (a.noRoll) { won = true; events.push(ev('roll', { die: null, need: null, won, auto: true, bonus: [] })); }
    else { const die = roll(s); won = wins(die, view.need); events.push(ev('roll', { die, need: view.need, won, bonus: view.bonusFrom })); }
    const bought = won && a.post && a.post === s.boughtPost; // the Valdórian side lets you through and the bought Costamaran post turns you back
    if (bought) events[events.length - 1].bought = true;
    apply(s, won ? (bought ? Object.assign({}, a.success, { say: '' }) : a.success) : a.fail, events, a);
    // the wrong person to trust: a compromised ally may sell the move
    if (a.with && s.people[a.with] && s.people[a.with].bad && !s.people[a.with].known && s._rng() < 0.6) {
      const p = s.people[a.with]; p.known = true; p.turned = true; s.belief = s.pos; heat(s, 3, events); events.push(ev('belief', { belief: s.belief }));
      say(events, 'narrator', T('sim.say.sold_you_out_sosa_knows', { name: personName(s, a.with) })); events.push(ev('betrayal', { who: a.with }));
    }
    // the final boss: the Valdórian side lets you through and the bought Costamaran post detains you anyway
    if (bought) {
      say(events, 'narrator', level(s).bought.say); ledger(s, 'official', T('sim.ledger.post_was_bought', { post: postName(a.post) }));
      s.belief = s.pos; events.push(ev('belief', { belief: s.belief })); heat(s, 2, events); pass(s, a.hours + 12, events); return finish(s, events);
    }
    if (won && a.success.win) {
      { const after = epilogue(s, true); s.over = { win: true, kind: 'out', story: a.success.say, after, reason: `${a.success.say} ${after}` }; } events.push(ev('over', s.over)); return { ok: true, events }; }
    pass(s, a.hours + ((won ? a.success : a.fail).hours || 0), events);
    if (won && !s.over) { const exits = EXITS[level(s).id]; if (!exits || exits.includes(a.id)) advanceLevel(s, events); }
    return finish(s, events);
  }
  function apply(s, fx, events, a) {
    if (!fx) return;
    if (a && a.id === 'decoy' && fx === a.success) say(events, 'nando', T('sim.line.nando_decoy_success'), true);
    else if (a && a.id === 'help_host' && fx === a.success) say(events, 'host', T('sim.line.nona_truck_released'), true);
    else if (a && a.id === 'help_host' && fx === a.fail) say(events, 'host', T('sim.line.nona_truck_late'), true);
    else {
      // a move that advances arrangements says only what really moved
      const movable = fx.advance ? fx.advance.filter(k => s.arr[k].stage < D.ARRANGEMENTS[k].stages.length - 1) : null;
      say(events, 'narrator', movable && movable.length < fx.advance.length ? T('sim.say.calls_moved_some', { list: movable.map(k => D.ARRANGEMENTS[k].name).join(', ') }) : fx.say);
    }
    if (fx.exposure) heat(s, fx.exposure, events);
    if (fx.belief !== undefined) { s.belief = fx.belief; events.push(ev('belief', { belief: s.belief })); }
    if (fx.card) gain(s, fx.card, events);
    if (fx.trust) { s.people[fx.trust].trust += 1; events.push(ev('trust', { who: fx.trust, trust: s.people[fx.trust].trust, delta: 1 })); }
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
    let line = (D.STAGE_LINES[k] || [])[to]; if (line) line = line.replace('{post}', postName(s.escortPost)).split('{sponsor}').join(sponsor(s).short).replace('{city}', dest(s).city); if (line && to > s.arr[k].low) say(events, k === 'aircraft' || k === 'reception' ? 'sibling' : 'sponsor', line);
    if (k === 'reception' && to >= 2) gain(s, 'intro_vel', events);
    if (k === 'permission' && to === 1) gain(s, 'sponsor_line', events);
  }
  function advanceLevel(s, events) {
    if (s.pos >= D.LEVELS.length - 1) return;
    const left = level(s).id; // a way onto the freight is gone once you leave the stop where it counts, not before you get there
    s.pos += 1; s.visited.push(s.pos); events.push(ev('travel', { to: s.pos }));
    for (const id of s.hand.slice()) { const c = D.CARDS[id]; if (c && c.tag === 'passage' && c.reach.includes(left)) { lose(s, id, events); s.used.push(id); } }
    arrive(s, events, false);
  }
  function call(s, k, events) {
    const c = callList(s).find(x => x.id === 'call:' + k);
    if (!c || !c.ok) return { ok: false, why: c ? c.why : T('sim.why.nothing_to_call_about') };
    if (k === 'reception' && s.arr.reception.stage === 1 && !s.commitments.some(x => x.to === 'official')) { s.commitments.push({ to: 'official', text: D.PEOPLE.official.terms, kept: true }); events.push(ev('commit', { to: 'official', text: D.PEOPLE.official.terms })); }
    s.calledAt = s.hour;
    const due = s.hour + 1 + jobHours(k) + (s.flags.dark ? 2 : 0) + (k === 'permission' ? sponsor(s).slow : 0);
    s.jobs.push({ arr: k, ally: c.ally, target: s.arr[k].stage + 1, due }); ledger(s, c.ally, T('sim.ledger.promised', { what: D.ARRANGEMENTS[k].stages[s.arr[k].stage + 1], due: clockText(due) }));
    events.push(ev('job', { arr: k, ally: c.ally, due, dueText: clockText(due) }));
    say(events, c.ally, k === 'aircraft' ? T('sim.line.leave_it_with_me_six') : k === 'reception' ? (c.ally === 'official' ? T('sim.line.i_will_see_what_the') : T('sim.line.i_have_a_name_in')) : T('sim.line.ten_hours_and_you_understand'));
    pass(s, 1, events); return finish(s, events);
  }
  function answer(s, id, optionId, events) {
    const i = s.inbox.findIndex(m => m.id === id); if (i < 0) return { ok: false, why: T('sim.why.that_message_is_gone') };
    const m = s.inbox[i], o = m.options.find(x => x.id === optionId); if (!o) return { ok: false, why: T('sim.why.pick_one_of_the_answers') };
    if (!optionOk(s, o)) return { ok: false, why: optionWhy(s, o) };
    s.inbox.splice(i, 1); events.push(ev('answered', { id, option: o.id, label: o.label }));
    switch (o.id) {
      case 'confirm_dest': s.flags.destination = true; stage(s, 'aircraft', 1, events); say(events, 'sibling', T('sim.line.city_i_will_tell_the', { city: dest(s).city })); break;
      case 'wait_sponsor': stage(s, 'aircraft', 1, events); say(events, 'sibling', T('sim.line.then_call_salek_soon_the', { sponsor: sponsor(s).short })); break;
      case 'delegate_sibling': stage(s, 'aircraft', 1, events); { const d = roll(s), t = tgt(D.PEOPLE.sibling.reliability); const good = wins(d, t); events.push(ev('roll', { die: d, need: t, won: good, who: 'sibling' })); if (good) { s.flags.destination = true; say(events, 'sibling', T('sim.line.i_told_them_city_do', { city: dest(s).city })); } else { s.jobs.push({ arr: 'aircraft', ally: 'sibling', target: 1, due: s.hour + 6, stall: true }); say(events, 'sibling', T('sim.line.i_could_not_decide_for')); } } break;
      case 'keep_calling': s.jobs.push({ arr: 'reception', ally: 'sibling', target: 2, due: s.hour + 6 }); break;
      case 'via_sponsor': stage(s, 'reception', 2, events); lose(s, 'sponsor_line', events); s.used.push('sponsor_line'); say(events, 'sponsor', T('sim.line.her_uncle_banks_with_me')); break;
      case 'wait_velez': break;
      case 'keep_word': { const c = s.commitments.find(x => x.to === 'aide'); c.kept = true; s.people.aide.trust = 3; gain(s, 'informant', events); say(events, 'aide', T('sim.line.thank_you_sosa_s_people')); s.belief = 1; events.push(ev('belief', { belief: 1 })); } break;
      case 'break_word': { const c = s.commitments.find(x => x.to === 'aide'); c.kept = false; s.people.aide.turned = true; for (const id of s.hand.slice()) if (D.CARDS[id].from === 'aide') lose(s, id, events); s.belief = s.pos; heat(s, 2, events); say(events, 'narrator', T('sim.say.gianluka_does_not_answer_again')); } break;
      case 'crew_bonus': stage(s, 'aircraft', 4, events); heat(s, 1, events); say(events, 'pilot', T('sim.line.the_crew_is_happy_the')); break;
      case 'velez_word': stage(s, 'aircraft', 4, events); say(events, 'pilot', T('sim.line.the_operator_just_had_a')); break;
      case 'ignore_pilot': break;
      case 'confirm_yacht': s.belief = 0; s.flags.lied = true; heat(s, -1, events); events.push(ev('belief', { belief: 0 })); say(events, 'narrator', T('sim.say.the_radio_has_you_at')); break;
      case 'deny_yacht': s.belief = 0; events.push(ev('belief', { belief: 0 })); say(events, 'narrator', T('sim.say.they_go_to_the_house')); break;
      case 'no_comment': break;
      case 'sign_accounts': { const c = s.commitments.find(x => x.to === 'sponsor'); if (c) c.kept = true; else { s.commitments.push({ to: 'sponsor', text: sponsor(s).terms, kept: true }); events.push(ev('commit', { to: 'sponsor', text: sponsor(s).terms })); } s.people.sponsor.trust = 2; s.flags.signed = true; if (sponsor(s).demand.heat) heat(s, sponsor(s).demand.heat, events); say(events, 'sponsor', T('sim.line.good_the_ministry_will_hear')); } break;
      // the demand is optional: the sponsor keeps asking for your visa at the usual odds
      case 'refuse_salek': say(events, 'sponsor', T('sim.line.as_you_wish')); break;
      case 'go_midnight': break;
      case 'send_decoy_yard': lose(s, 'decoy_cars', events); s.used.push('decoy_cars'); heat(s, -2, events); s.belief = 1; events.push(ev('belief', { belief: 1 })); say(events, 'narrator', T('sim.say.the_sedan_rolls_past_the')); break;
      case 'guest_yes': s.flags.guest = true; say(events, 'official', T('sim.line.thank_you_my_people_will')); break;
      case 'guest_no': { const c = s.commitments.find(x => x.to === 'official'); if (c) c.kept = false; if (s.arr.reception.stage >= 2) stage(s, 'reception', 1, events); s.jobs = s.jobs.filter(j => j.arr !== 'reception'); say(events, 'official', T('sim.line.then_you_will_cross_like')); } break;
      case 'sosa_talk': s.lastEnemy = s.hour + 2; say(events, 'enemy', T('sim.line.think_about_it_i_will')); break;
      case 'sosa_hang': break;
    }
    pass(s, o.hours || 0, events); return finish(s, events);
  }

  // ---- time: jobs resolve, the enemy acts, exposure drifts ------
  function pass(s, hours, events) {
    for (let i = 0; i < hours && !s.over; i++) {
      s.hour += 1; events.push(ev('hour', { hour: s.hour, clock: clockText(s.hour) }));
      for (const j of s.jobs.slice()) if (j.due <= s.hour) resolveJob(s, j, events);
      // exposure drifts while they look in the right place; Salta's wait for the midnight freight drifts at half rate
      if (s.belief === s.pos && s.hour % (s._manual || level(s).id === 'salta' ? 4 : 2) === 0) heat(s, 1, events);
      // the hold ladder decays: twelve quiet hours drop a rung, so Saturday's questioning is not Monday's house arrest
      if (s.hold > 0 && !s.event && s.hour - s.lastHoldAt >= 12) { s.hold -= 1; s.lastHoldAt = s.hour; }
      if (!s._manual && s.hour - s.lastEnemy >= ENEMY_EVERY) { s.lastEnemy = s.hour; enemyTurn(s, events); }
      if (s.exposure >= EXPOSURE_LIMIT) { if (s.tutorial) s.exposure = EXPOSURE_LIMIT - 1; else { s.exposure = 4; climbHold(s, events); } }
      if (!s.over && s.hour >= HOURS_TOTAL) { const story = T('sim.end.your_immunity_is_gone_a', { time: clockText(s.hour) }), after = epilogue(s, false); s.over = { win: false, kind: 'clock', story, after, reason: `${story} ${after}` }; events.push(ev('over', s.over)); }
      if (!s.over && !s.event && s.hour >= s.nextEventAt) { s.nextEventAt = s.hour + EVENT_EVERY; drawEvent(s, events); }
    }
  }
  function resolveJob(s, j, events) {
    s.jobs = s.jobs.filter(x => x !== j);
    if (j.stall) return;
    const rel = D.PEOPLE[j.ally].reliability + (s.people[j.ally].turned ? 6 : 0) - (s.people[j.ally].trust >= 2 ? 1 : 0);
    const d = roll(s), t = tgt(rel), good = wins(d, t);
    events.push(ev('roll', { die: d, need: t, won: good, who: j.ally }));
    if (good) { if (j.arr === 'aircraft' && j.target === 2 && !s.flags.destination && s.arr.permission.stage < 1) { say(events, 'sibling', T('sim.line.the_crew_will_not_confirm')); return; }
      ledger(s, j.ally, T('sim.ledger.delivered', { what: D.ARRANGEMENTS[j.arr].stages[j.target] })); stage(s, j.arr, j.target, events); if (j.arr === 'permission' && j.target === 1) s.flags.destination = true; }
    else { ledger(s, j.ally, T('sim.ledger.nothing_yet', { what: D.ARRANGEMENTS[j.arr].stages[j.target] })); say(events, j.ally, j.ally === 'sibling' ? T('sim.line.nothing_yet_they_want_more') : j.ally === 'sponsor' ? T('sim.line.the_ministry_has_not_called') : T('sim.line.the_minister_has_other_guests')); }
  }
  function enemyTurn(s, events, forced) {
    // the government side runs these actions by hand and sees them in its own voice, without her hidden state
    const V = (mine, theirs) => T(s._manual ? theirs : mine);
    const say3 = (p) => (s._manual && p.gtext) || p.text;
    let talked = false, pressed = null, traced = false; // an ally gave up her location: an outcome, never read from the wording
    const cands = D.ENEMY_ACTIONS.filter(a => !(a.once && s.flags.enemyDone[a.id]) && !(a.after && s.hour < a.after));
    const total = cands.reduce((n, a) => n + a.w, 0); let r = s._rng() * total, pick = cands[0];
    for (const a of cands) { r -= a.w; if (r <= 0) { pick = a; break; } }
    if (s._enemy && s._enemy.length) { const want = s._enemy.shift(); pick = cands.find(a => a.id === want) || pick; }
    if (forced) { pick = D.ENEMY_ACTIONS.find(a => a.id === forced); if (!pick) return null; }
    if (pick.once) s.flags.enemyDone[pick.id] = true;
    let text = '';
    switch (pick.id) {
      case 'check_belief': { const where = s.belief <= 0 ? 'the residence' : s.belief === 4 ? 'the line' : D.LEVELS[s.belief].short; text = say3(pick)(where); if (s.belief === s.pos) { if (s.exposure >= 7) { text += V('sim.inquiry.they_find_you', 'gov.inquiry.found'); events.push(ev('enemy', { id: pick.id, text, belief: s.belief })); climbHold(s, events); return text; } heat(s, s._manual ? 1 : 2, events); text += V('sim.inquiry.they_are_close', 'gov.inquiry.close'); } else text += V('sim.inquiry.nobody_there_has_seen_you', 'gov.inquiry.not_seen'); break; }
      case 'trace': { text = say3(pick)(); if (s.hour - s.calledAt <= 3) { traced = true; s.belief = s.pos; events.push(ev('belief', { belief: s.belief })); text += V('sim.inquiry.the_last_call_came_from', 'gov.inquiry.last_call'); } else text += V('sim.inquiry.nothing_new', 'gov.inquiry.no_calls'); break; }
      case 'circulate': s.flags.restriction = true; text = say3(pick)(); break;
      // her jet's progress stays hidden from the government side
      case 'lean_operator': s.flags.leaned = true; if (s.arr.aircraft.stage >= 3) { stage(s, 'aircraft', s.arr.aircraft.stage - 1, events); text = say3(pick)() + (s._manual ? '' : T('sim.inquiry.the_operator_withdraws_the_crew')); } else text = say3(pick)(); break;
      case 'press_ally': { const pool = Object.keys(s.people).filter(k => k !== 'sibling' && k !== 'sponsor' && !s.people[k].turned && s.hand.some(id => D.CARDS[id] && D.CARDS[id].from === k)); if (!pool.length) { text = T('sim.inquiry.reviews_the_passenger_lists_at', { name: D.ENEMY.name }); break; } const who = pool[Math.floor(s._rng() * pool.length)]; pressed = who; text = say3(pick)(personName(s, who)); const d = roll(s), t = tgt(4 + s.people[who].trust); const holds = !wins(d, t); events.push(ev('roll', { die: d, need: t, won: holds, who, pressed: true })); if (holds) text += T('sim.inquiry.says_nothing_useful', { first: shortName(s, who) }); else { talked = true; s.people[who].turned = true; s.belief = s.pos; heat(s, s.flags.lied ? 3 : 2, events); text += s._manual ? T('gov.inquiry.helper_talks', { first: shortName(s, who) }) : T('sim.inquiry.tells_them_where_you_were', { first: shortName(s, who), yacht: s.flags.lied ? T('sim.inquiry.the_yacht_story_is_dead') : '' }); } break; }
      case 'ask_esmeralda': s.flags.asked = true; text = say3(pick)(); break;
      case 'press_story': { s.belief = s.pos === 0 ? 1 : 0; heat(s, -1, events); text = say3(pick)(); break; }
      case 'roadblock': { s.flags.roadblock = { pos: s.belief, until: s.hour + 6 }; text = say3(pick)(s.belief <= 0 ? 'the residence' : s.belief === 4 ? 'the line' : D.LEVELS[s.belief].short); break; }
      case 'watch_sibling': { text = say3(pick)(personName(s, 'sibling')); for (const j of s.jobs) if (j.ally === 'sibling') j.due += 4; break; }
    }
    events.push(ev('enemy', { id: pick.id, text, belief: s.belief, talked, who: pressed, hit: pick.id === 'trace' ? s.belief === s.pos && traced : pick.id === 'check_belief' ? s.belief === s.pos : undefined }));
    return text;
  }
  // The government side: run one named inquiry action now, and pass time without the automatic inquiry.
  function enemyAct(s, id, events) { if (id === 'roadblock' || id === 'check_belief') s.lastEnemy = s.hour; return enemyTurn(s, events, id); }
  function passHours(s, hours, events) { pass(s, hours, events); }
  function finish(s, events) { return { ok: true, events }; }
  function ledger(s, who, text) { s.ledger.push({ hour: s.hour, who, text }); if (s.ledger.length > 60) s.ledger.shift(); }
  // Save and resume: everything but the rng closure and the boot events is plain data.
  function serialize(s) { const o = Object.assign({}, s); delete o._rng; delete o._boot; return JSON.stringify(o); }
  function restore(json) { const s = JSON.parse(json); s._boot = []; return attachRng(s); }
  // The ending names what the run cost. Built from the state, so every run reads differently.
  function epilogue(s, win, kind) {
    // at most three lines after the ending itself, most important first
    const out = [], first = (id) => shortName(s, id);
    const turned = Object.keys(s.people).filter(k => s.people[k].turned && k !== 'sponsor');
    if (win) out.push(s.arr.permission.stage >= 2 ? T('sim.end.a_car_meets_the_aircraft', { city: dest(s).city }) : T('sim.end.lets_the_jet_land', { name: dest(s).name }));
    if (!win && kind !== 'deal') out.push(T('sim.end.is_named_on_the_warrant', { name: personName(s, 'sibling') })); // the deal closes the case
    if (s.holds) out.push(s.holds === 1 ? T('sim.end.you_were_held_once_along') : T('sim.end.you_were_held_times_along', { holds: num(s.holds) }));
    if (turned.length) out.push(T('sim.end.talked_to_the_inquiry_will', { and: turned.map(first).join(' and ') }));
    for (const c of s.commitments) {
      if (c.to === 'aide') out.push(c.kept === false ? T('sim.end.leads_the_party_now_and', { aide: first('aide') }) : c.kept ? T('sim.end.leads_the_party_in_your', { aide: first('aide') }) : T('sim.end.is_still_waiting_for_the', { aide: first('aide') }));
      if (c.to === 'official' && c.kept === false) out.push(T('sim.end.baca_reads_your_refusal_as'));
    }
    if (win && s.flags.signed) out.push(sponsor(s).kept);
    if (s.people.host.trust > 0) out.push(T('sim.end.nona_rosa_s_truck_runs'));
    return out.slice(0, 3).join(' ');
  }

  // leaving or finishing the demo hands over a real run: no more scripted dice or police moves, and police stops happen again (as Gov.endTutorial does)
  function endTutorial(s) { delete s._dice; s._enemy = null; s.tutorial = false; }
  return { approachList, HOURS_TOTAL, EXPOSURE_LIMIT, START_HOUR, ESMERALDA_FROM, ENEMY_EVERY, POST_IDS, dest, sponsor, postName, num, personRole, reaches, eventView, fxTags, newRun, serialize, restore, enemyAct, heat, EXITS, passHours, actions, commit, clockText, isNight, personName, shortName, endTutorial };
})();
if (typeof module !== 'undefined') module.exports = Sim;
