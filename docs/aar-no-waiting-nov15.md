# Agent Action Record: no waiting, Nov. 15, 2026

**Review date:** 2026-11-15
**Agent / system:** Claude (design session)
**Accountable human:** Ron Bronson, game owner
**Branch:** `claude/no-waiting`, built on `claude/fix-review-nov14` (PR #60)

## Intent

On Nov. 14, 2026 the owner said: "the game still gets stuck in periods where you're just waiting, and I'd never want that. I'd want the paths and rolls to be clear enough that the user always has a consequential choice, or an opportunity to wander off like an open world."

He then decided:
1. **Wandering means side places.**
2. **Timed waits skip to the next real decision, and the clock adjusts.**
3. **Every choice states what it costs and leads to, never odds.**
4. **Both sides get this.**

His instruction to build it was "okay do it". The design is in `docs/no-waiting.md`.

## What changed

### Skipping instead of waiting (both sides)
- **One skip.** Both screens have one skip, and it names its target: "Skip to 10 at night", "Skip to {name}'s answer" or "Skip ahead". "1 hr wait" and "Wait until dark" are gone from both screens.
- **The skip moves on by itself.** When a stop offers nothing you can do, the escape side skips without being asked and says so in a notice.

### Side places
- **17 for the escape:** 10 in chapter one and 7 in chapter two, listed under "Places nearby".
- **What a visit is.** Each costs hours there and back, and sometimes police attention. It opens its own small story with two or three choices: a card, food or sleep, lower police attention, trust, an easier stop, or the way back.
- **Each can be visited once per run.** News on the way comes first, and the place opens after it.
- **8 new cards.** They come from the side places and are owned by the player, so no traitor can take them back.
- **3 for the investigator,** under "Away from the desk":
  - the land registry, which gives a true lead in four hours;
  - the press club bar, which pleases the minister or makes her better known;
  - the rail company's office, which gives the railway contact or makes orders easier for six hours.

### Cost lines
- **Moves.** An opened move now says what happens if it works and if it fails. For example: "If it works, you move on to Portalba. If not, you lose three more hours and police attention rises by two."
- **Other choices.** Every news, lodging, hold and side-place choice carries one sentence on its cost and result, on both sides. The sentence is built from the rules, so it can't drift from them.

### The investigator's clock
- **The desk keeps its own clock,** so an order takes exactly the hours it lists. In the playtest, "Move your search to the line, 1 hr" took 15 hours.
- **Her hidden run may be up to one move ahead.** Reports from her side carry her hour and reach the desk only when its clock gets there, so nothing is learned early.

### Chapter two difficulty
Every chapter-two target is one higher than before.

### Tests and tools
- **C24:** every side place opens, and every choice in it works and states its cost. No cost line names odds. The skip always moves the clock.
- **C25:** every investigator order takes exactly its listed hours. 556 orders checked.
- **`calibrate.js --sides`:** the bot visits side places instead of waiting.

### A mistake caught and reverted
While building the cost lines I found that the review run had wrongly "corrected" the demo's truck line and marked backlog item 8 resolved. Winning "Help Nonā Rosa free the truck" does carry you on to Salta. Both are restored on the fixes branch, and that run's after-action record has a correction section.

## Numbers, 300 runs each

| Measure | Before | After |
|---|---|---|
| Chapter one, Teresa | 36.0% | 36.0% |
| Chapter one, Mateu | 31.3% | 31.3% |
| Chapter one, bot visits side places | | 36.3%, 30.0% |
| Chapter two, Teresa | 75.3% | 50.3% |
| Chapter two, Mateu | 59.0% | 38.3% |
| She escapes the investigator | 58.0% | 48.0% |

- **Side places don't change chapter one's win rates.** The bot rarely has nothing to do.
- **Chapter two:** raising every target by two instead of one gave 16.3% and 11.7%, so one is the right step.
- **The investigator side got harder for her** because the desk now gets every hour it is owed.

## Checks
- **All pass:** build, content check, pbbg-check, contract tests (C24 and C25 are new), tutorial-check, gov-tutorial-check and house-arrest-check.
- **Phone width,** both sides: the Salta move list, a side place card, an opened move, and the desk's list.
- **Cost-line contrast:** the lines are drawn at full contrast, with no faded text.

## Editorial pass (owner, Nov. 15, 2026: "Make sure the text is run against my editorial tools")

Scope: every player string that this run and the review run (#60) added or changed, 270 strings in all.

- **Prosekeep 0.3.0** (`prosekeep check --profile vloora`, then `audit`): 0 mechanical findings before the edits and 0 after.
- **Red Pen Editor:**
  - **inspect** flagged four near-duplicates. They are the three hurry lines, which repeat one sentence on purpose (one per call), and chapter-two variants of the same name. All four were kept.
  - **The rewrites:** all 16 passed its guard (`applyEdits`), with none rejected and no number or date lost.
- **Humanizer and plain language, read by hand.** 16 strings were rewritten:
  - **A forced triad:** the canteen's "the yard, the guards, and the cars".
  - **A staged parallel:** the market's "Any of them could sell a sighting, and any of them could help".
  - **A couplet and a two-idea sentence:** the help paragraph.
  - **Passives and fragments:** the route sheet, the crew vest, the scooter, the shepherds' hut and the quiet room.
  - **A hyphenated pair:** "hi-vis".
  - **A hedge:** the storm's "few hours" is now "three hours", which is what the rules give it.
  - **Lines that claimed more than the rules do:**
    - The registry now says a report on where she is arrives in four hours. It had named a farmhouse and a patrol that never exist.
    - The railway's help was about guards on the freight, but it eases every order for six hours, so it now says that.
  - **A blocked-choice line** told you there was nothing more to "buy" at a shepherd's hut. It now says only that you already hold the card.
  - **The night hint** now reads as a sentence: "From 10 at night, you can board the midnight freight."
- **Branches.** Four of these strings came from #60, so the fixes for them are in this branch. They arrive when #61 merges.

## Held for the owner
- **The stop screen.** It still needs a tap ("Keep going") at each new stop. It is a reading screen, not waiting, so I left it.
- **Card labels on news cards.** The small label ("A place nearby", "News") above a card's title is the game's existing pattern, kept for side places.
- **The papers' verdict, the computer-played candidate's pace, Bruno's refusal, and the travel ban on the shepherds' path** remain open in `docs/design-issues.md`.
