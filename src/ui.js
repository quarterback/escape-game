/* ============================================================
   UI: HTML hand / targets / inspection / dialogue / controls,
   the start screen and the tutorial coach box.
   Flow: pick a card, see its targets in the scene and the list,
   inspect one, commit. The sim resolves, then the events are animated.
   ============================================================ */
'use strict';
const UI = (() => {
  let s = null, selCard = null, selTarget = null, seed = 1, persona = 'cartographer';
  const $ = (id) => document.getElementById(id);
  const SPEAKER = {
    you: ['Inēs', '#e08a92'], forger: ['Lūçīā', '#b48ad8'], lookout: ['Pipô', '#f0a060'], guard: ['Gaspār', '#8ab0e0'],
    clerk: ['Mārtā', '#9ad080'], teo: ['Theo', '#d0b080'], brakeman: ['Holt', '#a0a8b8'], patrol: ['Bailiffs', '#ff6a6a'], sys: ['', '#9a9aaa'],
  };
  const SEEN_KEY = 'lfo.seen';
  const seen = () => { try { return !!localStorage.getItem(SEEN_KEY); } catch (e) { return false; } };
  const markSeen = () => { try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* convenience only */ } };

  function log(who, text, cls) {
    const el = document.createElement('div'); el.className = 'line ' + (cls || '');
    const sp = SPEAKER[who] || SPEAKER.sys;
    el.innerHTML = `<b style="color:${sp[1]}">${sp[0]}</b> <span>${text}</span>`;
    const box = $('dialogue'); box.appendChild(el); box.scrollTop = box.scrollHeight;
  }

  // ---- new game ---------------------------------------------
  function newGame(sd, who, opts) {
    opts = opts || {};
    seed = sd >>> 0 || 1; persona = Sim.PERSONAS[who] ? who : persona;
    s = Sim.newGame(seed, persona, opts);
    selCard = selTarget = null;
    Render.setState(s); Render.view.over = null; Render.view.floats = []; Render.view.queue = []; Render.view.current = null;
    Render.view.pipX = Render.STX[1] + 18;
    $('dialogue').innerHTML = '';
    $('seed').value = seed;
    const P0 = Sim.PERSONAS[persona];
    log('sys', `A rail town in Salta, Valdória, on the edge of the Pearl. ${Sim.clockText(0)}. Your name is in the bailiffs' ledger for a debt you cannot pay. The midnight freight over the Huhūi passes to Esmeralda is the last train before the line closes. Tonight you are ${P0.name.toLowerCase()}: ${P0.blurb} You have seven hours.`, 'sys');
    log('you', 'Four things. A stamped passport, a way past customs, a way across the yard and a crate with my chalk mark on it. In that order, or any order that works.');
    renderAll();
  }
  function startTutorial() {
    markSeen();
    hideStart();
    Tutorial.start({ onRender: renderAll, onFinish: () => { showStart(); } });
    newGame(Tutorial.SEED, Tutorial.PERSONA, { deck: Tutorial.DECK, tutorial: true });
  }
  function startReal(who) {
    markSeen();
    Tutorial.stop();
    hideStart();
    newGame((Math.random() * 1e9) >>> 0, who || $('persona').value);
  }

  // ---- start screen -----------------------------------------
  function renderStartPersonas() {
    const box = $('start-personas'); box.innerHTML = '';
    for (const k in Sim.PERSONAS) {
      const P = Sim.PERSONAS[k];
      const lab = document.createElement('label'); lab.className = 'persona' + (k === persona ? ' sel' : '');
      lab.innerHTML = `<input type="radio" name="who" value="${k}" ${k === persona ? 'checked' : ''}>
        <span class="pname">${P.name}</span>
        <span class="pstats">${P.coin} australs · ${P.favor} ${P.favor === 1 ? 'favor' : 'favors'} · heat ${P.heat}</span>
        <span class="pblurb">${P.blurb}</span>
        <span class="phow">${P.how}</span>`;
      lab.querySelector('input').onchange = () => { persona = k; $('persona').value = k; renderStartPersonas(); };
      box.appendChild(lab);
    }
  }
  function showStart() {
    renderStartPersonas();
    const first = !seen();
    $('start-tut').classList.toggle('primary', first);
    $('start-play').classList.toggle('primary', !first);
    $('start-first').hidden = !first;
    $('start').hidden = false;
  }
  function hideStart() { $('start').hidden = true; }

  // ---- tutorial coach ---------------------------------------
  function renderCoach() {
    const box = $('coach'); const st = Tutorial.current();
    if (!st) { box.hidden = true; document.querySelectorAll('.coach-target').forEach(el => el.classList.remove('coach-target')); return; }
    box.hidden = false;
    const n = Tutorial.stepIndex() + 1, total = Tutorial.STEPS.length;
    $('coach-step').textContent = `Practice night · step ${n} of ${total}`;
    $('coach-title').textContent = st.title;
    $('coach-body').innerHTML = st.html;
    const a = st.allow;
    $('coach-next').hidden = !a.next;
    $('coach-next').textContent = Tutorial.isLast() ? 'Finish' : 'Next';
    $('coach-wait').hidden = !!a.next;
    document.querySelectorAll('.coach-target').forEach(el => el.classList.remove('coach-target'));
    for (const sel of st.highlight) document.querySelectorAll(sel).forEach(el => el.classList.add('coach-target'));
  }

  // ---- rendering --------------------------------------------
  function renderAll() {
    renderStatus(); renderHand(); renderTargets(); renderControls(); renderNeeds(); renderOver(); syncHighlight(); renderCoach();
  }
  function tutorialSync() {
    if (!Tutorial.isActive() || Render.busy()) return;
    const c = s.hand.find(x => x.uid === selCard);
    if (Tutorial.sync(s, { selCard: c ? c.type : null, selTarget })) { Sfx.arranged(); renderAll(); }
  }
  function renderPersonas() { const sel = $('persona'); sel.innerHTML = ''; for (const k in Sim.PERSONAS) { const o = document.createElement('option'); o.value = k; o.textContent = `${Sim.PERSONAS[k].name}: ${Sim.PERSONAS[k].coin} australs, ${Sim.PERSONAS[k].favor} ${Sim.PERSONAS[k].favor === 1 ? 'favor' : 'favors'}, heat ${Sim.PERSONAS[k].heat}`; sel.appendChild(o); } }

  function renderStatus() {
    $('coin').textContent = s.coin; $('favor').textContent = s.favor;
    $('clock').textContent = Sim.clockText(s.tick);
    $('where').textContent = Sim.STATIONS[s.pos].name;
    const heat = $('heat'); heat.innerHTML = '';
    for (let i = 0; i < Sim.HEAT_LIMIT; i++) { const d = document.createElement('i'); if (i < s.heat) d.className = 'on' + (s.heat >= 6 ? ' hot' : ''); heat.appendChild(d); }
    const tl = $('timeline'); tl.innerHTML = '';
    for (let i = 0; i < Sim.TICKS_TOTAL; i++) { const d = document.createElement('i'); if (i < s.tick) d.className = 'on'; tl.appendChild(d); }
    $('heatnum').textContent = `${s.heat}/${Sim.HEAT_LIMIT}`;
    $('timeleft').textContent = s.tick >= Sim.TICKS_TOTAL ? '' : `${(Sim.TICKS_TOTAL - s.tick) * 30} minutes left`;
  }

  function cardEl(c) {
    const d = Sim.CARD_DEFS[c.type], cost = Sim.cardCost(s, c.type);
    const el = document.createElement('button'); el.className = 'card ' + d.kind + ' t-' + c.type + (selCard === c.uid ? ' sel' : '');
    const allowed = Tutorial.allowsCard(c.type);
    el.disabled = !!s.over || !allowed;
    if (!allowed) el.classList.add('locked');
    const apps = Sim.applications(s, c.type); const anyOk = apps.some(a => a.ok);
    if (!anyOk) el.classList.add('dead');
    const kindWord = { people: 'played on a person', objects: 'played on an object', places: 'played on a place', service: 'a service you order' }[d.kind];
    el.innerHTML = `<span class="cname">${d.name}</span>
      <span class="ccost">${Sim.costText(cost)}${c.type === 'bribe' && s.bribes ? ' (price has risen)' : ''} · ${d.time ? d.time * 30 + ' minutes' : 'no time'}</span>
      <span class="cflavor">${d.flavor}</span>
      <span class="ctargets">${kindWord} · ${apps.filter(a => a.ok).length} of ${apps.length} uses from here</span>`;
    el.onclick = () => { Sfx.unlock(); if (selCard === c.uid) { selCard = null; selTarget = null; Sfx.click(); } else { selCard = c.uid; selTarget = null; Sfx.select(); } renderAll(); tutorialSync(); };
    return el;
  }
  function renderHand() {
    const h = $('hand'); h.innerHTML = '';
    for (const c of s.hand) h.appendChild(cardEl(c));
    $('deckinfo').textContent = `${s.deck.length} in the deck, ${s.discard.length} discarded`;
  }

  function currentApps() {
    const c = s.hand.find(x => x.uid === selCard); if (!c) return null;
    return { card: c, def: Sim.CARD_DEFS[c.type], apps: Sim.applications(s, c.type) };
  }
  function syncHighlight() {
    const cur = currentApps();
    if (!cur) { Render.setHighlight(null); return; }
    Render.setHighlight({ ok: new Set(cur.apps.filter(a => a.ok && Tutorial.allowsTarget(a.id)).map(a => a.id)), bad: new Set(cur.apps.filter(a => !a.ok || !Tutorial.allowsTarget(a.id)).map(a => a.id)), selected: selTarget });
  }
  function renderTargets() {
    const box = $('targets'), cur = currentApps();
    if (!cur) {
      box.innerHTML = `<p class="hint">Select a card to see who and what it can affect. The same people and things light up in the picture.</p>`;
      $('inspect').classList.add('empty'); $('inspect').innerHTML = ''; return;
    }
    const { card, def, apps } = cur;
    box.innerHTML = `<h3>${def.name} <small>can be played on</small></h3>`;
    const ul = document.createElement('ul');
    for (const a of apps) {
      const allowed = Tutorial.allowsTarget(a.id);
      const li = document.createElement('li'); li.className = (a.ok && allowed ? 'ok' : 'no') + (selTarget === a.id ? ' sel' : '') + ' k-' + a.kind;
      const where = a.id === 'self' ? '' : ` <em>· ${a.kind}</em>`;
      li.innerHTML = `<span class="tl">${a.label}${where}</span>${a.ok ? '' : `<span class="why">${a.why}</span>`}`;
      if (allowed) li.onclick = () => pick(a.id);
      ul.appendChild(li);
    }
    box.appendChild(ul);
    const ins = $('inspect'); const a = apps.find(x => x.id === selTarget);
    if (!a) { ins.classList.add('empty'); ins.innerHTML = `<p class="hint">Pick a target in the list or in the picture to see what would happen before you commit.</p>`; return; }
    ins.classList.remove('empty');
    const canCommit = a.ok && !s.over && Tutorial.allow().commit;
    ins.innerHTML = `<h3>${def.name} on ${a.label}</h3>
      <p class="small">What happens if you commit:</p>
      <ul class="preview">${a.preview.map(x => `<li>${x}</li>`).join('')}</ul>
      <p class="cost">Costs ${Sim.costText(Sim.cardCost(s, card.type))}${def.time ? ` and ${def.time * 30} minutes` : ' and no time'}.${card.type === 'bribe' ? ' Every bribe raises the price of the next one by ' + Sim.BRIBE_STEP + ' austral.' : ''}</p>
      ${a.ok ? '' : `<p class="blocked">${a.why}</p>`}
      <div class="row"><button id="commit" class="primary" ${canCommit ? '' : 'disabled'}>Commit</button><button id="cancel">Cancel</button></div>`;
    $('commit').onclick = commit; $('cancel').onclick = () => { selCard = selTarget = null; Sfx.click(); renderAll(); };
  }
  function pick(id) {
    const cur = currentApps(); if (!cur) return;
    const a = cur.apps.find(x => x.id === id); if (!a) return;
    if (!Tutorial.allowsTarget(id)) { Sfx.deny(); return; }
    selTarget = id; a.ok ? Sfx.select() : Sfx.deny(); renderAll(); tutorialSync();
  }

  function renderNeeds() {
    const A = Sim.arrangements(s); const ul = $('needs'); ul.innerHTML = '';
    for (const k in A) {
      const li = document.createElement('li'); li.className = A[k].done ? 'done' : '';
      li.innerHTML = `<b>${A[k].name}</b> <span>${A[k].done ? (A[k].behind ? 'behind you' : 'arranged') : A[k].how}</span>`;
      li.title = A[k].what;
      ul.appendChild(li);
    }
    const pend = $('pending'); pend.innerHTML = '';
    if (!s.jobs.length) pend.innerHTML = '<li class="none">Nothing in progress.</li>';
    for (const j of s.jobs) {
      const li = document.createElement('li');
      const name = { forge: 'Lūçīā inking your passport', distract: 'Gaspār distracted', lookout: 'Pipô causing trouble', picklock: j.who === 'gate' ? 'You, picking the side gate' : 'You, preparing a crate' }[j.type];
      li.innerHTML = `<b>${name}</b> <span>${j.remaining * 30} minutes left</span>`; pend.appendChild(li);
    }
  }

  function renderControls() {
    const over = !!s.over, busy = Render.busy(), A = Tutorial.allow();
    const back = Sim.canMove(s, -1), fwd = Sim.canMove(s, 1);
    $('back').disabled = over || !back.ok || !Tutorial.allowsMove(-1);
    $('back').textContent = back.to != null && back.to >= 0 ? `Walk back to ${Sim.STATIONS[back.to].name.toLowerCase()}` : 'Walk back';
    $('back').title = back.ok ? `Walk back to ${Sim.STATIONS[back.to].name.toLowerCase()}, 30 minutes` : back.why;
    $('fwd').disabled = over || !fwd.ok || !Tutorial.allowsMove(1);
    $('fwd').textContent = fwd.to != null && fwd.to < Sim.STATIONS.length ? `Walk on to ${Sim.STATIONS[fwd.to].name.toLowerCase()}` : 'Walk on';
    $('fwd').title = fwd.ok ? `Walk to ${Sim.STATIONS[fwd.to].name.toLowerCase()}, 30 minutes` : (fwd.why || '');
    $('fwdwhy').textContent = (!fwd.ok && fwd.why && fwd.to != null) ? fwd.why : '';
    const swapForced = Tutorial.isActive() && A.swap && !selCard;
    $('wait').disabled = over || !A.wait || swapForced;
    $('wait').textContent = selCard ? 'Wait 30 minutes and swap the selected card' : 'Wait 30 minutes';
    const b = Sim.canBoard(s); $('board').disabled = over || !b.ok || !A.board; $('board').title = b.ok ? 'Climb into the crate' : b.why;
    $('board').classList.toggle('ready', b.ok && !over);
    $('boardwhy').textContent = b.ok ? '' : b.why;
    document.body.classList.toggle('busy', busy);
    document.body.classList.toggle('tutorial', Tutorial.isActive());
  }
  // ---- career records: you against yourself (localStorage only, never leaves the browser) ------
  function loadRecords() { try { return JSON.parse(localStorage.getItem('lfo.records') || '{}'); } catch (e) { return {}; } }
  function recordNight() {
    if (!s.over || s.recorded || s.tutorial) return; s.recorded = true;
    const r = loadRecords();
    r.nights = (r.nights || 0) + 1; r.escapes = (r.escapes || 0) + (s.over.win ? 1 : 0);
    r.streak = s.over.win ? (r.streak || 0) + 1 : 0; r.bestStreak = Math.max(r.bestStreak || 0, r.streak);
    if (s.over.win) {
      if (r.earliest == null || s.tick < r.earliest) r.earliest = s.tick;
      if (r.coolest == null || s.heat < r.coolest) r.coolest = s.heat;
      if (r.richest == null || s.coin > r.richest) r.richest = s.coin;
    }
    try { localStorage.setItem('lfo.records', JSON.stringify(r)); } catch (e) { /* private mode: records are a convenience */ }
  }
  function renderRecords() {
    const r = loadRecords(); const el = $('records');
    if (!r.nights) { el.textContent = 'No nights played in this browser yet. The practice night does not count.'; return; }
    el.innerHTML = `${r.escapes} of ${r.nights} nights escaped. Streak ${r.streak}, best ${r.bestStreak}.` +
      (r.earliest != null ? ` Earliest out ${Sim.clockText(r.earliest)}. Coolest escape at heat ${r.coolest}. Richest escape with ${r.richest} australs.` : '');
  }
  function renderOver() {
    const o = $('over');
    if (!s.over) { o.hidden = true; renderRecords(); return; }
    recordNight(); renderRecords();
    // During the tutorial the coach box has the last word; the over panel waits until the tutorial ends.
    if (Tutorial.isActive()) { o.hidden = true; return; }
    o.hidden = false; o.className = s.over.win ? 'win' : 'lose';
    $('overtitle').textContent = s.over.win ? 'Bound for Esmeralda' : 'Caught';
    $('overtext').textContent = s.over.reason + ` You used ${s.tick * 30} minutes and ended at heat ${s.heat}. Seed ${seed}.`;
  }

  // ---- actions ----------------------------------------------
  function commit() {
    const cur = currentApps(); if (!cur || !selTarget) return;
    if (!Tutorial.allow().commit) { Sfx.deny(); return; }
    Sfx.unlock();
    const r = Sim.play(s, cur.card.uid, selTarget);       // resolve first
    if (!r.ok) { Sfx.deny(); log('sys', r.why, 'sys'); return; }
    log('sys', `You play <b>${cur.def.name}</b> on ${cur.apps.find(a => a.id === selTarget).label}.`, 'sys act');
    Sfx.confirm();
    selCard = selTarget = null;
    animate(r.events);                                     // then animate the consequences
    renderAll();
  }
  function doMove(dir) {
    if (!Tutorial.allowsMove(dir)) { Sfx.deny(); return; }
    Sfx.unlock(); const r = Sim.move(s, dir); if (!r.ok) { Sfx.deny(); log('sys', r.why, 'sys'); return; }
    log('sys', `You walk to ${Sim.STATIONS[s.pos].name.toLowerCase()}.`, 'sys act'); animate(r.events); selCard = selTarget = null; renderAll();
  }
  function doWait() {
    const A = Tutorial.allow();
    if (!A.wait || (Tutorial.isActive() && A.swap && !selCard)) { Sfx.deny(); return; }
    Sfx.unlock();
    const swap = selCard; const r = Sim.wait(s, swap);
    if (!r.ok) { Sfx.deny(); log('sys', r.why, 'sys'); return; }
    log('sys', swap ? 'You wait half an hour and trade one card for another.' : 'You wait half an hour.', 'sys act');
    selCard = selTarget = null; animate(r.events); renderAll();
  }
  function doBoard() { if (!Tutorial.allow().board) { Sfx.deny(); return; } Sfx.unlock(); const r = Sim.board(s); if (!r.ok) { Sfx.deny(); log('sys', r.why, 'sys'); return; } animate(r.events); renderAll(); }

  // ---- events to animation, sound and dialogue ----------------
  function animate(events) {
    for (const e of events) {
      switch (e.type) {
        case 'say': Render.enqueue({ dur: 10, start() { log(e.who, e.text); } }); break;
        case 'walk': Render.walk(e.from, e.to); break;
        case 'coin': Render.float('self', (e.delta > 0 ? '+' : '') + e.delta + ' australs', '#ffd24a'); Render.enqueue({ dur: 10, start() { Sfx.coin(e.delta > 0); } }); break;
        case 'favor': Render.float('self', (e.delta > 0 ? '+' : '') + e.delta + ' favor', '#b48ad8'); break;
        case 'heat': Render.float('self', (e.delta > 0 ? '+' : '') + e.delta + ' heat', e.delta > 0 ? '#ff6a6a' : '#7ad0ff'); Render.enqueue({ dur: 10, start() { Sfx.heat(e.delta > 0); } }); break;
        case 'state': Render.flash(e.id); if (e.group === 'people') Render.enqueue({ dur: 10, start() { Sfx.work(); } }); break;
        case 'arranged': Render.enqueue({ dur: 10, start() { Sfx.arranged(); } }); Render.float(targetFor(e.id), { papers: 'Papers ready', passage: 'Passage open', yard: 'Yard open', berth: 'Berth held', crate: 'Crate ready' }[e.id], '#5cd65c'); break;
        case 'courier': Render.courier('forger'); break;
        case 'run': Render.pipRun(e.to); break;
        case 'tick': Render.enqueue({ dur: 120, start() { Sfx.tick(); } }); break;
        case 'patrol': Render.patrol(); Render.enqueue({ dur: 10, start() { Sfx.patrol(); } }); break;
        case 'board': Render.enqueue({ dur: 300, start() { Sfx.whistle(); } }); break;
        case 'over': Render.gameOver(e); Render.enqueue({ dur: 10, start() { e.win ? Sfx.win() : Sfx.lose(); } }); break;
        case 'draw': Render.enqueue({ dur: 10, start() { Sfx.click(); } }); break;
        case 'price': Render.float('self', `bribes now cost ${e.bribe} australs`, '#ffb060'); break;
      }
    }
    if (events.some(x => x.type === 'state' && x.id === 'lookout' && x.to === 'idle')) Render.pipRun(1);
    Render.enqueue({ dur: 10, start() { renderAll(); tutorialSync(); } });
  }
  function targetFor(arr) { return { papers: 'papers', passage: 'guard', yard: 'teo', berth: 'brakeman', crate: 'crate' }[arr] || 'self'; }

  // ---- boot --------------------------------------------------
  function boot() {
    Render.start({ onPick: (id) => { if (!selCard) return; pick(id); } });
    $('back').onclick = () => doMove(-1); $('fwd').onclick = () => doMove(1);
    $('wait').onclick = doWait; $('board').onclick = doBoard;
    renderPersonas();
    $('newgame').onclick = () => { Sfx.unlock(); Sfx.click(); Tutorial.stop(); markSeen(); newGame(parseInt($('seed').value, 10) || 1, $('persona').value); };
    $('reroll').onclick = () => { Sfx.unlock(); Sfx.click(); Tutorial.stop(); markSeen(); newGame((Math.random() * 1e9) >>> 0, $('persona').value); };
    $('again').onclick = () => { Sfx.click(); newGame((Math.random() * 1e9) >>> 0, $('persona').value); };
    $('changewho').onclick = () => { Sfx.click(); $('over').hidden = true; showStart(); };
    $('persona').onchange = () => { Sfx.click(); persona = $('persona').value; Tutorial.stop(); newGame((Math.random() * 1e9) >>> 0, persona); };
    $('mute').onclick = () => { Sfx.unlock(); Sfx.setMuted(!Sfx.isMuted()); $('mute').textContent = Sfx.isMuted() ? 'Sound: off' : 'Sound: on'; };
    $('help').onclick = () => { $('helpbox').hidden = !$('helpbox').hidden; $('help').textContent = $('helpbox').hidden ? 'How to play' : 'Hide how to play'; };
    $('startscreen').onclick = () => { Sfx.click(); showStart(); };
    $('tutorial').onclick = () => { Sfx.unlock(); Sfx.click(); startTutorial(); };
    $('start-tut').onclick = () => { Sfx.unlock(); Sfx.click(); startTutorial(); };
    $('start-play').onclick = () => { Sfx.unlock(); Sfx.click(); startReal(persona); };
    $('start-close').onclick = () => { Sfx.click(); hideStart(); };
    $('coach-next').onclick = () => { Sfx.click(); Tutorial.next(); if (!Tutorial.isActive()) renderAll(); };
    $('coach-skip').onclick = () => { Sfx.click(); Tutorial.stop(); renderAll(); showStart(); };
    document.addEventListener('keydown', (ev) => {
      if (!$('start').hidden) return;
      if (ev.key === 'Escape') { selCard = selTarget = null; renderAll(); }
      if (ev.key === 'ArrowRight') doMove(1); if (ev.key === 'ArrowLeft') doMove(-1);
      if (ev.key >= '1' && ev.key <= '4') { const c = s.hand[+ev.key - 1]; if (c && Tutorial.allowsCard(c.type)) { selCard = selCard === c.uid ? null : c.uid; selTarget = null; Sfx.select(); renderAll(); tutorialSync(); } }
      if (ev.key === 'Enter') { if ($('commit') && !$('commit').disabled) commit(); else if (Tutorial.isActive() && !$('coach-next').hidden) $('coach-next').click(); }
    });
    // re-render controls as animations finish (busy flag), and let the tutorial advance once the scene is quiet
    setInterval(() => { const b = Render.busy(); if (document.body.classList.contains('busy') !== b) { renderControls(); if (!b) tutorialSync(); } }, 120);
    // A quiet board behind the start screen, so the picture is there while you read.
    persona = 'cartographer'; $('persona').value = persona;
    newGame((Math.random() * 1e9) >>> 0, persona);
    showStart();
  }
  return { boot };
})();
window.addEventListener('DOMContentLoaded', UI.boot);
