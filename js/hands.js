// The cartoonist's two hands (spec 5.3 and 5.5). Both run the same code:
// the hand reaches in from above the panel, draws each thing in its queue
// with a DrawJob, one at a time, then leaves. The right hand holds an ink
// pen and draws clowns. The left hand holds a fat crayon, draws items a
// little faster, and wobbles.
class Hand {
  constructor(side) {
    this.side = side;   // 'right' or 'left'
    this.cfg = side === 'right' ? CONFIG.rightHand : CONFIG.leftHand;
    this.reset();
  }

  reset() {
    this.queue = [];
    this.job = null;
    this.state = 'away';  // 'away', 'waiting', 'moving', 'drawing' or 'leaving'
    this.tip = { x: 0, y: -400 };
    this.time = 0;
  }

  get busy() { return this.state !== 'away'; }

  // Queues a thing to draw. onStart runs when the pen first touches the
  // page, which is when the half-drawn thing appears in the panel.
  draw(thing, onStart) {
    this.queue.push({ thing, onStart });
    if (this.state === 'away') {
      const start = penPoint(thing.parts(), thing.x, thing.y, thing.facing, 0, 0);
      this.tip = { x: start.x + (this.side === 'right' ? 160 : -160), y: -CONFIG.panel.y - 260 };
      this.state = 'waiting';
      this.wait = this.cfg.enterDelay;
    }
  }

  update(dt) {
    this.time += dt;
    if (this.state === 'waiting') {
      this.wait -= dt;
      if (this.wait <= 0) this.state = 'moving';
    } else if (this.state === 'moving') {
      const next = this.queue[0].thing;
      const start = penPoint(next.parts(), next.x, next.y, next.facing, 0, 0);
      if (this.moveToward(start, dt)) {
        const { thing, onStart } = this.queue.shift();
        this.job = new DrawJob(thing, this.cfg.drawTime);
        onStart(thing);
        this.state = 'drawing';
      }
    } else if (this.state === 'drawing') {
      this.job.update(dt);
      this.tip = this.job.tip(this.time);
      if (this.job.done) {
        this.job = null;
        if (this.queue.length) {
          this.state = 'moving';
        } else {
          this.state = 'leaving';
          this.exit = { x: this.tip.x + (this.side === 'right' ? 200 : -200), y: -CONFIG.panel.y - 300 };
        }
      }
    } else if (this.state === 'leaving') {
      if (this.moveToward(this.exit, dt)) this.state = 'away';
    }
  }

  // Moves the pen tip toward a point; true once it's there.
  moveToward(target, dt) {
    const dx = target.x - this.tip.x, dy = target.y - this.tip.y;
    const d = Math.hypot(dx, dy), step = this.cfg.speed * dt;
    if (d <= step) {
      this.tip = { x: target.x, y: target.y };
      return true;
    }
    this.tip = { x: this.tip.x + (dx / d) * step, y: this.tip.y + (dy / d) * step };
    return false;
  }

  // Drawn in panel coordinates but not clipped to the panel: the hands
  // belong to the real world, outside the comic.
  render(ctx) {
    if (this.state === 'away') return;
    let { x, y } = this.tip;
    let tilt = 0;
    if (this.side === 'left') {
      const w = this.cfg.wobble;
      x += Math.sin(this.time * 11) * w;
      y += Math.cos(this.time * 8) * w * 0.6;
      tilt = Math.sin(this.time * 6) * 0.08;
    }
    ctx.save();
    ctx.translate(x, y);
    if (this.side === 'left') ctx.scale(-1, 1);
    ctx.rotate(tilt);
    drawHand(ctx, this.side === 'right' ? 'pen' : 'crayon', -(CONFIG.panel.y + y) - 20);
    ctx.restore();
  }
}

// A big cartoon hand with the tool's tip at (0, 0) and the hand up and to
// the right of it. The sleeve runs up to `topY` (the top of the screen).
function drawHand(ctx, tool, topY) {
  const ang = -0.95;                     // the tool points down-left from the hand
  const cx = Math.cos(ang) * 105 + 12;   // palm center
  const cy = Math.sin(ang) * 105 - 4;
  const skin = '#f6c9a0';
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';

  const box = (x, y, w, h, fill) => {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  };
  const oval = (x, y, rx, ry, fill) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.stroke();
  };
  const tri = (pts, fill) => {
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.stroke();
  };

  // Sleeve and cuff, straight up out of the top of the screen.
  box(cx - 28, topY, 60, cy - 30 - topY, '#3949ab');
  box(cx - 32, cy - 46, 68, 20, '#fff');
  oval(cx, cy, 38, 32, skin);

  // The tool and the fingers wrapped around it, along the tool's axis.
  ctx.save();
  ctx.rotate(ang);
  if (tool === 'pen') {
    tri([[0, 0], [18, -5], [18, 5]], '#c9c9c9');
    box(18, -6, 86, 12, INK);
    box(64, -6, 8, 12, '#9e9e9e');
  } else {
    tri([[0, 0], [22, -10], [22, 10]], '#26a69a');
    box(22, -11, 74, 22, '#26a69a');
    box(44, -11, 34, 22, '#80cbc4');
  }
  oval(60, -6, 11, 13, skin);
  oval(74, -8, 11, 14, skin);
  oval(88, -7, 11, 13, skin);
  oval(68, 14, 16, 9, skin);   // thumb
  ctx.restore();
}
