import React from 'react';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { ApartmentGame } from './ApartmentGame';
import { PipCharacter } from '../../components/Character/PipCharacter';
import { SpeechBubble } from '../../components/SpeechBubble/SpeechBubble';
import { useAdventure } from '../../context/AdventureContext';

export const DiscoveryRoom: React.FC = () => {
  const { characterMood } = useAdventure();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-3 sm:p-6 overflow-hidden bg-gradient-to-b from-[#F0FDF4] via-[#FFFDF8] to-[#FDF4FF] select-none">
      {/* Top Header (Clean, chapter badge completely removed per request) */}
      <header className="relative z-10 text-center max-w-xl mt-12 sm:mt-10 space-y-1">
        <h1 className="text-2xl sm:text-4xl font-display font-bold text-deep-ink tracking-tight">
          Explore The Birthday Apartment, {BIRTHDAY_DATA.sisterName}!
        </h1>
      </header>

      {/* Center Game Arena & Pip Speech */}
      <main className="relative z-10 flex flex-col items-center my-auto w-full max-w-4xl space-y-2">
        {/* Pip's Dialogue */}
        <div className="flex items-center justify-center gap-3 w-full max-w-lg mb-1">
          <div className="hidden sm:block">
            <PipCharacter mood={characterMood} size={60} />
          </div>
          <SpeechBubble tailPosition="bottom-left" className="w-full">
            <p className="font-display font-bold text-xs sm:text-sm text-deep-ink">
              Use the joystick or arrow keys to explore each room! Approach tables to open your secret birthday envelopes ✉️✨
            </p>
          </SpeechBubble>
        </div>

        {/* The Playable Top-Down Apartment Game */}
        <ApartmentGame />
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 text-center mb-3">
        <p className="text-xs font-sans font-medium text-deep-ink/50 tracking-wider">
          (Interactive birthday apartment &bull; Move Pip with joystick or keyboard)
        </p>
      </footer>
    </div>
  );
};
