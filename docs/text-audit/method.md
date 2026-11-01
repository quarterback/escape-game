# Text audit method (the brief each audit followed on October 31, 2026)

The audits read the code and changed nothing; rewrites were applied afterwards.

## The owner's rule (Ron Bronson, verbatim)
"Describe what is happening in the game as a player would understand it. Explain events, consequences, relationships and instructions in ordinary language. Don't expose internal simulation concepts, but don't invent new narrative facts to replace them either.
1. Preserve meaning. Never introduce characters, relationships, actions, locations or causal explanations that aren't supported by the actual game logic.
2. Explain the experience. Don't simply rename internal variables. Explain what a mechanic means to the player and what happened as a result. A player should understand a sentence without knowing the underlying simulation.
3. Separate information types. Narrative events explain what happened. Instructions explain what to do. Statistics explain measurable game state. Don't mix them together or assume that a number explains itself.
Before rewriting anything, trace each piece of text back to the code or data that generates it. Establish what the underlying mechanic actually means. Then write the player-facing explanation. Flag anything whose meaning you cannot establish from the code. Don't guess. The objective isn't to make the game sound simpler. It's to make the game understandable without requiring players to understand its implementation."
Also: "Preserve the underlying mechanics unless we explicitly decide a mechanic itself needs changing. Don't simplify by removing meaningful information. Keep a record of any inconsistencies between the action names, status labels, and actual mechanics. Those are game design issues, not copywriting issues."

## Known game facts (traced already; use, do not contradict)
- Runs last 72 hours, Saturday 2 p.m. to Tuesday 2 p.m. At 72 the candidate's immunity is gone and Esmeralda closes the airfield: escape side loses, government side wins.
- "Exposure" (s.exposure, 0 to 10): rises 1 every 2 hours while Sosā's search (s.belief) is on the player's stop (every 4 at Salta and on the government side), when a search finds the player close, and through some move/hold costs. At 10 the police stop the player (climbHold in src/sim.js) and it resets to 4. Stops climb a ladder: 1 stopped and questioned, 2 held at the station, 3 house arrest (house arrest ends the run unless the climb-out roll works). Twelve quiet hours drop the ladder one step. After Monday noon the first stop starts at the station. In Esmeralda a stop only happens once Valdória has asked Esmeralda (flags.asked) and only at step 1. Proposed player term: "police attention".
- Sosā's search location is s.belief (escape side) / g.belief (government side: where your search is aimed). Search order: if she is there and exposure >= 7 she is stopped (hold); otherwise exposure +1 and "they are close".
- Travel ban (flags.restriction): border crossing rolls need 1 more unless she holds a 'delay' card. Set when the Circulate order succeeds, by Sosā's circulate action, or at Monday noon.
- Reception stages: 1 "Esmeralda expects you" unlocks "Take the road to Salta" at Nova Trentô; stage 2 cancels the +2 takeoff penalty that applies once Valdória has asked Esmeralda; stage 3 makes the crossing at the escort post nearly certain (dc 1).
- Departure at Susana needs aircraft stage 4 (ready at Susana) and visa (permission stage 2); "Depart without the visa" is harder and if the destination does not accept her she is sent back (lose, kind 'landed').
- Reports on the government side carry r.hour = arrival time (event hour + delay), not sighting time; some reports are misleading (decoys).

## Open decisions: do NOT resolve these; mark any affected string FLAG-n and leave it
1. Results "checks" measure where the search was aimed at each order, not where people went.
2. "Decoy cost you" claims a cause the game doesn't track.
3. Travel ban confirmation has no mechanical effect (restriction is already on when Circulate succeeds).
4. "Esmeralda holds her" request does not hold her (it sets flags.asked: harder takeoff, one possible stop in Esmeralda).
5. The Jet marker sits at Susana before the plane is ready.
6. Monday noon effects are not shown on the briefing.

## Writing constraints
- American English, sentence case, AP numbers (figures from 10, words below; "2 p.m.", "noon", "midnight"). No em or en dashes. Never the phrase "load bearing". Straight quotes. Keep macrons on names. No invented Nelôxi words.
- Keep every {placeholder} exactly. Do not change ids.
- Budgets from content/policy.json: P01 buttons at most 6 words; interface strings (patterns P01, P02, P04, P05, P06, P10, P11, P12 and ids starting hint.) are ONE sentence; objectives at most 2 sentences and 18 words. If a clear rewrite cannot fit the budget, still propose it and set Status to NEEDS-BUDGET.
- Character dialogue keeps its voice; do not flatten it. Rewrite narration and interface text.
- Unchanged is fine: if a string already meets the rule, Status KEEP and leave Proposed blank.

## Output
Write ONE markdown file at the path given in your task. Sections:
1. A table with columns: Location (catalog id, or src/data.js path like LEVELS.residence.approaches.decoy.text) | Original | What the code does (with file:line) | What the player needs | Proposed | Status (REWRITE, KEEP, FLAG-n, UNKNOWN, NEEDS-BUDGET).
   UNKNOWN = you could not establish the meaning from the code; say why in the mechanic column.
2. "Design inconsistencies": each case where an action name, status label or text disagrees with what the code does. One bullet each: what it says, what the code does, file:line.
Escape pipe characters inside cells as \|. Cover every string in your scope; do not sample. Finish with a one-line count: rewrites, keeps, flags, unknowns.
