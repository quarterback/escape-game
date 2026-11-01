# A. Escape side: places, moves, cards, requirements

Scope: src/data.js LEVELS, CARDS, PEOPLE, STAGE_LINES, ARRANGEMENTS, DESTS player fields; content/coalition/ui.json ids starting need., sim.status., sim.why., sim.preview., sim.label., action., card., route. (escape side), phone., hand., map. Also the two hard-coded need strings in src/sim.js:167-168, since they are the player-facing text for approach needs.

Out of scope and not rated: the government-only route ids (route.report_src, route.does_not_prove, route.may_be_here, route.no_command, route.ask_esm, route.esm_intro). The government action ids (action.wait_gov, action.send_order, action.send) start with action. and are rated.

Term used in proposals: "police attention" for s.exposure, as the brief proposes. The screen label is still "Exposure" (scene.exposure), so the two must change together.

Checked by running the sim from the scratchpad (no repo writes): stage lines never print; "Call your contacts" can be repeated and pushes a Tarun visa to "issued"; "Help Nonā Rosa free the truck" moves you to Salta; Matēu sees "Leave with Duartē's driver".

## 1. Strings

### LEVELS: residence

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| LEVELS.residence.name | The residence, Portô Venla | Level heading (ui.js:114). | Where they are. | | KEEP |
| LEVELS.residence.short | Residence | Route rail, board, briefing title (ui.js:250, 432). | Short place name. | | KEEP |
| LEVELS.residence.objective | Get past the watch. | Heading subline (ui.js:114). Any successful approach here moves you to Santa Laura (sim.js:16 EXITS null, 386). | What to do here. | | KEEP |
| LEVELS.residence.arrive | Two unmarked cars watch the house. The court has barred you from leaving and wants your passports by Monday. One of them is in your coat. | Narration on arrival and briefing (sim.js:89, ui.js:392). DEADLINE is Monday noon: own passport cancelled, travel ban on (sim.js:20, 466). The "passport" card (second passport) is in the starting hand (data.js:14, 20). | That the deadline is Monday noon and that they hold a second passport. "One of them" reads as one of the cars. | Two unmarked cars watch the house. The court has barred you from leaving and wants your passports by Monday noon. Your second passport is in your coat. | REWRITE |
| LEVELS.residence.approaches.decoy.name | Decoy convoy | Needs a decoy card (Nando's sedans); dc 3, information card +2; 3 hours (data.js:93-94). Nando acts, so a compromised Nando can sell the move (sim.js:373). | | | KEEP |
| LEVELS.residence.approaches.decoy.text | Send three cars in different directions. The watch must follow the wrong one. | Roll, not certain. Success: search stays on the residence (belief 0), attention -1, you leave (data.js:95, sim.js:393, 386). | That it can fail. "Must" says it cannot. | Send three cars out in different directions so the watch follows the wrong one. | REWRITE |
| LEVELS.residence.approaches.decoy.success.say | The watch follows a decoy. You leave by the service lane. | Matches success. | | | KEEP |
| LEVELS.residence.approaches.decoy.fail.say | The second car is stopped at the avenida. Nando talks his way out, but they know the cars now. | Fail: attention +2, you stay at the house (data.js:96). The decoy card is kept and nothing tracks the cars being known. | What it cost: more police attention, still at the house. | The second car is stopped at the avenida. Nando talks his way out, and the police are watching the house more closely now. | REWRITE |
| LEVELS.residence.approaches.service.name | The service door after dark | Needs night: 10 p.m. to 5 a.m. (sim.js:164); dc 4, information +1; 1 hour. | | | KEEP |
| LEVELS.residence.approaches.service.text | Leave with the kitchen staff after 22:00. | Night window is 22:00 to 05:00 (sim.js:164). 24-hour clock breaks AP style used everywhere else. | When it works. | Leave with the kitchen staff between 10 p.m. and 5 a.m. | REWRITE |
| LEVELS.residence.approaches.service.success.say | The night cook lends you an apron and a cigarette. Nobody looks at the help. | Success: search stays on the residence, you leave. | | | KEEP |
| LEVELS.residence.approaches.service.fail.say | A flash from a parked car. Someone photographed the help tonight. | Fail: attention +2, you stay. | | | KEEP |
| LEVELS.residence.approaches.partycar.name | The party's official car | Needs an influence card (Gianlūka's party machine); dc 2; 1 hour (data.js:101). Success and fail both add Gianlūka's terms to what you owe and give "A report held one day" (sim.js:396). | | | KEEP |
| LEVELS.residence.approaches.partycar.text | Use Gianlūka's official car. He will expect your promised endorsement. | Taking the car creates the promise; it is not earlier. Terms: PEOPLE.aide.terms (data.js:28). At Salta he asks you to keep it (sim.js:127-131). | That using the car is the promise, and what he wants. | Ride out in Gianlūka's official car. In return he wants your public word that he leads the party while you are gone. | REWRITE |
| LEVELS.residence.approaches.partycar.success.say | The flags get you through. Gianlūka reminds you, gently, what he asked for. | Matches. | | | KEEP |
| LEVELS.residence.approaches.partycar.fail.say | The car is let through, but the inspector is told whose car it was. | Fail: attention +1 and you stay at the residence; there is no exit on failure (sim.js:386). "Let through" says you left. | That they are still at the house. | The watch stops the car at the gate and tells Sosā whose car it is. You are still at the house. | REWRITE |

### LEVELS: Santa Laura

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| LEVELS.road.name | The road south, Santa Laura | Heading. | | | KEEP |
| LEVELS.road.short | Santa Laura | | | | KEEP |
| LEVELS.road.objective | Change cars. | Every success moves you to Nova Trentô (EXITS null). Two of four moves do not change cars (barge, own car). | Where to go next. | Get from Santa Laura to the colônia at Nova Trentô. | REWRITE |
| LEVELS.road.arrive | Santa Laura. The radio puts you on a yacht in Portô Venla. The posts have not received the travel ban yet. | Static. The ban (flags.restriction) can already be on from Sosā's circulate action at any hour (sim.js:500). | A true statement. | Santa Laura. The radio says you are on a yacht in Portô Venla. | REWRITE |
| LEVELS.road.approaches.second_driver.name | Hire a driver and plain car | No needs; dc 3, information +1; 2 hours; pay: true has no effect (sim.js:190, nothing reads it). | | Hire a driver and a plain car | REWRITE |
| LEVELS.road.approaches.second_driver.text | Nando's cousin offers a taxi and his silence. | | | | KEEP |
| LEVELS.road.approaches.second_driver.success.say | You leave by taxi. Nando drives your sedan north as a decoy. | Success moves you on; the search location is unchanged (data.js:112). There is no decoy effect. | No false promise of a decoy. | You leave by taxi while Nando drives your sedan back north. | REWRITE |
| LEVELS.road.approaches.second_driver.fail.say | The cousin wants more, then wants nothing to do with it. Two hours lost. | Fail: attention +1, 2 + 2 = 4 hours pass (sim.js:385), you stay. | The real time cost. | The cousin wants more money, then wants nothing to do with it. The attempt costs you four hours. | REWRITE |
| LEVELS.road.approaches.siblings_driver.name | Leave with Duartē's driver | Hard-coded name: Matēu's sibling is Līviā (data.js:17), and he still sees "Duartē" (tested). Needs aircraft stage 1, charter found (data.js:114). | The right sibling. | Leave with your sibling's driver | REWRITE |
| LEVELS.road.approaches.siblings_driver.text | Your sibling knows a man in Santa Laura. Once the charter is booked, he drives you to Nova Trentô. | Matches the need (charter found). | | | KEEP |
| LEVELS.road.approaches.siblings_driver.success.say | He asks nothing and drives the back roads. The radio stays off. | | | | KEEP |
| LEVELS.road.approaches.siblings_driver.fail.say | He is late, then nervous. An hour on a side street waiting for him to decide. | Fail: attention +1, 3 hours total. Second sentence is a fragment. | | He is late, then nervous, and you wait an hour on a side street while he decides. | REWRITE |
| LEVELS.road.approaches.barge.name | Take a family barge upriver | Needs a boat card (Matēu only, data.js:20); dc 2, information +1; 3 hours. | | | KEEP |
| LEVELS.road.approaches.barge.text | A captain who owes your father takes you up the river to the colônia. Nobody checks a barge. | Fail case is river police boarding (data.js:121), so "nobody checks" is false. | | A captain who owes your father takes you up the river to the colônia. | REWRITE |
| LEVELS.road.approaches.barge.success.say | You sleep under a tarp that smells of soy. The river is quiet. | Attention -1. | | | KEEP |
| LEVELS.road.approaches.barge.fail.say | River police board at the lock. The captain talks for two hours. | Attention +1, 5 hours total. | | | KEEP |
| LEVELS.road.approaches.known_car.name | Drive on in your own car | dc 5; delay card +2, decoy card +2 (data.js:123). | | | KEEP |
| LEVELS.road.approaches.known_car.text | Risk the posts in a car they recognize. Nando's spare sedans can run ahead of you. | Both the decoy card and the delay card ("A report held one day") lower the roll. Only the sedans are named. | Which cards help. | Risk the posts in a car they know. Nando's spare sedans or a held report make it easier. | REWRITE |
| LEVELS.road.approaches.known_car.success.say | You pass the first post before the fax does. | Attention +1, you move on. | | | KEEP |
| LEVELS.road.approaches.known_car.fail.say | The post at the river has your plate. They let you through and pick up the phone. | Fail: attention +3, the search moves to Santa Laura, you stay (data.js:125, sim.js:393). "Let you through" says you left. | That they were stopped and the search is now on them. | The post at the river has your plate. They turn you back and phone Sosā's people. | REWRITE |

