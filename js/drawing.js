// Characters and items are lists of simple "parts" (rectangles, circles,
// polygons and lines) in local coordinates, with (0, 0) at the feet and
// +x the way the thing is facing. Every part gets a thick black outline.
//
//   { shape: 'rect', x, y, w, h, fill }
//   { shape: 'circle', x, y, r, ry, fill }   ry is optional (an ellipse)
//   { shape: 'poly', pts: [[x, y], ...], fill }
//   { shape: 'line', pts: [[x, y], ...], lw } an open stroke, no fill
//
// drawSketch() draws the parts finished (progress 1) or partly drawn
// (progress below 1): first the outline is traced, then the color fills in
// from the top down.

// One part as a list of points; closed shapes end where they started.
function partPoints(p) {
  if (p.shape === 'rect') {
    return [[p.x, p.y], [p.x + p.w, p.y], [p.x + p.w, p.y + p.h], [p.x, p.y + p.h], [p.x, p.y]];
  }
  if (p.shape === 'circle') {
    const ry = p.ry || p.r;
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const a = -Math.PI / 2 + (i / 20) * Math.PI * 2;
      pts.push([p.x + Math.cos(a) * p.r, p.y + Math.sin(a) * ry]);
    }
    return pts;
  }
  return p.shape === 'poly' ? p.pts.concat([p.pts[0]]) : p.pts;
}

// The parts placed in the panel at (x, y): their point lists in panel
// coordinates, the total outline length and the bounding box.
function sketchOf(parts, x, y, facing) {
  const loops = parts.map(p => partPoints(p).map(([px, py]) => [x + px * facing, y + py]));
  let length = 0, top = Infinity, bottom = -Infinity, left = Infinity, right = -Infinity;
  for (const pts of loops) {
    for (let i = 0; i < pts.length; i++) {
      const [px, py] = pts[i];
      top = Math.min(top, py);
      bottom = Math.max(bottom, py);
      left = Math.min(left, px);
      right = Math.max(right, px);
      if (i > 0) length += Math.hypot(px - pts[i - 1][0], py - pts[i - 1][1]);
    }
  }
  return { loops, length, top, bottom, left, right };
}

function tracePath(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
}

// How far along a drawing is: the outline share (0 to 1) and the color
// share (0 to 1). The outline takes the first part of the drawing time.
function sketchStages(progress) {
  const share = CONFIG.drawing.outlineShare;
  return {
    outline: Math.min(1, progress / share),
    color: progress <= share ? 0 : Math.min(1, (progress - share) / (1 - share)),
  };
}

// Draws the parts at (x, y). `style.lineWidth` thickens the outline
// (the left hand's crayon is chunkier than the right hand's pen).
function drawSketch(ctx, parts, x, y, facing, progress = 1, style = {}) {
  const s = sketchOf(parts, x, y, facing);
  const { outline, color } = sketchStages(progress);
  let ink = outline * s.length;   // how much outline is drawn so far
  const colorBottom = s.top + (s.bottom - s.top) * color;

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  parts.forEach((p, i) => {
    const pts = s.loops[i];
    // Color, clipped to the part above the fill line while it's coloring in.
    if (p.fill && p.shape !== 'line' && color > 0) {
      ctx.save();
      if (color < 1) {
        ctx.beginPath();
        ctx.rect(s.left - 10, s.top - 10, s.right - s.left + 20, colorBottom - s.top + 10);
        ctx.clip();
      }
      tracePath(ctx, pts);
      ctx.fillStyle = p.fill;
      ctx.fill();
      ctx.restore();
    }
    // Outline, up to however much ink is left.
    if (ink <= 0) return;
    ctx.lineWidth = p.lw || style.lineWidth || 4;
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let j = 1; j < pts.length && ink > 0; j++) {
      const [ax, ay] = pts[j - 1], [bx, by] = pts[j];
      const seg = Math.hypot(bx - ax, by - ay);
      if (seg <= ink) {
        ctx.lineTo(bx, by);
        ink -= seg;
      } else {
        const t = ink / seg;
        ctx.lineTo(ax + (bx - ax) * t, ay + (by - ay) * t);
        ink = 0;
      }
    }
    ctx.stroke();
  });
  ctx.restore();
}

// Where the pen tip is at this point in a drawing: tracing the outline,
// then scribbling side to side along the color line.
function penPoint(parts, x, y, facing, progress, time) {
  const s = sketchOf(parts, x, y, facing);
  const { outline, color } = sketchStages(progress);
  if (outline < 1) {
    let ink = outline * s.length;
    for (const pts of s.loops) {
      for (let j = 1; j < pts.length; j++) {
        const [ax, ay] = pts[j - 1], [bx, by] = pts[j];
        const seg = Math.hypot(bx - ax, by - ay);
        if (seg >= ink) {
          const t = seg > 0 ? ink / seg : 0;
          return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t };
        }
        ink -= seg;
      }
    }
  }
  const sweep = Math.abs(((time * 5) % 2) - 1);
  return { x: s.left + (s.right - s.left) * sweep, y: s.top + (s.bottom - s.top) * color };
}

// The shared "being drawn" system (spec section 8). A DrawJob draws one
// thing (a clown or an item) over `duration` seconds. While it runs, the
// thing is inactive: it can't move, hurt, be hurt or be picked up. When it
// finishes, the thing becomes active at once.
//
// A drawable thing has x, y, facing, parts(), and gets `active` and
// `drawProgress` (0 to 1) from here.
class DrawJob {
  constructor(thing, duration) {
    this.thing = thing;
    this.duration = duration;
    this.t = 0;
    thing.active = false;
    thing.drawProgress = 0;
  }

  get done() { return this.t >= this.duration; }

  update(dt) {
    this.t = Math.min(this.duration, this.t + dt);
    this.thing.drawProgress = this.t / this.duration;
    if (this.done) this.thing.active = true;
  }

  tip(time) {
    const th = this.thing;
    return penPoint(th.parts(), th.x, th.y, th.facing, th.drawProgress, time);
  }
}
