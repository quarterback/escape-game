# Coalition: design pass handoff

**Date:** October 30, 2026
**From:** Claude (design session with the owner, Ron Bronson)
**For:** the agent continuing work on `claude/vigilant-noether-rmcm7h`
**Status:** In progress. The owner has more direction to add before this is final.

The mockups live on a private Design canvas: https://claude.ai/code/artifact/7ebf4005-5041-4c41-a8d8-c3a59d146c74. It has three rows:

- **Escape, on a phone:** Start, Here, The route and The phone. These are the primary design, because most players will be on a phone.
- **Government, on a phone:** Reports, The route and Debrief, for the proposed third character.
- **Desktop:** the play screen and the start screen.

Read `docs/coalition-origin-and-concept-report.pdf` first. Everything here comes from it.

## 1. Owner corrections to the story

These change the rules as well as the copy. Run `node tools/tutorial-check.js` and `node tools/calibrate.js 500` before and after.

### The second passport already exists

The player has held a second passport for years. Nobody issues it during the run. The owner called the civil record storyline "silly" and said the invented term breaks immersion. The coordination problem is getting out of the country before you are stopped. The passport exists, and your sibling gets you a plane.

- Remove the **Document** arrangement (`ARRANGEMENTS.document`, its `STAGE_LINES` and its job hours in `sim.js`).
- Replace the `civil_record` card with a card in the **starting hand**: "Your second passport." It keeps `tag: 'document'` and `reach: ESMERALDA`. Proposed text: "You have held it for years. The travel ban lists your other one." Works on: "The border post and the airfield manifest."
- Mārtā Kovalskā no longer has a role. Remove or rework her opening message (`sign_person`, `aide_asks`), the "Ask Mārtā to finish your civil record" call, the `registry_van` approach and the tutorial steps that walk through the record. Santa Laura needs a different way to leave cleanly.
- Rename the border approach `civil_doc` to "Show your second passport." Its success line should stop mentioning a civil name.
- Fix the objectives the story pass added in `data.js`:
  - Residence: "four things from four people: a jet (Duartē), a travel document (Mārtā)..." becomes three things.
  - Santa Laura: "get Mārtā to issue your civil record" goes.
  - The line: "A document the restriction does not name" becomes your second passport.

### Use real terms

| Current | Use |
| --- | --- |
| Departure restriction, "the restriction names your passport" | Travel ban. The court bars you from leaving and orders you to hand in your passports. |
| "Own passport, restricted" | Own passport, on the travel ban |
| Permission: "Atlanta will receive you" | Entry visa for Atlanta |
| Reception: "contact found" | Esmeralda expects you. Someone at the ministry in Baca has your name. |

A visa is permission to enter a country, so it belongs at the Atlanta end. Do not use it for leaving Valdória.

## 2. Design direction

### The blueprint is the board

The concept report frames Coalition as a service blueprint of an escape. Its unit is the handoff: one person's promise becoming something the next person can act on. It asks for physical movement, institutional decisions and recognized status to be mapped together. The current UI splits these across a route strip, an arrangements list and card faces, so the player never sees who they depend on where.

The desktop mockup replaces the route strip, the arrangements list and the People list with one board titled **The route**. Its columns are the six stops plus **Abroad (by phone)** for the sibling and Salek. Its rows:

1. **Who acts here:** people at the stop where they act (`PEOPLE[k].where`). A mint dot means they trust you.
2. **Needed to leave:** the `needs` that gate each exit, in one of three states:
   - **In hand:** solid mint.
   - **Promised, not delivered:** orange stripes, with who is working and when it is due.
   - **Not started:** outline.
3. **Where your cards count:** each held card as a bar spanning its `reach`. An outline shows a card the player could get, such as Vélez's card starting at the line.
4. **The inquiry:** where Sosā is looking, on the same columns as the player.

### Clock, goal and inquiry on the scene

As the earlier addendum asked, these sit over the top of the pixel scene:

- **Top left:** the clock, with hours left.
- **Top center:** the goal. "Leave Esmeraldan airspace by Tue 14:00."
- **Top right:** Sosā's panel: his next move ("in 3 h"), exposure out of 10 and "At 10 they arrive."

The header keeps only the wordmark, the character and the menu buttons.

### Panels

- **The phone:** a message thread with reply options, then calls. The arrangement progress now lives on the board.
- **Here:** each approach shows a die face with pips for the roll it needs, the odds, the hours and the card it uses. The selected approach expands in place with Commit.
- **Your hand:** full colored cards in a slight fan, a color per tag. Each shows "Works on:" and either "Counts here" or where it starts counting. Cards outside their reach are dimmed, not hidden.

