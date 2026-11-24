// Hand-Drawn Goofy-Fish Paper Style Campus Renderer
// Renders BOTH:
//   1. Outdoor continuous campus street with 7 architectural buildings
//   2. 7 Cozy Hand-Drawn Indoor Room Scenes (Dorm Bed+Desk, Classroom Blackboard, AI Lab GPU+Monitors,
//      Library Bookshelves+Cat, Canteen Counter, Stadium Court, Mall Cafe+Boutique)

import { BUILDINGS, BUILDING_ORDER } from './data.js';

const WOBBLE = 1.45;
const INK = '#18181b';

function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function jLine(ctx, x1, y1, x2, y2, seed = 1, wob = WOBBLE) {
  const segs = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 38));
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const ox = (hash(seed + i * 13.7) - 0.5) * wob;
    const oy = (hash(seed + i * 29.3) - 0.5) * wob;
    ctx.lineTo(x1 + (x2 - x1) * t + ox, y1 + (y2 - y1) * t + oy);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function jRect(ctx, x, y, w, h, fill = '#ffffff', seed = 1, lw = 2.4) {
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  jLine(ctx, x, y, x + w, y, seed + 1);
  jLine(ctx, x + w, y, x + w, y + h, seed + 2);
  jLine(ctx, x + w, y + h, x, y + h, seed + 3);
  jLine(ctx, x, y + h, x, y, seed + 4);
}

function drawSign(ctx, cx, y, text, accent, lw = 2.2) {
  ctx.save();
  ctx.font = '700 13px "Noto Sans SC", sans-serif';
  const tw = ctx.measureText(text).width + 22;
  const x = cx - tw / 2;
  jRect(ctx, x, y - 24, tw, 24, '#ffffff', cx * 0.1, lw);
  ctx.fillStyle = accent;
  ctx.fillRect(x + 2, y - 22, 6, 20);
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx + 2, y - 12);
  ctx.restore();
}

function drawWindow(ctx, x, y, w, h, night, seed) {
  const fill = night ? '#fef08a' : '#f1f5f9';
  jRect(ctx, x, y, w, h, fill, seed, 1.8);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.2;
  jLine(ctx, x + w / 2, y, x + w / 2, y + h, seed + 11, 0.7);
  jLine(ctx, x, y + h / 2, x + w, y + h / 2, seed + 17, 0.7);
}

