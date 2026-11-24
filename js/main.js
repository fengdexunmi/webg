import { PERSONAS, PERSONA_ORDER, pickRandom } from './personas.js';
import { ensureAudio, SND, buzz, soundState } from './audio.js';
import {
  BR, AX, ROUND, SHOT_ANGLE, V_MIN, V_MAX,
  COL, RIM_Y, P, EASE, Actor, lerpPose, ballPos,
  newBall, stepBalls, drawGround, contactShadow,
  drawStatic, drawBall, drawRack, drawHoop, drawFigure,
} from './physics.js';
import { AIController } from './ai-controller.js';
import { StreamerPip } from './streamer-pip.js';
import { DanmakuSystem } from './danmaku.js';

const VIEW = { x0: 26, x1: 600, y0: -318, y1: 26 };
const $ = (id) => document.getElementById(id);

const cv = $('gameCanvas');
let ctx = cv.getContext('2d');
let dpr = 1, cw = 0, ch = 0;
let cam = { s: 1, x: 0, y: 0 };

// Persistent lifetime stats
const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem('goofyhoops.' + k);
      return v === null ? d : JSON.parse(v);
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem('goofyhoops.' + k, JSON.stringify(v));
    } catch {
      // ignore
    }
  },
};

const life = Object.assign(
  { best: 0, games: 0, shots: 0, makes: 0, bestStreak: 0, seenHint: false },
  store.get('life', {}),
);

// Game state
const me = new Actor();
let balls = [];
const rack = { items: [], reserve: 0 };
const net = { swish: 0, t: 0 };
const popups = [];
const bits = [];

let mode = 'menu'; // menu | play | over
let state = 'ready'; // ready | charge | shoot | done
let chargeT = 0;
let charge = 0;
let pressed = false;
let holdBlock = false;
let clock = 0;
let doneAt = -1;
let lastRelease = null;
let prevRelease = null;
let round = null;
let lastResult = null;

// Active persona
let currentPersonaId = 'campus_girl';
let lastAutoPersonaId = 'campus_girl';
let currentPersona = PERSONAS[currentPersonaId];
let roundSeq = 0;

// Live studio modules
const pip = new StreamerPip();
const danmaku = new DanmakuSystem(handleUserChat);
const ai = new AIController({
  pressDown: (fromAI) => down(fromAI),
  pressUp: (fromAI) => up(fromAI),
  startNextRound: () => startGame(),
  onChargeStart: () => {
    if (Math.random() < 0.42) {
      pip.say(pickRandom(currentPersona.lines.charge), false);
    }
  },
  onRestartCountdown: (sec) => {
    $('againBtnText').textContent = `自动下一轮 (${Math.ceil(sec)}s)`;
  },
});

const isEndlessMode = () => ai.enabled && currentPersona.isAI;

pip.onVisibilityChange = (vis) => {
  $('btnPipToggle').classList.toggle('active', vis);
};

// Resize & Camera
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  cw = window.innerWidth;
  ch = window.innerHeight;
  cv.width = Math.round(cw * dpr);
  cv.height = Math.round(ch * dpr);
  const narrow = cw < ch;
  const top = narrow ? 148 : 118;
  const bottom = 68;
  const x0 = narrow ? 36 : VIEW.x0;
  const x1 = narrow ? 588 : VIEW.x1;
  const vw = x1 - x0;
  const vh = VIEW.y1 - VIEW.y0;
  const s = Math.min((cw - (narrow ? 12 : 130)) / vw, ((ch - top - bottom) * 0.84) / vh, 1.75);
  const free = ch - top - bottom - vh * s;
  cam = {
    s,
    x: (cw - vw * s) / 2 - x0 * s,
    y: top + free * 0.56 - VIEW.y0 * s,
  };
}
window.addEventListener('resize', resize);
resize();

// Toast helper
let toastTimer = 0;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 2400);
}

// SFX routing
function sfx(kind, b, v) {
  const k = Math.min(1, (v || 0) / 650);
  if (kind === 'score') {
    net.swish = 1;
    SND.swish(!b.touched);
    resolveShot(b, true);
    return;
  }
  if (kind === 'rim' || kind === 'board') {
    b.touched = true;
  }
  if (kind === 'floor') {
    SND.bounce(k);
    if (!b.scored) {
      resolveShot(b, false);
    }
  } else if (kind === 'rim') {
    SND.rim(k);
  } else if (kind === 'board') {
    SND.board(k);
  } else {
    SND.pole(k);
  }
}

