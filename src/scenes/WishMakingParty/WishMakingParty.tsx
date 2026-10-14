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

  // State: 'idle' -> 'wishing' (prompt active, ready to blow) -> 'blowing' (physical wind/tilt) -> 'blown' (hooray!)
  const [stage, setStage] = useState<'idle' | 'wishing' | 'blowing' | 'blown'>(
    wishStage === 'candles_blown' ? 'blown' : 'idle'
  );
  const isExtinguishedRef = useRef<boolean>(wishStage === 'candles_blown');

  useEffect(() => {
    isExtinguishedRef.current = wishStage === 'candles_blown';
    if (wishStage === 'candles_blown') {
      setStage('blown');
    }
  }, [wishStage]);

  // Physical blow sequence
  const executeBlow = useCallback(() => {
    if (isExtinguishedRef.current) return;
    isExtinguishedRef.current = true;

    // 1. Physical blowing wind & flame tilt animation
    setStage('blowing');
    audio.playCandleBlow();

    // 2. Extinguish flames after wind breath
    setTimeout(() => {
      extinguishCandles();
      setStage('blown');
      setCharacterMood('celebrating');
      audio.playPartyHorn();

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.62 },
        colors: ['#FB7185', '#38BDF8', '#2DD4BF', '#FDE047', '#C084FC'],
        disableForReducedMotion: true,
      });
    }, 400);
  }, [extinguishCandles, setCharacterMood, audio]);

  // Optional background mic breath listener while in 'wishing' mode
  useEffect(() => {
    if (stage !== 'wishing') return;
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
          if (isExtinguishedRef.current) return;
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          const avg = sum / data.length;

          // Breath puff threshold
          if (avg > 40) {
            executeBlow();
            return;
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
  }, [stage, executeBlow]);

  // Handle "Make a wish" button click
  const handleMakeWishClick = () => {
    audio.playPop();
    setStage('wishing');
    setCharacterMood('wishing');
    audio.duckMusic(true);
  };

  const isBlown = stage === 'blown';

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden bg-gradient-to-b from-[#FEF3C7] via-[#FFFDF8] to-[#FDF4FF] select-none">
      {/* Decorative Floating Party Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-10 left-8 w-14 h-14 rounded-full bg-peach/40 blur-md animate-pulse" />
        <div className="absolute top-1/3 right-10 w-20 h-20 rounded-full bg-yellow/40 blur-lg animate-pulse" />
        <div className="absolute bottom-20 left-12 w-16 h-16 rounded-full bg-turquoise/30 blur-md animate-pulse" />
      </div>

      {/* Top Header (Clean, chapter badge removed per request) */}
      <header className="relative z-10 text-center max-w-lg mt-12 sm:mt-10 space-y-1">
        <h1 className="text-2xl sm:text-4xl font-display font-bold text-deep-ink tracking-tight">
          Happy Birthday, {BIRTHDAY_DATA.sisterName}!
        </h1>
      </header>

      {/* Center Cake & Pip Dialogue */}
      <main className="relative z-10 flex flex-col items-center my-auto w-full max-w-lg space-y-4">
        {/* Pip's Dynamic Speech Bubble */}
        <SpeechBubble tailPosition="bottom-left" className="mb-1 max-w-md">
          {stage === 'idle' && (
            <p className="font-display font-bold text-base sm:text-lg text-deep-ink">
              Ready for your special birthday cake? Tap below to make your wish! 🎂
            </p>
          )}

          {stage === 'wishing' && (
            <p className="font-display font-bold text-base sm:text-lg text-coral animate-pulse">
              Close your eyes, make your secret wish... and now BLOW! 🌬️
            </p>
          )}

          {stage === 'blowing' && (
            <p className="font-display font-bold text-base sm:text-lg text-coral">
              Blowing out the candles... 🌬️✨
            </p>
          )}

          {stage === 'blown' && (
            <p className="font-display font-bold text-base sm:text-lg text-turquoise-dark animate-bounce">
              🎉 HOORAY! Happy Birthday! Your wish is on its way to the stars!
            </p>
          )}
        </SpeechBubble>

        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
          {/* Pip The Mascot */}
          <div className="sm:absolute sm:left-2 sm:bottom-2 z-20">
            <PipCharacter mood={isBlown ? 'celebrating' : characterMood} size={110} />
          </div>

          {/* Birthday Cake */}
          <div className="z-10 relative">
            <BirthdayCake
              candlesBlown={isBlown}
              isBlowing={stage === 'blowing'}
              onBlowCandles={executeBlow}
            />

            {/* Floating indicator: says strictly "Blow" */}
            {!isBlown && (
              <div
                onClick={executeBlow}
                className="absolute top-2 left-1/2 -translate-x-1/2 cursor-pointer flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/95 border-2 border-deep-ink shadow-[2px_2px_0px_#1E1B4B] animate-bounce hover:scale-105 transition-transform"
              >
                <Wind className="w-3.5 h-3.5 text-coral animate-pulse" />
                <span className="text-[12px] font-display font-bold uppercase tracking-wider text-deep-ink">
                  Blow 🎂
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Clean, Seamless Action Area */}
        <div className="flex items-center justify-center gap-3 w-full max-w-sm pt-2">
          {stage === 'idle' && (
            <button
              onClick={handleMakeWishClick}
              className="px-8 py-3.5 rounded-full bg-yellow hover:bg-yellow-dark text-deep-ink border-2 border-deep-ink font-display font-bold text-sm tracking-wider uppercase shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Make A Wish ✨
            </button>
          )}

          {stage === 'wishing' && (
            <button
              onClick={executeBlow}
              className="px-8 py-3.5 rounded-full bg-coral hover:bg-coral-dark text-white border-2 border-deep-ink font-display font-bold text-sm tracking-wider uppercase shadow-[3px_3px_0px_#1E1B4B] animate-pulse hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
            >
              Blow Candles 🌬️
            </button>
          )}

          {isBlown && (
            <button
              onClick={() => goToScene('scene_3_discovery')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-coral to-peach text-white border-2 border-deep-ink font-display font-bold text-sm tracking-wider uppercase shadow-[4px_4px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all animate-bounce"
            >
              <span>Explore The Birthday Apartment ➔</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>

      {/* Footer Instructions (Minimal & Clean) */}
      <footer className="relative z-10 text-center mb-4">
        {isBlown && (
          <button
            onClick={() => goToScene('scene_3_discovery')}
            className="text-xs font-sans font-medium text-deep-ink/60 hover:text-deep-ink underline tracking-wider cursor-pointer"
          >
            Skip to apartment ➔
          </button>
        )}
      </footer>
    </div>
  );
};
