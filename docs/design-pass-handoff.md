# Coalition: design pass handoff

**Date:** October 30, 2026
**From:** Claude (design session with the owner, Ron Bronson)
**For:** the agent continuing work on `claude/vigilant-noether-rmcm7h`
**Status:** In progress. The owner has more direction to add before this is final.

The mockups live on a private Design canvas: https://claude.ai/code/artifact/7ebf4005-5041-4c41-a8d8-c3a59d146c74. It has three screens: the desktop play screen (the current direction), a start screen and a phone play screen. The start and phone screens predate the blueprint board described below.

Read `docs/coalition-origin-and-concept-report.pdf` first. Everything here comes from it.

## 1. Owner corrections to the story

These change the rules as well as the copy. Run `node tools/tutorial-check.js` and `node tools/calibrate.js 500` before and after.

### The second passport already exists

The player has held a second passport for years. Nobody issues it during the run. The owner called the civil record storyline "silly" and said the invented term breaks immersion. The coordination problem is getting out of the country before you are stopped. The passport exists, and your sibling gets you a plane.

- Remove the **Document** arrangement (`ARRANGEMENTS.document`, its `STAGE_LINES` and its job hours in `sim.js`).
- Replace the `civil_record` card with a card in the **starting hand**: "Your second passport." It keeps `tag: 'document'` and `reach: ESMERALDA`. Proposed text: "You have held it for years. The travel ban lists your other one." Works on: "The border post and the airfield manifest."
- Mārtā Kovalskā no longer has a role. Remove or rework her opening message (`sign_person`, `aide_asks`), the "Ask Mārtā to finish your civil record" call, the `registry_van` approach and the tutorial steps that walk through the record. Santa Laura needs a different way to leave cleanly.
- Rename the border approach `civil_doc` to "Show your second passport." Its success line should stop mentioning a civil name.
- Fix the objectives the story pass added in `data.js`:
  - Residence: "four things from four people: a jet (Duartē), a travel document (Mārtā)..." becomes three things.
  - Santa Laura: "get Mārtā to issue your civil record" goes.
  - The line: "A document the restriction does not name" becomes your second passport.

### Use real terms

| Current | Use |
| --- | --- |
| Departure restriction, "the restriction names your passport" | Travel ban. The court bars you from leaving and orders you to hand in your passports. |
| "Own passport, restricted" | Own passport, on the travel ban |
| Permission: "Atlanta will receive you" | Entry visa for Atlanta |
| Reception: "contact found" | Esmeralda expects you. Someone at the ministry in Baca has your name. |

A visa is permission to enter a country, so it belongs at the Atlanta end. Do not use it for leaving Valdória.

## 2. Design direction

### The blueprint is the board

The concept report frames Coalition as a service blueprint of an escape. Its unit is the handoff: one person's promise becoming something the next person can act on. It asks for physical movement, institutional decisions and recognized status to be mapped together. The current UI splits these across a route strip, an arrangements list and card faces, so the player never sees who they depend on where.

The desktop mockup replaces the route strip, the arrangements list and the People list with one board titled **The route**. Its columns are the six stops plus **Abroad (by phone)** for the sibling and Salek. Its rows:

1. **Who acts here:** people at the stop where they act (`PEOPLE[k].where`). A mint dot means they trust you.
2. **Needed to leave:** the `needs` that gate each exit, in one of three states:
   - **In hand:** solid mint.
   - **Promised, not delivered:** orange stripes, with who is working and when it is due.
   - **Not started:** outline.
3. **Where your cards count:** each held card as a bar spanning its `reach`. An outline shows a card the player could get, such as Vélez's card starting at the line.
4. **The inquiry:** where Sosā is looking, on the same columns as the player.

### Clock, goal and inquiry on the scene

As the earlier addendum asked, these sit over the top of the pixel scene:

- **Top left:** the clock, with hours left.
- **Top center:** the goal. "Leave Esmeraldan airspace by Tue 14:00."
- **Top right:** Sosā's panel: his next move ("in 3 h"), exposure out of 10 and "At 10 they arrive."

The header keeps only the wordmark, the character and the menu buttons.

### Panels

- **The phone:** a message thread with reply options, then calls. The arrangement progress now lives on the board.
- **Here:** each approach shows a die face with pips for the roll it needs, the odds, the hours and the card it uses. The selected approach expands in place with Commit.
- **Your hand:** full colored cards in a slight fan, a color per tag. Each shows "Works on:" and either "Counts here" or where it starts counting. Cards outside their reach are dimmed, not hidden.

### Palette

| Role | Hex |
| --- | --- |
| Ground | `#150F2E` |
| Surfaces | `#1C1540`, `#221A4A`, `#2A2157` |
| Text | `#F6F1FF` |
| Muted text | `#B9B0D9` |
| Gold (the title gold) | `#FFC93C` |
| Inquiry | `#FF4D6D`, light `#FF7A90` |
| Delivered and trust | `#2EE6B5` |
| Pending and exposure | `#FF9F43` |
| Phone | `#C9A4F5` |
| Esmeralda and the passport | `#7FB2E5` |
| Influence card | `#E85DF0` |
| Commit | `#3BD15E` |

No left border accents on cards. Panels are separated by surface tone, not rules.

### Fonts

The mockup keeps the AGENTS.md mapping, with one change for the owner to confirm: the clock uses **Overbit Shadow Bold** and the hours left use **Overbit Shadow**. They come from the full Overbit family the owner supplied. If the owner confirms, update the font mapping in `AGENTS.md`, embed the two faces in `tools/build.py` and keep their license headers.

## 3. Labels added in the mockup, pending owner approval

- The route
- Who acts here
- Needed to leave
- Where your cards count
- Vélez's card starts here
- Esmeralda expects you
- Uses a decoy card / Uses an influence card
- Counts at the line
- Goal
- Next move
- At 10 they arrive

## 4. Not done yet

- The phone layout for the blueprint board: a list you scroll stop by stop, with "Needed to leave" first.
- Which country issued the second passport. That is the owner's call.
- The owner has more direction coming before this is handed over.
