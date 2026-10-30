# Last Freight Out

## Development direction: read first

The [confirmed COALITION game direction](docs/game-direction.md) governs future gameplay, narrative, progression, and interface work.

The intended game follows an escaping person through several distinct levels, coordinating allies and arrangements while enemies interfere. There is one border crossing near the end, followed by a final aircraft escape; victory requires leaving the relevant airspace. Preparation continues while the player travels, and earlier commitments change later options.

The playable Last Freight Out build described below is an earlier prototype. It does not yet implement that structure. Its fixed town route, train ending, and exact economy are not requirements for the developing game. The direction document separates confirmed decisions from examples and open mechanics.

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

The page opens on a title screen: a still of the border post at night, the
title, and one green Start button. Start is the gesture that lets the theme
play. Behind it is the start screen. The first time, the primary button is
**Play the guided first run**: 20 steps on a fixed seed with a scripted die and
scripted inquiry moves (`src/tutorial.js`), from the residence to the border.
The coach allows one action per step and dims the rest. At Susana airfield the
coach hands the run over live. You can skip the demo and pick a character
instead, or restart it any time from the header.

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
| `src/tutorial.js` | The guided first run: fixed seed, scripted die and inquiry, 20 steps, what each step allows |
| `src/render.js` | p5 pixel-art scene, route presentation and animation queue |
| `src/ui.js` | HTML hand, targets, inspection, dialogue, controls, start screen and coach box |
| `src/audio.js` | Web Audio synth |
| `src/style.css`, `src/shell.html` | Styles and page shell |
| `vendor/p5.min.js` | Pinned p5.js 1.9.4 |
| `tools/build.py` | Inlines everything, fonts included, into `index.html` |
| `fonts/` | The owner's licensed webfonts and `LICENSES.md`: Little Grandad Fat (masthead), Kurdis Regular (text and titles), Kurdis Condensed (clock and canvas HUD), Embro (the small capital labels; it has no accents or lowercase) |
| `tools/calibrate.js` | Policy harness: win rate, loss causes and timing per persona |
| `tools/tutorial-check.js` | Replays the guided run against the sim; run after changing `data.js`, `sim.js` or `tutorial.js` |

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