### LEVELS: Nova Trentô

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| LEVELS.colonia.name | The colônia, Nova Trentô | | | | KEEP |
| LEVELS.colonia.short | Nova Trentô | | | | KEEP |
| LEVELS.colonia.objective | Leave for the border once Baca has your name. | The gated exit "Take the road to Salta" needs reception stage 1, "Esmeralda expects you" (data.js:141). It goes to Salta, not the border. "Help Nonā Rosa free the truck" also exits on success with no gate (sim.js:16). | Next stop is Salta; the gate is Esmeralda expecting you. | Get Esmeralda to expect you, then take the road to Salta. | REWRITE |
| LEVELS.colonia.arrive | Nonā Rosa offers a room and a phone. Her cooperative's truck was impounded this morning. | | | | KEEP |
| LEVELS.colonia.approaches.help_host.name | Help Nonā Rosa free the truck | dc 2, influence +2; 3 hours. Success: truck card, Nonā Rosa's trust +1, and you travel to Salta (EXITS colonia includes help_host, sim.js:16, 386; tested). Fail: truck card anyway, +1 hour, you stay. | That success moves them on. | | KEEP |
| LEVELS.colonia.approaches.help_host.text | Free the cooperative's truck instead of calling your own contacts. | Nothing makes it exclusive with calling. The move to Salta is unstated. | What happens on success. | Spend three hours getting the cooperative's truck released. If it works, her cousin drives you to Salta in it. | REWRITE |
| LEVELS.colonia.approaches.help_host.success.say | The truck is released. Nonā Rosa offers it with a driver and keeps your visit quiet. | Success also moves you to Salta. "Keeps your visit quiet" has no effect beyond trust +1. | That they are leaving. | The truck is released. Nonā Rosa lends it to you with a driver, and you set off for Salta. | REWRITE |
| LEVELS.colonia.approaches.help_host.fail.say | The truck comes back at dawn, late and dented. She is grateful anyway. | Fail: truck card, +1 hour, no trust change. "At dawn" ignores the real hour. | | The truck comes back late and dented. Nonā Rosa lends it to you anyway. | REWRITE |
| LEVELS.colonia.approaches.work_phone.name | Call your contacts | dc 1, certain; 3 hours. Success moves aircraft, reception and permission each one stage at once, skipping allies, rolls, gates and the destination's answer (data.js:137, sim.js:397). It is not an exit, so it can be repeated (tested). | | | KEEP |
| LEVELS.colonia.approaches.work_phone.text | Advance the aircraft, reception and permission arrangements. | As above. "Permission" and "reception" are internal arrangement names. | What moves. | Spend three hours on Nonā Rosa's phone. The jet, your welcome in Esmeralda and your visa each move one step. | REWRITE |
| LEVELS.colonia.approaches.work_phone.success.say | By two in the morning three things have moved. Nonā Rosa eats alone. | "Two in the morning" is fixed text; the hour can be anything. | | Three hours later, all three arrangements have moved one step. Nonā Rosa eats alone. | REWRITE |
| LEVELS.colonia.approaches.work_phone.fail.say | (empty) | Unreachable (dc 1). | | | KEEP |
| LEVELS.colonia.approaches.sleep.name | Sleep | 6 hours, certain; attention -2 (data.js:140). Sosā keeps acting every three hours (sim.js:471). | | | KEEP |
| LEVELS.colonia.approaches.sleep.text | Rest for six hours. Exposure drops, but the inquiry keeps working. | As above. | By how much. | Rest for six hours. Your police attention drops by two while Sosā keeps searching. | REWRITE |
| LEVELS.colonia.approaches.sleep.success.say | You wake before the roosters. The house is quiet and the radio still has you at sea. | "At sea" assumes you confirmed the yacht story; nothing checks flags.lied. | | You wake before the roosters. The house is quiet. | REWRITE |
| LEVELS.colonia.approaches.sleep.fail.say | (empty) | Unreachable. | | | KEEP |
| LEVELS.colonia.approaches.leave.name | Take the road to Salta | Needs reception stage 1; certain; 2 hours. | | | KEEP |
| LEVELS.colonia.approaches.leave.text | Do not climb toward the border until someone in Baca has your name. Then go. | Gate: reception stage 1 "Esmeralda expects you". | The gate in the same words as the route. | Once Esmeralda expects you, Nonā Rosa's cousin drives you up to Salta. | REWRITE |
| LEVELS.colonia.approaches.leave.success.say | Nonā Rosa's cousin drives. The road climbs and the radio loses the station. | Plays even if you cut Nonā Rosa off; nothing checks. | | | KEEP |
| LEVELS.colonia.approaches.leave.fail.say | (empty) | Unreachable. | | | KEEP |

