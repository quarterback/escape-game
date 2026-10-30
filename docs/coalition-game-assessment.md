# COALITION — game design assessment
## From Papers Please + Hundred Days + Suzerain + Balatro

**What you're actually aiming for.** A pixel-art 16-bit game that feels like
Papers Please (bureaucratic, pixel art, oppressive atmosphere) but plays like
Hundred Days (turn-based, card placement, resource management) with Suzerain's
narrative depth (branching decisions, advisors, consequences) and Balatro's
roguelike card-draw core (deck building, synergies, escalating difficulty, dice
randomness). Data visualization is a component the player must read to act.

---

## What I took from each game

| Game | What it contributes | What I'm NOT copying |
|---|---|---|
| **Papers Please** | 16-bit pixel art aesthetic, oppressive bureaucratic atmosphere, the feeling of a desk job with moral weight, document/record as the core object | The core loop (stamp passports under time pressure), the day-by-day clock, the family survival budget |
| **Hundred Days** | Turn-based progression (each turn = a day/encounter), card placement on a board, some actions take multiple turns, weather/randomness affects outcomes, resource management (money, reputation) | Winemaking, vineyards, the specific agricultural simulation |
| **Suzerain** | Narrative branching through advisor conversations, decisions with ripple effects, personal stakes (career, safety, family), multiple endings, an in-universe political compass/statistics screen | Pure text, 1M+ word count, the presidency framing |
| **Balatro** | Card-draw roguelike core: you draw a hand, play combinations, buy modifiers (jokers) between rounds, escalate difficulty (blinds), synergies between cards, pixel art | Poker hands, the specific scoring system |

---

## How a level works

A **level = one checkpoint or stage of the journey.** The target's journey has
five stages (intake → review → border → transit → departure). Each stage is a
level. You advance by completing the encounter — playing the right combination
of cards, making the right decisions, managing your resources. Fail and you're
stopped (or you restart the level, or lose progress depending on difficulty).

**Within a level, a turn works like this:**

1. **Draw.** Draw 5 cards from your deck. Cards are: people (to process),
   documents (to verify or forge), actions (to investigate, delay, expedite),
   and resources (money, favors, information).
2. **Read.** The game shows you a data visualization: queue composition,
   processing times, approval rates, the target's journey progress, your
   record. You read this to decide.
3. **Play.** Place cards on the board. Each card costs energy (you have 3-4
   per turn). Some cards combo (synergies). Some have probabilistic outcomes
   (dice roll: "bribe" has a 60% chance of working).
4. **Resolve.** Cards resolve. The target may advance. NPCs react. Narrative
   events fire (Suzerain-style: an advisor appears, argues, you choose).
5. **End turn.** New cards drawn. Queue advances. Resources tick.

**Between levels (the shop):** You buy new cards (Balatro jokers → here:
relationships, tools, information, favors). You can remove cards from your deck.
You see your record and the target's progress.

**The dice (randomness):** Card draws are random (what you get). Some actions
have probabilistic outcomes. "Weather" or "delays" are random (Hundred
Days-style). But skill is in building synergies and reading the information.

---

## What your job is

You are a **clerk at a border checkpoint.** Your job depends on your side:

- **Help side:** Get the target through while maintaining plausible
  deniability. Process them "normally" but subtly help (route to a friendly
  supervisor, approve with a minor irregularity that won't be caught).
- **Block side:** Stop the target while not raising suspicion. Process
  normally but find a reason to deny (a missing document, a date mismatch).

Either way, you process ordinary people too. Their treatment matters — it
builds your record, unlocks information, and determines who trusts you later.

**The key tension:** You can't just approve or deny everyone. You have a
quota, a supervisor watching, and a record. The target must be handled
differently from ordinary people, but not obviously so.

---

## The card system (Balatro-like)

**Deck = your tools, relationships, and knowledge.** You start with a basic
deck of standard processing cards. As you play, you earn or buy:

- **People cards:** Specific NPCs who can help or hinder. "Friend in
  customs" (auto-approve one person), "Suspicious colleague" (scrutinizes
  your next approval).
