# Agent Action Record: the destination choice, the three border posts, the ledger

**Review date:** 2026-10-30
**Reviewed by:** agent self-review; owner review pending
**Agent / system:** Claude Code (cloud session), branch `claude/vigilant-noether-rmcm7h`
**Task or period under review:** Three owner directions: the border as a final boss with a bought post, trust as the game, and a destination choice that can be wrong
**Accountable human (name or role):** Ron Bronson, game owner

## 1. Intent — what was supposed to happen

**Instruction given (actual wording):**

> i feel like the over the border thing cold be a fun trick as a final boss … if you pick the wrong place to go in that country the border guards from the Esmeralda side are actually bribed from Valdorian officials who manage to get you detained long enough for time to run out.

> i also want to see more decisionmaking on who to trust v not, thats really the game

> the Altlanta thing is a confusing peice of narrativ architecture because it reads like Atlanta gerogia … I would pick a city in that country and use that … have other places like Tarun and or Meridian States as options and both of those options don't work out … you land -- ther'ed be a screen for this -- and you get taken into custody

> Coin working names for anything that's not currently available … remove any tells … so your 3 options are zaryanova, Tarun or Atlanta and you shuld have a screen as a first part of the game that shows the world map with the three points youCOULD go and where Valdoria is

**Success defined in advance as:** the plan the owner approved in the previous turn, with Esperanza as the departure strip rather than a destination, and the kels canon used for every name it holds.

**Authority granted to the agent:** edit, commit and push to the designated branch; coin working names where the canon is silent.

**Out of scope:** the government tutorial's content, the other agent's phase-turn interface.

## 2. Action — what actually happened

**Canon used, from quarterback/kels:** Lāyūna is Atlanta's capital (`world/atlanta-lore.md`, `saharannaise`). Gannibal is Zaryanova's capital and Pushkin its largest city (`world/zaryanova.md`). Esperanza, the former French Guiana, is the Meridian States' capital and its South American access (`world/meridian-states.md`). Tarun is the Turkic bloc with no capital named (`world/neighbor-states.md`). Valdória's capital is Portô Venla. The kels repo holds no map file; the world map on the new screen is a schematic drawn in code from rough coordinates of the real ground each country stands on.

**Working names coined, flagged for the owner:** Almatau for Tarun's capital. Three Esmeraldan border posts: Paso Huhūi rail post, Cumbre Alta road post toward Baca, Las Salinas crossing toward the coast. The Esmeralda lore marks town-level naming as open.

**The destination.** A map screen opens after the character choice (and before a daily run): Valdória, Esperanza, and the three cities, each with a blurb written to sound equally plausible. The player picks one. `Data.DESTS` records which country accepts; only Atlanta does. The player never sees that field. Salek's visa call goes to the ministry of the chosen country; for a country that did not agree the job comes back "still considering" every time and the visa stage never fills. Departing without the visa to such a country wins the die and loses the run: the landing text names the city and the officers on the apron, ending kind `landed`. All copy that named Atlanta as the destination now names the chosen city or none: Salek is "a banker abroad with ministries on his phone", the sibling is "abroad", the start blurb says "land somewhere that will have you". The tutorial's destination is fixed to Lāyūna and its step says so.

**Esperanza.** The final stop is the Meridian charter strip at Esperanza, with safe passage to fly and nothing more. The inquiry's request to hold goes to Esmeralda and the Meridian States.

**The border.** Three approaches, one per post. One post is bought at the start of each run (seeded, hidden). Vélez's people, when reception reaches its last stage, cover one of the other two, and her line names it. Crossing at the bought post without her people: the Valdórian die resolves honestly, then the Esmeraldan sergeant takes your passport into the hut and twelve hours go by, exposure up two. Crossing at the covered post is certain. The tutorial crosses at the rail post with the bought post fixed to the coast.

**The ledger.** Every call, delivery, failure and "still considering" is written to the run with the hour, and the route shows each ally's last two lines under their name. The contract tests already pin that nothing in the rules reads the wording.

**Checks.** Content check clean. All six contract tests pass; one needed the bought post to act after an honest roll rather than before it, which is also the better fiction. Both tutorial replays pass. Browser drive at phone width: title, start, map, all twenty tutorial steps through the renamed border step to Esperanza, reload and resume. The drive's government section, written before the phase turns landed, no longer matches that interface and was not repaired here; the government tutorial replay and harness stand in for it.

