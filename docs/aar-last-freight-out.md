# After-Action Report — Last Freight Out (first build)

**Date completed:** 2026-10-30
**Branch:** `claude/vigilant-noether-rmcm7h`
**Deliverable:** `index.html` (self-contained), sources under `src/`, tooling under `tools/`

---

## TL;DR

The repo was empty. The brief was a set of constraints, not a game: p5.js for
pixel-art scenes and route presentation, HTML/CSS for dialogue, cards,
descriptions and controls, a pinned embedded library, zero runtime network,
card → reveal applications → inspect → commit → resolve first then animate,
pending work shown in the scene, simulation state independent of rendering,
native Web Audio.

What shipped is **Last Freight Out**: a seven-hour (14 half-hour) escape from
a border town along a five-station route, driven by a 17-card deck of tricks
played on people, objects and places. The simulation is a pure module
(`src/sim.js`) that Node can load; the renderer and UI only read it and
animate the event lists it returns.

Mid-build the owner asked that the mechanics and economics borrow from their
other repos (viperball, tennis-team-manager, hybrid-baseball), named
"capbuffet and tooling" as possibly worth it, and asked for an AAR. "capbuffet"
was read as hybrid-baseball's **capspace** family (one wallet, personas with
different starting stakes, you-vs-yourself career records, non-rolling budget
pressure). Those landed as: three personas, bribe price inflation, local
career records, and a Node calibration harness in the tennis repo's
"measure before you tune" style.

---

## What was asked for

The opening message, verbatim in substance:

> Use p5.js for the interactive pixel-art scenes and route presentation. Keep
> dialogue, cards, resource descriptions, and controls in HTML/CSS. Include a
> pinned copy of the library in the delivered index.html. The finished game
> must make no runtime network requests. Selecting a card should reveal the
> people, objects, or arrangements it can affect. Let the player inspect those
> applications before committing. Resolve the game action first, then animate
> its consequences. Show pending work through the scene. Keep simulation state
> independent of rendering and animation. Use native Web Audio.

Then, mid-turn:

> if you look at my other repos … you get a sense of how i like to structure
> these games … can use those ideas in the mechanics … mostly from a game
> mechanics/economics perspective. capbuffet and tooling might be worth it

> you'll need to generate an aar using closedtab skill at the end

No skill named `closedtab` exists in this session, and the string appears in
none of the five repos, so this AAR is written by hand in the house format
(the hybrid-baseball `docs/aar-*.md` shape). If `closedtab` is a skill that
lives elsewhere, this document is the input it should be run over.

---

## What shipped

### The game

- **Route**: Attic → Market Square → Checkpoint → Rail Yard → Freight
  Platform. Walking a leg costs one half-hour. Two legs are gated by
  arrangements (Passage past Sgt. Osric; the Yard via stamped papers or Teo's
  goodwill). Boarding needs a Berth from Brakeman Holt. Four arrangements,
  each with at least two routes to it, so a hand rarely has one right answer.
- **Deck** (17 cards, hand of 4): Bribe ×2, Commission Papers ×2, Distraction
  ×2, Sweet Talk ×2, Pick Lock ×2, Sell Maps ×2, Lay Low ×2, Call in a Favour
  ×2, Hire Courier ×1. Each card is defined by an `applications(state)`
  function that lists every person/object/place it can touch, whether that
  application is currently legal, why not if not, and a preview of what would
  happen. Most applications require being at the target's station; the
  courier and the favour cards deliberately do not.
