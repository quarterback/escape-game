# COALITION sprint — turning a system into a playable experience
## UT330 Interaction Design & Urban Experiences | Fall 2026

**What this is.** Next week's data visualization lab becomes a 4-class sprint in
which each group takes a real or fictional system, maps how it works, and turns
it into a small playable HTML5 game. Data visualization is a component of the
game, not the whole assignment — the game has to *need* the information it
shows.

**The through-line.** Research → roadmap of a problem → playable experience.
Every deliverable below is a draft of something already required in the final
project deck (Addendum #1): the current-state map (item 3), the proposed
interaction flow (item 4), and the data visualization (item 5).

**Scope rule.** Small enough to finish and revise. A 90-second experience you
can play twice beats a five-minute one you can't complete. The point is the
interpretation, not the code volume — an agent writes the code.

---

## The concept in one paragraph (for students)

Pick a "boring" system you can observe: course registration, a library hold,
a repair request, a transit transfer, a permit application, a food pantry
intake. Map how it actually works — who does what, what information moves
where, where people get stuck. Then choose one person's perspective inside that
system and make a game out of what they can see, decide, and change. The data
your game shows is the information that person needs to act. The agent builds
it; you author the situation, the rules, and the storyline.

---

## Four-class sprint

### Class 1 — Notice and map (remote or studio)

**In class (90 min):**
1. **10 min — Framing.** Show the COALITION origin: one article, one
   observation (even powerful people depend on other people doing specific
   work), two questions — "the service blueprint of an escape" and "the game
   mechanics of this therein." Then the framing question: *what boring thing
   can you turn into a game?*
2. **20 min — Blueprint exercise.** Each group picks a system they can observe
   firsthand. Fill in the blueprint template (below): actors and objectives,
   actions and handoffs, visible interactions, supporting work, information and
   dependencies, evidence and open decisions. This is the "heft" — the
   interpretation that has to precede the game.
3. **30 min — Source + gaps.** Groups find or make evidence about their
   system: photos, a short interview, a walk-through, an open-data page.
   Write down what is established vs. what they are inferring or inventing.
   (Fiction is allowed — but label it.)
4. **20 min — Perspective choice.** Each group picks whose experience the
   game represents and writes one paragraph: what that person can see, what
   they can change, what they cannot see, what success means.
5. **10 min — Share.** One group reads their paragraph. Class asks: what
   would the player misunderstand?

**Homework (due Class 2):** finished blueprint + chosen perspective + three
candidate "what the player can do" actions.

### Class 2 — Storyboard and author the rules

**In class (90 min):**
1. **15 min — Storyboard workshop.** Sketch the game as a task flow: moment
   by moment, what the player sees, what they do, what changes, what they
   learn. Use the storyboard template.
2. **20 min — Decide the information.** For each moment: what data must be
   visible, how is it encoded, what comparison is possible, what could be
   misunderstood? This is where the data viz objective lives.
3. **20 min — Write the storyline and rules.** Plain language, no code. Win/
   lose conditions, what an NPC can do, what a card or reward represents and
   why. If you use a reward, say what competent play means — don't let
   "approve everything" be optimal.
4. **20 min — Agent build, round 1.** Feed the blueprint + storyboard + rules
   to an agent (starter scaffold provided). Get a runnable HTML5 build.
5. **15 min — Play and note.** Play your own build. Write three things that
   don't match your intent.

**Homework (due Class 3):** revised build + a "what changed" note (which
assumptions you kept, revised, or rejected, and why).

### Class 3 — Critique and revise

**In class (90 min):**
1. **10 min — Pair playtest.** Swap builds with another group. Play for 5
   minutes. The player narrates what they think is happening; the author
   takes notes and does not explain.
2. **30 min — Critique.** Three questions per game: Does the player
   understand the dependency? Can they see the available choices? Do they
   attribute the outcome to the right cause? (These are the evaluation
   questions from the sprint report — use them as the critique frame.)
3. **40 min — Revise.** Fix the one or two things that broke understanding.
   Don't add features. Rebuild and re-play.
4. **10 min — Share.** One sentence per group: what you changed and why.

**Homework (due Class 4):** final build + short write-up (see deliverables).

### Class 4 — Publish and present

**In class (90 min):**
1. **20 min — Publish.** Put the game online (GitHub Pages, itch.io, or
   Netlify drop). Test the link on a phone.
2. **60 min — Presentations.** 5 minutes per group: play the game live for
   60 seconds, then explain the system, the perspective, the information
   design, and what you learned. Every member speaks.
3. **10 min — Debrief.** What did mapping a system teach you that making a
   prototype didn't?

---

## Deliverables (due end of Class 4)

1. **Playable HTML5 game**, published at a public URL.
2. **Service blueprint** of the system (the map).
3. **Storyboard** of the game as a task flow.
4. **Rules and storyline** document (plain language, no code).
5. **A 300–500 word note:** what assumptions you kept, revised, or rejected
   and why; what the agent added that you kept vs. removed; what you learned
   about the system by trying to make it playable.

These map directly onto Addendum #1 items 3 (current-state map), 4 (proposed
interaction flow), and 5 (data visualization) of the final project.

---

## The blueprint template (fill in, don't write prose)

| Area | What to make visible |
|---|---|
| **Actors and objectives** | Who is involved, what each wants, who can affect another person's progress. |
| **Actions and handoffs** | What happens, who does it, what the next person needs before they can act. |
| **Visible interactions** | What the person moving through the process can see, request, provide, receive. |
| **Supporting work** | Coordination, decisions, records, preparations outside that person's view. |
| **Information and dependencies** | Who knows what, which conditions must hold, where timing/sequence matters. |
| **Evidence and open decisions** | What is established vs. inferred (real source) or authored vs. undecided (fiction). |

## The storyboard template (one row per moment)

| Moment | Player sees | Player does | System responds | What changes | Information needed |
|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... |

## Starter scaffold

A runnable single-file HTML5 game is provided in `coalition-starter/index.html`.
It implements a minimal "processing queue" mechanic: a stream of people, a
target among them, approve/deny/route decisions, a live chart of decisions over
time, and a win/lose condition. It is heavily commented with `STUDENT TODO`
markers showing where to swap in your scenario, rules, and information design.
Open it in a browser; no build step. Deploy by dragging the file to Netlify
Drop or pushing to GitHub Pages.

## Candidate "boring systems" (starting points, not assignments)

- Course registration / advising appointment
- Library hold pickup
- Repair or maintenance request
- Transit transfer or fare inspection
- Permit or license application
- Food pantry or clinic intake
- Parking or towing dispute
- Event check-in or volunteer coordination
- Room/building access request

## Ground rules

- **Fiction is allowed and encouraged.** Invent cities, offices, rules, and
  documents. Label what is invented.
- **The agent writes code; you write the situation.** If you can't explain
  the rule in a sentence, it isn't ready to be built.
- **No LLM for the analysis or the writing.** The blueprint, storyboard,
  rules, and note are yours. The agent implements; it does not interpret.
- **Small and finishable.** A 90-second game you revised once beats a
  five-minute game you didn't.

## References for students

- Nicky Case, "How I Make an Explorable Explanation" (blog.ncase.me) —
  practitioner method: start with a question, give a concrete experience,
  build understanding through connected consequences.
- The Pudding, "Why some people mow a lawn better than others"
  (pudding.cool/2026/06/mow) — a playable everyday task plus visual analysis
  of behavior. Production scale is not the expectation; the connection is.
- 18F Service Blueprint method (guides.18f.org) — the mapping method.
