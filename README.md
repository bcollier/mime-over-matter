# Mime Over Matter

A comic-book brawler-platformer played panel by panel. Pierre, a silent mime, is trapped in a comic full of clowns. The cartoonist's right hand draws clowns into each panel to stop him, and his left hand secretly draws sandwiches to help. The full design is in [SPEC.md](SPEC.md).

## Install and run

You need any current desktop browser (Chrome, Firefox, Safari or Edge). Nothing to install, no build step, no server.

1. Clone or download this repository: `git clone https://github.com/bcollier/mime-over-matter.git`
2. Open `index.html` in the browser (double-click it, or drag it onto a browser window).
3. Click the game once if the keyboard doesn't respond, so the page has focus.

The scripts are plain `<script>` tags, not ES modules, on purpose: browsers block modules on `file://` pages, so modules would need a local server.

## Controls

| Key | Action |
|---|---|
| Left / Right arrows, or A / D | Walk |
| Space, W or Up arrow | Jump (let go early for a short hop) |
| J | Punch |
| R (or Enter) | Restart from panel 1 after Game Over or at THE END |

Not built yet: K (throw knife) and P (pause). There is no title screen yet, so the game starts as soon as the page loads.

## Acceptance criteria

Numbers match section 6 of [SPEC.md](SPEC.md). Every [P1] criterion is met. No [P2] or [P3] work has started, except the "POW!" burst, which is part of criterion 5.

| # | Pri | Status | Notes |
|---|---|---|---|
| 1 | P1 | Met | Plain HTML and JavaScript. Checked by opening `index.html` from disk in Chrome, not from a server. |
| 2 | P2 | Not met | No title screen; the game starts at panel 1 on load. |
| 3 | P1 | Met | Arrows/A/D walk, Space/W/Up jump. |
| 4 | P1 | Met | Lands on the ground and platforms (one-way: jump up through, land on top). The left edge and the ink line are walls. |
| 5 | P1 | Met | J punches; a hit on a finished clown damages it and shows a "POW!" burst. |
| 6 | P1 | Met | 10-segment health bar in the HUD. A hit removes 1, knocks Pierre back, and makes him flash and ignore hits for 1 second. |
| 7 | P1 | Met | At 0 health a "CANCELLED!" stamp covers the frozen panel. R restarts at panel 1 with full health and no items. |
| 8 | P2 | Not met | No speech bubble when hit. |
| 9 | P1 | Met | On entering a panel, a big hand with an ink pen reaches down from above the screen and draws each clown in turn. |
| 10 | P1 | Met | 2 seconds per clown: the pen traces the outline (60% of the time), then scribbles the color in from the top down. |
| 11 | P1 | Met | A clown being drawn doesn't move or attack, can't hurt Pierre and can't be punched. |
| 12 | P1 | Met | The moment the drawing finishes, the clown starts riding or throwing. |
| 13 | P2 | Not met | No speech bubbles. |
| 14 | P3 | Not met | No countdown ring. |
| 15 | P1 | Met | Unicyclist rides back and forth on its own ground or platform, turns at ledges, walls and the ink line, and hurts on contact. 2 punches. |
| 16 | P1 | Met | Pie Tosser stays put, faces Pierre and lobs a pie in an arc at where he is every 2.6 seconds. 4 punches. Pies splat on Pierre, platforms or the ground. |
| 17 | P1 | Met | A defeated clown is removed at once. |
| 18 | P3 | Not met | Seltzer Spritzer, Juggler, Balloon Twister and Clown Car are not built. |
| 19 | P1 | Met | A thick wavy ink line blocks the right edge until every clown in the panel is defeated; then it disappears and a bobbing yellow arrow shows. |
| 20 | P1 | Met | Walking off the right edge loads the next panel with Pierre on its left side. |
| 21 | P1 | Met | Panels 1 to 5 match the table in spec 5.2 (panel 1 shows the controls in a caption box). The HUD shows "Panel N / 6". |
| 22 | P1 | Met | Panel 6 shows "THE END"; R starts a new game. |
| 23 | P2 | Partly met | "THE END" is shown, but it isn't drawn in by a hand, and Pierre doesn't bow. |
| 24 | P1 | Met | At 3 health or less, a second hand holding a crayon wobbles in and draws a sandwich in 1.2 seconds. It won't draw another while one is on screen, or within 10 seconds of the last. |
| 25 | P1 | Met | Touching a finished sandwich restores 4 health, never above 10. |
| 26 | P1 | Met | A sandwich being drawn can't be eaten. |
| 27 | P2 | Not met | No hammer. |
| 28 | P2 | Not met | No knives. |
| 29 | P2 | Not met | Panel 4 is marked `crowded: true` in `js/panels.js`, but nothing reads that flag yet. |
| 30 | P2 | Not met | No random items. |
| 31 | P3 | Not met | No balloon sword, pogo stick or slinky. |
| 32 | P3 | Not met | No Invisible Dog. |
| 33 | P3 | Not met | The hand can't be hurt. |
| 34 | P2 | Partly met | Only "POW!" on punches. No "BONK!" when Pierre is hit, and no "SQUEAK!" or "POP!" (those need items). |
| 35 | P2 | Not met | No pause. |
| 36 | P3 | Not met | No sound. |

## Code map

`index.html` loads the scripts below in this order. They share one global scope, so a function can use something from a later file as long as it only runs after loading. `main.js` comes last and starts the game.

