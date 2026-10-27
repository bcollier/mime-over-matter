# Mime Over Matter: Game Spec

A side-scrolling comic-book brawler-platformer. A silent street mime is trapped inside a comic full of clowns, and the cartoonist's hands draw the level while you play: the right hand draws clowns to stop you, and the left hand secretly draws things to help you.

Inspired by *Comix Zone* (Sega Genesis, 1995). What's different here: **two** drawing hands with opposite goals, everything appears in real time as the hand draws it, and the whole thing is a joke about a mime at a clown convention.

---

## 1. Story

**Chuckles McGraw** draws *Big Top Brawl*, a comic set at **KlownKon**, the world's biggest clown convention. Sales are falling because the clowns just aren't funny anymore.

At a real-world comic convention, a street mime named **Pierre** sets up across the aisle from Chuckles's table. Pierre's "trapped in an invisible box" routine pulls a huge crowd. Chuckles's table pulls nobody.

Furious, Chuckles sketches Pierre into the gutter of his drawing board, the blank space between comic panels, and pulls him into the page. The new storyline: *the clowns humiliate the mime.* Chuckles's **right hand** (ink pen) starts drawing clowns into every panel ahead of Pierre.

But Chuckles is right-handed, and **his left hand has had enough.** It sneaks into panels and draws Pierre what he needs: sandwiches, a squeaky hammer, throwing knives, whatever's lying around in a cartoonist's imagination. Pierre's only way out is to fight through to the last panel, the one that says **THE END**.

This story should appear in the game as a short title/intro screen (see criterion 1).

## 2. Feel

**Light, silly, and fun.** Pierre is the odd duck: a silent, black-and-white mime surrounded by loud, colorful clowns. The humor comes from that contrast. Clowns are loud (huge speech bubbles: "HONK!", "HAW HAW!"), while Pierre's speech bubbles are always empty or contain only "…".

It should never feel scary or punishing. Getting hit is slapstick: a comic "BONK!" burst, a little knockback, Pierre flashing. The right hand drawing a clown should feel like a cartoon rival setting up a gag, giving you time to react, not an ambush.

## 3. Look

Simple shapes are fine. A consistent comic style matters more than detailed art.

- **Canvas:** 960 × 540 pixels.
- **Panels:** each level screen is one comic panel with a thick black border (6 px) and a white gutter around it, like a page of a comic.
- **Outlines:** every character and object has a thick black outline (3 px).
- **Colors:** Pierre is only black, white, and grey (striped shirt, white face, black beret). Clowns and their props use loud primary colors (red, yellow, blue, green). The panel background is a pale halftone dot pattern.
- **Hands:** each hand is a large cartoon hand, drawn bigger than Pierre. The right hand holds a black ink pen. The left hand holds a fat colored crayon and moves a little wobbly and clumsy.
- **Impact text:** hits show comic burst text ("POW!", "BONK!", "SQUEAK!", "POP!") for 0.3 seconds.

## 4. Controls

| Key | Action |
|---|---|
| Left / Right arrows (or A / D) | Walk |
| Space (or W / Up arrow) | Jump |
| J | Attack (punch, or swing the held melee item) |
| K | Throw a knife (if Pierre has any) |
| Enter | Start game / continue from title and end screens |
| R | Restart from panel 1 after Game Over or THE END |
| P | Pause / unpause |

## 5. How the game works

### 5.1 Pierre
- 10 health points (HP). Starts every game at 10. Health never goes above 10.
- Walks at 240 px/second. Jump apex is about 130 px above where he jumped from. Normal jumps can reach platforms up to 110 px higher than the one he's on.
- Base attack is a **punch**: 1 damage, reaches 40 px in front of Pierre, can be used at most once every 0.3 seconds, shows "POW!" on hit.
- After taking damage, Pierre is invincible for 1.0 second and flashes during that time. He is knocked back 60 px away from the source.
- When Pierre takes damage, an empty speech bubble (or one containing "…") pops up over his head for 1 second.
- At 0 HP: Game Over.

### 5.2 Panels and progression
- The game is one comic **page** of **6 panels**: 5 fighting panels plus a final **THE END** panel.
- Each panel is one fixed screen. No scrolling camera.
- Pierre starts each panel at the left edge.
- The right edge of the panel is **blocked by a thick ink line** until every clown in the panel is defeated. When the last clown is defeated, the ink line disappears and a "→" arrow appears at the right edge. Walking off the right edge moves to the next panel.
- Panel number is shown in the HUD as "Panel 2 / 6".
- Reaching the THE END panel wins the game. Pierre takes a silent bow, the words "THE END" are drawn across the panel, and "Press R to play again" appears.

