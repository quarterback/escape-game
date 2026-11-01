# Coalition: what a new player has to know, and how to stop requiring it

Audit of the active game in /home/claude/escape-game (src/ and content/coalition/), read from the point of view of a player who has never seen the Nelosphere. Nothing in the repo was changed.

**Snapshot.** The repo was being edited while this audit ran. Between 00:30 and 00:47 UTC on Nov. 1, 2026, ui.json changed `scene.sosa_here`, `scene.sosa_at`, `scene.next_move` and `brief.sosa` to say "Police" instead of "Sosā", rewrote `hint.phone` and `hint.gov_phone`, and added `recap.title` and `hint.call_first`. This audit uses the newer text where it exists and notes what the edit left behind.

**How first appearance was traced.** A normal escape run goes title screen, start screen (blurb and character cards), destination map, then the round 1 briefing (`showBrief` in src/ui.js), then round 1: News (an event or a rumor is drawn on arrival, `drawEvent` in src/sim.js), Phone (the sibling's message, `arrive` in src/sim.js), Move, Roll and the police phase. The Route and Deck tabs can be opened at any point from round 1, so anything they show counts as appearing in round 1. The demo (`newRun(null, true)`) skips the map and the briefing, and its coach card replaces both. The government run goes start card, then the round 1 briefing, with no map.

**Conventions in the proposed text.** Proposed strings keep today's names, so they work whatever rename is chosen. Where a rename would change a string, the Rename section says so. `{rel}` means the sibling's relationship ("brother" or "sister"); several strings need it as a new argument because today they only get `{sib}` or the word "sibling".

---

## 1. Name inventory

R1 means round 1 of a normal escape run; "before round 1" means the screens before the first briefing. Gov R1 means round 1 of the government run.

### Places and countries

| Name | What it is | Where it first appears | Is its role explained at that point? | Ambiguity | Proposal |
|---|---|---|---|---|---|
| Valdória | The player's own country | Start screen, `start.blurb` (before round 1) | Partly: "the court will not let you leave Valdória" implies a country | Low; the -ia ending reads as a country | Keep. First mention "your country, Valdória" |
| Portô Venla | Valdória's capital, where the player lives | Scene header R1, `LEVELS[0].name` "The residence, Portô Venla"; in the demo, step `work_while_driving` | No. Nothing says it is the capital until R2's radio message role ("the station everyone in the capital has on") | Low as a word; the reader cannot tell it is the capital | Keep. First mention "Portô Venla, the capital" |
| the residence | The player's house in the capital | Briefing R1 title `LEVELS[0].short` "Residence"; `brief.the_residence` | Mostly: `LEVELS[0].arrive` says "the house" | Medium: "residence" sounds official, like a state residence | Ordinary description first: "your house" |
| Santa Laura | Provincial town on the road south; police commander and provincial desk sit here | Briefing R1 route strip; Deck R1 (`CARDS.decoy_cars.works`) | No. First explained by `LEVELS[1].name` "The road south" on arrival (R2) | Low; "Santa" marks a place, though Laura is a woman's name | Keep. First mention "Santa Laura, a town on the road south" |
| Nova Trentô | Farm settlement with a cooperative; Nonā Rosa's home | Briefing R1 route strip | No. The word "colônia" first appears in R2's objective | Low as a place; "colônia" is untranslated Portuguese | Keep the name. Replace "colônia" with "farm settlement" in player text |
| the colônia | Nova Trentô as a settlement | R2 objective `LEVELS[1].objective` | No | High for English readers: a foreign word with no gloss | Ordinary description: "the farm settlement" |
| Salta | Rail town where the midnight freight leaves for the border | Briefing R1 route strip; `brief.reception_note` R1 | No. `LEVELS[3].name` "The rail town, Salta" appears only on arrival | Low; reads as a place | Keep. First mention "Salta, the rail town" |
| the line | The border | Briefing R1 route strip (`LEVELS[4].short` "The line"); Deck R1 (`card.counts_at`, `place.the_line`) | No. The Route tab labels the same stop "The border" (`route.border`), so the two names sit side by side | High: "the line" also means a phone line ("Keep him talking" on the line, "Your sponsor's line to the ministry", `hint.gov_phone` "on the line") | Rename the term to "the border" everywhere in player text |
| Huhūi passes | Mountain passes the border runs through | Deck R1, `CARDS.passport.works` "The Paso Huhūi post"; scene tap on Holt ("brakeman on the Huhūi freight") | No | Medium: an unfamiliar word with no category; "the Huhūi freight" reads as a company | Keep as a secondary name: "the mountain passes at the border (the Huhūi passes)" |
| Paso Huhūi | The rail crossing at the border | Deck R1, `CARDS.passport.works` | No | Medium: "Paso" signals a pass to Spanish readers only | Ordinary description first: "the rail crossing at Paso Huhūi" |
| Ālto Verdē | The mountain road crossing toward Baca | Border arrival, `LEVELS[4].arrive` (round 5 or later); `CARDS.intro_vel.works` | Yes on arrival ("the road post at Ālto Verdē") | Low | Ordinary description first: "the mountain road crossing at Ālto Verdē" |
| Punta Marēa | The coast road crossing, run by guards who answer to the port | Border arrival `LEVELS[4].arrive` | Yes on arrival ("toward the coast") | Low | Ordinary description first: "the coast road crossing at Punta Marēa" |
| Esmeralda | The neighboring country; the jet leaves from its airfield | Start screen `start.blurb` (before round 1); government start card `GOV.blurb` | Partly: "across the border in Esmeralda" | High: a common woman's name. "Esmeralda expects you", "Esmeralda will hold her", "Esmeralda moves on your hold" read as a woman acting. Owner canon (src/data.js header) | Rename (working proposal) or always pair it with "the country" and "its government" |
| Baca | The Esmeraldan city that holds its government, its interior ministry and Valdória's embassy | Route tab R1 `need.baca` "Call your sibling to reach Vélez in Baca."; Phone R1 reply `sim.line.i_have_a_name_in`; Gov R1 Deck card "From The embassy in Baca" | No. Nothing ever says Baca is a city or Esmeralda's capital | High: Baca is a common surname. "Baca has your name", "Baca says it is a judicial matter", "Baca answers in 10 hours", "Baca has closed its guest room to you" read as a person. Owner canon | Rename (working proposal) or replace with "Esmeralda's government" in player text and keep "Baca" as the capital's name on first mention |
| Susana | The Esmeraldan airfield town the jet leaves from; it has a port | Start screen `start.blurb` "a jet that can fly you out of Susana" (before round 1) | No at that point. The map's `map.sub` first says "Susana airfield" | High: a woman's name. "fly you out of Susana", "Capitān Olsēn, charter pilot, Susana", "The operator in Susana goes quiet" read as a person. Owner canon | Rename (working proposal); always "Susana airfield" at minimum |
| Esmeraldan airspace | The win condition | Scene header R1, `scene.goal` "Leave Esmeraldan airspace by" | No; requires knowing Esmeralda is where the airfield is | Medium | Ordinary description: "Take off from the airfield across the border by" |
| Atlanta | Destination country A (accepts the player); city Lāyūna | Map (before round 1); demo step `call_sponsor` "He can get Atlanta to let you in" | Map: the header "Atlanta" sits over a sponsor blurb, so it reads as a country only by context. In the demo, never | Very high for American players: a real US city. The map pin labels the city (Lāyūna) in bold and the country (Atlanta) underneath, which makes Atlanta look like the region and Lāyūna the town inside it | Rename (working proposal) |
| Lāyūna | City in Atlanta where the jet would land | Map pin label; Phone R1 `sim.opt.confirm_destination` "Confirm Lāyūna"; demo step `answer_brother` | Map: yes, as a pin. Phone: no; the map buttons name the country, the phone option names the city | Medium: the player picked "Atlanta" and is asked to confirm "Lāyūna" | Keep. Pair it with the country: "Lāyūna, in Atlanta" |
| Tarun | Destination country B (refuses); city Almatau | Map | By context only | High: a common man's first name. "Tarun never agreed to take you" reads as a man refusing | Rename (working proposal) |
| Almatau | City in Tarun (a working name, per src/data.js) | Map pin | Yes, as a pin | Low; reads as a place | Keep |
| Zaryanova | Destination country C (refuses); city Gannibal | Map | By context only | High: -ova is a Slavic women's surname ending. "Zaryanova never agreed to take you" reads as a woman | Rename (working proposal) |
| Gannibal | City in Zaryanova | Map pin | Yes, as a pin | High: reads as Hannibal, a person | Rename (working proposal) |
| the province | The province around Santa Laura | Events "The province goes dark", `gov.inquiry.the_minister_names_on_the` | No | Low | Keep; "the province" is self explaining |
| the coast, the coast road | Where the radio and the party place the player as a decoy | Events (`selfie`, `hitchhiker`) and the radio message R2 | Partly | Low | Keep |

### People

| Name | What it is | Where it first appears | Is its role explained at that point? | Ambiguity | Proposal |
|---|---|---|---|---|---|
| Teresā Albukerkē | Playable candidate who lost the election | Start character card (before round 1) | Partly: the card shows a sibling and a blurb. "The defeated candidate" appears only in the `whoami` header and the log once play starts | Low | Keep. Add "lost Saturday's election" to the card |
| Matēu Zanetī | Second playable candidate | Start character card | Same as Teresā | Low | Keep |
| Duartē Albukerkē / Līviā Zanetī | The sibling abroad arranging the jet and Esmeralda's help | Start card `start.sibling_her` "Her brother Duartē is finding the jet" | Yes | Low | Keep. Calls and steps should say "your brother, Duartē" |
| Gianlūka Moretī | Party chief of staff; gives the party machine and the held report | Deck R1 card "From Gianlūka Moretī"; Move R1 `partycar` text; News R1 events `cameras`, `summons`, `selfie`; rumors | No. His role ("party chief of staff") appears only when a player taps his figure in the scene (`log.person_role`) or reads the Route tab | Medium: "Gianlūka wants cameras" works as a name, but the reader does not know why he matters | Introduce: "Gianlūka Moretī, your party's chief of staff" |
| Nando | Driver for 11 years; gives the decoy cars | Deck R1 card "From Nando"; Move R1 chip "Nando: Trusts you" | No, except by scene tap | Low | Introduce: "Nando, your driver" |
| Inspector Valentīn Sosā | Interior Ministry inspector, head of the departure inquiry; the police search | Briefing R1 `brief.police_attention` "while Sosā searches where you are"; scene `scene.sosa_right` "He is searching..."; phase bar label `phase.sosa`; Route tab `route.inquiry_here`; demo step `map`; Gov R1 Deck card "From Inspector Sosā" | No. The escape side states his role only at the airfield, under his name on the phone (`ENEMY.role`), on the last stop | High: a bare surname standing for the police | Ordinary description first ("the police"); introduce by name at the end of R1 (section 3) |
| Rosario Vélez | Aide to Esmeralda's interior minister; can put officials at a border crossing | Briefing R1 `brief.reception_note`; Route tab R1 ("Who can help here" at the border, `route.velez_starts`); Phone R1 call preview `sim.status.arrange_reception_through_your_sibling` | No. The stage line that introduces her (`STAGE_LINES.reception[1]`) never displays because of the `s.arr[k].low` bug in docs/design-issues.md item 1 | High: her name carries a whole mechanic (the third step of Esmeralda's help, a card, a border crossing) before the player knows who she is | Introduce at the first call preview; replace "Vélez's people" and "Vélez's card starts counting here" with ordinary descriptions |
| Bīr Amādū Salek / Dēvan Rāo / Mirēlā Vosk | Sponsor who asks the destination's foreign ministry for the visa | Map destination button (`DESTS.*.sponsor.asks`) | Yes, by role ("a banker who knows your family"). In the demo, Salek appears in step `call_sponsor` with no role | Low, except "the ministry" in the same sentence (see institutions) | Keep. Fix "the ministry"; give Salek a role in the demo |
| Nonā Rosa Trentinī | Matriarch of the Nova Trentô settlement; room, phone, truck, grandson | Route tab R1 ("Who can help here" at Nova Trentô); in play, the Nova Trentô arrival (`LEVELS[2].arrive`) | No. The arrival says "Nonā Rosa offers a room and a phone" with no role | Medium: "Nonā" (grandmother) reads as a first name | Introduce: "Nonā Rosa Trentinī, the matriarch of the farm settlement" |
| Nonā Rosa's grandson | A 19 year old who knows the rail yard | Nova Trentô event `grandson` | Yes | Low | Keep |
| Holt Greer | Brakeman on the midnight freight | Route tab R1; in play, the Salta arrival "Holt and Theo can get you aboard" | No at Salta arrival | Low | Introduce by job at Salta |
| Theo Bascom | Yard foreman in Salta | Same as Holt | No | Low | Introduce by job at Salta |
| the yardmaster | Salta yardmaster who reports the player | Salta objective `LEVELS[3].objective` | Yes ("will sell you to Sosā") | Low | Keep; replace "Sosā" with "the police" |
| Capitān Olsēn | Charter pilot at Susana | Route tab R1; in play, the airfield | Yes by role ("charter pilot, Susana") | Low; "Susana" in the role reads as a person | Keep. Role "charter pilot at Susana airfield" |
| Sofīā Leōnī | Playable government aide | Start card | Partly: "Aide to the incoming government". about.p7 and the government demo say "aide to the incoming minister" | Medium: whose aide, and is the incoming government in office? | Introduce with one title (owner decision, see open questions) |
| the minister | Valdória's interior minister, Sofīā's superior | Gov R1 phone message, role `gov.name.interior_minister` | Yes, the phone role says "Interior minister" | Medium: Esmeralda also has an interior minister (Vélez's boss) | Always "the interior minister" on the government side; "Esmeralda's interior minister" for the other |
| the president | Calls with a deal: concede on camera and the case closes | Event `rival_deal` at the border or airfield; endings `over.why_deal`, `over.why_gov_deal`, `daily.deal` | No | High: unclear whether this is the election winner or the sitting president | Owner decision (open question 1), then "Valdória's president" or "the man who beat you" |
| the Santa Laura commander | Police commander behind the provincial patrol card | Gov R1 Deck card "From The Santa Laura commander" | Partly | Low | "The police commander in Santa Laura" |
| the ambassador | Esmeralda's ambassador in Portô Venla | Gov event `dinner` | Partly ("the Esmeraldan embassy") | Low | Keep |
| the cook's nephew, the bishop, the duty judge, the general, the sergeant, a rival aide | One scene characters | Events | Yes | Low | Keep |

### Institutions, operations and groups

| Name | What it is | Where it first appears | Is its role explained at that point? | Ambiguity | Proposal |
|---|---|---|---|---|---|
| the inquiry, the departure inquiry | The Interior Ministry's police operation to stop the player leaving | Teresā's start card blurb "A friend inside the inquiry warns her when the police move" (before round 1); Deck R1 card "A friend in the inquiry" | No | High: "inquiry" can mean a hearing or a commission | Ordinary description first: "the police inquiry" or "the police search" |
| Sosā (as a phase and box name) | The police turn | Phase bar `phase.sosa` R1; `hint.sosa` "See what Sosā and your allies did." | No | High | Rename the phase "Police" |
| the watch, the watch team | Two unmarked police cars and four officers outside the house | R1 objective `LEVELS[0].objective` "Get past the watch."; Gov R1 Deck card | Partly: the R1 arrival says "Two unmarked cars watch the house" but never says police | Medium | Ordinary description first: "the police cars watching your house" |
| the Interior Ministry (Valdória) | Sosā's ministry; traces calls, briefs papers, threatens the operator | Escape: only `ENEMY.role` at the airfield; otherwise "the ministry" unqualified | No | High (see next row) | Always "Valdória's Interior Ministry" on first mention in a string |
| "the ministry" | Means three different bodies: Valdória's Interior Ministry (`ENEMY_ACTIONS` trace, press_story, lean_operator), the destination country's foreign ministry (sponsor `asks`, `terms`, `sim.status.ask_salek_to_seek_visa`, `sim.line.the_ministry_has_not_called`), and Esmeralda's interior ministry (`post_high` text, `gov.line.esmeralda_will_hold_her_if`) | Map R0 (foreign ministry); R1 police phase (Interior Ministry) | No | Very high: the player cannot tell which ministry is acting on them | Name the country every time: "Valdória's Interior Ministry", "Atlanta's foreign ministry", "Esmeralda's interior ministry" |
| the court | Court that barred the player from leaving and wants the passport | R1 arrival | Yes | Low | Keep |
| the party, the party machine | The player's political party; card from Gianlūka | Deck R1 card "The party machine" | Partly | Low | Keep; tie it to Gianlūka's role |
| the provincial desk(s), the Santa Laura desk | Provincial police office and patrol | Gov R1 Deck card "The provincial desk's patrol"; gov scene `gov.scene.provincial_desks_santa_laura` | No; "desk" is newsroom and police slang | Medium | "The provincial police in Santa Laura" |
| the civil registry | Records office | Gov event `tipster` ("Trace the call instead" needs it); Gov card | Partly | Low | Keep |
| the aviation desk | Valdórian office that can review the charter company's license | Gov R1 request `gov.label.open_a_licence_review_on` | No | Medium | "The aviation office" |
| the embassy in Baca | Valdória's embassy in Esmeralda's capital | Gov R1 ghost card "From The embassy in Baca"; escape police action `ask_esmeralda` | No: the reader cannot tell whose embassy it is | High: the government side also meets "the Esmeraldan embassy" (event `dinner`), which is Esmeralda's embassy in Portô Venla | "Valdória's embassy in Baca" |
| the Esmeraldan embassy | Esmeralda's embassy in Portô Venla | Gov event `dinner` | Partly | Medium (see above) | "Esmeralda's embassy in Portô Venla" |
| Esmeraldan officials, Vélez's people | Officials who meet the player at one crossing | Briefing R1 needs; Route tab `need.velez` | Partly | Medium | "Esmeraldan officials" |
| the post, border posts | Border crossings and their guards | Briefing R1 `brief.reception_note`; Deck R1 | Partly | Low | "border crossing" in player text; "the guards" for the people |
| the charter operator | Charter company at Susana with a Valdórian license | Police action `lean_operator` (hour 12 or later); gov request | No | Medium: "operator" sounds like a phone operator, which `watch_sibling` reinforces ("The operator in Susana goes quiet") | "the charter company at Susana airfield" |
| Rādiô Portô Venla | Radio station in the capital | Phone R2 (Santa Laura), role under the name | Yes ("the station everyone in the capital has on") | Low | Keep. Gov event `photo` calls it "A paper", which conflicts |
| the cooperative | Nova Trentô's farm cooperative | Nova Trentô arrival | Partly | Low | Keep |
| the ministry press office | Interior Ministry press office | Gov order `story` "done by the ministry press office" | Partly | Low | "the Interior Ministry press office" |
| federal police, river police, the rail union, the air force, the carrier | One scene groups | Events | Yes | Low | Keep |
| the Nelosphere | The author's fictional world | Title foot and start byline (credit) | No, and does not need to be | Low | Keep (owner's credit wording) |