| File | What's in it |
|---|---|
| `js/config.js` | `CONFIG`: every tuning value (speeds, health, damage, draw times, cooldowns, sizes). Change numbers here. |
| `js/panels.js` | `PANELS`: the six panels as data: platforms, which clowns stand where, in drawing order, and the `crowded` flag. |
| `js/render.js` | The comic look: paper gutters, the brush panel border, the KlownKon convention-hall background (drawn once per panel and cached), stage-riser platforms, caption boxes, shadows, "POW!" bursts, ink-line gate, exit arrow, "CANCELLED!", "THE END" and the HUD. |
| `js/drawing.js` | The ink style and the shared "being drawn" system both hands use. Things are lists of shapes ("parts"); `limb` makes tapered arms and legs. `drawSketch` inks them with brush outlines, cel shadows, hatching, stripes and dots, finished or partly drawn. `penPoint` says where the pen tip is, and `DrawJob` runs one drawing and makes the thing `active` when it's done. |
| `js/physics.js` | Surfaces (ground plus platforms), landing on them, and box overlap tests. |
| `js/pierre.js` | `Pierre`: input, movement, jumping, punching, getting hurt, healing, and his parts, posed from joint positions for walking, punching, jumping and getting hit. |
| `js/clowns.js` | `Clown` base class, `Unicyclist`, `PieTosser`, `Pie`, and `makeClown(spec)`, which turns a panel entry into a clown. |
| `js/items.js` | `Sandwich`. |
| `js/hands.js` | `Hand`, one class for both hands: queue things, fly in, draw each with a `DrawJob`, leave. `handParts` is the hand holding a pen or crayon, as inked parts. |
| `js/main.js` | Keyboard input (`Input`, `KEYS`), the `Game` object (states, loading panels, the gate, the sandwich rescue and where to put it, update and render order), and the frame loop. |

**How a panel runs:**
1. `Game.loadPanel` queues each clown from `PANELS` with the right hand.
2. The hand adds each clown to `Game.clowns` when its pen first touches the page, so the clown appears half drawn and inactive.
3. When the drawing finishes, `Game.update` starts calling the clown's `act`.
4. Each defeated clown counts toward `gateOpen`.

**Adding a clown or item:** give it `x`, `y`, `facing`, `parts()`, `update` and `render`, then pass it to a hand's `draw(thing, onStart)`.

**Testing from the browser console:** `Game` is a global.
- `Game.loadPanel(3)` jumps to panel 4.
- `Game.pierre.health = 3` triggers the sandwich rescue.
- `Game.clowns.forEach(c => c.hurt(99, 0, Game))` defeats every finished clown.

## Next steps (in priority order, from spec section 7)

1. **Squeaky hammer and throwing knives (27, 28).**
   - Add `Hammer` and `Knives` classes to `js/items.js`, shaped like `Sandwich`.
   - Give `Pierre` a held melee item with swings left, and a knife count.
   - Show both in `drawHUD`.
   - Add K to `KEYS`.
2. **The left hand's other triggers (29, 30).**
   - In `Game.loadPanel`, if `panel.crowded`, call `this.leftHand.draw(...)` with a random item at `spotForItem()`. The left hand draws faster than the right, so the item finishes before the first clown.
   - For the random trigger, roll about 1 in 3 per fighting panel and schedule a draw at a random time. Mostly sandwiches.
3. **Polish (2, 8, 13, 23, 34, 35):**
   - title screen with the story captions (add a `'title'` state);
   - Pierre's empty "…" bubble when hit, and the clowns' shouts when they come to life (both in `Clown` and `Pierre`);
   - Pierre's bow and a hand drawing "THE END";
   - "BONK!" when Pierre is hit (`game.burst` in `Pierre.hurt`);
   - P to pause.
4. **[P3], in the spec's order:** hurting the hand with the hammer (33), pogo stick, balloon sword, more clowns, slinky, Invisible Dog, countdown ring, sound.

## Known bugs

- The hands can run past the edge of the canvas. When the right hand draws a clown near the right edge, its sleeve covers "Panel N / 6" in the HUD for a moment.
- If Pierre leaves a panel while the left hand is still drawing a sandwich, the sandwich is lost and the 10-second cooldown still applies.
- Pies already in the air keep flying after the last clown is defeated and can still hit Pierre.
- The game has been checked with scripted runs and spot checks in Chrome, not yet played through by hand. Difficulty (especially crowded panel 4) is untuned.

## Where I cut corners, and why

- **Art drawn in code.** There are no image files. Characters are inked shapes with brush outlines, cel shadows and hatching, so the hands can still draw them stroke by stroke. Every panel uses the same convention-hall background for now.
- **One-way platforms only.** There are no solid walls inside a panel; the only walls are the panel edges and the ink line. Nothing in the spec needs inner walls yet.
- **The Pie Tosser doesn't hurt on contact.** The spec only gives contact damage to the Unicyclist, so Pierre can walk through a Pie Tosser.
- **Item placement is a simple score.** Each candidate spot on the ground or a platform scores higher the farther it is from clowns, minus a pull toward Pierre, and spots right under him are avoided.
- **No automated tests in the repo.** I tested with a throwaway script that runs the game in Node with a fake canvas, plus checks in Chrome. Porting that to a small test page would help whoever continues this.
- **Enter also restarts.** The spec uses Enter for "continue from title and end screens". There's no title screen yet, so Enter does the same as R.
