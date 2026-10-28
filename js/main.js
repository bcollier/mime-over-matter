// The game loop, keyboard input, game states and moving between panels.
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Keyboard state. `down` holds keys being held; `pressed` holds keys that
// went down since the last frame (for one-shot actions like jump and punch).
const Input = {
  down: new Set(),
  pressed: new Set(),
  isDown(...keys) { return keys.some(k => this.down.has(k)); },
  wasPressed(...keys) { return keys.some(k => this.pressed.has(k)); },
  endFrame() { this.pressed.clear(); },
};
const KEYS = {
  left: ['ArrowLeft', 'a'],
  right: ['ArrowRight', 'd'],
  jump: [' ', 'w', 'ArrowUp'],
  attack: ['j'],
  restart: ['r', 'Enter'],
};
const keyName = e => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
addEventListener('keydown', e => {
  const k = keyName(e);
  if (!Input.down.has(k)) Input.pressed.add(k);
  Input.down.add(k);
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
});
addEventListener('keyup', e => Input.down.delete(keyName(e)));
addEventListener('blur', () => Input.down.clear());

const Game = {
  state: 'play',   // 'play', 'gameover' or 'end'
  time: 0,

  restart() {
    this.pierre = new Pierre();
    this.state = 'play';
    this.loadPanel(0);
  },

  loadPanel(index) {
    this.panelIndex = index;
    this.panel = PANELS[index];
    this.surfaces = surfacesOf(this.panel);
    this.clowns = [];
    this.effects = [];
    this.pierre.placeAtStart();
  },

  // How far right Pierre can go: the ink line on the right edge.
  rightLimit() {
    return CONFIG.panel.w - CONFIG.gateWidth;
  },

  // A comic impact word ("POW!") at a spot in the panel.
  burst(text, x, y, color = '#e53935') {
    this.effects.push({ text, x, y, color, t: 0, tilt: (Math.random() - 0.5) * 0.4 });
  },

  update(dt) {
    this.time += dt;
    this.pierre.update(dt, this);
    for (const e of this.effects) e.t += dt;
    this.effects = this.effects.filter(e => e.t < CONFIG.burstTime);
  },

  render() {
    const { x, y, w, h } = CONFIG.panel;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

    // Everything inside the panel is drawn in panel coordinates and clipped
    // to the panel.
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();
    drawPanelBackground(ctx, this.panel);
    drawSurfaces(ctx, this.panel.platforms);
    this.pierre.render(ctx);
    for (const e of this.effects) drawBurst(ctx, e);
    ctx.restore();

    drawPanelFrame(ctx);
    drawHUD(ctx, this);
  },
};

let last = performance.now();
function frame(now) {
  // Cap the step so a background tab or a slow frame can't tunnel things
  // through platforms.
  const dt = Math.min(1 / 30, (now - last) / 1000);
  last = now;
  Game.update(dt);
  Game.render();
  Input.endFrame();
  requestAnimationFrame(frame);
}

Game.restart();
requestAnimationFrame(frame);
