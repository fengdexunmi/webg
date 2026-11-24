// Web Audio Procedural SFX (faithful to Goofy Fish Ten Balls) + Mechanical Keyboard Switch SFX + Optional Chinese TTS

let actx = null;
let bus = null;
let verb = null;

export const soundState = {
  enabled: true,
  ttsEnabled: false,
};

export function ensureAudio() {
  if (!soundState.enabled) return;
  if (!actx) {
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = actx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      comp.connect(actx.destination);

      bus = actx.createGain();
      bus.gain.value = 0.9;
      bus.connect(comp);

      const len = Math.floor(actx.sampleRate * 1.1);
      const ir = actx.createBuffer(2, len, actx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = ir.getChannelData(c);
        for (let i = 0; i < len; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
        }
      }
      const conv = actx.createConvolver();
      conv.buffer = ir;
      verb = actx.createGain();
      verb.gain.value = 0.16;
      verb.connect(conv).connect(comp);
    } catch {
      actx = null;
    }
  }
  if (actx && actx.state === 'suspended') {
    actx.resume().catch(() => {});
  }
}

function voice(wet) {
  const g = actx.createGain();
  g.gain.value = 0;
  g.connect(bus);
  if (wet) {
    const w = actx.createGain();
    w.gain.value = wet;
    g.connect(w).connect(verb);
  }
  return g;
}

function partial(freq, f1, dur, vol, type, wet, delay) {
  if (!actx || !soundState.enabled || vol < 0.003) return;
  const t = actx.currentTime + (delay || 0);
  const o = actx.createOscillator();
  const g = voice(wet);
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t);
  if (f1 && f1 !== freq) {
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  }
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function hiss(dur, vol, type, f0, f1, q, wet, attack, delay) {
  if (!actx || !soundState.enabled || vol < 0.003) return;
  const t = actx.currentTime + (delay || 0);
  const n = Math.max(1, Math.floor(actx.sampleRate * dur));
  const buf = actx.createBuffer(1, n, actx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) {
    d[i] = Math.random() * 2 - 1;
  }
  const src = actx.createBufferSource();
  src.buffer = buf;
  const f = actx.createBiquadFilter();
  f.type = type;
  f.Q.value = q || 0.7;
  f.frequency.setValueAtTime(f0, t);
  if (f1 && f1 !== f0) {
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  }
  const g = voice(wet);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + (attack || 0.004));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g);
  src.start(t);
}

export const SND = {
  bounce(k) {
    partial(150, 72, 0.16, 0.5 * k, 'sine', 0.08);
    partial(330, 290, 0.08, 0.1 * k, 'triangle', 0.15);
    hiss(0.035, 0.28 * k, 'lowpass', 1600, 700, 0.6, 0.05);
  },
  rim(k) {
    const parts = [
      [547, 0.55, 1],
      [1171, 0.42, 0.5],
      [1806, 0.3, 0.32],
      [2641, 0.2, 0.2],
      [3390, 0.14, 0.12],
    ];
    for (const [f, d, a] of parts) {
      partial(f, f * 0.995, d * (0.7 + 0.5 * k), 0.13 * k * a, 'sine', 0.35);
    }
    hiss(0.02, 0.12 * k, 'highpass', 3200, 3200, 0.7, 0.2);
  },
  board(k) {
    partial(118, 82, 0.13, 0.42 * k, 'sine', 0.2);
    hiss(0.07, 0.3 * k, 'bandpass', 520, 380, 1.1, 0.25);
    partial(240, 230, 0.18, 0.05 * k, 'square', 0.3, 0.004);
  },
  pole(k) {
    for (const [f, a] of [[311, 1], [702, 0.5], [1113, 0.3]]) {
      partial(f, f, 0.35, 0.09 * k * a, 'sine', 0.3);
    }
    hiss(0.03, 0.12 * k, 'bandpass', 1400, 900, 1, 0.2);
  },
  swish(clean) {
    hiss(0.34, clean ? 0.26 : 0.18, 'bandpass', 5200, 2400, 0.9, 0.25, 0.03);
    hiss(0.16, 0.07, 'highpass', 7000, 6000, 0.7, 0.2, 0.01, 0.02);
    if (clean) {
      partial(1568, 1568, 0.5, 0.035, 'sine', 0.5, 0.06);
      partial(2093, 2093, 0.45, 0.025, 'sine', 0.5, 0.12);
    }
  },
  release() {
    hiss(0.14, 0.06, 'bandpass', 700, 1500, 0.8, 0.1, 0.02);
    partial(900, 600, 0.04, 0.03, 'triangle', 0.1);
  },
  grab() {
    partial(210, 150, 0.06, 0.08, 'sine', 0.05);
  },
  streak(m) {
    const base = m >= 3 ? 784 : 659;
    partial(base, base, 0.22, 0.045, 'triangle', 0.4);
    partial(base * 1.5, base * 1.5, 0.3, 0.035, 'triangle', 0.4, 0.08);
  },
  // Creamy mechanical keyboard spacebar thock
  keyDown() {
    partial(380, 140, 0.038, 0.14, 'triangle', 0.05);
    hiss(0.022, 0.12, 'bandpass', 2600, 1100, 1.4, 0.04, 0.002);
  },
  keyUp() {
    partial(520, 280, 0.026, 0.08, 'triangle', 0.04);
    hiss(0.016, 0.07, 'highpass', 3200, 2200, 0.9, 0.03, 0.002);
  },
};

export function buzz(ms) {
  try {
    if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) {
      navigator.vibrate(ms);
    }
  } catch {
    // ignore
  }
}

let lastSpokeAt = 0;
export function speakLine(text, ttsCfg) {
  if (!soundState.ttsEnabled || !text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  const now = performance.now();
  if (now - lastSpokeAt < 1800) return;
  lastSpokeAt = now;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = ttsCfg?.rate ?? 1.08;
    u.pitch = ttsCfg?.pitch ?? 1.1;
    u.volume = 0.85;
    window.speechSynthesis.speak(u);
  } catch {
    // ignore TTS failures
  }
}
