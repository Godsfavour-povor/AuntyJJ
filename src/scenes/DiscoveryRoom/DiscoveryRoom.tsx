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
      {/* Top Header (Clean and uncluttered) */}
      <header className="relative z-10 text-center max-w-xl mt-12 sm:mt-10 space-y-1">
        <h1 className="text-2xl sm:text-4xl font-display font-bold text-deep-ink tracking-tight">
          Happy Birthday, {BIRTHDAY_DATA.sisterName}!
        </h1>
      </header>

      {/* Center Game Arena & Pip Speech */}
      <main className="relative z-10 flex flex-col items-center my-auto w-full max-w-4xl space-y-2">
        {/* Pip's Friendly Greeting */}
        <div className="flex items-center justify-center gap-3 w-full max-w-lg mb-1">
          <div className="hidden sm:block">
            <PipCharacter mood={characterMood} size={60} />
          </div>
          <SpeechBubble tailPosition="bottom-left" className="w-full">
            <p className="font-display font-bold text-xs sm:text-sm text-deep-ink">
              Welcome to your Birthday Apartment! Let&apos;s see what surprises are waiting inside! ✨
            </p>
          </SpeechBubble>
        </div>

        {/* The Playable Top-Down Apartment Game */}
        <ApartmentGame />
      </main>

      {/* Clean Footer (No nagging tutorial text) */}
      <footer className="relative z-10 text-center mb-3">
        <div className="h-4" />
      </footer>
    </div>
  );
};
