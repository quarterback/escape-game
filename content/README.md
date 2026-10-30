# Coalition content package

Contract `coalition-content/0.5`. This folder holds the player-facing wording for
Coalition and the rules that check it. The design is in
[docs/content/patterns.md](../docs/content/patterns.md); rule IDs (P01 to P14,
C01 to C15) come from that document.

## What lives where

| File | Holds |
| --- | --- |
| `coalition/ui.json` | Interface catalog: every label, heading, status line, empty state, result and ending, each with a stable ID, a pattern and declared arguments |
| `coalition/markers.json` | Wording for effect markers. The rules choose the marker and its values; this file chooses the words. Both sides share it |
| `coalition/tutorials.json` | Both guided runs (P13): seed, scripted dice, steps, what each step allows and a declarative completion condition |
| `coalition/glossary.json` | Approved terms and prohibited aliases (C05) |
| `coalition/facts.json` | Facts that event conditions may test, in the pbbg-content-schema fact shape |
| `policy.json` | Prohibited phrases, allowed markup, length budgets and technical-string exceptions |
| `schema/` | JSON Schemas for each file, plus the shape of the rule records in `src/data.js` |
| `c12-baseline.json` | Prose still written into code. It is empty, and it can only shrink |
| `fixtures/` | Invalid packages; each must be caught by the rule it names |

The rule records (dispatch events, government events, holds) stay in
`src/data.js` with their mechanics. The check validates their shape and
effects, and gives each narrative field a content ID such as
`event.selfie.title`.

## Changing wording

1. Edit the entry in `coalition/ui.json` (or `markers.json`, `tutorials.json`).
2. Run `python3 tools/build.py`. The build runs the content check first and
   stops on any error.

In code, ask for wording by ID and pass the values the rules evaluated:
`T('scene.held_again', { hold: s.hold })`. In `src/shell.html`, write
`{{c:id}}` for plain text or `{{b:id}}` for text with `**bold**`.
Never write player-facing prose into a `.js` file: rule C12 fails the build.

## Checks

| Command | What it proves |
| --- | --- |
| `node tools/content-check.js` | C01, C02, C05, C06, C10, C11, C12, C13, C15 on the package and the code that uses it |
| `node tools/content-check.js --fixtures` | Each invalid fixture is caught by its rule |
| `node tools/contract-tests.js` | C03 shown costs match applied costs; C04 the government view ignores hidden state; C14 text-only changes preserve rules |
| `node tools/tutorial-check.js`, `node tools/gov-tutorial-check.js` | Both guided runs replay against the real rules |

`.github/workflows/content.yml` runs all of them on every push, and confirms
the committed build matches the sources.

## Known limits

- The checks cannot stop an agent from editing the checks. Visible policy
  diffs, CI and review are the controls for that.
- Conditions use the pbbg-content-schema shape (`ref`, `op`, `value`) against
  facts in `coalition/facts.json`. The engine evaluates them in `src/sim.js`;
  only `eq`, `gte` and `contains` exist, so a "less than" test is written as
  `gte` on a counting-down fact (`clock.hoursLeft`).
