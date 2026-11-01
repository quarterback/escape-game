# Agent Action Record: the 20-sided die, cards in the background, and the stop screen

**Review date:** 2026-11-01
**Agent / system:** Claude (design session)
**Accountable human:** Ron Bronson, game owner
**Branch:** `claude/d20-and-stops`, stacked on PR #24

## What the owner asked for

1. "20 sided."
2. Reaching a stop should be "more noted with their own screens", not "a giant set of checkboxes". A win rate of 1/4 to 1/3 is acceptable, or difficulty levels.
3. Bad choices that burn the clock, and side quests that look like part of the plan.
4. Cards used automatically when the situation calls for it; bribes always available but not always useful, with cash that runs out.
5. Mid-task: "cards become a background simulation mechanic, not a player-facing decision system", the card collection removed from the phone, and earned help shown as a brief notice. "A deliberate simplification for the current game."

## What I decided, and why

- **Built now:** the die, the stop screen and cards in the background. These change how existing rules are shown and rolled, without adding rules.
- **Spec first:** bribe cash, traps and difficulty levels are new mechanics with balance and story consequences, so they went into [proposals/next-mechanics.md](proposals/next-mechanics.md) for the owner to check.
- **Difficulties stay on the old scale in the data and are converted when rolled.** That keeps every move's chance within 5 points and left `src/data.js` untouched apart from three flags and one fix.
- **Three moves are not rolled.** They have no failure written, and writing one would invent story. They are flagged for the owner (backlog item 32).
- **The card-persistence question was answered by the owner's mid-task message,** so I did not ask it.

## What shipped on this branch

- **20-sided die everywhere.** A 1 fails and a 20 succeeds. Targets map 2→4, 3→8, 4→11, 5→14, 6→18. Move cards show "Roll 11 or higher (50% chance)" with a 20-sided badge, and the die on screen shows its number.
- **No more "no roll needed" from cards.** Cards lower the target to 2 at most.
- **Deck tab replaced by Menu.** Card notices appear when you get a card ("New from Nonā Rosa Trentinī: The colônia's grape truck."), lose one, or when one makes a roll easier ("Easier with the party machine").
- **The roll log names the cards that helped,** instead of internal kinds.
- **Stop screen.** "Stop 4 of 6", the stop's name, the route with past stops filled, and what the stop asks of you. It shows on its own for about three seconds, and a tap closes it sooner.
- **Fix:** "Have Gianlūka ask for a delay" could never be chosen and showed an internal code. Fixed and recorded as backlog item 29.
- **Demo:** scripted dice rewritten as 20-sided values with the same outcomes. Two coach lines that said "one more on the die" now say the roll is higher or harder. Deck highlights were removed.

## Checks

- Content check: 0 errors, 0 warnings. pbbg-check passes.
- Contract tests pass. A new C03 dice test checks the 1 and 20 rules and that every target keeps its chance within 5 points.
- Both demo replays pass. The house arrest check shows 0 of 80.
- **Calibration:**
  - Teresā 32.0% → 30.0%, Matēu 31.3% → 29.3%. Both are inside the owner's range.
  - Government side: her escape rate 48.5% → 46.5%.
- **Phone-width browser:**
  - Two full runs showed stop screens at every new stop and card notices.
  - There were no page errors.
  - The test bot's long waits during animations happened before this change too.

## What went wrong

- **The first version made every move roll,** including sleeping. The text-perturbation contract test caught moves with no failure text. That led to the no-roll flag instead of inventing failure lines.
- **I missed four places that still assumed a six-sided die,** and published numbers that came from them:
  - the computer-played candidate on the government side skipped every move with a target above 6;
  - the calibration bot and the sample run did the same;
  - news-choice chips showed the old six-sided number ("Roll 4 or higher") while the roll used 11.

  I found them while checking the code for the owner's next question, fixed them in a follow-up commit, and corrected the numbers. A search for `need <= 6` should have been part of the first pass.
- **Card names read badly inside a sentence** ("gives you Theo walks you through"). The notice now uses "New from {name}: {card}."

## Follow-up the same day

- **Regression tests (contract tests, section C16).** The owner pointed out that a believable overall win rate had hidden four six-sided leftovers, so these test the parts directly:
  - no six-sided arithmetic is left in the game, catalog or bots;
  - every move shows a 20-sided target with the matching chance and preview;
  - every news choice's chip shows the target its roll uses, on both sides;
  - the computer-played candidate takes moves harder than the old cut;
  - the demo dice are 20-sided values.

  Each check was run against the first version of this branch, and each one fails on it.
- **Why the game feels hard** was measured (backlog items 33 and 34):
  - The dice are rarely the cause.
  - Time is: most of all, the wait for the night freight at Salta.
  - Police stops are the other cause.
  - The calibration bot also wastes hours at Nonā Rosa's, so about 30% understates a sensible player.
- **Difficulty levels decided** and recorded in next-mechanics.md, with the crew as a proposal for the easier levels.

## Open

- The owner's answers to the questions in next-mechanics.md.
- Backlog items 30 to 32.
- Issue #20 and the priority 1 backlog, as before.
