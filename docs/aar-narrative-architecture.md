# After-Action Report: Last Freight Out, the narrative architecture pass

**Date completed:** Oct. 29, 2026
**Branch:** `main`, commits `cd42f2c` and the copy pass that follows it
**Deliverable:** `index.html` rebuilt; `src/tutorial.js` new; `src/sim.js`, `src/ui.js`, `src/shell.html`, `src/style.css`, `src/render.js`, `tools/build.py` and `README.md` changed

---

## TL;DR

The first build worked but did not explain itself. The copy was half Verdenese, the screen opened straight onto a hand of cards, and nothing told a new player who they were, what they wanted or what the four badges at the bottom of the picture meant.

This pass changed three things. All game text is English now, with Verdenese kept for names, the austral and a few spoken words. A start screen opens the game and says the situation, how a night works and what each of the three characters means for play. A guided practice night walks a first-time player through every mechanic on a fixed deck, with only the step's own action enabled.

The simulation did not change, apart from an optional fixed deck order and one derived-state fix. Win rates under the calibration policy are the same as before.

---

## What was asked

The owner, verbatim in substance:

> We're going to rewrite the entire game copy and ensure that it uses English and only devolves into Nelosphere language when naming people or where it makes sense. Our job is just to focus on the narrative architecture of the game and making sure it's clear what the hell is going on. Right now the user has no clue what's happening, how to play or what to do and when to do it, so there has to be some kind of first run where you get a large tutorial in what's going on. You get a demo you play through the first time and it tells you what everything does, what it all means and what the goal is depending on what side you pick.

Then, after the first commit:

> You would write a new AAR for this. Also use these to clean up the language.

with two skill installers: `skillfish add applied-artificial-intelligence/claude-code-toolkit plain-language` and `skills add a5c-ai/babysitter --skill ap-style-writing`.

---

## What shipped

### The copy rule

Game text is English. Verdenese survives in three places:

- **Names.** Inēs Biankī, Lūçīā Ferrārô, Pipô Rosī, Gaspār Moralēs, Mārtā Kovalskā. Theo Bascom and Holt Greer keep their English Pearl names, as before. Salta, Valdória, the Pearl, the Huhūi passes, Esmeralda, Susana, Baca.
- **Money.** Australs.
- **Speech.** *Dālē*, *trankīlô* and *niñô* stay in character lines, where a Valdórian would say them. Nothing in a card, a button, a label or the coach box uses them.

The stations are the attic over the shed, the market, the customs post, the rail yard and the freight platform. The passport is a passport, the boxcar a boxcar, the foreman a foreman. The persona called the kolôniā clerk is the settlement clerk. The route bar, the hover labels and the state labels all follow.

### What the labels say now

Each card's flavor line says what the card does, not a line of atmosphere. "Australs in the right hand. The wrong hand talks." became "Pay someone to help you. The price goes up each time you do it, because word gets around." The small print on each card names what sort of thing it is played on (a person, an object, a place, a service you order) beside the count of uses from where you stand.

"Applications" became "Targets." "Still to arrange" became "What you still need." Each of the four lines (Papers, Passage, Yard, Berth) says how to get it, and hovering a line says what it is for. `Sim.arrangements()` now carries both texts (`how` and `what`), so the HTML list, the canvas badges and the tutorial read from one source.

The blocked-move text names the thing you need: "Gaspār blocks the customs barrier. You need Passage first: bribe Gaspār, distract him, or pick the side gate." The board button has the same treatment through `#boardwhy`.

The help box is a reference: the situation, the four things and the ways to each, how a turn works, money, favors and heat, keys.

### The start screen

`#start` opens the game. It says who you are, what you want and how long you have, in one paragraph. Two columns under it: how a night works, and the three characters. Each character shows purse, favors and starting heat, a one-line blurb and a line on how that start forces you to play. The chart-maker is balanced. The niece can bribe her way through, but every bribe is dearer and hotter than the last, and the bailiffs already know her. The clerk cannot afford a single bribe and lives on Sweet talk, Call in a favor, Pipô and selling maps.

On a first visit (no `lfo.seen` in `localStorage`) the primary button is **Play the practice night**, with a one-line note saying what that is. After that the primary button is **Start a real night**. The screen can be reopened from the header and from the game-over panel, which gained a **Change who you are** button.

### The practice night

`src/tutorial.js` is a list of 23 steps. Each step has a title, a body, the elements it points at and an `allow` object saying what the player may do. Info steps allow nothing except **Next**. Action steps allow one thing and wait for a `done(state, selection)` test.