function chargePeriod() {
  return 1.05 * Math.pow(0.92, Math.min(round ? round.streak : 0, 8));
}

function newRound(keepBalls = false) {
  roundSeq++;
  round = {
    id: roundSeq,
    endless: isEndlessMode(),
    shots: [],
    score: 0,
    streak: 0,
    bestStreak: 0,
    swishes: 0,
    misses: 0,
    makes: 0,
    attempts: 0,
  };
  if (!keepBalls) balls = [];
  rack.items = [0, 1, 2, 3, 4].map((i) => ({ rot: Math.random() * 6.28, s: i, a: 1 }));
  rack.reserve = isEndlessMode() ? Infinity : ROUND - 6;
  me.clear();
  me.hasBall = true;
  me.push({ pose: P.hold, d: 0.3, ez: 'soft' });
  state = 'ready';
  doneAt = -1;
  lastRelease = null;
  prevRelease = null;
  popups.length = 0;
  ai.resetShot();
  if ($('hudSubMeta')) $('hudSubMeta').textContent = '';
}

function releaseBall(vx, vy) {
  if (!me.hasBall) return;
  me.hasBall = false;
  const bp = me.pose.ball || ballPos(me.pose);
  const b = newBall(AX + bp[0], bp[1], vx, vy, -6);
  b.roundId = round.id;
  b.shot = round.attempts++;
  b.rel = lastRelease;
  if (!isEndlessMode()) {
    round.shots.push({ made: null, swish: false });
  }
  balls.push(b);
  life.shots++;
  SND.release();
  buzz(8);
  updateHud();
}

function grab() {
  if (!rack.items.length) return false;
  const it = rack.items.pop();
  SND.grab();
  me.ballRot = it.rot;
  me.hasBall = true;
  if (isEndlessMode()) {
    rack.items.unshift({ rot: Math.random() * 6.28, s: -1.2, a: 0 });
  } else if (rack.reserve > 0) {
    rack.reserve--;
    rack.items.unshift({ rot: Math.random() * 6.28, s: -1.2, a: 0 });
  }
  return true;
}

function popup(text, sub, hot, quiet) {
  popups.push({ text, sub, hot, quiet, t: 0 });
}

function burst(n, hot) {
  const cols = hot
    ? ['#141414', '#b45309', '#fcd34d', '#8d8d8d']
    : ['#141414', '#8d8d8d', '#c8c8c8', '#c8c8c8'];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
    const sp = 70 + Math.random() * 110;
    bits.push({
      x: 487 + (Math.random() - 0.5) * 30,
      y: RIM_Y - 4,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      r: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 18,
      c: cols[i % cols.length],
      t: 0,
      life: 0.8 + Math.random() * 0.5,
      w: 2.2 + Math.random() * 1.8,
    });
  }
}

function resolveShot(b, made) {
  if (b.resolved || b.shot === undefined || !round || b.roundId !== round.id) return;
  b.resolved = true;
  const rec = round.shots[b.shot];
  if (rec) rec.made = made;
  if (b.rel) b.rel.made = made;

  ai.onShotResolved(made);

  if (made) {
    life.makes++;
    round.makes++;
    round.streak++;
    round.bestStreak = Math.max(round.bestStreak, round.streak);
    const swish = !b.touched;
    if (rec) rec.swish = swish;
    if (swish) round.swishes++;
    const mult = round.streak >= 6 ? 3 : round.streak >= 3 ? 2 : 1;
    const pts = (swish ? 3 : 2) * mult;
    round.score += pts;
    life.best = Math.max(life.best, round.score);
    life.bestStreak = Math.max(life.bestStreak, round.bestStreak);

    const subs = [];
    if (swish) subs.push('空心 SWISH');
    if (mult > 1) subs.push('×' + mult);
    popup('+' + pts, subs.join(' · '), swish || mult > 1);
    burst(swish ? 18 : 9, swish || mult > 1);

    const el = $('score');
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    buzz(swish ? [12, 40, 12] : 14);

    if (mult > 1 && (round.streak === 3 || round.streak === 6)) {
      SND.streak(round.streak);
      pip.setAction('cheer', `🔥 ${round.streak}连中 ×${mult}`, 1500);
      pip.say(pickRandom(currentPersona.lines.streak));
      pip.bumpViewers(Math.floor(45 + Math.random() * 90));
      danmaku.pushViewer(pickRandom(currentPersona.danmaku.streak), true);
    } else if (swish) {
      pip.setAction('cheer', '✨ 空心入网 +3', 1300);
      pip.say(pickRandom(currentPersona.lines.swish));
      pip.bumpViewers(Math.floor(15 + Math.random() * 40));
      danmaku.pushViewer(pickRandom(currentPersona.danmaku.swish), true);
    } else {
      pip.setAction('cheer', '🏀 稳稳命中', 950);
      if (Math.random() < 0.7) pip.say(pickRandom(currentPersona.lines.made));
      pip.bumpViewers(Math.floor(5 + Math.random() * 18));
      if (Math.random() < 0.75) danmaku.pushViewer(pickRandom(currentPersona.danmaku.made), false);
    }
  } else {
    round.misses++;
    round.streak = 0;
    popup('打铁', '', false, true);
    pip.setAction('miss', '😅 差一点点', 1100);
    pip.say(pickRandom(currentPersona.lines.miss));
    danmaku.pushViewer(pickRandom(currentPersona.danmaku.miss), false);
  }
  updateHud();
}

