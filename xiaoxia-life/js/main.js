// Main Controller for 《林小夏的数字人生》
// Orchestrates: 7 Hand-Drawn Campus Buildings (Outdoor Street + 7 Indoor Rooms),
// Cinematic Building Entry/Exit Transitions, Prettier 3D Campus Girl Walking Simulation,
// Real-Time AI Agent Curriculum Timetable, and 9 Magnified Side Interactive Windows

import { BUILDINGS, DAYS, SCHEDULE_SLOTS } from './data.js';
import { drawCampusBackground, drawCampusForeground, hitTestBuilding } from './campus-sketch.js';
import { Avatar3DWalker } from './avatar3d-walker.js';
import { SideWorkspace } from './side-windows.js';

const $ = (id) => document.getElementById(id);

const bgCv = $('bgSketchCanvas');
const bgCtx = bgCv.getContext('2d');
const fgCv = $('fgSketchCanvas');
const fgCtx = fgCv.getContext('2d');
const stageEl = $('worldStage');
const shellEl = $('appShell');

const avatar3d = new Avatar3DWalker($('avatar3dCanvas'));

// World & Live Simulation State
const state = {
  clock: 0,
  dayIdx: (new Date().getDay() + 6) % 7,
  minutes: 465, // 07:45 morning wake-up inside Dorm 402
  liveSync: false,
  sceneMode: 'indoor', // 'outdoor' | 'indoor' — start waking up inside Dorm 402 (bed + desk)!
  isTransitioning: false,
  currentBuilding: 'dorm',
  targetBuilding: 'dorm',
  avatarX: BUILDINGS.dorm.x,
  targetX: BUILDINGS.dorm.x,
  isWalking: false,
  walkDir: 1,
  walkPhase: 0,
  walkStartX: BUILDINGS.dorm.x,
  pose: 'idle',
  pendingPanel: null,
  pendingCourseId: null,
  camWorldX: BUILDINGS.dorm.x + 60,
  manualPanOffset: 0,
  stats: { energy: 88, focus: 84, vitality: 80, mood: 92 },
};

let cw = 0;
let ch = 0;
let dpr = 1;
let cam = { s: 1, x: 0, y: 0 };

// Toast helper
let toastTimer = null;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 2600);
}

function setSpeech(text) {
  $('speechText').textContent = text;
}

function clampStat(v) {
  return Math.max(10, Math.min(100, Math.round(v)));
}

function bumpStats(delta = {}) {
  for (const k of ['energy', 'focus', 'vitality', 'mood']) {
    if (typeof delta[k] === 'number') state.stats[k] = clampStat(state.stats[k] + delta[k]);
  }
  $('statEnergy').textContent = state.stats.energy;
  $('statFocus').textContent = state.stats.focus;
  $('statVitality').textContent = state.stats.vitality;
  $('statMood').textContent = state.stats.mood;
}

// Side Interactive Workspace
const side = new SideWorkspace($('sideBody'), {
  onToast: toast,
  onSpeech: setSpeech,
  onStats: bumpStats,
  onLogCount: (n) => { $('logCountBadge').textContent = String(n); },
});
$('logCountBadge').textContent = String(side.state.logs.length);

// Smooth Building Entry / Exit Curtain Transition
let transTimer1 = null;
let transTimer2 = null;
function runSceneTransition(icon, title, sub, onMidpoint) {
  clearTimeout(transTimer1);
  clearTimeout(transTimer2);
  const el = $('sceneTransition');
  $('transIcon').textContent = icon;
  $('transTitle').textContent = title;
  $('transSub').textContent = sub;

  state.isTransitioning = true;
  el.classList.remove('hidden');
  // Force reflow for smooth opacity fade-in
  void el.offsetWidth;
  el.classList.add('active');

  transTimer1 = setTimeout(() => {
    onMidpoint?.();
    updateIndoorButton();
    updateCamera();
    el.classList.remove('active');
    transTimer2 = setTimeout(() => {
      el.classList.add('hidden');
      state.isTransitioning = false;
    }, 280);
  }, 340);
}

