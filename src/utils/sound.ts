// Sound Manager class utilizing native browser Web Audio API Synthesizer (failsafe, no external file loads)
export class SoundSynth {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported on this platform');
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const playTone = (freq: number, start: number, duration: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Upbeat classic gaming chord
    playTone(523.25, now, 0.12);      // C5
    playTone(659.25, now + 0.08, 0.12); // E5
    playTone(783.99, now + 0.16, 0.12); // G5
    playTone(1046.50, now + 0.24, 0.28); // C6
  }

  // Authentic 8-bit cinematic intro chord
  playCinematicSplash() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const mainCtx = this.ctx;

    // Dramatic sub-bass swell
    const subOsc = mainCtx.createOscillator();
    const subGain = mainCtx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(80, now);
    subOsc.frequency.exponentialRampToValueAtTime(55, now + 2.0);
    subGain.gain.setValueAtTime(0.25, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
    subOsc.connect(subGain);
    subGain.connect(mainCtx.destination);
    subOsc.start(now);
    subOsc.stop(now + 2.2);

    // Dynamic warning beep chords
    const chimeFreqs = [523.25, 554.37, 659.25, 783.99];
    chimeFreqs.forEach((freq, idx) => {
      const chimeOsc = mainCtx.createOscillator();
      const chimeGain = mainCtx.createGain();
      chimeOsc.type = 'triangle';
      chimeOsc.frequency.setValueAtTime(freq, now + 0.15 + idx * 0.1);
      chimeGain.gain.setValueAtTime(0.08, now + 0.15 + idx * 0.1);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15 + idx * 0.1 + 0.8);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(mainCtx.destination);
      chimeOsc.start(now + 0.15 + idx * 0.1);
      chimeOsc.stop(now + 0.15 + idx * 0.1 + 0.8);
    });
  }

  playImpostorJumpscare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscMod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const mainGain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 2.0);

    oscMod.type = 'sine';
    oscMod.frequency.setValueAtTime(35, now);
    modGain.gain.setValueAtTime(120, now);

    mainGain.gain.setValueAtTime(0.18, now);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    oscMod.connect(modGain);
    modGain.connect(osc.frequency);
    osc.connect(mainGain);
    mainGain.connect(this.ctx.destination);

    osc.start(now);
    oscMod.start(now);
    osc.stop(now + 2.0);
    oscMod.stop(now + 2.0);
  }

  playVentWhoosh() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.45);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.45);
  }

  playDoorWhoosh() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playFootstep() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Smooth thud low frequency bump sound for footsteps
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(50 + Math.random() * 12, now);
    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

export const synthSFX = new SoundSynth();