function shoot() {
  state = 'shoot';
  prevRelease = lastRelease;
  lastRelease = { c: charge, made: null, at: clock };
  const v = V_MIN + charge * (V_MAX - V_MIN);
  const vx = v * Math.cos(SHOT_ANGLE);
  const vy = -v * Math.sin(SHOT_ANGLE);
  me.clear();
  me.push(
    { path: [P.rise, P.set], d: 0.15, ez: 'in' },
    { fn: () => releaseBall(vx, vy) },
    { pose: P.follow, d: 0.09, ez: 'out' },
    { d: 0.32 },
    {
      fn: () => {
        if (isEndlessMode() && !rack.items.length) {
          rack.items = [0, 1, 2, 3, 4].map((i) => ({ rot: Math.random() * 6.28, s: i, a: 1 }));
        }
        if (!isEndlessMode() && !rack.items.length) {
          me.push(
            { path: [P.drop, P.stand], d: 0.4, ez: 'soft' },
            { fn: () => { state = 'done'; doneAt = clock; } },
          );
          return;
        }
        me.push(
          { path: [P.drop, P.turn, P.bend], d: 0.78, ez: 'soft' },
          { d: 0.04 },
          { fn: () => grab() },
          { path: [P.turnHold, P.hold], d: 0.46, ez: 'soft' },
          {
            fn: () => {
              state = 'ready';
              if (pressed && !holdBlock && (!ai.enabled || !currentPersona.isAI)) {
                startCharge();
              }
            },
          },
        );
      },
    },
  );
}

function startCharge() {
  state = 'charge';
  chargeT = 0;
  charge = 0;
  me.clear();
  me.chargeFrom = me.pose;
}

function startGame(keepBalls = false) {
  ensureAudio();
  newRound(keepBalls);
  mode = 'play';
  $('overlay').classList.remove('on');
  $('startCard').classList.remove('show');
  $('endCard').classList.remove('show');
  $('hud').classList.remove('hidden');
  const isManual = !isEndlessMode();
  $('hint').classList.toggle('hidden', !isManual || life.seenHint);
  $('againBtnText').textContent = '再来一轮';
  pip.flashKey('R', 150);
  pip.setAction('idle', isEndlessMode() ? '无限投篮中' : '新的一轮开始');
  pip.say(pickRandom(currentPersona.lines.intro));
  updateHud();
}

function endGame() {
  if (isEndlessMode()) return;
  mode = 'over';
  life.games++;
  const res = {
    score: round.score,
    bestStreak: round.bestStreak,
    swishes: round.swishes,
    personaName: currentPersona.name,
    personaTitle: currentPersona.title,
    shots: round.shots.map((s) => (s.made ? (s.swish ? 2 : 1) : 0)),
  };
  const made = res.shots.filter((s) => s > 0).length;
  const isBest = res.score > life.best;
  life.best = Math.max(life.best, res.score);
  life.bestStreak = Math.max(life.bestStreak, res.bestStreak);
  store.set('life', life);
  res.isBest = isBest;
  lastResult = res;

  $('endRoundTitle').textContent = `${currentPersona.title} · ${currentPersona.name} 本轮战绩`;
  $('endScore').textContent = res.score;
  $('endChip').style.display = isBest && res.score > 0 ? '' : 'none';
  $('stAcc').textContent = Math.round((made / ROUND) * 100) + '%';
  $('stSwish').textContent = res.swishes;
  $('endShots').innerHTML = res.shots
    .map((s) => `<div class="dot ${s === 2 ? 'swish' : s === 1 ? 'made' : 'miss'}"></div>`)
    .join('');

  const commentLine =
    res.score >= 30
      ? pickRandom(currentPersona.lines.endHigh)
      : res.score >= 16
        ? pickRandom(currentPersona.lines.endMid)
        : pickRandom(currentPersona.lines.endLow);
  $('endComment').textContent = `“${commentLine}”`;
  pip.say(commentLine);

  $('endFoot').textContent = lifetimeLine();
  $('startCard').classList.remove('show');
  $('endCard').classList.add('show');
  $('overlay').classList.add('on');
  $('hud').classList.add('hidden');
  $('hint').classList.add('hidden');

  if (made >= 7) {
    pip.setAction('cheer', '🏆 高分完美收官', 2500);
    me.clear();
    me.push(
      { path: [P.drop, P.cheer], d: 0.5, ez: 'soft' },
      { d: 0.45 },
      { path: [P.drop, P.stand], d: 0.6, ez: 'soft' },
    );
  }
}

