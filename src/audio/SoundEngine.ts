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
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
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
    if (this.ctx && this.ctx.state === 'suspended') {
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
      this.ctx.resume().then(() => {
        this.startMusic();
      }).catch(() => {});
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

  // --- CONTINUOUS PROCEDURAL SOUNDTRACK ---
  public startMusic() {
    if (this.isMuted || this.isMusicPlaying) return;
    const ctx = this.initContext();
    if (!ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    const now = ctx.currentTime;

    // 1. Warm Strings Pad (F-Major gentle lowpass background bed)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now); // Warm, mellow filter
    filter.connect(this.musicGain);

    this.padGain = ctx.createGain();
    this.padGain.gain.setValueAtTime(0, now);
    this.padGain.gain.linearRampToValueAtTime(0.12, now + 2.0); // Gentle background gain
    this.padGain.connect(filter);

    // Warm chord notes: F3, C4, A4, G4
    const padFreqs = [174.61, 261.63, 440.0, 392.0];
    this.padOscillators = [];

    padFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; // Pure sine for zero distortion
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((i - 1.5) * 2, now);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.04, now);
      osc.connect(oscGain);
      oscGain.connect(this.padGain!);

      osc.start(now);
      this.padOscillators.push(osc);
    });

    // 2. Playful Piano & Celesta Melody Sequencer (Authentic "Happy Birthday To You")
    this.noteStep = 0;
    this.playMelodyStep();
  }

  // Authentic "Happy Birthday to You" notes and timing
  private happyBirthdayNotes: Array<{ f: number; d: number; wait: number; bassFreq?: number }> = [
    // Phrase 1: "Hap-py birth-day to you"
    { f: 261.63, d: 0.32, wait: 360, bassFreq: 174.61 }, // C4 ("Hap-")
    { f: 261.63, d: 0.20, wait: 240 },                   // C4 ("-py")
    { f: 293.66, d: 0.55, wait: 580 },                   // D4 ("birth-")
    { f: 261.63, d: 0.55, wait: 580 },                   // C4 ("-day")
    { f: 349.23, d: 0.55, wait: 580 },                   // F4 ("to")
    { f: 329.63, d: 1.10, wait: 1150, bassFreq: 130.81 }, // E4 ("you~")

    // Phrase 2: "Hap-py birth-day to you"
    { f: 261.63, d: 0.32, wait: 360 },                   // C4 ("Hap-")
    { f: 261.63, d: 0.20, wait: 240 },                   // C4 ("-py")
    { f: 293.66, d: 0.55, wait: 580 },                   // D4 ("birth-")
    { f: 261.63, d: 0.55, wait: 580 },                   // C4 ("-day")
    { f: 392.00, d: 0.55, wait: 580 },                   // G4 ("to")
    { f: 349.23, d: 1.10, wait: 1150, bassFreq: 174.61 }, // F4 ("you~")

    // Phrase 3: "Hap-py birth-day dear Sis-ter"
    { f: 261.63, d: 0.32, wait: 360 },                   // C4 ("Hap-")
    { f: 261.63, d: 0.20, wait: 240 },                   // C4 ("-py")
    { f: 523.25, d: 0.55, wait: 580, bassFreq: 233.08 }, // C5 ("birth-")
    { f: 440.00, d: 0.55, wait: 580 },                   // A4 ("-day")
    { f: 349.23, d: 0.55, wait: 580 },                   // F4 ("dear")
    { f: 329.63, d: 0.55, wait: 580 },                   // E4 ("Sis-")
    { f: 293.66, d: 1.10, wait: 1150, bassFreq: 146.83 }, // D4 ("-ter~")

    // Phrase 4: "Hap-py birth-day to you!"
    { f: 466.16, d: 0.32, wait: 360 },                   // Bb4 ("Hap-")
    { f: 466.16, d: 0.20, wait: 240 },                   // Bb4 ("-py")
    { f: 440.00, d: 0.55, wait: 580 },                   // A4 ("birth-")
    { f: 349.23, d: 0.55, wait: 580 },                   // F4 ("-day")
    { f: 392.00, d: 0.65, wait: 680, bassFreq: 130.81 }, // G4 ("to")
    { f: 349.23, d: 1.60, wait: 2200, bassFreq: 174.61 }, // F4 ("you~~!")
  ];

  private playMelodyStep = () => {
    if (this.isMuted || !this.isMusicPlaying || !this.ctx || !this.musicGain) return;

    const noteIndex = this.noteStep % this.happyBirthdayNotes.length;
    const currentNote = this.happyBirthdayNotes[noteIndex];

    // 1. Felt Piano Lead (Warm, rounded, gentle)
    this.triggerPianoNote(currentNote.f, currentNote.d);

    // 2. Glockenspiel Bell Sparkle
    this.triggerGlockenspielNote(currentNote.f * 2, currentNote.d * 0.7);

    // 3. Warm Acoustic Bass on harmonic roots (Pure Sine for zero speaker rattle)
    if (currentNote.bassFreq) {
      this.triggerPizzicatoNote(currentNote.bassFreq, currentNote.d * 1.2);
      this.triggerWoodblockTap();
    }

    // 4. Cheerful Ukulele / Guitar chord strum on upbeat
    if (this.noteStep % 2 === 1) {
      this.triggerUkuleleStrum([349.23, 440.00, 523.25]); // F Major chord triad
    }

    this.noteStep++;
    this.melodyTimer = window.setTimeout(this.playMelodyStep, currentNote.wait);
  };

  // Synthesize acoustic felt piano note (Soft & warm with lowpass filter)
  private triggerPianoNote(freq: number, duration: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;

      // Soft wooden lowpass filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.connect(this.musicGain);

      // Fundamental tone
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Harmonic chime
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(filter);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + duration);
      osc2.stop(now + duration);
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
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration * 0.6);
    } catch {}
  }

  // Synthesize round, mellow acoustic bass (Pure Sine for zero speaker buzz)
  private triggerPizzicatoNote(freq: number, duration: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine'; // Sine wave never buzzes laptop speakers
      osc.frequency.setValueAtTime(freq, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // Synthesize cheerful acoustic ukulele / guitar strum
  private triggerUkuleleStrum(chordFreqs: number[]) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);
      filter.connect(this.musicGain);

      chordFreqs.forEach((freq, idx) => {
        const strumOffset = idx * 0.02;
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + strumOffset);

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.03, now + strumOffset);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + strumOffset + 0.25);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(now + strumOffset);
        osc.stop(now + strumOffset + 0.28);
      });
    } catch {}
  }

  // Synthesize soft woodblock / percussion tap
  private triggerWoodblockTap() {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.03);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  public stopMusic() {
    this.isMusicPlaying = false;
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

  // 6. Party Horn Kazoo Toot
  public playPartyHorn() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(340, now + 0.25);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);
      filter.Q.setValueAtTime(2.8, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
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
}

export const soundEngine = new SoundEngine();
