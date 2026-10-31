# Agent Action Record: Coalition character-dialogue pass

**Review date:** 2026-10-31  
**Reviewed by:** Agent self-review; owner approved the scope and dialogue beats in chat  
**Agent / system:** Replit  
**Task or period under review:** First focused dialogue pass for the active Coalition game  
**Accountable human (name or role):** Game owner  
**Base commit:** [24d81a9](https://github.com/quarterback/escape-game/commit/24d81a990114dbf73262d625494778074fb7b7f4)  
**Implementation commit:** [335ca90](https://github.com/quarterback/escape-game/commit/335ca90df44d2afdf601b0c0b7437dcb7255277b)  
**Pull request:** [quarterback/escape-game#18](https://github.com/quarterback/escape-game/pull/18)  
**Implementation branch:** `copy/coalition-character-dialogue`

## 1. Intent — what was supposed to happen

**Instruction given (actual wording):**

> the text n this game is really lacking and i need help

**Direction chosen by the owner:** Focus on character dialogue.

**Approval:** The owner approved the proposed two-scene dialogue pass. It covers Nando's successful decoy and Nonā Rosa's truck outcome, with success and setback versions for the truck.

**Additional instruction:** Record what changed and how future agents should continue this work.

**Success defined in advance as:** Give Nando and Nonā Rosa distinct, clear lines at the approved outcomes; show the lines in the immediate result; keep the simulation rules unchanged; rebuild and run the repository checks; leave a durable record linked from `AGENTS.md`.

**Authority granted to the agent:** Make the approved copy pass, save it on a separate branch and open a pull request. Do not write directly to `main`.

**Out of scope:** Other scenes or characters, new story events, changes to costs, odds, effects, time, balance, or the archived `legacy/` game.

## 2. Action — what actually happened

**What the agent did:** Read the active game instructions, existing copy AAR, content patterns and Humanizer rules. Replaced narrator summaries in the two approved scenes with direct, outcome-specific character speech.

**Dialogue added to `content/coalition/ui.json`:**

- Nando, decoy success: “They followed the decoy. The service lane is clear. Go now.”
- Nonā Rosa, truck released: “They released the truck. My cousin can take you to Salta. I won't talk about your visit.”
- Nonā Rosa, truck setback: “It came back at dawn, late and dented. My cousin can still drive you to Salta.”

**What it produced or changed:**

- Added the three lines as `P07` dialogue entries with speaker metadata.
- Changed `src/sim.js` to select the right catalog line for the matching approach outcome and emit it as a speaker event. The line is marked as featured for the result summary.
- Changed `src/ui.js` to show only featured character speech in the immediate result, labeled with the character's name. The normal dialogue log also receives the speaker event.
- Removed the now-unused narrator `say` strings from those three effects in `src/data.js`. The belief, exposure, card, trust and time effects remain unchanged.
- Added Nando and Nonā Rosa to the speaker entity registry in `tools/pbbg-bundle.js`, so the standalone schema checker can validate the new speaker references.
- Rebuilt `index.html` and `sw.js` from source.
- Linked this record from root `AGENTS.md`.

**Where actual behavior differed from the instruction:** The pass also changed result-summary presentation so the new character lines are visible without opening the collapsed log. It added entity declarations required by the content checker. No gameplay rules were intentionally changed. The work remains on a separate branch for review.

**Stayed within granted authority?** Yes, agent self-assessment.

## 3. Judgment — human in the loop

**Decisions the agent made on its own:** Used the existing decoy outcome and clear service-lane escape for Nando's line. Used the truck card, the cousin's drive to Salta and the existing privacy promise for Nonā Rosa's lines. Kept the two voices direct and practical rather than adding jokes, slogans or extra backstory.

**Where a human actually intervened:** The owner chose character dialogue, approved the proposed scenes and dialogue pass, authorized a branch and PR, and asked for this AAR.

**What still needs human judgment:** Whether these voices sound right in play and whether the revised result feels more specific without being too explanatory. The owner should review the PR and, ideally, have a first-time player try the scenes.

**Points where it should have escalated and didn't:** None identified.

**Accountable for these actions:** Replit for the edits and verification claims; the game owner for creative direction and approval.

## 4. Deviation — the gaps

**Gaps between intent and action, and why:** No browser playtest or first-time-player comprehension test was performed. Build and simulation checks do not establish that the result card looks right on every screen or that players understand the dialogue.

**Checker issue resolved:** The first standalone schema check rejected `nando` and `host` because those speaker IDs were missing from the bundle's entity registry. The agent added the two person entities and reran the checker successfully. The schema checkout also needed its `ajv` package available; it was installed in the workspace, not added to the game project's dependencies.

**Confidently wrong:** No simulation change was found by the checks. No claim is made that the prose has been validated with players.

## 5. Consequence — what it cost or risked

**Actual outcome:**

- The build reports zero content errors and zero warnings.
- `node tools/tutorial-check.js`, `node tools/gov-tutorial-check.js`, `node tools/contract-tests.js` and `node tools/pbbg-check.js` pass.
- Targeted simulation checks emit the approved Nando success line and both Nonā Rosa truck lines under the correct speaker IDs.
- Contract tests report 708 recorded actions across 18 seeded runs unchanged when every narrative and interface string is altered.
- `node tools/calibrate.js 300` matches the pre-edit output for both roles: 32.0% wins for woman and 31.3% for man, with the same losses, hours, exposure, holds and approach counts. Determinism passes.
- JavaScript syntax checks and `git diff --check` pass.
- Browser rendering and player comprehension remain unverified.

**Harm / cost / risk:** Direct speech can sound false if it claims knowledge the character does not have. The result-summary change affects only lines explicitly marked `featured`; do not mark every dialogue event featured without reviewing how that changes the interface.

**Downstream affected parties:** Players, the game owner and future contributors working on Coalition dialogue.

## 6. Change — what happens next

**Specific instructions for the next dialogue pass:**

1. Read root `AGENTS.md`, `docs/game-direction.md`, `docs/aar-coalition-copy.md`, the content pattern specification and this AAR. Keep the `legacy/` exclusion.
2. Ground each spoken line in the existing scene, character knowledge and actual outcome. Keep character voice distinct, sentences complete and consequences accurate.
3. Put new player-facing text in `content/coalition/ui.json`, use a stable `sim.line.*` ID, pattern `P07`, and the correct `speaker` ID. Do not put new prose in JavaScript.
4. Emit dialogue through the existing speaker event flow with `T(id)`. Use `featured: true` only when a new line should appear in the immediate action result; the UI labels it with `Sim.personName`.
5. If a new speaker ID is added, declare it in `tools/pbbg-bundle.js` as well as using it in the game. The PBBG checker validates speaker references against that entity list.
6. Preserve effects, rolls, costs, cards, trust, exposure and time. If a catalog line replaces an old effect `say`, remove only the superseded text and leave the effect data intact.
7. Rebuild with `python3 tools/build.py`; run both tutorial checks, contract tests and `node tools/pbbg-check.js`. For simulation or data-string changes, compare `node tools/calibrate.js 300` before and after. Add a targeted event check for each new outcome.
8. Treat browser review and a first-time-player tryout as separate checks. Passing automation does not prove the dialogue is clear or the layout is readable.

**Keep doing:** Keep dialogue specific to the actor and consequence, store it in the catalog, use the smallest presentation change that makes the line visible, and verify that copy edits leave game rules unchanged.

**Signal that the change worked:** Players see who is speaking, understand what happened and what they can do next, and the same lines remain tied to the same outcomes without changing the underlying simulation.

## References

- [Root agent instructions](../AGENTS.md)
- [Coalition copy AAR](aar-coalition-copy.md)
- [Content pattern specification](content/patterns.md)
- [Humanizer rules](https://github.com/blader/humanizer/blob/19fc634208e8cc6ae55d4ff287152583216fd244/SKILL.md)
- [Digital.gov plain-language guide](https://digital.gov/guides/plain-language)
- [PBBG content schema](https://github.com/quarterback/pbbg-content-schema)