function lifetimeLine() {
  if (!life.shots) return '';
  const pct = Math.round((life.makes / life.shots) * 100);
  return `累计出手 ${life.shots.toLocaleString()} 次 · 命中率 ${pct}% · 历史最高 ${life.best} 分`;
}

function updateHud() {
  if (!round) return;
  const endless = isEndlessMode();
  $('hud').classList.toggle('endless', endless);
  $('score').textContent = round.score;
  $('hudSwish').textContent = round.swishes;
  $('hudMiss').textContent = round.misses;
  $('best').textContent = Math.max(life.best, round.score);
  $('hudPersonaName').textContent = currentPersona.name;
  $('hudModeTag').textContent = endless ? `${currentPersona.title} · 无限投篮` : '手动操控中';

  if (endless) {
    const resolved = round.makes + round.misses;
    const acc = resolved > 0 ? Math.round((round.makes / resolved) * 100) : 0;
    $('ballLabel').textContent = '∞ 无限篮球';
    $('hudSubMeta').textContent = resolved > 0 ? `已投 ${resolved} 球 · 命中率 ${acc}%` : '无限连投中';
  } else {
    const n = round.shots.length;
    let html = '';
    for (let i = 0; i < ROUND; i++) {
      const s = round.shots[i];
      let cls = '';
      if (s && s.made === true) cls = s.swish ? 'swish' : 'made';
      else if (s && s.made === false) cls = 'miss';
      else if (s) cls = 'fly';
      else if (i === n && (me.hasBall || rack.items.length)) cls = 'next';
      html += `<div class="dot ${cls}"></div>`;
    }
    $('tracker').innerHTML = html;
    $('ballLabel').textContent = n < ROUND ? `第 ${n + 1} / ${ROUND} 球` : '最后一球';
    $('hudSubMeta').textContent = '';
  }

  const st = $('streak');
  const s = round.streak;
  if (s >= 2) {
    const mult = s >= 6 ? 3 : s >= 3 ? 2 : 1;
    st.textContent = mult > 1 ? `🔥 ${s} 连中 · ×${mult} 倍积分` : `✨ ${s} 连中`;
    st.classList.add('on');
  } else {
    st.classList.remove('on');
  }
}

// Input pipeline (shared by Human and Auto so keyboard animation & physics are 100% unified)
function down(fromAI = false) {
  ensureAudio();
  if (!fromAI && isEndlessMode() && mode === 'play') {
    // Allow seamless manual override if user presses Space or clicks canvas
    setAutoPlay(false, false);
    toast('已关闭 Auto 模式，切为手动投篮（点顶部 Auto 按钮可恢复无限投篮）');
  }
  pressed = true;
  if (mode !== 'play') return;
  if (state === 'ready') {
    SND.keyDown();
    pip.setSpacePressed(true, 0);
    startCharge();
  }
}

function up(fromAI = false) {
  if (!fromAI && isEndlessMode()) return;
  pressed = false;
  holdBlock = false;
  if (state === 'charge') {
    SND.keyUp();
    pip.setSpacePressed(false, charge);
    shoot();
    if (!fromAI && !life.seenHint) {
      life.seenHint = true;
      store.set('life', life);
      $('hint').classList.add('hidden');
    }
  }
}

