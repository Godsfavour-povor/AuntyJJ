import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { PipCharacter } from '../../components/Character/PipCharacter';
import { ScratchCard } from '../DiscoveryRoom/ScratchCard';

export const BirthdayFinale: React.FC = () => {
  const { replayAdventure, characterMood, scratchCompleted, completeScratch } = useAdventure();
  const [celebrationFired, setCelebrationFired] = useState<boolean>(false);

  const handleFireConfetti = () => {
    setCelebrationFired(true);

    const count = 150;
    const defaults = {
      origin: { y: 0.65 },
      colors: ['#FB7185', '#38BDF8', '#2DD4BF', '#FDE047', '#C084FC'],
      disableForReducedMotion: true,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 35, startVelocity: 55 });
    fire(0.2, { spread: 65 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  return (
    <div className="relative h-screen h-[100dvh] max-h-screen w-full flex flex-col items-center justify-between p-3 sm:p-5 overflow-hidden bg-gradient-to-b from-[#FEF08A] via-[#FFFDF8] to-[#FCE7F3] select-none">
      {/* Decorative Confetti Polka Dots in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-deep-ink/20 animate-pulse"
            style={{
              width: `${(i % 3) * 6 + 6}px`,
              height: `${(i % 3) * 6 + 6}px`,
              backgroundColor: ['#FB7185', '#38BDF8', '#2DD4BF', '#FDE047', '#C084FC'][i % 5],
              top: `${(i * 17) % 100}%`,
              left: `${(i * 23) % 100}%`,
              animationDuration: `${2 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      {/* Top Header Card */}
      <header className="relative z-10 text-center max-w-xl pt-1.5 sm:pt-4 flex-shrink-0">
        <span className="inline-block px-3 py-0.5 rounded-full bg-coral text-white text-[11px] sm:text-xs font-display font-extrabold uppercase tracking-wider shadow-[2px_2px_0px_#1E1B4B]">
          Grand Birthday Finale 🎈
        </span>
        <h1 className="text-xl sm:text-4xl font-display font-black text-deep-ink tracking-tight mt-1 drop-shadow-sm">
          A Final Scratch Surprise For You! ✨
        </h1>
      </header>

      {/* Center: The Scratch Card with 1-2 liner "Happy Birthday" */}
      <main className="relative z-10 w-full max-w-md my-auto flex flex-col items-center justify-center px-3">
        <ScratchCard
          onCompleted={completeScratch}
          isCompleted={scratchCompleted}
          containerClassName="relative w-full h-[38vh] sm:h-[44vh] max-h-[290px] [@media(max-height:560px)]:h-[46vh] [@media(max-height:560px)]:max-h-[175px] rounded-3xl overflow-hidden shadow-[8px_8px_0px_#1E1B4B] border-[3.5px] border-deep-ink bg-white flex items-center justify-center"
        >
          {/* Revealed Secret Content: One or Two-Liner Happy Birthday */}
          <div className="w-full h-full p-3 sm:p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-amber-50 to-rose-50 select-none">
            <div className="w-10 h-10 sm:w-14 sm:h-14 [@media(max-height:560px)]:w-8 [@media(max-height:560px)]:h-8 rounded-full bg-yellow border-[2.5px] sm:border-[3px] border-deep-ink flex items-center justify-center text-xl sm:text-3xl shadow-[2px_2px_0px_#1E1B4B] mb-1 sm:mb-2 animate-bounce">
              🎂
            </div>
            <h2 className="text-2xl sm:text-5xl font-display font-black text-coral tracking-tight leading-tight drop-shadow-sm">
              Happy Birthday! 🎉
            </h2>
            <p className="font-handwritten text-lg sm:text-3xl font-bold text-deep-ink mt-1 sm:mt-2 leading-snug">
              Wishing you endless joy, love &amp; blessings today and always! ❤️
            </p>
          </div>
        </ScratchCard>

        {/* Action Buttons: "Confetti! 🎊" and "Start Again ↺" */}
        <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-3 mt-2.5 sm:mt-4 flex-shrink-0">
          <button
            onClick={handleFireConfetti}
            className="flex items-center gap-2 px-4 sm:px-7 py-2.5 sm:py-3 rounded-2xl bg-coral hover:bg-coral-dark text-white border-[3px] border-deep-ink font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Confetti! 🎊</span>
          </button>

          <button
            onClick={replayAdventure}
            className="flex items-center gap-2 px-4 sm:px-7 py-2.5 sm:py-3 rounded-2xl bg-white hover:bg-yellow text-deep-ink border-[3px] border-deep-ink font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Again ↺</span>
          </button>
        </div>

        {celebrationFired && (
          <p className="text-center text-xs font-display font-bold text-turquoise-dark mt-2 animate-fade-in">
            🌟 Here&apos;s to your happiest, brightest, and most blessed year yet! 🌟
          </p>
        )}
      </main>

      {/* Footer & Pip Mascot */}
      <footer className="relative z-10 w-full flex items-center justify-between max-w-md px-4 pb-2 flex-shrink-0">
        <div className="text-[11px] font-sans font-bold text-deep-ink/60 uppercase tracking-wider">
          Engineered with joy by Godsfavour ❤️
        </div>

        <div className="pointer-events-none">
          <PipCharacter mood={characterMood} size={65} />
        </div>
      </footer>
    </div>
  );
};
