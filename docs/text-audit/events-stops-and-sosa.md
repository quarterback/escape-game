# B: events, holds, rumors, inquiry actions, phone lines, endings, markers

Scope: src/data.js EVENTS, HOLDS, RUMORS, ENEMY_ACTIONS; content/coalition/ui.json ids sim.opt., sim.effect., sim.line., sim.say., sim.inquiry., sim.ledger., sim.end., sim.day., sim.time., render.; content/coalition/markers.json (all 41).

How these strings reach the player (traced once, referenced below):
- News card: sim.js:242 drawEvent picks one event on arrival and every 6 hours at a stop (40% chance of a rumor instead when an unrevealed ally is at the stop). sim.js:294 eventView builds title, text, labels and marker chips (fxTags, sim.js:270). ui.js:481 newsCard shows kind label, title, text, and each choice as a button with its chips, or the blocked reason. After a choice, ui.js:507 summarize shows the first narrator line (fx.say) and the chips again as a result card.
- Escape-side roll chips show only the target and the failure list (sim.js:273 returns before listing what a win gives). Government chips list both (gov.js:226).
- The roll.fail and roll.win lists lowercase every chip (sim.js:273, gov.js:226), so names inside them print lowercase ("sosā", "duartē").
- Phone messages: sim.js:86 arrive pushes messages; ui.js:159 thread shows label, hours, and the effect line under it only when the option is available (otherwise the reason).
- Inquiry actions: sim.js:488 enemyTurn returns the text; ui.js:567 logs it and the end-of-round card (ui.js:496) lists it as a row.
- Endings: s.over.reason (end reasons, epilogue, every sim.end.* string, landing text) is built in sim.js but never rendered. ui.js:271 renderOver shows only "You win/You lose" and one over.why_* line (owner decision recorded in docs/aar-round-briefing-and-results.md, "The epilogue paragraph on the escape side no longer shows").
- "Exposure" is written as "police attention" in Proposed text, per the brief. The glossary (content/coalition/glossary.json) currently approves only "exposure", so adopting the term needs a glossary change.

## 1. Strings