- **Document cards:** Tools for verification or forgery. "Magnifying glass"
  (reveal hidden details), "Forged stamp" (makes any document look valid).
- **Action cards:** Investigate, delay, expedite, detain, refer.
- **Resource cards:** Money, favors, information, time.

**Jokers = relationships.** Between levels, you can acquire relationship
cards that modify how other cards work. "The supervisor trusts you" (your
denials aren't reviewed). "The target's ally" (you learn the target's next
move).

**Synergies:** Certain cards combo. "Friend in customs" + "forged document"
= auto-pass. "Suspicious colleague" + "investigate" = detain without
consequence. Finding synergies is the skill.

**Blinds (difficulty):** Each level has a "blind" — a constraint. Level 1:
process 5 people, 3 energy. Level 2: process 7 people, 2 energy, one is a
decoy. Level 3: process 8 people, 2 energy, supervisor watching (your
denials are reviewed). The blinds escalate.

---

## The dice (randomness)

- **Card draws:** What you get each turn is random (shuffled deck).
- **Probabilistic actions:** "Bribe" has a 60% chance of working. "Inspect"
  has a 10% chance of finding something even if there's nothing.
- **Weather/delays:** Random events that affect the queue (Hundred
  Days-style). "Storm delays 2 people" or "VIP arrives, skipping the queue."
- **NPC behavior:** Some NPCs act unpredictably. The "suspicious colleague"
  might scrutinize you or might not, depending on a roll.

**The skill is in building a deck that handles randomness well, not in
eliminating it.**

---

## Narrative depth (Suzerain)

**Advisors:** Between levels, an advisor appears (a minister, a colleague, a
family member). They argue a position. You choose. Your choice affects
relationships, resources, and available cards.

Example: Your supervisor says "Process faster, the queue is backing up." Your
colleague says "Be careful, someone's watching." You choose: speed up (more
errors possible, but supervisor trusts you) or slow down (safer, but queue
grows, people get angry).

**Ripple effects:** Helping the target might cost you your job (if caught),
or a relationship (if a colleague finds out). Blocking might make an enemy
who interferes later. These are Suzerain-style consequences.

**Multiple endings:** Based on your choices across the run:
- Target escapes, you're promoted (help side, undetected).
- Target escapes, you're fired (help side, detected).
- Target stopped, you're commended (block side, undetected).
- Target stopped, you're investigated (block side, detected — you were too
  aggressive).
