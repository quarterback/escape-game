# Companions

Owner, Nov. 1, 2026: "an ally you travel with who is trustworthy throughout and can help you ... one specific thing they're good at ... the same list no matter which candidate you pick, except if you end up as the Special Investigator, how they help you is a little bit different." Owner, Nov. 2, 2026: eight more, for 11 in all, each working on both sides.

The player picks one companion after the character. On the escape side the companion's card sits in the hand all run, never turns and is never lost (a station, a flood or a "lose something" result skips it). On the police side the same person gives Sofia one government card, and with it a bounded source: every answer is about a past moment at one place, arrives late, and never reads her live position.

**What a companion is for.** A run has a few hard problems: getting past the watch at the house, the road south, getting aboard in Salta, the travel ban, crossing the line, the phone calls that arrange the jet, the visa and your welcome, police attention, food and sleep, and leaving Portalba. Each companion makes one or two of those easier for the whole run, and the picker opens with that sentence ("Pick Tomás if crossing the line worries you most."). On Sofia's side, each makes one part of the hunt easier: the road south, Salta, the line, her calls, her hotels, the press.

Picker wording is in `content/coalition/ui.json` as `mate.<id>.title`, `.pick`, `.govpick`, `.who`, `.escape` and `.gov`. Contract test C21 checks the roster, the wording, the sprites, that each card's help has player words, that a companion's card is never lost, that each companion changes seeded runs on both sides, and that the police view with each companion still ignores her hidden state.

## What each one does

| Companion | Escape side (Teresa and Mateu) | Police side (Sofia) |
| --- | --- | --- |
| Bruno, truck driver | `vehicle`: Holt and Theo are easier to deal with in Salta | Starts with the railway contact; searches and checkpoints in Salta are easier (Nov. 2) |
| Clara, interpreter from Costamar | `introduction`: Paso Huhūi, Ālto Verdē and the Portalba departure are easier | Starts with the Costamaran introduction |
| Rita, cargo pilot | `permission`: leaving Portalba without the visa is easier | Starts with the operator's license; the charter crews drag their feet, so each step of her jet takes three hours longer (Nov. 2) |
| Marta, auto mechanic | `mechanic`: driving your own car out of Pedra Branca is easier and costs no attention; police checkpoints in Valdória do not slow you; leaving a stop the police are searching, she swaps the plates and attention drops one; the plain car is easier; "Let Marta drive through" at the flooded bridge | `plates`: searches and checkpoints at the residence, Pedra Branca and Nova Trentô are easier; the decoy sedan is reported as a decoy; every car on the road south shows in the toll records; "Run the plates" in the three sightings |
| Inês, nurse | `care`: lying low, waiting for dark, sleeping and long waits never raise police attention from a search where you are; on the food and sleep screen, "Have Inês buy food" feeds everyone unseen, and a night in the car is a full night's sleep; she treats a sick child herself | `clinics`: a clinic that treats her sick child calls the local police and reports to Sofia three hours later; her patrols stop a tired or hungry candidate at Rising police attention instead of High (Nov. 2) |
| Paulo, former court clerk | `court`: a sent travel ban sits in the outbox 12 hours before it reaches the posts; "Let Paulo take the summons" and "Have Paulo slow the order" keep the ban from going out | `clerk`: circulating the ban is easier and takes 1 hr; when her lawyers ask the duty judge to suspend the ban at the line, "Have Paulo answer the motion" keeps it in force at no cost |
| Celina, radio producer | `media`: an extra answer to the radio's yacht question, and choices on the kitchen photo, the hitchhiking reporter and the family's early story; the first time the police close in at each stop in Valdória, her station sends them one stop back | `newsroom`: briefing the papers is easier; "Put her photo on the morning news" raises her attention and brings a caller, true or false, three hours later; new choices at the leak, the photo and the press conference |
| Tomás, retired border officer | `border`: every crossing at the line is easier; on arrival he names the post that is neither bought nor covered by Vélez's people, and that post is easier still; the ban adds nothing at the line for six hours after it goes out; "Follow Tomás over the ridge" in the blizzard | `post_cmd`: searches and checkpoints at the line are easier; once the travel ban is sent, his old sergeants enforce it and her crossings at the line are harder; "Have Tomás take the shift" in the sergeant event |
| Nadia, telephone engineer | `phone`: police call traces find nothing; once, the tap on your family's phone slows nothing | `exchange`: every call from her side reaches Sofia an hour later with the town (Nov. 2); "Pull the exchange records" (1 hr) asks for the last four hours; "Have Nadia read the tower log" |
| Emilio, hotel manager | `lodging`: "Take Emilio's room" on the food and sleep screen at Pedra Branca, Nova Trentô and Salta: six hours, everyone eats and sleeps, attention down one, no name in the register, and a police search there finds nobody while you stay | `registers`: every room her family takes in her name reaches Sofia two hours later, every time (Nov. 2); searches at Pedra Branca, Nova Trentô and Salta are easier; "Check the guest registers" (1 hr) |
| Joana, union organizer | `union`: "Ride the train the crew holds" in Salta at any hour, without Holt or Theo; "Have Joana talk to the strikers" | `union`: a passenger leaving on the freight is always reported, and a stranger asking about it 10 hours late; calling in helpers in Salta is easier; "Have Joana talk to the union" ends the strike |