The deck is fixed: the opening hand is Commission papers, Sell maps, Distraction and Sweet talk, then Bribe, Lay low, Pick lock and Call in a favor in draw order. `Sim.newGame()` accepts `opts.deck` for this and otherwise shuffles as before. The run, with the clock:

| Step | Action | Teaches | Clock after |
| --- | --- | --- | --- |
| 1 to 4 | Read | Who, what, how long. The top bar. The route and the red bars. The four things. | 17:00 |
| 5 | Walk to the market | Walking costs 30 minutes | 17:30 |
| 6 to 9 | Commission papers on Lūçīā | Select a card, pick a target in the list or picture, read the inspection, commit | 18:00 |
| 10 | Read | Pending work, the bubble dots, the hand refills | 18:00 |
| 11 | Sell maps on the stall | Coin up, heat up | 18:30 |
| 12 | Read | What heat does at 3 and at 8, what Lay low does | 18:30 |
| 13 | Distraction on Pipô | A free, remote way to Passage | 19:00 |
| 14 | Read | Passage open and temporary; Papers finished in the background | 19:00 |
| 15, 16 | Walk to customs, walk to the yard | Move while the distraction holds | 20:00 |
| 17 | Read | Yard open on the papers; a dead card in the hand | 20:00 |
| 18 | Select Pick lock, wait | Swap a dead card, pass time on purpose | 20:30 |
| 19 | Sweet talk Theo | Favors, and what they are for | 21:00 |
| 20 | Walk to the platform | | 21:30 |
| 21 | Bribe Holt | Bribe inflation; Holt takes money only from Theo's friends | 22:00 |
| 22 | Board | You need not wait for midnight | 22:00 |
| 23 | Read | Real nights are shuffled; how each character changes play | |

Nothing in the run depends on a dice roll. The brazier heat roll and the patrol roll never fire, because the player never kicks the brazier and heat never reaches 3. The script was dry-run in Node against `Sim` before any UI was written, then in headless Chromium against the built page.

Restriction is applied at the UI, not the sim. `UI` asks `Tutorial.allowsCard()`, `allowsTarget()`, `allowsMove()` and `allow()` when it renders the hand, the target list, the controls and the keyboard shortcuts. Cards outside the step fade to 35 percent and are disabled. Targets outside the step render as blocked and do not take clicks. The canvas highlight only glows for targets the step allows. On the swap step the wait button stays disabled until the player selects the card, so the lesson is the swap and not a plain wait.

The coach box sits in the side column above the dialogue log, not over the panels it points at. It shows "step n of 23," the title, the body, a **Next** or **Finish** button on info steps, a "do the step above" note on action steps, and **Leave the practice night**. Elements the step refers to get a pulsing gold outline through a `.coach-target` class. The tutorial advances only when the animation queue is empty, so the text does not change while the consequences are still playing.

The game-over panel stays hidden during the practice night; the last coach step has the final word and **Finish** returns to the start screen. The practice night never writes to the career record.

### One sim change with a narrative reason

"What you still need" listed Passage as still needed after the player was already past the guard, because Gaspār's distraction had expired. A new player would read that as a problem. `arrangements()` now treats a gate as done when the player is past it (`s.pos >= 3` for Passage, `s.pos >= 4` for Yard) and flags it `behind`, and the list reads "behind you." Walking back and forward again still needs the arrangement, as before. The calibration policy already checked position, so its numbers did not move.

---

## The language pass

Two rulebooks were requested. Neither installer produced a skill in this environment: skillfish got a 401 from the GitHub API, and the babysitter installer indexes seven skills under a different path and does not list `ap-style-writing`. Both repos were cloned and the two `SKILL.md` files read directly.

The plain-language skill (`examples/writing/skills/plain-language/SKILL.md`) is a working rulebook: active voice above 80 percent, sentences under 25 words on average and none over 35, jargon explained or cut, no nominalizations, no weak verbs, no redundancy, no weasel words, tutorial mode stricter than the rest. The AP skill (`library/specializations/domains/business/public-relations/skills/ap-style-writing/SKILL.md`) is a capability description for a PR tool, not a rulebook; its concrete rules are the ones the first build's AP pass already used: numbers under 10 spelled out in prose, titles lowercase after the name, month-day-year dates, passive voice kept low. The rest of AP came from the stylebook as the first pass applied it: sentence case, American spelling, no Oxford comma, no exclamation points.

A script extracted every string from `shell.html`, `tutorial.js`, `sim.js` and `ui.js` and measured them. Average sentence length was 14.6 words in the shell, 12.6 in the tutorial and 11.6 in the sim before any fix. The hits, and what changed:

- Seven sentences over 25 words, all in the start screen, help box and tutorial. Each was split.
- Five avoidable passives. "Favors are owed to you by people in town" became "People in town owe you favors." "The deck is shuffled" became "the game shuffles the deck." "The card is replaced with a fresh draw" became "draw a fresh card in its place." "How much of the night is used up" became "how much of the night has gone." "At 8 you are caught" became "At heat 8 they catch you." State labels such as "Passage arranged" and "window is open" stayed; they describe a state, and the actor is the point.
- Numerals in prose. Heat thresholds now read "heat 3" and "heat 8," a figure with its unit. "1 in a doorway, 3 in the attic" became "one point in a doorway, three points in the attic." "0 uses here" became "no use here." Money and minutes keep figures, as AP allows.
- "Grey" and "greyed out" became "gray," American.
- One Oxford comma in the final tutorial step.
- No weasel words, no exclamation points and no dashes were found in the new copy.

Character dialogue was left alone, as the first pass left it; the humanizer exempts fiction and the voices are the point.

---

## Measurements

`node tools/calibrate.js 200`, before and after this pass, same policy:

| Persona | Win % | Losses | Boards at |
| --- | --- | --- | --- |
| The chart-maker | 51.5 | 97 clock | 22:00 |
| The toll-taker's niece | 45.5 | 106 clock, 3 heat | 21:30 |
| The settlement clerk | 33.0 | 132 clock, 2 heat | 22:00 |

Identical in both runs. `deterministic: true`.

Playwright (Chromium) against the built `index.html`: the start screen shows with the first-run note; the practice night runs all 23 steps in order by clicking only what each step allows; a blocked action during a walk step stays blocked (the wait button and the forgery card both disabled); the wait button stays disabled on the swap step until Pick lock is selected; the game-over panel stays hidden until **Finish**; the start screen returns with the first-run note gone; a real night then opens with the coach hidden and the forward button live. Zero page errors, zero console errors, zero network requests.

---

## Decisions worth recording

- **Restriction lives in the UI.** The sim does not know the tutorial exists beyond a `tutorial` flag and a deck option. The alternative, a sim mode that refuses moves, would have put presentation rules into game truth and made the calibration harness lie.
- **The deck is the script.** With a fixed draw order every step's card is in hand when the step needs it, and no step has to say "if you drew X." Drawing from the end of the array is how `draw()` already worked, so the tutorial deck is just a list written back to front.
- **The coach is in the layout, not floating.** The first draft used a fixed box in the bottom right. It covered "What you still need" at the exact step that pointed at it. The box now takes the top of the side column, and the dialogue log shrinks under it while the tutorial runs.
- **Info steps block play.** While the coach explains something, nothing on the board is enabled. A player who clicks around during the explanation would desynchronize the script.
- **The over panel yields to the coach.** Two boxes both saying "you won, now what" at the same moment is noise. During the practice night the coach's last step is the ending.
- **Gates behind you read as done.** A needs list that says you still need something you have already used is wrong to a reader even when it is true to the code.

## Not built, and why

- **A hint system for real nights.** The owner asked for a first run, not a running assistant. The help box and the how-to lines in the needs list carry the reference load.
- **Per-character tutorials.** One run on the chart-maker, ending with what the other two change, teaches the mechanics once. Three scripted runs would triple the maintenance for one lesson each.
- **Touch affordances.** Unchanged from the first build; the page reflows to one column under 1100 pixels and the coach box goes full width under 800.

## Known rough edges and risks carried forward

- The tutorial's `done()` tests read sim state, so a future change to a card's effect (say, Pipô distracting for two half-hours instead of three) can silently break a step. Run `node tools/tutorial-check.js` whenever `sim.js` or `tutorial.js` changes. It replays the path against the real `Sim` and fails on the first step whose test does not pass.
- The two first-build AAR documents still use the old Verdenese station names in their prose. They are a record of that build and were left alone.
- `localStorage` carries `lfo.seen`; a private window sees the first-run screen every time, which is the right failure.

## Validation

- `node tools/calibrate.js 200`: table above, unchanged.
- `node tools/tutorial-check.js`: all 23 steps pass in order, boards at 22:00 with 4 australs and heat 1.
- Playwright run as described, screenshots of the start screen, the inspection step, the platform and the final step reviewed by eye.
- `tools/build.py` asserts no `</script` inside any inlined part; `tutorial.js` added to the parts list.
- String scan for Verdenese outside names and speech: zero hits in `src/`.
