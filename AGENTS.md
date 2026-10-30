# Coalition: instructions for agents

## Work on the active game only

Coalition is the game in `src/`, built into the root `index.html` by `tools/build.py`.
Read `docs/game-direction.md` before changing its design.

The owner explicitly excludes `legacy/` from Coalition development. Do not read,
search, edit, build, import, copy, link, compare or draw ideas from that directory
unless the owner explicitly requests work on the archived files themselves.
Keep searches scoped to active paths. Never use a repository-wide search that
includes `legacy/`.

Do not describe Coalition as a continuation, remake or redesign of an archived
game. Do not connect its characters, mechanics, story, tutorial, art or copy to
archived work. Historical AARs are records, not design requirements. Do not use
`docs/aar-last-freight-out*.md` or `docs/aar-narrative-architecture.md` for current
work. Earlier-build references in other AARs confer no authority to reuse them.

## Preserve the copy decisions

Read [the copy AAR](docs/aar-coalition-copy.md) before editing narrative,
instructions, tutorial text or the start screen. It records the owner's
Humanizer and plain-language requirements, the verification results and the
remaining browser check.

Do not restore deleted explanations, technical notes on player screens or
archive links as routine cleanup. Make a copy change to resolve a specific
player need while preserving the requirements and consequences. Keep the
archive exclusion unless the owner explicitly changes that instruction.

## Edit player text

Use [Humanizer](https://github.com/blader/humanizer/blob/main/SKILL.md) when writing
or reviewing game copy. Read its full rules before the first copy pass. Apply
[federal plain-language guidance](https://digital.gov/guides/plain-language) as well.
Use active voice, familiar terms, consistent labels and one instruction per sentence.
Check that shortening has preserved who acts, what they need and what follows.

- Give the player the action, requirement or consequence first.
- Keep instructions short. Explain a rule where it is needed; do not repeat it
  across the briefing, panel labels and tutorial step.
- Preserve names, costs, probabilities, conditions and consequences.
- Keep character dialogue distinct. Cut repetitive narration and forced sayings.
- Remove dramatic restatements, stock contrasts, forced lists of three and filler.
- Use English except for established names and occasional character speech.
- Use sentence case and American spelling. No em dashes, invented Nelôxi words
  or the phrase "load bearing."
- Keep build tools, implementation notes and editorial status out of player screens.
- Edit `src/`, then rebuild. Do not edit the generated `index.html` directly.

## Preserve the font mapping

The owner selected these faces after reporting that the game was hard to read:

- Little Grandad Fat: the Coalition title only.
- GC North Sans SemiBold: section, level and tutorial headings.
- Overbit Regular: the clock and compact numeric action details only. Never use it for headings, instructions or dialogue.
- GC North Sans Regular: dialogue, instructions, buttons, cards and status text.
- GC North Sans SemiBold: emphasis. Use Arial/sans-serif as the fallback for
  macrons missing from GC North Sans; preserve the spelling of names.

Keep reading text at least 16px and secondary text at least 14px. Use sufficient
line spacing and contrast. Route labels belong in responsive HTML, not scaled
canvas text. Do not restore narrow or decorative fonts for reading text.

Read [the typography AAR](docs/aar-coalition-typography.md) before changing this
mapping. Keep font-license headers in the generated CSS. Fonts and the austral
favicon must stay embedded so the game works offline.

## Check changes

For copy changes, run `python3 tools/build.py` and
`node tools/tutorial-check.js`. Check the built game in a browser, including the
start screen and tutorial. If editing strings in the simulation or data tables,
compare the seeded calibration results before and after. Copy edits must not
change the rules.