function updateIndoorButton() {
  const b = BUILDINGS[state.currentBuilding] || BUILDINGS.dorm;
  const btn = $('btnToggleIndoor');
  if (state.isWalking) {
    btn.style.display = 'none';
    return;
  }
  btn.style.display = 'inline-flex';
  if (state.sceneMode === 'indoor') {
    $('indoorPillIcon').textContent = '🚶‍♀️';
    $('indoorPillText').textContent = `走出 ${b.shortName} · 回到校园林荫道`;
  } else {
    $('indoorPillIcon').textContent = '🚪';
    $('indoorPillText').textContent = `推门进入 · ${b.name}`;
  }
}

function enterCurrentBuilding(bldgId) {
  const b = BUILDINGS[bldgId || state.currentBuilding];
  if (!b) return;
  runSceneTransition(b.icon, `正在推门进入 · ${b.name}`, b.indoorTitle, () => {
    state.sceneMode = 'indoor';
    state.currentBuilding = b.id;
    state.pose = b.defaultPose;
    setSpeech(b.speech);
    updateClockUi();
  });
}

function exitToCampusStreet(afterExit) {
  const b = BUILDINGS[state.currentBuilding] || BUILDINGS.dorm;
  runSceneTransition('🌳', `走出 ${b.shortName}`, '回到手绘校园林荫道...', () => {
    state.sceneMode = 'outdoor';
    state.camWorldX = state.avatarX;
    state.manualPanOffset = 0;
    state.pose = 'idle';
    updateClockUi();
    afterExit?.();
  });
}

// Resize & Orthographic Camera
function updateCamera() {
  const s = Math.max(0.75, Math.min(1.18, ch / 520));
  const groundScreenY = ch * 0.77;
  const centerWorldX = state.sceneMode === 'indoor' ? 0 : (state.camWorldX + state.manualPanOffset);
  cam = {
    s,
    x: cw * 0.5 - centerWorldX * s,
    y: groundScreenY,
  };
}

function resize() {
  const r = stageEl.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cw = Math.max(320, r.width);
  ch = Math.max(320, r.height);
  bgCv.width = Math.round(cw * dpr);
  bgCv.height = Math.round(ch * dpr);
  fgCv.width = Math.round(cw * dpr);
  fgCv.height = Math.round(ch * dpr);
  avatar3d.resize(cw, ch, dpr);
  updateCamera();
}
window.addEventListener('resize', resize);

// Format time
function fmtTime(mins) {
  const h = String(Math.floor(mins / 60) % 24).padStart(2, '0');
  const m = String(Math.floor(mins % 60)).padStart(2, '0');
  return `${h}:${m}`;
}

function getScheduleSlot(dayIdx, mins) {
  for (const s of SCHEDULE_SLOTS) {
    if (mins >= s.range[0] && mins <= s.range[1]) {
      const cell = s.cells[dayIdx];
      const pct = Math.round(((mins - s.range[0]) / Math.max(1, s.range[1] - s.range[0])) * 100);
      return { ...cell, pct };
    }
  }
  return { title: '梅园402熄灯安睡', bldg: 'dorm', panel: 'lifelog', pct: 50 };
}

function updateClockUi() {
  const slot = getScheduleSlot(state.dayIdx, state.minutes);
  const bldg = BUILDINGS[state.targetBuilding] || BUILDINGS.dorm;
  const isNight = state.minutes >= 1340 || state.minutes < 380;
  const isDusk = state.minutes >= 1030 && state.minutes < 1150;

  stageEl.classList.toggle('night', isNight);
  stageEl.classList.toggle('dusk', !isNight && isDusk);

  $('clockTime').textContent = fmtTime(state.minutes);
  $('clockDay').textContent = `${DAYS[state.dayIdx]} · 第8教学周`;
  $('clockWeather').textContent = isNight ? '夜微风 17°C' : isDusk ? '落日 20°C' : '晴 22°C';
  $('sliderTimeVal').textContent = fmtTime(state.minutes);
  $('timeSlider').value = String(state.minutes);

  const modeLabel = state.sceneMode === 'indoor' ? '室内' : '室外';
  $('hudActivityTitle').textContent = `${bldg.icon} ${slot.title}`;
  $('hudLocationTag').textContent = `${bldg.name} · ${modeLabel}`;
  $('hudProgressFill').style.width = `${slot.pct}%`;

  $('btnSyncClock').classList.toggle('active', state.liveSync);
  $('syncLabel').textContent = state.liveSync ? '实时同步' : '自由漫游';
}

