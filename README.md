# Last Freight Out

A single-file, offline card-and-route escape game. You are trying to get out of
the border town of Verlane on the midnight freight. Seven hours, a hand of
tricks, a street that remembers your face.

Open `index.html` in a browser. Nothing is fetched at runtime. p5.js 1.9.4 is
embedded, all sound is synthesized with Web Audio and career records live in
`localStorage` only.

## How it plays

- Cards are tricks: bribe, distraction, forgery, favors, lock-picking.
  Selecting one lights up every person, object or place it can affect, in
  the pixel-art scene and in the Applications list. Inspect a target to read
  what would happen, then commit. The simulation resolves at once and the
  scene then animates the consequences.
- The route is five stations: the attic, Market Square, the checkpoint, the
  rail yard and the freight platform. Walking takes 30 minutes. Two legs are
  gated: passage past Sgt. Osric Vane, and the yard, which Mira the clerk or
  Teo the yardman controls. Boarding needs a berth from Holt the brakeman.
- Pending work is visible. Dagny inks your papers over three half-hours,
  Osric stays distracted for a while, Pip runs off to cause trouble, the gate
  and the crate change when your work finishes, Mira's window lights when it
  opens and the route bar turns green as legs open.
- One wallet of coin plus favors. Every bribe raises the price of the next.
  Heat climbs when people notice you, and the patrol takes you at 8. Three
  personas start the night with different purses.
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
