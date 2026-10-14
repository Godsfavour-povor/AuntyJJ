// Advanced Procedural Web Audio Engine
// Continuous multi-layered animated celebration waltz ("Happy Birthday to You")
// Dynamic limiter compressor preventing speaker clipping & distortion.
// Cohesive tactile sound effects library. Zero external assets, 0KB downloads, instant playback.

import type { SceneId } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;

  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private padOscillators: OscillatorNode[] = [];
  private padGain: GainNode | null = null;

  private melodyTimer: number | null = null;
  private currentScene: SceneId = 'scene_1_portal';
  private noteStep: number = 0;

  private isBackgrounded: boolean = false;
  private wasPlayingBeforeBackground: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('pagehide', this.handlePageHide);
      window.addEventListener('pageshow', this.handlePageShow);
      window.addEventListener('blur', this.handleWindowBlur);
      window.addEventListener('focus', this.handleWindowFocus);
    }
  }

  private handleVisibilityChange = () => {
    if (typeof document === 'undefined') return;
    if (document.hidden) {
      this.pauseBackgroundAudio();
    } else {
      this.resumeForegroundAudio();
    }
  };

  private handlePageHide = () => {
    this.pauseBackgroundAudio();
  };

  private handlePageShow = () => {
    if (typeof document !== 'undefined' && !document.hidden) {
      this.resumeForegroundAudio();
    }
  };

  private handleWindowBlur = () => {
    if (typeof document !== 'undefined' && document.hidden) {
      this.pauseBackgroundAudio();
    }
  };

  private handleWindowFocus = () => {
    if (typeof document !== 'undefined' && !document.hidden) {
      this.resumeForegroundAudio();
    }
  };

  private pauseBackgroundAudio() {
    this.isBackgrounded = true;
    if (this.isMusicPlaying) {
      this.wasPlayingBeforeBackground = true;
    }
    // Cancel any scheduled timer
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
    // Mute master gain instantly
    if (this.masterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(0, now);
      } catch {}
    }
    // Suspend context to eliminate CPU and audio processing
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  private resumeForegroundAudio() {
    this.isBackgrounded = false;
    if (this.isMuted) return;

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.masterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(0.85, now);
      } catch {}
    }

    if (this.wasPlayingBeforeBackground && !this.isMuted) {
      this.wasPlayingBeforeBackground = false;
      if (!this.melodyTimer && this.isMusicPlaying) {
        this.playMelodyStep();
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // 1. Master Brickwall Limiter Compressor (Prevents any clipping or speaker distortion)
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-4, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(6, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.18, this.ctx.currentTime);
        this.compressor.connect(this.ctx.destination);

        // 2. Master Gain (Feeds into Compressor)
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted || this.isBackgrounded ? 0 : 0.85, this.ctx.currentTime);
        this.masterGain.connect(this.compressor);

        // 3. Music Sub-Bus (Calibrated gain for clear, warm, non-distorted playback)
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : 0.55, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        // 4. SFX Sub-Bus
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && !this.isBackgrounded && !this.isMuted) {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Complete, clean mute toggle
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, now);
    }
    if (this.musicGain) {
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(muted ? 0 : 0.55, now);
    }
    if (this.sfxGain) {
      this.sfxGain.gain.cancelScheduledValues(now);
      this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.45, now);
    }

    if (muted) {
      this.stopMusic();
      this.ctx.suspend().catch(() => {});
    } else {
      if (!this.isBackgrounded) {
        this.ctx.resume().then(() => {
          this.startMusic();
        }).catch(() => {});
      } else {
        this.wasPlayingBeforeBackground = true;
      }
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public unlock() {
    this.initContext();
  }

  // Set scene for dynamic music progression
  public setScene(scene: SceneId) {
    this.currentScene = scene;
    if (this.ctx && this.musicGain && !this.isMuted) {
      const now = this.ctx.currentTime;
      if (scene === 'scene_2_party') {
        this.musicGain.gain.linearRampToValueAtTime(0.50, now + 0.4);
      } else if (scene === 'scene_3_discovery') {
        this.musicGain.gain.linearRampToValueAtTime(0.55, now + 0.4);
      } else if (scene === 'scene_4_finale') {
        this.musicGain.gain.linearRampToValueAtTime(0.60, now + 0.4);
      }
    }
  }

  public getCurrentScene(): SceneId {
    return this.currentScene;
  }

  // Temporarily duck music for candle blowing
  public duckMusic(duck: boolean) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(duck ? 0.08 : 0.55, now + 0.3);
  }

  // --- CONTINUOUS PROCEDURAL SOUNDTRACK (Cinematic Orchestral Arrangement) ---
  public startMusic() {
    if (this.isMuted || this.isMusicPlaying || this.isBackgrounded) return;
    const ctx = this.initContext();
    if (!ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    const now = ctx.currentTime;

    // 1. Lush Orchestral String Ensemble Pad (Cellos, Violas, Bowed Violins)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now); // Warm, acoustic wooden chamber resonance
    filter.connect(this.musicGain);

    this.padGain = ctx.createGain();
    this.padGain.gain.setValueAtTime(0, now);
    this.padGain.gain.linearRampToValueAtTime(0.14, now + 2.0);
    this.padGain.connect(filter);

    // Warm orchestral chord tones: F2 (deep cello), C3, A3, C4, F4 (soaring violins)
    const orchestralStrings = [87.31, 130.81, 220.0, 261.63, 349.23];
    this.padOscillators = [];

    orchestralStrings.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((i - 2) * 3, now); // Gentle ensemble detune

      // Warm string vibrato LFO (5.2Hz natural human violinist vibrato)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(5.2, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(1.8, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.035, now);
      osc.connect(oscGain);
      oscGain.connect(this.padGain!);

      osc.start(now);
      this.padOscillators.push(osc, lfo as unknown as OscillatorNode);
    });

    // 2. Cinematic Orchestral Melody Sequencer ("Happy Birthday To You")
    this.noteStep = 0;
    this.playMelodyStep();
  }

  // Authentic "Happy Birthday to You" notes and timing
  private happyBirthdayNotes: Array<{ f: number; d: number; wait: number; bassFreq?: number; chord?: number[] }> = [
    // Phrase 1: "Hap-py birth-day to you"
    { f: 261.63, d: 0.35, wait: 360, bassFreq: 174.61 }, // C4 ("Hap-")
    { f: 261.63, d: 0.22, wait: 240 },                   // C4 ("-py")
    { f: 293.66, d: 0.55, wait: 580 },                   // D4 ("birth-")
    { f: 261.63, d: 0.55, wait: 580 },                   // C4 ("-day")
    { f: 349.23, d: 0.55, wait: 580 },                   // F4 ("to")
    { f: 329.63, d: 1.15, wait: 1150, bassFreq: 130.81, chord: [261.63, 329.63, 392.00] }, // E4 ("you~")

    // Phrase 2: "Hap-py birth-day to you"
    { f: 261.63, d: 0.35, wait: 360 },                   // C4 ("Hap-")
    { f: 261.63, d: 0.22, wait: 240 },                   // C4 ("-py")
    { f: 293.66, d: 0.55, wait: 580 },                   // D4 ("birth-")
    { f: 261.63, d: 0.55, wait: 580 },                   // C4 ("-day")
    { f: 392.00, d: 0.55, wait: 580 },                   // G4 ("to")
    { f: 349.23, d: 1.15, wait: 1150, bassFreq: 174.61, chord: [174.61, 220.00, 261.63, 349.23] }, // F4 ("you~")

    // Phrase 3: "Hap-py birth-day dear Sis-ter"
    { f: 261.63, d: 0.35, wait: 360 },                   // C4 ("Hap-")
    { f: 261.63, d: 0.22, wait: 240 },                   // C4 ("-py")
    { f: 523.25, d: 0.55, wait: 580, bassFreq: 233.08 }, // C5 ("birth-")
    { f: 440.00, d: 0.55, wait: 580 },                   // A4 ("-day")
    { f: 349.23, d: 0.55, wait: 580 },                   // F4 ("dear")
    { f: 329.63, d: 0.55, wait: 580 },                   // E4 ("Sis-")
    { f: 293.66, d: 1.15, wait: 1150, bassFreq: 146.83, chord: [146.83, 220.00, 293.66] }, // D4 ("-ter~")

    // Phrase 4: "Hap-py birth-day to you!"
    { f: 466.16, d: 0.35, wait: 360 },                   // Bb4 ("Hap-")
    { f: 466.16, d: 0.22, wait: 240 },                   // Bb4 ("-py")
    { f: 440.00, d: 0.55, wait: 580 },                   // A4 ("birth-")
    { f: 349.23, d: 0.55, wait: 580 },                   // F4 ("-day")
    { f: 392.00, d: 0.65, wait: 680, bassFreq: 130.81 }, // G4 ("to")
    { f: 349.23, d: 1.70, wait: 2300, bassFreq: 174.61, chord: [174.61, 261.63, 349.23, 440.00, 523.25] }, // F4 ("you~~!")
  ];

  private playMelodyStep = () => {
    if (this.isMuted || !this.isMusicPlaying || this.isBackgrounded || !this.ctx || !this.musicGain) return;

    const noteIndex = this.noteStep % this.happyBirthdayNotes.length;
    const currentNote = this.happyBirthdayNotes[noteIndex];

    // 1. Orchestral Flute Solo (Romantic, singing, lyrical)
    this.triggerOrchestralFlute(currentNote.f, currentNote.d);

    // 2. Warm Bowed Violin Lead (Singing melody with vibrato)
    this.triggerOrchestralViolin(currentNote.f, currentNote.d);

    // 3. Celesta / Glockenspiel Starlight Sparkle
    this.triggerGlockenspielNote(currentNote.f * 2, currentNote.d * 0.7);

    // 4. Orchestral Double Bass & Timpani on harmonic roots
    if (currentNote.bassFreq) {
      this.triggerOrchestralDoubleBass(currentNote.bassFreq, currentNote.d * 1.3);
    }

    // 5. Concert Harp Arpeggio Sweep on upbeat
    if (this.noteStep % 2 === 1) {
      this.triggerConcertHarp([currentNote.f * 0.5, currentNote.f, currentNote.f * 1.5, currentNote.f * 2]);
    }

    // 6. French Horn & Brass Swell on cadence chords
    if (currentNote.chord) {
      this.triggerFrenchHorn(currentNote.chord, currentNote.d * 1.2);
    }

    this.noteStep++;
    this.melodyTimer = window.setTimeout(this.playMelodyStep, currentNote.wait);
  };

  // Synthesize Orchestral Flute (Pure, airy, lyrical woodwind tone)
  private triggerOrchestralFlute(freq: number, duration: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle air breath harmonic
      const breath = this.ctx.createOscillator();
      breath.type = 'triangle';
      breath.frequency.setValueAtTime(freq * 2, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 2.8, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.04); // Gentle woodwind attack
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.1);

      osc.connect(gain);
      breath.connect(gain);
      gain.connect(filter);
      filter.connect(this.musicGain);

      osc.start(now);
      breath.start(now);
      osc.stop(now + duration + 0.12);
      breath.stop(now + duration + 0.12);
    } catch {}
  }

  // Synthesize Warm Bowed Violin (Acoustic string body with sweet natural vibrato)
  private triggerOrchestralViolin(freq: number, duration: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Natural string vibrato
      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.setValueAtTime(5.4, now);
      const vibratoGain = this.ctx.createGain();
      vibratoGain.gain.setValueAtTime(0, now);
      vibratoGain.gain.linearRampToValueAtTime(2.2, now + 0.12); // Vibrato blooms smoothly
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibrato.start(now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.10, now + 0.05); // Smooth bow stroke
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration + 0.18);
      vibrato.stop(now + duration + 0.18);
    } catch {}
  }

  // Synthesize Concert Harp Arpeggio (Delicate, crystalline plucked harp strings)
  private triggerConcertHarp(notes: number[]) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        const strumOffset = i * 0.035;
        const osc = this.ctx!.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + strumOffset);

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, now + strumOffset);

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.04, now + strumOffset);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + strumOffset + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain!);

        osc.start(now + strumOffset);
        osc.stop(now + strumOffset + 0.48);
      });
    } catch {}
  }

  // Synthesize Warm French Horn & Brass Swell (Majestic golden orchestral chords)
  private triggerFrenchHorn(chordNotes: number[], duration: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now); // Warm, mellow brass bell
      filter.connect(this.musicGain);

      chordNotes.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.032, now + 0.15); // Grand brass swell
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.2);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(now);
        osc.stop(now + duration + 0.25);
      });
    } catch {}
  }

  // Synthesize Orchestral Double Bass & Gentle Timpani
  private triggerOrchestralDoubleBass(freq: number, duration: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // Synthesize sparkling glockenspiel bell
  private triggerGlockenspielNote(freq: number, duration: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    this.wasPlayingBeforeBackground = false;
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
    if (this.padGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.padGain.gain.setValueAtTime(0, now);
    }
    this.padOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.padOscillators = [];
  }

  // --- SOUND EFFECTS LIBRARY ---

  // 1. Tactile Cartoon Pop
  public playPop() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  // 2. Cute Little Footstep Tap
  public playFootstep() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150 + Math.random() * 30, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  // 3. Treasure Collect Chime
  public playCollect() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const notes = [659.25, 880.00, 1046.50];

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.10, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.4);
      });
    } catch {}
  }

  // 4. Pip Greeting Whistle
  public playGreeting() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      const gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.sfxGain);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.12);
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.12, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.sfxGain);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.28);
    } catch {}
  }

  // 5. Candle Puff / Breath
  public playCandlePuff() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 2.0;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
    } catch {}
  }

  // 6. Joyous "HOORAY! 🎉" Celebration Sound (Authentic Choral Cheer, Shimmering Chimes & Fanfare)
  public playHoorayCelebration() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;

      // Part 1: Harmonized Vocal Cheer ("HOO-RAY!")
      // 3 cheering choral voices rising in pitch with formant vowel filters
      const voices = [
        { startFreq: 261.63, endFreq: 440.00 }, // C4 -> A4
        { startFreq: 329.63, endFreq: 554.37 }, // E4 -> C#5
        { startFreq: 392.00, endFreq: 659.25 }, // G4 -> E5
      ];

      voices.forEach((voice, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(voice.startFreq, now);
        // Exultant cheering pitch rise
        osc.frequency.exponentialRampToValueAtTime(voice.endFreq, now + 0.38);

        // Vocal Formant Filter 1 ("Ooh" to "Aay")
        const f1 = ctx.createBiquadFilter();
        f1.type = 'bandpass';
        f1.Q.setValueAtTime(4.0, now);
        f1.frequency.setValueAtTime(360, now);
        f1.frequency.linearRampToValueAtTime(620, now + 0.35);

        // Vocal Formant Filter 2 (Upper vowel clarity)
        const f2 = ctx.createBiquadFilter();
        f2.type = 'bandpass';
        f2.Q.setValueAtTime(4.5, now);
        f2.frequency.setValueAtTime(900, now);
        f2.frequency.linearRampToValueAtTime(1850, now + 0.35);

        const voiceGain = ctx.createGain();
        voiceGain.gain.setValueAtTime(0, now);
        voiceGain.gain.linearRampToValueAtTime(0.08, now + 0.06);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

        osc.connect(f1);
        f1.connect(voiceGain);
        osc.connect(f2);
        f2.connect(voiceGain);
        voiceGain.connect(this.sfxGain!);

        osc.start(now + i * 0.015);
        osc.stop(now + 0.68);
      });

      // Part 2: Shimmering Celestial Celebration Bells (Pentatonic Sparkle Cascade)
      const sparkleNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      sparkleNotes.forEach((freq, idx) => {
        const startTime = now + 0.12 + idx * 0.055;
        const bellOsc = ctx.createOscillator();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(freq, startTime);

        const bellGain = ctx.createGain();
        bellGain.gain.setValueAtTime(0.09, startTime);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.85);

        bellOsc.connect(bellGain);
        bellGain.connect(this.sfxGain!);

        bellOsc.start(startTime);
        bellOsc.stop(startTime + 0.85);
      });

      // Part 3: Warm Orchestral Fanfare Chord (F Major swell)
      const fanfareChord = [174.61, 261.63, 349.23, 440.00, 523.25];
      fanfareChord.forEach((freq) => {
        const brassOsc = ctx.createOscillator();
        brassOsc.type = 'triangle';
        brassOsc.frequency.setValueAtTime(freq, now + 0.05);

        const brassFilter = ctx.createBiquadFilter();
        brassFilter.type = 'lowpass';
        brassFilter.frequency.setValueAtTime(1400, now);

        const brassGain = ctx.createGain();
        brassGain.gain.setValueAtTime(0, now + 0.05);
        brassGain.gain.linearRampToValueAtTime(0.06, now + 0.2);
        brassGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        brassOsc.connect(brassFilter);
        brassFilter.connect(brassGain);
        brassGain.connect(this.sfxGain!);

        brassOsc.start(now + 0.05);
        brassOsc.stop(now + 1.25);
      });
    } catch {}
  }

  // Alias keeping compatibility with all celebration call sites
  public playPartyHorn() {
    this.playHoorayCelebration();
  }

  // 7. Scratch Chime
  public playScratchChime() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const notes = [659.25, 783.99, 880.00, 1046.50];
      const randomNote = notes[Math.floor(Math.random() * notes.length)];

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(randomNote, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // 8. Finale Fanfare
  public playFinaleFanfare() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const notes = [349.23, 440.00, 523.25, 698.46, 880.00];

      notes.forEach((freq, idx) => {
        const startTime = now + idx * 0.09;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(startTime);
        osc.stop(startTime + 1.2);
      });
    } catch {}
  }

  // 9. Realistic Paper Rustle
  public playPaperRustle(duration: number = 0.8) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      filter.Q.value = 1.8;

      const gain = ctx.createGain();
      gain.gain.value = 0.045;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start();
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