### LEVELS: Salta

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| LEVELS.salta.name | The rail town, Salta | | | | KEEP |
| LEVELS.salta.short | Salta | | | | KEEP |
| LEVELS.salta.objective | Get on the midnight freight. The yardmaster sells you to Sosā. | Only "Board the midnight freight" exits (sim.js:16). "Pay the yardmaster" cannot succeed (dc 7). | | Get on the midnight freight. The yardmaster will sell you to Sosā. | REWRITE |
| LEVELS.salta.arrive | The midnight freight climbs to the border. Holt and Theo can get you aboard. | Passage cards come from Holt, Theo, Nonā Rosa's grandson (event) or the yardmaster (event) (data.js:72-81, 394, 412). | | | KEEP |
| LEVELS.salta.approaches.board.name | Board the midnight freight | Needs a passage card and night (10 p.m. to 5 a.m.); dc 3 with passage +2, so always certain once allowed; 1 hour (data.js:149). | | | KEEP |
| LEVELS.salta.approaches.board.text | The freight leaves at midnight. Holt or Theo gets you on; you still have to be there. | Boarding works any hour from 10 p.m. to 5 a.m., not only midnight. The grandson also gives a passage card. | Both requirements. | Board between 10 p.m. and 5 a.m. with a passage card from Holt, Theo or Nonā Rosa's grandson. | REWRITE |
| LEVELS.salta.approaches.board.success.say | The train pulls out at 12 past. Cold straw, then the sound of the grade. | | | | KEEP |
| LEVELS.salta.approaches.board.fail.say | A lamp swings down the cars. You miss the midnight and wait for the next. | Unreachable: the move is always certain when allowed. | | | KEEP |
| LEVELS.salta.approaches.crate.name | Pay Holt for a crate | dc 3, vehicle +1, information +1; 2 hours. Success gives the crate card only; you do not board (data.js:155). pay has no effect. | | | KEEP |
| LEVELS.salta.approaches.crate.text | Pay Holt to hide you in the third boxcar. | Gives a passage card; boarding is a separate night move. | That boarding is still to come. | Pay Holt to save you a crate in the third boxcar. You still have to board at night. | REWRITE |
| LEVELS.salta.approaches.crate.success.say | Holt pockets the notes without counting them. "Third car. Midnight. I don't wait." | Dialogue. | | | KEEP |
| LEVELS.salta.approaches.crate.fail.say | Holt wants to see who else is asking. You spend two hours in a shed waiting for him to decide. | Attention +1, 2 hours. | | | KEEP |
| LEVELS.salta.approaches.foreman.name | Theo's walk-through | dc 4, vehicle +2, information +1, influence +1; 2 hours. Success: "Theo walks you through" card and Theo's trust +1; you do not board (data.js:159). | | | KEEP |
| LEVELS.salta.approaches.foreman.text | Theo escorts you through the yard. The colônia's truck strengthens your case. | Gives a passage card; boarding is later. | | Theo agrees to walk you through the yard at train time. The colônia's truck helps convince him. | REWRITE |
| LEVELS.salta.approaches.foreman.success.say | Theo talks about switches the whole way across the yard. Nobody interrupts a foreman. | Reads as boarding now; you only get the card. | | Theo agrees to walk you across the yard tonight. Nobody interrupts a foreman. | REWRITE |
| LEVELS.salta.approaches.foreman.fail.say | The registry window is open late tonight. Theo shakes his head and tells you to come back at the shift change. | Attention +1. | | | KEEP |
| LEVELS.salta.approaches.buy_seat.name | Pay the yardmaster | dc 7: always fails; attention +2; still selectable (sim.js:189-190). | | | KEEP |
| LEVELS.salta.approaches.buy_seat.text | He will pocket the money and report you. This cannot succeed. | Matches. | | | KEEP |
| LEVELS.salta.approaches.buy_seat.success.say | Three men watch the yardmaster take your money. | Unreachable. | | | KEEP |
| LEVELS.salta.approaches.buy_seat.fail.say | He takes the envelope, thanks you by your real name, and walks to the telephone. The yard knows who is here. | Attention +2. | | | KEEP |

### LEVELS: the line

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| LEVELS.border.name | The line at the Huhūi passes | | | | KEEP |
| LEVELS.border.short | The line | | | | KEEP |
| LEVELS.border.objective | Cross into Esmeralda. One post is bought. | One of three posts (s.boughtPost) is Valdória's: success there keeps you on this side (sim.js:47, 378-381). "Bought" by whom is unclear. | Which side the bought post works for. | Cross into Esmeralda. One of the three posts works for Valdória. | REWRITE |
| LEVELS.border.arrive | The passes. Three crossings within a day of each other: the rail post at Paso Huhūi, the road post at Ālto Verdē toward Baca, and the Punta Marēa crossing toward the coast. Somewhere among them, guards who have been paid from your side of the line. | "Paid from your side of the line" reads as paid for you. The code: the bought post detains you for Valdória. | That one post will stop them. | The passes. Three crossings lie within a day of each other: the rail post at Paso Huhūi, the road post at Ālto Verdē toward Baca, and the Punta Marēa crossing toward the coast. Valdória has paid the guards at one of them to stop you. | REWRITE |
| LEVELS.border.approaches.post_rail.name | Cross at the Paso Huhūi post | Needs a document card (second passport); dc 4, introduction +2, influence +1; 1 hour. Border rolls also get +1 with the travel ban unless you hold a delay card, +1 for Teresā, +1 at a checkpoint (sim.js:182-186). | | | KEEP |
| LEVELS.border.approaches.post_rail.text | The freight's own crossing, and the one Sosā expects. Your second passport goes on the desk. | Nothing tracks Sosā expecting this post. | | The freight's own crossing. You show your second passport at the desk. | REWRITE |
| LEVELS.border.approaches.post_rail.success.say | The guard turns the pages, looks at a sheet on the desk, and stamps it. | | | | KEEP |
| LEVELS.border.approaches.post_rail.fail.say | The guard reads the sheet first. Three hours in a cold room before Gianlūka's phone call gets you back outside, on the wrong side. | Fail: attention +2, 4 hours total. Nothing involves Gianlūka; it plays even if he talked or you cut him off. | That they are still in Valdória. | The guard reads the sheet first. You spend three hours in a cold room and come out on the Valdórian side. | REWRITE |
| LEVELS.border.approaches.post_high.name | Take the Ālto Verdē road post | No needs; dc 3, introduction +2, vehicle +1 (no vehicle card reaches the line); 3 hours. | | | KEEP |
| LEVELS.border.approaches.post_high.text | Three hours of switchbacks toward Baca. The post answers to the interior ministry, where Vélez works. | Explains the Vélez card bonus. | | | KEEP |
| LEVELS.border.approaches.post_high.success.say | A long climb. The sergeant at Ālto Verdē reads your name off a list and waves the car through. | Plays with or without any reception arrangement; "a list" implies you were expected. | | A long climb. The sergeant at Ālto Verdē checks your passport and waves the car through. | REWRITE |
| LEVELS.border.approaches.post_high.fail.say | The post has no list with your name on it. Two hours while someone in Baca is woken up. | Attention +1, 5 hours total. Fragment. | | The post has no list with your name on it, and you wait two hours while someone in Baca is woken up. | REWRITE |
| LEVELS.border.approaches.post_coast.name | Pay the Punta Marēa crossing | No needs; dc 4, delay +2, information +2; 2 hours; pay has no effect. | | | KEEP |
| LEVELS.border.approaches.post_coast.text | The merchants' road to the coast. The guards here answer to the port, and the port takes money. | | | | KEEP |
| LEVELS.border.approaches.post_coast.success.say | The barrier goes up. Nobody says thank you. | Attention +1. | | | KEEP |
| LEVELS.border.approaches.post_coast.fail.say | The older guard takes the money and the younger one calls the ministry. Two hours in the salt wind. | Attention +2, 4 hours total. | | | KEEP |
| LEVELS.border.received.name | Walk to the people waiting | Never shown: the escort post keeps its own button name (sim.js:365-366 reads only .say and .hours). | | | KEEP |
| LEVELS.border.received.say | Rosario Vélez shakes your hand across the barrier. The guards on your side write nothing down. | Plays when reception is at stage 3 and you pick the escort post: automatic crossing (sim.js:365). | | | KEEP |
| LEVELS.border.bought.say | The sergeant takes your passport, walks into the hut, and does not come back. Through the window you can see him on the telephone. 12 hours later a Valdórian liaison arrives to "assist". By then it is too late to matter which side of the line you are on. | Success at the bought post: you stay at the line, the search moves onto you, attention +2, the move's hours + 12 pass (sim.js:378-381). The passport card is kept. The run goes on; it is not "too late". | That they are still on the Valdórian side and can try another post. | The sergeant reads your passport, walks into the hut and picks up the telephone. He keeps you waiting 12 hours, until a Valdórian liaison arrives. You are still on the Valdórian side of the line. | REWRITE |

