# Agent Action Record: reconciling the companion branch with the owner's rules

**Review date:** 2026-11-02
**Agent / system:** Claude (design session)
**Accountable human:** Ron Bronson, game owner

## What happened

Two sessions worked on the game on Nov. 1. This one landed the language pass and the rule that the player is never told odds, targets or outcomes in advance (PR #26, whose commits reached main). Another session built the companion picker, the lodging screen and the travel ban change (PRs #34 and #36, now on main). The owner read a report from the other session and said: "the changes I requested are accurate; if you need to change things on the other side to do that, so be it." So the companion direction stands, and where its text broke the rules set with this session, the text changed.

## What changed on main

- **The companion picker no longer tells the player whom to pick.** Each companion opened with a line such as "Pick Tomás if crossing the line worries you most." That is advice about what will help, which the no-forecast rule forbids. The 22 lines are gone. A companion's card shows the name, what they are, who they are and what they do, on each side. Test C21 no longer requires the removed strings.
- **No likelihood statements.** "Agreeing makes the visa more likely" and "his visa answer is now more likely to come through" became what agreeing does: he works harder for you. "Less likely to talk" became "hold out longer".
- **The ban's description matches the rule.** A code comment said the line is "closed for n hours" and the ban is "confirmed at the post"; the effects make moves harder and put the ban in force. `docs/companions.md` quoted the owner as saying the border closes; the owner's instruction to this session was that the ban makes crossing harder and never closes the border, and that is what `src/sim.js` does (one step on the die, lifted when a post lets it slide). The doc now says so.
- One lodging label over six words shortened.

## What was left alone

The companion picker itself, the 11 companions, the lodging screen and the removal of the ban confirmation step. The owner chose that direction. The rule that the ban makes crossing harder was already how the other branch's code works; only the words disagreed.

## Checks

Content check 0 errors; all contract tests, both demos and pbbg-check pass. Calibration before and after is identical (Teresa 33.0%, Mateu 29.3%, she escapes 41.0%), so nothing in the rules moved. The picker was checked on a phone-width screen.
