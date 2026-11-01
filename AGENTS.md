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

## Difficulty is the owner's, and it stays hard

Owner, October 30, 2026: "no, games should be harder. You should be able to do
something boneheaded or ill advised and have your run end before it starts."
Police attention (the `exposure` variable in code) rising from 0 to 4 in the first five hours at the residence, the
bought border post, the hold ladder and a wrong destination ending on the apron
are all working as intended. Do not soften a rule because a harness win rate or
a first-round screenshot looks harsh. A balance change needs the owner's words
and a calibration before and after; see `docs/aar-hold-ladder-balance.md`.

## Player language comes first (owner, October 31, 2026)

This rule governs every player-facing string and overrides any shorter-is-better
habit. In the owner's words:

> Describe what is happening in the game as a player would understand it.
> Explain events, consequences, relationships and instructions in ordinary
> language. Don't expose internal simulation concepts, but don't invent new
> narrative facts to replace them either.
>
> 1. Preserve meaning. Never introduce characters, relationships, actions,
>    locations or causal explanations that aren't supported by the actual game
>    logic.
> 2. Explain the experience. Don't simply rename internal variables. Explain
>    what a mechanic means to the player and what happened as a result.
> 3. Separate information types. Narrative events explain what happened.
>    Instructions explain what to do. Statistics explain measurable game state.
>    Don't mix them together or assume that a number explains itself.
>
> The objective isn't to make the game sound simpler. It's to make the game
> understandable without requiring players to understand its implementation.

How to work under it:
- **Trace before you write.** Find the code or data that produces the string
  and what the mechanic does, then write the explanation. If you cannot
  establish the meaning from the code, flag it; do not guess.
- **Preserve mechanics.** A copy edit never changes a rule. When a name or
  label disagrees with the code, record it in
  [docs/design-issues.md](docs/design-issues.md) for the owner instead of
  rewording around it.
- **Player terms:** "police attention" (never "exposure", which the content
  check now rejects), "move" (never "approach"). There is no Deck screen:
  cards work in the background and show as short notices (owner, Oct. 31,
  2026). Never ask the player to manage or play a card.
- **Dice:** one 20-sided die. Difficulties in `src/data.js` stay on the old
  six-sided scale and `Data.DICE.target` converts them; show targets and
  chances from the view, never a promise that a move will work.
- **Place names sound like places** you could travel to, and none is named
  after a person. Owner, Oct. 31, 2026: "Crucial that all place names sound like
  place names and ARE NOT named after humans. Do not follow canon to do this, I
  am the author." Renamed that day: Esmeralda to Costamar (Costamaran), Baca to
  Cerro Alto, Susana to Portalba, Santa Laura to Pedra Branca, Atlanta to
  Altamira, Tarun to Ardésia, Zaryanova to Nordavia, Gannibal to Krasnomor. Nov. 1, 2026: Lāyūna to Lagoa Funda.
  Internal ids keep the old names.
- **The opponent is "the police"**, never Sosā. Owner, Nov. 1, 2026: "no one knows who Sosā is ... it's too confusing for people," then "Just say police or cops, the precision isn't required." Use a plural verb ("the police act once during these three hours"). Where one person is needed, say "the police inspector" (the phone shows "Police"). Internal ids keep `sosa` and `enemy`.
- **Endings** read "You win" or "You lose", then the reason in a full sentence.
- **Every clock says whose it is.** Owner, October 31, 2026: "whenever a number
  appears with a unit of time, tell the player whose clock it is and what
  happens when it runs out." The vocabulary is fixed: the escape deadline
  (Tuesday 2 p.m.), when the police act again, how long a move takes, and the chance
  of success. Chance and duration are separate facts on separate lines.
- **Budgets never beat meaning.** The checks cap buttons at six words and keep
  interface labels to one sentence. When an explanation does not fit, put it in
  the preview, the briefing or the help where there is room, or flag it. Never
  cut a meaningful fact or consequence to pass a budget.
- The traced audit of every string is in [docs/text-audit/](docs/text-audit/).

## Write microcopy like a person talks

Owner, October 31, 2026, after six rewrites of one screen. These are the faults
that kept coming back and the rule for each.

- One idea per sentence. "Asks for your visa once you move the family accounts to
  him" is three ideas chained; nobody says it. Write "He helps once the family
  accounts are his."
- Say who, then what they do, then the price, in that order, with a plain verb.
  Name the concrete thing (the family accounts, a letter), never the abstraction
  (terms, a price, a condition).
- No false titles: never "Banker Amādū Salek". The name, then what they are in its
  own clause or sentence.
- No couplets: a second sentence that restates the first is cut (restating, not
  explaining: a sentence that adds a fact or consequence always stays), and the content
  check (C15) fails the build on one in a label, status or result. A second sentence
  that adds a FACT stays, above all in an effect line. Owner, October 31, 2026, on
  "The jet is back, but people notice": "What are you trying to say? Tell me." The
  effect has to say what happens and why: "The crew comes back and the jet is ready
  again, but paying them on the apron gets you seen, and police attention rises by one."
- No label-and-value rows ("Who asks", "The catch", "News waiting: …"). Write the
  sentence.
- AP style: figures from 10, words below; "2 p.m.", "noon", "midnight"; "Sept.",
  "Oct."; no title case.