### LEVELS: Susana

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| LEVELS.airfield.name | Susana airfield, Esmeralda | | | | KEEP |
| LEVELS.airfield.short | Susana | | | | KEEP |
| LEVELS.airfield.objective | Board the jet. | | | | KEEP |
| LEVELS.airfield.arrive | Susana. The charter apron behind the port, Esmeraldan flags on the tower. They will let you leave from here and nothing more. Sosā has asked them to hold you. | The last sentence is always shown. flags.asked is set only by Sosā's ask_esmeralda (after hour 30) or the goodbye_post event (sim.js:503, data.js:440). | A true statement about the request. | Susana. The charter apron sits behind the port, with Esmeraldan flags on the tower. Esmeralda will let you leave from here and nothing more. | FLAG-4 |
| LEVELS.airfield.approaches.depart.name | Board and depart | Needs aircraft stage 4 and permission stage 2; dc 3, introduction +1, document +1; +2 if Esmeralda was asked and reception is below stage 2 (sim.js:184). Success: win, or the "landed" loss if the country never agreed (sim.js:383). | | | KEEP |
| LEVELS.airfield.approaches.depart.text | The jet is ready and the visa is on the manifest. You still need the tower to clear departure. | States both needs as met, including when the button is blocked. | What is required. | Leave once the jet is ready and your visa is issued. The tower still has to clear you. | REWRITE |
| LEVELS.airfield.approaches.depart.success.say | You take off. Forty minutes later, the pilot confirms you have left Esmeraldan airspace. | | | | KEEP |
| LEVELS.airfield.approaches.depart.fail.say | The tower holds you on the apron for two hours while a request from Valdória is read, and reread. | Fail: attention +1, 4 hours total. Plays whether or not Valdória asked. | | The tower keeps you on the apron for two hours before it will talk to the pilot. | FLAG-4 |
| LEVELS.airfield.approaches.depart_nopermit.name | Depart without the visa | Needs aircraft stage 4; dc 5, introduction +1, permission +2. Success: win only if the country accepts you, else "landed" loss (sim.js:383). | | | KEEP |
| LEVELS.airfield.approaches.depart_nopermit.text | Ask the pilot to leave before the visa is issued. Your sponsor's name helps; the party's does not. Where you land decides what happens next. | The party card does not reach Susana anyway. The landing rule is real. | The risk in plain words. | Ask the pilot to leave without the visa. Your sponsor's line helps persuade him. If the country you picked never agreed to take you, you are held when you land. | REWRITE |
| LEVELS.airfield.approaches.depart_nopermit.success.say | Capitān Olsēn files the flight plan and asks no questions. Your sponsor's phone rings somewhere over the ocean. | Plays before the landing text. | | | KEEP |
| LEVELS.airfield.approaches.depart_nopermit.fail.say | The pilot will not go without a landing clearance. Three hours arguing in a hangar. | Attention +2, 5 hours total. Fragment. | | The pilot will not go without a landing clearance, and you spend three hours arguing in a hangar. | REWRITE |
| LEVELS.airfield.approaches.fuel_now.name | Pay the fuel agent yourself | Needs aircraft stage 2; dc 2; 1 hour. Success: aircraft +1 stage, attention +1. Repeatable (fuel then ready). pay has no effect. | | | KEEP |
| LEVELS.airfield.approaches.fuel_now.text | Pay in person to advance aircraft preparations. Exposure rises. | As above. | | Pay the fuel agent in cash to move the jet one step closer to ready. People on the apron will see you. | REWRITE |
| LEVELS.airfield.approaches.fuel_now.success.say | The fuel truck arrives. People on the apron recognize you. | | | | KEEP |
| LEVELS.airfield.approaches.fuel_now.fail.say | The agent wants the operator's account, not cash. An hour wasted. | Attention +1, 1 hour. | | The agent will only take payment from the operator's account, and you lose an hour. | REWRITE |

### Need text built in src/sim.js

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| sim.js:167 needText night | After 22:00. | Blocked reason for night moves (10 p.m. to 5 a.m.). Hard-coded in .js (rule C12), and need.after already says "After 10 p.m." | AP time; one source. | It is too early. Night moves open at 10 p.m. | REWRITE |
| sim.js:168 needText arrangement | Needs: {stage}. | Blocked reason for arrangement needs: "Needs: charter found.", "Needs: ready at Susana." Hard-coded label-and-value fragment. | What is missing. | This waits on the next step: {stage}. | REWRITE |

### CARDS

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| CARDS.decoy_cars.name | Two more cars like yours | Tag decoy; reach residence, road. Used by Decoy convoy (need), Drive on in your own car (+2), house arrest climb (-1 to need), and the Salta "send Nando past the gate" message, which spends it outside its reach (sim.js:225, 452). | | | KEEP |
| CARDS.decoy_cars.works | Leaving the house. Driving on in your own car. | Shown under "Where it counts" (ui.js:194). Two fragments. | Where it counts. | At the residence and on the road at Santa Laura. | REWRITE |
| CARDS.decoy_cars.text | Two matching sedans and two friends who will drive them the wrong way. | | | | KEEP |
| CARDS.aide_word.name | The party machine | Tag influence; reach residence through the line. | | | KEEP |
| CARDS.aide_word.works | Officials in Valdória, up to the line. Nothing across it. | Second sentence restates the first. It does count at the line itself. | | Valdórian officials, up to and at the line. | REWRITE |
| CARDS.aide_word.text | Gianlūka can put a mayor, a judge or a border post on the phone. Each call costs you with him. | Card bonuses cost nothing. Only some event choices that need it lower his trust (data.js:365, 451, 457, 466). | No false cost. | Gianlūka can get a mayor, a judge or a border post on the phone for you. | REWRITE |
| CARDS.truck.name | The colônia's grape truck | Tag vehicle; reach colônia, Salta. Helps Holt's crate (+1) and Theo (+2). | | | KEEP |
| CARDS.truck.works | The road to Salta and the rail yard. | It gives no help on the road to Salta; only the two Salta moves use it. | | Getting help in the Salta rail yard. | REWRITE |
| CARDS.truck.text | A farm truck nobody looks at twice, and a cousin who drives it to Salta every week. | | | | KEEP |
| CARDS.passport.name | Your second passport | Tag document; reach line, Susana. Needed at Paso Huhūi; +1 on Board and depart. Lost first at a station hold (sim.js:328). | | | KEEP |
| CARDS.passport.works | The border post and the airfield manifest. | Only Paso Huhūi needs it. | | The Paso Huhūi post and the Susana departure. | REWRITE |
| CARDS.passport.text | You have held it for years. The travel ban lists your other one. | | | | KEEP |
| CARDS.intro_vel.name | Rosario Vélez's card | Gained at reception stage 2 (sim.js:407). Tag introduction; +2 Paso Huhūi, +2 Ālto Verdē, +1 both departures; unlocks "have Vélez call the operator". | | | KEEP |
| CARDS.intro_vel.works | Esmeraldan officials: the post, the tower, the operator. | Helps at two posts, not Punta Marēa. | | Paso Huhūi, Ālto Verdē, the Susana tower and the charter operator. | REWRITE |
| CARDS.intro_vel.text | Vélez's number and her word that the border post knows your name. | | | | KEEP |
| CARDS.delay_report.name | A report held one day | Tag delay; reach Valdória. Never expires. Removes the +1 the travel ban adds at the line; +2 on Drive on in your own car and Punta Marēa (sim.js:182). | | | KEEP |
| CARDS.delay_report.works | Any Valdórian post reading the restriction. | "Restriction" is the internal flag name. | | Valdórian posts checking the travel ban, including Santa Laura and the line. | REWRITE |
| CARDS.delay_report.text | Gianlūka's contact holds the sighting report until tomorrow. The ban is not on the desk yet. | What it does: the ban does not count against you at the line. "Until tomorrow" is untracked. | | Gianlūka's contact keeps the travel ban off the desk at Valdórian posts. | REWRITE |
| CARDS.crate.name | Holt's chalk-marked crate | Tag passage; Salta; dropped when you leave Salta (sim.js:413). | | | KEEP |
| CARDS.crate.works | Boarding the midnight freight. | | | | KEEP |
| CARDS.crate.text | Third boxcar. Straw inside. Holt leaves at midnight and does not wait. | | | | KEEP |
| CARDS.yard_walk.name | Theo walks you through | Tag passage. The yardmaster event also grants it, and then the card still says it is from Theo (data.js:412, ui.js:205). | | | KEEP |
| CARDS.yard_walk.works | Boarding the midnight freight. | | | | KEEP |
| CARDS.yard_walk.text | Theo escorts you past the yard office to the train. | | | | KEEP |
| CARDS.sponsor_line.name | Your sponsor's line to the ministry | Gained at permission stage 1 (sim.js:408). Tag permission; +2 on Depart without the visa; spent by "ask the sponsor to reach Vélez's uncle"; needed for the sponsor guarantee choice. | | | KEEP |
| CARDS.sponsor_line.works | Anyone who banks. Vélez's uncle. A nervous pilot. | Fragments. | | Reaching Vélez's uncle, calming the crew and leaving without the visa. | REWRITE |
| CARDS.sponsor_line.text | A name that opens doors money alone does not. Your sponsor keeps count. | Guarantee choice lowers sponsor trust (data.js:433). | | | KEEP |
| CARDS.barge.name | Your family barges | Tag boat; reach road, colônia; Matēu's starting hand. | | | KEEP |
| CARDS.barge.works | The river south of Santa Laura. | | | | KEEP |
| CARDS.barge.text | The barges still run the river. The captains still owe your father. | | | | KEEP |
| CARDS.grandson.name | Nonā Rosa's grandson | Tag passage, from the colônia event. | | | KEEP |
| CARDS.grandson.works | Boarding the midnight freight. | | | | KEEP |
| CARDS.grandson.text | He is 19, quick, and knows which boxcar the guards skip. | | | | KEEP |
| CARDS.informant.name | A friend in the inquiry | Tag information; reach Valdória; +1 or +2 on most Valdórian moves and Punta Marēa. | | | KEEP |
| CARDS.informant.works | Any move the inquiry could be watching, up to the line. | | | | KEEP |
| CARDS.informant.text | A clerk tells Gianlūka where Sosā is looking and who is on duty. | | | | KEEP |

