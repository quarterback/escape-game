# Agent Action Record: the phone pass, the die and the move list

**Review date:** 2026-11-01
**Reviewed by:** agent self-review; owner review pending
**Agent / system:** Claude Code (cloud session), branch `claude/gracious-tesla-sbzlfp`
**Task or period under review:** The three commits after PR #27 merged: the phone pass, no odds before a move, and a move list that shows only what you can do
**Accountable human (name or role):** Ron Bronson, game owner

## 1. Intent

**Instructions given (actual wording):**

> Screenshots, then: "Rebase with main before commenting," and a pasted analysis of the phone screen: move cards too long, information repeated, cards too tall, internal concepts on screen, "one hours", "undefined", weak hierarchy. Do a mobile editing pass that checks for undefined, null, placeholders, overflow and hidden content.

> "Do not keep the chance! It goes! No roll anything, just let me see what I rolled. Ask me why if confused, clearly your logic is off."

> "I don't want blocked moves to show up at all, just tell me what is next and if I get choices let me choose. It's too confusing if I see a card I need. I wanna know how to get it, so either let me get it or don't show me. It's a mess." Then: "I don't need to know I'm boarding at night. All that description can go away. It's true for all those cards: it only matters if the instructions tell me an action. Otherwise none of it is necessary detail." And: "AAR this run after it's done too."

**Success defined in advance as:** no rule changes (calibration identical before and after), every check passing, and a phone-width browser audit that finds no "undefined", no placeholder, no text past the screen edge and no "one hours".

**Authority granted:** edit, commit and push to the designated branch. The owner had said earlier that day that he wants direct action rather than questions.

## 2. Action

| Commit | Change | Rules changed? |
| --- | --- | --- |
| Phone pass | Moves stopped repeating when the police act. Blocked moves said what is missing in story terms. An opened move scrolls its buttons above the tab bar. Tags wrap at 14px. Secondary text is raised to 14px. `esc()` prints nothing for a missing value. | No |
| No odds | No target, percent or die badge before any move, order, call or news choice. After the roll: "You rolled 14" and the outcome. The "You chose undefined" bug was fixed: rumor choices were built without their labels. New contract test C18 answers 400 choices and checks that each names itself. The card notice moved to the top so it no longer covers Continue. | No |
| Move list | Blocked moves and orders are not listed. A move card shows its name and how long it takes. Opened, it shows "Try it" and "Cancel". Descriptions, preview bullets, the night note, the "easier with" chip and the wait lines are gone. A person's tag shows only when it is a warning. Five strings that nothing displays any more were deleted. AGENTS.md records the rule. | No |

**Calibration, `tools/calibrate.js 300`, before and after the move-list commit:** Teresā 44.7% and Matēu 40.7% both times, identical losses and hours.

**Checks after the last commit:** content check 0 errors, both demo replays, contract tests, house-arrest check and pbbg-check pass. The tutorial step that said to read what a move does now says to pick it and tap **Try it**.

## 3. Judgment

**Decisions the agent made on its own:**

- **Warnings stay on the card.** A person who doubts you, or who has talked to the police, is still tagged on the moves that use them. That tag tells you a move is riskier now, and nothing else on screen says so. Every other tag went.
- **How long a move takes stays.** Time is the deadline you are racing, and AGENTS.md requires every clock to say whose it is. The waits keep "The police act once in that time" for the same reason.
- **The "why" strings stay in the simulation.** `Sim.commit` still returns them when a move is refused, and the contract tests read them. They no longer reach a move card.
- **Card names still appear after a roll.** "Your contact helped" on the result card is what happened, not an instruction, and the owner asked earlier for the card that helped to be named.

**What the owner should see:** with blocked moves hidden, a stop can show fewer moves than before, and a needed move appears only once you hold what it needs. The "Next" line and the briefing are now the only places that say what you are working toward. If they do not say enough, the fix is in those lines, not on the cards.

## 4. Deviation

The first two commits did not change what a card showed beyond what was asked; the third removed most of what the first one wrote (the story-term "You need ..." lines). That was the owner's call after seeing it, not a revert of a mistake.

The agent ran the calibration by stashing its working changes while a browser check was running. That swapped the built page under the browser run, so the run was stopped and repeated on the rebuilt page.

## 5. Consequence

Saved runs load unchanged; nothing in the state changed. A player at a stop no longer sees what a move needs, so a stop with nothing available but waiting shows only the waits. The phone audit (four random runs at 390px) found no issues, and both demos play to the end in the browser with no errors.

## 6. Change

- The owner plays a run on the phone and says whether the "Next" line tells him enough now that the cards say nothing about requirements.
- Any new move text belongs in the briefing, the help or the result, never on the move card.
- When a check needs an older build, use a separate worktree, not `git stash`, so a running browser check keeps its page.
