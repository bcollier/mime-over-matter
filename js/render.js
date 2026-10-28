// Drawing helpers for the comic-book look: the panel and its gutter, the
// halftone background, platforms, captions and the HUD.
const INK = '#111';
const COMIC_FONT = '"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive';
const IMPACT_FONT = 'Impact, "Arial Black", sans-serif';

// The pale halftone dot pattern, drawn once and reused every frame.
let halftoneCanvas = null;
function halftone() {
  if (halftoneCanvas) return halftoneCanvas;
  const { w, h } = CONFIG.panel;
  halftoneCanvas = document.createElement('canvas');
  halftoneCanvas.width = w;
  halftoneCanvas.height = h;
  const c = halftoneCanvas.getContext('2d');
  c.fillStyle = '#fffaf0';
  c.fillRect(0, 0, w, h);
  c.fillStyle = 'rgba(120, 170, 230, 0.28)';
  const step = 12;
  for (let row = 0, y = 0; y < h + step; row++, y += step) {
    for (let x = (row % 2) * step / 2; x < w + step; x += step) {
      c.beginPath();
      c.arc(x, y, 2, 0, Math.PI * 2);
      c.fill();
    }
  }
  return halftoneCanvas;
}

function outlinedText(ctx, text, x, y, size, fill, opts = {}) {
  ctx.save();
  ctx.font = `${opts.weight || 'bold'} ${size}px ${opts.font || IMPACT_FONT}`;
  ctx.textAlign = opts.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = opts.stroke ?? Math.max(3, size / 7);
  ctx.strokeStyle = INK;
  if (ctx.lineWidth > 0) ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawPanelBackground(ctx, panel) {
  ctx.drawImage(halftone(), 0, 0);
  (panel.notes || []).forEach((line, i) => {
    ctx.save();
    ctx.font = `bold 20px ${COMIC_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(40, 40, 60, 0.55)';
    ctx.fillText(line, CONFIG.panel.w / 2, 70 + i * 32);
    ctx.restore();
  });
}

// Ground and platforms: chunky stage risers with thick outlines.
function drawSurfaces(ctx, platforms) {
  const { w, h } = CONFIG.panel;
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  ctx.fillStyle = '#e9c27d';
  ctx.fillRect(0, CONFIG.groundY, w, h - CONFIG.groundY);
  ctx.beginPath();
  ctx.moveTo(0, CONFIG.groundY);
  ctx.lineTo(w, CONFIG.groundY);
  ctx.stroke();
  for (const p of platforms) {
    ctx.fillStyle = '#f4dc6a';
    ctx.fillRect(p.x, p.y, p.w, 18);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(p.x, p.y + 12, p.w, 6);
    ctx.strokeRect(p.x, p.y, p.w, 18);
  }
}

// The thick black panel border; the white canvas around it is the gutter.
function drawPanelFrame(ctx) {
  const { x, y, w, h, border } = CONFIG.panel;
  ctx.lineWidth = border;
  ctx.strokeStyle = INK;
  ctx.strokeRect(x - border / 2, y - border / 2, w + border, h + border);
}

function drawHUD(ctx, game) {
  const p = game.pierre;
  outlinedText(ctx, 'HEALTH', 30, 36, 22, '#fff', { align: 'left', stroke: 4 });
  for (let i = 0; i < CONFIG.pierre.maxHealth; i++) {
    const x = 122 + i * 26;
    ctx.fillStyle = i < p.health ? (p.health <= CONFIG.sandwich.lowHealth ? '#e53935' : '#43a047') : '#ddd';
    ctx.fillRect(x, 24, 22, 24);
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    ctx.strokeRect(x, 24, 22, 24);
  }
  outlinedText(ctx, 'MIME OVER MATTER', CONFIG.canvas.width / 2 + 90, 36, 26, '#fff', { stroke: 5 });
  outlinedText(ctx, `Panel ${game.panelIndex + 1} / ${PANELS.length}`, CONFIG.canvas.width - 30, 36, 26, '#ffd600', { align: 'right', stroke: 5 });
}

// A comic impact burst: a spiky yellow star with the word on it, popping in
// and fading out.
function drawBurst(ctx, b) {
  const life = b.t / CONFIG.burstTime;
  const scale = life < 0.25 ? 0.6 + life * 1.6 : 1;
  ctx.save();
  ctx.globalAlpha = life > 0.7 ? 1 - (life - 0.7) / 0.3 : 1;
  ctx.translate(b.x, b.y);
  ctx.scale(scale, scale);
  ctx.rotate(b.tilt);
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const r = i % 2 ? 18 : 32;
    const a = (i / 24) * Math.PI * 2;
    ctx.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffeb3b';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  outlinedText(ctx, b.text, 0, 1, 20, b.color, { stroke: 4 });
  ctx.restore();
}

// The thick ink line blocking the right edge until the panel is cleared.
function drawGate(ctx) {
  const x = CONFIG.panel.w - CONFIG.gateWidth / 2;
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = CONFIG.gateWidth * 0.75;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let y = 0; y <= CONFIG.groundY; y += 20) {
    ctx.lineTo(x + Math.sin(y * 0.05) * 2, y);
  }
  ctx.stroke();
  for (const [dy, r] of [[130, 5], [290, 4], [420, 6]]) {   // ink drips
    ctx.beginPath();
    ctx.arc(x - 9, dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// A bobbing arrow at the right edge once the way is open.
function drawExitArrow(ctx, time) {
  const x = CONFIG.panel.w - 90 + Math.sin(time * 6) * 8, y = CONFIG.groundY - 60;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x + 40, y - 12);
  ctx.lineTo(x + 40, y - 28);
  ctx.lineTo(x + 72, y);
  ctx.lineTo(x + 40, y + 28);
  ctx.lineTo(x + 40, y + 12);
  ctx.lineTo(x, y + 12);
  ctx.closePath();
  ctx.fillStyle = '#ffd600';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.restore();
}

// Game Over: a big red "CANCELLED!" stamp across the panel.
function drawGameOver(ctx) {
  const { w, h } = CONFIG.panel;
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, w, h);
  ctx.translate(w / 2, h / 2 - 30);
  ctx.rotate(-0.18);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#d50000';
  ctx.strokeRect(-260, -70, 520, 140);
  outlinedText(ctx, 'CANCELLED!', 0, 4, 96, '#d50000', { stroke: 0 });
  ctx.restore();
  outlinedText(ctx, 'Press R to try again', w / 2, h / 2 + 120, 34, '#fff', { stroke: 6 });
}

// The last panel: "THE END" across the panel.
function drawTheEnd(ctx) {
  const { w } = CONFIG.panel;
  outlinedText(ctx, 'THE END', w / 2, 190, 120, '#e53935', { stroke: 10 });
  outlinedText(ctx, 'Press R to play again', w / 2, 300, 32, '#fff', { stroke: 6 });
}
