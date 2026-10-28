// Items the left hand draws (spec 5.6). Pierre picks an item up by
// touching it, but only once the drawing is finished (`active`).
class Sandwich {
  constructor(x, y) {
    this.kind = 'sandwich';
    this.x = x;
    this.y = y;
    this.w = 36;
    this.h = 28;
    this.facing = 1;
    this.active = false;
    this.drawProgress = 0;
    this.taken = false;
    this.bob = 0;
  }

  get box() { return boxOf(this); }

  // Eaten on the spot: restores a good chunk of health, never above full.
  update(dt, game) {
    this.bob += dt;
    if (boxesOverlap(this.box, game.pierre.box)) {
      game.pierre.heal(CONFIG.sandwich.heal);
      this.taken = true;
    }
  }

  parts() {
    return [
      { shape: 'rect', x: -17, y: -8, w: 34, h: 8, fill: '#e0a85a' },
      { shape: 'poly', pts: [[-19, -8], [-13, -14], [-7, -9], [0, -14], [7, -9], [13, -14], [19, -8]], fill: '#66bb6a' },
      { shape: 'rect', x: -16, y: -16, w: 32, h: 5, fill: '#e53935' },
      { shape: 'circle', x: 0, y: -20, r: 18, ry: 8, fill: '#e0a85a' },
      { shape: 'line', pts: [[-7, -23], [-5, -22]], lw: 2 },
      { shape: 'line', pts: [[3, -24], [5, -23]], lw: 2 },
    ];
  }

  render(ctx) {
    const lift = this.active ? Math.abs(Math.sin(this.bob * 4)) * 4 : 0;
    drawSketch(ctx, this.parts(), this.x, this.y - lift, this.facing,
      this.active ? 1 : this.drawProgress, { lineWidth: CONFIG.leftHand.lineWidth });
  }
}
