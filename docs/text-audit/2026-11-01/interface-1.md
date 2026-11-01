# Interface 1: actions, briefing, route, needs, phases, hints, navigation, start, title, about, daily

Scope: every content/coalition/ui.json entry whose id starts with action., brief., route., need., phase., hint., nav., tab., menu., help., card., tag., map., start., title., about., daily., update. or sound (246 entries), plus the visible text in src/shell.html and src/about.html that is not a `{{c:id}}` placeholder (14 strings). Traced through src/ui.js, src/sim.js, src/gov.js and src/data.js as of Nov. 1, 2026. The Original cell is the catalog text; `\n` in daily.share is the JSON newline. Duplicate markup originals (shell.html lines 13, 19 and 27) take the same replacement.

| Location | Original | What the code does (file:line) | Problem (guide and pattern) | Proposed | Status |
|---|---|---|---|---|---|
| action.wait_gov | Wait an hour | Text of the #wait button on the government side; doGov('wait') passes one hour of her moves (gov.js:167). (src/ui.js:107) |  |  | KEEP |
| nav.desk | The desk | Government phone panel heading (renderScene gov). (src/ui.js:107) |  |  | KEEP |
| nav.orders | Orders | Government Here panel heading over the order list. (src/ui.js:107) |  |  | KEEP |
| action.wait | Wait an hour | Text of the #wait button on the escape side; doCommit('wait') passes one hour (sim.js:363). The sim names the same action 'Lie low one hour' (sim.js:236) and hint.move says 'lie low'. (src/ui.js:120, src/shell.html:76) |  |  | KEEP |
| nav.phone | The phone | Escape phone panel heading. (src/ui.js:120, src/shell.html:87) |  |  | KEEP |
| nav.here | Here | Escape heading over the move list. (src/ui.js:120, src/shell.html:76) |  |  | KEEP |
| action.finish | Finish | Coach button on the last demo step; Tutorial.next() then stop(). (src/ui.js:131) |  |  | KEEP |
| action.next | Next | Coach button on read steps. (src/ui.js:131, src/shell.html:70) |  |  | KEEP |
| action.uses | Easier with {list} | Desktop move button (usesLabel, only when width >= 1000) and the toast after a roll that a held card made easier (ui.js:599). {list} is held card names run through inSentence ('the party machine'). (src/ui.js:150, src/ui.js:599) | Interface: clipped fragment with no subject (AGENTS.md "no clipped fragments"); as a toast it does not say what was easier. | This roll is easier with {list} | REWRITE |
| action.impossible | Cannot succeed | Move meta line when the 20-sided target is above 20 (pct 0, data.js DICE.chance), for example the yardmaster or a cancelled passport. (src/ui.js:145) | Interface: fragment with no subject. | This cannot succeed | REWRITE |
| action.cancel | Cancel | Closes the expanded move, call or request box. (src/ui.js:162, src/ui.js:200, src/ui.js:640) |  |  | KEEP |
| action.commit | Try it | Commit button in the expanded move box (doCommit). The demo and help.approach both say "Try it". (src/ui.js:168) |  |  | KEEP |
| action.call | Call | Commit button in the expanded call box. (src/ui.js:200) |  |  | KEEP |
| card.works_on | Where it counts | Toast subline when a card is given: code builds `${T('card.works_on')}: ${card.works}` (ui.js:603), for example "Where it counts: At the residence and on the road at Pedra Branca." (src/ui.js:603) | Brief hard limit: label-and-value row. The colon join is in code, so wording alone cannot fix it. |  | FLAG |
| need.aircraft_ready | The jet ready to fly at Portalba | Route need title when a move needs aircraft stage 4 (Board and depart, Depart without the visa). (src/ui.js:208, src/ui.js:216) |  |  | KEEP |
| need.visa | Entry visa | Route need title for the permission arrangement (Board and depart needs stage 2). (src/ui.js:208) |  |  | KEEP |
| need.officials | Costamaran officials waiting at a border post | Route need title for reception stage 3. No move in data.js needs reception stage 3 (only Take the road to Salta needs stage 1), so this never renders. (src/ui.js:216) |  |  | KEEP |
| need.expects | Costamar expecting you | Route need title for reception stage 1 (Take the road to Salta at Nova Trentô). (src/ui.js:216) |  |  | KEEP |
| need.crew | A crew hired for the jet | Route need title for aircraft stage 2 (Pay the fuel agent yourself). (src/ui.js:216) |  |  | KEEP |
| need.charter | A charter jet booked | Route need title for aircraft stage 1 (Leave with your sibling's driver). (src/ui.js:216) |  |  | KEEP |
| need.working | {ally} answers by {time}. | Route need subline while a call is pending: ally name and the due hour, formatted by short() as "Sun 9 a.m." (ui.js:19). The roll at that hour can fail (sim.js:492). (src/ui.js:219) |  |  | KEEP |
| need.velez | Vélez's people | Route need subline for reception stage 3 with no call pending. Unreachable for the same reason as need.officials. (src/ui.js:219) |  |  | KEEP |
| need.baca | Call your sibling to reach Vélez in Cerro Alto. | Route need subline for reception stage 1 or 2 with no call pending; reception calls go to the sibling until stage 2 (sim.js:216). (src/ui.js:219) |  |  | KEEP |
| need.salek | Call {sponsor} about your visa. | Route need subline for the visa with no call pending; {sponsor} is the sponsor short name. (src/ui.js:219) |  |  | KEEP |
| need.passport | Your second passport | Route need title for the document card (Cross at the Paso Huhūi post). (src/ui.js:222) |  |  | KEEP |
| need.passage | A way onto the freight | Route need title for a passage card (Board the midnight freight). (src/ui.js:222) |  |  | KEEP |
| need.decoy | A decoy card | Unreachable: ui.js:221 skips decoy and influence needs before this line. (src/ui.js:222) |  |  | KEEP |
| need.influence | An influence card | Unreachable: ui.js:221 skips decoy and influence needs before this line. (src/ui.js:222) |  |  | KEEP |
| need.card | A card of this kind: {tag} | Route need title for any other card need; in current data only the boat (Take a family barge upriver) reaches it, so it renders "A card of this kind: A boat". (src/ui.js:222) | Brief hard limit: label-and-value row; the tag name keeps its capital after the colon. | {tag} | REWRITE |
| need.passport_held | In your coat, but the ban lists the other one | Route need subline when you hold the second passport. Card text: "the travel ban lists only your other passport" (data.js CARDS.passport). (src/ui.js:223) | AGENTS.md: clipped fragment with no subject or verb. | It is in your coat, and the travel ban lists only your other passport | REWRITE |
| need.in_hand | In your deck | Route need subline when you hold a card of the needed kind. (src/ui.js:223) | Brief terms: no "Deck"; cards work in the background. | You have this card | REWRITE |
| need.passage_from | Holt's crate, Theo's walk through the yard or Nonā Rosa's grandson gets you on | Route need subline for passage when you hold none. The three passage cards are Holt's crate, Theo walks you through and Nonā Rosa's grandson (data.js CARDS). (src/ui.js:223) | AGENTS.md: serial comma in prose. | Holt's crate, Theo's walk through the yard, or Nonā Rosa's grandson gets you on | REWRITE |
| need.nobody | Nobody has offered one | Route need subline for a non-passage card you do not hold. (src/ui.js:223) |  |  | KEEP |
| need.night | Only at night, from 10 at night to 5 in the morning. | Route need title for the night need at Salta, and the blocked-move reason for every night move (sim.js:171). isNight is 22:00 to 5:00 (sim.js:166). (src/sim.js:171, src/ui.js:224) |  |  | KEEP |
| need.is_night | It is dark | Route need subline when isNight is true. (src/ui.js:224) |  |  | KEEP |
| need.after | After 10 p.m. | Route need subline when it is not night. (src/ui.js:224) | Brief: prefer "at night" over "p.m." in interface strings; it also disagrees in form with need.night ("10 at night") directly above it. | Wait until 10 at night | REWRITE |
| route.role_aircraft | arranging the jet and your welcome | Abroad list role for the sibling, who handles the jet and reception stages 1 and 2 (sim.js:214, 216). (src/ui.js:231) | Makes no sense alone: "your welcome" can read as "you're welcome"; arr.what_reception says "your welcome in Costamar". | arranging the jet and your welcome in Costamar | REWRITE |
| route.role_visa | asking for your visa | Abroad list role for the sponsor. (src/ui.js:231) |  |  | KEEP |
| route.stops_here | {card} counts here for the last time | Rail note at a card's last stop before Portalba. (src/ui.js:238) |  |  | KEEP |
| route.starts_here | {card} starts counting here | Rail note at a card's first stop ahead of you. (src/ui.js:238) |  |  | KEEP |
| route.velez_starts | Vélez's card starts counting here | Rail note at the line when you do NOT hold Vélez's card (`!s.hand.includes('intro_vel')`). The card comes with reception stage 2 (sim.js:422). (src/ui.js:239) | Preserve meaning: states the card counts here when the player does not have it. | Vélez's card counts from here once you have it | REWRITE |
| route.you_here | You are here | Rail and board subtitle at your stop. (src/ui.js:249, src/ui.js:257) |  |  | KEEP |
| route.border | The border | Rail and board subtitle at the line. (src/ui.js:249, src/ui.js:257, src/ui.js:648) |  |  | KEEP |
| route.esmeralda | Costamar | Rail and board subtitle at Portalba. (src/ui.js:249, src/ui.js:257, src/ui.js:648) |  |  | KEEP |
| route.inquiry_here | Sosā is looking here | Rail tag at s.belief, Sosā's search stop. (src/ui.js:249) | Brief terms: interface says "the police" where it can; the scene box already says "Police are searching where you are" (scene.sosa_here), so two wordings name one fact. | Police are searching here | REWRITE |
| route.who_acts | Who can help here: {list} | Rail line listing people at this stop with their trust marks and last ledger lines. (src/ui.js:249) | Brief hard limit: label-and-value row. | {list} can help you here | REWRITE |
| route.abroad_phone | Abroad, on the phone | Rail heading over the sibling and sponsor. (src/ui.js:252) |  |  | KEEP |
| route.abroad | Abroad | Board column heading. (src/ui.js:257) |  |  | KEEP |
| route.by_phone | By phone | Board column subtitle. (src/ui.js:257) |  |  | KEEP |
| route.who_acts_label | Who can help here | Board row label. (src/ui.js:259) |  |  | KEEP |
| route.needed | What you still need | Board row label. (src/ui.js:260) |  |  | KEEP |
| route.cards_count | Where your cards count | Board row label; also the government rail heading over her cards. (src/ui.js:261, src/ui.js:651) |  |  | KEEP |
| route.card_stops_line | {card} counts up to and at the line | Board card bar when a card's reach ends at the line; mirrors the card text "up to and at the line". (src/ui.js:263) |  |  | KEEP |
| route.velez_starts_short | Vélez's card starts here | Ghost bar across the line and Portalba when you do not hold Vélez's card. (src/ui.js:264) | Preserve meaning: reads as if the player holds the card. | Vélez's card, once you have it | REWRITE |
| route.inquiry | Sosā | Board row label for the search row. (src/ui.js:266) |  |  | KEEP |
| route.looking_here | Looking here | Board cell at s.belief. (src/ui.js:266) | Interface: fragment; brief terms prefer "the police" and the scene says "searching". | Police are searching here | REWRITE |
| route.no_inquiry | Sosā has not moved yet | Board search row when the enemy log is empty. (src/ui.js:267) |  |  | KEEP |
| phase.news | News | Escape phase label (PH_LABEL). (src/ui.js:365, src/shell.html:69) |  |  | KEEP |
| phase.reports | News | Government label for the news phase. (src/ui.js:365) |  |  | KEEP |
| phase.phone | Phone | Escape phase label. (src/ui.js:365, src/shell.html:69) |  |  | KEEP |
| phase.desk | Desk | Government phase label. (src/ui.js:365) |  |  | KEEP |
| phase.move | Move | Escape phase label. (src/ui.js:365, src/shell.html:69) |  |  | KEEP |
| phase.order | Order | Government phase label. (src/ui.js:365) |  |  | KEEP |
| phase.roll | Roll | Phase label, both sides. (src/ui.js:365, src/shell.html:69) |  |  | KEEP |
| phase.sosa | Sosā | Escape phase label. (src/ui.js:365, src/shell.html:69) |  |  | KEEP |
| phase.her_move | Her move | Government phase label. (src/ui.js:365) |  |  | KEEP |
| phase.done_desk | Hang up | Text of #phasedone on the government side; ui.js:504 hides #phasedone every render, so it never shows. (src/ui.js:500) |  |  | KEEP |
| phase.done_phone | Hang up | Text of #phasedone; hidden on every render (ui.js:504). (src/ui.js:500, src/shell.html:88) |  |  | KEEP |
| phase.see_came_in | Read the new reports | Not referenced in src/; resultCard is always called with next = null. (not referenced) |  |  | KEEP |
| phase.see_sosa | See what happened | Not referenced in src/; resultCard is always called with next = null. (not referenced) |  |  | KEEP |
| card.kind_news | News | Kind label on a news card. (src/ui.js:521) |  |  | KEEP |
| card.kind_rumor | A rumor | Kind label on a rumor card. (src/ui.js:521) |  |  | KEEP |
| card.kind_hold | The police have you | Kind label on a police stop card, joined to card.rung with " · ". (src/ui.js:521) |  |  | KEEP |
| card.rung | Step {rung} of three | Police stop card: {rung} is passed as a raw figure (ui.js:526, v.rung), so it renders "Step 2 of three". Other counts go through Sim.num (sim.js:77). (src/ui.js:526) | AP numbers: a figure and a word side by side; words below 10 need the code to pass Sim.num(v.rung). |  | FLAG |
| action.continue | Continue | Not referenced in src/. (not referenced) |  |  | KEEP |
| action.next_round | Next round | Not referenced in src/. Rounds advance on their own. (not referenced) |  |  | KEEP |
| daily.out | Escaped after {hours} hours in round {round} | outcomeLine for a win; {hours} is s.hour. Stored for the daily and used in the share text. (src/ui.js:591) |  |  | KEEP |
| daily.clock | Ran out of time in round {round} | outcomeLine for kind clock. (src/ui.js:591) |  |  | KEEP |
| daily.deal | Took the president's deal in round {round} | outcomeLine for kind deal. (src/ui.js:591) |  |  | KEEP |
| daily.arrest | Under house arrest in round {round} | outcomeLine fallback (house arrest). (src/ui.js:591) |  |  | KEEP |
| action.send_order | Send the order | Commit button in an expanded government order. (src/ui.js:629) |  |  | KEEP |
| nav.reports | Reports | Heading over the report list on the government Here panel. (src/ui.js:630) |  |  | KEEP |
| action.send | Send | Commit button in an expanded government request. (src/ui.js:640) |  |  | KEEP |
| route.report_src | {source}, {age} | Government rail: report source and age. (src/ui.js:646) |  |  | KEEP |
| route.does_not_prove | Does not prove {what} | Government rail: appended after the report text, {what} is r.doesnt with a lower-case first letter. (src/ui.js:646) | Interface: fragment with no subject, run on after the report sentence. | It does not prove {what} | REWRITE |
| route.may_be_here | You are searching here | Government rail subtitle at g.belief. (src/ui.js:648) |  |  | KEEP |
| route.no_command | Search, checkpoint and call-in orders here need Costamar's agreement | Government rail at Portalba, always (ui.js:648). Search, checkpoint and call-in orders are blocked at Portalba without the esm_intro card (gov.js:119-120), which comes when the embassy request succeeds (gov.js:208). (src/ui.js:648) | AGENTS.md: serial comma in prose. | Search, checkpoint, and call-in orders here need Costamar's agreement | REWRITE |
| route.ask_esm | Ask Costamar to hold her | Subline under route.no_command; names the request button gov.label.ask_esmeralda_to_hold_her. (src/ui.js:648) |  |  | KEEP |
| route.esm_intro | The Costamaran introduction lets your patrols act at Portalba. | Government rail, Where your cards count section, always shown (ui.js:651) whether or not you hold the card. The card lets search, checkpoint and call-in orders work at Portalba (data.js GOV_CARDS.esm_intro; gov.js:119). The call-in order is Sosā's, not a patrol's (data.js GOV_ORDERS press). (src/ui.js:651) | Preserve meaning: "your patrols" leaves out the call-in order and reads as if the card is already held. | If Costamar agrees to hold her, its introduction lets your search, checkpoint, and call-in orders work at Portalba. | REWRITE |
| start.continue | Pick up as {name} | Continue button when a saved run exists. (src/ui.js:672) |  |  | KEEP |
| start.demo_note | Play {name} with a coach as far as the airfield, then finish the run yourself. | Start screen note under Play the demo; {name} is Teresā Albukerkē. After the coach finishes the escape run keeps its scripted dice and tutorial flag (see design inconsistencies). (src/ui.js:673) |  |  | KEEP |
| start.pick | Who you are | Heading over the character buttons. (src/ui.js:675, src/shell.html:144) |  |  | KEEP |
| start.sibling_her | Her {rel} {name} is finding the jet | Character button subtitle. (src/ui.js:677) |  |  | KEEP |
| start.sibling_his | His {rel} {name} is finding the jet | Character button subtitle. (src/ui.js:677) |  |  | KEEP |
| daily.done_note | {line}. Try again? | Daily button note once today's daily has ended; pressing it starts the same daily again. (src/ui.js:681) |  |  | KEEP |
| daily.note | Can you get out? | Daily button note. (src/ui.js:681) |  |  | KEEP |
| sound.off | Sound off | aria-label of the mute button while muted. (src/ui.js:774) |  |  | KEEP |
| sound.on | Sound on | aria-label of the mute button while sound plays. (src/ui.js:774, src/shell.html:46) |  |  | KEEP |
| sound.menu_off | Sound: off | Menu tab toggle text while muted. (src/ui.js:774) |  |  | KEEP |
| sound.menu_on | Sound: on | Menu tab toggle text while sound plays. (src/ui.js:774, src/shell.html:83) |  |  | KEEP |
| nav.wordmark | Coalition | Top bar wordmark. (src/shell.html:38) |  |  | KEEP |
| menu.guided | Play the demo | Top menu and Menu tab: restarts the demo for the current side. (src/shell.html:41, src/shell.html:83) |  |  | KEEP |
| menu.start | Start screen | Saves and opens the start screen. (src/shell.html:42, src/shell.html:83) |  |  | KEEP |
| menu.help | Help | Toggles the help box on the Phone tab. (src/shell.html:43, src/shell.html:83) |  |  | KEEP |
| menu.install | Install | PWA install prompt; shown only after beforeinstallprompt. (src/shell.html:45, src/shell.html:83) |  |  | KEEP |
| sound.title | Sound | title attribute of the mute button. (src/shell.html:46) |  |  | KEEP |
| nav.menu_label | Game | aria-label of the top menu. (src/shell.html:40) |  |  | KEEP |
| help.approach | Pick a move under Here, read the odds, then tap **Try it**. Line up help on the phone while you travel, but a call can fail and an answer takes hours. | Help box. Matches the commit button "Try it" (action.commit) and the Here heading. (src/shell.html:93) |  |  | KEEP |
| help.cards | People give you cards: a car, a contact, a favor. A card lowers the number you need on the die, or lets you try a move at all, at the stops where it counts. Cards work on their own whenever they count, and a short notice tells you when one helps. The party's cards stop working at the border, and some people only move for money. | Help box. Party cards (The party machine, A report held one day, A friend in the inquiry) reach every stop up to and including the line and none at Portalba (data.js VALDORIA). (src/shell.html:94) | Preserve meaning: "stop working at the border" reads as if they fail at the line, where they still count. | People give you cards: a car, a contact, a favor. A card lowers the number you need on the die, or lets you try a move at all, at the stops where it counts. Cards work on their own whenever they count, and a short notice tells you when one helps. The party's cards stop working once you cross the border, and some people only move for money. | REWRITE |
| help.rounds | A round is News, Phone, Move, Roll and then Sosā. Police attention rises while Sosā searches where you are, and at 10 the police stop you; each stop within 12 hours of the last is worse, and the third step is house arrest. Get out of Costamaran airspace inside 72 hours. | Help box. Drift and stops: sim.js:484-487; ladder climbs and decays 12 hours (sim.js:486, 265-272). (src/shell.html:95) | AGENTS.md: serial comma in prose ("Roll, and then Sosā"). | A round is News, Phone, Move, Roll, and then Sosā. Police attention rises while Sosā searches where you are, and at 10 the police stop you; each stop within 12 hours of the last is worse, and the third step is house arrest. Get out of Costamaran airspace inside 72 hours. | REWRITE |
| help.ios | To install on an iPhone: tap Share, then Add to Home Screen. | Help box line on iOS Safari; "Add to Home Screen" is the iOS menu name. (src/shell.html:96) |  |  | KEEP |
| route.heading | The route | Route panel heading. (src/shell.html:101) |  |  | KEEP |
| route.legend_inhand | Done | Legend swatch for done need cells. (src/shell.html:101) |  |  | KEEP |
| route.legend_promised | Promised, not delivered | Legend swatch for pending need cells. (src/shell.html:101) |  |  | KEEP |
| route.legend_notyet | Not started | Legend swatch for need cells with nothing started. (src/shell.html:101) |  |  | KEEP |
| nav.panels | Panels | aria-label of the tab bar. (src/shell.html:107) |  |  | KEEP |
| tab.here | Here | Tab label. (src/shell.html:108) |  |  | KEEP |
| tab.phone | Phone | Tab label (static, also on the government side). (src/shell.html:109) |  |  | KEEP |
| tab.route | Route | Tab label. (src/shell.html:110) |  |  | KEEP |
| tab.hand | Menu | Tab label for the menu panel (heading hand.heading "Menu"). (src/shell.html:111) |  |  | KEEP |
| update.ready | New version ready. | Shown when a service worker finds a newer build. (src/shell.html:119) | AGENTS.md: clipped fragment with no subject or verb. | A new version is ready. | REWRITE |
| update.reload | Reload | Reloads into the new build. (src/shell.html:119) |  |  | KEEP |
| title.word | Coalition | Title screen, start art and about page heading. (src/about.html:41, src/shell.html:124, src/shell.html:138) |  |  | KEEP |
| title.line | 72 hours to escape, and your allies are on the phone. | Title screen tagline. The 72 hours run Saturday 2 p.m. to Tuesday 2 p.m. (sim.js HOURS_TOTAL). (src/shell.html:124) | AP numbers: a sentence does not start with a figure; also a fragment. | You have 72 hours to escape, and your allies are on the phone. | REWRITE |
| title.start | Start | Title screen button; opens the start screen. (src/shell.html:124) |  |  | KEEP |
| title.foot | A Nelosphere universe game by Ron Bronson | Title screen byline. (src/shell.html:124) |  |  | KEEP |
| start.blurb | You lost the election, and the court will not let you leave Valdória. Your family has found a jet that can fly you out of Portalba, across the border in Costamar, but nobody has agreed to take you in yet. | Start screen intro. At hour 0 the jet is found, not ready (aircraft stage 0, first sibling message). (src/shell.html:140) |  |  | KEEP |
| start.continue_plain | Pick up where you left off | Static fallback of the continue button. (src/shell.html:141) |  |  | KEEP |
| start.daily | Today's daily run | Daily button label. (src/shell.html:142) |  |  | KEEP |
| start.tutorial | Play the demo | Start screen button; starts the escape demo. (src/shell.html:143) |  |  | KEEP |
| start.gov_tutorial | Demo as Sofīā | Start screen button; starts the government demo (newGovRun(true)). (src/shell.html:143) | Interface: button is a noun fragment, not a verb phrase; the escape button reads "Play the demo". | Play the demo as Sofīā | REWRITE |
| start.byline | A Nelosphere universe game by | Start screen and about page byline. (src/about.html:65, src/shell.html:146) |  |  | KEEP |
| start.author | Ron Bronson | Author link. (src/about.html:65, src/shell.html:146) |  |  | KEEP |
| menu.credits | Credits | Opens the credits dialog. (src/shell.html:44, src/shell.html:83, src/shell.html:146) |  |  | KEEP |
| hint.news | Pick a response. | Phase hint (`hint.${side}${phase}`, ui.js:501). (src/ui.js:501) |  |  | KEEP |
| hint.phone | Your phone is ringing, so answer the call. | Phase hint; the phone phase exists only while a message waits (phoneUseful, ui.js:367). (src/ui.js:501) |  |  | KEEP |
| hint.move | Pick one move, or lie low for an hour. | Phase hint for the move phase. The button it refers to reads "Wait an hour" (action.wait, ui.js:120). (src/ui.js:501) | Interface: terms stay consistent; the hint names a control that does not exist on screen. | Pick one move, or wait an hour. | REWRITE |
| hint.roll | See how your move went. | Phase hint over the result card. (src/ui.js:501) |  |  | KEEP |
| hint.sosa | See what Sosā and your allies did. | Phase hint over the card listing Sosā, allies, cards and police attention. (src/ui.js:501) |  |  | KEEP |
| hint.gov_news | Pick a response. | Phase hint. (src/ui.js:501) |  |  | KEEP |
| hint.gov_phone | The minister is on the line, so answer him. | Phase hint; every government message comes from the minister (gov.js:39, 99). (src/ui.js:501) |  |  | KEEP |
| hint.gov_move | Give one order, or wait an hour. | Phase hint; matches the button "Wait an hour" (action.wait_gov). (src/ui.js:501) |  |  | KEEP |
| hint.gov_roll | See how your order went. | Phase hint. (src/ui.js:501) |  |  | KEEP |
| hint.gov_sosa | Read the reports on her move. | Phase hint over the Her move card. (src/ui.js:501) |  |  | KEEP |
| map.title | Pick a country | Destination map heading. (src/shell.html:130) |  |  | KEEP |
| map.sub | Costamar will let you fly out from Portalba airfield, once you cross the border to reach it. | Map subheading. Portalba arrival: "They will let you leave from here and nothing more." (src/shell.html:131) | Humanizer 26 redundancy ("to reach it" repeats "cross the border"); the comma splits a restrictive clause. | Costamar will let you fly out from Portalba airfield once you cross the border. | REWRITE |
| map.here | Valdória, where you are | SVG map label under Valdória. (src/ui.js:704) |  |  | KEEP |
| map.via | Portalba, where you fly from | Not referenced in src/; the Portalba label on the map has no subline (ui.js:705). (not referenced) |  |  | KEEP |
| map.choose | Choose {name} | Destination button text. (src/ui.js:717) |  |  | KEEP |
| map.hint | Your second passport gets you on the plane. You also need an entry visa from the country you pick. | Map footnote. Board and depart needs aircraft stage 4 and the visa; the second passport is a +1 there, not a requirement (data.js:194). Depart without the visa needs only the jet; a country that will not take you sends you back (data.js:198; over.why_landed). (src/shell.html:134) | Makes no sense against the code: the passport does not get you on the plane, and the visa is not required to fly. | The country you pick decides on your entry visa. You can fly without one, but a country that will not take you sends you back. | REWRITE |
| map.hours | {h}-hour flight | Destination button flight time; {h} via Sim.num. (src/ui.js:715) |  |  | KEEP |
| about.play | Play | Link back to the game. (src/about.html:46, src/about.html:64) |  |  | KEEP |
| about.back | Back to the game | Not referenced in src/. (not referenced) |  |  | KEEP |
| title.about | About the game | Title screen link to about.html. (src/shell.html:124) |  |  | KEEP |
| about.still_title | The title screen, with a run playing behind it | Screenshot alt and caption. (src/about.html:49) |  |  | KEEP |
| about.still_here | A round at the residence | Screenshot alt and caption. (src/about.html:50) |  |  | KEEP |
| about.still_route | The route and the people on it | Screenshot alt and caption. (src/about.html:51) |  |  | KEEP |
| about.lede | Saturday, 2 p.m. You lost the election, the court has barred you from leaving Valdória, and it wants your passports by Monday noon. One of them is in your coat. | About lede and page meta description. Passport deadline is hour 46, Monday noon (sim.js:21). (src/about.html:9, src/about.html:13, src/about.html:17, src/about.html:42) |  |  | KEEP |
| about.p1 | Two unmarked cars sit outside the house in Portô Venla. Inspector Valentīn Sosā runs the departure inquiry from the Interior Ministry, and he is good at it. Rādiô Portô Venla has you on a yacht in the harbor, which is where you want him looking. | About page narrative. (src/about.html:43) |  |  | KEEP |
| about.p2 | Your brother or sister is abroad finding a jet, and no crew will book until they can say where it is going. A sponsor in another country will ask a ministry for your visa, for a price. Rosario Vélez, aide to Costamar's interior minister, can have people waiting at the border if Cerro Alto gets your name in time. Gianlūka Moretī runs the party. He can put a mayor, a judge or a border post on the phone, and he writes down every call. | About page narrative; reception goes through the sibling, then Vélez (sim.js:216). (src/about.html:44) | AGENTS.md: serial comma in prose ("a mayor, a judge or a border post"). | Your brother or sister is abroad finding a jet, and no crew will book until they can say where it is going. A sponsor in another country will ask a ministry for your visa, for a price. Rosario Vélez, aide to Costamar's interior minister, can have people waiting at the border if Cerro Alto gets your name in time. Gianlūka Moretī runs the party. He can put a mayor, a judge, or a border post on the phone, and he writes down every call. | REWRITE |
| about.p3 | Nando has driven you for 11 years. Nonā Rosa Trentinī has a room in Nova Trentô, a phone, and a grandson who knows which boxcar the guards skip. Holt Greer works the midnight freight out of Salta and sells his chalk-marked crate to anyone with cash. Theo Bascom runs the yard. Two of the people helping you already work for Sosā, and which two changes every run. | About page narrative; two people are secretly bad in a normal run (sim.js:51-53). (src/about.html:45) |  |  | KEEP |
| about.road_h | The road | About heading. (src/about.html:54) |  |  | KEEP |
| about.p4 | South through Pedra Branca, where the posts have not received the travel ban yet. East to the colônia at Nova Trentô. Up to the rail town at Salta and onto the midnight freight over the Huhūi passes. Three crossings lead into Costamar there, a day apart. One of them has taken Valdória's money, and you find out which when the sergeant walks into the hut with your passport and does not come back. Past the line is Portalba, a charter apron behind the port, and a pilot who flies where the flight plan says. | About page narrative; matches the stops and the bought post. (src/about.html:55) |  |  | KEEP |
| about.p5 | Where it says is the first thing you decide. Lāyūna in Altamira, where Amādū Salek wants the family accounts moved to his bank before he picks up a phone. Almatau in Ardésia, where a magistrate named Dēvan Rāo answers by letter. Krasnomor in Nordavia, where Mirēlā Vosk wants mineral rights you do not control. None of them has said yes. The visa comes while you run or it does not, and if you land without one in a country that will not take you, you are sent back. | About page narrative; sponsor asks match data.js:235-249; landing rule matches data.js:198. (src/about.html:56) |  |  | KEEP |
| about.p6 | A call takes hours, a move takes a roll of one die, and police attention climbs toward 10 while Sosā searches where you are. At 10 the police stop you. The first stop is questions, the second is a night at the station, and the third is house arrest, unless 12 quiet hours pass between stops. You have 72 hours, Saturday afternoon to Tuesday at 2 p.m. | About page narrative; drift and the ladder match sim.js:484-487. (src/about.html:57) |  |  | KEEP |
| about.gov_h | The other side | About heading. (src/about.html:59) |  |  | KEEP |
| about.p7 | Or sit at Sofīā Leōnī's desk. She is aide to the incoming minister, who wants a location by Tuesday, and she works with the watch team, the Pedra Branca desk, the civil registry, a yardmaster who takes money from anyone and tells her about it, and an embassy in Cerro Alto that will ask Costamar to hold the candidate. Her orders stop at the border, and her reports come in hours old, some of them wrong. | About page narrative. Data.GOV.title is "aide to the incoming government" (data.js:258). The minister wants a town at hour 2, or 6 hours later after Ask for six hours (gov.js:29, 172), not by Tuesday. (src/about.html:60) | Makes no sense against the code: wrong title and wrong minister deadline. | Or sit at Sofīā Leōnī's desk. She is aide to the incoming government, and the minister wants a town from her within hours. She works with the watch team, the Pedra Branca desk, the civil registry, a yardmaster who takes money from anyone and tells her about it, and an embassy in Cerro Alto that will ask Costamar to hold the candidate. Her orders stop at the border, and her reports come in hours old, some of them wrong. | REWRITE |
| about.start_h | Before you start | About heading. (src/about.html:62) |  |  | KEEP |
| about.p8 | The demo is one scripted escape with a coach beside you, 20 steps, and there is a shorter one for the government side. In the daily run everyone starts from the same draw, so you and a friend can compare endings. It is one page that works offline once loaded and saves your run. It is hard on purpose, and one bad call on Saturday evening can end it before it starts, so when a 20-minute run ends you start another. | About page narrative; demos are 20 and 12 steps (tutorials.json). (src/about.html:63) |  |  | KEEP |
| about.world | Valdória, Costamar, Altamira, Ardésia and Nordavia are countries of the Nelosphere, Ron Bronson's fictional world, written since 1991, and they stand on real ground. | About footer. (src/about.html:65) | AGENTS.md: serial comma in prose. | Valdória, Costamar, Altamira, Ardésia, and Nordavia are countries of the Nelosphere, Ron Bronson's fictional world, written since 1991, and they stand on real ground. | REWRITE |
| daily.held_never | Never held. | Not referenced in src/. (not referenced) |  |  | KEEP |
| daily.held_once | Held once. | Not referenced in src/. (not referenced) |  |  | KEEP |
| daily.held_twice | Held twice. | Not referenced in src/. (not referenced) |  |  | KEEP |
| daily.held_many | Held {holds} times. | Not referenced in src/. (not referenced) |  |  | KEEP |
| daily.share | Coalition, {date}: {line}.\n{url} | Daily share text; `\n` is the JSON newline in the catalog source. (src/ui.js:592) |  |  | KEEP |
| daily.landed | Sent back on landing in round {round} | outcomeLine for kind landed. (src/ui.js:591) |  |  | KEEP |
| daily.at | {when} | Wrapped by apTime() (ui.js:588), which nothing calls. (src/ui.js:588) |  |  | KEEP |
| daily.months | Jan.\|Feb.\|March\|April\|May\|June\|July\|Aug.\|Sept.\|Oct.\|Nov.\|Dec. | AP month names for the daily date label. (src/ui.js:587) |  |  | KEEP |
| brief.time | You have {n} hours left before your immunity runs out on Tuesday at 2 p.m. | Not referenced in src/. (not referenced) |  |  | KEEP |
| brief.h_round | This round | Briefing heading. (src/shell.html:115) |  |  | KEEP |
| brief.start | Start round {n} | Closes the briefing. (src/ui.js:457) |  |  | KEEP |
| brief.back | Back to the round | Same button when the briefing is reopened. (src/ui.js:767) |  |  | KEEP |
| brief.again | Briefing | Phase bar button that reopens the briefing. (src/shell.html:69) |  |  | KEEP |
| brief.gov_title | The search | Government briefing title. (src/ui.js:450) |  |  | KEEP |
| brief.the_residence | the residence | placeName(0). (src/ui.js:438) |  |  | KEEP |
| brief.the_line | the line | placeName(4). (src/ui.js:438) |  |  | KEEP |
| brief.need_jet | Your jet | Need row for the aircraft arrangement. (src/ui.js:399) |  |  | KEEP |
| brief.need_visa | Entry visa | Need row for the visa. (src/ui.js:400) |  |  | KEEP |
| brief.need_reception | Help from Costamar's government | Need row for reception. (src/ui.js:401) |  |  | KEEP |
| brief.you | You | Briefing route pill at s.pos. (src/ui.js:417) |  |  | KEEP |
| brief.sosa | Police search here | Briefing route pill at s.belief. (src/ui.js:416, src/ui.js:417) |  |  | KEEP |
| brief.jet | Jet | Briefing route pill fixed at Portalba (marks[5], ui.js:415) at every aircraft stage, including before a charter is booked. (src/ui.js:415, src/ui.js:418) | Label disagrees with state: the pill says the jet is at Portalba before it is. |  | FLAG |
| brief.gov_need_ban | Travel ban | Need row, done only when the post confirms (req.ban inhand, ui.js:427). The ban already adds one to every crossing once circulated (flags.restriction, sim.js:186). (src/ui.js:427) | Label disagrees with the mechanic (see design inconsistencies). |  | FLAG |
| brief.gov_need_hold | Costamar holds her | Need row, done when the embassy agrees. The effect is flags.asked: takeoff is harder unless reception is at stage 2 (sim.js:190), Costamar can stop her once, at step 1 (sim.js:269), and you get the esm_intro card (gov.js:208). She is not held. (src/ui.js:428) | Label disagrees with the mechanic: "Costamar holds her" reads as a done arrest. |  | FLAG |
| brief.gov_search | Your search | Briefing pill at g.belief. (src/ui.js:433) |  |  | KEEP |
| brief.gov_last_seen | Newest report | Briefing pill at the newest report's stop. (src/ui.js:434) |  |  | KEEP |
| brief.h_win | To win | Briefing heading. (src/shell.html:115) |  |  | KEEP |
| brief.gov_not_confirmed | Not confirmed. | Subline under Travel ban when the ban is out (flags.restriction) and the post has not confirmed. (src/ui.js:427) | AGENTS.md: clipped fragment; does not say what is unconfirmed. | The ban is out, but the post has not confirmed it. | REWRITE |
| brief.gov_asked | Asked. | Subline under the hold row when the embassy request is pending (req.hold promised); the embassy answers 11 hours later (gov.js:204-208). (src/ui.js:428) | AGENTS.md: clipped fragment; does not say who has to answer. | The embassy has not answered yet. | REWRITE |
| brief.gov_job_ban | Circulate the travel ban, and every border crossing she tries needs one more on the die. | Briefing job while the ban is not out; sim.js:186 adds one to border crossings. (src/ui.js:429) |  |  | KEEP |
| brief.gov_job_hold | Ask Costamar to hold her. | Briefing job once the ban is out and no hold request is made; names the request button. (src/ui.js:429) |  |  | KEEP |
| brief.gov_job_search | Move your search to {place}, where the newest report comes from, and search there. | Briefing job otherwise. (src/ui.js:429) |  |  | KEEP |
| brief.gov_win | Stop her from flying out before Tuesday at 2 p.m. | Government win line. (src/ui.js:455) |  |  | KEEP |
| brief.escape_win | Fly out of Portalba before Tuesday at 2 p.m. | Escape win line; win is a successful depart at Portalba. (src/ui.js:455) |  |  | KEEP |
| brief.hours_escape | Hours until your escape deadline, Tuesday at 2 p.m. Then your immunity ends and you can no longer leave the country. | Caption under the hours-left number. (src/ui.js:411) |  |  | KEEP |
| brief.hours_gov | Hours until her escape deadline, Tuesday at 2 p.m. Then her immunity ends and she can no longer leave the country. | Same, government side. (src/ui.js:430) |  |  | KEEP |
| brief.police_attention | Police attention is {n} out of {max}, and it rises while Sosā searches where you are. At {max} the police stop you, and each stop within 12 hours of the last is one step worse: questions, a night at the station, then house arrest. | Caption under police attention. Drift, stop at 10 and the 12-hour decay match sim.js:484-487. (src/ui.js:413) |  |  | KEEP |
| brief.phone_suggest | The call that helps most now is {call}. | Briefing job line. {call} is the sim label "Call {name} about {what}" (sim.js:211), so it renders "The call that helps most now is Call Duartē Albukerkē about the jet." The phone button reads "{name} about {what}" (ui.js:199). (src/ui.js:408) | Makes no sense as rendered: a button label dropped into a sentence; the fix needs the code to pass a noun phrase. |  | FLAG |
| brief.done_list | These steps are done: {list}. | Stage names already reached. (src/ui.js:397) |  |  | KEEP |
| brief.left_list | You still need these steps: {list}. | Stage names still to reach. (src/ui.js:397) |  |  | KEEP |
| brief.visa_note | Without it you can still fly, but if the country you chose will not take you, it sends you back. | Visa row note; matches depart_nopermit (data.js:198). (src/ui.js:400) |  |  | KEEP |
| brief.reception_note | The first step opens the road to Salta, the second cancels the extra takeoff trouble if Sosā has asked Costamar to hold you, and the third puts Vélez's officials at one border post. | Reception row note. Stage 1 opens Take the road to Salta (data.js:144); stage 2 cancels the +2 on the takeoff roll that applies once Sosā has asked Costamar (sim.js:190, 518); stage 3 makes the escort post near certain (sim.js:186). (src/ui.js:401) | Interface: vague term ("extra takeoff trouble") for a measurable change. | The first step opens the road to Salta, the second cancels the harder takeoff roll that follows if Sosā has asked Costamar to hold you, and the third puts Vélez's officials at one border post. | REWRITE |
| brief.gov_report_now | The newest report, which just came in, comes from {place}. | Briefing story line for the newest report. (src/ui.js:424) |  |  | KEEP |
| brief.gov_report_hour | The newest report, which came in an hour ago, comes from {place}. | Same, one hour old. (src/ui.js:424) |  |  | KEEP |
| brief.gov_report_hours | The newest report, which came in {n} hours ago, comes from {place}. | Same, n hours old. (src/ui.js:424) |  |  | KEEP |
| brief.gov_no_report | No report has come in yet. | Fallback; every government run starts with a report. (src/ui.js:424) |  |  | KEEP |
| brief.gov_reports_caveat | Reports can be late or false. | Briefing line after the newest report. (src/ui.js:425) |  |  | KEEP |
| brief.minister_expects | The minister expects a town by {time}. | Briefing stat for ministerBy. (src/ui.js:432) |  |  | KEEP |
| tag.boat | A boat | Card kind name (tagName in ui.js, kindWord in sim.js and gov.js); lower-cased mid sentence in "You need a card that gives you {card}". (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| tag.decoy | Decoy cars | Card kind name. (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| tag.delay | Delays the travel ban | Card kind name for A report held one day. sim.js kindWord puts it into "You need a card that gives you delays the travel ban". (src/sim.js:168, src/ui.js:151, src/gov.js:14) | Makes no sense in its sentences: a verb phrase where every other tag is a noun phrase. | A delay on the travel ban | REWRITE |
| tag.document | Travel papers | Card kind name. (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| tag.influence | Political pull | Card kind name. (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| tag.information | Inside information | Card kind name. (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| tag.introduction | An introduction | Card kind name. (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| tag.operator | Leverage on the charter operator | Card kind name. (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| tag.passage | A way onto the freight | Card kind name. (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| tag.patrol | Police patrol | Card kind name (government). (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| tag.permission | Help with the visa | Card kind name. (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| tag.rail | A rail yard contact | Card kind name (government). (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| tag.records | Records access | Card kind name (government). (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| tag.vehicle | A vehicle | Card kind name. (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| tag.watch | The watch team | Card kind name (government). (src/sim.js:168, src/ui.js:151, src/gov.js:14) |  |  | KEEP |
| action.chance | Roll {need} or higher ({odds} chance) | Move meta line; {need} is the 20-sided target and {odds} is "N%" (sim.js:196). (src/ui.js:145) |  |  | KEEP |
| action.takes | Takes {hours} hours | Move meta line; hours via Sim.num. (src/ui.js:146) |  |  | KEEP |
| action.takes_one | Takes one hour | Move meta line, one hour. (src/ui.js:146) |  |  | KEEP |
| action.done_by | , done {who} | Appended to the hours on a government order; {who} is "by the provincial patrol" and similar (gov.preview.who_acts). (src/ui.js:146) |  |  | KEEP |
| action.sosa_none | Sosā does not act during these {hours} hours. | Move meta line; sosaActs counts his turns in the move hours. (src/ui.js:149) |  |  | KEEP |
| action.sosa_once | Sosā acts once during these {hours} hours. | Move meta line. (src/ui.js:149) |  |  | KEEP |
| action.sosa_times | Sosā acts {n} times during these {hours} hours. | Move meta line. (src/ui.js:149) |  |  | KEEP |
| hint.wait_sosa | If you wait the hour, Sosā acts during it. | Appended to hint.move when Sosā acts within the next hour. (src/ui.js:501) |  |  | KEEP |
| action.her_during | She keeps moving during these {hours} hours, and her moves can leave new reports. | Government order meta line. (src/ui.js:149) |  |  | KEEP |
| action.her_during_one | She keeps moving during this hour, and her moves can leave new reports. | Government order meta line, one hour. (src/ui.js:149) |  |  | KEEP |
| brief.passport_deadline | Hours until the court's passport deadline, {time}. Then your own passport is cancelled, the travel ban is in force at the border, so every crossing needs one more on the die, and any police stop starts with a night at the station. | Briefing stat until hour 46. At it: flags.cancelled, flags.restriction (sim.js:481), so border crossings need one more unless you hold the delay card (sim.js:186), and the first police stop starts at step 2 (sim.js:267). (src/ui.js:412) | Run-on: four clauses chained with commas and "so" in one sentence (AGENTS.md "one idea per sentence"); American spelling is "canceled". | Hours until the court's passport deadline, {time}. After it your own passport is canceled and the travel ban is in force at the border, so every crossing needs one more on the die. Any police stop after that starts with a night at the station. | REWRITE |
| brief.passport_deadline_gov | Hours until the court's passport deadline, {time}. Then her own passport is cancelled, the travel ban is in force at the border, so every crossing she tries needs one more on the die, and any police stop starts with a night at the station. | Government briefing stat; same mechanics on her run. (src/ui.js:431) | Run-on, as above; American spelling is "canceled". | Hours until the court's passport deadline, {time}. After it her own passport is canceled and the travel ban is in force at the border, so every crossing she tries needs one more on the die. Any police stop after that starts with a night at the station. | REWRITE |
| hint.call_first | You can make one call from the phone before you move. | Appended to the move hint while no call has been made this round and one is available. (src/ui.js:501) |  |  | KEEP |
| src/shell.html:6 | Coalition | Page title. |  |  | KEEP |
| src/shell.html:13 | Seventy-two hours. Escape Valdória with help from allies, or run the government inquiry and stop the flight. A turn-based pixel-art game by Ron Bronson. | Meta description. The government player is Sofīā at her desk; Inspector Sosā runs the inquiry (about.p1, about.p7). | Humanizer 2, dramatic fragment opener; makes no sense against the code ("run the government inquiry"); closing fragment. | You have 72 hours to escape Valdória with help from your allies, or you can play the government side and try to stop the flight. Coalition is a turn-based pixel-art game by Ron Bronson. | REWRITE |
| src/shell.html:17 | Coalition | og:site_name. |  |  | KEEP |
| src/shell.html:18 | Coalition: escape or stop the escape | og:title. |  |  | KEEP |
| src/shell.html:19 | Seventy-two hours. Escape Valdória with help from allies, or run the government inquiry and stop the flight. A turn-based pixel-art game by Ron Bronson. | og:description, same text as line 13. | As line 13. | You have 72 hours to escape Valdória with help from your allies, or you can play the government side and try to stop the flight. Coalition is a turn-based pixel-art game by Ron Bronson. | REWRITE |
| src/shell.html:24 | The title Coalition over a pixel-art border post at night. | og:image:alt; matches og/card.png (title over a barrier at night). |  |  | KEEP |
| src/shell.html:26 | Coalition: escape or stop the escape | twitter:title. |  |  | KEEP |
| src/shell.html:27 | Seventy-two hours. Escape Valdória with help from allies, or run the government inquiry and stop the flight. A turn-based pixel-art game by Ron Bronson. | twitter:description, same text as line 13. | As line 13. | You have 72 hours to escape Valdória with help from your allies, or you can play the government side and try to stop the flight. Coalition is a turn-based pixel-art game by Ron Bronson. | REWRITE |
| src/shell.html:29 | The title Coalition over a pixel-art border post at night. | twitter:image:alt. |  |  | KEEP |
| src/shell.html:132 | A world map with Valdória, Portalba and the three countries that might take you | aria-label of the destination map SVG. | AGENTS.md: serial comma in prose. | A world map with Valdória, Portalba, and the three countries that might take you | REWRITE |
| src/about.html:6 | Coalition | Page title. |  |  | KEEP |
| src/about.html:11 | Coalition | og:site_name. |  |  | KEEP |
| src/about.html:12 | Coalition | og:title. |  |  | KEEP |
| src/about.html:16 | Coalition | twitter:title. |  |  | KEEP |

## Design inconsistencies

- **The move hint names a button that is not there.** hint.move says "lie low for an hour"; the button reads "Wait an hour" (action.wait, src/ui.js:120), the sim calls the action "Lie low one hour" (src/sim.js:236) and the result card says "You lay low" (result.lay_low, src/ui.js:358). One action, three names.
- **The phase hint is several sentences at runtime.** src/ui.js:501 joins hint.move, hint.wait_sosa and hint.call_first into one line, so the "one sentence per interface string" rule passes in the catalog and fails on screen.
- **"Hang up" can never show.** src/ui.js:504 sets #phasedone hidden on every render, so phase.done_phone and phase.done_desk are dead text.
- **Card help is a label-and-value row built in code.** src/ui.js:603 writes `${T('card.works_on')}: ${card.works}` into the toast, so "Where it counts: ..." cannot be fixed by wording alone.
- **Police stop step mixes a figure and a word.** src/ui.js:526 passes v.rung raw into card.rung, giving "Step 2 of three"; every other count goes through Sim.num (src/sim.js:77).
- **The briefing's call suggestion drops a button label into a sentence.** brief.phone_suggest receives the sim label "Call {name} about {what}" (src/sim.js:211, src/ui.js:406-408), giving "The call that helps most now is Call Duartē Albukerkē about the jet.", while the phone button itself reads "{name} about {what}" (src/ui.js:199). The fix needs the code to pass a noun phrase such as "a call to Duartē about the jet".
- **The Jet pill sits at Portalba before there is a jet.** src/ui.js:415 places brief.jet at stop 5 at every aircraft stage.
- **Travel ban "done" only when confirmed.** brief.gov_need_ban turns done only on req.ban inhand (src/ui.js:427, src/gov.js:147); the ban's effect (one more on every crossing) is already on once circulated (flags.restriction, src/sim.js:186).
- **"Costamar holds her" does not hold her.** brief.gov_need_hold is done when the embassy agrees (src/gov.js:208). The effect is flags.asked: a harder takeoff roll unless reception is at stage 2 (src/sim.js:190), at most a step 1 stop in Costamar (src/sim.js:269), and the esm_intro card. The same request name runs through route.ask_esm, brief.gov_job_hold, about.p7 and the request button.
- **Government route text ignores what you hold.** route.no_command stays on Portalba after you have the Costamaran introduction (src/ui.js:648), and route.esm_intro is listed under Where your cards count whether or not you hold it (src/ui.js:651). Orders at Portalba also stay one harder with the card (src/gov.js:122).
- **Vélez's card shown as counting before you have it.** route.velez_starts and route.velez_starts_short render only when you do NOT hold intro_vel (src/ui.js:239, 264).
- **Route status depends on color alone.** Need cells carry their state (done, promised, not started) only as a CSS class (src/ui.js:247, 260); the legend (src/shell.html:101) is the only text key. Brief: no information by color alone.
- **The escape demo stays scripted after the coach leaves.** Tutorial.stop resets only the step index (src/tutorial.js:41); s.tutorial and the queued dice stay, so there are no police stops or news cards and police attention stops at 9 (src/sim.js:249, 266, 487). Only the government side clears its script (src/gov.js:351 via src/ui.js:771). start.demo_note invites the player to "finish the run yourself".
- **The map footnote contradicts departure rules.** map.hint says the second passport gets you on the plane; Board and depart needs only the jet and the visa, and the passport is a +1 (src/data.js:194). Depart without the visa needs only the jet (src/data.js:198).
- **Sofīā's title and the minister's deadline.** about.p7 says "aide to the incoming minister" and "a location by Tuesday"; Data.GOV.title is "aide to the incoming government" (src/data.js:258) and the minister wants a town at hour 2, or 6 hours later (src/gov.js:29, 172).
- **Day names are abbreviated.** short() cuts weekdays to three letters (src/ui.js:19), so need.working and other clock lines read "Sun 9 a.m."; AP does not abbreviate days.
- **British "cancelled".** brief.passport_deadline and sim.inquiry.monday_noon_your_own_passport spell it "cancelled"; American spelling is "canceled". The code flag s.flags.cancelled is internal and stays.
- **A banned promise outside this scope.** The government order preview ends with gov.preview.cannot_fail (src/gov.js:123); the brief bans "cannot fail" in interface text.
- **Unreachable or unused catalog strings.** need.decoy and need.influence (skipped at src/ui.js:221); need.officials and need.velez (no move needs reception stage 3 in src/data.js); phase.see_came_in, phase.see_sosa, action.continue, action.next_round, brief.time, about.back, map.via, daily.held_never, daily.held_once, daily.held_twice and daily.held_many (not referenced in src/); daily.at (only inside apTime, src/ui.js:588, which nothing calls).

Count: 37 rewrites, 217 keeps, 6 flags, 0 unknowns (260 strings: 246 catalog entries, 14 markup strings).
