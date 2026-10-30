# Agent Action Record: Coalition, the full-run skeleton

**Review date:** 2026-10-30
**Reviewed by:** the agent that did the work, for the owner to amend
**Agent / system:** Claude Code (cloud session), model claude-fable-5-1
**Task or period under review:** Coalition, the full-run skeleton
**Accountable human (name or role):** the repo owner (quarterback)
**Branch:** `claude/vigilant-noether-rmcm7h` (restarted from `origin/main` after the prototype's PR merged)

---

## 1. Intent — what was supposed to happen

**Instruction given (actual wording):**

The owner, after the prototype was merged and `docs/game-direction.md` landed:

> this is where you went severely wrong by not reading what was already on the repo relative to what i wanted the game to do

followed by the article table (several people deliver different parts of the escape; preparation
overlaps with travel; each level is the local problem plus the continuing arrangements; cards are
specific help; dice test arrangements; one border crossing near the end, then the jet). Then, in
plan mode, four answers: full run skeleton with thin levels; choose a man or a woman; fold the
Salta town in as a level; Atlanta as the destination (after rejecting Zaryanova and Tarun in
favor of the African bloc). Then:

> Build the full journey, but make its depth come from relationships, competing commitments, and useful combinations of help. Keep routine bookkeeping light. Give enemies concrete actions, make wealth and influence useful but limited, and let earlier choices change how later levels can be solved.

> money isn't important because he has all the money he needs to leave, what he needs are connections, relationships and to push the right levers, there's no going bankrupt here or running out of money. but there are people you can try to bribe that can't be bribed, there are situations money can't get you out of and places where your power isn't recognized

> i want to be able to see it sooner than later ... the goal is to see the levels and how it works to test the mechanics

**Success defined in advance as:**

A playable end-to-end run of the confirmed structure, thin enough to change, visible soon. No
balance target, no art target.

**Authority granted to the agent:**

Build on the named branch and push. The plan was approved in plan mode. Pull requests not asked for.

**Out of scope:**

Final level content, art, a tutorial, balance, and any writing into quarterback/kels beyond the
Esmeralda file already pushed there.

## 2. Action — what actually happened

**What the agent did (step by step, from logs where available):**

1. Read the four COALITION reports in quarterback/docs, the game-direction file, and the changes
   other sessions made to the prototype (start screen, tutorial, copy rules).
2. Checked kels for the destination. Zaryanova is written as outside the Nelôxi world; Tarun is
   aligned but Asian; Atlanta is "the safe place" where the region's notables keep wealth and
   family. Put the choice to the owner, who chose Atlanta after asking about the African bloc.
3. Moved the prototype to `legacy/last-freight-out/` (still builds there).
4. Wrote `src/data.js`: two characters with siblings abroad, ten allies with reliability and terms,
   one named enemy with six concrete actions, four continuing arrangements with staged promises,
   eleven cards, six levels with three or four approaches each, dice numbers and consequences.
5. Removed the money resource when the owner ruled it out. Paying stayed as approaches that work
   on people who take money (a taxi cousin, Holt, a fuel agent), fail on a company man (the
   yardmaster, die needs 7) and depend on who is on the barrier (the border post).
6. Wrote `src/sim.js`: actions (approaches, calls, messages, wait), commit with a visible die,
   delegated jobs that resolve on an ally's reliability, commitments that come due, the enemy turn
   every four hours, exposure that climbs while the inquiry looks in the right place, and two
   end states.
7. Wrote `tools/calibrate.js` and ran 300 seeds per character.
8. Wrote the renderer (six scenes, the route with "you" and "they think" markers, dice, badges),
   the HTML layer, styles, audio, the build script. Fixed a `display:flex` rule that kept the
   start screen over the game.
9. Ran the built page in headless Chromium through the first level: no errors, no network.

**What it produced or changed:**

`index.html`, `src/*`, `tools/*`, `README.md`, this record, and the prototype's move to `legacy/`.

**Where actual behavior differed from the instruction:**

The owner asked to see it sooner than later. The first design draft had a money counter and more
systems than needed; the owner's two mid-build messages cut both. Nothing else was asked for and
not done, except that the practice-night tutorial from the prototype was not carried over.

**Stayed within granted authority? (yes / no / unknown):**

Yes. One branch, no PR, no kels changes in this pass.

## 3. Judgment — human in the loop

**Decisions the agent made on its own:**

- The six-level sequence and every approach, die number, hour cost and consequence.
- Who takes money and who does not; which allies can be pressed; the enemy's six actions and
  their weights; the four-hour enemy cadence; exposure 10 and 72 hours as the limits.
- The two characters' names and biographies, built from kels name patterns.
- That the party's influence stops counting at the border (Esmeralda), and that the Nelôxian
  civil-name record is the second document (from kels `world/names.md`).
- Dropping the tutorial for this build.

**Of those, which should a human have made or seen:**

The sequence and the ending are the owner's to confirm; the direction doc says the list is not a
campaign. The "influence stops at the line" rule and the civil-record document are world-rule
choices the owner may want to reverse. Both are one line each in `src/data.js` or `src/sim.js`.

**Where a human actually intervened (approve / edit / override / redirect):**

Stopped the build to verify direction; answered four plan questions; redirected the destination
toward the African bloc; removed money as a resource; asked for a visible build over a deep one.

**Points where it should have escalated and didn't:**

None in this pass. The earlier failure (not reading quarterback/docs) is recorded in the
prototype's record.

**Accountable for these actions:**

The owner for the direction and the canon; the agent for every number and name in `src/data.js`.

## 4. Deviation — the gaps

**Gaps between intent and action, and why:**

- "Useful combinations of help" exists as additive die bonuses from card tags (decoy plus
  information, document plus introduction, vehicle plus information). There is no combination
  that unlocks something new by itself. Root cause: thin by instruction; the hook is there.
- Reception rarely reaches "officials at the line" in the harness because Vélez must be called
  from Salta and the policy does not. A human will see the call appear; the policy is dumb.
- The two characters play identically. Different voice lines and allies were planned; only the
  sibling's name and gender differ so far.

**Good deviations (correct departures from a flawed instruction):**

Removing the money counter went further than "useful but limited": there is no counter at all,
and every money question became a question about a person, which is what the owner said the
game is about.

**Confidently wrong:**

None found in this pass. The first Chromium run failed on the start screen overlay; caught and
fixed before commit.

## 5. Consequence — what it cost or risked

**Actual outcome (did the work hold up):**

Builds, runs offline, plays end to end. Harness, 300 seeds each:

```
woman  win  53.3%  losses {"intercepted":103,"clock":37}     hours 37.7  exposure 6.5
       approaches in wins: 1:second_driver 233 · 0:partycar 196 · 5:depart 187 · 2:help_host 160 · 3:crate 160 · 4:pay_post 127 · 5:fuel_now 94 · 4:civil_doc 53 · 4:received 1
man    win  53.3%  losses {"intercepted":103,"clock":37}     hours 37.7  exposure 6.5
       approaches in wins: 1:second_driver 233 · 0:partycar 196 · 5:depart 187 · 2:help_host 160 · 3:crate 160 · 4:pay_post 127 · 5:fuel_now 94 · 4:civil_doc 53 · 4:received 1
deterministic: true
```

Half the runs get out. Losses split between being found (exposure) and the clock, which is the
intended pressure. Every level contributes approaches to winning runs.

**Harm / cost / risk — realized or narrowly avoided:**

Nothing deployed outside the branch. Risk carried: the dice numbers are untested by a person;
the first human run may find a level trivial or unfair. Risk carried: the direction doc warns
against turning an illustrative sequence into a campaign; this build is one sequence and reads as
one until a second is added.

**Downstream affected parties:**

The owner. Future sessions, which now have a data file to tune instead of code to rewrite.

**Expected failure if this run happened 100 times:**

Most runs would ship a playable skeleton. The common failure would be over-building: more
systems than the owner can test, which this run started to do until the owner cut it twice.

## 6. Change — what happens next

**What changes before the next run:**

Play it first; tune `src/data.js` from what is felt, not from the harness. Candidates the owner
may want: a card combination that unlocks an approach; a second level sequence so the run is not
one road; different allies per character; the tutorial.

**What to keep doing:**

All content in one data file. The pure sim with a harness. A browser run before every push.

**What belongs with a human rather than an agent:**

The level sequence, the ending, who can be bought, which world rules hold (influence at the line,
the civil record as a document), and the names.

**Signal that the change worked:**

The owner plays a run, changes one number in `src/data.js`, rebuilds, and the change does what
they expected.

## Addendum: the owner's fonts

The owner supplied licensed webfonts (two Kurdis kits uploaded, the rest pulled from a Dropbox
archive) and chose a mapping: Little Grandad Fat for the masthead, Kurdis Regular for titles,
Kurdis Condensed for the clock and the canvas HUD, Embro for running text. The fonts are
committed under `fonts/` with `LICENSES.md` and embedded by `tools/build.py` as base64
`@font-face` rules, the YouWorkForThem headers kept beside them as the licence requires. The
built page grew from 1.12 to 1.28 MB and still makes no network requests.

One correction to the mapping, mine to own: I recommended Embro as a body family without
reading its character set. fontTools shows 88 glyphs, no accented letters and lowercase drawn as
capitals, so a first build set every paragraph in caps and dropped to a fallback face on every
macron. Kurdis Regular (430 glyphs, every accent the names need) is the body face instead, and
Embro keeps the small all-caps section labels, where it looks like what it is. Little Grandad Fat
lacks macrons too, which the masthead words never use. All four families verified loaded in
Chromium through `document.fonts.check`.

## Addendum: the title screen, the guided run and the theme

The Coalition build shipped without the prototype's first-run demo, and the owner called that
out: a new player has to be able to do the demo. It is rebuilt on the same architecture as the
practice night, adjusted for a game whose variance lives in a die and an enemy rather than a
deck. `Sim.newRun` takes two optional queues, `dice` and `enemy`, consumed before the random
draw; that is the sim's whole knowledge of the demo. `src/tutorial.js` holds 20 steps, each
with an `allow` object (which approaches, calls and message options may be used), a `done`
test on the state, and highlights. Restriction is applied in the UI only, by dimming and
disabling what the step does not allow. The coach walks the residence, Santa Laura, the
colônia, Salta and the border on a scripted 5, 4, 5, 3, 6, 5 and three scripted inquiry moves,
then hands the airfield over live, because the airfield is hours of real waiting on allies
that a script would misrepresent. `tools/tutorial-check.js` replays the path against the real
sim and fails the moment a rules change breaks a step. A headless Chromium pass clicks through
the title, the start screen and all 20 steps, asserting that info steps expose no action and
act steps expose exactly one.

Two owner additions landed in the same pass. A title screen now comes first: a still of the
border at night rendered by the game's own renderer (`Render.still`), the title in Little
Grandad Fat, one green Start button. That press is the user gesture Web Audio needs, so it also
starts the theme, the owner's 115 BPM synthwave engine ported into `src/audio.js` on the game's
context and master gain with a fade, stopped when a run begins. And every piece of copy was cut
to plain language: shorter sentences, one idea each, no long-winded start blurb.

Two faults found by the browser pass, both in the UI: the Wait button stayed live on info
steps because its state was set only once an inspection was open, and the coach's Finish button
sat under the lower panels because the side column is capped at the scene's height. The coach's
buttons now sit above a scrolling body.
