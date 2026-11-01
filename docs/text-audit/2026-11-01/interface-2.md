# Interface text review 2: results, logs, endings, scene and markers (Nov. 1, 2026)

Scope: every content/coalition/ui.json entry outside the prefixes reviewed elsewhere (scene., log., over., sum., result., render., who., sosa., phone., round., coach., recap, arr., arrangement., dice., stop., float., replay., share., place., name., marker., hand.), and every marker in content/coalition/markers.json. Traced through src/ui.js, src/sim.js, src/gov.js, src/render.js, src/shell.html and src/data.js. FLAG means the wording cannot be fixed without a code change; the reason is in the Problem cell and the design list.

| Location | Original | What the code does (file:line) | Problem (guide and pattern) | Proposed | Status |
| --- | --- | --- | --- | --- | --- |
| name.inspector | Inspector Sosā | Speaker name for enemy lines in the government log (ui.js:27). |  |  | KEEP |
| log.start_escape | {clock}. You are {name}, {title}. {sibling}, {rel}, is abroad and already looking for a plane. | First log line of an escape run; {clock} is Sim.clockText(0), "Saturday 2 p.m." (ui.js:67, sim.js:69-72). | AP punctuation: the clock ends in "p.m.", so "{clock}." prints "Saturday 2 p.m.. You are". | It is {clock}, and you are {name}, {title}. {sibling}, {rel}, is abroad and already looking for a plane. | REWRITE |
| log.start_gov | {clock}. You are {name}, {title}. {target} lost the election on Saturday, the court has barred her from leaving, and the minister wants to know where she is. | First log line of a government run; {clock} is "Saturday 2 p.m." (ui.js:77). | AP punctuation: prints "Saturday 2 p.m.. You are". | It is {clock}, and you are {name}, {title}. {target} lost the election on Saturday, the court has barred her from leaving, and the minister wants to know where she is. | REWRITE |
| scene.gov_goal | keep {her} from flying out before | Goal line on the government scene, followed by the deadline "Tue 2 p.m." (ui.js:101, shell.html:55). | Sentence case: the escape version (scene.goal) starts with a capital; this one starts lowercase in the same slot. | Keep {her} from flying out before | REWRITE |
| scene.last_report | Last report {age} | Government scene line; {age} is "just now" or "N h old", the hours since the newest report reached the desk (ui.js:102, gov.js:138-141). |  |  | KEEP |
| scene.no_reports | No reports yet. | Government scene line before any report arrives (ui.js:102). |  |  | KEEP |
| scene.none | none | Value after the label "Last report" when there is no report yet (ui.js:103). | Interface: empty state should say what will appear. | none yet | REWRITE |
| scene.last_report_label | Last report | Label for the newest report age on the government scene (ui.js:103). |  |  | KEEP |
| scene.minister_by | The minister wants a location by {time}. | Government scene line; {time} is short(ministerBy), for example "Sat 4 p.m." (ui.js:104). The minister sends his demand when the hour passes (gov.js:99). | AP punctuation: "{time}." prints "Sat 4 p.m.." | By {time}, the minister wants a location. | REWRITE |
| scene.suspected | Your search | Label before the stop your search is aimed at, on the government scene (ui.js:105). |  |  | KEEP |
| scene.last_report_lc | last report {age} | Government expline value, same {age} as scene.last_report (ui.js:105). |  |  | KEEP |
| scene.no_reports_lc | no reports | Government expline value before any report arrives (ui.js:105). | Terms consistent: scene.no_reports says "No reports yet"; empty state should say what will appear. | no reports yet | REWRITE |
| scene.goal | Leave Costamaran airspace by | Escape goal line, followed by the deadline "Tue 2 p.m." (ui.js:110, shell.html:55). At hour 72 the run ends (sim.js:488). |  |  | KEEP |
| scene.sosa_here | Police are searching where you are | Heading of the police box when the search is on your stop, s.belief === s.pos (ui.js:112). |  |  | KEEP |
| scene.sosa_at | Police are searching {place} | Heading of the police box when the search is on another stop (ui.js:112). |  |  | KEEP |
| scene.sosa_right | Police are searching {place}, and you are there | Line under scene.sosa_here, shown at the same time (ui.js:113). While the search sits on your stop, police attention rises one every two hours (four at Salta) (sim.js:483). | Humanizer 26 and owner rule 2: repeats the heading above it word for word and leaves out what it means for the player. | Police attention rises while they search {place}, where you are. | REWRITE |
| scene.sosa_wrong | Police are searching {place}, and you are somewhere else | Line under scene.sosa_at, shown at the same time (ui.js:113). Police attention drifts up only when the search is on your stop (sim.js:483); a search elsewhere finds nobody (sim.js:513). | Humanizer 26 and owner rule 2: repeats the heading above it and leaves out the consequence. | You are somewhere else, so this search does not raise police attention. | REWRITE |
| scene.next_move | Police act again | Label before the hours until the next police action (ui.js:114). |  |  | KEEP |
| scene.next_in | in {hours} hours | Hours until enemyTurn, every three hours (ui.js:115, sim.js:19, 486). Reads "Police act again in two hours". |  |  | KEEP |
| scene.held_again | Police stop step {hold} of three | Shown under the police attention bar while s.hold > 0; {hold} is the raw rung 1 to 3 (ui.js:116). Rung 1 questioned, 2 station, 3 house arrest (data.js:466-478); 12 quiet hours drop a rung (sim.js:485). | Makes no sense to a player: "Police stop step 2 of three" names no thing and mixes a figure with a word (AP numbers; the figure comes from code, see design list). | Police stops are at step {hold} of three, and step three is house arrest | REWRITE |
| scene.held_at | The police stop you at 10. | Shown under the police attention bar while s.hold is 0 (ui.js:116, shell.html:62). At police attention 10 the player is stopped and it resets to 4 (sim.js:487). | Clipped beat: "at 10" does not say 10 of what. | The police stop you when police attention reaches 10. | REWRITE |
| scene.exposure | Police attention | Label of the police attention meter (ui.js:118, shell.html:60, 64). |  |  | KEEP |
| coach.step | Step {n} of {total} | Tutorial step counter (ui.js:129). |  |  | KEEP |
| marker.night | Night only | Badge on a move that needs night, shown when it is available (ui.js:155). |  |  | KEEP |
| phone.waiting | {n} waiting | Chip next to the Phone heading; {n} is messages.length as a figure (ui.js:190, 636). | AP numbers: prints "1 waiting"; the figure comes from code, so this needs Sim.num, not new words. |  | FLAG |
| phone.empty | Nobody is calling. | Inbox empty state on the escape side (ui.js:191). |  |  | KEEP |
| phone.sibling_role | {rel}, arranging the jet and your welcome | Role line under the sibling in a phone thread; {rel} is "Sister" or "Brother" (ui.js:193). PEOPLE.sibling.role says "arranging the jet and your welcome in Costamar from abroad" (data.js:29). | Terms consistent: the arrangement is "your welcome in Costamar" everywhere else (arr.what_reception, the marker). | {rel}, arranging the jet and your welcome in Costamar | REWRITE |
| phone.call_about | {name} about {what} | Label of a call button that opens the call preview; its commit button says "Call" (ui.js:199-200). | Interface: a button is a verb phrase; this one has no verb. "Call Rosario Vélez about your welcome in Costamar" runs to eight words. | Call {name} about {what} | NEEDS-BUDGET |
| place.the_line | the line | No code reads this id; ui.js:438 uses brief.the_line instead. | Unused duplicate of brief.the_line. |  | FLAG |
| who.unknown | Untested | Status chip for an ally nobody has tested, also the default (ui.js:232). |  |  | KEEP |
| who.cut | Cut off | Status chip after you cut someone off (ui.js:232, sim.js:337). |  |  | KEEP |
| who.talked | Talked to Sosā | Status chip for an ally who is working for the police, found by a test, a betrayal or questioning (ui.js:232, render.js:79, sim.js:338, 382, 517). | Brief: interface text says "the police" where it can. | Talked to the police | REWRITE |
| who.clean | Tested and loyal | Status chip after a test shows the ally is clean (ui.js:232, sim.js:338). |  |  | KEEP |
| who.doubted | Rumored to talk | Status chip after a rumor (ui.js:232, sim.js:255). |  |  | KEEP |
| who.trusted | Trusts you | Status chip for trust 2 or more, which lowers the number their jobs need by one step (ui.js:232, sim.js:495). |  |  | KEEP |
| over.play_her | Play her side | Government ending button that starts an escape run as the candidate (ui.js:280, 748). |  |  | KEEP |
| over.choose | Pick someone else | Escape ending button that returns to the start screen (ui.js:280, 748). |  |  | KEEP |
| result.your_move | Your move | Kind label on the result card of a move (ui.js:353). |  |  | KEEP |
| result.your_choice | Your choice | Kind label on the result card of a news choice (ui.js:355, 661). |  |  | KEEP |
| result.lay_low | You lay low | Kind label when you wait one hour (ui.js:358). |  |  | KEEP |
| result.lay_low_title | One hour passes | Title when you wait one hour (ui.js:358, sim.js:363). |  |  | KEEP |
| result.your_order | Your order | Kind label on the result card of a government order (ui.js:659). |  |  | KEEP |
| result.waited | You waited | Kind label when the government side waits (ui.js:664). |  |  | KEEP |
| result.waited_title | One hour for reports | Title when the government side waits one hour (ui.js:664, gov.js:167). |  |  | KEEP |
| round.label | Round {n} | Round counter on the interstitial, briefing and phase bar (ui.js:380, 449, 497). |  |  | KEEP |
| round.searching | Searching {place} | Government round interstitial subtitle (ui.js:380). |  |  | KEEP |
| round.held | {place}, with police stops at step {hold} of three | Escape round interstitial subtitle while held; {hold} is the raw rung (ui.js:380). | AP numbers: "step 2 of three" mixes a figure and a word; the figure comes from code. |  | FLAG |
| result.success | Success | Outcome chip when the roll won (ui.js:532). |  |  | KEEP |
| result.failed | Failed | Outcome chip when the roll lost (ui.js:532). |  |  | KEEP |
| result.rolled | You rolled {die} and needed {need} | Chip with the die and target (ui.js:532). Win means die >= target, a 1 always fails, a 20 always wins (data.js:498). | Terms consistent: every preview says "Roll {need} or higher"; "needed 11" alone reads as an exact number. | You rolled {die} and needed {need} or higher | REWRITE |
| result.done | Done | Outcome when nothing was rolled (ui.js:532). |  |  | KEEP |
| sosa.quiet_gov | No new reports | Government round summary with no rows (ui.js:539). |  |  | KEEP |
| sosa.quiet | Nobody moved against you | Escape round summary with no rows: no police action, no change while the hours ran (ui.js:539, 544). |  |  | KEEP |
| sosa.kind_gov | While your orders ran | Kind label of the government round summary (ui.js:545). |  |  | KEEP |
| sosa.kind | While you moved | Kind label of the escape round summary (ui.js:545). |  |  | KEEP |
| sosa.title | {hours} hours later, {time} | Round summary heading; {hours} is Sim.num (lowercase words below 10), {time} is short(s.hour) (ui.js:545, sim.js:77). | Sentence case: a heading that starts "three hours later" begins lowercase. | {time}, {hours} hours later | REWRITE |
| sum.held_firm | kept quiet when Sosā questioned them | Row when Sosā questions an ally and they hold, read as "{first name} kept quiet..." (ui.js:556, sim.js:517). | Grammar: "them" points back to the one person named before it; brief: interface says "the police". | kept quiet under police questioning | REWRITE |
| sum.talked | talked to Sosā | Row when a questioned ally talks; the search moves to your stop and attention rises two or three (ui.js:556, sim.js:517). | Brief: interface says "the police". | talked to the police | REWRITE |
| sum.delivered | came through | Row when an ally job roll wins and the step comes through (ui.js:556, sim.js:500). |  |  | KEEP |
| sum.not_yet | came up empty, so call again | Row when an ally job roll loses; the job is removed and the step needs a new call (ui.js:556, sim.js:493, 501). | Owner rule 3: mixes the event with an instruction. | came up empty, so that step needs another call | REWRITE |
| sum.person | {person} {what} | Joins a first name with one of the sum.* phrases (ui.js:556). |  |  | KEEP |
| sum.card | You got {name} | Row when a card is gained; {name} is the card name as written, "Your second passport" (ui.js:561, data.js:63-85). | Sentence case: the card name keeps its capital mid-sentence ("You got The party machine"); ui.js:235 inSentence is not applied here. |  | FLAG |
| sum.lost | You lost {name} | Row when a card is lost (ui.js:562). | Sentence case: same capital card name mid-sentence as sum.card. |  | FLAG |
| sum.reached | You reached {place} | Row when you reach the next stop (ui.js:563). |  |  | KEEP |
| sum.sold | {person} sold you out | Row on betrayal: the ally turns, the search moves to your stop and police attention rises three (ui.js:564, sim.js:381-383). | Results say what changed: the police learning where you are is the consequence and is missing (the +3 shows on its own chip). | {person} sold you out, and the police know where you are | REWRITE |
| sum.hold | The police stopped you: {title}, which you answer before your next move | Row when the police stop you; {title} is the hold title, "Held at the station"; the hold blocks every move until you answer it (ui.js:567, sim.js:271, 181). | Makes no sense: "stopped you: Held at the station, which you answer" puts a capitalized title after a colon and ties "which" to the title. | {title}. You choose how to answer it before your next move. | NEEDS-BUDGET |
| sum.news | {title} is waiting under News | Row when a dispatch arrives; for a rumor the title is the person's name (ui.js:568, sim.js:257, 304). | Makes no sense for rumors: "Holt Greer is waiting under News". Wording depends on a code fix, see design list. |  | FLAG |
| sum.message | {name} called | Row when someone calls during the hours (ui.js:569). |  |  | KEEP |
| sum.exposure | Police attention {signed} | Chip with the change in police attention from your own move (ui.js:575). |  |  | KEEP |
| sum.exposure_rose | Police attention rose by {n} while the hours passed. | Row on a news result for attention gained while hours passed; {n} is a raw figure (ui.js:576, 533). | AP numbers: "rose by 2"; the figure comes from code. |  | FLAG |
| sum.exposure_fell | Police attention fell by {n} while the hours passed. | Same, when attention fell (ui.js:576). | AP numbers: raw figure from code. |  | FLAG |
| log.try | You try {name}. | Log line when you commit a move; {name} is the move name as written, "The service door after dark" (ui.js:597, data.js:100). | Sentence case: prints "You try The service door after dark." Needs inSentence in code. |  | FLAG |
| log.rolled | You rolled {die} and needed {need}. | Log line after a roll, followed by log.success or log.failed (ui.js:599). | Terms consistent: "or higher", as in every preview. | You rolled {die} and needed {need} or higher. | REWRITE |
| log.rolled_lowered | You rolled {die} and needed {need}, after {list} lowered it. | Same when held cards lowered the target; {list} names the cards (ui.js:599, 461). | Unclear referent: "it" has to reach back to the target; add "or higher". | You rolled {die} and needed {need} or higher, which {list} made easier. | REWRITE |
| log.success | Success. | Appended after log.rolled when the roll wins, on both sides (ui.js:599). | AGENTS.md: every line is a complete sentence; "Success." is a clipped fragment. | It worked. | REWRITE |
| log.failed | Failed. | Appended after log.rolled when the roll loses (ui.js:599). | Clipped fragment. | It failed. | REWRITE |
| log.pressed_holds | Sosā questions {name}, who says nothing, because the die showed {die} and {need} or more would have made them talk. | Log when Sosā questions an ally who holds; holds when the die misses the target (ui.js:600, sim.js:517). | Terms consistent: "or higher". | Sosā questions {name}, who says nothing, because the die showed {die} and {need} or higher would have made them talk. | REWRITE |
| log.pressed_breaks | Sosā questions {name}, who talks, because the die showed {die} and {need} or more makes them talk. | Log when the questioned ally talks (ui.js:600, sim.js:517). | Terms consistent: "or higher". | Sosā questions {name}, who talks, because the die showed {die} and {need} or higher makes them talk. | REWRITE |
| log.ally_delivers | {name} needed {need} and rolled {die}, so the step comes through. | Log when an ally job roll wins (ui.js:600, sim.js:496-500). | Terms consistent: "or higher". | {name} needed {need} or higher and rolled {die}, so the step comes through. | REWRITE |
| log.ally_not_yet | {name} needed {need} and rolled {die}, so nothing comes of it and you have to call again. | Log when an ally job roll loses; the job is gone (ui.js:600, sim.js:493). | Terms consistent: "or higher". | {name} needed {need} or higher and rolled {die}, so nothing comes of it and you have to call again. | REWRITE |
| log.gives | New from {name}: {card}. | Log line and notice when a card arrives (ui.js:603). |  |  | KEEP |
| log.card_lost | Lost: {card}. | Log line and notice when a card leaves the hand (ui.js:604). | Label-and-value row ("Lost: …"); a sentence form needs the card name in sentence case from code (see sum.card). |  | FLAG |
| log.owe | You now owe {name}: {text} | Log line when you accept an ally's terms; {text} is a full sentence, "He wants your public word..." (ui.js:605, data.js:31, 236). | Label-and-value: a colon introduces a whole sentence that starts with a capital. | You now owe {name}. {text} | NEEDS-BUDGET |
| log.reply_by | {name} will reply by {time}. | Log line after a call; {time} is clockText(due), "Saturday 9 p.m." (ui.js:607, sim.js:439). | AP punctuation: prints "9 p.m.." | By {time}, {name} will reply. | REWRITE |
| log.message | {name} called. | Log line when someone calls (ui.js:608). |  |  | KEEP |
| log.answer | You answered "{label}". | Log line after you answer a call (ui.js:609). | AP punctuation: the period goes inside the closing quotation mark. | You answered "{label}." | REWRITE |
| log.order | You gave the order "{name}". | Government log line when an order or request is sent (ui.js:612). | AP punctuation: period inside the quotation mark. | You gave the order "{name}." | REWRITE |
| log.news | {title} came in. | Log line when a dispatch arrives; a rumor's title is a person's name, so it prints "Holt Greer came in." (ui.js:614, sim.js:257, 304). | Makes no sense for rumors: reads as the person arriving. | News came in: {title}. | REWRITE |
| log.chose | You chose "{label}". | Log line after a news choice (ui.js:616). | AP punctuation: period inside the quotation mark. | You chose "{label}." | REWRITE |
| log.person_role | {name}, {role}. | Log line when you tap a person in the scene (ui.js:742). |  |  | KEEP |
| log.tutorial_ended | You left the demo and play on alone. | Log line when you leave the demo (ui.js:773). | Tense shift inside one sentence ("left ... and play on"). | You left the demo and play the rest of this run on your own. | REWRITE |
| share.copied | Copied | Share button text after the result is copied (ui.js:770). |  |  | KEEP |
| scene.label | Pixel-art view of where you are now | aria-label of the scene (shell.html:51). On the government side the scene shows the suspected stop, not where the player is (render.js:91-94). | Inaccurate on the government side. | Pixel-art view of the current stop | REWRITE |
| scene.goal_label | Goal | Label of the goal line (shell.html:55). |  |  | KEEP |
| scene.of_ten | of 10 | Follows the police attention number, "4 of 10" (shell.html:60). |  |  | KEEP |
| coach.do | Do the highlighted step. | Shown in the coach card on steps that wait for an action (shell.html:70, ui.js:132). | Interface: an instruction cannot depend on a color highlight alone. | Do what this step asks to go on. | REWRITE |
| coach.leave | Leave the demo | Button that ends the demo (shell.html:70, ui.js:773). |  |  | KEEP |
| log.heading | The log | Summary of the log disclosure (shell.html:78). |  |  | KEEP |
| hand.heading | Menu | Heading of the menu tab (shell.html:82). |  |  | KEEP |
| phone.calls | Calls | Heading over the call buttons (shell.html:90). |  |  | KEEP |
| over.share | Share | Ending button that shares the result (shell.html:121, ui.js:281). |  |  | KEEP |
| over.again | Run it again | Ending button that starts a new run as the same person (shell.html:121, ui.js:745). |  |  | KEEP |
| render.detain_questioned | Stopped for questioning | Banner on the scene for a rung 1 stop (render.js:47, ui.js:615). The hold itself is titled "Stopped and questioned" (data.js:467). | Terms consistent: the same stop has two names. | Stopped and questioned | REWRITE |
| render.detain_held | Held at the station | Banner for a rung 2 stop (render.js:47). |  |  | KEEP |
| render.detain_arrest | Under house arrest | Banner for rung 3 (render.js:47). |  |  | KEEP |
| render.person | {name}, {role} | Tooltip on a person in the scene (render.js:79). |  |  | KEEP |
| render.person_status | {name}, {role} · {status} | Tooltip with who.talked or who.trusted (render.js:79). |  |  | KEEP |
| render.you | {name}, you | Tooltip on the player figure (render.js:106-107). |  |  | KEEP |
| render.search_team | Your search team | Fallback name when Data.GOV is missing (render.js:106); Data.GOV always exists (data.js:258). |  |  | KEEP |
| sum.exposure_round_here | Police attention rose by {n} this round, and Sosā is searching where you are now | Round summary row when attention rose and the search is on your stop (ui.js:542). | Brief: interface says "the police"; punctuation differs from the two sibling rows, which end with a period. | Police attention rose by {n} this round, and the police are searching where you are now. | REWRITE |
| sum.exposure_round | Police attention rose by {n} this round. | Round summary row when attention rose (ui.js:542-543); {n} is a raw figure. | AP numbers: raw figure from code. |  | FLAG |
| sum.exposure_round_fell | Police attention fell by {n} this round. | Round summary row when attention fell (ui.js:542). | AP numbers: raw figure from code. |  | FLAG |
| over.save_run | Download this run | Ending button that downloads the run file (shell.html:121, ui.js:294). |  |  | KEEP |
| over.copy_replay | Copy replay link | Ending button and prompt title for the replay link (shell.html:121, ui.js:301). |  |  | KEEP |
| over.copied | Link copied | Replay button text after copying (ui.js:301). |  |  | KEEP |
| replay.badge | Replay | Badge while a replay plays (shell.html:123). |  |  | KEEP |
| scene.hours | {n} hours | Duration in words, used in the deadline clock and effect chips (ui.js:95, sim.js:11, gov.js:15). |  |  | KEEP |
| scene.hours_one | one hour | Same for one hour. |  |  | KEEP |
| scene.next_in_one | in one hour | Police act again in one hour (ui.js:115). |  |  | KEEP |
| sosa.title_one | One hour later, {time} | Round summary heading for one hour (ui.js:545). | Consistency with sosa.title, which moves the clock first to keep sentence case. | {time}, one hour later | REWRITE |
| over.close | Close | Closes the ending panel (shell.html:121). |  |  | KEEP |
| over.win | You win | Ending title, scene banner and government share result (ui.js:275, render.js:324, gov.js:305). |  |  | KEEP |
| over.lose | You lose | Same, for a loss. |  |  | KEEP |
| over.why_gov_time | It is Tuesday at 2 p.m. Her immunity is gone, and she can no longer fly out. | Government ending when hour 72 arrives without her leaving (ui.js:277, sim.js:488). |  |  | KEEP |
| over.why_gov_escaped | She flew out of Costamar. | Government ending when she flies out (ui.js:277). |  |  | KEEP |
| over.why_out | You flew out of Costamar. | Escape ending on a win (ui.js:278, sim.js:392). |  |  | KEEP |
| over.why_time | It is Tuesday at 2 p.m. Your immunity is gone, and you can no longer fly out. | Escape ending at hour 72 (ui.js:278, sim.js:488). |  |  | KEEP |
| over.why_landed | The country you flew to would not take you and sent you back. | Escape ending when the destination does not accept you (ui.js:278, sim.js:391). |  |  | KEEP |
| over.why_deal | You took the president's deal, conceded on camera and came home. | Escape ending after "Take the deal" (ui.js:278, data.js:444-445). | Chicago serial comma. | You took the president's deal, conceded on camera, and came home. | REWRITE |
| over.why_gov_arrest | She is under house arrest. | Government ending for any other loss kind, house arrest (ui.js:277). |  |  | KEEP |
| over.why_gov_deal | She took the president's deal, conceded on camera and came home. | Government ending when she takes the deal (ui.js:277). | Chicago serial comma. | She took the president's deal, conceded on camera, and came home. | REWRITE |
| over.why_gov_landed | The country she flew to would not take her and sent her back. | Government ending when her destination sends her back (ui.js:277). |  |  | KEEP |
| over.why_arrest | You are under house arrest. | Escape ending for house arrest, the default loss kind (ui.js:278, sim.js:345). |  |  | KEEP |
| float.police_attention | {signed} police attention | Floating number over the scene when attention changes on the escape side (ui.js:601). |  |  | KEEP |
| arr.what_aircraft | the jet | Object in the call button and sim call label (ui.js:199, sim.js:211). |  |  | KEEP |
| arr.what_reception | your welcome in Costamar | Same, for the welcome in Costamar. |  |  | KEEP |
| arr.what_permission | your visa | Same, for the visa (data.js:53 names it "Entry visa"). | Brief terms: "entry visa". | your entry visa | REWRITE |
| arrangement.moves (ui.json) | Your welcome in Costamar moves up one step | No code reads this ui.json entry; sim.js:290 reads the marker of the same code from markers.json (content.js:21-28). | Unused duplicate of the marker. |  | FLAG |
| scene.deadline_escape | Escape deadline in {time} | Clock line on the escape scene, hours to Tuesday 2 p.m. (ui.js:97). |  |  | KEEP |
| scene.deadline_gov | Her escape deadline in {time} | Same on the government scene (ui.js:97). |  |  | KEEP |
| scene.deadline_when | ({when}) | The deadline time after the clock line (ui.js:97). |  |  | KEEP |
| recap.title | What just happened | Summary of the last round recap (ui.js:519). |  |  | KEEP |
| log.no_roll | No roll was needed, and the move went through. | Log line for a move with no roll, or a crossing at the escort post (ui.js:598, sim.js:373, 377). |  |  | KEEP |
| result.no_roll | Went through without a roll | Outcome chip for the same (ui.js:532). |  |  | KEEP |
| dice.needs | needs {need} | Label under the rolling die (render.js:303, 351). | Sentence case and terms: a lowercase fragment that drops "or higher". | Need {need} or higher | REWRITE |
| stop.step | Stop {n} of {total} | Stop screen counter, "Stop N of 6" (ui.js:473). |  |  | KEEP |
| roll.need | Roll {need} or higher | First chip of a news choice that rolls (sim.js:279, gov.js:230). |  |  | KEEP |
| roll.win | If it works: {list} | Government chip listing what a win brings; the list is lowercased whole (gov.js:230). |  |  | KEEP |
| roll.fail | If it fails: {list} | Chip listing what a loss costs; the list is lowercased whole (sim.js:279, gov.js:230). |  |  | KEEP |
| time.hours | Takes {hours} | How long a news choice takes; {hours} is "two hours" (sim.js:280, gov.js:231). |  |  | KEEP |
| time.hour | Takes {hours} | Same for one hour. |  |  | KEEP |
| exposure.change | Police attention {signed} | Chip for fx.exposure, the change to police attention (sim.js:281). |  |  | KEEP |
| search.elsewhere | Sosā's search moves off your stop | fx.belief "away": the search moves to the stop behind you, or to stop 2 from the residence (sim.js:282, 331). | Brief: interface says "the police". | The police move their search off your stop | REWRITE |
| search.finds | Sosā searches where you are | fx.belief "here": the search moves to your stop, where attention then rises (sim.js:283, 332). | Brief: interface says "the police". | The police move their search to your stop | REWRITE |
| search.loses_move | Sosā skips his next action | fx.skipEnemy: lastEnemy = hour + 3, so the next police action comes three hours late (sim.js:292, 342). | Brief: interface says "the police". | The police skip their next action | REWRITE |
| search.at | Search {place} | Government fx.act check_belief: the police search the stop you suspect (gov.js:234, 282). | Reads as a command to the player; results say what happens. | The police search {place} | REWRITE |
| card.gain | You gain {card} | fx.card on both sides; {card} is the name as written, "Registry access" (sim.js:284, gov.js:242). | Sentence case: capital card name mid-sentence; needs inSentence in code. |  | FLAG |
| card.lose_any | Lose a card | fx.lose "random" or "best"; "best" takes the second passport first (sim.js:285, 334). | Consistency: the other effect chips are full sentences with "You". | You lose a card | REWRITE |
| card.lose | You lose {card} | fx.lose with a named card (sim.js:285). | Sentence case: capital card name mid-sentence. |  | FLAG |
| trust.more | {person} trusts you more | fx.trust up (sim.js:286, 335). |  |  | KEEP |
| trust.less | {person} trusts you less | fx.trust down (sim.js:286, 335). |  |  | KEEP |
| trust.rely | You keep {person}'s help and the risk | Rumor choice "keep trusting": the ally stays marked as doubted and, if bad, can still sell a move (sim.js:287, 336, 381). | Humanizer: "help and the risk" yokes two unlike things; "the risk" is never named. | You keep {person}'s help without checking the rumor | REWRITE |
| trust.cut | You lose {person}'s help and cards | Rumor choice "cut them off": the ally is cut and every card from them is lost (sim.js:288, 337). | Implies cards exist when the player may hold none from that person. | You lose {person}'s help and any cards from them | REWRITE |
| trust.test | Learn the truth | Rumor choice "test them": reveals whether the ally works for the police; takes two hours (sim.js:289, 306, 338). | Inflated and vague: "the truth" about what is not said. | You learn whether the rumor is true | REWRITE |
| arrangement.moves | Your welcome in Costamar moves up one step | fx.stage; the only data use is reception +1 (sim.js:290, data.js:431). |  |  | KEEP |
| deadline.sooner | Passport deadline comes sooner | fx.deadline below 0: the court's passport deadline (Monday noon) moves earlier (sim.js:291, 341). | Every clock says whose it is: "Passport deadline" does not say it is the court's; drops the article. | The court's passport deadline moves earlier | REWRITE |
| deadline.later | Passport deadline comes later | fx.deadline above 0; no choice in data.js uses it (sim.js:291). | Same as deadline.sooner. | The court's passport deadline moves later | REWRITE |
| rolls.easier | Moves here get easier | fx.mod below 0 at the current stop (sim.js:293, 343). |  |  | KEEP |
| rolls.harder | Moves here get harder | fx.mod above 0 at the current stop (sim.js:293, 343). |  |  | KEEP |
| hold.climb | The police stop you, one step further | fx.hold: climbHold moves the stop one rung up the ladder, rung 3 is house arrest (sim.js:294, 265-272). | Vague: "one step further" does not say toward what. | The police stop you, one step closer to house arrest | REWRITE |
| route.advance | Reach the next stop | fx.advance: you reach the next stop (sim.js:295, 347). | Reads as an instruction; the other effect chips state what happens. | You reach the next stop | REWRITE |
| run.ends | You lose | fx.end: the run ends in a loss (sim.js:296, 345). |  |  | KEEP |
| allies.slower | Your allies take two hours longer | fx.flag dark: every call placed from now on is due two hours later, for the rest of the run (sim.js:297, 437, data.js:449). | Says neither what takes longer nor for how long. | Every ally answers your calls two hours later from now on | REWRITE |
| lead.real_in | A true sighting, arriving in {hours} | Government fx.lead N: a true report of where she is at that moment reaches your desk N hours later (gov.js:232, 258-261). | Every clock says whose it is; "sighting" is not the word the reports list uses. | A true report of where she is now reaches your desk in {hours} | REWRITE |
| lead.real_now | A true sighting now | Government fx.lead 0: the same report arrives at once (gov.js:232). | Terms consistent with lead.real_in. | A true report of where she is now reaches your desk at once | REWRITE |
| lead.false | A false lead | Government fx.false: a misleading report about another stop (gov.js:233, 262-265). | Terms consistent: the desk calls these reports. | A false report about where she is | REWRITE |
| her.exposed | Harder for her to hide | Government fx.press: her police attention rises (gov.js:235, 272). |  |  | KEEP |
| her.warned | Her side is warned | Government fx.warn: her police attention falls, and a search on her stop loses her (gov.js:236, 273). | Passive voice hides who acts and leaves out the consequence. | Her side hears about it, and she gets harder to find | REWRITE |
| her.slips | Her plans slip by {hours} | Government fx.stall: her helpers' pending answers come N hours later (gov.js:237, 274, data.js:315). | Every clock says whose it is: "plans" is vague. | Her helpers' answers come {hours} later | REWRITE |
| line.harder | The line is harder to cross for {hours} | Government fx.crossing: a checkpoint at the line makes crossings harder for N hours from now (gov.js:238, 275). | Clock: say the hours start now. | Crossing the line is harder for the next {hours} | REWRITE |
| ban.confirmed | Ban confirmed at the post | Government fx.ban: travel ban on and confirmed at the post (gov.js:239, 276). | Fragment; brief term is "travel ban". | The post confirms the travel ban | REWRITE |
| ban.lost | Post loses the ban | Government fx.unban: the request drops from confirmed to sent; the travel ban itself stays on (gov.js:240, 277). | Overstates the effect; brief term "travel ban". | The post's travel ban is no longer confirmed | REWRITE |
| hold.esmeralda_moves | Costamar moves on your hold | Government fx.holdup: the request to Costamar to hold her is answered sooner, or is sent with an answer in three hours (gov.js:241, 278). | Makes no sense: "moves on your hold". | Costamar answers your request to hold her sooner | REWRITE |
| orders.easier | Orders are easier for {hours} | Government fx.dc below 0: orders need less for N hours from now (gov.js:243, 279). | Clock: say whose orders and that the hours start now. | Your orders are easier for the next {hours} | REWRITE |
| orders.harder | Orders are harder for {hours} | Government fx.dc above 0 (gov.js:243, 279). | Same as orders.easier. | Your orders are harder for the next {hours} | REWRITE |
| minister.pleased | Minister pleased | Government fx.minister up: standing rises, read in the debrief (gov.js:244, 280, 335). | Clipped fragment. | The minister is pleased | REWRITE |
| minister.angry | Minister angry | Government fx.minister down (gov.js:244, 280). | Clipped fragment. | The minister is angry | REWRITE |
| minister.sooner | The minister wants a town {hours} sooner | Government fx.sooner: the minister's deadline for a location moves up N hours (gov.js:245, 281). | Terms consistent: scene.minister_by says "a location". | The minister wants a location {hours} sooner | REWRITE |