Panel contents (core version, using only the two core clowns):

| Panel | Contents | Notes |
|---|---|---|
| 1 | 1 Unicyclist | Tutorial panel. Show the controls as text in the panel background. |
| 2 | 1 Pie Tosser, 1 Unicyclist | |
| 3 | 2 Pie Tossers on raised platforms, 1 Unicyclist on the ground | Platforms needed |
| 4 | **Crowded:** 2 Pie Tossers, 3 Unicyclists | Left hand draws an item first (see 5.5) |
| 5 | 2 Pie Tossers, 2 Unicyclists | |
| 6 | THE END | No enemies |

When stretch clowns are added, swap them into panels 3 to 5 so each panel introduces at most one new clown type.

### 5.3 The right hand (enemy artist)
- When Pierre enters a panel, the right hand enters from the top edge of the screen and draws that panel's clowns **one at a time**, in the order listed in the panel's data.
- For each clown: the hand moves to the clown's spawn point over 0.5 seconds, then draws it over **2.0 seconds**:
  - first 1.2 seconds: the black outline appears gradually (for example, a wipe from left to right, with the pen tip following the edge of the wipe)
  - last 0.8 seconds: the color fills in
- **A clown that is still being drawn cannot hurt Pierre and cannot be hurt.** It doesn't move, and attacks pass through it.
- When the drawing finishes, the clown becomes active immediately and shows a speech bubble for 1.5 seconds (random from: "HONK!", "HAW HAW!", "NICE FACE PAINT!", "SAY SOMETHING!").
- After the last clown is drawn, the hand exits off the top of the screen.
- **Optional:** a small countdown ("3… 2… 1…" or a shrinking ring) over a clown that's being drawn.

### 5.4 Clowns

Core clowns (needed for the core game):

| Clown | HP | Behavior | Damage |
|---|---|---|---|
| **Unicyclist** | 2 | Rides back and forth at 180 px/second on its platform. Turns around at walls and at platform edges (never falls off). | 1 on contact |
| **Pie Tosser** | 3 | Stands still and faces Pierre. Every 2.5 seconds, throws a pie in an arc toward where Pierre is standing at that moment. The pie disappears when it hits anything. | 1 per pie |

Stretch clowns:

| Clown | HP | Behavior | Damage |
|---|---|---|---|
| **Seltzer Spritzer** | 3 | Walks toward Pierre at 90 px/second. When within 120 px, sprays a seltzer stream (0.5 s) in front of it, then waits 2 seconds. | 1, plus knockback of 150 px |
| **Juggler** | 3 | Stands still, juggling 3 pins. When Pierre is within 250 px, throws one pin straight at him every 1.5 seconds. | 1 per pin |
| **Balloon Twister** | 2 | Stands still. Every 4 seconds, twists a balloon dog (max 2 alive at once). Balloon dogs have 1 HP, chase Pierre at 120 px/second, and pop with "POP!" on contact with him. | 1 per balloon dog |
| **Clown Car** | 6 | A tiny car that parks on arrival. Every 1.5 seconds, a mini clown pops out (1 HP, walks toward Pierre at 100 px/second). Stops releasing clowns when destroyed. Counts as a "crowded" panel trigger. | 1 on contact (mini clowns) |

### 5.5 The left hand (secret helper)
- The left hand draws one item at a time. Drawing takes **1.5 seconds** (same outline-then-fill style as the right hand, but in crayon colors). An item can't be picked up until it's finished.
- Items appear on the ground or on a platform Pierre can reach, at least 150 px away from any clown.
- Pierre picks up an item by touching it.

The left hand appears in three situations:

1. **Pierre is losing:** when Pierre's HP drops to **3 or less**, the left hand draws a **sandwich** within 2 seconds. It won't do this again for 10 seconds, and won't do it if a sandwich is already on screen.
2. **Before a crowded panel:** in any panel with 4 or more clowns (panel 4 in the core version), the left hand draws one random item as soon as Pierre enters, **before** the right hand finishes drawing the first clown.
3. **At random:** in every other fighting panel, there's a 30% chance the left hand shows up at a random time between 3 and 10 seconds after Pierre enters and draws one random item.

Random item odds (core): sandwich 50%, squeaky hammer 25%, throwing knives 25%. When stretch items are added, split the non-sandwich 50% evenly between all available items.

### 5.6 Items

