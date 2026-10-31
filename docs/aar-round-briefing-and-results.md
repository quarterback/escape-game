# Agent Action Record: round briefing, results screen, Close button and the copy handoff

**Review date:** 2026-10-31
**Agent / system:** Claude (design session)
**Accountable human:** Ron Bronson, game owner

## Intent

The owner played both sides and reported four problems:
- **No context between rounds.** "Every round I don't know what I'm supposed to
  be... I'm just clicking buttons and hoping for the best." He asked for a
  screen before each round that explains, in plain language, what is going on
  and what the round's task is.
- **The government results screen explained nothing.** It listed every hour,
  every report and every ally's tally, and never said whether the run went well
  or why. He asked for a different mental model, like Wordle or MapTap.
- **No way out of an ending.** The ending offered replay, save and share, and
  nothing that simply closed it.
- **A copy handoff** (`coalition-copy-handoff.md`, from a separate review
  pass) listing fixes, decisions and things to keep.

## What changed

**Round briefing (new).** A card opens before every round on both sides and
waits for "Start round N". It replaces the 1.3 second round flash, which still
plays during replays. The card has four parts, all built from the live state:
- **The situation.** On the escape side: the stop's arrival text when you have
  just arrived, how many stops remain, where Sosā is looking relative to you,
  exposure, holds and hours left. On the government side: the setup on round
  one, your best guess, the latest report and its age, the minister's deadline
  and hours left. The government card never states her real position (C04).
- **This round.** The stop's objective as written, plus one tip chosen from the
  state: which arrangement to spend the call on (reception first at Nova Trentô
  and Salta, where the objective is about Baca), or which desk request to make.
- **To fly out / To stop her.** The win condition in one or two sentences and a
  checklist: jet, visa and reception, or the travel ban and the Esmeraldan hold.
- **The round's steps** in one line.

A "Briefing" button in the phase bar reopens the card at any time with the
current state; Escape closes it.

**Government results screen.** Rebuilt on the daily-game model:
- **Where it landed first.** A three-step ladder (in custody, still in the
  country, got away) with the result lit, and one sentence on what happened.
- **A score.** "On her in 7 of 18 checks", then one square per check: on her,
  one stop off, sent wrong by a decoy, or lost. The squares fold the 20-odd
  table rows into one line you can read at a glance.
- **What decided it.** Up to four moments found in the timeline: when you lost
  her, the longest stretch without her, when you found her again, and what
  Nando's decoys cost.
- **Your desk and the minister** in one line each.
- **Hour by hour** sits behind a disclosure, with identical hours folded into
  one row, so the 20 rows in the owner's screenshot become about 10.
- **Share** now works on the government side, with an emoji grid.

Bugs fixed on the way: the ending was coloured as a loss when the ministry
won; "Tuesday 2 p.m.." had a doubled period; a row read "6 hours late" when the
search was three stops off (stops were multiplied by two and called hours).

**Close.** Every ending has a Close button (Escape works too) that returns to
the start screen.

**Copy handoff, applied:**
- **Buttons and hints name the thing:** Read the new reports, See Sosā's move,
  Finish with the phone, Finish at the desk, See how your move went. The
  tutorial step and hints that name these buttons were updated with them.
- **Fragments are sentences:** the four log lines, the arrangement status, the
  bought post ledger line, two government effect lines.
- **Facts:** the about page now states the real hold ladder (questions, a night
  at the station, house arrest). "Three posts cross into Esmeralda" is now
  "three crossings lead into Esmeralda".
- **Objectives at Salta and the border** rewritten within the 18-word budget.
  The handoff's border proposal said "pick it" about the bought post, which
  reverses the meaning, so it was written again.
- **Quotes:** curly quotes are straight in `src/data.js` and `ui.json`.
- **Spacing:** the leading space and separator moved out of two catalog
  strings into the code that joins them.
- **Left alone:** `map.hint` (the owner wrote the map screen copy) and the
  handoff's KEEP list.

## Not done, waiting on the owner

From the handoff's DECISION list:
- **"Approach" or "move"** as the one player-facing name for the core action.
- **"Hand" or "Cards"** as the tab name (the README documents "Hand").
- **The minister's effect line** "The minister waits and remembers asking"
  needs its intended meaning before a rewrite.

Two handoff items were already settled. Narrative fields in `src/data.js` stay
with their rules, as `content/README.md` records. `start.sibling_her` already
renders as "Her brother Duartē", because the code strips "your".

## Verification

- `python3 tools/build.py`: content check 0 errors, 0 warnings.
- `node tools/contract-tests.js`, both tutorial replays and
  `node tools/pbbg-check.js` pass.
- `node tools/calibrate.js 300` and `node tools/gov-calibrate.js` match `main`
  exactly; no rule changed.
- **Browser runs at 390 pixels wide:** both sides played into round three, plus
  three government endings (custody, still in the country, got away). No page
  errors.
- **Contrast:** see the note at the end.

## Open

- **First-time player test.** Nobody has played the briefing yet who has not
  seen the game. It adds a tap per round, and the owner should judge whether
  rounds one to three need it every time.
- **PR #18** (character dialogue) puts action IDs (`decoy`, `help_host`) into
  the engine's `apply` function to choose who speaks. That works, but the
  speaker belongs in the data record (for example `success.line`), so a new
  scene needs no engine edit. It is otherwise compatible with this branch.

## Contrast note

`node tools/contrast-check.js` reports 7 distinct failures, the same count as
before this run. All 7 are game panels drawn behind the title and start
screens by the attract replay, measured while dimmed under the overlay (for
example "Continue" at 3.27:1). None is on the briefing, the results screen or
the Close button, and 32 of 32 text-over-picture checks pass. The flash
interstitial's failing subtitle no longer appears outside replays. The check
should skip elements under an open overlay; that fix is not made here.
