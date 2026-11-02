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
| Marta, auto mechanic | `mechanic`: driving your own car out of Pedra Branca is easier and costs no attention; the plain car is easier; "Let Marta drive through" at the flooded bridge | `plates`: searches and checkpoints at the residence, Pedra Branca and Nova Trentô are easier; the decoy sedan is reported as a decoy; every car on the road south shows in the toll records; "Run the plates" in the three sightings |
| Inês, nurse | `care`: lying low, waiting for dark, sleeping, Emilio's room and long news waits (`rest: true`) never raise police attention from a search where you are; sleeping at Nova Trentô lowers it one more | `clinics`: "Ask the clinics about her family" names the stop she is at, three hours late, once per stop |
| Paulo, former court clerk | `court`: a sent travel ban sits in the outbox 12 hours before it reaches the posts; "Let Paulo take the summons" and "Have Paulo slow the order" keep the ban from going out | `clerk`: circulating the ban is easier; "Have Paulo take it to a judge" at the duty judge confirms the ban with no cost |
| Celina, radio producer | `media`: an extra answer to the radio's yacht question, and choices on the kitchen photo, the hitchhiking reporter and the family's early story; the first time the police close in at each stop in Valdória, her station sends them one stop back | `newsroom`: briefing the papers is easier; "Put her photo on the morning news" raises her attention and brings a caller, true or false, three hours later; new choices at the leak, the photo and the press conference |
| Tomás, retired border officer | `border`: every crossing at the line is easier; on arrival he names the post that is neither bought nor covered by Vélez's people, and that post is easier still; the ban adds nothing at the line for six hours after it goes out; "Follow Tomás over the ridge" in the blizzard | `post_cmd`: searches and checkpoints at the line are easier; the post confirms the ban an hour after the call; a confirmed ban makes her crossings harder; "Have Tomás take the shift" in the sergeant event |
| Nadia, telephone engineer | `phone`: police call traces find nothing; once, the tap on your family's phone slows nothing | `exchange`: "Pull the exchange records" names the town of her side's last call in eight hours, an hour late; "Have Nadia read the tower log" |
| Emilio, hotel manager | `lodging`: "Stay in Emilio's room" at Pedra Branca, Nova Trentô and Salta, once each: four hours, attention down one, and a police search there finds nobody while you stay | `registers`: "Check the guest registers" at Pedra Branca, Nova Trentô or Salta reports her check-in time two hours late; the police watch the hotels there afterward |
| Joana, union organizer | `union`: "Ride the train the crew holds" in Salta at any hour, without Holt or Theo; "Have Joana talk to the strikers" | `union`: a passenger leaving on the freight is always reported, and a stranger asking about it 10 hours late; calling in helpers in Salta is easier; "Have Joana talk to the union" ends the strike |

## Calibration, Nov. 2, 2026

Seeded harness runs: `node tools/calibrate.js 300 --companion=all` (300 runs per candidate) and `node tools/gov-calibrate.js 200 --companion=all` (200 runs; the police bot uses a companion's records order when its newest report is stale, at most every nine hours). With no companion, both harnesses match the build before this change to the digit.

| Companion | Teresa wins | Mateu wins | She escapes Sofia |
| --- | --- | --- | --- |
| None | 44.3% | 39.3% | 55.5% |
| Bruno | 45.3% | 39.7% | 55.5% |
| Clara | 45.7% | 41.0% | 56.5% |
| Rita | 44.7% | 39.7% | 55.5% |
| Marta | 46.0% | 41.3% | 52.5% |
| Inês | 45.3% | 41.7% | 51.5% |
| Paulo | 53.7% | 48.7% | 52.0% |
| Celina | 51.3% | 47.3% | 52.5% |
| Tomás | 52.0% | 41.0% | 48.0% |
| Nadia | 49.3% | 47.0% | 52.5% |
| Emilio | 49.0% | 48.0% | 51.5% |
| Joana | 48.7% | 49.0% | 47.5% |

Outliers fixed during calibration, and nothing else:

- **Marta hurt Mateu (35.7%).** Her bonus on the decoy convoy made the bot leave by convoy instead of the party car, so Mateu lost Gianlūka's delay on the ban. The convoy is not a change of vehicle; the bonus went. Her own car now costs no attention when she drives it, which is what her picker line says.
- **Celina did nothing for Teresa (44.0%).** Her choices only appear with some news. She now also sends the police one stop back the first time they close in at each stop.
- **Tomás did nothing for Mateu (39.0%).** He named the clean post, but a bot cannot read a line. The post he names is now easier as well.
- **Inês and Emilio helped her escape Sofia (69.5% and 64.5%).** The clinics named the last stop she had left, and the bot followed it backward; the registers cost three hours and told the bot nothing it could act on. The clinics now name the stop she is at, three hours late and once per stop. The registers take an hour and put the police on the hotels there.
- **Joana dominated the police side (39.0%).** The yard crews reported every arrival in Salta two hours late, where she waits most of a day for the freight. They now report it 10 hours late.

Bruno and Rita still show no effect for Sofia in the harness, because the police bot never presses the operator or asks the yardmaster. They were kept as they are.
