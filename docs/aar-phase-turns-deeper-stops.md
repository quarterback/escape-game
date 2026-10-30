# Agent Action Record: phase turns, deeper stops, daily run, ambience

**Review date:** 2026-10-30
**Agent / system:** Claude (design session)
**Accountable human:** Ron Bronson, game owner

## Intent

The owner chose phase turns like a board game, with transitions and more markers. He wanted each stop deepened so it does not feel repetitive. He wanted the escape much harder, with coordination falling apart and real capture threats: being questioned, held at a station, or placed under house arrest. He asked for wild counterfactuals over a faithful retelling, plus a daily run, background sound, and real sprites with layered backgrounds.

**Out of scope:** interface text standards, which the owner is defining in PR #5. The government side keeps its existing turn flow.

## What changed

The design is recorded in `docs/deeper-stops.md`.

### Phase turns (escape side)

- Each round runs News, Phone, Move, Roll, Sosā. A phase bar shows the current phase, and a full-screen card announces each round.
- On the phone you can answer messages and place one call. Then you make one move.
- Roll and Sosā are cards that summarize what changed, built from the resolved events.
- Phases with nothing to do are skipped.

### Markers

- Choices and results show tags generated from the rules: hours, exposure, the roll needed, cards, trust, the risk of a hold.
- People carry status markers (trusted, unknown, doubted, talked, clean, cut off) in place of "(trusts you)".
- Approaches show who they depend on and a "Night only" marker.
- The night and arrangement blocks are now short ("After 22:00.", "Needs: …").

### Dispatches

- There are 30 counterfactual events in `Data.EVENTS`, by stop and anywhere: a kitchen selfie, the dog, a court officer, a hitchhiking reporter, a flash flood, a wedding, a rail strike, a tour bus to the falls, a blizzard with a ridge path, the president's deal, and more.
- One event is drawn on arrival at each stop and another every six hours there.
- Some events open alternate routes. The tour bus and the ridge path skip the expected crossing. The president's deal ends the run.

### Holds

- A ladder of three rungs (`Data.HOLDS`): questioned, held at a station, house arrest.
- You climb a rung when exposure reaches 10 (exposure then resets to 6), when Sosā searches the place you are in while exposure is 6 or more, when a choice fails, or after a betrayal.
- House arrest ends the run unless one escape roll succeeds.
- Monday 12:00 is the passport deadline. After it your own passport is cancelled, the ban is everywhere, and the first hold goes straight to a station.

### People you might wrongly trust

- At the start of each run, two allies are secretly working for Sosā.
- Relying on one of them can sell your location.
- Rumors hint at who it is, and are sometimes wrong. Testing someone takes two hours and reveals the truth.
- Sosā gains a phone trace that finds you after recent calls.

### The candidates differ

- **Teresā:** a friend in the inquiry, and police know her face, so border rolls are 1 harder.
- **Matēu:** family barges (a new river approach at Santa Laura), but he starts at exposure 3.

### Daily run

- The seed and candidate come from the local date.
- The result is stored once per day.
- At the end a "Share your result" button uses the phone's share menu, or copies the text.

### Ambience and stings

- Merged from the sound thread (`src/audio.js`): one bed per place, day and night, plus stings for phases, events and each rung.
- `ui.js` calls `Sfx.ambience` on every render and `Sfx.sting` at each moment.

### Government side

- The ending is now classified by outcome code (`over.kind`), never by matching prose. The old check looked for the word "arrive", which the new endings no longer use.
- The computer-played candidate answers her own dispatches and holds.
- The government player receives a patrol report when she is held.

## Checks

- **Balance:** the calibration harness's simple policy wins 26.7% as Teresā and 25.7% as Matēu, down from 59%. Losses: about 170 house arrests and 51 timeouts per 300 runs, with 2.2 holds per run. The runs are deterministic.
- **Tutorial:** `tools/tutorial-check.js` passes. Dispatches, holds and betrayals are off in the tutorial so the scripted path holds.
- **Government side:** 200 headless runs finished without stalling (87 escapes, 48 house arrests, 65 timeouts), and each produced a debrief.
- **Browser:** a phone-sized playthrough of two rounds through every phase had no console errors. The guided tutorial completed in the browser at desktop size. A phone-sized fault (the coach switching to the Phone tab over a Roll card) was found and fixed.

## Against the content pattern spec (PR #5)

- Choice costs come from the rules (C03, P03).
- Sibling names resolve from character data (P07).
- Results bind to resolved events (P10).
- Endings use outcome codes (P14).
- New strings are not yet registered as declared patterns (C01, C12). That waits for the validator and loader the spec describes.

## Open

- Real character sprites and layered backgrounds are merged from the art thread (`src/art.js`, four layers per scene, sprites with breathing and walk frames, `Render.detain`). A hold now shows officers walking up to the player before the hold card.
- The government side still uses the old flow.
- Not yet tested on a physical phone.