// Persona & Controls wiring
function selectPersona(id, notify = true) {
  if (!PERSONAS[id]) return;
  currentPersonaId = id;
  currentPersona = PERSONAS[id];
  if (currentPersona.isAI) lastAutoPersonaId = id;
  $('personaSelect').value = id;

  // Update start screen cards
  document.querySelectorAll('.p-card').forEach((c) => {
    c.classList.toggle('selected', c.dataset.id === id);
  });

  ai.setPersona(currentPersona);
  pip.setPersona(currentPersona);

  if (currentPersona.isAI) {
    setAutoPlay(true, false);
    $('playBtnText').textContent = `开始 ${currentPersona.name} 直播投篮`;
  } else {
    setAutoPlay(false, false);
    $('playBtnText').textContent = '开始手动投篮';
  }

  updateHud();
  if (notify) {
    pip.say(pickRandom(currentPersona.lines.intro));
    toast(`已切换角色：${currentPersona.title} · ${currentPersona.name}`);
  }
}

function setAutoPlay(flag, showToast = false) {
  const wasEndless = isEndlessMode();
  ai.setEnabled(flag && currentPersona.isAI);
  const active = isEndlessMode();
  $('btnAutoPlay').classList.toggle('active', active);
  $('autoPlayText').textContent = active ? 'Auto 开' : 'Auto 关';
  $('btnAutoLoop').classList.toggle('hidden', true);

  if (active) {
    $('overlay').classList.remove('on');
    $('startCard').classList.remove('show');
    $('endCard').classList.remove('show');
    $('hud').classList.remove('hidden');
    if (mode !== 'play') {
      startGame(false);
    } else if (!wasEndless) {
      newRound(true);
      pip.setAction('idle', '无限投篮中');
    }
  } else if (mode === 'play' && wasEndless) {
    newRound(true);
    pip.setAction('idle', '手动投篮');
  }

  $('hint').classList.toggle('hidden', mode !== 'play' || active || life.seenHint);
  updateHud();
  if (showToast) {
    toast(active ? '已开启 Auto 无限投篮模式' : '已关闭 Auto 模式，切为手动十球投篮');
  }
}

function handleUserChat(txt) {
  if (txt.includes('哥哥') || txt.includes('陈默')) {
    selectPersona('basketball_bro', true);
    return;
  }
  if (txt.includes('美女') || txt.includes('小夏')) {
    selectPersona('campus_girl', true);
    return;
  }
  if (txt.includes('体育生') || txt.includes('阿凯')) {
    selectPersona('sports_boy', true);
    return;
  }
  if (txt.includes('学霸') || txt.includes('晚晚')) {
    selectPersona('chill_scholar', true);
    return;
  }
  if (txt.includes('加油') || txt.includes('666') || txt.includes('准') || txt.includes('空心')) {
    pip.bumpViewers(12);
    pip.say(`谢谢弹幕的“${txt}”！下一球给你投个纯空心～`);
  }
}

function buildStartPersonaGrid() {
  const grid = $('startPersonaGrid');
  grid.innerHTML = '';
  for (const id of PERSONA_ORDER) {
    const p = PERSONAS[id];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `p-card${id === currentPersonaId ? ' selected' : ''}${id === 'human' ? ' full-span' : ''}`;
    btn.dataset.id = id;
    btn.innerHTML = `
      <div class="p-avatar">${p.emoji}</div>
      <div class="p-info">
        <div class="p-name">${p.title} · ${p.name}</div>
        <div class="p-desc">${p.desc}</div>
      </div>
    `;
    btn.addEventListener('click', () => selectPersona(id, false));
    grid.appendChild(btn);
  }
}

// Event Listeners
cv.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (mode === 'play') down(false);
});
window.addEventListener('pointerup', () => up(false));
window.addEventListener('pointercancel', () => up(false));

window.addEventListener('keydown', (e) => {
  if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') return;
  if (e.code === 'KeyR' && !e.repeat) {
    e.preventDefault();
    startGame();
    return;
  }
  if (e.code !== 'Space' && e.code !== 'Enter') return;
  e.preventDefault();
  if (e.repeat) return;
  if (mode !== 'play') {
    holdBlock = true;
    startGame();
    return;
  }
  down(false);
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'Space' || e.code === 'Enter') up(false);
});
window.addEventListener('contextmenu', (e) => e.preventDefault());

$('playBtn').addEventListener('click', startGame);
$('againBtn').addEventListener('click', startGame);
$('shareBtn').addEventListener('click', () => share(lastResult));

