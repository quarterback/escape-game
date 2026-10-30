# Coalition

A single-file, offline escape game set in the Nelôxia universe
([quarterback/kels](https://github.com/quarterback/kels)). You lost the
presidency of Valdória on Saturday. By noon a court barred you from leaving.
Cross the border at the Huhūi passes into Esmeralda and leave its airspace in
a jet bound for Atlanta before the inquiry finds you. You have 72 hours.

Open `index.html` in a browser. Nothing is fetched at runtime. p5.js 1.9.4 and
the fonts are embedded, and all sound, the theme included, is synthesized with
Web Audio. Served over HTTPS it installs to a phone's home screen and runs
offline after the first visit (`manifest.webmanifest`, `sw.js`, `icons/`); a run
is saved after every move and can be continued from the start screen.

Two sides. As the defeated candidate you escape. As Sofīā Leōnī, the minister's aide, you run
the inquiry: you see reports that arrive late and prove less than they say, you
send orders and requests, and you never see her real position until the debrief.

The confirmed design is in [docs/game-direction.md](docs/game-direction.md).
This build is the skeleton of that design: every level exists and is thin.

## First run

The page opens on a title screen: a still of the border post at night, the
title and one green Start button. Start lets the theme play. Behind it is the
start screen. The first time, the primary button is **Play the guided first
run**: 20 steps on a fixed seed with a scripted die and scripted inquiry moves
(`src/tutorial.js`), from the residence to the border. The coach allows one
action per step and dims the rest. At Susana airfield it hands the run over
live. You can skip the demo and pick a character instead, or restart it from
the header.

## How it plays

- **Two problems at once.** Each level is a local problem under **Here** and
  everything your allies are doing elsewhere under **The phone**: the jet, the
  document, the landing rights, who meets you across the line. Allies keep
  working while you travel. Each one rolls a die to deliver, and a promise is
  not an arrangement until they do.
- **Approaches and the die.** Each approach shows its hours and the die it
  needs. Select it to read what helps it and what happens either way, then
  commit. The simulation resolves first and the scene animates after.
- **Cards are specific help from specific people.** They lower the die and
  some approaches need one. The party card means nothing in Esmeralda.
- **Money is never short.** The question is whether the person takes it.
- **The inquiry acts in the open** every four hours: circulating the order,
  pressing an ally, briefing the papers, asking Esmeralda to hold you.
- **Exposure** is how sure they are of where you are. At 10 they arrive. The
  route bar shows where you are and where they think you are.
- **Commitments come due.** Terms you accepted are listed under People and
  promises, and earlier choices change how later levels can be solved.
- You win when the jet leaves Esmeraldan airspace.

## Copy rule

Read [AGENTS.md](AGENTS.md) before making changes. Game copy follows
[Humanizer](https://github.com/blader/humanizer) and
[Digital.gov plain-language guidance](https://digital.gov/guides/plain-language).
Keep instructions short and preserve the conditions and consequences of each choice.

Game text is English. Verdenese and Nelôxi appear only in names and in a few
words people say. Esmeralda is the second Nelosphere state in South America
(capital Baca, largest city Susana), owner canon of 2026-10-30.

## Layout

| Path | What |
| --- | --- |
| `index.html` | The delivered game, built and self-contained |
| `src/data.js` | Characters, people, arrangements, cards, levels, enemy actions |
| `src/sim.js` | Simulation: all game truth, no DOM, no rendering. Node-loadable |
| `src/tutorial.js` | The guided first run: fixed seed, scripted die and inquiry, 20 steps, what each step allows |
| `src/gov.js` | The government side: a hidden candidate played by the harness policy, reports, orders, requests, the debrief |
| `src/render.js` | p5 pixel-art scenes on a 320 by 150 buffer, animation queue, the title and runway stills |
| `src/ui.js` | Phone-first layout: scene header, Here, Phone, Route (the blueprint board), Hand, coach, saved runs, both roles |
| `src/audio.js` | Web Audio sound effects and the theme |
| `src/style.css`, `src/shell.html` | Styles, page shell, Open Graph and Twitter card tags |
| `fonts/` | The owner's licensed webfonts and `LICENSES.md` |
| `og/card.png` | The 1200 by 630 link preview image |
| `vendor/p5.min.js` | Pinned p5.js 1.9.4 |
| `tools/build.py` | Inlines everything into `index.html`; writes the manifest and the service worker |
| `_headers`, `icons/` | Cloudflare cache rules for the worker and the app icons |
| `tools/calibrate.js` | Policy harness: win rate, loss causes and timing |
| `tools/tutorial-check.js` | Replays the guided run against the sim; run after changing `data.js`, `sim.js` or `tutorial.js` |
| `docs/` | Game direction and the Agent Action Records |

Rebuild after editing `src/`:

```bash
python3 tools/build.py
```

Check the guided run and measure the economy:

```bash
node tools/tutorial-check.js
```

```bash
node tools/calibrate.js 500
```

The record of this build is `docs/aar-coalition-skeleton.md`. The link
preview image points at the `main` branch, so it resolves once this work is
merged.