// ==================== 3D Real Walking Navigation + Building Entry Transition ====================
function beginOutdoorWalk(dest) {
  const fromName = BUILDINGS[state.currentBuilding]?.shortName || '校园步道';
  state.sceneMode = 'outdoor';
  state.isWalking = true;
  state.walkStartX = state.avatarX;
  state.walkDir = dest.x >= state.avatarX ? 1 : -1;
  state.pose = 'walk';
  $('walkBanner').classList.remove('hidden');
  $('walkBannerText').textContent = `林小夏正在从 ${fromName} 步行前往 ${dest.shortName}...`;
  setSpeech(`出发！正沿着手绘林荫道走路去 ${dest.shortName}～`);
  updateIndoorButton();
  updateClockUi();
}

function walkToBuilding(bldgId, opts = {}) {
  const dest = BUILDINGS[bldgId];
  if (!dest) return;
  state.manualPanOffset = 0;
  state.targetBuilding = bldgId;
  state.targetX = dest.x;
  state.pendingPanel = opts.panel || dest.defaultPanel;
  state.pendingCourseId = opts.courseId || null;

  document.querySelectorAll('#buildingNav .bldg-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.bldg === bldgId);
  });

  const dist = Math.abs(dest.x - state.avatarX);
  if (dist < 14) {
    arriveAtBuilding(dest);
    return;
  }

  // If currently inside a building, play smooth exit transition first, then walk outside!
  if (state.sceneMode === 'indoor') {
    exitToCampusStreet(() => beginOutdoorWalk(dest));
  } else {
    beginOutdoorWalk(dest);
  }
}

function arriveAtBuilding(dest) {
  const prev = state.currentBuilding;
  state.isWalking = false;
  state.currentBuilding = dest.id;
  state.avatarX = dest.x;
  $('walkBanner').classList.add('hidden');

  if (prev !== dest.id) {
    side.addLog('校园步行', `从 ${BUILDINGS[prev]?.shortName || '校园'} 步行抵达 ${dest.name} 并进入室内。`);
  }

  const openPanel = () => {
    if (state.pendingPanel) {
      shellEl.classList.remove('side-collapsed');
      $('btnToggleSide').classList.add('active');
      $('toggleSideText').textContent = '收起侧窗';
      setTimeout(resize, 300);
      side.setPanel(state.pendingPanel, { courseId: state.pendingCourseId });
      state.pendingPanel = null;
      state.pendingCourseId = null;
    }
  };

  // Play cinematic building entry transition into that building's hand-drawn indoor room!
  if (state.sceneMode !== 'indoor' || prev !== dest.id) {
    runSceneTransition(dest.icon, `正在推门进入 · ${dest.name}`, dest.indoorTitle, () => {
      state.sceneMode = 'indoor';
      state.pose = dest.defaultPose;
      setSpeech(dest.speech);
      updateClockUi();
      openPanel();
    });
  } else {
    state.pose = dest.defaultPose;
    setSpeech(dest.speech);
    updateIndoorButton();
    updateClockUi();
    openPanel();
  }
}

// Guided signature journey: 梅园宿舍室内起床 → 走出宿舍转场 → 3D 步行去逸夫教学楼 → 推门进教室签到上 AI 课!
function startWakeupToClassJourney() {
  state.liveSync = false;
  state.minutes = 475; // 07:55
  state.avatarX = BUILDINGS.dorm.x;
  state.currentBuilding = 'dorm';
  state.sceneMode = 'indoor';
  state.camWorldX = BUILDINGS.dorm.x + 60;
  updateClockUi();
  toast('晨间路线：离开梅园402宿舍 → 3D 步行去逸夫教学楼 → 进入教室签到上 AI 课！');
  walkToBuilding('teaching', { panel: 'checkin', courseId: 'agent_loop' });
}

