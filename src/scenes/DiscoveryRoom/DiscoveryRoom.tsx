import React from 'react';
import { Sparkles, ArrowRight, Award, Image, Bookmark } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { ScratchCard } from './ScratchCard';
import { PipCharacter } from '../../components/Character/PipCharacter';
import { SpeechBubble } from '../../components/SpeechBubble/SpeechBubble';

export const DiscoveryRoom: React.FC = () => {
  const {
    scratchCompleted,
    completeScratch,
    characterMood,
    openMemoryModal,
    exploredMemoryIds,
    goToScene,
  } = useAdventure();

  const getMemoryIcon = (type: string) => {
    switch (type) {
      case 'trophy':
        return <Award className="w-5 h-5 text-yellow-dark" />;
      case 'polaroid':
        return <Image className="w-5 h-5 text-coral" />;
      default:
        return <Bookmark className="w-5 h-5 text-turquoise-dark" />;
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden bg-gradient-to-b from-[#F0FDF4] via-[#FFFDF8] to-[#FDF4FF] select-none">
      {/* Top Header */}
      <header className="relative z-10 text-center max-w-lg mt-8 sm:mt-10 space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border-2 border-deep-ink text-xs font-display font-bold uppercase tracking-widest text-deep-ink shadow-[2px_2px_0px_#1E1B4B]">
          <Sparkles className="w-3.5 h-3.5 text-coral" />
          <span>Chapter III &middot; Discovery Room</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-display font-bold text-deep-ink tracking-tight">
          Uncover Your Birthday Surprises!
        </h1>
      </header>

      {/* Center Scratch Keepsake & Pip */}
      <main className="relative z-10 flex flex-col items-center my-auto w-full max-w-xl space-y-4">
        {/* Pip's Dialogue */}
        <SpeechBubble tailPosition="bottom-right" className="mb-1">
          <p className="font-display font-bold text-sm sm:text-base text-deep-ink">
            {scratchCompleted
              ? "Official sister greatness confirmed! Check out your family awards below!"
              : BIRTHDAY_DATA.scratchHint}
          </p>
        </SpeechBubble>

        {/* Scratch Card */}
        <div className="w-full">
          <ScratchCard onCompleted={completeScratch} isCompleted={scratchCompleted}>
            {/* Revealed Card Content */}
            <div className="w-full h-full flex flex-col justify-between items-center text-center p-4 sm:p-6 bg-gradient-to-b from-[#FEFCE8] to-[#FFFDF8] rounded-2xl border-2 border-deep-ink">
              <div className="inline-block px-3 py-1 rounded-full bg-coral text-white text-[10px] sm:text-xs font-display font-bold uppercase tracking-wider">
                👑 Top Secret Proclamation
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-bold text-deep-ink">
                To {BIRTHDAY_DATA.sisterName}
              </h2>

              <p className="font-sans font-medium text-xs sm:text-sm text-deep-ink/90 leading-relaxed max-w-sm px-2">
                &ldquo;{BIRTHDAY_DATA.scratchSecretMessage}&rdquo;
              </p>

              <div className="text-[11px] font-sans font-semibold text-deep-ink/60 uppercase tracking-wider">
                Certified with love &bull; From Godsfavour
              </div>
            </div>
          </ScratchCard>
        </div>

        {/* 3 Interactive Memory Keepsakes Row */}
        <div className="w-full pt-2 space-y-2">
          <div className="text-center">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-deep-ink/75">
              🎁 Tap A Keepsake To Inspect ({exploredMemoryIds.length} of {BIRTHDAY_DATA.memories.length})
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {BIRTHDAY_DATA.memories.map((mem) => {
              const isExplored = exploredMemoryIds.includes(mem.id);
              return (
                <button
                  key={mem.id}
                  onClick={() => openMemoryModal(mem)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 border-deep-ink text-xs font-display font-bold tracking-wide shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all ${
                    isExplored
                      ? 'bg-yellow/40 text-deep-ink'
                      : 'bg-white hover:bg-yellow text-deep-ink animate-bounce'
                  }`}
                >
                  {getMemoryIcon(mem.iconType)}
                  <span>{mem.title}</span>
                  {isExplored && <span className="text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer Navigation & Pip */}
      <footer className="relative z-10 flex flex-col items-center gap-3 w-full max-w-md mb-4">
        {scratchCompleted && (
          <button
            onClick={() => goToScene('scene_4_finale')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-coral via-coral to-peach text-white border-2 border-deep-ink font-display font-bold text-sm tracking-wider uppercase shadow-[4px_4px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all animate-pulse"
          >
            <span>Proceed to the Grand Finale! 🎈</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Mascot */}
        <div className="absolute right-4 bottom-2 sm:right-12 pointer-events-none">
          <PipCharacter mood={characterMood} size={90} />
        </div>
      </footer>
    </div>
  );
};
