# Agent Action Record: content structure migration and the government tutorial

**Review date:** 2026-10-30
**Agent / system:** Claude (design session)
**Accountable human:** Ron Bronson, game owner
**Baseline commit:** 26aab93 (main with PR #5 merged into the game branch)

## Intent

The owner asked for the content structure migration described in
`docs/content/patterns.md` (PR #5), as the test implementation of his content
structure idea. He plans to write about it and later extract it as a separate
agent experience (AX) package. He also asked for a government tutorial.

## What was built

| Piece | Result |
| --- | --- |
| Interface catalog | 268 entries in `content/coalition/ui.json`, each with an ID, a pattern and declared arguments. 43 belong to the government side |
| Shared marker table | 41 marker codes in `markers.json`. The escape and government sides used to word their markers separately; both now draw from one table |
| Tutorials as content | Both guided runs in `tutorials.json` with declarative completion conditions. `src/tutorial.js` is now only an engine |
| Government tutorial | 12 steps on a fixed seed with scripted dice and one scripted news event |
| Validator | `tools/content-check.js`, findings in the format the spec asks for (rule ID, severity, file, content ID, field path, expected, observed, repair hint) |
| Fixtures | 14 invalid packages, one per failure type |
| Contract tests | C03, C04 and C14 in `tools/contract-tests.js` |
| Enforcement | The build parses every source file, then runs the content check, and stops on an error. A CI workflow runs everything and confirms the committed build matches the sources |

Patterns in the catalog: P02 navigation and headings 57, P10 results 47, P01
action labels 35, P05 arrangement status 31, P09 help cards 21, P06 reports 15,
P14 endings 14, P08 arrivals 12, P07 dialogue 11, P12 empty states 10, P03
previews 5, P04 blocked actions 4, P13 tutorial 4, P11 technical failures 2.

## Measured migration

The C12 check uses a small JavaScript lexer (`tools/lib/strings.js`) that reads
string and template literals and skips comments and regular expressions. A
literal counts as prose when, after markup is removed, it reads as words a
player sees.

| Source | Prose before | Prose after |
| --- | --- | --- |
| `src/ui.js` | 192 | 0 (4 technical strings declared in policy) |
| `src/shell.html` text nodes | 71 | 0 |
| `src/tutorial.js` | 39 | 0 |
| `src/sim.js` | 149 | 148, in the baseline |
| `src/gov.js` | 174 | 173, in the baseline |
| `src/render.js`, `src/art.js` | 35 | 35, in the baseline |

The narrative in `sim.js` and `gov.js` stays in the baseline. That follows
the spec's order: interface first, narrative later, effects in the simulation
for now.

## Behavior preserved

Before any change, I recorded a snapshot of every marker on every event
choice for both sides and both candidates, the escape tutorial's replay, and
both calibrations.

- Markers after the shared table: byte for byte identical.
- Escape tutorial replay after moving it to content: identical, step by step.
- Calibration: identical on both sides (escape 26.7% and 25.7%; government,
  the candidate escapes 64.0% of 200 harness runs).

## What the checks caught in the existing game

The validator's first run reported 7 errors and 1 warning.

- **5 real defects in the escape tutorial.** Steps highlighted `#arrangements`,
  `#enemy` and `#people`, panels removed in an earlier redesign. Those steps had
  been highlighting nothing. One step also told players to "Check
  Arrangements", a panel that no longer exists. Fixed: the highlights point at
  the route and the inquiry box, and the line now reads "The route shows when
  the reply is due."
- **2 false positives from my own schema.** I had required two choices per
  event; two events have one by design. I loosened the schema rule instead of
  changing the events.
- **1 warning** on a lowercase label fragment ("your visa"). The schema now
  marks fragments.

The browser check found one more existing bug: in government mode on a
computer, the inquiry box showed an empty "Exposure of 10" row. A desktop
style overrode the hidden state.

## Do the tests catch what they claim

Each contract test was run against a bug planted on purpose, then reverted.

| Test | Planted bug | Result |
| --- | --- | --- |
| C04 | The government view gained a field holding her real position | Caught: the view changed when only her position changed |
| C03 | The roll applied the face rule twice, one point above the shown need | Caught, naming the approaches: shown 4+, rolled 5 |
| C14 | A rule that added exposure when an event title contained "kitchen" | **Missed on the first try.** The perturbation wrapped each string but kept its words, so the regular expression still matched. I changed the perturbation to reverse every string; the planted rule was then caught |

All 14 fixtures are caught by the rule they name.

## Failures during the migration

Two of my own mistakes got past the content checks.

1. **A name collision.** I added a function called `release` to `gov.js` for
   ending the tutorial. The file already had a `release` that delivers pending
   reports, and the new one replaced it. Every hour that passed deleted the
   scripted event queue and dropped reports. The government tutorial replay
   caught it at step 8; the calibration would also have shown it. Renamed to
   `endTutorial`.
2. **A syntax error.** One scripted replacement put a template expression
   inside a single-quoted string. None of the content checks load `ui.js`, so
   only the browser found it: Start did nothing. The build and CI now parse
   every source file first.

## Against the spec

| Rule | Status |
| --- | --- |
| C01 IDs and declared patterns | Enforced: catalog, markers, tutorials, rule records |
| C02 references and arguments | Enforced: code calls, placeholders, tutorial actions, options, highlights, record effects, cards, people |
| C03 values from evaluated rules | Contract test, both sides |
| C04 role views | Contract test on the government view |
| C05 glossary | Enforced on 7 concepts |
| C06 action labels | Enforced: terminal punctuation is an error, case and length warn |
| C10 no markup injection | Enforced: `**bold**` and paragraphs only; the runtime escapes everything |
| C11 prohibited phrases | Enforced: em dash, en dash, "load bearing", curly quotes |
| C12 coverage | Enforced with a baseline that can only shrink |
| C13 editorial review | Tutorial instruction budget warns; the rest stays human review |
| C14 text changes preserve rules | Contract test, 565 actions over 18 seeded runs |
| C15 contract version | Enforced on every file |
| C07, C08, C09 | Not automated. C09 is covered by browser checks at phone and desktop sizes |

## Open

- Move the narrative in `sim.js` and `gov.js` into the package (P06 reports,
  P07 messages, P08 arrivals, P14 debrief). The baseline shows what is left.
- Three `cond` functions need declarative conditions or a documented adapter.
- Try a second package (spec step 6) before extracting the tooling.
- In both tutorials, read steps can appear while a result card is still open.
  The government tutorial's copy now tells the player to move on first. An
  engine option to hold a step until a phase opens would be cleaner.
