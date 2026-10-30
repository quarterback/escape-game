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

## Check changes

For copy changes, run `python3 tools/build.py` and
`node tools/tutorial-check.js`. Check the built game in a browser, including the
start screen and tutorial. If editing strings in the simulation or data tables,
compare the seeded calibration results before and after. Copy edits must not
change the rules.
