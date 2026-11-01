# Proposal: bribe cash, traps that cost time, and difficulty levels

**Status:** a spec for the owner to check before anything is built. Nothing here is in the game yet.
**Owner's request (Nov. 1, 2026):**
- "You should always be able to pay a bribe but it doesn't always get you anything and at some point you run out of bribe cash on your person and you need to get somewhere to get more or it stops being useful."
- "I want bad choices to run out the clock faster or cause you to get into side quests that would seem like they are part of the deal but actually cause you not to get out in time before your immunity runs out."
- "having there be a very easy, easy, medium, hard and INTERPOL levels of hard"

## What exists today (traced)

- **Paying is a move, not a resource.** Five moves are marked as paid: hiring a plain car, Holt's crate, the yardmaster, the Punta Marēa crossing and the fuel agent. Paying costs nothing beyond the move's time, and there is no money count (`src/data.js`, `pay: true`).
- **Some news choices involve money** (the tipster, the reporter, the bodyguard, the police officer), each with its own fixed outcome.
- **Bad choices already cost time,** but the costs are shown in advance on the effect chips, so the player can always see the trap.
- **One move is a trap that says so:** "Pay the yardmaster" reads "He will pocket the money and report you. This cannot succeed." That breaks your rule against telling the player what will work (backlog item 30).
- **One difficulty.** The escape win rate is about 30% for either candidate.

## 1. Bribe cash

**The rule.**
- You carry cash, shown as a number beside police attention: "Cash: 3".
- **Every move gets a Pay option,** at a cost of 1 cash. Paying makes the roll easier: the target drops by 3 on the 20-sided die, a 15-point better chance.
- **Paying never guarantees anything.** The die still rolls. Some people take the money and do nothing, and that is decided by the roll, not announced.
- **Cash runs out.** With 0 cash, the Pay option is gone.

**Getting more.** A few places let you restock, and restocking takes hours. The places below are options for you to choose from. I have not written them as story, because each one would add a fact to the world:
- a bank or wire office at Santa Laura;
- your sponsor sending money, by phone, which arrives some hours later;
- selling something you carry at Salta.

**What changes.**
- `src/sim.js`: a cash count, the Pay option on every move and its cost, and a restock move.
- **The five paid moves become ordinary moves that you can pay on.** Their current text about money would need checking against the new rule.
- **Calibration:** starting cash is the main balance knob. I would start at 3 and measure 2, 3 and 4.

**Questions.**
1. Does paying help everywhere, or only with people who take money (guards, the port, the yard)?
2. Does paying raise police attention when it fails, as the Punta Marēa crossing does today?
3. Which restock places, and how many hours does each take?

## 2. Traps that cost time

**The rule.**
- **Some choices look like part of the plan and are not.** They take hours and lead nowhere, or they lead to a second step that also takes hours.
- **Moves and news choices that are traps no longer say so.** Their chips show the time a move takes, as every move does, but not that it leads nowhere.
- **The player learns afterward.** The result says what happened. The end-of-run debrief can list the hours lost to traps, so a lost run explains itself, as the government results screen already does.

**Candidates from what is already written.**
- **Paying the yardmaster:** it would read like any paid move. Today its text says it cannot succeed.
- **Holt drinking at the bar** (Salta news) and **the old bodyguard** (any stop): each could open a short errand that costs hours.
- **A new kind of call:** an ally asks for one more step ("the crew wants a second signature") that sounds like the arrangement moving forward and is not. These would need writing, and I would draft them for you to approve.

**Guardrails, so traps feel fair.**
- At most one trap is offered per stop.
- A careful player can notice it. There is always a sign in the fiction, such as who is asking, or a promise that is too good. The sign is never a label.
- A trap never ends the run on its own. It costs hours, and the escape deadline does the rest.

**Questions.**
1. Should a trap ever cost police attention as well as hours, or hours only?
2. Should the debrief name the traps the player fell for?

## 3. Difficulty levels

**Decided by the owner, Oct. 31, 2026.** Later starts from the residence, and the deadline stays Tuesday at 2 p.m. in every mode. The level is one choice before the run starts, a starting state only. It adds nothing during play, and the core simulation is unchanged. Build it after PR #25 is stable and merged, as its own small change, calibrated separately.

| Level | Start | Time left | Other changes |
|---|---|---|---|
| Very easy | Saturday 2 p.m. | 72 hours | More cash, lower police attention, easier rolls, more reliable help |
| Easy | Saturday 2 p.m. | 72 hours | Modest advantages |
| Medium | Saturday 2 p.m. | 72 hours | Today's rules |
| Hard | Sunday 2 a.m. | 60 hours | Otherwise standard |
| INTERPOL | Sunday 2 p.m. | 48 hours | Otherwise standard |

