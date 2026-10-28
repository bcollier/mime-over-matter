// Pierre the mime (spec 5.1): walk, jump, punch, take hits.
class Pierre {
  constructor() {
    this.w = CONFIG.pierre.w;
    this.h = CONFIG.pierre.h;
    this.health = CONFIG.pierre.maxHealth;
    this.placeAtStart();
  }

  // Each panel starts with Pierre standing at its left side.
  placeAtStart() {
    this.x = CONFIG.pierre.startX;
    this.y = CONFIG.groundY;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.onGround = true;
    this.rising = false;        // jumping with Jump still held
    this.invincible = 0;        // seconds of flashing left after a hit
    this.knockLock = 0;         // seconds of knockback before control returns
    this.punchCooldown = 0;
    this.punchTimer = 0;        // seconds the punching pose is still shown
    this.walkPhase = 0;
  }

  get box() { return boxOf(this); }

  update(dt, game) {
    const c = CONFIG.pierre;
    this.invincible = Math.max(0, this.invincible - dt);
    this.knockLock -= dt;
    this.punchCooldown -= dt;
    this.punchTimer -= dt;

    if (this.knockLock <= 0) {
      const dir = (Input.isDown(...KEYS.right) ? 1 : 0) - (Input.isDown(...KEYS.left) ? 1 : 0);
      this.vx = dir * c.speed;
      if (dir) this.facing = dir;
      if (this.onGround && Input.wasPressed(...KEYS.jump)) {
        this.vy = -c.jumpSpeed;
        this.onGround = false;
        this.rising = true;
      }
      if (Input.wasPressed(...KEYS.attack) && this.punchCooldown <= 0) this.punch(game);
    }
    // Letting go of Jump early gives a shorter hop.
    if (this.rising && (this.vy >= 0 || !Input.isDown(...KEYS.jump))) {
      if (this.vy < 0) this.vy *= c.jumpCut;
      this.rising = false;
    }

    const prevY = this.y;
    this.vy += CONFIG.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.onGround = !!landOn(this, prevY, game.surfaces);

    // The left edge is a wall; so is the right edge until the ink line goes.
    this.x = Math.max(this.w / 2, Math.min(game.rightLimit() - this.w / 2, this.x));

    if (this.onGround && this.vx !== 0) this.walkPhase += dt * 14;
  }

  punch(game) {
    const c = CONFIG.pierre;
    this.punchCooldown = c.punchCooldown;
    this.punchTimer = c.punchShow;
    const reach = {
      left: this.facing > 0 ? this.x : this.x - this.w / 2 - c.punchRange,
      right: this.facing > 0 ? this.x + this.w / 2 + c.punchRange : this.x,
      top: this.y - this.h + 8,
      bottom: this.y - 16,
    };
    for (const clown of game.clowns) {
      if (clown.active && boxesOverlap(reach, clown.box)) {
        clown.hurt(c.punchDamage, this.x, game);
        game.burst('POW!', clown.x - this.facing * clown.w / 4, clown.y - clown.h * 0.6);
      }
    }
  }

  // Takes a hit from something at fromX. Ignored while flashing.
  hurt(damage, fromX) {
    if (this.invincible > 0 || this.health <= 0) return false;
    const c = CONFIG.pierre;
    this.health = Math.max(0, this.health - damage);
    this.invincible = c.invincible;
    this.knockLock = c.knockbackLock;
    this.vx = (this.x < fromX ? -1 : 1) * c.knockbackX;
    this.vy = -c.knockbackY;
    this.onGround = false;
    this.rising = false;
    return true;
  }

  heal(amount) {
    this.health = Math.min(CONFIG.pierre.maxHealth, this.health + amount);
  }

  // Black, white and grey only: striped shirt, white face, black beret.
  parts() {
    const swing = this.onGround && this.vx !== 0 ? Math.sin(this.walkPhase) * 5 : 0;
    const parts = [
      { shape: 'rect', x: -10 + swing, y: -24, w: 8, h: 24, fill: '#666' },
      { shape: 'rect', x: 2 - swing, y: -24, w: 8, h: 24, fill: '#666' },
      { shape: 'rect', x: -16, y: -46, w: 6, h: 18, fill: '#fff' },
      { shape: 'rect', x: -13, y: -48, w: 26, h: 26, fill: '#fff' },
      { shape: 'line', pts: [[-13, -42], [13, -42]], lw: 3 },
      { shape: 'line', pts: [[-13, -35], [13, -35]], lw: 3 },
      { shape: 'line', pts: [[-13, -28], [13, -28]], lw: 3 },
      { shape: 'circle', x: 0, y: -58, r: 11, fill: '#fff' },
      { shape: 'line', pts: [[3, -62], [3, -59]], lw: 2.5 },
      { shape: 'line', pts: [[7, -62], [7, -59]], lw: 2.5 },
      { shape: 'line', pts: [[3, -53], [8, -53]], lw: 2 },
      { shape: 'circle', x: -1, y: -69, r: 12, ry: 4, fill: INK },
      { shape: 'circle', x: -1, y: -74, r: 2, fill: INK },
    ];
    if (this.punchTimer > 0) {
      parts.push({ shape: 'rect', x: 8, y: -46, w: 24, h: 7, fill: '#fff' });
      parts.push({ shape: 'circle', x: 35, y: -43, r: 6, fill: '#fff' });
    } else {
      parts.push({ shape: 'rect', x: 8, y: -46, w: 6, h: 18, fill: '#fff' });
      parts.push({ shape: 'circle', x: 11, y: -26, r: 4, fill: '#fff' });
    }
    return parts;
  }

  render(ctx) {
    // Flash while invincible after a hit.
    if (this.invincible > 0 && Math.floor(this.invincible * 12) % 2 === 1) return;
    drawSketch(ctx, this.parts(), this.x, this.y, this.facing);
  }
}
