/* ============================================================
   Guided runs. The steps are content (content/coalition/tutorials.json,
   pattern P13); this file is only the engine. Each run has a fixed seed and
   scripted dice so every step lands. Act steps list what the player may do
   and a declarative completion condition; read steps wait for Next.
   The UI asks Tutorial.allows*() what is permitted and shows the coach box.
   ============================================================ */
'use strict';
const Tutorial = (() => {
  const C = (typeof Content !== 'undefined') ? Content : require('./content.js');
  const RUNS = {}; for (const t of C.tutorials.tutorials) RUNS[t.id] = t;
  const esc = RUNS.escape;
  const NONE = { approaches: [], calls: [], options: [], events: false, wait: false, next: false };
  const shape = (st) => Object.assign({}, st, { allow: st.kind === 'read' ? Object.assign({}, NONE, { next: true }) : Object.assign({}, NONE, st.allow || {}) });
  let run = null, steps = [], i = -1;

  // declarative conditions: escape conditions read the Sim run, government ones read the Gov run
  function check(cond, st) {
    if (!cond) return false;
    if (cond.any) return cond.any.some(c => check(c, st));
    const s = st.c || st, g = st.c ? st : null;
    for (const k in cond) {
      const v = cond[k];
      const ok = k === 'flag' ? !!s.flags[v]
        : k === 'job' ? s.jobs.some(j => j.arr === v)
        : k === 'pos' ? s.pos === v
        : k === 'stage' ? s.arr[v[0]].stage >= v[1]
        : k === 'card' ? s.hand.includes(v)
        : k === 'answered' ? !!g && (g.answered || []).includes(v)
        : k === 'request' ? !!g && (g.pending.some(j => j.job === v) || g.req[v] === 'inhand')
        : k === 'ban' ? !!s.flags.restriction === v
        : k === 'orders' ? !!g && g.orders.length >= v
        : k === 'belief' ? !!g && g.belief === v
        : k === 'chose' ? !!g && (g.chosen || 0) > 0
        : false;
      if (!ok) return false;
    }
    return true;
  }
  function start(id) { run = RUNS[id || 'escape']; steps = run.steps.map(shape); i = 0; }
  function stop() { i = -1; }
  const active = () => i >= 0 && i < steps.length;
  const step = () => active() ? steps[i] : null;
  const index = () => i;
  const isLast = () => i === steps.length - 1;
  const side = () => active() ? run.side : null;
  function allow() { return active() ? step().allow : { approaches: 'all', calls: 'all', options: 'all', events: true, wait: true, next: false }; }
  function allowsApproach(id) { const a = allow(); return a.approaches === 'all' || a.approaches.includes(id); }
  function allowsCall(id) { const a = allow(); return a.calls === 'all' || a.calls.includes(id); }
  function allowsOption(id) { const a = allow(); return a.options === 'all' || a.options.includes(id); }
  function allowsWait() { return allow().wait; }
  // called after each resolved action: advance past any done act step
  function sync(st) { let moved = false; while (active() && !step().allow.next && check(step().done, st)) { i += 1; moved = true; } return moved; }
  function forward() { if (active()) i += 1; }
  function next() { if (active() && step().allow.next) { if (isLast()) stop(); else i += 1; } }
  return { RUNS, SEED: esc.seed, WHO: esc.who, DICE: esc.dice, ENEMY: esc.enemy, get STEPS() { return steps.length ? steps : esc.steps.map(shape); },
    start, stop, active, step, index, isLast, side, allow, allowsApproach, allowsCall, allowsOption, allowsWait, sync, next, forward, check };
})();
if (typeof module !== 'undefined') module.exports = Tutorial;
