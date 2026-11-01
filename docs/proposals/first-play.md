# Proposal: a guided first play that teaches by doing

**Status:** proposal for the owner. Nothing here is built yet, except where marked "done in this branch".
**Evidence:**
- [Stand-in playtest](../playtests/first-play-proxy-findings.md): an agent with no prior knowledge played the live demo on a phone. This is not a human observation; the owner's own notes from watching a real player outrank it.
- The owner's report from watching a person play.
- [World accessibility audit](world-accessibility.md).

## What the first play gets wrong today

These are the observed failures, in the order a new player meets them.

1. **Reading before playing.** The demo opened with three reading steps. The round briefing then added a fourth screen, and a briefing came back every round.
2. **The coach points at the wrong thing.**
   - It says "Do the highlighted step" while the only glowing button is a different one (Hang up).
   - The target is often below the fold.
   - The coach box covers half the phone screen and doesn't scroll.
3. **Instructions arrive before their target exists.** The coach asked for the next call or move five times while the player was still on a result screen. The player had to click through "See what happened", "Next round", the briefing and "Start round" to reach it. This is the "same thing twice" the owner saw.
4. **Locked controls with no reason given.**
   - Message answers are greyed out during the demo, though the hint says "Answer any messages first".
   - Calls on the Phone tab are greyed out when the coach expects them on Here.
5. **Numbers that contradict each other.** One police attention change appears three ways: a chip on the move, a line in the round summary and the bar. They don't agree within one round.
6. **Lore before role.**
   - Sosā, Vélez, "the freight", Atlanta and Lāyūna, "the party machine" and "colônia" all appear before the player knows what they are.
   - Internal card codes leaked onto the cards ("number:information 1").
7. **A promise followed by a fake roll.** "Guaranteed success", then "You rolled 6 and needed 1" for a roll that never happened.

## The sequence

The rule for every step: the player meets a mechanic when they have to use it, and the explanation arrives with the decision, never before it. No step is a reading assignment, and nothing below adds explanatory copy. The work is in changing when things happen and what the screen shows.

**0. Start (no reading).** Title, then "Play the demo". The first thing the player sees is the scene with the phone ringing: their brother is calling.

**1. The first decision: where you are going (round 1, phone).**
- Duartē's call is on screen with three answers.
- The coach is a single line pinned to the bottom of the screen ("Answer your brother"). The answer buttons glow, and the screen scrolls to them.
- Answering ends the call; nobody hangs up (done in this branch).
- What the player learns by doing: you have a brother arranging a jet, and you pick where it flies.

**2. The first move: get out of the house (round 1, move).**
- The move list appears with the decoy convoy highlighted.
- Its card shows the chance and the time on separate lines, and the die rolls on screen.
- What the player learns: moves take time and are decided by a die.
- **Police attention** is introduced the first time it changes on screen. The bar pulses and the coach line names it ("Police attention: at 10 the police stop you").

**3. The round moves on by itself (done in this branch).**
- The dice and the hours play out, the next round starts, and a "What just happened" panel keeps the result on screen until the next move.
- The coach waits until its target is visible before it says anything (still to build: a coach step should not show until the screen it names is showing).

**4. The police, by role (end of round 1).**
- The first time the police box changes, the coach line reads "The police are searching for you". The scene box already says "Police are searching where you are" (done in this branch).
- The police are named after the player has watched them act for a round: "Inspector Sosā runs the search." That uses the line from the world audit, section 5.

**5. Calls, when a call is the thing to do (round 2).**
- The visa call is suggested when the visa is the open requirement, with the call button glowing.
- Calls work from either the Phone tab or the move phase until you move, so a call is never locked out (done in this branch).

**6. Cards, when a card changes a roll (round 2 or 3).**
- The first time a card lowers a number, the card that did it is named on the move ("Easier with Nando's spare sedans").
- The card kinds are shown in plain words, never internal codes (done in this branch).

**7. Deadlines, when one approaches.**
- The escape deadline is in the header from the first screen.
- The passport deadline is introduced when it is 12 hours away, or when it is first relevant at the border, not on the first screen.

**8. Hand off.** After the border, the coach steps away with one line ("The rest is yours"), and the player plays the airfield alone.

## What changes in the code

These are sequencing and display changes. No rule changes.

- **Reading steps go away.** Each "read" step in `tutorials.json` becomes either a coach line attached to the event that makes it true, or it is dropped where the screen already shows the fact.
- **A smaller coach.** It becomes a one-line pinned strip with a target. The strip scrolls the target into view and makes it glow, and never covers the playing area.
- **Coach steps wait for their target.** A step only shows when its control is on screen and enabled. This removes the "instruction before target" failure.
- **The demo stops locking answers.** It allows any message answer, or hides messages the step doesn't use.
- **One police attention number per round.** The move chip and the round summary both report the same change as the bar. This needs tracing first, because the summary currently mixes drift with move effects.
- **The briefing is a reference.** It stays behind its button and opens on request (done in this branch for every run, not only the demo).

## Questions for the owner

1. Should the demo still choose the destination for the player, or should the first decision be the real choice?
2. Should the first run be the demo by default, with the normal run unlocked after it, or stay a separate button?
3. When should Sosā first be named on the escape side: end of round 1 (proposed), or later?
