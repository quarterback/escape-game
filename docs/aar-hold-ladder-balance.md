# Agent Action Record: the hold ladder, jurisdiction and decay

**Review date:** 2026-10-30
**Reviewed by:** agent self-review; owner review pending
**Agent / system:** Claude Code (cloud session), branch `claude/vigilant-noether-rmcm7h`
**Task or period under review:** Fixing two faults in the hold ladder that the phase-turns pass introduced, without undoing its decision to make the escape hard
**Accountable human (name or role):** Ron Bronson, game owner

## 1. Intent — what was supposed to happen

**Instruction given (actual wording):**

> Fix the phone reability change if you can in terms of the game mechanic that you said got broken or whatever you can fix it how would you fix it tell me first

Then, after the diagnosis and the plan: "Go ahead and aar after it lands your data."

**Success defined in advance as:** the four changes proposed to the owner, each measured with the repository's own harness, with the hold ladder, the Monday deadline, the betrayals and the events left in place. The owner's earlier decision that the escape should be much harder stands; the target named to him was roughly 40 percent for the simple policy, up from 27.

**Authority granted to the agent:** edit, commit and push to the designated branch. No pull request.

**Out of scope:** the readability pass itself, which changed copy and layout and no rules.

## 2. Action — what actually happened

**The diagnosis, measured on 300 seeded runs with the simple policy before any change:** 221 runs ended in house arrest. 575 of 867 holds happened in Salta and 268 of 419 house arrests. 84 house arrests happened in Susana, across the border, imposed by a Valdórian court. The median gap between one hold and the next was 4 hours; a quarter of holds landed in the same hour as the previous one.

**Two faults.** The ladder ignored jurisdiction, so Valdória placed the player under house arrest in Esmeralda, against the game's own rule that Sosā must ask Esmeralda for help. And the ladder only climbed: exposure reset to 6 after a hold and the next search three hours later fired the "searched while exposed" trigger, so a Saturday questioning became Monday's house arrest, worst in Salta where the midnight freight forces a long wait.

**Four changes in `src/sim.js`:**

1. Jurisdiction. Across the line a Valdórian hold is impossible. Esmeralda questions you only once Sosā's request to it has gone through, and never climbs past questioning.
2. Decay. Twelve hours without a new hold drops the ladder one rung.
3. Exposure resets to 4 after a hold, not 6, and the searched-while-exposed trigger fires at 7 or more, matching the meter's hot segments.
4. Salta's wait drifts exposure at half rate while the inquiry looks at the right place.

A fifth, found while checking the other side: the government player's own search at high exposure now triggers the hold it earned. With the decay and the lower reset, the government harness had gone from 48 captures in 200 runs to none; its search was excluded from the trigger that the automatic inquiry used.

**Before and after, `tools/calibrate.js`, 300 runs each:**

| | Before | After |
| --- | --- | --- |
| Teresā wins | 26.7% | 41.3% |
| Matēu wins | 25.7% | 45.0% |
| House arrests, Teresā | 169 | 79 |
| Timeouts, Teresā | 51 | 97 |
| Holds per run | 2.2 | 1.7 |
| Median hours between holds | 4 | 6 |
| House arrests in Esmeralda | 84 | 0 |

**Government side, `tools/gov-calibrate.js`, 200 runs:** before, 87 escapes, 48 captures, 65 timeouts. After the four changes alone, 167 escapes and no captures. After the fifth, 134 escapes, 41 captures, 25 timeouts, which is 67 percent escapes against the 60 the earlier pass aimed for.

**Checks:** both tutorial replays pass, the contract tests pass (786 recorded actions identical with every string altered), the content check reports no errors, and the build is rebuilt.

**Stayed within granted authority?** Yes.

## 3. Judgment — human in the loop

**Decisions the agent made on its own:** the numbers 12 hours, 4, 7 and half rate. Each was the smallest change that broke the chain in the measurement; none was tuned to a target beyond the 40 percent named to the owner. The fifth change was not in the plan the owner approved and is recorded here for that reason: it restores behaviour the government side had, rather than adding anything.

**Of those, which should a human have made or seen:** whether 41 to 45 percent for a dumb policy is where the owner wants the escape to sit. He asked for much harder; this is harder than the 60 percent before the ladder and easier than the 27 the ladder produced.

## 4. Deviation — the gaps

Timeouts rose from 51 to 97 per 300 as house arrests fell. A run that survives Salta now more often runs out of hours at Susana. That is the clock doing its job rather than the ladder doing it, but it is a shift in how the game loses, and the owner should feel it in play before it is called right.

## 5. Consequence — what it cost or risked

The two measurement policies disagree on the count of house arrests (the harness's policy and the diagnostic script's differ in how they answer events), so the before and after figures in the table come from the same tool each time. Nothing in the content package, the saves or the tutorial changed.

## 6. Change — what happens next

- The owner plays both sides and says whether 41 to 45 and 67 are right.
- If timeouts feel wrong, the lever is Susana's wait, not the ladder.
- Any further retune goes through `tools/calibrate.js` and `tools/gov-calibrate.js` together; a change to one side moved the other here.
