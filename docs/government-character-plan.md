# Government character: story and play map

**Status:** Design proposal, not implemented.  
**Owner addition:** A third playable character belongs to the winning party/current government and tries to stop the escape.  
**Branch reviewed:** `claude/vigilant-noether-rmcm7h`, commit `269fdee`.  
**Working assumption:** This is another single-player story selected at the start. The computer controls one escaping candidate. Simultaneous multiplayer is not specified.

This owner addition extends the escape-only perspective in game-direction.md.
The role, scenes and rules proposed below remain open for the owner's decision.

## The character

Proposed role: a senior aide from the winning party, assigned to coordinate the departure inquiry. Inspector Sosā directs field operations. The character's name and biography are open.

Your government has won, but you do not control every official or know whom they serve. You need provincial officers to act, transport staff to answer and foreign officials to cooperate. The escaping candidate still has allies inside institutions.

Your assignment is to prevent departure and bring the candidate to the hearing. Your minister wants results and keeps asking for an update. Sosā needs a location before deploying people. Meanwhile, a foreign government may choose to receive the candidate.

## What the branch already provides

The current branch has two escaping characters, six journey locations and a 72-hour limit. Card effects have geographic reach. Personal commitments produce later choices and endings.

The computer inquiry already searches suspected locations, circulates the restriction, questions allies, threatens the charter operator's license, requests an Esmeraldan hold, sets roadblocks and monitors the sibling's calls. Its automatic actions currently occur every three hours.

These are foundations, not a complete playable government role. They presently operate with access to simulation state that the new player must not receive.

## What you know

Show dated reports, confirmed instructions and unresolved requests.

- A car sighting identifies a vehicle; it does not prove the candidate was inside.
- A document request suggests a connection to the registry; it does not establish the candidate's current location.
- A charter booking identifies an aircraft; it does not prove the passenger has reached it.
- A foreign minister promising to consider a hold does not mean the tower received an instruction.

Keep actual location hidden in this mode. The route displays your suspected location and the age/source of the latest report. Reveal the actual route in the debrief.

## Story through the run

The table sketches government encounters alongside the existing journey. These are not automatic notifications of where the target is. Reports can arrive late, stages can be missed and an interception can end the run early.

| Story beat | Immediate problem | Decisions and later effects |
| --- | --- | --- |
| The assignment, Portô Venla | The watched convoy splits. The minister wants a location. | Follow a reported car, keep watch on the house or prepare provincial alerts. A premature public claim can send your own offices after the wrong lead. |
| Provincial desks, Santa Laura | Reports conflict and a registry may have issued another document. | Verify the document request, ask a local commander to investigate or send a patrol after the vehicle sighting. The contact you approach may warn the candidate. |
| The support network, Nova Trentô | Someone is sheltering the candidate, but your source has conditions. | Seek cooperation, question a contact or keep watching to identify the onward arrangement. Acting now may secure a location; waiting may expose more of the route. |
| The freight, Salta | A departure window is approaching. Railway staff give different accounts. | Send a team to the yard, pursue a road lead or secure cooperation from staff. An alert may stop boarding or warn the helpers to change plans. |
| The Huhūi border | The crossing could happen before your instructions arrive. | Confirm the restriction reached the post, send an identification update or coordinate a team at the suspected crossing. A sent message alone does not close the border. |
| Susana airfield | The candidate may be across the border. Your domestic authority has limited reach. | Ask Esmeralda to hold the flight, approach the operator or negotiate with the receiving officials. The request must reach the people who can stop departure. |

The final scene should make the remaining gap visible: Esmeralda may acknowledge a request while the tower still clears the jet. The character has to turn political agreement into an instruction someone carries out.

## The turn

1. Read the current reports and incoming calls.
2. Choose an investigation, deployment or request for cooperation.
3. Inspect who will act, the time required, the chance of delivery and the consequences of failure.
4. Commit. Time advances; the candidate and both networks continue working.
5. Receive the result. Update the plan from what was learned.

Money stays outside the resource economy. Time and the availability of particular people limit action. An official handling one task cannot instantly complete every other request. Exact action capacity is unselected.

## Cards and relationships

Government cards represent specific cooperation: a local commander's patrol, access to registry records, a railway contact, an operator's willingness to pause a booking or an introduction to an Esmeraldan official.

The same geographic limits apply to both sides. A Valdórian ministry contact does not command an Esmeraldan tower. An operator's compliance can delay the aircraft without locating the passenger.

Relationships develop through conversations. A commander may act quickly for you once and then require a better report. A contact may cooperate while quietly warning the candidate. A minister may demand an announcement before you can substantiate it. These are proposed story choices, not new selected meters.

Useful combinations should open options. For example, a registry lead plus a cooperative border official could enable an identification check that either alone cannot accomplish.

## Dice and uncertainty

Use uncertainty for the work requested: whether a source answers, whether an official delivers on time or whether a team reaches the reported place before the candidate leaves.

Show how preparation changes the roll. Preserve report age and source so the player can judge uncertainty. A successful search can establish that the candidate is absent; it should not award a capture merely for following a false report.

The government player must not inspect the escapee's hand, hidden destination arrangements or actual location through action previews.

## Ending the attempt

Proposed government victory: confirmed interception before the flight escapes, followed by completed custody or surrender. Knowing the location, obtaining a promise to detain or delaying a flight is not sufficient.

Proposed defeat: the jet leaves the relevant airspace before effective interception.

The 72-hour expiry needs an explicit government outcome. Do not automatically reverse the existing escape timeout into a capture if the government never secured the person. A closing route could lead to surrender, continuing pursuit or a partial outcome; the owner should select this.

Debrief the story with what actually happened, which reports misled you and which people delivered. Give the minister's reaction through the choices made during the run, rather than adding a separate reputation economy by default.

## Implementation boundary

This task maps the role; it does not add it to the character selector yet.

Keep the shared journey and clock. Add a role-specific view of knowledge, available actions and story. Government-controlled inquiry actions replace the automatic inquiry for that mode; the fleeing candidate needs an opposing policy that uses the existing escape actions.

The current `CHARACTERS` entries both assume a fleeing candidate with a sibling abroad. Adding another entry alone would incorrectly inherit that setup. Separate role from character before wiring up the third story.

Existing escape saves, tutorial, copy rules, font mapping and archive exclusion must remain intact. The first test should demonstrate a false lead, a successfully completed order and a changed jurisdiction before expanding the campaign.

## Decisions still open

Character name and biography; whether the character coordinates Sosā or is Sosā; which fleeing candidate appears in a run; intervention costs and staffing limits; the role of political pressure; timeout and partial outcomes.

**Confirmed:** Third playable government/winning-party character, opposing the escape.  
**Proposed:** The coordinator role and all detailed scenes and mechanics above.
