// Draggable & Resizable Live Streamer Webcam PiP Window + Tactile Mechanical Keyboard Visualizer
import { speakLine } from './audio.js';

export class StreamerPip {
  constructor() {
    this.el = document.getElementById('streamerPip');
    this.dragHandle = document.getElementById('pipDragHandle');
    this.nameEl = document.getElementById('pipName');
    this.viewersEl = document.getElementById('pipViewers');
    this.camStage = document.getElementById('camStage');
    this.actionChip = document.getElementById('camActionChip');
    this.subtitleEl = document.getElementById('camSubtitle');
    this.audioBars = document.getElementById('audioBars');

    this.camVideo = document.getElementById('camVideo');
    this.imgs = {
      idle: document.getElementById('camImgIdle'),
      press: document.getElementById('camImgPress'),
      cheer: document.getElementById('camImgCheer'),
      miss: document.getElementById('camImgMiss'),
    };
    this.fallbackCanvas = document.getElementById('camFallbackCanvas');
    this.fctx = this.fallbackCanvas.getContext('2d');

    this.mkSpace = document.getElementById('mkSpace');
    this.kbSpaceFill = document.getElementById('kbSpaceFill');
    this.kbSpaceText = document.getElementById('kbSpaceText');
    this.kbPowerVal = document.getElementById('kbPowerVal');
    this.kbHoldVal = document.getElementById('kbHoldVal');
    this.miniKeys = {
      W: document.getElementById('mkW'),
      A: document.getElementById('mkA'),
      S: document.getElementById('mkS'),
      D: document.getElementById('mkD'),
      R: document.getElementById('mkR'),
    };

    this.muteBtn = document.getElementById('pipMuteBtn');
    this.sizeBtn = document.getElementById('pipSizeBtn');
    this.closeBtn = document.getElementById('pipCloseBtn');
    this.uploadBtn = document.getElementById('pipUploadBtn');
    this.photoInput = document.getElementById('pipPhotoInput');

    this.persona = null;
    this.customMediaUrl = null;
    this.loadedPhotos = { idle: false, press: false, cheer: false, miss: false };
    this.hasVideo = false;
    this.videoMap = null;
    this.activeVideoSrc = '';
    this.camState = 'idle'; // idle | press | cheer | miss
    this.stateResetTimer = null;
    this.talkTimer = null;
    this.sizeIdx = 1; // 0: sm, 1: md, 2: lg
    this.viewers = 2680;
    this.spaceDown = false;
    this.holdStartMs = 0;
    this.chargePct = 0;
    this.animTime = 0;
    this.blinkPhase = 0;

    this._initEvents();
    this._startFallbackLoop();
  }

