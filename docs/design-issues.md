# Design issues: where names, labels and text disagree with the game

**Recorded:** October 31, 2026, during the player text audit.
**Owner:** Ron Bronson decides each item. None of these was changed, because each one is a question about how the game should work, not about wording.

The full audit tables, one row per string with what the code does, are in
[docs/text-audit/](text-audit/). The text rewrites that did not depend on these
decisions are already applied.

## Open decisions

1. **The results score measures where the search was aimed.** A row is recorded at every order, including orders that send nobody anywhere, and compares the search town with her real town. Is that the measure you want?
2. **"Nando's decoys cost you" claims a cause the game does not track.** A square counts as a decoy when the search town matches any false report's town. Keep with softer wording, drop it, or record which report moved the search.
3. **Resolved Nov. 1, 2026:** ~~**Confirming the travel ban changes nothing.** The ban works as soon as the Circulate order succeeds; confirmation only changes the label. Make the ban work only once confirmed, or merge the two states.~~ Owner: "The travel ban makes crossing harder but does not close the border." Every label, preview, event and demo step now says the ban is in force once sent and that confirming only has the post confirm it; the rule is unchanged.
4. **Resolved Nov. 1, 2026:** ~~**"Esmeralda holds her" does not hold her.** It makes her takeoff harder and allows one Esmeraldan police stop. Change the mechanic or the name.~~ Owner: "Costamar does not automatically detain the fugitive." Labels and lines now say Costamar agrees to the request, with the effects it has.
5. **Resolved Nov. 1, 2026:** ~~**The Jet marker sits at Susana before the plane is ready.**~~ The briefing marks the jet at Portalba only once one is booked.
6. **Monday noon is not on the briefing.** Her passport is cancelled, the ban reaches every post and the first stop starts at the station. **Resolved November 1, 2026:** Monday noon is gone. Its two effects now come with the travel ban ([aar-fix-in-place](aar-fix-in-place.md)).

## Gameplay backlog, in priority order

Nothing here has been changed. Each item is a gameplay question for the owner.
The copy pass only made the text describe what the code does today; where the
code is wrong, the text now describes the wrong behavior honestly, and the fix
belongs here.

### Priority 1: the game breaks or contradicts itself

1. **Resolved Nov. 1, 2026:** ~~**Arrangement messages never appear.** `src/sim.js` (stage function) compares against `s.arr[k].low`, which is never set, so every `STAGE_LINES` message is skipped, including the only one that names the border post where Esmeralda's officials wait. Likely fix: track the highest step reached and show the message the first time each step is reached.~~ A progress message plays whenever an arrangement moves forward, and the result card shows it in the speaker's words.
2. **Fixed Nov. 1, 2026:** ~~Climbing out of house arrest returns you to house arrest.~~ The climb now adds 4 police attention instead of 8 (see `tools/house-arrest-check.js`). Original note: The climb's win adds 8 police attention to the reset value of 4, so the next hour starts another third stop. It only frees you when police attention was 1 or lower.
3. **Resolved Nov. 1, 2026:** ~~**The escape demo stays scripted after it ends.** Leaving or finishing the demo keeps queued dice and Sosā actions and keeps `s.tutorial` set, so the rest of the run has no police stops and no news, and police attention stops at 9. The government demo clears its script; the escape demo does not.~~ Leaving or finishing the demo now calls `Sim.endTutorial`, which clears the scripted dice and police moves and turns police stops back on, as the government demo already did.
4. **Resolved Nov. 1, 2026:** ~~**Naming a town to the minister reveals her real position.** His reply differs depending on whether she is there, with no roll.~~ The reply and the announcement are the same either way; a wrong claim still sends the police there unseen.
5. **Nonā Rosa's grandson card is lost before it can be used.** It is given at Nova Trentô, works only in the Salta yard, and every card of its kind is discarded on any move to a new stop, so it disappears on arrival at Salta. **Resolved November 1, 2026:** a way onto the freight is dropped only when you leave the stop where it counts.
6. **"Have Gianlūka ask for a delay" can never be chosen.** It needs a card kind no card has, and if it worked it would move the deadline 4 hours sooner while its line says the clerk grants two days. **Resolved November 1, 2026:** it now needs the party machine. With Monday noon gone, it holds the court's travel ban order back instead of moving a deadline.
7. **"Call your contacts" at Nova Trentô can be repeated.** Each use moves all three arrangements one step with no ally, roll or check; twice on a Tarun run marks a visa as issued for a country that never agreed.
8. **"Help Nonā Rosa free the truck" leaves for Salta on success**, which skips the "Esmeralda expects you" requirement on the road out.

### Priority 2: names and labels promise something the rules do not do

9. **The six open decisions above** (score measure, decoy cause, ban confirmation, the Esmeralda request, the Jet marker, Monday noon).
10. **Following a report does not move the police.** It moves only where your next orders act; police attention on her rises only after an order that sends people there.
11. **"Pay" moves cost nothing**, and "Lie low for an hour" is the same as waiting an hour.
12. **Call previews show the wrong odds and hours.** They ignore the trust discount, the hour the call takes, the 2-hour delay after the family's "landed" story and Rāo's extra 6 hours.
13. **Cards that do nothing.** The registry card can never be obtained ("Trace the call instead" is always disabled); the watch card and rail card lower no roll; minister standing only changes a results sentence. **Partly resolved November 1, 2026:** the registry card, its choice and its bonuses are removed. The watch and rail cards still lower no roll; they are the sources of reports.
14. **Resolved Nov. 1, 2026:** ~~**Events that claim a block the rules do not apply.** The strike and blizzard texts describe a stopped freight and a closed post; neither is blocked. Several "leave" choices ("Slip out now", "Leave the car, take the river") do not move you.~~ The strike, blizzard and storm texts no longer claim a block, and choices that moved nobody are relabeled for what they do.
15. **Resolved Nov. 1, 2026:** ~~**Her police attention shows on the government side** in the round summary, and her jet's preparation step after a licence review. (The floating number is now hidden.)~~ Police actions run from the government side pass on only their own line and a questioned helper's answer, in the third person (test C04b).
16. **The Esmeralda notices at Susana never clear** after Esmeralda agrees.

