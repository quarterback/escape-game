# Agent Action Record: Last Freight Out, first build

**Review date:** 2026-10-30
**Reviewed by:** the agent that did the work, for the owner to amend
**Agent / system:** Claude Code (cloud session), model claude-fable-5-1
**Task or period under review:** Last Freight Out, first build
**Accountable human (name or role):** the repo owner (quarterback)
**Branch:** `claude/vigilant-noether-rmcm7h`
**Commit:** `521e690` (game), this commit (record)

---

## 1. Intent — what was supposed to happen

**Instruction given (actual wording):**

The opening message was a list of constraints with no game named:

> Use p5.js for the interactive pixel-art scenes and route presentation. Keep dialogue, cards, resource descriptions, and controls in HTML/CSS. Include a pinned copy of the library in the delivered index.html. The finished game must make no runtime network requests. Selecting a card should reveal the people, objects, or arrangements it can affect. Let the player inspect those applications before committing. Resolve the game action first, then animate its consequences. Show pending work through the scene: occupied people, changing objects, available services, and completed arrangements. Keep simulation state independent of rendering and animation. Use native Web Audio for synthesized sound.

Three messages arrived while the build was running:

> if you look at my other repos, viperball, team-tennis-manager and hybrid-baseball you get a sense of how i like to structure these games and build them and can use those ideas in the mechanics potentially of this, you'll need to generate an aar using closedtab skill at the end of this run

> mostly from a game mechanics/economics perspective. capbuffet and tooling might be worth it, idk

Then, after the first push, two links with no other text: the npm page for `closedtab`, and `github.com/blader/humanizer`.

**Success defined in advance as:**

Not defined in advance beyond the constraints. The owner asked for a finished game that satisfies every line of the brief, with an AAR produced by the closedtab tool. No win rate, art style, length or theme was specified.

**Authority granted to the agent:**

The session runs autonomously with push rights to the named branch. The owner was not watching in real time, so the agent was expected to make routine calls itself and stop only for destructive or scope-changing actions. Pull requests were explicitly not to be opened unasked.

**Out of scope:**

Changes to the other four repos. Any runtime dependency. A pull request. Anything the owner would have to host or configure.

## 2. Action — what actually happened

**What the agent did (step by step, from logs where available):**

1. Listed the five repos. `escape-game` held only a README and a licence, so the brief was the whole spec.
2. Downloaded p5.js 1.9.4 from cdnjs (the pinned copy; the only network use, at build time) and checked its header.
3. Designed a game from the constraints: a seven-hour escape along five stations, a 17-card deck played on people, objects and places, four arrangements gating the route. Wrote `src/sim.js` as a pure module with no DOM or p5 access.
4. Ran the sim under a greedy policy across 400 seeds in Node. Found a 26% win rate with every loss to the clock. Lengthened the night to 16 and 18 half-hours and got the identical win count each time, which showed the policy was holding dead cards, not running out of time. Added a card swap to Wait. Same policy went to 53%.
5. Wrote the p5 renderer (320×112 pixel buffer scaled ×3, HUD at native resolution, hotspots for canvas clicks, an animation queue that only reads sim state), the HTML/CSS UI, and a Web Audio synth. Built one `index.html` with everything inlined.
6. Loaded it in headless Chromium: no errors, no non-file requests.
7. Read the two mid-turn messages. Searched all five repos for "closedtab" and "capbuffet"; neither string exists anywhere. Read hybrid-baseball's capspace AARs and the tennis repo's calibration conventions. Added three starting personas, bribe price inflation, localStorage career records and `tools/calibrate.js`.
8. The harness showed the Niece persona at 10.6%. Swept her purse and found that one favor, not more coin, was the lever (11% at zero favors, 49% at one). Set her at 8 coin, 1 favor, heat 1.
9. Re-tested in Chromium including a click on a highlighted figure in the canvas. Wrote the engineering AAR by hand in the hybrid-baseball format, stating that no `closedtab` skill existed. Committed and pushed.
10. On the npm link: installed `closedtab@0.5.0`, read its guide and template, and wrote this record in its form. On the humanizer link: fetched its SKILL.md and edited the prose of both documents against its patterns.

**What it produced or changed:**

`index.html` (1.1 MB, self-contained), `src/` (sim, render, ui, audio, style, shell), `vendor/p5.min.js`, `tools/build.py`, `tools/calibrate.js`, `README.md`, `docs/aar-last-freight-out.md` (engineering write-up with measurements), and this record. Two commits on the named branch. Nothing else in the world changed.

**Where actual behavior differed from the instruction:**

The instruction said to generate the AAR "using closedtab skill". The agent wrote the first AAR by hand and declared the skill nonexistent, because it only searched the session's skill list and the five repos. The tool is an npm package. The owner had to send the link.

**Stayed within granted authority? (yes / no / unknown):**

Yes. One push per request, to the named branch, no PR, no changes outside the repo.

## 3. Judgment — human in the loop

**Decisions the agent made on its own:**

- The whole game concept: theme, name, five characters, 17 cards, four arrangements, a 14-tick night, heat limit 8, every price and duration.
- Reading "capbuffet" as hybrid-baseball's capspace family and choosing which of its ideas to take (personas, non-rolling prices, career records) and which to leave (sellback, buy-ins).
- Adding the hand swap after the measurement, which changes how the game feels and was not in the brief.
- Tuning the Niece persona on the harness rather than asking what the owner wanted a coin-rich start to feel like.
- Putting the HTML "Still to arrange" list beside the canvas route bar, a small overlap with "route presentation in p5".
- Writing the AAR by hand instead of finding the tool.