Holding rules: Pierre can hold **one melee item** at a time (hammer, balloon sword, or pogo stick). Picking up a new one replaces the old one. Throwing knives are separate and stack. The held item and its remaining uses are shown in the HUD.

Core items:

| Item | Effect |
|---|---|
| **Sandwich** | Restores 4 HP immediately (never above 10). Not held. |
| **Squeaky hammer** | Replaces the punch. 3 damage, 60 px reach, at most one swing every 0.6 seconds, "SQUEAK!" on hit. Breaks after 10 swings (hit or miss). |
| **Throwing knives** | +5 knives (max 10 carried). K throws one straight ahead at 480 px/second. 2 damage. Disappears on hit or at the panel edge. |

Stretch items:

| Item | Effect |
|---|---|
| **Balloon sword** | Replaces the punch. 2 damage, 50 px reach, one swing every 0.2 seconds. Pops ("POP!") after 8 hits. |
| **Pogo stick** | Lasts 15 seconds. Jumps go 1.6× higher (reaching platforms that are impossible otherwise). Landing on top of a clown deals 2 damage and bounces Pierre up. |
| **Slinky** | 3 per pickup. Thrown with J (instead of the melee attack) while held; it "walks" along the ground toward the nearest clown, going down platform edges, and deals 2 damage on contact. |
| **Invisible Dog** (animal helper) | A mime gag: only a stiff leash and collar are visible. Follows Pierre for 20 seconds, runs at the nearest clown within 200 px, and bites for 1 damage every 1 second. |

### 5.7 Hurting the right hand (stretch)
- While the right hand is drawing, a **squeaky hammer** hit on the hand cancels the drawing.
- The hand visibly reacts: it jerks back, shakes for about 1 second with an "OW!" bubble and cartoon stars, then exits off the top of the screen.
- The half-drawn clown is erased (wipes away).
- The hand comes back after 3 seconds to draw the rest of the panel's clowns, **including the one that was cancelled**. Interrupting buys time; it doesn't skip clowns.

### 5.8 Screens and HUD
- **Title screen:** comic-book cover reading "MIME OVER MATTER", with the story from section 1 in 2 to 4 short caption boxes, and "Press Enter to start".
- **HUD** (top of screen, outside or along the top of the panel): health bar with 10 segments, held melee item icon and uses left, knife count, "Panel N / 6".
- **Game Over:** a big red "CANCELLED!" stamp across the panel, and "Press R to try again". Restarting resets Pierre to 10 HP, no items, panel 1.
- **Pause:** P freezes everything and shows "PAUSED".

## 6. Acceptance criteria

Tags: **[P1]** must have, **[P2]** next most important, **[P3]** stretch. See section 7 for what to cut first.

### Getting started
1. **[P1]** Following the README, the game runs on a machine other than the author's.
2. **[P2]** A title screen shows the game name and the story in 2 to 4 caption boxes. Enter starts the game.

### Pierre
3. **[P1]** Pierre walks left/right with the arrow keys (and A/D) and jumps with Space (and W/Up).
4. **[P1]** Pierre lands on platforms and the ground, and can't walk through walls or off the left edge of a panel.
5. **[P1]** Pressing J punches. A punch within 40 px of a clown deals 1 damage and shows "POW!".
6. **[P1]** Pierre has 10 HP shown as a health bar. Getting hit removes HP, knocks Pierre back, and makes him flash and be invincible for 1 second.
7. **[P1]** At 0 HP, the game shows a Game Over screen. R restarts at panel 1 with full health and no items.
8. **[P2]** When hit, Pierre shows an empty (or "…") speech bubble for 1 second.

### The right hand
9. **[P1]** When Pierre enters a panel, a hand holding a pen appears and draws each of the panel's clowns one at a time.
10. **[P1]** Each clown takes 2.0 seconds to draw: an outline that appears gradually, then color.
11. **[P1]** A clown that's still being drawn doesn't move, doesn't hurt Pierre, and can't be damaged.
12. **[P1]** When the drawing finishes, the clown starts moving/attacking immediately.
13. **[P2]** Each clown shows a speech bubble ("HONK!", etc.) for 1.5 seconds when it becomes active.
14. **[P3]** A countdown or shrinking ring appears over a clown being drawn.

### Clowns
15. **[P1]** Unicyclist: 2 HP, rides back and forth, turns at walls and platform edges, hurts Pierre for 1 on contact.
16. **[P1]** Pie Tosser: 3 HP, throws an arcing pie at Pierre every 2.5 seconds, 1 damage per pie.
17. **[P1]** A clown disappears when its HP reaches 0.
18. **[P3]** Seltzer Spritzer, Juggler, Balloon Twister, and Clown Car each work as described in section 5.4. (Report each one separately.)