26. **Police attention reports disagree within a round.** The move chip, the round summary and the bar can show three different changes (stand-in playtest, moment 6). The summary mixes hourly drift with move effects.
27. **Holt says "Midnight" whatever the hour.** The freight boards from 10 p.m. to 5 a.m., but his lines say midnight even at 3 a.m. (stand-in playtest, moment 7).
28. **The demo locks message answers** while the hint tells the player to answer them (stand-in playtest, moment 4).

29. **Fixed Nov. 1, 2026:** ~~"Have Gianlūka ask for a delay" could never be chosen.~~ The news choice asked for a card by its id (`aide_word`) instead of its kind (`influence`), so it never matched and the greyed button showed the code ("You need a card that gives you aide_word"). It now asks for the influence kind, like the other Gianlūka choices.
30. **Resolved Nov. 1, 2026:** ~~**Two moves still tell the player they cannot work.** "Pay the yardmaster" says "This cannot succeed" in its own text, and the cancelled passport shows the same line. The owner's rule is never to tell the player in advance what will work. These are candidates for the trap side quests in [proposals/next-mechanics.md](proposals/next-mechanics.md), so they are left for that decision.~~ "Pay the yardmaster" no longer says so in its text, and the move card no longer repeats the preview line; the cancelled passport still shows "This cannot succeed" as its chance, because the roll cannot be won.
31. **Withdrawn Nov. 1, 2026.** The government side looked easier with the 20-sided die (37.5% escapes) only because the computer-played candidate still skipped targets above 6. After the fix she escapes 46.5% of runs, against 48.5% before the die changed.
32. **Three moves are not rolled.** Calling contacts and sleeping at Nonā Rosa's, and taking the road to Salta once it is arranged, have no failure written for them, so they stay choices instead of chances. The escort waiting at a border post is also not rolled. Say whether these should roll; each would need a failure outcome written.

33. **Fixed Nov. 1, 2026:** ~~"Call your contacts" at Nonā Rosa's is far stronger than anything else, and keeps claiming progress after it stops making any.** Each use takes three hours, is never rolled, and moves the jet, the welcome in Esmeralda and the visa one step each. Four uses finish almost every arrangement without waiting for a single reply. After that it is still offered and still says "all three arrangements have moved one step" while nothing changes. Measured Nov. 1, 2026: the calibration bot loses many runs by repeating it; a bot that uses it only while it helps, then leaves, wins 56% (Teresā) and 39% (Matēu) instead of about 30%. Decide what one use should buy, and stop offering it once nothing is left to move.~~ The owner said to fix it. It can now be used once per run; it is not offered when every arrangement it moves is already done; and when only some can move, the result names the ones that did.
34. **Fixed Nov. 1, 2026:** ~~The calibration bot plays Nova Trentô badly, so today's "about 30%" understates what a sensible player wins. A bot that simply takes the road when it can wins 46% (Teresā) and 37% (Matēu). Fix the bot, and item 33, before calibrating the difficulty presets.~~ The bot now takes moves that leave a stop first, as the government side's candidate already did. With both fixes it wins 46.7% (Teresā) and 42.3% (Matēu): above the owner's one in four to one in three, which is a decision for the difficulty presets.

35. **Fixed Nov. 1, 2026:** "Call your contacts" at Nonā Rosa's could mark the visa issued for a country that never accepts you, and could confirm a crew with no destination. The calls now obey the same rules as an ally's reply: the visa is issued only by a country that accepts you, and the crew confirms only once the jet has a city. When nothing can move, the move is not offered.

### Priority 3: smaller mismatches

24. **Cancelling her own passport does nothing by itself.** `src/sim.js` checks a move called `own_passport` that does not exist; only the travel ban and the station stop change at the passport deadline.
25. **Hang up stays bright during demo steps** that ask for something else; check whether the demo should disable it.

17. The freight boards from 10 p.m. to 5 a.m., though the story says midnight.
18. The vehicle bonus at Ālto Verdē can never apply; no vehicle card counts at the border. **Resolved November 1, 2026:** removed.
19. "A report held one day" never expires.
20. Sponsor lines assume Salek ("her uncle, who banks with him"), and Sosā's Susana call says "your brother" for both characters.
21. The Monday noon log line is fixed text, though summons and hearing events move the deadline. **Resolved November 1, 2026:** the line and the deadline are gone.
22. Ending epilogues are built but never shown (owner decision on endings), and the tutorial goal field is never displayed.
23. Some player text is still built in `src/gov.js` instead of the catalog (report proof lines, "Needs {card}", age and odds fragments).

## Everything the audits recorded

### Escape side: places, moves, cards and requirements

