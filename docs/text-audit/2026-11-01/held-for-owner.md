# Lines held for the owner's decision

These lines were not rewritten, because the right wording depends on a game decision, a code change or hidden information. Each row cites its review table, where the full reasoning and the file and line are recorded.

## Escape moves and places (4)

| Location | Text today | Why it is held |
|---|---|---|
| `LEVELS.airfield.arrive` | Portalba. The charter apron behind the port, Costamaran flags on the tower. They will let you leave from here and nothing more. Sosā has asked them to hold you. | Preserve meaning: the last sentence is false in most runs; the second sentence is a fragment. Open decision on the "hold" request, so FLAG. |
| `LEVELS.airfield.approaches.depart.fail.say` | The tower holds you on the apron for two hours while a request from Valdória is read, and reread. | Humanizer 11, passive hides who reads; claims a request that may not exist. Open decision on the "hold" request, so FLAG. |
| `STAGE_LINES.permission[1]` | {sponsor} has taken your call and will speak to the ministry, on {sponsor}\'s terms. | Makes no sense in the speaker's voice; the fix is the speaker id or the placeholders, which a copy edit cannot change. |
| `DESTS.atlanta.city` | Lāyūna | Place-name rule: reads like a given name (Layuna, Luna). Do not rename here; the owner decides. |

## Escape news, police stops and results (10)

| Location | Text today | Why it is held |
|---|---|---|
| `EVENTS.fuel.river.label` | Leave the car, take the river | Label promises travel; the code only makes moves here easier |
| `EVENTS.raid.slip.label` | Slip out now | Label promises leaving; a win only costs an hour |
| `EVENTS.strike.text` | The union stopped the yard. No freight moves unless someone breaks the strike. | States a rule the game does not have |
| `EVENTS.strike.scabs.label` | Ride with the strikebreakers | Label promises boarding; a win does nothing |
| `EVENTS.holt_drunk.cut_holt.label` | Go to Theo instead | Label names an action with Theo that the code does not take |
| `EVENTS.yard_debt.favor.win.say` | He remembers. He walks you to the train himself. | Says the yardmaster walks you to the train; the code gives Theo's card and moves nothing. Contradicts the Salta objective |
| `EVENTS.blizzard.title` | A blizzard closes the pass | States a rule the game does not have |
| `EVENTS.blizzard.text` | The post is shut. A smugglers' path runs over the ridge. | States a rule the game does not have ("The post is shut") |
| `EVENTS.overflight.short.label` | Risk the short route | "Risk" suggests a chance; the cost is certain |
| `EVENTS.blackout.dark.label` | Move while they are blind | Term: "move" is the player's word for a move, and this choice moves nowhere |

## Government side (28)

