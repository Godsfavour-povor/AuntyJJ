// Advanced Procedural Web Audio Engine
// Continuous multi-layered animated-film soundtrack (piano, strings, celesta, pizzicato)
// Cohesive tactile sound effects library. Zero external assets, 0KB downloads, instant playback.

import type { SceneId } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;

  private masterGain: GainNode | null = null;
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

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Music Sub-Bus
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        // SFX Sub-Bus
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 1, now + 0.2);
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
    if (this.ctx && this.musicGain) {
      const now = this.ctx.currentTime;
      // Smooth dynamic volume balance per scene
      if (scene === 'scene_2_party') {
        this.musicGain.gain.linearRampToValueAtTime(0.075, now + 0.5);
      } else if (scene === 'scene_3_discovery') {
        this.musicGain.gain.linearRampToValueAtTime(0.085, now + 0.5);
      } else if (scene === 'scene_4_finale') {
        this.musicGain.gain.linearRampToValueAtTime(0.1, now + 0.5);
      }
    }
  }

  public getCurrentScene(): SceneId {
    return this.currentScene;
  }

  // Temporarily duck music for candle blowing
  public duckMusic(duck: boolean) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(duck ? 0.02 : 0.08, now + 0.4);
  }

  // --- CONTINUOUS PROCEDURAL SOUNDTRACK ---
  public startMusic() {
    if (this.isMusicPlaying) return;
    const ctx = this.initContext();
    if (!ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    const now = ctx.currentTime;

    // 1. Warm Strings Pad (F-Major9 drone with gentle chorused filter)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.connect(this.musicGain);

    this.padGain = ctx.createGain();
    this.padGain.gain.setValueAtTime(0, now);
    this.padGain.gain.linearRampToValueAtTime(0.4, now + 2.5);
    this.padGain.connect(filter);

    // Warm chord notes: F3 (174.61), C4 (261.63), A4 (440.00), G4 (392.00)
    const padFreqs = [174.61, 261.63, 440.0, 392.0];
    this.padOscillators = [];

    padFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      // Subtle detune for warm orchestral breath
      osc.detune.setValueAtTime((i - 1.5) * 3, now);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.18, now);
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
    { f: 349.23, d: 1.60, wait: 2400, bassFreq: 174.61 }, // F4 ("you~~!") (Long joyous finish)
  ];

  private playMelodyStep = () => {
    if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;

    const noteIndex = this.noteStep % this.happyBirthdayNotes.length;
    const currentNote = this.happyBirthdayNotes[noteIndex];

    // Trigger Felt Piano melody note
    this.triggerPianoNote(currentNote.f, currentNote.d);

    // Warm pizzicato / acoustic bass on phrase anchors
    if (currentNote.bassFreq) {
      this.triggerPizzicatoNote(currentNote.bassFreq, currentNote.d * 1.2);
    }

    this.noteStep++;
    // Precise rhythm interval to preserve the natural 3/4 waltz of Happy Birthday
    this.melodyTimer = window.setTimeout(this.playMelodyStep, currentNote.wait);
  };

  // Synthesize acoustic felt piano note
  private triggerPianoNote(freq: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const now = this.ctx.currentTime;

      // Filter to simulate warm wooden soundboard
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3.5, now);
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
      gain.gain.linearRampToValueAtTime(0.18, now + 0.015); // Fast piano hammer attack
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

  // Synthesize playful pizzicato pluck
  private triggerPizzicatoNote(freq: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration);
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
      this.padGain.gain.linearRampToValueAtTime(0, now + 1.0);
    }
    setTimeout(() => {
      this.padOscillators.forEach((osc) => {
        try { osc.stop(); osc.disconnect(); } catch {}
      });
      this.padOscillators = [];
    }, 1200);
  }

  // --- SOUND EFFECTS LIBRARY ---

  // 1. Tactile Cartoon Pop (Soft, rubbery, satisfying)
  public playPop() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.07);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  // 2. Cute Little Footstep Tap (Pip walking in mini-game)
  public playFootstep() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160 + Math.random() * 40, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // 3. Treasure Collect Chime (Sparkling pentatonic ping)
  public playCollect() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const notes = [659.25, 880.00, 1046.50]; // E5, A5, C6

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.14, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.5);
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
      osc1.frequency.setValueAtTime(587.33, now); // D5
      const gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.sfxGain);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.12); // A5
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.16, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc2.connect(gain2);
      gain2.connect(this.sfxGain);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.3);
    } catch {}
  }

  // 5. Candle Puff / Air Breath
  public playCandlePuff() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 2.8;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(340, now);
      filter.Q.setValueAtTime(1.8, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

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
      osc.frequency.linearRampToValueAtTime(350, now + 0.28);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(780, now);
      filter.Q.setValueAtTime(3.2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  // 7. Scratch Chime (Glockenspiel)
  public playScratchChime() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const notes = [659.25, 783.99, 880.00, 1046.50, 1174.66];
      const randomNote = notes[Math.floor(Math.random() * notes.length)];

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(randomNote, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // 8. Triumphant Finale Fanfare
  public playFinaleFanfare() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const notes = [349.23, 440.00, 523.25, 698.46, 880.00, 1046.50];

      notes.forEach((freq, idx) => {
        const startTime = now + idx * 0.09;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(startTime);
        osc.stop(startTime + 1.6);
      });
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