### Cards named after people

| Card (`CARDS` or `GOV_CARDS` id) | Current name | First appears | Problem | Proposal |
|---|---|---|---|---|
| `aide_word` | The party machine | Deck R1 | Owner (Gianlūka) unintroduced | Keep name; text "Gianlūka Moretī, your party's chief of staff, can get a mayor, a judge or a border post on the phone for you." |
| `informant` | A friend in the inquiry | Deck R1 (Teresā) | "inquiry" and "Sosā" in the text | "A friend inside the police inquiry" |
| `decoy_cars` | Two more cars like yours | Deck R1 | Fine | Keep |
| `delay_report` | A report held one day | Deck R1 (alt) or after the party car | "report" is vague | Keep name; text names the travel ban (it already does) |
| `truck` | The colônia's grape truck | Nova Trentô | "colônia" | "The cooperative's grape truck" |
| `crate` | Holt's chalk-marked crate | Salta | Fine once Holt is introduced | Keep |
| `yard_walk` | Theo walks you through | Salta | Fine once Theo is introduced | Keep |
| `grandson` | Nonā Rosa's grandson | Nova Trentô | Fine | Keep |
| `intro_vel` | Rosario Vélez's card | Second step of Esmeralda's help | Vélez may still be unintroduced; "card" is both a game card and a business card | "Rosario Vélez's card" kept; text in section 4 |
| `sponsor_line` | Your sponsor's line to the ministry | After the first visa call | "line" and "the ministry" | "Your sponsor's contact at the foreign ministry" |
| `watch` (gov) | The watch team, from Inspector Sosā | Gov R1 Deck | Sosā unintroduced | From "Inspector Sosā, head of the police inquiry" |
| `desk` (gov) | The provincial desk's patrol, from The Santa Laura commander | Gov R1 Deck | "desk"; capital "The" mid sentence | "The provincial police patrol", from "the police commander in Santa Laura" |
| `esm_intro` (gov) | An Esmeraldan introduction, from The embassy in Baca | Gov R1 Deck (as a ghost card) | Whose embassy; which interior ministry | From "Valdória's embassy in Baca"; text "A name at Esmeralda's interior ministry who will take your call." |
| `operator` (gov) | The operator's license | Gov request | "operator" | "The charter company's license" |

