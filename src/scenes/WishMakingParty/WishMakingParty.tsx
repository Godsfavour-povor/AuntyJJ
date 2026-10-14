import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Wind, Mic, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAdventure } from '../../context/AdventureContext';
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

  const [micActive, setMicActive] = useState<boolean>(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const isExtinguishedRef = useRef<boolean>(wishStage === 'candles_blown');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    isExtinguishedRef.current = wishStage === 'candles_blown';
  }, [wishStage]);

  // Handle candle blow trigger
  const handleExtinguish = useCallback(() => {
    if (isExtinguishedRef.current) return;
    isExtinguishedRef.current = true;
    extinguishCandles();

    // Comic reaction: Pip has a 0.7s moment of breathless awe before celebrating
    setCharacterMood('surprised');
    setTimeout(() => {
      setCharacterMood('celebrating');

      // Burst gentle celebratory confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#FB7185', '#38BDF8', '#2DD4BF', '#FDE047', '#C084FC'],
        disableForReducedMotion: true,
      });
    }, 700);

    // Auto-advance countdown into Scene 3
    setAutoAdvanceCountdown(3);
  }, [extinguishCandles, setCharacterMood]);

  // Handle countdown timer to transition smoothly into the Treasure Trail
  useEffect(() => {
    if (autoAdvanceCountdown === null) return;
    if (autoAdvanceCountdown <= 0) {
      goToScene('scene_3_discovery');
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setAutoAdvanceCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoAdvanceCountdown, goToScene]);

  // Optional microphone blow detection
  const startMicDetection = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicActive(true);

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser.smoothingTimeConstant = 0.2;
      analyser.fftSize = 256;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      const pollVolume = () => {
        if (isExtinguishedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          audioCtx.close().catch(() => {});
          setMicActive(false);
          return;
        }

        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += data[i];
        }
        const avg = sum / data.length;

        // Blowing creates strong low-to-mid frequency volume bursts
        if (avg > 42) {
          handleExtinguish();
          stream.getTracks().forEach((track) => track.stop());
          audioCtx.close().catch(() => {});
          setMicActive(false);
          return;
        }

        requestAnimationFrame(pollVolume);
      };

      requestAnimationFrame(pollVolume);
    } catch {
      setMicActive(false);
    }
  };

  const isBlown = wishStage === 'candles_blown';

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden bg-gradient-to-b from-[#FEF3C7] via-[#FFFDF8] to-[#FDF4FF] select-none">
      {/* Decorative Floating Party Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-10 left-8 w-14 h-14 rounded-full bg-peach/40 blur-md animate-pulse" />
        <div className="absolute top-1/3 right-10 w-20 h-20 rounded-full bg-yellow/40 blur-lg animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-12 w-16 h-16 rounded-full bg-turquoise/30 blur-md animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top Header */}
      <header className="relative z-10 text-center max-w-lg mt-12 sm:mt-8 space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border-2 border-deep-ink text-xs font-display font-bold uppercase tracking-widest text-deep-ink shadow-[2px_2px_0px_#1E1B4B]">
          <Sparkles className="w-3.5 h-3.5 text-yellow-dark" />
          <span>Chapter II &middot; The Wish Ritual</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-display font-bold text-deep-ink tracking-tight">
          Make A Wish, {BIRTHDAY_DATA.sisterName}!
        </h1>
      </header>

      {/* Center Cake & Pip Dialogue */}
      <main className="relative z-10 flex flex-col items-center my-auto w-full max-w-lg space-y-3">
        {/* Pip's Dynamic Speech Bubble */}
        <SpeechBubble tailPosition="bottom-left" className="mb-1 max-w-md">
          {!isBlown ? (
            <>
              <p className="font-display font-bold text-base sm:text-lg text-deep-ink">
                Make your heartfelt birthday wish, Big Sis... 🎂
              </p>
              <p className="text-xs text-deep-ink/75 font-medium mt-1">
                Then blow into your mic or tap the candles when you&apos;re ready!
              </p>
            </>
          ) : (
            <>
              <p className="font-display font-bold text-base sm:text-lg text-turquoise-dark">
                🎉 WISH SECURED & SENT TO THE STARS!
              </p>
              <p className="text-xs text-deep-ink/75 font-medium mt-1">
                Look! A secret birthday keepsake was unlocked behind the cake!
              </p>
            </>
          )}
        </SpeechBubble>

        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
          {/* Pip The Mascot */}
          <div className="sm:absolute sm:left-2 sm:bottom-2 z-20">
            <PipCharacter mood={characterMood} size={110} />
          </div>

          {/* Birthday Cake (Direct Touch / Click target) */}
          <div className="z-10 relative">
            <BirthdayCake
              candlesBlown={isBlown}
              onBlowCandles={handleExtinguish}
            />

            {/* Glowing hint beacon above candles when unblown */}
            {!isBlown && (
              <div
                onClick={handleExtinguish}
                className="absolute top-2 left-1/2 -translate-x-1/2 cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border-2 border-deep-ink shadow-[2px_2px_0px_#1E1B4B] animate-bounce hover:scale-105 transition-transform"
              >
                <Wind className="w-3.5 h-3.5 text-coral animate-pulse" />
                <span className="text-[11px] font-display font-bold uppercase tracking-wider text-deep-ink">
                  Tap or Blow!
                </span>
              </div>
            )}

            {/* Unlocked Keepsake Parcel emerging behind cake once blown */}
            {isBlown && (
              <div
                onClick={() => goToScene('scene_3_discovery')}
                className="absolute -top-4 right-2 sm:right-6 z-30 cursor-pointer animate-comic-pop"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-coral hover:bg-coral-dark text-white border-2 border-deep-ink shadow-[4px_4px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                  <Gift className="w-5 h-5 animate-spin" />
                  <span className="font-display font-bold text-xs uppercase tracking-wider">
                    Open Keepsake Trail 🎁
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tactile Microphone & Instant Controls Bar (Clean & Uncluttered) */}
        <div className="flex items-center justify-center gap-3 w-full max-w-sm pt-2">
          {!isBlown ? (
            <>
              {/* Optional Mic Blow Button */}
              <button
                onClick={startMicDetection}
                disabled={micActive}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#1E1B4B] transition-all ${
                  micActive
                    ? 'bg-turquoise text-white border-deep-ink animate-pulse'
                    : 'bg-white hover:bg-peach text-deep-ink hover:translate-x-0.5 hover:translate-y-0.5'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-coral" />
                <span>{micActive ? 'Listening to your breath... 🌬️' : 'Blow With Mic'}</span>
              </button>

              {/* Direct Tap Cake Button */}
              <button
                onClick={handleExtinguish}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-yellow hover:bg-yellow-dark text-deep-ink border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
              >
                <Wind className="w-3.5 h-3.5 text-deep-ink" />
                <span>Blow Candles ✨</span>
              </button>
            </>
          ) : (
            /* Automatically advancing banner */
            <div
              onClick={() => goToScene('scene_3_discovery')}
              className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 border-deep-ink text-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] hover:bg-yellow transition-all"
            >
              <span>Transitioning to Birthday Trail in {autoAdvanceCountdown ?? 1}s...</span>
              <span className="underline text-coral">Tap to skip ➔</span>
            </div>
          )}
        </div>
      </main>

      {/* Footer Instructions */}
      <footer className="relative z-10 text-center mb-4">
        <p className="text-xs font-sans font-medium text-deep-ink/50 tracking-wider">
          {isBlown
            ? "✨ All candles extinguished! The party journey continues..."
            : "(Tap the cake or use your microphone to blow out the candles)"}
        </p>
      </footer>
    </div>
  );
};
