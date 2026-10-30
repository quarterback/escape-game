# Last Freight Out

A single-file, offline card-and-route escape game set in the Nelôxia universe
(quarterback/kels). You are Inēs Biankī, a chart-maker in a rail town in Salta,
Valdória, on the edge of the Pearl. Your name is in the bailiffs' ledger for a
debt you cannot pay, and the midnight freight over the Huhūi passes to
Esmeralda is the last train before the line closes. Seven hours, a hand of
tricks, a town that knows your hand.

Open `index.html` in a browser. Nothing is fetched at runtime. p5.js 1.9.4 is
embedded, all sound is synthesized with Web Audio and career records live in
`localStorage` only.

## First run

The game opens on a start screen that explains the situation, how a night
works, and the three characters you can play as (same town, different purse).
The first time, the primary button is **Play the practice night**: a 23-step
guided run on a fixed deck (`src/tutorial.js`) that walks through walking,
playing a card on a target, inspecting before committing, pending work, heat,
swapping a dead card, favors, bribe inflation and boarding, then explains how
each character changes the way you have to play. During the practice night
only the step's own action is enabled. It can be left at any point, and it
can be replayed from the **Practice night** button in the header.

## Copy rule

Game text is English. Verdenese appears only in names (people, places, the
austral) and in a few words characters say (*dālē, trankīlô, niñô*). Stations
are the attic, the market, the customs post, the rail yard and the freight
platform. The lore the setting, names and words come from is listed in
`docs/aar-last-freight-out.md`; the far side of the line is Esmeralda, the
second Nelosphere state in South America (capital Baca, largest city Susana),
owner canon of 2026-10-30.

## How it plays

- Cards are tricks: bribe, distraction, forgery, favors, lock picking.
  Selecting one lights up every person, object or place it can affect, in
  the pixel-art scene and in the Targets list. Inspect a target to read what
  would happen, then commit. The simulation resolves at once and the scene
  then animates the consequences.
- The route is five stations. Walking takes 30 minutes. Two legs are gated:
  passage past Gaspār the customs guard, and the yard, which Mārtā at the
  registry window or Theo the foreman controls. Boarding needs a berth from
  Holt the brakeman. The "What you still need" list names the four things
  (papers, passage, yard, berth) and how to get each.
- Pending work is visible. Lūçīā inks your passport over three half-hours,
  Gaspār stays distracted for a while, Pipô runs off to cause trouble, the gate
  and the crate change when your work finishes, Mārtā's window lights when it
  opens and the route bar turns green as legs open.
- One wallet of australs plus favors. Every bribe raises the price of the
  next. Heat climbs when people notice you, and the bailiffs take you at 8.
  Three characters start the night with different purses.
- Waiting with a card selected swaps that card for a fresh draw.

Keys 1 to 4 pick a card, the arrow keys walk, Enter commits and Esc cancels.

## Layout

| Path | What |
| --- | --- |
| `index.html` | The delivered game (built, self-contained) |
| `src/sim.js` | Simulation: all game truth, no DOM, no rendering. Node-loadable |
| `src/tutorial.js` | The practice night: fixed deck, 23 steps, what each step allows |
| `src/render.js` | p5 pixel-art scene, route presentation and animation queue |
| `src/ui.js` | HTML hand, targets, inspection, dialogue, controls, start screen and coach box |
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
