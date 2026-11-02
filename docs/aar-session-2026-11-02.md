# Agent Action Record: the Nov. 2, 2026 session

**Review date:** 2026-11-02
**Reviewed by:** agent self-review; owner review pending
**Agent / system:** Claude Code (cloud session), branch `claude/bold-rubin-53jkax`
**Task or period under review:** The whole session, from eight new companions to Sofia's stop orders
**Accountable human (name or role):** Ron Bronson, game owner

## 1. Intent

The session opened with a written brief: add eight companions (Marta, Inês, Paulo, Celina, Tomás, Nadia, Emilio and Joana) beside Bruno, Clara and Rita, each working on both sides, with bounded police-side sources and a calibration per companion. Every later request came from the owner playing the live game on a phone. In the owner's words, in order:

- "Build the lodging system, why didn't you?!? I thought my direction would have indicated I wanted to see these screens built inside the game."
- "The border is closed once it is sent ... there's no need to insist on making user friction."
- "The companions should have attributes that bolster the run in some way based on what your needs are to finish the run."
- On the picker: "this text ... clearly was not run against my editorial tools," then "The text is unreadable," then "so long winded," then "It should be a sentence of how they can help without telling you exactly how. No more than that."
- "Why didn't you design these instead of making them words? Laziness?" (the cards), then "I wanna see them on the sidescrolling screen."
- "The nav should have game stuff in it, not those other things."
- "Rest or food can be a level bar, along with other things. No more tests, push the changes. No more reruns."
- On the ending screen and news: "what is this slop language," "None of this detail is helpful or necessary," "what does this mean? 'The province goes dark'."
- "This is a dead end," twice, then: "The game is too prescriptive ... there either needs to be more to do during those times or I need to be able to find a way to make the process go differently," and "I should be able to click once and time speeds up."
- On sharing: "Research how MapTap, Wordle, and other games do this. My idea is better than yours: Coalition Run #, Level x, 18 hrs left," then the grid, pins, time of day and "🚔⛓️".
- As Sofia: "there's just nothing to do here but wait," and "the options for this side are very boring."
- "Update the issues ... make sure the AAR for this run is published to the repo."

**Success defined in advance as:** the brief's requirements, then each screenshot's problem gone on the next build.