### EVENTS (src/data.js:354 to 461)

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| EVENTS.selfie.title | A photo from the kitchen | Card heading, residence only (data.js:356) | Fine | | KEEP |
| EVENTS.selfie.text | The cook's nephew posted a photo. You are in the window behind him. | Narrative setup | Fine | | KEEP |
| EVENTS.selfie.buy_phone.label | Buy the nephew's phone | 1 h, exposure -1 (data.js:357; sim.js:324) | Fine | | KEEP |
| EVENTS.selfie.buy_phone.say | Nando pays twice what the phone is worth. | Result line | Fine | | KEEP |
| EVENTS.selfie.beach.label | Post an old beach photo | Needs an influence card that counts here (Gianlūka's). belief 'away' moves the search to stop 1, Santa Laura, when you are at the residence (sim.js:325); exposure -1; sets flags.lied, which makes a later ally confession cost 3 instead of 2 (sim.js:502). No chip shows the lie cost | Know the search moves and that the lie can cost later | | KEEP |
| EVENTS.selfie.beach.say | Gianlūka's people post you on the coast. | Search moves to Santa Laura, the next stop on your route, not a coast | Fine as a story claim; mismatch logged below | | KEEP |
| EVENTS.selfie.let_it.label | Let it stand | Exposure +2 | Fine | | KEEP |
| EVENTS.dog.title | The dog will not stay | Heading | Fine | | KEEP |
| EVENTS.dog.text | Your youngest will not leave without the dog. The dog barks at strangers. | Setup | Fine | | KEEP |
| EVENTS.dog.bring_dog.label | Bring the dog | flags.dog (unlocks dog_bark at the line), sibling trust +1 (data.js:361; sim.js:329). Chip reads "{sibling} trusts you more" | Fine | | KEEP |
| EVENTS.dog.bring_dog.say | The dog sleeps across your feet. | Result line | Fine | | KEEP |
| EVENTS.dog.leave_dog.label | Leave him with the cook | 1 h | Fine | | KEEP |
| EVENTS.dog.leave_dog.say | An hour of crying in the back seat. | Result line | Fine | | KEEP |
| EVENTS.summons.title | A court officer at the gate | Heading | Fine | | KEEP |
| EVENTS.summons.text | He has a summons and orders to hand it to you in person. | Setup | Fine | | KEEP |
| EVENTS.summons.accept.label | Take the summons | deadline -12: Monday noon cutoff moves 12 hours earlier (sim.js:335); at the cutoff your passport is cancelled, the travel ban goes on and the first stop starts at the station (sim.js:466, 261) | Fine | | KEEP |
| EVENTS.summons.accept.say | The court now has your signature. The deadline moves up 12 hours. | Same | Name which deadline | The court now has your signature, and your passport deadline moves up 12 hours. | REWRITE |
| EVENTS.summons.lawyer.label | Send Gianlūka's lawyer | Needs influence card here; 2 h; Gianlūka trust -1 | Fine | | KEEP |
| EVENTS.summons.lawyer.say | The lawyer argues at the gate for two hours. | Result line | Fine | | KEEP |
| EVENTS.summons.ignore.label | Keep the gate shut | Exposure +1 | Fine | | KEEP |
| EVENTS.cameras.title | Gianlūka wants cameras | Heading | Fine | | KEEP |
| EVENTS.cameras.text | He wants you on the steps tonight, calling the election stolen. | Setup | Fine | | KEEP |
| EVENTS.cameras.speak.label | Speak on the steps | Exposure +3, Gianlūka trust +1, gain "A report held one day" | Fine | | KEEP |
| EVENTS.cameras.speak.say | The party loves it. So does Sosā. | Result line | Fine (narration) | | KEEP |
| EVENTS.cameras.refuse.label | Refuse | Gianlūka trust -1 | Fine | | KEEP |
| EVENTS.cameras.refuse.say | Gianlūka goes quiet on the phone. | Result line; no mechanic beyond trust | Fine | | KEEP |
| EVENTS.fuel.title | Fuel is rationed | Santa Laura only | Fine | | KEEP |
| EVENTS.fuel.text | Every pump in Santa Laura has a line and a police officer. | Setup | Fine | | KEEP |
| EVENTS.fuel.queue.label | Wait in line | 2 h, exposure +1 | Fine | | KEEP |
| EVENTS.fuel.farmer.label | Buy from a farmer | Roll 3+; win 1 h; fail 2 h and exposure +2 | Fine | | KEEP |
| EVENTS.fuel.farmer.win.say | Twenty liters from a tractor shed. | Result line | AP: figures from 10 | 20 liters from a tractor shed. | REWRITE |
| EVENTS.fuel.farmer.lose.say | The farmer calls his nephew, who calls the radio. | Result line | Fine | | KEEP |
| EVENTS.fuel.river.label | Leave the car, take the river | Needs a boat card here. Only effect: mod -1, moves at Santa Laura need one less (sim.js:337, 185). You do not travel | Know it makes moves here easier, not that it moves you | | KEEP (inconsistency logged) |
| EVENTS.fuel.river.say | The river has no pumps and no police. | Result line | Fine | | KEEP |
| EVENTS.hitchhiker.title | A hitchhiker knows your face | Heading | Fine | | KEEP |
| EVENTS.hitchhiker.text | A young reporter flags you down. She recognizes you before the door closes. | Setup | Fine | | KEEP |
| EVENTS.hitchhiker.interview.label | Give her the interview | Exposure +2; search moves back to the residence (sim.js:325) | Fine | | KEEP |
| EVENTS.hitchhiker.interview.say | Her story puts you on the coast road. | Search goes to the residence, not a coast road | Story claim; mismatch logged | | KEEP |
| EVENTS.hitchhiker.silence.label | Buy her silence | Roll 4+; fail exposure +3 | Fine | | KEEP |
| EVENTS.hitchhiker.silence.win.say | She keeps the money and the story. | Result line | Fine | | KEEP |
| EVENTS.hitchhiker.silence.lose.say | She takes the money and files anyway. | Result line | Fine | | KEEP |
| EVENTS.hitchhiker.drop.label | Drop her at the next town | 1 h | Fine | | KEEP |
| EVENTS.flood.title | Flash flood at the bridge | Heading | Fine | | KEEP |
| EVENTS.flood.text | The river is over the road. Trucks are turning back. | Setup | Fine | | KEEP |
| EVENTS.flood.wait_water.label | Wait for the water | 4 h | Fine | | KEEP |
| EVENTS.flood.ford.label | Drive through it | Roll 4+; win exposure -1; fail 2 h, exposure +1, lose a random card other than the second passport (sim.js:328) | Fine | | KEEP |
| EVENTS.flood.ford.win.say | Water to the doors, then dry road. | Result line | Fine | | KEEP |
| EVENTS.flood.ford.lose.say | The engine floods. You leave something in the car. | Card loss | Fine | | KEEP |
| EVENTS.flood.ferry.label | Pay a smuggler's ferry | 1 h, exposure +1 | Fine | | KEEP |
| EVENTS.flood.ferry.say | The ferryman knows who you are and says nothing. For now. | No later consequence exists; "For now" promises one | Do not imply a follow-up | The ferryman knows who you are and says nothing. | REWRITE |
| EVENTS.decoy_ditch.title | A decoy on the evening news | Only when "Two more cars like yours" is in hand (data.js:383; sim.js:237) | Fine | | KEEP |
| EVENTS.decoy_ditch.text | One of your spare sedans rolled into a ditch on camera. The plates are yours. | Setup | Fine | | KEEP |
| EVENTS.decoy_ditch.claim.label | Say it was you | Search moves back to the residence, exposure -2, lose the decoy card | Fine | | KEEP |
| EVENTS.decoy_ditch.claim.say | For one evening you are in a ditch two hundred kilometers away. | Result line | AP: figures from 10 | For one evening you are in a ditch 200 kilometers away. | REWRITE |
| EVENTS.decoy_ditch.quiet.label | Say nothing | Exposure +1 | Fine | | KEEP |
| EVENTS.bishop.title | The bishop offers a blessing | Nova Trentô | Fine | | KEEP |
| EVENTS.bishop.text | A public blessing at evening mass. The whole colônia would see you. | Setup | Fine | | KEEP |
| EVENTS.bishop.blessing.label | Accept the blessing | Exposure +2, Nonā Rosa trust +1 | Fine | | KEEP |
| EVENTS.bishop.decline.label | Decline | Nonā Rosa trust -1 | Fine | | KEEP |
| EVENTS.wedding.title | A wedding for three hundred | Heading | AP: figures from 10 | A wedding for 300 | REWRITE |
| EVENTS.wedding.text | A cousin's wedding fills every street tonight. Nobody counts faces at a wedding. | Setup | Fine | | KEEP |
| EVENTS.wedding.dance.label | Hide among the guests | 3 h, exposure -3 | Fine | | KEEP |
| EVENTS.wedding.dance.say | You dance with a great aunt who never asks your name. | Result line | Fine | | KEEP |
| EVENTS.wedding.skip.label | Stay inside | Nothing | Fine | | KEEP |
| EVENTS.grandson.title | The grandson wants out | Heading | Fine | | KEEP |
| EVENTS.grandson.text | Nonā Rosa's grandson is 19, knows the rail yard and wants to come. | Setup | Fine | | KEEP |
| EVENTS.grandson.take.label | Take him with you | Gain "Nonā Rosa's grandson" (passage card, counts at Salta, spent on leaving Salta, sim.js:413) | Fine | | KEEP |
| EVENTS.grandson.no.label | Say no | Nonā Rosa trust -1 | Fine | | KEEP |
| EVENTS.raid.title | Police raid the next farm | Heading | Fine | | KEEP |
| EVENTS.raid.text | Federal police are searching the neighbor for contraband. Not for you. Yet. | Setup | Fine | | KEEP |
| EVENTS.raid.cellar.label | Hide in the wine cellar | 4 h | Fine | | KEEP |
| EVENTS.raid.slip.label | Slip out now | Roll 3+; win 1 h; fail climbs the police stop ladder (sim.js:340, 259). You do not leave the stop | Fine as wording; mismatch logged | | KEEP |
| EVENTS.strike.title | Rail strike tonight | Salta | Fine | | KEEP |
| EVENTS.strike.text | The union stopped the yard. No freight moves unless someone breaks the strike. | Nothing blocks "Board the midnight freight" (data.js:149; sim.js:171). The strike has no mechanical effect | The text states a rule the game does not have | | KEEP (inconsistency logged) |
| EVENTS.strike.wait_strike.label | Wait it out | 8 h | Fine | | KEEP |
| EVENTS.strike.union.label | Pay the union boss | Exposure +2 | Fine | | KEEP |
| EVENTS.strike.union.say | The strike ends for one train. | Result line | Fine | | KEEP |
| EVENTS.strike.scabs.label | Ride with the strikebreakers | Roll 4+; win nothing; fail police stop. You do not board or move | Mismatch logged | | KEEP |
| EVENTS.strike.scabs.win.say | Nobody looks at a scab twice. | Result line | Fine | | KEEP |
| EVENTS.tourbus.title | A tour bus to the waterfalls | Heading | Fine | | KEEP |
| EVENTS.tourbus.text | A bus of tourists leaves for the falls at the border at dawn. One seat is empty. | Setup | Fine | | KEEP |
| EVENTS.tourbus.bus.label | Take the seat in a hat | Roll 4+; win moves the search back to Nova Trentô and takes you to the line (sim.js:325, 341); fail police stop. The chip shows only "Roll 4+" and the fail, never that a win moves you | The win (reach the line) is hidden on the escape side | | KEEP (inconsistency logged) |
| EVENTS.tourbus.bus.win.say | You sleep through the checkpoint. The guide counts you twice. | Result line | Fine | | KEEP |
| EVENTS.tourbus.pass.label | Let it go | Nothing | Fine | | KEEP |
| EVENTS.holt_drunk.title | Holt has been drinking | Heading | Fine | | KEEP |
| EVENTS.holt_drunk.text | He is loud at the bar about a passenger worth a lot of money. | Setup | Fine | | KEEP |
| EVENTS.holt_drunk.trust_holt.label | Trust him anyway | Sets Holt "doubted" (sim.js:330), which only changes his status chip (ui.js:233). No other effect | Fine | | KEEP |
| EVENTS.holt_drunk.sober.label | Sober him up | 2 h, Holt trust +1 | Fine | | KEEP |
| EVENTS.holt_drunk.cut_holt.label | Go to Theo instead | Cuts Holt off: his cards go, moves with him are blocked (sim.js:331, 176). Nothing happens with Theo | Mismatch logged | | KEEP |
| EVENTS.yard_debt.title | The yardmaster owes your family | Heading | Fine | | KEEP |
| EVENTS.yard_debt.text | His wife's father once worked for your father. He might remember. | Setup | Fine | | KEEP |
| EVENTS.yard_debt.favor.label | Ask the favor | Roll 3+; win gain "Theo walks you through"; fail exposure +2 | Fine | | KEEP |
| EVENTS.yard_debt.favor.win.say | He remembers. He walks you to the train himself. | The card gained is Theo's, from Theo (data.js:74) | Mismatch logged | | KEEP |
| EVENTS.yard_debt.favor.lose.say | He remembers differently. | Result line | Fine | | KEEP |
| EVENTS.yard_debt.leave_it.label | Do not risk it | Nothing | Fine | | KEEP |
| EVENTS.old_guard.title | A guard you know | The line | Fine | | KEEP |
| EVENTS.old_guard.text | The night guard once worked for your family. He is staring at you. | Setup | Fine | | KEEP |
| EVENTS.old_guard.loyalty.label | Appeal to old loyalty | Roll 3+; win mod -2 (moves at the line need two less); fail police stop | Fine | | KEEP |
| EVENTS.old_guard.loyalty.win.say | He looks at his boots and waves the queue on. | You do not cross; crossings get easier | Reads as if you are through | He looks at his boots and lets the queue move faster. | REWRITE |
| EVENTS.old_guard.next_shift.label | Wait for the next shift | 3 h | Fine | | KEEP |
| EVENTS.pilgrims.title | Pilgrims at the barrier | Heading | Fine | | KEEP |
| EVENTS.pilgrims.text | Forty pilgrims and their luggage are at the post. The guards are tired. | Setup | AP: figures from 10, but a sentence never starts with a figure; recast | The post is full of 40 pilgrims and their luggage. The guards are tired. | REWRITE |
| EVENTS.pilgrims.queue_pilgrims.label | Join the queue | mod -1 at the line | Fine | | KEEP |
| EVENTS.pilgrims.wait_pilgrims.label | Wait for them to clear | 2 h | Fine | | KEEP |
| EVENTS.blizzard.title | A blizzard closes the pass | Heading | Fine | | KEEP |
| EVENTS.blizzard.text | The post is shut. A smugglers' path runs over the ridge. | Nothing closes any crossing (sim.js:171) | States a rule the game does not have | | KEEP (inconsistency logged) |
| EVENTS.blizzard.storm.label | Wait out the storm | 6 h; skipEnemy sets lastEnemy to hour+3 (sim.js:336), so in six hours Sosā acts once instead of twice (sim.js:471). Exposure drift and ally replies continue | Fine | | KEEP |
| EVENTS.blizzard.storm.say | Nobody moves. Not you, not Sosā. | Sosā still acts once, at hour 6 | Say what happens | Six hours in the snow, and the storm costs Sosā half of them too. | REWRITE |
| EVENTS.blizzard.ridge.label | Walk the ridge path | Roll 4+; win takes you into Esmeralda, skipping every post including the bought one; fail 3 h, exposure +3 | Fine | | KEEP |
| EVENTS.blizzard.ridge.win.say | You come down into Esmeralda with no stamp at all. | Result line | Fine | | KEEP |
| EVENTS.blizzard.ridge.lose.say | You turn back half frozen. The post saw your flashlight. | Result line | Fine | | KEEP |
| EVENTS.dog_bark.title | The dog barks at the post | Only if you brought the dog (data.js:424) | Fine | | KEEP |
| EVENTS.dog_bark.text | The guards look up. A dog in your car was on the news. | No news event involves the dog; invented fact | Drop the invented news report | The guards look up at the dog barking in your car. | REWRITE |
| EVENTS.dog_bark.calm.label | Let your daughter calm him | Roll 3+; win nothing; fail exposure +3 | Fine | | KEEP |
| EVENTS.dog_bark.give_dog.label | Give the dog to a trucker | Sibling trust -1 | Fine | | KEEP |
| EVENTS.dog_bark.give_dog.say | Your daughter does not speak to you until Esmeralda. | Chip says your sibling trusts you less | Mismatch logged | | KEEP |
| EVENTS.esm_press.title | Cameras across the line | Heading | Fine | | KEEP |
| EVENTS.esm_press.text | Someone told the press in Baca. Cameras wait on the far side. | Setup | Fine | | KEEP |
| EVENTS.esm_press.speak_esm.label | Speak to them | Exposure +2, reception +1 stage (sim.js:333). Reaching stage 2 gives Vélez's card; stage 3 makes the escort post certain | Fine | | KEEP |
| EVENTS.esm_press.speak_esm.say | Esmeralda sees you. So does Valdória. | Result line | Fine | | KEEP |
| EVENTS.esm_press.cover.label | Cover your face | Nothing | Fine | | KEEP |
| EVENTS.crew_double.title | The crew wants double | Susana | Fine | | KEEP |
| EVENTS.crew_double.text | The operator's insurer called. The pilot wants twice the fee or a guarantee. | Setup; refusing has no effect on the aircraft | Fine | | KEEP |
| EVENTS.crew_double.pay_double.label | Pay double | Exposure +1 | Fine | | KEEP |
| EVENTS.crew_double.guarantee.label | Have your sponsor guarantee it | Needs your sponsor's card; sponsor trust -1. Chip prints the sponsor's first given name ("Bīr trusts you less"), sim.js:272 | Fine | | KEEP |
| EVENTS.crew_double.guarantee.say | It goes on what you owe your sponsor. | Result line | Fine | | KEEP |
| EVENTS.crew_double.other_pilot.label | Find another pilot | 4 h | Fine | | KEEP |
| EVENTS.overflight.title | No overflight permit | Heading | Fine | | KEEP |
| EVENTS.overflight.text | The refuel stop will not let the jet cross. The long route adds hours. | Setup | Fine | | KEEP |
| EVENTS.overflight.long.label | Take the long route | 3 h spent now | Fine | | KEEP |
| EVENTS.overflight.short.label | Risk the short route | mod +1: departure moves at Susana need one more, for certain | "Risk" suggests a chance; the cost is certain. Logged | | KEEP |
| EVENTS.overflight.short.say | The pilot files it anyway. The tower will look twice. | Result line | Fine | | KEEP |
| EVENTS.goodbye_post.title | A goodbye online | Heading | Fine | | KEEP |
| EVENTS.goodbye_post.text | Your daughter posted a photo from the airfield lounge. It is everywhere. | Setup | Fine | | KEEP |
| EVENTS.goodbye_post.takedown.label | Get it taken down | Roll 4+; win nothing; fail exposure +3 | Fine | | KEEP |
| EVENTS.goodbye_post.stand.label | Let it stand | Exposure +2 and flags.asked: takeoff needs 2 more unless reception is at stage 2 or above (sim.js:184), and one police stop becomes possible in Esmeralda (sim.js:263). No chip shows the flag | Know the takeoff gets harder | | KEEP (inconsistency logged) |
| EVENTS.goodbye_post.stand.say | Valdória asks Esmeralda to hold you within the hour. | Sets flags.asked now; does not hold you | Open decision 4 | | FLAG-4 |
| EVENTS.rival_deal.title | The president calls | At the line or Susana | Fine | | KEEP |
| EVENTS.rival_deal.text | Concede on camera, come home, and the case quietly closes. | Setup | Fine | | KEEP |
| EVENTS.rival_deal.take_deal.label | Take the deal | Ends the run as a loss, kind 'deal'; result screen says "You took the deal." (ui.js:278) | Fine | | KEEP |
| EVENTS.rival_deal.take_deal.end.reason | You concede on camera at noon. The case closes quietly. The party never forgives you. | Stored in s.over.reason, never rendered | Not shown | | KEEP (not shown) |
| EVENTS.rival_deal.hang_up.label | Hang up | Nothing | Fine | | KEEP |
| EVENTS.too_soon.title | Your family spoke too soon | Any stop | Fine | | KEEP |
| EVENTS.too_soon.text | {sib} told reporters you already landed abroad. You are still in {here}. | {here} fills "the residence", "the line", or a stop name (sim.js:233); "still in the line" is not English | Fix the preposition | {sib} told reporters you already landed abroad. You are still at {here}. | REWRITE |
| EVENTS.too_soon.let_run.label | Let the story run | Search moves away, exposure -2, flags.dark: every new arrangement call takes 2 hours longer (sim.js:422) | Fine | | KEEP |
| EVENTS.too_soon.let_run.say | Even your own people stop calling back. They think you have landed. | Allies still answer, 2 hours slower | Say what actually happens | Your own people believe it too, and every reply you ask for now comes two hours later. | REWRITE |
| EVENTS.too_soon.correct.label | Correct it | Exposure +1 | Fine | | KEEP |
| EVENTS.bodyguard.title | An old bodyguard wants money | Heading | Fine | | KEEP |
| EVENTS.bodyguard.text | He knows your route. He will sell it tonight unless you pay. | Setup | Fine | | KEEP |
| EVENTS.bodyguard.pay_guard.label | Pay him | Exposure +1 | Fine | | KEEP |
| EVENTS.bodyguard.bluff.label | Call his bluff | Roll 3+; fail moves the search to your stop and exposure +3 | Fine | | KEEP |
| EVENTS.bodyguard.bluff.win.say | He never calls anyone. | Result line | Fine | | KEEP |
| EVENTS.bodyguard.bluff.lose.say | He calls Sosā before midnight. | Search is on you at once | Fine | | KEEP |
| EVENTS.bodyguard.gianluka.label | Have Gianlūka handle him | Needs influence card here; Gianlūka trust -1 | Fine | | KEEP |
| EVENTS.coffee.title | A police car pulls in beside you | Any stop before the line | Fine | | KEEP |
| EVENTS.coffee.text | Two officers get out for coffee. One glances at your window. | Setup | Fine | | KEEP |
| EVENTS.coffee.sit.label | Sit still | Roll 4+; fail police stop | Fine | | KEEP |
| EVENTS.coffee.drive.label | Drive away now | Exposure +1; you stay at the stop | Fine | | KEEP |
| EVENTS.hearing.title | The hearing moves up | Only while 43+ hours remain (data.js:455) | Fine | | KEEP |
| EVENTS.hearing.text | The court moved your hearing forward. The passport deadline is sooner. | Setup | Fine | | KEEP |
| EVENTS.hearing.noted.label | Keep going | Deadline -10 | Fine | | KEEP |
| EVENTS.hearing.stall.label | Have Gianlūka ask for a delay | needs [{ card: 'aide_word' }] is read as a card TAG (sim.js:166); no card has tag 'aide_word', so the choice is always blocked with "You need a aide_word card". If it worked: deadline -4, Gianlūka trust -1, exposure +1. It never delays anything | Bug and mechanic mismatch, logged | | KEEP (inconsistency logged) |
| EVENTS.hearing.stall.say | The clerk grants two days. Gianlūka adds it to what you owe him, and the court knows you are still in reach. | Deadline moves 4 hours sooner, not later | Say what the code does | The clerk moves your hearing up four hours instead of 10. Gianlūka adds it to what you owe him, and the court knows you are still in reach. | REWRITE |
| EVENTS.blackout.title | The province goes dark | Heading | Fine | | KEEP |
| EVENTS.blackout.text | A storm took down the grid. Phones, radios and the inquiry go quiet. | Calls still work; only Sosā's next action is delayed | Fine as setup | | KEEP |
| EVENTS.blackout.dark.label | Move while they are blind | Exposure -1, Sosā skips one action; no travel, no time | Label promises travel; logged | | KEEP |
| EVENTS.blackout.sit.label | Sit tight till the lights return | 2 h, exposure -1 | Plain word | Sit tight until the lights return | REWRITE |
| EVENTS.blackout.sit.say | Two hours in the dark. Nobody comes to the door. | Result line | Fine | | KEEP |

### HOLDS (src/data.js:463 to 475)

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| HOLDS.1.title | Stopped and questioned | Step 1 of the police stop ladder (sim.js:259); kind label "They have you · 1 of three" (ui.js:485) | Fine | | KEEP |
| HOLDS.1.text | A patrol stops you at {here}. An officer wants to know where you are going. | {here} from sim.js:233 | Fine | | KEEP |
| HOLDS.1.calm.label | Answer calmly | Roll 3+, plus 1 for Teresā (face known); win 1 h; fail 3 h, lose a random card other than the second passport, exposure +1 | Fine | | KEEP |
| HOLDS.1.calm.win.say | He writes down a name that is not yours. | Result line | Fine | | KEEP |
| HOLDS.1.calm.lose.say | Three hours on a bench. They keep something of yours. | Card loss | Fine | | KEEP |
| HOLDS.1.lawyer.label | Call the party's lawyer | Needs influence card here (not in Esmeralda); 2 h; Gianlūka trust -1 | Fine | | KEEP |
| HOLDS.1.lawyer.say | The lawyer arrives shouting. They let you go. | Result line | Fine | | KEEP |
| HOLDS.1.bribe.label | Pay the officer | 1 h, exposure +2 | Fine | | KEEP |
| HOLDS.1.bribe.say | The money disappears. So does the report, maybe. | Exposure rises by 2; "maybe" hedges and suggests the report is gone | Flat claim matching the cost | The officer takes the money and lets you go. | REWRITE |
| HOLDS.2.title | Held at the station | Step 2 | Fine | | KEEP |
| HOLDS.2.text | They take you to the nearest station. Your phone goes in a plastic bag. | Setup; the phone still works for calls after | Fine | | KEEP |
| HOLDS.2.wait_lawyer.label | Wait for a lawyer | 8 h; lose 'best': your second passport if you hold it, otherwise a random card (sim.js:328) | Know the passport goes | | KEEP |
| HOLDS.2.wait_lawyer.say | Eight hours. They keep what they found on you. | Same | Name the passport | Eight hours. They keep your second passport, or another card if you no longer have it. | REWRITE |
| HOLDS.2.embassy.label | {sib} calls an embassy | Roll 4+; blocked if your sibling has talked to the inquiry; win 4 h; fail 10 h and lose 'best' | Fine | | KEEP |
| HOLDS.2.embassy.win.say | A diplomat calls the station chief. You are released. | Result line | Fine | | KEEP |
| HOLDS.2.embassy.lose.say | Nobody important answers until morning. | Also takes the second passport first | Name the loss | Nobody important answers until morning, and they keep your second passport. | REWRITE |
| HOLDS.2.walk_out.label | Walk out at shift change | Roll 5+; win 1 h, exposure +3; fail climbs to house arrest | Fine | | KEEP |
| HOLDS.2.walk_out.win.say | Nobody stops a person walking like they belong. | Result line | Fine | | KEEP |
| HOLDS.3.title | House arrest | Step 3 | Fine | | KEEP |
| HOLDS.3.text | The court placed you under house arrest. Two officers sit outside the door. | Setup | Fine | | KEEP |
| HOLDS.3.climb.label | Climb out at the shift change | Roll 5+, minus 1 only if a decoy card counts here (residence or Santa Laura). Win: 2 h, exposure +8, ladder set to step 2. Fail: run ends | Fine | | KEEP |
| HOLDS.3.climb.win.say | Over the back wall, into a car that was not there yesterday. | Exposure +8 from the reset value 4 hits 10, and the next hour puts you back under house arrest (verified by script; sim.js:338, 472, 261) | Mechanic issue logged | | KEEP (inconsistency logged) |
| HOLDS.3.climb.lose.end.reason | The officers catch you on the wall. The hearing is Monday. You will be there. | s.over.reason, never rendered; player sees "You got caught." | Not shown | | KEEP (not shown) |
| HOLDS.3.accept.label | Accept it | Ends the run | Fine | | KEEP |
| HOLDS.3.accept.end.reason | You sit by the window and watch the officers change shifts. The hearing is Monday. | Not rendered | Not shown | | KEEP (not shown) |

### RUMORS (src/data.js:477 to 481) and rumor choices

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| RUMORS[0] | Someone saw {n} talking to a police car. | Line picked at random, not from behavior (sim.js:250). The person is the secret informer 65% of the time when one is at this stop (sim.js:248). Marks them "doubted" | Card kind "A rumor" already frames it as hearsay | | KEEP |
| RUMORS[1] | {n} asked twice which car you will take. | Same | Same | | KEEP |
| RUMORS[2] | {n} paid off a debt this morning, in cash. | Same | Same | | KEEP |
| sim.opt.keep_trusting | Trust {split} | fx.doubt, already set by the rumor: no effect (sim.js:299, 330) | Fine; {split} carries the first name | | KEEP |
| sim.opt.test_them_quietly | Test {first} quietly | 2 h; reveals the truth (sim.js:332) | Fine | | KEEP |
| sim.opt.cut_them_off | Cut {first} off | Lose all their cards; moves with them blocked (sim.js:331, 176) | Fine | | KEEP |
| sim.say.you_stop_answering | You stop answering {name}. | Result line for cut | Fine; the chip names the loss | | KEEP |
| sim.say.was_working_for_sosa_you | {name} was working for Sosā, and you found out in time. | Test on an informer: they are marked as talked, you lose every card they gave you (sim.js:332) | Name the card loss | {name} was working for Sosā, so you drop every card {name} gave you before it can hurt you. | REWRITE |
| sim.say.is_clean_and_offended_you | {name} is clean, and offended you asked. | Test on a loyal ally raises trust to at least 2 ("Trusted"), which lowers the roll their jobs need by one (sim.js:332, 480) | Text says offended; code says trusted | {name} is clean, and you can count on {name} now. | REWRITE |
| sim.say.sold_you_out_sosa_knows | {name} sold you out, and Sosā knows where you are. | Move with a secret informer: 60% they sell it; search moves to you, exposure +3 (sim.js:373) | Fine | | KEEP |

### ENEMY_ACTIONS (src/data.js:214 to 224) and sim.inquiry.*

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| ENEMY_ACTIONS.check_belief.text | Sosā's people search {lv}. | Every 3 hours on the escape side (sim.js:471). {lv} is where the search is aimed (sim.js:498) | Fine | | KEEP |
| sim.inquiry.they_find_you | " They find you." | Search on your stop and exposure 7+: police stop (sim.js:498) | Fine | | KEEP |
| sim.inquiry.they_are_close | " They are close." | Search on your stop, exposure under 7: exposure +2 on the escape side, +1 on the government side (sim.js:498). The brief's "+1" is the government value | Fine; the exposure row gives the number | | KEEP |
| sim.inquiry.nobody_there_has_seen_you | " Nobody there has seen you." | Search elsewhere | Fine | | KEEP |
| ENEMY_ACTIONS.circulate.text | Sosā sends the travel ban to every provincial post and the Huhūi border. | Sets flags.restriction: every crossing at the line needs one more unless "A report held one day" counts (sim.js:500, 182). No effect at provincial posts | Say what it changes for the player | Sosā sends the travel ban to the posts at the line, and every crossing there now needs one more on the die unless you hold "A report held one day." | REWRITE |
| ENEMY_ACTIONS.lean_operator.text | The ministry warns the Susana charter operator that its Valdórian licence is under review. | After hour 12, once. Sets flags.leaned (pilot message on arrival at Susana) | American spelling | The ministry warns the Susana charter operator that its Valdórian license is under review. | REWRITE |
| sim.inquiry.the_operator_withdraws_the_crew | " The operator withdraws the crew until you reassure him." | If aircraft is at stage 3+, it drops one stage (sim.js:501). The "reassure" path is the pilot message, which only fires on arriving at Susana; if you are already there no message comes | Say what changed | " The operator pulls the crew, and the aircraft drops back one stage." | REWRITE |
| ENEMY_ACTIONS.press_ally.text | Sosā calls {who} in for a conversation. | Picks an ally whose card you hold; they hold firm on 3 + trust or lower (sim.js:502) | Fine | | KEEP |
| sim.inquiry.says_nothing_useful | " {first} says nothing useful." | Held firm | Fine | | KEEP |
| sim.inquiry.tells_them_where_you_were | " {first} tells them where you were last seen.{yacht}" | Ally marked as talked, search moves to your current stop, exposure +2 (+3 after a lie) | It is where you are now, and they stop helping | " {first} tells them where you are and stops helping you.{yacht}" | REWRITE |
| sim.inquiry.the_yacht_story_is_dead | " The yacht story is dead, and the papers say so." | flags.lied adds 1 exposure; no papers involved | Drop the invented press report | " Your yacht story falls apart, and that costs you more." | REWRITE |
| sim.inquiry.reviews_the_passenger_lists_at | {name} reviews the passenger lists at Portô Venla airport and finds nothing. | No ally to question; nothing happens | Fine | | KEEP |
| ENEMY_ACTIONS.ask_esmeralda.text | Valdória asks Esmeralda, through its embassy in Baca, to hold you if you appear. | After hour 30, once: flags.asked (takeoff +2 unless reception stage 2+, one possible stop in Esmeralda). Does not hold you | Open decision 4 | | FLAG-4 |
| ENEMY_ACTIONS.press_story.text | The ministry briefs the papers that you have already left the country. | Search moves to the residence (to Santa Laura if you are at the residence), exposure -1 (sim.js:504) | Fine; route strip and exposure row show the rest | | KEEP |
| ENEMY_ACTIONS.roadblock.text | Police set a checkpoint on the road out of ${lv}. For the next six hours every move there is harder. | After hour 6. Checkpoint at the search's stop: moves there need one more for 6 hours; a new one replaces the old (sim.js:505, 183). {lv} is LEVELS[].short, giving "out of Residence" and "out of The line" | Name the cost; fix the place name in code | Police set a checkpoint on the road out of ${lv}. For six hours, every move there needs one more on the die. | REWRITE |
| ENEMY_ACTIONS.trace.text | The ministry traces your recent calls. | After hour 4. Checks for an arrangement call in the last 3 hours (sim.js:499) | Fine | | KEEP |
| sim.inquiry.the_last_call_came_from | " The last call came from where you are." | Search moves to your stop | Say the result | " Your last call came from here, so Sosā now searches where you are." | REWRITE |
| sim.inquiry.nothing_new | " Nothing new." | No call in 3 hours | Teach the rule once | " You made no calls in the last three hours, so they learn nothing." | REWRITE |
| ENEMY_ACTIONS.watch_sibling.text | Sosā has ${who}'s calls monitored. The operator in Susana goes quiet for a while. | After hour 9, once: every pending job your sibling is on (aircraft and reception) is due 4 hours later (sim.js:506) | Say what slows and by how much | Sosā has ${who}'s calls monitored, and everything ${who} is arranging for you now takes four hours longer. | REWRITE |
| sim.inquiry.monday_noon_your_own_passport | Monday noon: your passport is cancelled and the ban is at every post. | Fires at s.deadline, which events can move earlier than Monday noon (sim.js:466, 335). Sets cancelled (first stop starts at the station) and restriction | Do not hard-code the hour; name the stop rule | The passport deadline has passed, so your own passport is cancelled, the travel ban is at every post, and any police stop now starts at the station. | REWRITE |

### Phone messages: sim.opt., sim.effect., sim.line.

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| sim.line.jet_found_in_susana_the | "I found a jet. It will be at Susana, but the crew will not book the flight until I give them a city. Do I tell them, or do we wait for the visa to come through?" | First message (sim.js:93). "Wait" waits for the sponsor to agree (permission stage 1), not for the visa (stage 2) (sim.js:208, 485) | Name what you wait for | "I found a jet. It will be at Susana, but the crew will not book the flight until I give them a city. Do I tell them, or do we wait for your sponsor?" | REWRITE |
| sim.opt.confirm_destination | Confirm {city} | Aircraft stage 1, destination set (sim.js:434) | Fine | | KEEP |
| sim.effect.crew_booking_can_proceed | The crew books a flight to {city}. You still have no visa. Nobody meets a plane without one. | Only stage 1 (charter found). Crew confirmed needs a later aircraft call. You can still depart without a visa | Do not overclaim | The charter is found. Your next aircraft call can confirm the crew for {city}, and the visa is a separate request. | REWRITE |
| sim.opt.wait_until_salek_answers | Wait for {sponsor} | Aircraft stage 1, no destination; aircraft calls blocked until the sponsor agrees (sim.js:208) | Fine | | KEEP |
| sim.effect.crew_booking_waits_until_salek | The crew will not book until {sponsor} takes your call. | Unblocks when permission reaches stage 1 (sim.js:485) | Name the trigger | The charter is found, and the crew waits until {sponsor} agrees to help with your visa. | REWRITE |
| sim.opt.let_decide | Let {place} pick | Roll vs sibling reliability 3; always your chosen destination (sim.js:436) | Fine | | KEEP |
| sim.effect.needs_roll_to_confirm | {place} chooses for you. It takes a roll of {need} or better, and a miss costs six hours. | Miss: a 6-hour placeholder job blocks aircraft calls, then does nothing (sim.js:436, 479) | Say what the six hours block | {place} picks the city for you on a roll of {need} or better. On a miss, you cannot call about the aircraft for six hours. | REWRITE |
| sim.line.city_i_will_tell_the | "{city}. I will tell the operator." | Dialogue | Fine | | KEEP |
| sim.line.then_call_salek_soon_the | "Then call {sponsor} soon. The crew will not wait on us forever." | Dialogue | Fine | | KEEP |
| sim.line.i_told_them_city_do | "I told them {city}. Do not make me a liar." | Dialogue | Fine | | KEEP |
| sim.line.i_could_not_decide_for | "I could not decide for you. Six hours lost." | Dialogue | Fine | | KEEP |
| sim.line.radi_port_venla_we_hear | "Rādiô Portô Venla here. We hear you are on a yacht off the coast. Can you confirm that?" | Santa Laura arrival (sim.js:100) | Fine | | KEEP |
| sim.opt.confirm_it_from_the_yacht | Confirm it, from the yacht | Search to the residence, flags.lied, exposure -1 (sim.js:445) | Fine | | KEEP |
| sim.effect.the_inquiry_believes_the_coast | Sosā searches the coast instead of the road. If a friend later tells him the truth, the lie costs you one more point of exposure. | There is no coast stop; the search goes to the residence. The -1 is not mentioned | State both effects | Sosā's search goes back to the residence, and your police attention drops by one. If one of your people later talks to Sosā, the lie adds one more point. | REWRITE |
| sim.say.the_radio_has_you_at | The radio has you at sea for the evening, and Nando laughs in the front seat. | Result line | Fine | | KEEP |
| sim.opt.deny_it_you_are_at | Say you are at home | Search to the residence only (sim.js:446) | Fine | | KEEP |
| sim.effect.sends_them_to_the_house | Sosā sends the patrol to the house you just left. It buys you less time, but it costs you nothing later. | Same search move as the yacht; the only difference is no -1 and no lie flag. "Less time" is not a mechanic | Compare on real terms | Sosā's search goes back to the residence, your police attention stays the same, and nothing comes back on you later. | REWRITE |
| sim.say.they_go_to_the_house | They go to the house and find it empty. | Result line | Fine | | KEEP |
| sim.opt.hang_up | Hang up | Used for the radio and for Sosā's call | Fine | | KEEP |
| sim.effect.nothing_changes | Nothing changes, and the story stays on the radio. | Shared by no_comment (radio) and sosa_hang (Sosā's call at Susana, sim.js:142), where the radio clause is wrong | One text that fits both, or split the id | Nothing changes. | REWRITE |
| sim.opt.ask_for_a_week | Ask for a week | Sponsor demand at Nova Trentô. Any pending visa job is due 12 hours later; nothing happens if none is pending (sim.js:449) | Fine | | KEEP |
| sim.effect.permission_stalls_twelve_hours_he | {sponsor} keeps the line open, but the visa waits another 12 hours. | Same | Say it applies to a request in progress | {sponsor} keeps helping, but a visa request already with {sponsor} takes 12 hours longer. | REWRITE |
| sim.line.a_week_i_am_not | "A week. I am not a patient man, but I am a curious one." | Said by every sponsor; Mirēlā Vosk is "she" (data.js:245) | Fit all three sponsors | "A week. I am not patient, but I am curious." | REWRITE |
| sim.opt.refuse | Refuse | Used for the sponsor demand and Vélez's demand | Fine | | KEEP |
| sim.effect.lose_salek_and_his_line | {sponsor} hangs up for good, and no visa will come. You can still fly without one. | Sponsor marked as talked (calls need 9+), lose "Your sponsor's line to the ministry", visa jobs cancelled (sim.js:450). That card adds 2 to departing without a visa | Name the card | {sponsor} hangs up for good, and you lose your sponsor's line to the ministry. No visa will come, but you can still fly without one. | REWRITE |
| sim.line.then_we_have_nothing_to | "Then we have nothing to discuss. Good luck with the pilot." | Dialogue | Fine | | KEEP |
| sim.line.good_the_ministry_will_hear | "Good. The ministry will hear from me in the morning." | Dialogue after signing; signing only sets sponsor trust 2 (one less on the next visa roll) and the signed flag (sim.js:448) | Fine | | KEEP |
| sim.line.v_lez_is_not_answering | "Vélez is not picking up. I can keep trying, or {sponsor} could reach her uncle, who banks with him." | Nova Trentô arrival at reception stage 1 (sim.js:115). "Banks with him" fits Salek only; Rāo is a magistrate, Vosk a former envoy | Fit all sponsors | "Vélez is not picking up. I can keep trying, or {sponsor} could reach her uncle." | REWRITE |
| keep_calling label (sim.js:117 template) | `${sib} keeps calling` | Hard-coded in sim.js, not in the catalog. Pending reception job, 6 hours, stage 2 | Move to catalog | | KEEP (code note) |
| sim.effect.try_again_in_six_hours | {sib} tries again in six hours. It takes a roll. | Roll vs sibling reliability (3, or 2 at trust 2+) (sim.js:480) | Fine | | KEEP |
| sim.opt.ask_salek_to_reach_the | Ask {sponsor} to call her uncle | Needs the sponsor card held and sponsor loyal | Fine | | KEEP |
| sim.effect.requires_sponsor_help | {sponsor} reaches her uncle, and Esmeralda expects you. You owe {sponsor} another favor. | Reception jumps to stage 2 (minister informed; you already had stage 1), you get Vélez's card, and you lose the sponsor card (sim.js:438, 407) | Say the stage, the card gained and the card spent | {sponsor} reaches her uncle, and Vélez's minister hears about you. You get Vélez's card and spend your sponsor's line to the ministry. | REWRITE |
| sim.line.her_uncle_banks_with_me | "Her uncle banks with me. She will answer within the hour. That is two things now." | Said by every sponsor; banking fits Salek only | Fit all sponsors | "I know her uncle. She will answer within the hour. That is two things now." | REWRITE |
| sim.opt.wait | Wait | Nothing (sim.js:439) | Fine | | KEEP |
| sim.effect.nothing_moves_until_you_call | Nothing moves until you call her yourself. | At stage 1 the reception call goes to your sibling, not Vélez (sim.js:210) | Name the right call | Nothing moves until you call about reception again. | REWRITE |
| sim.line.two_men_in_a_car | "Two men in a car at the yard gate, asking about a woman. Or a man. Midnight or never." | Salta arrival (sim.js:123) | Fine | | KEEP |
| sim.opt.midnight_it_is | Midnight it is | Nothing (sim.js:451) | Fine | | KEEP |
| sim.effect.nothing_changes_you_know_the | You board at midnight. The men stay at the gate. | You still have to make the boarding move and its roll | Do not promise boarding | Nothing changes, and the men stay at the gate. | REWRITE |
| sim.opt.send_nando_past_the_gate | Send Nando past the gate first | Needs the decoy card held anywhere; lose it, exposure -2, search to Santa Laura (sim.js:452) | Fine | | KEEP |
| sim.effect.decoy_at_the_yard | You need the decoy card. The men follow Nando's sedan, and your exposure drops by two. | Shown only when available, so the requirement is noise; the search move is missing | Card spent, search move, attention | You spend your two spare cars. The men follow Nando's sedan north, Sosā's search moves to Santa Laura, and your police attention drops by two. | REWRITE |
| sim.say.the_sedan_rolls_past_the | The sedan crawls past the gate and the car follows it north while Nando waves without looking. | Result line | Fine | | KEEP |
| sim.line.the_party_meets_tonight_send | "The party meets tonight, and you gave your word. Send your endorsement before midnight." | Salta arrival with an open promise (sim.js:128). No midnight deadline exists; the message waits | Drop the false deadline | "The party meets tonight, and you gave your word. Send your endorsement." | REWRITE |
| sim.opt.send_the_statement | Send the statement | 1 h; promise kept, Gianlūka trust 3, gain "A friend in the inquiry", search to Santa Laura (sim.js:440) | Fine | | KEEP |
| sim.effect.keep_gianluka_s_support_and | Gianlūka stays with you, and his friend inside the inquiry keeps telling you where Sosā is looking. | The card adds to rolls; it shows nothing about the search. Teresā already holds it (no gain). The search move is missing | State the real effects | Gianlūka stays with you, you get "A friend in the inquiry" if you lack it, and Sosā's search moves to Santa Laura. | REWRITE |
| sim.line.thank_you_sosa_s_people | "Thank you. Sosā's people are in Santa Laura tonight, by the way. Not here." | Matches belief = 1 | Fine | | KEEP |
| sim.opt.put_him_off | Put him off | Gianlūka talks: his cards gone, search on you, exposure +2 (sim.js:441) | Fine | | KEEP |
| sim.effect.break_word | You lose every card Gianlūka gave you. He tells Sosā where you are, and your exposure rises by two. | Same | Term only | You lose every card Gianlūka gave you. He tells Sosā where you are, and your police attention rises by two. | REWRITE |
| sim.say.gianluka_does_not_answer_again | Gianlūka does not answer again, and by afternoon the inquiry has a town and a street. | Immediate, not "by afternoon" | Drop invented timing | Gianlūka does not answer again, and the inquiry now knows where you are. | REWRITE |
| sim.line.before_my_people_meet_you | "Before my people meet you at the post, you will say, on the record, that Esmeralda receives you as a guest and not as a government. Agreed?" | Line arrival with a Vélez promise (sim.js:133) | Fine | | KEEP |
| sim.opt.say_it | Say it | flags.guest; read nowhere (sim.js:453) | Fine | | KEEP |
| sim.effect.reception_stands_the_party_at | Her people stay at the post. The party at home reads what you said. | No party consequence exists | Drop the invented consequence | Vélez's arrangements stay as they are. | REWRITE |
| sim.line.thank_you_my_people_will | "Thank you. My people will be at the post." | Said even when reception is below stage 3 | Logged | | KEEP |
| sim.effect.v_lez_withdraws_her_officials | Vélez pulls her officials from the post. Her card still opens the tower. | Reception drops to stage 1 if at 2+, reception jobs cancelled; Vélez's card kept (sim.js:454). Stage 1 brings back the +2 takeoff penalty once Esmeralda has been asked | Name the stage | Vélez pulls her officials, and reception drops back to "Esmeralda expects you." You keep her card. | REWRITE |
| sim.line.then_you_will_cross_like | "Then you will cross like anyone else." | Dialogue | Fine | | KEEP |
| sim.line.inspector_sosa_come_back_for | "Inspector Sosā. Come back for the hearing and this ends quietly. Stay, and your brother's name goes on the warrant too." | Susana arrival (sim.js:140). Matēu's sibling is his sister Līviā (data.js:17) | Needs {sib}; the call site passes no arguments, so code must pass it | "Inspector Sosā. Come back for the hearing and this ends quietly. Stay, and {sib}'s name goes on the warrant too." | REWRITE |
| sim.opt.keep_him_talking | Keep him talking | 1 h; lastEnemy = hour+2, so the next automatic action waits until hour+5 (sim.js:455) | Fine | | KEEP |
| sim.effect.an_hour_on_the_phone | You keep Sosā on the line for an hour. He thinks you are wavering and skips his next move. | Same; "move" is now the player's action word | Avoid "move" for Sosā | You keep Sosā on the line for an hour, and he skips his next action. | REWRITE |
| sim.line.think_about_it_i_will | "Think about it. I will call again." | He never calls again | Logged | | KEEP |
| sim.line.your_ministry_threatened_the_operator | "Valdória's ministry threatened the operator's license, so he has pulled the crew. He will fly if Esmeralda backs him, or if the crew gets a bonus." | Susana arrival after the license warning (sim.js:145), sent even if the aircraft was never set back | Fine | | KEEP |
| sim.opt.pay_the_crew_bonus | Pay the crew a bonus | 1 h; aircraft set straight to stage 4 from any stage, exposure +1 (sim.js:442) | Fine | | KEEP |
| sim.effect.restores_the_aircraft_to_ready | The jet is ready again. Paying the crew on the apron gets you noticed, and your exposure rises by one. | "Again" is wrong if it was never ready | Drop "again" | The jet is ready at Susana. Paying the crew on the apron gets you noticed, and your police attention rises by one. | REWRITE |
| sim.line.the_crew_is_happy_the | "The crew is happy, and the apron saw you pay them." | Dialogue | Fine | | KEEP |
| sim.opt.have_v_lez_call_the | Have Vélez call the operator | Needs Vélez's card counting here; aircraft to stage 4 (sim.js:443) | Fine | | KEEP |
| sim.effect.requires_v_lez_s_card | You need Vélez's card. She calls the operator, and the jet is ready again without anyone noticing. | Requirement shown only when met; "again" may be wrong | Cut the requirement | Vélez calls the operator, and the jet is ready at Susana with nobody watching. | REWRITE |
| sim.line.the_operator_just_had_a | "The operator just had a call from the minister's office. We are good." | Dialogue | Fine | | KEEP |
| sim.opt.ignore_it | Ignore it | Nothing (sim.js:444) | Fine | | KEEP |
| sim.effect.aircraft_preparations_stay_on_hold | The jet stays grounded until you deal with it. | Nothing is frozen; aircraft calls still work | Say nothing changes | Nothing changes, and the aircraft stays at its current stage. | REWRITE |
| sim.line.leave_it_with_me_six | "Leave it with me. Six hours." | Aircraft job due 6 hours after the call ends (sim.js:422); 8 after "spoke too soon" | Fine | | KEEP |
| sim.line.i_have_a_name_in | "I have a name in Baca. Give me six hours." | Reception via sibling | Fine | | KEEP |
| sim.line.i_will_see_what_the | "I will see what the minister can spare. Call it a courtesy." | Reception via Vélez | Fine | | KEEP |
| sim.line.ten_hours_and_you_understand | "10 hours, and you understand what I asked." | Visa job 10 hours, 16 for Rāo (slow 6, data.js:240) | AP: no figure at sentence start | "Ten hours, and you understand what I asked." | REWRITE |
| sim.line.the_crew_will_not_confirm | "The crew will not book without a city. Decide." | Job succeeded but no destination (sim.js:483) | Fine | | KEEP |
| sim.line.nothing_yet_they_want_more | "Nothing yet. They want more time." | Failed job is removed, not retried (sim.js:478, 486); you must call again | Tell the player to call again, in voice | "Nothing yet. They want more time. Call me again." | REWRITE |
| sim.line.the_ministry_has_not_called | "The ministry has not called back. I will try again if you ask." | Same, sponsor | Fine | | KEEP |
| sim.line.the_minister_has_other_guests | "The minister has other guests this weekend." | Same, Vélez | Fine | | KEEP |
| sim.line.they_are_still_considering | "The ministry says they are still considering. These things take time, they tell me." | Destination will never accept; hidden by design (data.js:228) | Fine | | KEEP |

### sim.ledger. (route panel under each ally, ui.js:234)

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| sim.ledger.promised | Promised {what} by {due}. | {what} is a stage label ("fueled at Susana", "Esmeralda expects you"), sim.js:423; reads as "Promised fueled at Susana" | Make the stage read as a name | Promised to reach "{what}" by {due}. | REWRITE |
| sim.ledger.delivered | Delivered {what}. | sim.js:485 | Fine | | KEEP |
| sim.ledger.nothing_yet | Nothing on {what} yet | Job failed and is gone (sim.js:486); "yet" implies it is still coming; no period | State it failed | Did not deliver "{what}." | REWRITE |
| sim.ledger.still_considering | The ministry is still thinking | sim.js:484; no period | Punctuation | The ministry is still thinking it over. | REWRITE |
| sim.ledger.post_was_bought | The sergeant at the {post} is paid off, and you lose 12 hours finding out. | Bought post: 12 hours plus the move's hours, search on you, exposure +2 (sim.js:378). Filed under Vélez | Fine | | KEEP |

### sim.end., sim.day., sim.time., render.

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| sim.end.your_immunity_is_gone_a | {time}. Your immunity is gone, and Esmeralda has closed the airfield to you. {epilogue} | Hour 72 loss (sim.js:473); stored in s.over.reason, not rendered | Not shown | | KEEP (not shown) |
| sim.end.is_named_on_the_warrant | {name} is named on the warrant by Monday. | Epilogue on any loss (sim.js:525); not rendered | Not shown | | KEEP (not shown) |
| sim.end.you_were_held_once_along | You were held once along the way. | s.holds = 1; not rendered | Not shown | | KEEP (not shown) |
| sim.end.you_were_held_times_along | You were held {holds} times along the way. | Not rendered | Not shown | | KEEP (not shown) |
| sim.end.talked_to_the_inquiry_will | {and} talked to the inquiry. | Not rendered | Not shown | | KEEP (not shown) |
| sim.end.baca_reads_your_refusal_as | Baca has closed its guest room to you. | Refused Vélez; not rendered | Not shown | | KEEP (not shown) |
| sim.end.is_still_waiting_for_the | {aide} is still waiting for the statement you promised. | Not rendered | Not shown | | KEEP (not shown) |
| sim.end.leads_the_party_in_your | {aide} leads the party in your name. | Not rendered | Not shown | | KEEP (not shown) |
| sim.end.leads_the_party_now_and | {aide} leads the party now and denies knowing you. | Not rendered | Not shown | | KEEP (not shown) |
| sim.end.a_car_meets_the_aircraft | A car meets the aircraft at {city}. | Win with visa; not rendered | Not shown | | KEEP (not shown) |
| sim.end.lets_the_jet_land | {name} lets the jet land and asks questions for a week. | Win without visa; not rendered | Not shown | | KEEP (not shown) |
| sim.end.nona_rosa_s_truck_runs | Nonā Rosa's truck still runs to Salta. | Host trust above 0; not rendered | Not shown | | KEEP (not shown) |
| sim.day.saturday | Saturday | clockText (sim.js:67) | Fine | | KEEP |
| sim.day.sunday | Sunday | Same | Fine | | KEEP |
| sim.day.monday | Monday | Same | Fine | | KEEP |
| sim.day.tuesday | Tuesday | Same | Fine | | KEEP |
| sim.day.wednesday | Wednesday | Unreachable (the run ends Tuesday 2 p.m.) | Fine | | KEEP |
| sim.time.noon | noon | AP | Fine | | KEEP |
| sim.time.midnight | midnight | AP | Fine | | KEEP |
| render.detain_questioned | Stopped for questioning | Canvas banner on stop step 1 (render.js:47, 319) | Fine | | KEEP |
| render.detain_held | Held at the station | Step 2 banner | Fine | | KEEP |
| render.detain_arrest | Under house arrest | Step 3 banner | Fine | | KEEP |
| render.person | {name}, {role} | Hover label on an ally (render.js:79) | Fine | | KEEP |
| render.person_status | {name}, {role} · {status} | Status "Talked" or "Trusted" | Fine | | KEEP |
| render.you | {name}, you | Player hover label (render.js:106) | Fine | | KEEP |
| render.search_team | Your search team | Government fallback name | Fine | | KEEP |

### markers.json (chips; escape fxTags sim.js:270, government govTags gov.js:224)

| Location | Original | What the code does (with file:line) | What the player needs | Proposed | Status |
|---|---|---|---|---|---|
| roll.need | Roll {need}+ | Escape adds 1 for face and subtracts 1 for a counting decoy card, matching applyFx (sim.js:273, 319). Government does not adjust | Fine | Roll {need} or more | REWRITE |
| roll.win | Win: {list} | Government only (gov.js:226); escape never shows win effects | Plain phrasing | If it works: {list} | REWRITE |
| roll.fail | Fail: {list} | Both sides; list lowercased, so names print lowercase | Plain phrasing | If it fails: {list} | REWRITE |
| time.hours | {hours} h | Both sides | Fine | | KEEP |
| exposure.change | Exposure {signed} | Escape: fx.exposure (sim.js:275) | Term | Police attention {signed} | REWRITE |
| search.elsewhere | Sosā looks elsewhere | belief 'away': one stop back, or Santa Laura from the residence (sim.js:325). From the residence that is the stop you are heading to | Say it moves off your stop | Sosā's search moves off your stop | REWRITE |
| search.finds | Sosā finds you | belief 'here': search moves to your stop; no stop happens (sim.js:326) | Do not claim a capture | Sosā searches where you are | REWRITE |
| search.loses_move | Sosā loses a move | skipEnemy: next automatic action comes 3 hours later (sim.js:336). "Move" is the player's word | Own word for Sosā | Sosā skips his next action | REWRITE |
| search.at | Search {place} | Government: Sosā searches where your search is aimed (gov.js:230) | Fine | | KEEP |
| card.gain | Card: {card} | Both sides | Say gained | You gain {card} | REWRITE |
| card.lose_any | Lose a card | 'random' never takes the second passport; 'best' takes it first (sim.js:328) | 'best' hides that the passport goes; needs a separate code | | KEEP (inconsistency logged) |
| card.lose | Lose: {card} | Named card | Plain phrasing | You lose {card} | REWRITE |
| trust.more | {person} trusts you more | Trust +1 (cap 3); at 2+ their jobs need one less (sim.js:480) | Fine | | KEEP |
| trust.less | {person} trusts you less | Trust -1 | Fine | | KEEP |
| trust.rely | Keeps {person}'s help | fx.doubt: status chip only (sim.js:330) | Say the risk stays | You keep {person}'s help and the risk | REWRITE |
| trust.cut | Loses {person}'s help | Cut: their cards go, moves with them blocked | Name the cards | You lose {person}'s help and cards | REWRITE |
| trust.test | Learn the truth | Test (sim.js:332) | Fine | | KEEP |
| arrangement.moves | Reception moves | fx.stage, only reception uses it (data.js:428); the text hard-codes "Reception" | Say how far | Reception moves up one stage | REWRITE |
| deadline.sooner | Deadline sooner | Passport deadline earlier by 12, 10 or 4 hours; amount not passed | Name the deadline | Passport deadline comes sooner | REWRITE |
| deadline.later | Deadline later | No event has a positive deadline; unused | Keep for parity | Passport deadline comes later | REWRITE |
| rolls.easier | Rolls here easier | fx.mod < 0: moves at this stop need 1 or 2 less for the rest of the stay (sim.js:337, 185). Event rolls are unaffected | Moves, not all rolls | Moves here get easier | REWRITE |
| rolls.harder | Rolls here harder | fx.mod > 0 | Same | Moves here get harder | REWRITE |
| hold.climb | Held | climbHold: one step up the stop ladder from where it stands (questioned, station, house arrest) (sim.js:259) | Say a police stop follows | The police stop you, one step further | REWRITE |
| route.advance | Reach the next stop | advanceLevel | Fine | | KEEP |
| run.ends | Ends the run | fx.end: always a loss (deal or arrest) | Say the outcome | You lose | REWRITE |
| allies.slower | Allies slower | flags.dark: each new arrangement call takes 2 hours longer (sim.js:422) | Say how | Your allies take two hours longer | REWRITE |
| lead.real_in | A real lead in {hours} h | Government: a true report of where she was at the choice, arriving after {hours} (gov.js:228, 254) | Say it may be stale | A true sighting, arriving in {hours} h | REWRITE |
| lead.real_now | A real lead now | lead 0 | Same | A true sighting now | REWRITE |
| lead.false | A false lead | falseLead, marked misleading (gov.js:258) | Fine | | KEEP |
| her.exposed | Harder for her to hide | press: her exposure +n (gov.js:263) | Fine | | KEEP |
| her.warned | Her side is warned | warn: her exposure -n and, if the search was on her, it is cleared (gov.js:264) | Fine | | KEEP |
| her.slips | Her plans slip {hours} h | stall: her pending jobs due later (gov.js:265) | Fine | | KEEP |
| line.harder | Line harder to cross for {hours} h | crossing: checkpoint at the line, +1 for n hours, replacing any other (gov.js:266) | Grammar | The line is harder to cross for {hours} h | REWRITE |
| ban.confirmed | Ban confirmed at the post | fx.ban sets restriction (often already on) and the request status (gov.js:267) | Open decision 3 | | FLAG-3 |
| ban.lost | Post loses the ban | fx.unban changes only the government request status; restriction stays on, her crossings unchanged (gov.js:268) | Same issue as decision 3 | | FLAG-3 |
| hold.esmeralda_moves | Esmeralda moves on your hold | holdup: hurries the Esmeralda request, whose success sets flags.asked, not a hold (gov.js:269, 204) | Open decision 4 | | FLAG-4 |
| orders.easier | Orders easier for {hours} h | dcMods (gov.js:270, 118) | Fine | | KEEP |
| orders.harder | Orders harder for {hours} h | Same | Fine | | KEEP |
| minister.pleased | Minister pleased | standing +1; only one debrief line reads it (gov.js:271, 331) | Fine | | KEEP |
| minister.angry | Minister angry | standing -1 | Fine | | KEEP |
| minister.sooner | Minister wants it {hours} h sooner | ministerBy earlier (gov.js:272) | Fine | | KEEP |

## 2. Design inconsistencies

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

Count: rewrites 82, keeps 284 (including 15 marked "not shown" and 8 marked "inconsistency logged"), flags 5 (FLAG-3: 2, FLAG-4: 3), unknowns 0.
