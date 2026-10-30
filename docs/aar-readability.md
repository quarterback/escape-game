# Agent Action Record: phone readability, contrast check and wordiness

**Review date:** 2026-10-30
**Agent / system:** Claude (design session)
**Accountable human:** Ron Bronson, game owner

## Intent

From phone screenshots of the live site, the owner reported four problems:
- white text on the start screen was hard to read over the picture;
- he could not follow the flow on the game screen;
- the text was hard to read;
- the copy was far too wordy.

He asked for a colour contrast check across the game, which had never been
done, measured against WCAG.

## What changed

**Contrast check (new).** `tools/contrast-check.js` measures the built game at
390 and 1440 pixels wide:
- **Screens covered:** title, start, credits, escape phases on every tab, help,
  tutorial coach, government side on every tab, and both endings.
- **Text on solid backgrounds:** checked with axe-core's color-contrast rule
  against WCAG 2.2 AA (4.5:1 for normal text, 3:1 for large text).
- **Text on pictures:** axe cannot judge text on the scene, the title still or
  the runway art. The tool hides all text, samples the pixels behind each line
  from a screenshot, and measures contrast against the lightest 5% of the
  background.
- **Setup:** `cd tools && npm install`, then `node tools/contrast-check.js`.
  It needs a browser, so it is a local check, not part of CI.

**First run: 5 failures, all on the title screen.**

| Text | Width | Measured | Needed |
| --- | --- | --- | --- |
| Credit line | 390 | 2.22:1 | 4.5:1 |
| Credit line | 1440 | 2.6:1 | 4.5:1 |
| Tagline | 1440 | 4.05:1 | 4.5:1 |
| Start button | 390 | 2.76:1 | 3:1 |
| Start button | 1440 | 2.87:1 | 3:1 |

The start button failures were my tool's mistake. The button has its own solid
fill; the sampler was reading the dark corners outside its rounded edge. Axe
checks the button correctly, so it was removed from the picture list. The real
failures were fixed by darkening the title shading and making the credit line
white with a shadow.

**Phone layout.**
- **Scene:** from 360 pixels tall to about a third of the screen, so the
  panels have room.
- **Clock:** sits on a dark backing, and "72 h left. Out by Tue 14:00" stays on
  one line.
- **Start screen:** the intro paragraph moved below the picture. The picture
  now carries only the title, and the text no longer covers the family or the
  jet.
- **Phase labels:** raised from 13 to 14 pixels, the minimum for secondary
  text.

**Flow.** A one-line instruction under the phase bar says what the current
phase asks for, on both sides. Examples: "Phone: answer a message or place one
call, then press Done with the phone." and "Desk: answer the minister or send
one request, then press Done at the desk." The panels below now measure the
bar's height, since the line can wrap.

**Wordiness.**
- **Stop objectives:** cut from 22 to 42 words down to 7 to 17. Each now names
  the one thing to do at that stop. The route and the phone already show who
  to call and what is needed.
- **Government objectives:** cut the same way.
- **New budget:** the content check enforces objectives of 18 words and two
  sentences or fewer, as an error. My own first rewrite of the first stop was
  19 words, and the check caught it.
- **Endings:** cut from 60 to 76 words to a median of 38. They now keep at most
  three lines after the ending itself, most important first. Duplicates such
  as "Holt talked to the inquiry. Holt will not be forgiven at home." are gone.
- **Route notes:** "Your family barges stops here" became "Last stop for your
  family barges." Card names are lowercased mid-sentence.

## Policy changes

- `content/policy.json` gained a P08 objective budget (18 words, two
  sentences, severity error), at the owner's request.

## Checks

- **Contrast:** 0 failures. Axe passed 1,767 text checks. All 32
  text-on-picture checks pass.
- **What axe could not judge:** 38 pieces of text. Most are the scene
  overlays and title text, which the picture sampler covers and passes. The
  rest is game text behind the ending overlay, measured while the ending was
  open; that text is unchanged and was checked on its own screens.
- **Content check:** 0 errors.
- **Contract tests:** pass.
- **Tutorials:** both replay.
- **Calibration:** unchanged (26.7% and 25.7%; the candidate escapes 64.0% of
  government runs).
- **Phone screenshots:** the title, start, a news phase, a move phase and the
  route read without overlap.

## Open

- These fixes reach players when this branch is merged and deployed. The
  owner's screenshots show the live site, which predates this session's work.
- The contrast check needs Chromium and so runs locally. Running it in CI
  would need Playwright's browser in the workflow.

## After shipping

- **A stray file.** A measuring command I ran had a mistyped output
  redirect (`> 0`), which created an empty file named `0` in the repository.
  It went out in 0b0fd6e and was removed in 0d0516c. The cause was a careless
  shell command, not the game or its tools. Before committing, check the list
  of staged files for anything unexpected.
- **Delivery.** PR #6 had already been merged into main at 69e44e9, so this
  work is in a new pull request, #7. The live site will show these fixes once
  #7 is merged and deployed.