---

## 2. Rename

Every new name below is a **working proposal** for the owner to accept, change or reject. None is a Nelôxi word; each uses an ordinary descriptive form or a place suffix that English readers already read as a place. Esmeralda, Baca and Susana are recorded as owner canon in the header of src/data.js, and Atlanta, Lāyūna and Gannibal come from the kels canon, so each rename is offered with a fallback that keeps the canon name and fixes the ambiguity with a descriptor.

### Atlanta (destination country)
- **Why.** For American players this is a real city in Georgia. The map makes it worse: the pin shows "Lāyūna" in bold and "Atlanta" under it, which reads as a neighborhood inside Atlanta. In the demo the player never sees the map, so "He can get Atlanta to let you in" (step `call_sponsor`) arrives with no sign that Atlanta is a country.
- **Working alternatives.** "Atlantia" keeps the canon root and the -ia ending marks a country the way Valdória does. "The Lāyūna Republic" names the country after its city, which the player already confirms on the phone.
- **Fallback.** Keep "Atlanta" and write "the country of Atlanta" on the map header and in every first mention.

### Tarun (destination country)
- **Why.** Tarun is a common man's first name. "Tarun never agreed to take you, and the men at the foot of the stairs are police" (`DESTS.tarun.landing`) reads as a man refusing.
- **Working alternatives.** "Tarunia" (country ending). "The Tarun Republic."
- **Fallback.** "the country of Tarun" on first mention in each screen.

### Zaryanova (destination country)
- **Why.** The -ova ending is a Slavic women's surname form, so the country reads as a woman ("Zaryanova never agreed to take you").
- **Working alternatives.** "Zaryania." "The Zaryan Federation."
- **Fallback.** "the country of Zaryanova."

### Gannibal (city in Zaryanova)
- **Why.** Reads as Hannibal, a person. The map label sits beside "Mirēlā Vosk, a former trade envoy in Gannibal", which puts two personal names in one line.
- **Working alternatives.** "Gannibalsk" (a city suffix that matches its real ground, the coordinates of Vladivostok in `DESTS.zaryanova`). "Port Gannibal" (reads as a city at once, but it adds a port, which the data does not state; owner call).

### Esmeralda (the neighboring country)
- **Why.** A common woman's name, and the game uses it as the subject of verbs constantly: "Esmeralda expects you", "Esmeralda will hold her if she appears", "Esmeralda moves on your hold", "Past the border, your patrols need Esmeralda's agreement". A new player hears a woman.
- **Working alternatives.** "Costa Esmeralda" keeps the canon root and the first word marks a place; the country has a coast (the Punta Marēa crossing leads "toward the coast" and the airfield sits "behind the port"), so it adds no new fact. "The Esmeralda Republic."
- **Fallback.** Keep "Esmeralda" for the country and use "Esmeralda's government" whenever the country acts. Most of the gain comes from that second change, which section 4 applies.

### Baca (Esmeralda's seat of government)
- **Why.** Baca is a common surname, and the game uses it as a speaker: "Baca has your name", "Baca says it is a judicial matter", "Baca answers in 10 hours", "Baca has closed its guest room to you". It first appears in round 1 on the Route tab ("Call your sibling to reach Vélez in Baca.") with nothing to say it is a city.
- **Working alternatives.** "Ciudad Baca", in the Spanish forms Esmeralda already uses (Paso, Punta, Capitān). "Baca City."
- **Fallback.** Keep "Baca" as the city name and remove it as an actor: write "Esmeralda's government" or "Esmeralda's interior ministry" wherever Baca does something, and introduce the city once as "Baca, Esmeralda's capital" (owner to confirm it is the capital; see open questions).

### Susana (the departure airfield and its town)
- **Why.** A woman's name. "A jet that can fly you out of Susana" (`start.blurb`), "Capitān Olsēn, charter pilot, Susana" and "The operator in Susana goes quiet for a while" all read as a woman. The name also sits next to Esmeralda in the same sentences, so the start screen reads as two women.
- **Working alternatives.** "Porto Susana"; the airfield is "the charter apron behind the port" (`LEVELS[5].arrive`), so the port is canon and "Porto" marks the town. "Susana Port."
- **Fallback.** Never use "Susana" alone. Always "Susana airfield", and "the airfield" after first mention.

### "the line" (the border)
- **Why.** A term rename. "The line" is used for the border, a phone line and a contact ("Your sponsor's line to the ministry"), and the Route tab already labels the same stop "The border".
- **Proposal.** "The border" everywhere in player text: `LEVELS[4].short`, `LEVELS[4].name` ("The border crossings in the Huhūi passes"), `place.the_line`, `brief.the_line`, `route.card_stops_line`, the `place()` helper in src/gov.js and `fill()` in src/sim.js.

### "the colônia" (Nova Trentô)
- **Why.** An untranslated word with no gloss.
- **Proposal.** "The farm settlement at Nova Trentô"; "the settlement" after that. Applies to `LEVELS[1].objective`, `LEVELS[2].name`, `LEVELS[1].approaches.barge.text`, `CARDS.truck.name`, `PEOPLE.host.role`, `EVENTS.bishop.text`, `gov.report.someone_stayed_at_the_col`.

### Names kept
Valdória, Portô Venla, Santa Laura, Nova Trentô, Salta, Lāyūna, Almatau, Ālto Verdē, Punta Marēa, Paso Huhūi and Rādiô Portô Venla all read as places or a station once a function word sits in front of them. All people's names are kept.

---

## 3. Introduce

Each entry gives the first point where the player meets the name in a normal run, then the wording to put there. Later mentions can use the short name.

### Inspector Valentīn Sosā and the inquiry
- **Today.** The escape side never introduces him. He is a bare surname in the round 1 briefing (`brief.police_attention`), the phase bar (`phase.sosa`), the Route tab (`route.inquiry_here`), effect chips (`search.elsewhere`, `search.finds`, `search.loses_move`) and the demo step `map`. His role ("Interior Ministry, head of the departure inquiry") appears only under his name on the phone at the airfield, the last stop. The concurrent edit changed the box header to "Police are searching where you are", but `scene.sosa_right` and `scene.sosa_wrong` still start "He is searching", so the box now has a "He" with nobody to refer to.
- **Proposal.** Call him "the police" through the whole of round 1. At the end of round 1, put one line at the top of the police phase card, shown once per run (new string `intro.sosa`):
  > "Inspector Valentīn Sosā of Valdória's Interior Ministry runs the police inquiry into your escape. His officers are the ones searching for you."
- From round 2, "Sosā" may appear as an extra identifier beside "the police" (for example "Sosā's police search Santa Laura"), never in place of it. The phase stays "Police".
- **Demo.** Put the same sentence in step `inquiry_acts`, the first step about the police turn.
- **Government side.** First mention is the Deck card `watch` "From Inspector Sosā" and the order `press` "done by Inspector Sosā". Proposed `GOV_CARDS.watch.from`: "Inspector Sosā, who runs the police inquiry". Proposed `GOV_ORDERS.press.who`: "Inspector Sosā, head of the police inquiry".

### Gianlūka Moretī
- **Today.** First seen as the source of the Deck card "The party machine", in the round 1 move "The party's official car", in round 1 news (`cameras`, `summons`, `selfie`) and possibly in a round 1 rumor whose title is only his full name.
- **Proposal.** Every round 1 string that names him first says "Gianlūka Moretī, your party's chief of staff". After that, "Gianlūka". The rumor title becomes "A rumor about {name}, {role}" (new string `rumor.title`).

### Nando
- **Today.** Card source "From Nando", move chip "Nando: Trusts you".
- **Proposal.** Card text "Nando, your driver for 11 years, has two matching sedans and two friends who will drive them the wrong way." Move chip "Nando, your driver, trusts you" (see section 4 for the chip pattern).

### Rosario Vélez
- **Today.** Named in the round 1 briefing (`brief.reception_note`, "Vélez's officials"), on the Route tab ("Vélez's card starts counting here", "Call your sibling to reach Vélez in Baca") and in the first reception call preview. The only line that introduces her (`STAGE_LINES.reception[1]`, "I reached Rosario Vélez, the minister's aide in Baca") never shows, because `stage()` in src/sim.js compares against `s.arr[k].low`, which is never set (docs/design-issues.md item 1).
- **Proposal.** Keep her out of round 1 text; say "Esmeraldan officials" and "Esmeralda's government". Introduce her in the first reception call preview (`sim.status.arrange_reception_through_your_sibling`):
  > "Your brother asks Esmeralda's government to expect you. He knows Rosario Vélez, an aide to Esmeralda's interior minister. Later she can put officials at one border crossing to meet you."
- Fixing the stage line bug would give her a second, spoken introduction; the proposal does not depend on it.

### Nonā Rosa Trentinī
- **Today.** The Nova Trentô arrival says "Nonā Rosa offers a room and a phone."
- **Proposal.** `LEVELS[2].arrive`: "Nonā Rosa Trentinī, the matriarch of the farm settlement, offers you a room and a phone. The cooperative's truck was impounded this morning." `PEOPLE.host.role`: "matriarch of the Nova Trentô farm settlement".

### Holt Greer and Theo Bascom
- **Today.** The Salta arrival says "Holt and Theo can get you aboard."
- **Proposal.** `LEVELS[3].arrive`: "The midnight freight train climbs from here to the border. Holt Greer, a brakeman on the train, and Theo Bascom, the yard foreman, can get you aboard." `PEOPLE.holt.role`: "brakeman on the midnight freight to the border".

### Capitān Olsēn
- **Proposal.** `PEOPLE.pilot.role`: "charter pilot at Susana airfield".

### The sponsor (Salek, Rāo, Vosk)
- The map already introduces each by role. In the demo, which skips the map, step `call_sponsor` must give Salek's role (section 4).

### The interior minister (government side)
- **Proposal.** `gov.name.the_minister` "The minister" becomes "The interior minister" on the first message; `brief.minister_expects` "The interior minister expects a town by {time}."

