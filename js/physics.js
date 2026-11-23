// Core Physics, IK Stick-Figure Animation, and Court Geometry
// Faithful remake of Goofy Fish Ten Balls (/hoops) with persona accessories

export const G = 1017;
export const BR = 8.3;
export const AX = 188;
export const ROUND = 10;
export const SHOT_ANGLE = (55 * Math.PI) / 180;
export const V_MIN = 380;
export const V_MAX = 780;

export const COL = {
  bg: '#ffffff',
  ink: '#141414',
  fig: '#141414',
  back: '#8d8d8d',
  ball: '#ffffff',
  muted: '#737373',
  faint: '#d4d4d4',
  accent: '#b45309',
  dot: 'rgba(31,41,55,0.13)',
};

export const PAL = {
  street: '#f2f2f2',
  floor: '#fafafa',
  concrete: '#ffffff',
  sage: '#ffffff',
  cream: '#ffffff',
  metal: '#ffffff',
  wood: '#ffffff',
  ball: '#ffffff',
  ballD: '#e8e8e8',
  rim: '#141414',
  net: '#141414',
  shoe: '#ffffff',
};

export const RIM_Y = -221.1;
export const RIM_FRONT = [469.2, RIM_Y];
export const RIM_BACK = [505.5, RIM_Y];
export const NET_BOTTOM = -192.6;
export const BOARD = { x0: 510, x1: 518, y0: -281.6, y1: -208.6 };
export const POLE = { x0: 571, x1: 577, y0: -271.6, y1: 0 };
export const SEGS = [
  [518, -262, 572, -262, 1.2],
  [518, -234.2, 572, -234.2, 1.2],
  [530, -235.5, 569, -259, 1],
  [42, -55.1, 148, -46.6, 1.5],
  [46.9, -54, 46.9, 0, 1],
  [142, -47, 142, 0, 1],
  [565, -0.5, 582, -0.5, 2],
];

export const RACK = { x0: 42, y0: -55.1, x1: 148, y1: -46.6 };

export function rackSlot(s) {
  const x = 57 + 20 * s;
  const m = (RACK.y1 - RACK.y0) / (RACK.x1 - RACK.x0);
  return [x, RACK.y0 + m * (x - RACK.x0) - 9.6];
}

export const THIGH = 30;
export const SHIN = 30;
export const UARM = 21;
export const FARM = 21;

const BASE = {
  face: 1,
  flick: 0,
  head: [0, -121],
  chest: [0, -96],
  hip: [0, -65],
  fF: [1, -8],
  fB: [-4, -8],
  kF: [22, -38],
  kB: [10, -38],
  hF: [3, -57],
  hB: [-1, -57],
  eF: [-6, -78],
  eB: [-6, -78],
  ball: null,
};

const mk = (o, base = BASE) => Object.assign({}, base, o);

