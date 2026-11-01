# Agent Action Record: Sosā's turns during moves, and hours in words

**Review date:** 2026-11-01
**Agent / system:** Claude (design session)
**Accountable human:** Ron Bronson, game owner

## Intent

After reviewing the move screen, the owner asked for three things:

- **Collapsed move cards should match the expanded one.** Chance of success and
  time taken stay separate, the same way the expanded card shows them.
- **Players should be told when a move gives Sosā time to act.** That timing
  should be stated wherever it matters, not left for the player to work out
  from the order of the round.
- **Three clocks stay separate.** The escape deadline, the time until Sosā acts
  again and the time a move takes should never look interchangeable.

## What the code does (traced)

- On the escape side, Sosā takes a turn every three hours, starting from his
  last one (`ENEMY_EVERY` in `src/sim.js`). Each turn is random: a search, a
  call trace, a checkpoint and others. That is why the game says "Sosā acts"
  rather than "Sosā searches".
- On the government side, she plays each hour while an order runs (`herStep`
  in `src/gov.js`). Her moves can leave reports on your desk (`leak`).

## What changed

- **Move cards, collapsed and expanded:**
  - One line for the chance: "Guaranteed success", "Roll 2 or higher (5 in 6
    chance)" or "Cannot succeed".
  - One line for the time: "Takes three hours". Government orders add who
    carries them out: "done by the provincial patrol".
  - When Sosā will act during a move, the collapsed card adds a coral line,
    such as "Sosā acts once during these three hours".
  - The expanded card always says how many times he acts, including "Sosā does
    not act during these three hours".
- **Government orders** say "She keeps moving during these three hours, and her
  moves can leave new reports."
- **Calls** say how many times Sosā acts during the hour a call takes.
- **Waiting.** When Sosā is due within the hour, the move hint adds "If you wait
  the hour, Sosā acts during it."
- **Effect chips spell out durations.** The game used to show durations like
  "3 h". Now:
  - news choices read "Takes three hours";
  - a true lead reads "arriving in four hours";
  - the other chips read "for six hours", "slip by four hours", and so on.
  - "Roll 3+" reads "Roll 3 or higher".
- **Merge with main.** PR #19 conflicted with PR #18 (character dialogue). The
  resolution kept #19's traced text and #18's three character lines. The
  narrator lines that #18 had replaced stay removed.

## Checks

- Content check: 0 errors, 0 warnings.
- Contract tests, both tutorial replays and pbbg-check pass.
- The escape calibration output is identical to before, and the government
  calibration is unchanged.
- Both sides were played in the browser with no page errors. Two wording bugs
  found that way were fixed: "done by by" and "these one hours".

## Open

- Issue #20, where the government demo stalls in the browser, is still
  unresolved.
