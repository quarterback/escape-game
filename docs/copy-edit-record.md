# Coalition copy edit

Read [the full Agent Action Record](aar-coalition-copy.md) for the owner's
instructions, editorial decisions, verification limits and required follow-up.

## Scope

Shortened the briefing, tutorial, action descriptions, messages and status text.
Removed build notes from the start screen. Kept the rules, costs, probabilities
and tutorial order unchanged.

Applied [Humanizer](https://github.com/blader/humanizer/blob/main/SKILL.md), then
[Digital.gov plain-language guidance](https://digital.gov/guides/plain-language).
The second pass checked active voice, familiar terms, consistent labels and
instructions that name the action and its consequences.

Tutorial text fell from 894 to 512 words (43%). Static screen text fell from
298 to 173 words (42%). Counts include headings; the static count excludes
metadata and scripts.

## Future work

The root AGENTS.md requires these editorial checks and excludes archived games
from active development. README and game-direction links now point agents to
those instructions.

## Checks

- Rebuilt the self-contained index.html.
- All 20 guided-run steps pass against the simulation.
- Calibration results for 300 seeds per character match the pre-edit results.
- JavaScript syntax checks pass.
- Source diff has no whitespace errors. The generated file retains required
  font-license headers, including their existing whitespace.
- Browser validation could not run: Chromium was unavailable and the attempted
  installation returned invalid download archives. No browser verification is
  claimed for this pass.
