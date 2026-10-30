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
  const M = (k, code, args) => C.marker(k, code, args);
  const ev = (type, data) => Object.assign({ type }, data);
  const LV = (i) => D.LEVELS[Math.max(0, Math.min(D.LEVELS.length - 1, Number.isFinite(i) ? i : 0))];
  const EVERY = 5, LEAK = 0.5; // a stop she reaches is reported only some of the time
  const place = (i) => i === 0 ? 'the residence' : i === 4 ? 'the line' : LV(i).short;

  function newRun(seed, target, opts) {
    target = target || 'woman'; opts = opts || {};
    const c = S.newRun(seed, target, { manualEnemy: true });
    const g = { seed, target, c, belief: 0, hand: ['watch', 'desk'], reports: [], pending: [], req: { ban: 'notyet', hold: 'notyet', operator: 'notyet' }, inbox: [], nextMsg: 1,
      timeline: [], orders: [], ministerBy: 2, ministerTold: null, claims: 0, lastReportHour: null, flags: { askedTime: 0, locationGiven: false, wrongClaim: false }, over: null,
      event: null, seenEvents: [], nextEventAt: 3, dcMods: [], standing: 0, answered: [], chosen: 0 };
    if (opts.dice) g._dice = opts.dice.slice();
    if (opts.events) g._events = opts.events.slice();
    if (opts.tutorial) g.tutorial = true;
    g._rngState = (seed ^ 0x9e3779b9) >>> 0;
    attach(g);
    const events = [];
    events.push(ev('say', { who: 'narrator', text: 'Portô Venla, Saturday afternoon. Two of your cars watch the residence. The court has barred her from leaving and asked for her passports by Monday.' }));
    report(g, events, 0, 'watch', 'Her car is in the drive. Lights on upstairs.', 'Someone is home.', 'That she will stay.', 0, 0);
    msg(g, events, 'minister', `"Where is she? I want a location before the evening news."`, [
      { id: 'tell_now', label: 'Name where you think she is', hours: 0, effect: 'Public. If you are wrong, your own offices follow the wrong lead for hours.' },
      { id: 'ask_time', label: 'Ask for six hours', hours: 0, effect: 'The minister waits. He remembers asking.' },
    ]);
    g._boot = events; return g;
  }
  function attach(g) { g._rng = function () { let a = (g._rngState + 0x6D2B79F5) | 0; g._rngState = a; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; return g; }
  const roll = (g) => (g._dice && g._dice.length) ? g._dice.shift() : 1 + Math.floor(g._rng() * 6);
  const personName = (g, id) => ({ minister: 'The minister', watch: 'The watch team', desk: 'The Santa Laura desk', rail: 'The railway contact', embassy: 'The embassy in Baca', aviation: 'The aviation desk', enemy: 'Inspector Sosā', press: 'Rādiô Portô Venla' })[id] || S.personName(g.c, id);
  function msg(g, events, from, text, options) { const m = { id: g.nextMsg++, from, text, options }; g.inbox.push(m); events.push(ev('message', { id: m.id, from, text })); }
  function report(g, events, at, source, text, proves, doesnt, delay, hour, misleading) {
    const r = { at, source, text, proves, doesnt, hour: (hour === undefined ? g.c.hour : hour) + (delay || 0), misleading: !!misleading, seen: false };
    if (delay) g.pending.push(r); else { g.reports.unshift(r); g.lastReportHour = r.hour; events.push(ev('report', { from: source, text: `${text} (${proves}; does not prove ${doesnt.charAt(0).toLowerCase() + doesnt.slice(1)})`, at })); }
  }
  function release(g, events) { for (const r of g.pending.slice()) if (!r.job && r.hour <= g.c.hour) { g.pending = g.pending.filter(x => x !== r); g.reports.unshift(r); g.lastReportHour = r.hour; events.push(ev('report', { from: r.source, text: r.text, at: r.at })); } }

  // ---- the candidate plays herself: the harness policy, one action at a time ----
  const PREF = { name_atlanta: 1, keep_calling: 1, via_sponsor: 0, keep_word: 1, crew_bonus: 1, velez_word: 0, confirm_yacht: 1, sign_accounts: 1, go_midnight: 1, guest_yes: 1, sosa_hang: 1 };
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
      if (e.type === 'attempt' && e.id === 'decoy') report(g, events, 1, 'watch', 'A red sedan took the south road toward Santa Laura.', 'A car is heading south.', 'She was inside.', 0, c.hour, true);
      if (e.type === 'attempt' && e.id === 'decoy') report(g, events, 0, 'watch', 'Three cars left the residence in different directions.', 'The cars left.', 'Which one she is in.', 0, c.hour);
      if (e.type === 'attempt' && e.id === 'partycar') report(g, events, 0, 'watch', "The party's official car left the residence with its flags up.", 'The car left.', 'Who was in the back.', 1, c.hour);
      if (e.type === 'travel' && g._rng() < LEAK) { const to = e.to;
        if (to === 1) report(g, events, 1, 'desk', 'A plain car with capital plates was seen at the Santa Laura square.', 'A car from the capital is in Santa Laura.', 'Whose it is.', 3, c.hour);
        if (to === 2) report(g, events, 2, 'desk', 'The Nova Trentô cooperative had a visitor overnight.', 'Someone stayed at the colônia.', 'Who.', 5, c.hour);
        if (to === 3) report(g, events, 3, 'rail', 'Somebody asked about the midnight freight.', 'Someone wants the freight.', 'That it was her.', 2, c.hour);
        if (to === 4) report(g, events, 4, 'desk', 'A passenger left the Salta freight at the Huhūi passes.', 'Someone rode the freight.', 'That she crossed.', 2, c.hour);
        if (to === 5) report(g, events, 5, 'aviation', 'A charter at Susana is filing for Lāyūna.', 'A jet is preparing to leave.', 'That she has reached it.', 2, c.hour); }
      if (e.type === 'stage' && e.arr === 'aircraft' && e.stage === 1) report(g, events, 5, 'aviation', 'A charter to Lāyūna is booked at Susana.', 'An aircraft is booked.', 'That she has reached it.', 3, c.hour);
      if (e.type === 'stage' && e.arr === 'permission' && e.stage === 2) report(g, events, 5, 'embassy', 'Atlanta has issued her an entry visa.', 'Atlanta will receive her.', 'Where she is now.', 4, c.hour);
      if (e.type === 'enemy' && e.id === 'press_ally' && /tells them/.test(e.text)) { g.belief = c.belief; report(g, events, c.pos, 'enemy', e.text, 'Where she was last seen.', 'Where she is now.', 0, c.hour); }
      if (e.type === 'hold') report(g, events, c.pos, 'desk', `A patrol report: ${e.title.toLowerCase()} in ${place(c.pos)}.`, 'Where she was stopped.', 'Where she goes after release.', 1, c.hour);
      if (e.type === 'over') g.over = e;
    }
  }
  function pass(g, events, hours) {
    const target = g.c.hour + hours, from = g.c.hour;
    while (g.c.hour < target && !g.c.over) { leak(g, events, herStep(g)); }
    if (g.c.hour > from) events.push(ev('passed', { hours: g.c.hour - from }));
    release(g, events);
    if (g.c.over) g.over = g.c.over;
    if (!g.c.over && g.c.hour >= g.ministerBy && !g.flags.locationGiven && !g.flags.ministerLate) { g.flags.ministerLate = true; msg(g, events, 'minister', `"You asked for time. The time is up. Where is she?"`, [
      { id: 'tell_now', label: 'Name where you think she is', hours: 0, effect: 'Public. If you are wrong, your own offices follow the wrong lead for hours.' },
      { id: 'admit', label: 'Say you do not know yet', hours: 0, effect: 'Honest. The minister briefs the papers himself.' },
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
      const why = abroad && !g.hand.includes('esm_intro') ? 'Your ministry does not command this tower. Ask Esmeralda to hold her first.' : '';
      const dcm = g.dcMods.filter(d => d.until > g.c.hour).reduce((n, d) => n + d.delta, 0);
      const need = Math.max(1, o.dc - bonus + (abroad ? 1 : 0) + dcm);
      out.push({ kind: 'approach', id: o.id, name: o.name(place(g.belief), latest ? place(latest.at) : ''), hours: o.hours, dc: o.dc, need, ok: !why, why, text: o.text, who: abroad ? 'Who acts: Esmeraldan officials, on your introduction' : `Who acts: ${o.who}`, pay: false,
        odds: need <= 1 ? 'certain' : `${7 - need} in 6`, bonus: used, bonusFrom: used.map(u => u.tag),
        preview: [o.text, need <= 1 ? 'Succeeds without a roll.' : `Die needs ${need} or more (${7 - need} in 6).${used.length ? ' Your cards lower it: ' + used.map(u => `${u.tag} ${u.bonus}`).join(', ') + '.' : ''}`, `Takes ${o.hours} hour${o.hours === 1 ? '' : 's'}. ${o.who[0].toUpperCase() + o.who.slice(1)} acts.`, o.fail ? `On failure: ${o.fail}` : 'Cannot fail.'] });
    }
    return out;
  }
  function calls(g) {
    const out = [], c = g.c;
    const add = (id, name, ok, why, hours, preview) => out.push({ kind: 'call', id, name, ok, why, hours, preview });
    add('req:hold', 'Ask Esmeralda to hold her', g.req.hold === 'notyet', g.req.hold === 'promised' ? 'Asked. The embassy has not confirmed.' : 'Esmeralda has agreed.', 1, ['Through the embassy in Baca. Ten hours for an answer, and the embassy needs a 4 or more. If Esmeralda agrees, her departure gets harder and your introduction at the ministry counts across the line.', 'A promise to consider a hold is not an instruction to a tower.']);
    add('req:operator', "Open a licence review on the Susana operator", g.req.operator === 'notyet' && c.hour >= 6, g.req.operator !== 'notyet' ? 'The aviation desk has it.' : 'The aviation desk opens on Sunday.', 1, ['The aviation desk takes six hours and needs a 3 or more. It gives you the operator card: a review can pause the booking.']);
    add('req:ban', 'Confirm the travel ban reached the border post', g.c.flags.restriction && g.req.ban !== 'inhand', !g.c.flags.restriction ? 'Circulate the ban first.' : 'Confirmed at the post.', 1, ['The post answers in four hours and needs a 2 or more. A sent message does not close the border; a confirmed one does.']);
    return out;
  }
  function view(g) {
    const c = g.c, age = (h) => { const d = c.hour - h; return d <= 0 ? 'just now' : `${d} h`; };
    return {
      her: c.who === 'woman' ? 'her' : 'him', suspectName: place(g.belief)[0].toUpperCase() + place(g.belief).slice(1),
      lastReport: g.lastReportHour === null ? '' : age(g.lastReportHour) + (g.lastReportHour === c.hour ? '' : ' old'), ministerBy: g.ministerBy,
      levelName: ['The assignment, Portô Venla', 'Provincial desks, Santa Laura', 'The support network, Nova Trentô', 'The freight, Salta', 'The Huhūi border', 'Susana airfield'][g.belief],
      objective: ['The watched convoy splits. The minister wants a location.', 'Reports conflict. A patrol can check one of them.', 'Someone is sheltering her. Your source has conditions.', 'A departure window is approaching. Railway staff give different accounts.', 'The crossing could happen before your instructions arrive. A sent message alone does not close the border.', 'She may be across the border. Your domestic authority has limited reach.'][g.belief],
      reports: g.reports.map(r => Object.assign({}, r, { age: age(r.hour), source: personName(g, r.source) })),
      event: eventView(g), orders: orders(g), calls: calls(g),
      messages: g.inbox.map(m => ({ id: 'msg:' + m.id, from: m.from, role: m.from === 'minister' ? 'Interior minister' : '', text: m.text, options: m.options.map(o => Object.assign({}, o, { ok: true, why: '' })) })),
      requests: [
        { at: 4, title: 'Travel ban at the post', state: g.req.ban === 'inhand' ? 'inhand' : c.flags.restriction ? 'promised' : 'notyet', sub: g.req.ban === 'inhand' ? 'Confirmed. The post has her name.' : c.flags.restriction ? 'Ban sent. Not confirmed at the post. A sent message does not close the border.' : 'Not sent.' },
        { at: 5, title: 'Esmeraldan hold', state: g.req.hold, sub: g.req.hold === 'inhand' ? 'Esmeralda has agreed to hold her.' : g.req.hold === 'promised' ? 'Asked through the embassy in Baca. Not answered.' : 'Not asked.' },
      ],
      people: ['Your people: the watch team, Inspector Sosā', 'Your people: the provincial desk and its patrol', g.hand.includes('registry') ? 'Your people: the registry' : 'No one here yet.', g.hand.includes('rail') ? 'Your people: the railway contact' : 'Your people: a railway contact, not asked yet', 'Your people: the border post', g.hand.includes('esm_intro') ? 'Your people: a name at the interior ministry' : 'No one here. Your ministry does not command this tower.'],
    };
  }

  // ---- commit --------------------------------------------------------------------------------
  function commit(g, id, optionId) {
    if (g.over || g.c.over) return { ok: false, why: 'The run is over.' };
    const events = [], c = g.c;
    const before = { pos: c.pos, belief: g.belief };
    if (id.startsWith('evt:')) { if (!g.event) return { ok: false, why: 'No news waiting.' }; resolveEvent(g, id.slice(4), events); return done(g, events); }
    if (g.event && !id.startsWith('msg:')) return { ok: false, why: 'Deal with the news first.' };
    if (id === 'wait') { pass(g, events, 1); return done(g, events); }
    if (id.startsWith('msg:')) {
      const i = g.inbox.findIndex(m => m.id === +id.slice(4)); if (i < 0) return { ok: false, why: 'That message is gone.' };
      g.inbox.splice(i, 1); g.answered.push(optionId); events.push(ev('answered', { label: optionId }));
      if (optionId === 'tell_now') { g.flags.locationGiven = true; g.ministerTold = g.belief; const right = c.pos === g.belief; g.claims += 1; if (!right) { g.flags.wrongClaim = true; } events.push(ev('say', { who: 'minister', text: right ? `"Good. Sosā has the address. Do not lose her."` : `"${place(g.belief)[0].toUpperCase() + place(g.belief).slice(1)}. I will say so at six."` })); if (!right) { c.belief = g.belief; events.push(ev('enemy', { id: 'claim', text: `The minister names ${place(g.belief)} on the evening news. Every desk in the province drives there.` })); } }
      if (optionId === 'ask_time') { g.flags.askedTime += 1; g.ministerBy = c.hour + 6; events.push(ev('say', { who: 'minister', text: `"Six hours. Then I want a town and a street."` })); }
      if (optionId === 'admit') { g.flags.admitted = true; g.flags.locationGiven = true; events.push(ev('say', { who: 'minister', text: `"Then I will tell them she has fled the country. Find her before the papers find you."` })); S.enemyAct(c, 'press_story', events); }
      return done(g, events);
    }
    if (id.startsWith('req:')) {
      const k = id.slice(4), cl = calls(g).find(x => x.id === id); if (!cl || !cl.ok) return { ok: false, why: cl ? cl.why : 'Nothing to ask.' };
      if (k === 'hold') { g.req.hold = 'promised'; g.pending.push({ job: 'hold', hour: c.hour + 11 }); events.push(ev('say', { who: 'embassy', text: `"The interior ministry will consider it. Ten hours, and they will want to know why."` })); }
      if (k === 'operator') { g.req.operator = 'promised'; g.pending.push({ job: 'operator', hour: c.hour + 7 }); events.push(ev('say', { who: 'aviation', text: `"We can open a review on Sunday. Six hours to get it on paper."` })); }
      if (k === 'ban') { g.req.ban = 'promised'; g.pending.push({ job: 'ban', hour: c.hour + 5 }); events.push(ev('say', { who: 'desk', text: `"The post will confirm when the sergeant reads it. Four hours."` })); }
      events.push(ev('order', { name: cl.name })); pass(g, events, 1); return done(g, events);
    }
    const o = orders(g).find(x => x.id === id); if (!o) return { ok: false, why: 'Not an order you can give now.' };
    if (!o.ok) return { ok: false, why: o.why };
    const def = D.GOV_ORDERS.find(x => x.id === id);
    events.push(ev('order', { name: o.name }));
    const die = o.need <= 1 ? 6 : roll(g), won = die >= o.need;
    events.push(ev('roll', { die, need: o.need, won, bonus: o.bonusFrom }));
    g.orders.push({ id, hour: c.hour, won, who: def.who });
    g.timeline.push({ hour: c.hour, pos: c.pos, belief: g.belief, order: o.name });
    if (won) {
      if (id === 'follow') { const latest = g.reports.find(r => r.at !== g.belief); g.belief = latest.at; events.push(ev('say', { who: 'narrator', text: `You move the search to ${place(g.belief)}.` })); }
      else if (id === 'watch_house') { const home = c.pos === 0; report(g, events, 0, 'watch', home ? 'Lights on. Someone moved past the upstairs window.' : 'The house is dark. Nobody has come or gone for an hour.', home ? 'Someone is inside.' : 'The house is empty.', home ? 'That it is her.' : 'Where she went.', 0, c.hour); if (!home && g.belief === 0) { } }
      else if (id === 'rail_ask') { g.hand.push('rail'); report(g, events, 3, 'rail', 'Holt Greer took money this week for a crate on the midnight freight.', 'Someone paid for passage.', 'That it was her, or when.', 0, c.hour); }
      else if (def.act) {
        c.belief = g.belief;
        const text = S.enemyAct(c, def.act, events);
        if (id === 'search') { const close = c.pos === g.belief; report(g, events, g.belief, 'desk', close ? `The patrol finds the room still warm at ${place(g.belief)}. She was here within the hour.` : `The patrol searches ${place(g.belief)}. Nobody there has seen her.`, close ? 'She is here or just left.' : 'She is not there now.', close ? 'That she will stay.' : 'Where she is instead.', 0, c.hour); }
        if (id === 'circulate') g.req.ban = 'promised';
      }
    } else { events.push(ev('say', { who: 'narrator', text: def.fail || 'Nothing comes of it.' })); if (id === 'circulate') { c.belief = -1; report(g, events, g.belief, 'desk', 'A clerk at the provincial desk called a friend of hers before filing the ban.', 'Her side knows the ban is out.', 'Where she is.', 0, c.hour); } }
    pass(g, events, o.hours); return done(g, events);
  }
  function done(g, events) {
    // resolve requests that came due
    for (const j of g.pending.slice()) if (j.job && j.hour <= g.c.hour) { g.pending = g.pending.filter(x => x !== j); const d = roll(g);
      if (j.job === 'hold') { const ok = d >= 4; g.req.hold = ok ? 'inhand' : 'notyet'; if (ok) { g.hand.push('esm_intro'); S.enemyAct(g.c, 'ask_esmeralda', events); events.push(ev('say', { who: 'embassy', text: `"Esmeralda will hold her if she appears. The interior ministry gave us a name to call."` })); } else events.push(ev('say', { who: 'embassy', text: `"Baca says it is a judicial matter. Ask again with more."` })); }
      if (j.job === 'operator') { const ok = d >= 3; g.req.operator = ok ? 'inhand' : 'notyet'; events.push(ev('say', { who: 'aviation', text: ok ? `"The review is open. Say the word and the operator hears about his licence."` : `"Legal wants the file first. Not today."` })); if (ok) g.hand.push('operator'); }
      if (j.job === 'ban') { const ok = d >= 2; g.req.ban = ok ? 'inhand' : 'promised'; events.push(ev('say', { who: 'desk', text: ok ? `"The post confirms. The sergeant has her name on the desk."` : `"The sergeant is off shift. Nobody has read it."` })); } }
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
    if (fx.roll) { out.push(M('roll', 'roll.need', { need: fx.roll.need })); const w = govTags(g, fx.roll.win, []), l = govTags(g, fx.roll.lose, []); if (fx.hours) out.push(M('time', 'time.hours', { hours: fx.hours })); if (w.length) out.push(M('gain', 'roll.win', { list: w.map(x => x.t.toLowerCase()).join(', ') })); if (l.length) out.push(M('risk', 'roll.fail', { list: l.map(x => x.t.toLowerCase()).join(', ') })); return out; }
    if (fx.hours) out.push(M('time', 'time.hours', { hours: fx.hours }));
    if (fx.lead !== undefined) out.push(fx.lead ? M('gain', 'lead.real_in', { hours: fx.lead }) : M('gain', 'lead.real_now'));
    if (fx.false) out.push(M('risk', 'lead.false'));
    if (fx.act === 'check_belief') out.push(M('gain', 'search.at', { place: place(g.belief) }));
    if (fx.press) out.push(M('gain', 'her.exposed'));
    if (fx.warn) out.push(M('lose', 'her.warned'));
    if (fx.stall) out.push(M('gain', 'her.slips', { hours: fx.stall }));
    if (fx.crossing) out.push(M('gain', 'line.harder', { hours: fx.crossing }));
    if (fx.ban) out.push(M('gain', 'ban.confirmed'));
    if (fx.unban) out.push(M('lose', 'ban.lost'));
    if (fx.holdup) out.push(M('gain', 'hold.esmeralda_moves'));
    if (fx.card) out.push(M('gain', 'card.gain', { card: D.GOV_CARDS[fx.card].name }));
    if (fx.dc) out.push(M(fx.dc[0] < 0 ? 'gain' : 'lose', fx.dc[0] < 0 ? 'orders.easier' : 'orders.harder', { hours: fx.dc[1] }));
    if (fx.minister) out.push(M(fx.minister > 0 ? 'gain' : 'lose', fx.minister > 0 ? 'minister.pleased' : 'minister.angry'));
    if (fx.sooner) out.push(M('lose', 'minister.sooner', { hours: fx.sooner }));
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
    report(g, events, at, 'desk', `A source places her at ${p}.`, `She was at ${p} when the source saw her.`, 'Where she goes next.', delay || 0, g.c.hour);
  }
  function falseLead(g, events) {
    const opts = [0, 1, 2, 3, 4].filter(i => i !== g.c.pos), at = opts[Math.floor(g._rng() * opts.length)], p = place(at);
    report(g, events, at, 'desk', `A caller swears she is at ${p}.`, 'Someone says so.', 'That it is true.', 0, g.c.hour, true);
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
    if (fx.act) { c.belief = g.belief; const close = c.pos === g.belief; S.enemyAct(c, fx.act, events); report(g, events, g.belief, 'enemy', close ? `Sosā finds fresh tracks at ${place(g.belief)}.` : `Sosā finds nothing at ${place(g.belief)}.`, close ? 'She is here or just left.' : 'She is not there now.', close ? 'That she will stay.' : 'Where she is instead.', 0, c.hour); }
    if (fx.false) falseLead(g, events);
    if (fx.lead !== undefined) trueLead(g, events, fx.lead);
    if (fx.hours) pass(g, events, fx.hours);
  }

  // ---- the debrief: what happened against what you believed ------------------------------------
  function debrief(g) {
    const c = g.c, esc = (t) => String(t).replace(/</g, '&lt;');
    const win = !c.over.win && (c.over.kind === 'arrest' || c.over.kind === 'deal'); // outcome codes, never prose
    const head = c.over.win ? `The jet left Esmeraldan airspace at ${S.clockText(c.hour)}. ${g.req.hold === 'inhand' ? 'Esmeralda acknowledged your hold. The tower never received it.' : 'Esmeralda was never asked in time.'}` : win ? `Sosā's people reached her at ${place(c.pos)} at ${S.clockText(c.hour)}. She is in custody for the hearing.` : `${S.clockText(c.hour)}. She never left. The hearing proceeds without her in custody.`;
    const label = (t) => { if (t.pos === t.belief) return ['right', 'Right']; const dec = g.reports.find(r => r.misleading && r.at === t.belief); if (dec) return ['decoy', 'Decoy']; if (t.belief < t.pos) return ['late', `${Math.max(1, t.pos - t.belief) * 2} hours late`]; return ['wrong', 'Wrong']; };
    const rows = g.timeline.map(t => { const [k, l] = label(t); return `<tr><td class="mono">${esc(S.clockText(t.hour).replace(/^(\w{3})\w+/, '$1'))}</td><td>${esc(place(t.pos)[0].toUpperCase() + place(t.pos).slice(1))}</td><td>${esc(place(t.belief)[0].toUpperCase() + place(t.belief).slice(1))} <span class="v ${k}">${l}</span></td></tr>`; }).join('');
    const mis = g.reports.filter(r => r.misleading).map(r => `${esc(r.text)} It was one of Nando's decoys.`);
    const byWho = {}; for (const o of g.orders) { byWho[o.who] = byWho[o.who] || { ok: 0, no: 0 }; byWho[o.who][o.won ? 'ok' : 'no'] += 1; }
    const delivered = Object.entries(byWho).map(([w, n]) => `${w[0].toUpperCase() + w.slice(1)}: ${n.ok} delivered, ${n.no} failed.`).join(' ');
    const minister = g.flags.wrongClaim ? 'You gave him a town and it was the wrong one. He said it on television. He does not say your name now.' : g.flags.admitted ? 'You told him you did not know. He briefed the papers himself and remembers that you made him.' : g.flags.locationGiven ? 'You gave him the right town. He took the credit, which is what you are for.' : g.flags.askedTime ? `You asked for time ${g.flags.askedTime === 1 ? 'once' : g.flags.askedTime + ' times'} and never named a place. He has a new aide in mind.` : 'He never got his location. He has a new aide in mind.';
    const mood = g.standing >= 2 ? ' Your handling of the press pleased him.' : g.standing <= -2 ? ' He has not forgotten the promises you made without him.' : '';
    return `<div class="debrief"><p>${esc(head)}</p><h3>Where she was, and where you looked</h3><table><tr><th>When</th><th>She was</th><th>You looked</th></tr>${rows || '<tr><td colspan="3">You gave no orders.</td></tr>'}</table><h3>Reports that misled you</h3><p>${mis.length ? mis.join(' ') : 'None. Every report was true as far as it went.'}</p><h3>Who delivered</h3><p>${delivered || 'Nobody was asked to do anything.'}</p><h3>The minister</h3><p>${esc(minister + mood)}</p></div>`;
  }
  function serialize(g) { const o = Object.assign({}, g); delete o._rng; delete o._boot; o.c = S.serialize(g.c); return JSON.stringify(o); }
  function restore(json) { const g = JSON.parse(json); g.c = S.restore(g.c); g._boot = []; return attach(g); }
  // the guided run ends: rolls and news are no longer scripted
  function endTutorial(g) { delete g._dice; delete g._events; delete g.tutorial; }
  return { newRun, view, commit, debrief, serialize, restore, personName, endTutorial };
})();
if (typeof module !== 'undefined') module.exports = Gov;
