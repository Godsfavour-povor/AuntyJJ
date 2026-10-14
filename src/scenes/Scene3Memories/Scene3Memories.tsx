import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { Constellation } from './Constellation';

export const Scene3Memories: React.FC = () => {
  const { exploredMemoryIds, goToScene } = useAdventure();
  const totalMemories = BIRTHDAY_DATA.memories.length;
  const exploredCount = exploredMemoryIds.length;
  const allExplored = exploredCount >= totalMemories;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden bg-radial from-plum-900 via-plum-950 to-black select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[36rem] h-[36rem] rounded-full bg-gold-400/5 blur-3xl animate-ambient-glow" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 text-center max-w-xl mt-6 sm:mt-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum-900/60 border border-gold-400/20 text-xs tracking-widest uppercase text-gold-400/90 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>Chapter III &middot; The Memory Universe</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif text-ivory/95 font-normal tracking-wide px-4">
          A Constellation of Cherished Moments
        </h1>

        <p className="text-xs sm:text-sm text-ivory/70 max-w-md mx-auto font-sans font-light">
          {BIRTHDAY_DATA.memoriesPrompt}
        </p>
      </header>

      {/* Center 3D Constellation Field */}
      <main className="relative z-10 w-full my-auto flex items-center justify-center">
        <Constellation />
      </main>

      {/* Bottom Progress Tracker & Navigation */}
      <footer className="relative z-10 flex flex-col items-center gap-3 w-full max-w-md mb-6">
        {/* Progress Dots */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-plum-900/70 border border-gold-400/20 text-xs text-ivory/80">
          <div className="flex items-center gap-1.5">
            {BIRTHDAY_DATA.memories.map((mem) => {
              const isDone = exploredMemoryIds.includes(mem.id);
              return (
                <span
                  key={mem.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isDone ? 'bg-gold-400 scale-110 shadow-sm shadow-gold-400' : 'bg-ivory/30'
                  }`}
                />
              );
            })}
          </div>
          <span className="text-[11px] uppercase tracking-wider text-gold-300 font-medium ml-1">
            {exploredCount} of {totalMemories} explored
          </span>
        </div>

        {/* Transition Button to Scene 4 */}
        <button
          onClick={() => goToScene('scene_4_finale')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-xs tracking-widest uppercase font-semibold transition-all duration-300 shadow-xl focus:outline-none focus:ring-2 focus:ring-gold-400 ${
            allExplored
              ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-plum-950 shadow-gold-500/25 hover:scale-105 active:scale-95 animate-pulse'
              : 'bg-plum-900/80 hover:bg-gold-400/20 text-gold-300 border border-gold-400/40 hover:scale-105'
          }`}
        >
          <span>{allExplored ? "Journey to the Birthday Finale" : "Proceed to Finale"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
