# Agent Action Record: the renderer on PixiJS

**Review date:** 2026-10-30
**Agent / system:** Claude (design session)
**Accountable human:** Ron Bronson, game owner

## Intent

The owner asked to upgrade the graphics, chose PixiJS over Phaser, and asked for the `render.js` upgrade on PixiJS.

**Out of scope:** new art assets, the rules, the copy, the HTML layout.

## What changed

- `src/render.js` now draws with PixiJS 8.21.0 instead of p5. The public interface `ui.js` uses is unchanged, except that `setState` takes an optional second argument, the government state.
- The scene art is the same pixel art. The static scene is painted once per state change into a canvas texture. Previously it was redrawn every frame.
- **People are sprites.** They breathe (a one-pixel rise every few seconds, out of step with each other). The player walks in after travel, and the marker bobs above them.
- **Lights glow.** Lamps, windows, the border stove, the train lamp, headlights and Holt's lantern glow and flicker. The glow is strongest at night, softer at dusk and faint by day.
- **Weather and life:**
  - Stars twinkle and clouds drift by day.
  - Snow falls at the line.
  - Steam rises at Salta.
  - Fireflies come out at the colônia at night, with pollen by day.
  - Moths circle the lamps at the residence at night.
  - The river and the sea glint.
  - The tower beacon blinks, and the jet shows navigation lights once it is ready.
- **The hour grades the scene:** blue at night, warm from 17:00, pink at dawn. A soft vignette frames it.
- **Dice:** a drawn die with pips tumbles, then settles green or red with a small pop.
- **Overlays:** the floating exposure numbers, the inquiry's red pulse, the travel fade and the end card carry over from the old renderer. Ringing now flashes a lavender edge.
- **Government mode:** the scene shows the stop the player suspects and the two-person search team with a coral marker. It no longer shows the hidden candidate's real position, her allies' trust labels or the state of her jet. The end card reads "In custody" or "She got out".
- **Ground line:** `GROUND` moved to `H - 56`, so people stand above the level heading that sits on the bottom of the scene. The display-only overlays on the scene (clock, goal, Sosā, exposure line, heading) no longer block the pointer, so hovering or tapping a person shows who they are.
- **Pointer:** pointer positions now account for the canvas being cropped with `object-fit: cover`. Taps on phones show the label for about two seconds.
- **Fallback:** if PixiJS cannot start, the same scene draws on a plain 2D canvas with the grading, dice and labels, without glow or weather.
- **Build:** `vendor/p5.min.js` (1.03 MB) is replaced by `vendor/pixi.min.js` (0.83 MB, MIT). The build strips its source map comment.

## Checks

- `python3 tools/build.py` and `node tools/tutorial-check.js` pass. No rules changed.
- Chromium (SwiftShader WebGL):
  - Zero console errors and zero external requests.
  - All six scenes captured by day and by night, plus dusk at the residence.
  - Six turns of free play: the animation queue drained after each one.
  - The tooltip appeared on hover.
  - A government run started and showed the search team.
  - The phone layout at 390 by 844.
- With WebGL blocked, PixiJS started on WebGPU.
- With PixiJS removed, the 2D fallback drew the scene and the dice with no errors.

## Open

- The art is still drawn as code. The next visible step is sprite sheets for the characters and layered backgrounds for each place, which this renderer can show directly.
- Not yet tested on a physical phone.
