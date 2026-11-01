# C. Government side: player text audit

Scope: src/data.js GOV, GOV_CARDS, GOV_ORDERS, GOV_EVENTS; content/coalition/ui.json ids gov.* (not gov.debrief.*, not gov.share), scene.*, report.*, desk.*, government-side route.*, nav.desk, nav.orders, nav.reports, action.send_order, action.send, action.wait_gov.

Traced through src/gov.js, src/sim.js, src/ui.js. Note: src/ui.js changed length while this audit ran (737 to 748 lines); ui.js line numbers below are from the later read.

Key facts used below (all traced):
- g.belief is the stop your orders act on ("your search"). c.belief is where the police are actually watching on her side; it drives her police attention (exposure). c.belief is set to g.belief only when an order with an `act` runs (search, circulate, call in, checkpoint, brief the papers, review licence) or an event with fx.act runs (gov.js:193, gov.js:278). "Follow" moves g.belief only (gov.js:189).
- On the government side her police attention rises 1 every 4 hours while c.belief is on her stop (sim.js:468), +1 when a search finds her (sim.js:498), and a search stops her if it finds her at 7 or more (sim.js:498).
- "warn" (her side learns something): her attention falls and, if the police were on her stop, they lose it (c.belief = -1) (gov.js:269).
- "minister" standing (g.standing) changes nothing in play; it only picks a debrief sentence (gov.js:276, gov.js:331).
- The order preview says "Cannot fail." whenever the order has no `fail` text (gov.js:122), not when the roll is certain.
- The registry card is never added to g.hand anywhere (grep: only data.js:261, data.js:290, gov.js:148), so it is unobtainable.