## Food and sleep (Nov. 2, 2026)

Owner, Nov. 2, 2026: build the lodging system inside the game. Rules in `src/sim.js`, screens in `src/data.js` (`LODGING`, `SICK`), wording in the catalog under `body.*`.

- Two levels, shown under the clock and in the briefing: Rested, Tired (18 hours awake), Exhausted (30); Fed, Hungry (12 hours without a meal), Starving (24). Tired or starving makes every move that rolls one step harder, exhausted two, never more than two in all. "Food for three days" means you never go hungry.
- "Stop to eat and sleep" in the move list opens the screen for the stop: your own bed at the residence; the motel, the car or the truck stop at Pedra Branca; Nonā Rosa's spare room and table at Nova Trentô (the old "Sleep" move lives here now); the railway hotel, the car or the canteen at Salta; the drivers' hostel or the car at the line; the crew lounge at Portalba. A room with your name in the register or a meal in public raises police attention by one. "Keep going" closes the screen.
- Exhausted or starving at a stop makes your youngest sick, once per stop: a clinic (2 hr, attention up one, her name in the clinic book), Inês, or keep going with every move there harder.
- Sofia's side: a room in her name leaks to the desk half the time, three hours late; Emilio's registers read those rooms; Inês's clinics read the clinic book. The computer-played candidate eats and sleeps by the same rule as the calibration bot (`Sim.lodgePick`).

## Calibration, Nov. 2, 2026

Seeded harness runs: `node tools/calibrate.js 900 --companion=all` and `node tools/gov-calibrate.js 600 --companion=all`. The bots eat and sleep by `Sim.lodgePick`: sleep when exhausted, or tired at night at a stop with no night move; eat a meal nobody sees when hungry, any meal when starving.

| | Teresa wins | Mateu wins | She escapes Sofia |
| --- | --- | --- | --- |
| Before food and sleep, no companion | 44.3% | 39.3% | 55.5% |
| With food and sleep, no companion | 32.6% | 29.9% | 38.2% |

With food and sleep:

| Companion | Teresa wins | Mateu wins | She escapes Sofia |
| --- | --- | --- | --- |
| None | 32.6% | 29.9% | 38.2% |
| Bruno | 33.8% | 31.1% | 38.2% |
| Clara | 33.2% | 30.0% | 38.2% |
| Rita | 33.9% | 30.7% | 38.2% |
| Marta | 35.9% | 33.1% | 35.7% |
| Inês | 35.9% | 36.8% | 37.2% |
| Paulo | 34.8% | 33.7% | 33.8% |
| Celina | 40.4% | 37.3% | 33.8% |
| Tomás | 41.7% | 32.7% | 33.5% |
| Nadia | 37.6% | 35.9% | 37.7% |
| Emilio | 35.6% | 34.4% | 37.8% |
| Joana | 38.7% | 37.9% | 35.7% |

Inês, Nadia and Emilio do least for Sofia in the harness: their reports are late news about a stop she may have left, and the bot only follows a report, it never reasons about where she went next. A first try at a better police bot (never follow a report behind the stop you are watching) made the base game easier for her, 45.2%, so it was dropped.

Outliers fixed during the first calibration (before food and sleep), and nothing else:

- **Marta hurt Mateu (35.7%).** Her bonus on the decoy convoy made the bot leave by convoy instead of the party car, so Mateu lost Gianlūka's delay on the ban. The convoy is not a change of vehicle; the bonus went. Her own car now costs no attention when she drives it, which is what her picker line says.
- **Celina did nothing for Teresa (44.0%).** Her choices only appear with some news. She now also sends the police one stop back the first time they close in at each stop.
- **Tomás did nothing for Mateu (39.0%).** He named the clean post, but a bot cannot read a line. The post he names is now easier as well.
- **Inês and Emilio helped her escape Sofia (69.5% and 64.5%).** The clinics named the last stop she had left, and the bot followed it backward; the registers cost three hours and told the bot nothing it could act on. The clinics now name the stop she is at, three hours late and once per stop. The registers take an hour and put the police on the hotels there.
- **Joana dominated the police side (39.0%).** The yard crews reported every arrival in Salta two hours late, where she waits most of a day for the freight. They now report it 10 hours late.

Bruno and Rita still show no effect for Sofia in the harness, because the police bot never presses the operator or asks the yardmaster. They were kept as they are.

