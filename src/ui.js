/* ============================================================
   UI: HTML hand / targets / inspection / dialogue / controls.
   Flow: pick card → applications revealed (scene + list) →
   inspect one → Commit → Sim resolves → events animated.
   ============================================================ */
'use strict';
const UI = (() => {
  let s = null, selCard = null, selTarget = null, seed = 1, persona = 'cartographer';
  const $ = (id) => document.getElementById(id);
  const SPEAKER = {
    you: ['Ines', '#e08a92'], forger: ['Dagny', '#b48ad8'], lookout: ['Pip', '#f0a060'], guard: ['Sgt. Osric', '#8ab0e0'],
    clerk: ['Mira', '#9ad080'], teo: ['Teo', '#d0b080'], brakeman: ['Holt', '#a0a8b8'], patrol: ['Patrol', '#ff6a6a'], sys: ['—', '#9a9aaa'],
  };

  function log(who, text, cls) {
    const el = document.createElement('div'); el.className = 'line ' + (cls || '');
    const sp = SPEAKER[who] || SPEAKER.sys;
    el.innerHTML = `<b style="color:${sp[1]}">${sp[0]}</b> <span>${text}</span>`;
    const box = $('dialogue'); box.appendChild(el); box.scrollTop = box.scrollHeight;
  }

  // ---- new game ---------------------------------------------
  function newGame(sd, who) {
    seed = sd >>> 0 || 1; persona = Sim.PERSONAS[who] ? who : persona;
    $('persona').value = persona;
    s = Sim.newGame(seed, persona);
    selCard = selTarget = null;
    Render.setState(s); Render.view.over = null; Render.view.floats = []; Render.view.queue = []; Render.view.current = null;
    Render.view.pipX = Render.STX[1] + 18;
    $('dialogue').innerHTML = '';
    $('seed').value = seed;
    const P0 = Sim.PERSONAS[persona];
    log('sys', `Verlane, ${Sim.clockText(0)}. The midnight freight is the last way out before the border closes. Tonight you are <b>${P0.name}</b>: ${P0.blurb} Seven hours.`, 'sys');
    log('you', 'Papers, a way past the barrier, a way across the yard, and a crate with my name on it. In that order, or any order that works.');
    renderAll();
  }

  // ---- rendering --------------------------------------------
  function renderAll() { renderStatus(); renderHand(); renderTargets(); renderControls(); renderNeeds(); renderOver(); syncHighlight(); }
  function renderPersonas() { const sel = $('persona'); sel.innerHTML = ''; for (const k in Sim.PERSONAS) { const o = document.createElement('option'); o.value = k; o.textContent = `${Sim.PERSONAS[k].name} — ${Sim.PERSONAS[k].coin} coin, ${Sim.PERSONAS[k].favor} favours, heat ${Sim.PERSONAS[k].heat}`; sel.appendChild(o); } }

  function renderStatus() {
    $('coin').textContent = s.coin; $('favor').textContent = s.favor;
    $('clock').textContent = Sim.clockText(s.tick);
    $('where').textContent = Sim.STATIONS[s.pos].name;
    const heat = $('heat'); heat.innerHTML = '';
    for (let i = 0; i < Sim.HEAT_LIMIT; i++) { const d = document.createElement('i'); if (i < s.heat) d.className = 'on' + (s.heat >= 6 ? ' hot' : ''); heat.appendChild(d); }
    const tl = $('timeline'); tl.innerHTML = '';
    for (let i = 0; i < Sim.TICKS_TOTAL; i++) { const d = document.createElement('i'); if (i < s.tick) d.className = 'on'; tl.appendChild(d); }
    $('heatnum').textContent = `${s.heat}/${Sim.HEAT_LIMIT}`;
  }

  function cardEl(c) {
    const d = Sim.CARD_DEFS[c.type], cost = Sim.cardCost(s, c.type);
    const el = document.createElement('button'); el.className = 'card ' + d.kind + (selCard === c.uid ? ' sel' : '');
    el.disabled = !!s.over;
    const apps = Sim.applications(s, c.type); const anyOk = apps.some(a => a.ok);
    if (!anyOk) el.classList.add('dead');
    el.innerHTML = `<span class="cname">${d.name}</span>
      <span class="ccost">${Sim.costText(cost)}${c.type === 'bribe' && s.bribes ? ' (price has risen)' : ''} · ${d.time ? d.time * 30 + ' min' : 'no time'}</span>
      <span class="cflavor">${d.flavor}</span>
      <span class="ctargets">${apps.filter(a => a.ok).length} of ${apps.length} uses available</span>`;
    el.onclick = () => { Sfx.unlock(); if (selCard === c.uid) { selCard = null; selTarget = null; Sfx.click(); } else { selCard = c.uid; selTarget = null; Sfx.select(); } renderAll(); };
    return el;
  }
  function renderHand() {
    const h = $('hand'); h.innerHTML = '';
    for (const c of s.hand) h.appendChild(cardEl(c));
    $('deckinfo').textContent = `${s.deck.length} in deck · ${s.discard.length} discarded`;
  }

  function currentApps() {
    const c = s.hand.find(x => x.uid === selCard); if (!c) return null;
    return { card: c, def: Sim.CARD_DEFS[c.type], apps: Sim.applications(s, c.type) };
  }
  function syncHighlight() {
    const cur = currentApps();
    if (!cur) { Render.setHighlight(null); return; }
    Render.setHighlight({ ok: new Set(cur.apps.filter(a => a.ok).map(a => a.id)), bad: new Set(cur.apps.filter(a => !a.ok).map(a => a.id)), selected: selTarget });
  }
  function renderTargets() {
    const box = $('targets'), cur = currentApps();
    if (!cur) {
      box.innerHTML = `<p class="hint">Select a card to see who and what it can affect. Highlighted figures in the scene are the same list.</p>`;
      $('inspect').classList.add('empty'); $('inspect').innerHTML = ''; return;
    }
    const { card, def, apps } = cur;
    box.innerHTML = `<h3>${def.name} <small>can affect…</small></h3>`;
    const ul = document.createElement('ul');
    for (const a of apps) {
      const li = document.createElement('li'); li.className = (a.ok ? 'ok' : 'no') + (selTarget === a.id ? ' sel' : '') + ' k-' + a.kind;
      const where = a.id === 'self' ? '' : ` <em>· ${a.kind}</em>`;
      li.innerHTML = `<span class="tl">${a.label}${where}</span>${a.ok ? '' : `<span class="why">${a.why}</span>`}`;
      li.onclick = () => pick(a.id);
      ul.appendChild(li);
    }
    box.appendChild(ul);
    const ins = $('inspect'); const a = apps.find(x => x.id === selTarget);
    if (!a) { ins.classList.add('empty'); ins.innerHTML = `<p class="hint">Pick a target in the list or in the scene to inspect what would happen.</p>`; return; }
    ins.classList.remove('empty');
    ins.innerHTML = `<h3>${def.name} → ${a.label}</h3>
      <ul class="preview">${a.preview.map(x => `<li>${x}</li>`).join('')}</ul>
      <p class="cost">Costs ${Sim.costText(Sim.cardCost(s, card.type))}${def.time ? ` and ${def.time * 30} minutes` : ', no time'}.${card.type === 'bribe' ? ' Every bribe raises the next one\'s price by ' + Sim.BRIBE_STEP + ' coin.' : ''}</p>
      ${a.ok ? '' : `<p class="blocked">${a.why}</p>`}
      <div class="row"><button id="commit" class="primary" ${a.ok && !s.over ? '' : 'disabled'}>Commit</button><button id="cancel">Cancel</button></div>`;
    $('commit').onclick = commit; $('cancel').onclick = () => { selCard = selTarget = null; Sfx.click(); renderAll(); };
  }
  function pick(id) {
    const cur = currentApps(); if (!cur) return;
    const a = cur.apps.find(x => x.id === id); if (!a) return;
    selTarget = id; a.ok ? Sfx.select() : Sfx.deny(); renderAll();
  }

  function renderNeeds() {
    const A = Sim.arrangements(s); const ul = $('needs'); ul.innerHTML = '';
    for (const k in A) { const li = document.createElement('li'); li.className = A[k].done ? 'done' : ''; li.innerHTML = `<b>${A[k].name}</b> <span>${A[k].done ? 'arranged' : A[k].how}</span>`; ul.appendChild(li); }
    const pend = $('pending'); pend.innerHTML = '';
    if (!s.jobs.length) pend.innerHTML = '<li class="none">Nothing in progress.</li>';
    for (const j of s.jobs) {
      const li = document.createElement('li');
      const name = { forge: 'Dagny inking your papers', distract: 'Osric distracted', lookout: 'Pip causing trouble', picklock: j.who === 'gate' ? 'You, picking the side gate' : 'You, preparing a crate' }[j.type];
      li.innerHTML = `<b>${name}</b> <span>${j.remaining * 30} min left</span>`; pend.appendChild(li);
    }
  }

  function renderControls() {
    const over = !!s.over, busy = Render.busy();
    const back = Sim.canMove(s, -1), fwd = Sim.canMove(s, 1);
    $('back').disabled = over || !back.ok; $('back').title = back.ok ? `Walk back to ${Sim.STATIONS[back.to].name} (30 min)` : back.why;
    $('fwd').disabled = over || !fwd.ok;
    $('fwd').textContent = fwd.to != null && fwd.to < Sim.STATIONS.length ? `Walk on to ${Sim.STATIONS[fwd.to].short} ▶` : 'Walk on ▶';
    $('fwd').title = fwd.ok ? `Walk to ${Sim.STATIONS[fwd.to].name} (30 min)` : (fwd.why || '');
    $('fwdwhy').textContent = (!fwd.ok && fwd.why && fwd.to != null) ? fwd.why : '';
    $('wait').disabled = over;
    $('wait').textContent = selCard ? 'Wait 30 min & swap the selected card' : 'Wait 30 min';
    const b = Sim.canBoard(s); $('board').disabled = over || !b.ok; $('board').title = b.ok ? 'Climb into the crate' : b.why;
    $('board').classList.toggle('ready', b.ok && !over);
    document.body.classList.toggle('busy', busy);
  }
  // ---- career records: you against yourself (localStorage only, never leaves the browser) ------
  function loadRecords() { try { return JSON.parse(localStorage.getItem('lfo.records') || '{}'); } catch (e) { return {}; } }
  function recordNight() {
    if (!s.over || s.recorded) return; s.recorded = true;
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
    if (!r.nights) { el.textContent = 'No nights played yet in this browser.'; return; }
    el.innerHTML = `${r.escapes}/${r.nights} escapes · streak ${r.streak} (best ${r.bestStreak})` +
      (r.earliest != null ? ` · earliest out ${Sim.clockText(r.earliest)} · coolest escape heat ${r.coolest} · richest ${r.richest} coin` : '');
  }
  function renderOver() {
    const o = $('over');
    if (!s.over) { o.hidden = true; renderRecords(); return; }
    recordNight(); renderRecords();
    o.hidden = false; o.className = s.over.win ? 'win' : 'lose';
    $('overtitle').textContent = s.over.win ? 'Out of Verlane' : 'Caught';
    $('overtext').textContent = s.over.reason + ` (${s.tick * 30} minutes used, heat ${s.heat}, seed ${seed}.)`;
  }

  // ---- actions ----------------------------------------------
  function commit() {
    const cur = currentApps(); if (!cur || !selTarget) return;
    Sfx.unlock();
    const r = Sim.play(s, cur.card.uid, selTarget);       // resolve first
    if (!r.ok) { Sfx.deny(); log('sys', r.why, 'sys'); return; }
    log('sys', `You play <b>${cur.def.name}</b> on ${cur.apps.find(a => a.id === selTarget).label}.`, 'sys act');
    Sfx.confirm();
    selCard = selTarget = null;
    animate(r.events);                                     // then animate the consequences
    renderAll();
  }
  function doMove(dir) { Sfx.unlock(); const r = Sim.move(s, dir); if (!r.ok) { Sfx.deny(); log('sys', r.why, 'sys'); return; } log('sys', `You walk to ${Sim.STATIONS[s.pos].name}.`, 'sys act'); animate(r.events); selCard = selTarget = null; renderAll(); }
  function doWait() {
    Sfx.unlock();
    const swap = selCard; const r = Sim.wait(s, swap);
    if (!r.ok) { Sfx.deny(); log('sys', r.why, 'sys'); return; }
    log('sys', swap ? 'You wait half an hour and quietly rethink one of your options.' : 'You wait half an hour.', 'sys act');
    selCard = selTarget = null; animate(r.events); renderAll();
  }
  function doBoard() { Sfx.unlock(); const r = Sim.board(s); if (!r.ok) { Sfx.deny(); log('sys', r.why, 'sys'); return; } animate(r.events); renderAll(); }

  // ---- events → animation, sound, dialogue -------------------
  function animate(events) {
    for (const e of events) {
      switch (e.type) {
        case 'say': Render.enqueue({ dur: 10, start() { log(e.who, e.text); } }); break;
        case 'walk': Render.walk(e.from, e.to); break;
        case 'coin': Render.float('self', (e.delta > 0 ? '+' : '') + e.delta + ' coin', '#ffd24a'); Render.enqueue({ dur: 10, start() { Sfx.coin(e.delta > 0); } }); break;
        case 'favor': Render.float('self', (e.delta > 0 ? '+' : '') + e.delta + ' favour', '#b48ad8'); break;
        case 'heat': Render.float('self', (e.delta > 0 ? '+' : '') + e.delta + ' heat', e.delta > 0 ? '#ff6a6a' : '#7ad0ff'); Render.enqueue({ dur: 10, start() { Sfx.heat(e.delta > 0); } }); break;
        case 'state': Render.flash(e.id); if (e.group === 'people') Render.enqueue({ dur: 10, start() { Sfx.work(); } }); break;
        case 'arranged': Render.enqueue({ dur: 10, start() { Sfx.arranged(); } }); Render.float(targetFor(e.id), { papers: 'PAPERS READY', passage: 'PASSAGE OPEN', yard: 'YARD OPEN', berth: 'BERTH HELD', crate: 'CRATE READY' }[e.id], '#5cd65c'); break;
        case 'courier': Render.courier('forger'); break;
        case 'run': Render.pipRun(e.to); break;
        case 'tick': Render.enqueue({ dur: 120, start() { Sfx.tick(); } }); break;
        case 'patrol': Render.patrol(); Render.enqueue({ dur: 10, start() { Sfx.patrol(); } }); break;
        case 'board': Render.enqueue({ dur: 300, start() { Sfx.whistle(); } }); break;
        case 'over': Render.gameOver(e); Render.enqueue({ dur: 10, start() { e.win ? Sfx.win() : Sfx.lose(); } }); break;
        case 'draw': Render.enqueue({ dur: 10, start() { Sfx.click(); } }); break;
        case 'price': Render.float('self', `bribes now ${e.bribe} coin`, '#ffb060'); break;
      }
    }
    if (events.some(x => x.type === 'state' && x.id === 'lookout' && x.to === 'idle')) Render.pipRun(1);
    Render.enqueue({ dur: 10, start() { renderAll(); } });
  }
  function targetFor(arr) { return { papers: 'papers', passage: 'guard', yard: 'teo', berth: 'brakeman', crate: 'crate' }[arr] || 'self'; }

  // ---- boot --------------------------------------------------
  function boot() {
    Render.start({ onPick: (id) => { if (!selCard) return; pick(id); } });
    $('back').onclick = () => doMove(-1); $('fwd').onclick = () => doMove(1);
    $('wait').onclick = doWait; $('board').onclick = doBoard;
    renderPersonas();
    $('newgame').onclick = () => { Sfx.unlock(); Sfx.click(); newGame(parseInt($('seed').value, 10) || 1, $('persona').value); };
    $('reroll').onclick = () => { Sfx.unlock(); Sfx.click(); newGame((Math.random() * 1e9) >>> 0, $('persona').value); };
    $('again').onclick = () => { Sfx.click(); newGame((Math.random() * 1e9) >>> 0, $('persona').value); };
    $('persona').onchange = () => { Sfx.click(); newGame((Math.random() * 1e9) >>> 0, $('persona').value); };
    $('mute').onclick = () => { Sfx.unlock(); Sfx.setMuted(!Sfx.isMuted()); $('mute').textContent = Sfx.isMuted() ? 'Sound: off' : 'Sound: on'; };
    $('help').onclick = () => { $('helpbox').hidden = !$('helpbox').hidden; };
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') { selCard = selTarget = null; renderAll(); }
      if (ev.key === 'ArrowRight') doMove(1); if (ev.key === 'ArrowLeft') doMove(-1);
      if (ev.key >= '1' && ev.key <= '4') { const c = s.hand[+ev.key - 1]; if (c) { selCard = selCard === c.uid ? null : c.uid; selTarget = null; Sfx.select(); renderAll(); } }
      if (ev.key === 'Enter' && $('commit') && !$('commit').disabled) commit();
    });
    // re-render controls as animations finish (busy flag)
    setInterval(() => { const b = Render.busy(); if (document.body.classList.contains('busy') !== b) renderControls(); }, 120);
    newGame((Math.random() * 1e9) >>> 0);
  }
  return { boot };
})();
window.addEventListener('DOMContentLoaded', UI.boot);