function drawTree(ctx, x, y, scale, seed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  jLine(ctx, 0, 0, 0, -56, seed + 1);
  jLine(ctx, 0, -34, -14, -50, seed + 2);
  jLine(ctx, 0, -38, 13, -52, seed + 3);

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -76, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-21, -64, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(21, -64, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawLamp(ctx, x, y, night, seed) {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  jLine(ctx, x, y, x, y - 92, seed);
  jLine(ctx, x, y - 92, x + 16, y - 92, seed + 3);
  if (night) {
    const grad = ctx.createRadialGradient(x + 16, y - 84, 2, x + 16, y - 84, 48);
    grad.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
    grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x + 16, y - 84, 48, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = night ? '#fde047' : '#fef9c3';
  ctx.beginPath();
  ctx.arc(x + 16, y - 86, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawCloud(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = 'rgba(24,24,27,0.22)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(-18, 0, 14, Math.PI * 0.85, Math.PI * 1.9);
  ctx.arc(0, -8, 18, Math.PI * 1.05, Math.PI * 1.95);
  ctx.arc(20, 0, 13, Math.PI * 1.15, Math.PI * 0.15);
  ctx.stroke();
  ctx.restore();
}

// ==================== 7 Hand-Drawn Outdoor Campus Buildings ====================
function drawDormBuilding(ctx, b, night) {
  const x = b.x - b.width / 2;
  const w = b.width;
  const h = 186;
  jRect(ctx, x, -h, w, h, '#ffffff', 10);

  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.moveTo(x - 12, -h);
  ctx.lineTo(b.x, -h - 38);
  ctx.lineTo(x + w + 12, -h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  drawSign(ctx, b.x, -h - 42, '梅园 402 宿舍', b.accent);

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      drawWindow(ctx, x + 22 + col * 72, -h + 22 + row * 56, 46, 36, night, 20 + row * 7 + col);
    }
  }

  // Balcony clothesline detail
  ctx.strokeStyle = '#78716c';
  ctx.lineWidth = 1.4;
  jLine(ctx, x + 20, -h + 64, x + 70, -h + 64, 33, 0.8);
  jRect(ctx, x + 32, -h + 64, 12, 13, '#fde68a', 34, 1.3);
  jRect(ctx, x + 49, -h + 64, 11, 11, '#bfdbfe', 35, 1.3);

  jRect(ctx, b.x - 24, -56, 48, 56, '#fde68a', 40, 2.2);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(b.x + 14, -28, 2.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawTeachingBuilding(ctx, b, night) {
  const x = b.x - b.width / 2;
  const w = b.width;
  const h = 198;
  jRect(ctx, x, -h, w, h, '#ffffff', 100);
  jRect(ctx, x - 8, -h - 14, w + 16, 14, '#dbeafe', 105, 2.4);

  // Clock gable
  jRect(ctx, b.x - 36, -h - 46, 72, 32, '#ffffff', 110, 2.2);
  ctx.beginPath();
  ctx.arc(b.x, -h - 30, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#eff6ff';
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  jLine(ctx, b.x, -h - 30, b.x, -h - 37, 112, 0.3);
  jLine(ctx, b.x, -h - 30, b.x + 6, -h - 30, 113, 0.3);

  drawSign(ctx, b.x, -h - 52, '逸夫教学楼 · AI课堂', b.accent);

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      drawWindow(ctx, x + 20 + col * 62, -h + 22 + row * 56, 46, 36, night, 120 + row * 10 + col);
    }
  }

  jRect(ctx, b.x - 34, -62, 68, 62, '#e0f2fe', 140, 2.3);
  jLine(ctx, b.x, -62, b.x, 0, 141, 0.6);
  jRect(ctx, b.x - 42, -8, 84, 8, '#f1f5f9', 142, 2);
}

function drawLabBuilding(ctx, b, night, clock) {
  const x = b.x - b.width / 2;
  const w = b.width;
  const h = 190;
  jRect(ctx, x, -h, w, h, '#ffffff', 160);
  jRect(ctx, x - 6, -h - 12, w + 12, 12, '#cffafe', 162, 2.4);

  // Rooftop antenna & AI signal waves
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  jLine(ctx, b.x + 76, -h - 12, b.x + 76, -h - 46, 164, 0.6);
  ctx.beginPath();
  ctx.arc(b.x + 76, -h - 49, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#06b6d4';
  ctx.fill();
  ctx.stroke();
  const pulse = 8 + Math.sin(clock * 4) * 3;
  ctx.strokeStyle = 'rgba(8,145,178,0.45)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(b.x + 76, -h - 49, pulse, -Math.PI * 0.85, -Math.PI * 0.15);
  ctx.stroke();

  drawSign(ctx, b.x - 8, -h - 20, 'AI 智能体实验室', b.accent);

  // Glass lab windows with GPU rack blinking lights inside
  for (let col = 0; col < 3; col++) {
    const wx = x + 18 + col * 80;
    jRect(ctx, wx, -h + 24, 64, 48, night ? '#ecfeff' : '#f0fdfa', 170 + col, 1.9);
    // Mini server rack lines
    for (let r = 0; r < 3; r++) {
      ctx.fillStyle = (Math.floor(clock * 3 + col + r) % 2 === 0) ? '#06b6d4' : '#22c55e';
      ctx.fillRect(wx + 10, -h + 33 + r * 12, 5, 5);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      jLine(ctx, wx + 20, -h + 35 + r * 12, wx + 54, -h + 35 + r * 12, 180 + r, 0.4);
    }
  }

  // Loop symbol badge on facade
  ctx.fillStyle = '#0e7490';
  ctx.font = '700 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SKILL ⇄ Agent Loop ↻', b.x, -h + 92);

  // Automatic glass lab entrance
  jRect(ctx, b.x - 32, -62, 64, 62, '#e0f2fe', 190, 2.2);
  jLine(ctx, b.x, -62, b.x, 0, 191, 0.6);
  jRect(ctx, b.x - 40, -8, 80, 8, '#f1f5f9', 192, 1.8);
}

function drawLibraryBuilding(ctx, b, night, clock) {
  const x = b.x - b.width / 2;
  const w = b.width;
  const h = 186;

  ctx.fillStyle = '#fef9c3';
  ctx.beginPath();
  ctx.arc(b.x, -h, 66, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  for (const dx of [-36, -14, 14, 36]) {
    jLine(ctx, b.x + dx, -h, b.x, -h - 66, 200 + dx, 0.8);
  }

  jRect(ctx, x, -h, w, h, '#ffffff', 210);
  drawSign(ctx, b.x, -h - 70, '中心图书馆', b.accent);

  for (let col = 0; col < 4; col++) {
    drawWindow(ctx, x + 22 + col * 58, -h + 28, 42, 62, night, 220 + col);
  }

  jRect(ctx, b.x - 28, -58, 56, 58, '#fef3c7', 235, 2.2);
  jRect(ctx, b.x - 44, -10, 88, 10, '#f8fafc', 236, 2);

  // Cute sleeping orange campus cat on steps
  const cx = x + 30;
  const cy = -8;
  ctx.save();
  ctx.fillStyle = '#fb923c';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 13, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - 10, cy - 5, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  const wag = Math.sin(clock * 2.5) * 4;
  jLine(ctx, cx + 11, cy - 2, cx + 22, cy - 10 + wag, 240, 0.5);
  ctx.restore();
}

function drawCanteenBuilding(ctx, b, night, clock) {
  const x = b.x - b.width / 2;
  const w = b.width;
  const h = 178;
  jRect(ctx, x, -h, w, h, '#ffffff', 260);

  // Warm striped dining awning
  const stripes = 6;
  const sw = (w + 16) / stripes;
  for (let i = 0; i < stripes; i++) {
    jRect(ctx, x - 8 + i * sw, -h - 18, sw, 18, i % 2 === 0 ? '#fed7aa' : '#ffffff', 265 + i, 2);
  }

  // Steaming noodle bowl icon above sign
  const steam = Math.sin(clock * 3.2) * 3;
  ctx.strokeStyle = 'rgba(234,88,12,0.55)';
  ctx.lineWidth = 1.8;
  jLine(ctx, b.x - 8, -h - 52, b.x - 8 + steam, -h - 66, 270, 0.6);
  jLine(ctx, b.x + 8, -h - 52, b.x + 8 - steam, -h - 66, 271, 0.6);

  drawSign(ctx, b.x, -h - 24, '紫荆园食堂', b.accent);

  for (let col = 0; col < 3; col++) {
    drawWindow(ctx, x + 20 + col * 74, -h + 22, 54, 46, night, 275 + col);
  }

  // Menu board next to entrance
  jRect(ctx, x + 22, -62, 42, 46, '#fff7ed', 280, 1.8);
  ctx.fillStyle = '#c2410c';
  ctx.font = '700 9px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('今日菜单', x + 43, -46);
  ctx.fillStyle = '#475569';
  ctx.fillText('鸡排/麻辣烫', x + 43, -30);

  jRect(ctx, b.x - 16, -62, 62, 62, '#ffedd5', 285, 2.2);
  jLine(ctx, b.x + 15, -62, b.x + 15, 0, 286, 0.6);
}

function drawStadiumBuilding(ctx, b, night, state) {
  const x = b.x - b.width / 2;
  const w = b.width;
  const h = 158;

  jRect(ctx, x, -h + 36, w, h - 36, '#fff1f2', 300, 2.2);
  for (let i = 1; i < 10; i++) {
    ctx.strokeStyle = 'rgba(24,24,27,0.22)';
    ctx.lineWidth = 1.2;
    jLine(ctx, x + (w / 10) * i, -h + 36, x + (w / 10) * i, 0, 300 + i, 0.6);
  }
  drawSign(ctx, b.x - 24, -h + 26, '南区体育场 · 2号球场', b.accent);

  jRect(ctx, x + 16, -h + 52, 92, 46, '#18181b', 315, 2.2);
  ctx.fillStyle = '#fbbf24';
  ctx.font = '700 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('AI学院  28:24', x + 62, -h + 79);

  // Hand-drawn basketball hoop
  const poleX = x + w - 26;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  jLine(ctx, poleX, 0, poleX, -158, 320, 0.9);
  jLine(ctx, poleX, -148, poleX - 28, -148, 321, 0.7);
  jRect(ctx, poleX - 36, -184, 12, 54, '#ffffff', 322, 2.4);
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 3.2;
  jLine(ctx, poleX - 36, -138, poleX - 66, -138, 323, 0.5);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.3;
  jLine(ctx, poleX - 64, -138, poleX - 58, -112, 324, 0.5);
  jLine(ctx, poleX - 38, -138, poleX - 44, -112, 325, 0.5);

  if (state.currentBuilding === 'stadium' && !state.isWalking) {
    const cycle = (state.clock * 0.85) % 1;
    const bx = (b.x - 10) + (poleX - 51 - (b.x - 10)) * cycle;
    const by = -95 - Math.sin(cycle * Math.PI) * 95 + cycle * -38;
    ctx.save();
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawMallBuilding(ctx, b, night) {
  const x = b.x - b.width / 2;
  const w = b.width;
  const h = 192;
  jRect(ctx, x, -h, w, h, '#ffffff', 400);
  jRect(ctx, x - 6, -h - 14, w + 12, 14, '#ede9fe', 402, 2.4);
  drawSign(ctx, b.x, -h - 20, '大学城购物中心', b.accent);

  const stripes = 7;
  const sw = (w - 20) / stripes;
  for (let i = 0; i < stripes; i++) {
    jRect(ctx, x + 10 + i * sw, -104, sw, 18, i % 2 === 0 ? '#ddd6fe' : '#ffffff', 410 + i, 1.8);
  }

  for (let col = 0; col < 3; col++) {
    drawWindow(ctx, x + 22 + col * 80, -h + 20, 62, 50, night, 420 + col);
  }

  jRect(ctx, x + 18, -74, 72, 74, '#f5f3ff', 430, 2);
  jRect(ctx, b.x - 28, -74, 56, 74, '#ede9fe', 431, 2.2);
  jRect(ctx, x + w - 90, -74, 72, 74, '#fef3c7', 432, 2);
  ctx.fillStyle = '#7c3aed';
  ctx.font = '700 11px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('☕ 奶茶吧', x + 54, -36);
  ctx.fillText('🛍 校园文创', x + w - 54, -36);
}

// ==================== 7 Detailed Hand-Drawn Indoor Room Scenes ====================
function drawIndoorShell(ctx, roomTitle, accent, night) {
  // Back wall + floor + baseboard + ceiling trim (centered around x = 0, floor at y = 0)
  const L = -340;
  const W = 680;
  const H = 290;

  // Cozy wall tint
  jRect(ctx, L, -H, W, H, night ? '#f8fafc' : '#fffdf9', 700, 2.8);

  // Subtle floor planks below Y = 0
  ctx.fillStyle = '#f8f4ec';
  ctx.fillRect(L - 120, 0, W + 240, 140);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;
  jLine(ctx, L - 120, 0, L + W + 120, 0, 705, 1.2);
  ctx.strokeStyle = 'rgba(24,24,27,0.14)';
  ctx.lineWidth = 1.4;
  for (let fy = 24; fy <= 96; fy += 24) {
    jLine(ctx, L - 120, fy, L + W + 120, fy, 710 + fy, 0.8);
  }

  // Baseboard
  jRect(ctx, L, -12, W, 12, '#f1f5f9', 720, 1.6);

  // Room plaque at top center
  drawSign(ctx, 0, -H + 34, roomTitle, accent, 2.1);
}

function drawIndoorWindow(ctx, x, y, w, h, night, clock) {
  const sky = night ? '#1e293b' : '#e0f2fe';
  jRect(ctx, x, y, w, h, sky, 730, 2.2);
  if (night) {
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(x + w - 24, y + 22, 8, 0, Math.PI * 2);
    ctx.fill();
    for (const [sx, sy] of [[20, 20], [44, 34], [30, 52]]) {
      ctx.fillRect(x + sx, y + sy, 2.5, 2.5);
    }
  } else {
    drawCloud(ctx, x + 36 + Math.sin(clock * 0.4) * 6, y + 32, 0.55);
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  jLine(ctx, x + w / 2, y, x + w / 2, y + h, 731, 0.6);
  jLine(ctx, x, y + h / 2, x + w, y + h / 2, 732, 0.6);
  // Curtain drapes
  jRect(ctx, x - 12, y - 4, 14, h + 12, '#fef3c7', 733, 1.6);
  jRect(ctx, x + w - 2, y - 4, 14, h + 12, '#fef3c7', 734, 1.6);
}

function drawIndoorDorm(ctx, night, clock) {
  drawIndoorShell(ctx, '🏠 梅园 402 宿舍 · 上床下桌', '#f59e0b', night);

  // Right sunny dorm window + curtains
  drawIndoorWindow(ctx, 145, -230, 125, 110, night, clock);

  // Left: Classic Chinese University Loft Bed + Study Desk (上床下桌!)
  const bx = -295;
  const bw = 205;
  // Loft metal frame posts
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;
  jLine(ctx, bx, 0, bx, -218, 801, 0.8);
  jLine(ctx, bx + bw, 0, bx + bw, -218, 802, 0.8);
  // Upper bunk platform
  jRect(ctx, bx, -148, bw, 12, '#e2e8f0', 803, 2.2);
  // Safety guardrail
  jRect(ctx, bx + 42, -174, bw - 46, 26, null, 804, 2);
  // Fluffy pillow & warm plaid quilt on upper bed
  jRect(ctx, bx + 10, -166, 36, 18, '#ffffff', 805, 1.8);
  jRect(ctx, bx + 48, -168, 144, 20, '#fde68a', 806, 2);
  // Cute teddy bear on bed
  ctx.fillStyle = '#d97706';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(bx + 28, -174, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Climbing ladder on right edge of loft bed
  jLine(ctx, bx + bw - 30, 0, bx + bw - 30, -148, 808, 0.6);
  jLine(ctx, bx + bw - 6, 0, bx + bw - 6, -148, 809, 0.6);
  for (let ly = -24; ly >= -124; ly -= 25) {
    jLine(ctx, bx + bw - 30, ly, bx + bw - 6, ly, 810 - ly, 0.5);
  }

  // Lower Study Desk under the bed (书桌 + 台灯 + 电脑 + 便利贴!)
  jRect(ctx, bx + 6, -74, bw - 42, 10, '#fef3c7', 815, 2.2);
  jRect(ctx, bx + 10, -64, 42, 64, '#fffbeb', 816, 2); // drawers
  jLine(ctx, bx + 16, -42, bx + 46, -42, 817, 0.4);
  jLine(ctx, bx + 16, -22, bx + 46, -22, 818, 0.4);

  // Laptop on desk
  jRect(ctx, bx + 70, -104, 48, 30, '#e0f2fe', 820, 1.9);
  jLine(ctx, bx + 64, -74, bx + 124, -74, 821, 0.4);
  // Warm desk lamp
  jLine(ctx, bx + 138, -74, bx + 144, -102, 822, 0.5);
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(bx + 132, -100);
  ctx.lineTo(bx + 154, -100);
  ctx.lineTo(bx + 148, -114);
  ctx.lineTo(bx + 138, -114);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Sticky notes on wall above desk
  jRect(ctx, bx + 20, -126, 22, 22, '#fef08a', 824, 1.3);
  jRect(ctx, bx + 46, -124, 20, 20, '#fbcfe8', 825, 1.3);
  // Desk chair
  jRect(ctx, bx + 78, -44, 34, 8, '#cbd5e1', 826, 1.8);
  jLine(ctx, bx + 95, -36, bx + 95, -4, 827, 0.5);

  // Right wardrobe + potted plant + cozy rug
  jRect(ctx, 210, -114, 78, 114, '#fffbeb', 830, 2.2);
  jLine(ctx, 249, -114, 249, 0, 831, 0.6);
  // Floor rug under Xiaoxia
  ctx.fillStyle = '#fef3c7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, 18, 96, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawIndoorTeaching(ctx, night, clock) {
  drawIndoorShell(ctx, '🏫 逸夫教学楼 302 · AI Agent 教室', '#2563eb', night);

  // Huge hand-drawn green classroom blackboard!
  jRect(ctx, -230, -232, 360, 128, '#14532d', 840, 3);
  jRect(ctx, -236, -104, 372, 10, '#d97706', 841, 2); // chalk ledge

  // Chalk diagram: Agentic Loop & SKILL
  ctx.fillStyle = '#fefce8';
  ctx.font = '700 13px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Ch.3 Agentic Loop & SKILL 架构', -212, -206);
  ctx.font = '600 11.5px monospace';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('[Observe] ──▶ [Think] ──▶ [Act: Call SKILL]', -212, -176);
  ctx.fillText('    ▲                           │', -212, -158);
  ctx.fillText('    └───── [Reflect / Eval] ◀───┘', -212, -140);
  ctx.fillStyle = '#fde68a';
  ctx.fillText('Stop: Done(State) || t >= MaxSteps', -212, -118);

  // Right classroom window
  drawIndoorWindow(ctx, 165, -226, 130, 112, night, clock);

  // Podium on left
  jRect(ctx, -290, -82, 54, 82, '#fef3c7', 845, 2.2);
  jRect(ctx, -296, -88, 66, 10, '#fde68a', 846, 2);

  // Student desks in foreground sides
  for (const dx of [-210, 115, 215]) {
    jRect(ctx, dx, -56, 76, 8, '#fef3c7', 850 + dx, 2);
    jLine(ctx, dx + 8, -48, dx + 8, 0, 851 + dx, 0.5);
    jLine(ctx, dx + 68, -48, dx + 68, 0, 852 + dx, 0.5);
  }
}

function drawIndoorLab(ctx, night, clock) {
  drawIndoorShell(ctx, '🧪 AI 智能体实验室 · GPU 与 Loop 工作站', '#0891b2', night);

  // Left: Dual-monitor AI workstation desk
  jRect(ctx, -296, -72, 192, 10, '#e2e8f0', 860, 2.2);
  jLine(ctx, -286, -62, -286, 0, 861, 0.6);
  jLine(ctx, -114, -62, -114, 0, 862, 0.6);

  // Monitor 1: Loss curve
  jRect(ctx, -286, -138, 82, 56, '#0f172a', 863, 2.2);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-278, -124);
  ctx.quadraticCurveTo(-252, -96, -212, -90);
  ctx.stroke();
  ctx.fillStyle = '#22d3ee';
  ctx.font = '700 9px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Eval: 98.4%', -278, -124);

  // Monitor 2: Agent Loop Terminal
  jRect(ctx, -196, -138, 82, 56, '#0f172a', 864, 2.2);
  ctx.fillStyle = '#4ade80';
  ctx.fillText('> SKILL loaded', -188, -122);
  ctx.fillStyle = '#facc15';
  ctx.fillText('> MCP.call()', -188, -108);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(Math.floor(clock * 2) % 2 === 0 ? '> Loop PASS _' : '> Loop PASS', -188, -94);

  // Center Glass Whiteboard
  jRect(ctx, -78, -228, 200, 104, '#f8fafc', 868, 2.4);
  ctx.fillStyle = '#0e7490';
  ctx.font = '700 12px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MCP × SKILL 实验白板', 22, -204);
  ctx.fillStyle = '#334155';
  ctx.font = '600 10.5px monospace';
  ctx.fillText('Host ⇄ MCP Server ⇄ Tools', 22, -176);
  ctx.fillText('Progressive Disclosure ✓', 22, -152);

  // Right: Tall GPU Compute Server Rack with blinking LEDs
  jRect(ctx, 165, -212, 118, 212, '#1e293b', 870, 2.6);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('H100 CLUSTER', 224, -194);
  for (let row = 0; row < 6; row++) {
    const ry = -176 + row * 26;
    jRect(ctx, 177, ry, 94, 18, '#0f172a', 872 + row, 1.5);
    for (let led = 0; led < 4; led++) {
      const on = (Math.floor(clock * 4 + row + led) % 3) !== 0;
      ctx.fillStyle = led === 0 ? '#38bdf8' : (on ? '#22c55e' : '#334155');
      ctx.fillRect(184 + led * 10, ry + 6, 5, 5);
    }
  }
}

function drawIndoorLibrary(ctx, night, clock) {
  drawIndoorShell(ctx, '📚 中心图书馆三楼 · 落地窗自习区', '#0d9488', night);

  // Left & Right floor-to-ceiling hand-drawn bookshelves
  const bookColors = ['#fca5a5', '#93c5fd', '#fcd34d', '#86efac', '#c4b5fd', '#fdba74'];
  for (const sx of [-310, 180]) {
    jRect(ctx, sx, -234, 130, 234, '#fef3c7', 880 + sx, 2.4);
    for (let shelf = 0; shelf < 4; shelf++) {
      const sy = -182 + shelf * 46;
      jLine(ctx, sx, sy, sx + 130, sy, 885 + shelf, 0.7);
      for (let b = 0; b < 7; b++) {
        const col = bookColors[(shelf * 3 + b) % bookColors.length];
        jRect(ctx, sx + 8 + b * 16, sy - 32, 13, 32, col, 890 + shelf * 10 + b, 1.4);
      }
    }
  }

  // Center tall arched window
  const wx = -125;
  const ww = 250;
  ctx.fillStyle = night ? '#1e293b' : '#e0f2fe';
  ctx.beginPath();
  ctx.arc(0, -155, 84, Math.PI, 0);
  ctx.lineTo(84, -92);
  ctx.lineTo(-84, -92);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  jLine(ctx, 0, -239, 0, -92, 896, 0.5);
  jLine(ctx, -84, -155, 84, -155, 897, 0.5);

  // Sleeping orange cat on library windowsill!
  const cx = 42;
  const cy = -98;
  ctx.fillStyle = '#fb923c';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 15, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - 12, cy - 6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  jLine(ctx, cx + 13, cy - 2, cx + 25, cy - 11 + Math.sin(clock * 2.5) * 4, 898, 0.5);

  // Study table with vintage green banker lamp on left side
  jRect(ctx, -165, -56, 98, 10, '#fde68a', 899, 2);
  jLine(ctx, -155, -46, -155, 0, 900, 0.5);
  jLine(ctx, -78, -46, -78, 0, 901, 0.5);
  jRect(ctx, -152, -76, 22, 10, '#10b981', 902, 1.6);
  jLine(ctx, -141, -66, -141, -56, 903, 0.4);
}

function drawIndoorCanteen(ctx, night, clock) {
  drawIndoorShell(ctx, '🍜 紫荆园食堂二楼 · 烟火干饭大厅', '#ea580c', night);

  // Serving counter with glass sneeze guard & warm menu signs
  jRect(ctx, -295, -184, 360, 86, '#fff7ed', 910, 2.4);
  jRect(ctx, -295, -98, 360, 98, '#fed7aa', 911, 2.4);
  // Hanging menu cards
  const menus = ['🍛 鸡排饭 ¥16', '🍲 麻辣烫 ¥18', '🍜 牛肉面 ¥14'];
  menus.forEach((m, i) => {
    jRect(ctx, -280 + i * 114, -228, 102, 34, '#ffedd5', 915 + i, 2);
    ctx.fillStyle = '#9a3412';
    ctx.font = '700 11px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m, -229 + i * 114, -207);
  });
  // Stainless steel food trays behind glass
  for (let t = 0; t < 4; t++) {
    jRect(ctx, -276 + t * 84, -124, 66, 22, '#e2e8f0', 920 + t, 1.8);
  }

  // Right dining table with steaming noodle bowl!
  jRect(ctx, 130, -58, 145, 10, '#fef3c7', 930, 2.2);
  jLine(ctx, 146, -48, 146, 0, 931, 0.5);
  jLine(ctx, 258, -48, 258, 0, 932, 0.5);

  // Steaming bowl
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(202, -70, 18, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const s = Math.sin(clock * 3.5) * 3;
  ctx.strokeStyle = 'rgba(234,88,12,0.6)';
  ctx.lineWidth = 1.6;
  jLine(ctx, 196, -78, 196 + s, -98, 933, 0.6);
  jLine(ctx, 208, -78, 208 - s, -98, 934, 0.6);
}

function drawIndoorStadium(ctx, night, clock) {
  drawIndoorShell(ctx, '🏀 南区体育场 · 2号阳光球场', '#e11d48', night);

  // Big scoreboard on left
  jRect(ctx, -275, -215, 145, 76, '#18181b', 940, 2.6);
  ctx.fillStyle = '#fbbf24';
  ctx.font = '700 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('AI学院 32 : 26', -202, -172);
  ctx.fillStyle = '#f87171';
  ctx.font = '700 10px monospace';
  ctx.fillText('Q4 · 02:18', -202, -150);

  // Bench + water bottle
  jRect(ctx, -275, -42, 128, 10, '#fde68a', 942, 2);
  jLine(ctx, -262, -32, -262, 0, 943, 0.5);
  jLine(ctx, -160, -32, -160, 0, 944, 0.5);
  jRect(ctx, -238, -64, 12, 22, '#38bdf8', 945, 1.6);

  // Magnified hand-drawn hoop on right
  const px = 250;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.5;
  jLine(ctx, px, 0, px, -200, 950, 0.8);
  jLine(ctx, px, -188, px - 36, -188, 951, 0.6);
  jRect(ctx, px - 46, -228, 14, 68, '#ffffff', 952, 2.6);
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 3.8;
  jLine(ctx, px - 46, -174, px - 86, -174, 953, 0.5);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  jLine(ctx, px - 84, -174, px - 74, -140, 954, 0.5);
  jLine(ctx, px - 48, -174, px - 58, -140, 955, 0.5);

  // Animated basketball arc into hoop!
  const cycle = (clock * 0.78) % 1;
  const bx = 26 + (px - 66 - 26) * cycle;
  const by = -98 - Math.sin(cycle * Math.PI) * 115 + cycle * -65;
  ctx.fillStyle = '#f97316';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(bx, by, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawIndoorMall(ctx, night) {
  drawIndoorShell(ctx, '🛍 大学城购物中心 · 奶茶与文创中庭', '#7c3aed', night);

  // Left: Milk-tea & Coffee bar
  jRect(ctx, -292, -88, 178, 88, '#f5f3ff', 960, 2.4);
  jRect(ctx, -298, -98, 190, 12, '#ddd6fe', 961, 2.2);
  jRect(ctx, -276, -214, 146, 52, '#fef3c7', 962, 2.2);
  ctx.fillStyle = '#6d28d9';
  ctx.font = '700 12px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('☕ 校园手冲 & 奶茶吧', -203, -184);

  // Right: Boutique stationery & lifestyle showcase
  jRect(ctx, 130, -212, 165, 212, '#faf5ff', 965, 2.4);
  for (let row = 0; row < 3; row++) {
    const sy = -152 + row * 52;
    jLine(ctx, 138, sy, 287, sy, 968 + row, 0.6);
    jRect(ctx, 152, sy - 26, 26, 26, '#fde68a', 971 + row, 1.5);
    jRect(ctx, 194, sy - 22, 30, 22, '#bfdbfe', 974 + row, 1.5);
    jRect(ctx, 240, sy - 28, 24, 28, '#fbcfe8', 977 + row, 1.5);
  }
}

function drawIndoorRoom(ctx, bldgId, night, clock) {
  switch (bldgId) {
    case 'dorm': drawIndoorDorm(ctx, night, clock); break;
    case 'teaching': drawIndoorTeaching(ctx, night, clock); break;
    case 'lab': drawIndoorLab(ctx, night, clock); break;
    case 'library': drawIndoorLibrary(ctx, night, clock); break;
    case 'canteen': drawIndoorCanteen(ctx, night, clock); break;
    case 'stadium': drawIndoorStadium(ctx, night, clock); break;
    case 'mall': drawIndoorMall(ctx, night); break;
    default: drawIndoorDorm(ctx, night, clock);
  }
}

// ==================== Main Canvas Draw Entrypoints ====================
export function drawCampusBackground(ctx, cw, ch, dpr, cam, state) {
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cw, ch);

  const night = state.minutes >= 1340 || state.minutes < 380;

  ctx.save();
  ctx.translate(cam.x, cam.y);
  ctx.scale(cam.s, cam.s);

  if (state.sceneMode === 'indoor') {
    drawIndoorRoom(ctx, state.currentBuilding, night, state.clock);
    ctx.restore();
    ctx.restore();
    return;
  }

  // Outdoor: Drifting hand-drawn clouds
  for (let i = 0; i < 8; i++) {
    const cx = ((i * 540 + state.clock * 8) % 4200) - 180;
    const cy = -285 - (i % 3) * 32;
    drawCloud(ctx, cx, cy, 0.85 + (i % 2) * 0.25);
  }

  // Campus trees & streetlamps between all 7 buildings
  const treeXs = [50, 510, 1050, 1590, 2130, 2670, 3210, 3760];
  treeXs.forEach((tx, idx) => {
    drawTree(ctx, tx, 0, 0.92 + (idx % 2) * 0.14, idx * 17 + 3);
    drawLamp(ctx, tx + 62, 0, night, idx * 23 + 9);
  });

  // 7 Architectural Campus Landmarks
  drawDormBuilding(ctx, BUILDINGS.dorm, night);
  drawTeachingBuilding(ctx, BUILDINGS.teaching, night);
  drawLabBuilding(ctx, BUILDINGS.lab, night, state.clock);
  drawLibraryBuilding(ctx, BUILDINGS.library, night, state.clock);
  drawCanteenBuilding(ctx, BUILDINGS.canteen, night, state.clock);
  drawStadiumBuilding(ctx, BUILDINGS.stadium, night, state);
  drawMallBuilding(ctx, BUILDINGS.mall, night);

  // Continuous hand-drawn sidewalk & dashed path line
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;
  jLine(ctx, -300, 0, 4100, 0, 900, 1.6);

  ctx.strokeStyle = 'rgba(24,24,27,0.16)';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([16, 14]);
  ctx.beginPath();
  ctx.moveTo(-300, 26);
  ctx.lineTo(4100, 26);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
  ctx.restore();
}

export function drawCampusForeground(ctx, cw, ch, dpr, cam, state) {
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cw, ch);

  if (state.sceneMode === 'outdoor' && state.isWalking) {
    const dest = BUILDINGS[state.targetBuilding];
    if (dest) {
      const sx = cam.x + dest.x * cam.s;
      const sy = cam.y + 18 * cam.s;
      ctx.save();
      ctx.fillStyle = dest.accent;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, 6 + Math.sin(state.clock * 6) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

// Hit-test clickable campus buildings in outdoor world coordinates
export function hitTestBuilding(clientX, clientY, rect, cam, state) {
  if (state && state.sceneMode === 'indoor') return null;
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  const wx = (sx - cam.x) / cam.s;
  const wy = (sy - cam.y) / cam.s;

  for (const id of BUILDING_ORDER) {
    const b = BUILDINGS[id];
    if (wx >= b.x - b.width / 2 - 12 && wx <= b.x + b.width / 2 + 12 && wy >= -b.height - 50 && wy <= 24) {
      return id;
    }
  }
  return null;
}
