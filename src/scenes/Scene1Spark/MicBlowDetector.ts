// Microphone Blow Detection using Web Audio API
// Detects low-frequency air turbulence (wind noise) without storing or transmitting audio

export class MicBlowDetector {
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isListening: boolean = false;
  private rafId: number | null = null;
  private sustainedFrames: number = 0;
  private onBlowCallback: (() => void) | null = null;

  constructor(onBlow: () => void) {
    this.onBlowCallback = onBlow;
  }

  public async start(): Promise<boolean> {
    if (this.isListening) return true;
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      const source = this.audioCtx.createMediaStreamSource(this.stream);

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 1024;
      source.connect(this.analyser);

      this.isListening = true;
      this.sustainedFrames = 0;
      this.analyze();
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  private analyze = () => {
    if (!this.isListening || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const timeData = new Float32Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);

    // 1. Calculate RMS (Volume energy)
    this.analyser.getFloatTimeDomainData(timeData);
    let sumSquares = 0.0;
    for (let i = 0; i < bufferLength; i++) {
      sumSquares += timeData[i] * timeData[i];
    }
    const rms = Math.sqrt(sumSquares / bufferLength);

    // 2. Calculate low-frequency "wind" energy (< 250 Hz)
    this.analyser.getByteFrequencyData(freqData);
    const lowBinsCount = Math.max(1, Math.floor(bufferLength * 0.12));
    let lowFreqSum = 0;
    for (let i = 0; i < lowBinsCount; i++) {
      lowFreqSum += freqData[i];
    }
    const avgLowFreq = lowFreqSum / lowBinsCount;

    // Thresholds: sustained low-frequency roar typical of breath on a mic
    if (rms > 0.14 && avgLowFreq > 130) {
      this.sustainedFrames += 1;
      // Require sustained blow for at least 8 frames (~130ms) to reject casual pops or plosive speech
      if (this.sustainedFrames >= 8) {
        if (this.onBlowCallback) {
          this.onBlowCallback();
        }
        this.stop();
        return;
      }
    } else {
      this.sustainedFrames = Math.max(0, this.sustainedFrames - 1);
    }

    this.rafId = requestAnimationFrame(this.analyze);
  };

  public stop() {
    this.isListening = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}
