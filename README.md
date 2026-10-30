# Last Freight Out

A single-file, offline card-and-route escape game set in the Nelôxia universe
(quarterback/kels). You are Inēs Biankī, a chart-maker in a rail town in Salta,
Valdória, on the edge of la Perlā. Your name is in the ledger for a debt you
cannot pay, and the midnight frēt over the Huhūi passes to Esmeralda is the last
one before the line closes. Seven hours, a hand of tricks, a town that knows
your hand.

Open `index.html` in a browser. Nothing is fetched at runtime. p5.js 1.9.4 is
embedded, all sound is synthesized with Web Audio and career records live in
`localStorage` only.

## How it plays

- Cards are tricks: bribe, distraction, forgery, favors, lock-picking.
  Selecting one lights up every person, object or place it can affect, in
  the pixel-art scene and in the Applications list. Inspect a target to read
  what would happen, then commit. The simulation resolves at once and the
  scene then animates the consequences.
- The route is five stations: the attic over the galpôn, the ferjā, the customs
  post, the jārd and the frēt platform. Walking takes 30 minutes. Two legs are
  gated: passage past Gaspār the customs guard, and the jārd, which Mārtā at the
  registry window or Theo the fôrman controls. Boarding needs a berth from Holt
  the brakeman.
- Pending work is visible. Lūçīā inks your pāsportô over three half-hours,
  Gaspār stays distracted for a while, Pipô runs off to cause trouble, the gate
  and the crate change when your work finishes, Mārtā's window lights when it
  opens and the route bar turns green as legs open.
- One wallet of australs plus favors. Every bribe raises the price of the
  next. Heat climbs when people notice you, and the bailiffs take you at 8.
  Three personas start the night with different purses.
- The lore that the setting, names and words come from is listed in
  `docs/aar-last-freight-out.md`; the one piece of new canon the game proposes,
  Esmeralda, is in `docs/PROPOSAL-esmeralda.md`.
- Waiting with a card selected swaps that card for a fresh draw.

Keys 1 to 4 pick a card, the arrow keys walk, Enter commits and Esc cancels.

## Layout

| Path | What |
| --- | --- |
| `index.html` | The delivered game (built, self-contained) |
| `src/sim.js` | Simulation: all game truth, no DOM, no rendering. Node-loadable |
| `src/render.js` | p5 pixel-art scene, route presentation and animation queue |
| `src/ui.js` | HTML hand, applications, inspection, dialogue and controls |
| `src/audio.js` | Web Audio synth |
| `src/style.css`, `src/shell.html` | Styles and page shell |
| `vendor/p5.min.js` | Pinned p5.js 1.9.4 |
| `tools/build.py` | Inlines everything into `index.html` |
| `tools/calibrate.js` | Policy harness: win rate, loss causes and timing per persona |

Rebuild after editing `src/`:

```bash
python3 tools/build.py
```

Measure the economy before retuning a number:

```bash
node tools/calibrate.js 500
```

Design notes and measurements are in `docs/aar-last-freight-out.md`. The
closedtab Agent Action Record for the build is
`docs/aar-last-freight-out-first-build.md`.
