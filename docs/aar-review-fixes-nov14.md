# Agent Action Record: code review fixes, Nov. 14, 2026

**Review date:** 2026-11-14
**Agent / system:** Claude (design session)
**Accountable human:** Ron Bronson, game owner
**Branch:** `claude/fix-review-nov14`, from main at 40bc30f

## Intent

The owner asked: "Revisit the game's repo and see how things have evolved and where there can be some improvements or fixes to the existing design." His standing rule is to fix what is broken rather than ask. He chose to ship the fixes first, as their own PR, and to do the no-waiting design as a separate piece of work.

## What was reviewed

- Every system added since Nov. 2: chapter two, companions, lodging, progress without a call, and the investigator's side.
- 14 findings, each with a script that reproduces it (kept in the session's scratchpad, not the repo).
- Two playtests on a phone-sized screen, one for each side.

## What changed

### Runs that could not be won

- **Chapter two's traitors could close a stop for good.** A traitor Silas closed Tamarind Cove. If both people who run the ship's two ways off talked, the ship was closed too. A traitor gate agent closed Bahía Clara.
  - Silas and the gate agent are now never traitors.
  - At most one of the ship's two people talks.
- **A lost passport could not be replaced.** If a hold took Silas's passport, paying him again said you got one, but nothing arrived. Cards marked `again` can now be given more than once: the passport, and the airline boarding pass.
- **New test C23:** over 800 runs, every stop keeps a way on that no traitor controls. It fails on the old code.

### Rules that disagreed with the game

- **Airport stops.** The bounty hunters "found you" at airport stops where they have no power to stop you, and the text now says so. The same applies to Costamar before it agrees to stop her.
- **Sleep and the youngest.** Sleeping or eating could make the youngest sick, and the narrator could say you got tired while you were asleep. A bed or a meal now pauses that need while its hours pass.
- **The airline ticket.** "Buy an airline ticket" could be bought again while you held the boarding pass. Each extra purchase raised police attention and gave nothing.
- **Teresa on the mountain path.** Her known face made the shepherds' path harder, although no officer checks anyone there. The path's failure line talked about a pilot and a hangar; it now describes the snow.
- **Progress without a call ignored delays.** It ignored the blackout, the phone tap on your sibling, the investigator's stall order and Rita's slow charter crews. It now counts all of them.
- **Tomás and Emilio in chapter two.** They did nothing there. Emilio now finds a room at Erinana, and Tomás's line no longer mentions a booth on the mountain path.
- **Failed patrol orders.** A failed search, checkpoint or bridge stop said the patrol never got there, but it left a patrol there anyway. It no longer does.

### Text that disagreed with the game

- **Chapter one's wording in chapter two.** Chapter two showed chapter one's jet, Costamar, Cerro Alto and police. It now names the flight to Lusara, the fixer in Bahía Clara and the bounty hunters.
- **Odds in the hurry calls.** Hurrying the visa or the welcome said the office "says no more often", which is a likelihood. It now says the rushed office is harder to persuade.
- **Single fixes:**
  - The airline win no longer says "your jet took off".
  - "Ilse's cousin" is now "Mama Ilse's cousin".
  - The coast route's rail and board no longer list Nova Trentô or put Salta's people at Barra Velha.
  - The investigator's map pins count their age from the sighting.
  - A stale comment is corrected.

### Test bots

- **The escape bots now eat and sleep at every stop.** Before, they found no bed or meal on the islands or at Barra Velha, so chapter two's calibration was measured with bots that never rested.
- **The police bot now rests when it is worn out and uses each stop order once** (issue #53).
  - Resting at the first sign of tiredness got the investigator fired more often, so the bot rests only when she is exhausted or starving, and never inside the minister's deadline.
  - Following only leads ahead of the search cut arrests from 42 to 9, so it still follows every report.

### Phone playtests (one agent per side, played on main)

- **Investigator side:**
  - The minister could ask twice and score both answers, which ended one run. He now asks one question at a time.
  - Order results were hidden behind the next briefing. The briefing now opens with the result.
  - A ban sent by a court on her side ticked with no cause. The desk now hears of it.
  - "This round" sent you to a stop you were already searching.
  - Davi's third patrol was missing from the Route tab.
  - The escape side's help showed on the investigator's side.
  - The cook said the family left even when she was home.
  - Five demo lines described buttons, costs or facts that were not on screen. The search step now waits for the search.
- **Escape side:**
  - Move hints told you to call Salek at Portalba when that call was closed. They now say why it is closed.
  - Chapter two's briefing, goal and top bar showed chapter one's jet, Portalba and police.
  - "Depart without the visa" stayed on offer after the visa was issued.
  - The freight's story said midnight whatever the hour.
  - The demo said the truck carries you to Salta. It never did.
- **Already fixed on the branch when the playtests found them:**
  - eating and sleeping followed by "starving" and "exhausted";
  - the airline win's "your jet" ending;
  - the failed search that left a patrol;
  - chapter two's calls about the jet and Costamar.

## Numbers, 300 runs each

| Measure | Before | After |
|---|---|---|
| Chapter one, Teresa | 33.7% | 35.7% |
| Chapter one, Mateu | 26.3% | 31.3% |
| Chapter two, Teresa | 29.3% | 75.3% |
| Chapter two, Mateu | 24.0% | 59.0% |
| She escapes the investigator (police bot) | 62.7% | 58.0% |

How chapter two's figures moved:

- The traitor fix alone brought it to 39.3% and 31.0%.
- Letting the bots rest brought it the rest of the way.

Chapter two is now much easier than chapter one. I left it untuned for the no-waiting design work, which changes its pacing anyway (docs/design-issues.md).

## Checks

- **All pass:** build, content check, pbbg-check, contract tests (C23 is new, and C21 now looks past 30 seeds), tutorial-check, gov-tutorial-check and house-arrest-check.
- **Coast route:** checked in a browser at phone and desktop widths.

## Held for the owner

These are listed in docs/design-issues.md under "Code review, November 14, 2026":

- refusing Bruno costs nothing;
- chapter two's difficulty;
- the travel ban still applying on the shepherds' path;
- the papers' verdict on the minister's claim, which tells the investigator where she was;
- investigator orders that run past their listed hours (part of the no-waiting work);
- the "harder" wording, the Keep going tap, food and sleep explained in hours, the card picker, and "Run it again" after chapter two.