### PEOPLE

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| PEOPLE.sibling.role | arranging the aircraft from abroad | Not shown for the sibling (ui.js:179 uses phone.sibling_role); render tooltip (render.js:79). The sibling also handles reception calls to stage 2 (sim.js:210). | | arranging the jet and your welcome in Esmeralda from abroad | REWRITE |
| PEOPLE.aide.name | Gianlūka Moretī | | | | KEEP |
| PEOPLE.aide.role | party chief of staff | | | | KEEP |
| PEOPLE.aide.terms | He wants your public word that he leads the party in your absence. | Logged as "You now owe..." (ui.js:551). | | | KEEP |
| PEOPLE.nando.name / role | Nando / your driver for 11 years | | | | KEEP |
| PEOPLE.sponsor.name | Your sponsor | Replaced by the destination's sponsor everywhere in Sim.personName (sim.js:78). | | | KEEP |
| PEOPLE.sponsor.role | the person asking a ministry to let you in; set by where you chose to go | Second clause is a developer note. Shown on the government phone and render tooltip (ui.js:179, render.js:79). | | the person asking a foreign ministry for your visa | REWRITE |
| PEOPLE.host.name / role | Nonā Rosa Trentinī / matriarch of the Nova Trentô colônia | | | | KEEP |
| PEOPLE.official.name / role | Rosario Vélez / aide to Esmeralda's interior minister | | | | KEEP |
| PEOPLE.official.terms | She wants it understood that Esmeralda receives you as a guest, not as a government in exile. | Logged when you call her for reception (sim.js:420). | | | KEEP |
| PEOPLE.holt.name / role | Holt Greer / brakeman on the Huhūi freight | | | | KEEP |
| PEOPLE.theo.name / role | Theo Bascom / yard foreman in the Salta rail town | | | | KEEP |
| PEOPLE.pilot.name / role | Capitān Olsēn / charter pilot, Susana | | | | KEEP |
| PEOPLE.press.name / role | Rādiô Portô Venla / the station everyone in the capital has on | | | | KEEP |

### ARRANGEMENTS and STAGE_LINES

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| ARRANGEMENTS.aircraft.name | Aircraft | Used in call labels, lowercased (sim.js:205, ui.js:185). | | | KEEP |
| ARRANGEMENTS.aircraft.stages | none \| charter found \| crew confirmed \| fueled at Susana \| ready at Susana | Shown in "Needs: x.", "Next is x", ledger, result rows (capitalized), route cells. Stage 2 needs a destination (sim.js:483). | Phrases that make sense alone. | none \| charter found \| crew confirmed \| jet fueled at Susana \| jet ready at Susana | REWRITE |
| ARRANGEMENTS.aircraft.what | Your sibling finds the charter, the crew, the fuel and a place to wait at Susana. | Route "not started" cell for the jet (ui.js:220). Reads as done. | What to do. | Call your sibling to find a charter, a crew, fuel and a place at Susana. | REWRITE |
| ARRANGEMENTS.reception.name | Reception | Lowercased in call labels. A new name with a proper noun would break (toLowerCase). | | | KEEP |
| ARRANGEMENTS.reception.stages | none \| Esmeralda expects you \| minister informed \| officials at the border | 1 opens the road to Salta; 2 cancels the +2 takeoff penalty and gives Vélez's card; 3 makes the escort post automatic (sim.js:181, 184, 407). | That 3 is one post. | none \| Esmeralda expects you \| minister informed \| officials waiting at one post | REWRITE |
| ARRANGEMENTS.reception.what | Baca has your name, and Vélez puts officials at the post to meet you. | Never shown (ui.js:220 swaps in need.baca or need.velez). | | | KEEP |
| ARRANGEMENTS.permission.name | Entry visa | | | | KEEP |
| ARRANGEMENTS.permission.stages | none \| sponsor engaged \| Entry visa issued | Capital E reads wrong mid-sentence ("Next is Entry visa issued"). Stage 2 never arrives for a country that does not accept you, except through "Call your contacts" (sim.js:484, 397). | | none \| sponsor asking the ministry \| entry visa issued | REWRITE |
| ARRANGEMENTS.permission.what | Your sponsor asks the ministry in the country you chose for a visa. | Never shown (ui.js:220 uses need.salek). | | | KEEP |
| STAGE_LINES.aircraft[1] | Charter found: a jet in Susana, 12 seats, no questions so far. | Never printed: sim.js:406 compares to s.arr[k].low, which is never set, so the test is always false (tested). Speaker: sibling. | | I found a jet in Susana with 12 seats, and nobody has asked questions yet. | REWRITE |
| STAGE_LINES.aircraft[2] | Crew confirmed. The operator needs a destination. | Never printed. Stage 2 is reached only once a destination is set (sim.js:483), so the second sentence is never true at that point. | | The crew is confirmed. | REWRITE |
| STAGE_LINES.aircraft[3] | Fuel paid. The jet is being positioned. | Never printed. | | The fuel is paid, and the jet is moving into place. | REWRITE |
| STAGE_LINES.aircraft[4] | The jet is ready at Susana. | Never printed. | | | KEEP |
| STAGE_LINES.reception[1] | Your sibling reached Rosario Vélez, the minister's aide in Baca. Esmeralda expects you. She has not answered since. | Never printed. Spoken by the sibling, who calls himself "your sibling". | | I reached Rosario Vélez, the minister's aide in Baca. Esmeralda expects you, but Vélez has not answered since. | REWRITE |
| STAGE_LINES.reception[2] | Vélez has spoken to her minister. Esmeralda will not turn you away at the line. | Never printed. No border rule is tied to stage 2; it gives Vélez's card and removes the takeoff penalty. Voiced by the sibling even when Vélez delivers (sim.js:406). | | Vélez has spoken to her minister, and she has sent you her card for the Esmeraldan posts and the tower. | REWRITE |
| STAGE_LINES.reception[3] | Esmeraldan officials will be at the {post} when you arrive. Not the others. Only that one. | Never printed, and it is the only text that names the escort post. Couplet. | Which post is safe. | Esmeraldan officials will meet you at the {post}, and only there. | REWRITE |
| STAGE_LINES.permission[1] | {sponsor} has taken your call and will speak to the ministry, on {sponsor}'s terms. | Never printed. Spoken by the sponsor in the third person. The proposal drops {sponsor} because the speaker label already names him; confirm before removing a placeholder. | | I will speak to the ministry for you. You know what I want in return. | REWRITE |
| STAGE_LINES.permission[2] | The entry visa is issued. A car will meet the aircraft at {city}. | Never printed. | | | KEEP |

