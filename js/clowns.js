// The clowns (spec 5.4) and the pies they throw. Each clown has one job:
// the Unicyclist rides back and forth and hurts on contact; the Pie Tosser
// stays put and lobs pies. Clowns are drawn by the right hand and do
// nothing until `active` (see DrawJob in drawing.js).
class Clown {
  constructor(spec, surfaces) {
    const cfg = CONFIG.clowns[spec.type];
    this.type = spec.type;
    this.w = cfg.w;
    this.h = cfg.h;
    this.health = cfg.health;
    // Platform n is surfaces[n + 1]; surfaces[0] is the ground.
    this.surface = spec.on === undefined ? surfaces[0] : surfaces[spec.on + 1];
    this.x = spec.x;
    this.y = this.surface.y;
    this.facing = -1;           // Pierre comes in from the left
    this.active = false;
    this.drawProgress = 0;
    this.dead = false;
    this.hitFlash = 0;
    this.stun = 0;
  }

  get box() { return boxOf(this); }

  hurt(damage, fromX, game) {
    if (!this.active || this.dead) return;
    const c = CONFIG.clowns;
    this.health -= damage;
    this.hitFlash = c.hitFlash;
    this.stun = c.hitStun;
    this.x += (this.x < fromX ? -1 : 1) * c.hitPush;
    this.x = Math.max(this.surface.x + this.w / 2, Math.min(this.surface.x + this.surface.w - this.w / 2, this.x));
    if (this.health <= 0) {
      this.dead = true;
      game.clownDefeated(this);
    }
  }

  update(dt, game) {
    this.hitFlash -= dt;
    this.stun -= dt;
    if (this.stun <= 0) this.act(dt, game);
  }

  render(ctx) {
    ctx.save();
    if (this.hitFlash > 0 && Math.floor(this.hitFlash * 30) % 2 === 0) ctx.globalAlpha = 0.35;
    drawSketch(ctx, this.parts(), this.x, this.y, this.facing,
      this.active ? 1 : this.drawProgress, { lineWidth: CONFIG.rightHand.lineWidth });
    ctx.restore();
  }
}

// Fragile and fast. Rides back and forth on its own surface, turning at
// walls and ledges, and hurts Pierre on contact.
class Unicyclist extends Clown {
  constructor(spec, surfaces) {
    super(spec, surfaces);
    this.wheel = 0;
  }

  act(dt, game) {
    const s = this.surface, half = this.w / 2;
    const minX = Math.max(s.x, 0) + half;
    const maxX = Math.min(s.x + s.w, game.rightLimit()) - half;
    this.x += this.facing * CONFIG.clowns.unicyclist.speed * dt;
    if (this.x <= minX) { this.x = minX; this.facing = 1; }
    if (this.x >= maxX) { this.x = maxX; this.facing = -1; }
    this.wheel += CONFIG.clowns.unicyclist.speed * dt / 13;
    if (boxesOverlap(this.box, game.pierre.box)) {
      game.pierre.hurt(CONFIG.clowns.unicyclist.contactDamage, this.x);
    }
  }

  parts() {
    const a = this.wheel, r = 11;
    const ca = Math.cos(a) * r, sa = Math.sin(a) * r;
    return [
      { shape: 'circle', x: 0, y: -13, r: 13, fill: '#ffd600' },
      { shape: 'line', pts: [[-ca, -13 - sa], [ca, -13 + sa]], lw: 3 },
      { shape: 'line', pts: [[sa, -13 - ca], [-sa, -13 + ca]], lw: 3 },
      { shape: 'rect', x: -2, y: -40, w: 4, h: 26, fill: '#1e88e5' },
      { shape: 'rect', x: -9, y: -43, w: 18, h: 5, fill: INK },
      { shape: 'circle', x: -12, y: -74, r: 7, fill: '#ffd600' },
      { shape: 'circle', x: 12, y: -74, r: 7, fill: '#ffd600' },
      { shape: 'rect', x: -14, y: -64, w: 28, h: 22, fill: '#e53935' },
      { shape: 'circle', x: -6, y: -56, r: 3, fill: '#ffd600' },
      { shape: 'circle', x: 5, y: -49, r: 3, fill: '#1e88e5' },
      { shape: 'line', pts: [[13, -60], [25, -70]], lw: 4 },
      { shape: 'circle', x: 0, y: -74, r: 11, fill: '#fff' },
      { shape: 'circle', x: 10, y: -73, r: 4, fill: '#e53935' },
      { shape: 'line', pts: [[2, -79], [2, -76]], lw: 2.5 },
      { shape: 'line', pts: [[-3, -68], [3, -66], [7, -68]], lw: 2 },
      { shape: 'poly', pts: [[-8, -84], [8, -84], [0, -100]], fill: '#43a047' },
    ];
  }
}

// Sturdier, and stays put. Every few seconds it lobs a pie in an arc at
// Pierre.
class PieTosser extends Clown {
  constructor(spec, surfaces) {
    super(spec, surfaces);
    this.throwTimer = CONFIG.clowns.pieTosser.firstThrow;
  }

