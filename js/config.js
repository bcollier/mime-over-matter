// All the tuning values in one place (spec section 8). Times are in seconds,
// distances in pixels, speeds in pixels per second. Positions inside a panel
// are measured from the panel's top-left corner.
const CONFIG = {
  canvas: { width: 960, height: 640 },
  panel: { x: 30, y: 70, w: 900, h: 540, border: 8 },
  groundY: 500,            // top of the ground, in panel coordinates
  gravity: 2000,
  gateWidth: 22,           // the ink line blocking the right edge

  pierre: {
    w: 30, h: 66,          // hit box
    startX: 50,            // where he enters each panel
    speed: 260,
    jumpSpeed: 780,        // jumps about 150 px high
    jumpCut: 0.45,         // upward speed kept when Jump is let go early
    maxHealth: 10,         // about ten hits
    punchDamage: 1,
    punchRange: 42,        // reach in front of his body
    punchCooldown: 0.3,
    punchShow: 0.14,       // how long the arm stays out
    invincible: 1.0,       // flashing after a hit
    knockbackX: 300,
    knockbackY: 320,
    knockbackLock: 0.25,   // no control for this long after a hit
  },
  drawing: {
    outlineShare: 0.6,     // the outline takes 60% of a drawing, color the rest
  },
  burstTime: 0.4,          // how long "POW!" and friends stay up
  sandwich: {
    lowHealth: 3,          // the left hand draws a sandwich at or below this
  },
};