**Authority granted:** edit, commit and push to the designated branch; open pull requests when asked (#38 opened by the owner, #39 on the owner's "yes", #40 and #42 by the agent; #41 carried the share card); comment on and open GitHub issues.

## 2. Action

### Rules

| Change | PR |
| --- | --- |
| Eight companions with escape effects and police-side sources; a companion's card is never lost | #36 |
| Food and sleep: Rested/Tired/Exhausted, Fed/Hungry/Starving; the lodging screen at every stop; the sick child; police-side reads of rooms and clinic visits | #36 |
| The travel ban in force once sent; the confirm step removed; the judge and the sergeant can make the post let it slide | #36 |
| Waiting news always shows (the escape dead end) | #39 |
| Hurry a pending call; Cover your tracks at every stop; eight new news events with shortcuts; news every four hours | #40 |
| Skip to what happens next, on both sides | #40, #42 |
| Sofia's food and sleep, her rest screen, two orders of each stop's own, news every four hours | #42 |

### What the player sees

- **Picker (#36, #38):** all 11 companions on one phone screen; each character, companion and card is one sentence. The cards are designed game cards with pixel icons and a color for each kind of help.
- **Scene (#38):** the companion walks with you and the cards you added ride along; nothing covers the art.
- **Status bar (#38):** the clock, the deadline, the police box, and Sleep, Food and police attention as three-step bars. Desktop's other buttons sit behind one Menu.
- **Endings (#39):** "You win" or "You lose" and one sentence.
- **Share card (#41):** "Coalition Run #12, Level 4, 18 hr left", then one numbered row per stop, one square per round, sun or moon, and a pin with the ending emoji.
- **Help when stuck (#40, #42):** the "what's next" box on both sides.

### Tests and tools

- Contract test C21 checks the companion roster.
- `calibrate.js` and `gov-calibrate.js` take `--companion=<id>|all`.
- The content check reads the lodging screens.
- The owner's `pbbg-check` was cloned and run for the first time in this session.

### Calibration (escape 900 runs, police 600 runs; see docs/companions.md)

| | Teresa | Mateu | She escapes Sofia |
| --- | --- | --- | --- |
| Start of session | 44.3% | 39.3% | 55.5% |
| Companions added, none picked | 44.3% | 39.3% | 55.5% |
| Food and sleep | 32.6% | 29.9% | 38.2% |
| Ban in force once sent | | | 38.2% |
| After #40 to #42 | not measured | not measured | not measured |

### Issues

- Commented on #20 (Sofia's demo stall, a related phase bug) and #35 (speed runs: hurry calls and shortcut events).
- Opened #43 (calibration owed), #44 (browser and contrast check owed), #45 (AGENTS.md rules that conflict with today's decisions), #46 (police-side companions that don't help the bot) and #47 (the "From now on" line with Paulo).

## 3. Judgment

**Decisions the agent made on its own:**

- **Food and sleep thresholds.** Tired at 18 hours awake, exhausted at 30, hungry at 12, starving at 24. They cut win rates by about 11 points. The owner's difficulty rule kept them, and the numbers were reported, not tuned away.
- **Outlier fixes during companion calibration.** Marta's decoy bonus went, Celina sends the police back once a stop, Tomás's named post is easier, Joana's Salta reports are 10 hours late, and Inês and Emilio's reports were reworked. Each fix was measured before and after.
- **The police attention bar.** The owner said "along with other things." The agent read that as including police attention, against the AGENTS.md "no bar" rule. This was flagged in the reply and in #45.
- **"hr" over "hrs"** in the share card, following the interface rule for durations.
- **Square colors.** Green, orange and red follow the game's police attention colors.

## 4. Deviation

- **Lodging not built at first.** The brief said Inês and Emilio should connect to "the planned lodging" system. The agent read "planned" as later work and wired them to what existed. The owner had to ask.
- **Copy shipped without the owner's editorial tools.** The picker went out wordy and in card language. It took four rounds of feedback to reach one sentence each. The agent had the Humanizer rules and the checkers available from the start.
- **The cards were text, not design.** The agent treated the cards as a copy problem.
- **A wrong rule in copy.** Rita's police-side line said "from the start" when the order opens at 2 a.m. Sunday. Tracing the code caught it in the copy pass, not before.
- **Inline comments swallowed code** four times (`sim.js`, `gov.js` twice, `ui.js`). The parse check stopped each before a commit.
- **A broken commit pushed.** An unescaped apostrophe in "can't" broke `data.js`. The build did stop, but the agent's command piped the build through `tail`, which hid the failure, and the commit and push ran anyway. The next commit fixed it.
- **The live site misread.** The owner's screenshots twice showed `main`, which was behind the branch. The agent checked the live page and the merge state before answering only the second time.
- **The contrast check didn't finish.** The container's browser was too slow, and a 15-minute limit killed the first run. The status bar was measured directly instead.
- **Rule changes without calibration.** This was on the owner's instruction from the level-bar change on, and it is recorded in #43.

## 5. Consequence

- The game is harder than at the start of the session by at least 11 points on the escape side. The effect of #40 to #42 is unknown.
- Several screens have not been seen in a browser (#44).
- AGENTS.md still carries rules the owner has since overruled (#45).
- Runs saved before #41 have partly empty share grids.

## 6. Change

- Pipe nothing after a build or check whose exit code a commit depends on; run the build and test its exit status first.
- Never put an inline comment on a line that continues with code; put the comment on its own line.
- Run every new player-facing string through the Humanizer rules and the plain-language rules before the first push, not after the owner's screenshot.
- When a brief says "planned" or "should become useful once ... is implemented," ask whether to build it, or build it.
- Before answering a screenshot from the live site, check which build `main` and the site are serving.
- Design a screen, don't only word it, when the rest of its flow has art.