**Harness, 300 runs, simple policy, destination Atlanta:**

| | Before this change | After |
| --- | --- | --- |
| Teresā wins | 41.3% | 32.0% |
| Matēu wins | 45.0% | 31.3% |
| House arrests, Teresā | 79 | 104 |

The drop is the bought post: the simple policy picks a post by odds and walks into it a third of the time. Forty runs bound for Tarun: zero wins, fourteen landings, the rest lost earlier.

**Government harness, 200 runs:** 97 escapes, 38 arrests, 45 timeouts, 20 landings. The hidden candidate picks Atlanta eight times in ten; at one in three the government side won 80 percent on her mistakes alone.

## 3. Judgment — human in the loop

**Decisions the agent made on its own:** the twelve-hour detention, the post names, Almatau, the blurb wording, the eight-in-ten weighting for the hidden candidate, and keeping the bought post's roll honest for the contract. The Atlanta blurb first read "says he can reach the ministry", which was a tell; it now reads like the other two.

**Of those, which should a human have made or seen:** the four coined names, the blurbs, and whether a third of simple-policy runs losing twelve hours at the border is the boss the owner wants.

## 4. Deviation — the gaps

The owner's first message had Esperanza as a possible wrong destination; the second corrected it to the departure strip. The build follows the second. The world map is schematic because the canon holds no drawn map.

## 5. Consequence — what it cost or risked

The dev-site project page still describes Susana as the airfield and Atlanta as the destination; it needs a sentence changed when this lands. Saved runs from before this build lack `dest`, `boughtPost` and `ledger`; a resumed old run would default to Atlanta and a rail-post bribe, which is playable but not what that run was.

## 6. Change — what happens next

- Owner plays the map screen and the border on both sides and confirms the four names.
- Fix the browser drive's government section against the phase-turn interface.
- Update the dev-site page's two sentences.

## Addendum, 2026-10-30: the canvas row "First choice: where you go"

The owner's written spec and the two mockups on the Coalition redesign canvas arrived after the first build. Three things moved to match them.

**One sponsor per destination.** Salek is Atlanta's, and only Atlanta's. Tarun's is Dēvan Rāo, a magistrate (working name from the spec); his letters add six hours to every visa job. Zaryanova's is Mirēlā Vosk, a former trade envoy (working name from the spec); her price is a statement on the record with names in it, which the inquiry also reads (exposure +1). Each has their own demand message, terms, and ending line. The sponsor's name, role and terms now come off the chosen destination everywhere: the phone, the route, the ledger, the ending, the needs line, and every string that used to say Salek (`{sponsor}` placeholder, seventeen entries). The card is "Your sponsor's line to the ministry".

**The screen reads like the mockup.** Title "Where do you go?", three identical cards in alphabetical order, each with who asks, the catch, the flight time and a "Has not said yes" pill. The blurbs are gone; they were the last place a tell could hide. Verified at 390 and 1440 with no horizontal overflow.

**The two coined posts take the spec's names:** Ālto Verdē road post (highland road toward Baca) and Punta Marēa crossing (coastal road). The rail post keeps Paso Huhūi.

**Not changed, flagged:** the spec and the mockup say Esmeralda's airfield at Susana; the owner's later message in chat said Esperanza, in the Meridian States, and the kels canon places Esperanza there. The build follows the chat message. Switching back is the `PLACES.esperanza` record, the `map.sub` string, and the Esperanza level copy.

**Harness, 200 runs, `tools/calibrate.js --dest=`:**

| destination | Teresā wins | Matēu wins | landed (of 200) |
| --- | --- | --- | --- |
| Atlanta | 30.5% | 32.5% | 0 |
| Tarun | 0% | 0% | 58 / 49 |
| Zaryanova | 0% | 0% | 50 / 61 |

Content check clean, six contract tests pass, both tutorial replays pass.

## Addendum, same day: Susana, not Esperanza

Owner correction: Esmeralda is a kels remap of Ecuador and the departure strip is its port, Susana; the Meridian States were the wrong country. Every Esperanza string is Susana again, the `PLACES` record is `susana` on Ecuador's Pacific coast, and Portô Venla sits on Valdória's own coast to the south. The canvas mockups carry the same map.

