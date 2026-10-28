// Items the left hand draws (spec 5.6). Pierre picks an item up by
// touching it, but only once the drawing is finished (`active`).
class Sandwich {
  constructor(x, y) {
    this.kind = 'sandwich';
    this.x = x;
    this.y = y;
    this.w = 54;
    this.h = 42;
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
      { shape: 'rect', x: -25, y: -12, w: 50, h: 12, fill: '#e0a85a' },
      { shape: 'poly', pts: [[-28, -12], [-19, -21], [-10, -13], [0, -21], [10, -13], [19, -21], [28, -12]], fill: '#66bb6a' },
      { shape: 'rect', x: -24, y: -24, w: 48, h: 8, fill: '#e53935' },
      { shape: 'circle', x: 0, y: -30, r: 27, ry: 12, fill: '#e0a85a' },
      { shape: 'line', pts: [[-10, -34], [-7, -33]], lw: 2.5 },
      { shape: 'line', pts: [[5, -36], [8, -35]], lw: 2.5 },
    ];
  }

  render(ctx) {
    const lift = this.active ? Math.abs(Math.sin(this.bob * 4)) * 4 : 0;
    drawSketch(ctx, this.parts(), this.x, this.y - lift, this.facing,
      this.active ? 1 : this.drawProgress, { lineWidth: CONFIG.leftHand.lineWidth });
  }
}
