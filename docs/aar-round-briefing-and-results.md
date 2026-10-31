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

## Second pass, same day: say it once

The owner set the rule for every line in the game: state the situation one
time and stop. Nothing repeats a button, explains what a line means, or says
it again in other words. If someone asks something, show their words with
their name. Endings are "You win" or "You lose", with one line of reason.

**What changed under that rule:**
- **Endings, both sides.** Title "You win" or "You lose", then one reason:
  "She got caught.", "Her time ran out.", "She escaped.", "You got out.",
  "You got caught.", "Your time ran out.", "You landed somewhere that won't
  take you.", "You took the deal." Her time running out is a ministry win.
  The epilogue paragraph on the escape side no longer shows.
- **Government results.** The three-step ladder and the long reason sentence
  are gone. Turning points are one fact each ("Sat 8 p.m.: you lost her at
  Santa Laura."). The minister line is one sentence plus his mood.
- **Briefing.** Matches the canvas boards: clock, round, place, the arrival
  text on a new stop, a route strip with You, Sosā and the jet (or Search
  and Last seen), hours left and exposure (or the minister's deadline), one
  job line, the win line and a checklist with progress pips. The job is the
  phone call that moves the most urgent arrangement, or the stop's objective.
- **Objectives** cut to the task: "Get past the watch.", "Change cars.",
  "Leave for the border once Baca has your name.", "Get on the midnight
  freight. The yardmaster sells you to Sosā.", "Cross into Esmeralda. One
  post is bought.", "Board the jet."
- **The minister's two options** have no preview line; the button says it.
- **Names:** "move" replaces "approach" and "Deck" replaces "Hand" on every
  player screen, in the tutorial and in the README.
- **Canvas:** three boards in the row "Before every round: the briefing".

**Not yet swept to this rule** (next run): move descriptions and order
descriptions in `src/data.js`, the odds and hours lines under each move,
report text, arrangement statuses, event text and the tutorial steps. The
glossary does not yet list "move" as the approved term.

**Checks:** content check 0 errors; contract tests, both tutorials and
pbbg-check pass; both calibrations match `main`.

## Third pass, same day: player language, traced to the code

**What went wrong in the second pass.** I read "say it once" as "use the
fewest words" and cut lines to stubs. The owner corrected this: the rule is
understandable text, not shorter text. Lines like "On her in 7 of 13
checks", "3/10 exposure" and "Your desk" exposed the game's internal
bookkeeping, and short wording did not fix that. I also proposed rewrites
that replaced internal terms with my own guesses at their meaning ("Jet" as
a contact, "Baca has your name" as Baca learning who you are) without
checking the code. The owner's rule, now in AGENTS.md, is to trace every
string to the code before writing it, and to flag what cannot be traced.

**What changed:**
- **Traced table for the two screens.** Every line on the results screen and
  the briefing was traced to the code, rewritten in player language, and the
  approved rows applied. Endings now name the outcome ("She is under house
  arrest.", "It is Tuesday at 2 p.m. Her immunity is gone, and she can no
  longer fly out."). The score says where your search was aimed against
  where she was. The briefing explains the deadline, police attention and
  what each arrangement step gets you.
- **Audit of all player text.** Four audits traced every string in
  `src/data.js`, `ui.json`, `markers.json` and `tutorials.json` (about 1,390
  strings): 358 rewrites, 1,033 keeps, 41 left for open decisions, none
  unknown. The rewrites were applied by a script that changed a string only
  when it still matched the audited original. The tables are in
  `docs/text-audit/`.
- **Enforced term.** The glossary now approves "police attention" and the
  content check rejects "exposure" in system text.
- **Display bugs fixed** (no rule changed): Sosā's location read "the santa
  laura" and "the the line"; the government log printed "You said
  ask_time"; the floating "+1 exposure" showed her hidden number on the
  government side and now does not.
- **Design issues recorded** in `docs/design-issues.md`: the six open
  decisions, plus every case where a name, label or text disagrees with the
  code. None was changed. The most serious: arrangement messages never
  appear, climbing out of house arrest returns you to house arrest, the
  escape demo stays scripted after it ends, and the minister's reply tells
  you whether she is where you said.

**Checks:** content check 0 errors and 0 warnings; contract tests, both
tutorials and pbbg-check pass; both calibrations are identical to before;
both sides played to round three in the browser with no errors.

## Final correction pass before merge

Requested by the owner after reviewing PR #19.

- **Old terms removed.** The government share text and the results lines no
  longer say "checks" or "on her"; they say where your search was aimed
  against the town she was in. "Commit" in the help and demo became "Try it",
  matching the button. Demo steps name the real buttons ("Hire a plain car and
  driver", "Search Santa Laura", "Duartē Albukerkē about the jet").
- **AGENTS.md is consistent.** The difficulty note and the effect example no
  longer use "exposure" as a player term, the "read it aloud" rule no longer
  says to cut, and a new line says budgets never beat meaning. The README and
  the pattern guide were updated to match.
- **Arrangement and card terms traced and rewritten.**
  - Aircraft is now "Jet", with steps "charter jet booked", "crew hired",
    "fueled at Susana" and "ready to fly at Susana".
  - Reception is now "Welcome in Esmeralda", with steps "Esmeralda expects you",
    "Esmeralda's minister knows you are coming" and "Esmeraldan officials
    waiting at a border post".
  - Calls read "Call Duartē about the jet", "about your welcome in Esmeralda"
    and "about your visa".
  - "Passage card" is now "a way onto the freight", naming Holt's crate,
    Theo's walk through the yard and Nonā Rosa's grandson.
  - "Easier with" lists the actual cards that lower the roll instead of
    internal card kinds, and card corners show a plain kind ("A way onto the
    freight", "Political pull").
- **Hang up.** "Finish with the phone" and "Finish at the desk" are now "Hang
  up". One call already ended the phone step; one government request now ends
  the desk step the same way, so the button only matters when the player
  chooses not to call.
- **Gameplay backlog.** `docs/design-issues.md` now opens with a prioritized
  backlog in three tiers. One new item came from tracing the freight cards:
  Nonā Rosa's grandson card is discarded on arrival at Salta, the only place it
  works.
- **Deployment.** The live site serves the current `main` build (build stamp
  0f54d8c00c, matching commit 24d81a9), so the failing "Workers Builds" check
  does not block deploys. Its logs need a Cloudflare dashboard login, which
  this session does not have. The owner said not to pursue the previews.

**Checks:** content check 0 errors and 0 warnings; contract tests, both
tutorial replays and pbbg-check pass; the escape calibration output is
identical to before this run and the government calibration is unchanged;
both sides played to round three in the browser with no page errors. A
click-through of the government demo in the browser stalls at the same step
on `main` and on this branch, so it looks like a problem with the test
harness rather than this change; it was not investigated further.