## Addendum, same day: the card copy failed the copy rules

The owner caught it on the phone: "Who asks" and "The catch" are labels, not sentences a person would write, and the "Has not said yes" pill repeated the subtitle. The mockup had them; copying the mockup is not a copy pass. Each card now reads as two plain sentences from the sponsor record ("Amādū Salek, an old client of the family, will ask for you. He wants the family accounts moved first."), the hours line says "10 hours in the air" in the interface face rather than the clock face, and the three label strings are deleted from the catalog. The same pass took the colons and shorthand out of the ledger lines, the option labels and the two landing texts. A hover ring that stuck to the last card on touch screens is now hover-only. Rule for the next agent: every new string gets the Humanizer and plain-language pass before it ships, including strings copied from a design mockup.

## Addendum, same day: the owner's checker now runs over the game

`quarterback/pbbg-content-schema` is the content architecture the owner extracted from this game. Its README said the game had not yet migrated to it. It has not; instead `tools/pbbg-bundle.js` projects the package (the catalog, the tutorials and the records in `src/data.js`: levels, approaches, destinations, posts, stage lines, cards, people, events, holds) into a bundle in the checker's shape, and `tools/pbbg-check.js` runs the checker with `tools/pbbg-policy.json`, the base policy plus the game's own rules: no em or en dashes, the banned phrase, Humanizer stock phrases, "in the air", and the label-row words the owner caught on the phone. First run: 83 findings, 1,147 entries.

- 70 were `SPEAKER`: dialogue with nobody speaking. The catalog never recorded who says a line; the code knows at the call site. `speaker` is now an optional field on a catalog entry, filled for every quoted line from the call sites. The rest were names, roles and interface fragments misfiled as dialogue, now headings or status.
- Two headings carried terminal punctuation. "Where do you go?" is "Choose where you go"; the airfield tutorial title lost its period.
- "{h} hours in the air" is "{h}-hour flight", by owner instruction, and Zaryanova's landing said nineteen hours for an eight-hour flight. Fixed.
- Five action labels over six words shortened, two of them older than this work.
- Four hold events shared an id because the table has none; the adapter numbers them.

Second run: clean. Calibration after the copy pass is identical to before it (the rules did not move). The checker is now in the AGENTS.md verification list.

## Addendum, same day: the owner's round-one screenshot

Three faults, all on the phone. The clock box's second line was set not to wrap, so "Out by Tue 14:00" ran under the Sosā panel; it wraps now and the two boxes no longer overlap at 390 px (measured). The round summary listed exposure once per batch of hours ("rose by 1", then "rose by 3"), with no reason; the Sosā card now folds them into one line for the round and names the cause when the inquiry is looking where you are. "News waiting: {title}" was a label row; it reads "{title}. Read it under News." The round title reads "5 hours passed. It is now Sat 19:00". Rules untouched. Not changed, noted for the owner: exposure 0 to 4 inside the first five hours at the residence is the drift rule (one point every two hours while Sosā looks at the right place) plus the search, as the hold-ladder record calibrated it.

## Addendum, same day: the clock on a phone

Owner: the Sosā panel covered the clock. On a phone the clock is now 22 px instead of 28, both boxes have tighter padding, the clock takes at most 56% of the width and the Sosā panel at most 44%, so they cannot meet; the Sosā panel's text is 13 px. Measured at 390 px: the clock box ends at 201 and the Sosā panel starts at 239. Desktop sizes are unchanged (the 1000 px rule still sets the 56 px clock). The contrast check could not run here: its npm packages are not installed in this sandbox, before and after the change. Colours did not move.

## Addendum, same day: the pixel face at small sizes

Owner, from a phone: "The pixel font isn't readable here." Overbit was on the big clock, where it reads, and also on every small number: "58 h", "in 1 h", "Certain · 1 h", "2 h", the exposure count. Those were the `--font-mono` token (Overbit Regular) and the `.num` class (Overbit Shadow). Both now resolve to GC North Sans; Overbit Shadow Bold stays on the scene clock and the interstitial clock only. No markup changed. AGENTS.md carries the rule.
