import React from 'react';
import { useAdventure } from '../../context/AdventureContext';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { FoldingLetter } from './FoldingLetter';
import { PipCharacter } from '../../components/Character/PipCharacter';

export const BirthdayFinale: React.FC = () => {
  const { letterOpened, openLetter, characterMood } = useAdventure();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden bg-gradient-to-b from-[#FEF08A] via-[#FFFDF8] to-[#FCE7F3] select-none">
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
      <header className="relative z-10 text-center max-w-2xl mt-12 sm:mt-8 space-y-2">
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-deep-ink tracking-tight drop-shadow-sm">
          🎂 Happy Birthday, {BIRTHDAY_DATA.sisterName}! 🎈
        </h1>

        {!letterOpened && (
          <p className="text-xs sm:text-sm font-sans font-semibold text-deep-ink/75 max-w-sm mx-auto">
            A special sealed letter has arrived just for you!
          </p>
        )}
      </header>

      {/* Center Folding Letter & Pip */}
      <main className="relative z-10 w-full my-auto py-4">
        <FoldingLetter isOpen={letterOpened} onOpen={openLetter} />
      </main>

      {/* Footer & Pip Mascot */}
      <footer className="relative z-10 w-full flex items-center justify-between max-w-lg mb-4 px-4">
        <div className="text-[11px] font-sans font-semibold text-deep-ink/60 uppercase tracking-wider">
          Engineered with joy by Godsfavour
        </div>

        <div className="pointer-events-none">
          <PipCharacter mood={characterMood} size={90} />
        </div>
      </footer>
    </div>
  );
};
