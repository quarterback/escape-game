# Language pass, Nov. 1, 2026: the brief every reviewer follows

**Owner's request:** "I need all of the language to be run against humanizer and AP style and UI style guides to ensure things make sense."

The reviews read the code and change nothing in the game. Each review writes one table; rewrites are applied afterward by a script that replaces the exact original text, so **the Original cell must match the current text exactly**.

## Read these first, in full

1. **Humanizer:** `/home/claude/humanizer/SKILL.md` (all 26 patterns, and its "When not to act" section).
2. **The repository's rules:** `/home/claude/escape-game/AGENTS.md`, especially the sections "Player language comes first", "Write microcopy like a person talks" and "Edit player text". **Never read anything under `legacy/`.**
3. **The interface guides:** `docs/content/patterns.md` (patterns P01 to P14 and the cross-pattern rules) and `docs/content/source-register.md` (Atlassian, GitLab Pajamas, Microsoft Fluent 2, Mailchimp, Digital.gov plain language).
4. **The earlier traced audit:** `docs/text-audit/method.md` and the table for your area in `docs/text-audit/`. Use it to find what each string means, but check it against the code, which has changed since.

## The owner's player-language rule (verbatim, governs everything)

"Describe what is happening in the game as a player would understand it. Explain events, consequences, relationships and instructions in ordinary language. Don't expose internal simulation concepts, but don't invent new narrative facts to replace them either.
1. Preserve meaning. Never introduce characters, relationships, actions, locations or causal explanations that aren't supported by the actual game logic.
2. Explain the experience. Don't simply rename internal variables. Explain what a mechanic means to the player and what happened as a result.
3. Separate information types. Narrative events explain what happened. Instructions explain what to do. Statistics explain measurable game state."

**Trace before you write.** For every string, find the code that shows it and what the mechanic does. If you cannot establish the meaning from the code, mark it UNKNOWN and say why. Do not guess.

## What the three guides mean for this pass

**Humanizer.** Look for every one of its patterns. In game text, the common ones are:
- "Not X but Y" frames and staged contrasts;
- one-line dramatic closers;
- sayings that sound deep;
- forced lists of three;
- repeated sentence openings;
- stacked qualifiers;
- passive voice that hides who acts;
- overused AI words;
- inflated significance;
- shallow "-ing" riders;
- a heading repeated in the first sentence;
- re-explaining what the player already knows.

Also apply the owner's own tells:
- **Couplets:** a sentence balanced on one "and" between two actions, "X, then Y" pairs, or matching parallel clauses.
- **Clipped beats:** runs of short sentences that each land a beat. Connected prose with varied sentence length is better.

**AP style.**
- Figures from 10 up, words below; "2 p.m.", "noon", "midnight"; "Oct.", "Sept."; percentages as figures with "%".
- Sentence case everywhere, with no title case in labels.
- American spelling and straight quotes.
- No em or en dashes. Never the phrase "load bearing".
- Prose uses the serial comma, as AGENTS.md says ("Chicago for prose").

**Interface guides.**
- **Buttons** are specific verb phrases in sentence case, with no end punctuation, at most 6 words.
- **Interface strings** are one sentence. That covers patterns P01, P02, P04, P05, P06, P10, P11, P12 and ids starting `hint.`. Note: "p.m." counts as a sentence break for the checker, so prefer "at night" or "in the morning".
- **Blocked actions** say what is missing and how to get it.
- **Results** say what happened and what changed.
- **Empty states** say what will appear.
- **Navigation** is factual.
- **No instruction depends on screen position or color alone.**
- **Terms stay consistent:**
  - "police attention", never "exposure";
  - "move", never "approach";
  - "travel ban", "second passport", "entry visa";
  - no "Deck", because cards now work in the background.

## Facts that changed since the earlier audit (use them, do not contradict them)

- **One 20-sided die** for every roll. A 1 always fails, a 20 always succeeds. Moves show "Roll N or higher (P% chance)". Three moves have no roll: calling contacts and sleeping at Nonā Rosa's, and the road to Salta once arranged.
- **Cards work in the background.** There is no Deck screen. A notice appears when a card is given, lost, or makes a roll easier. The player never plays or manages a card.
- **Each stop has its own screen,** "Stop N of 6", that leaves on its own. Rounds advance on their own, with no "Continue" buttons.
- **"Call your contacts" at Nonā Rosa's can be used once per run.**
- **Places were renamed by the owner today.** Each place now sounds like a place, and none is named after a person:
  - Costamar (adjective Costamaran) is the neighboring country;
  - Cerro Alto is its capital;
  - Portalba is the port town with the airfield;
  - Pedra Branca is the town on the road south;
  - Altamira, Ardésia and Nordavia are the destination countries;
  - Krasnomor is Nordavia's city.

  Do not propose renaming places. Do flag any place name that still reads as a person.
- **The police:** Inspector Sosā runs the search. Interface text says "the police" where it can; dialogue may use his name.
- **The escape deadline is Tuesday at 2 p.m.,** when immunity ends. Whenever a number with a unit of time appears, the player must be able to tell whose clock it is.
- **The owner does not want outcomes promised in advance.** No "this will work", "guaranteed" or "cannot fail" in interface text. Flag existing cases instead of fixing mechanics.

## Hard limits

- **Never shorten at the cost of meaning.** The owner has corrected this many times. A fact, cost, condition or consequence is never cut to pass a budget. If a clear rewrite cannot fit, propose it anyway and mark it NEEDS-BUDGET.
- **Keep it when it is fine.** A string that already meets every rule is KEEP with a blank Proposed cell. Do not rewrite for taste, and do not add words. The owner finds the game too wordy.
- **Keep character voice.** Dialogue keeps its character's voice. Fix only clear errors (dashes, title case, AP numbers, an outright Humanizer tell, or a line that does not make sense).
- **Keep every `{placeholder}` exactly.** Never change ids. Never change a rule. Record a mismatch between a label and the code as a design inconsistency.
- **No new narrative facts,** no new characters, and no invented causes.
- **No eyebrow labels and no label-and-value rows** ("Who asks: …"). Write the sentence.

## Output

Write ONE markdown file at the path in your task. Use exactly this table, six columns, one row per string, covering every string in your scope (do not sample):

| Location | Original | What the code does (file:line) | Problem (guide and pattern) | Proposed | Status |

- **Location:** the catalog id (for example `sim.preview.no_roll`), the marker code, the tutorial step (`tutorial.escape.relationships body`), or a `src/data.js` path (`LEVELS.salta.approaches.crate.text`).
- **Original:** the exact current text, with pipes escaped as `\|`. Strip nothing.
- **Problem:** name the guide and the pattern, for example "Humanizer 6, forced triad", "AP numbers", "Interface: button over 6 words", "Makes no sense: …". Leave it blank for KEEP.
- **Status:** REWRITE, KEEP, NEEDS-BUDGET, UNKNOWN or FLAG.

After the table, add:
- **"Design inconsistencies":** one bullet each where a label or text disagrees with what the code does, with file:line.
- **A count line:** rewrites, keeps, flags, unknowns.
