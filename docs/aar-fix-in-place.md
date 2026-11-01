# Agent Action Record: fixing the game in place

**Review date:** 2026-11-01
**Reviewed by:** agent self-review; owner review pending
**Agent / system:** Claude Code (cloud session), branch `claude/gracious-tesla-sbzlfp`
**Task or period under review:** Making the escape simpler and clearer without a rebuild, in three steps
**Accountable human (name or role):** Ron Bronson, game owner

## 1. Intent

**Instruction given (actual wording):**

> What if i could just fix th game inhave ow ratjer than rebiold it all this would potentially brewk the game and i dont want that

After a plan in three steps (changes that keep the rules, bugs from `design-issues.md`, then simplifications one at a time), the owner answered: "Yes all 3 steps".

**Success defined in advance as:** every check passing after each change, a seeded calibration before and after each one, one commit per change so any of them can be reverted alone, and no change that leaves the game broken.

**Authority granted:** edit, commit and push to the designated branch. No pull request. `docs/game-direction.md` stays unchanged until the owner reviews the direction.

## 2. Action

| Commit | Change | Rules changed? |
| --- | --- | --- |
| Step 1 | The move preview names every change to the number the die needs (travel ban, checkpoint, Esmeralda's request, an earlier choice, a known face, card bonuses), and says when Vélez's officials let you cross without a roll. "Wait until dark" replaces repeated one-hour waits and stops when news or a police stop arrives. Dead code removed. | No |
| Step 2 | Nonā Rosa's grandson now reaches Salta; "Have Gianlūka ask for a delay" can be chosen; the registry card that could never be obtained is gone. | Bug fixes |
| Step 3a | The Monday noon passport deadline is gone. Its two effects (the ban at every post, the first police stop at the station) now come with the travel ban. The summons and hearing events send the ban. | Yes |
| Step 3c | Holt's warning arrives only when it offers a choice. | No effect measured |
| Harness | `tools/calibrate.js` and `tools/sample-run.js` no longer repeat "Call your contacts" or "Sleep" at one stop. | Measuring tool |
| Step 3d | Help from other people is used up by the move, choice or answer that uses it. Your own things stay. The player can untick a card in a move to keep it. | Yes |

The title screen's recorded runs no longer matched the rules and were regenerated (`tools/sample-run.js 15 --attract`). `tools/lib/fingerprint.js` now leaves an empty line empty when it scrambles text for C14.

**Calibration, 300 seeded runs per row, `tools/calibrate.js`:**

| | Start | Step 1 | Step 2 | Step 3a | Step 3c |
| --- | --- | --- | --- | --- | --- |
| Teresā | 32.0% | 32.0% | 32.0% | 30.3% | 30.3% |
| Matēu | 31.3% | 31.3% | 33.0% | 26.7% | 26.7% |
| Government side | 48.5% | 49.5% | 50.0% | 42.0% | 42.0% |

Single-use help made the old harness loop at Nova Trentô (Matēu 0.7%). After the harness fix, the same three commits measured again:

| Corrected harness | Start | Step 3c | Step 3d |
| --- | --- | --- | --- |
| Teresā | 43.7% | 41.0% | 27.0% |
| Matēu | 37.0% | 32.0% | 24.7% |
| Teresā, daily | 48.0% | 42.7% | 33.3% |
| Matēu, daily | 41.0% | 36.3% | 28.0% |
| Government side | 48.5% | 42.0% | 42.5% |

**Checks after the last commit:** content check 0 errors, both demo replays pass, contract tests pass, the owner's pbbg checker passes, contrast check shows the same title-screen failures as the starting commit and no new ones. In a browser, the demo plays to Susana at phone width with no errors, and the title replay runs.

## 3. Judgment

**Decisions the agent made on its own:**

- **3a: keeping the station rule.** Without it, the ban only affects the line. Measured both ways: without the rule, Teresā 37.3% and Matēu 36.3%; with it, 30.3% and 26.7%. Dropping it would soften the game, against the owner's rule, so it stays.
- **3b: not randomizing the accepting country.** The destination is fixed at the start of a run, and the visa for a country that refuses you never comes. Randomizing would leave two runs in three unwinnable from the first screen. The proposal needs a way to change destination first. Recorded as design issue 25.
- **3c: smaller than proposed.** Every scripted message has an answer that changes something, except Holt's when you no longer hold the spare cars.
- **3d details:** a card a move requires is always used; a card that only lowers the number can be kept back; the card is used up whether the move works or not; Sosā can still question anyone whose help you used. The travel ban protection and the decoy help on the house-arrest climb stay passive (design issue 26).
- **The harness fix.** It changes what earlier figures mean, so every comparison above names its harness.

**Which should the owner see:** where the escape sits now. The simple policy, which spends every card at once, wins 27.0% and 24.7%. The hold ladder AAR named about 40% as the target.

## 4. Deviation

3b was not done, and 3c is one message rather than several. Both are explained above.

## 5. Consequence

Saved runs from before these commits load; their old deadline field is ignored. A replay link recorded before them can stop early, because the rules changed.

## 6. Change

- The owner plays a run and says whether single-use help feels right. Step 3d reverts on its own if not.
- The owner decides design issues 24 to 27.
- Any further retune goes through the corrected `tools/calibrate.js` and `tools/gov-calibrate.js`.

## Addendum, same day: the screen pass

The owner reviewed screenshots and asked for less machinery on screen: no deck, cards working on their own, waiting as a real choice, no step strip, and milestone moments. He set aside the process rules for this pass ("Ignore my rules. Just do what I ask") and decided the destination question: the country the player picks is the right one for that run.

- **Single-use help reverted.** With no deck and no card choice on screen, spending cards automatically would take help away without the player choosing. Cards are permanent and automatic again, and a result line names the card that helped a roll.
- **Every destination accepts you.** The choice is between sponsors: Salek wants the family accounts, Rāo is six hours slower, Vosk's deal raises police attention.
- **One turn, fewer screens.** The phone is part of the move step (one call per turn, as before). After a move, one card shows your result and what happened during its hours. The step strip and round number are hidden. On phones the Phone tab opens only when someone is waiting for an answer.
- **Waiting is a move.** "Wait until dark" and "Wait an hour" sit in the list of moves with their hours, how often Sosā acts and that news can end the wait early.
- **Milestones.** The briefing opens on the first turn and on reaching a new stop, as "Milestone reached: You made it to Salta", with time, police attention and the next challenge. It no longer opens every turn; the Briefing button still does.
- **No deck.** The Deck tab is now Menu (the game menu it already held). The route no longer lists where cards count.

Calibration, corrected harness, 300 runs: Atlanta 41.0% Teresā / 32.0% Matēu, Tarun 36.7% / 24.7%, Zaryanova 40.7% / 31.0%, daily 42.7% / 36.3%; government side 54.5% (she can no longer land somewhere that refuses her). Both demos play to the end in a phone-sized browser with no errors.

## Second addendum: less explanation on the main screens

The owner's principle: the first screen tells you what happened or what you can do; a second tap tells you why.

- **Stop screens** read "Stop 2 of 6", "You made it to Santa Laura", the arrival line, the route, two numbers (time left, police attention) and "Next" with the stop's objective. The paragraphs about immunity and police stops are gone from them; Help keeps them.
- **The briefing** (first turn and the Briefing button) shows the same short numbers, then one status row each for the jet, the visa and Esmeralda ("Not started", "Underway: crew hired", "Charter jet booked"). Each row opens on a tap to the full list of steps and what they do.
- **Results** are short lines: "Six hours pass", then "Police attention rises to 6.", "Sosā's people search the residence, where you are.", "News: A police car pulls in beside you." Each of Sosā's actions has a one-line form; the full sentence stays in the log.
- **Moves that need no roll are sure things** (calling your contacts, sleeping, taking the road to Salta). Checkpoints and earlier choices no longer turn them into rolls that fail with no explanation (design issue 24).
- Not changed: "Pay the yardmaster" still says it cannot succeed; turning it into a trap needs its outcome written and tested first. There are no difficulty levels or d20 on this branch; those are in PR #25 on another branch.

Calibration, corrected harness, 300 runs: Atlanta 41.3% / 31.7%, Tarun 36.3% / 25.0%, Zaryanova 40.7% / 30.7%, government side 54.5%.
