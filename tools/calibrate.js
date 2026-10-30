#!/usr/bin/env node
/* Calibration harness for Last Freight Out.
   Plays many seeded nights with a fixed, deliberately mediocre policy and
   reports win rate, loss causes and timing per persona. It describes the
   economy; it fits nothing. Run: node tools/calibrate.js [nights]      */
'use strict';
const path = require('path');
const Sim = require(path.join(__dirname, '..', 'src', 'sim.js'));
const N = parseInt(process.argv[2], 10) || 500;

function useful(s, c, a) {
  const A = Sim.arrangements(s), t = a.id;
  if (c.type === 'laylow') return s.heat >= 4;
  if (c.type === 'sellmaps') return s.coin < 3;
  if (['forgery', 'courier'].includes(c.type)) return !A.papers.done && s.objects.papers.state === 'blank';
  if (t === 'guard' || t === 'gate' || t === 'lookout') return !A.passage.done && s.pos <= 2;
  if (t === 'teo') return !A.yard.done && !A.papers.done;
  if (t === 'clerk') return s.objects.papers.state === 'inking';
  if (t === 'brakeman') return !A.berth.done;
  if (t === 'crate') return !A.berth.done && s.people.teo.state !== 'friendly';
  if (t === 'forger') return s.objects.papers.state === 'inking';
  return false;
}
function playNight(seed, persona) {
  const s = Sim.newGame(seed, persona); let guard = 0, cards = 0, bribes = 0;
  while (!s.over && guard++ < 200) {
    let played = false;
    for (const c of s.hand) {
      const apps = Sim.applications(s, c.type).filter(a => a.ok && useful(s, c, a));
      if (apps.length) { Sim.play(s, c.uid, apps[0].id); cards++; if (c.type === 'bribe') bribes++; played = true; break; }
    }
    if (played) continue;
    if (Sim.canBoard(s).ok) { Sim.board(s); break; }
    if (Sim.canMove(s, 1).ok) { Sim.move(s, 1); continue; }
    const dead = s.hand.find(c => !Sim.applications(s, c.type).some(a => a.ok)) || s.hand[0];
    Sim.wait(s, dead.uid);
  }
  if (!s.over) throw new Error('stuck on seed ' + seed);
  return { win: s.over.win, reason: s.over.reason.startsWith('Midnight') ? 'clock' : s.over.win ? 'win' : 'heat', tick: s.tick, heat: s.heat, coin: s.coin, cards, bribes };
}
for (const persona of Object.keys(Sim.PERSONAS)) {
  const rows = []; for (let seed = 1; seed <= N; seed++) rows.push(playNight(seed, persona));
  const wins = rows.filter(r => r.win);
  const causes = {}; rows.filter(r => !r.win).forEach(r => causes[r.reason] = (causes[r.reason] || 0) + 1);
  const mean = (k, xs = wins) => xs.length ? (xs.reduce((a, r) => a + r[k], 0) / xs.length).toFixed(2) : '-';
  console.log(`${Sim.PERSONAS[persona].name.padEnd(22)} win ${(100 * wins.length / N).toFixed(1).padStart(5)}%  losses ${JSON.stringify(causes).padEnd(28)} ` +
              `board@ ${wins.length ? Sim.clockText(Math.round(mean('tick'))) : '-'}  heat ${mean('heat')}  coin left ${mean('coin')}  cards ${mean('cards', rows)}  bribes ${mean('bribes', rows)}`);
}
// determinism: the same seed and persona must replay to the same bytes
const a = JSON.stringify(Object.assign({}, Sim.newGame(42, 'niece'), { _rng: null })), b = JSON.stringify(Object.assign({}, Sim.newGame(42, 'niece'), { _rng: null }));
console.log('deterministic:', a === b);
