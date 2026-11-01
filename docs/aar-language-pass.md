# Agent Action Record: place names and the Nov. 1 language pass

**Review date:** 2026-11-01
**Agent / system:** Claude (design session), with six review subagents
**Accountable human:** Ron Bronson, game owner
**Branch:** `claude/language-pass` (PR #26), stacked on PR #25

## What the owner asked for

1. "I need all of the language to be run against humanizer and AP style and UI style guides to ensure things make sense."
2. Mid-task: "Crucial that all place names sound like place names and ARE NOT named after humans. Do not follow canon to do this, I am the author." He then asked whether Atlanta was renamed too, and approved the proposed names ("Yes those work").

## Place names

| Before | After | What it is |
|---|---|---|
| Esmeralda | Costamar (Costamaran) | The neighboring country |
| Baca | Cerro Alto | Costamar's capital |
| Susana | Portalba | The port town with the airfield |
| Santa Laura | Pedra Branca | The town on the road south |
| Atlanta | Altamira | Destination that will take you |
| Tarun | Ardésia | Destination that refuses |
| Zaryanova | Nordavia | Destination that refuses |
| Gannibal | Krasnomor | Nordavia's city |

The renames went into player text, demos, the map label, the about page and the demo checks. Internal ids are unchanged, so any name can be swapped in one place. AGENTS.md and the data file's header record the rule. One article broke ("An Costamaran") and was fixed.

## How the pass ran

- **The brief** (`docs/text-audit/2026-11-01/brief.md`) gave six reviewers:
  - the owner's player-language rule;
  - Humanizer's 26 patterns plus the owner's couplet and clipped-beat tells;
  - AP style;
  - the interface guides in `docs/content/`;
  - the facts that changed this week: the 20-sided die, cards in the background, the stop screen and the renames.

  Every string was traced to the code that shows it, and every row recorded in a table.
- **Coverage.** 1,586 strings in six tables:
  - escape data;
  - escape news;
  - the government side;
  - the interface, in two parts;
  - the demos and credits.

  The reviews proposed 281 rewrites and held 66 lines for the owner.
- **I read every proposal before applying it.**
  - Mechanical checks ran on each: the original still matches, placeholders kept, no dashes, button length, and one sentence for interface patterns.
  - Then I read each by hand. About 20 were changed or skipped. The skipped ones were double-period workarounds that a code fix made unnecessary.
  - One proposal brought back "one more on the die".
  - The demo step named the old Follow button.
  - My newer dice previews had to be kept.
  - Two proposals broke the one-sentence rule.

  273 applied by script, the rest by hand.

## Code problems the reviews found, fixed on this branch

- A comment swallowed the rest of a line in the event narration, so the police attention sound never played and the code fell into the next case. I made the same mistake once more while fixing the card notice, and the parse check caught it.
- Lines ending on a clock printed "2 p.m.." The content helper now drops the second period.
- The "If it works" and "If it fails" chips lowercased their whole text ("sosā", "costamar").
- Old six-sided numbers were still in text:
  - the sponsors' demands ("on a 3 or better");
  - the ally reply preview, which also left out the trust bonus the roll uses;
  - the sibling's city pick;
  - the three government request previews;
  - "one more on the die" in several places.

  All now show the 20-sided target the roll uses, bound from `Data.DICE` where the code builds the text. The C16 regression test now scans the data tables, the demo and this wording.
- The government ban preview, which was a raw string in `gov.js`, moved into the catalog. It no longer claims that a sent ban does not close the border; in the game, the ban works as soon as it is circulated.
- The card notice was a label and value ("Where it counts: …"). It is now a sentence ("It counts for boarding the midnight freight").
- Police stop steps showed "step 2 of three". Both numbers are now words.

## Kinds of rewrite applied

- **Results that now say what changed:**
  - the police learning where you are when someone sells you out;
  - Costamar's request making takeoff harder and allowing a stop;
  - a quiet sibling's replies coming four hours later;
  - a bought post's fail line saying you are turned back.
- **Moves are verb phrases:** "Send out a decoy convoy", "Leave by the service door", "Ride out in the party's car", "Ask Theo to walk you through".
- **"The police" in interface text** where it read "Sosā". Dialogue keeps his name.
- **Clipped fragments became sentences.** Humanizer tells were removed: staged contrasts ("A promise is not a plane"), dramatic closers ("Not for you. Yet."), and couplets.
- **Lines written for one character no longer reach the others:** the sponsor lines about banking, and "your brother" said to Matēu.
- **False timings removed:** "tonight", "at six", "before midnight" on cards that can fire at any hour.
- **Debrief terms:** "town" became "stop", because the residence and the line are not towns. The debrief now says it counts hours with an order or a news answer, which is what the code counts.
- **Two demo instructions now match what is on screen:** the government search step and the reports step.
- **AP style:** numbers, serial commas, periods inside quotation marks, "canceled", "license", "ride home", and "great-aunt".

## Held for the owner

66 lines are listed in `docs/text-audit/2026-11-01/held-for-owner.md`. The biggest groups:
- **The ending never shows why the run ended.** The win line, the landing text and the epilogue are written but never shown.
- **The government view still reveals her position:**
  - the minister's reply to a named town;
  - helper and jet details in the round summary;
  - her police attention in the summary;
  - inquiry texts addressed to "you".
- **Labels that promise rules the game does not have:**
  - the travel ban confirmation;
  - Costamar "holding" her;
  - the strike and blizzard blocking nothing;
  - leave choices that do not move you;
  - the bought post that shows "Success" first.
- **The escape demo stays scripted after Finish.** This is already high priority in the backlog.
- **Result cards after news choices leave out trust, search and deadline changes.**

## Checks

- Content check: 0 errors, 0 warnings. pbbg-check passes.
- Contract tests pass, including C14: changing every string leaves the rules identical.
- Both demo replays pass, and the house arrest check shows 0 of 80.
- Calibration is unchanged at 46.7% (Teresā) and 42.3% (Matēu), as a copy pass must leave it.
- A phone-width browser run showed the renamed moves, the dice lines and the stop screen with the new names, with no page errors.

## What went wrong

- **The old six-sided wording survived PR #25 in text.** The C16 test only scanned code. It now scans data and demo text too.
- **I repeated the comment bug the review had just found.** The parse step in the build caught it before anything shipped.

## Second round, Nov. 1, 2026: the held lines resolved

**Owner's instruction:** the language pass is approved. Resolve the remaining issues in PR #26:
1. ending text;
2. government position leaks;
3. labels that misdescribe the rules;
4. the bought post shown as a dice success;
5. formatting, duplicates, misleading status indicators and tutorial mismatches;
6. tutorials that teach controls without revealing outcomes;
7. rename Lāyūna;
8. no new mechanics, screens or management systems.

**What changed:**
- **Endings.** The end screen shows the reason, then "What happened" (the takeoff, landing or capture line), then "Afterward" (the epilogue).
  - The why lines now say why: "before your immunity ran out", "Police stops climbed to house arrest", "its police hold you for Valdória".
  - Endings store the story and the epilogue separately.
  - The warrant line no longer appears after the president's deal, which closes the case, or says "by Monday" on Tuesday.
- **Government leaks.**
  - The minister's reply and announcement are identical whether or not she is at the named town; a wrong claim still sends the police there, unseen.
  - Police actions run from the government side pass on only their own line and a questioned helper's answer, in the third person (`gtext` in `ENEMY_ACTIONS`, gov variants of the inquiry suffixes). Her police attention, jet progress and cards no longer reach the round summary.
  - A stop the police make becomes a desk report written as a sentence.
- **Labels.**
  - Travel ban: in force once sent; it makes crossing harder and never closes the border. Confirming only has the post confirm it, and the briefing row counts the ban as done once it is in force.
  - Costamar: agrees to a request with listed effects; it never "holds her".
  - Strike, blizzard and storm block nothing. Choices that moved nobody are relabeled: "Lie low nearby for an hour", "Use the dark to lose them", "Stop working with Holt", "File the short route".
  - The yardmaster's favor now says Theo walks you through, matching the card it gives.
  - The Portalba arrival no longer claims Sosā asked Costamar to hold you.
- **Bought post.** A won roll at the bought post shows "Turned back at the Costamaran post", a neutral die and the log line "The Valdórian side let you through, but the Costamaran post turns you back." The move's success line is not printed, and its other effects are unchanged.
- **Formatting and status.**
  - Numbers below 10 print as words.
  - Card and move names are in sentence case mid-sentence, and people are named the way the game names them ("Nonā Rosa", never "Nonā").
  - Rumor news no longer reads as a person arriving.
  - Report rows read "{text} ({source})" and wrap.
  - The move card no longer repeats its chance line in the preview.
  - The jet is marked only once booked.
  - Route status cells carry their state in words for screen readers.
  - Result cards now report trust, search and passport deadline changes.
  - Unused strings were removed.
- **Demos.**
  - Leaving or finishing the escape demo hands over a real run (`Sim.endTutorial`).
  - The yardmaster warning, which told the player which choice fails, is gone.
  - The ban confirmation step describes what confirming does.
  - Every control a step names now matches the screen (a script checks each bold label).
- **Lāyūna** becomes Lagoa Funda.

**Reverted from the first round:** call rows went back to "{name} about {what}". The review made them "Call {name} about {what}", which made the demo read "Tap Call …, then Call" and broke the one-instruction-per-step check. The briefing now says "Call {name} about {what} next, because it helps most now."

**Checks:**
- Content check: 0 errors. pbbg-check passes.
- Contract tests pass, including two new tests:
  - C04b: government events carry none of her hidden state and never address her as "you";
  - C17: no statement may sit inside a line comment. It fails against the version that had the bug.
- Both demo replays and the house arrest check pass.
- Calibration is unchanged: 46.7% and 42.3% on the escape side, 46.5% on the government side.
- Phone-width browser runs of both sides reached their end screens with no page errors.

**What went wrong:** the same comment bug came back twice more while I was writing these fixes, once in a sound line and once in a police action. The parse check caught both, and test C17 now stops it at the source.

**Still open, because fixing them would take a new mechanic:**
- "Call your contacts" can mark the visa issued for a country that never accepts you.
- The cancelled passport still shows "This cannot succeed" as its chance, because that roll cannot be won.
- The stage messages never appear (backlog item 1).