- Target stopped by accident (neither side planned it — the "bureaucratic
  accident" ending).

**Personal stakes:** You have a family (like Papers Please) or a career or a
safety concern. These create pressure without being the core loop.

---

## The data visualization component

The game shows the player information they need to act:

1. **Queue dashboard:** Who's in the queue, their document types, wait times.
   A bar chart or timeline.
2. **Target's journey map:** A visual progress tracker showing the target's
   stage (intake → review → border → transit → departure). Updates as you
   play.
3. **Your record:** Approval/denial rates, accuracy, citations. A line chart
   over time.
4. **NPC trust levels:** A simple gauge or color-coded list showing who
   trusts you and who's suspicious.
5. **Post-game analysis:** After the run, a "debrief" screen showing your
   decisions, their consequences, and the target's journey as a timeline.
   This is where the data viz learning lives — students must read and
   interpret these to play well.

**The key distinction:** Representing information (the dashboard) and
deciding how the simulated system behaves (the rules) are different tasks.
The dashboard shows real game state. The rules are authored. If a student
presents a processing time as a measured fact about a real process, that
needs evidence. Fictional game data can be represented clearly.

---

## Pixel art style (16-bit, Papers Please aesthetic)

- **Palette:** Muted, bureaucratic. Greens, grays, browns, a single accent
  color (red for stamps/denials, blue for approvals).
- **Resolution:** 320x240 or 640x480, scaled up. Chunky pixels.
- **UI:** Desk, papers, stamps, a clock, a queue of people. Cards are
  physical objects on the desk.
- **Animation:** Minimal. Card flips, stamp presses, queue movement.
- **Typography:** Pixel font or a monospace that reads as bureaucratic.
- **Sound:** Paper shuffling, stamp sounds, a clock ticking, a phone ringing.
  Low-fi, oppressive but not hostile.

**What's NOT Papers Please:** No real-time timer pressure. No family
survival budget as the core loop. No stamping passports. The aesthetic is
Papers Please; the mechanics are card-draw roguelike + turn-based + narrative.

---

## How a level advances (the answer to your question)

**Level = one checkpoint/stage.** There are 5 levels (intake, review, border,
transit, departure). Each level is a run of turns (5-8 turns). You complete
a level by:

1. Processing enough people to "clear the queue" (a threshold).
2. Making the target's key decision (help or block at the right moment).
3. Not getting caught (no citations, or fewer than the limit).

**Between levels:** You enter the shop. Buy cards, remove cards, read your
record. An advisor appears with a narrative beat. Then the next level starts
with a new blind (constraint) and a new set of cards in the queue.

**Roguelike progression:** If you fail a level, you restart from the
beginning of that level (or the beginning of the run, depending on
difficulty). But you keep meta-progress: unlocked cards, knowledge of the
recognition cues, advisor relationships. Each run teaches you something.

**The "job":** You're a clerk. Your job is to process people. Your real
objective (help or block the target) is hidden inside that job. The tension
is between doing your job well (accurate, fast, compliant) and achieving
your side's objective (help or block the target without getting caught).

---

## What's still open (for your design)

1. **Perspective:** Are you the clerk or the target? The latest COALITION
   direction has the player as the clerk (helping or blocking). But the
   target's perspective could be a second mode or a later level.
2. **Card economy:** What do cards represent? Relationships? Tools?
   Documents? Knowledge? The meaning matters more than the quantity.
3. **Recognition mechanic:** How does the player spot the target? Document
   inconsistency (origin vs. issuing office)? A photo mismatch? A behavioral
   cue? This is the core skill — it needs to be learnable but not trivial.
4. **NPC behavior:** Do NPCs help/obstruct randomly, or based on
   relationships? How does the player build trust?
5. **Ending conditions:** What counts as "caught"? How many citations
   before game over? What's the difference between "stopped" and "detained"?
6. **Multiplayer:** The latest direction has side choice (help/block) but
   doesn't specify multiplayer. Could be single-player with AI opposition,
   or two-player.

---

## How this maps to the sprint

| Sprint phase | What the student does | Game equivalent |
|---|---|---|
| Notice | Find a boring system | Pick a system to gamify (from the boring systems list) |
| Blueprint | Map actors, handoffs, visible/hidden work, dependencies | Design the game's systems: who does what, what information moves, what the player can/can't see |
| Storyboard | Sketch moment-by-moment: sees, does, system responds, what changes, information needed | Design each turn: draw, read, play, resolve. Design the data viz the player reads. |
| Rules/storyline | Write win/lose, NPC behavior, card meanings, recognition cue | The game's rulebook |
| Agent build | Feed blueprint + storyboard + rules to agent | Get a runnable HTML5 build |
| Critique | Play another group's game, three questions | Does the player understand the dependency? Can they see the choices? Do they attribute the outcome correctly? |
| Revise | Fix what broke understanding | Tune the recognition cue, the card balance, the information design |
| Publish | Put online | Deploy to Netlify/GitHub Pages |

---

## References

- Papers Please (Lucas Pope, 2013) — aesthetic reference, not mechanical.
- Hundred Days (Broken Arms Games, 2021) — turn-based card placement,
  resource management, weather randomness.
- Suzerain (Torpor Games, 2020) — narrative branching, advisor
  conversations, ripple effects, multiple endings.
- Balatro (LocalThunk, 2024) — card-draw roguelike, jokers/synergies,
  blinds/escalation, pixel art.
- Nicky Case, "How I Make an Explorable Explanation" — practitioner
  method for curiosity → concrete experience → understanding.
- The Pudding, "Why some people mow a lawn better than others" — playable
  everyday task + visual analysis.