### DESTS (player-facing fields)

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| DESTS.*.name, city | Atlanta, Lāyūna; Tarun, Almatau; Zaryanova, Gannibal | Map labels and buttons (ui.js:657, 666). | | | KEEP |
| DESTS.*.hours | 10, 14, 8 | Only shown as "{h}-hour flight" on the map; no game effect. | | | KEEP |
| DESTS.atlanta.sponsor.name / short | Bīr Amādū Salek / Salek | | | | KEEP |
| DESTS.atlanta.sponsor.role | a banker abroad with ministries on his phone; an old client of the family | Phone thread subline (ui.js:179). Two ideas joined by a semicolon. | | a banker abroad and an old client of your family | REWRITE |
| DESTS.atlanta.sponsor.asks | A family associate has agreed to arrange safe passage, but he has sent a wire request. | Map card (ui.js:667). He asks the ministry for the visa; his price is the family accounts (terms, demand). | Who, what he does, what he wants. | Salek, a banker who knows your family, can ask the ministry for your visa. He wants the family accounts in return. | REWRITE |
| DESTS.atlanta.sponsor.terms | He will speak to the ministry if you move the family accounts to his house. | Logged as "You now owe" on the first visa call (sim.js:419). | | | KEEP |
| DESTS.atlanta.sponsor.demand.text | "The transfer papers are with your brother-in-law. Sign them and the ministry hears from me tonight." | Dialogue at Nova Trentô once he is engaged (sim.js:106-113). | | | KEEP |
| DESTS.atlanta.sponsor.demand.accept | Sign and move the accounts | Button. | | | KEEP |
| DESTS.atlanta.sponsor.demand.effect | Salek calls the ministry and the visa moves. The family accounts are his, and your family will not forgive it quickly. | Signing sets his trust to 2, so his visa roll needs 3 instead of 4; it does not move the visa (sim.js:448, 480). Family forgiveness is not tracked. | What signing changes. | Salek takes the family accounts and works harder for you. His visa answer now comes through on a 3 or better. | REWRITE |
| DESTS.atlanta.sponsor.kept | Salek now holds the family accounts. | Ending line on a win after signing (sim.js:533). | | | KEEP |
| DESTS.atlanta.sponsor.broke | Salek tells his clients you do not keep terms. | Ending line after you refuse him (sim.js:531). "Terms" is the abstraction AGENTS.md bans. | | Salek tells his clients you broke your word. | REWRITE |
| DESTS.atlanta.landing | (empty) | Atlanta accepts; no landing text. | | | KEEP |
| DESTS.tarun.sponsor.name / short | Dēvan Rāo / Rāo | | | | KEEP |
| DESTS.tarun.sponsor.role | a magistrate in Almatau who has taken in exiles before | | | | KEEP |
| DESTS.tarun.sponsor.asks | A government official has agreed to help, but is notoriously fickle. | Real mechanics: every visa call takes 6 extra hours (slow: 6, sim.js:422), and the visa never comes (accepts false, sim.js:484). accepts must stay hidden (data.js:228). | His concrete price and his slowness. | Rāo, a magistrate in Almatau, can write to the ministry for your visa. He is slow, and he wants your word that you will stay out of politics. | REWRITE |
| DESTS.tarun.sponsor.terms | He will write to the ministry if you give your word to keep out of politics while you are his guest. | Logged. | | | KEEP |
| DESTS.tarun.sponsor.demand.text | "I have drafted the letter..." | Dialogue. | | | KEEP |
| DESTS.tarun.sponsor.demand.accept | Sign and give your word | | | | KEEP |
| DESTS.tarun.sponsor.demand.effect | Rāo writes to the ministry tonight and the visa moves. Your party at home reads the letter as your retirement. | Same as Salek: trust 2, roll 3 instead of 4; no visa movement. The party reaction is not tracked. | | Rāo has your word and works harder for you. His visa answer now comes through on a 3 or better. | REWRITE |
| DESTS.tarun.sponsor.kept | Rāo has your word that you are out of politics. | Unreachable: a Tarun run cannot win. | | | KEEP |
| DESTS.tarun.sponsor.broke | Rāo tells the ministry you do not keep terms. | Ending line after refusal. | | Rāo tells the ministry you broke your word. | REWRITE |
| DESTS.tarun.landing | You land at Almatau at dawn. The flight plan was accepted; you were not. Tarun never agreed to take you, and the men at the foot of the stairs are police. A Valdórian liaison arrives by evening. | "Landed" loss text (sim.js:383). Matches accepts false. | | | KEEP |
| DESTS.zaryanova.sponsor.name / short | Mirēlā Vosk / Vosk | | | | KEEP |
| DESTS.zaryanova.sponsor.role | a former trade envoy in Gannibal with friends at the foreign ministry | | | | KEEP |
| DESTS.zaryanova.sponsor.asks | The trade envoy has agreed to secure safe passage in exchange for mineral rights that you cannot guarantee. | Map card. She asks the ministry for a visa, not "safe passage". | | Vosk, a former trade envoy, can take your visa request to the ministry. She wants mineral rights you do not control. | REWRITE |
| DESTS.zaryanova.sponsor.terms | She will take it to the ministry if you sign over mineral rights you do not control. | Logged. | | | KEEP |
| DESTS.zaryanova.sponsor.demand.text | "The ministry wants the northern concessions in writing..." | Dialogue. | | | KEEP |
| DESTS.zaryanova.sponsor.demand.accept | Sign the concession | | | | KEEP |
| DESTS.zaryanova.sponsor.demand.effect | Vosk takes the concession to the ministry and the visa moves. Word of it reaches home, and your exposure rises by one. | Trust 2 (roll 3), attention +1 (heat 1). No visa movement. | | Vosk takes the concession and works harder for you, so her visa answer comes through on a 3 or better. Word reaches home, and your police attention rises by one. | REWRITE |
| DESTS.zaryanova.sponsor.kept | Your signature on the concessions is in Gannibal. | Unreachable. | | | KEEP |
| DESTS.zaryanova.sponsor.broke | Vosk tells the ministry you do not keep terms. | | | Vosk tells the ministry you broke your word. | REWRITE |
| DESTS.zaryanova.landing | You land at Gannibal after eight hours. Officers wait on the apron. Zaryanova never agreed to take you. You are held at the airport until Valdória sends for you. | | | | KEEP |