export const P = {
  stand: mk({ head: [0, -122], hF: [4, -55], hB: [-1, -55], eF: [-2, -76], eB: [-1, -76] }),
  hold: mk({ head: [1, -121], hip: [-1, -66], hF: [14, -83], hB: [24, -99], eF: [2, -70], eB: [8, -72], ball: [21.5, -88.5], hang: 0 }),
  crouch: mk({ head: [7, -108], chest: [4, -85], hip: [-4, -55], kF: [26, -28], kB: [22, -28], hF: [15, -73], hB: [24, -84], eF: [4, -60], eB: [10, -62], ball: [22, -78], hang: 0 }),
  rise: mk({ head: [-1, -119], chest: [0, -95], hip: [0, -64], hF: [11, -106], hB: [17, -114], eF: [16, -86], eB: [20, -88], ball: [16, -114] }),
  set: mk({ head: [-3, -123], chest: [-1, -99], hip: [0, -68], fF: [3, -9], fB: [-2, -9], hF: [15, -134], hB: [21, -136], eF: [18, -114], eB: [24, -114], ball: [21.7, -143.3] }),
  follow: mk({ head: [-3, -123], chest: [-1, -99], hip: [0, -68], hF: [20, -137], eF: [14, -118], hB: [14, -124], eB: [22, -104], flick: 1 }),
  drop: mk({ head: [1, -122], chest: [0, -97], hip: [0, -66], hF: [32, -80], hB: [26, -74], eF: [16, -80], eB: [12, -78] }),
  bend: mk({ face: -1, head: [-28, -104], chest: [-14, -88], hip: [8, -60], kF: [-16, -38], kB: [-12, -38], fF: [-3, -8], fB: [2, -8], hF: [-45, -58], hB: [-54, -61], eF: [-30, -80], eB: [-34, -82], ball: [-51, -57] }),
  turn: mk({ face: 0, head: [0, -123.5], chest: [0, -98.5], hip: [0, -68.6], fF: [3, -8], fB: [-3, -8], kF: [3, -38], kB: [-3, -38], hF: [9, -55], hB: [-9, -55], eF: [9, -76], eB: [-9, -76] }),
  cheer: mk({ head: [0, -122], chest: [0, -97], hip: [0, -67], hF: [16, -136], hB: [6, -138], eF: [14, -118], eB: [2, -118] }),
};
P.turnHold = mk({ hF: [8, -66], hB: [-6, -66], eF: [12, -82], eB: [-10, -82], ball: [1, -70], hang: 0 }, P.turn);

const PTS = ['head', 'chest', 'hip', 'fF', 'fB', 'kF', 'kB', 'hF', 'hB', 'eF', 'eB'];

export const lerp = (a, b, k) => a + (b - a) * k;
export const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

export function ballPos(p) {
  if (p.ball) return p.ball;
  return [(p.hF[0] + p.hB[0]) / 2 + 3 * p.face, (p.hF[1] + p.hB[1]) / 2 - 6];
}

export function lerpPose(a, b, k) {
  const o = { face: lerp(a.face, b.face, k), flick: lerp(a.flick, b.flick, k), hang: lerp(a.hang ?? 1, b.hang ?? 1, k) };
  for (const n of PTS) {
    o[n] = lerp2(a[n], b[n], k);
  }
  o.ball = lerp2(ballPos(a), ballPos(b), k);
  return o;
}

export const EASE = {
  io: (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
  in: (k) => k * k,
  out: (k) => 1 - (1 - k) * (1 - k),
  lin: (k) => k,
  soft: (k) => 0.5 - Math.cos(Math.PI * k) / 2,
};

function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

export function pathPose(list, u) {
  const n = list.length - 1;
  const x = Math.min(n - 1e-6, Math.max(0, u * n));
  const i = Math.floor(x);
  const t = x - i;
  const a = list[Math.max(0, i - 1)];
  const b = list[i];
  const c = list[i + 1];
  const d = list[Math.min(n, i + 2)];
  const o = { face: lerp(b.face, c.face, t), flick: lerp(b.flick, c.flick, t), hang: lerp(b.hang ?? 1, c.hang ?? 1, t) };
  for (const k of PTS) {
    o[k] = [catmull(a[k][0], b[k][0], c[k][0], d[k][0], t), catmull(a[k][1], b[k][1], c[k][1], d[k][1], t)];
  }
  const ba = ballPos(a), bb = ballPos(b), bc = ballPos(c), bd = ballPos(d);
  o.ball = [catmull(ba[0], bb[0], bc[0], bd[0], t), catmull(ba[1], bb[1], bc[1], bd[1], t)];
  return o;
}

export class Actor {
  constructor() {
    this.pose = P.hold;
    this.q = [];
    this.step = null;
    this.t = 0;
    this.hasBall = true;
    this.ballRot = 0.6;
    this.breath = 0;
    this.chargeFrom = null;
  }
  push(...steps) {
    this.q.push(...steps);
  }
  clear() {
    this.q = [];
    this.step = null;
  }
  get idle() {
    return !this.step && !this.q.length;
  }
  update(dt) {
    for (let guard = 0; guard < 20; guard++) {
      if (!this.step) {
        if (!this.q.length) return;
        this.step = this.q.shift();
        this.t = 0;
        if (this.step.fn) {
          const fn = this.step.fn;
          this.step = null;
          fn();
          continue;
        }
        const targets = this.step.path || (this.step.pose ? [this.step.pose] : [this.pose]);
        this.step.list = [this.pose, ...targets];
      }
      this.t += dt;
      const s = this.step;
      const k = Math.min(1, this.t / s.d);
      this.pose = pathPose(s.list, (EASE[s.ez] || EASE.soft)(k));
      if (k < 1) return;
      dt = this.t - s.d;
      this.step = null;
    }
  }
}

const ARM_BEND = -1;
const KNEE_BEND = 1;

export function ik(a, b, l1, l2, hint, bend) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  let d = Math.hypot(dx, dy);
  const base = Math.atan2(dy, dx);
  const L = l1 + l2;
  const soft = L * 0.96;
  if (d > soft) {
    d = soft + (L - soft) * (1 - Math.exp(-(d - soft) / (L - soft)));
  }
  d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(L - 0.001, d));
  const c = Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const ang = Math.acos(c);
  const j1 = [a[0] + l1 * Math.cos(base + ang), a[1] + l1 * Math.sin(base + ang)];
  const j2 = [a[0] + l1 * Math.cos(base - ang), a[1] + l1 * Math.sin(base - ang)];
  if (bend) {
    const side = (j) => (j[0] - a[0]) * (b[1] - j[1]) - (j[1] - a[1]) * (b[0] - j[0]);
    return Math.sign(side(j1)) === bend ? j1 : j2;
  }
  const d1 = Math.hypot(j1[0] - hint[0], j1[1] - hint[1]);
  const d2 = Math.hypot(j2[0] - hint[0], j2[1] - hint[1]);
  return d1 < d2 ? j1 : j2;
}

