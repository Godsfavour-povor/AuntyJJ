import React from 'react';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { ApartmentGame } from './ApartmentGame';
import { PipCharacter } from '../../components/Character/PipCharacter';
import { useAdventure } from '../../context/AdventureContext';

export const DiscoveryRoom: React.FC = () => {
  const { characterMood } = useAdventure();

  return (
    <div className="relative h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex flex-col items-center justify-between p-2.5 sm:p-5 landscape:p-1 overflow-hidden bg-gradient-to-b from-[#F0FDF4] via-[#FFFDF8] to-[#FDF4FF] select-none">
      {/* Top Header - visible on portrait, hidden on mobile landscape */}
      <header className="relative z-10 text-center max-w-xl mt-7 sm:mt-10 space-y-0.5 flex-shrink-0 [@media(max-height:560px)]:hidden">
        <h1 className="text-xl sm:text-3xl font-display font-bold text-deep-ink tracking-tight drop-shadow-[2px_2px_0px_#F9A8D4]">
          Happy Birthday, {BIRTHDAY_DATA.sisterName}!
        </h1>
      </header>

      {/* Center Game Arena & Cloud Dialogue */}
      <main className="relative z-10 flex flex-col items-center my-auto w-full max-w-5xl space-y-2 landscape:space-y-0.5">
        {/* Pip's Friendly Greeting in Whimsical Cloud Bubble (Visible on portrait, hidden on mobile landscape) */}
        <div className="relative flex items-center justify-center gap-2.5 w-full max-w-lg mb-1 px-2 flex-shrink-0 [@media(max-height:560px)]:hidden">
          {/* Mascot Pip */}
          <div className="flex-shrink-0 animate-balloon-float">
            <PipCharacter mood={characterMood} size={52} />
          </div>

          {/* Cloud-Shaped Dialogue Prompt */}
          <div className="relative flex-1 bg-white/95 backdrop-blur-md border-[2.5px] border-deep-ink px-4 py-2 sm:px-5 sm:py-2.5 rounded-[1.8rem] shadow-[3px_3px_0px_#1E1B4B]">
            {/* Whimsical Cloud Puffs Lobes on Top Edge */}
            <div className="absolute -top-3 left-6 w-7 h-7 bg-white rounded-full border-t-[2.5px] border-l-[2.5px] border-deep-ink pointer-events-none" />
            <div className="absolute -top-3.5 left-14 w-8 h-8 bg-white rounded-full border-t-[2.5px] border-r-[2.5px] border-deep-ink pointer-events-none" />
            <div className="absolute -top-2.5 right-8 w-6 h-6 bg-white rounded-full border-t-[2.5px] border-r-[2.5px] border-deep-ink pointer-events-none" />

            {/* Cloud Tail Pointing Left to Pip */}
            <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-l-[2.5px] border-b-[2.5px] border-deep-ink transform rotate-45" />

            <p className="relative z-10 font-display font-bold text-xs sm:text-sm text-deep-ink leading-snug">
              Welcome to your Birthday Apartment! Let&apos;s see what surprises are inside here! ✨
            </p>
          </div>
        </div>

        {/* The Playable Top-Down Apartment Game */}
        <ApartmentGame />
      </main>

      {/* Clean Footer */}
      <footer className="relative z-10 text-center mb-1 flex-shrink-0">
        <div className="h-1" />
      </footer>
    </div>
  );
};
