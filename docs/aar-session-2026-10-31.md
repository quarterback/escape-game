# Agent Action Record: the Oct. 31 to Nov. 1, 2026 session

**Review dates:** 2026-10-31 to 2026-11-01
**Agent / system:** Claude (design session), with research subagents for the text audit, the first-play stand-in and the world audit
**Accountable human:** Ron Bronson, game owner

This record covers the whole session, as the owner asked. Each pull request also has its own AAR, linked below.

## What the owner asked for, in order

1. A government results screen that says what happened and why, on the model of Wordle and MapTap, plus a way to close an ending.
2. A briefing before each round, because "I have no idea what I'm supposed to be doing from round to round".
3. The copy handoff fixes. Then, after several rounds of correction, the rule that governs all player text: describe what happens as a player would understand it, trace every string to the code before writing it, and never shorten text at the cost of meaning.
4. A final pass before merging #19: old terms removed, AGENTS.md made consistent, arrangement terms traced, a gameplay backlog, and a deployment check.
5. Clocks that say whose they are; chance and time shown separately; when Sosā acts during a move.
6. The phone route on a phone; both deadlines and the second passport explained; a demo that starts with play.
7. Onboarding rebuilt around learning by doing, observed from a first-time player.
8. Honest dice: never tell the player in advance what will work, and never invent a roll. A proposal for every move to roll.
9. The repeating round bug.
10. No Hang up; the phone rings; no clicking to advance between stages; a smaller police box.
11. A world-accessibility audit: names that need explaining before they are used.

## What shipped

- **PR #19 (merged):** results screen, round briefing, Close, copy handoff, the traced text audit of about 1,390 strings with 358 rewrites, "police attention", game terms traced (Jet, Welcome in Esmeralda, a way onto the freight), and the gameplay backlog. Record: [aar-round-briefing-and-results.md](aar-round-briefing-and-results.md).
- **PR #22 (merged; it reopened #21):** when Sosā acts during moves, calls and waits, and durations written out in words. Record: [aar-sosa-timing.md](aar-sosa-timing.md).
- **PR #23 (open):** the phone route as a list, both deadlines with their consequences, and the passport text. Record: [aar-briefing-deadlines-demo.md](aar-briefing-deadlines-demo.md).
- **This branch (stacked on #23):**
  - **Repeating round bug.** Climbing out of house arrest added 8 police attention on top of the reset value of 4, which hit 10 and started another house arrest the next hour. That looks like the same round repeating, and it happened in 80 of 80 test escapes. It now adds 4, and `tools/house-arrest-check.js` guards it.
  - **Rounds move on by themselves.** No briefing to dismiss, and no "Continue", "See Sosā's move" or "Next round". When the dice and the hours finish, the next round starts. A "What just happened" panel keeps the last result on screen until the next move. The briefing is a reference behind its button.
  - **The phone rings and nobody hangs up.** The phone step exists only while a call waits. The phone tab pulses, and answering ends the step. Calls can be made any time before the move.
  - **Honest dice.**
    - A move that needs no roll no longer shows a fake "rolled 6".
    - The log says no roll was needed.
    - Move cards never say "Guaranteed success" or "This move will succeed".
    - Roll previews name card kinds in plain words instead of internal codes ("information 1").
  - **The police box is small,** and says "Police are searching where you are" before the game ever uses Sosā's name.

## Research delivered (not built)

- [First-play stand-in playtest](playtests/first-play-proxy-findings.md): ten moments where a naive player stopped, misunderstood, skipped or tried something unsupported. It is labeled as a stand-in, not a human observation.
- [First-play proposal](proposals/first-play.md): a guided first play that teaches by doing, with what changes in the code.
- [World accessibility audit](proposals/world-accessibility.md): every proper noun, where it first appears, whether its role is explained, rename proposals with alternatives, and the order in which to introduce the world.
- [Dice proposal](proposals/dice.md): no move needs less than a 2, and cards improve the odds but never remove the roll. Measured effect: escape win rate 35.0% to 31.8% (Teresā) and 34.4% to 32.4% (Matēu); she escapes on the government side 45.5% to 43.8%.

## What went wrong, and what changed because of it

- **I misread "say it once" as "use fewer words".** I cut lines to stubs, and the owner had to correct this several times. The rule is now in AGENTS.md in his words: understandable text, traced to the code, and budgets never beat meaning.
- **I proposed rewrites from guesses.** For example, "Jet" as a contact and "Baca has your name" as Baca learning who you are. The fix was to trace every string to the code before writing, which the four audits did.
- **I folded the demo's reading steps into longer coach cards.** The owner then ruled out solving onboarding with more copy, so that change was withdrawn from #23.
- **I added "This move will succeed" because a forwarded review asked for it.** The owner does not want outcomes told in advance, so it is gone.
- **The branch fell behind main twice,** and the merges had to keep PR #18's character lines.
- **I could not watch a human play.** The playtest is an agent standing in for one, labeled as such. The owner's own notes from the person he watched outrank it.

## Checks on this branch

- Content check: 0 errors, 0 warnings.
- Contract tests, both tutorial replays, pbbg-check and the new house arrest check pass.
- Win rates on both sides are unchanged by the flow and dice-honesty changes. The house arrest fix doesn't move the calibration bots, which never climb.
- In a phone-width browser, rounds 1 to 9 advanced with decision taps only, and no "click to advance" button appeared. The ringing phone, the recap panel and the small police box were checked on screen.

## Open

- **Owner decisions:**
  - the dice floor and whether using help should cost something;
  - the renames and the four questions in the world audit;
  - the three questions in the first-play proposal.
- **Issue #20:** the government demo stalls in an automated browser test.
- **Backlog, priority 1:** arrangement messages never appear, the escape demo stays scripted after it ends, the minister's reply reveals her position, the grandson card is lost at Salta, and police attention reports disagree within a round.