- Read it aloud. If you run out of breath, split it into two complete sentences;
  never drop a fact or consequence to make it shorter. A button is a verb phrase
  and a hint is one sentence.
- Tightening never breaks the grammar. Every line is a complete sentence with its
  subject, verb, and articles; no clipped fragments ("Needs the card"), no dangling
  modifiers ("ready again, unseen"), no phrases that are not English ("land to
  nothing"). Two short complete sentences beat one compressed one. Chicago for
  prose: serial comma, full sentences.
- Never patch a flagged sentence. Throw it away and write the thought again from
  nothing, then run the Humanizer rules and the checkers.

## Preserve the copy decisions

Read [the briefing and results AAR](docs/aar-round-briefing-and-results.md)
before changing the round briefing or either ending screen. Briefing lines are
built from live state; the government card must never state her real position.

Read [the copy AAR](docs/aar-coalition-copy.md) before editing narrative,
instructions, tutorial text or the start screen. It records the owner's
Humanizer and plain-language requirements, the verification results and the
remaining browser check.

Read [the dialogue AAR](docs/aar-coalition-dialogue.md) before adding or revising
character dialogue. It records how to show speaker lines in action results
without changing the game rules.

Do not restore deleted explanations, technical notes on player screens or
archive links as routine cleanup. Make a copy change to resolve a specific
player need while preserving the requirements and consequences. Keep the
archive exclusion unless the owner explicitly changes that instruction.

## Edit player text

Read the [content pattern specification](docs/content/patterns.md) and its
[source register](docs/content/source-register.md) before extending the content
system. The package that implements it is in [content/](content/README.md);
the migration record is [docs/aar-content-migration.md](docs/aar-content-migration.md).
Preserve current owner requirements; do not treat budgets as permission to
rewrite gameplay or character voice.

Player-facing wording lives in `content/coalition/`. Code asks for it by ID
(`T('id', values)`) and the page markup uses `{{c:id}}`. Do not write
player-facing prose into a `.js` file; rule C12 stops the build. Do not add
strings to `content/c12-baseline.json` or loosen `content/policy.json` to make an
edit pass. A policy change goes in its own commit with the owner's approval.

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
- Write claims flat and sure. Owner, October 30, 2026: "do not soften claims ever." This is
  a game, not a record of fact; a hedged sentence ("some", "about", "may") reads as a
  writer who does not know the game. Pick the number, state the rule, move on.
- Edit `src/`, then rebuild. Do not edit the generated `index.html` directly.

## Preserve the font mapping

The owner selected these faces after reporting that the game was hard to read:

- Little Grandad Fat: the Coalition title only.
- GC North Sans SemiBold: section, level and tutorial headings.
- Overbit Shadow Bold: the big clock on the scene and the interstitial clock, and nothing else. Owner, October 30, 2026, from a phone screenshot: the pixel faces are unreadable at small sizes, so the hours left, the inquiry's next move, odds and hour chips and the exposure number are all set in GC North Sans. Never use any Overbit face below the clock size, and never for headings, instructions or dialogue.
- GC North Sans Regular: dialogue, instructions, buttons, cards and status text.
- GC North Sans SemiBold: emphasis. Use Arial/sans-serif as the fallback for
  macrons missing from GC North Sans; preserve the spelling of names.

Keep reading text at least 16px and secondary text at least 14px. Use sufficient
line spacing and contrast. Route labels belong in responsive HTML, not scaled
canvas text. Do not restore narrow or decorative fonts for reading text.

Read [the typography AAR](docs/aar-coalition-typography.md) before changing this
mapping. Keep font-license headers in the generated CSS. Fonts and the austral
favicon must stay embedded so the game works offline.

## Keep the renderer boundary

`src/render.js` draws the scene with PixiJS 8 (`vendor/pixi.min.js`, pinned 8.21.0).
`ui.js` only calls its public functions: `start`, `still`, `runwayStill`,
`setState(s, gov)`, `enqueue`, `busy`, `float`, `dice`, `travel`, `enemy`, `ring`,
`pause` and `gameOver`. Keep that interface when changing the art. Pass the
government state as the second argument to `setState` in that mode; the scene then
shows the suspected stop and the search team and must never show the candidate's
real position, people or arrangements. Keep the 2D fallback working for devices
without WebGL or WebGPU, and keep people above the bottom strip of the scene (`GROUND`). The level heading sits in the panel at every width, not on the scene.

## Check changes

For copy changes, run `python3 tools/build.py` (it parses the sources and runs
the content check first), `node tools/tutorial-check.js`,
`node tools/gov-tutorial-check.js`, `node tools/contract-tests.js` and
`node tools/pbbg-check.js` (the owner's standalone checker from
`quarterback/pbbg-content-schema`, cloned beside this repo; its policy is
`tools/pbbg-policy.json`). Every new string gets the Humanizer and plain-language
pass before it ships, including strings copied from a design mockup.
After a colour, layout or type change, run `node tools/contrast-check.js`
(once: `cd tools && npm install`). It must report zero WCAG AA failures. Check the built game in a browser, including the
start screen and tutorial. If editing strings in the simulation or data tables,
compare the seeded calibration results before and after. Copy edits must not
change the rules.
