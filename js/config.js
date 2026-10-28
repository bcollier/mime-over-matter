// All the tuning values in one place (spec section 8). Times are in seconds,
// distances in pixels, speeds in pixels per second. Positions inside a panel
// are measured from the panel's top-left corner.
const CONFIG = {
  canvas: { width: 960, height: 640 },
  panel: { x: 30, y: 70, w: 900, h: 540, border: 8 },
  groundY: 500,            // top of the ground, in panel coordinates
  gravity: 2000,

  pierre: {
    maxHealth: 10,         // about ten hits
  },
  sandwich: {
    lowHealth: 3,          // the left hand draws a sandwich at or below this
  },
};
