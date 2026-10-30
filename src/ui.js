/* ============================================================
   COALITION UI. Reveal → inspect → commit → the sim resolves → the
   consequences animate. Everything textual lives here in HTML.
   ============================================================ */
'use strict';
const UI = (() => {
  let s = null, sel = null, who = 'woman', enemyLog = [];
  const $ = (id) => document.getElementById(id);
  const COLORS = { narrator: '#9a9aaa', sibling: '#b48ad8', aide: '#7ab0ff', nando: '#d0b080', sponsor: '#ffd24a', registry: '#9ad080', host: '#f0a060', official: '#e08a92', holt: '#a0a8b8', theo: '#d0b080', pilot: '#8ab0e0', enemy: '#ff6a6a', sys: '#9a9aaa' };
  function log(whoId, text, cls) {
    const el = document.createElement('div'); el.className = 'line ' + (cls || '');
    const name = whoId === 'narrator' || whoId === 'sys' ? '' : whoId === 'enemy' ? Data.ENEMY.name : Sim.personName(s, whoId);
    el.innerHTML = `${name ? `<b style="color:${COLORS[whoId] || '#ccc'}">${name}</b> ` : ''}<span>${text}</span>`;
    const box = $('dialogue'); box.appendChild(el); box.scrollTop = box.scrollHeight;
  }
  function newRun(w) {
    who = w; s = Sim.newRun((Math.random() * 1e9) >>> 0, who); sel = null; enemyLog = [];
    Render.setState(s); Render.view.over = null; Render.view.queue = []; Render.view.current = null;
    $('dialogue').innerHTML = ''; $('start').hidden = true;
    const c = Data.CHARACTERS[who];
    log('sys', `${Sim.clockText(0)}. You are ${c.name}, ${c.title}. ${c.sibling.name}, ${c.sibling.rel}, is abroad and has started on the aircraft.`, 'sys');
    animate(s._boot); renderAll();
  }
  function renderAll() { renderStatus(); renderHere(); renderPhone(); renderHand(); renderPeople(); renderEnemy(); renderOver(); document.body.classList.toggle('busy', Render.busy()); }
  function renderStatus() {
    $('clock').textContent = Sim.clockText(s.hour); $('left').textContent = `${Sim.HOURS_TOTAL - s.hour} h left`;
    $('where').textContent = Data.LEVELS[s.pos].short; $('belief').textContent = s.belief < 0 ? 'unknown' : Data.LEVELS[s.belief].short + (s.belief === s.pos ? ' (right)' : ' (wrong)');
    const h = $('heat'); h.innerHTML = ''; for (let i = 0; i < Sim.EXPOSURE_LIMIT; i++) { const d = document.createElement('i'); if (i < s.exposure) d.className = 'on' + (s.exposure >= 7 ? ' hot' : ''); h.appendChild(d); } $('heatnum').textContent = `${s.exposure}/${Sim.EXPOSURE_LIMIT}`;
    $('lvlname').textContent = Data.LEVELS[s.pos].name; $('lvlobj').textContent = Data.LEVELS[s.pos].objective;
  }
  function actBtn(a, kind) {
    const b = document.createElement('button'); b.className = 'act ' + kind + (a.ok ? '' : ' no') + (sel === a.id ? ' sel' : '') + (a.pay ? ' pay' : '') + (a.ok && a.need <= 1 ? ' sure' : '') + (a.ok && a.need > 6 ? ' hard' : '');
    b.innerHTML = `<span class="nm">${a.name}</span><span class="meta">${a.hours ? a.hours + ' h' : 'no time'}${a.odds ? ' · ' + a.odds : ''}</span>${a.ok ? '' : `<span class="why">${a.why}</span>`}`;
    b.onclick = () => { Sfx.unlock(); sel = sel === a.id ? null : a.id; Sfx.select(); renderAll(); };
    return b;
  }
  function renderHere() {
    const A = Sim.actions(s); const box = $('approaches'); box.innerHTML = '';
    for (const a of A.approaches) box.appendChild(actBtn(a, 'approach'));
    const ins = $('inspect'); const a = A.approaches.find(x => x.id === sel) || A.calls.find(x => x.id === sel);
    if (!a) { ins.className = 'empty'; ins.innerHTML = ''; return; }
    ins.className = ''; ins.innerHTML = `<h3>${a.name}</h3><ul class="preview">${a.preview.map(x => `<li>${x}</li>`).join('')}</ul>${a.ok ? '' : `<p class="why" style="color:var(--red)">${a.why}</p>`}<div class="row"><button id="commit" class="primary" ${a.ok && !s.over ? '' : 'disabled'}>Commit</button><button id="cancel">Cancel</button></div>`;
    $('commit').onclick = () => doCommit(a.id); $('cancel').onclick = () => { sel = null; renderAll(); };
    $('wait').disabled = !!s.over;
  }
  function renderPhone() {
    const A = Sim.actions(s); const inbox = $('inbox'); inbox.innerHTML = '';
    if (!A.messages.length) inbox.innerHTML = '<p class="hint">No messages waiting.</p>';
    for (const m of A.messages) {
      const d = document.createElement('div'); d.className = 'msg'; d.innerHTML = `<span class="from">${Sim.personName(s, m.from)}</span><p>${s.inbox.find(x => x.id === m.msgId).text}</p>`;
      for (const o of m.options) { const b = document.createElement('button'); b.className = 'opt'; b.disabled = !o.ok || !!s.over; b.innerHTML = `${o.label}${o.hours ? ` <span class="small">(${o.hours} h)</span>` : ''}<small>${o.ok ? o.effect : o.why}</small>`; b.onclick = () => doCommit(m.id, o.id); d.appendChild(b); }
      inbox.appendChild(d);
    }
    const ul = $('arrangements'); ul.innerHTML = '';
    for (const k in Data.ARRANGEMENTS) { const def = Data.ARRANGEMENTS[k], a = s.arr[k], job = s.jobs.find(j => j.arr === k); const li = document.createElement('li'); li.className = a.stage === def.stages.length - 1 ? 'done' : ''; li.title = def.what; li.innerHTML = `<b>${def.name}</b> <span class="st">${def.stages[a.stage]}</span>${job ? `<span class="pend"> · ${Sim.personName(s, job.ally)} working, due ${Sim.clockText(job.due)}</span>` : ''}`; ul.appendChild(li); }
    const calls = $('calls'); calls.innerHTML = '';
    for (const c of A.calls) calls.appendChild(actBtn(c, 'call'));
  }
  function renderHand() {
    const h = $('hand'); h.innerHTML = s.hand.length ? '' : '<p class="hint">Nobody has given you anything you can use yet.</p>';
    for (const id of s.hand) { const c = Data.CARDS[id]; const d = document.createElement('div'); d.className = 'card'; d.innerHTML = `<span class="cn">${c.name}</span><span class="tag">${c.tag}</span><br><span class="from">from ${c.from === 'self' ? 'you' : Sim.personName(s, c.from)}${c.tag === 'influence' && s.pos >= Sim.ESMERALDA_FROM ? ' · not recognized here' : ''}</span><p>${c.text}</p>`; h.appendChild(d); }
  }
  function renderPeople() {
    const ul = $('people'); ul.innerHTML = '';
    for (const k in Data.PEOPLE) { const pr = s.people[k]; const li = document.createElement('li'); li.className = pr.turned ? 'turned' : pr.trust >= 2 ? 'trust' : ''; const cm = s.commitments.find(c => c.to === k); li.innerHTML = `<b>${Sim.personName(s, k)}</b>, ${Data.PEOPLE[k].role}${pr.turned ? '. Has talked to the inquiry.' : pr.trust >= 2 ? '. Trusts you.' : ''}${cm ? `<span class="terms">Your word: ${cm.text}${cm.kept === false ? ' (broken)' : cm.kept === true ? ' (kept)' : ' (due)'}</span>` : ''}`; ul.appendChild(li); }
  }
  function renderEnemy() { const ul = $('enemy'); ul.innerHTML = enemyLog.length ? '' : '<li>Nothing yet. Sosā is reading the file.</li>'; for (const t of enemyLog.slice(-6).reverse()) { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); } }
  function renderOver() { const o = $('over'); if (!s.over) { o.hidden = true; return; } o.hidden = false; o.className = s.over.win ? 'win' : 'lose'; $('overtitle').textContent = s.over.win ? 'Out' : 'Caught'; $('overtext').textContent = s.over.reason + ` ${s.hour} hours, exposure ${s.exposure}.`; }

  function doCommit(id, opt) {
    Sfx.unlock(); const r = Sim.commit(s, id, opt);
    if (!r.ok) { Sfx.deny(); log('sys', r.why, 'sys'); return; }
    Sfx.confirm(); sel = null; animate(r.events); renderAll();
  }
  function animate(events) {
    for (const e of events) {
      switch (e.type) {
        case 'say': Render.enqueue({ dur: 10, start() { log(e.who, e.text); } }); break;
        case 'attempt': Render.enqueue({ dur: 10, start() { log('sys', `You try: ${e.name}.`, 'sys'); } }); break;
        case 'roll': if (!e.who) { Render.dice(e.die, e.need, e.won); Render.enqueue({ dur: 10, start() { Sfx.dice(); log('sys', `The die shows ${e.die}; it needed ${e.need}${e.bonus && e.bonus.length ? ` (lowered by ${e.bonus.join(', ')})` : ''}. ${e.won ? 'It holds.' : 'It fails.'}`, 'roll'); } }); }
                     else Render.enqueue({ dur: 10, start() { log('sys', `${e.pressed ? Data.ENEMY.name + ' presses ' : ''}${Sim.personName(s, e.who)}${e.pressed ? '' : ' rolls'}: ${e.die} against ${e.need}. ${e.won ? (e.pressed ? 'Holds.' : 'Delivered.') : (e.pressed ? 'Breaks.' : 'Not yet.')}`, 'roll'); } }); break;
        case 'exposure': Render.float(Render.W * Render.SCALE / 2, 120, (e.delta > 0 ? '+' : '') + e.delta + ' exposure', e.delta > 0 ? '#ff6a6a' : '#7ad0ff'); Render.enqueue({ dur: 10, start() { Sfx.heat(e.delta > 0); } }); break;
        case 'belief': Render.enqueue({ dur: 300, start() { Sfx.click(); } }); break;
        case 'card': Render.enqueue({ dur: 10, start() { Sfx.arranged(); log('sys', `${Sim.personName(s, e.from)} gives you: ${e.name}.`, 'sys'); } }); break;
        case 'cardlost': Render.enqueue({ dur: 10, start() { log('sys', `Gone from your hand: ${e.name}.`, 'sys'); } }); break;
        case 'commit': Render.enqueue({ dur: 10, start() { log('sys', `You now owe ${Sim.personName(s, e.to)}: ${e.text}`, 'sys'); } }); break;
        case 'stage': Render.enqueue({ dur: 10, start() { Sfx.arranged(); } }); break;
        case 'job': Render.enqueue({ dur: 10, start() { log('sys', `${Sim.personName(s, e.ally)} is on it. Expect word by ${e.dueText}.`, 'sys'); } }); break;
        case 'message': Render.ring(); Render.enqueue({ dur: 10, start() { Sfx.ring(); log('sys', `A message from ${Sim.personName(s, e.from)}. See the phone.`, 'sys'); } }); break;
        case 'answered': Render.enqueue({ dur: 10, start() { log('sys', `You answer: ${e.label}.`, 'sys'); } }); break;
        case 'enemy': Render.enemy(); Render.enqueue({ dur: 10, start() { Sfx.patrol(); enemyLog.push(e.text); log('enemy', e.text, 'enemy'); } }); break;
        case 'travel': Render.travel(); Render.enqueue({ dur: 10, start() { Sfx.step(0); } }); break;
        case 'arrive': break;
        case 'hour': break;
        case 'over': if (e.win) Render.enqueue({ dur: 1600, start() { Sfx.jet(); } }); Render.gameOver(e); Render.enqueue({ dur: 10, start() { e.win ? Sfx.win() : Sfx.lose(); } }); break;
      }
    }
    Render.enqueue({ dur: 10, start() { renderAll(); } });
  }
  function showStart() {
    const box = $('start-chars'); box.innerHTML = '';
    for (const k in Data.CHARACTERS) { const c = Data.CHARACTERS[k]; const b = document.createElement('button'); b.className = 'who'; b.innerHTML = `<b>${c.name}</b><span>${c.title}; ${c.sibling.rel} ${c.sibling.short} is abroad</span><p>${c.blurb}</p>`; b.onclick = () => { Sfx.unlock(); Sfx.click(); newRun(k); }; box.appendChild(b); }
    $('start').hidden = false;
  }
  function boot() {
    Render.start({ onPick: (id) => { if (id !== 'self') log('sys', document.querySelector('#people li b') ? `${Sim.personName(s, id)}: ${Data.PEOPLE[id].role}.` : '', 'sys'); } });
    $('wait').onclick = () => doCommit('wait');
    $('again').onclick = () => { Sfx.click(); newRun(who); };
    $('changewho').onclick = () => { Sfx.click(); $('over').hidden = true; showStart(); };
    $('startscreen').onclick = () => showStart();
    $('mute').onclick = () => { Sfx.unlock(); Sfx.setMuted(!Sfx.isMuted()); $('mute').textContent = Sfx.isMuted() ? 'Sound: off' : 'Sound: on'; };
    $('help').onclick = () => { $('helpbox').hidden = !$('helpbox').hidden; };
    setInterval(() => { if (!s) return; const b = Render.busy(); if (document.body.classList.contains('busy') !== b) document.body.classList.toggle('busy', b); }, 120);
    s = Sim.newRun(1, 'woman'); Render.setState(s); showStart();
  }
  return { boot };
})();
window.addEventListener('DOMContentLoaded', UI.boot);