// ==================== Weekly Timetable Modal ====================
function buildScheduleTable() {
  const tbl = $('scheduleTable');
  let html = '<thead><tr><th>节次 / 时段</th>' + DAYS.map((d) => `<th>${d}</th>`).join('') + '</tr></thead><tbody>';
  SCHEDULE_SLOTS.forEach((slot) => {
    html += `<tr><td style="white-space:nowrap;font-family:monospace;color:#64748b;">${slot.label}</td>`;
    slot.cells.forEach((cell, dIdx) => {
      const b = BUILDINGS[cell.bldg];
      html += `<td><button type="button" class="sched-cell-btn" data-d="${dIdx}" data-m="${slot.range[0] + 10}" data-bldg="${cell.bldg}" data-panel="${cell.panel}" data-course="${cell.courseId || ''}">
        <strong>${b.icon} ${cell.title}</strong><span>${b.shortName}</span>
      </button></td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  tbl.innerHTML = html;

  tbl.querySelectorAll('.sched-cell-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.liveSync = false;
      state.dayIdx = parseInt(btn.dataset.d, 10);
      state.minutes = parseInt(btn.dataset.m, 10);
      $('scheduleModal').classList.add('hidden');
      walkToBuilding(btn.dataset.bldg, {
        panel: btn.dataset.panel,
        courseId: btn.dataset.course || null,
      });
    });
  });
}

// ==================== Event Wiring ====================
document.querySelectorAll('#buildingNav .bldg-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.liveSync = false;
    walkToBuilding(btn.dataset.bldg);
  });
});

$('btnToggleIndoor').addEventListener('click', () => {
  if (state.isWalking || state.isTransitioning) return;
  if (state.sceneMode === 'indoor') exitToCampusStreet();
  else enterCurrentBuilding(state.currentBuilding);
});

document.querySelectorAll('#sideTabs .side-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const p = tab.dataset.panel;
    side.setPanel(p);
    if (p === 'lab' && state.targetBuilding !== 'lab') walkToBuilding('lab', { panel: 'lab' });
    else if (p === 'library' && state.targetBuilding !== 'library') walkToBuilding('library', { panel: 'library' });
    else if (p === 'canteen' && state.targetBuilding !== 'canteen') walkToBuilding('canteen', { panel: 'canteen' });
    else if (p === 'stadium' && state.targetBuilding !== 'stadium') walkToBuilding('stadium', { panel: 'stadium' });
    else if (p === 'mall' && state.targetBuilding !== 'mall') walkToBuilding('mall', { panel: 'mall' });
    else if ((p === 'checkin' || p === 'textbook' || p === 'exam') && state.targetBuilding !== 'teaching') {
      walkToBuilding('teaching', { panel: p });
    }
  });
});

$('btnJourney').addEventListener('click', startWakeupToClassJourney);
$('btnOpenSchedule').addEventListener('click', () => $('scheduleModal').classList.remove('hidden'));
$('btnCloseSchedule').addEventListener('click', () => $('scheduleModal').classList.add('hidden'));
$('btnOpenLifeLog').addEventListener('click', () => {
  shellEl.classList.remove('side-collapsed');
  $('btnToggleSide').classList.add('active');
  $('toggleSideText').textContent = '收起侧窗';
  side.setPanel('lifelog');
  setTimeout(resize, 300);
});

$('btnToggleSide').addEventListener('click', () => {
  const collapsed = shellEl.classList.toggle('side-collapsed');
  $('btnToggleSide').classList.toggle('active', !collapsed);
  $('toggleSideText').textContent = collapsed ? '展开侧窗' : '收起侧窗';
  setTimeout(resize, 300);
});

$('timeSlider').addEventListener('input', (e) => {
  state.liveSync = false;
  state.minutes = parseInt(e.target.value, 10);
  const slot = getScheduleSlot(state.dayIdx, state.minutes);
  updateClockUi();
  if (slot.bldg !== state.targetBuilding) {
    walkToBuilding(slot.bldg, { panel: slot.panel, courseId: slot.courseId });
  }
});

function syncRealNow() {
  const now = new Date();
  state.liveSync = true;
  state.dayIdx = (now.getDay() + 6) % 7;
  state.minutes = now.getHours() * 60 + now.getMinutes();
  const slot = getScheduleSlot(state.dayIdx, state.minutes);
  updateClockUi();
  walkToBuilding(slot.bldg, { panel: slot.panel, courseId: slot.courseId });
  toast('已同步真实校园时钟与 AI 专业课表');
}
$('btnNow').addEventListener('click', syncRealNow);
$('btnSyncClock').addEventListener('click', syncRealNow);

// Drag-to-pan outdoor campus street OR click any building directly to walk & enter!
let dragStartX = 0;
let dragStartPan = 0;
let isDragging = false;
let movedDist = 0;

bgCv.addEventListener('pointerdown', (e) => {
  if (state.sceneMode === 'indoor') return;
  isDragging = true;
  movedDist = 0;
  dragStartX = e.clientX;
  dragStartPan = state.manualPanOffset;
  bgCv.setPointerCapture(e.pointerId);
});

bgCv.addEventListener('pointermove', (e) => {
  if (!isDragging || state.sceneMode === 'indoor') return;
  const dx = e.clientX - dragStartX;
  movedDist = Math.max(movedDist, Math.abs(dx));
  state.manualPanOffset = Math.max(-2400, Math.min(2400, dragStartPan - dx / cam.s));
});

bgCv.addEventListener('pointerup', (e) => {
  if (!isDragging) return;
  isDragging = false;
  if (movedDist < 8 && state.sceneMode === 'outdoor') {
    const r = bgCv.getBoundingClientRect();
    const hit = hitTestBuilding(e.clientX, e.clientY, r, cam, state);
    if (hit) {
      state.liveSync = false;
      walkToBuilding(hit);
    }
  }
});

// ==================== Main Animation Loop ====================
let lastTs = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastTs) / 1000);
  lastTs = now;
  state.clock += dt;

  // Step 3D walking along the outdoor campus street
  if (state.isWalking && state.sceneMode === 'outdoor') {
    const walkSpeed = 148; // campus units / sec
    const dx = state.targetX - state.avatarX;
    const step = walkSpeed * dt;
    if (Math.abs(dx) <= step) {
      arriveAtBuilding(BUILDINGS[state.targetBuilding]);
    } else {
      state.avatarX += Math.sign(dx) * step;
      // Tie walkPhase tightly to real distance walked so sneakers never slip!
      state.walkPhase += (step / 22) * Math.PI * 0.88;
      const totalDist = Math.max(1, Math.abs(state.targetX - state.walkStartX));
      const pct = Math.min(100, Math.round((Math.abs(state.avatarX - state.walkStartX) / totalDist) * 100));
      $('walkProgressFill').style.width = `${pct}%`;
    }
  }

  // Smooth camera follow on Xiaoxia
  state.camWorldX += (state.avatarX - state.camWorldX) * Math.min(1, dt * 4.8);
  updateCamera();

  // Keep speech bubble floating cleanly above Xiaoxia's head (both indoor & outdoor!)
  const renderX = state.sceneMode === 'indoor' ? 0 : state.avatarX;
  const headScreenX = renderX * cam.s + cam.x;
  const headScreenY = -142 * cam.s + cam.y;
  const bubble = $('speechBubble');
  bubble.style.left = `${Math.max(170, Math.min(cw - 170, headScreenX))}px`;
  bubble.style.top = `${Math.max(92, headScreenY - 48)}px`;

  drawCampusBackground(bgCtx, cw, ch, dpr, cam, state);
  avatar3d.updateAndRender(state, cam, cw, ch, dt);
  drawCampusForeground(fgCtx, cw, ch, dpr, cam, state);

  requestAnimationFrame(frame);
}

// Init
buildScheduleTable();
resize();
updateClockUi();
updateIndoorButton();
side.setPanel('checkin');
avatar3d.loadModel('assets/xiaoxia.glb').catch(() => {
  avatar3d.loadModel('assets/alexis.glb').catch(() => {});
});

// Start inside Dorm 402 (showing hand-drawn loft bed + study desk!), then after 1.6s exit dorm & walk to Teaching Building!
setTimeout(() => {
  walkToBuilding('teaching', { panel: 'checkin', courseId: 'agent_loop' });
}, 1600);

requestAnimationFrame(frame);