**Of those, which should a human have made or seen:**

The game concept, before the build. A brief with no theme is a real fork: the owner's other games are sports management sims with deep economies, and an escape-room card game is one of many readings. In autonomous mode building something was the right default, but the owner should have seen a one-paragraph concept before 1.1 MB of it existed. Also the capspace reading: "capbuffet" was a guess that happened to be right.

**Where a human actually intervened (approve / edit / override / redirect):**

Redirect, twice mid-turn: point the mechanics at the other repos' economies, and use closedtab for the AAR. Then two bare links as corrections: the npm page, which overrode the agent's claim that the tool did not exist, and the humanizer repo, which set the prose standard for the documents.

**Points where it should have escalated and didn't:**

When "closedtab" matched nothing locally, the agent concluded it did not exist and said so in the deliverable. A tool named in an instruction is a fact to look up, not a hypothesis to test against five directories. One web or npm search would have settled it before the push. It should at least have asked.

**Accountable for these actions:**

The owner is accountable for the product and the branch. The agent is accountable for the mistaken "no such skill" claim and for every number in the game, none of which the owner has yet reviewed.

## 4. Deviation — the gaps

**Gaps between intent and action, and why:**

- The AAR was not produced with the named tool on the first pass. Root cause: the agent treated its own skill list as the universe of tools and did not search outside it, then wrote the negative result into the document as settled.
- The game's mechanics are the agent's, not borrowed from the owner's repos until the second message asked for that. Root cause: the first brief did not mention the other repos and the agent did not go looking for house style in sibling repos it had been given access to. The CLAUDE.md files for two of them were in context from the start, which was a hint it did not take.

**Good deviations (correct departures from a flawed instruction):**

- The brief says "resolve first, then animate". The agent also disabled the state-changing buttons while the animation queue drains, which the brief did not ask for, so a fast click cannot resolve a second action over a half-played first one.
- The brief asks for route presentation in p5. The agent duplicated the four arrangements as prose in HTML, because the canvas badge cannot carry a sentence of how-to text and the brief puts descriptions in HTML.
- Adding the hand swap. The brief did not mention it; without it the game is unwinnable from a dead hand, which the harness proved and a player would hit within a few nights.

**Confidently wrong:**

"No skill named `closedtab` exists in this session, and the string appears in none of the five repos, so this AAR is written by hand." True as stated, wrong as a conclusion, and written with no hedge into a committed document. The engineering AAR has been corrected.

A third, and the costliest: every character and place name in the first
build was invented. The owner's other repos include quarterback/kels, a whole
universe with a naming law, and the agent never looked. The first correction
then went to the wrong continent (Marīsô in Nelôxia instead of Valdória in
South America) because the agent matched the word "border" to the first
border city in the gazetteer instead of asking which country. Two rounds of
owner correction to reach the setting the owner had in mind from the start.

A smaller one: the first version of the browser-check paragraph explained a "60 min left" reading with arithmetic that did not describe what the test had done. Caught on re-reading the screenshot and fixed before commit.

## 5. Consequence — what it cost or risked

**Actual outcome (did the work hold up):**

The game runs offline with no errors, every line of the brief is implemented, the sim is deterministic and Node-testable, and the harness reproduces every number in the write-up. The owner has not yet played it, so whether the design holds up as a game is unknown.

**Harm / cost / risk — realized or narrowly avoided:**

Realized: one extra round trip for the owner to send the npm link, and a committed document that mis-stated the tool situation for the life of one commit. Risk carried: the owner may not want this game at all, in which case the whole build is a discarded sketch. Risk carried: the economy numbers were tuned against a deliberately weak policy; the game may be easy for a person.

**Downstream affected parties:**

Only the owner. Nothing deployed, no other repo touched, no network at runtime, no data leaves the browser.

**Expected failure if this run happened 100 times:**

Given the same empty repo and the same brief, most runs would produce a playable game that meets the constraints. The theme would vary a lot between runs, so perhaps a third would miss the owner's taste badly enough to be discarded. The "capbuffet" guess would land less often than it did here; a run that read it as something else would build the wrong economy. And without a rule to search beyond the local skill list, a good share of runs would again declare an unknown tool missing.

## 6. Change — what happens next

**What changes before the next run:**

When an instruction names a tool, skill or package the agent cannot find locally, search npm, GitHub and the web before claiming it does not exist, and if still unsure, ask instead of asserting. When a brief has no theme and the owner has sibling repos, read their CLAUDE.md and AARs first and offer a concept paragraph before building.

**What to keep doing:**

Keeping the sim pure and loadable from Node, so a calibration harness can measure a change before it ships. Measuring before tuning: the dead-hand finding and the favor finding both came from the harness and both would have been guessed wrong by feel. Testing the built artifact in a real browser with a network monitor.

**What belongs with a human rather than an agent:**

The game concept and theme, and above all which country of the owner's world
it sits in and what the far side of the border is called (the Esmeralda
proposal in `docs/PROPOSAL-esmeralda.md` is the owner's to ratify). The feel targets for each persona. Whether the hand swap stays, since it changes the texture of a night. Any renaming of characters or places, per the owner's rule in the tennis repo that names are theirs to pick.

**Signal that the change worked:**

The next run that meets an unfamiliar tool name either uses it or asks, and never writes "does not exist" into a deliverable. The owner plays a night and either keeps the concept or replaces it, and the harness numbers still reproduce after whatever they change.
