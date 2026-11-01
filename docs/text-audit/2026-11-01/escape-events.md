# Escape side: events, police stops, rumors and the sim catalog (language pass, Nov. 1, 2026)

Scope: `src/data.js` EVENTS, HOLDS and RUMORS (titles, text, choice labels, `say` lines, end reasons) and every entry in `content/coalition/ui.json` whose id starts with `sim.` (159). Traced through `src/sim.js`, `src/ui.js` and, where the government side reuses a string, `src/gov.js`. Nothing under `legacy/` was read.

How these strings reach the player (traced once, referred to below):
- News card: `drawEvent` (sim.js:250) picks an event on arrival and every six hours at a stop, or a rumor 40% of the time when an unrevealed ally is at the stop. `eventView` (sim.js:302) builds the title, text, labels and marker chips (`fxTags`, sim.js:278). `newsCard` (ui.js:522) shows the kind label, title, text and each choice with its chips or its blocked reason.
- Roll chips on the escape side show only "Roll N or higher" and the failure list (sim.js:281 returns before any win effect). Targets are the d20 numbers: dc 3 is 8, dc 4 is 11, dc 5 is 14 (data.js:497).
- After a choice, `summarize` (ui.js:547) builds the result card: the first narrator line (`fx.say`), police attention, cards gained or lost, travel and arrangement steps. It has no case for trust, search (belief), roll modifiers, the passport deadline, Sosā skipping an action or flags, so those changes are never reported after the choice.
- End reasons and every `sim.end.*` string go into `s.over.reason` and are never rendered; the ending shows "You win" or "You lose" and one `over.why_*` line (ui.js:270-279).
- In the Original column, a RUMORS line is shown as written in data.js, with `${n}`.