### Sofīā Leōnī
- **Today.** Two titles: "aide to the incoming government" (`GOV.title`, the start card) and "aide to the incoming minister" (about.p7, government demo per docs/design-issues.md). Her orders run through the Interior Ministry and its police.
- **Proposal.** One title, chosen by the owner (open question 2). The start card should then say who she works for and who works for her, for example: "Aide to the interior minister. Inspector Sosā's police inquiry takes your orders." The second sentence is supported by the orders "done by Inspector Sosā" and the Deck card "The watch team, from Inspector Sosā", but the owner should confirm the chain of command before it ships.

### The candidate, on the government side
- **Today.** The government briefing never says who she is. The only line that does is `log.start_gov`, inside the collapsed log.
- **Proposal.** A first briefing story line (new string `brief.gov_who`): "{target} lost Saturday's election. The court has barred her from leaving Valdória and wants her passports by Monday noon. Her immunity runs until Tuesday at 2 p.m., and your job is to stop her from flying out before then."

### Esmeralda's government and Valdória's embassy
- **Proposal.** The first escape mention of Esmeralda acting (`brief.need_reception` already says "Help from Esmeralda's government") stays the anchor. On the government side, the first request preview names "Valdória's embassy in Baca" and "Esmeralda's government".

---

## 4. Ordinary description first

Each row: where the string lives, what it says now, what it should say. Complete for the screens before round 1 and rounds 1 and 2 of each side; representative after that. Where a string needs a new argument (`{rel}`, `{country}`, `{city}`), the row says so.

### 4.1 Before round 1 (escape)

| Id or data path | Current | Proposed |
|---|---|---|
| `start.blurb` | You lost the election, and the court will not let you leave Valdória. Your family has found a jet that can fly you out of Susana, across the border in Esmeralda, but nobody has agreed to take you in yet. | You lost Saturday's election, and the court has barred you from leaving your country, Valdória. Your family has found a jet at Susana airfield, across the border in the country of Esmeralda. No country has agreed to take you in yet. |
| `CHARACTERS.woman.blurb` | A friend inside the inquiry warns her when the police move. Border guards know her face. | A friend inside the police inquiry warns her when the police move. Border guards know her face. |
| `CHARACTERS.woman.edge` | A friend inside the inquiry | A friend inside the police inquiry |
| `CHARACTERS.man.blurb` | The family barges can carry him down the river. Police have watched his house since the count. | The family barges can carry him up the river. Police have watched his house since the vote count. (The move `barge` goes "upriver"; "down the river" contradicts it.) |
| `GOV.blurb` | Keep the candidate from flying out before Tuesday at 2 p.m. Past the border, your patrols need Esmeralda's agreement. | Stop the candidate who lost the election from flying out before Tuesday at 2 p.m. Your patrols cannot act across the border in Esmeralda until its government agrees. |
| `map.title` | Pick a country | Pick the country you will fly to |
| `map.sub` | Esmeralda will let you fly out from Susana airfield, once you cross the border to reach it. | Your jet will leave from Susana airfield in Esmeralda, the country across the border. Esmeralda will let you fly out from there once you cross. |
| `map.here` | Valdória, where you are | Valdória, your country |
| `map.via` and `PLACES.susana.name` (SVG label) | Susana, where you fly from | Susana airfield, where you fly from |
| Map button header (`drawChoices`, `d.name`) | Atlanta | Atlanta, with a subline "Lands at the city of Lāyūna" (new string `map.city`, args `{city}`) |
| `DESTS.atlanta.sponsor.asks` | Salek, a banker who knows your family, can ask the ministry for your visa. He wants the family accounts in return. | Bīr Amādū Salek, a banker who knows your family, can ask Atlanta's foreign ministry for your visa. He wants the family accounts in return. |
| `DESTS.tarun.sponsor.asks` | Rāo, a magistrate in Almatau, can write to the ministry for your visa. He is slow, and he wants your word that you will stay out of politics. | Dēvan Rāo, a magistrate in the city of Almatau, can write to Tarun's foreign ministry for your visa. He is slow, and he wants your word that you will stay out of politics. |
| `DESTS.zaryanova.sponsor.asks` | Vosk, a former trade envoy, can take your visa request to the ministry. She wants mineral rights you do not control. | Mirēlā Vosk, a former trade envoy in Gannibal, can take your visa request to Zaryanova's foreign ministry. She wants mineral rights you do not control. |
| `map.hint` | Your second passport gets you on the plane. You also need an entry visa from the country you pick. | Keep. |

### 4.2 Escape, round 1: briefing

