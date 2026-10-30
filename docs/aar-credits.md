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

## Judgment calls for the owner

- **Little Grandad Fat** is credited by name only. Neither the repository, the
  font file (its name table is stripped) nor a web search identified the
  designer. Add the foundry to `credits.json` if the purchase receipt names one.
- **"Agent development: Claude, by Anthropic"** is listed under Built with. It
  is one item in `credits.json` and can be removed.
- **Fiction note.** The reporting section says the premise comes from the
  reporting and the places, people and events are invented. Since the game
  draws on a real escape, this seemed worth stating once.

## Policy change

`'Escape'` was added to the technical exceptions in `content/policy.json`. The
C12 check flagged the keyboard handler's key name as prose. It is a key name
the browser reports, never shown to a player.

## Checks

- **Content check:** 0 errors, 0 warnings.
- **Fixtures:** all 16 caught.
- **Contract tests:** pass.
- **Tutorial replays:** both pass.
- **Browser, phone and desktop:** both credit lines show the new wording. The
  screen opens, scrolls and closes with Escape, with no missing content IDs and
  no errors.
- **Bug found in the browser check:** the screen first opened scrolled to the
  bottom, because focusing the Back button scrolled it into view. It now focuses
  without scrolling and opens at the top.
