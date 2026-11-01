# Proposal: a real die and cards you earn and spend

**Status:** proposal for the owner; not implemented. It replaces the earlier "minimum roll of 2" proposal.

**Owner's requests:**
- Oct. 31, 2026: "Every move should resolve through a visible die roll... Cards should improve the player's chances, but should not silently bypass the mechanic."
- Oct. 31, 2026: "Cards should be given or earned after choosing things and then get used or don't, and dice actually roll, and more than a 6-sided die. I want more variation."

## Today's rule (traced)

- **One six-sided die.** Each move has a difficulty, and each card that counts at the stop lowers the number needed by 1 or 2.
- **Cards can remove the roll.** At a target of 1 or lower, no die is drawn and the move goes through (`src/sim.js`, `src/gov.js`).
- **Cards are never spent by using them.** A card you hold helps every roll it counts on, for as long as you hold it. You lose cards only through story events, betrayal or leaving their stop.
- **Allies' replies and news choices** roll the same six-sided die against their own targets.

## Proposed mechanic

### 1. A 20-sided die, rolled on screen for every move

- **Every move, news roll and ally reply rolls a d20.** The player sees the die tumble, the number, the target and the result.
- **A 1 always fails and a 20 always succeeds.** No move is certain and no allowed move is impossible, so the "no roll needed" state disappears.
- **Targets keep today's odds.** Each six-sided target is mapped to the d20 target with the same chance:

| Today (d6) | Chance | Proposed (d20) | Chance |
|---|---|---|---|
| 2 or higher | 83% | 4 or higher | 85% |
| 3 or higher | 67% | 8 or higher | 65% |
| 4 or higher | 50% | 11 or higher | 50% |
| 5 or higher | 33% | 14 or higher | 35% |
| 6 | 17% | 18 or higher | 15% |

- **The card shows the target and the chance:** "Roll 11 or higher (50% chance)".

### 2. Cards add to the roll, and the player chooses to play them

- **Before the roll, the player sees which held cards could help this move.** Each one shows what it adds, for example "Nando's spare sedans: +4". The player taps the ones to play, sees the target and chance update, and then rolls.
- **A played card is spent.** It leaves the deck after the roll, win or lose.
- **Bonuses vary by card,** from +2 to +6, instead of today's flat 1 or 2. That gives the variation you asked for: a strong card can turn a long shot into a likely success, and a weak one nudges it.
- **Key cards are different.** The second passport (needed at the Paso Huhūi post) and a way onto the freight (needed to board) are requirements, not bonuses. They stay keys and are not spent by a roll, except where the story already spends them (boarding the freight).

### 3. Cards are earned from choices

Cards come from the decisions the player makes and are shown at the moment they are earned. For example: "Nonā Rosa gives you her truck: +4 on the road to Salta". Sources that already exist:
- helping someone (Nonā Rosa's truck, Holt's crate);
- news choices that give a card;
- allies coming through (Vélez's introduction);
- the starting cards from your party and family.

To make spending workable, more choices need to give a card. The earning table is the main design decision this proposal leaves open (see "Balance").

### 4. Optional: degrees of success

- **Beat the target by 10 or more** and the move takes an hour less.
- **Miss by 10 or more** and police attention rises by one more.

This adds variation without new moves. It needs its own calibration and is offered separately.

## Balance (measured with a throwaway prototype)

The calibration bots played 400 seeded runs per side for each version. The prototype was a scratch copy; no game file changed.

| Version | Teresā wins | Matēu wins |
|---|---|---|
| Today: d6, cards never spent | 34.0% | 32.0% |
| d20 with the same odds, cards never spent | 32.5% | 30.5% |
| d20, every card spent when used | 24.0% | 22.3% |
| d20, cards spent, bonuses doubled | 24.0% | 24.3% |
| d20, cards spent, used only on hard rolls | 21.0% | 20.3% |

What this shows:
- **The die alone barely moves balance.** It drops about 1.5 points, from the 1-always-fails rule and the loss of certain moves.
- **Spending cards is the big change.** About 10 points harder, because today one card helps three or four rolls per run, and spent cards help once.
- **Bigger bonuses don't fix it by themselves.** The bot runs out of cards, so the strength of each card matters less than how many it has.
- **The fix is earning.** More choices must give cards, so a player can earn roughly one card per stop. The bots' use of cards is crude, so a thoughtful player will do better than these numbers. The earning table still has to be written, then calibrated, before this ships.

The owner has said the game should stay hard. Today's win rate is about one run in three. Where it should land after this change is the owner's call.

## Decisions for the owner

1. **The die:** d20 (recommended: classic, with fine-grained odds) or d12.
2. **The target win rate** for a run after the change.
3. **Degrees of success:** yes or no.
4. **Which cards are keys and which are spendable bonuses.** Proposed: the second passport and the freight cards are keys; every other card is spendable.
5. **The earning table:** which choices give which cards. I can draft it from the existing events and moves for review.

## What changes if approved

- `src/sim.js` and `src/gov.js`: the d20 roll, the target mapping, the natural 1 and 20 rules, card bonuses added to the roll, and spending.
- `src/data.js`: card bonus values, the earning sources, and the key flag.
- **Interface:** a "play cards" step on the selected move (tap to add, live odds), the d20 animation, and the result showing die, bonus, total and target.
- **Tutorials:** the scripted dice become d20 values, and the guided run (prescriptive, per the owner) plays one card on purpose so the player sees it spent.
- **Checks:** contract tests updated for the d20, and calibrations rerun before and after.