### Palette

| Role | Hex |
| --- | --- |
| Ground | `#150F2E` |
| Surfaces | `#1C1540`, `#221A4A`, `#2A2157` |
| Text | `#F6F1FF` |
| Muted text | `#B9B0D9` |
| Gold (the title gold) | `#FFC93C` |
| Inquiry | `#FF4D6D`, light `#FF7A90` |
| Delivered and trust | `#2EE6B5` |
| Pending and exposure | `#FF9F43` |
| Phone | `#C9A4F5` |
| Esmeralda and the passport | `#7FB2E5` |
| Influence card | `#E85DF0` |
| Commit | `#3BD15E` |

No left border accents on cards. Panels are separated by surface tone, not rules.

### Fonts

**Approved by the owner.** The clock uses **Overbit Shadow Bold** and the hours left use **Overbit Shadow**, from the full Overbit family the owner supplied. Everything else follows the existing AGENTS.md mapping. To do:

- Add both faces to the font mapping in `AGENTS.md`.
- Copy their `.woff2` files and license headers into `fonts/`.
- Embed both faces in `tools/build.py`.

## 3. Phone first

The phone screens are the primary layout. On a wide window the same parts spread into the desktop arrangement.

### A bigger scene

The owner felt the scene had too little room. Every scene in `src/render.js` is drawn relative to `GROUND`, so the buffer can grow taller with no new art: the extra height becomes sky above and ground below. This was tested on the residence scene.

- Change `const W = 320, H = 112, SCALE = 3, GROUND = 92;` so that `H` can be set per layout and `GROUND = H - 20` (or `H - 44` to leave a deeper foreground for overlays).
- **Phone:** `H = 260`. The scene fills the top 360px of the Here tab, and the panel slides up over its bottom edge as a sheet with a grab handle. Route and Phone show a shorter crop of the same buffer.
- **Desktop:** `H = 150`. The scene runs the full width of the window under the header, up to 680px tall. The level heading and objective sit on its lower edge. Here, the hand and the phone sit below it.
- Reference renders: `docs/design-assets/residence-tall-260.png`.

### Start screen art

The start screen background is a pixel-art family photo on a runway at sunset: six people (the candidate, the sibling, a partner, an older relative and two children), luggage, the jet and the pilot at the stairs. It uses the game's own sprites plus a smaller child sprite. The drawing code is in `docs/design-assets/runway-still.js` and the render is `docs/design-assets/runway-still.png`. The phone start screen shows the family in the top half with the choices below. The desktop start screen puts the title in the sky and the choices on the runway. The same picture closes the debrief when the escape succeeds.

### Phone layout

- **Scene header.** It stays on screen on every tab. Over it:
  - **Top left:** the clock, with "72 h left. Out by Tue 14:00."
  - **Top right:** a coral chip, "Sosā, looking here," with his next move.
  - **Along the bottom:** a thin exposure bar, "1/10."
- **Bottom tab bar:** Here, Phone, Route, Hand. A lavender badge on Phone counts waiting messages. Only the content above the tab bar scrolls.
- **Here:** the level heading and objective, then the approaches. The selected approach expands with Commit and Cancel. Wait one hour sits at the end.
- **The route:** the blueprint board as a vertical list of stops on a rail. The current stop is a raised panel with the inquiry chip. Each stop lists who acts there, what is needed to leave (in hand, promised or not started) and which cards start or stop counting there. A dashed rail segment marks the border. The two people abroad sit in a box at the end.
- **The phone:** the message thread with reply options, then calls.
- **Hand:** not drawn yet. Use the card faces from the desktop mockup in a two column grid.

## 4. Make it a PWA

The game stays a single offline `index.html` that also opens from disk. On top of that it should install to a phone's home screen and run offline after the first visit. It is a GitHub repo served through Cloudflare, so HTTPS is in place.

### Files the build writes next to `index.html`

- `manifest.webmanifest`:
  - `name` and `short_name`: "Coalition"
  - `start_url` and `scope`: `"./"`
  - `display`: `"standalone"`
  - `orientation`: `"portrait"`
  - `background_color` and `theme_color`: `"#150F2E"`
  - Icons at 192px and 512px, plus a 512px `maskable` icon.
- `sw.js`: a service worker.
  - It precaches `./`, `index.html`, the manifest and the icons.
  - Its cache name carries a build stamp from `tools/build.py`, so each build replaces the old cache. Delete old caches on `activate`.
  - Serve from the cache first, and answer navigations with the cached `index.html`.
