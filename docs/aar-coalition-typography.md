# Agent Action Record: Coalition typography and favicon

**Review date:** 2026-10-29  
**Reviewed by:** Agent self-review; owner review pending  
**Agent / system:** Codex  
**Task or period under review:** Readable typography, route labels and austral favicon  
**Accountable human:** Ron Bronson, game owner

## 1. Intent — what was supposed to happen

**Instruction given (actual wording):**

> the game is hard to read it's wy i gave yo other fonts

> i like the quirkiness but it's very tough to read as-is

> overbit for headings works btter tan the existing font, but keep that font for the game title

> the favicon could just be the austral unicode

**Success defined in advance as:** Improve readability using the supplied fonts while retaining the game's character. No numerical readability target was set.

**Authority granted:** Update typography and favicon in the active game.

**Out of scope:** Mechanics, narrative expansion, broader visual redesign and archived material.

## 2. Action — what actually happened

**What the agent did:** Inspected the owner's screenshot and both supplied webfont kits. Used Overbit for headings, GC North Sans for reading and controls, and kept Little Grandad Fat for the Coalition title.

**What it produced or changed:**

- Added GC North Sans Regular and SemiBold, Overbit Regular and their original CSS license headers under `fonts/`.
- Updated `tools/build.py` to embed the active faces and favicon.
- Raised reading text to 16–17px, secondary text to 14px, and increased line spacing and muted-text contrast.
- Moved the six route labels and actual/inquiry markers into responsive HTML in `src/shell.html` and `src/ui.js`. Removed duplicate route and arrangement text from the canvas; the HTML arrangements board remains.
- Updated `src/style.css` and remaining canvas tooltip type in `src/render.js`.
- Added `og/favicon.svg`: the austral sign, ₳, in gold on a dark tile. Its data URL is embedded in the built page.
- Rebuilt `index.html`; added the font mapping to root `AGENTS.md`.

**Where actual behavior differed:** No identified departure. Existing font files remain available, but are no longer embedded unless used.

**Stayed within granted authority?** Yes, agent self-assessment.

## 3. Judgment — human in the loop

**Agent decisions:** Specific sizes, spacing, contrast and responsive route layout. Kept ordinary control labels in the reading face. Used a standard sans-serif fallback for accented characters missing from GC North Sans.

**Human decisions:** The owner supplied the fonts, retained the current title face, selected Overbit for headings and requested the austral favicon.

**What needs human review:** Whether the new density and heading size feel right on the owner's display.

**Points where it should have escalated and didn't:** None identified.

**Accountability:** Codex for implementation and check claims; the owner for the visual direction.

## 4. Deviation — the gaps

**Gaps and cause:** GC North Sans lacks ā, ē, ī and ū. The fallback displays those characters without changing names. Overbit covers the tested names in full. Inspection used the supplied WOFF files; the matching WOFF2 files are embedded.

**Good deviations:** None claimed. Moving route text out of the canvas addresses its shrinking with the scene.

**Confidently wrong:** No established regression. Typeface choices alone cannot establish that every player can comfortably read the game.

## 5. Consequence — what it cost or risked

**Actual outcome:** Built the game, passed all 20 tutorial steps in Node and Chromium, and reviewed desktop and mobile screenshots. The browser run reported zero page or console errors and zero external network requests. The tutorial reached Susana airfield.

**Additional checks:** All four embedded faces loaded in Chromium. Computed styles match the owner’s mapping. No horizontal overflow at 390, 768 or 1440px. The favicon contains ₳. Calibration results for 300 seeds per character match the pre-edit results. ClosedTab scored this record 6/6.

**Risks:** Mixed-font accents may look slightly different. Larger text increases page height. Browser automation verifies function and layout checks, not human comprehension.

**Downstream affected parties:** Players and future contributors.

**Expected recurring failure:** A future styling pass could put the display face back into body text or shrink route labels into the canvas. This is a qualitative risk.

## 6. Change — what happens next

**Before the next run:** Read root `AGENTS.md`. Preserve the owner-selected font roles, readable sizes and responsive route. Review mobile and desktop views after typography changes.

**Keep doing:** Preserve license headers and offline embedding. Keep game copy concise under the existing Humanizer and plain-language requirements.

**Human-owned decisions:** Changing the title face or the owner's heading/body mapping requires their direction.

**Signal that the change worked:** The owner can read instructions and status text comfortably while still recognizing the game's visual character.

**Earlier verification gap:** The Chromium run also exercised the shortened tutorial from the copy pass. It closes that pass's browser-execution gap for the currently rebuilt page; it does not claim a browser review occurred during the earlier pass.
