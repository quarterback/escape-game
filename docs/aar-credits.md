# Agent Action Record: title credit and credits screen

**Review date:** 2026-10-30
**Agent / system:** Claude (design session)
**Accountable human:** Ron Bronson, game owner

## Intent

The owner asked for the title credit to read "A game set in the Nelosphere
world by Ron Bronson", and asked whether the game should have a colophon or
credits screen listing the tech stack, fonts and references.

## What changed

- **Credit line.** It appeared in two places. The title screen said "An escape
  game set in Nelôxia" (Nelôxi is the language, not the world). The start screen
  said "A Nelosphere universe by Ron Bronson". Both now use the owner's wording.
- **Credits screen.** It opens from a Credits link beside the start screen
  byline and from the Credits button in both game menus. Back or the Escape key
  closes it and returns focus. Sections: created by, built with, type, reporting
  behind the story, writing guidance and licenses.
- **Data, not markup.** The screen is `content/coalition/credits.json`, checked
  by `content/schema/credits.schema.json`. The build renders it, and the content
  check applies the prohibited phrase, markup and glossary rules to every line.
- **License notice.** PixiJS is MIT licensed, and its license asks that the
  notice ship with copies of the software. The build reads `vendor/pixi.LICENSE`
  into a collapsible section of the screen. The font license headers already
  stay in the generated CSS.
- **Sources.** The two articles the game started from, with headlines, outlets,
  dates and full author names taken from the copies the owner attached. Fonts
  are credited from their license headers: GC North Sans by Glyphonic and Overbit
  by Lettertype Studio, both through YouWorkForThem. Writing guidance comes from
  `docs/content/source-register.md`.

## Owner revisions, same day

- **Credit line.** Now "A Nelosphere universe game by Ron Bronson", linked to
  ronbronson.dev on the start screen and plain on the title screen.
- **Owner credit.** "Game designed & written by Ron Bronson", with "Based on
  his Nelosphere universe (1991)" beneath it.
- **Reporting removed.** The owner will cover the articles that prompted the
  idea in a blog post. The game names no articles, outlets or reporters. The
  fiction note I had added went with the section.
- **Agent credit removed.** The owner used several agents and other tools. The
  credits list the game's own stack, not the tools used to build it.
- **Closing line.** "Any resemblance to real life events are purely
  coincidental", in grey at the end of the screen, in the owner's wording.
- **Credits theme.** `src/audio.js` composes a 32-bar, 58-second piece at
  132 BPM from a fixed seed (1991). It writes chords, a melody of chord tones
  and passing notes, arpeggios, bass and drums as MIDI note numbers, and plays
  them on four 80s console style voices: a 50% pulse lead with slight vibrato,
  a 25% pulse arpeggio, a triangle bass and stepped noise drums. The music
  starts when the credits open, and the title theme or place ambience comes
  back when they close. It follows the mute setting.
- **MIDI export.** `node tools/credits-midi.js out.mid` writes the composed
  score as a standard MIDI file with four named tracks.

## Judgment call for the owner

Little Grandad Fat is credited by name only. Neither the repository, the font
file (its name table is stripped) nor a web search identified the designer.
Add the foundry to `credits.json` if the purchase receipt names one.

## Policy change

`'Escape'` was added to the technical exceptions in `content/policy.json`. The
C12 check flagged the keyboard handler's key name as prose. It is a key name
the browser reports, never shown to a player.

## Checks

- **Content check:** 0 errors, 0 warnings.
- **Fixtures:** all 16 caught.
- **Contract tests:** pass.
- **Tutorial replays:** both pass.
- **Browser:**
  - The title and start screens show the new credit line, and the link
    points to ronbronson.dev.
  - The credits text names no reporting and no agent.
  - The credits theme plays while the screen is open and the title theme
    pauses. On close the credits theme stops and the title theme resumes.
  - No missing content IDs and no errors.
- **Bug found in the browser check:** the screen first opened scrolled to the
  bottom, because focusing the Back button scrolled it into view. It now opens
  at the top.
- **Score:** the generated MIDI file parses with mido: 5 tracks, 58.2 seconds.
  The first draft of the melody leapt to G6, so it now stays between G4 and B5.