## 1. Strings

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| GOV.name | Sofīā Leōnī | Role name on start screen (ui.js:640) and log.start_gov (ui.js:74). | Who they play. | | KEEP |
| GOV.title | aide to the incoming government | Start screen subtitle, capitalized (ui.js:640), and log.start_gov. | Their role. | | KEEP |
| GOV.blurb | Stop the candidate's flight before Tuesday afternoon. Your orders stop at the border. | Start screen blurb (ui.js:640). Government wins if she is not out by hour 72 (Tue 2 p.m.), is put under house arrest, or is sent back. Orders are blocked only at Susana, and only search, checkpoint and call-in, until Esmeralda agrees (gov.js:116-117). Orders at the line (stop 4) work. | What winning means and the one real limit. | Keep the candidate from flying out before Tuesday at 2 p.m. Past the border, your patrols need Esmeralda's agreement. | REWRITE |
| GOV_CARDS.*.tag | watch, patrol, records, rail, operator, introduction | Shown capitalized as the card tag (ui.js:194) and in the preview "Your cards lower it: patrol 1" (gov.js:122). Only patrol, records, rail, operator appear in any order's mods (data.js:268-276). | Which orders a card helps. | | KEEP |
| GOV_CARDS.watch.name | The watch team | Card in hand from the start (gov.js:26). | | | KEEP |
| GOV_CARDS.watch.from | Inspector Sosā | Card footer (ui.js:194). | | | KEEP |
| GOV_CARDS.watch.works | The residence and the road out of the capital. | reach: residence, road (data.js:259). The road stop is shown everywhere else as "Santa Laura". No order uses the watch tag, so the card lowers no roll. | Where it counts, in the stop names the route uses. | The residence and Santa Laura. | REWRITE |
| GOV_CARDS.watch.text | Two unmarked cars and four officers. They see what passes them and nothing else. | Flavor. The card has no mechanical effect (see Design inconsistencies). | | | KEEP |
| GOV_CARDS.desk.name | The provincial desk's patrol | Starting card. Tag patrol: lowers Search by 1 and Checkpoint by 2 when your search is at any Valdórian stop (gov.js:103, data.js:268, 273). | | | KEEP |
| GOV_CARDS.desk.from | The Santa Laura commander | Footer. | | | KEEP |
| GOV_CARDS.desk.works | Valdória, up to the line. A patrol can search one place at a time. | reach VALDORIA = residence to border (data.js:57). Second sentence restates how all orders work. | Where it counts. | Any stop in Valdória, up to and including the line. | REWRITE |
| GOV_CARDS.desk.text | A commander who acts quickly for you once and then wants a better report. | No "once" limit exists: the bonus applies to every search and checkpoint while it reaches (gov.js:103, 114). "Wants a better report" has no mechanic. | What the card does for them. | The commander's patrol makes your searches and checkpoints easier. | REWRITE |
| GOV_CARDS.registry.name | Registry access | Never added to the hand. Appears only in the disabled reason "Needs registry access." on the tipster event (gov.js:246). | | | KEEP |
| GOV_CARDS.registry.from | The civil registry | Never shown (card unobtainable). | | | KEEP |
| GOV_CARDS.registry.works | Any Valdórian desk that checks a name. | Never shown. | | | KEEP |
| GOV_CARDS.registry.text | Who asked for what, and when. It never says where anyone is now. | Never shown. | | | KEEP |
| GOV_CARDS.rail.name | A railway contact | Gained from Ask the yardmaster (gov.js:191) or Get the trains running (data.js:313). | | | KEEP |
| GOV_CARDS.rail.from | The Salta yardmaster | Footer. | | | KEEP |
| GOV_CARDS.rail.works | The Salta yard and the midnight freight. | reach salta. | | | KEEP |
| GOV_CARDS.rail.text | He takes money from anyone and tells you about it. | Holding it does nothing: the only order with a rail bonus is Ask the yardmaster, which is hidden once you hold the card (gov.js:112). | | | KEEP |
| GOV_CARDS.operator.name | The operator's licence | From the licence review request (gov.js:205). Unlocks the Review order (gov.js:111) and lowers it by 2 when your search is at Susana. British spelling. | | The operator's license | REWRITE |
| GOV_CARDS.operator.from | The aviation desk | Footer. | | | KEEP |
| GOV_CARDS.operator.works | The Susana charter operator, through his Valdórian licence. | reach airfield. British spelling. | | The Susana charter operator, through his Valdórian license. | REWRITE |
| GOV_CARDS.operator.text | A review can pause a booking. It cannot find the passenger. | Matches lean_operator: drops her aircraft one stage if it had a crew (sim.js:501). | | | KEEP |
| GOV_CARDS.esm_intro.name | An Esmeraldan introduction | Gained when Esmeralda agrees (gov.js:204). Removes the block on search, checkpoint and call-in at Susana (gov.js:117). Shown greyed when not held (ui.js:602). | | | KEEP |
| GOV_CARDS.esm_intro.from | The embassy in Baca | Footer. | | | KEEP |
| GOV_CARDS.esm_intro.works | Esmeraldan officials: the post, the tower. | Its only effect is unblocking three orders at Susana. No order uses the introduction tag, so it lowers no roll at the post or anywhere. | What it lets them do. | Lets your search, checkpoint and call-in orders work at Susana. | REWRITE |
| GOV_CARDS.esm_intro.text | A name at the interior ministry who will take your call. Nothing is promised. | Those orders still roll, with one added to the number needed abroad (gov.js:119). | | | KEEP |
| GOV_ORDERS.search.name | Search {lv} | lv = place(g.belief) (gov.js:120). | | | KEEP |
| GOV_ORDERS.search.who | the provincial patrol | Button meta "by ..." and preview (gov.js:120, 122). | | | KEEP |
| GOV_ORDERS.search.text | Send people to the place you believe she is. If she is there, they get close. If not, you learn that. | Sets police watch to your stop (gov.js:193). If she is there: at attention 7+ she is stopped (climbHold), otherwise attention +1 (sim.js:498); report either way (gov.js:195). Police keep watching that stop afterward, so her attention keeps rising every 4 hours while she stays (sim.js:468). | The stop result, the stop-her threshold, and the lasting watch. | The patrol searches the stop you are watching and you get a report. If she is there and the police have been on her for a while, they stop her. Police keep watching that stop afterward. | REWRITE |
| GOV_ORDERS.search.fail | The patrol arrives late and finds a cold room. | On failure nothing happens: no report, police watch unchanged (gov.js:198). "Finds a cold room" tells the player she was not there, which the code never checked. | That a failed order tells them nothing. | The patrol never gets there, and you learn nothing. | REWRITE |
| GOV_ORDERS.watch_house.name | Keep watch on the house | Offered when your search is at the residence or Santa Laura (where: [0, 1]). | | | KEEP |
| GOV_ORDERS.watch_house.who | the watch team | | | | KEEP |
| GOV_ORDERS.watch_house.text | Certain. You learn whether anyone is still inside. You learn nothing new if she has gone. | Report is truthful: "someone is inside" if she is at the residence, otherwise "the house is empty" (gov.js:190). So you do learn she has gone. "Certain" repeats the odds line and is false when a news effect raises the number needed (gov.js:118). | What they learn. | The watch team tells you whether anyone is still in the house. | REWRITE |
| GOV_ORDERS.follow.name | Follow the latest report: {rep} | rep = place of the newest report not at your current stop, decoys included (gov.js:105, 120). Label-and-value form. | A verb phrase naming where the search goes. | Move your search to {rep} | REWRITE |
| GOV_ORDERS.follow.who | you | Preview capitalizes it: "Takes 1 hour, You acts" (gov.js:122). | | | KEEP |
| GOV_ORDERS.follow.text | Move the search to where the newest report points. | Changes g.belief only (gov.js:189). The police watch (c.belief) stays where your last search, checkpoint or other order put it, so her attention does not start rising at the new stop. | That only their aim moves, not the police. | Your next orders act at the stop the newest report names. The police stay where they last searched until you send one. | REWRITE |
| GOV_ORDERS.circulate.name | Circulate the travel ban | | | | KEEP |
| GOV_ORDERS.circulate.who | the provincial desks | | | | KEEP |
| GOV_ORDERS.circulate.text | Every post and the border get the ban. A sent message does not close the border until the post confirms. | Success sets flags.restriction (sim.js:500): her border crossing needs one more unless she holds a delay card (sim.js:182). Confirmation adds nothing. | | | FLAG-3 |
| GOV_ORDERS.circulate.fail | Half the desks file it. A clerk calls a friend of hers. | On failure no ban is set, police lose the stop they were watching (c.belief = -1) and a report says her side knows (gov.js:198). "Half the desks file it" suggests a partial ban; there is none. | What failed and what it cost. | A clerk tips off her side before the ban goes out. The police lose the stop they were watching. | REWRITE |
| GOV_ORDERS.press.name | Call in one of her people | | | | KEEP |
| GOV_ORDERS.press.who | Inspector Sosā | | | | KEEP |
| GOV_ORDERS.press.text | Sosā questions someone who has helped her. Some hold. Some tell him where she was last seen. | press_ally (sim.js:502): picks a helper who gave her a card; rolls against trust. If the helper talks, the helper turns on her, police move to her stop, her attention +2. The government player gets no report and their search does not move (the leak handler at gov.js:85 only reads her own turn's events, which never include press_ally). If she has no such helper, Sosā checks airport lists and finds nothing. | That talking helps the police but does not tell them the place. | Sosā questions one of her helpers. If the helper talks, the police go to where she is and she loses that helper, but you are not told the place. | REWRITE |
| GOV_ORDERS.press.fail | Nobody answers the summons today. | Failure does nothing. | | | KEEP |
| GOV_ORDERS.roadblock.name | Checkpoint on the road out of {lv} | | | | KEEP |
| GOV_ORDERS.roadblock.who | the provincial patrol | | | | KEEP |
| GOV_ORDERS.roadblock.text | For six hours every move out of that place is harder. | flags.roadblock = your stop for 6 hours (sim.js:505): every action she tries at that stop needs one more (sim.js:183). One checkpoint at a time; a new one replaces it. | | For six hours, everything she tries at that stop needs one more on the die. | REWRITE |
| GOV_ORDERS.roadblock.fail | The checkpoint stands on the wrong road. | Failure does nothing. | | | KEEP |
| GOV_ORDERS.story.name | Brief the papers that she has left | | | | KEEP |
| GOV_ORDERS.story.who | the ministry press office | | | | KEEP |
| GOV_ORDERS.story.text | A public claim. It can calm the minister and send your own offices after the wrong lead. | press_story (sim.js:504): her attention falls by 1 and police move to the residence or Santa Laura, whichever she is not at. No minister effect (g.standing untouched). dc 2 with no fail text, so it can fail while the preview says "Cannot fail." | That it helps her, and what it does to the police. | Her side relaxes and the police move to a stop where she is not. | REWRITE |
| GOV_ORDERS.rail_ask.name | Ask the Salta yardmaster who is paying | Only at Salta, hidden once you hold the rail card (gov.js:107, 112). Seven words. | | Ask the yardmaster who paid | NEEDS-BUDGET |
| GOV_ORDERS.rail_ask.who | the railway contact | | | | KEEP |
| GOV_ORDERS.rail_ask.text | He tells you who asked about the midnight freight. | Success gives the rail card and always the same report: Holt Greer took money for a crate (gov.js:191), whatever she has done. | What they get. | He names who took money for the midnight freight, and he becomes your railway contact. | REWRITE |
| GOV_ORDERS.rail_ask.fail | He wants to see who else is asking first. | Failure does nothing. | | | KEEP |
| GOV_ORDERS.lean.name | Review the charter operator's licence | After hour 12, needs the operator card (gov.js:108, 111). Name nearly matches the request "Review the operator's licence", which does something else. British spelling. | A name that differs from the request. | Press the charter operator | REWRITE |
| GOV_ORDERS.lean.who | the aviation desk | | | | KEEP |
| GOV_ORDERS.lean.text | The operator withdraws the crew until she reassures him. It pauses the booking; it does not find her. | lean_operator (sim.js:501): once only. If her jet already has a crew (stage 3+), it drops back one stage. When she reaches Susana the pilot asks her to pay or call Vélez (sim.js:145). Otherwise no effect. dc 3, no fail text, so preview says "Cannot fail." | When it works and what it costs her. | If her jet already has a crew, the operator pulls the crew until she reassures him. | REWRITE |
| GOV_EVENTS.tipster.title | A caller wants money | News card title and log (gov.js:222, 246). | | | KEEP |
| GOV_EVENTS.tipster.text | A man says he drove her this morning. He wants cash before he says where. | | | | KEEP |
| GOV_EVENTS.tipster.choices.pay.label | Pay him | 1 h, roll 4: true report in 1 h, or a false report. | | | KEEP |
| GOV_EVENTS.tipster.pay.win.say | He names the road and the car. It checks out. | lead 1: true report of her current stop arrives in an hour (gov.js:256). | | | KEEP |
| GOV_EVENTS.tipster.pay.lose.say | He names a town. He has never been there. | false: a report names a random other stop (gov.js:260). | | | KEEP |
| GOV_EVENTS.tipster.choices.trace.label | Trace the call instead | needs registry, which is unobtainable, so always disabled (gov.js:246). | | | KEEP |
| GOV_EVENTS.tipster.trace.say | The registry finds the number. The number finds the car. | Unreachable. | | | KEEP |
| GOV_EVENTS.tipster.choices.hang_up.label | Hang up | No effect. | | | KEEP |
| GOV_EVENTS.leak.title | The minister leaks your lead | | | | KEEP |
| GOV_EVENTS.leak.text | He told a columnist you are looking at {there}. It runs in the morning edition. | {there} = your search stop (gov.js:213). | | | KEEP |
| GOV_EVENTS.leak.confirm.label | Confirm it on the record | minister +1, warn 1. | | | KEEP |
| GOV_EVENTS.leak.confirm.say | The minister likes the headline. So does she. | warn: her attention -1; police lose her stop if they had it (gov.js:269). | | | KEEP |
| GOV_EVENTS.leak.deny.label | Deny it | minister -1 only. | | | KEEP |
| GOV_EVENTS.leak.deny.say | The minister reads your denial in his own paper. | | | | KEEP |
| GOV_EVENTS.leak.spin.label | Tell the paper she has crossed | 1 h, roll 3. | | | KEEP |
| GOV_EVENTS.leak.spin.win.say | Her people relax. Someone gets careless on the phone. | press 1: her attention +1. | | | KEEP |
| GOV_EVENTS.leak.spin.lose.say | The columnist checks with the border post and prints that too. | minister -1. | | | KEEP |
| GOV_EVENTS.judge.title | The duty judge wants a hearing | after hour 4. | | | KEEP |
| GOV_EVENTS.judge.text | He will not sign the order for the border post until a hearing tomorrow. | Choices move the ban between confirmed and sent; confirmation has no effect. | | | FLAG-3 |
| GOV_EVENTS.judge.wait_judge.label | Wait for the hearing | unban: confirmed drops to sent (gov.js:273). | | | FLAG-3 |
| GOV_EVENTS.judge.wait_judge.say | The post keeps the old list for one more night. | Same. | | | FLAG-3 |
| GOV_EVENTS.judge.other_judge.label | Find another judge | 2 h, roll 4. On loss the hours stay 2 (lose.hours replaces, gov.js:264). | | | KEEP |
| GOV_EVENTS.judge.other_judge.win.say | A judge in Santa Laura signs at his kitchen table. | ban: sets the travel ban if it was not on, and marks it confirmed (gov.js:272). | | | KEEP |
| GOV_EVENTS.judge.other_judge.lose.say | Every judge you call has heard from the first one. | | | | KEEP |
| GOV_EVENTS.judge.around.label | Have the minister call the post | ban, minister -1, warn 1. | | | KEEP |
| GOV_EVENTS.judge.around.say | The post confirms. Her lawyers call it irregular on the radio. | | | | KEEP |
| GOV_EVENTS.sightings.title | Three sightings at once | | | | KEEP |
| GOV_EVENTS.sightings.text | Callers place her in Santa Laura, in Salta and on the coast road, all in the same hour. | Fixed text; "coast road" is not a stop. | | | KEEP |
| GOV_EVENTS.sightings.all_three.label | Send a patrol to each | 2 h, orders harder 6 h, false report. | | | KEEP |
| GOV_EVENTS.sightings.all_three.say | Three patrols, three empty rooms. The desk is stretched thin. | The code never checks where she is, so "three empty rooms" can be false (she may be in Santa Laura or Salta). Then a false report arrives. | What it cost. | Three patrols go out at once, and the desk is stretched thin. | REWRITE |
| GOV_EVENTS.sightings.plates.label | Check the one that gave plates | 1 h, roll 4. | | | KEEP |
| GOV_EVENTS.sightings.plates.win.say | The plates match a car from her convoy. | lead 0: true report now. | | | KEEP |
| GOV_EVENTS.sightings.plates.lose.say | The plates belong to a dentist. | false report also arrives. | | | KEEP |
| GOV_EVENTS.sightings.ignore.label | Ignore all three | | | | KEEP |
| GOV_EVENTS.sosa_alone.title | Sosā wants to drive out himself | | | | KEEP |
| GOV_EVENTS.sosa_alone.text | He wants to take two officers to {there} tonight without telling the desk. | | | | KEEP |
| GOV_EVENTS.sosa_alone.let_him.label | Let him go | act check_belief, 2 h: a search at your stop with a report (gov.js:278). | | | KEEP |
| GOV_EVENTS.sosa_alone.let_him.say | Sosā takes the unmarked car. | | | | KEEP |
| GOV_EVENTS.sosa_alone.keep_him.label | Keep him on the desk | orders easier 6 h. | | | KEEP |
| GOV_EVENTS.sosa_alone.keep_him.say | He sulks, then works the phones harder than anyone. | | | | KEEP |
| GOV_EVENTS.driver.title | One of her drivers calls | | | | KEEP |
| GOV_EVENTS.driver.text | A driver from her convoy wants a promise that he will not be charged. | | | | KEEP |
| GOV_EVENTS.driver.immunity.label | Promise him | minister -1, true report in 3 h. | | | KEEP |
| GOV_EVENTS.driver.immunity.say | He talks for an hour. The minister did not want promises made. | | | | KEEP |
| GOV_EVENTS.driver.bargain.label | Bargain | 1 h, roll 4. | | | KEEP |
| GOV_EVENTS.driver.bargain.win.say | He settles for a lawyer and a lift home. | true report in 1 h. | | | KEEP |
| GOV_EVENTS.driver.bargain.lose.say | He hangs up and calls her instead. | warn 1. | | | KEEP |
| GOV_EVENTS.driver.refuse_driver.label | Refuse | | | | KEEP |
| GOV_EVENTS.strike.title | The rail union walks out | | | | KEEP |
| GOV_EVENTS.strike.text | Salta yard workers strike at midnight. The freight may not run. | The strike never stops the freight. Its only effect is stall 4: every arrangement she is waiting on comes 4 hours later (gov.js:270). | | Salta yard workers strike at midnight. | REWRITE |
| GOV_EVENTS.strike.let_strike.label | Let the strike stand | | | | KEEP |
| GOV_EVENTS.strike.let_strike.say | Nothing leaves Salta. The minister hates strikes. | "Nothing leaves Salta" is not in the code; she can still board. | The real effect. | Her helpers' answers come four hours late. The minister hates strikes. | REWRITE |
| GOV_EVENTS.strike.break_strike.label | Get the trains running | 2 h, gain rail card. | | | KEEP |
| GOV_EVENTS.strike.break_strike.say | The yardmaster owes you for the overtime. | | | | KEEP |
| GOV_EVENTS.photo.title | A paper has a photo | | | | KEEP |
| GOV_EVENTS.photo.text | Rādiô Portô Venla has a blurred photo of her at a petrol station. They want to run it. | "petrol" is British. | | Rādiô Portô Venla has a blurred photo of her at a gas station. They want to run it. | REWRITE |
| GOV_EVENTS.photo.buy_photo.label | Buy it and sit on it | 1 h, true report in 4 h. | | | KEEP |
| GOV_EVENTS.photo.buy_photo.say | The station has a sign. The sign has a town on it. | | | | KEEP |
| GOV_EVENTS.photo.run_it.label | Let them run it | her attention +2, minister +1. | | | KEEP |
| GOV_EVENTS.photo.run_it.say | Her face is on every screen in the province. | | | | KEEP |
| GOV_EVENTS.dinner.title | Dinner at the Esmeraldan embassy | | | | KEEP |
| GOV_EVENTS.dinner.text | The ambassador invites you tonight. Three hours, and he likes to talk. | | | | KEEP |
| GOV_EVENTS.dinner.go.label | Go to dinner | 3 h, holdup (gov.js:274): a pending Esmeralda answer comes within an hour; if not asked yet, the request starts and answers in 3 h. Still needs the 4+ roll. No card is given. | | | KEEP |
| GOV_EVENTS.dinner.go.say | Somewhere after the fish he writes a name on a card. | Suggests the introduction is handed over; it is not. | That it speeds the answer, not secures it. | Somewhere after the fish he promises to hurry Baca's answer. | REWRITE |
| GOV_EVENTS.dinner.deputy.label | Send your deputy | roll 5: holdup. | | | KEEP |
| GOV_EVENTS.dinner.deputy.win.say | Your deputy is a better guest than you. | | | | KEEP |
| GOV_EVENTS.dinner.deputy.lose.say | The ambassador talks about horses all night. | | | | KEEP |
| GOV_EVENTS.dinner.decline.label | Decline | | | | KEEP |
| GOV_EVENTS.storm.title | Snow at the Huhūi passes | | | | KEEP |
| GOV_EVENTS.storm.text | The road service is closing the passes for the night. | Snow has no effect of its own; only Keep your patrol at the post does something. | | | KEEP |
| GOV_EVENTS.storm.hold_post.label | Keep your patrol at the post | crossing 5: checkpoint at the line for 5 h, replacing any other checkpoint (gov.js:271). | | | KEEP |
| GOV_EVENTS.storm.hold_post.say | Your patrol sleeps in the guardhouse and searches every car that tries. | | | | KEEP |
| GOV_EVENTS.storm.pull_back.label | Pull the patrol back | orders easier 4 h. | | | KEEP |
| GOV_EVENTS.storm.pull_back.say | The patrol comes home warm and in a better mood. | | | | KEEP |
| GOV_EVENTS.rival.title | A rival aide wants your file | | | | KEEP |
| GOV_EVENTS.rival.text | Another aide tells the minister he can find her faster. He wants your reports. | | | | KEEP |
| GOV_EVENTS.rival.share.label | Share the file | minister +1, warn 1. | | | KEEP |
| GOV_EVENTS.rival.share.say | He leaks half of it by dinner. | | | | KEEP |
| GOV_EVENTS.rival.refuse_rival.label | Refuse | sooner 2. | | | KEEP |
| GOV_EVENTS.rival.refuse_rival.say | The minister wants your answer two hours sooner. | Moves g.ministerBy; has an effect only if you have not named a stop yet and his follow-up has not come (gov.js:96, 277). | | | KEEP |
| GOV_EVENTS.rival.doctor.label | Share a doctored file | 1 h, roll 3. | | | KEEP |
| GOV_EVENTS.rival.doctor.win.say | He chases a lead you made up. | minister +1. | | | KEEP |
| GOV_EVENTS.rival.doctor.lose.say | He spots the fake and shows the minister. | minister -1. | | | KEEP |
| GOV_EVENTS.bribe.title | Her family asks your price | | | | KEEP |
| GOV_EVENTS.bribe.text | A lawyer for her family asks what it would take to look away for one day. | | | | KEEP |
| GOV_EVENTS.bribe.report_it.label | Report the offer | her attention +1, minister +1. | | | KEEP |
| GOV_EVENTS.bribe.report_it.say | A bribery file opens. Her lawyers stop answering their phones. | | | | KEEP |
| GOV_EVENTS.bribe.play_along.label | Pretend to accept | 1 h, roll 4. | | | KEEP |
| GOV_EVENTS.bribe.play_along.win.say | The lawyer tells you where to send the money. | true report in 1 h. | | | KEEP |
| GOV_EVENTS.bribe.play_along.lose.say | The lawyer knows a trap when he hears one. | warn 2. | | | KEEP |
| GOV_EVENTS.bribe.hang_up_bribe.label | Hang up | | | | KEEP |
| GOV_EVENTS.sergeant.title | The sergeant is her cousin | Title says cousin; text says married to her cousin. | | The sergeant is family | REWRITE |
| GOV_EVENTS.sergeant.text | The desk says tonight's sergeant at the border post is married to her cousin. | | | | KEEP |
| GOV_EVENTS.sergeant.replace.label | Replace him | 3 h, ban (sets the ban if off, marks confirmed). | | | KEEP |
| GOV_EVENTS.sergeant.replace.say | A sergeant from Salta takes the shift. He reads every name. | | | | KEEP |
| GOV_EVENTS.sergeant.watch_him.label | Watch him | 1 h, roll 4. | | | KEEP |
| GOV_EVENTS.sergeant.watch_him.win.say | He makes a call from the guardhouse. You hear every word. | true report now. | | | KEEP |
| GOV_EVENTS.sergeant.watch_him.lose.say | He notices the watcher and loses the list. | unban: confirmed drops to sent, no effect. | | | FLAG-3 |
| GOV_EVENTS.sergeant.leave_him.label | Leave it | unban, no say line. | | | FLAG-3 |
| GOV_EVENTS.drone.title | The air force offers a drone | | | | KEEP |
| GOV_EVENTS.drone.text | A drone can watch one road all night. The general wants a signature. | Effect is orders easier 8 h, at any stop. | | | KEEP |
| GOV_EVENTS.drone.sign.label | Sign for it | | | | KEEP |
| GOV_EVENTS.drone.sign.say | The drone goes up. The minister reads about it in the morning. | minister -1. | | | KEEP |
| GOV_EVENTS.drone.no_drone.label | Decline | | | | KEEP |
| GOV_EVENTS.presser.title | The minister wants a press conference | | | | KEEP |
| GOV_EVENTS.presser.text | He wants you beside him at six, promising she will be found by Monday. | | | | KEEP |
| GOV_EVENTS.presser.stand.label | Stand beside him | 2 h, minister +1, warn 1. | | | KEEP |
| GOV_EVENTS.presser.stand.say | Her people watch it twice and change their plans. | | | | KEEP |
| GOV_EVENTS.presser.send_sosa.label | Send Sosā instead | orders harder 4 h. | | | KEEP |
| GOV_EVENTS.presser.send_sosa.say | Sosā hates cameras. He takes it out on the desk. | | | | KEEP |
| GOV_EVENTS.presser.skip.label | Say you are busy | minister -1. | | | KEEP |
| GOV_EVENTS.tower.title | A phone touched a tower | | | | KEEP |
| GOV_EVENTS.tower.text | The carrier says a number tied to her family pinged a tower an hour ago. | | | | KEEP |
| GOV_EVENTS.tower.tower_now.label | Demand the tower now | 2 h, roll 4. | | | KEEP |
| GOV_EVENTS.tower.tower_now.win.say | The carrier sends the tower and a map. | true report now. | | | KEEP |
| GOV_EVENTS.tower.tower_now.lose.say | The carrier tells its lawyers, who tell hers. | warn 1. | | | KEEP |
| GOV_EVENTS.tower.paperwork.label | File the paperwork | true report in 6 h. | | | KEEP |
| GOV_EVENTS.tower.paperwork.say | The answer will come through the proper channel. | | | | KEEP |
| scene.gov_goal | stop {her} before | Goal box and clock line, followed by "Tue 2 p.m." (ui.js:96). Government wins if she is not out by then; nobody has to catch her. "Stop her before" reads as "catch her by". | What winning means. | keep {her} from flying out before | REWRITE |
| scene.last_report | Last report {age} | age is "just now" or "3 h old" from lastReportHour = report arrival time, not sighting time (gov.js:135-138). | | | KEEP |
| scene.no_reports | No reports yet. | | | | KEEP |
| scene.none | none | Value next to "Last report" when none (ui.js:98). | | | KEEP |
| scene.last_report_label | Last report | | | | KEEP |
| scene.minister_by | The minister wants a town by {time}. | g.ministerBy; the minister messages once at that time if you have not named a stop (gov.js:96). Stays on screen with a past time after you answer. | | The minister wants a location by {time}. | REWRITE |
| scene.suspected | Likely stop | Label for place(g.belief), the stop your orders act on (ui.js:100). Nothing computes likelihood. | That this is their own aim. | Your search | REWRITE |
| scene.last_report_lc | last report {age} | | | | KEEP |
| scene.no_reports_lc | no reports | | | | KEEP |
| scene.goal | Leave Esmeraldan airspace by | Escape side goal (ui.js:105). | | | KEEP |
| scene.out_by | out by | Escape side clock. | | | KEEP |
| scene.sosa_here | Sosā is looking here | Escape side, s.belief === s.pos (ui.js:107). | | | KEEP |
| scene.sosa_at | Sosā is looking at {place} | Escape side. | | | KEEP |
| scene.sosa_right | He thinks {place}, and he is right | Escape side. | | | KEEP |
| scene.sosa_wrong | He thinks {place}, but he is wrong | Escape side. | | | KEEP |
| scene.next_move | Next move | Escape side: hours until Sosā's next automatic action (ui.js:109-110). | | Sosā moves next | REWRITE |
| scene.next_in | in {hours} hours | | | | KEEP |
| scene.held_again | Held {hold} of three so far | s.hold is the current step on the stop ladder, which drops after 12 quiet hours (sim.js:470), not a count so far (ui.js:111). | Their current step. | Police stop step {hold} of three | REWRITE |
| scene.held_at | Held at 10 | Shown under the attention meter when not held: police stop you at 10 (sim.js:473). | | The police stop you at 10. | REWRITE |
| scene.exposure | Exposure | Meter label, escape side. Brief proposes "police attention". | | Police attention | REWRITE |
| scene.label | Pixel-art scene of the current level | aria-label (shell.html:51). | | | KEEP |
| scene.left | left, | | | | KEEP |
| scene.goal_label | Goal | | | | KEEP |
| scene.of_ten | of 10 | | | | KEEP |
| scene.hours | {n} hours | | | | KEEP |
| scene.hours_one | one hour | | | | KEEP |
| scene.next_in_one | in one hour | | | | KEEP |
| route.heading | The route | Panel heading (shell.html:102). | | | KEEP |
| route.legend_inhand | In deck | Legend swatch; on the government side the colored rows are the ban and Esmeralda requests (gov.js:144-147). | | | KEEP |
| route.legend_promised | Promised, not delivered | | | | KEEP |
| route.legend_notyet | Not started | | | | KEEP |
| route.border | The border | Stop 4 label (ui.js:610). | | | KEEP |
| route.esmeralda | Esmeralda | Stop 5 label. | | | KEEP |
| route.cards_count | Where your cards count | Heading over card "works" lines (ui.js:613). | | | KEEP |
| route.report_src | {source}, {age} | Report header on the route (ui.js:608). | | | KEEP |
| route.does_not_prove | Does not prove {what} | | | | KEEP |
| route.may_be_here | She may be here | Shown at g.belief (ui.js:610): your aim, not her position. | That this is where they are searching. | You are searching here | REWRITE |
| route.no_command | Your ministry does not command this tower | Shown at Susana always, even after Esmeralda agrees (ui.js:610). Only search, checkpoint and call-in are blocked, and only without the introduction. | Which orders need help. | Search, checkpoint and call-in orders here need Esmeralda's agreement | REWRITE |
| route.ask_esm | Ask Esmeralda to hold her | Shown always under no_command. | | | FLAG-4 |
| route.esm_intro | An Esmeraldan introduction would start at the line | Shown in the cards section always, even when held (ui.js:613). The card counts nowhere at the line; it only unblocks three orders at Susana. | | The Esmeraldan introduction lets your patrols act at Susana. | REWRITE |
| action.wait_gov | Wait an hour | pass 1 h (gov.js:164). | | | KEEP |
| nav.desk | The desk | Phone panel heading on the government side (ui.js:102). | | | KEEP |
| nav.orders | Orders | | | | KEEP |
| nav.reports | Reports | | | | KEEP |
| action.send_order | Send the order | | | | KEEP |
| action.send | Send | Request commit button (ui.js:597). | | | KEEP |
| report.just_now | just now | | | | KEEP |
| report.ago | {age} ago | age is "3 h" measured from arrival at the desk. | | | KEEP |
| report.proves | Proves | Label over r.proves (ui.js:587). | | | KEEP |
| report.not_prove | Does not prove | | | | KEEP |
| report.empty | No reports yet. | | | | KEEP |
| desk.empty | Nobody is calling. | Shown when no minister messages (ui.js:594). | | | KEEP |
| gov.counts_here | Counts where you are looking | Card state when reach includes your stop (ui.js:601). The watch card never lowers a roll even here. | | | KEEP |
| gov.counts_abroad | Counts across the line | Operator and introduction cards when not at your stop. | | | KEEP |
| gov.counts_valdoria | Counts in Valdória | Watch, desk and rail cards when not at your stop. The rail card counts only at Salta. | | Counts at another stop in Valdória | REWRITE |
| gov.not_yours | Not yet yours | | | | KEEP |
| gov.would_start | Would start at the line | Introduction card state; its effect is only at Susana. | | Would let your patrols act at Susana | REWRITE |
| gov.say.port_venla_saturday_afternoon_two | Portô Venla, Saturday afternoon: two of your cars watch the residence, and the court wants her passports by Monday. | Opening narration (gov.js:35). Monday noon cancels her passport and sets the ban (sim.js:466). | | | KEEP |
| gov.report.her_car_is_in_the | Her car is in the drive and the lights are on upstairs. | Opening report at the residence (gov.js:36). True: she starts there. | | | KEEP |
| gov.report.someone_is_home | Someone is home. | | | | KEEP |
| gov.report.that_she_will_stay | That she will stay. | | | | KEEP |
| gov.line.where_is_she_i_want | "Where is she? I want a location before the evening news." | ministerBy = hour 2, Saturday 4 p.m. | | | KEEP |
| gov.opt.name_where_you_think_she | Name where you think she is | Names g.belief, your current search stop, not a free choice (gov.js:168). | That it names their current search stop. | Name the stop you are searching | REWRITE |
| gov.opt.ask_for_six_hours | Ask for six hours | | | | KEEP |
| gov.name.the_minister | The minister | | | | KEEP |
| gov.name.the_watch_team | The watch team | | | | KEEP |
| gov.name.the_santa_laura_desk | The Santa Laura desk | Source name for every 'desk' report, including Nova Trentô, the line and hold reports. | | | KEEP |
| gov.name.the_railway_contact | The railway contact | | | | KEEP |
| gov.name.the_embassy_in_baca | The embassy in Baca | | | | KEEP |
| gov.name.the_aviation_desk | The aviation desk | | | | KEEP |
| gov.name.inspector_sosa | Inspector Sosā | | | | KEEP |
| gov.name.radi_port_venla | Rādiô Portô Venla | No report uses source 'press'. | | | KEEP |
| gov.name.interior_minister | Interior minister | | | | KEEP |
| gov.report.a_red_sedan_took_the | A red sedan took the south road toward Santa Laura. | Decoy report, misleading (gov.js:74). | | | KEEP |
| gov.report.a_car_is_heading_south | A car is heading south. | | | | KEEP |
| gov.report.she_was_inside | She was inside. | | | | KEEP |
| gov.report.three_cars_left_the_residence | Three cars left the residence in different directions. | Decoy report, true (gov.js:75). | | | KEEP |
| gov.report.the_cars_left | The cars left. | | | | KEEP |
| gov.report.which_one_she_is_in | Which one she is in. | | | | KEEP |
| gov.report.the_party_s_official_car | The party's official car left the residence with its flags up. | partycar, 1 h delay (gov.js:76). | | | KEEP |
| gov.report.the_car_left | The car left. | | | | KEEP |
| gov.report.who_was_in_the_back | Who was in the back. | | | | KEEP |
| gov.report.a_plain_car_with_capital | A plain car with capital plates was seen at the Santa Laura square. | Her arrival at stop 1, half the time, 3 h delay (gov.js:78). | | | KEEP |
| gov.report.a_car_from_the_capital | A car from the capital is in Santa Laura. | | | | KEEP |
| gov.report.whose_it_is | Whose it is. | | | | KEEP |
| gov.report.the_nova_trent_cooperative_had | The Nova Trentô cooperative had a visitor overnight. | Arrival at stop 2, 5 h delay. Its "does not prove" is the raw 'Who.' in gov.js:79, outside the catalog. | | | KEEP |
| gov.report.someone_stayed_at_the_col | Someone stayed at the colônia. | | | | KEEP |
| gov.report.somebody_asked_about_the_midnight | Somebody asked about the midnight freight. | Arrival at Salta, 2 h delay. | | | KEEP |
| gov.report.someone_wants_the_freight | Someone wants the freight. | | | | KEEP |
| gov.report.that_it_was_her | That it was her. | | | | KEEP |
| gov.report.a_passenger_left_the_salta | A passenger left the Salta freight at the Huhūi passes. | Arrival at the line; Salta's only exit is boarding (sim.js:16). | | | KEEP |
| gov.report.someone_rode_the_freight | Someone rode the freight. | | | | KEEP |
| gov.report.that_she_crossed | That she crossed. | | | | KEEP |
| gov.report.a_charter_at_susana_is | A charter at Susana is filing for {city}. | Arrival at Susana, 2 h delay. Reveals her destination city. | | | KEEP |
| gov.report.a_jet_is_preparing_to | A jet is preparing to leave. | | | | KEEP |
| gov.report.that_she_has_reached_it | That she has reached it. | | | | KEEP |
| gov.report.a_charter_to_layuna_is | A charter to {city} is booked out of Susana. | Her aircraft stage 1, 3 h delay, placed at Susana wherever she is (gov.js:83). | | | KEEP |
| gov.report.an_aircraft_is_booked | An aircraft is booked. | | | | KEEP |
| gov.report.visa_issued | {name} has issued her an entry visa. | Permission stage 2, 4 h delay. | | | KEEP |
| gov.report.will_receive_her | {name} will receive her. | Visa only arrives where the country accepts her. | | | KEEP |
| gov.report.where_she_is_now | Where she is now. | | | | KEEP |
| gov.report.where_she_was_last_seen | Where she was last seen. | Only in the press_ally branch of leak() (gov.js:85), which never fires: her turns run with the manual inquiry and never produce press_ally. Unreachable. | | | KEEP |
| gov.inquiry.where_she_is_now | Where she is now. | Same unreachable branch; duplicates gov.report.where_she_is_now. | | | KEEP |
| gov.report.a_patrol_report_in | A patrol report: {title} in {place}. | Her police stop, at her real stop, 1 h delay, every time (gov.js:86). title is the stop-ladder title lowercased. | | | KEEP |
| gov.report.where_she_was_stopped | Where she was stopped. | | | | KEEP |
| gov.report.where_she_goes_after_release | Where she goes after release. | | | | KEEP |
| gov.line.you_asked_for_time_the | "You asked for time. The time is up. Where is she?" | Fires at hour >= ministerBy if no stop was named, whether or not you asked for time (gov.js:96). If the first message is ignored, it arrives at Saturday 4 p.m. and says "You asked for time" falsely. | | | KEEP |
| gov.opt.say_you_do_not_know | Say you do not know yet | | | | KEEP |
| gov.effect.honest_the_minister_briefs_the | The minister hears the truth and briefs the papers himself. | press_story (gov.js:170): her attention -1 and police move to a stop where she is not. | The cost of this answer. | The minister tells the papers she has fled. Her side relaxes, and the police move to a stop where she is not. | REWRITE |
| gov.why.your_ministry_does_not_command | Ask Esmeralda to hold her first | Blocked reason for search, checkpoint, call-in at Susana without the introduction (gov.js:117). | | | FLAG-4 |
| gov.preview.who_acts_esmeraldan_officials_on | by Esmeraldan officials, on your introduction | Button meta at Susana for the three orders, shown even when the order is blocked; the preview line still names the provincial patrol (gov.js:120, 122). | | | KEEP |
| gov.preview.who_acts | by {who} | | | | KEEP |
| gov.preview.your_cards_lower_it | Your cards lower it:  | Followed by "patrol 1, records 1." (gov.js:122). | | | KEEP |
| gov.preview.takes_hour_acts | Takes {hours} hour{s}, {who} acts | who is capitalized by code: "Takes 3 hours, The provincial patrol acts" and "Takes 1 hour, You acts" (gov.js:122). | Grammatical line. Needs code to pass who lowercase. | Takes {hours} hour{s}. Done by {who}. | REWRITE |
| gov.preview.on_failure | On failure: {fail} | | | | KEEP |
| gov.preview.cannot_fail | Cannot fail. | Shown for any order without fail text (gov.js:122), including Brief the papers (needs 2) and Review the licence (needs 3). A failed roll there gives "Nothing comes of it." (gov.js:198). | A line true in every case. | If it fails, nothing happens. | REWRITE |
| gov.label.ask_esmeralda_to_hold_her | Ask Esmeralda to hold her | req:hold (gov.js:129, 175, 204). | | | FLAG-4 |
| gov.status.asked_the_embassy_has_not | Asked, not confirmed | | | | KEEP |
| gov.status.esmeralda_has_agreed | Esmeralda has agreed. | | | | FLAG-4 |
| gov.preview.through_the_embassy_in_baca | 10 hours through Baca, needs a four or more, and if Esmeralda agrees her departure gets harder | Answer in 10 h after the 1 h call, roll 4. On yes: flags.asked (takeoff harder, one possible stop in Esmeralda) and the introduction card, which unblocks orders at Susana (gov.js:204). On no it resets and can be asked again. | Timing, odds, both results. | Baca answers in 10 hours and needs a four or more. If Esmeralda agrees, her takeoff gets harder and your patrols can act at Susana. | REWRITE |
| gov.preview.a_promise_to_consider_a | A promise to consider a hold is not an instruction to a tower. | | | | FLAG-4 |
| gov.label.open_a_licence_review_on | Review the operator's licence | req:operator, from hour 6 (gov.js:130). Gives the operator card. Name nearly matches the order. British spelling. | | Open a license review | REWRITE |
| gov.status.the_aviation_desk_has_it | The aviation desk has it. | Shown for both asked and granted. | | | KEEP |
| gov.why.the_aviation_desk_opens_on | The aviation desk opens on Sunday. | Available from hour 6 = Saturday 8 p.m. (gov.js:130, sim.js:15). | | The aviation desk opens Saturday at 8 p.m. | REWRITE |
| gov.preview.the_aviation_desk_takes_six | Six hours, needs a three or more, and gives you the operator card | Answer 6 h after the call, roll 3, card on success; on failure you can ask again (gov.js:205). | | The desk answers in six hours and needs a three or more. It gives you the operator card. | REWRITE |
| gov.label.confirm_the_travel_ban_reached | Confirm the ban at the post | req:ban. | | | FLAG-3 |
| gov.why.circulate_the_ban_first | Circulate the ban first. | Also lifts at Monday noon (sim.js:466). | | | KEEP |
| gov.status.confirmed_at_the_post | Confirmed at the post. | | | | FLAG-3 |
| gov.scene.the_assignment_port_venla | The assignment, Portô Venla | Level heading when your search is at stop 0 (gov.js:139). | | | KEEP |
| gov.scene.provincial_desks_santa_laura | Provincial desks, Santa Laura | | | | KEEP |
| gov.scene.the_support_network_nova_trent | The support network, Nova Trentô | | | | KEEP |
| gov.scene.the_freight_salta | The freight, Salta | | | | KEEP |
| gov.scene.the_huhui_border | The Huhūi border | | | | KEEP |
| gov.scene.susana_airfield | Susana airfield | | | | KEEP |
| gov.scene.the_watched_convoy_splits_the | The watched convoy splits, and the minister wants a location. | Objective whenever your search is at the residence, from the opening (gov.js:140), before any convoy leaves. | What they can do here. | Your watch team is on the house. The minister wants a location. | REWRITE |
| gov.scene.reports_conflict_a_patrol_can | Reports conflict. A patrol can check one of them. | Santa Laura objective; reports may not conflict. | | Your patrol can search Santa Laura or close the road out. | REWRITE |
| gov.scene.someone_is_sheltering_her_your | Someone is sheltering her. Your source has conditions. | Nova Trentô objective. No source or conditions exist on this side; you have no one here (gov.js:148). | | You have no one in Nova Trentô. A patrol search is your best check. | REWRITE |
| gov.scene.a_departure_window_is_approaching | The freight leaves soon. Railway staff disagree about who is on it. | Salta objective. Staff disagreement is not in the code; the yardmaster order is here. | | The midnight freight leaves from here. The yardmaster knows who paid for passage. | REWRITE |
| gov.scene.the_crossing_could_happen_before | She could cross before your orders arrive. A sent ban does not close the border. | Border objective. | | | FLAG-3 |
| gov.scene.she_may_be_across_the | She may be across the border, where your ministry has little reach. | Susana objective. | | This is Esmeralda. Searches, checkpoints and call-ins here need Esmeralda's agreement first. | REWRITE |
| gov.status.travel_ban_at_the_post | Travel ban at the post | Request row title (gov.js:145). | | | KEEP |
| gov.status.confirmed_the_post_has_her | Confirmed, the post has her name | | | | FLAG-3 |
| gov.status.ban_sent_not_confirmed_at | Ban sent, not confirmed at the post | Shown whenever restriction is on, including after Monday noon when you never sent it. | | | FLAG-3 |
| gov.status.not_sent | Not sent. | | | | KEEP |
| gov.status.esmeraldan_hold | Esmeraldan hold | | | | FLAG-4 |
| gov.status.esmeralda_has_agreed_to_hold | Esmeralda has agreed to hold her. | | | | FLAG-4 |
| gov.status.asked_through_the_embassy_in | Asked through the embassy in Baca, not answered | | | | KEEP |
| gov.status.not_asked | Not asked. | | | | KEEP |
| gov.status.your_people_the_watch_team | Your people: the watch team, Inspector Sosā | Route row for stop 0 (gov.js:148). Label-and-value row. | | The watch team and Inspector Sosā work here. | REWRITE |
| gov.status.your_people_the_provincial_desk | Your people: the provincial desk and its patrol | Stop 1. | | The provincial desk and its patrol work here. | REWRITE |
| gov.status.your_people_the_registry | Your people: the registry | Stop 2 if registry held; unreachable. | | The registry works for you here. | REWRITE |
| gov.status.no_one_here_yet | No one here yet. | Stop 2. | | You have no one here yet. | REWRITE |
| gov.status.your_people_the_railway_contact | Your people: the railway contact | Stop 3 with rail card. | | Your railway contact works here. | REWRITE |
| gov.status.your_people_a_railway_contact | Your people: a railway contact, not asked yet | Stop 3 without it. | | A railway contact here has not been asked yet. | REWRITE |
| gov.status.your_people_the_border_post | Your people: the border post | Stop 4. | | The border post works for you. | REWRITE |
| gov.status.your_people_a_name_at | Your people: a name at the interior ministry | Stop 5 with the introduction. | | A name at the interior ministry takes your calls. | REWRITE |
| gov.status.no_one_here_your_ministry | No one here; your ministry does not command this tower | Stop 5 without it; repeats route.no_command on the same row. | | You have no one in Esmeralda. | REWRITE |
| gov.why.not_an_order_you_can | Not an order you can give now. | | | | KEEP |
| gov.why.nothing_to_ask | Nothing to ask. | | | | KEEP |
| gov.why.deal_with_the_news_first | Deal with the news first. | | | | KEEP |
| gov.line.the_post_will_confirm_when | "The post will confirm when the sergeant reads it. Four hours." | | | | FLAG-3 |
| gov.line.we_can_open_a_review | "We can open a review on Sunday. Six hours to get it on paper." | Earliest answer is hour 13, Sunday 3 a.m. | | | KEEP |
| gov.line.the_interior_ministry_will_consider | "The interior ministry will consider it. 10 hours, and they will want to know why." | | | | KEEP |
| gov.line.then_i_will_tell_them | "Then I will tell them she has fled the country. Find her before the papers find you." | | | | KEEP |
| gov.line.six_hours_then_i_want | "Six hours. Then I want a town and a street." | | | | KEEP |
| gov.inquiry.the_minister_names_on_the | The minister names {place} on the evening news and every desk in the province drives there. | Fires only when the named stop is wrong (gov.js:168). POSITION LEAK: its appearance tells the player she is not there. | | | KEEP |
| gov.line.i_will_say_so_at | "{place}. I will say so at six." | Minister's reply only when wrong (gov.js:168). POSITION LEAK. | | | KEEP |
| gov.line.good_sosa_has_the_address | "Good. Sosā has the address. Do not lose her." | Reply only when right. POSITION LEAK: confirms her real stop. | | | KEEP |
| gov.say.you_move_the_search_to | You move the search to {place}. | Follow result (gov.js:189); only your aim moves. | | Your next orders will act at {place}. | REWRITE |
| gov.report.lights_on_someone_moved_past | Lights on, and someone moved past the upstairs window. | Keep watch, she is at the residence (gov.js:190). | | | KEEP |
| gov.report.the_house_is_dark_nobody | The house is dark and nobody has come or gone for an hour. | Keep watch, she is not. | | | KEEP |
| gov.report.someone_is_inside | Someone is inside. | | | | KEEP |
| gov.report.the_house_is_empty | The house is empty. | | | | KEEP |
| gov.report.that_it_is_her | That it is her. | | | | KEEP |
| gov.report.where_she_went | Where she went. | | | | KEEP |
| gov.report.holt_greer_took_money_this | Holt Greer took money this week for a crate on the midnight freight. | Fixed report on yardmaster success (gov.js:191), not tied to her actions. | | | KEEP |
| gov.report.someone_paid_for_passage | Someone paid for passage. | | | | KEEP |
| gov.report.that_it_was_her_or | That it was her, or when. | | | | KEEP |
| gov.report.the_patrol_finds_the_room | The patrol finds the room at {place} still warm. | Search, she is there (gov.js:195). | | | KEEP |
| gov.report.the_patrol_searches_nobody_there | The patrol searches {place} and nobody has seen her. | Search, she is not. | | | KEEP |
| gov.report.she_is_here_or_just | She is here or just left. | | | | KEEP |
| gov.report.she_is_not_there_now | She is not there now. | | | | KEEP |
| gov.report.where_she_is_instead | Where she is instead. | | | | KEEP |
| gov.report.nothing_comes_of_it | Nothing comes of it. | Failed order without fail text (gov.js:198). | | | KEEP |
| gov.report.a_clerk_at_the_provincial | A clerk at the provincial desk called a friend of hers before filing the ban. | Circulate failure report. | | | KEEP |
| gov.report.her_side_knows_the_ban | Her side knows the ban is out. | The ban is not out on failure (restriction stays off). | | Her side knows about the ban. | REWRITE |
| gov.report.where_she_is | Where she is. | | | | KEEP |
| gov.line.esmeralda_will_hold_her_if | "Esmeralda will hold her if she appears. The interior ministry gave us a name to call." | | | | FLAG-4 |
| gov.line.baca_says_it_is_a | "Baca says it is a judicial matter. Ask again with more." | Refusal; the request resets to not asked and can be repeated at the same odds. Nothing more can be added. | | "Baca says it is a judicial matter. Try them again." | REWRITE |
| gov.line.the_review_is_open_say | "The review is open. Say the word and the operator hears about his licence." | Spelling. | | "The review is open. Say the word and the operator hears about his license." | REWRITE |
| gov.line.legal_wants_the_file_first | "Legal wants the file first. Not today." | Refusal; can be asked again at once. | | "Legal wants the file first. Ask us again." | REWRITE |
| gov.line.the_post_confirms_the_sergeant | "The post confirms, and the sergeant has her name on the desk." | | | | FLAG-3 |
| gov.line.the_sergeant_is_off_shift | "The sergeant is off shift. Nobody has read it." | | | | FLAG-3 |
| gov.report.a_source_places_her_at | A source places her at {p}. | True lead at her stop when the event ran; arrives after delay (gov.js:256). | | | KEEP |
| gov.report.she_was_at_when_the | She was at {place} when the source saw her. | The age shown counts from arrival, not the sighting. | | | KEEP |
| gov.report.where_she_goes_next | Where she goes next. | | | | KEEP |
| gov.report.a_caller_swears_she_is | A caller swears she is at {p}. | False lead, misleading (gov.js:260). | | | KEEP |
| gov.report.someone_says_so | Someone says so. | | | | KEEP |
| gov.report.that_it_is_true | That it is true. | | | | KEEP |
| gov.report.sosa_finds_fresh_tracks_at | Sosā finds fresh tracks at {place}. | Event search, she is there (gov.js:278). | | | KEEP |
| gov.report.sosa_finds_nothing_at | Sosā finds nothing at {place}. | | | | KEEP |

Out of scope and not audited: escape-only route.* ids (role_aircraft, role_visa, stops_here, starts_here, velez_starts, you_here, inquiry_here, who_acts, abroad_phone, abroad, by_phone, who_acts_label, needed, card_stops_line, velez_starts_short, inquiry, looking_here, no_inquiry).

## 2. Design inconsistencies

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

Count: 64 rewrites, 292 keeps, 22 flags (14 FLAG-3, 8 FLAG-4), 0 unknowns, 1 needs-budget.