Fixed when food and sleep went in: Marta showed no effect on the escape side, so police checkpoints no longer slow her car and she swaps the plates when you leave a stop the police are searching. Paulo showed no effect for Sofia, so his ban goes out in an hour. Inês and Nadia cost Sofia time, so their orders take an hour, Nadia reads four hours of calls instead of eight, and Inês's clinics call the police and brief the patrols.

Nov. 2, 2026, later: the travel ban is in force for Sofia the moment it is sent (owner, Nov. 1, 2026: the ban "makes crossing harder but does not close the border"; it is in force at every post once sent, and a post can let it slide). "Confirm the ban at the post" is gone, with its demo step. The duty judge and the sergeant can now get the post at the line to let the ban slide, which makes her crossings there easier again. Police side, 600 runs, no companion: 38.2% before and after; with each companion: Bruno 38.2%, Clara 36.5%, Rita 38.2%, Marta 34.7%, Inês 36.0%, Paulo 34.8%, Celina 31.3%, Tomás 36.7%, Nadia 40.3%, Emilio 35.8%, Joana 33.0%. Nadia still does not help the police bot, because her reports name a town the candidate may have left.

## Police-side companions made useful (Nov. 2, 2026, issue #46)

Owner: "I've been saying I want companions who are useful." First, a bot bug: the computer-played candidate on Sofia's side, and the escape calibration bot, treated each new "hurry" call as a call to make. She hurried everything at the residence and never left, so the candidate escaped Sofia only 3.3% of the time. Both bots now make plain calls only. Then Bruno, Rita, Inês, Nadia and Emilio each got a direct, always-on effect (see the table). Police harness, 400 runs, she escapes Sofia:

| Companion | Before | After |
| --- | --- | --- |
| None | 35.8% | 35.0% |
| Bruno | 35.8% | 32.8% |
| Rita | 35.8% | 32.3% |
| Inês | 32.5% | 31.8% |
| Nadia | 35.5% | 28.5% |
| Emilio | 34.0% | 31.3% |

The base game moved because the railway contact, which Sofia can also win in play, now makes her Salta searches easier.


## Routes that branch (Nov. 5, 2026, issue #51)

- **The coast route.** At Pedra Branca, "Take the river to the coast" (4 hr) skips Nova Trentô and Salta for Barra Velha, a fishing port, which is the fourth stop on that route (`Data.HARBOR`, index 3 in place of Salta; `Sim.stopAt`, `Sim.route`). Barra Velha has its own moves: "Sail at night to Punta Marēa", "Pay a skipper for a berth" (the berth card), "Take the coast ferry" and "Cover your tracks"; a lodging screen; and two events, a storm and a pier check. Whoever arrives by sea finds the Punta Marēa crossing easier. The coast route misses Nonā Rosa's phone and her truck.
- **The mountain path.** At the line, "Walk over the mountains" (5 hr) crosses between the posts: no post to buy or avoid, and Tomás and Inês make it easier. The travel ban still makes it harder.
- The maps, the stop count and the share card leave Nova Trentô out on the coast route. Sofia's computer-played candidate keeps the inland route for now, because her map has no harbor yet.
- `node tools/calibrate.js N --prefer=river,mountain` makes the bot take those moves whenever it can.

Escape harness, 300 runs, Teresa / Mateu: inland 22.3% / 24.7%. Bot always takes the river: 14.3% / 18.0%. Bot always takes the mountain path: 16.3% / 17.0%. The bot takes them blindly, even when Vélez's people wait at a post, so a player who chooses well should do better than these numbers. The river trades Nonā Rosa's phone for time, and the bot runs out of police attention on the coast.

## The hunt (Nov. 5, 2026, issue #52)

- **Two patrols.** They start at the residence and Pedra Branca. A search, checkpoint, bridge stop, fuel watch, staff questioning or pressure on the cooperative uses the nearest patrol and moves it to the stop. Moving takes two hours for each stop, added to the order. A patrol stays where it last worked, and whenever she arrives at a stop with a patrol, the arrival is reported.
- **The minister's patience** is a three-step bar under the clock: Patient, Impatient, Furious. He asks where she is again 18 hours after each answer. Saying you don't know costs one step. A claim is checked six hours later: wrong costs one step, right gives one back. Bad news in the papers costs one step, good news gives one. At zero, the minister takes Sofia off the case and she loses.
- **Report pins.** The newest report from each stop sits on the map with its age, grows greyer at 3, 8 and 16 hours, and drops off after a day.

Police harness, 400 runs, no companion, she escapes Sofia: 35.0% before; 37.8% with the patrols alone; 51.5% with patience (60 of 400 runs end with Sofia off the case). A first version asked every 12 hours and charged a missed deadline; it took Sofia off the case in 43% of runs and was dropped. The bot names a stop when a report is under six hours old and otherwise says it does not know.