export function newBall(x, y, vx, vy, w) {
  return {
    x,
    y,
    vx,
    vy,
    rot: Math.random() * 6.28,
    w: w || 0,
    scored: false,
    touched: false,
    resolved: false,
    still: 0,
    alpha: 1,
    fading: false,
  };
}

function hitPoint(b, cx, cy, rad, e, fr, ev) {
  const dx = b.x - cx, dy = b.y - cy;
  const d = Math.hypot(dx, dy);
  const m = BR + rad;
  if (d >= m || d === 0) return false;
  const nx = dx / d, ny = dy / d;
  b.x = cx + nx * m;
  b.y = cy + ny * m;
  const vn = b.vx * nx + b.vy * ny;
  if (vn >= 0) return true;
  const tx = -ny, ty = nx;
  const vt = b.vx * tx + b.vy * ty;
  b.vx += -(1 + e) * vn * nx - tx * vt * fr;
  b.vy += -(1 + e) * vn * ny - ty * vt * fr;
  b.w = lerp(b.w, vt / BR, 0.5);
  if (ev) ev(-vn);
  return true;
}

function closestSeg(px, py, x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0;
  let t = ((px - x0) * dx + (py - y0) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  return [x0 + dx * t, y0 + dy * t];
}

function hitRect(b, r, e, fr, ev) {
  const cx = Math.max(r.x0, Math.min(r.x1, b.x));
  const cy = Math.max(r.y0, Math.min(r.y1, b.y));
  if (cx === b.x && cy === b.y) {
    const opts = [
      [b.x - r.x0, r.x0 - BR, b.y],
      [r.x1 - b.x, r.x1 + BR, b.y],
      [b.y - r.y0, b.x, r.y0 - BR],
      [r.y1 - b.y, b.x, r.y1 + BR],
    ];
    opts.sort((p, q) => p[0] - q[0]);
    b.x = opts[0][1];
    b.y = opts[0][2];
    return true;
  }
  return hitPoint(b, cx, cy, 0, e, fr, ev);
}

function netSides(y) {
  const k = (y - RIM_Y) / (NET_BOTTOM - RIM_Y);
  return [lerp(471, 477, k), lerp(503, 497, k)];
}

export function stepBalls(balls, dt, sfx) {
  for (const b of balls) {
    const py = b.y;
    b.vy += G * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.rot += b.w * dt;

    if (!b.scored && py < RIM_Y && b.y >= RIM_Y && b.vy > 0 && b.x > RIM_FRONT[0] + 1 && b.x < RIM_BACK[0] - 1) {
      b.scored = true;
      sfx('score', b);
    }
    if (b.scored && b.y > RIM_Y && b.y < NET_BOTTOM + BR) {
      const [l, r] = netSides(Math.min(b.y, NET_BOTTOM));
      const lo = l + BR * 0.55;
      const hi = r - BR * 0.55;
      if (b.x < lo) {
        b.x = lo;
        b.vx = Math.abs(b.vx) * 0.3;
      }
      if (b.x > hi) {
        b.x = hi;
        b.vx = -Math.abs(b.vx) * 0.3;
      }
      b.vy *= 1 - 2.2 * dt;
      b.vx *= 1 - 3 * dt;
    }

    const rim = (v) => sfx('rim', b, v);
    const wood = (v) => sfx('board', b, v);
    const pole = (v) => sfx('pole', b, v);

    if (!b.scored || b.y < RIM_Y - 2) {
      hitPoint(b, RIM_FRONT[0], RIM_FRONT[1], 1.4, 0.55, 0.04, rim);
      hitPoint(b, RIM_BACK[0], RIM_BACK[1], 1.4, 0.55, 0.04, rim);
    }
    hitRect(b, BOARD, 0.6, 0.05, wood);
    hitRect(b, POLE, 0.08, 0.05, pole);
    for (const s of SEGS) {
      const c = closestSeg(b.x, b.y, s[0], s[1], s[2], s[3]);
      hitPoint(b, c[0], c[1], s[4], 0.45, 0.05, pole);
    }

    if (b.y > -BR) {
      b.y = -BR;
      if (b.vy > 70) {
        sfx('floor', b, b.vy);
        b.vy = -b.vy * 0.68;
        b.vx *= 0.92;
      } else {
        b.vy = 0;
      }
    }
    if (b.y >= -BR - 0.01 && Math.abs(b.vy) < 1) {
      const dec = 70 * dt;
      b.vx = Math.abs(b.vx) <= dec ? 0 : b.vx - Math.sign(b.vx) * dec;
      b.w = b.vx / BR;
    }
  }

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i], c = balls[j];
      const dx = c.x - a.x, dy = c.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d >= 2 * BR) continue;
      const grounded = a.y > -BR - 3 && c.y > -BR - 3;
      let nx, ny, ov;
      if (grounded) {
        nx = dx >= 0 ? 1 : -1;
        ny = 0;
        ov = (2 * BR - Math.abs(dx)) / 2;
        if (ov <= 0) continue;
      } else {
        if (d === 0) continue;
        nx = dx / d;
        ny = dy / d;
        ov = (2 * BR - d) / 2;
        if (Math.abs(ny) > 0.8) {
          const top = c.y < a.y ? c : a;
          const low = top === c ? a : c;
          const side = top.x >= low.x ? 1 : -1;
          top.vx += side * 900 * dt;
        }
      }
      a.x -= nx * ov;
      a.y -= ny * ov;
      c.x += nx * ov;
      c.y += ny * ov;
      const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
      if (rv < 0) {
        const imp = (-(1 + 0.4) * rv) / 2;
        a.vx -= imp * nx;
        a.vy -= imp * ny;
        c.vx += imp * nx;
        c.vy += imp * ny;
      }
    }
  }
}

