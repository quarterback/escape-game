/* ============================================================
   Last Freight Out: simulation (no DOM, no p5, no audio)
   Setting: a rail town in Salta, Valdória, on the edge of la Perlā (quarterback/kels: world/valdoria-lore.md, verdenese/).
   The Sim owns all game truth. It returns EVENT lists that the
   renderer may animate and the UI may narrate; nothing here waits
   on an animation.
   ============================================================ */
'use strict';
const Sim = (() => {
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const TICKS_TOTAL = 14;          // half-hours from 17:00 to the midnight freight (the Nelôxi standard is a 24-hour clock)
  const HEAT_LIMIT = 8;
  const HAND_SIZE = 4;

  const STATIONS = [
    { id: 'attic',      name: 'The attic over the galpôn',        short: 'Attic' },
    { id: 'market',     name: 'The ferjā',    short: 'Ferjā' },
    { id: 'checkpoint', name: 'The customs post',   short: 'Customs' },
    { id: 'yard',       name: 'The jārd',          short: 'Jārd' },
    { id: 'platform',   name: 'The frēt platform', short: 'Platform' },
  ];

  const PEOPLE = {
    forger:   { name: 'Lūçīā Ferrārô, forger', station: 1, state: 'idle',    coat: '#7a4ea8', hat: '#2b1d3a' },
    lookout:  { name: 'Pipô Rosī, lookout', station: 1, state: 'idle',    coat: '#c96a2a', hat: '#5a2d0c', small: true },
    guard:    { name: 'Gaspār Moralēs, customs guard', station: 2, state: 'alert',   coat: '#3b5d8f', hat: '#1b2a45' },
    clerk:    { name: 'Mārtā Kovalskā, registry clerk', station: 3, state: 'closed',  coat: '#5f8a4a', hat: '#2f4a22' },
    teo:      { name: 'Theo Bascom, fôrman', station: 3, state: 'hostile', coat: '#8a6a3a', hat: '#4a3a1a' },
    brakeman: { name: 'Holt Greer, brakeman', station: 4, state: 'wary',    coat: '#444c5a', hat: '#222630' },
  };
  const OBJECTS = {
    papers: { name: 'Pāsportô with crossing stamp', station: 1, state: 'blank' },
    stall:  { name: 'Your ferjā stall of charts', station: 1, state: 'stocked' },
    gate:   { name: 'Side gate',      station: 2, state: 'locked' },
    crate:  { name: 'Bokskār crate',  station: 4, state: 'sealed' },
  };
  const PLACES = {
    attic: { name: 'Your hideout', station: 0 },
  };

  const STATE_LABEL = {
    forger:   { idle: 'idle, warming her sealing-wax', busy: 'inking your pāsportô' },
    lookout:  { idle: 'kicking stones', running: 'off making trouble' },
    guard:    { alert: 'on the customs barrier', bribed: 'looking the other way', distracted: 'dealing with a commotion' },
    clerk:    { closed: 'window shut', open: 'window open' },
    teo:      { hostile: 'wants you off his jārd', friendly: 'will walk you through' },
    brakeman: { wary: 'not taking passengers', agreed: 'holding a crate for you' },
    papers:   { blank: 'no crossing stamp', inking: 'being forged', stamped: 'sealed in wax and ready' },
    stall:    { stocked: 'your charts still on it', sold: 'sold out' },
    gate:     { locked: 'locked', unlocked: 'unlocked' },
    crate:    { sealed: 'sealed', prepared: 'lid loosened, straw inside' },
  };

  // ---- deck -------------------------------------------------
  const CARD_DEFS = {
    bribe:    { name: 'Bribe',             cost: { coin: 3 },  time: 1, kind: 'people',
                flavor: 'Australs in the right hand. The wrong hand talks.' },
    forgery:  { name: 'Commission papers', cost: { coin: 2 },  time: 1, kind: 'service',
                flavor: 'Lūçīā needs three half-hours, ink and sealing-wax.' },
    distract: { name: 'Distraction',       cost: {},           time: 1, kind: 'people',
                flavor: 'A dropped crate, a shout, a fire in a bin.' },
    talk:     { name: 'Sweet talk',        cost: { favor: 1 }, time: 1, kind: 'people',
                flavor: 'Spend a favor owed. Some doors open for a kompadrē.' },
    picklock: { name: 'Pick lock',         cost: {},           time: 2, kind: 'objects',
                flavor: 'Slow, and someone may notice.' },
    sellmaps: { name: 'Sell maps',         cost: {},           time: 1, kind: 'objects',
                flavor: 'Your own charts. Everyone on the ferjā knows the hand that drew them.' },
    laylow:   { name: 'Lay low',           cost: {},           time: 1, kind: 'places',
                flavor: 'Let the street forget your face.' },
    favor:    { name: 'Call in a favor',  cost: { favor: 1 }, time: 0, kind: 'people',
                flavor: 'No time spent. Someone owes you.' },
    courier:  { name: 'Hire courier',      cost: { coin: 2 },  time: 1, kind: 'service',
                flavor: 'A niñô from the ferjā runs it. Reach Lūçīā without walking to her.' },
  };
  // Who you are tonight decides the shape of your purse (one wallet, three ways to start).
  const PERSONAS = {
    cartographer: { name: 'The chart-maker', coin: 5, favor: 2, heat: 0, blurb: 'A known hand and a modest purse. A few people owe you.' },
    niece:        { name: "The toll-taker's niece", coin: 8, favor: 1, heat: 1, blurb: 'Plenty of coin and one person who owes you. The bailiffs already know your face.' },
    official:     { name: 'The kolôniā clerk', coin: 2, favor: 4, heat: 0, blurb: 'Almost no coin, but half the kolôniā owes you a favor.' },
  };
  const BRIBE_BASE = 3, BRIBE_STEP = 1; // every bribe paid raises the next price: the town learns what you'll pay

  const DECK_LIST = ['bribe','bribe','forgery','forgery','distract','distract','talk','talk',
                     'picklock','picklock','sellmaps','sellmaps','laylow','laylow','favor','favor','courier'];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function newGame(seed, persona) {
    const P0 = PERSONAS[persona] || PERSONAS.cartographer;
    const rng = mulberry32(seed >>> 0);
    const deck = DECK_LIST.slice();
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    const s = {
      seed, tick: 0, over: null, // over: {win:bool, reason}
      persona: PERSONAS[persona] ? persona : 'cartographer',
      coin: P0.coin, favor: P0.favor, heat: P0.heat,
      bribes: 0,
      pos: 0,
      people: clone(PEOPLE), objects: clone(OBJECTS), places: clone(PLACES),
      jobs: [],   // pending work: {type, remaining, who}
      deck, discard: [], hand: [],
      nextCardUid: 1,
      rngState: seed >>> 0,
      log: [],
    };
    s._rng = rng;
    for (let i = 0; i < HAND_SIZE; i++) draw(s);
    return s;
  }

  function draw(s) {
    if (!s.deck.length) {
      if (!s.discard.length) return null;
      s.deck = s.discard; s.discard = [];
      for (let i = s.deck.length - 1; i > 0; i--) { const j = Math.floor(s._rng() * (i + 1)); [s.deck[i], s.deck[j]] = [s.deck[j], s.deck[i]]; }
    }
    const card = { uid: s.nextCardUid++, type: s.deck.pop() };
    s.hand.push(card);
    return card;
  }

  // ---- derived -------------------------------------------------
  function arrangements(s) {
    const g = s.people.guard.state;
    return {
      papers:  { name: 'Papers',  done: s.objects.papers.state === 'stamped',
                 how: 'Commission Lūçīā, in person or by courier, and wait for the wax.' },
      passage: { name: 'Passage', done: g === 'bribed' || g === 'distracted' || s.objects.gate.state === 'unlocked',
                 how: 'Bribe or distract Gaspār, or pick the side gate.' },
      yard:    { name: 'Yard',    done: s.objects.papers.state === 'stamped' || s.people.teo.state === 'friendly',
                 how: 'A stamped pāsportô satisfies Mārtā, or make a friend of Theo.' },
      berth:   { name: 'Berth',   done: s.people.brakeman.state === 'agreed',
                 how: 'Holt takes coin from Theo\'s friends, or listens to anyone who prepared a crate.' },
    };
  }

  // The Nelôxi standard is the plain 24-hour number (coursebook, "Clock time"), so the
  // diegetic clock keeps it; midnight is the word, as both the lore and AP have it.
  function clockText(tick) {
    const minutes = 17 * 60 + tick * 30;
    const h = Math.floor(minutes / 60) % 24, m = minutes % 60;
    if (h === 0 && m === 0) return 'midnight';
    return `${h}:${String(m).padStart(2, '0')}`;
  }

  function canMove(s, dir) {
    const to = s.pos + dir;
    if (to < 0 || to >= STATIONS.length) return { ok: false, why: 'Nothing that way.' };
    if (dir < 0) return { ok: true, to };
    const a = arrangements(s);
    if (to === 3 && !a.passage.done) return { ok: false, to, why: 'Gaspār blocks the customs barrier. ' + a.passage.how };
    if (to === 4 && !a.yard.done)    return { ok: false, to, why: 'Mārtā wants a stamp and Theo wants you off his jārd. ' + a.yard.how };
    return { ok: true, to };
  }

  function canBoard(s) {
    if (s.pos !== 4) return { ok: false, why: 'You are not on the platform.' };
    if (!arrangements(s).berth.done) return { ok: false, why: 'No berth. Holt has not agreed to hide you.' };
    return { ok: true };
  }

  // ---- card applications -------------------------------------
  // Returns [{id, kind, label, ok, why, preview:[...], target}]
  function here(s, ent) { return ent.station === s.pos; }
  function app(id, kind, label, ok, why, preview) { return { id, kind, label, ok, why: ok ? '' : why, preview }; }
  function near(s, ent, name) { return here(s, ent) ? [true, ''] : [false, `You must be at ${STATIONS[ent.station].name} to reach ${name}.`]; }

  function applications(s, type) {
    const P = s.people, O = s.objects, def = CARD_DEFS[type], cost = cardCost(s, type);
    const out = [];
    const afford = (!cost.coin || s.coin >= cost.coin) && (!cost.favor || s.favor >= cost.favor);
    const costWhy = !afford ? `You cannot pay ${costText(cost)}.` : '';
    const push = (id, kind, label, okReason, preview) => {
      let [ok, why] = okReason;
      if (ok && !afford) { ok = false; why = costWhy; }
      out.push(app(id, kind, label, ok, why, preview));
    };
    const both = (a, b) => a[0] ? b : a;

    switch (type) {
      case 'bribe':
        push('guard', 'person', P.guard.name, both(near(s, P.guard, 'the customs guard'),
          P.guard.state === 'alert' ? [true] : [false, 'He is already not looking.']),
          ['Gaspār looks the other way for the night.', 'Heat +1 (he talks over vīnô).', 'Passage arranged.']);
        push('clerk', 'person', P.clerk.name, both(near(s, P.clerk, 'the registrar'),
          P.clerk.state === 'closed' ? [true] : [false, 'Her window is already open.']),
          ['Mārtā opens her window.', 'She will stamp whatever Lūçīā finishes. Forgery completes one half-hour sooner.']);
        push('teo', 'person', P.teo.name, both(near(s, P.teo, 'Theo'),
          P.teo.state === 'hostile' ? [true] : [false, 'Theo is already your kompadrē.']),
          ['Theo pockets it and shrugs.', 'He will walk you past the registry window.', 'Yard arranged.']);
        push('brakeman', 'person', P.brakeman.name, both(near(s, P.brakeman, 'Holt'),
          P.brakeman.state === 'agreed' ? [false, 'Holt has already agreed.'] :
          P.teo.state === 'friendly' ? [true] : [false, 'Holt only takes coin from Theo\'s friends.']),
          ['Holt holds a crate on the midnight frēt to Esmeralda.', 'Berth arranged.']);
        break;
      case 'forgery':
        push('forger', 'person', P.forger.name, both(near(s, P.forger, 'Lūçīā'),
          P.forger.state === 'busy' ? [false, 'She is already working on your pāsportô.'] :
          O.papers.state === 'stamped' ? [false, 'Your pāsportô is done.'] : [true]),
          ['Lūçīā starts inking.', `Ready in three half-hours, or two if Mārtā's window is open.`, 'Pāsportô: forging begins.']);
        break;
      case 'courier':
        push('forger', 'person', P.forger.name + ' (by courier)',
          P.forger.state === 'busy' ? [false, 'She is already working on your pāsportô.'] :
          O.papers.state === 'stamped' ? [false, 'Your pāsportô is done.'] : [true],
          ['A niñô from the ferjā runs the commission to Lūçīā.', 'Works from any station.', 'Ready in three half-hours, or two if Mārtā is open.']);
        break;
      case 'distract':
        push('guard', 'person', P.guard.name, both(near(s, P.guard, 'the customs guard'),
          P.guard.state === 'alert' ? [true] : [false, 'He is already not looking.']),
          ['You kick over the coal brazier. Gaspār runs to it.', 'Distracted for two half-hours.', 'Risk: heat +1.']);
        push('lookout', 'person', P.lookout.name, both(near(s, P.lookout, 'Pipô'),
          P.lookout.state === 'idle' ? (P.guard.state === 'alert' ? [true] : [false, 'No need. Gaspār is not looking.'])
                                     : [false, 'Pipô is already out.']),
          ['Pipô runs ahead and starts a fight by the barrier.', 'Gaspār distracted for three half-hours.', 'No heat on you.']);
        break;
      case 'talk':
        push('clerk', 'person', P.clerk.name, both(near(s, P.clerk, 'the registrar'),
          P.clerk.state === 'closed' ? [true] : [false, 'Her window is already open.']),
          ['Mārtā remembers your mother. Window opens.', 'Forgery completes one half-hour sooner.']);
        push('teo', 'person', P.teo.name, both(near(s, P.teo, 'Theo'),
          P.teo.state === 'hostile' ? [true] : [false, 'Theo is already your kompadrē.']),
          ['Theo grumbles, then grins.', 'Yard arranged.']);
        push('brakeman', 'person', P.brakeman.name, both(near(s, P.brakeman, 'Holt'),
          P.brakeman.state === 'agreed' ? [false, 'Holt has already agreed.'] :
          O.crate.state === 'prepared' ? [true] : [false, 'Holt wants to see a crate already prepared.']),
          ['Holt nods at the crate you prepared.', 'Berth arranged.']);
        push('forger', 'person', P.forger.name, both(near(s, P.forger, 'Lūçīā'),
          P.forger.state === 'busy' ? [true] : [false, 'She is not working for you right now.']),
          ['Lūçīā hurries for a friend.', 'Forgery one half-hour sooner.']);
        break;
      case 'picklock':
        push('gate', 'object', O.gate.name, both(near(s, O.gate, 'the gate'),
          O.gate.state === 'locked' ? [true] : [false, 'Already unlocked.']),
          ['The side gate opens. Takes two half-hours.', 'Heat +2 (a lantern passes).', 'Passage arranged.']);
        push('crate', 'object', O.crate.name, both(near(s, O.crate, 'the crate'),
          O.crate.state === 'sealed' ? [true] : [false, 'Already prepared.']),
          ['You loosen a lid and stuff straw. Takes two half-hours.', 'Heat +1.', 'Holt will then listen to sweet talk.']);
        break;
      case 'sellmaps':
        push('stall', 'object', O.stall.name, both(near(s, O.stall, 'the stall'),
          O.stall.state === 'stocked' ? [true] : [false, 'Sold out.']),
          ['Australs +4.', 'Heat +1 (your charts are known).']);
        break;
      case 'laylow':
        push('attic', 'place', s.places.attic.name, near(s, s.places.attic, 'the attic'),
          ['Half an hour in the dark.', 'Heat −3.']);
        push('self', 'place', 'Right here, in a doorway', [true],
          ['Half an hour with your collar up.', 'Heat −1.']);
        break;
      case 'favor':
        push('forger', 'person', P.forger.name,
          P.forger.state === 'busy' ? [true] : [false, 'She is not working for you right now.'],
          ['Lūçīā calls in her apprentice. No time spent.', 'Forgery two half-hours sooner.']);
        push('teo', 'person', P.teo.name,
          P.teo.state === 'hostile' ? [true] : [false, 'Theo is already your kompadrē.'],
          ['A word from the right person. No time spent.', 'Theo becomes friendly.', 'Yard arranged.']);
        push('guard', 'person', P.guard.name,
          P.guard.state === 'distracted' ? [true] : [false, 'Only useful while Gaspār is distracted.'],
          ['A coin keeps the commotion going. No time spent.', 'Distraction lasts two half-hours longer.']);
        break;
    }
    return out;
  }

  // The live price of a card in this state (bribes inflate; everything else is the printed cost).
  function cardCost(s, type) {
    const c = Object.assign({}, CARD_DEFS[type].cost);
    if (type === 'bribe') c.coin = BRIBE_BASE + BRIBE_STEP * s.bribes;
    return c;
  }
  function costText(cost) {
    const parts = [];
    if (cost.coin) parts.push(`${cost.coin} ${cost.coin === 1 ? 'austral' : 'australs'}`);
    if (cost.favor) parts.push(`${cost.favor} favor`);
    return parts.length ? parts.join(', ') : 'nothing';
  }

  // ---- resolution ----------------------------------------------
  function ev(type, data) { return Object.assign({ type }, data); }
  function say(events, who, text) { events.push(ev('say', { who, text })); }

  function setState(s, group, id, state, events) {
    const ent = s[group][id];
    const from = ent.state; ent.state = state;
    events.push(ev('state', { group, id, from, to: state }));
  }
  function heat(s, d, events, why) {
    if (!d) return;
    s.heat = Math.max(0, s.heat + d);
    events.push(ev('heat', { delta: d, heat: s.heat, why }));
  }
  function coin(s, d, events) { s.coin += d; events.push(ev('coin', { delta: d, coin: s.coin })); }
  function favor(s, d, events) { s.favor += d; events.push(ev('favor', { delta: d, favor: s.favor })); }

  function forgeryTime(s) { return s.people.clerk.state === 'open' ? 2 : 3; }
  function job(s, type) { return s.jobs.find(j => j.type === type); }

  function startForgery(s, events, viaCourier) {
    setState(s, 'people', 'forger', 'busy', events);
    setState(s, 'objects', 'papers', 'inking', events);
    const t = forgeryTime(s);
    s.jobs.push({ type: 'forge', remaining: t, who: 'forger' });
    events.push(ev('job', { type: 'forge', remaining: t }));
    say(events, 'forger', viaCourier ? `"Tell her ${t === 2 ? 'an hour' : 'an hour and a half'}. And tell her I don't do rush, niñô."`
                                    : `"${t === 2 ? 'An hour' : 'An hour and a half'}. Don't stand over my wax."`);
  }
  function hurryForgery(s, n, events) {
    const j = job(s, 'forge'); if (!j) return;
    j.remaining = Math.max(0, j.remaining - n);
    events.push(ev('job', { type: 'forge', remaining: j.remaining }));
    if (j.remaining === 0) finishJob(s, j, events);
  }
  function distractGuard(s, n, events) {
    setState(s, 'people', 'guard', 'distracted', events);
    s.jobs = s.jobs.filter(j => j.type !== 'distract');
    s.jobs.push({ type: 'distract', remaining: n, who: 'guard' });
    events.push(ev('job', { type: 'distract', remaining: n }));
  }
  function finishJob(s, j, events) {
    s.jobs = s.jobs.filter(x => x !== j);
    if (j.type === 'forge') {
      setState(s, 'people', 'forger', 'idle', events);
      setState(s, 'objects', 'papers', 'stamped', events);
      events.push(ev('arranged', { id: 'papers' }));
      say(events, 'forger', '"Done. Wax is set. Go."');
    } else if (j.type === 'distract') {
      if (s.people.guard.state === 'distracted') setState(s, 'people', 'guard', 'alert', events);
      say(events, 'guard', '"Right. Back to the barrier."');
    } else if (j.type === 'lookout') {
      setState(s, 'people', 'lookout', 'idle', events);
    } else if (j.type === 'picklock') {
      setState(s, 'objects', j.who, j.who === 'gate' ? 'unlocked' : 'prepared', events);
      events.push(ev('arranged', { id: j.who === 'gate' ? 'passage' : 'crate' }));
      say(events, 'you', j.who === 'gate' ? 'The lock gives. The gate swings an inch.' : 'The lid lifts. Straw inside, room for one.');
    }
    events.push(ev('jobdone', { type: j.type }));
  }

  function play(s, cardUid, targetId) {
    if (s.over) return { ok: false, why: 'The game is over.' };
    const card = s.hand.find(c => c.uid === cardUid);
    if (!card) return { ok: false, why: 'That card is not in your hand.' };
    const a = applications(s, card.type).find(x => x.id === targetId);
    if (!a) return { ok: false, why: 'That is not something this card can affect.' };
    if (!a.ok) return { ok: false, why: a.why };
    const def = CARD_DEFS[card.type], cost = cardCost(s, card.type);
    const events = [];
    events.push(ev('play', { card: card.type, target: targetId }));
    if (cost.coin) coin(s, -cost.coin, events);
    if (cost.favor) favor(s, -cost.favor, events);
    if (card.type === 'bribe') { s.bribes += 1; events.push(ev('price', { bribe: cardCost(s, 'bribe').coin })); }

    switch (card.type) {
      case 'bribe':
        if (targetId === 'guard') { setState(s, 'people', 'guard', 'bribed', events); heat(s, 1, events, 'Gaspār will talk'); events.push(ev('arranged', { id: 'passage' })); say(events, 'guard', '"Three australs says I never saw you. Dālē, go on before I remember."'); }
        if (targetId === 'clerk') { setState(s, 'people', 'clerk', 'open', events); say(events, 'clerk', '"Window\'s open. Bring me something worth a stamp."'); if (job(s, 'forge')) hurryForgery(s, 1, events); }
        if (targetId === 'teo')   { setState(s, 'people', 'teo', 'friendly', events); events.push(ev('arranged', { id: 'yard' })); say(events, 'teo', '"Walk behind me and don\'t look at the window."'); }
        if (targetId === 'brakeman') { setState(s, 'people', 'brakeman', 'agreed', events); events.push(ev('arranged', { id: 'berth' })); say(events, 'brakeman', '"Third bokskār, crate with the chalk mark. Midnight, Esmeralda side. I don\'t wait."'); }
        break;
      case 'forgery': startForgery(s, events, false); break;
      case 'courier': events.push(ev('courier', {})); startForgery(s, events, true); break;
      case 'distract':
        if (targetId === 'guard') {
          distractGuard(s, 2, events);
          if (s._rng() < 0.5) heat(s, 1, events, 'someone saw you kick the brazier');
          say(events, 'guard', '"Who did that? Someone get sand on it."');
        } else {
          setState(s, 'people', 'lookout', 'running', events);
          s.jobs.push({ type: 'lookout', remaining: 3, who: 'lookout' });
          events.push(ev('run', { who: 'lookout', to: 2 }));
          distractGuard(s, 3, events);
          say(events, 'lookout', '"Give me a minute and watch him run. Trankīlô."');
        }
        events.push(ev('arranged', { id: 'passage' }));
        break;
      case 'talk':
        if (targetId === 'clerk') { setState(s, 'people', 'clerk', 'open', events); say(events, 'clerk', '"You have her eyes. Dālē. Window\'s open."'); if (job(s, 'forge')) hurryForgery(s, 1, events); }
        if (targetId === 'teo')   { setState(s, 'people', 'teo', 'friendly', events); events.push(ev('arranged', { id: 'yard' })); say(events, 'teo', '"Dālē. Stay close and keep your mouth shut."'); }
        if (targetId === 'brakeman') { setState(s, 'people', 'brakeman', 'agreed', events); events.push(ev('arranged', { id: 'berth' })); say(events, 'brakeman', '"You did the work. I\'ll do the rest."'); }
        if (targetId === 'forger') { hurryForgery(s, 1, events); say(events, 'forger', '"For you, niñô. Only for you."'); }
        break;
      case 'picklock':
        s.jobs.push({ type: 'picklock', remaining: 2, who: targetId });
        events.push(ev('job', { type: 'picklock', remaining: 2, who: targetId }));
        heat(s, targetId === 'gate' ? 2 : 1, events, 'a lantern passes while you work');
        say(events, 'you', targetId === 'gate' ? 'You kneel at the gate with a bent nail.' : 'You find a pry bar and a quiet crate.');
        break;
      case 'sellmaps':
        setState(s, 'objects', 'stall', 'sold', events); coin(s, 4, events); heat(s, 1, events, 'your maps are recognised');
        say(events, 'you', 'A ferjā trader buys the lot without haggling. He knows whose hand drew them.');
        break;
      case 'laylow':
        heat(s, targetId === 'attic' ? -3 : -1, events, 'the street forgets you');
        say(events, 'you', targetId === 'attic' ? 'Half an hour under the eaves, listening to boots in the galpôn.' : 'You study a shop window until the bailiffs pass.');
        break;
      case 'favor':
        if (targetId === 'forger') { hurryForgery(s, 2, events); say(events, 'forger', '"Apprentice. Earn your keep."'); }
        if (targetId === 'teo')    { setState(s, 'people', 'teo', 'friendly', events); events.push(ev('arranged', { id: 'yard' })); say(events, 'teo', '"If old Nonô vouches for you, dālē."'); }
        if (targetId === 'guard')  { const j = job(s, 'distract'); if (j) { j.remaining += 2; events.push(ev('job', { type: 'distract', remaining: j.remaining })); } say(events, 'you', 'A few coins to a niñô keeps the brazier burning.'); }
        break;
    }

    s.hand = s.hand.filter(c => c !== card);
    s.discard.push(card.type);
    const drawn = draw(s);
    if (drawn) events.push(ev('draw', { card: drawn.type }));

    for (let i = 0; i < def.time; i++) advance(s, events);
    return { ok: true, events };
  }

  function move(s, dir) {
    if (s.over) return { ok: false, why: 'The game is over.' };
    const c = canMove(s, dir);
    if (!c.ok) return c;
    const events = [];
    const from = s.pos; s.pos = c.to;
    events.push(ev('walk', { from, to: c.to }));
    if (c.to === 3 && dir > 0) {
      const g = s.people.guard.state;
      say(events, 'you', g === 'bribed' ? 'Gaspār studies the sky as you pass.' :
                         g === 'distracted' ? 'You slip past while Gaspār shouts at the smoke.' :
                         'You ease through the side gate.');
    }
    if (c.to === 4 && dir > 0) {
      say(events, 'you', s.people.teo.state === 'friendly' ? 'Theo walks you past the window, talking loudly about the swiç.' :
                                                            'Mārtā glances at the stamp and waves you on.');
    }
    advance(s, events);
    return { ok: true, events };
  }

  // Wait half an hour. Optionally swap one card from the hand for a fresh draw.
  function wait(s, swapUid) {
    if (s.over) return { ok: false, why: 'The game is over.' };
    const events = [ev('wait', {})];
    if (swapUid != null) {
      const card = s.hand.find(c => c.uid === swapUid);
      if (!card) return { ok: false, why: 'That card is not in your hand.' };
      s.hand = s.hand.filter(c => c !== card);
      s.discard.push(card.type);
      events.push(ev('swap', { card: card.type }));
      const drawn = draw(s);
      if (drawn) events.push(ev('draw', { card: drawn.type }));
    }
    advance(s, events);
    return { ok: true, events };
  }

  function board(s) {
    if (s.over) return { ok: false, why: 'The game is over.' };
    const c = canBoard(s); if (!c.ok) return c;
    const events = [ev('board', {})];
    s.over = { win: true, reason: `You climb into the chalk-marked crate at ${clockText(s.tick)}. The midnight frēt pulls out over the passes toward Esmeralda with you in it, and the debt stays in Valdória.` };
    events.push(ev('over', s.over));
    return { ok: true, events };
  }

  // one half-hour passes
  function advance(s, events) {
    if (s.over) return;
    s.tick += 1;
    events.push(ev('tick', { tick: s.tick, clock: clockText(s.tick) }));
    // pending work
    for (const j of s.jobs.slice()) {
      j.remaining -= 1;
      events.push(ev('job', { type: j.type, remaining: j.remaining, who: j.who }));
      if (j.remaining <= 0) finishJob(s, j, events);
    }
    // patrol pressure
    if (s.heat >= 3 && s._rng() < (s.heat - 2) * 0.12) {
      heat(s, 1, events, 'the bailiffs ask questions on your street');
      events.push(ev('patrol', { station: s.pos }));
      say(events, 'patrol', s.heat >= HEAT_LIMIT ? '"That\'s her. The chart-maker from the ledger. Take her."' : '"Pāsportô? Move along. For now."');
    }
    if (s.heat >= HEAT_LIMIT) {
      s.over = { win: false, reason: 'Too many people were talking about you. The bailiffs find you at ' + clockText(s.tick) + ' and walk you back to the ledger.' };
      events.push(ev('over', s.over));
      return;
    }
    if (s.tick >= TICKS_TOTAL) {
      s.over = { win: false, reason: 'Midnight. You hear the frēt pull out from ' + STATIONS[s.pos].name.replace(/^The /, 'the ') + ' without you.' };
      events.push(ev('over', s.over));
    }
  }

  return {
    TICKS_TOTAL, HEAT_LIMIT, STATIONS, CARD_DEFS, STATE_LABEL, PERSONAS, BRIBE_BASE, BRIBE_STEP,
    newGame, applications, play, move, wait, board, canMove, canBoard, arrangements, clockText, costText, cardCost,
  };
})();
if (typeof module !== 'undefined') module.exports = Sim;
