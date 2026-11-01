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

## Addendum: merging PR #31

The owner asked for a pull request and a check of the open ones for conflicts. PR #30 (this branch) merged cleanly into main. PR #31 (`claude/language-pass`, another session) conflicted with main in seven files and with #30 in 10. It was branched before #27 merged, so its version of `sim.js` still carried the Monday noon passport rule that step 3a removed, and its lines still said "Sosā".

Both PRs removed the odds independently. The agent merged #31 into this branch so that #30 carries both:

- **Taken from #31:** "Call your contacts" follows the visa rules and is offered only while something can move. Progress messages play on the result card in the speaker's words. The view carries the roll's target as `real` instead of `need` or a percent. Tests C16, C18 and C19 came over: no view, chip or catalog line carries a target, no text says in advance that a move will work, and no bot reads a display chip. Calls and ally replies no longer say "the call can fail". The tutorial lines that talked about "the number you need" were replaced with #31's wording, in police terms.
- **Kept from this branch:** the move list and cards, the 20-sided rules and every rule decision since #31 branched, "the police" throughout, and "You rolled 14" after a roll. The C18 label test is now C20.
- **Changed on merge:** the Salta tutorial step no longer says "Never pay the yardmaster", because #31's C18 enforces the owner's "Do not ever say what can succeed or not." C16 ignores "police attention is 7 or higher", which is a rule about attention, not a die target.

**Conflict between the two PRs' owner instructions:** #31 removed "You rolled N" from results under "Get rid of 'the die decides it' or any superfluous language". The owner told this session "just let me see what I rolled". The merge keeps "You rolled N"; the owner should confirm.

**Calibration after the merge, 300 runs:** Teresā 44.3% (was 44.7%), Matēu 39.3% (was 40.7%); government side 55.5% (200 runs). The change comes from #31's contacts-call rule and its bots reading facts, not from this branch.

**Checks:** content check, both demo replays, contract tests (C03 to C20), house-arrest check and pbbg-check pass. Phone audit found no issues; both demos play to the end in the browser with no errors.

## Second addendum: no rolled number

The owner settled the open question: "I never want that information, just let the person roll the dice and then see what happens next. Why would it need to be announced?" The die still rolls on screen. The result card shows only the outcome ("It worked", "Failed"), and the log says "It worked." or "It failed." The "You rolled N" chip, both log lines with the number, and the ally and police-questioning lines' unused die values are gone. The result card's "A friend in the inquiry, the party machine made this easier" line went too: it announced how the roll was decided, and its grammar was broken. The card "Theo walks you through" is now "Theo's walk through the yard", the name the route already used, because the result card's "You got {name}" read "You got Theo walks you through". AGENTS.md records the rule. Display only; no rule changed.

## Third addendum: one line per result

The owner, on the result card for "Ask Theo to walk you through": "'Ask Theo to walk you through' and then 'Theo walks you through' is redundant. Why does it need to say that twice? It could say 'Theo escorts you' and that's literally it, and it would cover the whole card. All of them could be that way!"

When a move or choice has its own narrative line, the result card now shows that line as its headline and nothing that repeats it: no move name, no "Success" or "Failed", no "You got (card)", no "(person) trusts you more", no "You made it to (stop)" (the milestone screen says that). Police attention, a lost card, a person who sold you and a search at your stop still show, because the line does not say them. A result with no line (six move outcomes and about half of the news choices) keeps the move name, the outcome word and every chip, so nothing is lost. Display only; no rule changed.
