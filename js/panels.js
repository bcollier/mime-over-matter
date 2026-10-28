// The page's six panels, as data (spec 5.2 and section 8), so panels can be
// added or rebalanced without touching game code.
//
// Positions are in panel coordinates: the panel is CONFIG.panel.w wide, and
// the top of the ground is at CONFIG.groundY. Platforms are {x, y, w}, with
// y the platform's top; Pierre can jump up through them and land on top.
// A clown is {type, x}, standing on the ground, or {type, x, on: n},
// standing on platform n. The right hand draws the clowns in the order
// listed. A `crowded` panel gets an item from the left hand first (spec 5.5).
// `caption` lines show in a yellow caption box at the top left.
const PANELS = [
  {
    // Panel 1: tutorial.
    platforms: [{ x: 360, y: 360, w: 170 }],
    clowns: [{ type: 'unicyclist', x: 690 }],
    caption: [
      'Meanwhile, at KlownKon...',
      'Arrows or A / D: walk.  Space, W or Up: jump.  J: punch.',
      'Beat every clown to wipe away the ink line on the right.',
    ],
  },
  {
    platforms: [{ x: 260, y: 350, w: 160 }],
    clowns: [
      { type: 'pieTosser', x: 790 },
      { type: 'unicyclist', x: 540 },
    ],
  },
  {
    platforms: [{ x: 300, y: 350, w: 170 }, { x: 590, y: 250, w: 180 }],
    clowns: [
      { type: 'pieTosser', x: 385, on: 0 },
      { type: 'pieTosser', x: 680, on: 1 },
      { type: 'unicyclist', x: 560 },
    ],
  },
  {
    crowded: true,
    platforms: [{ x: 120, y: 350, w: 170 }, { x: 560, y: 320, w: 200 }],
    clowns: [
      { type: 'pieTosser', x: 820 },
      { type: 'unicyclist', x: 450 },
      { type: 'pieTosser', x: 660, on: 1 },
      { type: 'unicyclist', x: 205, on: 0 },
      { type: 'unicyclist', x: 700 },
    ],
  },
  {
    platforms: [{ x: 200, y: 350, w: 150 }, { x: 440, y: 260, w: 150 }, { x: 690, y: 350, w: 160 }],
    clowns: [
      { type: 'unicyclist', x: 500 },
      { type: 'pieTosser', x: 515, on: 1 },
      { type: 'unicyclist', x: 770, on: 2 },
      { type: 'pieTosser', x: 830 },
    ],
  },
  {
    // Panel 6: THE END. No clowns.
    theEnd: true,
    platforms: [],
    clowns: [],
  },
];
