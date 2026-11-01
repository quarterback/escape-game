# Escape data tables: language pass, Nov. 1, 2026

Scope: player-facing strings in `src/data.js` tables CHARACTERS, PEOPLE, ENEMY, ARRANGEMENTS, CARDS, LEVELS, STAGE_LINES, ENEMY_ACTIONS, DESTS, PLACES and POSTS, traced through `src/sim.js` and `src/ui.js` (plus `src/gov.js` and `src/render.js` where they show the same text). Die targets below use `Data.DICE.target` (six-sided difficulty 1→2, 2→4, 3→8, 4→11, 5→14, 6→18, 7→impossible).

Where a string is never shown to the player, the mechanics column says so; it is still rated.

| Location | Original | What the code does (file:line) | Problem (guide and pattern) | Proposed | Status |
|---|---|---|---|---|---|
| CHARACTERS.woman.name | Teresā Albukerkē | Start screen button, scene "who am I" line, opening log line (ui.js:67, 121, 677). | | | KEEP |
| CHARACTERS.woman.short | Teresā | Not read by ui.js or sim.js. | | | KEEP |
| CHARACTERS.woman.title | the defeated candidate | Opening log line and "who am I" line (ui.js:67, 121). | | | KEEP |
| CHARACTERS.woman.sibling.name | Duartē Albukerkē | Speaker name for sibling lines, ending line "named on the warrant" (sim.js:80, 540). | | | KEEP |
| CHARACTERS.woman.sibling.short | Duartē | Option labels and `{sib}` in news (sim.js:98, 119, 239). | | | KEEP |
| CHARACTERS.woman.sibling.rel | your brother | Opening log line, phone subline (capitalized, "your " cut), start screen (ui.js:67, 193, 677). | | | KEEP |
| CHARACTERS.woman.blurb | A friend inside the inquiry warns her when the police move. Border guards know her face. | Start screen card (ui.js:677). Her friend is the "A friend in the inquiry" card (data.js:17, 85): it lowers the roll on most moves inside Valdória (sim.js:161, 185). Nothing warns her. faceKnown adds 1 to every move at the line and to the "Answer calmly" roll when police stop her anywhere (sim.js:192, 279). | Preserve meaning: invents a warning mechanic; understates the face rule (police stops too). | A friend inside the inquiry helps her slip past the police in Valdória. Border guards and police officers know her face. | REWRITE |
| CHARACTERS.woman.edge | A friend inside the inquiry | Not shown anywhere (no reader in src/). | | | KEEP |
| CHARACTERS.woman.flaw | Every officer knows your face | Not shown anywhere. | | | KEEP |
| CHARACTERS.man.name | Matēu Zanetī | As woman.name. | | | KEEP |
| CHARACTERS.man.short | Matēu | Not read. | | | KEEP |
| CHARACTERS.man.title | the defeated candidate | As woman.title. | | | KEEP |
| CHARACTERS.man.sibling.name | Līviā Zanetī | As woman.sibling.name. | | | KEEP |
| CHARACTERS.man.sibling.short | Līviā | As woman.sibling.short. | | | KEEP |
| CHARACTERS.man.sibling.rel | your sister | As woman.sibling.rel. | | | KEEP |
| CHARACTERS.man.blurb | The family barges can carry him down the river. Police have watched his house since the count. | Start screen card (ui.js:677). The barge move is "Take a family barge upriver" and its text says "up the river to the colônia" (data.js:121-122). Police attention starts at 3 (data.js:23, sim.js:40). | Makes no sense: "down the river" contradicts the move it describes. | The family barges can carry him up the river. Police have watched his house since the count. | REWRITE |
| CHARACTERS.man.edge | Your family barges on the river | Not shown anywhere. | | | KEEP |
| CHARACTERS.man.flaw | Watched since the count | Not shown anywhere. | | | KEEP |
| PEOPLE.sibling.role | arranging the jet and your welcome in Costamar from abroad | Read only by the scene tooltip (render.js:79); the sibling has no scene spot (where -1), and the phone uses phone.sibling_role (ui.js:193). | | | KEEP |
| PEOPLE.aide.name | Gianlūka Moretī | Speaker name, logs, epilogue (sim.js:80). | | | KEEP |
| PEOPLE.aide.role | party chief of staff | Phone subline, tap-a-person log, tooltip (ui.js:193, 742; render.js:79). | | | KEEP |
| PEOPLE.aide.terms | He wants your public word that he leads the party in your absence. | Logged as "You now owe {name}: {text}" when the party car is used (sim.js:411, ui.js:605). | | | KEEP |
| PEOPLE.nando.name | Nando | Speaker name (sim.js:399). | | | KEEP |
| PEOPLE.nando.role | your driver for 11 years | Tooltip and tap log. | | | KEEP |
| PEOPLE.sponsor.name | Your sponsor | Never shown: personName swaps in the destination's sponsor (sim.js:80). | | | KEEP |
| PEOPLE.sponsor.role | the person asking a foreign ministry for your visa | Never shown: personRole swaps in the destination sponsor's role (sim.js:81); the sponsor has no scene spot. | | | KEEP |
| PEOPLE.sponsor.terms | (empty string) | Never read; the visa call uses DESTS sponsor terms (sim.js:434). | | | KEEP |
| PEOPLE.host.name | Nonā Rosa Trentinī | Speaker name, tooltip. | | | KEEP |
| PEOPLE.host.role | matriarch of the Nova Trentô colônia | Tooltip and tap log. | | | KEEP |
| PEOPLE.official.name | Rosario Vélez | Speaker name, phone thread. | | | KEEP |
| PEOPLE.official.role | aide to Costamar's interior minister | Phone subline (ui.js:193). | | | KEEP |
| PEOPLE.official.terms | She wants it understood that Costamar receives you as a guest, not as a government in exile. | Logged as "You now owe Rosario Vélez: …" on the second reception call (sim.js:435). Her later message asks you to say it (sim.js:136). Both halves of the contrast carry the demand. | | | KEEP |
| PEOPLE.holt.name | Holt Greer | Speaker, tooltip. | | | KEEP |
| PEOPLE.holt.role | brakeman on the Huhūi freight | Phone subline, tooltip. | | | KEEP |
| PEOPLE.theo.name | Theo Bascom | Tooltip, rumor title. | | | KEEP |
| PEOPLE.theo.role | yard foreman in the Salta rail town | Tooltip. | | | KEEP |
| PEOPLE.pilot.name | Capitān Olsēn | Speaker, phone thread at Portalba. | | | KEEP |
| PEOPLE.pilot.role | charter pilot, Portalba | Phone subline. | | | KEEP |
| PEOPLE.press.name | Rādiô Portô Venla | Phone thread at Pedra Branca (sim.js:102). | | | KEEP |
| PEOPLE.press.role | the station everyone in the capital has on | Phone subline. | | | KEEP |
| ENEMY.name | Inspector Valentīn Sosā | Speaker label in front of every police action in the log, and phone thread name (ui.js:27). | | | KEEP |
| ENEMY.role | Interior Ministry, head of the departure inquiry | Phone subline under his name when he calls at Portalba (ui.js:193, sim.js:142). | Interface: two fragments joined by a comma read as a label-and-value pair. | head of the Interior Ministry's departure inquiry | REWRITE |
| ARRANGEMENTS.aircraft.name | Jet | Call button prefix when blocked ("Jet: … is working on it"), and mid-sentence in "these arrangements have moved one step: Jet, Entry visa" (ui.js:199, sim.js:405). | | | KEEP |
| ARRANGEMENTS.aircraft.stages[0] | none | Never shown (lists slice from 1, ui.js:397). | | | KEEP |
| ARRANGEMENTS.aircraft.stages[1] | charter jet booked | Shown in "First you need this step: …", result rows (capitalized), briefing step lists, route cell, ledger, call preview (sim.js:172, 212, 438; ui.js:219, 397, 565). | | | KEEP |
| ARRANGEMENTS.aircraft.stages[2] | crew hired | Same places. | | | KEEP |
| ARRANGEMENTS.aircraft.stages[3] | fueled at Portalba | Same places; as a result row it prints "Fueled at Portalba" on its own (ui.js:565). | Player language: no subject; alone in a result row it does not say what was fueled. | jet fueled at Portalba | REWRITE |
| ARRANGEMENTS.aircraft.stages[4] | ready to fly at Portalba | Same places; "Board and depart" and "Depart without the visa" need it (data.js:194, 198), so it is the blocked reason "First you need this step: ready to fly at Portalba." | Player language: no subject. Apply only at data.js:49; the same words sit inside need.aircraft_ready in ui.json. | jet ready to fly at Portalba | REWRITE |
| ARRANGEMENTS.aircraft.what | Call your sibling to find a charter, a crew, fuel and a place at Portalba. | Route cell when the jet is not started and no call is out (ui.js:219). | | | KEEP |
| ARRANGEMENTS.reception.name | Welcome in Costamar | As aircraft.name. | | | KEEP |
| ARRANGEMENTS.reception.stages[0] | none | Never shown. | | | KEEP |
| ARRANGEMENTS.reception.stages[1] | Costamar expects you | Opens "Take the road to Salta" (data.js:144); blocked reason, result row, briefing, ledger. | | | KEEP |
| ARRANGEMENTS.reception.stages[2] | Costamar's minister knows you are coming | Cancels the +2 takeoff penalty after Valdória asks Costamar, gives Vélez's card (sim.js:190, 422). | | | KEEP |
| ARRANGEMENTS.reception.stages[3] | Costamaran officials waiting at a border post | The escort post crosses with no roll (sim.js:187, 372). | | | KEEP |
| ARRANGEMENTS.reception.what | Cerro Alto has your name, and Vélez puts officials at the post to meet you. | Never shown: the route swaps in need.baca or need.velez (ui.js:219). | | | KEEP |
| ARRANGEMENTS.permission.name | Entry visa | As aircraft.name. | | | KEEP |
| ARRANGEMENTS.permission.stages[0] | none | Never shown. | | | KEEP |
| ARRANGEMENTS.permission.stages[1] | your sponsor has agreed to ask | Result row ("Your sponsor has agreed to ask"), briefing list, route cell, ledger, call preview. | Makes no sense alone: "ask" has no object in a result row or step list. | your sponsor has agreed to ask for your visa | REWRITE |
| ARRANGEMENTS.permission.stages[2] | entry visa issued | "Board and depart" needs it (data.js:194). | | | KEEP |
| ARRANGEMENTS.permission.what | Your sponsor asks the ministry in the country you chose for a visa. | Never shown: the route uses need.salek (ui.js:219). | | | KEEP |
| CARDS.decoy_cars.name | Two more cars like yours | Toast "New from Nando: …", log, route bar, "Easier with …" tag on moves (ui.js:150, 263, 603). | | | KEEP |
| CARDS.decoy_cars.works | At the residence and on the road at Pedra Branca. | Toast subline after "Where it counts:" (ui.js:603). Reach residence, road (data.js:63). | | | KEEP |
| CARDS.decoy_cars.text | Two matching sedans and two friends who will drive them the wrong way. | Not shown: no screen reads CARDS.text since the Deck screen went. | | | KEEP |
| CARDS.aide_word.name | The party machine | As above. | | | KEEP |
| CARDS.aide_word.works | Valdórian officials, up to and at the line. | Reach VALDORIA, residence to the line (data.js:60, 65). | | | KEEP |
| CARDS.aide_word.text | Gianlūka can get a mayor, a judge or a border post on the phone for you. | Not shown. | | | KEEP |
| CARDS.truck.name | The colônia's grape truck | As above. | | | KEEP |
| CARDS.truck.works | Getting help in the Salta rail yard. | Lowers Holt's and Theo's rolls at Salta (data.js:157, 161). | | | KEEP |
| CARDS.truck.text | A farm truck nobody looks at twice, and a cousin who drives it to Salta every week. | Not shown. | | | KEEP |
| CARDS.passport.name | Your second passport | As above; lost first at a station hold (sim.js:334). | | | KEEP |
| CARDS.passport.works | The Paso Huhūi post and the Portalba departure. | Needed at Paso Huhūi, lowers "Board and depart" (data.js:174, 195). | | | KEEP |
| CARDS.passport.text | You have held it for years, and the travel ban lists only your other passport. It gets you through the Paso Huhūi post and helps your takeoff at Portalba. | Not shown. The card is required at Paso Huhūi; the crossing still rolls (sim.js:378). | Brief: no outcome promised in advance ("gets you through"). | You have held it for years, and the travel ban lists only your other passport. You need it at the Paso Huhūi post, and it helps your takeoff at Portalba. | REWRITE |
| CARDS.intro_vel.name | Rosario Vélez's card | Gained at "Costamar's minister knows you are coming" (sim.js:422). | | | KEEP |
| CARDS.intro_vel.works | Paso Huhūi, Ālto Verdē, the Portalba tower and the charter operator. | Lowers both posts and both departures; unlocks the "have Vélez call" answer (data.js:175, 179, 195, 199; sim.js:230). | | | KEEP |
| CARDS.intro_vel.text | Vélez's number and her word that the border post knows your name. | Not shown. | | | KEEP |
| CARDS.delay_report.name | A report held one day | Given with the party car promise (sim.js:411). | | | KEEP |
| CARDS.delay_report.works | Valdórian posts checking the travel ban, including Pedra Branca and the line. | Cancels the ban's extra difficulty at the line, lowers "Drive on in your own car" and Punta Marēa (sim.js:188; data.js:126, 183). | | | KEEP |
| CARDS.delay_report.text | Gianlūka's contact keeps the travel ban off the desk at Valdórian posts. | Not shown. | | | KEEP |
| CARDS.crate.name | Holt's chalk-marked crate | Dropped on leaving Salta (sim.js:428). | | | KEEP |
| CARDS.crate.works | Boarding the midnight freight. | | | | KEEP |
| CARDS.crate.text | Third boxcar. Straw inside. Holt leaves at midnight and does not wait. | Not shown. | Owner tell: clipped beats (three short fragments in a row). | A crate in the third boxcar, with straw inside. Holt's train leaves at midnight and does not wait. | REWRITE |
| CARDS.yard_walk.name | Theo walks you through | Also granted by the yardmaster news choice (data.js:415). | | | KEEP |
| CARDS.yard_walk.works | Boarding the midnight freight. | | | | KEEP |
| CARDS.yard_walk.text | Theo escorts you past the yard office to the train. | Not shown. | | | KEEP |
| CARDS.sponsor_line.name | Your sponsor's line to the ministry | Gained when the sponsor agrees to ask (sim.js:423). | | | KEEP |
| CARDS.sponsor_line.works | Reaching Vélez's uncle, calming the crew and leaving without the visa. | Three real uses (sim.js:229, data.js:199, 436). | | | KEEP |
| CARDS.sponsor_line.text | A name that opens doors money alone does not. Your sponsor keeps count. | Not shown. The crew guarantee lowers the sponsor's trust (data.js:436). | Humanizer 3, saying that sounds deep. | Your sponsor's name reaches people money cannot, and your sponsor keeps count of every favor. | REWRITE |
| CARDS.barge.name | Your family barges | Matēu's starting hand (data.js:23). | | | KEEP |
| CARDS.barge.works | The river south of Pedra Branca. | Reach road, colônia (data.js:81). | | | KEEP |
| CARDS.barge.text | The barges still run the river. The captains still owe your father. | Not shown. | Humanizer 7 and owner couplet: two matching "still" sentences. | Your father's barges still run the river, and their captains owe him. | REWRITE |
| CARDS.grandson.name | Nonā Rosa's grandson | From the colônia news (data.js:397). | | | KEEP |
| CARDS.grandson.works | Boarding the midnight freight. | | | | KEEP |
| CARDS.grandson.text | He is 19, quick, and knows which boxcar the guards skip. | Not shown. | | | KEEP |
| CARDS.informant.name | A friend in the inquiry | Teresā's starting hand; Gianlūka's reward for keeping your word (sim.js:455). | | | KEEP |
| CARDS.informant.works | Any move the inquiry could be watching, up to the line. | Lowers most Valdórian moves and Punta Marēa (data.js:97-183). | | | KEEP |
| CARDS.informant.text | A clerk tells Gianlūka where Sosā is looking and who is on duty. | Not shown. | | | KEEP |
| LEVELS.residence.name | The residence, Portô Venla | Level heading, stop screen title (ui.js:119, 474). | | | KEEP |
| LEVELS.residence.short | Residence | Route rail and board, briefing title, stop screen dots, round marker (ui.js:249, 380, 450, 475). | | | KEEP |
| LEVELS.residence.objective | Get past the watch. | Heading subline, stop screen goal, briefing (ui.js:119, 404, 476). Any success here moves you on (sim.js:17, 394). | | | KEEP |
| LEVELS.residence.arrive | Two unmarked cars watch the house. The court has barred you from leaving and wants your passport handed in by Monday noon, and the travel ban lists that passport. Your second passport, which no list names, is in your coat. | Arrival narration and briefing (sim.js:91, ui.js:395). Deadline Monday noon (sim.js:21, 481). | AGENTS "one idea per sentence": the second sentence chains three ideas. | Two unmarked cars watch the house. The court has barred you from leaving and wants your passport handed in by Monday noon. The travel ban lists that passport, but your second passport, which no list names, is in your coat. | REWRITE |
| LEVELS.residence.approaches.decoy.name | Decoy convoy | Move button, result title, "You try {name}." log (ui.js:156, 554, 597). Needs the decoy card; 3 hours; roll 8, or 4 with the friend in the inquiry (data.js:96-97). | Interface: a move button is a verb phrase. The tutorial names it at tutorials.json:102 (`tutorial.escape.leave_house body`); change both together. | Send out a decoy convoy | REWRITE |
| LEVELS.residence.approaches.decoy.text | Send three cars out in different directions so the watch follows the wrong one. | Expanded move text (ui.js:162). Success: you leave, police attention −1 (data.js:98). | | | KEEP |
| LEVELS.residence.approaches.decoy.fail.say | The second car is stopped at the avenida. Nando talks his way out, and the police are watching the house more closely now. | Result line (ui.js:558). Police attention +2, you stay (data.js:99). | | | KEEP |
| LEVELS.residence.approaches.service.name | The service door after dark | Move button. Needs night, 10 p.m. to 5 a.m. (sim.js:166); 1 hour; roll 11. The night marker and blocked reason already show the time (ui.js:155, sim.js:171). | Interface: a move button is a verb phrase. | Leave by the service door | REWRITE |
| LEVELS.residence.approaches.service.text | Leave with the kitchen staff between 10 p.m. and 5 a.m. | Expanded text; matches isNight (sim.js:166). | | | KEEP |
| LEVELS.residence.approaches.service.success.say | The night cook lends you an apron and a cigarette. Nobody looks at the help. | Result line; you leave (data.js:102). | | | KEEP |
| LEVELS.residence.approaches.service.fail.say | A flash from a parked car. Someone photographed the help tonight. | Result line. Police attention +2 and you stay at the house (data.js:103). | Results say what changed: nothing says you are still at the house; opens on a fragment. | A flash goes off in a parked car, and you go back inside. Someone photographed the help tonight. | REWRITE |
| LEVELS.residence.approaches.partycar.name | The party's official car | Move button. Needs the party machine card; 1 hour; roll 4. Success or failure adds Gianlūka's terms to what you owe and gives "A report held one day" (data.js:104, sim.js:411). | Interface: a move button is a verb phrase. | Ride out in the party's car | REWRITE |
| LEVELS.residence.approaches.partycar.text | Ride out in Gianlūka's official car. In return he wants your public word that he leads the party while you are gone. | Expanded text. | | | KEEP |
| LEVELS.residence.approaches.partycar.success.say | The flags get you through. Gianlūka reminds you, gently, what he asked for. | Result line; you leave. | | | KEEP |
| LEVELS.residence.approaches.partycar.fail.say | The watch stops the car at the gate and tells Sosā whose car it is. You are still at the house. | Result line; police attention +1, you stay (data.js:107). | | | KEEP |
| LEVELS.road.name | The road south, Pedra Branca | Heading, stop screen. | | | KEEP |
| LEVELS.road.short | Pedra Branca | Route, briefing, `{here}` in news. | | | KEEP |
| LEVELS.road.objective | Get from Pedra Branca to the colônia at Nova Trentô. | Every success moves you on (sim.js:17). | | | KEEP |
| LEVELS.road.arrive | Pedra Branca. The radio says you are on a yacht in Portô Venla. | Arrival narration; the radio's message follows (sim.js:101-106). | | | KEEP |
| LEVELS.road.approaches.second_driver.name | Hire a plain car and driver | 2 hours; roll 8, 4 with the friend in the inquiry. | | | KEEP |
| LEVELS.road.approaches.second_driver.text | Nando's cousin offers a taxi and his silence. | | | | KEEP |
| LEVELS.road.approaches.second_driver.success.say | You leave by taxi while Nando drives your sedan back north. | Result; you move on, no other effect (data.js:115). | | | KEEP |
| LEVELS.road.approaches.second_driver.fail.say | The cousin wants more money, then wants nothing to do with it. The attempt costs you four hours. | Police attention +1; 2 + 2 = 4 hours (data.js:116, sim.js:393). | | | KEEP |
| LEVELS.road.approaches.siblings_driver.name | Leave with your sibling's driver | Needs "charter jet booked" (data.js:117). | | | KEEP |
| LEVELS.road.approaches.siblings_driver.text | Your sibling knows a man in Pedra Branca. Once the charter is booked, he drives you to Nova Trentô. | Matches the need. | | | KEEP |
| LEVELS.road.approaches.siblings_driver.success.say | He asks nothing and drives the back roads. The radio stays off. | | | | KEEP |
| LEVELS.road.approaches.siblings_driver.fail.say | He is late, then nervous, and you wait an hour on a side street while he decides. | Police attention +1, 3 hours in all. | | | KEEP |
| LEVELS.road.approaches.barge.name | Take a family barge upriver | Needs the boat card; 3 hours; roll 4 (data.js:121). | | | KEEP |
| LEVELS.road.approaches.barge.text | A captain who owes your father takes you up the river to the colônia. | | | | KEEP |
| LEVELS.road.approaches.barge.success.say | You sleep under a tarp that smells of soy. The river is quiet. | Police attention −1. | | | KEEP |
| LEVELS.road.approaches.barge.fail.say | River police board at the lock. The captain talks for two hours. | Police attention +1, 5 hours in all. | | | KEEP |
| LEVELS.road.approaches.known_car.name | Drive on in your own car | Roll 14; the decoy card and "A report held one day" each lower it (data.js:125-126). | | | KEEP |
| LEVELS.road.approaches.known_car.text | Risk the posts in a car they know. Nando's spare sedans or a held report make it easier. | Names both cards that help. | | | KEEP |
| LEVELS.road.approaches.known_car.success.say | You pass the first post before the fax does. | Police attention +1, you move on. | | | KEEP |
| LEVELS.road.approaches.known_car.fail.say | The post at the river has your plate. They turn you back and phone Sosā's people. | Police attention +3, the search moves to Pedra Branca, you stay (data.js:128). | | | KEEP |
| LEVELS.colonia.name | The colônia, Nova Trentô | | | | KEEP |
| LEVELS.colonia.short | Nova Trentô | | | | KEEP |
| LEVELS.colonia.objective | Get Costamar to expect you, then take the road to Salta. | Two moves leave this stop: "Take the road to Salta" (needs "Costamar expects you") and a successful "Help Nonā Rosa free the truck", which has no such need (sim.js:17, 394; data.js:134, 144). | Owner couplet ("X, then Y"); omits the truck route, so it states a requirement the truck route does not have. | Get to Salta. The road opens once Costamar expects you, or after you free Nonā Rosa's truck. | REWRITE |
| LEVELS.colonia.arrive | Nonā Rosa offers a room and a phone. Her cooperative's truck was impounded this morning. | Arrival narration. | | | KEEP |
| LEVELS.colonia.approaches.help_host.name | Help Nonā Rosa free the truck | 3 hours; roll 4, 2 with the party machine. Success: truck card, her trust +1, you go to Salta. Failure: truck card, 1 more hour, you stay (data.js:134-137). | | | KEEP |
| LEVELS.colonia.approaches.help_host.text | Spend three hours getting the cooperative's truck released. If it works, her cousin drives you to Salta in it. | Matches success. | | | KEEP |
| LEVELS.colonia.approaches.work_phone.name | Call your contacts | No roll, once per run, 3 hours; moves the jet, the welcome and the visa one step each, only those not finished; hidden once nothing can move (data.js:138-140, sim.js:179-180, 404). | | | KEEP |
| LEVELS.colonia.approaches.work_phone.text | Spend three hours on Nonā Rosa's phone. The jet, your welcome in Costamar and your visa each move one step. | Expanded text. After use the button shows only the blocked reason (sim.js:179). | Interface: a fact the player needs before choosing (this can be done once per run) is missing. | Spend three hours on Nonā Rosa's phone. The jet, your welcome in Costamar and your visa each move one step. You can only do this once. | REWRITE |
| LEVELS.colonia.approaches.work_phone.success.say | Three hours later, all three arrangements have moved one step. Nonā Rosa eats alone. | Result line when all three move; otherwise sim.say.calls_moved_some replaces it (sim.js:405). | | | KEEP |
| LEVELS.colonia.approaches.work_phone.fail.say | (empty string) | Unreachable: no roll. | | | KEEP |
| LEVELS.colonia.approaches.sleep.name | Sleep | No roll, 6 hours, police attention −2 at once (data.js:141-143). | | | KEEP |
| LEVELS.colonia.approaches.sleep.text | Rest for six hours. Your police attention drops by two while Sosā keeps searching. | The police still act every three hours, and attention climbs again if they search Nova Trentô (sim.js:483, 486). | Interface terms: "the police" in interface text, not Sosā. | Rest for six hours. Your police attention drops by two, and the police keep searching while you sleep. | REWRITE |
| LEVELS.colonia.approaches.sleep.success.say | You wake before the roosters. The house is quiet. | Result line. Sleep can start at any hour, so you can wake at 8 p.m. | Makes no sense at most hours: fixed time of day. | Nobody knocks for six hours, and you wake to a quiet house. | REWRITE |
| LEVELS.colonia.approaches.sleep.fail.say | (empty string) | Unreachable. | | | KEEP |
| LEVELS.colonia.approaches.leave.name | Take the road to Salta | Needs "Costamar expects you"; no roll; 2 hours. | | | KEEP |
| LEVELS.colonia.approaches.leave.text | Once Costamar expects you, Nonā Rosa's cousin drives you up to Salta. | | | | KEEP |
| LEVELS.colonia.approaches.leave.success.say | Nonā Rosa\'s cousin drives. The road climbs and the radio loses the station. | Result line (source has an escaped apostrophe). | | | KEEP |
| LEVELS.colonia.approaches.leave.fail.say | (empty string) | Unreachable. | | | KEEP |
| LEVELS.salta.name | The rail town, Salta | | | | KEEP |
| LEVELS.salta.short | Salta | | | | KEEP |
| LEVELS.salta.objective | Get on the midnight freight. The yardmaster will sell you to Sosā. | Only boarding leaves Salta (sim.js:17). "Pay the yardmaster" cannot succeed (difficulty 7). | Interface terms: "the police" in interface text, not Sosā. | Get on the midnight freight. The yardmaster will sell you to the police. | REWRITE |
| LEVELS.salta.arrive | The midnight freight climbs to the border. Holt and Theo can get you aboard. | Arrival narration. | | | KEEP |
| LEVELS.salta.approaches.board.name | Board the midnight freight | Needs a passage card and night; roll 2 (data.js:152-153). | | | KEEP |
| LEVELS.salta.approaches.board.text | Board between 10 p.m. and 5 a.m. with Holt's crate, Theo's walk through the yard or Nonā Rosa's grandson. | | | | KEEP |
| LEVELS.salta.approaches.board.success.say | The train pulls out at 12 past. Cold straw, then the sound of the grade. | Result line; you reach the line. | Owner couplet ("X, then Y") and a fragment. | The train pulls out at 12 past. You lie in cold straw and feel it start up the grade. | REWRITE |
| LEVELS.salta.approaches.board.fail.say | A lamp swings down the cars. You miss the midnight and wait for the next. | Police attention +1, you stay and can try again. | | | KEEP |
| LEVELS.salta.approaches.crate.name | Pay Holt for a crate | Roll 8; gives the crate card only (data.js:156-158). | | | KEEP |
| LEVELS.salta.approaches.crate.text | Pay Holt to save you a crate in the third boxcar. You still have to board at night. | | | | KEEP |
| LEVELS.salta.approaches.crate.success.say | Holt pockets the notes without counting them. "Third car. Midnight. I don\'t wait." | Dialogue (source has an escaped apostrophe). | | | KEEP |
| LEVELS.salta.approaches.crate.fail.say | Holt wants to see who else is asking. You spend two hours in a shed waiting for him to decide. | Police attention +1, 2 hours. | | | KEEP |
| LEVELS.salta.approaches.foreman.name | Theo's walk-through | Move button. Roll 11, lowered by the truck, the friend in the inquiry and the party machine; success gives the card and Theo's trust (data.js:160-162). | Interface: a move button is a verb phrase. | Ask Theo to walk you through | REWRITE |
| LEVELS.salta.approaches.foreman.text | Theo agrees to walk you through the yard at train time. The colônia's truck helps convince him. | Expanded text before the roll. | Brief: promises the outcome in advance ("agrees") on a move that rolls. | Ask Theo to walk you through the yard at train time. The colônia's truck helps convince him. | REWRITE |
| LEVELS.salta.approaches.foreman.success.say | Theo agrees to walk you across the yard tonight. Nobody interrupts a foreman. | | | | KEEP |
| LEVELS.salta.approaches.foreman.fail.say | The registry window is open late tonight. Theo shakes his head and tells you to come back at the shift change. | Police attention +1. | | | KEEP |
| LEVELS.salta.approaches.buy_seat.name | Pay the yardmaster | Difficulty 7: chance 0 (data.js:164, 497). | | | KEEP |
| LEVELS.salta.approaches.buy_seat.text | He will pocket the money and report you. This cannot succeed. | Expanded text; the preview line under it already reads "This cannot succeed." and the meta line shows the impossible label (sim.js:197, ui.js:145, 162). | Humanizer 26: the same sentence prints twice in one box. | He will pocket the money and report you. | REWRITE |
| LEVELS.salta.approaches.buy_seat.success.say | Three men watch the yardmaster take your money. | Unreachable. | | | KEEP |
| LEVELS.salta.approaches.buy_seat.fail.say | He takes the envelope, thanks you by your real name, and walks to the telephone. The yard knows who is here. | Police attention +2. | | | KEEP |
| LEVELS.border.name | The line at the Huhūi passes | | | | KEEP |
| LEVELS.border.short | The line | | | | KEEP |
| LEVELS.border.objective | Cross into Costamar. One of the three posts works for Valdória. | One post (s.boughtPost) detains you (sim.js:48, 386). | | | KEEP |
| LEVELS.border.arrive | The passes. Three crossings lie within a day of each other: the rail post at Paso Huhūi, the road post at Ālto Verdē toward Cerro Alto, and the Punta Marēa crossing toward the coast. Valdória has paid the guards at one of them to stop you. | Arrival narration. | | | KEEP |
| LEVELS.border.approaches.post_rail.name | Cross at the Paso Huhūi post | Needs the second passport; roll 11 before the ban, Teresā's face and checkpoints (sim.js:188-192). | | | KEEP |
| LEVELS.border.approaches.post_rail.text | The freight's own crossing. You show your second passport at the desk. | | | | KEEP |
| LEVELS.border.approaches.post_rail.success.say | The guard turns the pages, looks at a sheet on the desk, and stamps it. | Also prints before the bought-post text when this post is the bought one (sim.js:379, 387). | | | KEEP |
| LEVELS.border.approaches.post_rail.fail.say | The guard reads the sheet first. You spend three hours in a cold room and come out on the Valdórian side. | Police attention +2, 4 hours. | | | KEEP |
| LEVELS.border.approaches.post_high.name | Take the Ālto Verdē road post | 3 hours, roll 8. | | | KEEP |
| LEVELS.border.approaches.post_high.text | Three hours of switchbacks toward Cerro Alto. The post answers to the interior ministry, where Vélez works. | | | | KEEP |
| LEVELS.border.approaches.post_high.success.say | A long climb. The sergeant at Ālto Verdē checks your passport and waves the car through. | Also prints when this is the bought post (sim.js:379). | | | KEEP |
| LEVELS.border.approaches.post_high.fail.say | The post has no list with your name on it, and you wait two hours while someone in Cerro Alto is woken up. | Police attention +1, 5 hours. | | | KEEP |
| LEVELS.border.approaches.post_coast.name | Pay the Punta Marēa crossing | 2 hours, roll 11. | | | KEEP |
| LEVELS.border.approaches.post_coast.text | The merchants' road to the coast. The guards here answer to the port, and the port takes money. | | | | KEEP |
| LEVELS.border.approaches.post_coast.success.say | The barrier goes up. Nobody says thank you. | Police attention +1. | | | KEEP |
| LEVELS.border.approaches.post_coast.fail.say | The older guard takes the money and the younger one calls the ministry. Two hours in the salt wind. | Police attention +2, 4 hours, you stay on the Valdórian side. | Owner clipped beat: closing fragment; does not say you are still on this side. | The older guard takes the money and the younger one calls the ministry. You wait two hours in the salt wind before they turn you back. | REWRITE |
| LEVELS.border.received.name | Walk to the people waiting | Never shown: the escort crossing reads only .say and .hours (sim.js:373). | | | KEEP |
| LEVELS.border.received.say | Rosario Vélez shakes your hand across the barrier. The guards on your side write nothing down. | Escort post with officials waiting: no roll, you cross (sim.js:372-373). | | | KEEP |
| LEVELS.border.bought.say | The sergeant reads your passport, walks into the hut and picks up the telephone. He keeps you waiting 12 hours, until a Valdórian liaison arrives. You are still on the Valdórian side of the line. | Success at the bought post: you stay, the search moves onto you, police attention +2, the move's hours plus 12 pass (sim.js:386-388). | | | KEEP |
| LEVELS.airfield.name | Portalba airfield, Costamar | | | | KEEP |
| LEVELS.airfield.short | Portalba | | | | KEEP |
| LEVELS.airfield.objective | Board the jet. | | | | KEEP |
| LEVELS.airfield.arrive | Portalba. The charter apron behind the port, Costamaran flags on the tower. They will let you leave from here and nothing more. Sosā has asked them to hold you. | Arrival narration, always. Valdória asks Costamar only through the police action ask_esmeralda after hour 30 or the "Let it stand" news choice (data.js:222, 443; sim.js:518). Until then there is no takeoff penalty and no police stop here (sim.js:190, 269). | Preserve meaning: the last sentence is false in most runs; the second sentence is a fragment. Open decision on the "hold" request, so FLAG. | Portalba. The charter apron sits behind the port, with Costamaran flags on the tower. Costamar will let you leave from here and nothing more. | FLAG |
| LEVELS.airfield.approaches.depart.name | Board and depart | Needs the jet ready and the visa issued; roll 8 (+2 difficulty if Valdória asked and the minister does not know you are coming) (data.js:194, sim.js:190). | | | KEEP |
| LEVELS.airfield.approaches.depart.text | Leave once the jet is ready and your visa is issued. The tower still has to clear you. | | | | KEEP |
| LEVELS.airfield.approaches.depart.success.say | You take off. Forty minutes later, the pilot confirms you have left Costamaran airspace. | Win: stored only in s.over.reason, which no screen shows (sim.js:392, ui.js:270-283). For a country that never agreed, it prints before the loss (sim.js:391). | | | KEEP |
| LEVELS.airfield.approaches.depart.fail.say | The tower holds you on the apron for two hours while a request from Valdória is read, and reread. | Police attention +1, 4 hours. Prints whether or not Valdória has asked Costamar. | Humanizer 11, passive hides who reads; claims a request that may not exist. Open decision on the "hold" request, so FLAG. | The tower keeps you on the apron for two hours without clearing the jet. | FLAG |
| LEVELS.airfield.approaches.depart_nopermit.name | Depart without the visa | Needs the jet ready; roll 14, lowered by Vélez's card and the sponsor's line. | | | KEEP |
| LEVELS.airfield.approaches.depart_nopermit.text | Ask the pilot to leave without the visa. Your sponsor's line helps persuade him. If the country you picked never agreed to take you, you are held when you land. | Landing rule (sim.js:391). | | | KEEP |
| LEVELS.airfield.approaches.depart_nopermit.success.say | Capitān Olsēn files the flight plan and asks no questions. Your sponsor\'s phone rings somewhere over the ocean. | As depart.success (source has an escaped apostrophe). | | | KEEP |
| LEVELS.airfield.approaches.depart_nopermit.fail.say | The pilot will not go without a landing clearance, and you spend three hours arguing in a hangar. | Police attention +2, 5 hours. | | | KEEP |
| LEVELS.airfield.approaches.fuel_now.name | Pay the fuel agent yourself | Needs "crew hired"; roll 4; success moves the jet one step and adds police attention +1. | | | KEEP |
| LEVELS.airfield.approaches.fuel_now.text | Pay the fuel agent in cash to move the jet one step closer to ready. People on the apron will see you. | | | | KEEP |
| LEVELS.airfield.approaches.fuel_now.success.say | The fuel truck arrives. People on the apron recognize you. | | | | KEEP |
| LEVELS.airfield.approaches.fuel_now.fail.say | The agent will only take payment from the operator's account, and you lose an hour. | Police attention +1, 1 hour. | | | KEEP |
| STAGE_LINES.aircraft[0], reception[0], permission[0] | (empty string) | Placeholders for stage 0. | | | KEEP |
| STAGE_LINES.aircraft[1] | I found a jet in Portalba with 12 seats, and nobody has asked questions yet. | Never printed: sim.js:421 tests `to > s.arr[k].low`, and `low` is never set, so the test is always false. Speaker would be the sibling. | | | KEEP |
| STAGE_LINES.aircraft[2] | The crew is confirmed. | Never printed. | | | KEEP |
| STAGE_LINES.aircraft[3] | The fuel is paid, and the jet is moving into place. | Never printed. | | | KEEP |
| STAGE_LINES.aircraft[4] | The jet is ready at Portalba. | Never printed. | | | KEEP |
| STAGE_LINES.reception[1] | I reached Rosario Vélez, the minister's aide in Cerro Alto. Costamar expects you, but Vélez has not answered since. | Never printed; sibling. | | | KEEP |
| STAGE_LINES.reception[2] | Vélez has spoken to her minister, and she has sent you her card for the Costamaran posts and the tower. | Never printed; voiced by the sibling even when Vélez delivers (sim.js:421). | | | KEEP |
| STAGE_LINES.reception[3] | Costamaran officials will meet you at the {post}, and only there. | Never printed; the only text that would name the escort post. | | | KEEP |
| STAGE_LINES.permission[1] | {sponsor} has taken your call and will speak to the ministry, on {sponsor}\'s terms. | Never printed. The speaker is the sponsor (sim.js:421), so the sponsor would talk about himself in the third person. Both placeholders must stay. | Makes no sense in the speaker's voice; the fix is the speaker id or the placeholders, which a copy edit cannot change. | | FLAG |
| STAGE_LINES.permission[2] | The entry visa is issued. A car will meet the aircraft at {city}. | Never printed. | Terms stay consistent: "jet" everywhere else (sim.end.a_car_meets_the_aircraft reads "A car meets the jet at {city}."). | The entry visa is issued. A car will meet the jet at {city}. | REWRITE |
| ENEMY_ACTIONS.check_belief.text | Sosā's people search ${lv}. | Log line after the speaker label "Inspector Valentīn Sosā", round summary row, route board (ui.js:566, 610; sim.js:513), plus a suffix. Shown on both sides. | Interface terms: "the police"; with the speaker label it prints his name twice. Matches scene.sosa_at "Police are searching {place}". | The police search ${lv}. | REWRITE |
| ENEMY_ACTIONS.circulate.text | Sosā sends the travel ban to the posts at the line, and every crossing there now needs one more on the die unless you hold "A report held one day." | Sets the travel ban: every move at the line gets +1 six-sided difficulty unless you have "A report held one day" (sim.js:188, 515). On the 20-sided die that is about three more, e.g. 8 becomes 11. | Makes no sense on the current die: "one more" is the old six-sided figure. Interface terms: "the police"; no "hold" a card. | The police send the travel ban to the posts at the line, so every crossing there is harder unless you have "A report held one day." | REWRITE |
| ENEMY_ACTIONS.lean_operator.text | The ministry warns the Portalba charter operator that its Valdórian license is under review. | Sets flags.leaned; drops the jet a step if fueled (sim.js:516). | | | KEEP |
| ENEMY_ACTIONS.press_ally.text | Sosā calls ${who} in for a conversation. | A card giver is questioned; a die decides whether they talk (sim.js:517). | | | KEEP |
| ENEMY_ACTIONS.ask_esmeralda.text | Valdória asks Costamar, through its embassy in Cerro Alto, to hold you if you appear. | Sets flags.asked: takeoff gets +2 difficulty until "Costamar's minister knows you are coming", and police can stop you at Portalba (sim.js:190, 269, 518). Nobody holds you. | Results say what changed: the two effects are missing, and "hold" overstates (open decision). | Valdória asks Costamar, through its embassy in Cerro Alto, to hold you if you appear. Unless Costamar's minister knows you are coming, takeoff from Portalba is now harder. The police at Portalba can also stop you now. | REWRITE |
| ENEMY_ACTIONS.press_story.text | The ministry briefs the papers that you have already left the country. | Search moves away, police attention −1 (sim.js:519). | | | KEEP |
| ENEMY_ACTIONS.roadblock.text | Police set a checkpoint on the road out of ${lv}. For the next six hours every move there is harder. | +1 difficulty on moves at the searched stop for six hours (sim.js:189, 520). | | | KEEP |
| ENEMY_ACTIONS.trace.text | The ministry traces your recent calls. | Search moves onto you if you called in the last three hours (sim.js:514). | | | KEEP |
| ENEMY_ACTIONS.watch_sibling.text | Sosā has ${who}'s calls monitored. The operator in Portalba goes quiet for a while. | Every job the sibling already has pending comes due four hours later (sim.js:521). Nothing touches the operator. | Preserve meaning: invents an operator effect and hides the real one; "for a while" is a hedge (AGENTS "do not soften"). | Sosā has ${who}'s calls monitored, so every answer your sibling has already promised you comes four hours later. | REWRITE |
| DESTS.atlanta.name | Altamira | Map label and choice card (ui.js:706, 715). | | | KEEP |
| DESTS.atlanta.city | Lāyūna | Map label, visa and win lines (ui.js:706, sim.js:96). | Place-name rule: reads like a given name (Layuna, Luna). Do not rename here; the owner decides. | | FLAG |
| DESTS.atlanta.sponsor.name | Bīr Amādū Salek | Speaker name, "You now owe" log. | | | KEEP |
| DESTS.atlanta.sponsor.short | Salek | Option labels and effects. | | | KEEP |
| DESTS.atlanta.sponsor.role | a banker abroad and an old client of your family | Phone subline. | | | KEEP |
| DESTS.atlanta.sponsor.asks | Salek, a banker who knows your family, can ask the ministry for your visa. He wants the family accounts in return. | Map choice card (ui.js:716). | | | KEEP |
| DESTS.atlanta.sponsor.terms | He will speak to the ministry if you move the family accounts to his house. | Logged on the first visa call (sim.js:434). | | | KEEP |
| DESTS.atlanta.sponsor.demand.text | "The transfer papers are with your brother-in-law. Sign them and the ministry hears from me tonight." | Phone message at Nova Trentô once he has agreed to ask (sim.js:108-115). | | | KEEP |
| DESTS.atlanta.sponsor.demand.accept | Sign and move the accounts | Answer button. | | | KEEP |
| DESTS.atlanta.sponsor.demand.effect | Salek takes the family accounts and works harder for you. His visa answer now comes through on a 3 or better. | Shown under the answer button. Signing sets his trust to 2, which lowers his visa roll from six-sided 4 to 3: on the 20-sided die, 11 becomes 8 (sim.js:463, 495-496). | Makes no sense on the current die: "a 3" is the old six-sided figure. | Salek takes the family accounts and works harder for you. His visa answer now comes through on a roll of 8 or higher instead of 11. | REWRITE |
| DESTS.atlanta.sponsor.kept | Salek now holds the family accounts. | Epilogue on a win after signing, inside s.over.reason, which no screen shows (sim.js:548). | | | KEEP |
| DESTS.atlanta.sponsor.broke | Salek tells his clients you broke your word. | Epilogue after refusing him; not shown (sim.js:546). | | | KEEP |
| DESTS.atlanta.landing | (empty string) | Altamira accepts you. | | | KEEP |
| DESTS.tarun.name | Ardésia | Map. | | | KEEP |
| DESTS.tarun.city | Almatau | Map. | | | KEEP |
| DESTS.tarun.sponsor.name | Dēvan Rāo | | | | KEEP |
| DESTS.tarun.sponsor.short | Rāo | | | | KEEP |
| DESTS.tarun.sponsor.role | a magistrate in Almatau who has taken in exiles before | | | | KEEP |
| DESTS.tarun.sponsor.asks | Rāo, a magistrate in Almatau, can write to the ministry for your visa. He is slow, and he wants your word that you will stay out of politics. | Map card; visa calls take six more hours (data.js:243, sim.js:437). | | | KEEP |
| DESTS.tarun.sponsor.terms | He will write to the ministry if you give your word to keep out of politics while you are his guest. | | | | KEEP |
| DESTS.tarun.sponsor.demand.text | "I have drafted the letter. It says you will hold no office and give no interviews from Ardésia. I need your signature under mine." | | | | KEEP |
| DESTS.tarun.sponsor.demand.accept | Sign and give your word | | | | KEEP |
| DESTS.tarun.sponsor.demand.effect | Rāo has your word and works harder for you. His visa answer now comes through on a 3 or better. | As Salek: 11 becomes 8. Ardésia never issues the visa whatever the roll (sim.js:499). | Makes no sense on the current die: old six-sided figure. | Rāo has your word and works harder for you. His visa answer now comes through on a roll of 8 or higher instead of 11. | REWRITE |
| DESTS.tarun.sponsor.kept | Rāo has your word that you are out of politics. | Unreachable: an Ardésia run cannot win. | | | KEEP |
| DESTS.tarun.sponsor.broke | Rāo tells the ministry you broke your word. | Not shown (epilogue). | | | KEEP |
| DESTS.tarun.landing | You land at Almatau at dawn. The flight plan was accepted; you were not. Ardésia never agreed to take you, and the men at the foot of the stairs are police. A Valdórian liaison arrives by evening. | Loss text inside s.over.reason (sim.js:391); no screen shows it, the ending uses over.why_landed. | Humanizer 1, staged contrast ("The flight plan was accepted; you were not."). | You land at Almatau at dawn. Ardésia never agreed to take you, and the men at the foot of the stairs are police. A Valdórian liaison arrives by evening. | REWRITE |
| DESTS.zaryanova.name | Nordavia | Map. | | | KEEP |
| DESTS.zaryanova.city | Krasnomor | Map. | | | KEEP |
| DESTS.zaryanova.sponsor.name | Mirēlā Vosk | | | | KEEP |
| DESTS.zaryanova.sponsor.short | Vosk | | | | KEEP |
| DESTS.zaryanova.sponsor.role | a former trade envoy in Krasnomor with friends at the foreign ministry | | | | KEEP |
| DESTS.zaryanova.sponsor.asks | Vosk, a former trade envoy, can take your visa request to the ministry. She wants mineral rights you do not control. | Map card. | | | KEEP |
| DESTS.zaryanova.sponsor.terms | She will take it to the ministry if you sign over mineral rights you do not control. | | | | KEEP |
| DESTS.zaryanova.sponsor.demand.text | "The ministry wants the northern concessions in writing. Sign, and I take it to them tonight." | | | | KEEP |
| DESTS.zaryanova.sponsor.demand.accept | Sign the concession | | | | KEEP |
| DESTS.zaryanova.sponsor.demand.effect | Vosk takes the concession and works harder for you, so her visa answer comes through on a 3 or better. Word reaches home, and your police attention rises by one. | Trust 2 (11 becomes 8) and police attention +1 (heat 1, sim.js:463). | Makes no sense on the current die: old six-sided figure. | Vosk takes the concession and works harder for you, so her visa answer comes through on a roll of 8 or higher instead of 11. Word reaches home, and your police attention rises by one. | REWRITE |
| DESTS.zaryanova.sponsor.kept | Your signature on the concessions is in Krasnomor. | Unreachable. | | | KEEP |
| DESTS.zaryanova.sponsor.broke | Vosk tells the ministry you broke your word. | Not shown (epilogue). | | | KEEP |
| DESTS.zaryanova.landing | You land at Krasnomor after eight hours. Officers wait on the apron. Nordavia never agreed to take you. You are held at the airport until Valdória sends for you. | Loss text inside s.over.reason; not shown. | Owner tell: four clipped sentences in a row. | Officers are waiting on the apron when you land at Krasnomor after eight hours. Nordavia never agreed to take you, so they hold you at the airport until Valdória sends for you. | REWRITE |
| PLACES.valdoria.name | Valdória | Map label (ui.js:704). | | | KEEP |
| PLACES.valdoria.city | Portô Venla | Not read. | | | KEEP |
| PLACES.susana.name | Portalba | Map label (ui.js:705). | | | KEEP |
| PLACES.susana.city | Costamar | Not read; the field holds a country name. | | | KEEP |
| POSTS.rail | Paso Huhūi rail post | `{post}` in STAGE_LINES.reception[3] (never printed) and the ledger line "The sergeant at the {post} is paid off" (sim.js:387, 421). | | | KEEP |
| POSTS.high | Ālto Verdē road post | Same. | | | KEEP |
| POSTS.coast | Punta Marēa crossing | Same. | | | KEEP |

