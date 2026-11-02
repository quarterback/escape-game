# Companions

Owner, Nov. 1, 2026: "an ally you travel with who is trustworthy throughout and can help you ... one specific thing they're good at ... the same list no matter which candidate you pick, except if you end up as the Special Investigator, how they help you is a little bit different." Owner, Nov. 2, 2026: eight more, for 11 in all, each working on both sides.

The player picks one companion after the character. On the escape side the companion's card sits in the hand all run, never turns and is never lost (a station, a flood or a "lose something" result skips it). On the police side the same person gives Sofia one government card, and with it a bounded source: every answer is about a past moment at one place, arrives late, and never reads her live position.

Picker wording is in `content/coalition/ui.json` as `mate.<id>.title`, `.who`, `.escape` and `.gov`. Contract test C21 checks the roster, the wording, the sprites, that each card's help has player words, that a companion's card is never lost, that each companion changes seeded runs on both sides, and that the police view with each companion still ignores her hidden state.

## What each one does

| Companion | Escape side (Teresa and Mateu) | Police side (Sofia) |
| --- | --- | --- |
| Bruno, truck driver | `vehicle`: Holt and Theo are easier to deal with in Salta | Starts with the railway contact |
| Clara, interpreter from Costamar | `introduction`: Paso Huhūi, Ālto Verdē and the Portalba departure are easier | Starts with the Costamaran introduction |
| Rita, cargo pilot | `permission`: leaving Portalba without the visa is easier | Starts with the operator's license |
| Marta, auto mechanic | `mechanic`: driving your own car out of Pedra Branca is easier and costs no attention; police checkpoints in Valdória do not slow you; leaving a stop the police are searching, she swaps the plates and attention drops one; the plain car is easier; "Let Marta drive through" at the flooded bridge | `plates`: searches and checkpoints at the residence, Pedra Branca and Nova Trentô are easier; the decoy sedan is reported as a decoy; every car on the road south shows in the toll records; "Run the plates" in the three sightings |
| Inês, nurse | `care`: lying low, waiting for dark, sleeping and long waits never raise police attention from a search where you are; on the food and sleep screen, "Have Inês buy food" feeds everyone unseen, and a night in the car is a full night's sleep; she treats a sick child herself | `clinics`: a clinic that treats her sick child calls the local police, who search there, and the report reaches Sofia three hours late; "Ask the clinics" (1 hr) asks again; patrols stop a tired or starving candidate from Rising police attention instead of High |
| Paulo, former court clerk | `court`: a sent travel ban sits in the outbox 12 hours before it reaches the posts; "Let Paulo take the summons" and "Have Paulo slow the order" keep the ban from going out | `clerk`: circulating the ban is easier and takes 1 hr; "Have Paulo take it to a judge" at the duty judge confirms the ban with no cost |
| Celina, radio producer | `media`: an extra answer to the radio's yacht question, and choices on the kitchen photo, the hitchhiking reporter and the family's early story; the first time the police close in at each stop in Valdória, her station sends them one stop back | `newsroom`: briefing the papers is easier; "Put her photo on the morning news" raises her attention and brings a caller, true or false, three hours later; new choices at the leak, the photo and the press conference |
| Tomás, retired border officer | `border`: every crossing at the line is easier; on arrival he names the post that is neither bought nor covered by Vélez's people, and that post is easier still; the ban adds nothing at the line for six hours after it goes out; "Follow Tomás over the ridge" in the blizzard | `post_cmd`: searches and checkpoints at the line are easier; the post confirms the ban an hour after the call; a confirmed ban makes her crossings harder; "Have Tomás take the shift" in the sergeant event |
| Nadia, telephone engineer | `phone`: police call traces find nothing; once, the tap on your family's phone slows nothing | `exchange`: "Pull the exchange records" (1 hr) names the town of her side's last call in four hours, an hour late; "Have Nadia read the tower log" |
| Emilio, hotel manager | `lodging`: "Take Emilio's room" on the food and sleep screen at Pedra Branca, Nova Trentô and Salta: six hours, everyone eats and sleeps, attention down one, no name in the register, and a police search there finds nobody while you stay | `registers`: "Check the guest registers" (1 hr) at Pedra Branca, Nova Trentô or Salta reports a room her family took, with the hour, two hours late; the police watch the hotels there afterward |
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