$('personaSelect').addEventListener('change', (e) => selectPersona(e.target.value, true));
$('btnAutoPlay').addEventListener('click', () => {
  if (!currentPersona.isAI) {
    selectPersona(lastAutoPersonaId || 'campus_girl', true);
    return;
  }
  setAutoPlay(!isEndlessMode(), true);
});
$('btnAutoLoop').addEventListener('click', (e) => {
  const next = !ai.autoLoop;
  ai.setAutoLoop(next);
  e.currentTarget.classList.toggle('active', next);
  toast(next ? '已开启直播自动连播（每轮结束后自动开下一局）' : '已关闭自动连播');
});
$('btnPipToggle').addEventListener('click', (e) => {
  const next = !pip.isVisible();
  pip.setVisible(next);
  e.currentTarget.classList.toggle('active', next);
});
$('btnDanmakuToggle').addEventListener('click', (e) => {
  const next = !danmaku.enabled;
  danmaku.setEnabled(next);
  e.currentTarget.classList.toggle('active', next);
  if (next) {
    danmaku.pushViewer(pickRandom(currentPersona.danmaku.ambient), false);
    toast('弹幕互动已开启');
  }
});
$('btnTtsToggle').addEventListener('click', (e) => {
  soundState.ttsEnabled = !soundState.ttsEnabled;
  e.currentTarget.classList.toggle('active', soundState.ttsEnabled);
  toast(soundState.ttsEnabled ? '主播中文语音播报已开启' : '主播语音播报已静音');
});
$('btnSoundToggle').addEventListener('click', (e) => {
  soundState.enabled = !soundState.enabled;
  e.currentTarget.classList.toggle('active', soundState.enabled);
  if (soundState.enabled) ensureAudio();
  toast(soundState.enabled ? '音效已开启' : '音效已关闭');
});
$('btnStreamMode').addEventListener('click', () => {
  document.body.classList.toggle('stream-mode');
  toast('已进入纯净直播画面（鼠标移到右上角可退出）');
});
$('exitStreamBtn').addEventListener('click', () => {
  document.body.classList.remove('stream-mode');
});

// Drawing: Meter, Popups, Confetti Bits
function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function drawMeter() {
  const showing = state === 'charge' || (state === 'shoot' && lastRelease && clock - lastRelease.at < 0.65);
  if (!showing) return;
  const w = 52;
  const h = 5.5;
  const x = AX - w / 2 + 6;
  const y = -160;
  const c = state === 'charge' ? charge : lastRelease.c;

  ctx.save();
  ctx.globalAlpha = state === 'charge'
    ? Math.min(1, chargeT / 0.12)
    : Math.max(0, 1 - (clock - lastRelease.at) / 0.65);

  ctx.fillStyle = 'rgba(42,38,32,0.12)';
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();

  ctx.fillStyle = COL.ink;
  roundRect(ctx, x, y, Math.max(h, w * c), h, h / 2);
  ctx.fill();

  if (prevRelease && prevRelease.made !== null) {
    const tx = x + w * prevRelease.c;
    ctx.fillStyle = prevRelease.made ? COL.accent : COL.muted;
    roundRect(ctx, tx - 1, y - 3.5, 2, h + 7, 1);
    ctx.fill();
  }
  ctx.restore();
}

function drawPopups() {
  for (const p of popups) {
    const k = p.t / 1.1;
    const a = k < 0.12 ? k / 0.12 : Math.max(0, 1 - (k - 0.55) / 0.45);
    const y = -258 - 24 * EASE.out(Math.min(1, k * 1.3));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    if (p.quiet) {
      ctx.fillStyle = COL.muted;
      ctx.font = "700 13px 'Balsamiq Sans', 'Noto Sans SC', sans-serif";
      ctx.fillText(p.text, 487, y + 6);
    } else {
      const sc = 1 + 0.22 * Math.max(0, 1 - k * 5);
      ctx.translate(487, y);
      ctx.scale(sc, sc);
      ctx.fillStyle = p.hot ? COL.accent : COL.ink;
      ctx.font = "700 24px 'Balsamiq Sans', 'Noto Sans SC', sans-serif";
      ctx.fillText(p.text, 0, 0);
      if (p.sub) {
        ctx.font = "700 10px 'Balsamiq Sans', 'Noto Sans SC', sans-serif";
        ctx.fillText(p.sub, 0, 13);
      }
    }
    ctx.restore();
  }
}

function drawBits() {
  for (const b of bits) {
    const a = Math.max(0, 1 - b.t / b.life);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(b.x, b.y);
    ctx.rotate(b.r);
    ctx.fillStyle = b.c;
    ctx.fillRect(-b.w / 2, -0.9, b.w, 1.8);
    ctx.restore();
  }
}

