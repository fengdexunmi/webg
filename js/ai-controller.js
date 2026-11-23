// Physics-Driven AI Player that genuinely holds & releases the Spacebar on the live power bar

function gaussianRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export class AIController {
  constructor(callbacks) {
    this.cb = callbacks; // { pressDown, pressUp, startNextRound, onChargeStart, onTelemetry }
    this.enabled = true;
    this.autoLoop = true;
    this.persona = null;

    this.phase = 'idle'; // idle | waiting | charging | cooldown | restarting
    this.waitTimer = 0;
    this.targetCharge = 0.5785;
    this.useDownswing = false;
    this.reachedPeak = false;
    this.lastCharge = 0;
    this.holdStartMs = 0;
    this.lastMiss = false;
    this.restartTimer = 0;
  }

  setPersona(persona) {
    this.persona = persona;
    this.resetShot();
  }

  setEnabled(flag) {
    if (this.enabled && !flag && this.phase === 'charging') {
      // Release cleanly if user takes over mid-charge
      this.cb.pressUp(true);
    }
    this.enabled = flag;
    this.resetShot();
  }

  setAutoLoop(flag) {
    this.autoLoop = flag;
    if (!flag && this.phase === 'restarting') {
      this.phase = 'idle';
      this.restartTimer = 0;
    }
  }

  resetShot() {
    this.phase = 'idle';
    this.waitTimer = 0;
    this.reachedPeak = false;
    this.lastCharge = 0;
    this.restartTimer = 0;
  }

  onShotResolved(made) {
    this.lastMiss = !made;
  }

  planShot(streak) {
    const ai = this.persona?.ai;
    if (!ai) return;

    const [minD, maxD] = ai.thinkDelay;
    this.waitTimer = minD + Math.random() * (maxD - minD);

    let sigma = ai.jitter;
    if (streak >= 2) {
      sigma = Math.max(0.011, sigma - Math.min(streak, 5) * ai.streakTighten);
    }
    if (streak >= 6) {
      sigma += ai.nervesAtSix;
    }
    if (this.lastMiss) {
      sigma *= ai.missRecovery;
    }

    const noise = gaussianRandom() * sigma;
    this.targetCharge = Math.max(0.42, Math.min(0.76, ai.targetCharge + ai.bias + noise));
    this.useDownswing = Math.random() < ai.preferDownswing;
    this.reachedPeak = false;
    this.lastCharge = 0;
    this.phase = 'waiting';
  }

  update(dt, ctxState) {
    // ctxState: { mode, state, charge, chargeT, streak }
    if (!this.enabled || !this.persona?.isAI) return;

    // Handle auto-looping after round ends
    if (ctxState.mode === 'over') {
      if (!this.autoLoop) return;
      if (this.phase !== 'restarting') {
        this.phase = 'restarting';
        this.restartTimer = 3.4;
      }
      this.restartTimer -= dt;
      if (this.cb.onRestartCountdown) {
        this.cb.onRestartCountdown(Math.max(0, this.restartTimer));
      }
      if (this.restartTimer <= 0) {
        this.phase = 'idle';
        this.cb.startNextRound();
      }
      return;
    }

    if (ctxState.mode !== 'play') return;

    if (ctxState.state === 'ready') {
      if (this.phase === 'idle' || this.phase === 'cooldown' || this.phase === 'restarting') {
        this.planShot(ctxState.streak);
      }
      if (this.phase === 'waiting') {
        this.waitTimer -= dt;
        if (this.waitTimer <= 0) {
          this.phase = 'charging';
          this.holdStartMs = performance.now();
          this.lastCharge = 0;
          this.reachedPeak = false;
          this.cb.pressDown(true);
          if (this.cb.onChargeStart) {
            this.cb.onChargeStart(this.targetCharge);
          }
        }
      }
    } else if (ctxState.state === 'charge' && this.phase === 'charging') {
      const c = ctxState.charge;
      const rising = c >= this.lastCharge;
      if (!rising && this.lastCharge > 0.85) {
        this.reachedPeak = true;
      }

      let shouldRelease = false;
      if (!this.useDownswing) {
        if (c >= this.targetCharge) shouldRelease = true;
      } else {
        if (this.reachedPeak && !rising && c <= this.targetCharge) {
          shouldRelease = true;
        }
      }

      this.lastCharge = c;
      if (shouldRelease) {
        this.phase = 'cooldown';
        this.cb.pressUp(true);
      }
    } else if (ctxState.state === 'shoot' || ctxState.state === 'done') {
      if (this.phase === 'charging') {
        this.phase = 'cooldown';
      }
    }
  }
}
