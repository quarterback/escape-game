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
  const COLORS = { narrator: '#B9B0D9', sibling: '#C9A4F5', aide: '#E85DF0', nando: '#FF9F43', sponsor: '#FFC93C', host: '#FF9F43', official: '#7FB2E5', holt: '#B9B0D9', theo: '#FF9F43', press: '#D8D2EE', pilot: '#7FB2E5', enemy: '#FF7A90', minister: '#FFC93C', watch: '#D8D2EE', desk: '#D8D2EE', sys: '#B9B0D9' };
  const short = (h) => { const [d, t] = Sim.clockText(h).split(' '); return `${d.slice(0, 3)} ${t}`; };
  const initials = (name) => name.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const pname = (id) => gov ? Gov.personName(gov, id) : Sim.personName(s, id);

  function log(whoId, text, cls) {
    if (!text) return;
    const el = document.createElement('div'); el.className = 'line ' + (cls || '');
    const name = whoId === 'narrator' || whoId === 'sys' ? '' : whoId === 'enemy' ? (gov ? 'Inspector Sosā' : Data.ENEMY.name) : pname(whoId);
    el.innerHTML = `${name ? `<b style="color:${COLORS[whoId] || '#ccc'}">${esc(name)}</b> ` : ''}<span>${text}</span>`;
    const box = $('dialogue'); box.appendChild(el); box.scrollTop = box.scrollHeight;
  }

  // ---- storage: first visit, saved run --------------------------------
  const SEEN = 'coalition.seen', SAVE = 'coalition.run';
  const seen = () => { try { return !!localStorage.getItem(SEEN); } catch (e) { return true; } };
  const markSeen = () => { try { localStorage.setItem(SEEN, '1'); } catch (e) { /* storage blocked */ } };
  function saveRun() {
    try {
      if (!s || s.over) { localStorage.removeItem(SAVE); return; }
      localStorage.setItem(SAVE, JSON.stringify({ round, daily: daily ? daily.key : null, who, gov: gov ? Gov.serialize(gov) : null, s: gov ? null : Sim.serialize(s), tut: Tutorial.active() ? Tutorial.index() : -1, log: enemyLog.slice(-8), lines: Array.from($('dialogue').children).slice(-30).map(l => l.outerHTML) }));
    } catch (e) { /* storage blocked: the run simply is not resumable */ }
  }
  function savedRun() { try { const j = localStorage.getItem(SAVE); return j ? JSON.parse(j) : null; } catch (e) { return null; } }
  function resumeRun() {
    const r = savedRun(); if (!r) return false;
    who = r.who; enemyLog = r.log || []; sel = null; Sfx.theme(false);
    if (r.gov) { gov = Gov.restore(r.gov); s = gov.c; Tutorial.stop(); }
    else { gov = null; s = Sim.restore(r.s); if (r.tut >= 0) { Tutorial.start(); while (Tutorial.index() < r.tut) Tutorial.forward(); } else Tutorial.stop(); }
    Render.setState(s, gov); Render.view.over = null; Render.view.queue = []; Render.view.current = null;
    $('dialogue').innerHTML = (r.lines || []).join(''); $('start').hidden = true; document.body.classList.toggle('gov', !!gov);
    round = r.round || 1; daily = r.daily && r.daily === dailyInfo().key ? dailyInfo() : null;
    setTab('here'); renderAll(); if (!gov) startRound(true); return true;
  }

  // ---- runs --------------------------------------------------------------
  function newRun(w, demo, isDaily) {
    markSeen(); gov = null; document.body.classList.remove('gov'); daily = isDaily ? dailyInfo() : null; round = 1;
    if (daily) { who = daily.who; s = Sim.newRun(daily.seed, who, { daily: true }); Tutorial.stop(); }
    else if (demo) { who = Tutorial.WHO; s = Sim.newRun(Tutorial.SEED, who, { dice: Tutorial.DICE, enemy: Tutorial.ENEMY, tutorial: true }); Tutorial.start(); }
    else { who = w; s = Sim.newRun((Math.random() * 1e9) >>> 0, who); Tutorial.stop(); }
    sel = null; enemyLog = []; Sfx.theme(false);
    Render.setState(s); Render.view.over = null; Render.view.queue = []; Render.view.current = null;
    $('dialogue').innerHTML = ''; $('start').hidden = true; setTab('here');
    const c = Data.CHARACTERS[who];
    log('sys', `${Sim.clockText(0)}. You are ${c.name}, ${c.title}. ${c.sibling.name}, ${c.sibling.rel}, is abroad and has started on the aircraft.`, 'sys');
    animate(s._boot); renderAll(); startRound(true); saveRun();
  }
  function newGovRun() {
    markSeen(); Tutorial.stop(); who = 'gov'; sel = null; enemyLog = []; Sfx.theme(false);
    gov = Gov.newRun((Math.random() * 1e9) >>> 0); s = gov.c; document.body.classList.add('gov');
    Render.setState(s, gov); Render.view.over = null; Render.view.queue = []; Render.view.current = null;
    $('dialogue').innerHTML = ''; $('start').hidden = true; setTab('here');
    log('sys', `${Sim.clockText(0)}. You are ${Data.GOV.name}, ${Data.GOV.title}. ${Data.CHARACTERS[gov.target].name} lost on Saturday and the court has barred her from leaving. The minister wants a location.`, 'sys');
    animate(gov._boot); renderAll(); saveRun();
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
    $('clock').textContent = short(s.hour); $('left').textContent = `${hoursLeft} h`; $('deadline').textContent = deadline; $('deadline2').textContent = deadline;
    const L = Data.LEVELS[s.pos];
    if (gov) {
      const v = Gov.view(gov);
      $('goaltxt').textContent = `Stop ${v.her} before`; $('leftverb').textContent = `Stop ${v.her} before`;
      $('sosa-name').textContent = Data.CHARACTERS[gov.target].name; $('sosa-where').textContent = v.lastReport ? `Last report ${v.lastReport}` : 'No reports yet.';
      $('sosa-next').textContent = v.lastReport || 'none'; $('sosa-nextl').textContent = 'Last report';
      $('sosa').querySelector('.exp').hidden = true; $('heat').hidden = true; $('sosa').querySelector('.arrive').textContent = `The minister wants a location by ${short(v.ministerBy)}.`;
      $('expl-l').textContent = 'Suspected:'; $('expl-b').textContent = v.suspectName; $('heat2').hidden = true; $('heatnum2').textContent = v.lastReport ? 'last report ' + v.lastReport : 'no reports';
      $('lvlname').textContent = v.levelName; $('lvlobj').textContent = v.objective; $('lvlname2').textContent = v.levelName; $('lvlobj2').textContent = v.objective;
      return;
    }
    $('goaltxt').textContent = 'Leave Esmeraldan airspace by'; $('leftverb').textContent = 'Out by';
    const right = s.belief === s.pos;
    $('sosa-name').textContent = right ? 'Sosā, looking here' : `Sosā, looking at ${Data.LEVELS[s.belief].short}`;
    $('sosa-where').textContent = `Looking at ${Data.LEVELS[s.belief].short.toLowerCase() === Data.LEVELS[s.belief].short ? Data.LEVELS[s.belief].short : 'the ' + Data.LEVELS[s.belief].short.toLowerCase()}. He is ${right ? 'right.' : 'wrong.'}`;
    $('sosa-nextl').textContent = 'Next move';
    $('sosa-next').textContent = `in ${Math.max(1, Sim.ENEMY_EVERY - (s.hour - s.lastEnemy))} h`;
    $('sosa').querySelector('.exp').hidden = false; $('heat').hidden = false; $('sosa').querySelector('.arrive').textContent = s.hold ? `At 10 you are held again. Holds: ${s.hold} of 3.` : 'At 10 you are held.';
    for (const id of ['heat', 'heat2']) { const h = $(id); h.innerHTML = ''; for (let i = 0; i < Sim.EXPOSURE_LIMIT; i++) { const d = document.createElement('i'); d.className = (i < s.exposure ? 'on' : '') + (i >= 7 ? ' hot' : ''); h.appendChild(d); } }
    $('heatnum').textContent = s.exposure; $('heatnum2').textContent = `${s.exposure}/10`; $('expl-l').textContent = 'Exposure'; $('expl-b').textContent = ''; $('heat2').hidden = false;
    $('lvlname').textContent = L.name; $('lvlobj').textContent = L.objective; $('lvlname2').textContent = L.name; $('lvlobj2').textContent = L.objective;
    $('whoami').textContent = `${Data.CHARACTERS[who].name}, ${Data.CHARACTERS[who].title}`;
  }

  // ---- the coach -----------------------------------------------------------
  function renderCoach() {
    const box = $('coach'); document.querySelectorAll('.tut-hi').forEach(el => el.classList.remove('tut-hi'));
    if (!Tutorial.active()) { box.hidden = true; document.body.classList.remove('coaching'); return; }
    const st = Tutorial.step(); box.hidden = false; document.body.classList.add('coaching');
    $('coach-step').textContent = `Guided run · step ${Tutorial.index() + 1} of ${Tutorial.STEPS.length}`;
    $('coach-title').textContent = st.title; $('coach-body').innerHTML = st.html;
    $('coach-next').hidden = !st.allow.next; $('coach-next').textContent = Tutorial.isLast() ? 'Finish' : 'Next';
    $('coach-do').hidden = !!st.allow.next;
    for (const q of st.highlight) { const el = document.querySelector(q); if (el) el.classList.add('tut-hi'); }
    requestAnimationFrame(() => $('panels').style.setProperty('--coachh', box.offsetHeight + 'px'));
    // on the phone, switch to the tab the step points at
    if (window.innerWidth < 1000 && st.highlight.length && !['news', 'roll', 'sosa'].includes(phase)) { const q = st.highlight[0]; const t = q === '#inbox' || q === '#calls' || q === '#arrangements' ? 'phone' : q === '#hand' || q === '#people' ? 'hand' : q === '#enemy' || q === '#board' ? 'route' : null; if (t) setTab(t); else if (q === '#approaches') setTab('here'); }
  }

  // ---- Here: approaches with a die face -------------------------------------
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function dieFace(need) { const n = Math.max(1, Math.min(6, need)); return `<span class="die" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<i class="${PIPS[n].includes(i) ? 'p' : ''}"></i>`).join('')}</span>`; }
  const usesLabel = (a) => a.bonus && a.bonus.length ? `<span class="uses">Uses ${a.bonus.map(u => `${/^[aeiou]/i.test(u.tag) ? 'an' : 'a'} ${u.tag} card`).join(', ')}</span>` : '';
  function approachBtn(a, allowed) {
    const b = document.createElement('button'); b.className = 'act approach' + (a.ok ? '' : ' no') + (sel === a.id ? ' sel' : '') + (a.ok && a.need <= 1 ? ' sure' : '') + (a.ok && a.need > 6 ? ' hard' : '');
    if (!allowed) { b.classList.add('off'); b.disabled = true; }
    const marks = []; if (a.with && a.with !== 'self' && s.people[a.with]) { const [c, t] = whoMark(a.with); marks.push({ k: c, t: `${pname(a.with).split(' ')[0]}: ${t}` }); } if (a.night) marks.push({ k: 'night', t: 'Night only' });
    b.innerHTML = `${dieFace(a.need)}<span class="body"><span class="nm">${esc(a.name)}</span>${marks.length ? mks(marks) : ''}${a.ok ? `<span class="meta"><span class="nd">${a.need <= 1 ? 'Certain' : a.need > 6 ? 'No die can' : a.need + '+'}</span>${a.need > 1 && a.need <= 6 ? ' ' + a.odds : ''} · <span class="hrs">${a.hours} h</span>${a.who ? ' · ' + esc(a.who) : ''}</span>` : `<span class="why">${esc(a.why)}</span>`}</span>${a.ok && window.innerWidth >= 1000 ? usesLabel(a) : ''}`;
    b.onclick = () => { Sfx.unlock(); sel = sel === a.id ? null : a.id; Sfx.select(); renderAll(); };
    return b;
  }
  function expanded(a, commitLabel, onCommit) {
    const box = document.createElement('div'); box.className = 'actbox';
    box.innerHTML = `<div class="act">${dieFace(a.need)}<span class="body"><span class="nm">${esc(a.name)}</span><span class="meta"><span class="nd">${a.need <= 1 ? 'Certain' : a.need > 6 ? 'No die can' : a.need + '+'}</span>${a.need > 1 && a.need <= 6 ? ' ' + a.odds : ''} · <span class="hrs">${a.hours} h</span>${a.who ? ' · ' + esc(a.who) : ''}</span></span>${usesLabel(a)}</div><p>${esc(a.text || '')}</p><ul class="preview">${a.preview.slice(1).map(x => `<li>${esc(x)}</li>`).join('')}</ul>${a.ok ? '' : `<p class="why" style="color:var(--coral2)">${esc(a.why)}</p>`}<div class="row"><button class="primary commit" ${a.ok && !s.over ? '' : 'disabled'}>${commitLabel}</button><button class="cancel">Cancel</button></div>`;
    box.querySelector('.commit').onclick = onCommit; box.querySelector('.cancel').onclick = () => { sel = null; renderAll(); };
    return box;
  }
  function renderHere() {
    const A = Sim.actions(s); const box = $('approaches'); box.innerHTML = '';
    for (const a of A.approaches) { if (sel === a.id) box.appendChild(expanded(a, 'Commit', () => doCommit(a.id))); else box.appendChild(approachBtn(a, Tutorial.allowsApproach(a.id) && phase === 'move')); }
    $('wait').disabled = !!s.over || !Tutorial.allowsWait() || phase !== 'move';
  }

  // ---- the phone: a thread, then calls --------------------------------------
  function thread(from, role, text, options, optClass) {
    const d = document.createElement('div'); d.className = 'msg';
    const name = pname(from), cls = from === 'enemy' ? ' enemy' : from === 'press' ? ' press' : '';
    d.innerHTML = `<div class="who"><span class="avatar${cls}" aria-hidden="true">${initials(name)}</span><span class="n"><b>${esc(name)}</b><span>${esc(role)}</span></span></div><p class="bubble">${esc(text)}</p><div class="opts"></div>`;
    const opts = d.querySelector('.opts');
    for (const o of options) { const b = document.createElement('button'); b.className = 'opt' + (optClass(o) ? '' : ' off'); b.disabled = !o.ok || !!s.over || !optClass(o); b.innerHTML = `<span class="l">${esc(o.label)}${o.hours ? `<span class="mono gold">${o.hours} h</span>` : ''}</span><small>${esc(o.ok ? o.effect : o.why)}</small>`; b.onclick = () => o.go(); opts.appendChild(b); }
    return d;
  }
  const PHONE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A4F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"></path></svg>`;
  function callBtn(c, allowed, label) {
    const b = document.createElement('button'); b.className = 'call' + (c.ok ? '' : ' no') + (sel === c.id ? ' sel' : '') + (allowed ? '' : ' off'); b.disabled = !allowed;
    b.innerHTML = `${PHONE}<span class="t">${esc(label)}</span><span class="hrs">${c.ok ? c.hours + ' h' : esc(c.why)}</span>`;
    b.onclick = () => { Sfx.unlock(); sel = sel === c.id ? null : c.id; Sfx.select(); renderAll(); };
    return b;
  }
  function renderPhone() {
    const A = Sim.actions(s); const inbox = $('inbox'); inbox.innerHTML = '';
    $('waiting').textContent = A.messages.length ? `${A.messages.length} waiting` : ''; const badge = $('tab-badge'); badge.hidden = !A.messages.length; badge.textContent = A.messages.length;
    if (!A.messages.length) inbox.innerHTML = '<p class="hint">No messages waiting.</p>';
    for (const m of A.messages) {
      const role = m.from === 'sibling' ? `${Data.CHARACTERS[who].sibling.rel[0].toUpperCase() + Data.CHARACTERS[who].sibling.rel.slice(1).replace('your ', '')}, arranging the aircraft` : m.from === 'enemy' ? Data.ENEMY.role : (Data.PEOPLE[m.from] || {}).role || '';
      inbox.appendChild(thread(m.from, role, s.inbox.find(x => x.id === m.msgId).text, m.options.map(o => Object.assign({}, o, { go: () => doCommit(m.id, o.id) })), (o) => Tutorial.allowsOption(o.id) && phase === 'phone'));
    }
    const calls = $('calls'); calls.innerHTML = '';
    for (const c of A.calls) {
      const arr = c.id.replace(/^call:/, ''), def = Data.ARRANGEMENTS[arr];
      const label = c.ok ? `${pname(c.ally)} about ${arr === 'permission' ? 'your visa' : def.name.toLowerCase()}` : `${def.name}: ${c.name.split(': ')[1] || c.name}`;
      if (sel === c.id && c.ok) { const box = document.createElement('div'); box.className = 'callbox'; box.innerHTML = `<b>${esc(label)}</b><ul class="preview">${c.preview.map(x => `<li>${esc(x)}</li>`).join('')}</ul><div class="row"><button class="primary commit">Call</button><button class="cancel">Cancel</button></div>`; box.querySelector('.commit').onclick = () => doCommit(c.id); box.querySelector('.cancel').onclick = () => { sel = null; renderAll(); }; calls.appendChild(box); }
      else calls.appendChild(callBtn(c, Tutorial.allowsCall(arr) && phase === 'phone' && phoneCalls < 1, label));
    }
  }

  // ---- the hand: coloured cards -----------------------------------------------
  function cardEl(c, here, from, state) {
    const d = document.createElement('article'); d.className = `card t-${c.tag}` + (here ? '' : ' far');
    d.innerHTML = `<span class="tag">${c.tag[0].toUpperCase() + c.tag.slice(1)}</span><h3>${esc(c.name)}</h3><p>${esc(c.text)}</p><p class="works"><b>Works on:</b> ${esc(c.works)}</p><p class="foot"><span>${esc(from)}</span><span class="st">${state}</span></p>`;
    return d;
  }
  function cardState(c, id) {
    if (Sim.reaches(s, id)) return 'Counts here';
    const first = Data.LEVELS.findIndex(L => c.reach.includes(L.id));
    if (first > s.pos) return `Counts at ${first === 4 ? 'the line' : Data.LEVELS[first].short}`;
    return 'Not recognized here';
  }
  function renderHand() {
    const h = $('hand'); h.innerHTML = s.hand.length ? '' : '<p class="hint">No cards yet.</p>';
    for (const id of s.hand) { const c = Data.CARDS[id]; h.appendChild(cardEl(c, Sim.reaches(s, id), c.from === 'self' ? 'Yours' : 'From ' + pname(c.from), cardState(c, id))); }
  }

  // ---- the route: one model, a rail on the phone and the board on desktop ------
  const NEED_LABEL = { aircraft: 'Aircraft ready', reception: null, permission: 'Entry visa for Atlanta' };
  function needCells(L) {
    // what gates the good exits of this stop, in one of three states
    const out = [], seen = {};
    for (const a of L.approaches) for (const n of a.needs) {
      let key, title, sub, state;
      if (n.arr) { const def = Data.ARRANGEMENTS[n.arr], cur = s.arr[n.arr], job = s.jobs.find(j => j.arr === n.arr); key = n.arr;
        if (seen[key] && seen[key] >= n.stage) continue; if (seen[key]) out.splice(out.findIndex(x => x.key === key), 1);
        title = n.arr === 'reception' ? (n.stage >= 3 ? 'Officials at the border' : 'Esmeralda expects you') : n.arr === 'aircraft' ? (n.stage >= 4 ? 'Aircraft ready' : n.stage >= 2 ? 'Crew confirmed' : 'Charter booked') : NEED_LABEL[n.arr] || def.name;
        seen[key] = n.stage; out.push({ key, title, sub: '', state: '' }); const slot = out[out.length - 1];
        state = cur.stage >= n.stage ? 'inhand' : job ? 'promised' : 'notyet';
        sub = state === 'inhand' ? def.stages[cur.stage][0].toUpperCase() + def.stages[cur.stage].slice(1) : state === 'promised' ? `${def.stages[cur.stage]}. ${pname(job.ally)} working, due ${short(job.due)}` : (n.arr === 'reception' ? (n.stage >= 3 ? "Vélez's people" : 'Someone at the ministry in Baca has your name') : n.arr === 'permission' ? 'Salek asks the ministry' : def.what);
        slot.sub = sub; slot.state = state; continue; }
      else if (n.card) { if (n.card === 'decoy' || n.card === 'influence') continue; key = 'card' + n.card; const held = s.hand.find(id => Data.CARDS[id].tag === n.card); state = held ? 'inhand' : 'notyet';
        title = n.card === 'document' ? 'Your second passport' : n.card === 'passage' ? 'A passage card' : n.card === 'decoy' ? 'A decoy card' : n.card === 'influence' ? 'An influence card' : `A ${n.card} card`;
        sub = held ? (n.card === 'document' ? 'In hand. The ban lists your other one.' : 'In hand.') : n.card === 'passage' ? 'From Holt or Theo. The freight leaves at midnight.' : `Nobody has given you one.`; }
      else if (n.night) { if (L.id === 'residence') continue; key = 'night'; title = 'Night'; state = Sim.isNight(s) ? 'inhand' : 'notyet'; sub = Sim.isNight(s) ? 'It is night.' : 'After 22:00.'; }
      else continue;
      if (seen[key]) continue; seen[key] = true; out.push({ key, title, sub, state });
    }
    return out;
  }
  function whoActs(i) { return Object.keys(Data.PEOPLE).filter(k => Data.PEOPLE[k].where === i).map(k => ({ k, name: pname(k), trust: s.people[k].trust >= 2, turned: s.people[k].turned })); }
  const abroad = () => ['sibling', 'sponsor'].map(k => ({ k, name: pname(k), trust: s.people[k].trust >= 2, turned: s.people[k].turned, role: k === 'sibling' ? 'arranging the aircraft' : 'asking Atlanta for your visa' }));
  function whoMark(k) { const p = s.people[k]; if (!p) return ['unknown', 'Unknown']; if (p.cut) return ['cut', 'Cut off']; if (p.turned) return ['talked', 'Talked']; if (p.known) return ['trust', 'Clean']; if (p.doubt) return ['doubt', 'Doubted']; if (p.trust >= 2) return ['trust', 'Trusted']; return ['unknown', 'Unknown']; }
  const whoHtml = (w) => { const [c, t] = whoMark(w.k); return `<span class="whoi">${esc(w.name)} <span class="mk ${c}">${t}</span></span>`; };
  function cardNotes(i) {
    const notes = [];
    for (const id of s.hand) { const c = Data.CARDS[id]; const idx = c.reach.map(r => Data.LEVELS.findIndex(L => L.id === r)); const first = Math.min(...idx), last = Math.max(...idx); if (last === i && last < Data.LEVELS.length - 1) notes.push(`<span class="m">${esc(c.name)} stops here.</span>`); if (first === i && first > s.pos) notes.push(`<span class="s">${esc(c.name)} starts here.</span>`); }
    if (i === 4 && !s.hand.includes('intro_vel')) notes.push(`<span class="s">Vélez's card starts here.</span>`);
    return notes.join(' ');
  }
  function renderRoute() {
    // phone: the rail
    const rail = $('rail'); rail.innerHTML = '';
    Data.LEVELS.forEach((L, i) => {
      const li = document.createElement('li'); li.className = (i === s.pos ? 'current' : i < s.pos ? 'passed' : '') + (i === 4 ? ' border' : '') + (i === 5 ? ' esm' : '');
      const needs = needCells(L).map(n => `<span class="need ${n.state}"><b>${esc(n.title)}</b><span>${esc(n.sub)}</span></span>`).join('');
      const w = whoActs(i);
      li.innerHTML = `<span class="line" aria-hidden="true"></span><span class="dot" aria-hidden="true"></span><div class="stop"><div class="nm"><b>${esc(L.short)}</b><span>${i === s.pos ? 'You are here' : i === 4 ? 'The border' : i === 5 ? 'Esmeralda' : ''}</span></div>${i === s.belief ? '<span class="inq">Inquiry looking here</span>' : ''}${w.length ? `<span class="who">Who acts here: ${w.map(whoHtml).join(', ')}</span>` : ''}${needs}${i > s.pos || i === s.pos ? `<span class="cardsnote">${cardNotes(i)}</span>` : ''}</div>`;
      rail.appendChild(li);
    });
    const ab = document.createElement('li'); ab.innerHTML = `<span class="dot" aria-hidden="true" style="visibility:hidden"></span><section id="abroad"><h3>Abroad, by phone</h3>${abroad().map(w => `<span class="who">${whoHtml(w)}, ${w.role}</span>`).join('')}</section>`; rail.appendChild(ab);
    // desktop: the board
    const b = $('board'); b.innerHTML = '';
    const cell = (html, cls) => { const d = document.createElement('div'); d.className = 'cell ' + (cls || ''); d.innerHTML = html; b.appendChild(d); };
    const colCls = (i) => i === s.pos ? 'cur' : i === 5 ? 'esm' : '';
    cell('', 'head'); Data.LEVELS.forEach((L, i) => cell(`<b>${esc(L.short)}</b><span>${i === s.pos ? 'You are here' : i === 4 ? 'The border' : i === 5 ? 'Esmeralda' : ''}</span>`, 'head ' + colCls(i))); cell('<b>Abroad</b><span>By phone</span>', 'head abr');
    const lbl = (t, cls) => { const d = document.createElement('div'); d.className = 'rowlbl ' + (cls || ''); d.textContent = t; b.appendChild(d); };
    lbl('Who acts here'); Data.LEVELS.forEach((L, i) => cell(`<span class="who">${whoActs(i).map(whoHtml).join('')}</span>`, colCls(i))); cell(`<span class="who">${abroad().map(whoHtml).join('')}</span>`, 'abr');
    lbl('Needed to leave'); Data.LEVELS.forEach((L, i) => cell(`<span class="needs">${needCells(L).map(n => `<span class="need ${n.state}"><b>${esc(n.title)}</b><span>${esc(n.sub)}</span></span>`).join('')}</span>`, colCls(i))); cell('', 'abr');
    lbl('Where your cards count');
    const cr = document.createElement('div'); cr.className = 'cardsrow';
    for (const id of s.hand) { const c = Data.CARDS[id]; const idx = c.reach.map(r => Data.LEVELS.findIndex(L => L.id === r)); const a = Math.min(...idx) + 1, z = Math.max(...idx) + 2; const sp = document.createElement('span'); sp.className = `cbar t-${c.tag} card`; sp.style.gridColumn = `${a} / ${z}`; sp.style.cssText += ';min-height:0;transform:none;box-shadow:none;display:block;padding:8px 12px'; sp.textContent = c.name + (z === 6 ? ' stops at the line' : ''); cr.appendChild(sp); }
    if (!s.hand.includes('intro_vel')) { const sp = document.createElement('span'); sp.className = 'cbar ghost card t-introduction'; sp.style.gridColumn = '5 / 7'; sp.style.cssText += ';min-height:0;transform:none;display:block;padding:8px 12px'; sp.textContent = "Vélez's card starts here"; cr.appendChild(sp); }
    b.appendChild(cr);
    lbl('The inquiry', 'inq'); Data.LEVELS.forEach((L, i) => { if (i === s.belief) cell('<span class="inq">Looking here</span>', colCls(i) + ' inqcell'); });
    const ir = document.createElement('div'); ir.className = 'inqrow'; ir.style.gridColumn = `${Math.min(9, s.belief + 3)} / 9`; ir.textContent = enemyLog.length ? enemyLog[enemyLog.length - 1] : 'No inquiry moves yet. The court wants your passports by Monday.'; b.appendChild(ir);
  }

  function renderOver() {
    const o = $('over'); if (!s.over) { o.hidden = true; o.style.backgroundImage = ''; return; }
    o.hidden = false; o.className = s.over.win ? 'win' : 'lose';
    if (s.over.win && !gov) { const url = Render.runwayStill(); if (url) o.style.backgroundImage = `url(${url})`; }
    $('overtitle').textContent = gov ? (s.over.win ? 'She got out' : 'Stopped') : ({ out: 'Out', arrest: 'House arrest', clock: 'Out of time', deal: 'You took the deal' })[s.over.kind] || (s.over.win ? 'Out' : 'Caught');
    $('overtext').innerHTML = gov ? Gov.debrief(gov) : esc(s.over.reason);
    $('changewho').textContent = gov ? 'Play her side' : 'Choose character';
    $('share').hidden = !(daily && !gov);
    if (daily && !gov && !dailyResult(daily.key)) { try { localStorage.setItem(DAILY + daily.key, JSON.stringify({ win: s.over.win, line: outcomeLine(s.over), holds: s.holds, round })); } catch (e) { /* storage blocked */ } }
    saveRun();
  }

  // ---- commit and animate --------------------------------------------------------
  function doCommit(id, opt) {
    Sfx.unlock(); const r = Sim.commit(s, id, opt);
    if (!r.ok) { Sfx.deny(); log('sys', r.why, 'sys'); return; }
    Sfx.confirm(); sel = null; animate(r.events);
    if (Tutorial.active()) Render.enqueue({ dur: 10, start() { Tutorial.sync(s); renderAll(); } });
    const sid = String(id), sm = summarize(r.events, 'Your move', null);
    roundSum.theirs.push(...sm.theirs); roundSum.hours += sm.hours;
    if (sid.startsWith('evt:')) { result = summarize(r.events, 'Your choice', null); result.from = 'news'; phase = 'news'; }
    else if (sid.startsWith('call:')) { phoneCalls += 1; phase = 'move'; if (window.innerWidth < 1000) setTab('here'); }
    else if (sid.startsWith('msg:')) { /* stay on the phone */ }
    else { movedThisRound = true; result = sm; if (sid === 'wait') { result.kind = 'You lay low'; result.title = 'One hour out of sight'; } phase = 'roll'; if (window.innerWidth < 1000) setTab('here'); }
    renderAll(); saveRun();
  }

  // ---- phase turns ------------------------------------------------------------------
  const PH = ['news', 'phone', 'move', 'roll', 'sosa'];
  const mks = (tags) => `<span class="mks">${tags.map(t => `<span class="mk ${t.k}">${esc(t.t)}</span>`).join('')}</span>`;
  function phoneUseful() {
    const A = Sim.actions(s);
    return A.messages.some(m => m.options.some(o => o.ok && Tutorial.allowsOption(o.id))) || (phoneCalls < 1 && A.calls.some(c => c.ok && Tutorial.allowsCall(c.arr)));
  }
  function startRound(first) {
    if (gov || !s || s.over) return;
    if (!first) round += 1;
    phoneCalls = 0; movedThisRound = false; result = null; roundSum = { theirs: [], hours: 0 };
    interstitial(short(s.hour), `Round ${round}`, `${Data.LEVELS[s.pos].short}${s.hold ? `. Held ${s.hold} of 3` : ''}`);
    enterPhase(Sim.actions(s).event ? 'news' : 'phone');
  }
  function enterPhase(p) {
    if (p === 'phone' && !phoneUseful()) p = 'move';
    phase = p; sel = null;
    if (window.innerWidth < 1000) setTab(p === 'phone' ? 'phone' : 'here');
    if (Sfx.sting) Sfx.sting('phase');
    renderAll();
  }
  function interstitial(clock, title, sub) {
    const el = $('interstitial'); $('i-clock').textContent = clock; $('i-title').textContent = title; $('i-sub').textContent = sub;
    el.hidden = false; clearTimeout(interstitial.t); interstitial.t = setTimeout(() => { el.hidden = true; }, 1300);
    el.onclick = () => { el.hidden = true; };
  }
  function renderPhase() {
    const on = !gov && !!s && !s.over && $('start').hidden;
    $('phasebar').hidden = !on; document.body.classList.toggle('phased', on);
    if (!on) { $('phasecard').hidden = true; $('herehead').hidden = false; $('approaches').hidden = false; $('lvlhead2').hidden = false; $('phasedone').hidden = true; return; }
    if (!Render.busy()) {
      if (phase === 'move' && Tutorial.active() && !movedThisRound && phoneUseful()) phase = 'phone';
      if (phase === 'phone' && !phoneUseful()) phase = 'move';
      if ((phase === 'phone' || phase === 'move') && Sim.actions(s).event && !movedThisRound) phase = 'news';
    }
    $('round').textContent = `Round ${round}`;
    const idx = PH.indexOf(phase);
    document.querySelectorAll('#phases li').forEach((li, i) => { li.className = i < idx ? 'done' : i === idx ? 'now' : ''; });
    $('phasedone').hidden = phase !== 'phone';
    const card = $('phasecard'), showCard = phase === 'news' || phase === 'roll' || phase === 'sosa';
    const was = card.dataset.ph; card.dataset.ph = phase;
    card.hidden = !showCard; $('herehead').hidden = showCard; $('approaches').hidden = showCard; $('lvlhead2').hidden = showCard;
    if (was !== phase) { $('tab-here').scrollTop = 0; $('tab-phone').scrollTop = 0; }
    if (phase === 'news') newsCard(card); else if (phase === 'roll') resultCard(card, result, 'See what Sosā did', () => enterPhase('sosa')); else if (phase === 'sosa') sosaCard(card);
  }
  const KIND = { event: 'News', rumor: 'A rumor', hold: 'The inquiry has you' };
  function newsCard(card) {
    if (result && result.from === 'news') { resultCard(card, result, 'Continue', () => { result = null; enterPhase(Sim.actions(s).event ? 'news' : 'phone'); }); return; }
    const v = Sim.eventView(s); if (!v) { card.className = ''; card.innerHTML = ''; return; }
    card.className = v.kind;
    card.innerHTML = `<span class="kind">${KIND[v.kind]}${v.kind === 'hold' ? ` · ${v.rung} of 3` : ''}</span><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p>`;
    for (const c of v.choices) { const b = document.createElement('button'); b.className = 'choice'; b.disabled = !c.ok || !!s.over; b.innerHTML = `<b>${esc(c.label)}</b>${c.ok ? mks(c.tags) : `<span class="why">${esc(c.why)}</span>`}`; b.onclick = () => doCommit('evt:' + c.id); card.appendChild(b); }
  }
  function resultCard(card, r, nextLabel, next) {
    if (!r) { card.innerHTML = ''; return; }
    card.className = 'roll';
    const out = r.roll ? `<span class="outcome ${r.roll.won ? 'ok' : 'no'}">${r.roll.won ? 'Success' : 'Failed'}</span><span class="mks"><span class="mk roll">Rolled ${r.roll.die}, needed ${r.roll.need}</span></span>` : '<span class="outcome ok">Done</span>';
    const rows = r.from === 'news' && r.theirs.length ? `<ul class="rows">${r.theirs.map(t => `<li class="${t.k}"><i></i><span>${esc(t.t)}</span></li>`).join('')}</ul>` : '';
    card.innerHTML = `<span class="kind">${esc(r.kind)}</span>${r.title ? `<h3>${esc(r.title)}</h3>` : ''}${out}${r.line ? `<p>${esc(r.line)}</p>` : ''}${r.mine.length ? mks(r.mine) : ''}${rows}`;
    const b = document.createElement('button'); b.className = 'primary next'; b.textContent = nextLabel; b.onclick = () => { Sfx.click(); next(); }; card.appendChild(b);
  }
  function sosaCard(card) {
    card.className = 'sosa';
    const rows = roundSum.theirs.length ? roundSum.theirs.map(t => `<li class="${t.k}"><i></i><span>${esc(t.t)}</span></li>`).join('') : '<li class="gain"><i></i><span>Quiet. Nobody moved against you.</span></li>';
    card.innerHTML = `<span class="kind">While you moved</span><h3>${roundSum.hours} h passed. Now ${esc(short(s.hour))}</h3><ul class="rows">${rows}</ul>`;
    const b = document.createElement('button'); b.className = 'primary next'; b.textContent = 'Next round'; b.onclick = () => { Sfx.click(); startRound(false); }; card.appendChild(b);
  }
  function summarize(events, kind, title) {
    const r = { kind, title, roll: null, line: '', mine: [], theirs: [], hours: 0 }; let after = false, expMine = 0, expTheirs = 0;
    for (const e of events) {
      if (e.type === 'hour') { after = true; r.hours += 1; continue; }
      const bucket = after ? r.theirs : r.mine;
      switch (e.type) {
        case 'attempt': r.title = e.name; break;
        case 'chose': r.title = r.title || e.label; break;
        case 'roll': if (e.who) r.theirs.push({ k: e.won ? 'gain' : 'enemy', t: `${pname(e.who).split(' ')[0]}: ${e.pressed ? (e.won ? 'held firm under questioning' : 'talked to Sosā') : (e.won ? 'delivered' : 'not yet')}` }); else if (!r.roll && !after) r.roll = e; break;
        case 'say': if (e.who === 'narrator' && !after && !r.line) r.line = e.text; break;
        case 'exposure': if (after) expTheirs += e.delta; else expMine += e.delta; break;
        case 'card': bucket.push({ k: 'gain', t: `Card: ${e.name}` }); break;
        case 'cardlost': bucket.push({ k: 'lose', t: `Lost: ${e.name}` }); break;
        case 'travel': r.mine.push({ k: 'gain', t: `Reached ${Data.LEVELS[e.to].short}` }); break;
        case 'betrayal': r.mine.push({ k: 'risk', t: `${pname(e.who).split(' ')[0]} sold you out` }); break;
        case 'stage': r.theirs.push({ k: 'gain', t: e.label[0].toUpperCase() + e.label.slice(1) }); break;
        case 'enemy': r.theirs.push({ k: 'enemy', t: e.text }); break;
        case 'hold': r.theirs.push({ k: 'enemy', t: `${e.title}. You deal with it next.` }); break;
        case 'dispatch': r.theirs.push({ k: 'news', t: `News waiting: ${e.title}` }); break;
        case 'message': r.theirs.push({ k: 'news', t: `Message from ${pname(e.from)}` }); break;
        default: break;
      }
    }
    if (expMine) r.mine.unshift({ k: expMine > 0 ? 'up' : 'down', t: `Exposure ${expMine > 0 ? '+' : ''}${expMine}` });
    if (expTheirs) r.theirs.unshift({ k: expTheirs > 0 ? 'enemy' : 'gain', t: `Exposure ${expTheirs > 0 ? 'rose' : 'fell'} by ${Math.abs(expTheirs)} while time passed` });
    return r;
  }

  // ---- the daily run -----------------------------------------------------------------
  function dailyInfo() {
    const d = new Date(), key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let h = 2166136261; for (const c of 'coalition' + key) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    const dayNum = Math.floor(new Date(key + 'T12:00:00').getTime() / 86400000);
    return { key, seed: h >>> 0, who: dayNum % 2 ? 'man' : 'woman', label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) };
  }
  const DAILY = 'coalition.daily.';
  function dailyResult(key) { try { return JSON.parse(localStorage.getItem(DAILY + key) || 'null'); } catch (e) { return null; } }
  function outcomeLine(o) { const name = Data.CHARACTERS[who].short; return o.win ? `${name} got out at ${short(s.hour)}` : o.kind === 'clock' ? `${name} ran out of time` : o.kind === 'deal' ? `${name} took the deal` : `${name} ended under house arrest in ${Data.LEVELS[s.pos].short}`; }
  function shareText() { return `Coalition daily, ${daily.label}\n${outcomeLine(s.over)}.\nHeld ${s.holds || 0} time${s.holds === 1 ? '' : 's'}. Round ${round}. Exposure ${s.exposure}.\n${location.href.split('#')[0]}`; }
  function animate(events) {
    for (const e of events) {
      switch (e.type) {
        case 'say': Render.enqueue({ dur: 10, start() { log(e.who, e.text); } }); break;
        case 'attempt': Render.enqueue({ dur: 10, start() { log('sys', `You try: ${e.name}.`, 'sys'); } }); break;
        case 'roll': if (!e.who) { Render.dice(e.die, e.need, e.won); Render.enqueue({ dur: 10, start() { Sfx.dice(); log('sys', `Rolled ${e.die}; needed ${e.need}${e.bonus && e.bonus.length ? ` (lowered by ${e.bonus.join(', ')})` : ''}. ${e.won ? 'Success.' : 'Failed.'}`, 'roll'); } }); }
                     else Render.enqueue({ dur: 10, start() { log('sys', `${e.pressed ? 'Sosā presses ' : ''}${pname(e.who)}${e.pressed ? '' : ' rolls'}: ${e.die} against ${e.need}. ${e.won ? (e.pressed ? 'Holds.' : 'Delivered.') : (e.pressed ? 'Breaks.' : 'Not yet.')}`, 'roll'); } }); break;
        case 'exposure': Render.float(Render.W * Render.SCALE / 2, 160, (e.delta > 0 ? '+' : '') + e.delta + ' exposure', e.delta > 0 ? '#FF7A90' : '#7FB2E5'); Render.enqueue({ dur: 10, start() { Sfx.heat(e.delta > 0); } }); break;
        case 'belief': Render.enqueue({ dur: 300, start() { Sfx.click(); } }); break;
        case 'card': Render.enqueue({ dur: 10, start() { Sfx.arranged(); log('sys', `${pname(e.from)} gives you: ${e.name}.`, 'sys'); } }); break;
        case 'cardlost': Render.enqueue({ dur: 10, start() { log('sys', `Card lost: ${e.name}.`, 'sys'); } }); break;
        case 'commit': Render.enqueue({ dur: 10, start() { log('sys', `You now owe ${pname(e.to)}: ${e.text}`, 'sys'); } }); break;
        case 'stage': Render.enqueue({ dur: 10, start() { Sfx.arranged(); } }); break;
        case 'job': Render.enqueue({ dur: 10, start() { log('sys', `${pname(e.ally)} will reply by ${e.dueText}.`, 'sys'); } }); break;
        case 'message': Render.ring(); Render.enqueue({ dur: 10, start() { Sfx.ring(); log('sys', `Message from ${pname(e.from)}.`, 'sys'); } }); break;
        case 'answered': Render.enqueue({ dur: 10, start() { log('sys', `You answer: ${e.label}.`, 'sys'); } }); break;
        case 'enemy': Render.enemy(); Render.enqueue({ dur: 10, start() { Sfx.patrol(); enemyLog.push(e.text); log('enemy', e.text, 'enemy'); } }); break;
        case 'report': Render.ring(); Render.enqueue({ dur: 10, start() { Sfx.ring(); log(e.from, e.text); } }); break;
        case 'order': Render.enqueue({ dur: 10, start() { log('sys', `Order sent: ${e.name}.`, 'sys'); } }); break;
        case 'travel': Render.travel(); Render.enqueue({ dur: 10, start() { Sfx.step(0); } }); break;
        case 'dispatch': Render.enqueue({ dur: 10, start() { if (Sfx.sting) Sfx.sting('event'); log('sys', `News: ${e.title}.`, 'sys'); } }); break;
        case 'hold': { const kind = e.rung === 1 ? 'questioned' : e.rung === 2 ? 'held' : 'arrest'; if (Render.detain) Render.detain(kind); else Render.enemy(); Render.enqueue({ dur: 10, start() { if (Sfx.sting) Sfx.sting(kind); log('enemy', `${e.title}. ${e.text}`, 'enemy'); } }); break; }
        case 'chose': Render.enqueue({ dur: 10, start() { log('sys', `You chose: ${e.label}.`, 'sys'); } }); break;
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
    const rep = document.createElement('div'); rep.className = 'reports'; rep.innerHTML = `<h2>Reports</h2>` + (v.reports.length ? v.reports.map(r => `<article class="report"><div class="src"><span>${esc(r.source)}</span><span><span class="mono">${r.age}</span> ago</span></div><p>${esc(r.text)}</p><div class="pv"><span><b>Proves</b><span>${esc(r.proves)}</span></span><span><b>Does not prove</b><span>${esc(r.doesnt)}</span></span></div></article>`).join('') : '<p class="hint">No reports yet. The watch team is at the residence.</p>');
    box.appendChild(rep);
    const h = document.createElement('h2'); h.textContent = 'Orders'; box.appendChild(h);
    for (const a of v.orders) { if (sel === a.id) box.appendChild(expanded(a, 'Send the order', () => doGov(a.id))); else box.appendChild(approachBtn(a, true)); }
    $('wait').disabled = !!s.over;
  }
  function renderGovPhone() {
    const v = Gov.view(gov); const inbox = $('inbox'); inbox.innerHTML = '';
    $('waiting').textContent = v.messages.length ? `${v.messages.length} waiting` : ''; const badge = $('tab-badge'); badge.hidden = !v.messages.length; badge.textContent = v.messages.length;
    if (!v.messages.length) inbox.innerHTML = '<p class="hint">No calls waiting.</p>';
    for (const m of v.messages) inbox.appendChild(thread(m.from, m.role, m.text, m.options.map(o => Object.assign({}, o, { go: () => doGov(m.id, o.id) })), () => true));
    const calls = $('calls'); calls.innerHTML = '';
    for (const c of v.calls) { if (sel === c.id && c.ok) { const bx = document.createElement('div'); bx.className = 'callbox'; bx.innerHTML = `<b>${esc(c.name)}</b><ul class="preview">${c.preview.map(x => `<li>${esc(x)}</li>`).join('')}</ul><div class="row"><button class="primary commit">Send</button><button class="cancel">Cancel</button></div>`; bx.querySelector('.commit').onclick = () => doGov(c.id); bx.querySelector('.cancel').onclick = () => { sel = null; renderAll(); }; calls.appendChild(bx); } else calls.appendChild(callBtn(c, true, c.name)); }
  }
  function renderGovHand() {
    const h = $('hand'); h.innerHTML = '';
    for (const id of gov.hand) { const c = Data.GOV_CARDS[id]; const here = c.reach.includes(Data.LEVELS[gov.belief].id); h.appendChild(cardEl(c, here, c.from, here ? 'Counts where you are looking' : `Counts ${c.reach.includes('airfield') && !c.reach.includes('residence') ? 'across the line' : 'in Valdória'}`)); }
    if (!gov.hand.includes('esm_intro')) { const c = Data.GOV_CARDS.esm_intro; h.appendChild(cardEl(c, false, 'Not yet yours', 'Would start at the line')); }
  }
  function renderGovRoute() {
    const v = Gov.view(gov); const rail = $('rail'); rail.innerHTML = ''; $('board').innerHTML = '';
    Data.LEVELS.forEach((L, i) => {
      const li = document.createElement('li'); li.className = (i === gov.belief ? 'current' : '') + (i === 4 ? ' border' : '') + (i === 5 ? ' esm' : '');
      const reps = v.reports.filter(r => r.at === i).map(r => `<span class="need notyet"><b>${esc(r.source)}, ${r.age} ago</b><span>${esc(r.text)} ${esc(r.doesnt ? 'Does not prove ' + r.doesnt.charAt(0).toLowerCase() + r.doesnt.slice(1) : '')}</span></span>`).join('');
      const reqs = v.requests.filter(r => r.at === i).map(r => `<span class="need ${r.state}"><b>${esc(r.title)}</b><span>${esc(r.sub)}</span></span>`).join('');
      li.innerHTML = `<span class="line" aria-hidden="true"></span><span class="dot" aria-hidden="true"></span><div class="stop"><div class="nm"><b>${esc(L.short)}</b><span>${i === gov.belief ? 'She may be here' : i === 4 ? 'The border' : i === 5 ? 'Esmeralda' : ''}</span></div><span class="who">${esc(v.people[i])}</span>${i === 5 ? '<span class="need notyet"><b>Your ministry does not command this tower</b><span>Ask Esmeralda. The request must reach the people who can stop the flight.</span></span>' : ''}${reqs}${reps}</div>`;
      rail.appendChild(li);
    });
    const ab = document.createElement('li'); ab.innerHTML = `<span class="dot" aria-hidden="true" style="visibility:hidden"></span><section id="abroad"><h3>Where your cards count</h3>${gov.hand.map(id => `<span class="who">${esc(Data.GOV_CARDS[id].name)}: ${esc(Data.GOV_CARDS[id].works)}</span>`).join('')}<span class="who s">An Esmeraldan introduction would start at the line</span></section>`; rail.appendChild(ab);
    $('board').appendChild(rail.cloneNode(true)); $('board').style.display = ''; $('board').className = 'govboard';
  }
  function doGov(id, opt) {
    Sfx.unlock(); const r = Gov.commit(gov, id, opt);
    if (!r.ok) { Sfx.deny(); log('sys', r.why, 'sys'); return; }
    Sfx.confirm(); sel = null; animate(r.events); renderAll(); saveRun();
  }

  // ---- start, title, boot --------------------------------------------------------------
  function showStart() {
    const box = $('start-chars'); box.innerHTML = '';
    const first = !seen(), saved = savedRun();
    $('continue').hidden = !saved; if (saved) $('continue').textContent = saved.gov ? `Continue your run as ${Data.GOV.name}` : `Continue your run as ${Data.CHARACTERS[saved.who].name}`;
    $('start-demo-note').textContent = (first ? 'New here? ' : '') + 'Learn the route to the border as ' + Data.CHARACTERS[Tutorial.WHO].name + '. Finish at the airfield on your own.';
    $('start-tutorial').className = first ? 'primary' : 'pill ghost';
    $('start-free').textContent = first ? 'Or choose your character' : 'Choose your character';
    let n = 0;
    for (const k in Data.CHARACTERS) { const c = Data.CHARACTERS[k]; n += 1; const b = document.createElement('button'); b.className = 'whobtn w' + n; b.innerHTML = `<span class="avatar" aria-hidden="true">${initials(c.name)}</span><span class="n"><b>${esc(c.name)}</b><span>${esc(c.sibling.rel[0].toUpperCase() + c.sibling.rel.slice(1))} ${esc(c.sibling.short)} is abroad</span><span class="blurb">${esc(c.blurb)}</span></span>`; b.onclick = () => { Sfx.unlock(); Sfx.click(); newRun(k); }; box.appendChild(b); }
    const g = document.createElement('button'); g.className = 'whobtn w3'; g.innerHTML = `<span class="avatar" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg></span><span class="n"><b>${esc(Data.GOV.name)}</b><span>${esc(Data.GOV.title)}. Stop the escape.</span><span class="blurb">${esc(Data.GOV.blurb)}</span></span>`; g.onclick = () => { Sfx.unlock(); Sfx.click(); newGovRun(); }; box.appendChild(g);
    const url = Render.runwayStill(); if (url) $('start-art').style.backgroundImage = `url(${url})`;
    const D = dailyInfo(), done = dailyResult(D.key);
    $('daily-date').textContent = D.label; $('daily-note').textContent = done ? `${done.line}. Play again or share.` : `Today: ${Data.CHARACTERS[D.who].name}. Same run for everyone.`;
    if (Sfx.ambience) Sfx.ambience(null);
    $('start').hidden = false; document.body.classList.remove('phased');
  }
  function showTitle() {
    const t = Sim.newRun(3, 'woman'); t.pos = 4; t.hour = 36; t.belief = 1;
    const paint = () => { const url = Render.still(t); if (!url) { setTimeout(paint, 60); return; } $('title').style.backgroundImage = `url(${url})`; };
    paint(); $('title').hidden = false; $('start').hidden = true;
    $('title-start').onclick = () => { Sfx.unlock(); Sfx.theme(true); $('title').hidden = true; showStart(); };
  }
  function pwa() {
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
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
    Render.start({ onPick: (id) => { if (id !== 'self' && !gov && Data.PEOPLE[id]) log('sys', `${pname(id)}: ${Data.PEOPLE[id].role}.`, 'sys'); } });
    document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => { Sfx.click(); setTab(b.dataset.tab); });
    $('wait').onclick = () => gov ? doGov('wait') : doCommit('wait');
    $('again').onclick = () => { Sfx.click(); $('over').hidden = true; gov ? newGovRun() : newRun(who, false, !!daily); };
    $('changewho').onclick = () => { Sfx.click(); $('over').hidden = true; if (gov) newRun(gov.target); else showStart(); };
    $('startscreen').onclick = () => { saveRun(); showStart(); };
    $('demo').onclick = () => { Sfx.unlock(); Sfx.click(); $('over').hidden = true; newRun(null, true); };
    $('start-tutorial').onclick = () => { Sfx.unlock(); Sfx.click(); newRun(null, true); };
    $('continue').onclick = () => { Sfx.unlock(); Sfx.click(); resumeRun(); };
    $('daily').onclick = () => { Sfx.unlock(); Sfx.click(); newRun(null, false, true); };
    $('phasedone').onclick = () => { Sfx.click(); enterPhase('move'); };
    $('share').onclick = async () => { const text = shareText(); try { if (navigator.share) await navigator.share({ title: 'Coalition', text }); else { await navigator.clipboard.writeText(text); $('share').textContent = 'Copied'; } } catch (e) { /* share dismissed */ } };
    $('coach-next').onclick = () => { Sfx.click(); Tutorial.next(); renderAll(); saveRun(); };
    $('coach-leave').onclick = () => { Sfx.click(); Tutorial.stop(); log('sys', 'Tutorial ended. Continue on your own.', 'sys'); renderAll(); saveRun(); };
    const toggleMute = () => { Sfx.unlock(); Sfx.setMuted(!Sfx.isMuted()); $('mute').setAttribute('aria-label', Sfx.isMuted() ? 'Sound off' : 'Sound on'); $('mute-wave').style.display = Sfx.isMuted() ? 'none' : ''; document.querySelector('#menu2 [data-act=mute]').textContent = Sfx.isMuted() ? 'Sound: off' : 'Sound: on'; };
    const toggleHelp = () => { $('helpbox').hidden = !$('helpbox').hidden; if (!$('helpbox').hidden) setTab('phone'); };
    $('mute').onclick = toggleMute; $('help').onclick = toggleHelp;
    document.querySelectorAll('#menu2 button').forEach(b => b.onclick = () => ({ demo: () => $('demo').onclick(), startscreen: () => $('startscreen').onclick(), help: toggleHelp, install: () => $('install').onclick(), mute: toggleMute })[b.dataset.act]());
    setInterval(() => { if (!s) return; const b = Render.busy(); if (document.body.classList.contains('busy') !== b) document.body.classList.toggle('busy', b); }, 120);
    window.addEventListener('resize', () => { if (s) renderAll(); });
    pwa();
    s = Sim.newRun(1, 'woman'); Render.setState(s); showTitle();
  }
  return { boot };
})();
window.addEventListener('DOMContentLoaded', UI.boot);