| Location | Text today | Why it is held |
|---|---|---|
| `GOV_ORDERS.circulate.text` | Every post and the border get the ban. A sent message does not close the border until the post confirms. | Open decision (confirmation has no effect). "A sent message does not close the border until the post confirms": the ban never closes the border, and it works from the moment the order succeeds. "Every post and the border" names the same posts twice. Accurate w |
| `GOV_EVENTS.judge.text` | He will not sign the order for the border post until a hearing tomorrow. | Open decision (ban confirmation has no effect): every choice here only moves the ban between confirmed and sent, except where it first sets the ban. |
| `GOV_EVENTS.judge.wait_judge.label` | Wait for the hearing | Open decision (ban confirmation has no effect). |
| `GOV_EVENTS.judge.wait_judge.say` | The post keeps the old list for one more night. | Open decision (ban confirmation has no effect): the post "keeps the old list" but sim.js never reads the confirmation. |
| `GOV_EVENTS.storm.text` | The road service is closing the passes for the night. | Design: the passes never close in the code; her crossing is unaffected unless you keep the patrol there. Recorded for the owner rather than reworded around. |
| `GOV_EVENTS.sergeant.watch_him.lose.say` | He notices the watcher and loses the list. | Open decision (ban confirmation has no effect). |
| `GOV_EVENTS.sergeant.leave_him.label` | Leave it | Open decision (ban confirmation has no effect). |
| `report.proves` | Proves | Brief, no label-and-value rows: each report shows "Proves \| X" and "Does not prove \| Y". The route already uses the sentence form route.does_not_prove. Needs a layout change, so recorded rather than reworded. |
| `report.not_prove` | Does not prove | Brief, no label-and-value rows (see report.proves). |
| `gov.line.the_sergeant_is_off_shift` | The sergeant is off shift. Nobody has read it. | Open decision (ban confirmation has no effect). |
| `gov.line.the_post_confirms_the_sergeant` | The post confirms, and the sergeant has her name on the desk. | Open decision (ban confirmation has no effect). |
| `gov.line.esmeralda_will_hold_her_if` | Costamar will hold her if she appears. The interior ministry gave us a name to call. | Open decision (the "hold" does not hold her). |
| `gov.line.the_post_will_confirm_when` | The post will confirm when the sergeant reads it. Four hours. | Open decision (ban confirmation has no effect). |
| `gov.inquiry.the_minister_names_on_the` | The minister names {place} on the evening news and every desk in the province drives there. | Position leak: it appears only when she is not at the named stop, so it tells the player where she is not, with no roll. |
| `gov.line.i_will_say_so_at` | {place}. I will say so at six. | Position leak (as above). Clock rule: "at six" has no clock in the game. |
| `gov.line.good_sosa_has_the_address` | Good. Sosā has the address. Do not lose her. | Position leak: confirms her real stop at once and for free. Also says Sosā has the address while the code moves nobody. |
| `gov.status.esmeralda_has_agreed_to_hold` | Costamar has agreed to hold her. | Open decision (the "hold" does not hold her). |
| `gov.status.esmeraldan_hold` | Costamaran hold | Open decision (the "hold" does not hold her). |
| `gov.status.ban_sent_not_confirmed_at` | Ban sent, not confirmed at the post | Open decision (ban confirmation has no effect). Also false after Monday noon, when the ban was never sent by you. |
| `gov.status.confirmed_the_post_has_her` | Confirmed, the post has her name | Open decision (ban confirmation has no effect). |
| `gov.scene.the_crossing_could_happen_before` | She could cross before your orders arrive. A sent ban does not close the border. | Open decision (ban confirmation has no effect): "A sent ban does not close the border" implies a confirmed one does; neither closes it, the ban only makes crossing harder. |
| `gov.status.confirmed_at_the_post` | Confirmed at the post. | Open decision (ban confirmation has no effect). |
| `gov.label.confirm_the_travel_ban_reached` | Confirm the ban at the post | Open decision (ban confirmation has no effect). |
| `gov.label.ask_esmeralda_to_hold_her` | Ask Costamar to hold her | Open decision (the "hold" does not hold her). |
| `gov.preview.on_failure` | On failure: {fail} | Brief, no label-and-value rows ("On failure: ..."). A sentence form ("If it fails, the patrol never gets there") needs the code to lowercase {fail}. Recorded. |
| `gov.preview.takes_hour_acts` | Takes {hours} hour{s}. Done by {who}. | Repeats the meta line above it (Humanizer 26). "Done by {who}." is a fragment. AP numbers: figures below 10. The fix is in code (drop this line, or lowercase {who} and pass Sim.num), so recorded. |
| `gov.why.your_ministry_does_not_command` | Ask Costamar to hold her first | Open decision (the "hold" does not hold her). Blocked actions should also say what is missing (Costamar's agreement); it says only what to do. |
| `gov.report.a_patrol_report_in` | A patrol report: {title} in {place}. | Brief, no label-and-value ("A patrol report: ..."). A sentence ("The police stopped her at {place}") cannot take the "house arrest" title as written; needs a sentence-form title from code. Recorded. |

## Interface: buttons, briefing, help, map (6)

| Location | Text today | Why it is held |
|---|---|---|
| `card.works_on` | Where it counts | Brief hard limit: label-and-value row. The colon join is in code, so wording alone cannot fix it. |
| `card.rung` | Step {rung} of three | AP numbers: a figure and a word side by side; words below 10 need the code to pass Sim.num(v.rung). |
| `brief.jet` | Jet | Label disagrees with state: the pill says the jet is at Portalba before it is. |
| `brief.gov_need_ban` | Travel ban | Label disagrees with the mechanic (see design inconsistencies). |
| `brief.gov_need_hold` | Costamar holds her | Label disagrees with the mechanic: "Costamar holds her" reads as a done arrest. |
| `brief.phone_suggest` | The call that helps most now is {call}. | Makes no sense as rendered: a button label dropped into a sentence; the fix needs the code to pass a noun phrase. |

## Interface: logs, endings, effect chips (15)

| Location | Text today | Why it is held |
|---|---|---|
| `phone.waiting` | {n} waiting | AP numbers: prints "1 waiting"; the figure comes from code, so this needs Sim.num, not new words. |
| `place.the_line` | the line | Unused duplicate of brief.the_line. |
| `round.held` | {place}, with police stops at step {hold} of three | AP numbers: "step 2 of three" mixes a figure and a word; the figure comes from code. |
| `sum.card` | You got {name} | Sentence case: the card name keeps its capital mid-sentence ("You got The party machine"); ui.js:235 inSentence is not applied here. |
| `sum.lost` | You lost {name} | Sentence case: same capital card name mid-sentence as sum.card. |
| `sum.news` | {title} is waiting under News | Makes no sense for rumors: "Holt Greer is waiting under News". Wording depends on a code fix, see design list. |
| `sum.exposure_rose` | Police attention rose by {n} while the hours passed. | AP numbers: "rose by 2"; the figure comes from code. |
| `sum.exposure_fell` | Police attention fell by {n} while the hours passed. | AP numbers: raw figure from code. |
| `log.try` | You try {name}. | Sentence case: prints "You try The service door after dark." Needs inSentence in code. |
| `log.card_lost` | Lost: {card}. | Label-and-value row ("Lost: …"); a sentence form needs the card name in sentence case from code (see sum.card). |
| `sum.exposure_round` | Police attention rose by {n} this round. | AP numbers: raw figure from code. |
| `sum.exposure_round_fell` | Police attention fell by {n} this round. | AP numbers: raw figure from code. |
| `arrangement.moves (ui.json)` | Your welcome in Costamar moves up one step | Unused duplicate of the marker. |
| `card.gain` | You gain {card} | Sentence case: capital card name mid-sentence; needs inSentence in code. |
| `card.lose` | You lose {card} | Sentence case: capital card name mid-sentence. |

## Guided demos (3)

| Location | Text today | Why it is held |
|---|---|---|
| `tutorial.escape.freight_crate body` | Pick **Pay Holt for a crate**, then tap **Try it**. Your truck card helps the roll. Never pay the yardmaster, because he takes the money, tells the yard who you | Owner: never tell the player in advance what will or will not work; the yardmaster sentence forecasts an outcome. Also "card" framing where the notice names the truck. Flagged for the owner because the +2 cost is shown nowhere else. |
| `tutorial.gov.confirm title` | A sent ban is not a closed border | Humanizer 1 contrast, and it states a rule the code does not have. Open design question, not a copy fix. |
| `tutorial.gov.confirm body` | The ban went out, but nobody at the post has read it. Pick **Confirm the ban at the post**, then **Send**. | Contradicts the code and the escape demo; left for the owner. |