- **Pending work is state, not animation**: `jobs` on the sim (forgery,
  distraction, Pip's errand, lock-picking) tick down each half-hour and emit
  events on completion. The scene reads them: Dagny gets a busy bubble with
  remaining-time pips, Osric a "?" bubble beside a burning brazier, the gate
  and crate change shape when the work lands, Mira's window lights when open,
  Teo's signal lamp turns green, Holt raises his lantern. The route bar at the
  top of the canvas shows gated legs as red bars and opened legs in green;
  arrangement badges sit bottom-left.
- **Flow**: pick card → targets highlighted in scene and listed → pick target
  (list or canvas click) → inspection panel with preview, cost, time, blocker
  → Commit. `Sim.play()` mutates and returns events; only then does the UI
  push walk/flash/float/patrol items onto the renderer's queue. Inputs that
  change state are disabled while the queue drains (sub-second).
- **Pressure**: heat rises when people notice you (bribes, lock-picking,
  selling your own maps, kicking over a brazier); from heat 3 a patrol may
  ask questions each half-hour; at 8 you are taken. Midnight ends the night.
- **Hand swap**: waiting with a card selected discards it and draws. See
  "Dead hands" below for why this exists.
- **Audio**: all synthesised (`src/audio.js`): clicks, selects, confirm, deny,
  coin, heat up/down, footsteps as filtered noise, a work tap, the patrol
  drone, an arranged arpeggio, the whistle, win and lose phrases. Muteable.

### Borrowed from the sibling repos

| Source | Idea | Here |
| --- | --- | --- |
| hybrid-baseball `aar-capspace-bankroll.md` | One wallet; personas with realistic, different starting stakes; career records as "you vs yourself" | `Sim.PERSONAS` (Cartographer 5c/2f/0h, Smuggler's Niece 8c/1f/1h, Minor Official 2c/4f/0h); `localStorage` records: escapes/nights, streak, earliest boarding, coolest escape, richest escape |
| hybrid-baseball `aar-auction-shape-and-sellback.md` | Money doesn't roll over; prices steepen at the top | Bribe price = 3 + 1 per bribe already paid (`cardCost`), shown live on the card and in the inspection panel |
| tennis-team-manager CLAUDE.md | Steep cost curve, tier floors, "measure before retuning", calibration scripts that call the shipped functions | `tools/calibrate.js` runs the real `Sim` under a fixed mediocre policy and reports win rate, loss causes, boarding time, heat, coin left, per persona; determinism check at the end |
| hybrid-baseball joker cooldown AAR | A once-per-cycle power | Considered for the Favour cards; **not built** (see below) |

---

## Measurements

All from `node tools/calibrate.js 500`: seeds 1–500, one deliberately
mediocre policy (plays any card that advances an unmet arrangement, else
walks forward, else waits and swaps a dead card). The numbers describe the
economy under that policy; they are not targets.

### Dead hands were the real difficulty, not the clock

The first harness lost 74% of nights, every one to midnight. Lengthening the
night from 14 to 16 to 18 half-hours changed the win count by **zero** (130/500
each time). The policy was not short of time, it was holding four cards it
could not use and had no way to get rid of them. That is a player problem
too: a human with Lay Low, Lay Low, Pick Lock and Sweet Talk at the platform
with no crate prepared is simply stuck.

Fix: `Sim.wait(swapUid)`. Waiting with a card selected discards it and draws.
Same policy, same 14-tick night: **130 → 264 wins (26% → 53%)**. The clock
stayed at midnight.

### Personas

| Persona | Start | Win % | Losses | Boards at | Heat at end |
| --- | --- | --- | --- | --- | --- |
| The Cartographer | 5 coin, 2 favours, heat 0 | 52.8 | 236 clock | 22:00 | 1.09 |
| The Smuggler's Niece | 8 coin, 1 favour, heat 1 | 48.4 | 250 clock, 8 heat | 21:30 | 1.97 |
| The Minor Official | 2 coin, 4 favours, heat 0 | 36.2 | 315 clock, 4 heat | 22:30 | 2.25 |

The Niece was first written as 9 coin / **0 favours** / heat 2 and measured
**10.6%**. Sweeping her purse:

| coin / favour / heat | Win % |
| --- | --- |
| 9 / 0 / 2 | 10.6 |
| 9 / 0 / 1 | 11.5 |
| 10 / 0 / 1 | 11.5 |
| 8 / 1 / 1 | 48.8 |
| 10 / 1 / 1 | 56.5 |

Coin barely moves her; one favour moves her 37 points. Four of the seventeen
cards (Sweet Talk ×2, Call in a Favour ×2) cost a favour and there is no way
to buy one, so at zero favours a quarter of every draw is dead and each dead
card costs a half-hour to swap. Favours are a second currency with no
exchange rate, which is the thing to know before adding any persona or card
that touches them. Settled at 8 / 1 / 1.

The Official's lower rate is the mirror image at a smaller scale: two coin
cannot pay a single bribe (3) and the Commission costs 2, so he leans on
Pip, Sweet Talk and the courier-less forgery, and his heat is highest because
he sells his maps more often.

### Bribe inflation

Under the policy, bribes per night average 0.66 (Cartographer) to 0.74
(Niece), so the second bribe at 4 coin is reached in roughly a third of
nights and a third bribe almost never. The curve mostly bites the human who
would otherwise bribe Osric, Mira and Holt in a row with the Niece's purse
(3 + 4 + 5 = 12 > 8). That is the intended shape: coin solves one problem
cleanly and gets worse at solving the next.

### Determinism

Same seed and persona rebuild the same state byte for byte (harness asserts
it). The only randomness inside a night is the sim's own seeded stream
(brazier heat roll, patrol roll, deck shuffle). Animation timing never feeds
back into state.

### Browser checks

Headless Chromium against the built `index.html`: zero page errors, zero
console errors, **zero non-`file:` network requests**; card select → canvas
click on Dagny → commit produced the inking job, shown in the scene as her
busy bubble with two time pips and in the panel as "60 min left" (a 90-minute
commission minus the half-hour the card itself took); game-over overlay and
records panel rendered.

---

## Decisions worth recording

- **One sim, event lists out.** `Sim` never touches the DOM or p5 and never
  waits. `play/move/wait/board` return `{ok, events}`; the UI narrates `say`
  events into the dialogue log and enqueues the rest as decorations. If an
  animation is cut short, nothing in the game changes.
- **Applications are data, computed per state.** Each card's reachable
  targets, their legality and their preview live in one `applications()`
  switch. The hand shows "n of m uses available", the list shows every
  target including the illegal ones with the reason, and the canvas
  highlights legal targets in gold and illegal ones in grey. One function,
  three surfaces.
- **The route bar is in the canvas, the needs list in HTML.** The brief put
  route presentation in p5; the HTML "Still to arrange" list restates the
  same four arrangements with their how-to text because a reader of the
  canvas badge wants the sentence, and that is prose, which the brief puts
  in HTML.
- **Pixel art is drawn to a 320×112 buffer and scaled ×3** with `noSmooth`;
  HUD text is drawn at native resolution on top. Hit-testing uses the same
  buffer rectangles the highlight boxes use, so what glows is what clicks.
- **Records are `localStorage` and nothing else**, wrapped in try/catch; a
  private window simply shows no record. They never leave the browser.

## Not built, and why

- **Joker-style cooldown on Favour cards.** Two copies in a 17-card deck
  with a draw-on-play hand already rate-limit them; a cooldown on top would
  be a second limiter on the same thing. If favours ever become purchasable,
  revisit.
- **Buying favours with coin.** Would fix the zero-favour persona by removing
  the constraint that makes the two currencies different. Chose to tune the
  persona instead and keep favours scarce.
- **A sellback / refund.** Cards have no resale value and coin spent is
  gone; the inflation curve is the pressure. Fine for a seven-hour night.
- **p5 for the UI.** Everything textual stayed in HTML per the brief; the
  canvas has no buttons.

## Known rough edges

- The policy in `tools/calibrate.js` is deliberately dumb. Its 36–53% is a
  floor for a reasoning player, not an estimate of human win rate. Do not
  tune the clock or heat limit against it without also writing a better
  policy, or the game will get easy for people.
- The scene has no mobile touch affordances beyond ordinary clicks; the page
  reflows to one column under 1100px but the canvas stays wide-aspect.
- Dialogue lines are hand-written and finite; a long night repeats the
  "you wait" line. No generated prose anywhere, on purpose.

## Validation

- `node tools/calibrate.js 500` — table above, `deterministic: true`.
- Playwright (Chromium) runs: load, new game by seed, keyboard card select,
  canvas target pick, commit, walk, wait-and-swap to game over, records.
  No errors, no network.
- `tools/build.py` asserts no `</script` inside any inlined part.