### ui.json: action., card., hand.

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| action.wait_gov | Wait an hour | Government wait (ui.js:102). | | | KEEP |
| action.wait | Lie low for an hour | Wait button (ui.js:115). It only passes one hour (sim.js:357). Police attention still rises if Sosā is searching your stop; nothing about it hides you. | That it is waiting, with no hiding. | Wait an hour | REWRITE |
| action.finish | Finish | Last tutorial step (ui.js:126). | | | KEEP |
| action.next | Next | Tutorial (ui.js:126). | | | KEEP |
| action.uses | Uses {list} | Desktop tag on a move listing cards that lower its roll (ui.js:137). Cards are not spent. | That the card helps and stays. | Easier with {list} | REWRITE |
| action.uses_a | a {tag} card | | | | KEEP |
| action.uses_an | an {tag} card | | | | KEEP |
| action.certain | Certain | Need of 1 or less (ui.js:142). | | | KEEP |
| action.impossible | No die can | Need above 6. Fragment. | | Cannot succeed | REWRITE |
| action.cancel | Cancel | | | | KEEP |
| action.commit | Commit | Attempt button for a move (ui.js:154). Jargon. | | Try it | REWRITE |
| action.call | Call | | | | KEEP |
| action.continue | Continue | | | | KEEP |
| action.next_round | Next round | | | | KEEP |
| action.send_order | Send the order | Government. | | | KEEP |
| action.send | Send | Government. | | | KEEP |
| card.works_on | Where it counts | Label before CARDS.works (ui.js:194). | | | KEEP |
| card.counts_here | Counts here | Card reaches this stop (ui.js:198). | | | KEEP |
| card.counts_at | Counts at {place} | First reach ahead (ui.js:200). | | | KEEP |
| card.not_here | Means nothing here | Shown when the card's whole reach is behind you; it never counts again (ui.js:201). | That it is finished. | No longer counts | REWRITE |
| card.yours | Yours | | | | KEEP |
| card.from | From {name} | | | | KEEP |
| card.kind_news | News | | | | KEEP |
| card.kind_rumor | A rumor | | | | KEEP |
| card.kind_hold | They have you | Police stop card, any step (ui.js:474). | | The police have you | REWRITE |
| card.rung | {rung} of three | {rung} is a figure (ui.js:474), so it prints "2 of three". It is the step on the police ladder: 1 stopped, 2 station, 3 house arrest. | The step in words. Code must pass Sim.num(rung). | Step {rung} of three | REWRITE |
| hand.heading | Deck | Hand tab heading (shell.html:81). | | | KEEP |
| hand.game | Game | Menu heading. | | | KEEP |
| hand.empty | Nobody has given you a card yet. | | | | KEEP |

### ui.json: phone.

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| phone.waiting | {n} waiting | Message count chip. | | | KEEP |
| phone.empty | Nobody is calling. | | | | KEEP |
| phone.sibling_role | {rel}, arranging the aircraft | Thread subline (ui.js:179). The sibling also does reception to stage 2. | | {rel}, arranging the jet and your welcome | REWRITE |
| phone.call_about | {name} about {what} | Call button (ui.js:185); what = "aircraft", "reception" or "your visa". | | | KEEP |
| phone.your_visa | your visa | | | | KEEP |
| phone.calls | Calls | Heading (shell.html:91). | | | KEEP |

### ui.json: need.

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| need.aircraft_ready | Aircraft ready | Route cell title, Susana (ui.js:217). | | | KEEP |
| need.visa | Entry visa | Route cell title (ui.js:209). | | | KEEP |
| need.officials | Officials at the border | Unreachable: no move needs reception stage 3 (ui.js:217). | | | KEEP |
| need.expects | Esmeralda expects you | Route cell, Nova Trentô. | | | KEEP |
| need.crew | Crew confirmed | Unreachable: the stage 4 need hides fuel_now's stage 2 need (ui.js:216). | | | KEEP |
| need.charter | Charter booked | Santa Laura. The stage is "charter found". | | Charter found | REWRITE |
| need.working | {ally} is working on {stage}, due {time}. | {stage} is the current stage, not the one being worked on, and prints "none" at stage 0 (ui.js:220). | Who answers and when. | {ally} answers by {time}. | REWRITE |
| need.velez | Vélez's people | Unreachable (stage 3). | | | KEEP |
| need.baca | Baca has your name | "Not started" sub under "Esmeralda expects you". Restates the title. | What to do. | Call your sibling to reach Vélez in Baca. | REWRITE |
| need.salek | {sponsor} is asking the ministry | Shown when the visa is not started and no call is out (ui.js:220): the sponsor is not asking yet. | What to do. | Call {sponsor} about your visa. | REWRITE |
| need.passport | Your second passport | | | | KEEP |
| need.passage | A passage card | | | | KEEP |
| need.decoy | A decoy card | Unreachable (ui.js:222 skips decoy). | | | KEEP |
| need.influence | An influence card | Unreachable (skipped). | | | KEEP |
| need.card | A {tag} card | E.g. "A boat card". | | | KEEP |
| need.passport_held | In your coat, but the ban lists the other one | | | | KEEP |
| need.in_hand | In your deck | | | | KEEP |
| need.passage_from | Holt or Theo, before midnight | No deadline at midnight: boarding is 10 p.m. to 5 a.m. The grandson also gives one. | | Get one from Holt, Theo or Nonā Rosa's grandson | REWRITE |
| need.nobody | Nobody has offered one | | | | KEEP |
| need.night | After dark | Night is 10 p.m. to 5 a.m. (sim.js:164). | The window. | Night, 10 p.m. to 5 a.m. | REWRITE |
| need.is_night | It is dark | | | | KEEP |
| need.after | After 10 p.m. | | | | KEEP |

### ui.json: route. (escape side)

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| route.heading | The route | | | | KEEP |
| route.legend_inhand | In deck | Legend for done cells, which include finished arrangements, not cards. | | Done | REWRITE |
| route.legend_promised | Promised, not delivered | | | | KEEP |
| route.legend_notyet | Not started | | | | KEEP |
| route.role_aircraft | arranging the aircraft | Sibling in "Abroad" (ui.js:232). | | arranging the jet and your welcome | REWRITE |
| route.role_visa | asking for your visa | | | | KEEP |
| route.stops_here | {card} stops counting here | On the card's last stop, where it still counts (ui.js:239). Reads as "does not count here". | | {card} counts here for the last time | REWRITE |
| route.starts_here | {card} starts counting here | | | | KEEP |
| route.velez_starts | Vélez's card starts counting here | | | | KEEP |
| route.you_here | You are here | | | | KEEP |
| route.border | The border | | | | KEEP |
| route.esmeralda | Esmeralda | | | | KEEP |
| route.inquiry_here | Sosā is looking here | s.belief (ui.js:250). | | | KEEP |
| route.who_acts | Who can help here: {list} | | | | KEEP |
| route.abroad_phone | Abroad, on the phone | | | | KEEP |
| route.abroad | Abroad | | | | KEEP |
| route.by_phone | By phone | | | | KEEP |
| route.who_acts_label | Who can help here | | | | KEEP |
| route.needed | What you still need | | | | KEEP |
| route.cards_count | Where your cards count | | | | KEEP |
| route.card_stops_line | {card} counts until the line | Bar for cards whose reach ends at the line, which includes the line (ui.js:264). | | {card} counts up to and at the line | REWRITE |
| route.velez_starts_short | Vélez's card starts here | | | | KEEP |
| route.inquiry | Sosā | | | | KEEP |
| route.looking_here | Looking here | | | | KEEP |
| route.no_inquiry | Sosā has not moved yet | | | | KEEP |

