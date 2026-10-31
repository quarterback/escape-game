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

## Addendum, same day: the drift stays

I flagged round one's exposure (0 to 4 in five hours at the residence) as a balance call. Owner: "no, games should be harder. You should be able to do something boneheaded or ill advised and have your run end before it starts." Nothing changed in the rules. The instruction is in AGENTS.md so it outlives this record.

## Addendum, same day: the installed-app icon

Owner: the home-screen and desktop icon should differ from the favicon. The favicon keeps the austral mark; the app icon is now Teresā's sprite from `src/art.js`, scaled onto the game's purple with a ground disc, drawn by `tools/make_icons.py` (which reads the rows and palette out of the art module, so a sprite change carries into the icon on the next run; `mateu` is the other argument). A pixel jet was tried twice first and rejected by the owner, the first draft for its shape. The maskable variant keeps the figure inside the inner 80%.

## Addendum, same day: sharing a run as video, the title screen plays itself, a landing page

Owner: "is my only option for sharing gameplay to record myself doing it?" No. The game is seed-deterministic, so a run is its seed, who played, where they were going and the list of accepted actions. Four pieces:

- **The action log.** `Sim.commit` and `Gov.commit` record every accepted action on the state. Nothing in the rules reads it.
- **Save and replay.** The ending screen has "Save this run" (a JSON file) and "Copy replay link" (the run in the URL hash). Opening a replay link plays the run back through the same screens a player sees, muted, with a Replay badge, saving nothing. `tools/sample-run.js` writes the same file from the harness policy, so a clip needs nobody at the controls.
- **The recorder.** `tools/record-run.js run.json --size phone|desktop|square --speed MS --cut N` opens the built game on the replay link under Playwright, records it, and writes webm, mp4 (h264, for feeds) and a short looping gif (first 20 s, 8 fps, 360 wide; a whole-run gif was 46 MB and is useless). Measured: a 27-action clip at square size is 3.7 MB mp4 and 1.7 MB gif. No sound; the theme is laid on afterwards.
- **Nothing gives the game away.** Owner: "don't accidentally give away the game by showing the winning run showing where they go." `sample-run.js --cut` and `record-run.js --cut N` stop a run before the border, so a clip never shows the destination's visa arriving, the landing or the ending.

**The title screen runs the game behind itself** (owner: "the game home screen should have it running in the background rather than on the front page"). `tools/attract-runs.json` holds three recorded runs, one per destination and both characters, each cut before the border; the build inlines them and the title plays them in a loop under a darker shade, muted, saving nothing, rotating at random so the three cities appear equally and no ending is ever shown. Start stops it and restores the player's sound setting. The static still is the fallback when the file is empty.

**The landing page** is `about.html`, built from `src/about.html` with the same catalog fill and fonts as the game: what you are doing, how a round goes, where you could go, cards and reach, the other side, ways to start, the world, offline and install. Every sentence is a catalog entry (`about.*`), so the content check and the owner's checker both ran over it; the copy went through the Humanizer rules by hand (no contrasts, no closers, no triads, no label rows, no sales language) and two sentences I had softened ("some of the people", "runs are short") were put back flat at the owner's order: "do not soften claims ever, it's a game." The rule is in AGENTS.md. Three stills in `media/` were captured from the built game by Playwright; the title link "About the game" goes to it and its Play buttons come back. Verified at 390 and 1440 with no horizontal overflow.

Checks: content check clean, owner's checker clean, both tutorial replays, six contract tests, build.

## Addendum, same day: the landing page was a manual, not a story

Owner: "the landing page's language has clearly not been run against my rules … that's not a narrative, that's slop." It was eight headed sections explaining features. It is now the story told in the game's own voice: Saturday two in the afternoon, the cars outside the house, who is on the phone and what each wants, the road south and over the passes, the three cities and their sponsors, the die, the Exposure count and the three stops, then Sofīā's desk, then one paragraph before you start. Three headings. Every name is one the game uses. Nothing is hedged. Pattern: P08 scene entries, so both checkers cover them.

## Addendum, 2026-10-31: ERR_FAILED on the phone

Owner's phone showed Chrome's "This site can't be reached, ERR_FAILED" for arcade.pdtmag.com, sometimes, in Chrome and Safari. The site answered from here in under a second with the current build, so the fault was on the device: ERR_FAILED is what Chrome shows when a service worker takes the request and its `respondWith` promise rejects. The worker I shipped did that. Its page handler was `caches.match('index.html') || fetch(req)`: when iOS had evicted the cache and one network fetch failed, the promise rejected and the browser's own error page never got a chance. Its install used `addAll`, so one missing icon failed the whole install. And it answered EVERY navigation with the cached game page, so `about.html` would have shown the game. The rewritten worker never rejects: the game page goes network first, then the cached copy, then a short offline note; other pages load as themselves with the same fallbacks; other files cache first then network; the install caches the page first and the rest one by one. Tested under Playwright on a local server: worker activates, `about.html` renders as itself, the game renders offline from cache, an uncached page offline shows the note instead of an error. Registration now also runs on localhost so this can be tested at all. A phone that is stuck on the old worker needs one successful load of the new `sw.js` (it is served `no-cache`), or Clear Website Data for the site.

## Addendum, 2026-10-31: the daily's strings