// Drawing helpers (accept ctx so both main canvas & share card canvas can reuse them)
const WOBBLE = Array.from({ length: 512 }, (_, i) => Math.sin(i * 0.37) * 0.35 + Math.sin(i * 1.71 + 1) * 0.22);

function line(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

export function drawGround(ctx, xl, xr) {
  ctx.fillStyle = PAL.floor;
  ctx.fillRect(xl, 0, xr - xl, 600);
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const x0 = Math.floor(xl / 6) * 6;
  for (let x = x0; x <= xr + 6; x += 6) {
    const w = WOBBLE[((x / 6) % 512 + 512) % 512];
    if (x === x0) ctx.moveTo(x, w);
    else ctx.lineTo(x, w);
  }
  ctx.stroke();
}

export function contactShadow(ctx, x, w, a) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${a})`;
  ctx.beginPath();
  ctx.ellipse(x, 1.2, w, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function inkShape(ctx, fill, lw) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lw || 1.5;
  ctx.strokeStyle = COL.ink;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function inkBar(ctx, x0, y0, x1, y1, w, fill) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = w + 3;
  line(ctx, x0, y0, x1, y1);
  ctx.strokeStyle = fill;
  ctx.lineWidth = w;
  line(ctx, x0, y0, x1, y1);
}

export function drawStatic(ctx) {
  ctx.beginPath();
  ctx.moveTo(562, 0.5);
  ctx.lineTo(563.5, -9);
  ctx.lineTo(585, -9.5);
  ctx.lineTo(586.5, 0.5);
  ctx.closePath();
  inkShape(ctx, PAL.concrete, 1.5);
  ctx.strokeStyle = 'rgba(20,20,20,0.35)';
  ctx.lineWidth = 0.8;
  for (const x of [567, 571, 575, 579, 583]) {
    line(ctx, x, -2, x + 2.5, -6.5);
  }
  ctx.beginPath();
  ctx.rect(571, -272, 6, 263);
  inkShape(ctx, PAL.sage, 1.5);
  inkBar(ctx, 519, -262, 573, -262, 2.6, PAL.sage);
  inkBar(ctx, 519, -234.2, 573, -234.2, 2.6, PAL.sage);
  inkBar(ctx, 531, -236, 570, -259.5, 2, PAL.sage);
  ctx.beginPath();
  ctx.moveTo(507, -284);
  ctx.lineTo(521, -281);
  ctx.lineTo(521, -206);
  ctx.lineTo(507, -209);
  ctx.closePath();
  inkShape(ctx, PAL.cream, 1.6);
  ctx.beginPath();
  ctx.moveTo(510.5, -246);
  ctx.lineTo(517.5, -244.5);
  ctx.lineTo(517.5, -224);
  ctx.lineTo(510.5, -225.5);
  ctx.closePath();
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = COL.ink;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(519, -281.4);
  ctx.lineTo(521, -281);
  ctx.lineTo(521, -206);
  ctx.lineTo(519, -206.4);
  ctx.closePath();
  ctx.fillStyle = 'rgba(20,20,20,0.18)';
  ctx.fill();
}

export function drawBall(ctx, x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(0, 0, BR + 0.7, 0, Math.PI * 2);
  ctx.fillStyle = COL.ink;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, BR - 0.6, 0, Math.PI * 2);
  ctx.fillStyle = PAL.ball;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = PAL.ballD;
  ctx.beginPath();
  ctx.arc(2.2, 2.6, BR, 0, Math.PI * 2);
  ctx.arc(-1.2, -1.4, BR - 0.4, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.rotate(rot);
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 1.05;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -BR);
  ctx.lineTo(0, BR);
  ctx.moveTo(-BR, 0.3);
  ctx.lineTo(BR, 0.3);
  ctx.moveTo(-BR * 0.62, -BR);
  ctx.quadraticCurveTo(-1.6, 0, -BR * 0.62, BR);
  ctx.moveTo(BR * 0.62, -BR);
  ctx.quadraticCurveTo(1.6, 0, BR * 0.62, BR);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

export function drawRack(ctx, rackItems) {
  const legs = [[48, -54.5], [140, -47]];
  ctx.lineCap = 'round';
  for (const [x, y] of legs) {
    inkBar(ctx, x, y, x, -8, 2.4, PAL.metal);
  }
  inkBar(ctx, 48, -16, 140, -16, 2, PAL.metal);
  for (const [x] of legs) {
    ctx.beginPath();
    ctx.arc(x, -4.2, 4, 0, Math.PI * 2);
    inkShape(ctx, PAL.shoe, 1.4);
    ctx.beginPath();
    ctx.arc(x, -4.2, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = COL.ink;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(41, RACK.y0 - 2.2);
  ctx.lineTo(149, RACK.y1 - 2.2);
  ctx.lineTo(149, RACK.y1 + 2.6);
  ctx.lineTo(41, RACK.y0 + 2.6);
  ctx.closePath();
  inkShape(ctx, PAL.wood, 1.4);
  ctx.strokeStyle = 'rgba(20,20,20,0.3)';
  ctx.lineWidth = 0.7;
  line(ctx, 60, RACK.y0 + 3, 92, RACK.y0 + 5.6);
  line(ctx, 104, RACK.y1 - 2.8, 132, RACK.y1 + 0.6);
  for (const it of rackItems) {
    const p = rackSlot(it.s);
    ctx.globalAlpha = it.a;
    drawBall(ctx, p[0], p[1], it.rot + (it.s * 20) / BR * 0.6);
    ctx.globalAlpha = 1;
  }
}

export function drawHoop(ctx, n) {
  const s = n.swish;
  const wob = Math.sin(n.t * 26) * s;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const levels = 5;
  const rows = [];
  for (let j = 0; j < levels; j++) {
    const k = j / (levels - 1);
    const y = RIM_Y + 2.5 + k * 26 * (1 + 0.28 * s * Math.sin(k * 3));
    const hw = lerp(16, 10, k) * (1 + 0.12 * wob * k);
    const cx = 487 + 1.5 * wob * k;
    const pts = [];
    const div = 6;
    const odd = j % 2 === 1;
    if (odd) {
      pts.push([cx - hw, y]);
      for (let i = 0; i < div; i++) {
        pts.push([cx - hw + (2 * hw * (i + 0.5)) / div, y]);
      }
      pts.push([cx + hw, y]);
    } else {
      for (let i = 0; i <= div; i++) {
        pts.push([cx - hw + (2 * hw * i) / div, y]);
      }
    }
    rows.push({ pts, odd, y, hw, cx });
  }
  ctx.strokeStyle = PAL.net;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  for (let j = 0; j < levels - 1; j++) {
    const A = rows[j], B = rows[j + 1];
    if (!A.odd) {
      for (let i = 0; i < A.pts.length; i++) {
        const p = A.pts[i];
        if (i > 0) {
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(B.pts[i][0], B.pts[i][1]);
        }
        if (i < A.pts.length - 1) {
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(B.pts[i + 1][0], B.pts[i + 1][1]);
        }
      }
    } else {
      for (let i = 1; i < A.pts.length - 1; i++) {
        const p = A.pts[i];
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(B.pts[i - 1][0], B.pts[i - 1][1]);
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(B.pts[i][0], B.pts[i][1]);
      }
    }
  }
  const L = rows.map((r) => r.pts[0]);
  const R = rows.map((r) => r.pts[r.pts.length - 1]);
  ctx.moveTo(L[0][0], L[0][1]);
  for (const p of L) ctx.lineTo(p[0], p[1]);
  ctx.moveTo(R[0][0], R[0][1]);
  for (const p of R) ctx.lineTo(p[0], p[1]);
  ctx.stroke();

  const last = rows[levels - 1];
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(last.cx, last.y, last.hw, 1, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.ellipse(487, RIM_Y, 18, 2.6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = PAL.rim;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.lineCap = 'butt';
  inkBar(ctx, 504, RIM_Y + 0.5, 508, RIM_Y + 0.5, 2.4, PAL.rim);
}

// Stick-figure IK & Persona Accessories
function reach(a, b, max) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const d = Math.hypot(dx, dy);
  if (d <= max) return b;
  return [a[0] + (dx / d) * max, a[1] + (dy / d) * max];
}

function relax(sh, t, amount) {
  const dx = t[0] - sh[0], dy = t[1] - sh[1];
  const d = Math.hypot(dx, dy);
  const want = (UARM + FARM) * 0.96;
  if (dy <= 0 || d < 1 || d >= want) return t;
  const w = (amount ?? 1) * Math.min(1, Math.max(0, (dy / d - 0.8) / 0.18));
  const k = w * w * (3 - 2 * w);
  const nd = d + (want - d) * k;
  return [sh[0] + (dx / d) * nd, sh[1] + (dy / d) * nd];
}

function elbow(sh, hand, fs, out, af) {
  const side = ik(sh, hand, UARM, FARM, null, ARM_BEND * fs);
  if (af >= 0.6) return side;
  const front = ik(sh, hand, UARM, FARM, null, out);
  return lerp2(front, side, EASE.soft(af / 0.6));
}

function breathe(p, amt) {
  if (!amt) return p;
  const o = Object.assign({}, p);
  const up = (v, k) => [v[0], v[1] - amt * k];
  o.head = up(p.head, 1);
  o.chest = up(p.chest, 0.85);
  o.hF = up(p.hF, 0.6);
  o.hB = up(p.hB, 0.6);
  o.ball = up(p.ball, 0.6);
  return o;
}

const prevJ = {};
function mirrorJoint(a, b, j) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L2 = dx * dx + dy * dy || 1;
  const t = ((j[0] - a[0]) * dx + (j[1] - a[1]) * dy) / L2;
  const px = a[0] + dx * t, py = a[1] + dy * t;
  return [2 * px - j[0], 2 * py - j[1]];
}

function ikC(key, a, b, l1, l2, hint, bend) {
  const j = ik(a, b, l1, l2, hint, bend);
  if (bend) {
    prevJ[key] = j;
    return j;
  }
  const pj = prevJ[key];
  if (pj) {
    const alt = mirrorJoint(a, b, j);
    const dj = Math.hypot(j[0] - pj[0], j[1] - pj[1]);
    const da = Math.hypot(alt[0] - pj[0], alt[1] - pj[1]);
    const dh = Math.hypot(j[0] - hint[0], j[1] - hint[1]) - Math.hypot(alt[0] - hint[0], alt[1] - hint[1]);
    if (da + 1.5 < dj && Math.abs(dh) < 4) {
      prevJ[key] = alt;
      return alt;
    }
  }
  prevJ[key] = j;
  return j;
}

function strokePath(ctx, pts, w, col) {
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.stroke();
}

const LIMB = 5;
const ARM = 4.2;
const TORSO = 8.5;
const HEAD_R = 7.8;
const FAR = '#9a9a9a';

function drawAccessory(ctx, hc, fs, af, accessory, accentColor, clock) {
  if (!accessory || accessory === 'none') return;
  ctx.save();
  if (accessory === 'ponytail') {
    // High swaying ponytail + bright campus ribbon behind head
    const dir = -fs * Math.max(0.35, af);
    const sway = Math.sin(clock * 4.2) * 1.8;
    const bx = hc[0] + dir * (HEAD_R - 0.5);
    const by = hc[1] - 3.2;
    ctx.strokeStyle = COL.fig;
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx + dir * 10, by - 4 + sway * 0.4, bx + dir * 14, by + 9 + sway);
    ctx.stroke();

    // Cute hair ribbon / headband
    ctx.strokeStyle = accentColor || '#f59e0b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(hc[0] - 6.5, hc[1] - 3.6);
    ctx.lineTo(hc[0] + 6.5, hc[1] - 3.6);
    ctx.stroke();
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(bx, by, 2.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (accessory === 'headband') {
    ctx.strokeStyle = accentColor || '#2563eb';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hc[0] - 7.3, hc[1] - 2.6);
    ctx.lineTo(hc[0] + 7.3, hc[1] - 2.6);
    ctx.stroke();
    // Fluttering headband tails
    const dir = -fs * Math.max(0.3, af);
    const flutter = Math.sin(clock * 5.2) * 1.4;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(hc[0] + dir * 7.2, hc[1] - 2.6);
    ctx.lineTo(hc[0] + dir * 13.5, hc[1] - 0.5 + flutter);
    ctx.stroke();
  } else if (accessory === 'spiky') {
    // Energetic spiky hair + bright sweatband
    ctx.fillStyle = COL.fig;
    ctx.beginPath();
    ctx.moveTo(hc[0] - 6, hc[1] - 5);
    ctx.lineTo(hc[0] - 3, hc[1] - 12.5);
    ctx.lineTo(hc[0] + 0.5, hc[1] - 7);
    ctx.lineTo(hc[0] + 3.5, hc[1] - 13);
    ctx.lineTo(hc[0] + 6.2, hc[1] - 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = accentColor || '#ea580c';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(hc[0] - 7.3, hc[1] - 2.8);
    ctx.lineTo(hc[0] + 7.3, hc[1] - 2.8);
    ctx.stroke();
  } else if (accessory === 'glasses') {
    // Thin round glasses + tidy shoulder hair curve
    const gx = hc[0] + fs * af * 3.8;
    const gy = hc[1] - 0.8;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(gx, gy, 2.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = accentColor || '#0d9488';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(gx, gy, 2.9, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFigure(ctx, a, x, breath, live, persona, clock = 0) {
  const p = breathe(a.pose, breath);
  const face = p.face;
  const fs = face >= 0 ? 1 : -1;
  const af = Math.min(1, Math.abs(face));
  ctx.save();
  ctx.translate(x, 0);

  const sx = p.chest[0] - p.hip[0], sy = p.chest[1] - p.hip[1];
  const sl = Math.hypot(sx, sy) || 1;
  const u = [sx / sl, sy / sl];
  const n = [-u[1], u[0]];
  const sideOff = 6.2 * (1 - af);
  const shF = [p.chest[0] + n[0] * sideOff - u[0], p.chest[1] + n[1] * sideOff - u[1]];
  const shB = [p.chest[0] - n[0] * sideOff - u[0], p.chest[1] - n[1] * sideOff - u[1]];

  const solve = live ? ikC : (k, aa, bb, l1, l2, h, bd) => ik(aa, bb, l1, l2, h, bd);
  const kF = solve('kF', p.hip, p.fF, THIGH, SHIN, p.kF, KNEE_BEND * fs);
  const kB = solve('kB', p.hip, p.fB, THIGH, SHIN, p.kB, KNEE_BEND * fs);
  const handF = reach(shF, p.hF, UARM + FARM);
  const handB = reach(shB, relax(shB, p.hB, p.hang), UARM + FARM);
  const eF = elbow(shF, handF, fs, 1, af);
  const eB = elbow(shB, handB, fs, -1, af);
  const hd = [p.head[0] - p.chest[0], p.head[1] - p.chest[1]];
  const hl = Math.hypot(hd[0], hd[1]) || 1;
  const hc = [p.chest[0] + (hd[0] / hl) * 20.5, p.chest[1] + (hd[1] / hl) * 20.5];

  strokePath(ctx, [shB, eB, handB], ARM, FAR);
  strokePath(ctx, [p.hip, kB, p.fB], LIMB, FAR);
  strokePath(ctx, [[p.hip[0] + u[0], p.hip[1] + u[1]], [p.chest[0] + u[0] * 0.5, p.chest[1] + u[1] * 0.5]], TORSO, COL.fig);
  strokePath(ctx, [p.hip, kF, p.fF], LIMB, COL.fig);

  ctx.fillStyle = COL.fig;
  ctx.beginPath();
  ctx.arc(hc[0], hc[1], HEAD_R, 0, Math.PI * 2);
  ctx.fill();

  if (persona) {
    drawAccessory(ctx, hc, fs, af, persona.accessory, persona.accentColor, clock);
  }

  if (a.hasBall) {
    drawBall(ctx, p.ball[0], p.ball[1], a.ballRot);
  }

  const arm = [shF, eF, handF];
  if (p.flick > 0.05) {
    const ang = Math.atan2(handF[1] - eF[1], handF[0] - eF[0]) + 1.7 * fs;
    arm.push([handF[0] + Math.cos(ang) * 4.5 * p.flick, handF[1] + Math.sin(ang) * 4.5 * p.flick]);
  }
  strokePath(ctx, arm, ARM, COL.fig);
  ctx.restore();
}
