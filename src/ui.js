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
  let phase = 'move', round = 1, phoneCalls = 0, movedThisRound = false, result = null, roundSum = { theirs: [], hours: 0 }, daily = null;
  const $ = (id) => document.getElementById(id);
  const T = Content.t, H = Content.html; // all player-facing wording comes from content/coalition/ui.json
  const COLORS = { narrator: '#B9B0D9', sibling: '#C9A4F5', aide: '#E85DF0', nando: '#FF9F43', sponsor: '#FFC93C', host: '#FF9F43', official: '#7FB2E5', holt: '#B9B0D9', theo: '#FF9F43', press: '#D8D2EE', pilot: '#7FB2E5', enemy: '#FF7A90', minister: '#FFC93C', watch: '#D8D2EE', desk: '#D8D2EE', sys: '#B9B0D9' };
  const short = (h) => { const [d, ...t] = Sim.clockText(h).split(' '); return `${d.slice(0, 3)} ${t.join(' ')}`; };
  const initials = (name) => name.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const pname = (id) => gov ? Gov.personName(gov, id) : Sim.personName(s, id);

  function log(whoId, text, cls) {
    if (!text) return;
    const el = document.createElement('div'); el.className = 'line ' + (cls || '');
    const name = whoId === 'narrator' || whoId === 'sys' ? '' : whoId === 'enemy' ? (gov ? T('name.inspector') : Data.ENEMY.name) : pname(whoId);
    el.innerHTML = `${name ? `<b style="color:${COLORS[whoId] || '#ccc'}">${esc(name)}</b> ` : ''}<span>${text}</span>`;
    const box = $('dialogue'); box.appendChild(el); box.scrollTop = box.scrollHeight;
  }

  // ---- storage: first visit, saved run --------------------------------
  const SEEN = 'coalition.seen', SAVE = 'coalition.run';
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
    if (r.gov) { gov = Gov.restore(r.gov); s = gov.c; } else { gov = null; s = Sim.restore(r.s); }
    if (r.tut >= 0) { Tutorial.start(r.tutId || (gov ? 'gov' : 'escape')); while (Tutorial.index() < r.tut) Tutorial.forward(); } else Tutorial.stop();
    Render.setState(s, gov); Render.view.over = null; Render.view.queue = []; Render.view.current = null;
    $('dialogue').innerHTML = (r.lines || []).join(''); $('start').hidden = true; document.body.classList.toggle('gov', !!gov);
    round = r.round || 1; daily = r.daily && r.daily === dailyInfo().key ? dailyInfo() : null;
    setTab('here'); renderAll(); startRound(true); return true;
  }

  // ---- runs --------------------------------------------------------------
  let replaying = null; // { queue, speed, timer } while a replay link plays itself
  function newRun(w, demo, isDaily, dest, seed) {
    markSeen(); briefPos = -1; gov = null; document.body.classList.remove('gov'); daily = isDaily ? dailyInfo() : null; round = 1; $('map').hidden = true;
    if (daily) { who = daily.who; s = Sim.newRun(daily.seed, who, { daily: true, dest }); Tutorial.stop(); }
    else if (demo) { who = Tutorial.WHO; s = Sim.newRun(Tutorial.SEED, who, { dice: Tutorial.DICE, enemy: Tutorial.ENEMY, tutorial: true }); Tutorial.start('escape'); }
    else { who = w; s = Sim.newRun(seed === undefined ? (Math.random() * 1e9) >>> 0 : seed, who, { dest }); Tutorial.stop(); }
    sel = null; enemyLog = []; Sfx.theme(false);
    Render.setState(s); Render.view.over = null; Render.view.queue = []; Render.view.current = null;
    $('dialogue').innerHTML = ''; $('start').hidden = true; setTab('here');
    const c = Data.CHARACTERS[who];
    log('sys', esc(T('log.start_escape', { clock: Sim.clockText(0), name: c.name, title: c.title, sibling: c.sibling.name, rel: c.sibling.rel })), 'sys');
    animate(s._boot); renderAll(); startRound(true); saveRun();
  }
  function newGovRun(demo, seed) {
    markSeen(); who = 'gov'; sel = null; enemyLog = []; Sfx.theme(false); daily = null;
    if (demo) { const G = Tutorial.RUNS.gov; gov = Gov.newRun(G.seed, 'woman', { dice: G.dice, events: G.eventQueue, tutorial: true }); Tutorial.start('gov'); }
    else { Tutorial.stop(); gov = Gov.newRun(seed === undefined ? (Math.random() * 1e9) >>> 0 : seed); }
    s = gov.c; document.body.classList.add('gov');
    Render.setState(s, gov); Render.view.over = null; Render.view.queue = []; Render.view.current = null;
    $('dialogue').innerHTML = ''; $('start').hidden = true; setTab('here');
    log('sys', esc(T('log.start_gov', { clock: Sim.clockText(0), name: Data.GOV.name, title: Data.GOV.title, target: Data.CHARACTERS[gov.target].name })), 'sys');
    round = 1; animate(gov._boot); renderAll(); startRound(true); saveRun();
  }

  function setTab(t) { tab = t; document.querySelectorAll('#tabs button').forEach(b => { if (b.dataset.tab === t) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }); document.querySelectorAll('.tab').forEach(el => el.classList.toggle('active', el.dataset.tab === t)); }

  function renderAll() {
    if (!s) return;
    renderScene(); renderCoach(); renderPhase();
    if (Sfx.ambience) Sfx.ambience(s.over ? null : Data.LEVELS[gov ? Math.max(0, gov.belief) : s.pos].scene, Sim.isNight(s));
    if (gov) { renderGovHere(); renderGovPhone(); renderGovHand(); renderGovRoute(); }
    else { renderHere(); renderPhone(); renderHand(); renderRoute(); }
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
      $('sosa-next').textContent = v.lastReport || T('scene.none'); $('sosa-nextl').textContent = T('scene.last_report_label');
      $('sosa').querySelector('.exp').hidden = true; $('heat').hidden = true; $('sosa').querySelector('.arrive').textContent = T('scene.minister_by', { time: short(v.ministerBy) });
      $('expl-l').textContent = T('scene.suspected'); $('expl-b').textContent = v.suspectName; $('heat2').hidden = true; $('heatnum2').textContent = v.lastReport ? T('scene.last_report_lc', { age: v.lastReport }) : T('scene.no_reports_lc');
      $('lvlname').textContent = v.levelName; $('lvlobj').textContent = v.objective; $('lvlname2').textContent = v.levelName; $('lvlobj2').textContent = v.objective;
      $('wait').textContent = T('action.wait_gov'); $('phoneh').textContent = T('nav.desk'); document.querySelector('#herehead h2').textContent = T('nav.orders');
      return;
    }
    $('goaltxt').textContent = T('scene.goal');
    const right = s.belief === s.pos;
    $('sosa-name').textContent = right ? T('scene.sosa_here') : T('scene.sosa_at', { place: Data.LEVELS[s.belief].short });
    $('sosa-where').textContent = T(right ? 'scene.sosa_right' : 'scene.sosa_wrong', { place: placeName(s.belief) });
    $('sosa-nextl').textContent = T('scene.next_move');
    { const n = Math.max(1, Sim.ENEMY_EVERY - (s.hour - s.lastEnemy)); $('sosa-next').textContent = T(n === 1 ? 'scene.next_in_one' : 'scene.next_in', { hours: Sim.num(n) }); }
    $('sosa').querySelector('.exp').hidden = false; $('heat').hidden = false; $('sosa').querySelector('.arrive').textContent = s.hold ? T('scene.held_again', { hold: s.hold }) : T('scene.held_at');
    for (const id of ['heat', 'heat2']) { const h = $(id); h.innerHTML = ''; for (let i = 0; i < Sim.EXPOSURE_LIMIT; i++) { const d = document.createElement('i'); d.className = (i < s.exposure ? 'on' : '') + (i >= 7 ? ' hot' : ''); h.appendChild(d); } }
    $('heatnum').textContent = s.exposure; $('heatnum2').textContent = `${s.exposure}/10`; $('expl-l').textContent = T('scene.exposure'); $('expl-b').textContent = ''; $('heat2').hidden = false;
    $('lvlname').textContent = L.name; $('lvlobj').textContent = L.objective; $('lvlname2').textContent = L.name; $('lvlobj2').textContent = L.objective;
    $('wait').textContent = T('action.wait'); $('phoneh').textContent = T('nav.phone'); document.querySelector('#herehead h2').textContent = T('nav.here');
    $('whoami').textContent = `${Data.CHARACTERS[who].name}, ${Data.CHARACTERS[who].title}`;
  }

  // ---- the coach -----------------------------------------------------------
  function renderCoach() {
    const box = $('coach'); document.querySelectorAll('.tut-hi').forEach(el => el.classList.remove('tut-hi'));
    if (!Tutorial.active()) { box.hidden = true; document.body.classList.remove('coaching'); return; }
    const st = Tutorial.step(); box.hidden = false; document.body.classList.add('coaching');
    $('coach-step').textContent = T('coach.step', { n: Tutorial.index() + 1, total: Tutorial.STEPS.length });
    $('coach-title').textContent = st.title; $('coach-body').innerHTML = Content.rich(st.body);
    $('coach-next').hidden = !st.allow.next; $('coach-next').textContent = Tutorial.isLast() ? T('action.finish') : T('action.next');
    $('coach-do').hidden = !!st.allow.next;
    for (const q of st.highlight) { const el = document.querySelector(q); if (el) el.classList.add('tut-hi'); }
    requestAnimationFrame(() => $('panels').style.setProperty('--coachh', box.offsetHeight + 'px'));
    // on the phone, switch to the tab the step points at
    if (window.innerWidth < 1000 && st.highlight.length && !['news', 'roll', 'sosa'].includes(phase)) { const q = st.highlight[0]; const t = q === '#inbox' || q === '#calls' || q === '#arrangements' ? 'phone' : q === '#hand' || q === '#people' ? 'hand' : q === '#enemy' || q === '#board' ? 'route' : null; if (t) setTab(t); else if (q === '#approaches') setTab('here'); }
  }

  // ---- Here: approaches with a die face -------------------------------------
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  // no roll needed: a check mark, never a die face
  function checkFace() { return `<span class="die sure" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg></span>`; }
  const moveFace = (a) => a.need <= 1 ? checkFace() : dieFace(a.need);
  function dieFace(need) { const n = Math.max(1, Math.min(6, need)); return `<span class="die" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<i class="${PIPS[n].includes(i) ? 'p' : ''}"></i>`).join('')}</span>`; }
  // a bonus is named by the held cards that give it, never by the internal tag
  const cardsFor = (tag) => gov ? gov.hand.map(id => Data.GOV_CARDS[id]).filter(c => c && c.tag === tag).map(c => c.name) : s.hand.map(id => Data.CARDS[id]).filter(c => c && c.tag === tag).map(c => c.name);
  // chance of success and time taken are different facts, shown on separate lines
  const chanceText = (a) => a.need <= 1 ? T('action.certain') : a.need > 6 ? T('action.impossible') : T('action.chance', { need: a.need, odds: a.odds });
  const metaLine = (a, withSosa) => `<span class="meta"><span class="nd">${esc(chanceText(a))}</span><span class="hrs">${esc(T(a.hours === 1 ? 'action.takes_one' : 'action.takes', { hours: Sim.num(a.hours) }))}${a.who ? esc(T('action.done_by', { who: a.who })) : ''}</span>${withSosa && sosaActs(a.hours) ? `<span class="sosa-during">${esc(sosaDuring(a))}</span>` : ''}</span>`;
  // escape side: how many times Sosā acts during the move's own hours
  const sosaActs = (hours) => { if (gov) return hours > 0 ? 1 : 0; const next = Math.max(1, Sim.ENEMY_EVERY - (s.hour - s.lastEnemy)); return hours >= next ? 1 + Math.floor((hours - next) / Sim.ENEMY_EVERY) : 0; };
  const sosaDuring = (a) => { if (gov) return a.hours === 1 ? T('action.her_during_one') : T('action.her_during', { hours: Sim.num(a.hours) }); const n = sosaActs(a.hours); return n === 0 ? T('action.sosa_none', { hours: Sim.num(a.hours) }) : n === 1 ? T('action.sosa_once', { hours: Sim.num(a.hours) }) : T('action.sosa_times', { hours: Sim.num(a.hours), n: Sim.num(n) }); };
  const usesLabel = (a) => a.bonus && a.bonus.length ? `<span class="uses">${esc(T('action.uses', { list: a.bonus.map(u => cardsFor(u.tag).map(inSentence).join(', ') || inSentence(tagName(u.tag))).join(', ') }))}</span>` : '';
  const tagName = (tag) => ({ boat: T('tag.boat'), decoy: T('tag.decoy'), delay: T('tag.delay'), document: T('tag.document'), influence: T('tag.influence'), information: T('tag.information'), introduction: T('tag.introduction'), operator: T('tag.operator'), passage: T('tag.passage'), patrol: T('tag.patrol'), permission: T('tag.permission'), rail: T('tag.rail'), records: T('tag.records'), vehicle: T('tag.vehicle'), watch: T('tag.watch') })[tag] || tag;
  function approachBtn(a, allowed) {
    const b = document.createElement('button'); b.className = 'act approach' + (a.ok ? '' : ' no') + (sel === a.id ? ' sel' : '') + (a.ok && a.need <= 1 ? ' sure' : '') + (a.ok && a.need > 6 ? ' hard' : '');
    if (!allowed) { b.classList.add('off'); b.disabled = true; }
    const marks = []; if (a.with && a.with !== 'self' && s.people[a.with]) { const [c, t] = whoMark(a.with); marks.push({ k: c, t: `${pname(a.with).split(' ')[0]}: ${t}` }); } if (a.night && a.ok) marks.push({ k: 'night', t: T('marker.night') });
    b.innerHTML = `${moveFace(a)}<span class="body"><span class="nm">${esc(a.name)}</span>${marks.length ? mks(marks) : ''}${a.ok ? `${metaLine(a, true)}` : `<span class="why">${esc(a.why)}</span>`}</span>${a.ok && window.innerWidth >= 1000 ? usesLabel(a) : ''}`;
    b.onclick = () => { Sfx.unlock(); sel = sel === a.id ? null : a.id; Sfx.select(); renderAll(); };
    return b;
  }
  function expanded(a, commitLabel, onCommit) {
    const box = document.createElement('div'); box.className = 'actbox';
    box.innerHTML = `<div class="act">${moveFace(a)}<span class="body"><span class="nm">${esc(a.name)}</span>${metaLine(a)}${usesLabel(a)}</span></div><p>${esc(a.text || '')}</p><ul class="preview">${a.preview.slice(1).filter(x => x !== T('sim.preview.succeeds_without_a_roll') && x !== T('sim.preview.takes_hour', { hours: a.hours, s: a.hours === 1 ? '' : 's' })).concat(a.ok ? [sosaDuring(a)] : []).filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('')}</ul>${a.ok ? '' : `<p class="why" style="color:var(--coral2)">${esc(a.why)}</p>`}<div class="row"><button class="primary commit" ${a.ok && !s.over ? '' : 'disabled'}>${commitLabel}</button><button class="cancel">${T('action.cancel')}</button></div>`;
    box.querySelector('.commit').onclick = onCommit; box.querySelector('.cancel').onclick = () => { sel = null; renderAll(); };
    return box;
  }
  function renderHere() {
    const A = Sim.actions(s); const box = $('approaches'); box.innerHTML = '';
    for (const a of A.approaches) { if (sel === a.id) box.appendChild(expanded(a, T('action.commit'), () => doCommit(a.id))); else box.appendChild(approachBtn(a, Tutorial.allowsApproach(a.id) && phase === 'move')); }
    // waiting is a choice like any move: it says how long it takes and what can happen while you wait
    $('wait').hidden = true; $('waitdark').hidden = true;
    const can = !s.over && Tutorial.allowsWait() && phase === 'move' && !s.event;
    const waits = [];
    if (A.waitDark.ok) waits.push({ id: 'wait_dark', name: T('action.wait_dark'), hours: A.waitDark.hours, lines: [T('wait.dark_line'), T('wait.interrupt')] });
    waits.push({ id: 'wait', name: T('action.wait'), hours: 1, lines: [T('wait.hour_line')] });
    for (const w of waits) box.appendChild(sel === w.id ? waitBox(w) : waitBtn(w, can));
  }
  const CLOCK = `<span class="die sure wait" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg></span>`;
  const waitMeta = (w) => `<span class="meta"><span class="hrs">${esc(T(w.hours === 1 ? 'action.takes_one' : 'action.takes', { hours: Sim.num(w.hours) }))}</span><span class="sosa-during">${esc(sosaDuring(w))}</span></span>`;
  function waitBtn(w, allowed) {
    const b = document.createElement('button'); b.className = 'act approach waitact' + (allowed ? '' : ' off'); b.disabled = !allowed;
    b.innerHTML = `${CLOCK}<span class="body"><span class="nm">${esc(w.name)}</span>${waitMeta(w)}</span>`;
    b.onclick = () => { Sfx.unlock(); sel = w.id; Sfx.select(); renderAll(); };
    return b;
  }
  function waitBox(w) {
    const box = document.createElement('div'); box.className = 'actbox';
    box.innerHTML = `<div class="act">${CLOCK}<span class="body"><span class="nm">${esc(w.name)}</span>${waitMeta(w)}</span></div><ul class="preview">${w.lines.map(x => `<li>${esc(x)}</li>`).join('')}</ul><div class="row"><button class="primary commit">${T('action.wait_go')}</button><button class="cancel">${T('action.cancel')}</button></div>`;
    box.querySelector('.commit').onclick = () => doCommit(w.id); box.querySelector('.cancel').onclick = () => { sel = null; renderAll(); };
    return box;
  }

  // ---- the phone: a thread, then calls --------------------------------------
  function thread(from, role, text, options, optClass) {
    const d = document.createElement('div'); d.className = 'msg';
    const name = pname(from), cls = from === 'enemy' ? ' enemy' : from === 'press' ? ' press' : '';
    d.innerHTML = `<div class="who"><span class="avatar${cls}" aria-hidden="true">${initials(name)}</span><span class="n"><b>${esc(name)}</b><span>${esc(role)}</span></span></div><p class="bubble">${esc(text)}</p><div class="opts"></div>`;
    const opts = d.querySelector('.opts');
    for (const o of options) { const b = document.createElement('button'); b.className = 'opt' + (optClass(o) ? '' : ' off'); b.disabled = !o.ok || !!s.over || !optClass(o); b.innerHTML = `<span class="l">${esc(o.label)}${o.hours ? `<span class="mono gold">${o.hours} h</span>` : ''}</span>${(o.ok ? o.effect : o.why) ? `<small>${esc(o.ok ? o.effect : o.why)}</small>` : ''}`; b.onclick = () => o.go(); opts.appendChild(b); }
    return d;
  }
  const PHONE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A4F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"></path></svg>`;
  function callBtn(c, allowed, label) {
    const b = document.createElement('button'); b.className = 'call' + (c.ok ? '' : ' no') + (sel === c.id ? ' sel' : '') + (allowed ? '' : ' off'); b.disabled = !allowed;
    b.innerHTML = `${PHONE}<span class="t">${esc(label)}</span>${c.ok ? `<span class="hrs">${c.hours} h</span>` : `<span class="why">${esc(c.why)}</span>`}`;
    b.onclick = () => { Sfx.unlock(); sel = sel === c.id ? null : c.id; Sfx.select(); renderAll(); };
    return b;
  }
  function renderPhone() {
    const A = Sim.actions(s); const inbox = $('inbox'); inbox.innerHTML = '';
    $('waiting').textContent = A.messages.length ? T('phone.waiting', { n: A.messages.length }) : ''; const badge = $('tab-badge'); badge.hidden = !A.messages.length; badge.textContent = A.messages.length;
    if (!A.messages.length) inbox.innerHTML = `<p class="hint">${T('phone.empty')}</p>`;
    for (const m of A.messages) {
      const role = m.from === 'sibling' ? T('phone.sibling_role', { rel: Data.CHARACTERS[who].sibling.rel[0].toUpperCase() + Data.CHARACTERS[who].sibling.rel.slice(1).replace('your ', '') }) : m.from === 'enemy' ? Data.ENEMY.role : gov ? (Data.PEOPLE[m.from] || {}).role || '' : Sim.personRole(s, m.from);
      inbox.appendChild(thread(m.from, role, s.inbox.find(x => x.id === m.msgId).text, m.options.map(o => Object.assign({}, o, { go: () => doCommit(m.id, o.id) })), (o) => Tutorial.allowsOption(o.id) && (phase === 'phone' || phase === 'move')));
    }
    const calls = $('calls'); calls.innerHTML = '';
    for (const c of A.calls) {
      const arr = c.id.replace(/^call:/, ''), def = Data.ARRANGEMENTS[arr];
      const label = c.ok ? T('phone.call_about', { name: pname(c.ally), what: ({ aircraft: T('arr.what_aircraft'), reception: T('arr.what_reception'), permission: T('arr.what_permission') })[arr] }) : `${def.name}: ${c.name.split(': ')[1] || c.name}`;
      if (sel === c.id && c.ok) { const box = document.createElement('div'); box.className = 'callbox'; box.innerHTML = `<b>${esc(label)}</b><ul class="preview">${c.preview.concat(c.hours ? [sosaDuring({ hours: c.hours })] : []).filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('')}</ul><div class="row"><button class="primary commit">${T('action.call')}</button><button class="cancel">${T('action.cancel')}</button></div>`; box.querySelector('.commit').onclick = () => doCommit(c.id); box.querySelector('.cancel').onclick = () => { sel = null; renderAll(); }; calls.appendChild(box); }
      else calls.appendChild(callBtn(c, Tutorial.allowsCall(arr) && (phase === 'phone' || phase === 'move') && phoneCalls < 1, label));
    }
  }

  // ---- the hand: coloured cards -----------------------------------------------
  function cardEl(c, here, from, state) {
    const d = document.createElement('article'); d.className = `card t-${c.tag}` + (here ? '' : ' far');
    d.innerHTML = `<span class="tag">${esc(tagName(c.tag))}</span><h3>${esc(c.name)}</h3><p>${esc(c.text)}</p><p class="works"><b>${T('card.works_on')}</b> ${esc(c.works)}</p><p class="foot"><span>${esc(from)}</span><span class="st">${state}</span></p>`;
    return d;
  }
  function cardState(c, id) {
    if (Sim.reaches(s, id)) return T('card.counts_here');
    const first = Data.LEVELS.findIndex(L => c.reach.includes(L.id));
    if (first > s.pos) return T('card.counts_at', { place: first === 4 ? T('place.the_line') : Data.LEVELS[first].short });
    return T('card.not_here');
  }
  function renderHand() {
    const h = $('hand'); h.innerHTML = s.hand.length ? '' : `<p class="hint">${T('hand.empty')}</p>`;
    for (const id of s.hand) { const c = Data.CARDS[id]; h.appendChild(cardEl(c, Sim.reaches(s, id), c.from === 'self' ? T('card.yours') : T('card.from', { name: pname(c.from) }), cardState(c, id))); }
  }

  // ---- the route: one model, a rail on the phone and the board on desktop ------
  const NEED_LABEL = { aircraft: 'need.aircraft_ready', reception: null, permission: 'need.visa' };
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
      const needs = needCells(L).map(n => `<span class="need ${n.state}"><b>${esc(n.title)}</b><span>${esc(n.sub)}</span></span>`).join('');
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
    lbl(T('route.needed')); Data.LEVELS.forEach((L, i) => cell(`<span class="needs">${needCells(L).map(n => `<span class="need ${n.state}"><b>${esc(n.title)}</b><span>${esc(n.sub)}</span></span>`).join('')}</span>`, colCls(i))); cell('', 'abr');
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
    const why = gov ? (s.over.win ? T('over.why_gov_escaped') : ({ clock: T('over.why_gov_time'), landed: T('over.why_gov_landed'), deal: T('over.why_gov_deal') })[k] || T('over.why_gov_arrest'))
      : s.over.win ? T('over.why_out') : ({ clock: T('over.why_time'), landed: T('over.why_landed'), deal: T('over.why_deal') })[k] || T('over.why_arrest');
    $('overtext').innerHTML = `<p class="overwhy">${esc(why)}</p>` + (gov ? Gov.debrief(gov) : '');
    $('changewho').textContent = T(gov ? 'over.play_her' : 'over.choose');
    $('share').hidden = !(gov || daily); $('share').textContent = T('over.share');
    if (daily && !gov && !dailyResult(daily.key)) { try { localStorage.setItem(DAILY + daily.key, JSON.stringify({ win: s.over.win, line: outcomeLine(s.over), holds: s.holds, round })); } catch (e) { /* storage blocked */ } }
    saveRun();
  }

  // ---- export and replay ------------------------------------------------------------
  // A run is its seed, who played, where they were going and every accepted action, in order.
  function exportRun() {
    const st = gov || s; return { v: 1, game: 'coalition', kind: gov ? 'gov' : 'escape', seed: st.seed, who: gov ? null : s.who, dest: gov ? null : s.dest, actions: (st.actions || []).slice(), ended: s.over ? (gov ? (s.over.win ? 'escaped' : 'stopped') : s.over.kind) : null };
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
    if (rec.kind === 'gov') newGovRun(false, rec.seed); else newRun(rec.who || 'woman', false, false, rec.dest || 'atlanta', rec.seed);
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
    if (sid.startsWith('evt:')) { result = summarize(r.events, T('result.your_choice'), null); result.from = 'news'; phase = 'news'; }
    else if (sid.startsWith('call:')) { phoneCalls += 1; phase = 'move'; if (window.innerWidth < 1000) setTab('here'); }
    else if (sid.startsWith('msg:')) { if (window.innerWidth < 1000 && !waitingMsgs()) setTab('here'); } // back to the scene once nobody is waiting
    else { movedThisRound = true; result = sm; if (sid === 'wait' || sid === 'wait_dark') { result.kind = T('result.lay_low'); result.title = sm.hours === 1 ? T('result.lay_low_title') : cap(T('result.hours_pass', { hours: Sim.num(sm.hours) })); result.waited = true; } phase = 'sosa'; if (window.innerWidth < 1000) setTab('here'); }
    renderAll(); saveRun();
  }

  // ---- phase turns ------------------------------------------------------------------
  const PH = ['news', 'phone', 'move', 'roll', 'sosa'];
  const mks = (tags) => `<span class="mks">${tags.map(t => `<span class="mk ${t.k}">${esc(t.t)}</span>`).join('')}</span>`;
  const PH_LABEL = { news: ['phase.news', 'phase.reports'], phone: ['phase.phone', 'phase.desk'], move: ['phase.move', 'phase.order'], roll: ['phase.roll', 'phase.roll'], sosa: ['phase.sosa', 'phase.her_move'] };
  const pendingEvent = () => gov ? Gov.view(gov).event : Sim.actions(s).event;
  function phoneUseful() {
    if (gov) { const v = Gov.view(gov); return v.messages.some(m => m.options.some(o => Tutorial.allowsOption(o.id))) || (phoneCalls < 1 && v.calls.some(c => c.ok && Tutorial.allowsCall(c.id))); }
    const A = Sim.actions(s);
    return A.messages.some(m => m.options.some(o => o.ok && Tutorial.allowsOption(o.id))) || (phoneCalls < 1 && A.calls.some(c => c.ok && Tutorial.allowsCall(c.arr)));
  }
  function startRound(first) {
    if (!s || s.over) return;
    if (!first) round += 1;
    phoneCalls = 0; movedThisRound = false; result = null; roundSum = { theirs: [], hours: 0 };
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
    if (call) out.job.push(T('brief.phone_suggest', { call: call.name }));
    out.stats = shortStats(); out.marks = routeMarks();
    return out;
  }
  // the numbers alone; what they mean is in Help and opens from the top bar
  const shortStats = () => [
    { big: `${Math.max(0, Sim.HOURS_TOTAL - s.hour)}h`, text: T('brief.time_left') },
    { big: `${s.exposure}/${Sim.EXPOSURE_LIMIT}`, text: T('brief.attention_short'), bar: [s.exposure, Sim.EXPOSURE_LIMIT] },
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
    out.need = [{ name: T('brief.gov_need_ban'), have: ban === 'inhand' ? 1 : 0, of: 1, done: ban === 'inhand', now: ban === 'promised' ? T('brief.gov_not_confirmed') : '' },
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
  function briefRoute(marks) {
    return Data.LEVELS.map((L, i) => { const m = marks[i] || [], above = m.filter(x => x[0] === 'you'), below = m.filter(x => x[0] !== 'you');
      const pill = (x) => `<span class="bpill ${x[0]}">${esc(x[1])}</span>`;
      return `<li class="${m.some(x => x[0] === 'you') ? 'here' : ''}${i === Data.LEVELS.length - 1 ? ' end' : ''}"><span class="above">${above.map(pill).join('')}</span><i class="dot"></i><span class="stop">${esc(L.short)}</span><span class="below">${below.map(pill).join('')}</span></li>`; }).join('');
  }
  function showBrief() {
    if (!s || s.over) return;
    const b = gov ? briefGov() : briefEscape();
    if (!gov) briefPos = s.pos;
    const milestone = !gov && s.pos > 0 && b.arrived;
    $('b-clock').textContent = short(s.hour); $('b-round').textContent = gov ? T('round.label', { n: round }) : T('brief.stop_of', { n: s.pos + 1, total: Data.LEVELS.length });
    $('b-title').textContent = gov ? T('brief.gov_title') : milestone ? T('brief.made_it', { place: Data.LEVELS[s.pos].short }) : Data.LEVELS[s.pos].short;
    $('b-jobh').textContent = T(gov ? 'brief.h_round' : 'brief.h_next'); $('b-win').hidden = milestone; // a stop screen is a moment, not a checklist
    document.body.classList.toggle('stopscreen', milestone);
    $('b-story').innerHTML = b.story.map(P).join(''); $('b-story').hidden = !b.story.length;
    $('b-route').innerHTML = briefRoute(b.marks);
    $('b-stats').innerHTML = b.stats.map(st => `<div><b>${esc(st.big)}</b><p>${esc(st.text)}${st.bar ? `<span class="segs">${Array.from({ length: st.bar[1] }, (_, k) => `<i class="${k < st.bar[0] ? 'on' : ''}"></i>`).join('')}</span>` : ''}</p></div>`).join('');
    $('b-job').innerHTML = b.job.map(P).join('');
    $('b-needlead').textContent = gov ? T('brief.gov_win') : T('brief.escape_win');
    if (!gov) $('b-need').innerHTML = b.need.map(n => `<li class="${n.done ? 'done' : 'todo'} st"><details><summary><b>${esc(n.name)}</b><span>${esc(n.status)}</span></summary>${n.now ? `<p>${esc(n.now)}</p>` : ''}</details></li>`).join('');
    else $('b-need').innerHTML = b.need.map(n => `<li class="${n.done ? 'done' : 'todo'}"><span class="tick" aria-hidden="true">${n.done ? '✓' : ''}</span><span class="nm"><b>${esc(n.name)}</b>${n.now ? `<span>${esc(n.now)}</span>` : ''}</span><span class="pips" aria-hidden="true">${Array.from({ length: n.of }, (_, k) => `<i class="${k < n.have ? 'on' : ''}"></i>`).join('')}</span></li>`).join('');
    $('b-start').textContent = gov ? T('brief.start', { n: round }) : round <= 1 && s.pos === 0 ? T('brief.begin') : T(b.arrived ? 'brief.go_on' : 'brief.back');
    $('brief').hidden = false; $('brief').scrollTop = 0; $('b-start').focus({ preventScroll: true });
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
    $('phasehint').textContent = T(`hint.${gov ? 'gov_' : ''}${phase}`);
    requestAnimationFrame(() => document.body.style.setProperty('--phaseh', $('phasebar').offsetHeight + 'px'));
    $('phasedone').hidden = phase !== 'phone';
    const card = $('phasecard'), showCard = phase === 'news' || phase === 'roll' || phase === 'sosa';
    const was = card.dataset.ph; card.dataset.ph = phase;
    card.hidden = !showCard; $('herehead').hidden = showCard; $('approaches').hidden = showCard; $('lvlhead2').hidden = showCard;
    if (was !== phase) { $('tab-here').scrollTop = 0; $('tab-phone').scrollTop = 0; }
    if (phase === 'news') newsCard(card); else if (phase === 'roll') resultCard(card, result, T(gov ? 'phase.see_came_in' : 'phase.see_sosa'), () => enterPhase('sosa')); else if (phase === 'sosa') sosaCard(card);
  }
  const KIND = { event: 'card.kind_news', rumor: 'card.kind_rumor', hold: 'card.kind_hold' };
  function newsCard(card) {
    if (result && result.from === 'news') { resultCard(card, result, T('action.continue'), () => { result = null; enterPhase(pendingEvent() ? 'news' : 'phone'); }); return; }
    const v = gov ? Gov.view(gov).event : Sim.eventView(s); if (!v) { card.className = ''; card.innerHTML = ''; return; }
    card.className = v.kind;
    card.innerHTML = `<span class="kind">${T(KIND[v.kind])}${v.kind === 'hold' ? ' · ' + T('card.rung', { rung: v.rung }) : ''}</span><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p>`;
    for (const c of v.choices) { const b = document.createElement('button'); b.className = 'choice'; b.disabled = !c.ok || !!s.over || (Tutorial.active() && !Tutorial.allowsOption(c.id)); b.innerHTML = `<b>${esc(c.label)}</b>${c.ok ? mks(c.tags) : `<span class="why">${esc(c.why)}</span>`}`; b.onclick = () => gov ? doGov('evt:' + c.id) : doCommit('evt:' + c.id); card.appendChild(b); }
  }
  function resultCard(card, r, nextLabel, next) {
    if (!r) { card.innerHTML = ''; return; }
    card.className = 'roll';
    const out = r.roll && r.roll.auto ? `<span class="outcome ok">${T('result.no_roll')}</span>` : r.roll ? `<span class="outcome ${r.roll.won ? 'ok' : 'no'}">${T(r.roll.won ? 'result.success' : 'result.failed')}</span><span class="mks"><span class="mk roll">${T('result.rolled', { die: r.roll.die, need: r.roll.need })}</span></span>` : `<span class="outcome ok">${T('result.done')}</span>`;
    const rows = r.from === 'news' && r.theirs.length ? `<ul class="rows">${r.theirs.map(t => `<li class="${t.k}"><i></i><span>${esc(t.t)}</span></li>`).join('')}</ul>` : '';
    card.innerHTML = `<span class="kind">${esc(r.kind)}</span>${r.title ? `<h3>${esc(r.title)}</h3>` : ''}${out}${r.line ? `<p>${esc(r.line)}</p>` : ''}${r.mine.length ? mks(r.mine) : ''}${rows}`;
    const b = document.createElement('button'); b.className = 'primary next'; b.textContent = nextLabel; b.onclick = () => { Sfx.click(); next(); }; card.appendChild(b);
  }
  function sosaCard(card) {
    card.className = 'sosa';
    // what happened, in short lines: your move, then what changed while it took its hours. The full sentences are in the log.
    const r = result, out = !r || r.waited ? '' : r.roll && r.roll.auto ? `<span class="outcome ok">${T('result.no_roll')}</span>` : r.roll ? `<span class="outcome ${r.roll.won ? 'ok' : 'no'}">${T(r.roll.won ? 'result.success' : 'result.failed')}</span><span class="mks"><span class="mk roll">${T('result.rolled', { die: r.roll.die, need: r.roll.need })}</span></span>` : '';
    const head = r && r.waited ? `<h3>${esc(r.title)}</h3>` : r ? `<div class="automove">${r.title ? `<h3>${esc(r.title)}</h3>` : ''}${out}${r.line ? `<p>${esc(r.line)}</p>` : ''}${r.mine.length ? mks(r.mine) : ''}</div><span class="kind">${T(gov ? 'sosa.kind_gov' : 'sosa.kind')}</span>` : `<h3>${esc(cap(T(roundSum.hours === 1 ? 'sosa.title_one' : 'sosa.title', { hours: Sim.num(roundSum.hours), time: short(s.hour) })))}</h3>`;
    const quiet = T(gov ? 'sosa.quiet_gov' : 'sosa.quiet');
    let exp = 0; const list = roundSum.theirs.filter(t => { if (t.exp) { exp += t.exp; return false; } return true; });
    if (exp && !gov) list.unshift({ k: exp > 0 ? 'enemy' : 'gain', t: T(exp > 0 ? 'sum.attention_up_to' : 'sum.attention_down_to', { n: s.exposure }) });
    else if (exp) list.unshift({ k: 'news', t: T('sum.exposure_round', { n: Math.abs(exp) }) });
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
        case 'roll': if (!e.who && !after && e.bonus && e.bonus.length && !gov) { const names = e.bonus.map(t => cardsFor(t)[0]).filter(Boolean); if (names.length) r.mine.push({ k: 'gain', t: cap(T('sum.helped', { list: names.map(inSentence).join(', ') })) }); }
          if (e.who) r.theirs.push({ k: e.won ? 'gain' : 'enemy', t: T('sum.person', { person: pname(e.who).split(' ')[0], what: T(e.pressed ? (e.won ? 'sum.held_firm' : 'sum.talked') : (e.won ? 'sum.delivered' : 'sum.not_yet')) }) }); else if (!r.roll && !after) r.roll = e; break;
        case 'say':
          if (!after && !r.line && (e.who === 'narrator' || e.featured)) r.line = e.who === 'narrator' ? e.text : `${pname(e.who)}: ${e.text}`;
          break;
        case 'exposure': if (after) expTheirs += e.delta; else expMine += e.delta; break;
        case 'card': bucket.push({ k: 'gain', t: T('sum.card', { name: e.name }) }); break;
        case 'cardlost': bucket.push({ k: 'lose', t: T('sum.lost', { name: e.name }) }); break;
        case 'travel': r.mine.push({ k: 'gain', t: T('sum.reached', { place: Data.LEVELS[e.to].short }) }); break;
        case 'betrayal': r.mine.push({ k: 'risk', t: T('sum.sold', { person: pname(e.who).split(' ')[0] }) }); break;
        case 'stage': r.theirs.push({ k: 'gain', t: e.label[0].toUpperCase() + e.label.slice(1) }); break;
        case 'enemy': r.theirs.push({ k: 'enemy', t: gov ? e.text : enemyShort(e) }); break;
        case 'hold': r.theirs.push({ k: 'enemy', t: T('sum.hold', { title: e.title }) }); break;
        case 'dispatch': r.theirs.push({ k: 'news', t: T('sum.news', { title: e.title }) }); break;
        case 'message': r.theirs.push({ k: 'news', t: T('sum.message', { name: pname(e.from) }) }); break;
        case 'report': bucket.push({ k: e.from === 'enemy' ? 'enemy' : 'news', t: `${pname(e.from)}: ${e.text.replace(/ \(.*\)$/, '')}` }); break;
        case 'order': r.title = r.title || e.name; break;
        default: break;
      }
    }
    if (expMine) r.mine.unshift({ k: expMine > 0 ? 'up' : 'down', t: T('sum.exposure', { signed: (expMine > 0 ? '+' : '') + expMine }) });
    if (expTheirs) r.theirs.unshift({ k: expTheirs > 0 ? 'enemy' : 'gain', exp: expTheirs, t: T(expTheirs > 0 ? 'sum.exposure_rose' : 'sum.exposure_fell', { n: Math.abs(expTheirs) }) });
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
  function outcomeLine(o) { return o.win ? T('daily.out', { hours: s.hour, round }) : o.kind === 'clock' ? T('daily.clock', { round }) : o.kind === 'deal' ? T('daily.deal', { round }) : o.kind === 'landed' ? T('daily.landed', { round }) : T('daily.arrest', { round }); }
  function shareText() { if (gov) { const r = Gov.shareGrid(gov); return T('gov.share', { result: r.result, grid: r.grid, on: r.on, total: r.total, url: location.href.split('#')[0] }); } return T('daily.share', { date: daily.label, line: outcomeLine(s.over), url: location.href.split('#')[0] }); }
  function animate(events) {
    for (const e of events) {
      switch (e.type) {
        case 'say': Render.enqueue({ dur: 10, start() { log(e.who, e.text); } }); break;
        case 'attempt': Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.try', { name: e.name })), 'sys'); } }); break;
        case 'roll': if (!e.who && e.auto) { Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.no_roll')), 'roll'); } }); }
                     else if (!e.who) { Render.dice(e.die, e.need, e.won); Render.enqueue({ dur: 10, start() { Sfx.dice(); log('sys', esc(`${e.bonus && e.bonus.length ? T('log.rolled_lowered', { die: e.die, need: e.need, list: e.bonus.join(', ') }) : T('log.rolled', { die: e.die, need: e.need })} ${T(e.won ? 'log.success' : 'log.failed')}`), 'roll'); } }); }
                     else Render.enqueue({ dur: 10, start() { log('sys', esc(T(e.pressed ? (e.won ? 'log.pressed_holds' : 'log.pressed_breaks') : (e.won ? 'log.ally_delivers' : 'log.ally_not_yet'), { name: pname(e.who), die: e.die, need: e.need })), 'roll'); } }); break;
        case 'exposure': if (!gov) Render.float(Render.W * Render.SCALE / 2, 160, T('float.police_attention', { signed: (e.delta > 0 ? '+' : '') + e.delta }), e.delta > 0 ? '#FF7A90' : '#7FB2E5'); // her number stays hidden on the government side Render.enqueue({ dur: 10, start() { Sfx.heat(e.delta > 0); } }); break;
        case 'belief': Render.enqueue({ dur: 300, start() { Sfx.click(); } }); break;
        case 'card': Render.enqueue({ dur: 10, start() { Sfx.arranged(); log('sys', esc(T('log.gives', { name: pname(e.from), card: e.name })), 'sys'); } }); break;
        case 'cardlost': Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.card_lost', { card: e.name })), 'sys'); } }); break;
        case 'commit': Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.owe', { name: pname(e.to), text: e.text })), 'sys'); } }); break;
        case 'stage': Render.enqueue({ dur: 10, start() { Sfx.arranged(); } }); break;
        case 'job': Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.reply_by', { name: pname(e.ally), time: e.dueText })), 'sys'); } }); break;
        case 'message': Render.ring(); Render.enqueue({ dur: 10, start() { Sfx.ring(); log('sys', esc(T('log.message', { name: pname(e.from) })), 'sys'); } }); break;
        case 'answered': Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.answer', { label: e.label })), 'sys'); } }); break;
        case 'enemy': Render.enemy(); Render.enqueue({ dur: 10, start() { Sfx.patrol(); enemyLog.push(e.text); log('enemy', e.text, 'enemy'); } }); break;
        case 'report': Render.ring(); Render.enqueue({ dur: 10, start() { Sfx.ring(); log(e.from, e.text); } }); break;
        case 'order': Render.enqueue({ dur: 10, start() { log('sys', esc(T('log.order', { name: e.name })), 'sys'); } }); break;
        case 'travel': Render.travel(); Render.enqueue({ dur: 10, start() { Sfx.step(0); } }); break;
        case 'dispatch': Render.enqueue({ dur: 10, start() { if (Sfx.sting) Sfx.sting('event'); log('sys', esc(T('log.news', { title: e.title })), 'sys'); } }); break;
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
    for (const a of v.orders) { if (sel === a.id) box.appendChild(expanded(a, T('action.send_order'), () => doGov(a.id))); else box.appendChild(approachBtn(a, phase === 'move' && Tutorial.allowsApproach(a.id))); }
    const rep = document.createElement('div'); rep.className = 'reports'; rep.innerHTML = `<h2>${T('nav.reports')}</h2>` + (v.reports.length ? v.reports.map(r => `<article class="report"><div class="src"><span>${esc(r.source)}</span><span>${r.age === 'just now' ? T('report.just_now') : T('report.ago', { age: `<span class="mono">${r.age}</span>` })}</span></div><p>${esc(r.text)}</p><div class="pv"><span><b>${T('report.proves')}</b><span>${esc(r.proves)}</span></span><span><b>${T('report.not_prove')}</b><span>${esc(r.doesnt)}</span></span></div></article>`).join('') : `<p class="hint">${T('report.empty')}</p>`);
    box.appendChild(rep);
    $('wait').disabled = !!s.over || phase !== 'move' || !Tutorial.allowsWait(); $('waitdark').hidden = true;
  }
  function renderGovPhone() {
    const v = Gov.view(gov); const inbox = $('inbox'); inbox.innerHTML = '';
    $('waiting').textContent = v.messages.length ? T('phone.waiting', { n: v.messages.length }) : ''; const badge = $('tab-badge'); badge.hidden = !v.messages.length; badge.textContent = v.messages.length;
    if (!v.messages.length) inbox.innerHTML = `<p class="hint">${T('desk.empty')}</p>`;
    for (const m of v.messages) inbox.appendChild(thread(m.from, m.role, m.text, m.options.map(o => Object.assign({}, o, { go: () => doGov(m.id, o.id) })), (o) => (phase === 'phone' || phase === 'move') && Tutorial.allowsOption(o.id)));
    const calls = $('calls'); calls.innerHTML = '';
    for (const c of v.calls) { if (sel === c.id && c.ok) { const bx = document.createElement('div'); bx.className = 'callbox'; bx.innerHTML = `<b>${esc(c.name)}</b><ul class="preview">${c.preview.map(x => `<li>${esc(x)}</li>`).join('')}</ul><div class="row"><button class="primary commit">${T('action.send')}</button><button class="cancel">${T('action.cancel')}</button></div>`; bx.querySelector('.commit').onclick = () => doGov(c.id); bx.querySelector('.cancel').onclick = () => { sel = null; renderAll(); }; calls.appendChild(bx); } else calls.appendChild(callBtn(c, (phase === 'phone' || phase === 'move') && phoneCalls < 1 && Tutorial.allowsCall(c.id), c.name)); }
  }
  function renderGovHand() {
    const h = $('hand'); h.innerHTML = '';
    for (const id of gov.hand) { const c = Data.GOV_CARDS[id]; const here = c.reach.includes(Data.LEVELS[gov.belief].id); h.appendChild(cardEl(c, here, c.from, T(here ? 'gov.counts_here' : c.reach.includes('airfield') && !c.reach.includes('residence') ? 'gov.counts_abroad' : 'gov.counts_valdoria'))); }
    if (!gov.hand.includes('esm_intro')) { const c = Data.GOV_CARDS.esm_intro; h.appendChild(cardEl(c, false, T('gov.not_yours'), T('gov.would_start'))); }
  }
  function renderGovRoute() {
    const v = Gov.view(gov); const rail = $('rail'); rail.innerHTML = ''; $('board').innerHTML = '';
    Data.LEVELS.forEach((L, i) => {
      const li = document.createElement('li'); li.className = (i === gov.belief ? 'current' : '') + (i === 4 ? ' border' : '') + (i === 5 ? ' esm' : '');
      const reps = v.reports.filter(r => r.at === i).map(r => `<span class="need notyet"><b>${esc(T('route.report_src', { source: r.source, age: r.age === 'just now' ? T('report.just_now') : T('report.ago', { age: r.age }) }))}</b><span>${esc(r.text)} ${esc(r.doesnt ? T('route.does_not_prove', { what: r.doesnt.charAt(0).toLowerCase() + r.doesnt.slice(1) }) : '')}</span></span>`).join('');
      const reqs = v.requests.filter(r => r.at === i).map(r => `<span class="need ${r.state}"><b>${esc(r.title)}</b><span>${esc(r.sub)}</span></span>`).join('');
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
    if (sid.startsWith('evt:')) { result = summarize(r.events, T('result.your_choice'), null); result.from = 'news'; phase = 'news'; }
    else if (sid.startsWith('req:')) { phoneCalls += 1; phase = 'move'; if (window.innerWidth < 1000) setTab('here'); } // one request ends the desk step, as one call ends the phone step
    else if (sid.startsWith('msg:')) { if (window.innerWidth < 1000 && !waitingMsgs()) setTab('here'); }
    else { movedThisRound = true; result = sm; if (sid === 'wait') { result.kind = T('result.waited'); result.title = T('result.waited_title'); result.waited = true; } phase = 'sosa'; if (window.innerWidth < 1000) setTab('here'); }
    renderAll(); saveRun();
  }

  // ---- start, title, boot --------------------------------------------------------------
  function showStart() {
    const box = $('start-chars'); box.innerHTML = '';
    const first = !seen(), saved = savedRun();
    $('continue').hidden = !saved; if (saved) $('continue').textContent = T('start.continue', { name: saved.gov ? Data.GOV.name : Data.CHARACTERS[saved.who].name });
    $('start-demo-note').textContent = T('start.demo_note', { name: Data.CHARACTERS[Tutorial.WHO].name });
    $('start-tutorial').className = first ? 'primary' : 'pill ghost';
    $('start-free').textContent = T('start.pick');
    let n = 0;
    for (const k in Data.CHARACTERS) { const c = Data.CHARACTERS[k]; n += 1; const b = document.createElement('button'); b.className = 'whobtn w' + n; b.innerHTML = `<span class="avatar" aria-hidden="true">${initials(c.name)}</span><span class="n"><b>${esc(c.name)}</b><span>${esc(T(c.pronoun === 'she' ? 'start.sibling_her' : 'start.sibling_his', { rel: c.sibling.rel.replace('your ', ''), name: c.sibling.short }))}</span><span class="blurb">${esc(c.blurb)}</span></span>`; b.onclick = () => { Sfx.unlock(); Sfx.click(); showMap((d) => newRun(k, false, false, d)); }; box.appendChild(b); }
    const g = document.createElement('button'); g.className = 'whobtn w3'; g.innerHTML = `<span class="avatar" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg></span><span class="n"><b>${esc(Data.GOV.name)}</b><span>${esc(Data.GOV.title[0].toUpperCase() + Data.GOV.title.slice(1))}</span><span class="blurb">${esc(Data.GOV.blurb)}</span></span>`; g.onclick = () => { Sfx.unlock(); Sfx.click(); newGovRun(); }; box.appendChild(g);
    const url = Render.runwayStill(); if (url) { $('start-art').style.backgroundImage = `url(${url})`; $('start').style.setProperty('--runway', `url(${url})`); }
    const D = dailyInfo(), done = dailyResult(D.key);
    $('daily-date').textContent = D.label; $('daily-note').textContent = done ? T('daily.done_note', { line: done.line }) : T('daily.note');
    if (Sfx.ambience) Sfx.ambience(null);
    $('start').hidden = false; document.body.classList.remove('phased');
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
    $('start-gov-tutorial').onclick = () => { Sfx.unlock(); Sfx.click(); newGovRun(true); };
    $('start-tutorial').onclick = () => { Sfx.unlock(); Sfx.click(); newRun(null, true); };
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
    const released = () => { if (gov && !Tutorial.active()) Gov.endTutorial(gov); };
    $('coach-next').onclick = () => { Sfx.click(); Tutorial.next(); released(); renderAll(); saveRun(); };
    $('coach-leave').onclick = () => { Sfx.click(); Tutorial.stop(); released(); log('sys', T('log.tutorial_ended'), 'sys'); renderAll(); saveRun(); };
    const toggleMute = () => { Sfx.unlock(); Sfx.setMuted(!Sfx.isMuted()); $('mute').setAttribute('aria-label', T(Sfx.isMuted() ? 'sound.off' : 'sound.on')); $('mute-wave').style.display = Sfx.isMuted() ? 'none' : ''; document.querySelector('#menu2 [data-act=mute]').textContent = T(Sfx.isMuted() ? 'sound.menu_off' : 'sound.menu_on'); };
    const toggleHelp = () => { $('helpbox').hidden = !$('helpbox').hidden; if (!$('helpbox').hidden) setTab('phone'); };
    $('mute').onclick = toggleMute; $('help').onclick = toggleHelp;
    document.querySelectorAll('#menu2 button').forEach(b => b.onclick = () => ({ demo: () => $('demo').onclick(), startscreen: () => $('startscreen').onclick(), help: toggleHelp, install: () => $('install').onclick(), mute: toggleMute, credits: () => $('credits-open').onclick() })[b.dataset.act]());
    setInterval(() => { if (!s) return; const b = Render.busy(); if (document.body.classList.contains('busy') !== b) document.body.classList.toggle('busy', b); }, 120);
    window.addEventListener('resize', () => { if (s) renderAll(); });
    pwa();
    if (replayFromHash()) return;
    s = Sim.newRun(1, 'woman'); Render.setState(s); showTitle();
  }
  return { boot };
})();
window.addEventListener('DOMContentLoaded', UI.boot);