### EVENTS (src/data.js:357 to 464)
| Location | Original | What the code does (file:line) | Problem (guide and pattern) | Proposed | Status |
|---|---|---|---|---|---|
| EVENTS.selfie.title | A photo from the kitchen | News card heading, residence only (data.js:359; ui.js:526) |  |  | KEEP |
| EVENTS.selfie.text | The cook's nephew posted a photo. You are in the window behind him. | Setup line under the heading (ui.js:526) |  |  | KEEP |
| EVENTS.selfie.buy_phone.label | Buy the nephew's phone | 1 h, police attention -1 (data.js:360; sim.js:332, 350) |  |  | KEEP |
| EVENTS.selfie.buy_phone.say | Nando pays twice what the phone is worth. | Result line on the result card (ui.js:558, 534) |  |  | KEEP |
| EVENTS.selfie.beach.label | Post an old beach photo | Needs a political pull card that counts here (sim.js:172). Search moves to Pedra Branca from the residence (sim.js:333), police attention -1, sets flags.lied (a later confession costs 3, sim.js:519); no chip shows the lie |  |  | KEEP |
| EVENTS.selfie.beach.say | Gianlūka's people post you on the coast. | Search goes to Pedra Branca, the next stop on your route, not a coast (sim.js:333) |  |  | KEEP |
| EVENTS.selfie.let_it.label | Let it stand | Police attention +2 |  |  | KEEP |
| EVENTS.dog.title | The dog will not stay | Heading, residence (data.js:363) |  |  | KEEP |
| EVENTS.dog.text | Your youngest will not leave without the dog. The dog barks at strangers. | Setup; the dog flag later unlocks dog_bark at the line (data.js:427) |  |  | KEEP |
| EVENTS.dog.bring_dog.label | Bring the dog | flags.dog, sibling trust +1 (sim.js:337, 342) |  |  | KEEP |
| EVENTS.dog.bring_dog.say | The dog sleeps across your feet. | Result line |  |  | KEEP |
| EVENTS.dog.leave_dog.label | Leave him with the cook | 1 h |  |  | KEEP |
| EVENTS.dog.leave_dog.say | An hour of crying in the back seat. | Result line for the 1 h choice | AGENTS "every line is a complete sentence": fragment | Your youngest cries in the back seat for an hour. | REWRITE |
| EVENTS.summons.title | A court officer at the gate | Heading, residence |  |  | KEEP |
| EVENTS.summons.text | He has a summons and orders to hand it to you in person. | Setup |  |  | KEEP |
| EVENTS.summons.accept.label | Take the summons | Passport deadline 12 hours earlier (sim.js:343); at the deadline the own passport is canceled, the travel ban goes on, and a first police stop then starts at the station (sim.js:483, 269) |  |  | KEEP |
| EVENTS.summons.accept.say | The court now has your signature, and your passport deadline moves up 12 hours. | Same; names which deadline and by how much |  |  | KEEP |
| EVENTS.summons.lawyer.label | Send Gianlūka's lawyer | Needs political pull here; 2 h; Gianlūka trust -1 |  |  | KEEP |
| EVENTS.summons.lawyer.say | The lawyer argues at the gate for two hours. | Result line |  |  | KEEP |
| EVENTS.summons.ignore.label | Keep the gate shut | Police attention +1 |  |  | KEEP |
| EVENTS.cameras.title | Gianlūka wants cameras | Heading, residence |  |  | KEEP |
| EVENTS.cameras.text | He wants you on the steps tonight, calling the election stolen. | Setup |  |  | KEEP |
| EVENTS.cameras.speak.label | Speak on the steps | Police attention +3, Gianlūka trust +1, gain "A report held one day" (data.js:371) |  |  | KEEP |
| EVENTS.cameras.speak.say | The party loves it. So does Sosā. | Result line; the +3 shows as a chip, the trust gain shows nowhere after the choice (ui.js:547-577 has no trust case) | Humanizer 2, one-line dramatic closer ("So does Sosā.") | The party loves the speech, and Sosā's people watch every minute of it. | REWRITE |
| EVENTS.cameras.refuse.label | Refuse | Gianlūka trust -1 |  |  | KEEP |
| EVENTS.cameras.refuse.say | Gianlūka goes quiet on the phone. | Result line; trust only |  |  | KEEP |
| EVENTS.fuel.title | Fuel is rationed | Heading, Pedra Branca only (at: road) |  |  | KEEP |
| EVENTS.fuel.text | Every pump in Pedra Branca has a line and a police officer. | Setup |  |  | KEEP |
| EVENTS.fuel.queue.label | Wait in line | 2 h, police attention +1 |  |  | KEEP |
| EVENTS.fuel.farmer.label | Buy from a farmer | Roll 8 or higher on the d20 (dc 3, sim.js:281, 327); win 1 h; fail 2 h and police attention +2 |  |  | KEEP |
| EVENTS.fuel.farmer.win.say | 20 liters from a tractor shed. | Win line | AP: a sentence never starts with a figure; AGENTS: fragment | You buy 20 liters from a tractor shed. | REWRITE |
| EVENTS.fuel.farmer.lose.say | The farmer calls his nephew, who calls the radio. | Fail line |  |  | KEEP |
| EVENTS.fuel.river.label | Leave the car, take the river | Needs a boat card here (Matēu's barges). Only effect: mods at this stop -1, so moves at Pedra Branca need less (sim.js:345, 193). You do not travel | Label promises travel; the code only makes moves here easier |  | FLAG |
| EVENTS.fuel.river.say | The river has no pumps and no police. | Result line; no chip after the choice says moves got easier (mod emits no event, ui.js:547-577) |  |  | KEEP |
| EVENTS.hitchhiker.title | A hitchhiker knows your face | Heading, Pedra Branca |  |  | KEEP |
| EVENTS.hitchhiker.text | A young reporter flags you down. She recognizes you before the door closes. | Setup |  |  | KEEP |
| EVENTS.hitchhiker.interview.label | Give her the interview | Police attention +2; search moves back to the residence (sim.js:333) |  |  | KEEP |
| EVENTS.hitchhiker.interview.say | Her story puts you on the coast road. | Search goes to the residence, not a coast road; story claim, logged below |  |  | KEEP |
| EVENTS.hitchhiker.silence.label | Buy her silence | Roll 11 or higher (dc 4); fail police attention +3 |  |  | KEEP |
| EVENTS.hitchhiker.silence.win.say | She keeps the money and the story. | Win line, no other effect |  |  | KEEP |
| EVENTS.hitchhiker.silence.lose.say | She takes the money and files anyway. | Fail line |  |  | KEEP |
| EVENTS.hitchhiker.drop.label | Drop her at the next town | 1 h |  |  | KEEP |
| EVENTS.flood.title | Flash flood at the bridge | Heading, Pedra Branca |  |  | KEEP |
| EVENTS.flood.text | The river is over the road. Trucks are turning back. | Setup |  |  | KEEP |
| EVENTS.flood.wait_water.label | Wait for the water | 4 h |  |  | KEEP |
| EVENTS.flood.ford.label | Drive through it | Roll 11 or higher; win police attention -1; fail 2 h, +1, lose a random card other than the second passport (sim.js:336) |  |  | KEEP |
| EVENTS.flood.ford.win.say | Water to the doors, then dry road. | Win line | AGENTS: fragment; owner couplet tell ("X, then Y") | The water reaches the doors before the road comes up dry. | REWRITE |
| EVENTS.flood.ford.lose.say | The engine floods. You leave something in the car. | Fail line; the lost card shows as a notice (ui.js:605) |  |  | KEEP |
| EVENTS.flood.ferry.label | Pay a smuggler's ferry | 1 h, police attention +1 |  |  | KEEP |
| EVENTS.flood.ferry.say | The ferryman knows who you are and says nothing. | Result line; "knows who you are" accounts for the +1 |  |  | KEEP |
| EVENTS.decoy_ditch.title | A decoy on the evening news | Only while "Two more cars like yours" is held (data.js:386; sim.js:261) |  |  | KEEP |
| EVENTS.decoy_ditch.text | One of your spare sedans rolled into a ditch on camera. The plates are yours. | Setup |  |  | KEEP |
| EVENTS.decoy_ditch.claim.label | Say it was you | Search moves back to the residence, police attention -2, lose the decoy card |  |  | KEEP |
| EVENTS.decoy_ditch.claim.say | For one evening you are in a ditch 200 kilometers away. | Result line |  |  | KEEP |
| EVENTS.decoy_ditch.quiet.label | Say nothing | Police attention +1 |  |  | KEEP |
| EVENTS.bishop.title | The bishop offers a blessing | Heading, Nova Trentô |  |  | KEEP |
| EVENTS.bishop.text | A public blessing at evening mass. The whole colônia would see you. | Setup | Humanizer 24, first sentence repeats the heading; AGENTS: fragment | The blessing would be at evening mass, in front of the whole colônia. | REWRITE |
| EVENTS.bishop.blessing.label | Accept the blessing | Police attention +2, Nonā Rosa trust +1 (the trust change is not reported after the choice) |  |  | KEEP |
| EVENTS.bishop.decline.label | Decline | Nonā Rosa trust -1 |  |  | KEEP |
| EVENTS.wedding.title | A wedding for 300 | Heading, Nova Trentô |  |  | KEEP |
| EVENTS.wedding.text | A cousin's wedding fills every street tonight. Nobody counts faces at a wedding. | Setup; the second sentence explains the -3 |  |  | KEEP |
| EVENTS.wedding.dance.label | Hide among the guests | 3 h, police attention -3 |  |  | KEEP |
| EVENTS.wedding.dance.say | You dance with a great aunt who never asks your name. | Result line | AP and Merriam-Webster spelling: "great-aunt" | You dance with a great-aunt who never asks your name. | REWRITE |
| EVENTS.wedding.skip.label | Stay inside | No effect |  |  | KEEP |
| EVENTS.grandson.title | The grandson wants out | Heading, Nova Trentô |  |  | KEEP |
| EVENTS.grandson.text | Nonā Rosa's grandson is 19, knows the rail yard and wants to come. | Setup | Chicago for prose: serial comma | Nonā Rosa's grandson is 19, knows the rail yard, and wants to come. | REWRITE |
| EVENTS.grandson.take.label | Take him with you | Gain "Nonā Rosa's grandson", a way onto the freight at Salta, spent on leaving Salta (sim.js:430) |  |  | KEEP |
| EVENTS.grandson.no.label | Say no | Nonā Rosa trust -1 |  |  | KEEP |
| EVENTS.raid.title | Police raid the next farm | Heading, Nova Trentô |  |  | KEEP |
| EVENTS.raid.text | Federal police are searching the neighbor for contraband. Not for you. Yet. | Setup | Humanizer 2, row of dramatic fragments ("Not for you. Yet.") | Federal police are searching the neighbor's farm for contraband. They are not here for you. | REWRITE |
| EVENTS.raid.cellar.label | Hide in the wine cellar | 4 h |  |  | KEEP |
| EVENTS.raid.slip.label | Slip out now | Roll 8 or higher; win 1 h; fail climbs the police stop ladder (sim.js:348, 267). You never leave the stop | Label promises leaving; a win only costs an hour |  | FLAG |
| EVENTS.strike.title | Rail strike tonight | Heading, Salta |  |  | KEEP |
| EVENTS.strike.text | The union stopped the yard. No freight moves unless someone breaks the strike. | Nothing blocks "Board the midnight freight" (data.js:152; sim.js:177-200); the strike has no mechanical effect | States a rule the game does not have |  | FLAG |
| EVENTS.strike.wait_strike.label | Wait it out | 8 h |  |  | KEEP |
| EVENTS.strike.union.label | Pay the union boss | Police attention +2 |  |  | KEEP |
| EVENTS.strike.union.say | The strike ends for one train. | Result line |  |  | KEEP |
| EVENTS.strike.scabs.label | Ride with the strikebreakers | Roll 11 or higher; win nothing; fail police stop. You neither board nor move | Label promises boarding; a win does nothing |  | FLAG |
| EVENTS.strike.scabs.win.say | Nobody looks at a scab twice. | Win line |  |  | KEEP |
| EVENTS.tourbus.title | A tour bus to the waterfalls | Heading, Salta |  |  | KEEP |
| EVENTS.tourbus.text | A bus of tourists leaves for the falls at the border at dawn. One seat is empty. | Setup; no time check on "at dawn" |  |  | KEEP |
| EVENTS.tourbus.bus.label | Take the seat in a hat | Roll 11 or higher; win moves the search back to Nova Trentô and takes you to the line (sim.js:333, 349); fail police stop. The chip shows only the target and the fail, never that a win moves you (sim.js:281) |  |  | KEEP |
| EVENTS.tourbus.bus.win.say | You sleep through the checkpoint. The guide counts you twice. | Win line; the "Reached the line" chip follows (ui.js:563) |  |  | KEEP |
| EVENTS.tourbus.pass.label | Let it go | No effect |  |  | KEEP |
| EVENTS.holt_drunk.title | Holt has been drinking | Heading, Salta |  |  | KEEP |
| EVENTS.holt_drunk.text | He is loud at the bar about a passenger worth a lot of money. | Setup |  |  | KEEP |
| EVENTS.holt_drunk.trust_holt.label | Trust him anyway | Sets Holt doubted (sim.js:338), which only changes his status mark (ui.js:232) |  |  | KEEP |
| EVENTS.holt_drunk.sober.label | Sober him up | 2 h, Holt trust +1 |  |  | KEEP |
| EVENTS.holt_drunk.cut_holt.label | Go to Theo instead | Cuts Holt off: his cards go and moves with him are blocked (sim.js:339, 184). Nothing happens with Theo | Label names an action with Theo that the code does not take |  | FLAG |
| EVENTS.yard_debt.title | The yardmaster owes your family | Heading, Salta; the Salta objective says the yardmaster will sell you to Sosā (data.js:149) |  |  | KEEP |
| EVENTS.yard_debt.text | His wife's father once worked for your father. He might remember. | Setup |  |  | KEEP |
| EVENTS.yard_debt.favor.label | Ask the favor | Roll 8 or higher; win gain "Theo walks you through"; fail police attention +2 |  |  | KEEP |
| EVENTS.yard_debt.favor.win.say | He remembers. He walks you to the train himself. | The card gained is Theo's (from: theo, data.js:77); you still have to board at night | Says the yardmaster walks you to the train; the code gives Theo's card and moves nothing. Contradicts the Salta objective |  | FLAG |
| EVENTS.yard_debt.favor.lose.say | He remembers differently. | Fail line |  |  | KEEP |
| EVENTS.yard_debt.leave_it.label | Do not risk it | No effect |  |  | KEEP |
| EVENTS.old_guard.title | A guard you know | Heading, the line |  |  | KEEP |
| EVENTS.old_guard.text | The night guard once worked for your family. He is staring at you. | Setup |  |  | KEEP |
| EVENTS.old_guard.loyalty.label | Appeal to old loyalty | Roll 8 or higher; win: moves at the line need 2 less on the old scale (sim.js:345, 193); fail police stop |  |  | KEEP |
| EVENTS.old_guard.loyalty.win.say | He looks at his boots and lets the queue move faster. | The only place the win effect is told: escape chips hide win effects (sim.js:281) and mod emits no event for the result card | Results say what changed: the line does not say crossings got easier | He looks at his boots and lets the queue move faster, so crossing here gets easier. | REWRITE |
| EVENTS.old_guard.next_shift.label | Wait for the next shift | 3 h |  |  | KEEP |
| EVENTS.pilgrims.title | Pilgrims at the barrier | Heading, the line |  |  | KEEP |
| EVENTS.pilgrims.text | The post is full of 40 pilgrims and their luggage. The guards are tired. | Setup |  |  | KEEP |
| EVENTS.pilgrims.queue_pilgrims.label | Join the queue | Moves at the line need 1 less (sim.js:345); chip "Moves here get easier" shows before the choice only |  |  | KEEP |
| EVENTS.pilgrims.wait_pilgrims.label | Wait for them to clear | 2 h |  |  | KEEP |
| EVENTS.blizzard.title | A blizzard closes the pass | No crossing is ever closed (sim.js:177-200) | States a rule the game does not have |  | FLAG |
| EVENTS.blizzard.text | The post is shut. A smugglers' path runs over the ridge. | Same; every post still works | States a rule the game does not have ("The post is shut") |  | FLAG |
| EVENTS.blizzard.storm.label | Wait out the storm | 6 h; skipEnemy sets lastEnemy to hour+3 (sim.js:344), so Sosā acts once in the six hours instead of twice (sim.js:488) |  |  | KEEP |
| EVENTS.blizzard.storm.say | Six hours in the snow, and the storm costs Sosā half of them too. | Same | Makes no sense on first read: "costs Sosā half of them" hides what changes | You wait six hours in the snow, and Sosā acts only once in that time instead of twice. | REWRITE |
| EVENTS.blizzard.ridge.label | Walk the ridge path | Roll 11 or higher; win takes you into Costamar past every post, the bought one included; fail 3 h, police attention +3 |  |  | KEEP |
| EVENTS.blizzard.ridge.win.say | You come down into Costamar with no stamp at all. | Win line; "Reached Portalba" chip follows |  |  | KEEP |
| EVENTS.blizzard.ridge.lose.say | You turn back half frozen. The post saw your flashlight. | Fail line |  |  | KEEP |
| EVENTS.dog_bark.title | The dog barks at the post | Only if you brought the dog (data.js:427) |  |  | KEEP |
| EVENTS.dog_bark.text | The guards look up at the dog barking in your car. | Setup |  |  | KEEP |
| EVENTS.dog_bark.calm.label | Let your daughter calm him | Roll 8 or higher; win nothing; fail police attention +3 |  |  | KEEP |
| EVENTS.dog_bark.give_dog.label | Give the dog to a trucker | Sibling trust -1 |  |  | KEEP |
| EVENTS.dog_bark.give_dog.say | Your daughter does not speak to you until Costamar. | The trust lost is your sibling's, not your daughter's; logged below |  |  | KEEP |
| EVENTS.esm_press.title | Cameras across the line | Heading, the line |  |  | KEEP |
| EVENTS.esm_press.text | Someone told the press in Cerro Alto. Cameras wait on the far side. | Setup |  |  | KEEP |
| EVENTS.esm_press.speak_esm.label | Speak to them | Police attention +2, welcome in Costamar +1 step (sim.js:341); step 2 brings Vélez's card, step 3 the escort post |  |  | KEEP |
| EVENTS.esm_press.speak_esm.say | Costamar sees you. So does Valdória. | Result line; the step shows as a row (ui.js:565) | Humanizer 2, clipped closer ("So does Valdória.") | Costamar sees you on the news, and so does Valdória. | REWRITE |
| EVENTS.esm_press.cover.label | Cover your face | No effect |  |  | KEEP |
| EVENTS.crew_double.title | The crew wants double | Heading, Portalba |  |  | KEEP |
| EVENTS.crew_double.text | The operator's insurer called. The pilot wants twice the fee or a guarantee. | Setup; no choice touches the jet |  |  | KEEP |
| EVENTS.crew_double.pay_double.label | Pay double | Police attention +1 |  |  | KEEP |
| EVENTS.crew_double.guarantee.label | Have your sponsor guarantee it | Needs "Your sponsor's line to the ministry"; sponsor trust -1 |  |  | KEEP |
| EVENTS.crew_double.guarantee.say | It goes on what you owe your sponsor. | Result line |  |  | KEEP |
| EVENTS.crew_double.other_pilot.label | Find another pilot | 4 h |  |  | KEEP |
| EVENTS.overflight.title | No overflight permit | Heading, Portalba |  |  | KEEP |
| EVENTS.overflight.text | The refuel stop will not let the jet cross. The long route adds hours. | Setup |  |  | KEEP |
| EVENTS.overflight.long.label | Take the long route | 3 h spent now |  |  | KEEP |
| EVENTS.overflight.short.label | Risk the short route | mod +1: departure moves at Portalba need one more, for certain (sim.js:345) | "Risk" suggests a chance; the cost is certain |  | FLAG |
| EVENTS.overflight.short.say | The pilot files it anyway. The tower will look twice. | The only line after the choice; mod emits no event, so nothing else says departure got harder | Results say what changed | The pilot files the short route anyway, so the tower will look harder when you try to leave. | REWRITE |
| EVENTS.goodbye_post.title | A goodbye online | Heading, Portalba |  |  | KEEP |
| EVENTS.goodbye_post.text | Your daughter posted a photo from the airfield lounge. It is everywhere. | Setup |  |  | KEEP |
| EVENTS.goodbye_post.takedown.label | Get it taken down | Roll 11 or higher; win nothing; fail police attention +3 |  |  | KEEP |
| EVENTS.goodbye_post.stand.label | Let it stand | Police attention +2 and flags.asked: takeoff needs 2 more on the old scale until welcome step 2 (sim.js:192); a police stop becomes possible in Costamar (sim.js:271). No chip shows the flag (sim.js:278-300) |  |  | KEEP |
| EVENTS.goodbye_post.stand.say | Valdória asks Costamar to hold you within the hour. | Sets flags.asked at once; the line is the only place the effect could be told | Results say what changed; "within the hour" is false timing | Valdória asks Costamar to hold you. The police here can now stop you, and your takeoff is harder until Costamar's minister knows you are coming. | REWRITE |
| EVENTS.rival_deal.title | The president calls | At the line or Portalba |  |  | KEEP |
| EVENTS.rival_deal.text | Concede on camera, come home, and the case quietly closes. | Setup |  |  | KEEP |
| EVENTS.rival_deal.take_deal.label | Take the deal | Ends the run as a loss, kind deal; ending shows over.why_deal (ui.js:278) |  |  | KEEP |
| EVENTS.rival_deal.take_deal.end.reason | You concede on camera at noon. The case closes quietly. The party never forgives you. | Never rendered: s.over.reason is stored (sim.js:347) but renderOver shows only over.why_* (ui.js:270-279) |  |  | KEEP |
| EVENTS.rival_deal.hang_up.label | Hang up | No effect |  |  | KEEP |
| EVENTS.too_soon.title | Your family spoke too soon | Any stop |  |  | KEEP |
| EVENTS.too_soon.text | {sib} told reporters you already landed abroad. You are still at {here}. | {sib} and {here} filled by sim.js:241 ("the residence", "the line" or the stop name) |  |  | KEEP |
| EVENTS.too_soon.let_run.label | Let the story run | Search moves off your stop, police attention -2, flags.dark: every new call answers 2 hours later (sim.js:439) |  |  | KEEP |
| EVENTS.too_soon.let_run.say | Your own people believe it too, and every reply you ask for now comes two hours later. | Same; states the delay |  |  | KEEP |
| EVENTS.too_soon.correct.label | Correct it | Police attention +1 |  |  | KEEP |
| EVENTS.bodyguard.title | An old bodyguard wants money | Any stop |  |  | KEEP |
| EVENTS.bodyguard.text | He knows your route. He will sell it tonight unless you pay. | Setup |  |  | KEEP |
| EVENTS.bodyguard.pay_guard.label | Pay him | Police attention +1 |  |  | KEEP |
| EVENTS.bodyguard.bluff.label | Call his bluff | Roll 8 or higher; fail moves the search to your stop and police attention +3 |  |  | KEEP |
| EVENTS.bodyguard.bluff.win.say | He never calls anyone. | Win line |  |  | KEEP |
| EVENTS.bodyguard.bluff.lose.say | He calls Sosā before midnight. | The search moves to you at once (sim.js:334); the belief change is not reported on the result card | Results say what changed; "before midnight" is false timing | He calls Sosā, who now searches where you are. | REWRITE |
| EVENTS.bodyguard.gianluka.label | Have Gianlūka handle him | Needs political pull here; Gianlūka trust -1 |  |  | KEEP |
| EVENTS.coffee.title | A police car pulls in beside you | Residence to Salta |  |  | KEEP |
| EVENTS.coffee.text | Two officers get out for coffee. One glances at your window. | Setup |  |  | KEEP |
| EVENTS.coffee.sit.label | Sit still | Roll 11 or higher; fail police stop |  |  | KEEP |
| EVENTS.coffee.drive.label | Drive away now | Police attention +1; you stay at the stop |  |  | KEEP |
| EVENTS.hearing.title | The hearing moves up | Only while 43+ hours remain (data.js:458) |  |  | KEEP |
| EVENTS.hearing.text | The court moved your hearing forward. The passport deadline is sooner. | Choices: Keep going moves the passport deadline 10 hours sooner; the delay moves it 4 sooner. Neither amount is shown on a chip (deadline.sooner carries no number) and "Keep going" has no result line | Humanizer 24, repeats the heading; results say what changed: the 10 hours appear nowhere | Your passport deadline now comes 10 hours sooner. | REWRITE |
| EVENTS.hearing.noted.label | Keep going | Passport deadline -10 (sim.js:343) |  |  | KEEP |
| EVENTS.hearing.stall.label | Have Gianlūka ask for a delay | Needs political pull here (data.js:460); deadline -4, Gianlūka trust -1, police attention +1 |  |  | KEEP |
| EVENTS.hearing.stall.say | The clerk moves your hearing up four hours instead of 10. Gianlūka adds it to what you owe him, and the court knows you are still in reach. | Matches the code: four hours instead of 10; the second sentence accounts for the trust and attention costs |  |  | KEEP |
| EVENTS.blackout.title | The province goes dark | Any stop |  |  | KEEP |
| EVENTS.blackout.text | A storm took down the grid. Phones, radios and the inquiry go quiet. | Calls still work; only the dark choice delays Sosā (sim.js:344) | States a rule the game does not have (phones go quiet); Chicago serial comma missing | A storm took down the grid, and the inquiry's radios go quiet. | REWRITE |
| EVENTS.blackout.dark.label | Move while they are blind | Police attention -1, Sosā skips one action; no travel and no time (data.js:462) | Term: "move" is the player's word for a move, and this choice moves nowhere |  | FLAG |
| EVENTS.blackout.sit.label | Sit tight until the lights return | 2 h, police attention -1 |  |  | KEEP |
| EVENTS.blackout.sit.say | Two hours in the dark. Nobody comes to the door. | Result line | AGENTS: fragment; Humanizer clipped beats | You sit in the dark for two hours, and nobody comes to the door. | REWRITE |

### HOLDS (src/data.js:466 to 479)
| Location | Original | What the code does (file:line) | Problem (guide and pattern) | Proposed | Status |
|---|---|---|---|---|---|
| HOLDS.1.title | Stopped and questioned | Step 1 of the stop ladder (sim.js:272); kind label "The police have you · Step 1 of three" (ui.js:526) |  |  | KEEP |
| HOLDS.1.text | A patrol stops you at {here}. An officer wants to know where you are going. | {here} from sim.js:241; in Costamar only after flags.asked (sim.js:271) |  |  | KEEP |
| HOLDS.1.calm.label | Answer calmly | Roll 8 or higher, 11 for Teresā (face known, sim.js:327); win 1 h; fail 3 h, lose a random card other than the second passport, police attention +1 |  |  | KEEP |
| HOLDS.1.calm.win.say | He writes down a name that is not yours. | Win line |  |  | KEEP |
| HOLDS.1.calm.lose.say | Three hours on a bench. They keep something of yours. | Fail line; the card loss also shows as a notice | AGENTS: fragment | They keep you on a bench for three hours and take something of yours. | REWRITE |
| HOLDS.1.lawyer.label | Call the party's lawyer | Needs political pull here (Valdória only); 2 h; Gianlūka trust -1 |  |  | KEEP |
| HOLDS.1.lawyer.say | The lawyer arrives shouting. They let you go. | Result line |  |  | KEEP |
| HOLDS.1.bribe.label | Pay the officer | 1 h, police attention +2 |  |  | KEEP |
| HOLDS.1.bribe.say | The officer takes the money and lets you go. | Result line |  |  | KEEP |
| HOLDS.2.title | Held at the station | Step 2 |  |  | KEEP |
| HOLDS.2.text | They take you to the nearest station. Your phone goes in a plastic bag. | Setup; calls are blocked while held (sim.js:212) |  |  | KEEP |
| HOLDS.2.wait_lawyer.label | Wait for a lawyer | 8 h; lose 'best': the second passport if held, otherwise a random card (sim.js:336) |  |  | KEEP |
| HOLDS.2.wait_lawyer.say | Eight hours. They keep your second passport, or another card if you no longer have it. | Same | AGENTS: fragment ("Eight hours.") | You wait eight hours, and they keep your second passport, or another card if you no longer have it. | REWRITE |
| HOLDS.2.embassy.label | {sib} calls an embassy | Roll 11 or higher; blocked if your sibling talked (sim.js:276); win 4 h; fail 10 h and lose 'best' |  |  | KEEP |
| HOLDS.2.embassy.win.say | A diplomat calls the station chief. You are released. | Win line |  |  | KEEP |
| HOLDS.2.embassy.lose.say | Nobody important answers until morning, and they keep your second passport. | Fail costs 10 h and takes the second passport, or another card without it | "Until morning" is false timing; omits the other-card case | Nobody important answers for 10 hours, and they keep your second passport, or another card if you no longer have it. | REWRITE |
| HOLDS.2.walk_out.label | Walk out at shift change | Roll 14 or higher; win 1 h, police attention +3; fail climbs to house arrest |  |  | KEEP |
| HOLDS.2.walk_out.win.say | Nobody stops a person walking like they belong. | Win line |  |  | KEEP |
| HOLDS.3.title | House arrest | Step 3 |  |  | KEEP |
| HOLDS.3.text | The court placed you under house arrest. Two officers sit outside the door. | Setup |  |  | KEEP |
| HOLDS.3.climb.label | Climb out at the shift change | Roll 14 or higher, 11 if a decoy card counts here (sim.js:327). Win: 2 h, police attention +4 from the reset 4, ladder set to step 2 (data.js:477; sim.js:346). Fail: run ends |  |  | KEEP |
| HOLDS.3.climb.win.say | Over the back wall, into a car that was not there yesterday. | Win line | AGENTS: fragment | You go over the back wall and into a car that was not there yesterday. | REWRITE |
| HOLDS.3.climb.lose.end.reason | The officers catch you on the wall. The hearing is Monday. You will be there. | Never rendered: s.over.reason is stored (sim.js:347) but renderOver shows only over.why_* (ui.js:270-279); the player sees "You are under house arrest." |  |  | KEEP |
| HOLDS.3.accept.label | Accept it | Ends the run as a loss |  |  | KEEP |
| HOLDS.3.accept.end.reason | You sit by the window and watch the officers change shifts. The hearing is Monday. | Never rendered: s.over.reason is stored (sim.js:347) but renderOver shows only over.why_* (ui.js:270-279) |  |  | KEEP |

### RUMORS (src/data.js:481 to 485)
| Location | Original | What the code does (file:line) | Problem (guide and pattern) | Proposed | Status |
|---|---|---|---|---|---|
| RUMORS[0] | Someone saw ${n} talking to a police car. | Picked at random, not from behavior (sim.js:258); the person is the secret informer 65% of the time when one is at the stop (sim.js:256). Card kind "A rumor" frames it |  |  | KEEP |
| RUMORS[1] | ${n} asked twice which car you will take. | Same |  |  | KEEP |
| RUMORS[2] | ${n} paid off a debt this morning, in cash. | Same |  |  | KEEP |

### content/coalition/ui.json, ids starting "sim." (159)
| Location | Original | What the code does (file:line) | Problem (guide and pattern) | Proposed | Status |
|---|---|---|---|---|---|
| sim.end.is_named_on_the_warrant | {name} is named on the warrant by Monday. | Never rendered: built into s.over.reason by epilogue (sim.js:537-552) or the clock loss (sim.js:490); renderOver shows only over.why_* (ui.js:270-279) |  |  | KEEP |
| sim.end.you_were_held_times_along | You were held {holds} times along the way. | Never rendered: built into s.over.reason by epilogue (sim.js:537-552) or the clock loss (sim.js:490); renderOver shows only over.why_* (ui.js:270-279) |  |  | KEEP |
| sim.end.you_were_held_once_along | You were held once along the way. | Never rendered: built into s.over.reason by epilogue (sim.js:537-552) or the clock loss (sim.js:490); renderOver shows only over.why_* (ui.js:270-279) |  |  | KEEP |
| sim.end.nona_rosa_s_truck_runs | Nonā Rosa's truck still runs to Salta. | Never rendered: built into s.over.reason by epilogue (sim.js:537-552) or the clock loss (sim.js:490); renderOver shows only over.why_* (ui.js:270-279) |  |  | KEEP |
| sim.end.talked_to_the_inquiry_will | {and} talked to the inquiry. | Never rendered: built into s.over.reason by epilogue (sim.js:537-552) or the clock loss (sim.js:490); renderOver shows only over.why_* (ui.js:270-279) |  |  | KEEP |
| sim.end.baca_reads_your_refusal_as | Cerro Alto has closed its guest room to you. | Never rendered: built into s.over.reason by epilogue (sim.js:537-552) or the clock loss (sim.js:490); renderOver shows only over.why_* (ui.js:270-279) |  |  | KEEP |
| sim.end.is_still_waiting_for_the | {aide} is still waiting for the statement you promised. | Never rendered: built into s.over.reason by epilogue (sim.js:537-552) or the clock loss (sim.js:490); renderOver shows only over.why_* (ui.js:270-279) |  |  | KEEP |
| sim.end.leads_the_party_in_your | {aide} leads the party in your name. | Never rendered: built into s.over.reason by epilogue (sim.js:537-552) or the clock loss (sim.js:490); renderOver shows only over.why_* (ui.js:270-279) |  |  | KEEP |
| sim.end.leads_the_party_now_and | {aide} leads the party now and denies knowing you. | Never rendered: built into s.over.reason by epilogue (sim.js:537-552) or the clock loss (sim.js:490); renderOver shows only over.why_* (ui.js:270-279) |  |  | KEEP |
| sim.end.a_car_meets_the_aircraft | A car meets the jet at {city}. | Never rendered: built into s.over.reason by epilogue (sim.js:537-552) or the clock loss (sim.js:490); renderOver shows only over.why_* (ui.js:270-279) |  |  | KEEP |
| sim.inquiry.the_yacht_story_is_dead |  Your yacht story falls apart, and that costs you more. | Appended when a pressed ally talks after flags.lied: police attention +3 instead of +2 (sim.js:519) | Results say what changed: "costs you more" hides the one extra point |  Your yacht story falls apart too, which adds one more point of police attention. | REWRITE |
| sim.inquiry.tells_them_where_you_were |  {first} tells them where you are and stops helping you.{yacht} | Ally marked as talked, search moves to your stop, police attention +2 (sim.js:519); moves with them are blocked (sim.js:185) but their cards stay in your hand; also logged on the government side through Sim.enemyAct (gov.js:198, 282; ui.js:611), where "you" is wrong |  |  | KEEP |
| sim.inquiry.says_nothing_useful |  {first} says nothing useful. | Pressed ally holds firm (sim.js:519) |  |  | KEEP |
| sim.inquiry.reviews_the_passenger_lists_at | {name} reviews the passenger lists at Portô Venla airport and finds nothing. | No ally to question; nothing happens (sim.js:519). {name} is "Inspector Valentīn Sosā", a real title |  |  | KEEP |
| sim.inquiry.the_operator_withdraws_the_crew |  The operator pulls the crew, and the jet drops back one step. | If the jet is at step 3 or above it drops one step (sim.js:518) |  |  | KEEP |
| sim.inquiry.nothing_new |  You made no calls in the last three hours, so they learn nothing. | Trace: no call in the last three hours (sim.js:516) |  |  | KEEP |
| sim.inquiry.the_last_call_came_from |  Your last call came from here, so Sosā now searches where you are. | Trace: a call in the last three hours moves the search to your stop (sim.js:516) |  |  | KEEP |
| sim.inquiry.nobody_there_has_seen_you |  Nobody there has seen you. | Search aimed elsewhere (sim.js:515); also logged on the government side through Sim.enemyAct (gov.js:198, 282; ui.js:611), where "you" is wrong |  |  | KEEP |
| sim.inquiry.they_are_close |  They are close. | Search on your stop, police attention under 7: +2 on the escape side, +1 on the government side (sim.js:515). The Sosā card sums the rise (ui.js:542); a number here would show her hidden attention on the government side; also logged on the government side through Sim.enemyAct (gov.js:198, 282; ui.js:611), where "you" is wrong |  |  | KEEP |
| sim.inquiry.they_find_you |  They find you. | Search on your stop and police attention 7+: climbHold (sim.js:515). In Costamar before flags.asked, climbHold returns and no stop happens (sim.js:271); also logged on the government side through Sim.enemyAct (gov.js:198, 282; ui.js:611), where "you" is wrong |  |  | KEEP |
| sim.line.the_minister_has_other_guests | "The minister has other guests this weekend." | Vélez's line when a reception job fails; the job is removed, so you must call again (sim.js:503) |  |  | KEEP |
| sim.line.the_ministry_has_not_called | "The ministry has not called back. I will try again if you ask." | Sponsor line when a visa job fails; says to ask again, which is the rule (sim.js:503) |  |  | KEEP |
| sim.line.nothing_yet_they_want_more | "Nothing yet. They want more time." | Sibling line when a job fails; the job is removed (sim.js:495, 503). The Sosā card row adds "came up empty, so call again" (ui.js:556) |  |  | KEEP |
| sim.line.the_crew_will_not_confirm | "The crew will not book without a city. Decide." | Aircraft job to step 2 succeeds with no city (sim.js:500). The call is blocked in exactly that state (sim.js:216) and neither flag can be undone, so I find no way to reach this line |  |  | KEEP |
| sim.end.your_immunity_is_gone_a | {time}. Your immunity is gone, and Costamar has closed the airfield to you. {epilogue} | Never rendered: built into s.over.reason by epilogue (sim.js:537-552) or the clock loss (sim.js:490); renderOver shows only over.why_* (ui.js:270-279); the player sees over.why_time |  |  | KEEP |
| sim.inquiry.monday_noon_your_own_passport | The passport deadline has passed, so your own passport is cancelled, the travel ban is at every post, and any police stop now starts at the station. | Fires at s.deadline (sim.js:483), which events move earlier. Sets cancelled (the first stop starts at step 2, Valdória only: sim.js:269, 271) and restriction (+1 at the line unless "A report held one day" counts, sim.js:190). Also repeated in every later round briefing (ui.js:403). No move uses the canceled passport (own_passport does not exist, sim.js:195) | AP spelling "canceled"; "the travel ban is at every post" and "any police stop" overstate where the rules apply | The passport deadline has passed, so your own passport is canceled, crossings at the line need one more on the die unless you hold "A report held one day," and any police stop in Valdória now starts at the station. | REWRITE |
| sim.line.think_about_it_i_will | "Think about it. I will call again." | Sosā never calls again (sim.js:143-148 fires once); voice line, logged |  |  | KEEP |
| sim.line.then_you_will_cross_like | "Then you will cross like anyone else." | Vélez after refusal (sim.js:471) |  |  | KEEP |
| sim.line.thank_you_my_people_will | "Thank you. My people will be at the post." | Said even when your welcome is below step 3, when no officials are at any post (sim.js:470); logged |  |  | KEEP |
| sim.say.the_sedan_rolls_past_the | The sedan crawls past the gate and the car follows it north while Nando waves without looking. | After "Send Nando past the gate first" (sim.js:469) | Chicago: comma before "and" joining two independent clauses | The sedan crawls past the gate, and the car follows it north while Nando waves without looking. | REWRITE |
| sim.line.then_we_have_nothing_to | "Then we have nothing to discuss. Good luck with the pilot." | Sponsor after refusal (sim.js:467) |  |  | KEEP |
| sim.line.a_week_i_am_not | "A week. I am not a patient man, but I am a curious one." | Said by every sponsor (sim.js:466); Mirēlā Vosk is "she" (data.js:248) | Makes no sense for Vosk: "a patient man" | "A week. I am not patient, but I am curious." | REWRITE |
| sim.line.good_the_ministry_will_hear | "Good. The ministry will hear from me in the morning." | After signing: sponsor trust 2, so the next visa roll is easier (sim.js:465) |  |  | KEEP |
| sim.say.they_go_to_the_house | They go to the house and find it empty. | After "Say you are at home" (sim.js:463) |  |  | KEEP |
| sim.say.the_radio_has_you_at | The radio has you at sea for the evening, and Nando laughs in the front seat. | After "Confirm it, from the yacht" (sim.js:462) |  |  | KEEP |
| sim.line.the_operator_just_had_a | "The operator just had a call from the minister's office. We are good." | Pilot after Vélez calls the operator (sim.js:460) |  |  | KEEP |
| sim.line.the_crew_is_happy_the | "The crew is happy, and the apron saw you pay them." | Pilot after the crew bonus (sim.js:459) |  |  | KEEP |
| sim.say.gianluka_does_not_answer_again | Gianlūka does not answer again, and the inquiry now knows where you are. | After "Put him off": Gianlūka talks, search on your stop, +2 at once (sim.js:458) | Brief: say "the police" or Sosā, not "the inquiry" | Gianlūka does not answer again, and Sosā now knows where you are. | REWRITE |
| sim.line.thank_you_sosa_s_people | "Thank you. Sosā's people are in Pedra Branca tonight, by the way. Not here." | Gianlūka after the statement; matches the search moving to Pedra Branca (sim.js:457) |  |  | KEEP |
| sim.line.her_uncle_banks_with_me | "Her uncle banks with me. She will answer within the hour. That is two things now." | Said by every sponsor (sim.js:455); banking fits Salek only (Rāo is a magistrate, Vosk a former envoy, data.js:241, 248) | Makes no sense for two of three sponsors | "I know her uncle. She will answer within the hour. That is two things now." | REWRITE |
| sim.line.i_could_not_decide_for | "I could not decide for you. Six hours lost." | Failed pick: a six-hour stall job blocks calls about the jet, then does nothing (sim.js:453, 496). No game time is lost | Every clock says whose it is: "Six hours lost" reads as six hours of game time passing | "I could not decide for you. Do not ask me about the jet for six hours." | REWRITE |
| sim.line.then_call_salek_soon_the | "Then call {sponsor} soon. The crew will not wait on us forever." | After "Wait for {sponsor}" (sim.js:452); nothing times the crew out |  |  | KEEP |
| sim.why.pick_one_of_the_answers | Pick one of the answers. | Invalid phone option; logged as a system line (sim.js:447; ui.js:350) |  |  | KEEP |
| sim.why.that_message_is_gone | That message is gone. | Message already answered (sim.js:446; gov.js:169) |  |  | KEEP |
| sim.line.ten_hours_and_you_understand | "10 hours, and you understand what I asked." | Visa job is due 10 hours after the call, 16 for Rāo (slow 6, data.js:243), 2 more after "spoke too soon" (sim.js:439) | AP: no figure at the start of a sentence | "Ten hours, and you understand what I asked." | REWRITE |
| sim.line.i_have_a_name_in | "I have a name in Cerro Alto. Give me six hours." | Reception job via your sibling, due six hours after the call (sim.js:439, 442) |  |  | KEEP |
| sim.line.i_will_see_what_the | "I will see what the minister can spare. Call it a courtesy." | Reception job via Vélez (sim.js:442) |  |  | KEEP |
| sim.line.leave_it_with_me_six | "Leave it with me. Six hours." | Aircraft job, due six hours after the call (sim.js:439, 442) |  |  | KEEP |
| sim.why.nothing_to_call_about | Nothing to call about. | Call on a finished arrangement (sim.js:435); the button is not shown then (sim.js:209) | AGENTS: fragment; blocked actions say what is missing | That arrangement is already complete. | REWRITE |
| sim.say.sold_you_out_sosa_knows | {name} sold you out, and Sosā knows where you are. | Move with a secret informer: 60% they sell it; search to you, police attention +3 (sim.js:383-385) |  |  | KEEP |
| sim.why.not_something_you_can_do | You cannot do that here. | Unknown move id (sim.js:369) |  |  | KEEP |
| sim.why.answer_the_news_first | Deal with the news first | Reason on every move and call while a news card waits (sim.js:183, 212, 364). Reasons are joined with a space (sim.js:197), so a missing period runs two reasons together | Missing end punctuation; term should match hint.news ("Pick a response") | Pick a response to the news first. | REWRITE |
| sim.why.you_are_being_held | You are being held. | Reason while a police stop card waits, at every step including "Stopped and questioned" (sim.js:183, 364) | Blocked actions say how to clear them; "being held" is wrong at step 1 | Answer the police first. | REWRITE |
| sim.why.the_run_is_over | The run is over. | Run over (sim.js:361; gov.js:162) |  |  | KEEP |
| sim.say.is_clean_and_offended_you | {name} is clean, and you can count on {name} now. | Test on a loyal ally: marked tested, trust raised to at least 2 (sim.js:340). {name} is the full name, printed twice | Repeats the full name in one sentence | {name} passes your test and is loyal to you. | REWRITE |
| sim.say.was_working_for_sosa_you | {name} was working for Sosā, so you drop every card {name} gave you before it can hurt you. | Test on an informer: marked as talked, every card they gave you is lost, moves with them blocked (sim.js:340, 185) | Invents a cause ("before it can hurt you"); repeats the full name | {name} was working for Sosā, so you drop every card you got through that contact. | REWRITE |
| sim.say.you_stop_answering | You stop answering {name}. | Cut: their cards go, moves with them blocked (sim.js:339) |  |  | KEEP |
| sim.why.pick_one_of_the_choices | Pick one of the choices. | Invalid news choice (sim.js:316) |  |  | KEEP |
| sim.why.no_news_waiting | No news waiting. | News choice with no card (sim.js:315; gov.js:165) | AGENTS: fragment | There is no news waiting. | REWRITE |
| sim.opt.cut_them_off | Cut {first} off | Rumor choice: cut (sim.js:309) |  |  | KEEP |
| sim.opt.test_them_quietly | Test {first} quietly | Rumor choice: 2 h, reveals the truth (sim.js:308, 340) |  |  | KEEP |
| sim.opt.keep_trusting | Trust {split} | Rumor choice: doubt, already set by the rumor, so no effect (sim.js:257, 307) |  |  | KEEP |
| sim.why.is_not_answering | {name} is not picking up | Embassy choice when your sibling talked (sim.js:276); your sibling is never a suspect and is never pressed (sim.js:24, 519), so this never shows | Missing end punctuation (reasons are joined with a space) | {name} is not picking up. | REWRITE |
| sim.label.lie_low_one_hour | Lie low one hour | actions().wait.name (sim.js:238); the UI never reads it and labels the button with action.wait (ui.js:120) |  |  | KEEP |
| sim.why.salek_is_not_taking_your | {sponsor} is not taking your calls | After refusing the sponsor (sim.js:234); the "no sponsor card" reason is checked first and always wins (sim.js:231) | Missing end punctuation | {sponsor} is not taking your calls. | REWRITE |
| sim.why.nando_and_the_spare_cars | Nando and the spare cars are gone. | Decoy card not held (sim.js:233) |  |  | KEEP |
| sim.why.you_do_not_have_v | You do not have Vélez's card. | Vélez's card does not count here or is not held (sim.js:232); it arrives at welcome step 2 (sim.js:424) | Blocked actions say how to get what is missing | You need Vélez's card, which she sends once her minister knows you are coming. | REWRITE |
| sim.why.you_do_not_have_salek | {sponsor} has to agree to help with your visa first. | Sponsor card not held (sim.js:231); it arrives at visa step 1 (sim.js:425) |  |  | KEEP |
| sim.status.contact_salek_before_reaching_susana | It is too late to ask {sponsor} for a visa from Portalba. | Reason on the visa call at Portalba with no sponsor yet (sim.js:221) |  |  | KEEP |
| sim.status.arrange_reception_through_your_sibling | Your sibling gets Vélez to expect you, and later Vélez can put officials at one border post. | Preview text for the welcome call (sim.js:220) |  |  | KEEP |
| sim.status.call_from_salta_to_request | You can ask Vélez for officials at the line once you reach Salta. | Reason on the welcome call at step 2 before Salta (sim.js:219) |  |  | KEEP |
| sim.status.arrange_the_next_stage_charter | Your sibling sets up the jet in steps: charter, crew, fuel, then ready at Portalba. | Preview text for the jet call (sim.js:217) |  |  | KEEP |
| sim.why.not_answering | Your sibling is not picking up. | Aircraft call when your sibling talked (sim.js:216); never happens (see is_not_answering) |  |  | KEEP |
| sim.why.name_a_destination_or_engage | Confirm the destination on the phone, or get {sponsor} to agree to help, first. | Aircraft call at step 1 with no city and no sponsor (sim.js:216). The city message is gone once answered (sim.js:449), so confirming on the phone is impossible; the sponsor agreeing sets the city (sim.js:502) | Tells the player to do something the game no longer offers | The crew needs a city, which you get once {sponsor} agrees to help with your visa. | REWRITE |
| sim.preview.next_reply_in_hours_needs | {name} works on the next step, {stage}, and answers in {k} hours. It comes through on a roll of {turned} or higher. | {turned} is now the d20 target with the trust and talked adjustments (sim.js:214), matching the job roll (sim.js:497-498), except that it is capped at 20 while a talked ally's real target is 21, which cannot be won. {k} is the base job length (6, 6 or 10) passed as a figure; the reply is due k hours after the call ends, plus 6 for Rāo and 2 after "Let the story run" (sim.js:439) | Every clock says whose it is: "answers in {k} hours" does not say from when; AP numbers ({k} prints "6", which the text cannot fix) | {name} works on the next step, {stage}, and answers {k} hours after the call. It comes through on a roll of {turned} or higher. | REWRITE |
| sim.label.call_about | Call {name} about {what} | Call name; shown in the briefing as "The call that helps most now is Call Duartē about the jet." with a capital mid-sentence (ui.js:408) and in blocked call labels (ui.js:199) |  |  | KEEP |
| sim.why.resolves_at | You hear back at {time} | Reason on a pending call; {time} is clockText, e.g. "Sunday 4 a.m." (sim.js:211) | "hear back at Sunday 4 a.m." is not English; missing period | You hear back {time}. | REWRITE |
| sim.status.is_on_it | {name} is working on it | Pending call name; shown as "Jet: Duartē is working on it" (sim.js:211; ui.js:199) |  |  | KEEP |
| sim.preview.takes_hour | Takes {hours} hour{s} | Built into every move preview (sim.js:199) and filtered out before display (ui.js:162); the duration shows through action.takes |  |  | KEEP |
| sim.preview.die_needs_or_more_in | Roll {need} or higher on the 20-sided die to succeed, a {pct}% chance.{bonus} | Expanded move box (ui.js:162) and government orders (gov.js:125). The same box already shows action.chance, "Roll {need} or higher ({odds} chance)", in its meta line (ui.js:145-146), so the chance is printed twice |  |  | KEEP |
| sim.preview.cannot_succeed_with_your_current | This cannot succeed. | Shown when the target is above 20 (sim.js:199), e.g. "Pay the yardmaster"; a true statement of the rule |  |  | KEEP |
| sim.why.talked_to_the_inquiry | {name} talked to Sosā | Move with an ally who talked (sim.js:185) | Missing end punctuation | {name} talked to Sosā. | REWRITE |
| sim.why.you_cut_off | You cut {name} off | Move with an ally you cut (sim.js:184) | Missing end punctuation | You cut {name} off. | REWRITE |
| sim.why.needs_a_card | You need a card that gives you {card}. | No card of that kind held (sim.js:172); {card} is the lowercased kind ("political pull", "a boat") |  |  | KEEP |
| sim.why.your_card_is_not_recognized | The card you hold for {card} does not work here. | Card held but out of its reach (sim.js:172) |  |  | KEEP |
| sim.effect.aircraft_preparations_stay_on_hold | Nothing changes, and the jet stays where it is in its preparations. | Nothing (sim.js:461) | Awkward phrasing ("stays where it is in its preparations"); the jet's progress is called a step elsewhere | Nothing changes, and the jet stays at its current step. | REWRITE |
| sim.opt.ignore_it | Ignore it | Pilot message: nothing (sim.js:461) |  |  | KEEP |
| sim.effect.requires_v_lez_s_card | Vélez calls the operator, and the jet is ready at Portalba with nobody watching. | Jet to step 4 (sim.js:460) |  |  | KEEP |
| sim.opt.have_v_lez_call_the | Have Vélez call the operator | Needs Vélez's card counting here; jet to step 4 (sim.js:460) |  |  | KEEP |
| sim.effect.restores_the_aircraft_to_ready | The jet is ready at Portalba. Paying the crew on the apron gets you noticed, and your police attention rises by one. | Jet to step 4, police attention +1 (sim.js:459) |  |  | KEEP |
| sim.opt.pay_the_crew_bonus | Pay the crew a bonus | 1 h; jet set straight to step 4 from any step, police attention +1 (sim.js:459) |  |  | KEEP |
| sim.line.your_ministry_threatened_the_operator | "Valdória's ministry threatened the operator's license, so he has pulled the crew. He will fly if Costamar backs him, or if the crew gets a bonus." | Portalba arrival after the license warning (sim.js:149), sent even if the jet never lost a step; logged |  |  | KEEP |
| sim.effect.nothing_changes | Nothing changes. | Shared by the radio hang-up and the Sosā hang-up (sim.js:107, 146) |  |  | KEEP |
| sim.opt.hang_up | Hang up | Radio (sim.js:107) and Sosā (sim.js:146): nothing |  |  | KEEP |
| sim.effect.an_hour_on_the_phone | You keep Sosā on the line for an hour, and he skips his next action. | Next automatic action at hour+5 instead of on schedule (sim.js:472, 488): one fewer action over the following hours |  |  | KEEP |
| sim.opt.keep_him_talking | Keep him talking | 1 h; lastEnemy = hour+2 (sim.js:472) |  |  | KEEP |
| sim.line.inspector_sosa_come_back_for | "Inspector Sosā. Come back for the hearing and this ends quietly. Stay, and your brother's name goes on the warrant too." | Portalba arrival (sim.js:144). Matēu's sibling is his sister Līviā (data.js:20); the call site passes no arguments | Makes no sense for Matēu: "your brother" | "Inspector Sosā. Come back for the hearing and this ends quietly. Stay, and your family goes on the warrant too." | REWRITE |
| sim.effect.v_lez_withdraws_her_officials | Vélez pulls her officials from the border post, and your welcome in Costamar drops back to "Costamar expects you." You keep her card. | Welcome drops to step 1 if at 2+, reception jobs canceled; her card kept (sim.js:471) |  |  | KEEP |
| sim.opt.refuse | Refuse | Sponsor demand (sim.js:116) and Vélez (sim.js:140) |  |  | KEEP |
| sim.effect.reception_stands_the_party_at | Vélez's arrangements stay as they are. | flags.guest only (sim.js:470) |  |  | KEEP |
| sim.opt.say_it | Say it | flags.guest, read nowhere (sim.js:470) |  |  | KEEP |
| sim.line.before_my_people_meet_you | "Before my people meet you at the post, you will say, on the record, that Costamar receives you as a guest and not as a government. Agreed?" | Line arrival with a Vélez promise (sim.js:137); the contrast states her actual terms (data.js:37) |  |  | KEEP |
| sim.opt.put_him_off | Put him off | Gianlūka talks (sim.js:458) |  |  | KEEP |
| sim.effect.keep_gianluka_s_support_and | Gianlūka stays with you, you get "A friend in the inquiry" if you lack it, and Sosā's search moves to Pedra Branca. | Trust 3, gain "A friend in the inquiry" unless held or used, search to Pedra Branca (sim.js:457); the triad is three real effects |  |  | KEEP |
| sim.opt.send_the_statement | Send the statement | 1 h; promise kept (sim.js:457) |  |  | KEEP |
| sim.line.the_party_meets_tonight_send | "The party meets tonight, and you gave your word. Send your endorsement before midnight." | Salta arrival with an open promise (sim.js:132); no deadline exists and the message waits | Invents a deadline ("before midnight") | "The party meets tonight, and you gave your word. Send your endorsement." | REWRITE |
| sim.opt.send_nando_past_the_gate | Send Nando past the gate first | Needs the decoy card (sim.js:233, 469) |  |  | KEEP |
| sim.effect.nothing_changes_you_know_the | Nothing changes, and the men stay at the gate. | Nothing (sim.js:468) |  |  | KEEP |
| sim.opt.midnight_it_is | Midnight it is | Nothing (sim.js:468) | Interface: a button is a specific verb phrase | Keep the midnight plan | REWRITE |
| sim.line.two_men_in_a_car | "Two men in a car at the yard gate, asking about a woman. Or a man. Midnight or never." | Salta arrival (sim.js:127); the men have no mechanic | Makes no sense: "a woman. Or a man." reads as a hedge written for both characters | "Two men in a car at the yard gate are asking about you. Midnight or never." | REWRITE |
| sim.effect.nothing_moves_until_you_call | Nothing moves until you call about your welcome in Costamar again. | Nothing; at step 1 the welcome call goes to your sibling (sim.js:218, 456) |  |  | KEEP |
| sim.opt.wait | Wait | Vélez message: nothing (sim.js:456) |  |  | KEEP |
| sim.opt.ask_salek_to_reach_the | Ask {sponsor} to call her uncle | Needs the sponsor card held and the sponsor loyal (sim.js:231, 234) |  |  | KEEP |
| sim.effect.try_again_in_six_hours | {sib} tries again in six hours. It takes a roll. | Reception job for your sibling, due exactly six hours later, rolled on reliability (sim.js:454, 497) | Humanizer clipped beat ("It takes a roll."); the outcome clock is clearer said once | {sib} tries Vélez again, and you hear in six hours whether it worked. | REWRITE |
| sim.line.v_lez_is_not_answering | "Vélez is not picking up. I can keep trying, or {sponsor} could reach her uncle, who banks with him." | Nova Trentô arrival at welcome step 1 (sim.js:120); "who banks with him" fits Salek only | Makes no sense for Rāo and Vosk | "Vélez is not picking up. I can keep trying, or {sponsor} could reach her uncle." | REWRITE |
| sim.effect.lose_salek_and_his_line | {sponsor} hangs up for good, and you lose your sponsor's line to the ministry. No visa will come, but you can still fly without one. | Sponsor marked as talked, sponsor's line lost, visa jobs canceled (sim.js:467) |  |  | KEEP |
| sim.effect.permission_stalls_twelve_hours_he | {sponsor} keeps helping, but a visa request already with {sponsor} takes 12 hours longer. | Only a pending visa job moves 12 hours later (sim.js:466) |  |  | KEEP |
| sim.opt.ask_for_a_week | Ask for a week | Pending visa jobs 12 hours later (sim.js:466) |  |  | KEEP |
| sim.effect.sends_them_to_the_house | Sosā's search goes back to the residence, your police attention stays the same, and nothing comes back on you later. | Search to the residence only (sim.js:463) |  |  | KEEP |
| sim.opt.deny_it_you_are_at | Say you are at home | Search to the residence (sim.js:463) |  |  | KEEP |
| sim.effect.the_inquiry_believes_the_coast | Sosā's search goes back to the residence, and your police attention drops by one. If one of your people later talks to Sosā, the lie adds one more point. | Search to the residence, attention -1, flags.lied (+1 on a later confession, sim.js:519) |  |  | KEEP |
| sim.opt.confirm_it_from_the_yacht | Confirm it, from the yacht | Search to the residence, flags.lied, police attention -1 (sim.js:462) |  |  | KEEP |
| sim.line.radi_port_venla_we_hear | "Rādiô Portô Venla here. We hear you are on a yacht off the coast. Can you confirm that?" | Pedra Branca arrival (sim.js:104) |  |  | KEEP |
| sim.opt.let_decide | Let {place} pick | Roll for the sibling; charter booked either way (sim.js:453) |  |  | KEEP |
| sim.effect.crew_booking_waits_until_salek | The charter jet is booked, and the crew waits until {sponsor} agrees to help with your visa. | Jet step 1; jet calls blocked until visa step 1 (sim.js:216) |  |  | KEEP |
| sim.opt.wait_until_salek_answers | Wait for {sponsor} | Jet step 1, no city (sim.js:452) |  |  | KEEP |
| sim.line.jet_found_in_susana_the | "I found a jet. It will be at Portalba, but the crew will not book the flight until I give them a city. Do I tell them, or do we wait for the visa to come through?" | First message (sim.js:97). "Wait" waits for your sponsor to agree (visa step 1), not for the visa itself (sim.js:216, 502) | Names the wrong thing to wait for | "I found a jet. It will be at Portalba, but the crew will not book the flight until I give them a city. Do I tell them, or do we wait until your sponsor agrees to help?" | REWRITE |
| sim.day.wednesday | Wednesday | clockText (sim.js:72); unreachable, the run ends Tuesday 2 p.m. |  |  | KEEP |
| sim.day.tuesday | Tuesday | clockText (sim.js:72) |  |  | KEEP |
| sim.day.monday | Monday | clockText (sim.js:72) |  |  | KEEP |
| sim.day.sunday | Sunday | clockText (sim.js:72) |  |  | KEEP |
| sim.day.saturday | Saturday | clockText (sim.js:72) |  |  | KEEP |
| sim.end.lets_the_jet_land | {name} lets the jet land and asks questions for a week. | Never rendered: built into s.over.reason by epilogue (sim.js:537-552) or the clock loss (sim.js:490); renderOver shows only over.why_* (ui.js:270-279) |  |  | KEEP |
| sim.line.i_told_them_city_do | "I told them {city}. Do not make me a liar." | Pick succeeded (sim.js:453) |  |  | KEEP |
| sim.line.city_i_will_tell_the | "{city}. I will tell the operator." | City confirmed (sim.js:451) |  |  | KEEP |
| sim.status.ask_salek_to_seek_visa | {sponsor} asks the ministry for your visa, and {sponsor} will want something back. | Preview text for the visa call (sim.js:222) | Repeats {sponsor} in one sentence | {sponsor} asks the ministry for your visa and will want something back. | REWRITE |
| sim.effect.crew_booking_can_proceed | The charter jet is booked. Your next call about the jet can hire a crew for {city}, and the visa is a separate request. | Jet step 1 and city set (sim.js:451) |  |  | KEEP |
| sim.effect.needs_roll_to_confirm | {place} picks the city for you on a roll of {need} or higher. On a miss, you cannot call about the jet for six hours. | {need} is now the d20 target, tgt(reliability 3) = 8 (sim.js:100), the same target the roll uses (sim.js:453). A miss sets a six-hour stall on jet calls (sim.js:453, 496); the charter is booked either way |  |  | KEEP |
| sim.opt.confirm_destination | Confirm {city} | Jet step 1, city set (sim.js:451) |  |  | KEEP |
| sim.line.they_are_still_considering | "The ministry says they are still considering. These things take time, they tell me." | Visa job succeeds but the country never accepts; hidden by design (sim.js:501; data.js:231) |  |  | KEEP |
| sim.ledger.promised | Promised to reach "{what}" by {due}. | Ledger line under the ally on the route (sim.js:440; ui.js:233) |  |  | KEEP |
| sim.ledger.delivered | Delivered {what}. | Job delivered (sim.js:502); {what} is a lowercase stage label, giving "Delivered crew hired." | Does not match the quoted stage in sim.ledger.promised and sim.ledger.nothing_yet; reads as broken English | Delivered "{what}." | REWRITE |
| sim.ledger.nothing_yet | Did not deliver "{what}." | Job failed and removed (sim.js:503) |  |  | KEEP |
| sim.ledger.still_considering | The ministry is still thinking it over. | Visa job for a country that never accepts (sim.js:501) |  |  | KEEP |
| sim.ledger.post_was_bought | The sergeant at the {post} is paid off, and you lose 12 hours finding out. | Bought post: the move's hours plus 12, search on you, police attention +2 (sim.js:388-390) |  |  | KEEP |
| sim.effect.requires_sponsor_help | {sponsor} reaches her uncle, and Vélez's minister hears about you. You get Vélez's card and spend your sponsor's line to the ministry. | Welcome to step 2, gain Vélez's card, lose your sponsor's line (sim.js:455, 424) |  |  | KEEP |
| sim.time.noon | noon | clockText (sim.js:73) |  |  | KEEP |
| sim.time.midnight | midnight | clockText (sim.js:73) |  |  | KEEP |
| sim.num.words | zero\|one\|two\|three\|four\|five\|six\|seven\|eight\|nine | num(): AP words below 10 (sim.js:79) |  |  | KEEP |
| sim.effect.decoy_at_the_yard | You spend your two spare cars. The men follow Nando's sedan north, Sosā's search moves to Pedra Branca, and your police attention drops by two. | Lose the decoy card, police attention -2, search to Pedra Branca (sim.js:469) |  |  | KEEP |
| sim.effect.break_word | You lose every card Gianlūka gave you. He tells Sosā where you are, and your police attention rises by two. | Gianlūka's cards go, search on you, police attention +2 (sim.js:458) |  |  | KEEP |
| sim.why.needs_step | First you need this step: {step}. | Move needs an arrangement step (sim.js:174); {step} is a stage label ("charter jet booked", "Costamar expects you") | Label-and-value shape ("this step: X"); a stage label after a colon does not read as English | This move opens once you reach "{step}." | REWRITE |
| sim.line.nando_decoy_success | "They followed the decoy. The service lane is clear. Go now." | Featured line on a decoy convoy success; you reach Pedra Branca (sim.js:401, 396) |  |  | KEEP |
| sim.line.nona_truck_released | "They released the truck. My cousin can take you to Salta. I won't talk about your visit." | help_host success: truck card, Nonā Rosa trust +1, and the move takes you to Salta (EXITS, sim.js:19, 396) |  |  | KEEP |
| sim.line.nona_truck_late | "It came back at dawn, late and dented. My cousin can still drive you to Salta." | help_host failure: you get the truck card and 1 extra hour but stay (sim.js:403, 395). The road to Salta needs "Costamar expects you" (data.js:144) | Invents a time ("at dawn"); "can still drive you" leaves out the condition the move needs | "It came back late and dented. My cousin can still drive you to Salta once Costamar expects you." | REWRITE |
| sim.preview.no_roll | There is no roll for this. | The three unrolled moves (sim.js:199) |  |  | KEEP |
| sim.why.already_done | You have already done this. | "Call your contacts" is marked once (data.js:138; sim.js:181) | Blocked actions say what is missing: the once-per-run rule is not stated | You can make this move once per run, and you already have. | REWRITE |
| sim.why.nothing_left_to_move | Everything these calls could move is already done. | Call your contacts when every arrangement it moves is complete (sim.js:182) |  |  | KEEP |
| sim.say.calls_moved_some | Three hours later, these arrangements have moved one step: {list}. The others were already done. | Call your contacts when some arrangements were already complete (sim.js:407). {list} joins ARRANGEMENTS names, which are capitalized ("Jet, Entry visa") |  |  | KEEP |
## Design inconsistencies

- The DESTS demand effects still print a six-sided number ("comes through on a 3 or better", data.js:237, 244, 251) while the visa roll uses the d20 target. The two catalog previews in my scope now pass d20 targets (sim.js:100, 214; changed while this review ran), but the preview caps a talked ally's target at 20 while the real target is 21, which cannot be won (sim.js:214, 498).
- The reply time in `sim.preview.next_reply_in_hours_needs` is the base job length (6, 6, 10) printed as a figure. Rāo's visa takes 16 hours (slow 6, data.js:243) and every reply takes 2 more after "Let the story run" (sim.js:439). "Ten hours" in `sim.line.ten_hours_and_you_understand` is wrong for Rāo in the same way.
- Results never report most changes. `summarize` (ui.js:547-577) has no case for trust, belief, mod, deadline, skipEnemy, doubt or flags. "Accept the blessing" reports only the police attention rise; "Join the queue", "Keep going" (hearing), "Trust him anyway" and "Pay double" report nothing beyond "Done". Escape roll chips also hide every win effect (sim.js:281), so a won "Appeal to old loyalty" or "Take the seat in a hat" is explained only by its `say` line, and choices without one explain nothing.
- Event roll chips show "Roll N or higher" with no percentage (markers roll.need), while moves show "Roll N or higher (P% chance)" (ui.json action.chance).
- The expanded move box prints the chance twice: action.chance in its meta line (ui.js:145-146) and `sim.preview.die_needs_or_more_in` in its list (ui.js:162). Government orders do the same (gov.js:125).
- Labels that promise travel or boarding the code does not give: "Leave the car, take the river" (mod -1 only, data.js:377), "Slip out now" (1 h on a win, data.js:401), "Ride with the strikebreakers" (nothing on a win, data.js:406), "Move while they are blind" (police attention -1 and Sosā skips an action, no travel and no time, data.js:462). "Move" is also the player's term for a move.
- "Go to Theo instead" cuts Holt off and does nothing with Theo (data.js:413; sim.js:339).
- Event text states rules the game does not have: the Salta strike says no freight moves (boarding is never blocked, data.js:403); the blizzard title and text say the pass and post are shut (every crossing still works, data.js:424).
- The yardmaster contradicts himself. The Salta objective says he will sell you to Sosā and "Pay the yardmaster" cannot succeed (data.js:149, 164), while the yard_debt event has him owe your family and walk you to the train. Its win gives Theo's card, "Theo walks you through" (data.js:415, 77), and moves nothing.
- "Risk the short route" is a certain +1 on departure moves, not a chance (data.js:440).
- "Let it stand" at Portalba sets flags.asked (takeoff harder until welcome step 2, a police stop possible in Costamar), but no chip shows it (sim.js:278-300). The Portalba arrival text says "Sosā has asked them to hold you" before anyone has asked (data.js:191), outside my scope.
- `sim.inquiry.they_find_you` prints in Costamar before Valdória has asked Costamar, but climbHold returns and no stop happens (sim.js:271, 515).
- The government side logs the escape-side inquiry suffixes addressed to the candidate: "They find you", "Nobody there has seen you", "{first} tells them where you are and stops helping you" (gov.js:198, 282 call Sim.enemyAct; ui.js:611 logs the text).
- A pressed ally who talks "stops helping you": moves with them are blocked (sim.js:185), but their cards stay in your hand and keep counting (sim.js:519 removes nothing).
- `sim.why.name_a_destination_or_engage` tells the player to confirm the destination on the phone, but that message is removed once answered (sim.js:449). Only the sponsor agreeing sets the city (sim.js:502).
- `sim.line.the_crew_will_not_confirm` looks unreachable: the jet call that would lead to it is blocked in the same state (sim.js:216, 500), and neither condition can be undone.
- `sim.why.is_not_answering` and `sim.why.not_answering` can never show: your sibling is not a suspect and is never pressed (sim.js:24, 519). `sim.why.salek_is_not_taking_your` never shows because the missing-card reason is checked first (sim.js:231, 234).
- Blocked reasons are joined with a space (sim.js:197), and five P04 strings had no end punctuation, so two reasons ran together ("Deal with the news first You cut Nando off").
- `sim.label.call_about` is capitalized as a button and dropped mid-sentence into the briefing: "The call that helps most now is Call Duartē about the jet." (ui.js:408).
- `sim.say.calls_moved_some` lists ARRANGEMENTS names, which are capitalized, mid-sentence ("moved one step: Jet, Entry visa").
- The monday-noon line repeats in every round briefing after the deadline (ui.js:403). The canceled passport has no other effect, because no move has the id own_passport (sim.js:195).
- `sim.preview.takes_hour` and `sim.label.lie_low_one_hour` are built and never displayed (ui.js:162; sim.js:238).
- The dog choices change your sibling's trust, while the story is about your youngest or daughter (data.js:364, 429).
- "Trust him anyway" and "Trust {first}" set doubt, which the rumor already set; they only change a status mark (sim.js:257, 338; ui.js:232).
- Story lines name places the search never goes: the beach photo "posts you on the coast" and the interview "puts you on the coast road", while the search moves to Pedra Branca or the residence (sim.js:333).
- Vélez says "My people will be at the post" even when your welcome is below step 3 (sim.js:470). Sosā's "I will call again" never happens. The pilot's crew-pulled message arrives whenever the license warning happened, even if the jet never lost a step (sim.js:149, 518).
- After climbing out of house arrest the ladder sits at step 2, so the next stop goes straight back to house arrest (data.js:477; sim.js:269, 346). The win line does not say so.
- The keep_calling label is a template literal in sim.js:121, and `fill` hard-codes "the residence" and "the line" (sim.js:241); both are player text outside the catalog (rule C12).
- No place name in this scope reads as a person.

Count: rewrites 56, keeps 289 (15 of them never rendered), flags 10, unknowns 0.