// Main Render
function render() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cw, ch);

  ctx.setTransform(dpr * cam.s, 0, 0, dpr * cam.s, dpr * cam.x, dpr * cam.y);
  const xl = -cam.x / cam.s - 2;
  const xr = (cw - cam.x) / cam.s + 2;

  drawGround(ctx, xl, xr);
  drawStatic(ctx);
  drawRack(ctx, rack.items);
  contactShadow(ctx, AX + (me.pose.fF[0] + me.pose.fB[0]) / 2 + 1, 15, 0.14);

  for (const b of balls) {
    const hgt = -b.y - BR;
    if (hgt < 140) {
      const k = 1 - hgt / 140;
      contactShadow(ctx, b.x, BR * (0.5 + 0.5 * k), 0.2 * k * b.alpha);
    }
  }

  drawFigure(ctx, me, AX, me.breath * (Math.sin(clock * 2.1) + 1) * 0.5, true, currentPersona, clock);

  for (const b of balls) {
    ctx.globalAlpha = b.alpha;
    drawBall(ctx, b.x, b.y, b.rot);
  }
  ctx.globalAlpha = 1;

  drawHoop(ctx, net);
  drawBits();
  drawMeter();
  drawPopups();
}

// Main Update
function update(dt) {
  clock += dt;

  if (state === 'charge') {
    chargeT += dt;
    const ph = (chargeT / chargePeriod()) % 2;
    charge = ph < 1 ? ph : 2 - ph;
    const ck = Math.min(1, chargeT / 0.32);
    me.pose = lerpPose(me.chargeFrom || P.hold, P.crouch, EASE.out(ck));
    pip.updateTelemetry(charge);
  }

  // Tick AI player
  ai.update(dt, {
    mode,
    state,
    charge,
    chargeT,
    streak: round ? round.streak : 0,
  });

  // Ambient livestream danmaku
  if (mode === 'play') {
    danmaku.tickAmbient(dt, currentPersona);
  }

  me.update(dt);
  const wantBreath = (state === 'ready' && me.idle) || mode !== 'play' ? 1 : 0;
  me.breath += (wantBreath - me.breath) * Math.min(1, dt * 3);

  const sub = 4;
  const h = dt / sub;
  for (let s = 0; s < sub; s++) {
    stepBalls(balls, h, sfx);
  }

  const xl = -cam.x / cam.s;
  const xr = (cw - cam.x) / cam.s;
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    if (b.y >= -BR - 0.1 && Math.abs(b.vx) < 2 && Math.abs(b.vy) < 1) b.still += dt;
    else b.still = 0;

    if (!b.resolved) {
      b.age = (b.age || 0) + dt;
      b.idle = Math.hypot(b.vx, b.vy) < 25 ? (b.idle || 0) + dt : 0;
      const landed = !b.scored && b.y >= -BR - 0.5;
      if (landed || b.idle > 1 || b.age > 6) resolveShot(b, false);
    }
    if (b.x < Math.min(xl, -40) - 40 || b.x > Math.max(xr, 760) + 40) {
      resolveShot(b, false);
      balls.splice(i, 1);
      continue;
    }
    if (b.fading) {
      b.alpha -= dt * 1.5;
      if (b.alpha <= 0) {
        resolveShot(b, false);
        balls.splice(i, 1);
      }
    }
  }

  const settled = balls.filter((b) => b.still > 0.4 && !b.fading);
  if (settled.length > 6) settled[0].fading = true;

  net.t += dt;
  net.swish = Math.max(0, net.swish - dt * 1.6);

  const total = rack.items.length;
  rack.items.forEach((it, j) => {
    const target = 5 - total + j;
    it.s += (target - it.s) * Math.min(1, dt * 7);
    it.a = Math.min(1, it.a + dt * 3);
  });

  for (let i = popups.length - 1; i >= 0; i--) {
    popups[i].t += dt;
    if (popups[i].t > 1.1) popups.splice(i, 1);
  }
  for (let i = bits.length - 1; i >= 0; i--) {
    const b = bits[i];
    b.t += dt;
    b.vy += 260 * dt;
    b.vx *= 1 - 1.5 * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.r += b.vr * dt;
    if (b.t > b.life) bits.splice(i, 1);
  }

  if (!isEndlessMode() && mode === 'play' && state === 'done' && round.shots.every((s) => s.made !== null) && clock - doneAt > 0.9) {
    endGame();
  }
}