### Panels
19. **[P1]** The right edge of each panel is blocked until every clown in it is defeated, then unblocks and shows an arrow.
20. **[P1]** Walking off the right edge loads the next panel, and Pierre appears at its left edge.
21. **[P1]** There are 5 fighting panels with the contents in the table in section 5.2, and the HUD shows "Panel N / 6".
22. **[P1]** Reaching panel 6 shows THE END, with "Press R to play again".
23. **[P2]** In the THE END panel, Pierre takes a bow and "THE END" is drawn across the panel.

### The left hand and items
24. **[P1]** When Pierre's HP drops to 3 or less, a second hand (holding a crayon) draws a sandwich within 2 seconds. It doesn't do this again for 10 seconds, or while a sandwich is on screen.
25. **[P1]** Touching a sandwich restores 4 HP (max 10).
26. **[P1]** Items can't be picked up until the left hand finishes drawing them (1.5 seconds).
27. **[P2]** Squeaky hammer: replaces the punch, 3 damage, 60 px reach, breaks after 10 swings. The HUD shows swings left.
28. **[P2]** Throwing knives: pickup gives 5 (max 10). K throws one straight ahead for 2 damage. The HUD shows the count.
29. **[P2]** In a panel with 4 or more clowns, the left hand draws a random item before the first clown is finished.
30. **[P2]** In other fighting panels, the left hand shows up 30% of the time and draws a random item (sandwich 50%, hammer 25%, knives 25%).
31. **[P3]** Balloon sword, pogo stick, and slinky each work as described in section 5.6. (Report each one separately.)
32. **[P3]** The Invisible Dog works as described in section 5.6.

### Hurting the hand
33. **[P3]** Hitting the right hand with the hammer while it's drawing cancels the drawing. The hand shows pain ("OW!", shaking, stars) and leaves, the half-drawn clown is erased, and the hand returns after 3 seconds to finish the panel.

### Polish
34. **[P2]** Hits show comic burst text ("POW!", "BONK!", "SQUEAK!", "POP!") for 0.3 seconds.
35. **[P2]** P pauses and unpauses the game.
36. **[P3]** Sound effects: honk on clown spawn, squeak on hammer hits, pop on balloon items, a pen-scratch sound while drawing.

## 7. Priorities

**What matters most** is the two-hand drawing mechanic: clowns appearing as the right hand draws them (criteria 9 to 12), and the left hand rescuing Pierre with a sandwich when he's losing (24 to 26). If someone plays this and the hands don't draw things, it isn't this game.

**Order to build in:**
1. All [P1] criteria. This alone is a complete, winnable game: walk, punch, two clown types, 5 panels, the right hand, the sandwich rescue, game over, THE END.
2. The hammer and knives (27, 28), then the left hand's other triggers (29, 30).
3. Remaining [P2] polish (2, 8, 13, 23, 34, 35).
4. [P3] in this order: hurting the hand (33), pogo stick, balloon sword, more clown types, slinky, Invisible Dog, countdown, sound.

**If time runs short, cut in this order (first to go at the top):**
1. Sound
2. Invisible Dog
3. Extra clown types (keep just the Unicyclist and Pie Tosser)
4. Stretch items
5. Speech bubbles and burst text
6. The left hand's random and crowded-panel triggers (keep the low-health sandwich)

**Never cut:** the right hand drawing clowns before they can act, and the left hand's low-health sandwich.

**The art can stay simple.** Rectangles and circles with thick black outlines and the right colors are acceptable for every character. Spend time on the hands and the drawing effect before improving the sprites.

## 8. Notes for whoever builds this
- **Planned tech:** plain JavaScript and an HTML canvas, no build step and no libraries, so the game runs by opening `index.html` in a browser.
- **All numbers in this spec are tuning values, not sacred.** If a number makes the game feel bad, change it and say so in the README.
- Panel contents (which clowns, where, in what order, whether the panel is "crowded") should live in one data list, separate from the game logic, so panels can be added or rebalanced without touching code.
- One shared "being drawn" system should handle both hands: something appears at a position over N seconds and becomes active when finished. Clowns use it with 2.0 seconds and items with 1.5 seconds.
- **Out of scope:** multiple pages, saving progress, mobile/touch controls, two-player, scrolling levels.
