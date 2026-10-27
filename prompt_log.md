# Prompt Log

## Tools and models
- **Claude Code** (CLI), model **Claude Opus 5.5** (`claude-opus-5-5`)

## Phase 1, part 1: designing the game and writing SPEC.md (Tue 10/27/2026)

Prompts are copied word for word, typos included. The notes under each one say what came back and what I decided, so it's clear which design choices were mine and which were the AI's.

### Prompt 1
```
help me come up with a game idea for this https://www.cs.cmu.edu/~113/hw7.html
```
**What came back:** five game ideas (Echo Maze, Past Selves, Parallel Parking, Recipe Relay, Shelf Life), with a note on how each would split between Phase 1 and Phase 2. I didn't use any of them.

### Prompt 2
```
how about a comic book themed platformer, where the levels are being drawn by a hand as you play. so for example I'm thinking the old game Comix Zone for sega genesis, maybe there is a hand that draws enemies and obsticles for you, and occasionallly another hand that draws things that help such as a weapon or a little animal helper or a hammer etc
```
**What came back:** feedback on my idea. It pointed out that Comix Zone already has a villain's hand drawing enemies, so my version needs to be different (the second, helpful hand and live drawing). It suggested fixed comic panels instead of a scrolling camera to save time, and a cheap outline-then-fill drawing effect. It also asked me six design questions (answered in Prompt 3).

### Prompt 3
My answers to the six design questions. I pasted each question back in with my answer underneath.
```
1. Is the drawing a warning? If an enemy can’t hurt you until it’s fully drawn, the drawing time is your window to get ready. How long should it be?


can't hurt you til its fully draw, you can give a countdown until the drawing is done but not required

1. Can you mess with the hands? Punch the pencil to stop a drawing halfway, or grab a helper item before it’s finished? This could be the best mechanic in the game, or a stretch goal.

this can be a stretch goal, maybe certain weapons or certain siutations you can stop the hand and it clearly shows pain, shakes it off and leaves

1. When does the friendly hand show up? On a timer, at random, or when you’re losing (low health)? Each one feels very different.


for sure when you're losing, draw a sandwich for health most of the time. it should come out at random, or before rooms that have a lot of enemies.

1. Which helpers, and what does each one do? Give each a different job, e.g. the hammer breaks walls and the weapon hits from range. The animal helper is the most work, since it needs its own behavior, so rank it near the bottom.


the animal helper can be a stretch goal. i like the hammer can hurt the hand or deal more damage to enemies, some throwing knives against the enemies instead of a gun. 

1. How do you win and lose? Health, the number of panels in a page, what happens at the end.


health you lose. I want a story where for some reason a Mime is pulled into a comic book full of clowns. write a plausible backstory and build the world for this. the weapons should be fun things like a baloon sword or a pogo stick to jump around on, a slinky, etc.


1. What should it feel like? Frantic and funny? A duel with the artist? Write a sentence or two on this.


this should be light and fun. the theme is like an odd duck, a mime at a clown convention or something. make a variety of clowns and the protagonist a mime fighting in a comic book inspired by Comix zone
```
**What came back:** a story draft (the cartoonist Chuckles McGraw, the mime Pierre, KlownKon, the right-handed artist whose left hand rebels), a table of six clown types, a table of items, and a suggested must-have / next / stretch split.

### Prompt 4
```
this looks good, log all of these prompts to prompt_log.md and write them up as specific as possible for the spec.md go
```
**What came back:** this file and the first draft of `SPEC.md`.

### Prompt 5
```
create a new repo for this project
```
**What came back:** the AI set up a local git repo for the project. Creating the public GitHub repo was blocked at first by a Claude Code permission check. I added a permission rule allowing `gh repo create`, and then the AI created the repo.

### Who decided what (for my Phase 2 partner)
- **My decisions:** comic-book platformer inspired by Comix Zone; a hand drawing enemies while you play and a second hand drawing help; enemies can't hurt you until fully drawn; an optional countdown; hurting the hand as a stretch goal (it shows pain, shakes it off, leaves); the helper hand mainly draws sandwiches when you're losing, sometimes at random, and before rooms with lots of enemies; the hammer does extra damage and can hurt the hand; throwing knives instead of a gun; balloon sword, pogo stick, and slinky as fun weapons; the animal helper as a stretch goal; you lose when health runs out; a mime pulled into a comic full of clowns; a light and fun "odd duck" tone.
- **Drafted by the AI and approved by me:** the story and character names, the six clown types and what each one does, the Invisible Dog as the animal helper, what the slinky does, the "CANCELLED!" game-over stamp, and all the exact numbers (HP, speeds, timings, odds, panel contents). Section 8 of the spec says the numbers are tuning values your partner can change.
