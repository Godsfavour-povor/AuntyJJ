import React from 'react';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { ApartmentGame } from './ApartmentGame';
import { PipCharacter } from '../../components/Character/PipCharacter';
import { useAdventure } from '../../context/AdventureContext';

export const DiscoveryRoom: React.FC = () => {
  const { characterMood } = useAdventure();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-3 sm:p-6 overflow-hidden bg-gradient-to-b from-[#F0FDF4] via-[#FFFDF8] to-[#FDF4FF] select-none">
      {/* Top Header */}
      <header className="relative z-10 text-center max-w-xl mt-12 sm:mt-8 space-y-1">
        <h1 className="text-2xl sm:text-4xl font-display font-bold text-deep-ink tracking-tight drop-shadow-[2px_2px_0px_#F9A8D4]">
          Happy Birthday, {BIRTHDAY_DATA.sisterName}!
        </h1>
      </header>

      {/* Center Game Arena & Cloud Dialogue */}
      <main className="relative z-10 flex flex-col items-center my-auto w-full max-w-4xl space-y-2.5">
        {/* Pip's Friendly Greeting in Whimsical Cloud Bubble */}
        <div className="relative flex items-center justify-center gap-3 w-full max-w-xl mb-1 px-2">
          {/* Mascot Pip */}
          <div className="flex-shrink-0 animate-balloon-float">
            <PipCharacter mood={characterMood} size={68} />
          </div>

          {/* Cloud-Shaped Dialogue Prompt */}
          <div className="relative flex-1 bg-white/95 backdrop-blur-md border-[3px] border-deep-ink px-5 py-3 rounded-[2rem] shadow-[4px_4px_0px_#1E1B4B]">
            {/* Whimsical Cloud Puffs Lobes on Top Edge */}
            <div className="absolute -top-3.5 left-6 w-8 h-8 bg-white rounded-full border-t-[3px] border-l-[3px] border-deep-ink pointer-events-none" />
            <div className="absolute -top-4 left-16 w-9 h-9 bg-white rounded-full border-t-[3px] border-r-[3px] border-deep-ink pointer-events-none" />
            <div className="absolute -top-3 right-10 w-7 h-7 bg-white rounded-full border-t-[3px] border-r-[3px] border-deep-ink pointer-events-none" />

            {/* Cloud Tail Pointing Left to Pip */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l-[3px] border-b-[3px] border-deep-ink transform rotate-45" />

            <p className="relative z-10 font-display font-bold text-xs sm:text-sm text-deep-ink leading-snug">
              Welcome to your Birthday Apartment! Let&apos;s see what surprises are inside here! ✨
            </p>
          </div>
        </div>

        {/* The Playable Top-Down Apartment Game */}
        <ApartmentGame />
      </main>

      {/* Clean Footer */}
      <footer className="relative z-10 text-center mb-2">
        <div className="h-2" />
      </footer>
    </div>
  );
};