| Id or data path | Current | Proposed |
|---|---|---|
| `b-title` (`LEVELS[0].short`) | Residence | Your house |
| `LEVELS[0].arrive` (briefing story) | Two unmarked cars watch the house. The court has barred you from leaving and wants your passport handed in by Monday noon, and the travel ban lists that passport. Your second passport, which no list names, is in your coat. | Two unmarked police cars watch your house in Portô Venla, the capital. The court has barred you from leaving the country and wants your passport handed in by Monday noon, and the travel ban lists that passport. Your second passport, which no list names, is in your coat. |
| Briefing route strip (`briefRoute`, `L.short`) | Residence, Santa Laura, Nova Trentô, Salta, The line, Susana | Function first, name second (new strings `stop.fn_0` to `stop.fn_5`): Your house / Road south, Santa Laura / Farm settlement, Nova Trentô / Rail town, Salta / Border / Airfield, Susana |
| `brief.hours_escape` | Hours until your escape deadline, Tuesday at 2 p.m. Then your immunity ends and you can no longer leave the country. | Hours until your escape deadline, Tuesday at 2 p.m. Until then you have immunity from arrest. When it ends, you can no longer leave the country. (Immunity from arrest is from the owner's stated government goal in memory, Oct. 31, 2026.) |
| `brief.police_attention` | Police attention is {n} out of {max}, and it rises while Sosā searches where you are. At {max} the police stop you, and each stop within 12 hours of the last is one step worse: questions, a night at the station, then house arrest. | Police attention is {n} out of {max}. It rises while the police are searching the place where you are. At {max} the police stop you, and each stop within 12 hours of the last is one step worse: questions, a night at the station, then house arrest. |
| `LEVELS[0].objective` (This round) | Get past the watch. | Get past the police cars watching your house. |
| `brief.phone_suggest` with `call.name` | The call that helps most now is Call Duartē Albukerkē about the jet. | The call that helps most now is to your {rel}, {sib}, about the jet. (Today the sentence embeds a button label and reads "is Call".) |
| `brief.escape_win` | Fly out of Susana before Tuesday at 2 p.m. | Fly out from Susana airfield, across the border, before Tuesday at 2 p.m. |
| `brief.reception_note` | The first step opens the road to Salta, the second cancels the extra takeoff trouble if Sosā has asked Esmeralda to hold you, and the third puts Vélez's officials at one border post. | Esmeralda's government helps in three steps. When it expects you, the road up to the rail town opens. At the second step, the extra trouble at takeoff goes away if Valdória has asked Esmeralda to hold you. At the third step, Esmeraldan officials wait for you at one border crossing. |
| `ARRANGEMENTS.reception.stages` (done and left lists) | Esmeralda expects you / Esmeralda's minister knows you are coming / Esmeraldan officials waiting at a border post | Esmeralda's government expects you / Esmeralda's interior minister knows you are coming / Esmeraldan officials waiting at a border crossing |
| `ARRANGEMENTS.aircraft.stages` | charter jet booked, crew hired, fueled at Susana, ready to fly at Susana | charter jet booked, crew hired, fueled at Susana airfield, ready to fly at Susana airfield |
| `ARRANGEMENTS.reception.name`, `arr.what_reception`, `brief.need_reception` | Welcome in Esmeralda / your welcome in Esmeralda / Help from Esmeralda's government | One name everywhere: "Help from Esmeralda's government" (and "help from Esmeralda" mid sentence). Three names for one arrangement today. |

### 4.3 Escape, round 1: scene header and police box

| Id | Current | Proposed |
|---|---|---|
| `scene.goal` | Leave Esmeraldan airspace by | Take off from Susana airfield by |
| `LEVELS[0].name` | The residence, Portô Venla | Your house in the capital, Portô Venla |
| `scene.sosa_here` | Police are searching where you are (changed during this audit) | Keep. |
| `scene.sosa_at` | Police are searching {place} (changed during this audit) | Keep. |
| `scene.sosa_right` | He is searching {place}, and you are there | They are searching {place}, and you are there. |
| `scene.sosa_wrong` | He is searching {place}, and you are not there | They are searching {place}, and you are somewhere else. |
| `scene.next_move` | Police act again (changed during this audit) | Keep. |
| `brief.the_residence` and the `placeName` helper (used inside the box) | the residence | your house |
| Box subline after the round 1 introduction (new string `scene.sosa_name`) | none | Inspector Sosā's inquiry |

### 4.4 Escape, round 1: news and rumors

A round 1 News card is drawn on arrival. It is a rumor about Gianlūka or Nando 40% of the time; otherwise a residence or anywhere event.

| Id or data path | Current | Proposed |
|---|---|---|
| Rumor title (`eventView`, `def.title = n`) | Gianlūka Moretī | A rumor about Gianlūka Moretī, your party's chief of staff (new string `rumor.title`, args `{name}`, `{role}`) |
| `EVENTS.cameras.title` | Gianlūka wants cameras | Your party chief wants cameras |
| `EVENTS.cameras.text` | He wants you on the steps tonight, calling the election stolen. | Gianlūka Moretī, your party's chief of staff, wants you on the steps tonight, calling the election stolen. |
| `EVENTS.cameras.choices.speak.fx.say` | The party loves it. So does Sosā. | The party loves it, and so do the police. |
| `EVENTS.selfie.choices.beach.fx.say` | Gianlūka's people post you on the coast. | Your party's staff post the old photo, and now the public thinks you are on the coast. |
| `EVENTS.summons.choices.lawyer.label` | Send Gianlūka's lawyer | Send the party's lawyer (matches the hold choice "Call the party's lawyer") |
| `EVENTS.bodyguard.choices.bluff` lose `say` | He calls Sosā before midnight. | He calls the police before midnight. |
| `EVENTS.bodyguard.choices.gianluka.label` | Have Gianlūka handle him | Have your party chief handle him |
| `EVENTS.hearing.choices.stall.label` | Have Gianlūka ask for a delay | Ask your party chief for a delay |
| `EVENTS.blackout.text` | A storm took down the grid. Phones, radios and the inquiry go quiet. | A storm took down the grid. Phones, radios and the police search all go quiet. |
| `EVENTS.too_soon.text` | {sib} told reporters you already landed abroad. You are still at {here}. | Your {rel}, {sib}, told reporters you already landed abroad. You are still at {here}. |
| `markers.json` `search.elsewhere` | Sosā's search moves off your stop | The police search moves away from you |
| `markers.json` `search.finds` | Sosā searches where you are | The police search where you are |
| `markers.json` `search.loses_move` | Sosā skips his next action | The police skip their next action |
| `markers.json` `arrangement.moves`, `ui.json` `arrangement.moves` | Your welcome in Esmeralda moves up one step | Help from Esmeralda moves up one step |

### 4.5 Escape, round 1: phone

| Id or data path | Current | Proposed |
|---|---|---|
| `hint.phone` | Your phone is ringing, so answer the call. (changed during this audit) | Keep. |
| `phone.sibling_role` | {rel}, arranging the jet and your welcome | {rel}, abroad, arranging your jet and help from Esmeralda |
| `sim.line.jet_found_in_susana_the` | "I found a jet. It will be at Susana, but the crew will not book the flight until I give them a city. Do I tell them, or do we wait for the visa to come through?" | "I found a jet. It will wait at Susana airfield, across the border, but the crew will not book the flight until I give them a city. Do I tell them {city}, or do we wait for the visa to come through?" (new arg `{city}`) |
| `sim.opt.confirm_destination` | Confirm {city} | Confirm {city}, {country} (new arg `{country}`; ties the city to the country the player picked on the map) |
| `sim.opt.wait_until_salek_answers` | Wait for {sponsor} | Wait until {sponsor} agrees to help |
| `sim.effect.crew_booking_can_proceed` | The charter jet is booked. Your next call about the jet can hire a crew for {city}, and the visa is a separate request. | Keep. |
| Call label `phone.call_about` (and `sim.label.call_about`) | Duartē Albukerkē about the jet / Duartē Albukerkē about your welcome in Esmeralda / Bīr Amādū Salek about your visa | Ask your {rel} about the jet / Ask your {rel} about Esmeralda's help / Ask {sponsor} about your visa (all six words or fewer) |
| `sim.status.arrange_the_next_stage_charter` | Your sibling sets up the jet in steps: charter, crew, fuel, then ready at Susana. | Your {rel} sets up the jet in four steps: a charter, a crew, fuel, then the jet ready at Susana airfield. |
| `sim.status.arrange_reception_through_your_sibling` | Your sibling gets Vélez to expect you, and later Vélez can put officials at one border post. | Your {rel} asks Esmeralda's government to expect you. {sib} knows Rosario Vélez, an aide to Esmeralda's interior minister. Later she can put officials at one border crossing to meet you. |
| `sim.status.ask_salek_to_seek_visa` | {sponsor} asks the ministry for your visa, and {sponsor} will want something back. | {sponsor} asks {country}'s foreign ministry for your visa, and {sponsor} will want something back. |
| `sim.line.i_have_a_name_in` (sibling's reply to the reception call) | "I have a name in Baca. Give me six hours." | "I know someone at Esmeralda's interior ministry. Give me six hours." |
| `DESTS.atlanta.sponsor.terms` (shown in the log as "You now owe...") | He will speak to the ministry if you move the family accounts to his house. | He will speak to Atlanta's foreign ministry if you move the family accounts to his bank. ("His house" reads as his home; about.p5 says "his bank".) |
| `DESTS.tarun.sponsor.terms` / `DESTS.zaryanova.sponsor.terms` | ...write to the ministry... / ...take it to the ministry... | ...write to Tarun's foreign ministry... / ...take it to Zaryanova's foreign ministry... |
| `sim.line.the_ministry_has_not_called` | "The ministry has not called back. I will try again if you ask." | "The foreign ministry has not called back. I will try again if you ask." |
| `PEOPLE.sponsor.role` | the person asking a foreign ministry for your visa | Keep. |

### 4.6 Escape, round 1: moves

| Id or data path | Current | Proposed |
|---|---|---|
| Move chip (`approachBtn`, `${first}: ${t}`) | Nando: Trusts you / Gianlūka: Untested | Nando, your driver, trusts you / Gianlūka, your party chief, is untested (new strings per status with `{name}` and `{role_short}`; `PEOPLE.*` gains a short role) |
| `LEVELS[0].approaches.decoy.text` | Send three cars out in different directions so the watch follows the wrong one. | Nando sends three cars out in different directions so the police watching the house follow the wrong one. |
| `LEVELS[0].approaches.decoy.fail.say` | The second car is stopped at the avenida. Nando talks his way out, and the police are watching the house more closely now. | The second car is stopped on the avenue. Nando talks his way out, and the police are watching the house more closely now. |
| `LEVELS[0].approaches.partycar.text` | Ride out in Gianlūka's official car. In return he wants your public word that he leads the party while you are gone. | Ride out in the party's official car. Gianlūka Moretī, your party's chief of staff, wants your public word in return that he leads the party while you are gone. |
| `LEVELS[0].approaches.partycar.fail.say` | The watch stops the car at the gate and tells Sosā whose car it is. You are still at the house. | The police at the gate stop the car and report whose car it is. You are still at the house. |
| `action.sosa_none`, `action.sosa_once`, `action.sosa_times` | Sosā does not act / acts once / acts {n} times during these {hours} hours. | The police do not act / act once / act {n} times during these {hours} hours. |
| `hint.wait_sosa` | If you wait the hour, Sosā acts during it. | If you wait the hour, the police act during it. |

### 4.7 Escape, round 1: police phase and results

| Id or data path | Current | Proposed |
|---|---|---|
| `phase.sosa` (phase bar) | Sosā | Police |
| `hint.sosa` | See what Sosā and your allies did. | See what the police and your allies did. |
| New, once per run, first row of the round 1 police card (`intro.sosa`) | none | Inspector Valentīn Sosā of Valdória's Interior Ministry runs the police inquiry into your escape. His officers are the ones searching for you. |
| `ENEMY_ACTIONS.check_belief.text` | Sosā's people search {lv}. | Police search {lv}. |
| `ENEMY_ACTIONS.circulate.text` | Sosā sends the travel ban to the posts at the line, and every crossing there now needs one more on the die unless you hold "A report held one day." | The police send the travel ban to the border crossings. Every crossing now needs one more on the die unless you hold "A report held one day." |
| `ENEMY_ACTIONS.press_ally.text` | Sosā calls {who} in for a conversation. | The police call {who} in for questioning. (After round 1: "Sosā's police call {who} in for questioning.") |
| `ENEMY_ACTIONS.trace.text` | The ministry traces your recent calls. | The police trace your recent phone calls. |
| `ENEMY_ACTIONS.press_story.text` | The ministry briefs the papers that you have already left the country. | Valdória's Interior Ministry tells the newspapers you have already left the country. |
| `ENEMY_ACTIONS.roadblock.text` | Police set a checkpoint on the road out of {lv}. For the next six hours every move there is harder. | Keep. |
| `sim.inquiry.the_last_call_came_from` | Your last call came from here, so Sosā now searches where you are. | Your last call came from here, so the police now search where you are. |
| `sim.inquiry.reviews_the_passenger_lists_at` | {name} reviews the passenger lists at Portô Venla airport and finds nothing. | Keep (uses the full name and title). |
| `sum.exposure_round_here` | Police attention rose by {n} this round, and Sosā is searching where you are now | Police attention rose by {n} this round, and the police are searching where you are now. |
| `sum.held_firm` / `sum.talked` | kept quiet when Sosā questioned them / talked to Sosā | kept quiet when the police questioned them / talked to the police |
| `log.pressed_holds` / `log.pressed_breaks` | Sosā questions {name}, who says nothing... / Sosā questions {name}, who talks... | The police question {name}, who says nothing... / The police question {name}, who talks... |
| `who.talked`, `sim.why.talked_to_the_inquiry` | Talked to Sosā / {name} talked to Sosā | Talked to the police / {name} talked to the police |
| `sim.say.sold_you_out_sosa_knows` | {name} sold you out, and Sosā knows where you are. | {name} sold you out, and the police know where you are. |
| `sim.say.was_working_for_sosa_you` | {name} was working for Sosā, so you drop every card {name} gave you before it can hurt you. | {name} was working for the police, so you drop every card {name} gave you before it can hurt you. |
| `sum.reached` | You reached {place} | You reached {place} (with the function label from the route strip: "You reached the road south, Santa Laura") |

### 4.8 Escape, round 1: Route and Deck tabs

| Id or data path | Current | Proposed |
|---|---|---|
| `route.inquiry_here` | Sosā is looking here | Police are searching here |
| `route.inquiry` (board row label) | Sosā | Police |
| `route.no_inquiry` | Sosā has not moved yet | The police have not acted yet |
| `LEVELS[4].short` and `route.border` | The line (stop name) beside The border (label) | The border (one name) |
| `need.baca` | Call your sibling to reach Vélez in Baca. | Call your {rel} so Esmeralda's government expects you. |
| `need.velez` | Vélez's people | Esmeraldan officials at a border crossing |
| `need.expects` | Esmeralda expecting you | Esmeralda's government expecting you |
| `route.velez_starts`, `route.velez_starts_short` | Vélez's card starts counting here / Vélez's card starts here | Help from Esmeralda's government starts counting here / Esmeralda's help starts here |
| `route.role_aircraft` | arranging the jet and your welcome | arranging the jet and Esmeralda's help |
| `place.the_line`, `route.card_stops_line` | the line / {card} counts up to and at the line | the border / {card} counts up to and at the border |
| `CARDS.passport.works` | The Paso Huhūi post and the Susana departure. | The rail crossing at the border (Paso Huhūi) and takeoff at Susana airfield. |
| `CARDS.passport.text` | ...It gets you through the Paso Huhūi post and helps your takeoff at Susana. | ...It gets you through the rail crossing at Paso Huhūi and helps your takeoff at Susana airfield. |
| `CARDS.aide_word.works` | Valdórian officials, up to and at the line. | Officials in Valdória, as far as the border. |
| `CARDS.aide_word.text` | Gianlūka can get a mayor, a judge or a border post on the phone for you. | Gianlūka Moretī, your party's chief of staff, can get a mayor, a judge or a border post on the phone for you. |
| `CARDS.decoy_cars.works` | At the residence and on the road at Santa Laura. | At your house and on the road south at Santa Laura. |
| `CARDS.decoy_cars.text` | Two matching sedans and two friends who will drive them the wrong way. | Nando, your driver for 11 years, has two matching sedans and two friends who will drive them the wrong way. |
| `CARDS.informant.name` | A friend in the inquiry | A friend inside the police inquiry |
| `CARDS.informant.text` | A clerk tells Gianlūka where Sosā is looking and who is on duty. | A clerk inside the inquiry tells Gianlūka where the police are looking and who is on duty. |
| `CARDS.informant.works` | Any move the inquiry could be watching, up to the line. | Any move the police could be watching, as far as the border. |
| `CARDS.delay_report.works` | Valdórian posts checking the travel ban, including Santa Laura and the line. | Police posts in Valdória that check the travel ban, including Santa Laura and the border. |
| `PEOPLE.aide.role` (Route tab, scene tap) | party chief of staff | your party's chief of staff |
| `PEOPLE.holt.role` | brakeman on the Huhūi freight | brakeman on the midnight freight to the border |
| `PEOPLE.theo.role` | yard foreman in the Salta rail town | foreman of the rail yard in Salta |
| `PEOPLE.host.role` | matriarch of the Nova Trentô colônia | matriarch of the Nova Trentô farm settlement |
| `PEOPLE.pilot.role` | charter pilot, Susana | charter pilot at Susana airfield |
| `help.rounds` | A round is News, Phone, Move, Roll and then Sosā. Police attention rises while Sosā searches where you are... Get out of Esmeraldan airspace inside 72 hours. | A round is News, Phone, Move, Roll and then Police. Police attention rises while the police are searching where you are... Take off from Susana airfield, across the border, inside 72 hours. |

### 4.9 Escape, round 2 (Santa Laura, after a successful first move)

| Id or data path | Current | Proposed |
|---|---|---|
| `LEVELS[1].arrive` | Santa Laura. The radio says you are on a yacht in Portô Venla. | Santa Laura, a town on the road south. The radio says you are on a yacht in the harbor at Portô Venla. |
| `LEVELS[1].objective` | Get from Santa Laura to the colônia at Nova Trentô. | Get from Santa Laura to the farm settlement at Nova Trentô. |
| `PEOPLE.press.role` (phone role) | the station everyone in the capital has on | the radio station everyone in the capital listens to |
| `sim.effect.the_inquiry_believes_the_coast` | Sosā's search goes back to the residence, and your police attention drops by one. If one of your people later talks to Sosā, the lie adds one more point. | The police go back to searching your house in the capital, and your police attention drops by one. If one of your people later talks to the police, the lie adds one more point. |
| `sim.effect.sends_them_to_the_house` | Sosā's search goes back to the residence, your police attention stays the same, and nothing comes back on you later. | The police go back to searching your house in the capital. Your police attention stays the same, and nothing comes back on you later. |
| `LEVELS[1].approaches.siblings_driver.name` | Leave with your sibling's driver | Leave with your {rel}'s driver |
| `LEVELS[1].approaches.siblings_driver.text` | Your sibling knows a man in Santa Laura. Once the charter is booked, he drives you to Nova Trentô. | Your {rel} knows a man in Santa Laura. Once the charter is booked, he drives you to the farm settlement at Nova Trentô. |
| `LEVELS[1].approaches.barge.text` | A captain who owes your father takes you up the river to the colônia. | A captain who owes your father takes you up the river to the farm settlement. |
| `LEVELS[1].approaches.known_car.text` | Risk the posts in a car they know. Nando's spare sedans or a held report make it easier. | Risk the police posts in a car they know. Nando's spare sedans or a report held for a day make it easier. |
| `LEVELS[1].approaches.known_car.fail.say` | The post at the river has your plate. They turn you back and phone Sosā's people. | The post at the river has your plate. They turn you back and phone the inquiry. |
| `ENEMY_ACTIONS.press_ally.text` (from round 2) | Sosā calls {who} in for a conversation. | Sosā's police call {who} in for questioning. |
| `ENEMY_ACTIONS.watch_sibling.text` (hour 9 or later) | Sosā has {who}'s calls monitored. The operator in Susana goes quiet for a while. | Sosā's police tap {who}'s phone. The charter company at Susana airfield goes quiet for a while. |
| `EVENTS.decoy_ditch`, `fuel`, `hitchhiker`, `flood` | (no lore names) | Keep. |

### 4.10 Escape, later stops (representative)

| Id or data path | Current | Proposed |
|---|---|---|
| `LEVELS[2].name` | The colônia, Nova Trentô | The farm settlement, Nova Trentô |
| `LEVELS[2].arrive` | Nonā Rosa offers a room and a phone. Her cooperative's truck was impounded this morning. | Nonā Rosa Trentinī, the matriarch of the farm settlement, offers you a room and a phone. The cooperative's truck was impounded this morning. |
| `LEVELS[2].objective` | Get Esmeralda to expect you, then take the road to Salta. | Get Esmeralda's government to expect you, then take the road up to Salta, the rail town. |
| `LEVELS[2].approaches.sleep.text` | Rest for six hours. Your police attention drops by two while Sosā keeps searching. | Rest for six hours. Your police attention drops by two while the police keep searching. |
| `LEVELS[2].approaches.leave.text` | Once Esmeralda expects you, Nonā Rosa's cousin drives you up to Salta. | Once Esmeralda's government expects you, Nonā Rosa's cousin drives you up to Salta. |
| `sim.line.v_lez_is_not_answering` | "Vélez is not picking up. I can keep trying, or {sponsor} could reach her uncle, who banks with him." | "Rosario Vélez at Esmeralda's interior ministry is not picking up. I can keep trying, or {sponsor} could reach her uncle, who banks with him." |
| `LEVELS[3].arrive` | The midnight freight climbs to the border. Holt and Theo can get you aboard. | The midnight freight train climbs from here to the border. Holt Greer, a brakeman on the train, and Theo Bascom, the yard foreman, can get you aboard. |
| `LEVELS[3].objective` | Get on the midnight freight. The yardmaster will sell you to Sosā. | Get on the midnight freight. The yardmaster will sell you out to the police. |
| `LEVELS[4].name` | The line at the Huhūi passes | The border crossings in the Huhūi passes |
| `LEVELS[4].arrive` | The passes. Three crossings lie within a day of each other: the rail post at Paso Huhūi, the road post at Ālto Verdē toward Baca, and the Punta Marēa crossing toward the coast. Valdória has paid the guards at one of them to stop you. | The border runs through the Huhūi mountain passes. Three crossings into Esmeralda lie within a day of each other: the rail crossing at Paso Huhūi, the mountain road crossing at Ālto Verdē on the way to Baca, and the coast road crossing at Punta Marēa. Valdória has paid the guards at one of them to stop you. |
| `LEVELS[4].approaches.*.name` | Cross at the Paso Huhūi post / Take the Ālto Verdē road post / Pay the Punta Marēa crossing | Take the rail crossing at Paso Huhūi / Take the mountain road at Ālto Verdē / Pay the guards on the coast road |
| `LEVELS[4].approaches.post_high.text` | Three hours of switchbacks toward Baca. The post answers to the interior ministry, where Vélez works. | Three hours of switchbacks toward Baca, where Esmeralda's government sits. The guards here answer to Esmeralda's interior ministry, where Vélez works. |
| `LEVELS[5].arrive` | Susana. The charter apron behind the port, Esmeraldan flags on the tower. They will let you leave from here and nothing more. Sosā has asked them to hold you. | Susana airfield, the charter apron behind the port, with Esmeraldan flags on the tower. Esmeralda will let you leave from here and nothing more. (The last sentence is false whenever `flags.asked` is unset; docs/design-issues.md already records it.) |
| `ENEMY.role` (phone role at the airfield) | Interior Ministry, head of the departure inquiry | Valdória's Interior Ministry, head of the police inquiry |
| `ENEMY_ACTIONS.lean_operator.text` | The ministry warns the Susana charter operator that its Valdórian license is under review. | Valdória's Interior Ministry warns the charter company at Susana airfield that it could lose its license to fly in Valdória. |
| `ENEMY_ACTIONS.ask_esmeralda.text` | Valdória asks Esmeralda, through its embassy in Baca, to hold you if you appear. | Valdória's embassy in Baca asks Esmeralda's government to hold you if you appear. |
| `sim.line.your_ministry_threatened_the_operator` | "Valdória's ministry threatened the operator's license, so he has pulled the crew..." | "Valdória's Interior Ministry threatened the charter company's license, so the owner has pulled the crew..." |
| `EVENTS.rival_deal.title` | The president calls | Needs open question 1. Then "Valdória's president calls" or a role that says who he is. |

### 4.11 Endings

| Id | Current | Proposed |
|---|---|---|
| `over.why_out` / `over.why_gov_escaped` | You flew out of Esmeralda. / She flew out of Esmeralda. | Keep. |
| `over.why_time` | It is Tuesday at 2 p.m. Your immunity is gone, and you can no longer fly out. | Keep. |
| `over.why_deal`, `over.why_gov_deal`, `daily.deal` | ...the president's deal... | Needs open question 1. |
| `over.why_landed` | The country you flew to would not take you and sent you back. | Keep. |
| `sim.end.baca_reads_your_refusal_as` | Baca has closed its guest room to you. | Esmeralda's government has closed its guest room to you. |
| `sim.end.talked_to_the_inquiry_will` | {and} talked to the inquiry. | {and} talked to the police. |
| Note | The epilogue lines (`sim.end.*`) and the landing texts (`DESTS.*.landing`) are built into `s.over.reason`, but `renderOver` in src/ui.js shows only the one line "why". A player never reads them. They are listed here so a fix that shows them uses the clearer wording. |

### 4.12 Government side, before round 1 and round 1

| Id or data path | Current | Proposed |
|---|---|---|
| `GOV.title` (start card, log) | aide to the incoming government | One title, owner decision (open question 2) |
| `brief.gov_title` | The search | Keep. |
| New first story line (`brief.gov_who`) | none | {target} lost Saturday's election. The court has barred her from leaving Valdória and wants her passports by Monday noon. Her immunity runs until Tuesday at 2 p.m., and your job is to stop her from flying out before then. |
| `brief.gov_report_now` with `placeName(0)` | The newest report, which just came in, comes from the residence. | The newest report, which just came in, comes from her house in the capital. |
| `brief.minister_expects` | The minister expects a town by {time}. | The interior minister expects a town by {time}. |
| `brief.gov_need_hold` | Esmeralda holds her | Esmeralda's government agrees to hold her (docs/design-issues.md item 4 also says the mechanic does not hold her) |
| `gov.scene.the_assignment_port_venla` (level name) | The assignment, Portô Venla | Her house, Portô Venla |
| `gov.scene.the_watched_convoy_splits_the` (objective) | Your watch team is on the house. The minister wants a location. | Your watch team of police officers is on her house. The interior minister wants to know where she is. |
| Box name (`sosa-name` = target name) | Teresā Albukerkē | Teresā Albukerkē, the candidate (new string `scene.gov_target`) |
| `gov.say.port_venla_saturday_afternoon_two` | Portô Venla, Saturday afternoon: two of your cars watch the residence, and the court wants her passports by Monday. | Saturday afternoon in Portô Venla, the capital. Two of your police cars watch her house, and the court wants her passports by Monday. |
| `gov.name.interior_minister` (phone role) | Interior minister | Valdória's interior minister |
| `GOV_CARDS.watch.from` | Inspector Sosā | Inspector Sosā, who runs the police inquiry |
| `GOV_CARDS.desk.name` / `.from` | The provincial desk's patrol / The Santa Laura commander | The provincial police patrol / the police commander in Santa Laura |
| `GOV_CARDS.desk.works` | Any stop in Valdória, up to and including the line. | Any stop in Valdória, as far as the border. |
| `GOV_CARDS.esm_intro.from` / `.text` | The embassy in Baca / A name at the interior ministry who will take your call. Nothing is promised. | Valdória's embassy in Baca / A name at Esmeralda's interior ministry who will take your call. Nothing is promised. |
| `gov.would_start` | Would let your patrols act at Susana | Would let your patrols act at Susana airfield, in Esmeralda |
| `gov.label.ask_esmeralda_to_hold_her` | Ask Esmeralda to hold her | Ask Esmeralda's government to hold her |
| `gov.preview.through_the_embassy_in_baca` | Baca answers in 10 hours and needs a four or more. If Esmeralda agrees, her takeoff gets harder and your patrols can act at Susana. | Valdória's embassy in Baca passes the request to Esmeralda's government. It answers in 10 hours and needs a four or more. If it agrees, her takeoff gets harder and your patrols can act at Susana airfield. |
| `gov.preview.a_promise_to_consider_a` | A promise to consider a hold is not an instruction to a tower. | A promise to consider a hold gives the airfield tower no instruction. |
| `gov.line.the_interior_ministry_will_consider` (embassy reply) | "The interior ministry will consider it. 10 hours, and they will want to know why." | "Esmeralda's interior ministry will consider it. 10 hours, and they will want to know why." |
| `gov.label.open_a_licence_review_on` | Open a license review | Review the charter company's license |
| `gov.preview.the_aviation_desk_takes_six` | The desk answers in six hours and needs a three or more. It gives you the operator card. | The aviation office answers in six hours and needs a three or more. It gives you the card "The charter company's license." |
| `gov.why.the_aviation_desk_opens_on` | The aviation desk opens Saturday at 8 p.m. | The aviation office opens Saturday at 8 p.m. |
| `gov.line.the_review_is_open_say` | "The review is open. Say the word and the operator hears about his licence." | "The review is open. Say the word and the charter company hears about its license." (also fixes the British "licence") |
| req:ban preview, hard coded in src/gov.js `calls()` | The post answers in four hours and needs a 2 or more. A sent message does not close the border; a confirmed one does. | Move to ui.json (it is player prose in a .js file). Text: "The border crossing answers in four hours and needs a two or more. The border closes to her only when the crossing confirms it has the ban." |
| `GOV_ORDERS.search.text` | ...If she is there and the police have been on her for a while, they stop her... | ...If she is there and the police have been searching that stop for a while, they stop her... ("on her" is an internal concept the owner has ruled out) |
| `GOV_ORDERS.press.who` | Inspector Sosā | Inspector Sosā, head of the police inquiry |
| `GOV_ORDERS.story.who` | the ministry press office | the Interior Ministry press office |
| `gov.name.the_santa_laura_desk` (report source) | The Santa Laura desk | The Santa Laura police |
| `gov.name.the_aviation_desk` | The aviation desk | The aviation office |
| `gov.name.the_embassy_in_baca` | The embassy in Baca | Valdória's embassy in Baca |
| `route.no_command` | Search, checkpoint and call-in orders here need Esmeralda's agreement | Search, checkpoint and call-in orders here need the agreement of Esmeralda's government |
| `gov.scene.she_may_be_across_the` | This is Esmeralda. Searches, checkpoints and call-ins here need Esmeralda's agreement first. | This is Esmeralda, across the border. Searches, checkpoints and call-ins here need its government's agreement first. |

### 4.13 Government side, round 2 and after (representative)

| Id or data path | Current | Proposed |
|---|---|---|
| `gov.scene.provincial_desks_santa_laura` | Provincial desks, Santa Laura | The provincial police, Santa Laura |
| `gov.scene.the_support_network_nova_trent` | The support network, Nova Trentô | The farm settlement, Nova Trentô |
| `gov.scene.the_freight_salta` | The freight, Salta | The rail town, Salta |
| `gov.scene.the_huhui_border` | The Huhūi border | The border crossings, Huhūi passes |
| `gov.scene.susana_airfield` | Susana airfield | Susana airfield, Esmeralda |
| `GOV_EVENTS.leak.title` | The minister leaks your lead | The interior minister leaks your lead |
| `GOV_EVENTS.sosa_alone.title` / `.text` | Sosā wants to drive out himself / He wants to take two officers to {there} tonight without telling the desk. | Inspector Sosā wants to go himself / He wants to take two officers to {there} tonight without telling the provincial police. |
| `GOV_EVENTS.photo.title` | A paper has a photo | The radio station has a photo (the text says Rādiô Portô Venla has it) |
| `GOV_EVENTS.dinner.title` / `go` say | Dinner at the Esmeraldan embassy / ...he promises to hurry Baca's answer. | Dinner at Esmeralda's embassy / ...he promises to hurry his government's answer. |
| `gov.report.holt_greer_took_money_this` | Holt Greer took money this week for a crate on the midnight freight. | Holt Greer, a brakeman on the midnight freight, took money this week for a crate on the train. |
| `gov.report.the_nova_trent_cooperative_had` | The Nova Trentô cooperative had a visitor overnight. | The farm cooperative at Nova Trentô had a visitor overnight. |
| `gov.report.a_passenger_left_the_salta` | A passenger left the Salta freight at the Huhūi passes. | A passenger left the freight train from Salta at the border passes. |
| `gov.report.someone_stayed_at_the_col` | Someone stayed at the colônia. | Someone stayed at the farm settlement. |

### 4.14 Escape demo (`tutorials.json`, id `escape`)

| Step id | Current | Proposed |
|---|---|---|
| `intro` | You are Teresā Albukerkē, and you lost the election. You have 72 hours to reach a jet and get out. This demo walks you across the border, and you play the airfield on your own. | You are Teresā Albukerkē. You lost Saturday's election, and the court has barred you from leaving your country, Valdória. You have 72 hours to cross the border into the country of Esmeralda and fly out from Susana airfield. This demo walks you across the border, and you play the airfield on your own. |
| `map` | The gold dot over your head is you, and the box in the corner names the place Sosā is searching. While he searches where you are, your police attention climbs... | The gold dot over your head is you, and the box in the corner shows where the police are searching. While they search where you are, your police attention climbs... |
| `phases` | Every round goes News, Phone, Move, Roll, then Sosā. Answer your phone, make one call, make one move, and see what it cost you. | Every round goes News, Phone, Move, Roll, then Police. Answer your phone, make one call, make one move, and see what the police did. |
| `answer_brother` | Duartē has found a jet, but the crew will not book without a destination. Tap **Confirm Lāyūna**. The demo picked it for you. | Your brother, Duartē, has found a jet, but the crew will not book it without a destination. The demo picked the city of Lāyūna, in the country of Atlanta. Tap **Confirm Lāyūna, Atlanta**. |
| `call_aircraft` | Tap **Duartē Albukerkē about the jet**, then **Call**... | Tap **Ask your brother about the jet**, then **Call**... |
| `leave_house` | ...You can do this because Nando gave you the cars. | ...You can do this because Nando, your driver, gave you the cars. |
| `die` | ...You are in Santa Laura now, and Sosā is still searching the residence. | ...You are in Santa Laura, a town on the road south, and the police are still searching your house. |
| `inquiry_acts` (title "Sosā moves too") | Every three hours Sosā does something. This time he sent the travel ban to every post, so each border crossing needs one more on the die unless you hold a card that delays the report. | Title: "The police move too." Body: Every three hours the police do something. Inspector Valentīn Sosā of Valdória's Interior Ministry runs their search for you. This time his officers sent the travel ban to every border crossing, so each crossing needs one more on the die unless you hold a card that delays the report. |
| `call_sponsor` | Tap **Bīr Amādū Salek about your visa**, then **Call**. He can get Atlanta to let you in, and calling him agrees to his price: the family accounts move to his bank. | Bīr Amādū Salek is a banker who knows your family. He can ask Atlanta's foreign ministry for your entry visa, and calling him agrees to his price: the family accounts move to his bank. Tap **Ask Salek about your visa**, then **Call**. |
| `work_while_driving` | Duartē booked the crew, and the ministry told the papers you had left the country. Sosā is searching Portô Venla, which is not where you are. | Duartē hired the crew, and Valdória's Interior Ministry told the newspapers you had left the country. Sosā's police are searching the capital, Portô Venla, and you are somewhere else. |
| `nona_rosa` | Her cooperative's truck was impounded this morning. Pick **Help Nonā Rosa free the truck**... carries you on to Salta. | You are at the farm settlement at Nova Trentô. Nonā Rosa Trentinī, its matriarch, offers you a room, but the cooperative's truck was impounded this morning. Pick **Help Nonā Rosa free the truck**... carries you on to Salta, the rail town. |
| `relationships` | You are in Salta now, and Nonā Rosa's truck is a card in your deck... | You are in Salta, the rail town below the border, and Nonā Rosa's truck is a card in your deck... |
| `call_reception` | Tap **Duartē Albukerkē about your welcome in Esmeralda**, then **Call**. He can reach Rosario Vélez in Esmeralda, and after enough calls her officials wait for you at one border post. | Duartē knows Rosario Vélez, an aide to Esmeralda's interior minister. After enough calls, Esmeraldan officials wait for you at one border crossing. Tap **Ask your brother about Esmeralda's help**, then **Call**. |
| `freight_crate` | Pick **Pay Holt for a crate**, then tap **Try it**... | Holt Greer, a brakeman on the midnight freight, sells space in a crate. Pick **Pay Holt for a crate**, then tap **Try it**... |
| `border` (title "The line") | Three posts cross into Esmeralda, and Valdória has paid one of them. You do not know which. If Duartē's calls get Vélez's officials to the line, they meet you at one of the other two, and crossing there is certain. | Title: "The border." Body: Three crossings lead into Esmeralda, and Valdória has paid the guards at one of them. You do not know which. If Duartē's calls get Esmeraldan officials to the border, they meet you at one of the other two, and crossing there is certain. |
| `post_rail` | Pick **Cross at the Paso Huhūi post**... the party machine lowers the roll... | Pick **Take the rail crossing at Paso Huhūi**... your party's card, the party machine, lowers the roll... |
| `airfield` (title "Susana") | You made it across. Esmeralda lets you fly out of Susana and nothing more, and your party cards do not count in this country... | Title: "The airfield." Body: You made it across. Esmeralda lets you fly out from Susana airfield and nothing more, and your party's cards do not count in this country... |

### 4.15 Government demo (`tutorials.json`, id `gov`)

| Step id | Current | Proposed |
|---|---|---|
| `intro` | You are Sofīā Leōnī, aide to the incoming government. Teresā Albukerkē has until Tuesday at 2 p.m. to fly out, and your job is to stop her. You never see where she is, only reports, and reports come late. | You are Sofīā Leōnī, [title per open question 2]. Teresā Albukerkē lost Saturday's election, and the court has barred her from leaving Valdória. Her immunity lasts until Tuesday at 2 p.m., and your job is to stop her from flying out before then. You never see where she is, only reports, and reports come late. |
| `phases` | ...Answer the minister, send one request... | ...Answer the interior minister, send one request... |
| `minister` | If you name the wrong town, the minister announces it on the news, your offices drive there, and it counts against you at the end... | If you name the wrong town, the interior minister announces it on the news, every police office in the province drives there, and it counts against you at the end... |
| `hold` | Your orders stop at the border, but Esmeralda can hold her for you. The embassy takes 10 hours to answer, so pick **Ask Esmeralda to hold her**, then **Send**. | Her jet waits across the border in Esmeralda, where your orders do not reach. Esmeralda's government can hold her for you. Valdória's embassy in Baca takes 10 hours to get an answer, so pick **Ask Esmeralda's government to hold her**, then **Send**. |
| `confirm` | The ban went out, but nobody at the post has read it... | The ban went out, but nobody at the border crossing has read it... |
| `pressure` | When an order puts Sosā's people on her stop, her police attention climbs... | Inspector Sosā runs the police inquiry, and his officers carry out your orders. When an order sends them to her stop, her police attention climbs... |

### 4.16 About page (representative)

| Id | Current | Proposed |
|---|---|---|
| `about.p2` | ...Rosario Vélez, aide to Esmeralda's interior minister, can have people waiting at the border if Baca gets your name in time... | ...Rosario Vélez, aide to Esmeralda's interior minister, can have officials waiting at the border if your brother or sister reaches her in time... |
| `about.p7` | ...an embassy in Baca that will ask Esmeralda to hold the candidate... | ...Valdória's embassy in Baca, which will ask Esmeralda's government to hold the candidate... |

---

## 5. Gradual introduction

The order below uses only screens and strings the game already has. Each new fact arrives at the moment the player needs it to act. No reading screen is added; the one new line (Sosā's introduction) sits in the police card the player already reads at the end of round 1.

**Before round 1: who you are and what you want.**
- Start screen. The blurb says you lost Saturday's election, the court has barred you from leaving your country, Valdória, your family has found a jet at an airfield across the border in Esmeralda, and no country has agreed to take you yet. Three facts: you, the barrier (the court), the goal (an airfield next door). It names no person except the player.
- Character card. Name, the sibling by relationship ("Her brother Duartē is finding the jet"), and one advantage and one weakness in plain words ("A friend inside the police inquiry").
- Map. "Pick the country you will fly to." Valdória is "your country", the airfield is "Susana airfield, where you fly from", and each destination button names the country, the landing city and the sponsor by job and price. The player now knows the three part shape of the trip: home, across the border, then abroad.

**Round 1: who has power over you.**
- Briefing. The arrival text puts the player in a house in the capital, watched by police, with a court deadline and a second passport. The route strip names each stop by function first (your house, road south, farm settlement, rail town, border, airfield), so the player sees the whole trip before learning a single place name. Police attention is explained in terms of "the police", with no name. The help from Esmeralda is described as "Esmeralda's government", and nobody from it is named yet.
- Play. The police box says "Police are searching where you are". Gianlūka and Nando arrive with their jobs attached ("your party's chief of staff", "your driver") the first time any string names them: the Deck, the move chips, a news card or a rumor. The phone brings the sibling by relationship, and the call labels say "Ask your brother about the jet". The first reception call preview introduces Rosario Vélez by job.
- End of round 1. The police card opens with one line: Inspector Valentīn Sosā of Valdória's Interior Ministry runs the police inquiry into your escape. By now the player has watched the police search and act for a whole round, so the name lands on a role they already understand.

**Round 2: where you are going, stop by stop.**
- Santa Laura arrives as "a town on the road south". The radio station introduces itself by its role. The objective names the next stop by function ("the farm settlement at Nova Trentô"). From here "Sosā's police" may appear beside "the police" as an identifier.

**Rounds 3 to 5: who helps you.**
- Nova Trentô introduces Nonā Rosa as the matriarch of the settlement and the sponsor's price comes due by phone. Salta introduces Holt and Theo by their jobs as the player needs a way onto the train. The border names its three crossings by function (rail, mountain road, coast road) with the place names second, and Esmeralda's officials and Vélez are already known from the calls.

**The airfield.** Capitān Olsēn arrives as the charter pilot, and Sosā calls in person; his phone role now reads "Valdória's Interior Ministry, head of the police inquiry", a name the player has known since round 1.

**Demo.** The demo skips the map and the briefing, so its first two coach cards carry the start screen's facts (election, court, Valdória, the airfield in Esmeralda) and the step `answer_brother` names the destination as "the city of Lāyūna, in the country of Atlanta". Sosā's introduction moves into step `inquiry_acts`, the first card about the police turn.

**Government side.** The start card says who Sofīā works for. The first briefing says who the candidate is and why she must be stopped before Tuesday at 2 p.m. The first message comes from "Valdória's interior minister". The Deck introduces Sosā by role on his card, and the first request preview explains that Esmeralda is across the border and reached through Valdória's embassy in Baca.

### Open questions for the owner

These are relationships the game leaves unstated. The code does not settle them, so the proposal does not guess.

1. **The president.** The deal comes from "the president". Is that the election winner, or the sitting president of Valdória? The answer decides the event title and three ending lines.
2. **Who governs, and Sofīā's title.** Sofīā is "aide to the incoming government" in data and the start card, and "aide to the incoming minister" in the about page. Her orders run through the Interior Ministry, and Sosā's officers carry them out. Is the incoming government already in office, and does Sosā answer to her?
3. **Immunity.** The deadline is the end of the candidate's immunity. The proposal says "immunity from arrest" on the owner's own description of the government goal (memory, Oct. 31, 2026). The game does not say why it ends Tuesday at 2 p.m.; that can stay unexplained.
4. **Baca.** Is Baca Esmeralda's capital? The data implies it (Valdória's embassy and Esmeralda's interior ministry are there), and the proposal writes "where Esmeralda's government sits" until the owner confirms.

### Inconsistencies found (for docs/design-issues.md, not fixed)

- `scene.sosa_right` and `scene.sosa_wrong` still say "He is searching" under the new "Police are searching" header.
- `CHARACTERS.man.blurb` says the barges go "down the river"; the move `barge` goes "upriver".
- One arrangement has three names: "Welcome in Esmeralda", "your welcome in Esmeralda", "Help from Esmeralda's government".
- One stop has two names on the same screen: "The line" and "The border".
- `brief.phone_suggest` embeds a button label and reads "The call that helps most now is Call Duartē Albukerkē about the jet."
- `GOV_EVENTS.photo` is titled "A paper has a photo" while its text gives the photo to Rādiô Portô Venla.
- `DESTS.atlanta.sponsor.terms` moves the accounts "to his house"; about.p5 says "to his bank".
- `gov.line.the_review_is_open_say` uses the British "licence".
- The req:ban preview is player prose written into src/gov.js.
- `GOV_ORDERS.search.text` uses "on her", an internal concept the owner has ruled out.
- The epilogue (`sim.end.*`) and landing texts (`DESTS.*.landing`) are built but never shown.
- `STAGE_LINES` never display (docs/design-issues.md item 1), which removes the only spoken introduction of Rosario Vélez.

---

## Top 10 changes by impact

1. **Rename the destination countries.** Atlanta reads as a US city, Tarun as a man and Zaryanova as a woman, on the one screen where the player makes the run's biggest choice. Working names: Atlantia, Tarunia, Zaryania.
2. **Call the police "the police" through round 1, and introduce Inspector Sosā by name and job at the end of it.** That covers the phase label ("Police"), the box sublines, the briefing, the markers and the police actions. Fix the leftover "He is searching" lines.
3. **Name the country on every "ministry".** Valdória's Interior Ministry, the destination's foreign ministry and Esmeralda's interior ministry are all "the ministry" today, so the player cannot tell who is acting on them.
4. **Stop using Esmeralda, Baca and Susana as people.** Write "Esmeralda's government" and "Susana airfield" everywhere, and drop Baca as a speaker. Consider the working renames Costa Esmeralda, Ciudad Baca and Porto Susana.
5. **Rewrite the round 1 briefing.** Put the player in a house in the capital watched by police, label the route by function first, and take Vélez, Sosā and Esmeralda's minister out of the reception note.
6. **Replace "the line" with "the border".** One name for the stop, and no collision with phone lines.
7. **Rebuild the call labels and previews around relationships and jobs**: "Ask your brother about the jet", "Ask Salek about your visa", and Vélez introduced in the first reception preview.
8. **Attach a job to every person the first time a string names them**: Gianlūka (party chief of staff), Nando (driver), Nonā Rosa (matriarch of the farm settlement), Holt (brakeman), Theo (yard foreman), Olsēn (charter pilot). That includes the rumor titles, which today are a bare name.
9. **Fix the escape demo**, which skips the map: introduce Valdória, Esmeralda and the airfield in step `intro`, name Lāyūna as a city in Atlanta, give Salek his role, and introduce Sosā in `inquiry_acts`.
10. **Give the government side its missing introductions**: who the candidate is in the first briefing, one title for Sofīā, "Valdória's interior minister", "Valdória's embassy in Baca", and Sosā by role on his card. Settle the four open questions first.
