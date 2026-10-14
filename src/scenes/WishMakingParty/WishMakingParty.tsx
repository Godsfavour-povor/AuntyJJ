import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wind, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAdventure } from '../../context/AdventureContext';
import { useAudio } from '../../audio/useAudio';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { BirthdayCake } from './BirthdayCake';
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
  const blowCooldownRef = useRef<boolean>(false);

  const candlesBlownCount = blownCandles.filter(Boolean).length;
  const allCandlesBlown = candlesBlownCount === 3;

  // Single breath / blow event (extinguishes 1 candle per breath for measured pacing)
  const handleSingleBlow = useCallback(() => {
    if (!isWishing || blowCooldownRef.current || allCandlesBlown) return;
    blowCooldownRef.current = true;

    // Trigger physical facing wind gust from front
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

          // Gentle celebratory confetti
          confetti({
            particleCount: 70,
            spread: 75,
            origin: { y: 0.65 },
            colors: ['#FB7185', '#38BDF8', '#2DD4BF', '#FDE047', '#C084FC'],
            disableForReducedMotion: true,
          });
        }
        return next;
      });

      // Pacing cooldown: allows sister to catch breath between candles
      setTimeout(() => {
        blowCooldownRef.current = false;
      }, 700);
    }, 450);
  }, [isWishing, allCandlesBlown, extinguishCandles, setCharacterMood, audio]);

  // Background microphone air puff detection while in 'wishing' mode
  useEffect(() => {
    if (!isWishing || allCandlesBlown) return;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;

    const startMic = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser.smoothingTimeConstant = 0.2;
        analyser.fftSize = 256;
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);

        const poll = () => {
          if (allCandlesBlown) return;
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          const avg = sum / data.length;

          // Breath sound threshold
          if (avg > 38 && !blowCooldownRef.current) {
            handleSingleBlow();
          }
          requestAnimationFrame(poll);
        };
        requestAnimationFrame(poll);
      } catch {
        // Fallback to tap
      }
    };

    startMic();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (audioCtx) audioCtx.close().catch(() => {});
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
      {/* Top Header (Clean, chapter badge removed) */}
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

          {/* Redesigned 3-Deck Cake */}
          <div className="z-10 relative">
            <BirthdayCake
              blownCandles={blownCandles}
              isBlowing={isBlowing}
              onBlowCandles={handleSingleBlow}
            />
          </div>

          {/* Cloud-Shaped Blowing Prompt at the SIDE (Only appears AFTER clicking 'Make a wish') */}
          {isWishing && !allCandlesBlown && (
            <div
              onClick={handleSingleBlow}
              className="absolute right-2 sm:right-6 top-1/4 z-30 cursor-pointer flex flex-col items-center transition-transform hover:scale-105 active:scale-95"
            >
              {/* Cloud SVG Container with pointing tail */}
              <div className="relative px-5 py-3.5 bg-white border-2 border-deep-ink rounded-[28px] shadow-[4px_4px_0px_#1E1B4B] flex items-center gap-2">
                <Wind className="w-5 h-5 text-coral animate-pulse" />
                <div className="text-left">
                  <div className="font-display font-bold text-xs uppercase tracking-wider text-deep-ink">
                    Blow Here! 🌬️
                  </div>
                  <div className="text-[10px] font-sans font-medium text-deep-ink/70">
                    {3 - candlesBlownCount} candle{3 - candlesBlownCount > 1 ? 's' : ''} left
                  </div>
                </div>

                {/* Cloud Tail Pointing toward the Cake */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-b-2 border-l-2 border-deep-ink rotate-45" />
              </div>
            </div>
          )}
        </div>

        {/* Single Action Button Area */}
        <div className="flex items-center justify-center w-full max-w-sm pt-2">
          {!isWishing && (
            <button
              onClick={handleStartWish}
              className="px-8 py-3.5 rounded-full bg-yellow hover:bg-yellow-dark text-deep-ink border-2 border-deep-ink font-display font-bold text-sm tracking-wider uppercase shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
            >
              Make A Wish ✨
            </button>
          )}

          {isWishing && !allCandlesBlown && (
            <button
              onClick={handleSingleBlow}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-coral hover:bg-coral-dark text-white border-2 border-deep-ink font-display font-bold text-sm tracking-wider uppercase shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
            >
              <Wind className="w-4 h-4" />
              <span>Blow Candle ({3 - candlesBlownCount} Left) 🌬️</span>
            </button>
          )}

          {allCandlesBlown && (
            /* Exactly ONE button: Continue */
            <button
              onClick={() => goToScene('scene_3_discovery')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-coral to-peach text-white border-2 border-deep-ink font-display font-bold text-sm tracking-wider uppercase shadow-[4px_4px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
            >
              <span>Continue ➔</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="relative z-10 text-center mb-4">
        <p className="text-xs font-sans font-medium text-deep-ink/50 tracking-wider">
          {allCandlesBlown ? 'All candles blown out!' : isWishing ? 'Blow gently into your microphone or tap to extinguish each candle' : ''}
        </p>
      </footer>
    </div>
  );
};