- `icons/`: generated from the austral favicon on the `#150F2E` ground: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (keep the glyph inside the safe zone) and `apple-touch-icon.png` at 180px.

### Changes to `src/shell.html`

- `<link rel="manifest" href="manifest.webmanifest">`
- `<meta name="theme-color" content="#150F2E">`
- `<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- Viewport: `width=device-width,initial-scale=1,viewport-fit=cover`

### Changes to `src/ui.js`

- Register the service worker only when it can run: `if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js')`. That keeps the game working from `file://`.
- When a new version is waiting, show a small line, "New version ready," with a Reload button. Never reload in the middle of a run on its own.
- **Save the run.** Phones close apps in the background, so a player must be able to come back to the same run. Save the state after every commit and offer Continue on the start screen. The die needs to resume where it left off: store the seed and the number of rolls so far, or store the generator's internal state.
- Add an Install button to the menu when the browser fires `beforeinstallprompt` (Android and desktop Chrome). On iPhone, Help gets one line: tap Share, then Add to Home Screen.

### Layout rules for standalone mode

- Pad the top and the tab bar with `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
- Size the frame with `100dvh`. Only the panel between the header and the tab bar scrolls.
- Nothing depends on hover. Touch targets stay at 44px or more.
- Sound already starts from the Start button, which iOS requires.

### Cloudflare

The service worker file must never be cached for long, or players stay on an old build.

- **If this is Cloudflare Pages building from GitHub:** add a `_headers` file at the site root:

  ```
  /sw.js
    Cache-Control: no-cache
  /manifest.webmanifest
    Cache-Control: no-cache
  ```

- **If this is GitHub Pages behind the Cloudflare proxy:** GitHub Pages ignores `_headers`. Add a Cloudflare Cache Rule that bypasses the cache for `/sw.js` and `/manifest.webmanifest`.

Also point `og:url` and the image tags in `src/shell.html` at the live domain once it is settled.

### Check

- Lighthouse reports the game as installable.
- After one visit, the game loads in airplane mode.
- A run survives closing the app and reopening it from the home screen.
- `tools/tutorial-check.js` still passes.

## 5. Labels added in the mockup, approved by the owner

- The route
- Who acts here
- Needed to leave
- Where your cards count
- Vélez's card starts here
- Esmeralda expects you
- Uses a decoy card / Uses an influence card
- Counts at the line
- Goal
- Next move
- At 10 they arrive

- Sosā, looking here
- Out by Tue 14:00
- Abroad, by phone
- Salek about your visa

## 6. The government character, screen design

Screens for the proposal in `docs/government-character-plan.md` are in the canvas row "Government, on a phone." They follow that plan's rule that this player never sees the candidate's real position, hand or arrangements. The start screen gains a third choice: "[Character name], senior aide, the winning party. Stop the escape." The name stays open.

Color tells the sides apart. In this mode the player's color is coral (clock, active tab, order outline). The candidate's last reported position is gold.

- **Reports** (replaces Here):
  - **The scene header:** the clock, with "Stop her before Tue 14:00." A gold chip shows the candidate's name and how old the last report is. A strip shows when the minister wants a location.
  - **Each report:** the source and its age, what it says, and two side-by-side boxes, **Proves** and **Does not prove**. Example: "A red sedan took the south road toward Santa Laura." Proves: a car is heading south. Does not prove: she was inside.
  - **Orders:** each shows the die face, the roll, the hours, who acts and what happens on failure. The commit button reads "Send the order."
- **The route:** the same rail as the escape side, holding only what the player knows.
  - Each stop lists "Your people" there and the reports pinned to it, with their age.
  - The suspected stop has a gold outline marker reading "She may be here."
  - Requests that are sent but not delivered use the orange promised state. Example: "Travel ban sent. Not confirmed at the post. A sent message does not close the border."
  - Susana states the jurisdiction gap: "Your ministry does not command this tower."
  - "Where your cards count" works the same way as on the escape side.
- **Debrief:** opens with the outcome ("She got out," with the time the jet left).
  - A table compares, at each step, where she was against where you looked: Right, Wrong, Decoy, two hours late, Missed or Too late.
  - Then "Reports that misled you," "Who delivered" and "The minister." The minister's reaction is written from the run's choices and is a placeholder in the mockup.
  - The buttons are "Play again" and "Play her side."
- **Tabs:** Reports, Calls, Route, Cards.

The example reports, orders and debrief rows are illustrations of the plan, not selected content.

## 7. Not done yet

- The Hand tab on the phone.
- Which country issued the second passport. That is the owner's call.
- The owner has more direction coming before this is handed over.
