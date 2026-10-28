// Smoke test: runs the real game scripts in Node with a fake canvas and
// checks the core rules. No dependencies. Run from the repo root:
//
//   node tests/smoke.js
//
// It prints one line per check and exits with an error if any fail.
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');

// A canvas context that accepts every drawing call and does nothing.
const ctxStub = new Proxy({}, {
  get(t, k) {
    if (k in t) return t[k];
    if (k === 'measureText') return () => ({ width: 10 });
    if (k === 'createLinearGradient') return () => ({ addColorStop() {} });
    return () => {};
  },
  set(t, k, v) { t[k] = v; return true; },
});
const canvasStub = { width: 960, height: 640, getContext: () => ctxStub };
const listeners = {};
let rafCallback = null;
let nowMs = 0;
const sandbox = {
  console, Math,
  document: { getElementById: () => canvasStub, createElement: () => ({ ...canvasStub }) },
  performance: { now: () => nowMs },
  requestAnimationFrame: cb => { rafCallback = cb; },
  addEventListener: (type, fn) => { (listeners[type] ||= []).push(fn); },
};
sandbox.window = sandbox;
vm.createContext(sandbox);

// Load the scripts in the same order as index.html.
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const [, src] of html.matchAll(/<script src="([^"]+)"/g)) {
  vm.runInContext(fs.readFileSync(path.join(root, src), 'utf8'), sandbox, { filename: src });
}

const get = expr => vm.runInContext(expr, sandbox);
const key = (type, k) => (listeners[type] || []).forEach(fn => fn({ key: k, preventDefault() {} }));
const run = seconds => {
  for (let i = 0; i < Math.round(seconds * 60); i++) {
    nowMs += 1000 / 60;
    const cb = rafCallback;
    rafCallback = null;
    cb(nowMs);
  }
};

let failures = 0;
function check(name, ok) {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
}

// --- Panel data ---
const panels = get('PANELS');
check('6 panels, the last one is THE END', panels.length === 6 && panels[5].theEnd);
const counts = panels.slice(0, 5).map(p => p.clowns.length).join(',');
check(`clown counts match spec 5.2 (got ${counts})`, counts === '1,2,3,5,4');
check('every fighting panel has at least two heights (criterion 40)',
  panels.slice(0, 5).every(p => p.platforms.length >= 1));

// Every platform can be reached by jumping up from the ground or another
// platform: at most 125 px up, and at most 110 px of gap across.
for (const [i, p] of panels.entries()) {
  const ground = get('CONFIG.groundY');
  const surfaces = [{ x: 0, y: ground, w: get('CONFIG.panel.w') }, ...p.platforms];
  const reached = new Set([0]);
  let grew = true;
  while (grew) {
    grew = false;
    surfaces.forEach((s, k) => {
      if (reached.has(k)) return;
      const from = [...reached].map(j => surfaces[j]).some(r => {
        const gap = Math.max(0, Math.max(r.x, s.x) - Math.min(r.x + r.w, s.x + s.w));
        return r.y - s.y <= 125 && gap <= 110;
      });
      if (from) { reached.add(k); grew = true; }
    });
  }
  check(`panel ${i + 1}: every platform is reachable`, reached.size === surfaces.length);
}

// --- The right hand draws clowns, which are harmless until finished ---
run(1.2);
check('right hand is drawing the first clown', get('Game.rightHand.state') === 'drawing');
check('a clown being drawn is not active', get('Game.clowns[0].active') === false);
get('Game.clowns[0].hurt(99, 0, Game)');
check('a clown being drawn cannot be hurt', get('Game.clowns[0].dead') === false);
run(2);
check('the clown is active once drawn', get('Game.clowns[0].active') === true);

// --- Punching ---
get('Game.pierre.x = Game.clowns[0].x - 45; Game.pierre.facing = 1; Game.pierre.punchCooldown = 0');
get('Game.pierre.punch(Game)');
check('a punch damages a finished clown', get('Game.clowns[0].health') === get('CONFIG.clowns.unicyclist.health') - 1);
check('a punch shows POW!', get('Game.effects.some(e => e.text === "POW!")'));

// --- The gate opens when the panel is clear ---
check('the gate is closed while a clown is alive', get('Game.gateOpen') === false);
get('Game.clowns.forEach(c => c.hurt(99, 0, Game))');
run(0.1);
check('the gate opens once every clown is defeated', get('Game.gateOpen') === true);
key('keydown', 'ArrowRight'); run(4); key('keyup', 'ArrowRight');
check('walking off the right edge loads panel 2', get('Game.panelIndex') === 1);

// --- The left hand's sandwich rescue ---
get('Game.pierre.hurt = () => false; Game.pierre.health = 3');
run(1.2);
check('at low health the left hand draws a sandwich', get('Game.items.length') === 1 && get('Game.items[0].active') === false);
get('Game.pierre.x = Game.items[0].x; Game.pierre.y = Game.items[0].y');
run(1 / 60);
check('a sandwich being drawn cannot be eaten', get('Game.pierre.health') === 3);
run(1.5);
check('a finished sandwich heals 4', get('Game.pierre.health') === 7);
get('Game.pierre.health = 2');
run(2);
check('no second sandwich during the cooldown', get('Game.items.length') === 0 && !get('Game.leftHand.busy'));

// --- Game Over and restart ---
get('delete Game.pierre.hurt; Game.pierre.health = 0');
run(0.1);
check('Game Over at 0 health', get('Game.state') === 'gameover');
key('keydown', 'r'); run(0.1); key('keyup', 'r');
check('R restarts at panel 1 with full health', get('Game.state') === 'play' && get('Game.panelIndex') === 0 && get('Game.pierre.health') === 10);

// --- THE END ---
get('Game.loadPanel(4); Game.pierre.hurt = () => false');
run(14);
get('Game.clowns.forEach(c => c.hurt(99, 0, Game))');
key('keydown', 'ArrowRight'); run(5); key('keyup', 'ArrowRight');
check('clearing panel 5 reaches THE END', get('Game.state') === 'end' && get('Game.panelIndex') === 5);

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
