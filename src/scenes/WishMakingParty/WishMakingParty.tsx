import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wind } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAdventure } from '../../context/AdventureContext';
import { useAudio } from '../../audio/useAudio';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { BirthdayCake } from './BirthdayCake';
import { InfiniteFlowerShower } from './InfiniteFlowerShower';
import { PipCharacter } from '../../components/Character/PipCharacter';
import { SpeechBubble } from '../../components/SpeechBubble/SpeechBubble';

export const WishMakingParty: React.FC = () => {
  const {
    wishStage,
    extinguishCandles,
    characterMood,
    setCharacterMood,
    goToScene,
  } = useAdventure();

  const audio = useAudio();

  // State: 'idle' -> 'wishing' -> 'blown'
  const [isWishing, setIsWishing] = useState<boolean>(wishStage === 'candles_blown');
  // 3 individual candle states
  const [blownCandles, setBlownCandles] = useState<[boolean, boolean, boolean]>([
    wishStage === 'candles_blown',
    wishStage === 'candles_blown',
    wishStage === 'candles_blown',
  ]);
  const [isBlowing, setIsBlowing] = useState<boolean>(false);
  const [breathIntensity, setBreathIntensity] = useState<number>(0); // 0 to 100 for live breath meter
  const [micActive, setMicActive] = useState<boolean>(false);

  const blowCooldownRef = useRef<boolean>(false);
  const blowStreakRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Phone tilt orientation refs
  const initialBetaRef = useRef<number | null>(null);
  const lastBetaRef = useRef<number | null>(null);
  const lastOrientationTimeRef = useRef<number>(0);
  const micStreamRef = useRef<MediaStream | null>(null);

  const candlesBlownCount = blownCandles.filter(Boolean).length;
  const allCandlesBlown = candlesBlownCount === 3;

  // Single breath / blow event (extinguishes 1 candle per breath for measured pacing)
  const handleSingleBlow = useCallback(() => {
    if (!isWishing || blowCooldownRef.current || allCandlesBlown) return;
    blowCooldownRef.current = true;
    blowStreakRef.current = 0;

    // Trigger authentic cartoon facing wind gust (950ms duration)
    setIsBlowing(true);
    audio.playCandleBlow();

    setTimeout(() => {
      setIsBlowing(false);

      setBlownCandles((prev) => {
        const next: [boolean, boolean, boolean] = [...prev];
        if (!next[0]) next[0] = true;
        else if (!next[1]) next[1] = true;
        else if (!next[2]) next[2] = true;

        const nextCount = next.filter(Boolean).length;
        if (nextCount === 3) {
          extinguishCandles();
          setCharacterMood('celebrating');
          audio.playPartyHorn();

          // Celebratory floral burst from the top
          confetti({
            particleCount: 90,
            spread: 95,
            origin: { y: 0.15 },
            colors: ['#FDA4AF', '#FDE047', '#38BDF8', '#C084FC', '#4ADE80'],
            disableForReducedMotion: true,
          });
        }
        return next;
      });

      // Measured pacing cooldown: allows sister to catch her breath for the next candle
      setTimeout(() => {
        blowCooldownRef.current = false;
        blowStreakRef.current = 0;
      }, 1100);
    }, 950);
  }, [isWishing, allCandlesBlown, extinguishCandles, setCharacterMood, audio]);

  // Phone tilt detection: when user tilts top of phone toward their mouth/face
  useEffect(() => {
    if (!isWishing || allCandlesBlown) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || blowCooldownRef.current || allCandlesBlown) return;

      const beta = e.beta;
      const now = performance.now();

      // Establish initial baseline on first reading
      if (lastBetaRef.current === null) {
        lastBetaRef.current = beta;
        initialBetaRef.current = beta;
        lastOrientationTimeRef.current = now;
        return;
      }

      const dt = Math.max(1, now - lastOrientationTimeRef.current);
      const deltaBeta = beta - lastBetaRef.current;
      const angularSpeed = Math.abs(deltaBeta) / dt;

      const initial = initialBetaRef.current ?? 75;

      // Ultra-responsive tilt detection: any forward tilt towards mouth or flick
      const isTiltedForward = (initial > 45 && beta < 55) || (beta - initial < -10) || Math.abs(beta - initial) > 18;
      const isTiltMotion = Math.abs(deltaBeta) > 9 || angularSpeed > 0.045;

      if ((isTiltedForward || isTiltMotion) && !blowCooldownRef.current) {
        handleSingleBlow();
        initialBetaRef.current = beta;
      }

      lastBetaRef.current = beta;
      lastOrientationTimeRef.current = now;
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      initialBetaRef.current = null;
      lastBetaRef.current = null;
    };
  }, [isWishing, allCandlesBlown, handleSingleBlow]);

  // High-precision microphone breath puff detector with ambient calibration & turbulence filter
  useEffect(() => {
    if (!isWishing || allCandlesBlown) return;

    let stream: MediaStream | null = micStreamRef.current;
    let audioCtx: AudioContext | null = null;
    let isCancelled = false;

    const startMic = async () => {
      try {
        if (!stream) {
          if (!navigator.mediaDevices?.getUserMedia) {
            setMicActive(false);
            return;
          }

          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
          });
        }

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);

        analyser.smoothingTimeConstant = 0.15;
        analyser.fftSize = 256;
        source.connect(analyser);

        setMicActive(true);
        const timeData = new Uint8Array(analyser.fftSize);
        const freqData = new Uint8Array(analyser.frequencyBinCount);

        let calibrationFrames = 0;
        let baselineSum = 0;
        let baselineNoise = 3;

        const poll = () => {
          if (isCancelled || allCandlesBlown) return;

          // 1. Time-domain displacement (diaphragm displacement)
          analyser.getByteTimeDomainData(timeData);
          let deviationSum = 0;
          for (let i = 0; i < timeData.length; i++) {
            deviationSum += Math.abs(timeData[i] - 128);
          }
          const avgDeviation = deviationSum / timeData.length;

          // 2. Frequency spectrum turbulence (breath air puff creates heavy low-frequency energy 40-300Hz)
          analyser.getByteFrequencyData(freqData);
          let lowFreqSum = 0;
          for (let i = 0; i < 6; i++) {
            lowFreqSum += freqData[i];
          }
          const avgLowFreq = lowFreqSum / 6;

          // Calibration phase: adapts to hardware mic sensitivity in first 20 frames (~300ms)
          if (calibrationFrames < 20) {
            baselineSum += avgDeviation;
            calibrationFrames++;
            if (calibrationFrames === 20) {
              baselineNoise = Math.max(2, baselineSum / 20);
            }
            animFrameRef.current = requestAnimationFrame(poll);
            return;
          }

          // Ultra-sensitive breath threshold (even a soft breath puff triggers!)
          const triggerDelta = 5.0;
          const dynamicThreshold = baselineNoise + triggerDelta;
          const visualRatio = Math.max(0, (avgDeviation - baselineNoise) / triggerDelta);
          const visualPercent = Math.min(100, Math.round(visualRatio * 100));
          setBreathIntensity(visualPercent);

          // Detect physical breath (time domain or air turbulence rumble)
          const isBreathDetected = (avgDeviation > dynamicThreshold || avgLowFreq > 38);

          if (isBreathDetected && !blowCooldownRef.current) {
            blowStreakRef.current += 1;
            if (blowStreakRef.current >= 1) {
              handleSingleBlow();
            }
          } else {
            blowStreakRef.current = Math.max(0, blowStreakRef.current - 1);
          }

          animFrameRef.current = requestAnimationFrame(poll);
        };

        animFrameRef.current = requestAnimationFrame(poll);
      } catch {
        setMicActive(false);
      }
    };

    startMic();

    return () => {
      isCancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (audioCtx) audioCtx.close().catch(() => {});
      setBreathIntensity(0);
      setMicActive(false);
    };
  }, [isWishing, allCandlesBlown, handleSingleBlow]);

  // Click on "Make a wish": request permissions directly in user gesture
  const handleStartWish = async () => {
    // 1. Request iOS Safari DeviceOrientation permission directly in user tap
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      try {
        await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
      } catch (err) {
        console.warn('Orientation permission notice:', err);
      }
    }

    // 2. Request microphone stream directly in user tap
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        micStreamRef.current = stream;
      } catch (err) {
        console.warn('Microphone permission notice:', err);
      }
    }

    setIsWishing(true);
    setCharacterMood('wishing');
    audio.duckMusic(true);
    audio.playPop();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden bg-gradient-to-b from-[#FEF3C7] via-[#FFFDF8] to-[#FDF4FF] select-none">
      {/* Infinite Flower Burst Shower from the top once all candles are blown */}
      {allCandlesBlown && <InfiniteFlowerShower />}

      {/* Top Header */}
      <header className="relative z-10 text-center max-w-lg mt-12 sm:mt-10 space-y-1">
        <h1 className="text-2xl sm:text-4xl font-display font-bold text-deep-ink tracking-tight">
          Happy Birthday, {BIRTHDAY_DATA.sisterName}!
        </h1>
      </header>

      {/* Center Cake & Pip Dialogue */}
      <main className="relative z-10 flex flex-col items-center my-auto w-full max-w-2xl space-y-4">
        {/* Pip's Dialogue */}
        <SpeechBubble tailPosition="bottom-left" className="mb-1 max-w-md">
          {!isWishing && (
            <p className="font-display font-bold text-base sm:text-lg text-deep-ink">
              Look at your 3-tier birthday cake! When you&apos;re ready, tap below to make a wish! 🎂
            </p>
          )}

          {isWishing && !allCandlesBlown && (
            <p className="font-display font-bold text-base sm:text-lg text-coral">
              {candlesBlownCount === 0 && "Close your eyes, make your silent wish... and blow out your candles! 🌬️"}
              {candlesBlownCount === 1 && "One candle down! Take another breath and blow again! 🌬️"}
              {candlesBlownCount === 2 && "Almost there! One last big breath for the final candle! 🌬️✨"}
            </p>
          )}

          {allCandlesBlown && (
            <p className="font-display font-bold text-base sm:text-lg text-turquoise-dark">
              🎉 HOORAY! Happy Birthday! All candles extinguished and your wish is granted!
            </p>
          )}
        </SpeechBubble>

        {/* Cake Composition with Cloud Blow Indicator on the RIGHT-HAND SIDE */}
        <div className="relative flex items-center justify-center w-full max-w-2xl mx-auto">
          {/* Pip The Mascot on Desktop/Tablet (Left of Cake) */}
          <div className="hidden md:block absolute -left-6 lg:-left-16 bottom-4 z-20">
            <PipCharacter mood={characterMood} size={115} />
          </div>

          {/* Pip The Mascot on Mobile (Smaller with whimsical float animation) */}
          <div className="block md:hidden absolute -left-2 sm:left-0 -bottom-1 z-20 animate-balloon-float">
            <PipCharacter mood={characterMood} size={70} />
          </div>

          {/* Redesigned Gourmet 3-Deck Cake */}
          <div className="z-10 relative">
            <BirthdayCake
              blownCandles={blownCandles}
              isBlowing={isBlowing}
              onBlowCandles={handleSingleBlow}
            />
          </div>

          {/* Cloud-Shaped Inscription on the RIGHT-HAND SIDE pointing to the cake */}
          {isWishing && !allCandlesBlown && (
            <div
              onClick={handleSingleBlow}
              className="absolute right-0 sm:-right-4 md:-right-16 lg:-right-24 top-2 sm:top-6 z-30 flex flex-col items-center cursor-pointer select-none animate-comic-pop"
              title="Blow the candle! Tilt phone or blow into mic"
            >
              {/* Cloud Bubble Container */}
              <div className="relative bg-white/95 backdrop-blur-md border-2 border-deep-ink px-4 py-3 sm:px-5 sm:py-3.5 rounded-[2rem] shadow-[4px_4px_0px_#1E1B4B] hover:scale-105 active:scale-95 transition-transform flex flex-col items-center text-center max-w-[145px] sm:max-w-[180px]">
                
                {/* Whimsical Cloud Puffs Lobes on Top Edge */}
                <div className="absolute -top-3 left-4 w-7 h-7 bg-white rounded-full border-t-2 border-l-2 border-deep-ink pointer-events-none" />
                <div className="absolute -top-4 right-5 w-8 h-8 bg-white rounded-full border-t-2 border-r-2 border-deep-ink pointer-events-none" />

                {/* Cloud Main Heading */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Wind className="w-4 h-4 text-sky-dark animate-pulse" />
                  <span className="font-display font-bold text-xs sm:text-sm text-deep-ink leading-tight">
                    Blow the candle! 🌬️
                  </span>
                </div>

                {/* Subtitle with intuitive instructions */}
                <p className="font-sans text-[10px] sm:text-xs font-semibold text-deep-ink/70 leading-tight">
                  Tilt phone or blow
                </p>

                {/* Candle Counter Badge */}
                <span className="mt-1.5 text-[10px] font-display font-bold text-coral bg-rose-50 px-2.5 py-0.5 rounded-full border border-coral/30">
                  {3 - candlesBlownCount} candle{3 - candlesBlownCount > 1 ? 's' : ''} left
                </span>

                {/* Live breath feedback indicator */}
                {micActive && breathIntensity > 10 && (
                  <div className="w-full h-1 bg-sky-100 rounded-full overflow-hidden mt-1.5 border border-sky-200">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-coral transition-all duration-75 rounded-full"
                      style={{ width: `${breathIntensity}%` }}
                    />
                  </div>
                )}

                {/* Cloud Tail Pointing Left Directly Towards the Cake Candles */}
                <div className="absolute -bottom-1 -left-3.5 flex items-center pointer-events-none">
                  <div className="w-3.5 h-3.5 bg-white rounded-full border-2 border-deep-ink shadow-[-1px_1px_0px_#1E1B4B]" />
                  <div className="w-2.5 h-2.5 bg-white rounded-full border-2 border-deep-ink -ml-1 -mt-1.5" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full border border-deep-ink -ml-0.5 -mt-3" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button Area (NO buttons while blowing — pure immersive physical interaction!) */}
        <div className="flex items-center justify-center w-full max-w-sm pt-2 min-h-[50px]">
          {!isWishing && (
            <button
              onClick={handleStartWish}
              className="px-8 py-3.5 rounded-full bg-yellow hover:bg-yellow-dark text-deep-ink border-2 border-deep-ink font-display font-bold text-sm tracking-wider uppercase shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
            >
              Make A Wish ✨
            </button>
          )}

          {allCandlesBlown && (
            /* Exactly ONE arrow as requested */
            <button
              onClick={() => goToScene('scene_3_discovery')}
              className="flex items-center justify-center px-8 py-3.5 rounded-full bg-gradient-to-r from-coral to-peach text-white border-2 border-deep-ink font-display font-bold text-sm tracking-wider uppercase shadow-[4px_4px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
            >
              <span>Continue ➔</span>
            </button>
          )}
        </div>
      </main>

      {/* Clean Footer (Bottom text 'all candle blown out' removed completely) */}
      <footer className="relative z-10 text-center mb-4 min-h-[1.25rem]">
        {/* Clean, empty footer spacing */}
      </footer>
    </div>
  );
};