  _initEvents() {
    // Dragging support
    let dragging = false;
    let startX = 0, startY = 0;
    let initLeft = 0, initTop = 0;

    this.dragHandle.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      dragging = true;
      const rect = this.el.getBoundingClientRect();
      initLeft = rect.left;
      initTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      this.el.style.left = `${initLeft}px`;
      this.el.style.top = `${initTop}px`;
      this.el.style.right = 'auto';
      this.el.style.bottom = 'auto';
      this.dragHandle.setPointerCapture(e.pointerId);
    });

    this.dragHandle.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const maxX = Math.max(8, window.innerWidth - this.el.offsetWidth - 8);
      const maxY = Math.max(8, window.innerHeight - this.el.offsetHeight - 8);
      const nx = Math.max(8, Math.min(maxX, initLeft + dx));
      const ny = Math.max(8, Math.min(maxY, initTop + dy));
      this.el.style.left = `${nx}px`;
      this.el.style.top = `${ny}px`;
    });

    const stopDrag = () => { dragging = false; };
    this.dragHandle.addEventListener('pointerup', stopDrag);
    this.dragHandle.addEventListener('pointercancel', stopDrag);

    // Size toggle
    this.sizeBtn.addEventListener('click', () => {
      this.sizeIdx = (this.sizeIdx + 1) % 3;
      this.el.classList.remove('size-sm', 'size-lg');
      if (this.sizeIdx === 0) this.el.classList.add('size-sm');
      if (this.sizeIdx === 2) this.el.classList.add('size-lg');
    });

    // Close button
    this.closeBtn.addEventListener('click', () => {
      this.setVisible(false);
      if (this.onVisibilityChange) this.onVisibilityChange(false);
    });

    // Video mute/unmute toggle
    if (this.muteBtn && this.camVideo) {
      this.muteBtn.addEventListener('click', () => {
        this.camVideo.muted = !this.camVideo.muted;
        this.muteBtn.textContent = this.camVideo.muted ? '🔇' : '🔊';
        if (!this.camVideo.muted && this.camVideo.paused) {
          this.camVideo.play().catch(() => {});
        }
      });
    }

    // Resume muted autoplay on first user gesture if browser deferred it
    const ensureVideoPlaying = () => {
      if (this.hasVideo && this.camVideo && this.camVideo.paused && this.isVisible()) {
        this.camVideo.play().catch(() => {});
      }
    };
    window.addEventListener('pointerdown', ensureVideoPlaying, { passive: true });
    window.addEventListener('keydown', ensureVideoPlaying, { passive: true });

    // Custom video/photo upload (click or drag-and-drop onto PiP)
    const applyFile = (file) => {
      if (!file) return;
      if (file.type.startsWith('video/')) {
        if (this.customMediaUrl) URL.revokeObjectURL(this.customMediaUrl);
        this.customMediaUrl = URL.createObjectURL(file);
        this._loadVideoSource(this.customMediaUrl);
        this.say('换上新真人视频啦！开播继续投篮～');
        return;
      }
      if (!file.type.startsWith('image/')) return;
      if (this.customMediaUrl) URL.revokeObjectURL(this.customMediaUrl);
      this.customMediaUrl = URL.createObjectURL(file);
      this._clearVideo();
      this._loadPhotoSet({
        idle: this.customMediaUrl,
        press: this.customMediaUrl,
        cheer: this.customMediaUrl,
        miss: this.customMediaUrl,
      });
      this.say('换上新主播照片啦！开播继续投篮～');
    };
    this.uploadBtn.addEventListener('click', () => this.photoInput.click());
    this.photoInput.addEventListener('change', (e) => applyFile(e.target.files?.[0]));
    this.el.addEventListener('dragover', (e) => { e.preventDefault(); });
    this.el.addEventListener('drop', (e) => {
      e.preventDefault();
      applyFile(e.dataTransfer?.files?.[0]);
    });
  }

  setVisible(visible) {
    this.el.classList.toggle('hidden', !visible);
    if (this.camVideo && this.hasVideo) {
      if (visible) this.camVideo.play().catch(() => {});
      else this.camVideo.pause();
    }
  }

  isVisible() {
    return !this.el.classList.contains('hidden');
  }

  setPersona(persona) {
    this.persona = persona;
    this.nameEl.textContent = persona.roomTitle;
    this.viewers = persona.baseViewers + Math.floor(Math.random() * 240);
    this._renderViewers();
    if (this.customMediaUrl) {
      URL.revokeObjectURL(this.customMediaUrl);
      this.customMediaUrl = null;
    }
    if (persona.videos || persona.video) {
      this._loadPhotoSet({});
      this._loadVideoSource(persona.videos || persona.video);
    } else {
      this._clearVideo();
      this._loadPhotoSet(persona.photos || {});
    }
    this.setAction('idle', '准备瞄准');
  }

  _clearVideo() {
    this.hasVideo = false;
    this.videoMap = null;
    this.activeVideoSrc = '';
    this.camStage.classList.remove('has-video');
    if (this.muteBtn) {
      this.muteBtn.classList.add('hidden');
      this.muteBtn.textContent = '🔇';
    }
    if (this.camVideo) {
      this.camVideo.pause();
      this.camVideo.muted = true;
      this.camVideo.removeAttribute('src');
      this.camVideo.load();
    }
  }

  _loadVideoSource(source) {
    if (!this.camVideo || !source) {
      this._clearVideo();
      return;
    }
    if (typeof source === 'string') {
      this.videoMap = { idle: source, press: source, cheer: source, miss: source };
    } else {
      this.videoMap = source;
    }
    const targetSrc = this.videoMap[this.camState] || this.videoMap.idle || Object.values(this.videoMap)[0];
    if (!targetSrc) {
      this._clearVideo();
      return;
    }
    this._setVideoSrc(targetSrc);
  }

  _setVideoSrc(src) {
    if (!this.camVideo || !src || this.activeVideoSrc === src) return;
    this.activeVideoSrc = src;
    this.hasVideo = false;
    this.camStage.classList.remove('has-video');

    const onReady = () => {
      if (this.activeVideoSrc !== src) return;
      this.hasVideo = true;
      this.camStage.classList.add('has-video');
      if (this.muteBtn) {
        this.muteBtn.classList.remove('hidden');
        this.muteBtn.textContent = this.camVideo.muted ? '🔇' : '🔊';
      }
      if (this.isVisible()) {
        this.camVideo.play().catch(() => {});
      }
    };
    const onError = () => {
      if (this.activeVideoSrc !== src) return;
      this._clearVideo();
      if (this.persona?.photos) {
        this._loadPhotoSet(this.persona.photos);
      }
    };

    this.camVideo.onloadeddata = onReady;
    this.camVideo.oncanplay = onReady;
    this.camVideo.onerror = onError;
    this.camVideo.muted = true;
    this.camVideo.loop = true;
    this.camVideo.playsInline = true;
    this.camVideo.src = src;
    this.camVideo.load();
  }

  _syncVideoState(state) {
    if (!this.camVideo || !this.videoMap) return;
    const nextSrc = this.videoMap[state] || this.videoMap.idle;
    if (nextSrc && nextSrc !== this.activeVideoSrc) {
      this._setVideoSrc(nextSrc);
    }
    if (this.hasVideo) {
      const rateByState = { idle: 1.0, press: 0.86, cheer: 1.16, miss: 0.94 };
      this.camVideo.playbackRate = rateByState[state] ?? 1.0;
      if (this.camVideo.paused && this.isVisible()) {
        this.camVideo.play().catch(() => {});
      }
    }
  }

  _loadPhotoSet(photos) {
    this.loadedPhotos = { idle: false, press: false, cheer: false, miss: false };
    this.camStage.classList.remove('has-photo');

    const keys = ['idle', 'press', 'cheer', 'miss'];
    keys.forEach((k) => {
      const img = this.imgs[k];
      const src = photos[k];
      if (!src) {
        img.removeAttribute('src');
        return;
      }
      img.onload = () => {
        this.loadedPhotos[k] = true;
        this.camStage.classList.add('has-photo');
        this._syncActiveImg();
      };
      img.onerror = () => {
        this.loadedPhotos[k] = false;
        if (!Object.values(this.loadedPhotos).some(Boolean)) {
          this.camStage.classList.remove('has-photo');
        }
      };
      img.src = src;
    });
  }

  _syncActiveImg() {
    const preferred = this.loadedPhotos[this.camState] ? this.camState : 'idle';
    for (const [k, img] of Object.entries(this.imgs)) {
      img.classList.toggle('active', k === preferred && this.loadedPhotos[k]);
    }
  }

  setAction(state, label, autoResetMs = 0) {
    clearTimeout(this.stateResetTimer);
    this.camState = state;
    this.camStage.dataset.state = state;
    this._syncActiveImg();
    this._syncVideoState(state);

    this.actionChip.textContent = label;
    this.actionChip.className = 'cam-status-chip';
    if (state === 'press') this.actionChip.classList.add('holding');
    else if (state === 'cheer') this.actionChip.classList.add('cheer');
    else if (state === 'miss') this.actionChip.classList.add('miss');

    if (autoResetMs > 0) {
      this.stateResetTimer = setTimeout(() => {
        if (!this.spaceDown) {
          this.setAction('idle', '等待下一球');
        }
      }, autoResetMs);
    }
  }

  say(text, speak = true) {
    if (!text) return;
    this.subtitleEl.textContent = text;
    this.subtitleEl.classList.remove('pop');
    void this.subtitleEl.offsetWidth;
    this.subtitleEl.classList.add('pop');

    this.audioBars.classList.add('talking');
    clearTimeout(this.talkTimer);
    this.talkTimer = setTimeout(() => {
      this.audioBars.classList.remove('talking');
    }, Math.min(3400, Math.max(1300, text.length * 115)));

    if (speak && this.persona?.tts) {
      speakLine(text, this.persona.tts);
    }
  }

  bumpViewers(delta) {
    this.viewers = Math.max(120, this.viewers + delta);
    this._renderViewers();
  }

  _renderViewers() {
    this.viewersEl.textContent = `👁 ${this.viewers.toLocaleString()}`;
  }

  setSpacePressed(pressed, charge = 0) {
    this.spaceDown = pressed;
    this.chargePct = Math.round(charge * 100);
    this.mkSpace.classList.toggle('pressed', pressed);
    if (pressed) {
      this.holdStartMs = performance.now();
      this.kbSpaceText.textContent = 'SPACE · 长按蓄力中...';
      this.setAction('press', '⌨ 长按空格蓄力');
      // Subtle finger rest flicker on A/D keys for realism
      if (Math.random() < 0.35) this.flashKey(Math.random() < 0.5 ? 'A' : 'D', 140);
    } else {
      const held = this.holdStartMs ? Math.round(performance.now() - this.holdStartMs) : 0;
      if (held > 0) this.kbHoldVal.textContent = `${held}ms`;
      this.kbSpaceText.textContent = 'SPACE · 松手出手！';
      setTimeout(() => {
        if (!this.spaceDown) {
          this.kbSpaceText.textContent = 'SPACE · 空格蓄力投篮';
          this.kbSpaceFill.style.width = '0%';
        }
      }, 360);
    }
  }

  updateTelemetry(charge) {
    if (!this.spaceDown) return;
    const pct = Math.round(charge * 100);
    this.chargePct = pct;
    this.kbPowerVal.textContent = `${pct}%`;
    this.kbSpaceFill.style.width = `${pct}%`;
    const held = Math.max(0, Math.round(performance.now() - this.holdStartMs));
    this.kbHoldVal.textContent = `${held}ms`;
  }

  flashKey(letter, ms = 160) {
    const el = this.miniKeys[letter];
    if (!el) return;
    el.classList.add('pressed');
    setTimeout(() => el.classList.remove('pressed'), ms);
  }

  // Live high-craft animated desk-cam fallback renderer (active whenever custom/AI video or photo files are absent)
  _startFallbackLoop() {
    const renderCam = (now) => {
      if (
        !this.camStage.classList.contains('has-video') &&
        !this.camStage.classList.contains('has-photo') &&
        this.isVisible()
      ) {
        this._drawFallbackWebcam(now * 0.001);
      }
      requestAnimationFrame(renderCam);
    };
    requestAnimationFrame(renderCam);
  }

  _drawFallbackWebcam(t) {
    const cv = this.fallbackCanvas;
    const w = 480;
    const h = 300;
    if (cv.width !== w || cv.height !== h) {
      cv.width = w;
      cv.height = h;
    }
    const ctx = this.fctx;
    const pid = this.persona?.id || 'campus_girl';
    const pal = this.persona?.outfitPalette || {
      hair: '#2b1e1a',
      skin: '#fde2ce',
      jacket: '#ffffff',
      stripe: '#f59e0b',
      ribbon: '#fcd34d',
      roomWall: '#f7efe3',
      desk: '#e6c9a2',
      keycap: '#fffaf0',
    };
    const isGirl = pid === 'campus_girl' || pid === 'chill_scholar' || pid === 'human';

    ctx.clearRect(0, 0, w, h);

    // 1. Cinematic sunlit campus room backdrop with soft depth-of-field bokeh
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, pal.roomWall);
    bgGrad.addColorStop(0.65, '#eae2d7');
    bgGrad.addColorStop(1, '#d9cfc2');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Warm window sunlight shaft on left
    const sunGrad = ctx.createRadialGradient(72, 48, 12, 72, 48, 220);
    sunGrad.addColorStop(0, 'rgba(255, 250, 232, 0.92)');
    sunGrad.addColorStop(0.5, 'rgba(255, 241, 206, 0.35)');
    sunGrad.addColorStop(1, 'rgba(255, 241, 206, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);

    // Soft out-of-focus fairy/bokeh lights
    for (const [bx, by, br, ba] of [[390, 38, 18, 0.25], [435, 72, 12, 0.2], [58, 92, 14, 0.24], [342, 84, 9, 0.18]]) {
      ctx.fillStyle = `rgba(255, 248, 220, ${ba + Math.sin(t * 1.4 + bx) * 0.05})`;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    // Background shelf + realistic shaded basketball + framed pennant
    ctx.fillStyle = 'rgba(138, 111, 86, 0.38)';
    ctx.fillRect(326, 86, 134, 8);
    ctx.fillStyle = 'rgba(105, 82, 62, 0.22)';
    ctx.fillRect(326, 94, 134, 4);

    // Basketball on shelf
    const bx = 382, by = 62, bRad = 23;
    const ballG = ctx.createRadialGradient(bx - 7, by - 7, 3, bx, by, bRad);
    ballG.addColorStop(0, '#f7a55b');
    ballG.addColorStop(0.7, '#d97328');
    ballG.addColorStop(1, '#9e4710');
    ctx.fillStyle = ballG;
    ctx.beginPath();
    ctx.arc(bx, by, bRad, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(65, 30, 12, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(bx - bRad, by);
    ctx.lineTo(bx + bRad, by);
    ctx.moveTo(bx, by - bRad);
    ctx.lineTo(bx, by + bRad);
    ctx.stroke();

    // Soft window curtain slats & potted plant on left
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(0, 0, 56, 215);
    ctx.fillStyle = 'rgba(64, 132, 86, 0.45)';
    ctx.beginPath();
    ctx.ellipse(54, 152, 26, 12, -0.42, 0, Math.PI * 2);
    ctx.ellipse(74, 142, 22, 10, 0.5, 0, Math.PI * 2);
    ctx.ellipse(42, 138, 18, 9, -0.8, 0, Math.PI * 2);
    ctx.fill();

    // 2. Character posture motion synced to live gameplay
    const breathe = Math.sin(t * 2.1) * 2.0;
    const pressLean = this.camState === 'press' ? 7 : 0;
    const cheerLift = this.camState === 'cheer' ? -9 : 0;
    const missSway = this.camState === 'miss' ? Math.sin(t * 14) * 3.5 : 0;
    const cx = w * 0.5 + missSway;
    const cy = 128 + breathe + pressLean + cheerLift;

    // Back hair / high swinging ponytail (campus_girl)
    if (this.persona?.accessory === 'ponytail') {
      const sway = Math.sin(t * 3.0) * 5.5 + (this.camState === 'cheer' ? -6 : 0);
      ctx.save();
      const hairG = ctx.createLinearGradient(cx + 20, cy - 55, cx + 88, cy + 20);
      hairG.addColorStop(0, pal.hair);
      hairG.addColorStop(0.5, '#47332b');
      hairG.addColorStop(1, pal.hair);
      ctx.fillStyle = hairG;
      ctx.beginPath();
      ctx.moveTo(cx + 22, cy - 48);
      ctx.bezierCurveTo(cx + 72, cy - 64 + sway * 0.4, cx + 92 + sway, cy - 12, cx + 76 + sway, cy + 36);
      ctx.bezierCurveTo(cx + 62 + sway * 0.5, cy + 16, cx + 46, cy - 6, cx + 26, cy - 22);
      ctx.closePath();
      ctx.fill();

      // Athletic yellow hair ribbon
      ctx.fillStyle = pal.ribbon;
      ctx.beginPath();
      ctx.ellipse(cx + 31, cy - 44, 10, 6, 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(cx + 35, cy - 41);
      ctx.lineTo(cx + 50, cy - 25 + sway * 0.3);
      ctx.lineTo(cx + 42, cy - 23 + sway * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (pid === 'chill_scholar') {
      // Soft shoulder-length bob behind neck
      ctx.fillStyle = pal.hair;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 4, 46, 54, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Torso & Sporty Campus Varsity Jacket / Basketball Jersey
    ctx.save();
    const bodyG = ctx.createLinearGradient(cx - 86, cy + 30, cx + 86, 240);
    bodyG.addColorStop(0, pal.jacket);
    bodyG.addColorStop(1, pid === 'basketball_bro' ? '#142947' : '#eceef2');
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.moveTo(cx - 90, 240);
    ctx.quadraticCurveTo(cx - 78, cy + 38, cx - 28, cy + 32);
    ctx.lineTo(cx + 28, cy + 32);
    ctx.quadraticCurveTo(cx + 78, cy + 38, cx + 90, 240);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(30, 35, 45, 0.14)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Shoulder varsity stripes
    ctx.strokeStyle = pal.stripe;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 52, cy + 44);
    ctx.lineTo(cx - 66, 224);
    ctx.moveTo(cx + 52, cy + 44);
    ctx.lineTo(cx + 66, 224);
    ctx.stroke();

    // Sporty inner collar & jersey number badge
    ctx.fillStyle = pid === 'basketball_bro' ? '#ffffff' : '#fef3c7';
    ctx.beginPath();
    ctx.moveTo(cx - 19, cy + 32);
    ctx.lineTo(cx, cy + 72);
    ctx.lineTo(cx + 19, cy + 32);
    ctx.closePath();
    ctx.fill();

    // Chest varsity number
    ctx.fillStyle = pal.stripe;
    ctx.font = "900 16px 'Balsamiq Sans', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(pid === 'basketball_bro' ? '11' : pid === 'sports_boy' ? '23' : '07', cx + 26, cy + 74);
    ctx.restore();

    // Neck with soft chin shadow
    ctx.fillStyle = pal.skin;
    ctx.fillRect(cx - 12, cy + 16, 24, 24);
    ctx.fillStyle = 'rgba(180, 118, 86, 0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 24, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head with subtle skin shading & warm rim glow
    const faceG = ctx.createRadialGradient(cx - 12, cy - 22, 6, cx, cy - 12, 46);
    faceG.addColorStop(0, '#fff0e4');
    faceG.addColorStop(0.7, pal.skin);
    faceG.addColorStop(1, '#ecc1a5');
    ctx.fillStyle = faceG;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 12, 35, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = pal.skin;
    ctx.beginPath();
    ctx.ellipse(cx - 34, cy - 8, 5, 8.5, -0.1, 0, Math.PI * 2);
    ctx.ellipse(cx + 34, cy - 8, 5, 8.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Soft natural blush
    ctx.fillStyle = isGirl ? 'rgba(244, 114, 130, 0.24)' : 'rgba(220, 130, 110, 0.12)';
    ctx.beginPath();
    ctx.ellipse(cx - 19, cy - 2, 8.5, 4.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 19, cy - 2, 8.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Expressive Eyes + Eyebrows
    const blink = (t % 4.1) > 3.98;
    const lookY = this.camState === 'press' ? 2.2 : 0;

    // Eyebrows
    ctx.strokeStyle = pal.hair;
    ctx.lineWidth = 2.1;
    ctx.lineCap = 'round';
    const browDip = this.camState === 'press' ? 2.2 : this.camState === 'cheer' ? -2.2 : 0;
    ctx.beginPath();
    ctx.moveTo(cx - 21, cy - 23 + browDip * 0.4);
    ctx.quadraticCurveTo(cx - 13, cy - 26 + browDip, cx - 7, cy - 22 + browDip);
    ctx.moveTo(cx + 21, cy - 23 + browDip * 0.4);
    ctx.quadraticCurveTo(cx + 13, cy - 26 + browDip, cx + 7, cy - 22 + browDip);
    ctx.stroke();

    if (this.camState === 'cheer') {
      ctx.strokeStyle = '#1f2329';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(cx - 13, cy - 11, 6, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 13, cy - 11, 6, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (blink) {
      ctx.strokeStyle = '#1f2329';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx - 19, cy - 12);
      ctx.lineTo(cx - 7, cy - 12);
      ctx.moveTo(cx + 7, cy - 12);
      ctx.lineTo(cx + 19, cy - 12);
      ctx.stroke();
    } else {
      for (const side of [-1, 1]) {
        const ex = cx + side * 13.5;
        const ey = cy - 12 + lookY;
        // Sclera
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(ex, ey, 6.2, isGirl ? 5.2 : 4.2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Iris
        ctx.fillStyle = '#2b201c';
        ctx.beginPath();
        ctx.arc(ex, ey + 0.3, isGirl ? 4.2 : 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Catchlight highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex + 1.5, ey - 1.3, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Upper lash line
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = isGirl ? 2.1 : 1.7;
        ctx.beginPath();
        ctx.arc(ex, ey + 0.5, 6.4, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    }

    // Subtle nose & mouth
    ctx.strokeStyle = 'rgba(170, 112, 88, 0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx - 1.5, cy - 1);
    ctx.stroke();

    ctx.strokeStyle = '#c86568';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    if (this.camState === 'cheer') {
      ctx.fillStyle = '#e57373';
      ctx.arc(cx, cy + 6, 8.5, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 5.5, cy + 6, 11, 2.5);
    } else if (this.camState === 'press') {
      ctx.moveTo(cx - 5, cy + 8);
      ctx.quadraticCurveTo(cx, cy + 7, cx + 5, cy + 8);
      ctx.stroke();
    } else if (this.camState === 'miss') {
      ctx.arc(cx, cy + 12, 5.2, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else {
      ctx.arc(cx, cy + 5, 7.5, 0.18, Math.PI - 0.18);
      ctx.stroke();
    }

    // Front Hair Bangs & Specular Shine
    ctx.fillStyle = pal.hair;
    ctx.beginPath();
    ctx.arc(cx, cy - 22, 38, Math.PI * 0.96, Math.PI * 2.04);
    if (isGirl) {
      ctx.lineTo(cx + 39, cy + 10);
      ctx.quadraticCurveTo(cx + 31, cy - 16, cx + 18, cy - 28);
      ctx.quadraticCurveTo(cx + 7, cy - 16, cx + 2, cy - 29);
      ctx.quadraticCurveTo(cx - 9, cy - 16, cx - 18, cy - 28);
      ctx.quadraticCurveTo(cx - 31, cy - 16, cx - 39, cy + 10);
    } else {
      ctx.lineTo(cx + 35, cy - 14);
      ctx.lineTo(cx + 16, cy - 24);
      ctx.lineTo(cx + 4, cy - 16);
      ctx.lineTo(cx - 12, cy - 25);
      ctx.lineTo(cx - 35, cy - 14);
    }
    ctx.closePath();
    ctx.fill();

    // Hair highlight halo
    ctx.strokeStyle = 'rgba(255, 240, 220, 0.22)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(cx, cy - 24, 31, Math.PI * 1.2, Math.PI * 1.75);
    ctx.stroke();

    // Headband or Round Glasses
    if (this.persona?.accessory === 'headband' || this.persona?.accessory === 'spiky') {
      ctx.strokeStyle = pal.ribbon;
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.arc(cx, cy - 18, 36.5, Math.PI * 1.14, Math.PI * 1.86);
      ctx.stroke();
    } else if (this.persona?.accessory === 'ponytail') {
      // Cute campus sport hairclip
      ctx.fillStyle = pal.ribbon;
      ctx.beginPath();
      ctx.roundRect(cx - 28, cy - 30, 12, 4, 2);
      ctx.fill();
    } else if (this.persona?.accessory === 'glasses') {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx - 13.5, cy - 11.5, 9.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 13.5, cy - 11.5, 9.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 4.3, cy - 11.5);
      ctx.lineTo(cx + 4.3, cy - 11.5);
      ctx.stroke();
    }

    // 3. Foreground Study Desk & Compact 75% Mechanical Keyboard
    const deskG = ctx.createLinearGradient(0, 214, 0, h);
    deskG.addColorStop(0, pal.desk);
    deskG.addColorStop(1, '#cba97c');
    ctx.fillStyle = deskG;
    ctx.fillRect(0, 214, w, h - 214);
    ctx.fillStyle = 'rgba(60, 38, 20, 0.14)';
    ctx.fillRect(0, 214, w, 3);

    // Desk mat under keyboard
    ctx.fillStyle = 'rgba(30, 34, 42, 0.14)';
    ctx.beginPath();
    ctx.roundRect(68, 222, 344, 70, 10);
    ctx.fill();

    // Mechanical keyboard body (perspective trapezoid)
    ctx.fillStyle = '#222630';
    ctx.beginPath();
    ctx.moveTo(96, 226);
    ctx.lineTo(384, 226);
    ctx.lineTo(404, 282);
    ctx.lineTo(76, 282);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Glowing RGB / warm amber backlight under spacebar when pressed
    if (this.spaceDown) {
      const glow = ctx.createRadialGradient(240, 270, 8, 240, 270, 88);
      glow.addColorStop(0, 'rgba(252, 211, 77, 0.72)');
      glow.addColorStop(1, 'rgba(252, 211, 77, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(140, 245, 200, 44);
    }

    // Keycap grid (3 rows + bottom spacebar row)
    for (let r = 0; r < 3; r++) {
      const y = 232 + r * 11;
      for (let c = 0; c < 13; c++) {
        const x = 104 + c * 21.4 - r * 3.2;
        ctx.fillStyle = pal.keycap;
        ctx.beginPath();
        ctx.roundRect(x, y, 17, 8, 2);
        ctx.fill();
      }
    }

    // Physical Spacebar keycap (depresses cleanly when AI/user presses Space!)
    const drop = this.spaceDown ? 3.5 : 0;
    ctx.fillStyle = this.spaceDown ? '#f59e0b' : '#fde68a';
    ctx.beginPath();
    ctx.roundRect(166, 267 + drop, 148, 10 - drop * 0.35, 3);
    ctx.fill();

    // 4. Articulated Forearms, Hands & Fingers operating the keyboard!
    ctx.lineCap = 'round';
    if (this.camState === 'cheer') {
      // Excited celebration fists raised!
      for (const side of [-1, 1]) {
        const hx = cx + side * 72;
        const hy = cy + 20 + Math.sin(t * 12) * 3;
        ctx.strokeStyle = pal.jacket;
        ctx.lineWidth = 22;
        ctx.beginPath();
        ctx.moveTo(cx + side * 66, 224);
        ctx.lineTo(hx, hy + 16);
        ctx.stroke();

        ctx.fillStyle = pal.skin;
        ctx.beginPath();
        ctx.arc(hx, hy, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      const lHover = Math.sin(t * 2.5) * 1.5;
      const rPress = this.spaceDown ? 6.5 : Math.sin(t * 3.1 + 0.8) * 1.4;

      // Sleeves coming from shoulders onto desk
      ctx.strokeStyle = pal.jacket;
      ctx.lineWidth = 24;
      ctx.beginPath();
      ctx.moveTo(cx - 76, 232);
      ctx.lineTo(146, 250 + lHover);
      ctx.moveTo(cx + 76, 232);
      ctx.lineTo(306, 252 + rPress * 0.5);
      ctx.stroke();

      // Left hand resting on WASD
      ctx.fillStyle = pal.skin;
      ctx.beginPath();
      ctx.ellipse(154, 248 + lHover, 20, 12, 0.16, 0, Math.PI * 2);
      ctx.fill();
      for (let f = 0; f < 4; f++) {
        ctx.beginPath();
        ctx.roundRect(140 + f * 7.5, 237 + lHover + (f === 1 ? -2 : 0), 5.2, 13, 2.5);
        ctx.fill();
      }

      // Right hand hovering & pressing down directly on the Spacebar!
      ctx.fillStyle = pal.skin;
      ctx.beginPath();
      ctx.ellipse(290, 252 + rPress, 22, 12.5, -0.18, 0, Math.PI * 2);
      ctx.fill();
      // Right thumb pressing Spacebar center
      ctx.beginPath();
      ctx.ellipse(260, 263 + rPress, 13, 6.5, 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Right fingers
      for (let f = 0; f < 3; f++) {
        ctx.beginPath();
        ctx.roundRect(277 + f * 8, 241 + rPress, 5.5, 13, 2.5);
        ctx.fill();
      }
    }
  }
}