  act(dt, game) {
    const cfg = CONFIG.clowns.pieTosser;
    this.facing = game.pierre.x < this.x ? -1 : 1;
    this.throwTimer -= dt;
    if (this.throwTimer <= 0) {
      this.throwPie(game);
      this.throwTimer = cfg.throwEvery;
    }
  }

  // Aims so the pie comes down where Pierre is standing now. Longer throws
  // fly longer, so the arc stays readable.
  throwPie(game) {
    const c = CONFIG.pie;
    const fromX = this.x + this.facing * 24, fromY = this.y - 78;
    const toX = game.pierre.x, toY = game.pierre.y - 30;
    const flight = Math.max(c.minFlight, Math.min(c.maxFlight, Math.abs(toX - fromX) * c.flightPerPixel));
    const vx = (toX - fromX) / flight;
    const vy = (toY - fromY - 0.5 * c.gravity * flight * flight) / flight;
    game.pies.push(new Pie(fromX, fromY, vx, vy));
  }

  parts() {
    const windup = this.active && this.throwTimer < CONFIG.clowns.pieTosser.windup;
    const parts = [
      { shape: 'circle', x: -10, y: -5, r: 13, ry: 5, fill: '#e53935' },
      { shape: 'circle', x: 12, y: -5, r: 13, ry: 5, fill: '#e53935' },
      { shape: 'rect', x: -17, y: -54, w: 34, h: 46, fill: '#43a047' },
      { shape: 'circle', x: 0, y: -42, r: 3, fill: '#ffd600' },
      { shape: 'circle', x: 0, y: -28, r: 3, fill: '#ffd600' },
      { shape: 'circle', x: -15, y: -68, r: 8, fill: '#1e88e5' },
      { shape: 'circle', x: 15, y: -68, r: 8, fill: '#1e88e5' },
      { shape: 'circle', x: 0, y: -66, r: 13, fill: '#fff' },
      { shape: 'circle', x: 11, y: -65, r: 5, fill: '#e53935' },
      { shape: 'line', pts: [[3, -72], [3, -68]], lw: 2.5 },
      { shape: 'line', pts: [[-4, -58], [3, -56], [9, -59]], lw: 2 },
      { shape: 'rect', x: -9, y: -94, w: 18, h: 14, fill: '#ffd600' },
      { shape: 'rect', x: -14, y: -81, w: 28, h: 3, fill: INK },
    ];
    if (windup) {
      parts.push({ shape: 'poly', pts: [[12, -50], [18, -52], [26, -74], [20, -76]], fill: '#43a047' });
      parts.push(...pieParts(24, -78));
    } else {
      parts.push({ shape: 'rect', x: 14, y: -50, w: 7, h: 22, fill: '#43a047' });
    }
    return parts;
  }
}

function makeClown(spec, surfaces) {
  if (spec.type === 'unicyclist') return new Unicyclist(spec, surfaces);
  if (spec.type === 'pieTosser') return new PieTosser(spec, surfaces);
  throw new Error(`Unknown clown type: ${spec.type}`);
}

// A cream pie in a tin, centered at (x, y).
function pieParts(x, y) {
  return [
    { shape: 'circle', x, y: y + 2, r: 11, ry: 4, fill: '#c68642' },
    { shape: 'circle', x, y: y - 2, r: 9, ry: 4, fill: '#fff8e1' },
  ];
}

// A pie in flight. It splats on whatever it hits: Pierre, a platform, the
// ground.
class Pie {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.w = CONFIG.pie.w;
    this.h = CONFIG.pie.h;
    this.splatT = -1;    // seconds since it splatted; -1 while flying
    this.done = false;
  }

  get box() { return boxOf(this); }

  update(dt, game) {
    if (this.splatT >= 0) {
      this.splatT += dt;
      if (this.splatT > CONFIG.pie.splatTime) this.done = true;
      return;
    }
    const prevY = this.y;
    this.vy += CONFIG.pie.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (boxesOverlap(this.box, game.pierre.box)) {
      game.pierre.hurt(CONFIG.pie.damage, this.x - Math.sign(this.vx) * 100);
      this.splatT = 0;
    } else if (landOn(this, prevY, game.surfaces)) {
      this.splatT = 0;
    } else if (this.x < -50 || this.x > CONFIG.panel.w + 50 || this.y > CONFIG.panel.h + 50) {
      this.done = true;
    }
  }

  render(ctx) {
    if (this.splatT < 0) {
      drawSketch(ctx, pieParts(0, -5), this.x, this.y, 1);
      return;
    }
    // A cream splat that fades away.
    ctx.save();
    ctx.globalAlpha = 1 - this.splatT / CONFIG.pie.splatTime;
    ctx.beginPath();
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = i % 2 ? 9 : 18;
      ctx.lineTo(this.x + Math.cos(a) * r * 1.4, this.y - 6 + Math.sin(a) * r * 0.7);
    }
    ctx.closePath();
    ctx.fillStyle = '#fff8e1';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.restore();
  }
}