## Design inconsistencies

- The ending never shows its reason. `s.over.reason` holds the win line ("You take off…"), the landing text for Ardésia and Nordavia, and the epilogue (sibling on the warrant, holds, who talked, Gianlūka, Salek's accounts, Nonā Rosa's truck). No screen reads it: the end screen shows only the over.why_* catalog line (ui.js:275-279; sim.js:345, 391-392, 488, 535-550). On a win the player never sees a narrator line at all, because the win path pushes no `say` event (sim.js:392).
- The landing text says you are held until a Valdórian liaison arrives (data.js:246, 253), and the end screen says the country "would not take you and sent you back" (over.why_landed). The two disagree about the consequence.
- At the bought post, the move's success line prints first ("…stamps it", "…waves the car through"), then the bought-post text says you are still on the Valdórian side. The result card shows "Success" and uses the first narrator line, so it reports a crossing that did not happen (sim.js:378-379, 386-388; ui.js:532, 558).
- Stage lines never print: sim.js:421 compares against `s.arr[k].low`, which is never set. STAGE_LINES.reception[3] is the only text that would name the escort post. STAGE_LINES.permission[1] is spoken by the sponsor about himself in the third person, and STAGE_LINES.reception lines are voiced by the sibling even when Vélez delivers.
- Ally rolls are shown on the six-sided scale. The call preview says "It comes through on a roll of {turned} or better" with the raw reliability (sim.js:212), and the "Let {sibling} pick" effect passes `D.PEOPLE.sibling.reliability` raw (sim.js:98), while the real roll uses the 20-sided target (sim.js:451, 495-496). The sponsor demand effects (data.js:237, 244, 251) and the circulate text (data.js:219) had the same old-die figures.
- The Nova Trentô objective names one way out, but "Help Nonā Rosa free the truck" also leaves for Salta on success with no need for "Costamar expects you" (sim.js:17, 394; data.js:134).
- After a failed "Help Nonā Rosa free the truck" you stay at Nova Trentô, yet her line sim.line.nona_truck_late says "My cousin can still drive you to Salta" (sim.js:394, 401).
- The Portalba arrival and the "Board and depart" failure line state that Valdória has asked Costamar to hold you; the code sets that only through the police action after hour 30 or the "Let it stand" news choice (data.js:191, 197, 222, 443). The request itself never holds anyone; it adds +2 difficulty to takeoff and allows one level of police stop in Costamar (sim.js:190, 269).
- "Call your contacts" can push the visa to "entry visa issued" for Ardésia or Nordavia, which never accept you, and the jet past the destination check (sim.js:404, 412 against sim.js:498-499). The visa then shows as issued, and the player is still held on landing.
- Signing the sponsor's demand says his "visa answer now comes through" on a better roll, but for Ardésia and Nordavia the answer is always "still considering" (sim.js:499). Fixing the wording would reveal `accepts`, which must stay hidden (data.js:231).
- The roadblock text uses `D.LEVELS[...].short`, so it prints "on the road out of Residence" and "out of The line" with capitals mid-sentence; other police lines use the lowercase place name helper (sim.js:513, 520).
- Police action texts address "you" as the candidate, and the government player sees the same lines ("…unless you have 'A report held one day.'", "…to hold you if you appear") through `Sim.enemyAct` (gov.js:198, sim.js:523).
- Arrangement names ("Jet", "Welcome in Costamar", "Entry visa") serve as labels and also appear mid-sentence with capitals in sim.say.calls_moved_some ("…moved one step: Jet, Entry visa.") (sim.js:405).
- Card toasts use a label-and-value row: "Where it counts: {works}" (ui.js:603), which the brief bans. The `works` strings are written as fragments to fit it.
- The starting blurbs describe the fourth starting card (Teresā's friend in the inquiry, Matēu's barges), but a daily run can swap that card for "A report held one day" (data.js:17, 23; sim.js:58), so the blurb can be false on a daily.
- The residence arrival says the travel ban lists your passport, but the ban (`flags.restriction`) starts off and is switched on only by the police action, the government's order or Monday noon (sim.js:34, 481, 515).
- `pay: true` on five moves ("Hire a plain car and driver", "Pay Holt for a crate", "Pay the yardmaster", "Pay the Punta Marēa crossing", "Pay the fuel agent yourself") has no effect; the game has no money, and the view passes `pay` to a UI that never reads it (sim.js:196).
- `sim.js:193` sets difficulty 7 for a move id `own_passport` that no level has, so the Monday noon passport cancellation changes no move.
- The log template log.try "You try {name}." reads badly with move names that are verb phrases ("You try Hire a plain car and driver."), and more will be verb phrases after this pass (ui.js:597).
- CARDS.text, CHARACTERS.edge and flaw, CHARACTERS.short, ARRANGEMENTS.reception.what and permission.what, PEOPLE.sponsor.role and terms, PLACES.*.city and LEVELS.border.received.name are never shown.

Count: 35 rewrites, 230 keeps, 4 flags, 0 unknowns.
