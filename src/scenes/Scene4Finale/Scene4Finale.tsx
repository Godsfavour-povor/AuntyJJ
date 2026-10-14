import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { LetterEnvelope } from './LetterEnvelope';
import { PersonalLetter } from './PersonalLetter';

export const Scene4Finale: React.FC = () => {
  const { letterOpened, openLetter } = useAdventure();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden bg-radial from-plum-900 via-plum-950 to-black select-none">
      {/* Background ambient warmth */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[36rem] h-[36rem] rounded-full bg-amber-500/10 blur-3xl animate-ambient-glow" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 text-center max-w-xl mt-6 sm:mt-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum-900/60 border border-gold-400/20 text-xs tracking-widest uppercase text-gold-400/90 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>Chapter IV &middot; The Birthday Finale</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif text-ivory/95 font-normal tracking-wide px-4">
          {letterOpened ? "A Letter For My Big Sister" : "A Sealed Envelope Awaits"}
        </h1>

        {!letterOpened && (
          <p className="text-xs sm:text-sm text-ivory/70 max-w-sm mx-auto font-sans font-light">
            All the starlight gathered from our memories has sealed this letter for you.
          </p>
        )}
      </header>

      {/* Center Envelope & Unfolded Letter */}
      <main className="relative z-10 w-full my-auto py-4">
        <LetterEnvelope isOpen={letterOpened} onOpen={openLetter}>
          <PersonalLetter />
        </LetterEnvelope>
      </main>

      {/* Footer subtle text */}
      <footer className="relative z-10 mb-4 text-center">
        {!letterOpened ? (
          <p className="text-xs text-ivory/40 tracking-wider">
            (Tap the golden wax seal to open your letter)
          </p>
        ) : (
          <p className="text-[11px] text-gold-400/60 tracking-widest uppercase">
            Designed and engineered with love by Godsfavour
          </p>
        )}
      </footer>
    </div>
  );
};