## Design inconsistencies

- **Endings drop the run's cost on the escape side.** sim.js:345, 391, 392 and 488 build `s.over.reason` with `epilogue()` (sim.js:535-551: the sibling on the warrant, how often you were held, who talked, what happened to the party), but ui.js:277-279 shows only the one-line `over.why_*` text, so none of the `sim.end.*` lines ever reach the player.
- **Double period after every clock.** `clockText()` ends in "a.m." or "p.m." (sim.js:71). Templates that put a period after the clock print "p.m..": log.start_escape (ui.js:67), log.start_gov (ui.js:77), log.reply_by (ui.js:607), scene.minister_by (ui.js:104). The rewrites above move the clock off the end of the sentence; any other template that ends on `{time}` or `{clock}` has the same fault.
- **Rumor titles are a person's name.** A rumor dispatch sets its title to the ally's full name (sim.js:257, 304), so log.news prints "Holt Greer came in." and sum.news "Holt Greer is waiting under News" (ui.js:568, 614), which read as the person arriving. The rumor needs its own title in data, or the log needs a rumor branch.
- **Card and move names keep their capital mid-sentence.** ui.js:235 `inSentence` lowercases names that start with Your, Two, A, An or The, but summarize (ui.js:561-562), the log (ui.js:597, 604) and the markers card.gain and card.lose (sim.js:284-285, gov.js:242) pass the raw name: "You got The party machine", "You try The service door after dark", "You gain Registry access".
- **roll.win and roll.fail lowercase the whole effect list,** proper names included (sim.js:279, gov.js:230: `x.t.toLowerCase()`). A fail list prints "sosā searches where you are" and "your welcome in costamar moves up one step".
- **Figures below 10 come from code.** scene.held_again and round.held get `s.hold` as a figure ("step 2 of three", ui.js:116, 380); phone.waiting gets `messages.length` (ui.js:190, 636); sum.exposure_rose, sum.exposure_fell, sum.exposure_round, sum.exposure_round_here and sum.exposure_round_fell get `Math.abs()` (ui.js:542-543, 576). AP wants words below 10; `Sim.num` already does it (sim.js:77).
- **Report age on the government scene.** gov.js:138-141 builds "3 h old" with the abbreviation "h" in code, and measures from `r.hour`, which is the hour the report reached the desk (event hour plus delay, gov.js:51), not when she was seen. The same value shows twice, in `sosa-where` and `sosa-next` (ui.js:102-103).
- **scene.minister_by stays up after it stops mattering.** ui.js:104 shows it whether or not the minister already has a location (`flags.locationGiven`) and after the hour has passed.
- **`short()` abbreviates days** ("Sat 4 p.m.", ui.js:19, gov.js:291). AP does not abbreviate days of the week.
- **The police box repeats itself.** scene.sosa_here or scene.sosa_at (heading) and scene.sosa_right or scene.sosa_wrong (line) show at the same time and state the same fact (ui.js:112-113). The rewrites give the line the consequence instead.
- **ban.lost overstates the effect.** fx.unban only moves the request from confirmed to sent (gov.js:277); `c.flags.restriction` stays on, so crossings stay one harder.
- **card.lose_any hides which card goes.** fx.lose "best" takes the second passport first (sim.js:334; data.js holds rung 2), but the chip says only "a card" (sim.js:285).
- **The passport deadline chips give no amount.** deadline.sooner and deadline.later (sim.js:291) never say how many hours; the "noted" choice moves the deadline 10 hours with no line saying so (data.js:459). No choice in data.js uses deadline.later.
- **News-choice rolls show no chance.** roll.need (sim.js:279, gov.js:230) shows "Roll N or higher" without the percentage that every move preview shows (ui.js:145).
- **trust.test does not disclose its cost.** Testing an ally who works for the police turns them and takes every card they gave (sim.js:338); the chip only says you learn the truth.
- **hold.climb can do nothing.** In Costamar, climbHold returns early unless Valdória has asked Costamar (sim.js:269), but the chip still says the police stop you.
- **arrangement.moves is hard-coded to the welcome in Costamar** while fx.stage can name any arrangement (sim.js:290, 339). It is correct today only because speak_esm is the one user (data.js:431).
- **scene.label is wrong on the government side,** where the scene shows the suspected stop and the search team, not the player's position (render.js:91-94, shell.html:51).
- **phone.call_about opens a preview whose commit button is "Call"** (ui.js:199-200). The list label has no verb, and adding one pushes the longest case past six words.
- **Unused or unreachable strings:** place.the_line (no reader; ui.js:438 uses brief.the_line), the ui.json copy of arrangement.moves (sim.js:290 reads markers.json, content.js:21-28), render.search_team (fallback only; Data.GOV always exists, data.js:258), deadline.later (no positive fx.deadline in data.js).
- **Code fault next to a text call (not a copy issue):** at ui.js:601 the comment after `Render.float(...)` runs to the end of the line, so `Render.enqueue({ ... Sfx.heat ... })` and `break;` are commented out and case 'exposure' falls through into case 'belief'.

**Count:** 68 rewrites (plus 3 NEEDS-BUDGET), 102 keeps, 15 flags, 0 unknowns; 188 strings (146 ui.json entries, 42 markers).