Owner asked how the daily works and said its copy had not had the pass. How it works: the date is hashed with the word "coalition" into the seed; odd days are Matēu, even days Teresā; the seed fixes the bought post, who has talked, the news and every die, so two players on one date share the world and the dice and differ only in their choices and their destination. The first finish of a day is the one the game remembers. I tried fixing the destination from the date too, so "the same run" would be literally true, and backed it out: two days in three would then be unwinnable by construction, and the note naming the city would have been a tell. The destination stays the player's and the note says so. Strings rewritten: the button is "Today's run"; the note is "One world for everyone today. You are Teresā. Same dice, same people, same bought post. Where you fly is still yours to pick."; the finished note says the first finish counts; the share text reads "Coalition, Fri, Oct 31 / Teresā got out at Mon 09:00. Held once, 14 rounds, exposure 6 of 10. / url" with never, once, twice and N times as words; a daily that ends on the apron has its own line. Both checkers clean.

## Addendum, 2026-10-31: the daily draws more from its date, and its copy is rewritten

Owner accepted five more seeded draws for the daily and rejected the daily copy again ("rewrite it like a person would", AP style plus plain language, keep nothing drafted). Built, daily runs only: the character comes from the seed instead of odd and even days; starting exposure is the character's own plus minus one to plus one, floor 0, cap 4; Sosā starts looking at the road one day in three or so (30%); one to three allies have already gone over instead of a fixed two; the fourth starting card is the character's own or a held report, drawn. Free runs, the tutorial and the contracts are byte-identical (the draws sit behind `opts.daily`). Measured, 300 seeds each: free 32.0% / 31.3%, daily 38.0% / 33.0%; the hot-start days and the three-traitor days are the losses, the cool-start days the wins. `tools/calibrate.js --daily` measures it.

Copy, all new: "Play today's run"; "Everyone gets the same run today. You play Teresā. You pick where to fly."; "Teresā got out Monday at 9 a.m. Your first finish is the one we keep. You can play again."; the share button is "Share"; the share text is "Coalition, Oct. 31 / Teresā got out Monday at 9 a.m. Held once. 14 rounds. Exposure 6 of 10. / link". Dates are AP (month abbreviations from the catalog, "Sept."), times are AP ("9 a.m.", "noon", "midnight"), numbers are figures. The glossary check caught "arrested" and the line says "held", the game's term.

## Addendum, 2026-10-31: no couplets

Owner: "Remove ALL the couplets … no two sentences when one will do." A couplet is a second sentence that restates or explains the first ("Pick a response. Each one shows what it costs."). Sixty-eight interface strings had two or more sentences; every one is now one sentence, or the second sentence is gone where it said nothing the first did not. The ten phase hints too. A new content check, C15, fails the build on any interface string (labels, headings, previews, blocked actions, status, reports, results, errors, empty states, and the hints) with more than one sentence; the budget lives in `content/policy.json`. Dialogue, scenes, cards, tutorials and endings are exempt, since a character may speak in sentences.

## Addendum, 2026-10-31: the clock reads AP, the rumor card stops repeating itself

Owner's screenshot: "still more instruction couplets, not AP style." The clock now reads the way AP writes a time, everywhere it appears: "Sat 5 p.m.", "Sunday noon", "Monday midnight", in the header, the ledger, the logs, the daily and the government debrief; the game clock used "Sat 17:00". The header line is one sentence, "69 hours left, out by Tue 2 p.m.", and the inquiry panel says "in 3 hours", not "in 3 h". The rumor card said "A rumor" over "A rumor about Gianlūka" over a two-sentence line, with "Keep trusting Gianlūka" over a chip reading "Rely on Gianlūka": the title is the person's name, the line is one sentence, the choices are "Trust Gianlūka", "Test Gianlūka quietly", "Cut Gianlūka off", and the chips say what follows ("Keeps Gianlūka's help", "Loses Gianlūka's help"). The pixel face has every glyph the new clock needs (checked). Calibration unchanged.

## Addendum, 2026-10-31: AP numerals, and the destination cards in one sentence

Owner's screenshot of the map: "these screens and others still also reject AP." AP spells numbers below 10 and uses figures from 10, so "eight-hour flight" and "10-hour flight", "11 years", "12 hours", "72 hours", "20 steps", "held two of three", "needs a three or more", "in one hour". Swept the catalog and the records for both directions with a regex and fixed every hit; a dynamic count in prose now goes through `Sim.num`, which gives words below 10. Times are "2 p.m." The three destination cards are one sentence each: "Amādū Salek, an old client of the family, will ask for you once the family accounts are moved to his bank." The map hint is one sentence. Dice results, exposure scores, rounds and the share line's abbreviations keep figures, as AP does for scores and tabular matter.

## Addendum, 2026-10-31: the Humanizer pass, by pattern

Owner: "or humanizer." Swept the catalog with a regex for the Humanizer's structural tells (staged contrasts, one-word dramatic fragments, repeated sentence openings, anaphora, stock words) and rewrote every hit: the map subtitle was four staccato sentences and is two plain ones; "letters are slow" was an aphorism and now says what it means, "which takes days"; "unlock" is "open"; "Success." and "Failed." stay because they are result labels, not prose; the landing page lost its "Every … Every … Every" run, its "She … She … Her … Her" run, its "The … The … The" run, and its closer ("The story does not"). The sweep is a regex, so it finds shapes and not judgment; the judgment was mine on each line.

## Addendum, 2026-10-31: the readability pass, in the owner's register

Owner: "the game is unreadable as is … same with demo instructions." What I learned from the owner's own card copy, now in AGENTS.md: lead with the situation and turn on a "but"; the role before the name; give the player something to judge, not a rule to absorb; keep the game's recurring words; let a sentence run as long as a spoken one. Applied to both tutorials (32 steps rewritten from scratch, one instruction each), 125 interface strings (status, needs, effects, options, logs, summaries, start screen, help, route labels, the Sosā panel), the six level objectives and the three arrangement blurbs. Dialogue and scene text in the records were already in that register and are untouched except one staccato line of Duartē's. Both checkers clean, both tutorial replays pass, the contract tests pass, calibration is unchanged at 32.0% / 31.3%.