Not 36 hours yet: the bots win 5% to 9% there, and nobody knows yet how far humans beat the bots. Shorter runs that start farther along the route are a separate mode for later.

Measured, from the residence (200 runs per candidate, test bot as it is today): 72 hours 26% and 29%, 60 hours 21% and 25%, 48 hours 14% and 13%, 36 hours 5% and 9%, 24 hours 0%. No win took less than 35 hours.

### The crew (decided Nov. 1, 2026)

**Owner's decision:** "crew with difficulty, automatic, everyone has a crew." His notes add:
- Crew is part of the game at every level. The level sets how much help you start with and how dependable it is.
- You can recruit more people along the route on every level.
- It is built on what exists (allies, trust, reliability, cards that work on their own), not a new system.

**What a crew member is:** an existing character with a relationship to you, one specialty, and a reliability. There is no crew screen, no inventory, no assignments and nothing to switch on. Help works on its own when it is relevant, and a short notice says so when it matters.

| Level | Starting crew | Dependability |
|---|---|---|
| Very easy | 3 helpers | Highly dependable |
| Easy | 2 helpers | Dependable |
| Medium | 1 helper | Normal |
| Hard | 1 helper | Less dependable |
| INTERPOL | 1 helper | Under the most pressure |

On harder levels a helper is not made arbitrarily incompetent. Sosā leans on them harder, and help is harder to secure.

**Recruiting through choices already in the story.** Helping someone can bring their help along, with no "Recruit" button. Example from the owner: helping Nonā Rosa could bring her family's help on the road. Some favors earn real help; others take time and deliver nothing, which gives the side quests a purpose.

**Kept separate, as the game already does:** agreeing to help, being reliable, and being loyal. Someone can agree and be unreliable; someone can be dependable and secretly talking to Sosā; someone can be loyal and stopped by the authorities. The phone shows none of this as meters, only who is helping and what happened when it mattered.

**Specialties, matched to what loses runs today:**

| Specialty | What it does | Measured problem |
|---|---|---|
| Lookout | Slows the rise of police attention while Sosā searches your stop | Lost runs average about three police stops, wins fewer than one |
| Fixer | Keeps calling your allies while you travel, so replies come sooner | Allies take six hours to answer |
| Lawyer | Turns one police stop into a lighter one | House arrest ends about half of lost runs |

**Build order, after PR #25 merges and with the difficulty presets:** the lookout first, through an existing encounter, then measure the change in police stops and escapes; then the fixer and the lawyer. Existing characters fill each role where their story fits. Which characters is a question for the owner before writing any lines.

### Earlier draft (superseded by the table above)

**Five levels,** chosen on the start screen. Medium is today's game.

| Level | Roll targets | Escape deadline | Police act every | Starting cash | Target win rate |
|---|---|---|---|---|---|
| Very easy | 4 lower | 84 hours | 4 hours | 5 | about 70% |
| Easy | 2 lower | 78 hours | 3 hours | 4 | about 50% |
| Medium | as today | 72 hours | 3 hours | 3 | about 30% |
| Hard | 2 higher | 66 hours | 3 hours | 2 | about 15% |
| INTERPOL | 4 higher | 60 hours | 2 hours | 1 | about 5% |

- **The numbers are starting points,** to be set by calibration until each level lands on its target win rate.
- **The story deadline is 72 hours** (immunity ends Tuesday at 2 p.m.). Changing the deadline by level would change that date in the story. If you would rather keep 72 hours fixed, the other levers can carry the difference.
- **The government side gets the same five levels.** There, the levels change how often her side catches a break and how late reports arrive.
- **The daily challenge stays on medium,** so everyone plays the same game.

**Questions.**
1. Keep the 72-hour deadline fixed at every level, or let it move?
2. Should INTERPOL be unlocked by winning on hard?
3. Do the levels need names in the fiction, or are the plain names enough?

## Your question 4, answered plainly

I had asked which cards are keys and which are spendable. **Keys** are cards that let you try a move at all, such as the second passport for the Paso Huhūi post, or a way onto the freight. **Spendable** cards were the ones that would have been used up when they helped a roll.

Your decision settles it: cards are never spent by a roll. A card you hold helps every roll where it counts, and keys still open their moves. Nothing for you to decide here now.

## Order of work, once approved

1. Difficulty levels, because they only change numbers that already exist.
2. Bribe cash.
3. Traps, starting with the ones already written, then new calls drafted for your approval.
