/* ============================================================
   COALITION, the government side. You are the minister's aide. The
   computer plays the escaping candidate with the harness policy on a
   hidden Sim run; you see REPORTS (late, partial, sometimes false),
   send ORDERS and REQUESTS that run the inquiry's actions by hand, and
   never her real position until the debrief. Wraps Sim; adds nothing
   to it beyond the manual inquiry.
   ============================================================ */
'use strict';
const Gov = (() => {
  const D = (typeof Data !== 'undefined') ? Data : require('./data.js');
  const S = (typeof Sim !== 'undefined') ? Sim : require('./sim.js');
  const C = (typeof Content !== 'undefined') ? Content : require('./content.js');
  const kindWord = (tag) => { const w = ({ boat: T('tag.boat'), decoy: T('tag.decoy'), delay: T('tag.delay'), document: T('tag.document'), influence: T('tag.influence'), information: T('tag.information'), introduction: T('tag.introduction'), operator: T('tag.operator'), passage: T('tag.passage'), patrol: T('tag.patrol'), permission: T('tag.permission'), rail: T('tag.rail'), records: T('tag.records'), vehicle: T('tag.vehicle'), watch: T('tag.watch') })[tag] || tag; return w[0].toLowerCase() + w.slice(1); }; // card kinds in player words
  const hrsText = (n) => n === 1 ? T('scene.hours_one') : T('scene.hours', { n: S.num(n) }); // a duration in words for effect chips
  const M = (k, code, args) => C.marker(k, code, args);
  const T = (id, args) => C.t(id, args);
  const ev = (type, data) => Object.assign({ type }, data);
  const LV = (i) => D.LEVELS[Math.max(0, Math.min(D.LEVELS.length - 1, Number.isFinite(i) ? i : 0))];
  const EVERY = 5, LEAK = 0.5; // a stop she reaches is reported only some of the time
  const place = (i) => i === 0 ? 'the residence' : i === 4 ? 'the line' : LV(i).short;

  function newRun(seed, target, opts) {
    target = target || 'woman'; opts = opts || {};
    // she picks her own country; the player learns it from the charter's flight plan, never from the state
    const pick = ((seed >>> 0) % 10) < 8 ? 'atlanta' : ['zaryanova', 'tarun'][(seed >>> 0) % 2]; // she usually knows who will have her
    const c = S.newRun(seed, target, { manualEnemy: true, dest: (opts && opts.dest) || pick });
    const g = { seed, target, c, belief: 0, hand: ['watch', 'desk'], reports: [], pending: [], req: { ban: 'notyet', hold: 'notyet', operator: 'notyet' }, inbox: [], nextMsg: 1,
      timeline: [], orders: [], ministerBy: 2, ministerTold: null, claims: 0, lastReportHour: null, flags: { askedTime: 0, locationGiven: false, wrongClaim: false }, over: null,
      event: null, seenEvents: [], nextEventAt: 3, dcMods: [], standing: 0, answered: [], chosen: 0 };
    if (opts.dice) g._dice = opts.dice.slice();
    if (opts.events) g._events = opts.events.slice();
    if (opts.tutorial) g.tutorial = true;
    g._rngState = (seed ^ 0x9e3779b9) >>> 0;
    attach(g);
    const events = [];
    events.push(ev('say', { who: 'narrator', text: T('gov.say.port_venla_saturday_afternoon_two') }));
    report(g, events, 0, 'watch', T('gov.report.her_car_is_in_the'), T('gov.report.someone_is_home'), T('gov.report.that_she_will_stay'), 0, 0);
    msg(g, events, 'minister', T('gov.line.where_is_she_i_want'), [
      { id: 'tell_now', label: T('gov.opt.name_where_you_think_she'), hours: 0, effect: '' },
      { id: 'ask_time', label: T('gov.opt.ask_for_six_hours'), hours: 0, effect: '' },
    ]);
    g._boot = events; return g;
  }
  function attach(g) { g._rng = function () { let a = (g._rngState + 0x6D2B79F5) | 0; g._rngState = a; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; return g; }
  const roll = (g) => (g._dice && g._dice.length) ? g._dice.shift() : 1 + Math.floor(g._rng() * 6);
  const personName = (g, id) => ({ minister: T('gov.name.the_minister'), watch: T('gov.name.the_watch_team'), desk: T('gov.name.the_santa_laura_desk'), rail: T('gov.name.the_railway_contact'), embassy: T('gov.name.the_embassy_in_baca'), aviation: T('gov.name.the_aviation_desk'), enemy: T('gov.name.inspector_sosa'), press: T('gov.name.radi_port_venla') })[id] || S.personName(g.c, id);
  function msg(g, events, from, text, options) { const m = { id: g.nextMsg++, from, text, options }; g.inbox.push(m); events.push(ev('message', { id: m.id, from, text })); }
  function report(g, events, at, source, text, proves, doesnt, delay, hour, misleading) {
    const r = { at, source, text, proves, doesnt, hour: (hour === undefined ? g.c.hour : hour) + (delay || 0), misleading: !!misleading, seen: false };
    if (delay) g.pending.push(r); else { g.reports.unshift(r); g.lastReportHour = r.hour; events.push(ev('report', { from: source, text: `${text} (${proves}; does not prove ${doesnt.charAt(0).toLowerCase() + doesnt.slice(1)})`, at })); }
  }
  function release(g, events) { for (const r of g.pending.slice()) if (!r.job && r.hour <= g.c.hour) { g.pending = g.pending.filter(x => x !== r); g.reports.unshift(r); g.lastReportHour = r.hour; events.push(ev('report', { from: r.source, text: r.text, at: r.at })); } }

  // ---- the candidate plays herself: the harness policy, one action at a time ----
  const PREF = { confirm_dest: 1, keep_calling: 1, via_sponsor: 0, keep_word: 1, crew_bonus: 1, velez_word: 0, confirm_yacht: 1, sign_accounts: 1, go_midnight: 1, guest_yes: 1, sosa_hang: 1 };
  function herStep(g) {
    const c = g.c, A = S.actions(c), before = c.hour;
    // her dispatches and holds come first; she takes the choice whose markers look cheapest
    if (A.event) { const score = (x) => x.tags.reduce((n, t) => n + ({ risk: 4, up: 2, lose: 2, time: 1, roll: 1 }[t.k] || 0) - ({ down: c.belief === c.pos ? 3 : 1, gain: 1 }[t.k] || 0), 0); const ch = A.event.choices.filter(x => x.ok).sort((a, b) => score(a) - score(b))[0]; return S.commit(c, 'evt:' + ch.id).events; }
    if (A.messages.length) { const m = A.messages[0]; const opt = m.options.filter(o => o.ok).sort((a, b) => (PREF[b.id] || 0) - (PREF[a.id] || 0))[0]; return S.commit(c, m.id, opt.id).events; }
    const calls = A.calls.filter(x => x.ok), lvl = c.pos;
    if (calls.length && (lvl < 4 || (lvl === 4 && c.arr.reception.stage < 3) || (lvl === 5 && (c.arr.aircraft.stage < 4 || c.arr.permission.stage < 2)))) { const order = ['permission', 'aircraft', 'reception']; calls.sort((a, b) => order.indexOf(a.arr) - order.indexOf(b.arr)); return S.commit(c, calls[0].id).events; }
    const L = D.LEVELS[c.pos];
    const found = c.belief === c.pos;
    const apps = A.approaches.filter(a => a.ok && a.need <= (found ? 6 : 5)).filter(a => { const d = L.approaches.find(x => x.id === a.id); return !(d.success.card && c.hand.includes(d.success.card)); });
    const ex = S.EXITS[L.id], exits = (a) => !ex || ex.includes(a.id) ? 0 : 1;
    apps.sort((a, b) => exits(a) - exits(b) || a.need - b.need);
    if (apps.length && (lvl !== 5 || apps[0].id !== 'fuel_now' || c.arr.aircraft.stage < 3)) return S.commit(c, apps[0].id).events;
    return S.commit(c, 'wait').events;
  }
  // what her actions leak as reports, with the delay a report takes to reach a desk
  function leak(g, events, evs) {
    const c = g.c;
    for (const e of evs) {
      if (e.type === 'attempt' && e.id === 'decoy') report(g, events, 1, 'watch', T('gov.report.a_red_sedan_took_the'), T('gov.report.a_car_is_heading_south'), T('gov.report.she_was_inside'), 0, c.hour, true);
      if (e.type === 'attempt' && e.id === 'decoy') report(g, events, 0, 'watch', T('gov.report.three_cars_left_the_residence'), T('gov.report.the_cars_left'), T('gov.report.which_one_she_is_in'), 0, c.hour);
      if (e.type === 'attempt' && e.id === 'partycar') report(g, events, 0, 'watch', T('gov.report.the_party_s_official_car'), T('gov.report.the_car_left'), T('gov.report.who_was_in_the_back'), 1, c.hour);
      if (e.type === 'travel' && g._rng() < LEAK) { const to = e.to;
        if (to === 1) report(g, events, 1, 'desk', T('gov.report.a_plain_car_with_capital'), T('gov.report.a_car_from_the_capital'), T('gov.report.whose_it_is'), 3, c.hour);
        if (to === 2) report(g, events, 2, 'desk', T('gov.report.the_nova_trent_cooperative_had'), T('gov.report.someone_stayed_at_the_col'), 'Who.', 5, c.hour);
        if (to === 3) report(g, events, 3, 'rail', T('gov.report.somebody_asked_about_the_midnight'), T('gov.report.someone_wants_the_freight'), T('gov.report.that_it_was_her'), 2, c.hour);
        if (to === 4) report(g, events, 4, 'desk', T('gov.report.a_passenger_left_the_salta'), T('gov.report.someone_rode_the_freight'), T('gov.report.that_she_crossed'), 2, c.hour);
        if (to === 5) report(g, events, 5, 'aviation', T('gov.report.a_charter_at_susana_is', { city: D.DESTS[c.dest].city }), T('gov.report.a_jet_is_preparing_to'), T('gov.report.that_she_has_reached_it'), 2, c.hour); }
      if (e.type === 'stage' && e.arr === 'aircraft' && e.stage === 1) report(g, events, 5, 'aviation', T('gov.report.a_charter_to_layuna_is', { city: D.DESTS[c.dest].city }), T('gov.report.an_aircraft_is_booked'), T('gov.report.that_she_has_reached_it'), 3, c.hour);
      if (e.type === 'stage' && e.arr === 'permission' && e.stage === 2) report(g, events, 5, 'embassy', T('gov.report.visa_issued', { name: D.DESTS[c.dest].name }), T('gov.report.will_receive_her', { name: D.DESTS[c.dest].name }), T('gov.report.where_she_is_now'), 4, c.hour);
      if (e.type === 'enemy' && e.id === 'press_ally' && e.talked) { g.belief = c.belief; report(g, events, c.pos, 'enemy', e.text, T('gov.report.where_she_was_last_seen'), T('gov.inquiry.where_she_is_now'), 0, c.hour); }
      if (e.type === 'hold') report(g, events, c.pos, 'desk', T('gov.report.a_patrol_report_in', { title: e.title.toLowerCase(), place: place(c.pos) }), T('gov.report.where_she_was_stopped'), T('gov.report.where_she_goes_after_release'), 1, c.hour);
      if (e.type === 'over') g.over = e;
    }
  }
  function pass(g, events, hours) {
    const target = g.c.hour + hours, from = g.c.hour;
    while (g.c.hour < target && !g.c.over) { leak(g, events, herStep(g)); }
    if (g.c.hour > from) events.push(ev('passed', { hours: g.c.hour - from }));
    release(g, events);
    if (g.c.over) g.over = g.c.over;
    if (!g.c.over && g.c.hour >= g.ministerBy && !g.flags.locationGiven && !g.flags.ministerLate) { g.flags.ministerLate = true; msg(g, events, 'minister', T('gov.line.you_asked_for_time_the'), [
      { id: 'tell_now', label: T('gov.opt.name_where_you_think_she'), hours: 0, effect: '' },
      { id: 'admit', label: T('gov.opt.say_you_do_not_know'), hours: 0, effect: T('gov.effect.honest_the_minister_briefs_the') },
    ]); }
  }

  // ---- what the player can do -----------------------------------------------------------
  function mods(g) { const out = {}; for (const id of g.hand) { const c = D.GOV_CARDS[id]; if (!c.reach.includes(LV(g.belief).id)) continue; out[c.tag] = (out[c.tag] || 0) + 1; } return out; }
  function orders(g) {
    const m = mods(g), out = [], latest = g.reports.find(r => r.at !== g.belief);
    for (const o of D.GOV_ORDERS) {
      if (o.where && !o.where.includes(g.belief)) continue;
      if (o.after && g.c.hour < o.after) continue;
      if (o.id === 'follow' && !latest) continue;
      if (o.act && D.ENEMY_ACTIONS.find(a => a.id === o.act).once && g.c.flags.enemyDone[o.act]) continue;
      if (o.id === 'lean' && !g.hand.includes('operator')) continue;
      if (o.id === 'rail_ask' && g.hand.includes('rail')) continue;
      let bonus = 0; const used = [];
      for (const tag in o.mods) if (m[tag]) { bonus += o.mods[tag]; used.push({ tag, bonus: o.mods[tag] }); }
      // across the line your ministry commands nothing: a search or a checkpoint in Esmeralda needs the hold
      const abroad = g.belief === 5 && (o.id === 'search' || o.id === 'roadblock' || o.id === 'press');
      const why = abroad && !g.hand.includes('esm_intro') ? T('gov.why.your_ministry_does_not_command') : '';
      const dcm = g.dcMods.filter(d => d.until > g.c.hour).reduce((n, d) => n + d.delta, 0);
      const need = Math.max(1, o.dc - bonus + (abroad ? 1 : 0) + dcm);
      out.push({ kind: 'approach', id: o.id, name: o.name(place(g.belief), latest ? place(latest.at) : ''), hours: o.hours, dc: o.dc, need, ok: !why, why, text: o.text, who: abroad ? T('gov.preview.who_acts_esmeraldan_officials_on') : T('gov.preview.who_acts', { who: o.who }), pay: false,
        odds: need <= 1 ? 'certain' : `${7 - need} in 6`, bonus: used, bonusFrom: used.map(u => u.tag),
        preview: [o.text, need <= 1 ? T('sim.preview.succeeds_without_a_roll') : T('sim.preview.die_needs_or_more_in', { need, need2: 7 - need, bonus: used.length ? ' ' + T('gov.preview.your_cards_lower_it') + used.map(u => `${kindWord(u.tag)} by ${S.num(u.bonus)}`).join(', ') + '.' : '' }), T('gov.preview.takes_hour_acts', { hours: o.hours, s: o.hours === 1 ? '' : 's', who: o.who[0].toUpperCase() + o.who.slice(1) }), o.fail ? T('gov.preview.on_failure', { fail: o.fail }) : T('gov.preview.cannot_fail')] });
    }
    return out;
  }
  function calls(g) {
    const out = [], c = g.c;
    const add = (id, name, ok, why, hours, preview) => out.push({ kind: 'call', id, name, ok, why, hours, preview });
    add('req:hold', T('gov.label.ask_esmeralda_to_hold_her'), g.req.hold === 'notyet', g.req.hold === 'promised' ? T('gov.status.asked_the_embassy_has_not') : T('gov.status.esmeralda_has_agreed'), 1, [T('gov.preview.through_the_embassy_in_baca'), T('gov.preview.a_promise_to_consider_a')]);
    add('req:operator', T('gov.label.open_a_licence_review_on'), g.req.operator === 'notyet' && c.hour >= 6, g.req.operator !== 'notyet' ? T('gov.status.the_aviation_desk_has_it') : T('gov.why.the_aviation_desk_opens_on'), 1, [T('gov.preview.the_aviation_desk_takes_six')]);
    add('req:ban', T('gov.label.confirm_the_travel_ban_reached'), g.c.flags.restriction && g.req.ban !== 'inhand', !g.c.flags.restriction ? T('gov.why.circulate_the_ban_first') : T('gov.status.confirmed_at_the_post'), 1, ['The post answers in four hours and needs a 2 or more. A sent message does not close the border; a confirmed one does.']);
    return out;
  }
  function view(g) {
    const c = g.c, age = (h) => { const d = c.hour - h; return d <= 0 ? 'just now' : `${d} h`; };
    return {
      her: c.who === 'woman' ? 'her' : 'him', suspectName: place(g.belief),
      lastReport: g.lastReportHour === null ? '' : age(g.lastReportHour) + (g.lastReportHour === c.hour ? '' : ' old'), ministerBy: g.ministerBy,
      levelName: [T('gov.scene.the_assignment_port_venla'), T('gov.scene.provincial_desks_santa_laura'), T('gov.scene.the_support_network_nova_trent'), T('gov.scene.the_freight_salta'), T('gov.scene.the_huhui_border'), T('gov.scene.susana_airfield')][g.belief],
      objective: [T('gov.scene.the_watched_convoy_splits_the'), T('gov.scene.reports_conflict_a_patrol_can'), T('gov.scene.someone_is_sheltering_her_your'), T('gov.scene.a_departure_window_is_approaching'), T('gov.scene.the_crossing_could_happen_before'), T('gov.scene.she_may_be_across_the')][g.belief],
      reports: g.reports.map(r => Object.assign({}, r, { age: age(r.hour), source: personName(g, r.source) })),
      event: eventView(g), orders: orders(g), calls: calls(g),
      messages: g.inbox.map(m => ({ id: 'msg:' + m.id, from: m.from, role: m.from === 'minister' ? T('gov.name.interior_minister') : '', text: m.text, options: m.options.map(o => Object.assign({}, o, { ok: true, why: '' })) })),
      requests: [
        { at: 4, title: T('gov.status.travel_ban_at_the_post'), state: g.req.ban === 'inhand' ? 'inhand' : c.flags.restriction ? 'promised' : 'notyet', sub: g.req.ban === 'inhand' ? T('gov.status.confirmed_the_post_has_her') : c.flags.restriction ? T('gov.status.ban_sent_not_confirmed_at') : T('gov.status.not_sent') },
        { at: 5, title: T('gov.status.esmeraldan_hold'), state: g.req.hold, sub: g.req.hold === 'inhand' ? T('gov.status.esmeralda_has_agreed_to_hold') : g.req.hold === 'promised' ? T('gov.status.asked_through_the_embassy_in') : T('gov.status.not_asked') },
      ],
      people: [T('gov.status.your_people_the_watch_team'), T('gov.status.your_people_the_provincial_desk'), g.hand.includes('registry') ? T('gov.status.your_people_the_registry') : T('gov.status.no_one_here_yet'), g.hand.includes('rail') ? T('gov.status.your_people_the_railway_contact') : T('gov.status.your_people_a_railway_contact'), T('gov.status.your_people_the_border_post'), g.hand.includes('esm_intro') ? T('gov.status.your_people_a_name_at') : T('gov.status.no_one_here_your_ministry')],
    };
  }

  // ---- commit --------------------------------------------------------------------------------
  function commit(g, id, optionId) {
    const r = _commit(g, id, optionId);
    if (r.ok) (g.actions = g.actions || []).push(optionId === undefined ? [id] : [id, optionId]);
    return r;
  }
  function _commit(g, id, optionId) {
    if (g.over || g.c.over) return { ok: false, why: T('sim.why.the_run_is_over') };
    const events = [], c = g.c;
    const before = { pos: c.pos, belief: g.belief };
    if (id.startsWith('evt:')) { if (!g.event) return { ok: false, why: T('sim.why.no_news_waiting') }; resolveEvent(g, id.slice(4), events); return done(g, events); }
    if (g.event && !id.startsWith('msg:')) return { ok: false, why: T('gov.why.deal_with_the_news_first') };
    if (id === 'wait') { pass(g, events, 1); return done(g, events); }
    if (id.startsWith('msg:')) {
      const i = g.inbox.findIndex(m => m.id === +id.slice(4)); if (i < 0) return { ok: false, why: T('sim.why.that_message_is_gone') };
      const chosen = (g.inbox[i].options || []).find(o => o.id === optionId); g.inbox.splice(i, 1); g.answered.push(optionId); events.push(ev('answered', { label: chosen ? chosen.label : optionId }));
      if (optionId === 'tell_now') { g.flags.locationGiven = true; g.ministerTold = g.belief; const right = c.pos === g.belief; g.claims += 1; if (!right) { g.flags.wrongClaim = true; } events.push(ev('say', { who: 'minister', text: right ? T('gov.line.good_sosa_has_the_address') : T('gov.line.i_will_say_so_at', { place: place(g.belief)[0].toUpperCase() + place(g.belief).slice(1) }) })); if (!right) { c.belief = g.belief; events.push(ev('enemy', { id: 'claim', text: T('gov.inquiry.the_minister_names_on_the', { place: place(g.belief) }) })); } }
      if (optionId === 'ask_time') { g.flags.askedTime += 1; g.ministerBy = c.hour + 6; events.push(ev('say', { who: 'minister', text: T('gov.line.six_hours_then_i_want') })); }
      if (optionId === 'admit') { g.flags.admitted = true; g.flags.locationGiven = true; events.push(ev('say', { who: 'minister', text: T('gov.line.then_i_will_tell_them') })); S.enemyAct(c, 'press_story', events); }
      return done(g, events);
    }
    if (id.startsWith('req:')) {
      const k = id.slice(4), cl = calls(g).find(x => x.id === id); if (!cl || !cl.ok) return { ok: false, why: cl ? cl.why : T('gov.why.nothing_to_ask') };
      if (k === 'hold') { g.req.hold = 'promised'; g.pending.push({ job: 'hold', hour: c.hour + 11 }); events.push(ev('say', { who: 'embassy', text: T('gov.line.the_interior_ministry_will_consider') })); }
      if (k === 'operator') { g.req.operator = 'promised'; g.pending.push({ job: 'operator', hour: c.hour + 7 }); events.push(ev('say', { who: 'aviation', text: T('gov.line.we_can_open_a_review') })); }
      if (k === 'ban') { g.req.ban = 'promised'; g.pending.push({ job: 'ban', hour: c.hour + 5 }); events.push(ev('say', { who: 'desk', text: T('gov.line.the_post_will_confirm_when') })); }
      events.push(ev('order', { name: cl.name })); pass(g, events, 1); return done(g, events);
    }
    const o = orders(g).find(x => x.id === id); if (!o) return { ok: false, why: T('gov.why.not_an_order_you_can') };
    if (!o.ok) return { ok: false, why: o.why };
    const def = D.GOV_ORDERS.find(x => x.id === id);
    events.push(ev('order', { name: o.name }));
    // an order that needs 1 or less is not rolled: no die is drawn and no result is invented
    const auto = o.need <= 1, die = auto ? null : roll(g), won = auto || die >= o.need;
    events.push(ev('roll', auto ? { die: null, need: o.need, won, auto: true, bonus: o.bonusFrom } : { die, need: o.need, won, bonus: o.bonusFrom }));
    g.orders.push({ id, hour: c.hour, won, who: def.who });
    g.timeline.push({ hour: c.hour, pos: c.pos, belief: g.belief, order: o.name });
    if (won) {
      if (id === 'follow') { const latest = g.reports.find(r => r.at !== g.belief); g.belief = latest.at; events.push(ev('say', { who: 'narrator', text: T('gov.say.you_move_the_search_to', { place: place(g.belief) }) })); }
      else if (id === 'watch_house') { const home = c.pos === 0; report(g, events, 0, 'watch', home ? T('gov.report.lights_on_someone_moved_past') : T('gov.report.the_house_is_dark_nobody'), home ? T('gov.report.someone_is_inside') : T('gov.report.the_house_is_empty'), home ? T('gov.report.that_it_is_her') : T('gov.report.where_she_went'), 0, c.hour); if (!home && g.belief === 0) { } }
      else if (id === 'rail_ask') { g.hand.push('rail'); report(g, events, 3, 'rail', T('gov.report.holt_greer_took_money_this'), T('gov.report.someone_paid_for_passage'), T('gov.report.that_it_was_her_or'), 0, c.hour); }
      else if (def.act) {
        c.belief = g.belief;
        const text = S.enemyAct(c, def.act, events);
        if (id === 'search') { const close = c.pos === g.belief; report(g, events, g.belief, 'desk', close ? T('gov.report.the_patrol_finds_the_room', { place: place(g.belief) }) : T('gov.report.the_patrol_searches_nobody_there', { place: place(g.belief) }), close ? T('gov.report.she_is_here_or_just') : T('gov.report.she_is_not_there_now'), close ? T('gov.report.that_she_will_stay') : T('gov.report.where_she_is_instead'), 0, c.hour); }
        if (id === 'circulate') g.req.ban = 'promised';
      }
    } else { events.push(ev('say', { who: 'narrator', text: def.fail || T('gov.report.nothing_comes_of_it') })); if (id === 'circulate') { c.belief = -1; report(g, events, g.belief, 'desk', T('gov.report.a_clerk_at_the_provincial'), T('gov.report.her_side_knows_the_ban'), T('gov.report.where_she_is'), 0, c.hour); } }
    pass(g, events, o.hours); return done(g, events);
  }
  function done(g, events) {
    // resolve requests that came due
    for (const j of g.pending.slice()) if (j.job && j.hour <= g.c.hour) { g.pending = g.pending.filter(x => x !== j); const d = roll(g);
      if (j.job === 'hold') { const ok = d >= 4; g.req.hold = ok ? 'inhand' : 'notyet'; if (ok) { g.hand.push('esm_intro'); S.enemyAct(g.c, 'ask_esmeralda', events); events.push(ev('say', { who: 'embassy', text: T('gov.line.esmeralda_will_hold_her_if') })); } else events.push(ev('say', { who: 'embassy', text: T('gov.line.baca_says_it_is_a') })); }
      if (j.job === 'operator') { const ok = d >= 3; g.req.operator = ok ? 'inhand' : 'notyet'; events.push(ev('say', { who: 'aviation', text: ok ? T('gov.line.the_review_is_open_say') : T('gov.line.legal_wants_the_file_first') })); if (ok) g.hand.push('operator'); }
      if (j.job === 'ban') { const ok = d >= 2; g.req.ban = ok ? 'inhand' : 'promised'; events.push(ev('say', { who: 'desk', text: ok ? T('gov.line.the_post_confirms_the_sergeant') : T('gov.line.the_sergeant_is_off_shift') })); } }
    if (g.c.over) { g.over = g.c.over; if (!events.some(e => e.type === 'over')) events.push(ev('over', g.c.over)); }
    else if (!g.event && g.c.hour >= g.nextEventAt) drawEvent(g, events);
    return { ok: true, events };
  }

  // ---- Sofīā's dispatches: one every few hours, each with choices whose costs show as markers ----
  const fill = (g, t) => String(t).replace(/\{there\}/g, place(g.belief));
  function eventOk(g, e) { return !g.seenEvents.includes(e.id) && (!e.after || g.c.hour >= e.after) && (!e.at || e.at.includes(g.belief)); }
  function drawEvent(g, events) {
    g.nextEventAt = g.c.hour + EVERY;
    // a guided run draws only its scripted events
    if (g._events) { if (!g._events.length) return; const id = g._events.shift(); const e = D.GOV_EVENTS.find(x => x.id === id); g.event = { id }; g.seenEvents.push(id); events.push(ev('dispatch', { title: e.title })); return; }
    const pool = D.GOV_EVENTS.filter(e => eventOk(g, e));
    if (!pool.length) return;
    const e = pool[Math.floor(g._rng() * pool.length)]; g.event = { id: e.id }; g.seenEvents.push(e.id);
    events.push(ev('dispatch', { title: e.title }));
  }
  function govTags(g, fx, out) {
    out = out || []; if (!fx) return out;
    if (fx.roll) { out.push(M('roll', 'roll.need', { need: fx.roll.need })); const w = govTags(g, fx.roll.win, []), l = govTags(g, fx.roll.lose, []); if (fx.hours) out.push(M('time', fx.hours === 1 ? 'time.hour' : 'time.hours', { hours: hrsText(fx.hours) })); if (w.length) out.push(M('gain', 'roll.win', { list: w.map(x => x.t.toLowerCase()).join(', ') })); if (l.length) out.push(M('risk', 'roll.fail', { list: l.map(x => x.t.toLowerCase()).join(', ') })); return out; }
    if (fx.hours) out.push(M('time', fx.hours === 1 ? 'time.hour' : 'time.hours', { hours: hrsText(fx.hours) }));
    if (fx.lead !== undefined) out.push(fx.lead ? M('gain', 'lead.real_in', { hours: hrsText(fx.lead) }) : M('gain', 'lead.real_now'));
    if (fx.false) out.push(M('risk', 'lead.false'));
    if (fx.act === 'check_belief') out.push(M('gain', 'search.at', { place: place(g.belief) }));
    if (fx.press) out.push(M('gain', 'her.exposed'));
    if (fx.warn) out.push(M('lose', 'her.warned'));
    if (fx.stall) out.push(M('gain', 'her.slips', { hours: hrsText(fx.stall) }));
    if (fx.crossing) out.push(M('gain', 'line.harder', { hours: hrsText(fx.crossing) }));
    if (fx.ban) out.push(M('gain', 'ban.confirmed'));
    if (fx.unban) out.push(M('lose', 'ban.lost'));
    if (fx.holdup) out.push(M('gain', 'hold.esmeralda_moves'));
    if (fx.card) out.push(M('gain', 'card.gain', { card: D.GOV_CARDS[fx.card].name }));
    if (fx.dc) out.push(M(fx.dc[0] < 0 ? 'gain' : 'lose', fx.dc[0] < 0 ? 'orders.easier' : 'orders.harder', { hours: hrsText(fx.dc[1]) }));
    if (fx.minister) out.push(M(fx.minister > 0 ? 'gain' : 'lose', fx.minister > 0 ? 'minister.pleased' : 'minister.angry'));
    if (fx.sooner) out.push(M('lose', 'minister.sooner', { hours: hrsText(fx.sooner) }));
    return out;
  }
  function eventView(g) {
    if (!g.event) return null; const d = D.GOV_EVENTS.find(e => e.id === g.event.id);
    return { kind: 'event', title: fill(g, d.title), text: fill(g, d.text), choices: d.choices.map(c => { const why = c.needs && !g.hand.includes(c.needs) ? `Needs ${D.GOV_CARDS[c.needs].name.toLowerCase()}.` : ''; return { id: c.id, label: fill(g, c.label), ok: !why, why, tags: govTags(g, c.fx) }; }) };
  }
  function resolveEvent(g, choiceId, events) {
    const d = D.GOV_EVENTS.find(e => e.id === g.event.id), ch = d.choices.find(c => c.id === choiceId);
    if (!ch) return; g.event = null; g.chosen += 1; events.push(ev('chose', { label: fill(g, ch.label) }));
    g.timeline.push({ hour: g.c.hour, pos: g.c.pos, belief: g.belief, order: fill(g, ch.label) });
    applyFx(g, ch.fx, events);
  }
  function trueLead(g, events, delay) {
    const at = g.c.pos, p = place(at);
    report(g, events, at, 'desk', T('gov.report.a_source_places_her_at', { p }), T('gov.report.she_was_at_when_the', { place: p}), T('gov.report.where_she_goes_next'), delay || 0, g.c.hour);
  }
  function falseLead(g, events) {
    const opts = [0, 1, 2, 3, 4].filter(i => i !== g.c.pos), at = opts[Math.floor(g._rng() * opts.length)], p = place(at);
    report(g, events, at, 'desk', T('gov.report.a_caller_swears_she_is', { p }), T('gov.report.someone_says_so'), T('gov.report.that_it_is_true'), 0, g.c.hour, true);
  }
  function applyFx(g, fx, events) {
    if (!fx) return; const c = g.c;
    if (fx.roll) { const die = roll(g), won = die >= fx.roll.need; events.push(ev('roll', { die, need: fx.roll.need, won })); applyFx(g, Object.assign({ hours: fx.hours }, won ? fx.roll.win : fx.roll.lose), events); return; }
    if (fx.say) events.push(ev('say', { who: 'narrator', text: fx.say }));
    if (fx.card && !g.hand.includes(fx.card)) g.hand.push(fx.card);
    if (fx.lose) g.hand = g.hand.filter(x => x !== fx.lose);
    if (fx.press) S.heat(c, fx.press, []);
    if (fx.warn) { S.heat(c, -fx.warn, []); if (c.belief === c.pos) c.belief = -1; }
    if (fx.stall) for (const j of c.jobs) j.due += fx.stall;
    if (fx.crossing) c.flags.roadblock = { pos: 4, until: c.hour + fx.crossing };
    if (fx.ban) { c.flags.restriction = true; g.req.ban = 'inhand'; }
    if (fx.unban && g.req.ban === 'inhand') g.req.ban = 'promised';
    if (fx.holdup) { const job = g.pending.find(j => j.job === 'hold'); if (job) job.hour = Math.min(job.hour, c.hour + 1); else if (g.req.hold === 'notyet') { g.req.hold = 'promised'; g.pending.push({ job: 'hold', hour: c.hour + 3 }); } }
    if (fx.dc) g.dcMods.push({ delta: fx.dc[0], until: c.hour + fx.dc[1] });
    if (fx.minister) g.standing += fx.minister;
    if (fx.sooner) g.ministerBy = Math.max(c.hour, g.ministerBy - fx.sooner);
    if (fx.act) { c.belief = g.belief; const close = c.pos === g.belief; S.enemyAct(c, fx.act, events); report(g, events, g.belief, 'enemy', close ? T('gov.report.sosa_finds_fresh_tracks_at', { place: place(g.belief) }) : T('gov.report.sosa_finds_nothing_at', { place: place(g.belief) }), close ? T('gov.report.she_is_here_or_just') : T('gov.report.she_is_not_there_now'), close ? T('gov.report.that_she_will_stay') : T('gov.report.where_she_is_instead'), 0, c.hour); }
    if (fx.false) falseLead(g, events);
    if (fx.lead !== undefined) trueLead(g, events, fx.lead);
    if (fx.hours) pass(g, events, fx.hours);
  }

  // ---- the debrief: a result you can read at a glance, then why, then the detail ---------------
  // Each check (one per hour you acted) is scored against where she really was, Wordle style:
  // on her, one stop off, sent the wrong way by a decoy, or lost.
  const short = (h) => S.clockText(h).replace(/^(\w{3})\w+/, '$1');
  const cap = (t) => t[0].toUpperCase() + t.slice(1);
  function checks(g) {
    const byHour = new Map(); for (const t of g.timeline) byHour.set(t.hour, t); // the last order in an hour stands
    return [...byHour.values()].map(t => {
      const k = t.pos === t.belief ? 'on' : g.reports.some(r => r.misleading && r.at === t.belief) ? 'decoy' : Math.abs(t.pos - t.belief) === 1 ? 'close' : 'lost';
      return Object.assign({ k }, t);
    });
  }
  const KEY = () => ({ on: T('gov.debrief.k_on'), close: T('gov.debrief.k_close'), decoy: T('gov.debrief.k_decoy'), lost: T('gov.debrief.k_lost') }); // decoy wording waits on the owner (open decision 2)
  function tier(c) { return c.over.win ? 'out' : (c.over.kind === 'clock' ? 'country' : 'custody'); }
  const EMOJI = { on: '\u{1F7E9}', close: '\u{1F7E8}', decoy: '\u{1F7EA}', lost: '⬛' };
  function shareGrid(g) {
    const ck = checks(g);
    return { grid: ck.map(x => EMOJI[x.k]).join(''), on: ck.filter(x => x.k === 'on').length, total: ck.length, result: g.c.over.win ? T('over.lose') : T('over.win') };
  }
  function moments(g, ck) {
    const out = [], n = (k) => ck.filter(x => x.k === k).length;
    if (!ck.length) return out;
    if (!n('on')) out.push(T('gov.debrief.m_never'));
    else if (n('on') === ck.length) out.push(T('gov.debrief.m_clean'));
    // the first time you lost her after having her
    const firstOn = ck.findIndex(x => x.k === 'on'), lostAt = firstOn < 0 ? -1 : ck.findIndex((x, i) => i > firstOn && x.k !== 'on');
    if (lostAt > 0) { const x = ck[lostAt]; out.push(T('gov.debrief.m_lost', { time: short(x.hour), pos: place(x.pos) })); }
    // the longest run off her trail
    let best = null; for (let i = 0; i < ck.length; i++) { if (ck[i].k === 'on') continue; let j = i; while (j + 1 < ck.length && ck[j + 1].k !== 'on') j++; if (!best || ck[j].hour - ck[i].hour > best[1].hour - best[0].hour) best = [ck[i], ck[j]]; i = j; }
    if (best && best[1].hour - best[0].hour >= 4) { const [a, z] = best; out.push(lostAt > 0 && a === ck[lostAt] ? T('gov.debrief.m_streak_next', { hours: z.hour - a.hour }) : T('gov.debrief.m_streak', { from: short(a.hour), to: short(z.hour) })); }
    // found her again after losing her
    if (lostAt > 0) { const back = ck.findIndex((x, i) => i > lostAt && x.k === 'on'); if (back > 0) out.push(T('gov.debrief.m_found', { time: short(ck[back].hour), place: place(ck[back].pos) })); }
    const fooled = n('decoy');
    if (fooled) out.push(fooled === 1 ? T('gov.debrief.m_decoy_one') : T('gov.debrief.m_decoys', { n: fooled }));
    return out.slice(0, 4);
  }
  function debrief(g) {
    const c = g.c, esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const end = tier(c), ck = checks(g), n = (k) => ck.filter(x => x.k === k).length;
    const KEYS = ['on', 'close', 'decoy', 'lost'], key = (k) => esc(KEY()[k]);
    const trail = ck.map(x => `<i class="sq ${x.k}" title="${esc(short(x.hour) + ': ' + KEY()[x.k])}"></i>`).join('');
    const legend = KEYS.filter(k => n(k)).map(k => `<li><i class="sq ${k}" aria-hidden="true"></i>${key(k)}</li>`).join('');
    const ms = moments(g, ck).map(m => `<li>${esc(m)}</li>`).join('');
    const ok = g.orders.filter(o => o.won).length, failed = {}; for (const o of g.orders) if (!o.won) failed[o.who] = (failed[o.who] || 0) + 1;
    const failList = Object.entries(failed).map(([w, k]) => k > 1 ? `${w} (${k})` : w).join(', ');
    const desk = g.orders.length ? T('gov.debrief.desk_sum', { ok, total: g.orders.length }) + (failList ? ' ' + T('gov.debrief.desk_failed', { list: failList }) : '') : T('gov.debrief.nobody_was_asked_to_do');
    const minister = g.flags.wrongClaim ? T('gov.debrief.you_gave_him_a_town') : g.flags.admitted ? T('gov.debrief.you_told_him_you_did') : g.flags.locationGiven ? T('gov.debrief.you_gave_him_the_right') : g.flags.askedTime ? T('gov.debrief.you_asked_for_time_and', { times: g.flags.askedTime === 1 ? T('gov.debrief.once') : T('gov.debrief.n_times', { n: g.flags.askedTime }) }) : T('gov.debrief.he_never_got_his_location');
    const mood = g.standing >= 2 ? T('gov.debrief.your_handling_of_the_press') : g.standing <= -2 ? T('gov.debrief.he_has_not_forgotten_the') : '';
    // hour by hour, with runs of identical checks folded into one row
    const runs = []; for (const x of ck) { const r = runs[runs.length - 1]; if (r && r.pos === x.pos && r.belief === x.belief && r.k === x.k) r.to = x.hour; else runs.push({ from: x.hour, to: x.hour, pos: x.pos, belief: x.belief, k: x.k }); }
    const rows = runs.map(r => `<tr><td class="mono">${esc(r.from === r.to ? short(r.from) : T('gov.debrief.time_range', { from: short(r.from), to: short(r.to) }))}</td><td>${esc(cap(place(r.pos)))}</td><td><i class="sq ${r.k}" title="${key(r.k)}"></i> ${esc(cap(place(r.belief)))}</td></tr>`).join('');
    return `<div class="debrief ${end}">`
      + (ck.length ? `<p class="trailsum">${esc(T('gov.debrief.trail_sum', { on: n('on'), total: ck.length }))}</p>`
        + `<div class="trail" aria-hidden="true">${trail}</div><ul class="legend">${legend}</ul>` : `<p>${esc(T('gov.debrief.no_orders'))}</p>`)
      + (ms ? `<h3>${esc(T('gov.debrief.h_decided'))}</h3><ul class="moments">${ms}</ul>` : '')
      + `<h3>${esc(T('gov.debrief.h_desk'))}</h3><p>${esc(desk)}</p>`
      + `<h3>${esc(T('gov.debrief.h_minister'))}</h3><p>${esc(minister + mood)}</p>`
      + (rows ? `<details><summary>${esc(T('gov.debrief.h_hours'))}</summary><table><tr><th>${esc(T('gov.debrief.th_when'))}</th><th>${esc(T('gov.debrief.th_she_was'))}</th><th>${esc(T('gov.debrief.th_you_looked'))}</th></tr>${rows}</table></details>` : '')
      + `</div>`;
  }
  function serialize(g) { const o = Object.assign({}, g); delete o._rng; delete o._boot; o.c = S.serialize(g.c); return JSON.stringify(o); }
  function restore(json) { const g = JSON.parse(json); g.c = S.restore(g.c); g._boot = []; return attach(g); }
  // the guided run ends: rolls and news are no longer scripted
  function endTutorial(g) { delete g._dice; delete g._events; delete g.tutorial; }
  return { newRun, view, commit, debrief, shareGrid, serialize, restore, personName, endTutorial };
})();
if (typeof module !== 'undefined') module.exports = Gov;