- Stage lines never print. sim.js:406 says only when `to > s.arr[k].low`, and `low` is never set, so the test is always false (tested). All of STAGE_LINES is dead text. That includes the only line that names the escort post (reception[3]); otherwise the player can find it only by seeing that one post button says "Certain".
- "Call your contacts" (data.js:135-137) moves all three arrangements one stage, with no ally, roll or gate. It is not an exit (sim.js:16), so it can be repeated. Done twice for Tarun, it sets "Entry visa issued" for a country that never agreed (it skips the accepts check in sim.js:484). It also skips the Salta gate for officials at the line and the destination gate for the crew.
- "Help Nonā Rosa free the truck" is an exit (sim.js:16): success moves you to Salta even if Esmeralda does not expect you yet. That gets around the gate the objective and "Take the road to Salta" describe. Nothing in the name or text says you leave.
- "Leave with Duartē's driver" (data.js:114) is hard-coded; Matēu's sibling is Līviā.
- "Pay" moves (second_driver, crate, buy_seat, post_coast, fuel_now) set `pay: true`, and nothing reads it (sim.js:190). Paying costs nothing.
- "Lie low for an hour" (action.wait) passes one hour, the same as waiting (sim.js:357). Nothing lowers police attention or hides you.
- "Uses {list}" (action.uses) suggests a card is spent. Card bonuses never spend the card (sim.js:159). **Resolved November 1, 2026:** help from other people is now used up by the move that uses it, so the label is true for those cards.
- The call preview "on a {turned} or better" (sim.js:206) ignores the trust discount (sim.js:480). The sibling starts at trust 2, so his real need is 2 while the screen says 3. "Answers in {k} hours" ignores the hour the call takes, the +2 when your family went dark, and Rāo's +6 (sim.js:422).
- need.working (ui.js:220) prints the current stage, not the one being worked on, and prints "none" at stage 0.
- Pending call label (ui.js:185) puts `def.name: ` in front of sim.status.is_on_it, which already starts with the arrangement: "Aircraft: Aircraft, Duartē Albukerkē is on it".
- need.salek says the sponsor "is asking the ministry" when nobody has called him (ui.js:220, the not-started state).
- Sponsor demand effects say "the visa moves" (data.js:234, 241, 248). Signing only sets his trust to 2, so his visa roll needs one less (sim.js:448, 480). No stage moves.
- The sponsor commitment is stored as kept the moment you first call (sim.js:419). Only refusing his demand marks it broken.
- "Board the midnight freight" works any hour from 10 p.m. to 5 a.m. (sim.js:164). The text, need.passage_from ("before midnight") and the objective all say midnight. Its fail text cannot happen: passage +2 makes the move certain whenever it is allowed.
- "Theo's walk-through" and "Pay Holt for a crate" only give a passage card; their success text reads as boarding now (data.js:155, 159).
- "Pay the yardmaster" (dc 7) can still be chosen and always fails. Its success text cannot happen.
- Bought post (sim.js:378-381): the text says the sergeant takes your passport and that it is "too late to matter". The passport card stays, you stay at the line, and you can try another post.
- The Paso Huhūi fail text credits Gianlūka's phone call (data.js:174). Nothing checks him, so it plays even after he talked to Sosā or you cut him off.
- Ālto Verdē lists a vehicle bonus (data.js:176), but no vehicle card reaches the line (the truck's reach is colônia and Salta, data.js:64). The bonus can never apply.
- Susana's arrival text always says "Sosā has asked them to hold you" (data.js:188), and the "Board and depart" fail text cites "a request from Valdória". flags.asked is often false (sim.js:503, data.js:440). Related to FLAG-4.
- Santa Laura's arrival says the posts do not have the travel ban yet (data.js:108). The ban can already be on from Sosā's circulate move (sim.js:500).
- "Drive on in your own car" fail text says "they let you through". The fail keeps you at Santa Laura with the search on you (data.js:125). "The party's official car" fail text says the car is let through, and you also stay at the residence (data.js:104).
- The decoy cars card says it counts at the residence and Santa Laura, but the Salta message "send Nando past the gate" spends it outside that reach (sim.js:225, 452 use heldTag, not reach).
- "A report held one day" (delay_report) never expires.
- "Theo walks you through" from the yardmaster event (data.js:412) still says "From Theo Bascom" on the card face, because card.from is fixed.
- "The party machine" says each call costs you with Gianlūka. Card bonuses cost nothing; only some event choices lower his trust.
- The sibling's role (PEOPLE.sibling.role, phone.sibling_role, route.role_aircraft) says aircraft only. The sibling also takes reception calls up to stage 2 (sim.js:210). Stage lines for reception are voiced by the sibling even when Vélez delivers (sim.js:406).
- Two forms for night: sim.js:167 hard-codes "After 22:00." (also a C12 breach) while need.after says "After 10 p.m.". Odds show as "4 in 6" on the button (sim.js:190) and "4 in six" in the preview.
- sim.why.needs_a_card gives "You need a influence card" and "a information card"; there is no a/an logic (sim.js:166).
- card.rung gets a figure, so it prints "2 of three" (ui.js:474).
- The map's subline says Esmeralda's leader has arranged safe passage and that Susana is the capital. Reception starts at stage 0; Susana is the airfield; Baca holds the ministry.
- The map card for Tarun calls Rāo "fickle". His real rules are 6 extra hours on every visa call (slow: 6) and a visa that never comes (accepts false).
- Never shown: map.via, sim.label.lie_low_one_hour, LEVELS.border.received.name, ARRANGEMENTS.reception.what, ARRANGEMENTS.permission.what, need.officials, need.velez, need.crew, need.decoy, need.influence.
- Unreachable outcomes: board.fail, buy_seat.success, work_phone.fail, sleep.fail, leave.fail; DESTS tarun and zaryanova "kept" lines (those runs cannot win).
- Turning ARRANGEMENTS.*.name into a proper noun would break, because call labels lowercase it (sim.js:205, ui.js:185).
- Hidden roll changes are never explained in the preview: +1 at the line under the travel ban, +1 at a checkpoint, +2 at takeoff when Esmeralda was asked, and +1 at the line for Teresā (sim.js:182-186). The player sees only the final number and the card discounts. **Resolved November 1, 2026:** the preview names each change and the amount.

### Escape side: news, police stops, Sosā and endings

- The ending reason never shows. Every EVENTS and HOLDS end reason, the landing text, the win line and all 12 sim.end.* strings go into s.over.reason (sim.js:339, 383, 384, 473, 520), and ui.js:271 renderOver never reads it. That follows the owner's "one line of reason" decision, but the strings are still written and maintained.
- Climbing out of house arrest puts you straight back under house arrest. HOLDS.3.climb win adds 8 exposure to the reset value of 4, which reaches the limit of 10. Within the 2 hours the choice spends, pass() fires another stop at step 3 (data.js:473; sim.js:338, 472, 261). I confirmed this with a seeded script. The brief's "ends the run unless the climb-out roll works" only holds when exposure was 1 or lower before the climb (a stop that came from a roll, not from the meter).
- "Have Gianlūka ask for a delay" (EVENTS.hearing.stall) is always blocked. needs [{ card: 'aide_word' }] gets checked as a card tag (sim.js:166), no card has that tag, and the player sees "You need a aide_word card". If it did run, it moves the deadline 4 hours sooner, while its line says "The clerk grants two days" (data.js:457).
- Escape-side roll chips never show what a win gives (sim.js:273 returns after need and fail). The bus to the line and the ridge path both take you to the next stop on a win, but their chips say only "Roll 4+" and the failure. The government chips do show wins (gov.js:226).
- The roll.fail and roll.win lists lowercase every chip (sim.js:273, gov.js:226), so names come out as "sosā finds you" and "duartē trusts you less".
- Labels that promise travel, but you do not move: "Leave the car, take the river" (only mod -1 at Santa Laura), "Slip out now" (1 h on a win), "Ride with the strikebreakers" (nothing on a win), "Move while they are blind" (exposure -1 and Sosā skips an action, no travel and no time). data.js:374, 398, 403, 459.
- Event text that states rules the game does not have: the Salta strike says no freight moves (boarding is never blocked, data.js:400). The blizzard says the post is shut (crossings still work, data.js:421). Old guard's win line "waves the queue on" reads as a crossing, but only makes moves at the line 2 easier (data.js:416).
- "Ask the favor" with the yardmaster gives the card "Theo walks you through", from Theo, while the line says the yardmaster walks you himself (data.js:412, 74).
- The dog choices change your sibling's trust, while the story is about your youngest or daughter (data.js:361, 426).
- "Trust him anyway" and "Trust {first}" set doubt, which was already set and only changes a status chip (sim.js:330, ui.js:233). "Go to Theo instead" cuts Holt and does nothing with Theo.
- A clean test result says the ally is "offended you asked", while the code raises their trust to "Trusted" (sim.js:332).
- belief 'away' sends the search one stop back, but from the residence it goes forward to Santa Laura, the stop you are heading to (sim.js:325). Lines like "posts you on the coast" and "puts you on the coast road" name places the search never goes. The yacht effect says "Sosā searches the coast", but the search goes to the residence (sim.js:445).
- "Sosā finds you" (search.finds) only moves the search onto your stop, and no stop happens (sim.js:326).
- flags.lied (beach photo, yacht) makes a later confession cost 3 instead of 2, but no chip on the beach choice shows it (sim.js:291, 502).
- "Let it stand" at Susana sets flags.asked (takeoff +2, a possible stop in Esmeralda), but no chip shows it (sim.js:270 to 291 has no case for flag.asked). Its line says Esmeralda will "hold you" (FLAG-4).
- "Risk the short route" is a certain +1, not a chance (data.js:437).
- Rumor lines are picked at random, whatever the person actually did (sim.js:250). The kind label "A rumor" covers this.
- The sponsor lines are written for Salek only: "her uncle, who banks with him", "Her uncle banks with me", "I am not a patient man". Rāo is a magistrate and Vosk is "she" (data.js:231 to 250; ui.json sim.line.v_lez_is_not_answering, her_uncle_banks_with_me, a_week_i_am_not).
- Sosā's Susana call says "your brother", which is wrong for Matēu, whose sibling is his sister Līviā (data.js:17). The call site passes no arguments (sim.js:140). His "I will call again" never happens.
- "Ten hours" for the visa is 16 for Rāo (slow: 6, data.js:240; sim.js:422).
- sim.effect.nothing_changes ("the story stays on the radio") is also the effect under hanging up on Sosā at Susana (sim.js:142).
- The pilot message comes on arrival at Susana whenever the license warning happened, even if the aircraft never lost a stage. "Pay the crew a bonus" then jumps the aircraft straight to "ready at Susana" from any stage (sim.js:145, 442). If the warning happens after you reach Susana, no message comes, so the "until you reassure him" path is missing (sim.js:501). "Ignore it" says the jet stays grounded, but it does nothing.
- "Say it" for Vélez sets flags.guest, which nothing reads. "The party at home reads what you said" has no mechanic (sim.js:453). Vélez says "My people will be at the post" even when reception is below stage 3.
- "Send the statement" claims the informant "keeps telling you where Sosā is looking". The card only adds to rolls, and Teresā already holds it (sim.js:440; data.js:82).
- The sponsor demand's accept effects in DESTS say "the visa moves" (data.js:234, 241, 248), but sign_accounts only sets sponsor trust to 2, so the next visa roll needs one less, and no stage changes (sim.js:448). This is outside my scope, but found while tracing sim.line.good_the_ministry_will_hear.
- "Ask for a week" does nothing if no visa request is pending (sim.js:449).
- "Wait" on the Vélez message says "until you call her yourself", but at stage 1 the reception call goes to your sibling (sim.js:210).
- A failed ally job is removed, not retried (sim.js:478). "Nothing yet. They want more time." and the ledger's "Nothing on {what} yet" both suggest it is still coming.
- "Send Nando past the gate first" works even if Nando was cut off or talked (sim.js:225).
- The Monday noon log line hard-codes "Monday noon", but summons and hearing events move s.deadline earlier (sim.js:335, 466). The own-passport rule at dc 7 (sim.js:187) applies to an approach id 'own_passport' that does not exist.
- The roadblock text builds "the road out of Residence" and "out of The line" from LEVELS[].short (sim.js:505).
- The circulate text says "every provincial post", but the ban only matters at the line (sim.js:182).
- The government side logs escape-side inquiry text addressed to the candidate. Sofīā reads "to hold you if you appear", "until you reassure him" and "tells them where you were last seen" (gov.js:85, 204, 278 call Sim.enemyAct into the government event list; ui.js:567 logs it).
- The ban.lost marker and the judge's "keeps the old list" change only the government request status. flags.restriction stays on and her crossings are unchanged (gov.js:268). This is related to FLAG-3.
- "Bīr trusts you less": the trust chips use the first word of the sponsor's full name (sim.js:272), while everywhere else uses the short name "Salek".
- card.lose_any covers 'best', which takes the second passport first (sim.js:328), so the chip hides the most important loss.
- deadline.later has no event that uses it.
- The keep_calling label is a template literal in sim.js:117, not a catalog id.

### Government side

- "Follow the latest report" and "You move the search to {place}" say the search moves. The code moves only your aim (g.belief); the police watch that raises her attention stays where the last search, checkpoint or other `act` order put it (gov.js:189 vs gov.js:193, sim.js:468).
- "Call in one of her people" says some helpers tell Sosā where she was last seen. When one talks, the police move onto her and her attention rises 2, but the player gets no report and their aim does not move (sim.js:502; gov.js:85 only reads her own turn's events and never sees press_ally). gov.report.where_she_was_last_seen and gov.inquiry.where_she_is_now are unreachable.
- The press log on this side uses escape-side wording addressed to "you": "tells them where you were last seen", "They find you", "Nobody there has seen you", "The ministry briefs the papers that you have already left the country", "The operator withdraws the crew until you reassure him" (sim.js:498-504 events pushed into the government log by gov.js:194, 170, 278; ui.js:567).
- "Cannot fail." shows for every order with no fail text, but Brief the papers needs 2 and Review the charter operator's licence needs 3 at most stops (gov.js:122, data.js:274, 276). News effects can also raise Keep watch and Follow above certain.
- Preview line "Takes {hours} hour{s}, {who} acts" capitalizes who mid-sentence and yields "You acts" for Follow (gov.js:122).
- "Brief the papers" says it can calm the minister. It never touches minister standing; it lowers her attention by 1 and moves the police off her stop (sim.js:504).
- Minister standing (pleased/angry markers on many choices) has no effect in play; it only selects a debrief sentence (gov.js:276, 331).
- The registry card is never obtainable, so "Trace the call instead" is always disabled, the records bonus on Circulate and Call in never applies, and gov.status.your_people_the_registry never shows (data.js:261, 290; gov.js:26, 148).
- The watch card has no effect: no order uses the watch tag (data.js:259, 268-276). The rail card has no effect: its only bonus is on Ask the yardmaster, which is hidden once you hold it (gov.js:112). The introduction card's "start at the line" has no effect at the line; it only unblocks three orders at Susana (gov.js:116-117).
- The provincial patrol card text says the commander acts quickly "once"; the bonus applies on every order (gov.js:103).
- At Susana, the button says "by Esmeraldan officials, on your introduction" even when the order is blocked for lack of the introduction, and the preview line under it still says the provincial patrol acts (gov.js:117, 120, 122).
- route.no_command and route.ask_esm show at Susana permanently, and route.esm_intro shows in the cards section permanently, even after Esmeralda agrees and the card is in hand (ui.js:610, 613).
- The request "Review the operator's licence" (gives the card) and the order "Review the charter operator's licence" (uses it to pull her crew) have near-identical names for different actions (gov.js:130, data.js:276).
- "The aviation desk opens on Sunday." The request opens at hour 6, Saturday 8 p.m. (gov.js:130).
- "You asked for time. The time is up." fires at ministerBy whether or not the player asked for time; ignoring the first message produces it at Saturday 4 p.m. (gov.js:96).
- scene.minister_by keeps showing the minister's deadline after a stop is named or after his follow-up has come and gone (ui.js:99, gov.js:96).
- Refusal lines "Ask again with more" and "Not today" imply a stronger retry or a wait; both requests reset to not asked and can be repeated at once at the same odds (gov.js:204-205).
- Circulate failure: "Half the desks file it" suggests a partial ban; no ban is set, and the police lose the stop they were watching (gov.js:198). The paired report says "Her side knows the ban is out" when it is not out.
- Search failure: "finds a cold room" tells the player she was not there; the code checks nothing on failure (gov.js:198).
- Keep watch text says "You learn nothing new if she has gone"; the report says the house is empty, which tells the player she has gone (gov.js:190).
- Rail strike: text and "Nothing leaves Salta" say the freight stops. The code only delays every arrangement she is waiting on by 4 hours and never blocks the freight (gov.js:270).
- Three sightings: "Three patrols, three empty rooms" asserts she was at none of them without checking; a false report then names a stop (gov.js:279).
- Embassy dinner: "he writes a name on a card" suggests the introduction is given; holdup only speeds the Esmeralda answer, which still needs a 4 or more (gov.js:274).
- Snow at the passes: the event says the passes are closing; snow has no effect unless you keep the patrol there, which places a 5 hour checkpoint at the line and replaces any other checkpoint (gov.js:271).
- Find another judge: the failure branch carries hours 2, which replaces rather than adds to the choice's 2 hours (gov.js:264).
- Monday noon sets the travel ban without the player sending it, and the ban row then reads "Ban sent, not confirmed at the post" (sim.js:466, gov.js:145). Related to FLAG-6.
- Objectives at each stop state facts the code does not track: "The watched convoy splits" (shown from the opening), "Reports conflict", "Your source has conditions", "Railway staff disagree about who is on it" (gov.js:140).
- Report ages count from arrival at the desk (r.hour = event hour + delay), so "3 h ago" and "Last report 3 h old" understate how old the sighting is (gov.js:48, 135-138).
- Ask the yardmaster always produces the same Holt Greer report, unrelated to what she has done (gov.js:191).
- Strings built in gov.js outside the catalog: report event text "(proves; does not prove ...)" (gov.js:49), the Nova Trentô "does not prove" value 'Who.' (gov.js:79), the ban request preview "The post answers in four hours and needs a 2 or more. A sent message does not close the border; a confirmed one does." (gov.js:131, also FLAG-3), "Needs {card}." on event choices (gov.js:246), ages 'just now', ' h', ' old' and odds 'certain', 'in 6' (gov.js:121, 135-138), and the floating "+1 exposure" in ui.js:558.
- British spellings: "licence" (GOV_CARDS.operator, GOV_ORDERS.lean, gov.label.open_a_licence_review_on, gov.line.the_review_is_open_say, ENEMY_ACTIONS lean_operator text) and "petrol" (photo event).

### Position leaks (government view must never reveal her real position)

- Naming a stop to the minister: the reply is "Good. Sosā has the address." when she is there and "{place}. I will say so at six." plus "The minister names {place} on the evening news..." when she is not (gov.js:168). The player learns at once whether she is at that stop, for free and with no roll.
- Government round summaries and the scene show her side's stats: exposure change lines (ui.js:518, 530-531) and the floating "+1 exposure" (ui.js:558) come from her sim events pushed into this side's log by orders and news. lean_operator also pushes a stage event, so her aircraft stage label appears in the summary (ui.js:523). These are not positions but are hidden state of hers.
- gov.report.a_patrol_report_in names her real stop every time she is stopped, 1 hour later (gov.js:86). It is a legitimate report but it is always true and always delivered, unlike the 50% travel reports.
- No in-scope catalog string states her position on its own; all position information arrives through reports, searches and the minister reply above.

### Interface and guided runs

- **The escape demo never stops being scripted.** The airfield step says "the rest is yours, with real dice" and start.demo_note says "The rest is yours". Code: Tutorial.stop() only resets the coach (src/tutorial.js stop); the run keeps 8 queued dice (6, 5, 5, 6, 5, 5, 6, 5), 3 queued Sosā actions and s.tutorial = true, so after Finish or Leave there are no police stops, no news cards, and police attention is capped at 9 (src/sim.js:243, 260, 472). Only the government side clears its script (src/gov.js:347, called from released() in src/ui.js:733). The saved run keeps the same state on resume.
- **Two names for one stat.** The briefing says "Police attention" (brief.police_attention, src/ui.js briefEscape); the scene header, result rows, help, about page, demo steps and the floater say "exposure" (scene.exposure, sum.exposure*, help.rounds, about.p6, tutorials escape.map and gov.pressure, src/ui.js:558 hard coded "+N exposure").
- **Three wordings for one phone call.** The button reads "Duartē Albukerkē about aircraft" and "Bīr Amādū Salek about your visa" (phone.call_about, src/ui.js:185, no "Call", full name, "your visa"); the briefing suggestion uses the sim label "Call Bīr Amādū Salek about entry visa" (sim.label.call_about, src/sim.js:205, via brief.phone_suggest src/ui.js:405); the demo tells the player to tap "Call Duartē about aircraft" and "Call Salek about your visa", which match neither.
- **The sponsor's terms are hidden until after the call that accepts them.** The demo says "read his terms first, because calling him means yes". The call preview shows only "Ask Salek for the visa on Salek's terms" and the reply time (src/sim.js:206, 214); the terms appear only after the call, as "You now owe ..." (src/sim.js:419). In the demo there is no destination map either, so the player never sees the price beforehand.
- **Hidden roll modifiers.** The move preview lists only card reductions (src/sim.js:191). The travel ban (+1 at border posts, src/sim.js:182), the face rule for Teresā (+1 at every border post, src/sim.js:186), a checkpoint (+1, src/sim.js:183), the Esmeralda request (+2 at takeoff, src/sim.js:184) and news modifiers (s.mods, src/sim.js:185) change the number with no explanation. The demo step "post_rail" asks the player to read how the ban changes the roll; the screen only says "Your cards lower it: influence 1" next to a 5.
- **Certain moves report a roll that never happened.** The move card says "No roll needed" / "Certain", but the sim records die 6, need 1 (src/sim.js:368, also 366 for the escort post), so the result card says "Rolled 6, needed 1" (result.rolled, src/ui.js:491) and the log says "You rolled 6 and needed 1" (log.rolled).
- **Sosā's questioning roll runs backwards.** An ally holds when the die is 3 + trust or lower and talks on 4 + trust or higher (src/sim.js:502); the log prints "who holds with 2 against 4" in the same "X against Y" frame used for ally rolls where higher is better (log.pressed_holds, log.pressed_breaks, log.ally_delivers).
- **"Came through" when nothing came.** A won ally roll is shown as delivered (sum.delivered and log.ally_delivers, src/ui.js:516, 557) even when resolveJob returns early: the crew will not confirm without a destination (src/sim.js:483), and the visa stays "still considering" when the destination will not accept (src/sim.js:484).
- **"Not yet" when the job is gone.** A failed ally roll deletes the job (src/sim.js:478, 486) and nothing retries, but the text says "has not delivered yet" / "has nothing yet" (log.ally_not_yet, sum.not_yet).
- **"Talked" for people who never talked.** whoMark shows "Talked" for any turned person (src/ui.js:233). Refusing the sponsor (src/sim.js:450) and putting off Gianlūka (src/sim.js:441) both set turned, so a refused Salek in the Abroad list reads "Talked" though he spoke to nobody.
- **"Keep trusting" marks a person "Doubted".** The rumor choice "Keep trusting {name}" applies fx.doubt (src/sim.js:299, 330), and whoMark then shows "Doubted".
- **A level shown as a count.** scene.held_again "Held {hold} of three so far" and round.held print s.hold, the current police ladder step, which drops one step after 12 quiet hours (src/sim.js:470) and starts at 2 after Monday noon (src/sim.js:261); s.holds is the real count. The briefing and help also say "each stop is worse than the last" and "the third is house arrest", which ignores the 12 hour drop.
- **Broken place names in the Sosā box.** src/ui.js:108 prefixes "the " and lowercases any short name that has a capital, so scene.sosa_right / sosa_wrong render "the santa laura", "the nova trentô", "the salta", "the the line", "the susana" (desktop only).
- **A cause the code does not check.** sum.exposure_round_here says police attention rose "because Sosā is looking where you are", chosen only because s.belief equals s.pos when the card renders (src/ui.js:501). The rise can come from a search that found you (+2), an ally who talked (+2 or +3), a betrayal (+3) or a stop reset.
- **The government side reports a stat it never shows.** sum.exposure_round is reused for her police attention on the government card (src/ui.js:502), without saying whose, and the government screen hides the meter (src/ui.js renderScene gov hides #heat and .exp). The demo step gov.pressure also explains a number the player cannot see.
- **Government phase "Reports" holds the news, not the reports.** PH_LABEL maps the news phase to "Reports" on the government side (src/ui.js:366). That phase shows desk event cards; the reports arrive in the "Her move" card behind the button "Read the new reports".
- **Follow points the search without putting anyone there.** Follow changes g.belief only (src/gov.js:189); Sosā's real search position (c.belief), which raises her police attention, moves only when an order that acts runs (src/gov.js:193). After the demo's Follow step the scene and briefing say "Your search: Santa Laura" while c.belief is still the residence (trace). The demo step gov.pressure then says "When your search sits on her stop, her exposure climbs".
- **Orders run longer than their listed hours.** A government order lists its hours, but time advances in whole moves of hers (src/gov.js:92), so the demo's 3 hour "Circulate the travel ban" ran from hour 1 to hour 6.
- **Raw ID in the government log.** src/gov.js:167 sends the option ID as the answered label, so the log reads "You said ask_time." (log.answer).
- **The briefing sends the player to a report that does not place her.** brief.gov_report_* says the newest report "puts her at {place}" and brief.gov_job_search says "Search {place}, where the newest report puts her", taking v.reports[0] whatever it is (src/ui.js:419, 424). In the demo the newest report at hour 6 is the aviation desk's "A charter to Lāyūna is booked out of Susana", which "does not prove she has reached it". The Search order also only acts at the current search stop; another stop needs Follow first (src/gov.js orders).
- **Helping Nonā Rosa leaves Nova Trentô without Baca's answer.** The stop objective says "Leave for the border once Baca has your name" and "Take the road to Salta" needs reception stage 1, but help_host is also an exit (src/sim.js:16), so a successful truck job carries the player to Salta with reception at 0, as the demo does. The demo never tells the player they moved.
- **A successful decoy raises police attention.** Decoy convoy success points Sosā's search at the residence (data.js decoy success belief 0) and the 3 hours pass before the player leaves the stop (src/sim.js:385-386), so attention climbs during the move that fooled him (demo: 1 to 2).
- **The midnight freight is not at midnight.** Boarding works any time from 10 p.m. to 5 a.m. (src/sim.js:164); the demo boards at Sunday 3 a.m. under the coach title "Midnight", and the success line says the train "pulls out at 12 past".
- **Susana's arrival claims a request that may not exist.** The airfield arrival text says "Sosā has asked them to hold you" (data.js:188) whether or not flags.asked is set; in the demo it is false.
- **The destination effect overstates.** sim.effect.crew_booking_can_proceed says "The crew books a flight to {city}" when confirming only reaches "charter found"; "crew confirmed" takes another call (src/sim.js:434).
- **The escape ending drops the epilogue.** renderOver shows one line (over.why_*) and, on the government side, the debrief; the escape s.over.reason with its epilogue (src/sim.js:520-536) is built and never shown (src/ui.js renderOver).
- **"Lie low" does not hide you.** result.lay_low_title "One hour out of sight" and the button "Lie low for an hour" describe concealment; wait only passes an hour (src/sim.js:357) and drift continues if Sosā is on your stop.
- **A demo highlight that is invisible on a phone.** escape.map highlights #heat, which is display:none under 1000px (src/style.css:53).
- **Three names for the demo.** "Play the demo" (start.tutorial), "Guided run" (menu.guided), "Tutorial ended" (log.tutorial_ended).
- **Two titles for Sofīā.** Data.GOV.title is "aide to the incoming government"; the government demo intro and about.p7 say "aide to the incoming minister".
- **Fixed facts that the game randomizes.** about.p3 says three people have talked to Sosā; newRun marks two (one to three on a daily, none in the demo) (src/sim.js:51-52). about.p5 says a jet landing without a visa is met on the apron; it is only if the country does not accept you (src/sim.js:383). about.p8 says daily players get the same dice; they get the same seed, and dice are drawn in order, so different choices see different rolls.
- **Invented in the government demo.** gov.intro says Teresā "has a jet booked for Tuesday afternoon"; no booking exists at the start and the deadline is her immunity at hour 72. gov.pressure says "She will run the moment she knows you are close"; when found she only accepts moves needing up to 6 instead of 5 (src/gov.js:63-64).
- **Unused catalog strings.** brief.time, about.back, daily.held_never, daily.held_once, daily.held_twice, daily.held_many are not referenced in src/; daily.at is wrapped by apTime() in src/ui.js, which is never called.
- **Card names mid sentence.** sum.card, sum.lost, log.gives and log.card_lost insert names like "The party machine" and "Two more cars like yours" with their capital (src/ui.js:519-520, 560-561); ui.js already has inSentence() for this and uses it only on the route.
- **The tutorial goal field is never rendered** (src/ui.js renderCoach shows step, title and body).
- Open decisions already recorded and left alone here: FLAG-3 (gov.confirm title, body, goal; brief.gov_need_ban; brief.gov_not_confirmed), FLAG-4 (gov.hold title and body; brief.gov_need_hold; brief.gov_asked; brief.gov_job_hold; about.p7), FLAG-5 (brief.jet).

## Found November 1, 2026, while fixing the game in place

See [aar-fix-in-place.md](aar-fix-in-place.md). Each item is the owner's call.

24. **Resolved November 1, 2026: moves that need no roll are now sure things, whatever the checkpoint or earlier choices.** **A move with no roll can still fail silently.** "Call your contacts", "Sleep" and "Take the road to Salta" need a 1. A checkpoint or an earlier choice raises that to 2, and their failure line is empty, so the player sees a failed roll and no explanation (data.js, the colônia moves).
25. **Changing which country accepts you each run needs a way to change destination.** The destination is fixed in `newRun`, and the visa for a country that refuses you never arrives. Randomizing which country accepts would leave two runs in three unwinnable from the first screen. **Resolved November 1, 2026:** owner decision, the country the player picks is the right one for that run.
26. **(Moot: single-use help was reverted when the deck left the screen.)** **Two kinds of help still work without being used up.** Holding "A report held one day" keeps the travel ban off the desk at the line, and holding Nando's cars makes the house-arrest climb easier. Neither is used up by that. Decide whether passive help should be spent too.
27. **Where should the escape sit?** With the corrected harness, the simple policy wins 27.0% as Teresā and 24.7% as Matēu, down from 43.7% and 37.0% at the start of the session. The hold ladder AAR named about 40% as the target. The harness spends every card at once, so a player who keeps help back should do better.

## Language pass, November 1, 2026: questions about meaning

Every player-facing string (1,483) was checked against Humanizer, AP style and the project's UI rules; 111 were rewritten. These were left alone because the right wording depends on how the game should work.

28. **Paying costs nothing.** Several moves say you pay (Holt, the cousin, the coast post, the yardmaster), but the game has no money. The card help no longer says "some people only move for money".
29. **"Your sponsor keeps count"** (the sponsor's line card) and **"on {sponsor}'s terms"** (the first visa step) describe a price the rules do not charge; the demand is optional and only improves the odds.
30. **"Ask {sponsor} to seek visa"** says the sponsor "will want something back" without naming it; each sponsor wants something different and the string has no slot for it.
31. **The time-out ending** always says Esmeralda has closed the airfield, which no rule does.
32. **Unreachable text since every country accepts you:** the "landed" endings, the daily "landed" line and the "still considering" ledger line.
33. **Government side:** "On failure: {fail}" is a label-and-value row that needs a code change to become a sentence; the photo event's title says a paper has the photo while its text says a radio station does; the press conference is "at six" with no a.m. or p.m.; "until you send one" in the follow order does not say one what; the demo says "your offices drive there" while the game says "every desk in the province drives there".
34. **About page:** "they stand on real ground" is unclear.
35. **The blizzard line** "the storm costs Sosā half of them too" should say plainly that Sosā loses his next move.
36. **Dead strings:** sum.exposure_round_here and brief.hours_escape are no longer used.

**Decided November 1, 2026 (owner), and done:**
- 28: Money stays out of the game. Paying is a narrative choice, not a tracked resource.
- 29 and 30: A sponsor's demand is optional and improves the visa odds. Refusing now keeps the sponsor asking at the usual odds (it used to end the visa), "Ask for a week" is gone, and calling a sponsor no longer counts as agreeing. The map, the call preview and the first visa step say what each sponsor wants.
- 31: The time-out ending says you ran out of time.
- 32: The landing endings, their daily and ledger lines, the country-accepts flag and its code are removed. Winning, running out of time, house arrest and the president's deal are unchanged.
- 33: "If the order fails, ..."; the photo is a newspaper's; the press conference is at 6 p.m.; the follow order says the police stay until you order a search or a checkpoint at the new stop; the demo says every desk in the province drives there.
- 34: The About page says the game's map places the countries on the real globe.
- 35: The blizzard costs Sosā his next move.
- 36: Removed 13 strings no code reaches, after checking for IDs built at runtime.

## Companions, November 2, 2026: questions for the owner

37. **Resolved Nov. 2, 2026 (owner: "The border is closed once it is sent"):** ~~Confirming the travel ban at the post changes nothing unless Tomás is Sofia's companion.~~ The confirm step is gone; the ban is in force once sent, and the judge and the sergeant can get the post to let it slide.
38. **The police's circulate line says "From now on"** even when Paulo holds the order in the outbox for 12 hours. His sentence follows it and gives the real time, but the first sentence is still wrong for that run.
39. **Resolved Nov. 2, 2026:** ~~Inês and Emilio stand in for lodging and food systems that do not exist yet.~~ Food and sleep are built (see docs/companions.md); Inês and Emilio work through the food and sleep screen.