// Share-card PNG generator (honoring Goofy Fish Ten Balls share card)
function shareCanvas(res) {
  const SW = 1080, SH = 1350;
  const c = document.createElement('canvas');
  c.width = SW;
  c.height = SH;
  const sc = c.getContext('2d');
  const font = (sz) => `700 ${sz}px 'Balsamiq Sans', 'Noto Sans SC', sans-serif`;

  sc.fillStyle = COL.bg;
  sc.fillRect(0, 0, SW, SH);
  sc.fillStyle = COL.dot;
  for (let y = 18; y < SH; y += 36) {
    for (let x = 18; x < SW; x += 36) {
      sc.beginPath();
      sc.arc(x, y, 1.6, 0, Math.PI * 2);
      sc.fill();
    }
  }

  const made = res.shots.filter((s) => s > 0).length;
  sc.textBaseline = 'alphabetic';
  sc.fillStyle = COL.ink;
  sc.font = font(230);
  sc.fillText(String(res.score), 76, 330);
  const sw = sc.measureText(String(res.score)).width;

  sc.font = font(34);
  sc.fillStyle = COL.muted;
  sc.fillText('POINTS · 十球投篮', 104 + sw, 330);
  sc.fillStyle = COL.accent;
  sc.fillText(`${res.personaTitle} · ${res.personaName}`, 104 + sw, 278);

  sc.save();
  sc.translate(120, 470);
  res.shots.forEach((s, i) => {
    const x = i * 93;
    if (s > 0) {
      sc.fillStyle = s === 2 ? '#fcd34d' : COL.ink;
      sc.beginPath();
      sc.arc(x, 0, 30, 0, Math.PI * 2);
      sc.fill();
      if (s === 2) {
        sc.strokeStyle = COL.accent;
        sc.lineWidth = 5;
        sc.stroke();
      }
    } else {
      sc.strokeStyle = COL.faint;
      sc.lineWidth = 4;
      sc.beginPath();
      sc.arc(x, 0, 28, 0, Math.PI * 2);
      sc.stroke();
      sc.lineCap = 'round';
      sc.beginPath();
      sc.moveTo(x - 11, 11);
      sc.lineTo(x + 11, -11);
      sc.stroke();
    }
  });
  sc.restore();

  const stats = [
    [`${made}/${ROUND}`, '命中'],
    [`${Math.round((made / ROUND) * 100)}%`, '命中率'],
    [`${res.swishes}`, '纯空心'],
  ];
  stats.forEach((s, i) => {
    const x = 90 + i * 280;
    sc.fillStyle = COL.ink;
    sc.font = font(56);
    sc.fillText(s[0], x, 622);
    sc.fillStyle = COL.muted;
    sc.font = font(22);
    sc.fillText(s[1], x, 660);
  });

  const scale = 1.72;
  sc.save();
  sc.translate(66 - 30 * scale, 1262);
  sc.scale(scale, scale);
  drawGround(sc, -200, 900);
  drawStatic(sc);
  drawRack(sc, []);
  contactShadow(sc, AX + 1, 16, 0.16);
  drawFigure(sc, { pose: P.follow, hasBall: false }, AX, 0, false, currentPersona, 0);
  drawBall(sc, 487, -207, 0.4);
  drawHoop(sc, { swish: 0, t: 0 });
  sc.restore();

  return c;
}

async function share(res) {
  const btn = $('shareBtn');
  if (!res || btn.disabled) return;
  btn.disabled = true;
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    const blob = await new Promise((r) => shareCanvas(res).toBlob(r, 'image/png'));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ten-balls-${res.personaName}-${res.score}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('战绩海报已保存');
  } catch {
    toast('保存海报失败');
  } finally {
    btn.disabled = false;
  }
}

// Unlock Web Audio on first user interaction when Auto mode starts immediately
const unlockAudioOnce = () => {
  ensureAudio();
  window.removeEventListener('pointerdown', unlockAudioOnce);
  window.removeEventListener('keydown', unlockAudioOnce);
};
window.addEventListener('pointerdown', unlockAudioOnce, { passive: true });
window.addEventListener('keydown', unlockAudioOnce, { passive: true });

// Init: Auto mode is ON by default -> enter endless shooting directly with no popup
buildStartPersonaGrid();
selectPersona('campus_girl', false);
$('startFoot').textContent = lifetimeLine();
$('best').textContent = life.best;
if (isEndlessMode() && mode !== 'play') {
  startGame(false);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
