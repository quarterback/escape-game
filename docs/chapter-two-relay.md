# Chapter two as an island relay: design, Nov. 16, 2026

## What the owner asked for

On Nov. 16, 2026 the owner said chapter two "is very much a scene repeat of the first and that's not what I intended." He wants it "more like an open world sidescroller relay."

He then made four decisions:
1. **Several linked strips.** The town, the coast, the ship and Bahía Clara are each their own scrolling strip, joined by roads and boats you choose between.
2. **Relay means helpers hand you on.** Each contact carries you one leg and passes you to the next, so who you trust decides the route.
3. **The player still chooses moves.** The clock stays turn-based, and the scene scrolls to show where you go.
4. **The escape side comes first.** The investigator's chapter two comes after.

## Why it read as a repeat

Chapter two had six stops in a line, one for each chapter one stop. Each stop offered the same kinds of moves, including "Cover your tracks" at five of the six. Five of its six backdrops were chapter one's art.

## The island

Chapter two now has four strips and 10 places.

| Strip | Places, west to east | Walk between them |
| --- | --- | --- |
| Erinana town | The airstrip, Market Street, the fishing harbor, the cruise quay | Yes, both ways, one hour each |
| The south coast | Tamarind Cove, Lighthouse Point | Yes |
| The Long Horizon | Aboard the ship | One place |
| Bahía Clara | The pier, the old town, Bahía Clara airport | The pier and the old town only; the airport is reached by a leg |

Inside a strip you walk freely in both directions, and the backdrop scrolls sideways to the place. Between strips you take a leg. A helper runs most legs, and the rest are a vehicle you risk on your own.

| Leg | From | To | Run by |
| --- | --- | --- | --- |
| The taxi | The airstrip | Tamarind Cove | Kofi, who sends you on to Mama Ilse |
| The market bus | Market Street | Tamarind Cove | Nobody; it stops at every village |
| A rented scooter | Market Street | Lighthouse Point | Nobody |
| The cliff path | Tamarind Cove | The cruise quay | Needs Silas's passport |
| The night boats | Lighthouse Point | Bahía Clara's old town | Mama Ilse's fishermen, who send you on to Dario |
| A boat across | The fishing harbor | The pier | Nobody; you pay a skipper |
| Boarding | The cruise quay | The ship | The passport, Marisa the purser, or a bribe |
| Ashore | The ship | The pier | Dario, who sends you on to the gate agent |
| The supply boat | The ship | The old town | Marisa |
| Dario's car | The pier | The airport | Dario |
| The airport bus | The old town | The airport | Nobody |

**The relay.**
- **Handing on.** When a helper's leg works, that helper hands you on, and the next helper trusts you more.
- **Traitors.** Two helpers work for the bounty hunters, as before, so every place keeps a way on that no traitor runs.
- **Walking.** It costs an hour, and the hunters' search still counts while you walk.

## What stays
- The clock, the calls, the news, the holds and the side places all stay.
- So do the cost lines and the rule against stating odds.
- Your flight and Dario are still arranged by phone.
- The win is still the flight to Lusara.

## Art
- **Three new scrolling strips:** the town, the coast and Bahía Clara.
- **The ship** keeps its own scene.
- **Inside a strip,** the camera pans as you walk, with the far layers moving slower.
- **Between strips,** the scene fades.

## What was built (Nov. 16, 2026)

### Data and sim
- **The data:** `LEVELS2` holds the 10 places, and `STRIPS2` holds the four strips and their walks.
- **Legs:** a move with `to:` is a leg.
- **Handing on:** a leg with `intro:` makes the next helper trust you more when its helper's leg works. The cost line says so.
- **Walks:** the sim builds them from `STRIPS2`. A walk takes one hour, with no roll.
  - The first visit to a place opens its arrival text.
  - A return visit says only that you are back.
  - A walk along the same strip skips the briefing, so the scene keeps scrolling.
- **The airport:** it is the one place where the hunters cannot stop you (`outOfReach`).

### People and news
- Silas and the gate agent are never traitors.
- Marisa and Dario are the ship's two ways off, and at most one of them talks.
- Every place keeps a way to the airport that no traitor runs. Contract test C23 checks this as a path on the map.
- The storm's drive now takes you to Tamarind Cove.

### Art
- **Three strips in `Art.STRIPS`:** the town (1,280 pixels), the coast (640) and the bay (960). Each place sits at its own x.
- **The camera** stands on the current place.
  - A walk pans the camera with the player walking. Far layers move at half speed, and the sky at 0.15.
  - A leg to another strip fades, as before.

### Screens
- **The map:** the route tab and the briefing draw the island as its four strips, with legs as dashed lines.
- **The rail:** it groups places by strip, and the island uses the rail at every width.
- **Labels:** the stop screen and the briefing name the strip instead of "Stop N of 6".

### Calibration, 300 runs
- **The bot:** it follows the shortest map path to the airport and gets the passport first. It takes legs that are open now, and waits where a night leg starts.
- **Targets:** with walks and longer legs, the targets went back to chapter two's first values.

| Measure | Chapter two (Teresa) | Chapter two (Mateu) | Chapter one (Teresa) | Chapter one (Mateu) |
| --- | --- | --- | --- | --- |
| Win rate | 38.0% | 29.3% | 36.0% | 31.3% |
