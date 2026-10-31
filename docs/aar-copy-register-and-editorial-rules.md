# Agent Action Record: the copy register, and the rules it took to find it

**Review date:** 2026-10-31
**Reviewed by:** agent self-review; owner review pending
**Agent / system:** Claude Code (cloud session), branch `claude/vigilant-noether-rmcm7h`
**Task or period under review:** Every player-facing string touched or written on 2026-10-30 and 2026-10-31: the destination screen, the daily run, the phase hints, the round summary, the landing page, both demos, and the interface catalog
**Accountable human (name or role):** Ron Bronson, game owner

## 1. Intent — what was supposed to happen

**Instructions given (actual wording, in order):**

> the content clearly hasn't been run through humanizer and doesn't follow the content rules we stated. "Who asks" is not UI copy written by human

> do not soften claims ever, it's not a bible it's a fake game

> that's not a narrative, that's slop

> Remove ALL the couplets … no "each one shows what it costs" no two sentences when one will do

> Still more instruction couplets not ap style

> Rewrite all those sentences from scratch and add an editorial rule around what you learned

> Your writing sucks mine is better … Did you learn from how I write? Can you infer how to fix other bad writing?

> Do it now, the game is unreadable as is and it makes it tough to follow. Same with demo instructions

**Success defined in advance as:** copy that reads like a person wrote it, by the repository's own rules (Humanizer, plain language, AP style), with nothing hedged, no couplets, no label rows, and the demo followable by a new player.

**Authority granted to the agent:** rewrite any player-facing string; add checks and rules; commit and push to the designated branch.

**Out of scope:** the rules of the game. Every calibration run before and after a copy change had to match.

## 2. Action — what actually happened

**What the agent did, in order, with what was wrong each time:**

1. Built the destination screen from the design mockup and copied its label rows ("Who asks", "The catch", "Has not said yes") onto the game. The owner caught it on a phone. Copying a mockup is not a copy pass.
2. Rewrote the cards as two sentences. Flat, but a manual.
3. Softened two landing-page claims I could not back ("some of the people", "runs are short"). Owner: never soften. Restored.
4. Rewrote the landing page as feature sections with eight headings. Owner: slop, not narrative. Rewrote it as the story in the game's voice.
5. Cut "couplets" across the interface: 68 two-sentence strings became one sentence, and a content check (C15) now fails the build on a second sentence in an interface string.
6. Applied AP: numerals (words below 10, figures from 10), times ("2 p.m.", "noon", "midnight"), month abbreviations, no false titles. The clock format changed everywhere from "Sat 17:00" to "Sat 5 p.m."
7. Ran a regex sweep for Humanizer's structural tells (staged contrasts, fragments, repeated openings, anaphora, stock words) and rewrote every hit.
8. Rewrote the three card lines five times. Each was shorter and each was worse, because each was a rule restated. The owner then wrote them:

   > A family associate has agreed to arrange safe passage, but he has sent a wire request.

   > A government official has agreed to help, but is notoriously fickle.

   > The trade envoy has agreed to secure safe passage in exchange for mineral rights that you cannot guarantee.

9. Read those against mine and wrote down the difference (§3). Then applied it to both demos (32 steps from scratch), 125 interface strings, the six level objectives, the three arrangement blurbs, and one line of Duartē's.

**What it produced or changed:**

- `content/coalition/ui.json`: the catalog, roughly 230 strings rewritten across the two days.
- `content/coalition/tutorials.json`: both demos, every step.
- `src/data.js`: destination cards, the Zaryanova sponsor's price (mineral rights, to match the owner's card), level objectives, arrangement blurbs, two one-choice events given a second choice, AP numerals in record text.
- `content/policy.json` and `tools/content-check.js`: rule C15, one sentence per interface string.
- `tools/pbbg-policy.json`: the owner's standalone checker runs over the game with forbidden phrases for dashes, the banned phrase, Humanizer stock words and the label-row words.
- `AGENTS.md`: three new sections. "Difficulty is the owner's, and it stays hard." "Write claims flat and sure." "Write microcopy like a person talks."

**Where actual behavior differed from the instruction:** the owner asked for the rules to be run and they were not, five times, until the owner wrote the copy himself.

**Stayed within granted authority?** Yes. No rule of the game moved; calibration matched before and after every copy commit (32.0% / 31.3% over 300 seeds).

## 3. Judgment — human in the loop

**What I learned from the owner's lines, stated so the next agent can use it:**

- Lead with the situation, then turn on it. "Has agreed … but." The turn is the whole card: a promise with a catch the player has to weigh.
- Role before name. On a first screen, "a family associate" tells the player what kind of help this is; "Amādū Salek" tells them nothing yet.
- Give the player a judgment, not a fact. "Notoriously fickle" and "rights that you cannot guarantee" ask for a decision. "He helps once the accounts are his" asks for nothing.
- One thought per sentence, and a thought can have a hinge in it. My couplet rule made me chop to clipped fragments; the owner's lines are longer than mine and read better. The rule was never "short."
- Keep the game's recurring words ("safe passage") so a set of cards reads as a set.
- Never patch a flagged sentence. Each of my patches kept the skeleton of the bad one.

**Decisions the agent made on its own:** the C15 check and its exemptions (dialogue, scenes, cards, tutorials, endings); treating dice faces, exposure scores and round numbers as tabular figures under AP; giving Sosā a pronoun (he); keeping the daily's destination the player's after trying to fix it from the date (two days in three would have been unwinnable).

**Of those, which should a human have made or seen:** Sosā's pronoun. The daily destination call. Both are flagged in the addenda to `docs/aar-destinations-and-the-border.md`.

**Where a human actually intervened:** at every step in §2. The owner is the editor of record for this copy.

## 4. Deviation — the gaps

The repository already had the rules (AGENTS.md pointed at Humanizer and plain language from the first copy AAR). I treated them as a check to run at the end instead of the way to write the first draft, and the checkers, which test shape rather than voice, passed slop. A rule that says "run Humanizer" was not enough; the AGENTS.md section now gives the failure patterns by example.

## 5. Consequence — what it cost or risked

- The owner spent a day correcting one screen's copy by hand.
- Two "demo" tutorials now read as a person talking a new player through a run; the previous version read as a feature list, which is what "tough to follow" meant.
- Every interface string is one sentence, enforced. A future couplet fails the build.
- The checkers (content check, the owner's checker, both tutorial replays, six contract tests) are clean, and the calibration harness is unchanged, so this was copy and not rules.
- Risk kept: C15 is a sentence counter. It will pass a bad single sentence and fail a good second one; the exemptions are by pattern, so a misfiled entry gets the wrong rule. It catches the shape the owner named and nothing more.

## 6. Change — what happens next

- Owner reads the demo end to end on a phone. Any line that reads as a manual gets rewritten from nothing, not trimmed.
- The next agent reads "Write microcopy like a person talks" in AGENTS.md before writing a single string, and writes the draft in that register rather than checking it afterward.
- When a line matters, show it to the owner before it ships.
