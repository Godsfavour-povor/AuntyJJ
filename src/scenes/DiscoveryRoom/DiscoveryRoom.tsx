import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { TreasureTrailGame } from './TreasureTrailGame';
import { PipCharacter } from '../../components/Character/PipCharacter';
import { SpeechBubble } from '../../components/SpeechBubble/SpeechBubble';

export const DiscoveryRoom: React.FC = () => {
  const { scratchCompleted, exploredMemoryIds, characterMood } = useAdventure();

  const allMemoriesExplored = BIRTHDAY_DATA.memories.every((m) => exploredMemoryIds.includes(m.id));
  const isTrailComplete = allMemoriesExplored && scratchCompleted;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden bg-gradient-to-b from-[#F0FDF4] via-[#FFFDF8] to-[#FDF4FF] select-none">
      {/* Top Header */}
      <header className="relative z-10 text-center max-w-lg mt-12 sm:mt-8 space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border-2 border-deep-ink text-xs font-display font-bold uppercase tracking-widest text-deep-ink shadow-[2px_2px_0px_#1E1B4B]">
          <Sparkles className="w-3.5 h-3.5 text-coral" />
          <span>Chapter III &middot; The Birthday Treasure Trail</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-display font-bold text-deep-ink tracking-tight">
          Uncover Your Keepsakes, {BIRTHDAY_DATA.sisterName}!
        </h1>
      </header>

      {/* Center Game Arena & Dialogue */}
      <main className="relative z-10 flex flex-col items-center my-auto w-full max-w-2xl space-y-3">
        {/* Pip's Dialogue */}
        <div className="flex items-center justify-center gap-3 w-full max-w-md">
          <div className="hidden sm:block">
            <PipCharacter mood={characterMood} size={65} />
          </div>
          <SpeechBubble tailPosition="bottom-left" className="w-full">
            <p className="font-display font-bold text-xs sm:text-sm text-deep-ink">
              {isTrailComplete
                ? "🌟 All 4 keepsakes unlocked! The Grand Rainbow Portal is open!"
                : "Guide me across the trail to discover your secret sister keepsakes & royal scratch card! 🗺️"}
            </p>
          </SpeechBubble>
        </div>

        {/* The Playable Treasure Trail Game */}
        <TreasureTrailGame />
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 text-center mb-4">
        <p className="text-xs font-sans font-medium text-deep-ink/50 tracking-wider">
          (Interactive birthday adventure &bull; Navigate Pip to explore all keepsakes)
        </p>
      </footer>
    </div>
  );
};