### ui.json: sim.why., sim.status., sim.preview., sim.label.

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| sim.why.pick_one_of_the_answers | Pick one of the answers. | Log on a bad option id (sim.js:430). | | | KEEP |
| sim.why.that_message_is_gone | That message is gone. | | | | KEEP |
| sim.why.nothing_to_call_about | Nothing to call about. | | | | KEEP |
| sim.why.not_something_you_can_do | Not here | Unknown move id (sim.js:361). Fragment. | | You cannot do that here. | REWRITE |
| sim.why.answer_the_news_first | Deal with the news first | Blocks moves and calls while news, a rumor or a stop is waiting. | | | KEEP |
| sim.why.you_are_being_held | You are being held. | | | | KEEP |
| sim.why.the_run_is_over | The run is over. | | | | KEEP |
| sim.why.pick_one_of_the_choices | Pick one of the choices. | | | | KEEP |
| sim.why.no_news_waiting | No news waiting. | | | | KEEP |
| sim.why.is_not_answering | {name} is not picking up | Embassy choice at the station when the sibling talked to Sosā (sim.js:268). | | | KEEP |
| sim.why.salek_is_not_taking_your | {sponsor} is not taking your calls | | | | KEEP |
| sim.why.nando_and_the_spare_cars | Nando and the spare cars are gone. | Decoy card not held (sim.js:225). | | | KEEP |
| sim.why.you_do_not_have_v | You do not have Vélez's card. | | | | KEEP |
| sim.why.you_do_not_have_salek | Call {sponsor} about permission first. | Needs the sponsor's line card, which comes only when he agrees (permission stage 1), not on calling (sim.js:223, 408). | | {sponsor} has to agree to help with your visa first. | REWRITE |
| sim.why.not_answering | Not picking up | Aircraft call blocked: sibling talked to Sosā (sim.js:208). Fragment. | | Your sibling is not picking up. | REWRITE |
| sim.why.name_a_destination_or_engage | Pick a country or call {sponsor} first | The country is already picked on the map. The block is that the crew needs it confirmed: the "Confirm" reply, the sibling's lucky pick, or the sponsor engaged (sim.js:208, 434-436, 485). | What to do on the phone. | Confirm the destination on the phone, or get {sponsor} to agree to help, first. | REWRITE |
| sim.why.resolves_at | You hear back at {time} | | | | KEEP |
| sim.why.talked_to_the_inquiry | {name} talked to Sosā | | | | KEEP |
| sim.why.you_cut_off | You cut {name} off | | | | KEEP |
| sim.why.needs_a_card | You need a {card} card | {card} is the tag. Gives "You need a influence card" (sim.js:166). | Grammar. | This needs a card marked {card}. | REWRITE |
| sim.why.your_card_is_not_recognized | Your {card} card means nothing here | Held, but out of reach here. Same a/an issue does not occur ("Your"). | | | KEEP |
| sim.status.contact_salek_before_reaching_susana | Call {sponsor} before you reach Susana | Block reason at Susana with no visa work started (sim.js:213). Arrives too late to act on. | | It is too late to ask {sponsor} for a visa from Susana. | REWRITE |
| sim.status.arrange_reception_through_your_sibling | Your sibling reaches Vélez, and Vélez reaches the border | First line of the reception call preview (sim.js:212). | What the arrangement does. | Your sibling gets Vélez to expect you, and later Vélez can put officials at one border post. | REWRITE |
| sim.status.call_from_salta_to_request | From Salta you can ask for officials at the line | Block on the stage 3 call before Salta (sim.js:211). | | You can ask Vélez for officials at the line once you reach Salta. | REWRITE |
| sim.status.arrange_the_next_stage_charter | The jet still needs a charter, a crew, fuel and a place to wait | Aircraft call preview at every stage (sim.js:209). | | Your sibling sets up the jet in steps: charter, crew, fuel, then ready at Susana. | REWRITE |
| sim.status.is_on_it | {arrangement}, {name} is on it | Pending call name; ui.js:185 prefixes the arrangement again, giving "Aircraft: Aircraft, Duartē Albukerkē is on it". | | {name} is working on it | REWRITE |
| sim.status.ask_salek_to_seek_visa | Ask {sponsor} for the visa on {sponsor}'s terms | Visa call preview (sim.js:214). "Terms" is the banned abstraction. | | {sponsor} asks the ministry for your visa, and {sponsor} will want something back. | REWRITE |
| sim.preview.next_reply_in_hours_needs | Next is {stage}, and {name} answers in {k} hours on a {turned} or better | Call preview (sim.js:206). Real wait is 1 + k hours, +2 if your family went dark, +6 for Rāo. Real roll is reliability, +6 if turned, -1 at trust 2 (sim.js:422, 480). Shown numbers can be wrong. | When the answer comes and the odds. | {name} works on {stage} and answers in {k} hours, and it comes through on a roll of {turned} or better. | REWRITE |
| sim.preview.takes_hour | Takes {hours} hour{s} | | | | KEEP |
| sim.preview.your_cards_lower_it | Your cards lower it: | Followed by "information 1, decoy 2." (sim.js:191): tag plus amount off the number you need. | What the numbers are. | Your cards lower that number: | REWRITE |
| sim.preview.die_needs_or_more_in | You need {need} or more, {need2} in six.{bonus} | Odds. The button says "4 in 6" in figures (sim.js:190). | | Roll {need} or higher to succeed, {need2} chances in six.{bonus} | REWRITE |
| sim.preview.cannot_succeed_with_your_current | Cannot work with the help you have | Need above 6. Fragment. "Pay the yardmaster" can never work, whatever help you have. | | This cannot succeed. | REWRITE |
| sim.preview.succeeds_without_a_roll | No roll needed | Fragment. | | This works without a roll. | REWRITE |
| sim.label.lie_low_one_hour | Lie low one hour | actions().wait.name (sim.js:230); nothing displays it. | | | KEEP |
| sim.label.call_about | Call {name} about {what} | Briefing job line (ui.js:400). Gives "Call Bīr Amādū Salek about entry visa". | | Call {name} about the {what} | REWRITE |

### ui.json: map.

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| map.title | Pick a country | | | | KEEP |
| map.sub | The leader of Esmeralda has arranged safe passage if you can make it to the capital city, Susana. | No arrangement exists at the start (reception stage 0). Susana is the airfield; Baca is where the ministry is. Esmeralda may later be asked to hold you. | Where they fly from and that they must reach it. | Esmeralda will let you fly out from Susana airfield, once you cross the border to reach it. | REWRITE |
| map.here | Valdória, where you are | | | | KEEP |
| map.via | Susana, where you fly from | Not used anywhere. | | | KEEP |
| map.choose | Fly to {name} | Picks the destination and starts the run (ui.js:669). | That it is a choice of goal. | Choose {name} | REWRITE |
| map.hint | You have a second passport to fly already. What you need to escape is a proper visa. | The visa is needed for "Board and depart"; leaving without one works only if the country accepts you. | | Your second passport gets you on the plane. You also need an entry visa from the country you pick. | REWRITE |
| map.hours | {h}-hour flight | Display only. | | | KEEP |

## 2. Design inconsistencies

- Stage lines never print. sim.js:406 says only when `to > s.arr[k].low`, and `low` is never set, so the test is always false (tested). All of STAGE_LINES is dead text. That includes the only line that names the escort post (reception[3]); otherwise the player can find it only by seeing that one post button says "Certain".
- "Call your contacts" (data.js:135-137) moves all three arrangements one stage, with no ally, roll or gate. It is not an exit (sim.js:16), so it can be repeated. Done twice for Tarun, it sets "Entry visa issued" for a country that never agreed (it skips the accepts check in sim.js:484). It also skips the Salta gate for officials at the line and the destination gate for the crew.
- "Help Nonā Rosa free the truck" is an exit (sim.js:16): success moves you to Salta even if Esmeralda does not expect you yet. That gets around the gate the objective and "Take the road to Salta" describe. Nothing in the name or text says you leave.
- "Leave with Duartē's driver" (data.js:114) is hard-coded; Matēu's sibling is Līviā.
- "Pay" moves (second_driver, crate, buy_seat, post_coast, fuel_now) set `pay: true`, and nothing reads it (sim.js:190). Paying costs nothing.
- "Lie low for an hour" (action.wait) passes one hour, the same as waiting (sim.js:357). Nothing lowers police attention or hides you.
- "Uses {list}" (action.uses) suggests a card is spent. Card bonuses never spend the card (sim.js:159).
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
- Hidden roll changes are never explained in the preview: +1 at the line under the travel ban, +1 at a checkpoint, +2 at takeoff when Esmeralda was asked, and +1 at the line for Teresā (sim.js:182-186). The player sees only the final number and the card discounts.

Count: 114 rewrites, 221 keeps, 2 flags (FLAG-4), 0 unknowns.
