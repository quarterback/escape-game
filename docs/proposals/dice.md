# Proposal: every move resolves through a visible die roll

**Status:** proposal for the owner; not implemented.
**Owner's request (Oct. 31, 2026):** "Every move should resolve through a visible die roll... Cards should improve the player's chances, but should not silently bypass the mechanic... choose a move, decide whether to use available help, roll the die, see whether the move succeeds, and understand the time and consequences."

## Today's rule (traced)

- Each move has a difficulty. Each card that counts at that stop lowers the number needed by its bonus (`src/sim.js`, approach list; `src/gov.js`, orders).
- `need = max(1, difficulty - bonus)`. At 1 or below, no die is drawn and the move goes through.
- Five moves and orders have a base difficulty of 1. Several more reach 1 through cards: the decoy convoy with the friend in the inquiry, boarding with Holt's crate, and the escort post when Vélez's officials wait there.
- **Done in this branch:** the game no longer invents a result. The log says no roll was needed, and the move card no longer promises success.

## Proposed rule

1. **No move needs less than a 2.** `need = max(2, difficulty - bonus)`. A 1 always fails. The best possible odds are 5 in 6.
2. **Cards still lower the number.** Their bonus applies as today, down to the floor of 2, so cards improve the odds and never remove the roll.
3. **Every move shows the same sequence.** Pick the move, see the target ("Roll 3 or higher"), see which cards lowered it and by how much, roll the die on screen, then see the result, the hours and the consequences.
4. **Moves that are not chance stay unrolled:** waiting an hour, calls (allies roll their own reply) and resting. Choosing whether to use help is a separate question; see "Using help" below.

## Effect on balance (measured)

The calibration bots played each version with the same seeds. Only the floor changed.

| | Floor 1 (today) | Floor 2 (proposed) |
|---|---|---|
| Escape side, Teresā, win rate (500 runs) | 35.0% | 31.8% |
| Escape side, Matēu, win rate (500 runs) | 34.4% | 32.4% |
| Government side, she escapes (400 runs) | 45.5% | 43.8% |
| Escape side, average hours used (Teresā / Matēu) | 46.7 / 45.3 | 47.6 / 48.4 |

The escape side gets about 2 to 3 points harder, because a move that used to be sure now fails 1 time in 6, costing hours and sometimes police attention. The government side moves about 2 points in the ministry's favor. The owner has said the game should stay hard, so this direction fits. Both guided runs still replay correctly with their scripted dice under the floor of 2.

## Using help (needs a decision)

Today, every card that counts at a stop applies automatically. A choice to use help only matters if using it costs something. Without a cost, the player would always say yes. Three options:

1. **Keep it automatic, but show it.** Each roll lists the cards that lowered the number (already done) and the die rolls on screen. There is no new decision.
2. **Help with a price.** A person's card used on a roll marks that person: Sosā is more likely to call them in, or they trust you a little less if the roll fails. This is a new mechanic and needs its own calibration.
3. **One-use help.** Some cards are spent when used. Again, this is a new mechanic.

Recommendation: ship rule 1 now (the floor of 2, with every move rolled on screen) and decide on help separately.

## What changes if approved

- The floor changes in `src/sim.js` and `src/gov.js` (`Math.max(1, …)` becomes `Math.max(2, …)`), and the escort post stops setting difficulty 1.
- The no-roll display path is removed, because every move rolls.
- Calibrations and both tutorial replays are rerun. The demo's scripted dice may need one or two values changed to keep its story.
