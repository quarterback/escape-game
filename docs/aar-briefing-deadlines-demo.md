# Agent Action Record: phone route, both deadlines, the second passport, and a demo that starts with play

**Review date:** 2026-11-01
**Agent / system:** Claude (design session)
**Accountable human:** Ron Bronson, game owner

## Intent

The owner reviewed the round briefing on a phone and watched someone play the
demo. He reported four problems:

1. **The route breaks on a phone.** Names collide, and the "Sosā searches here"
   marker is cut off at the left edge.
2. **The passport line raises questions it doesn't answer.** Which passport
   does the court want, what happens at Monday noon, and why does the second
   passport matter?
3. **Two deadlines look like one.** Monday noon and Tuesday at 2 p.m. need
   their own labels and their own consequences.
4. **The demo makes people read before they play.** "Instead of playing and
   guiding them through, I just watched someone do it."

## What the code does (traced)

- **The passport deadline** is `s.deadline`, which starts at Monday noon
  (hour 46). The summons event and the hearing event can move it. When it
  arrives, `flags.cancelled` and `flags.restriction` are set (`src/sim.js`).
  - The travel ban is then in force: border crossing rolls need one more,
    unless she holds a card that delays it.
  - Her first police stop starts at the station.
- **The game does not model handing a passport in.** "Your own passport is
  cancelled" is story. The only code that reads the cancellation flag for a
  passport is a check on a move called `own_passport`, and no such move
  exists. This dead check is added to the backlog below.
- **The second passport** is a card. Its text says the travel ban lists only
  her other passport. The Paso Huhūi crossing requires it, and it lowers the
  roll for the Susana takeoff by one.

## What changed

- **The route is vertical on phones.** Below 640 pixels it becomes a list:
  dot, place name, then the markers ("You", "Sosā searches here", "Jet") on
  the right. Nothing collides or clips. Desktop keeps the horizontal strip.
- **Two labeled deadlines.** The briefing lists each one with its
  consequence:
  - "Hours until your escape deadline, Tuesday at 2 p.m. Then your immunity
    ends and you can no longer leave the country."
  - "Hours until the court's passport deadline, Monday noon. Then your own
    passport is cancelled, the travel ban is in force at the border, so every
    crossing needs one more on the die, and any police stop starts with a
    night at the station."
  - The passport deadline uses the live value, so it shows the new time when
    an event moves it.
  - Once the deadline has passed, the row is replaced by a sentence saying it
    passed and what that changed.
  - The government briefing shows the same deadline from her side.
- **Passports.** The residence text now reads: "The court has barred you from
  leaving and wants your passport handed in by Monday noon, and the travel ban
  lists that passport. Your second passport, which no list names, is in your
  coat." The card says what it does: it gets you through the Paso Huhūi post
  and helps your takeoff at Susana.
- **The demo starts with play.**
  - Every reading step that came before an action is folded into that action's
    coach card. That removed seven reading steps on the escape side, so the
    first screen is the first decision ("Tap Confirm Lāyūna"). The government
    side lost four reading steps the same way.
  - The facts those steps taught (the police stop ladder, how cards work, what
    Sosā did, what changed while you drove) now appear on the card where they
    apply. Only the closing step on each side is still a reading step.
  - The round briefing does not appear while the coach is guiding.
- **The escape replay check is keyed by step id** instead of position, so
  adding or removing a reading step no longer breaks it.

## Checks

- Content check: 0 errors, 0 warnings.
- Contract tests, both tutorial replays and pbbg-check pass.
- The escape calibration output is identical to before; the government
  calibration is unchanged.
- In a phone-width browser, the demo opens on its first action, the briefing
  route stacks vertically, and both sides played to round three with no page
  errors.

## Added to the backlog

- **Dead passport check.** `own_passport` is checked in `src/sim.js` but no
  move has that id, so cancelling her own passport has no effect of its own.
- **Hang up in the demo.** The Hang up button stays bright green during demo
  steps that ask for something else. Whether it should be disabled there has
  not been checked.
