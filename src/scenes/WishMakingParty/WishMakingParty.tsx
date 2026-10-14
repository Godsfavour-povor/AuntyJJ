import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wind, Mic } from 'lucide-react';
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

  const candlesBlownCount = blownCandles.filter(Boolean).length;
  const allCandlesBlown = candlesBlownCount === 3;

  // Single breath / blow event (extinguishes 1 candle per breath for measured pacing)
  const handleSingleBlow = useCallback(() => {
    if (!isWishing || blowCooldownRef.current || allCandlesBlown) return;
    blowCooldownRef.current = true;
    blowStreakRef.current = 0;

    // Trigger authentic cartoon facing wind gust
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
            particleCount: 85,
            spread: 90,
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
    }, 550);
  }, [isWishing, allCandlesBlown, extinguishCandles, setCharacterMood, audio]);

  // High-precision microphone breath puff detector with ambient calibration & turbulence filter
  useEffect(() => {
    if (!isWishing || allCandlesBlown) return;

    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let isCancelled = false;

    const startMic = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setMicActive(false);
          return;
        }

        // CRITICAL: Disable browser noiseSuppression and echoCancellation, which
        // aggressively treat human breath/blowing as unwanted background wind noise!
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);

        analyser.smoothingTimeConstant = 0.2;
        analyser.fftSize = 256;
        source.connect(analyser);

        setMicActive(true);
        const timeData = new Uint8Array(analyser.fftSize);

        let calibrationFrames = 0;
        let baselineSum = 0;
        let baselineNoise = 4; // Silence default deviation

        const poll = () => {
          if (isCancelled || allCandlesBlown) return;

          // Time-domain displacement: measures direct physical diaphragm excursion
          analyser.getByteTimeDomainData(timeData);
          let deviationSum = 0;
          for (let i = 0; i < timeData.length; i++) {
            deviationSum += Math.abs(timeData[i] - 128);
          }
          const avgDeviation = deviationSum / timeData.length;

          // Calibration phase: adapts to hardware mic sensitivity in first 35 frames (~500ms)
          if (calibrationFrames < 35) {
            baselineSum += avgDeviation;
            calibrationFrames++;
            if (calibrationFrames === 35) {
              baselineNoise = Math.max(3, baselineSum / 35);
            }
            animFrameRef.current = requestAnimationFrame(poll);
            return;
          }

          // Dynamic breath threshold: sensitive to air puff above ambient room floor
          const triggerDelta = 14;
          const dynamicThreshold = baselineNoise + triggerDelta;
          const visualRatio = Math.max(0, (avgDeviation - baselineNoise) / triggerDelta);
          const visualPercent = Math.min(100, Math.round(visualRatio * 100));
          setBreathIntensity(visualPercent);

          // Detect sustained physical breath
          if (avgDeviation > dynamicThreshold && !blowCooldownRef.current) {
            blowStreakRef.current += 1;
            // 2-3 consecutive frames (~40ms) confirms actual breath
            if (blowStreakRef.current >= 2) {
              handleSingleBlow();
            }
          } else {
            blowStreakRef.current = Math.max(0, blowStreakRef.current - 1);
          }

          animFrameRef.current = requestAnimationFrame(poll);
        };

        animFrameRef.current = requestAnimationFrame(poll);
      } catch {
        // Fallback gracefully if microphone permission is denied or unsupported
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

  // Click on "Make a wish"
  const handleStartWish = () => {
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

        {/* Cake Composition with Cloud Blow Indicator on the SIDE */}
        <div className="relative flex items-center justify-center w-full">
          {/* Pip The Mascot on Left */}
          <div className="hidden sm:block absolute left-4 bottom-2 z-20">
            <PipCharacter mood={characterMood} size={110} />
          </div>

          {/* Redesigned Gourmet 3-Deck Cake */}
          <div className="z-10 relative">
            <BirthdayCake
              blownCandles={blownCandles}
              isBlowing={isBlowing}
              onBlowCandles={handleSingleBlow}
            />
          </div>

          {/* Storybook Inscription (Tells her what to do with real-time breath meter & tap fallback) */}
          {isWishing && !allCandlesBlown && (
            <div
              onClick={handleSingleBlow}
              className="absolute -top-12 sm:-top-8 z-30 flex flex-col items-center animate-fade-in cursor-pointer select-none"
              title="Blow into your microphone or tap to extinguish!"
            >
              <div className="px-5 py-2.5 rounded-full bg-white/95 border-2 border-deep-ink shadow-[3px_3px_0px_#1E1B4B] flex items-center gap-3 hover:scale-105 active:scale-95 transition-transform">
                <Wind className="w-4 h-4 text-coral animate-pulse" />
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5">
                  <span className="font-display font-bold text-xs uppercase tracking-wider text-deep-ink">
                    {micActive ? "Blow into your mic or tap cake 🌬️" : "Blow into your mic or tap cake 🌬️"}
                  </span>
                  <span className="text-[10px] font-sans font-semibold text-coral">
                    ({3 - candlesBlownCount} candle{3 - candlesBlownCount > 1 ? 's' : ''} left)
                  </span>
                </div>

                {/* Live Real-Time Breath Meter */}
                {micActive ? (
                  <div className="flex items-center gap-1.5" title="Live Microphone Breath Sensor">
                    <Mic className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <div className="w-16 sm:w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-deep-ink/20">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-coral transition-all duration-75 rounded-full"
                        style={{ width: `${Math.max(5, breathIntensity)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Tap Ready ✨
                  </span>
                )}
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
