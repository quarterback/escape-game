/* ============================================================
   COALITION UI. Phone first: a scene header with the clock, the goal
   and the inquiry over it; one panel on screen (Here, Phone, Route,
   Hand) with a tab bar; on a wide window the same parts spread out and
   the Route becomes the blueprint board. Reveal → inspect → commit →
   the sim resolves → the consequences animate. Two roles share the
   frame: the escape (Sim) and the government (Gov).
   ============================================================ */
'use strict';
const UI = (() => {
  let s = null, sel = null, who = 'woman', enemyLog = [], tab = 'here', gov = null, installEvt = null;
  // Phase turns (escape side): News, Phone, Move, Roll, Sosā. One call and one move per round.
  let answered = false, lastStop = -1; // the phone was answered this round
  let recap = null, newsRecap = null; // what the last round and the last news choice did, kept on screen until the next move
  let phase = 'move', round = 1, phoneCalls = 0, movedThisRound = false, result = null, roundSum = { theirs: [], hours: 0 }, daily = null;
  const $ = (id) => document.getElementById(id);
  const T = Content.t, H = Content.html; // all player-facing wording comes from content/coalition/ui.json
  const COLORS = { narrator: '#B9B0D9', sibling: '#C9A4F5', aide: '#E85DF0', nando: '#FF9F43', sponsor: '#FFC93C', host: '#FF9F43', official: '#7FB2E5', holt: '#B9B0D9', theo: '#FF9F43', press: '#D8D2EE', pilot: '#7FB2E5', enemy: '#FF7A90', minister: '#FFC93C', watch: '#D8D2EE', desk: '#D8D2EE', sys: '#B9B0D9' };
  const short = (h) => { const [d, ...t] = Sim.clockText(h).split(' '); return `${d.slice(0, 3)} ${t.join(' ')}`; };
  const initials = (name) => name.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  // owner, Nov. 1, 2026: "your sibling" means nothing to a player; every mention says who ("your brother Duartē")
  const sibNamed = (t) => { if (gov || !who || !Data.CHARACTERS[who]) return t; const sb = Data.CHARACTERS[who].sibling, n = T('who.sibling', { rel: sb.rel.replace(/^your /, ''), name: sb.short }); return t.replace(/\bYour sibling\b/g, n[0].toUpperCase() + n.slice(1)).replace(/\byour sibling\b/g, n); };
  const esc = (t) => sibNamed(t == null ? '' : String(t)).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // who a call goes to: the sibling is "your sibling", which reads the same for either candidate
  const callee = (id) => id === 'sibling' ? T('phone.your_sibling') : pname(id);
  const pname = (id) => gov ? Gov.personName(gov, id) : Sim.personName(s, id);

  function log(whoId, text, cls) {
    if (!text) return;
    const el = document.createElement('div'); el.className = 'line ' + (cls || '');
    const name = whoId === 'narrator' || whoId === 'sys' ? '' : whoId === 'enemy' ? (gov ? T('name.inspector') : Data.ENEMY.name) : pname(whoId);
    el.innerHTML = `${name ? `<b style="color:${COLORS[whoId] || '#ccc'}">${esc(name)}</b> ` : ''}<span>${text}</span>`;
    const box = $('dialogue'); box.appendChild(el); box.scrollTop = box.scrollHeight;
  }

  // ---- storage: first visit, saved run --------------------------------
  // Saves from the six-sided game cannot resume under the 20-sided die (a demo save kept its six-sided scripted dice),
  // so runs save under a new key and the old one is cleared once.
  const SEEN = 'coalition.seen', SAVE = 'coalition.run.d20';
  try { localStorage.removeItem('coalition.run'); } catch (e) { /* storage blocked */ }
  const seen = () => { try { return !!localStorage.getItem(SEEN); } catch (e) { return true; } };
  const markSeen = () => { try { localStorage.setItem(SEEN, '1'); } catch (e) { /* storage blocked */ } };
  function saveRun() {
    try {
      if (replaying) return;
      if (!s || s.over) { localStorage.removeItem(SAVE); return; }
      localStorage.setItem(SAVE, JSON.stringify({ round, daily: daily ? daily.key : null, who, gov: gov ? Gov.serialize(gov) : null, s: gov ? null : Sim.serialize(s), tut: Tutorial.active() ? Tutorial.index() : -1, tutId: Tutorial.side(), log: enemyLog.slice(-8), lines: Array.from($('dialogue').children).slice(-30).map(l => l.outerHTML) }));
    } catch (e) { /* storage blocked: the run simply is not resumable */ }
  }
  function savedRun() { try { const j = localStorage.getItem(SAVE); return j ? JSON.parse(j) : null; } catch (e) { return null; } }
  function resumeRun() {
    const r = savedRun(); if (!r) return false;
    who = r.who; enemyLog = r.log || []; sel = null; Sfx.theme(false);
    if (r.gov) { gov = Gov.restore(r.gov); s = gov.c; } else { gov = null; s = Sim.restore(r.s); } lastStop = s.pos;
    if (r.tut >= 0) { Tutorial.start(r.tutId || (gov ? 'gov' : 'escape')); while (Tutorial.index() < r.tut) Tutorial.forward(); } else Tutorial.stop();
    Render.setState(s, gov); Render.view.over = null; Render.view.queue = []; Render.view.current = null;
    $('dialogue').innerHTML = (r.lines || []).join(''); $('start').hidden = true; document.body.classList.toggle('gov', !!gov);
    round = r.round || 1; daily = r.daily && r.daily === dailyInfo().key ? dailyInfo() : null;
    setTab('here'); renderAll(); startRound(true); return true;
  }

  // ---- runs --------------------------------------------------------------
  let replaying = null; // { queue, speed, timer } while a replay link plays itself
  function newRun(w, demo, isDaily, dest, seed, extra, mate) {
    closeCall(); callShown.clear();
    markSeen(); briefPos = -1; recap = null; newsRecap = null; gov = null; document.body.classList.remove('gov'); daily = isDaily ? dailyInfo() : null; round = 1; $('map').hidden = true;
    lastStop = -1; // the first stop gets its screen too
    if (daily) { who = daily.who; s = Sim.newRun(daily.seed, who, { daily: true, dest }); Tutorial.stop(); }
    else if (demo) { who = Tutorial.WHO; s = Sim.newRun(Tutorial.SEED, who, { dice: Tutorial.DICE, enemy: Tutorial.ENEMY, tutorial: true }); Tutorial.start('escape'); }
    else { who = w; s = Sim.newRun(seed === undefined ? (Math.random() * 1e9) >>> 0 : seed, who, { dest, extra: extra || [], companion: mate || null }); Tutorial.stop(); }
    sel = null; enemyLog = []; Sfx.theme(false);
    Render.setState(s); Render.view.over = null; Render.view.queue = []; Render.view.current = null;
    $('dialogue').innerHTML = ''; $('start').hidden = true; setTab('here');
    const c = Data.CHARACTERS[who];
    log('sys', esc(T('log.start_escape', { clock: Sim.clockText(0), name: c.name, title: c.title, sibling: c.sibling.name, rel: c.sibling.rel })), 'sys');
    animate(s._boot); renderAll(); startRound(true); saveRun();
  }
  function newGovRun(demo, seed, mate) {
    closeCall(); callShown.clear();
    markSeen(); recap = null; newsRecap = null; who = 'gov'; sel = null; enemyLog = []; Sfx.theme(false); daily = null;
    if (demo) { const G = Tutorial.RUNS.gov; gov = Gov.newRun(G.seed, 'woman', { dice: G.dice, events: G.eventQueue, tutorial: true }); Tutorial.start('gov'); }
    else { Tutorial.stop(); gov = Gov.newRun(seed === undefined ? (Math.random() * 1e9) >>> 0 : seed, 'woman', { companion: mate || null }); }
    s = gov.c; document.body.classList.add('gov');
    Render.setState(s, gov); Render.view.over = null; Render.view.queue = []; Render.view.current = null;
    $('dialogue').innerHTML = ''; $('start').hidden = true; setTab('here');
    log('sys', esc(T('log.start_gov', { clock: Sim.clockText(0), name: Data.GOV.name, title: Data.GOV.title, target: Data.CHARACTERS[gov.target].name })), 'sys');
    round = 1; animate(gov._boot); renderAll(); startRound(true); saveRun();
  }

  function setTab(t) { tab = t; document.querySelectorAll('#tabs button').forEach(b => { if (b.dataset.tab === t) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }); document.querySelectorAll('.tab').forEach(el => el.classList.toggle('active', el.dataset.tab === t)); }

  function renderAll() {
    if (!s) return;
    renderScene(); renderCoach(); renderPhase(); setTimeout(maybeRing, 0);
    if (Sfx.ambience) Sfx.ambience(s.over ? null : Data.LEVELS[gov ? Math.max(0, gov.belief) : s.pos].scene, Sim.isNight(s));
    if (gov) { renderGovHere(); renderGovPhone(); renderGovRoute(); }
    else { renderHere(); renderPhone(); renderRoute(); }
    renderOver(); document.body.classList.toggle('busy', Render.busy());
  }

  // ---- the scene header: clock, goal, the inquiry, the level -------------
  function renderScene() {
    const hoursLeft = Sim.HOURS_TOTAL - s.hour, deadline = short(Sim.HOURS_TOTAL);
    const hoursText = T(hoursLeft === 1 ? 'scene.hours_one' : 'scene.hours', { n: Sim.num(hoursLeft) });
    // every clock says whose it is: this one is the escape deadline, Tuesday 2 p.m., for both sides
    $('clock').textContent = short(s.hour); $('left').textContent = gov ? T('scene.deadline_gov', { time: hoursText }) : T('scene.deadline_escape', { time: hoursText }); $('deadline').textContent = T('scene.deadline_when', { when: deadline }); $('deadline2').textContent = deadline;
    const L = Data.LEVELS[s.pos];
    if (gov) {
      const v = Gov.view(gov);
      $('goaltxt').textContent = T('scene.gov_goal', { her: v.her });
      $('sosa-name').textContent = Data.CHARACTERS[gov.target].name; $('sosa-where').textContent = v.lastReport ? T('scene.last_report', { age: v.lastReport }) : T('scene.no_reports');
      $('sosa-next').textContent = v.lastReport || T('scene.none'); $('sosa-nextl').textContent = T('scene.last_report_label'); $('sosa-next').parentElement.hidden = false; $('sosa-where').hidden = false; $('sosa').querySelector('.arrive').hidden = false;
      $('sosa').querySelector('.exp').hidden = true; $('heat').hidden = true; $('sosa').querySelector('.arrive').textContent = T('scene.minister_by', { time: short(v.ministerBy) });
      $('heatnum2').className = 'mono orange'; $('expl-l').textContent = T('scene.suspected'); $('expl-b').textContent = v.suspectName; $('heat2').hidden = true; $('heatnum2').textContent = v.lastReport ? T('scene.last_report_lc', { age: v.lastReport }) : T('scene.no_reports_lc');
      $('lvlname').textContent = v.levelName; $('lvlobj').textContent = v.objective; $('lvlname2').textContent = v.levelName; $('lvlobj2').textContent = v.objective;
      { const r = v.reports[0], m = { [gov.belief]: [['you', T('brief.gov_search')]] }; if (r) m[r.at] = (m[r.at] || []).concat([['seen', T('brief.gov_last_seen')]]); $('routemap').innerHTML = routeMap(m, false, 0); }
      $('wait').textContent = T('action.wait_gov'); $('phoneh').textContent = T('nav.desk'); document.querySelector('#herehead h2').textContent = T('nav.orders');
      return;
    }
    $('goaltxt').textContent = T('scene.goal');
    const right = s.belief === s.pos;
    $('sosa-name').textContent = right ? T('scene.sosa_here') : T('scene.sosa_at', { place: Data.LEVELS[s.belief].short });
    // owner, Nov. 1, 2026, from a phone: the box says where the police are and your police attention, nothing else.
    // "You are not at the residence. Nothing else needed." One number, no bar; no countdown; the limit of 10 is in the help.
    $('sosa-where').textContent = right ? '' : T('scene.sosa_away'); $('sosa-where').hidden = right;
    $('sosa-next').parentElement.hidden = true;
    { const ar = $('sosa').querySelector('.arrive'); ar.textContent = ''; ar.hidden = true; }
    $('sosa').querySelector('.exp').hidden = false; $('heat').hidden = true; $('heat2').hidden = true;
    for (const id of ['heatnum', 'heatnum2']) { const h = $(id); h.textContent = attnWord(s.exposure); h.className = 'mono lvl-' + attnLevel(s.exposure); } $('expl-l').textContent = T('scene.exposure'); $('expl-b').textContent = '';
    $('lvlname').textContent = L.name; $('lvlobj').textContent = L.objective; $('lvlname2').textContent = L.name; $('lvlobj2').textContent = L.objective;
    $('wait').textContent = T('action.wait'); $('phoneh').textContent = T('nav.phone'); document.querySelector('#herehead h2').textContent = T('nav.here');
    $('whoami').textContent = `${Data.CHARACTERS[who].name}, ${Data.CHARACTERS[who].title}`;
    $('routemap').innerHTML = routeMap(routeMarks(), false, s.pos);
  }

  // ---- the coach -----------------------------------------------------------
  function renderCoach() {
    const box = $('coach'); document.querySelectorAll('.tut-hi').forEach(el => el.classList.remove('tut-hi'));
    if (!Tutorial.active()) { box.hidden = true; document.body.classList.remove('coaching'); return; }
    const st = Tutorial.step(); box.hidden = false; document.body.classList.add('coaching');
    $('coach-step').textContent = T('coach.step', { n: Tutorial.index() + 1, total: Tutorial.STEPS.length });
    $('coach-title').textContent = st.title; $('coach-body').innerHTML = Content.rich(sibNamed(st.body));
    $('coach-next').hidden = !st.allow.next; $('coach-next').textContent = Tutorial.isLast() ? T('action.finish') : T('action.next');
    $('coach-do').hidden = !!st.allow.next;
    for (const q of st.highlight) { const el = document.querySelector(q); if (el) el.classList.add('tut-hi'); }
    requestAnimationFrame(() => $('panels').style.setProperty('--coachh', box.offsetHeight + 'px'));
    // on the phone, switch to the tab the step points at
    if (window.innerWidth < 1000 && st.highlight.length && !['news', 'roll', 'sosa'].includes(phase)) { const q = st.highlight[0]; const t = q === '#inbox' || q === '#calls' || q === '#arrangements' ? 'phone' : q === '#hand' || q === '#people' ? 'hand' : q === '#enemy' || q === '#board' ? 'route' : null; if (t) setTab(t); else if (q === '#approaches') setTab('here'); }
  }

  // ---- Here: approaches with a die face -------------------------------------
  const tagName = (tag) => ({ boat: T('tag.boat'), decoy: T('tag.decoy'), delay: T('tag.delay'), document: T('tag.document'), influence: T('tag.influence'), information: T('tag.information'), introduction: T('tag.introduction'), operator: T('tag.operator'), passage: T('tag.passage'), patrol: T('tag.patrol'), permission: T('tag.permission'), rail: T('tag.rail'), records: T('tag.records'), vehicle: T('tag.vehicle'), watch: T('tag.watch') })[tag] || tag;
  // owner, Nov. 1, 2026: a move shows what it is and how long it takes, nothing else. Only moves you can make
  // are listed. A person's tag shows only as a warning (doubted, or talked to the police).
  const warnMark = (a) => { if (!a.with || a.with === 'self' || !s.people[a.with]) return ''; const [c, t] = whoMark(a.with); return c === 'doubt' || c === 'talked' ? mks([{ k: c, t: `${Sim.shortName(gov ? gov.c : s, a.with)}: ${t}` }]) : ''; };
  const hoursLine = (a) => `<span class="meta"><span class="hrs">${esc(T('action.takes', { hours: a.hours }))}</span></span>`;
  function approachBtn(a, allowed) {
    const b = document.createElement('button'); b.className = 'act approach' + (sel === a.id ? ' sel' : '');
    if (!allowed) { b.classList.add('off'); b.disabled = true; }
    b.innerHTML = `<span class="body"><span class="nm">${esc(a.name)}</span>${warnMark(a)}${hoursLine(a)}</span>`;
    b.onclick = () => { Sfx.unlock(); sel = sel === a.id ? null : a.id; Sfx.select(); renderAll(); };
    return b;
  }
  function expanded(a, commitLabel, onCommit) {
    const box = document.createElement('div'); box.className = 'actbox';
    box.innerHTML = `<div class="act"><span class="body"><span class="nm">${esc(a.name)}</span>${warnMark(a)}${hoursLine(a)}</span></div>${a.text ? `<p class="ctx">${esc(a.text)}</p>` : ''}<div class="row">${!s.over ? `<button class="primary commit">${commitLabel}</button>` : ''}<button class="cancel">${T('action.cancel')}</button></div>`;
    if (box.querySelector('.commit')) box.querySelector('.commit').onclick = onCommit;
    box.querySelector('.cancel').onclick = () => { sel = null; renderAll(); };
    requestAnimationFrame(() => { const r = box.querySelector('.row'); if (r) r.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }); // the opened card's buttons stay on screen
    return box;
  }
  function renderHere() {
    const A = Sim.actions(s); const box = $('approaches'); box.innerHTML = '';
    for (const a of A.approaches) { if (!a.ok) continue; if (sel === a.id) box.appendChild(expanded(a, T('action.commit'), () => doCommit(a.id))); else box.appendChild(approachBtn(a, Tutorial.allowsApproach(a.id) && phase === 'move')); } // only moves you can make
    // waiting is a choice like any move: it says how long it takes and what can happen while you wait
    $('wait').hidden = true; $('waitdark').hidden = true;
    const can = !s.over && Tutorial.allowsWait() && phase === 'move' && !s.event;
    const waits = [];
    if (A.waitDark.ok) { const nm = (Data.LEVELS[s.pos].approaches.find(a => a.needs.some(n => n.night)) || {}).name; waits.push({ id: 'wait_dark', name: T('action.wait_dark'), hours: A.waitDark.hours, lines: nm ? [T('wait.dark_for', { move: nm[0].toLowerCase() + nm.slice(1) })] : [] }); }
    waits.push({ id: 'wait', name: T('action.wait'), hours: 1, lines: [] });
    for (const w of waits) box.appendChild(sel === w.id ? waitBox(w) : waitBtn(w, can));
  }
  const CLOCK = `<span class="die sure wait" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg></span>`;
  const waitMeta = (w) => w.id === 'wait' ? '' : `<span class="meta"><span class="hrs">${esc(T('action.takes', { hours: w.hours }))}</span></span>`; // "1 hr wait" already says it
  function waitBtn(w, allowed) {
    const b = document.createElement('button'); b.className = 'act approach waitact' + (allowed ? '' : ' off'); b.disabled = !allowed;
    b.innerHTML = `${CLOCK}<span class="body"><span class="nm">${esc(w.name)}</span>${waitMeta(w)}</span>`;
    b.onclick = () => { Sfx.unlock(); sel = w.id; Sfx.select(); renderAll(); };
    return b;
  }
  function waitBox(w) {
    const box = document.createElement('div'); box.className = 'actbox';
    box.innerHTML = `<div class="act">${CLOCK}<span class="body"><span class="nm">${esc(w.name)}</span>${waitMeta(w)}</span></div>${w.lines.map(x => `<p class="ctx">${esc(x)}</p>`).join('')}<div class="row"><button class="primary commit">${T('action.wait_go')}</button><button class="cancel">${T('action.cancel')}</button></div>`;
    box.querySelector('.commit').onclick = () => doCommit(w.id); box.querySelector('.cancel').onclick = () => { sel = null; renderAll(); };
    return box;
  }

  // ---- a call takes over the screen (owner, Nov. 1, 2026) ---------------------------------------
  // "phone calls would trigger a transition ... I see it's ringing, I answer ... a split screen of you and then
  // whoever you are talking to." The phone panel keeps every call; this shows the waiting ones one at a time.
  const CALLER_ROLE = { aide: 'aide', nando: 'nando', host: 'host', holt: 'holt', theo: 'theo', pilot: 'pilot', official: 'official', enemy: 'police', sibling: 'local', sponsor: 'local' };
  const callShown = new Set(); let callOpen = null;
  const waitingCalls = () => gov ? Gov.view(gov).messages : Sim.actions(s).messages;
  const callText = (m) => gov ? m.text : (s.inbox.find(x => x.id === m.msgId) || {}).text || '';
  const face = (el, role, name) => { const url = role ? Render.portrait(role) : null; if (url) el.style.backgroundImage = `url(${url})`; else { el.classList.add('initials'); el.textContent = initials(name); } };
  function maybeRing() {
    if (callOpen || !s || s.over || Tutorial.active() || s.tutorial || (gov && gov.tutorial) || replaying || phase !== 'move' || !$('picker').hidden || !$('brief').hidden || !$('start').hidden || !$('title').hidden || !$('map').hidden) return;
    const m = waitingCalls().find(x => !callShown.has(x.id)); if (!m) return;
    if (Render.busy()) { setTimeout(maybeRing, 400); return; }
    showCall(m);
  }
  function closeCall() { callOpen = null; $('callscreen').hidden = true; $('callscreen').classList.remove('ringing'); }
  function showCall(m) {
    callOpen = m.id; callShown.add(m.id);
    const name = pname(m.from), pane = $('callpane'), box = $('callscreen');
    pane.innerHTML = `<div class="ring"><span class="face big"></span><b>${esc(name)}</b><span class="sub">${esc(T('call.ringing'))}</span><div class="row"><button class="primary" id="call-answer">${esc(T('call.answer'))}</button><button class="pill ghost" id="call-later">${esc(T('call.later'))}</button></div></div>`;
    face(pane.querySelector('.face'), CALLER_ROLE[m.from], name);
    box.hidden = false; box.classList.add('ringing'); Sfx.ring();
    $('call-later').onclick = () => { Sfx.click(); closeCall(); };
    $('call-answer').onclick = () => {
      Sfx.unlock(); Sfx.click(); box.classList.remove('ringing');
      const me = gov ? Data.GOV.name : Data.CHARACTERS[who].name, mine = gov ? 'sofia' : who === 'man' ? 'mateu' : 'teresa';
      pane.innerHTML = `<div class="split"><div class="side"><span class="face"></span><b>${esc(me)}</b></div><div class="side"><span class="face"></span><b>${esc(name)}</b></div></div><p class="bubble">${esc(callText(m))}</p><div class="answers"></div>`;
      const faces = pane.querySelectorAll('.face'); face(faces[0], mine, me); face(faces[1], CALLER_ROLE[m.from], name);
      const ans = pane.querySelector('.answers');
      for (const o of m.options) { if (!o.ok) continue;
        const b = document.createElement('button'); b.className = 'answer';
        b.innerHTML = `<span>${esc(o.label)}</span>${o.hours ? `<span class="hrs">${esc(T('action.takes', { hours: o.hours }))}</span>` : ''}`;
        b.onclick = () => { closeCall(); if (gov) doGov(m.id, o.id); else doCommit(m.id, o.id); };
        ans.appendChild(b); }
    };
  }
  // ---- the phone: a thread, then calls --------------------------------------
  function thread(from, role, text, options, optClass) {
    const d = document.createElement('div'); d.className = 'msg';
    const name = pname(from), cls = from === 'enemy' ? ' enemy' : from === 'press' ? ' press' : '';
    d.innerHTML = `<div class="who"><span class="avatar${cls}" aria-hidden="true">${initials(name)}</span><span class="n"><b>${esc(name)}</b><span>${esc(role)}</span></span></div><p class="bubble">${esc(text)}</p><div class="opts"></div>`;
    const opts = d.querySelector('.opts');
    for (const o of options) { if (!o.ok) continue; const b = document.createElement('button'); b.className = 'opt' + (optClass(o) ? '' : ' off'); b.disabled = !o.ok || !!s.over || !optClass(o); b.innerHTML = `<span class="l">${esc(o.label)}${o.hours ? `<span class="mono gold">${esc(T('action.takes', { hours: o.hours }))}</span>` : ''}</span>`; b.onclick = () => o.go(); opts.appendChild(b); }
    return d;
  }
  const PHONE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A4F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"></path></svg>`;
  function callBtn(c, allowed, label) {
    const b = document.createElement('button'); b.className = 'call' + (c.ok ? '' : ' no') + (sel === c.id ? ' sel' : '') + (allowed ? '' : ' off'); b.disabled = !allowed;
    b.innerHTML = `${PHONE}<span class="t">${esc(label)}</span>${c.ok ? `<span class="hrs">${esc(T('action.takes', { hours: c.hours }))}</span>` : `<span class="why">${esc(c.why)}</span>`}`;
    b.onclick = () => { Sfx.unlock(); sel = sel === c.id ? null : c.id; Sfx.select(); renderAll(); };
    return b;
  }
  function renderPhone() {
    const A = Sim.actions(s); const inbox = $('inbox'); inbox.innerHTML = '';
    $('waiting').textContent = A.messages.length ? T('phone.waiting', { n: Sim.num(A.messages.length) }) : ''; const badge = $('tab-badge'); badge.hidden = !A.messages.length; badge.textContent = A.messages.length;
    if (!A.messages.length) inbox.innerHTML = `<p class="hint">${T('phone.empty')}</p>`;
    for (const m of A.messages) {
      const role = m.from === 'sibling' ? T('phone.sibling_role', { rel: Data.CHARACTERS[who].sibling.rel[0].toUpperCase() + Data.CHARACTERS[who].sibling.rel.slice(1).replace('your ', '') }) : m.from === 'enemy' ? Data.ENEMY.role : gov ? (Data.PEOPLE[m.from] || {}).role || '' : Sim.personRole(s, m.from);
      inbox.appendChild(thread(m.from, role, s.inbox.find(x => x.id === m.msgId).text, m.options.map(o => Object.assign({}, o, { go: () => doCommit(m.id, o.id) })), (o) => Tutorial.allowsOption(o.id) && (phase === 'phone' || phase === 'move')));
    }
    const calls = $('calls'); calls.innerHTML = '';
    for (const c of A.calls) { if (!c.ok) continue; // only calls you can make
      const arr = c.id.replace(/^call:/, ''), def = Data.ARRANGEMENTS[arr];
      const label = c.ok ? cap(T('phone.call_about', { name: callee(c.ally), what: ({ aircraft: T('arr.what_aircraft'), reception: T('arr.what_reception'), permission: T('arr.what_permission') })[arr] })) : `${def.name}: ${c.name.split(': ')[1] || c.name}`;
      if (sel === c.id && c.ok) { const box = document.createElement('div'); box.className = 'callbox'; box.innerHTML = `<b>${esc(label)}</b><div class="row"><button class="primary commit">${T('action.call')}</button><button class="cancel">${T('action.cancel')}</button></div>`; box.querySelector('.commit').onclick = () => doCommit(c.id); box.querySelector('.cancel').onclick = () => { sel = null; renderAll(); }; calls.appendChild(box); }
      else calls.appendChild(callBtn(c, Tutorial.allowsCall(arr) && (phase === 'phone' || phase === 'move') && !movedThisRound && phoneCalls < 1, label));
    }
  }

  // ---- the hand: coloured cards -----------------------------------------------

  // ---- the route: one model, a rail on the phone and the board on desktop ------
  const NEED_LABEL = { aircraft: 'need.aircraft_ready', reception: null, permission: 'need.visa' };
  // status is never shown by color alone: screen readers hear the same words the legend uses
  const stateWord = (st) => T(st === 'inhand' ? 'route.legend_inhand' : st === 'promised' ? 'route.legend_promised' : 'route.legend_notyet');
  function needCells(L) {
    // what gates the good exits of this stop, in one of three states
    const out = [], seen = {};
    for (const a of L.approaches) for (const n of a.needs) {
      let key, title, sub, state;
      if (n.arr) { const def = Data.ARRANGEMENTS[n.arr], cur = s.arr[n.arr], job = s.jobs.find(j => j.arr === n.arr); key = n.arr;
        if (seen[key] && seen[key] >= n.stage) continue; if (seen[key]) out.splice(out.findIndex(x => x.key === key), 1);
        title = n.arr === 'reception' ? T(n.stage >= 3 ? 'need.officials' : 'need.expects') : n.arr === 'aircraft' ? T(n.stage >= 4 ? 'need.aircraft_ready' : n.stage >= 2 ? 'need.crew' : 'need.charter') : NEED_LABEL[n.arr] ? T(NEED_LABEL[n.arr]) : def.name;
        seen[key] = n.stage; out.push({ key, title, sub: '', state: '' }); const slot = out[out.length - 1];
        state = cur.stage >= n.stage ? 'inhand' : job ? 'promised' : 'notyet';
        sub = state === 'inhand' ? def.stages[cur.stage][0].toUpperCase() + def.stages[cur.stage].slice(1) : state === 'promised' ? T('need.working', { ally: pname(job.ally), time: short(job.due) }) : (n.arr === 'reception' ? T(n.stage >= 3 ? 'need.velez' : 'need.baca') : n.arr === 'permission' ? T('need.salek', { sponsor: Sim.sponsor(s).short }) : def.what);
        slot.sub = sub; slot.state = state; continue; }
      else if (n.card) { if (n.card === 'decoy' || n.card === 'influence') continue; key = 'card' + n.card; const held = s.hand.find(id => Data.CARDS[id].tag === n.card); state = held ? 'inhand' : 'notyet';
        title = n.card === 'document' ? T('need.passport') : n.card === 'passage' ? T('need.passage') : n.card === 'decoy' ? T('need.decoy') : n.card === 'influence' ? T('need.influence') : T('need.card', { tag: tagName(n.card) });
        sub = held ? T(n.card === 'document' ? 'need.passport_held' : 'need.in_hand') : T(n.card === 'passage' ? 'need.passage_from' : 'need.nobody'); }
      else if (n.night) { if (L.id === 'residence') continue; key = 'night'; title = T('need.night'); state = Sim.isNight(s) ? 'inhand' : 'notyet'; sub = T(Sim.isNight(s) ? 'need.is_night' : 'need.after'); }
      else continue;
      if (seen[key]) continue; seen[key] = true; out.push({ key, title, sub, state });
    }
    return out;
  }
  function whoActs(i) { return Object.keys(Data.PEOPLE).filter(k => Data.PEOPLE[k].where === i).map(k => ({ k, name: pname(k), trust: s.people[k].trust >= 2, turned: s.people[k].turned })); }
  const abroad = () => ['sibling', 'sponsor'].map(k => ({ k, name: pname(k), trust: s.people[k].trust >= 2, turned: s.people[k].turned, role: T(k === 'sibling' ? 'route.role_aircraft' : 'route.role_visa') }));
  function whoMark(k) { const p = s.people[k]; if (!p) return ['unknown', T('who.unknown')]; if (p.cut) return ['cut', T('who.cut')]; if (p.turned) return ['talked', T('who.talked')]; if (p.known) return ['trust', T('who.clean')]; if (p.doubt) return ['doubt', T('who.doubted')]; if (p.trust >= 2) return ['trust', T('who.trusted')]; return ['unknown', T('who.unknown')]; }
  const lastLedger = (k) => { const L = (s.ledger || []).filter(x => x.who === k).slice(-2); return L.length ? `<span class="ledger">${L.map(x => `<span class="h">${short(x.hour)}</span> ${esc(x.text)}`).join('<br>')}</span>` : ''; };
  const whoHtml = (w) => { const [c, t] = whoMark(w.k); return `<span class="whoi">${esc(w.name)} <span class="mk ${c}">${t}</span>${lastLedger(w.k)}</span>`; };
  const inSentence = (n) => /^(Your|Two|A|An|The)\b/.test(n) ? n[0].toLowerCase() + n.slice(1) : n; // card names mid-sentence
  function cardNotes(i) {
    const notes = [];
    for (const id of s.hand) { const c = Data.CARDS[id]; const idx = c.reach.map(r => Data.LEVELS.findIndex(L => L.id === r)); const first = Math.min(...idx), last = Math.max(...idx); if (last === i && last < Data.LEVELS.length - 1) notes.push(`<span class="m">${esc(T('route.stops_here', { card: inSentence(c.name) }))}</span>`); if (first === i && first > s.pos) notes.push(`<span class="s">${esc(T('route.starts_here', { card: inSentence(c.name) }))}</span>`); }
    if (i === 4 && !s.hand.includes('intro_vel')) notes.push(`<span class="s">${esc(T('route.velez_starts'))}</span>`);
    return notes.join(' ');
  }
  function renderRoute() {
    // phone: the rail
    const rail = $('rail'); rail.innerHTML = '';
    Data.LEVELS.forEach((L, i) => {
      const li = document.createElement('li'); li.className = (i === s.pos ? 'current' : i < s.pos ? 'passed' : '') + (i === 4 ? ' border' : '') + (i === 5 ? ' esm' : '');
      const needs = needCells(L).map(n => `<span class="need ${n.state}"><span class="sr">${esc(stateWord(n.state))} </span><b>${esc(n.title)}</b><span>${esc(n.sub)}</span></span>`).join('');
      const w = whoActs(i);
      li.innerHTML = `<span class="line" aria-hidden="true"></span><span class="dot" aria-hidden="true"></span><div class="stop"><div class="nm"><b>${esc(L.short)}</b><span>${i === s.pos ? T('route.you_here') : i === 4 ? T('route.border') : i === 5 ? T('route.esmeralda') : ''}</span></div>${i === s.belief ? `<span class="inq">${T('route.inquiry_here')}</span>` : ''}${w.length ? `<span class="who">${T('route.who_acts', { list: w.map(whoHtml).join(', ') })}</span>` : ''}${needs}</div>`;
      rail.appendChild(li);
    });
    const ab = document.createElement('li'); ab.innerHTML = `<span class="dot" aria-hidden="true" style="visibility:hidden"></span><section id="abroad"><h3>${T('route.abroad_phone')}</h3>${abroad().map(w => `<span class="who">${whoHtml(w)}, ${w.role}</span>`).join('')}</section>`; rail.appendChild(ab);
    // desktop: the board
    const b = $('board'); b.innerHTML = '';
    const cell = (html, cls) => { const d = document.createElement('div'); d.className = 'cell ' + (cls || ''); d.innerHTML = html; b.appendChild(d); };
    const colCls = (i) => i === s.pos ? 'cur' : i === 5 ? 'esm' : '';
    cell('', 'head'); Data.LEVELS.forEach((L, i) => cell(`<b>${esc(L.short)}</b><span>${i === s.pos ? T('route.you_here') : i === 4 ? T('route.border') : i === 5 ? T('route.esmeralda') : ''}</span>`, 'head ' + colCls(i))); cell(`<b>${T('route.abroad')}</b><span>${T('route.by_phone')}</span>`, 'head abr');
    const lbl = (t, cls) => { const d = document.createElement('div'); d.className = 'rowlbl ' + (cls || ''); d.textContent = t; b.appendChild(d); };
    lbl(T('route.who_acts_label')); Data.LEVELS.forEach((L, i) => cell(`<span class="who">${whoActs(i).map(whoHtml).join('')}</span>`, colCls(i))); cell(`<span class="who">${abroad().map(whoHtml).join('')}</span>`, 'abr');
    lbl(T('route.needed')); Data.LEVELS.forEach((L, i) => cell(`<span class="needs">${needCells(L).map(n => `<span class="need ${n.state}"><span class="sr">${esc(stateWord(n.state))} </span><b>${esc(n.title)}</b><span>${esc(n.sub)}</span></span>`).join('')}</span>`, colCls(i))); cell('', 'abr');
    const cr = document.createElement('div'); cr.className = 'cardsrow'; cr.hidden = true; // cards work in the background now
    for (const id of s.hand) { const c = Data.CARDS[id]; const idx = c.reach.map(r => Data.LEVELS.findIndex(L => L.id === r)); const a = Math.min(...idx) + 1, z = Math.max(...idx) + 2; const sp = document.createElement('span'); sp.className = `cbar t-${c.tag} card`; sp.style.gridColumn = `${a} / ${z}`; sp.style.cssText += ';min-height:0;transform:none;box-shadow:none;display:block;padding:8px 12px'; sp.textContent = z === 6 ? T('route.card_stops_line', { card: c.name }) : c.name; cr.appendChild(sp); }
    if (!s.hand.includes('intro_vel')) { const sp = document.createElement('span'); sp.className = 'cbar ghost card t-introduction'; sp.style.gridColumn = '5 / 7'; sp.style.cssText += ';min-height:0;transform:none;display:block;padding:8px 12px'; sp.textContent = T('route.velez_starts_short'); cr.appendChild(sp); }
    b.appendChild(cr);
    lbl(T('route.inquiry'), 'inq'); Data.LEVELS.forEach((L, i) => { if (i === s.belief) cell(`<span class="inq">${T('route.looking_here')}</span>`, colCls(i) + ' inqcell'); });
    const ir = document.createElement('div'); ir.className = 'inqrow'; ir.style.gridColumn = `${Math.min(9, s.belief + 3)} / 9`; ir.textContent = enemyLog.length ? enemyLog[enemyLog.length - 1] : T('route.no_inquiry'); b.appendChild(ir);
  }

  function renderOver() {
    const o = $('over'); if (!s.over) { o.hidden = true; o.style.backgroundImage = ''; return; }
    o.hidden = false; o.className = (gov ? !s.over.win : s.over.win) ? 'win' : 'lose'; // the ministry wins when she does not get out
    if (s.over.win && !gov) { const url = Render.runwayStill(); if (url) o.style.backgroundImage = `url(${url})`; }
    const won = gov ? !s.over.win : s.over.win;
    $('overtitle').textContent = T(won ? 'over.win' : 'over.lose');
    const k = s.over.kind;
    const why = gov ? (s.over.win ? T('over.why_gov_escaped') : ({ clock: T('over.why_gov_time'), deal: T('over.why_gov_deal') })[k] || T('over.why_gov_arrest'))
      : s.over.win ? T('over.why_out') : ({ clock: T('over.why_time'), deal: T('over.why_deal') })[k] || T('over.why_arrest');
    const story = !gov && s.over.story ? `<h3 class="overh">${T('over.what_happened')}</h3><p class="overstory">${esc(s.over.story)}</p>` : '';
    const after = !gov && s.over.after ? `<h3 class="overh">${T('over.afterward')}</h3><p class="overafter">${esc(s.over.after)}</p>` : '';
    $('overtext').innerHTML = `<p class="overwhy">${esc(why)}</p>` + story + after + (gov ? Gov.debrief(gov) : '');
    $('changewho').textContent = T(gov ? 'over.play_her' : 'over.choose');
    $('share').hidden = !(gov || daily); $('share').textContent = T('over.share');
    if (daily && !gov && !dailyResult(daily.key)) { try { localStorage.setItem(DAILY + daily.key, JSON.stringify({ win: s.over.win, line: outcomeLine(s.over), holds: s.holds, round })); } catch (e) { /* storage blocked */ } }
    saveRun();
  }

  // ---- export and replay ------------------------------------------------------------
  // A run is its seed, who played, where they were going and every accepted action, in order.
  function exportRun() {
    const st = gov || s; return { v: 1, game: 'coalition', kind: gov ? 'gov' : 'escape', seed: st.seed, who: gov ? null : s.who, dest: gov ? null : s.dest, extra: gov ? null : (s.picked || []), companion: (gov || s).companion || null, actions: (st.actions || []).slice(), ended: s.over ? (gov ? (s.over.win ? 'escaped' : 'stopped') : s.over.kind) : null };
  }
  const b64u = (str) => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64u = (str) => decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/'))));
  const replayLink = (rec) => `${location.origin}${location.pathname}#replay=${b64u(JSON.stringify(rec))}`;
  function downloadRun() {
    const rec = exportRun(), a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(rec, null, 1)])); a.download = `coalition-run-${rec.kind}-${rec.seed}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  async function copyReplay() {
    const url = replayLink(exportRun());
    try { await navigator.clipboard.writeText(url); $('copyreplay').textContent = T('over.copied'); } catch (e) { prompt(T('over.copy_replay'), url); }
  }
  // Plays a recorded run back through the same screens a player sees. Nothing is saved while it runs.
  let attract = null; // { runs, i, wasMuted } while the title screen plays runs behind itself
  function startReplay(rec, speed, opts) {
    opts = opts || {};
    replaying = { queue: rec.actions.slice(), speed: speed || 900, timer: null, last: 0, cutLevel: opts.cutLevel || 99, onDone: opts.onDone || null };
    if (!opts.attract) { $('title').hidden = true; $('replaybadge').hidden = false; Sfx.setMuted(true); }
    $('start').hidden = true;
    if (rec.kind === 'gov') newGovRun(false, rec.seed, rec.companion); else newRun(rec.who || 'woman', false, false, rec.dest || 'atlanta', rec.seed, rec.extra || [], rec.companion);
    replaying.timer = setInterval(replayTick, 150);
  }
  function stopReplay() { if (!replaying) return; const done = replaying.onDone; clearInterval(replaying.timer); replaying = null; if (done) done(); else document.body.classList.add('replay-done'); }
  function replayTick() {
    const R = replaying; if (!R) return;
    const now = Date.now(); if (now - R.last < R.speed) return;
    if (Render.busy() || !$('interstitial').hidden) return;
    if (s.over || s.pos >= R.cutLevel) { stopReplay(); return; }
    R.last = now;
    if (phase === 'roll') { enterPhase('sosa'); return; } // older saves
    if (phase === 'sosa') { startRound(false); return; }
    if (phase === 'news' && result && result.from === 'news') { result = null; enterPhase(pendingEvent() ? 'news' : 'phone'); return; }
    const next = R.queue.shift(); if (!next) { stopReplay(); return; }
    if (gov) doGov(next[0], next[1]); else doCommit(next[0], next[1]);
  }
  // The title screen: a recorded run plays behind the title, cut before the border so the destination and
  // the ending stay unknown; when it ends another begins. Nothing is saved, nothing sounds.
  function startAttract() {
    if (!ATTRACT_RUNS.length || attract) return;
    attract = { runs: ATTRACT_RUNS.slice().sort(() => Math.random() - 0.5), i: 0, wasMuted: Sfx.isMuted() };
    Sfx.setMuted(true); document.body.classList.add('attract'); $('title').style.backgroundImage = '';
    const next = () => { if (!attract) return; const rec = attract.runs[attract.i++ % attract.runs.length]; startReplay(rec, 700, { attract: true, cutLevel: 4, onDone: () => { if (attract) attract.t = setTimeout(next, 1800); } }); $('title').hidden = false; };
    next();
  }
  function stopAttract() {
    if (!attract) return; clearTimeout(attract.t); const was = attract.wasMuted; attract = null;
    if (replaying) { clearInterval(replaying.timer); replaying = null; }
    document.body.classList.remove('attract'); Sfx.setMuted(was);
  }
  function replayFromHash() {
    const m = /[#&]replay=([^&]+)/.exec(location.hash); if (!m) return false;
    const sp = /[#&]speed=(\d+)/.exec(location.hash);
    try { const rec = JSON.parse(unb64u(m[1])); if (rec && rec.game === 'coalition' && Array.isArray(rec.actions)) { startReplay(rec, sp ? +sp[1] : 900); return true; } } catch (e) { /* not a replay link */ }
    return false;
  }

  // ---- commit and animate --------------------------------------------------------
  function doCommit(id, opt) {
    Sfx.unlock(); const r = Sim.commit(s, id, opt);
    if (!r.ok) { Sfx.deny(); log('sys', r.why, 'sys'); return; }
    Sfx.confirm(); sel = null; animate(r.events);
    if (Tutorial.active()) Render.enqueue({ dur: 10, start() { Tutorial.sync(s); renderAll(); } });
    const sid = String(id), sm = summarize(r.events, T('result.your_move'), null);
    roundSum.theirs.push(...sm.theirs); roundSum.hours += sm.hours;
    if (sid.startsWith('evt:')) { result = summarize(r.events, T('result.your_choice'), null); result.from = 'news'; phase = 'news'; autoNews(); }
    else if (sid.startsWith('call:')) { phoneCalls += 1; phase = 'move'; if (window.innerWidth < 1000) setTab('here'); }
    else if (sid.startsWith('msg:')) { if (window.innerWidth < 1000 && !waitingMsgs()) setTab('here'); } // back to the scene once nobody is waiting
    else { movedThisRound = true; result = sm; if (sid === 'wait' || sid === 'wait_dark') { result.kind = T('result.lay_low'); result.title = T('result.hours_pass', { hours: sm.hours }); result.waited = true; } phase = 'sosa'; if (window.innerWidth < 1000) setTab('here');
      // owner, Nov. 1, 2026: "the screen in the animation should just show time passing ... the cards and tags are doing all the work"
      autoNext(); }
    renderAll(); saveRun();
  }

  // ---- phase turns ------------------------------------------------------------------
  const PH = ['news', 'phone', 'move', 'roll', 'sosa'];
  const mks = (tags) => `<span class="mks">${tags.map(t => `<span class="mk ${t.k}${t.long ? ' long' : ''}">${esc(t.t)}</span>`).join('')}</span>`;
  const PH_LABEL = { news: ['phase.news', 'phase.reports'], phone: ['phase.phone', 'phase.desk'], move: ['phase.move', 'phase.order'], roll: ['phase.roll', 'phase.roll'], sosa: ['phase.sosa', 'phase.her_move'] };
  const pendingEvent = () => gov ? Gov.view(gov).event : Sim.actions(s).event;
  function phoneUseful() {
    // the phone step exists only while the phone is ringing: an unanswered message
    if (answered) return false;
    if (gov) { const v = Gov.view(gov); return v.messages.some(m => m.options.some(o => Tutorial.allowsOption(o.id))); }
    const A = Sim.actions(s);
    return A.messages.some(m => m.options.some(o => o.ok && Tutorial.allowsOption(o.id)));
  }
  // After a move the scene plays out the hours; what you did shows at the top of the screen and the next turn starts.
  // A card appears only for a choice (news, a police stop, a call). The demos keep their cards: the coach teaches with them.
  function autoNext() {
    if (!result || s.over || Tutorial.active() || replaying) return;
    result.auto = true;
    const lines = [result.line].concat(result.mine.filter(t => !t.quiet).map(t => t.t)).filter(Boolean);
    const progress = roundSum.theirs.filter(t => t.long).map(t => t.t); // an ally's step forward, in their words
    if (!lines.length && !progress.length && !roundSum.theirs.length) Render.float(Render.W * Render.SCALE / 2, 160, T('sosa.safe'), '#7FE0B0');
    Render.enqueue({ dur: 10, start() { for (const l of lines.concat(progress)) toast(l); startRound(false); } });
  }
  // after you answer news, what it did shows at the top of the screen and the turn goes on; no card to click past
  function autoNews() {
    if (!result || s.over || Tutorial.active() || replaying) return;
    result.auto = true;
    const lines = [result.line].concat(result.mine.filter(t => !t.quiet).map(t => t.t)).filter(Boolean);
    Render.enqueue({ dur: 10, start() { for (const l of lines) toast(l); result = null; enterPhase(pendingEvent() ? 'news' : 'phone'); renderAll(); } });
  }
  function startRound(first) {
    if (!s || s.over) return;
    if (!first) round += 1;
    phoneCalls = 0; answered = false; movedThisRound = false; result = null; roundSum = { theirs: [], hours: 0 };
    enterPhase(pendingEvent() ? 'news' : 'phone');
    if (!replaying && !gov && !first && s.pos === briefPos) { renderAll(); return; } // same stop: straight back to the choices
    if (replaying) interstitial(short(s.hour), T('round.label', { n: round }), gov ? T('round.searching', { place: Gov.view(gov).suspectName.replace(/^The /, 'the ') }) : s.hold ? T('round.held', { place: Data.LEVELS[s.pos].short, hold: s.hold }) : Data.LEVELS[s.pos].short);
    else showBrief();
  }
  const waitingMsgs = () => gov ? Gov.view(gov).messages.length : Sim.actions(s).messages.length;
  function enterPhase(p) {
    if (p === 'phone' || p === 'roll') p = p === 'phone' ? 'move' : 'sosa';
    phase = p; sel = null;
    if (window.innerWidth < 1000) setTab(p === 'move' && waitingMsgs() ? 'phone' : 'here'); // the phone opens only when someone is waiting for an answer
    if (Sfx.sting) Sfx.sting('phase');
    renderAll();
  }
  // ---- the round briefing: where things stand and what this round is for, before any button ------
  let briefPos = -1; // the stop the last briefing described: a new stop opens with its arrival text
  const P = (t) => `<p>${esc(t)}</p>`;
  function briefEscape() {
    const L = Data.LEVELS[s.pos], out = { story: [], need: [], job: [] };
    if (s.pos !== briefPos) { out.story.push(L.arrive); out.arrived = true; }
    const A = Data.ARRANGEMENTS, st = (k) => s.arr[k].stage;
    const steps = (k, full) => { const done = A[k].stages.slice(1, st(k) + 1), left = A[k].stages.slice(st(k) + 1, full + 1); return [done.length ? T('brief.done_list', { list: done.join(', ') }) : '', left.length ? T('brief.left_list', { list: left.join(', ') }) : ''].filter(Boolean).join(' '); };
    // one line of status each; the steps and what they do open on a tap
    const status = (k, full) => { const cur = st(k), job = s.jobs.find(j => j.arr === k); return cur >= full ? cap(A[k].stages[full]) : job ? T('brief.st_underway', { step: A[k].stages[cur + 1] }) : cur ? cap(A[k].stages[cur]) : T('brief.not_started'); };
    out.need = [
      { k: 'aircraft', full: 4, name: T('brief.need_jet'), note: '' },
      { k: 'permission', full: 2, name: T('brief.need_visa'), note: T('brief.visa_note') },
      { k: 'reception', full: 3, name: T('brief.need_reception'), note: T('brief.reception_note') },
    ].map(n => ({ name: n.name, have: st(n.k), of: n.full, done: st(n.k) >= n.full, status: status(n.k, n.full), now: [steps(n.k, n.full), st(n.k) >= n.full ? '' : n.note].filter(Boolean).join(' ') }));
    out.job.push(L.objective);
    if (out.arrived && s.pos > 0) { out.stats = shortStats(); out.marks = routeMarks(); return out; } // a stop screen: what happened, where you stand, what is next
    const order = s.pos >= 2 && s.pos < 4 ? ['reception', 'aircraft', 'permission'] : ['aircraft', 'permission', 'reception'];
    const calls = Sim.actions(s).calls.filter(c => c.ok);
    const call = order.map(k => calls.find(c => c.arr === k)).find(Boolean);
    if (call) { const label = T('phone.call_about', { name: callee(call.ally), what: ({ aircraft: T('arr.what_aircraft'), reception: T('arr.what_reception'), permission: T('arr.what_permission') })[call.arr] }); out.job.push(T('brief.phone_suggest', { call: label })); }
    out.stats = shortStats(); out.marks = routeMarks();
    return out;
  }
  // owner, Nov. 1, 2026: "does the number really matter at all?" Only two lines change anything: from 7 a search where
  // you are ends in a stop, and at 10 they stop you anyway. So the player sees a level, never the number.
  const attnLevel = (x) => x >= 7 ? 'high' : x >= 4 ? 'rising' : 'low';
  const attnWord = (x) => ({ low: T('attn.low'), rising: T('attn.rising'), high: T('attn.high') })[attnLevel(x)];
  // the numbers alone; what they mean is in Help and opens from the top bar
  const shortStats = () => [
    { big: `${Math.max(0, Sim.HOURS_TOTAL - s.hour)}h`, text: T('brief.time_left') },
    { big: attnWord(s.exposure), text: T('brief.attention_short'), cls: 'lvl-' + attnLevel(s.exposure) },
  ];
  function routeMarks() {
    const m = { 5: [['jet', T('brief.jet')]] };
    m[s.belief] = [['sosa', T('brief.sosa')]];
    m[s.pos] = [['you', T('brief.you')]].concat(s.belief === s.pos ? [['sosa', T('brief.sosa')]] : []);
    if (s.pos === 5) m[5] = m[5].concat([['jet', T('brief.jet')]]);
    return m;
  }
  function briefGov() {
    const v = Gov.view(gov), c = gov.c, out = { story: [], need: [], job: [] };
    const r = v.reports[0];
    out.story.push(r ? (c.hour - r.hour <= 0 ? T('brief.gov_report_now', { place: placeName(r.at) }) : c.hour - r.hour === 1 ? T('brief.gov_report_hour', { place: placeName(r.at) }) : T('brief.gov_report_hours', { place: placeName(r.at), n: c.hour - r.hour })) : T('brief.gov_no_report'));
    if (r) out.story.push(T('brief.gov_reports_caveat'));
    const ban = v.requests[0].state, hold = v.requests[1].state;
    out.need = [{ name: T('brief.gov_need_ban'), have: ban !== 'notyet' ? 1 : 0, of: 1, done: ban !== 'notyet', now: ban === 'promised' ? T('brief.gov_not_confirmed') : '' },
      { name: T('brief.gov_need_hold'), have: hold === 'inhand' ? 2 : hold === 'promised' ? 1 : 0, of: 2, done: hold === 'inhand', now: hold === 'promised' ? T('brief.gov_asked') : '' }];
    out.job.push(ban === 'notyet' ? T('brief.gov_job_ban') : hold === 'notyet' ? T('brief.gov_job_hold') : T('brief.gov_job_search', { place: placeName(r ? r.at : gov.belief) }));
    out.stats = [{ big: String(Math.max(0, Sim.HOURS_TOTAL - c.hour)), text: T('brief.hours_gov') }];
    if (v.ministerBy !== null && v.ministerBy !== undefined && v.ministerBy >= c.hour) out.stats.push({ big: short(v.ministerBy), text: T('brief.minister_expects', { time: Sim.clockText(v.ministerBy) }) });
    out.marks = { [gov.belief]: [['you', T('brief.gov_search')]] };
    if (r) out.marks[r.at] = (out.marks[r.at] || []).concat([['seen', T('brief.gov_last_seen')]]);
    return out;
  }
  const cap = (t) => t ? t[0].toUpperCase() + t.slice(1) : t;
  const placeName = (i) => i === 0 ? T('brief.the_residence') : i === 4 ? T('brief.the_line') : Data.LEVELS[i].short;
  // A small map of the route (owner, Nov. 1, 2026: "it would be so much better if it had a little map ... instead of a
  // line"): Valdória and Costamar, the border as a dashed line, the stops where they sit, the road you have travelled
  // solid and the road ahead dashed. Wide in the scene and on a desktop stop screen; tall on a phone.
  const MAPXY = { wide: [[54, 58], [150, 104], [246, 56], [342, 106], [444, 60], [548, 106]], tall: [[44, 34], [150, 86], [60, 140], [168, 192], [96, 250], [196, 304]] };
  function routeMap(marks, tall, upto) {
    const P = MAPXY[tall ? 'tall' : 'wide'], n = Data.LEVELS.length;
    let h = tall
      ? '<rect class="land" x="4" y="4" width="312" height="244" rx="18"/><rect class="land far" x="4" y="252" width="312" height="84" rx="18"/><line class="border" x1="4" y1="250" x2="316" y2="250"/>'
      : '<rect class="land" x="4" y="4" width="438" height="152" rx="18"/><rect class="land far" x="446" y="4" width="190" height="152" rx="18"/><line class="border" x1="444" y1="4" x2="444" y2="156"/>';
    for (let i = 0; i < n - 1; i++) h += `<line class="leg${i < upto ? ' went' : ''}" x1="${P[i][0]}" y1="${P[i][1]}" x2="${P[i + 1][0]}" y2="${P[i + 1][1]}"/>`;
    const said = [];
    Data.LEVELS.forEach((L, i) => {
      const [x, y] = P[i], m = marks[i] || [], here = m.some(k => k[0] === 'you');
      h += `<circle class="stopdot${here ? ' here' : ''}${i === n - 1 ? ' end' : ''}${i < upto ? ' went' : ''}" cx="${x}" cy="${y}" r="${here ? 9 : 7}"/>`;
      h += tall ? `<text class="nm${here ? ' here' : ''}" x="${x + 16}" y="${y + 5}">${esc(L.short)}</text>` : `<text class="nm${here ? ' here' : ''}" x="${x}" y="${y + 30}" text-anchor="middle">${esc(L.short)}</text>`;
      m.forEach((k, j) => {
        const w = Math.round(k[1].length * 7.6 + 18), px = tall ? x + 16 + j * (w + 6) : x - w / 2, py = tall ? y + 12 : y - 34 - j * 26;
        h += `<rect class="pill ${k[0]}" x="${px}" y="${py}" width="${w}" height="22" rx="11"/><text class="pt" x="${px + w / 2}" y="${py + 16}" text-anchor="middle">${esc(k[1])}</text>`;
        said.push(`${L.short}: ${k[1]}`);
      });
    });
    const label = Data.LEVELS.map(L => L.short).join(', ') + (said.length ? '. ' + said.join('. ') : '');
    return `<svg viewBox="${tall ? '0 0 320 340' : '0 0 640 160'}" role="img" aria-label="${esc(label)}">${h}</svg>`;
  }
  function briefRoute(marks) {
    return Data.LEVELS.map((L, i) => { const m = marks[i] || [], above = m.filter(x => x[0] === 'you'), below = m.filter(x => x[0] !== 'you');
      const pill = (x) => `<span class="bpill ${x[0]}">${esc(x[1])}</span>`;
      return `<li class="${m.some(x => x[0] === 'you') ? 'here' : ''}${i === Data.LEVELS.length - 1 ? ' end' : ''}"><span class="above">${above.map(pill).join('')}</span><i class="dot"></i><span class="stop">${esc(L.short)}</span><span class="below">${below.map(pill).join('')}</span></li>`; }).join('');
  }
  function showBrief() {
    if (!s || s.over) return;
    if (Tutorial.active()) return; // the demo teaches by playing: the coach card guides each step instead of a briefing to read first
    const b = gov ? briefGov() : briefEscape();
    if (!gov) briefPos = s.pos;
    const milestone = !gov && s.pos > 0 && b.arrived;
    $('b-clock').textContent = short(s.hour); $('b-round').textContent = gov ? T('round.label', { n: round }) : T('brief.stop_of', { n: s.pos + 1, total: Data.LEVELS.length });
    $('b-title').textContent = gov ? T('brief.gov_title') : milestone ? T('brief.made_it', { place: Data.LEVELS[s.pos].short }) : Data.LEVELS[s.pos].short;
    $('b-jobh').textContent = T(gov ? 'brief.h_round' : 'brief.h_next'); $('b-win').hidden = milestone; // a stop screen is a moment, not a checklist
    document.body.classList.toggle('stopscreen', milestone);
    $('b-story').innerHTML = b.story.map(P).join(''); $('b-story').hidden = !b.story.length;
    $('b-route').innerHTML = routeMap(b.marks, window.innerWidth < 640, gov ? 0 : s.pos);
    $('b-stats').innerHTML = b.stats.map(st => `<div><b${st.cls ? ` class="${st.cls}"` : ''}>${esc(st.big)}</b><p>${esc(st.text)}${st.bar ? `<span class="segs">${Array.from({ length: st.bar[1] }, (_, k) => `<i class="${k < st.bar[0] ? 'on' : ''}"></i>`).join('')}</span>` : ''}</p></div>`).join('');
    $('b-job').innerHTML = b.job.map(P).join('');
    $('b-needlead').textContent = gov ? T('brief.gov_win') : T('brief.escape_win');
    if (!gov) $('b-need').innerHTML = b.need.map(n => `<li class="${n.done ? 'done' : 'todo'} st"><details><summary><b>${esc(n.name)}</b><span>${esc(n.status)}</span></summary>${n.now ? `<p>${esc(n.now)}</p>` : ''}</details></li>`).join('');
    else $('b-need').innerHTML = b.need.map(n => `<li class="${n.done ? 'done' : 'todo'}"><span class="tick" aria-hidden="true">${n.done ? '✓' : ''}</span><span class="nm"><b>${esc(n.name)}</b>${n.now ? `<span>${esc(n.now)}</span>` : ''}</span><span class="pips" aria-hidden="true">${Array.from({ length: n.of }, (_, k) => `<i class="${k < n.have ? 'on' : ''}"></i>`).join('')}</span></li>`).join('');
    $('b-start').textContent = gov ? T('brief.start', { n: round }) : round <= 1 && s.pos === 0 ? T('brief.begin') : T(b.arrived ? 'brief.go_on' : 'brief.back');
    $('brief').hidden = false; $('brief').scrollTop = 0; $('b-start').focus({ preventScroll: true });
  }
  // cards work in the background: no collection to manage, a short notice when help arrives, leaves or changes a roll (owner, Oct. 31, 2026)
  function toast(main, sub) {
    const el = $('toast'); toast.q = toast.q || []; toast.q.push([main, sub]);
    if (!el.hidden) return;
    const next = () => { const it = toast.q.shift(); if (!it) { el.hidden = true; return; } $('t-main').textContent = sibNamed(it[0]); $('t-sub').textContent = it[1]; $('t-sub').hidden = !it[1]; el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); toast.t = setTimeout(next, 3200); };
    el.onclick = () => { clearTimeout(toast.t); next(); };
    next();
  }
  // reaching a stop is its own moment: which stop of how many, the route so far, and what this stop asks of you; it leaves on its own
  function stopScreen(pos) {
    const L = Data.LEVELS[pos], el = $('stopscreen');
    $('s-clock').textContent = short(s.hour);
    $('s-step').textContent = T('stop.step', { n: pos + 1, total: Data.LEVELS.length });
    $('s-title').textContent = L.name;
    $('s-dots').innerHTML = Data.LEVELS.map((x, i) => `<li class="${i < pos ? 'past' : i === pos ? 'now' : ''}"><i></i><span>${esc(x.short)}</span></li>`).join('');
    $('s-goal').textContent = L.objective || '';
    el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
    clearTimeout(stopScreen.t); stopScreen.t = setTimeout(() => { el.hidden = true; }, 3400);
    el.onclick = () => { el.hidden = true; };
  }
  function interstitial(clock, title, sub) {
    const el = $('interstitial'); $('i-clock').textContent = clock; $('i-title').textContent = title; $('i-sub').textContent = sub;
    el.hidden = false; clearTimeout(interstitial.t); interstitial.t = setTimeout(() => { el.hidden = true; }, 1300);
    el.onclick = () => { el.hidden = true; };
  }
  function renderPhase() {
    const on = !!s && !s.over && $('start').hidden;
    $('phasebar').hidden = !on; document.body.classList.toggle('phased', on);
    if (!on) { $('phasecard').hidden = true; $('herehead').hidden = false; $('approaches').hidden = false; $('lvlhead2').hidden = false; $('phasedone').hidden = true; return; }
    if (!Render.busy()) {
      if (phase === 'phone') phase = 'move';
      if ((phase === 'phone' || phase === 'move') && pendingEvent() && !movedThisRound) phase = 'news';
    }
    $('round').textContent = T('round.label', { n: round });
    const idx = PH.indexOf(phase);
    document.querySelectorAll('#phases li').forEach((li, i) => { li.className = i < idx ? 'done' : i === idx ? 'now' : ''; li.textContent = T(PH_LABEL[PH[i]][gov ? 1 : 0]); });
    $('phasedone').textContent = T(gov ? 'phase.done_desk' : 'phase.done_phone');
    $('phasehint').textContent = ''; $('phasehint').hidden = true;
    requestAnimationFrame(() => document.body.style.setProperty('--phaseh', $('phasebar').offsetHeight + 'px'));
    document.body.classList.toggle('ringing', phase === 'phone');
    $('phasedone').hidden = true; // one call or one answer ends the phone step; nobody has to hang up
    const card = $('phasecard'), showCard = (phase === 'news' && !(result && result.auto)) || phase === 'roll' || (phase === 'sosa' && !(result && result.auto));
    const was = card.dataset.ph; card.dataset.ph = phase;
    card.hidden = !showCard; $('herehead').hidden = showCard; $('approaches').hidden = showCard; $('lvlhead2').hidden = showCard;
    if (was !== phase) { $('tab-here').scrollTop = 0; $('tab-phone').scrollTop = 0; }
    if (phase === 'news') newsCard(card); else if (phase === 'roll') resultCard(card, result, null, null); else if (phase === 'sosa') sosaCard(card);
    renderRecap();
  }
  function renderRecap() {
    const el = $('recap'); if (!el) return;
    const parts = [];
    if (recap) { const tmp = document.createElement('div'); if (recap.result) { resultCard(tmp, recap.result, null, null); parts.push(tmp.innerHTML); }
      const t2 = document.createElement('div'); const keep = roundSum; roundSum = recap.sum; sosaCard(t2, true); roundSum = keep; parts.push(t2.innerHTML); }
    if (newsRecap) { const t3 = document.createElement('div'); resultCard(t3, newsRecap, null, null); parts.push(t3.innerHTML); }
    el.hidden = !parts.length || !s || !!s.over;
    el.innerHTML = parts.length ? `<details open><summary>${T('recap.title')}</summary><div class="recapbody">${parts.join('')}</div></details>` : '';
  }
  const KIND = { event: 'card.kind_news', rumor: 'card.kind_rumor', hold: 'card.kind_hold' };
  function newsCard(card) {
    if (result && result.from === 'news') { resultCard(card, result, T('action.continue'), () => { result = null; enterPhase(pendingEvent() ? 'news' : 'phone'); }); return; }
    const v = gov ? Gov.view(gov).event : Sim.eventView(s); if (!v) { card.className = ''; card.innerHTML = ''; return; }
    card.className = v.kind;
    card.innerHTML = `<span class="kind">${T(KIND[v.kind])}${v.kind === 'hold' ? ' · ' + T('card.rung', { rung: Sim.num(v.rung) }) : ''}</span><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p>`;
    for (const c of v.choices) { if (!c.ok) continue; const b = document.createElement('button'); b.className = 'choice'; b.disabled = !c.ok || !!s.over || (Tutorial.active() && !Tutorial.allowsOption(c.id)); b.innerHTML = `<b>${esc(c.label)}</b>`; b.onclick = () => gov ? doGov('evt:' + c.id) : doCommit('evt:' + c.id); card.appendChild(b); }
  }
  // owner, Nov. 1, 2026 ("Ask Theo to walk you through" then "Theo walks you through" is redundant): when the move
  // has its own line, that line is the result. The move's name, the outcome word and the gains it already
  // describes are left out; police attention and anything you lose still show.
  const ownResult = (r, out) => r.line ? `<p class="said">${esc(r.line)}</p>${mks(r.mine.filter(t => !t.quiet))}` : `${r.title ? `<h3>${esc(r.title)}</h3>` : ''}${out}${r.mine.length ? mks(r.mine) : ''}`;
  function resultCard(card, r, nextLabel, next) {
    if (!r) { card.innerHTML = ''; return; }
    card.className = 'roll';
    const out = r.roll && r.roll.auto ? `<span class="outcome ok">${T('result.done')}</span>` : r.roll && r.roll.bought ? `<span class="outcome no">${T('result.bought')}</span>` : r.roll ? `<span class="outcome ${r.roll.won ? 'ok' : 'no'}">${T(r.roll.won ? 'result.success' : 'result.failed')}</span>` : `<span class="outcome ok">${T('result.done')}</span>`;
    const rows = r.from === 'news' && r.theirs.length ? `<ul class="rows">${r.theirs.map(t => `<li class="${t.k}"><i></i><span>${esc(t.t)}</span></li>`).join('')}</ul>` : '';
    card.innerHTML = `<span class="kind">${esc(r.kind)}</span>${ownResult(r, out)}${rows}`;
    if (next) { const b = document.createElement('button'); b.className = 'primary next'; b.textContent = nextLabel; b.onclick = () => { Sfx.click(); next(); }; card.appendChild(b); }
  }
  function sosaCard(card, quiet2) {
    card.className = 'sosa';
    // what happened, in short lines: your move, then what changed while it took its hours. The full sentences are in the log.
    const r = result, out = !r || r.waited ? '' : r.roll && r.roll.auto ? `<span class="outcome ok">${T('result.no_roll')}</span>` : r.roll && r.roll.bought ? `<span class="outcome no">${T('result.bought')}</span>` : r.roll ? `<span class="outcome ${r.roll.won ? 'ok' : 'no'}">${T(r.roll.won ? 'result.success' : 'result.failed')}</span>` : '';
    const head = r && r.waited ? `<h3>${esc(r.title)}</h3>` : r ? `<div class="automove">${ownResult(r, out)}</div><span class="kind">${T(gov ? 'sosa.kind_gov' : 'sosa.kind')}</span>` : `<h3>${esc(cap(T(roundSum.hours === 1 ? 'sosa.title_one' : 'sosa.title', { hours: Sim.num(roundSum.hours), time: short(s.hour) })))}</h3>`;
    const quiet = T(gov ? 'sosa.quiet_gov' : 'sosa.quiet');
    let exp = 0; const list = roundSum.theirs.filter(t => { if (t.exp) { exp += t.exp; return false; } return true; });
    if (exp && gov) list.unshift({ k: 'news', t: T('sum.exposure_round', { n: Math.abs(exp) }) });
    const rows = list.length ? list.map(t => `<li class="${t.k}"><i></i><span>${esc(t.t)}</span></li>`).join('') : `<li class="${gov ? 'news' : 'gain'}"><i></i><span>${quiet}</span></li>`;
    card.innerHTML = head + `<ul class="rows">${rows}</ul>`;
    const b = document.createElement('button'); b.className = 'primary next'; b.textContent = T('action.next_round'); b.onclick = () => { Sfx.click(); startRound(false); }; card.appendChild(b);
  }
  // one short line per thing Sosā did; the full sentence stays in the log
  function enemyShort(e) {
    const where = (i) => i <= 0 ? T('brief.the_residence') : i === 4 ? T('brief.the_line') : Data.LEVELS[i].short;
    const id = ['enemy', 'short', e.id].join('.') + (e.hit ? '_hit' : '') + (e.talked ? '_talked' : '');
    if (e.id === 'press_ally' && !e.who) return e.text; // nobody to question: the full line is short already
    return Content.has(id) ? T(id, { place: where(e.belief), name: e.who ? pname(e.who) : pname('sibling') }) : e.text;
  }
  function summarize(events, kind, title) {
    const r = { kind, title, roll: null, line: '', mine: [], theirs: [], hours: 0 }; let after = false, expMine = 0, expTheirs = 0;
    for (const e of events) {
      if (e.type === 'hour') { after = true; r.hours += 1; continue; }
      if (e.type === 'passed') { after = true; r.hours += e.hours; continue; }
      const bucket = after ? r.theirs : r.mine;
      switch (e.type) {
        case 'attempt': r.title = e.name; break;
        case 'chose': r.title = r.title || e.label; break;
        case 'roll': // owner, Nov. 1, 2026: nothing announces how the roll went, only what happened
          if (e.who && !e.pressed) r.theirs.push({ k: e.won ? 'gain' : 'enemy', t: T('sum.person', { person: Sim.shortName(gov ? gov.c : s, e.who), what: T(e.pressed ? (e.won ? 'sum.held_firm' : 'sum.talked') : (e.won ? 'sum.delivered' : 'sum.not_yet')) }) }); else if (!r.roll && !after) r.roll = e; break;
        case 'say':
          if (!after && !r.line && (e.who === 'narrator' || e.featured)) r.line = e.who === 'narrator' ? e.text : `${pname(e.who)}: ${e.text}`;
          break;
        case 'exposure': if (after) expTheirs += e.delta; else expMine += e.delta; break;
        case 'card': bucket.push({ k: 'gain', quiet: !after, t: T('sum.card', { name: inSentence(e.name) }) }); break;
        case 'cardlost': bucket.push({ k: 'lose', t: T('sum.lost', { name: inSentence(e.name) }) }); break;
        case 'trust': if (!gov && e.delta) bucket.push({ k: e.delta > 0 ? 'gain' : 'lose', quiet: !after && e.delta > 0, t: T(e.delta > 0 ? 'sum.trust_more' : 'sum.trust_less', { person: Sim.shortName(gov ? gov.c : s, e.who) }) }); break;
        case 'belief': break; // owner, Nov. 1, 2026: the police box and the map show where they search; the card does not repeat it
        case 'travel': r.mine.push({ k: 'gain', quiet: true, t: T('sum.reached', { place: Data.LEVELS[e.to].short }) }); break;
        case 'betrayal': r.mine.push({ k: 'risk', t: T('sum.sold', { person: Sim.shortName(gov ? gov.c : s, e.who) }) }); break;
        case 'stage': bucket.push({ k: 'gain', long: !!e.line, t: e.line ? (e.who === 'narrator' ? e.line : T('sum.stage_said', { who: Sim.shortName(s, e.who), line: e.line })) : e.label[0].toUpperCase() + e.label.slice(1) }); break;
        case 'enemy': r.theirs.push({ k: 'enemy', t: gov ? e.text : enemyShort(e) }); break;
        case 'hold': r.theirs.push({ k: 'enemy', t: T('sum.hold', { title: e.title }) }); break;
        case 'dispatch': r.theirs.push({ k: 'news', t: e.id === 'rumor' ? T('sum.news_rumor', { name: e.title }) : T('sum.news', { title: e.title }) }); break;
        case 'message': r.theirs.push({ k: 'news', t: T('sum.message', { name: pname(e.from) }) }); break;
        case 'report': bucket.push({ k: e.from === 'enemy' ? 'enemy' : 'news', long: true, t: T('sum.report', { text: e.text.replace(/ \(.*\)$/, ''), source: pname(e.from) }) }); break; // a sentence with its source, never "Source: text"
        case 'order': r.title = r.title || e.name; break;
        default: break;
      }
    }
    if (expTheirs) r.theirs.unshift({ k: expTheirs > 0 ? 'enemy' : 'gain', exp: expTheirs, t: T(expTheirs > 0 ? 'sum.attention_up' : 'sum.attention_down') });
    return r;
  }

  // ---- the daily run -----------------------------------------------------------------
  function dailyInfo() {
    const d = new Date(), key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let h = 2166136261; for (const c of 'coalition' + key) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    const dayNum = Math.floor(new Date(key + 'T12:00:00').getTime() / 86400000);
    return { key, seed: h >>> 0, who: (h >>> 0) % 2 ? 'man' : 'woman', label: `${AP_MONTHS[d.getMonth()]} ${d.getDate()}` };
  }
  const AP_MONTHS = T('daily.months').split('|'); // AP abbreviations, from the catalog
  const apTime = (h) => T('daily.at', { when: Sim.clockText(h) });
  const DAILY = 'coalition.daily.';
  function dailyResult(key) { try { return JSON.parse(localStorage.getItem(DAILY + key) || 'null'); } catch (e) { return null; } }
  function outcomeLine(o) { return o.win ? T('daily.out', { hours: s.hour, round }) : o.kind === 'clock' ? T('daily.clock', { round }) : o.kind === 'deal' ? T('daily.deal', { round }) : T('daily.arrest', { round }); }
  function shareText() { if (gov) { const r = Gov.shareGrid(gov); return T('gov.share', { result: r.result, grid: r.grid, on: r.on, total: r.total, url: location.href.split('#')[0] }); } return T('daily.share', { date: daily.label, line: outcomeLine(s.over), url: location.href.split('#')[0] }); }
  function animate(events) {
    for (const e of events) {
      switch (e.type) {
        case 'say': Render.enqueue({ dur: 10, start() { log(e.who, e.text); } }); break;
        case 'attempt': Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.try', { name: inSentence(e.name) })), 'sys'); } }); break;
        // owner, Nov. 1, 2026: the die rolls on screen and nothing announces the number
        case 'roll': if (!e.who && e.auto) { Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.no_roll')), 'roll'); } }); }
                     else if (!e.who) { Render.dice(e.die, null, e.won && !e.bought); Render.enqueue({ dur: 10, start() { Sfx.dice(); log('sys', esc(T(e.bought ? 'log.bought' : e.won ? 'log.success' : 'log.failed')), 'roll'); } }); }
                     else Render.enqueue({ dur: 10, start() { log('sys', esc(T(e.pressed ? (e.won ? 'log.pressed_holds' : 'log.pressed_breaks') : (e.won ? 'log.ally_delivers' : 'log.ally_not_yet'), { name: pname(e.who) })), 'roll'); } }); break;
        // her number stays hidden on the government side
        case 'exposure': if (!gov) Render.float(Render.W * Render.SCALE / 2, 160, T(e.delta > 0 ? 'float.attention_up' : 'float.attention_down'), e.delta > 0 ? '#FF7A90' : '#7FB2E5'); Render.enqueue({ dur: 10, start() { Sfx.heat(e.delta > 0); } }); break;
        case 'belief': Render.enqueue({ dur: 300, start() { Sfx.click(); } }); break;
        // the card notice is a sentence, never a label and value
        case 'card': Render.enqueue({ dur: 10, start() { Sfx.arranged(); const t = T('log.gives', { name: pname(e.from), card: e.name }); const w = (Data.CARDS[e.id] || {}).works; if (!(phase === 'sosa' || (phase === 'news' && result))) toast(t, w ? T('card.counts_for', { what: /^(Any|At|Boarding|Getting|Reaching|The)\b/.test(w) ? w[0].toLowerCase() + w.slice(1) : w }) : ''); log('sys', esc(t), 'sys'); } }); break;
        case 'cardlost': Render.enqueue({ dur: 10, start() { const t = T('log.card_lost', { card: inSentence(e.name) }); if (!(phase === 'sosa' || (phase === 'news' && result))) toast(t, ''); log('sys', esc(t), 'sys'); } }); break;
        case 'commit': Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.owe', { name: pname(e.to), text: e.text })), 'sys'); } }); break;
        case 'stage': Render.enqueue({ dur: 10, start() { Sfx.arranged(); } }); break;
        case 'job': Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.reply_by', { name: pname(e.ally), time: e.dueText })), 'sys'); } }); break;
        case 'message': Render.ring(); Render.enqueue({ dur: 10, start() { Sfx.ring(); log('sys', esc(T('log.message', { name: pname(e.from) })), 'sys'); } }); break;
        case 'answered': Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.answer', { label: e.label })), 'sys'); } }); break;
        case 'enemy': Render.enemy(); Render.enqueue({ dur: 10, start() { Sfx.patrol(); enemyLog.push(e.text); log('enemy', e.text, 'enemy'); } }); break;
        case 'report': Render.ring(); Render.enqueue({ dur: 10, start() { Sfx.ring(); log(e.from, e.text); } }); break;
        case 'order': Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.order', { name: e.name })), 'sys'); } }); break;
        case 'travel': Render.travel(); Render.enqueue({ dur: 10, start() { Sfx.step(0); } }); break;
        case 'dispatch': Render.enqueue({ dur: 10, start() { if (Sfx.sting) Sfx.sting('event'); log('sys', esc(e.id === 'rumor' ? T('log.news_rumor', { name: e.title }) : T('log.news', { title: e.title })), 'sys'); } }); break;
        case 'hold': { const kind = e.rung === 1 ? 'questioned' : e.rung === 2 ? 'held' : 'arrest'; if (Render.detain) Render.detain(kind); else Render.enemy(); Render.enqueue({ dur: 10, start() { if (Sfx.sting) Sfx.sting(kind); log('enemy', `${e.title}. ${e.text}`, 'enemy'); } }); break; }
        case 'chose': Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.chose', { label: e.label })), 'sys'); } }); break;
        case 'betrayal': Render.enemy(); break;
        case 'over': if (e.win && !gov) Render.enqueue({ dur: 1600, start() { Sfx.jet(); } }); Render.gameOver(gov ? { win: !e.win } : e); Render.enqueue({ dur: 10, start() { (gov ? !e.win : e.win) ? Sfx.win() : Sfx.lose(); } }); break;
        default: break;
      }
    }
    Render.enqueue({ dur: 10, start() { renderAll(); } });
  }

  // ---- the government side -----------------------------------------------------------
  function renderGovHere() {
    const box = $('approaches'); box.innerHTML = '';
    const v = Gov.view(gov);
    for (const a of v.orders) { if (!a.ok) continue; if (sel === a.id) box.appendChild(expanded(a, T('action.send_order'), () => doGov(a.id))); else box.appendChild(approachBtn(a, phase === 'move' && Tutorial.allowsApproach(a.id))); }
    const rep = document.createElement('div'); rep.className = 'reports'; rep.innerHTML = `<h2>${T('nav.reports')}</h2>` + (v.reports.length ? v.reports.map(r => `<article class="report"><div class="src"><span>${esc(r.source)}</span><span>${r.age === 'just now' ? T('report.just_now') : T('report.ago', { age: `<span class="mono">${r.age}</span>` })}</span></div><p>${esc(r.text)}</p><div class="pv"><span><b>${T('report.proves')}</b><span>${esc(r.proves)}</span></span><span><b>${T('report.not_prove')}</b><span>${esc(r.doesnt)}</span></span></div></article>`).join('') : `<p class="hint">${T('report.empty')}</p>`);
    box.appendChild(rep);
    $('wait').disabled = !!s.over || phase !== 'move' || !Tutorial.allowsWait(); $('waitdark').hidden = true;
  }
  function renderGovPhone() {
    const v = Gov.view(gov); const inbox = $('inbox'); inbox.innerHTML = '';
    $('waiting').textContent = v.messages.length ? T('phone.waiting', { n: Sim.num(v.messages.length) }) : ''; const badge = $('tab-badge'); badge.hidden = !v.messages.length; badge.textContent = v.messages.length;
    if (!v.messages.length) inbox.innerHTML = `<p class="hint">${T('desk.empty')}</p>`;
    for (const m of v.messages) inbox.appendChild(thread(m.from, m.role, m.text, m.options.map(o => Object.assign({}, o, { go: () => doGov(m.id, o.id) })), (o) => (phase === 'phone' || phase === 'move') && Tutorial.allowsOption(o.id)));
    const calls = $('calls'); calls.innerHTML = '';
    for (const c of v.calls) { if (!c.ok) continue; if (sel === c.id) { const bx = document.createElement('div'); bx.className = 'callbox'; bx.innerHTML = `<b>${esc(c.name)}</b><div class="row"><button class="primary commit">${T('action.send')}</button><button class="cancel">${T('action.cancel')}</button></div>`; bx.querySelector('.commit').onclick = () => doGov(c.id); bx.querySelector('.cancel').onclick = () => { sel = null; renderAll(); }; calls.appendChild(bx); } else calls.appendChild(callBtn(c, (phase === 'phone' || phase === 'move') && !movedThisRound && phoneCalls < 1 && Tutorial.allowsCall(c.id), c.name)); }
  }
  function renderGovRoute() {
    const v = Gov.view(gov); const rail = $('rail'); rail.innerHTML = ''; $('board').innerHTML = '';
    Data.LEVELS.forEach((L, i) => {
      const li = document.createElement('li'); li.className = (i === gov.belief ? 'current' : '') + (i === 4 ? ' border' : '') + (i === 5 ? ' esm' : '');
      const reps = v.reports.filter(r => r.at === i).map(r => `<span class="need notyet"><b>${esc(T('route.report_src', { source: r.source, age: r.age === 'just now' ? T('report.just_now') : T('report.ago', { age: r.age }) }))}</b><span>${esc(r.text)} ${esc(r.doesnt ? T('route.does_not_prove', { what: r.doesnt.charAt(0).toLowerCase() + r.doesnt.slice(1) }) : '')}</span></span>`).join('');
      const reqs = v.requests.filter(r => r.at === i).map(r => `<span class="need ${r.state}"><span class="sr">${esc(stateWord(r.state))} </span><b>${esc(r.title)}</b><span>${esc(r.sub)}</span></span>`).join('');
      li.innerHTML = `<span class="line" aria-hidden="true"></span><span class="dot" aria-hidden="true"></span><div class="stop"><div class="nm"><b>${esc(L.short)}</b><span>${i === gov.belief ? T('route.may_be_here') : i === 4 ? T('route.border') : i === 5 ? T('route.esmeralda') : ''}</span></div><span class="who">${esc(v.people[i])}</span>${i === 5 ? `<span class="need notyet"><b>${T('route.no_command')}</b><span>${T('route.ask_esm')}</span></span>` : ''}${reqs}${reps}</div>`;
      rail.appendChild(li);
    });
    const ab = document.createElement('li'); ab.innerHTML = `<span class="dot" aria-hidden="true" style="visibility:hidden"></span><section id="abroad"><h3>${T('route.cards_count')}</h3>${gov.hand.map(id => `<span class="who">${esc(Data.GOV_CARDS[id].name)}: ${esc(Data.GOV_CARDS[id].works)}</span>`).join('')}<span class="who s">${T('route.esm_intro')}</span></section>`; rail.appendChild(ab);
    $('board').appendChild(rail.cloneNode(true)); $('board').style.display = ''; $('board').className = 'govboard';
  }
  function doGov(id, opt) {
    Sfx.unlock(); const r = Gov.commit(gov, id, opt);
    if (!r.ok) { Sfx.deny(); log('sys', r.why, 'sys'); return; }
    Sfx.confirm(); sel = null; animate(r.events);
    if (Tutorial.active()) Render.enqueue({ dur: 10, start() { Tutorial.sync(gov); renderAll(); } });
    const sid = String(id), sm = summarize(r.events, T('result.your_order'), null);
    roundSum.theirs.push(...sm.theirs); roundSum.hours += sm.hours;
    if (sid.startsWith('evt:')) { result = summarize(r.events, T('result.your_choice'), null); result.from = 'news'; phase = 'news'; autoNews(); }
    else if (sid.startsWith('req:')) { phoneCalls += 1; phase = 'move'; if (window.innerWidth < 1000) setTab('here'); } // one request ends the desk step, as one call ends the phone step
    else if (sid.startsWith('msg:')) { if (window.innerWidth < 1000 && !waitingMsgs()) setTab('here'); }
    else { movedThisRound = true; result = sm; if (sid === 'wait') { result.kind = T('result.waited'); result.title = T('result.waited_title'); result.waited = true; } phase = 'sosa'; if (window.innerWidth < 1000) setTab('here'); autoNext(); }
    renderAll(); saveRun();
  }

  // ---- start, title, boot --------------------------------------------------------------
  function showStart() {
    const first = !seen(), saved = savedRun();
    $('continue').hidden = !saved; if (saved) $('continue').textContent = T('start.continue');
    $('start-tutorial').className = first ? 'primary' : 'pill ghost';
    const url = Render.runwayStill(); if (url) { $('start-art').style.backgroundImage = `url(${url})`; $('start').style.setProperty('--runway', `url(${url})`); }
    const D = dailyInfo(), done = dailyResult(D.key);
    $('daily-date').textContent = D.label; $('daily-note').textContent = done ? T('daily.done_note', { line: done.line }) : T('daily.note');
    if (Sfx.ambience) Sfx.ambience(null);
    $('start').hidden = false; document.body.classList.remove('phased');
  }
  // ---- choose your character (owner, Nov. 1, 2026) ----------------------------------------
  // Three steps like a fighting game's select screen: the character, then the companion who travels with you, then the
  // cards you add to your deck ("choosing cards means adding cards to the deck, not selecting a limited number").
  // Cards the starting hand or the companion already covers at the same stops are not offered.
  let pickWho = null, pickMate = null, picked = [], pickDemo = false, pickStage = 'who';
  const ROSTER = () => [
    { k: 'woman', role: 'teresa', name: Data.CHARACTERS.woman.name },
    { k: 'man', role: 'mateu', name: Data.CHARACTERS.man.name },
    { k: 'gov', role: 'sofia', name: Data.GOV.name },
  ];
  const covered = (hand, c) => hand.some(id => { const h = Data.CARDS[id]; return h && h.tag === c.tag && c.reach.every(r => h.reach.includes(r)); });
  const poolFor = (k) => { const hand = (Data.CHARACTERS[k].hand || []).concat(pickMate ? [Data.COMPANIONS[pickMate].card] : []); return Object.keys(Data.CARDS).filter(id => Data.CARDS[id].pick && !covered(hand, Data.CARDS[id])); };
  const cardLine = (c) => `<b>${esc(c.name)}</b><span>${esc([c.text, c.does].filter(Boolean).join(' '))}</span>`;
  function tiles(list, chosen, onPick) {
    const grid = $('pick-grid'); grid.innerHTML = '';
    for (const r of list) {
      const b = document.createElement('button'); b.className = 'picktile' + (chosen === r.k ? ' sel' : ''); b.dataset.k = r.k;
      b.innerHTML = `<span class="face"></span><b>${esc(r.name)}</b>`; const url = Render.portrait(r.role); if (url) b.firstChild.style.backgroundImage = `url(${url})`;
      b.onclick = () => { Sfx.unlock(); Sfx.select(); onPick(r.k); renderPicker(); };
      grid.appendChild(b);
    }
  }
  function showPicker(demo) {
    pickWho = null; pickMate = null; picked = []; pickDemo = !!demo; pickStage = 'who';
    $('start').hidden = true; $('picker').hidden = false; Sfx.ambience('select');
    renderPicker();
  }
  function renderPicker() {
    const det = $('pick-detail'), cards = $('pick-cards'), go = $('pick-go'), grid = $('pick-grid');
    det.hidden = true; cards.hidden = true; grid.hidden = pickStage === 'cards'; go.hidden = true; det.innerHTML = '';
    if (pickStage === 'who') {
      $('pick-title').textContent = T('pick.title');
      tiles(ROSTER().filter(r => !pickDemo || r.k === Tutorial.WHO || r.k === 'gov'), pickWho, (k) => { pickWho = k; });
      if (!pickWho) return;
      det.hidden = false; go.hidden = false;
      if (pickWho === 'gov') {
        const [a, b] = ['watch', 'desk'].map(id => Data.GOV_CARDS[id]);
        det.innerHTML = `<h3>${esc(T('pick.role_investigator'))}</h3><p>${esc(T('pick.goal_investigator'))}</p><p>${esc(T('pick.starts_with_two', { name: Data.GOV.name, a: inSentence(a.name), b: inSentence(b.name) }))}</p><ul class="pickcards"><li>${cardLine({ name: a.name, does: a.does })}</li><li>${cardLine({ name: b.name, does: b.does })}</li></ul>`;
      } else {
        const ch = Data.CHARACTERS[pickWho], sp = Data.CARDS[ch.hand[ch.hand.length - 1]];
        det.innerHTML = `<h3>${esc(T('pick.role_candidate'))}</h3><p>${esc(T('pick.goal_candidate'))}</p><p>${esc(T('pick.starts_with', { name: ch.name, card: inSentence(sp.name).replace(/^your /, ch.pronoun === 'she' ? 'her ' : 'his ') }))}</p><ul class="pickcards"><li>${cardLine({ name: sp.name, does: sp.does })}</li></ul><p class="small">${esc(T(ch.faceKnown ? 'pick.face' : 'pick.watched'))}</p>`;
      }
      go.textContent = T(pickDemo ? 'pick.go' : 'pick.next_mate');
      return;
    }
    if (pickStage === 'mate') {
      $('pick-title').textContent = T('pick.mate_title');
      tiles(Object.keys(Data.COMPANIONS).map(k => ({ k, role: Data.COMPANIONS[k].sprite, name: Data.CARDS[Data.COMPANIONS[k].card].name })), pickMate, (k) => { pickMate = k; });
      if (!pickMate) return;
      const m = Data.COMPANIONS[pickMate], c = Data.CARDS[m.card];
      det.hidden = false; go.hidden = false;
      det.innerHTML = `<h3>${esc(c.name)}</h3><p>${esc(c.text)}</p><p>${esc(pickWho === 'gov' ? m.govDoes : c.does)}</p>`;
      go.textContent = T(pickWho === 'gov' ? 'pick.go' : 'pick.next');
      return;
    }
    // cards: add any number to your deck
    $('pick-title').textContent = picked.length ? cap(T(picked.length === 1 ? 'pick.added_one' : 'pick.added', { n: Sim.num(picked.length) })) : T('pick.cards_title');
    cards.hidden = false; go.hidden = false; cards.innerHTML = '';
    for (const id of poolFor(pickWho)) {
      const c = Data.CARDS[id], on = picked.includes(id);
      const b = document.createElement('button'); b.className = 'pickcard' + (on ? ' sel' : ''); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.innerHTML = cardLine(c);
      b.onclick = () => { Sfx.unlock(); picked = on ? picked.filter(x => x !== id) : picked.concat([id]); Sfx.select(); renderPicker(); };
      cards.appendChild(b);
    }
    go.textContent = T('pick.go');
  }
  function pickerGo() {
    if (!pickWho) return;
    Sfx.unlock(); Sfx.click();
    if (pickStage === 'who') {
      if (pickDemo) { $('picker').hidden = true; if (pickWho === 'gov') newGovRun(true); else newRun(null, true); return; }
      pickStage = 'mate'; renderPicker(); return;
    }
    if (pickStage === 'mate') {
      if (!pickMate) return;
      if (pickWho === 'gov') { $('picker').hidden = true; newGovRun(false, undefined, pickMate); return; }
      pickStage = 'cards'; renderPicker(); return;
    }
    const k = pickWho, extra = picked.slice(), mate = pickMate; $('picker').hidden = true;
    showMap((d) => newRun(k, false, false, d, undefined, extra, mate));
  }
  function pickerBack() {
    Sfx.unlock(); Sfx.click();
    if (pickStage === 'cards') { pickStage = 'mate'; picked = []; renderPicker(); return; }
    if (pickStage === 'mate') { pickStage = 'who'; pickMate = null; renderPicker(); return; }
    $('picker').hidden = true; showStart();
  }
  // The map: Valdória, the strip you fly from, and the three countries that might take you. The player picks one
  // with no more information than the blurbs; which country has actually agreed is never shown.
  const MAP_LAND = [
    // coarse continent outlines in lon,lat; a schematic, not a chart
    [[-168,66],[-140,70],[-95,72],[-62,62],[-55,50],[-66,45],[-75,36],[-81,28],[-97,26],[-105,22],[-97,16],[-85,12],[-78,8],[-82,0],[-77,-5],[-70,-18],[-71,-30],[-73,-45],[-68,-55],[-64,-50],[-58,-38],[-48,-26],[-38,-12],[-35,-6],[-50,0],[-52,6],[-61,10],[-72,12],[-78,9],[-88,15],[-96,19],[-104,25],[-117,32],[-124,40],[-125,48],[-135,58],[-150,61],[-165,62]],
    [[-10,36],[-6,36],[10,38],[32,31],[35,28],[43,12],[51,12],[47,-1],[40,-10],[40,-16],[35,-24],[31,-29],[26,-34],[18,-34],[13,-24],[12,-14],[9,-1],[9,4],[0,5],[-8,4],[-15,10],[-17,15],[-17,21],[-13,27],[-10,30]],
    [[-10,43],[-2,43],[3,43],[10,44],[14,41],[16,38],[19,40],[24,38],[28,41],[41,41],[49,43],[52,42],[60,44],[70,40],[62,25],[57,21],[52,25],[48,30],[36,36],[27,37],[36,40],[28,41]],
    [[-10,43],[-9,53],[-6,58],[5,62],[12,66],[20,70],[30,70],[45,68],[60,70],[75,73],[100,78],[130,72],[150,70],[180,66],[165,60],[160,52],[140,45],[132,43],[125,40],[122,30],[118,22],[108,10],[104,2],[100,10],[95,18],[90,22],[80,10],[77,8],[72,20],[66,25],[62,25],[70,40],[60,44],[52,42],[49,43],[41,41],[28,41],[24,38],[19,40],[16,38],[14,41],[10,44],[3,43],[-2,43]],
    [[115,-20],[125,-14],[132,-12],[142,-11],[147,-19],[153,-27],[150,-37],[141,-38],[131,-32],[118,-34],[114,-26]],
    [[-55,-62],[-20,-68],[20,-66],[60,-66],[100,-66],[150,-66],[180,-70],[-120,-72],[-80,-70]],
  ];
  const proj = (lon, lat) => [((lon + 180) / 360) * 1000, ((90 - lat) / 180) * 500];
  function drawMap(sel) {
    const svg = $('worldmap'); let h = '';
    for (let x = 0; x <= 1000; x += 125) h += `<line class="grid" x1="${x}" y1="0" x2="${x}" y2="500"/>`; for (let y = 0; y <= 500; y += 125) h += `<line class="grid" x1="0" y1="${y}" x2="1000" y2="${y}"/>`;
    for (const poly of MAP_LAND) h += `<polygon class="land" points="${poly.map(([lo, la]) => proj(lo, la).map(v => v.toFixed(1)).join(',')).join(' ')}"/>`;
    const V = proj(Data.PLACES.valdoria.lon, Data.PLACES.valdoria.lat), E = proj(Data.PLACES.susana.lon, Data.PLACES.susana.lat);
    h += `<path class="route drive" d="M${V[0]},${V[1]} Q${(V[0] + E[0]) / 2},${Math.min(V[1], E[1]) - 30} ${E[0]},${E[1]}"/>`;
    for (const k in Data.DESTS) { const d = Data.DESTS[k]; const P = proj(d.lon, d.lat); const mx = (E[0] + P[0]) / 2, my = Math.min(E[1], P[1]) - 90; h += `<path class="route" d="M${E[0]},${E[1]} Q${mx},${my} ${P[0]},${P[1]}"/>`; }
    h += `<circle class="pt here" cx="${V[0]}" cy="${V[1]}" r="7"/><text class="lbl" x="${V[0] - 10}" y="${V[1] + 28}">${esc(Data.PLACES.valdoria.name)}</text><text class="lbl sub" x="${V[0] - 10}" y="${V[1] + 44}">${esc(T('map.here'))}</text>`;
    h += `<circle class="pt via" cx="${E[0]}" cy="${E[1]}" r="6"/><text class="lbl" x="${E[0] + 10}" y="${E[1] - 8}">${esc(Data.PLACES.susana.name)}</text>`;
    for (const k in Data.DESTS) { const d = Data.DESTS[k]; const P = proj(d.lon, d.lat); h += `<circle class="pt pick${sel === k ? ' on' : ''}" data-dest="${k}" cx="${P[0]}" cy="${P[1]}" r="9"/><text class="lbl" x="${P[0] + 14}" y="${P[1] - 6}">${esc(d.city)}</text><text class="lbl sub" x="${P[0] + 14}" y="${P[1] + 10}">${esc(d.name)}</text>`; }
    svg.innerHTML = h;
    svg.querySelectorAll('.pt.pick').forEach(c => c.onclick = () => drawChoices(c.dataset.dest));
  }
  let mapGo = null;
  function drawChoices(sel) {
    drawMap(sel); const box = $('map-choices'); box.innerHTML = '';
    for (const k in Data.DESTS) {
      const d = Data.DESTS[k]; const b = document.createElement('button'); b.className = 'destbtn' + (sel === k ? ' on' : '');
      b.innerHTML = `<span class="dhead"><b>${esc(d.name)}</b><span class="dh">${esc(T('map.hours', { h: Sim.num(d.hours) }))}</span></span>`
        + `<p>${esc(d.sponsor.asks)}</p>`
        + `<span class="dfoot"><span class="go">${esc(T('map.choose', { name: d.name }))}</span></span>`;
      b.onclick = () => { Sfx.click(); if (mapGo) mapGo(k); }; box.appendChild(b);
    }
  }
  function showMap(go) { mapGo = go; $('start').hidden = true; drawChoices(null); $('map').hidden = false; }
  function showTitle() {
    const t = Sim.newRun(3, 'woman'); t.pos = 4; t.hour = 36; t.belief = 1;
    const paint = () => { const url = Render.still(t); if (!url) { setTimeout(paint, 60); return; } $('title').style.backgroundImage = `url(${url})`; };
    if (ATTRACT_RUNS.length) startAttract(); else paint();
    $('title').hidden = false; $('start').hidden = true;
    $('title-start').onclick = () => { stopAttract(); Sfx.unlock(); Sfx.theme(true); $('title').hidden = true; showStart(); };
  }
  function pwa() {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      navigator.serviceWorker.register('sw.js').then(reg => {
        const watch = (w) => { if (!w) return; w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) $('update').hidden = false; }); };
        watch(reg.waiting || reg.installing); reg.addEventListener('updatefound', () => watch(reg.installing));
        $('reload').onclick = () => { if (reg.waiting) reg.waiting.postMessage('skip'); location.reload(); };
      }).catch(() => {});
    }
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; $('install').hidden = false; document.querySelector('#menu2 [data-act=install]').hidden = false; });
    $('install').onclick = () => { if (installEvt) { installEvt.prompt(); installEvt = null; $('install').hidden = true; } };
    if (/iphone|ipad/i.test(navigator.userAgent) && !navigator.standalone) $('ioshint').hidden = false;
  }
  function boot() {
    Render.start({ onPick: (id) => { if (id !== 'self' && !gov && Data.PEOPLE[id]) log('sys', esc(T('log.person_role', { name: pname(id), role: gov ? Data.PEOPLE[id].role : Sim.personRole(s, id) })), 'sys'); } });
    document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => { Sfx.click(); setTab(b.dataset.tab); });
    $('wait').onclick = () => gov ? doGov('wait') : doCommit('wait');
    $('waitdark').onclick = () => { if (!gov) doCommit('wait_dark'); };
    $('again').onclick = () => { Sfx.click(); $('over').hidden = true; gov ? newGovRun() : newRun(who, false, !!daily); };
    const closeOver = () => { Sfx.click(); $('over').hidden = true; saveRun(); showStart(); };
    $('overclose').onclick = closeOver;
    $('changewho').onclick = () => { Sfx.click(); $('over').hidden = true; if (gov) newRun(gov.target); else showStart(); };
    $('startscreen').onclick = () => { saveRun(); showStart(); };
    $('demo').onclick = () => { Sfx.unlock(); Sfx.click(); $('over').hidden = true; if (gov) newGovRun(true); else newRun(null, true); };
    $('start-choose').onclick = () => { Sfx.unlock(); Sfx.click(); showPicker(); };
    $('pick-go').onclick = pickerGo; $('pick-back').onclick = pickerBack;
    $('start-tutorial').onclick = () => { Sfx.unlock(); Sfx.click(); showPicker(true); }; // one demo: pick Teresa or Sofia
    $('continue').onclick = () => { Sfx.unlock(); Sfx.click(); resumeRun(); };
    let creditsFrom = null;
    let creditsHad = null; // what was playing before the credits: restored on close
    const openCredits = () => { Sfx.unlock(); Sfx.click(); creditsFrom = document.activeElement; creditsHad = { theme: Sfx.themePlaying(), amb: Sfx.ambienceNow() };
      if (creditsHad.theme) Sfx.theme(false); if (Sfx.ambience) Sfx.ambience(null); Sfx.credits(true);
      $('credits').hidden = false; $('credits-close').focus({ preventScroll: true }); $('credits').scrollTop = 0; };
    const closeCredits = () => { Sfx.click(); $('credits').hidden = true; Sfx.credits(false);
      if (creditsHad && creditsHad.theme) Sfx.theme(true); if (creditsHad && creditsHad.amb && Sfx.ambience) Sfx.ambience(creditsHad.amb.scene, creditsHad.amb.night); creditsHad = null;
      if (creditsFrom && creditsFrom.focus) creditsFrom.focus(); };
    $('credits-open').onclick = openCredits; $('start-credits').onclick = openCredits; $('credits-close').onclick = closeCredits;
    document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (!$('credits').hidden) closeCredits(); else if (!$('brief').hidden) $('b-start').click(); else if (!$('over').hidden && s && s.over) closeOver(); });
    $('daily').onclick = () => { Sfx.unlock(); Sfx.click(); showMap((d) => newRun(null, false, true, d)); };
    $('phasedone').onclick = () => { Sfx.click(); enterPhase('move'); };
    $('b-start').onclick = () => { Sfx.click(); $('brief').hidden = true; };
    $('briefagain').onclick = () => { Sfx.click(); showBrief(); $('b-start').textContent = T('brief.back'); };
    $('saverun').onclick = () => { Sfx.click(); downloadRun(); };
    $('copyreplay').onclick = () => { Sfx.click(); copyReplay(); };
    $('share').onclick = async () => { const text = shareText(); try { if (navigator.share) await navigator.share({ title: 'Coalition', text }); else { await navigator.clipboard.writeText(text); $('share').textContent = T('share.copied'); } } catch (e) { /* share dismissed */ } };
    const released = () => { if (Tutorial.active()) return; if (gov) Gov.endTutorial(gov); else if (s) Sim.endTutorial(s); };
    $('coach-next').onclick = () => { Sfx.click(); Tutorial.next(); released(); renderAll(); saveRun(); };
    $('coach-leave').onclick = () => { Sfx.click(); Tutorial.stop(); released(); log('sys', T('log.tutorial_ended'), 'sys'); renderAll(); saveRun(); };
    const toggleMute = () => { Sfx.unlock(); Sfx.setMuted(!Sfx.isMuted()); $('mute').setAttribute('aria-label', T(Sfx.isMuted() ? 'sound.off' : 'sound.on')); $('mute-wave').style.display = Sfx.isMuted() ? 'none' : ''; document.querySelector('#menu2 [data-act=mute]').textContent = T(Sfx.isMuted() ? 'sound.menu_off' : 'sound.menu_on'); };
    const toggleHelp = () => { $('helpbox').hidden = !$('helpbox').hidden; if (!$('helpbox').hidden) setTab('phone'); };
    $('mute').onclick = toggleMute; $('help').onclick = toggleHelp;
    document.querySelectorAll('#menu2 button').forEach(b => b.onclick = () => ({ demo: () => $('demo').onclick(), startscreen: () => $('startscreen').onclick(), help: toggleHelp, install: () => $('install').onclick(), mute: toggleMute, credits: () => $('credits-open').onclick() })[b.dataset.act]());
    // the result card ends each turn with Continue (owner, Nov. 1, 2026: "Six hours pass ... Then continue."), so this only tracks the busy state
    setInterval(() => { if (!s) return; const b = Render.busy(); if (document.body.classList.contains('busy') !== b) document.body.classList.toggle('busy', b); }, 120);
    window.addEventListener('resize', () => { if (s) renderAll(); });
    pwa();
    if (replayFromHash()) return;
    s = Sim.newRun(1, 'woman'); Render.setState(s); showTitle();
  }
  return { boot };
})();
window.addEventListener('DOMContentLoaded', UI.boot);
