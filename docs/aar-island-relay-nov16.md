# Agent Action Record: chapter two as an island relay, Nov. 16, 2026

**Review date:** 2026-11-16
**Agent / system:** Claude (design session)
**Accountable human:** Ron Bronson, game owner
**Branch:** `claude/island-relay`, built on `claude/no-waiting` (PR #61), which is built on PR #60

## Intent

The owner said: "I feel like the second level is very much a scene repeat of the first and that's not what I intended, so I'd like to look at it and make it more like an open world sidescroller relay."

He then answered four questions:
1. **Several linked strips.**
2. **Helpers hand you on.**
3. **The player chooses moves, and the scene scrolls.**
4. **The escape side comes first.**

The design is in `docs/chapter-two-relay.md`.

## What was wrong

Chapter two's own design doc said "Same game, new outfits. No new mechanics." It had six stops in a line, each standing in for a chapter one stop. "Cover your tracks" appeared at five of them, and five of its six backdrops were chapter one's art.

## What changed

### The island
- **10 places on four strips:**
  - Erinana town: the airstrip, Market Street, the fishing harbor and the cruise quay.
  - The south coast: Tamarind Cove and Lighthouse Point.
  - The Long Horizon.
  - Bahía Clara: the pier, the old town and the airport.
- **Walks.** You walk both ways between neighbors on a strip, one hour each with no roll.
- **Legs.** Strips are joined by 11 legs:
  - Kofi's taxi, the market bus and a scooter;
  - the cliff path;
  - Mama Ilse's night boats and a paid skipper;
  - three ways aboard the ship;
  - two ways off the ship;
  - Dario's car and the airport bus.
- **The relay.** When a helper's leg works, they hand you on, and the next helper trusts you more:
  - Kofi hands you on to Mama Ilse;
  - Mama Ilse's boats to Dario;
  - Marisa to Dario;
  - Dario to the gate agent.

  Each of these legs says so in its cost line.
- **New text.** Four places are new, and they get their own lodging. Arrival text and objectives were written for every place. "Cover your tracks" stays at only four places.

### Art and screens
- **Three new scrolling strips** in the game's pixel style: the town, the coast and the bay. The ship keeps its scene.
- **Walking pans the camera.** The player walks across, the far layers move slower, and no briefing interrupts. A leg to another strip still fades.
- **The island map.** The route tab and the briefing show the island as its strips, with legs dashed. The rail groups places by strip. The stop labels name the strip.
- **Small fixes on the island:**
  - The flight mark sits at Bahía Clara airport.
  - Dario stands on the pier only once he is arranged.
- **Ambience:** the strips use the water-against-wood sound.

### Tests and tools
- **C23** now checks the island as a map. For every set of traitors, every place keeps a path to the airport that no traitor runs.
- **`calibrate.js` plays the island as a map.** It follows the shortest path, gets the passport first, and waits where a night leg starts.

### Editorial
All 85 new strings went through the editorial tools:
- **Prosekeep:** 0 findings.
- **Red Pen Editor:** its guard accepted all 8 rewrites.
- **Humanizer:** by hand.

The rewrites fixed:
- an objective that promised a timed event the rules do not have;
- a hedge ("most days");
- an innuendo line, replaced with the fact it hinted at;
- a repeated sentence about the airport bus;
- a walk line that called every path a street.

## Numbers, 300 runs each

| Measure | Before | After |
| --- | --- | --- |
| Chapter two, Teresa | 50.3% | 38.0% |
| Chapter two, Mateu | 38.3% | 29.3% |
| Chapter one, Teresa | 36.0% | 36.0% |
| Chapter one, Mateu | 31.3% | 31.3% |

**How the targets were set.** With the Nov. 15 targets, the island measured 11.0% and 9.7%. Walks and longer legs cost hours, so every rolled target went down by one, which puts chapter two level with chapter one.

## Checks
- **All pass:** build, content check, pbbg-check, contract tests, tutorial-check, gov-tutorial-check and house-arrest-check.
- **Screenshots** at phone width of all nine strip places by day and night, a walk, the briefing, and the route tab on phone and desktop.

## Held for the owner
- **The investigator's chapter two.** It was not built in this run, as decided.
- **The stop screen.** It still opens when you reach a new strip. Walks along a strip skip it.

## Follow-up, Nov. 16, 2026: the two contrast items

The owner asked for both items left from the contrast check to be fixed.

- **The title screen's "Continue" button.** This was a real button: the round's own button, faded to half strength while the scene animates. It now carries `aria-disabled` during the fade, so screen readers and contrast checks treat it as unavailable, which it is.
- **The screenshot timeout.** Drawing an animated frame with software WebGL could take a minute. `Render.hold(on)` now freezes the scene for tools, and the contrast check holds it for each screenshot. One sample went from 14 seconds to a tenth of a second.

Two faults in the checker turned up along the way, and both are fixed:
- **A timeout left the text hidden.** Every later sample then read black text.
- **It sampled text that sits under an open panel.** For example, it measured the investigator's clock behind the briefing. Such text is inactive, so the check now samples only what is on top.

Final run: 3,782 text checks pass, 12 of 12 text-over-picture checks pass, and there are no failures and no errors. Ten text-over-picture samples are no longer taken because a panel covers them.
