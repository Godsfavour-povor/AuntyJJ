import React, { useState } from 'react';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { ScratchCanvas } from './ScratchCanvas';

export const Scene2Scratch: React.FC = () => {
  const { scratchCompleted, completeScratch, goToScene } = useAdventure();
  const [easterEggFound, setEasterEggFound] = useState(false);

  const handleEasterEgg = () => {
    setEasterEggFound(true);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden bg-radial from-plum-900 via-plum-950 to-black select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[32rem] h-[32rem] rounded-full bg-gold-400/5 blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 text-center max-w-lg mt-6 sm:mt-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum-900/60 border border-gold-400/20 text-xs tracking-widest uppercase text-gold-400/90 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>Chapter II &middot; The Hidden Message</span>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-ivory/90 font-normal leading-relaxed tracking-wide px-4">
          {scratchCompleted
            ? "Uncovered for you, from the heart."
            : BIRTHDAY_DATA.scratchHint}
        </h1>
      </header>

      {/* Center Scratch Keepsake */}
      <main className="relative z-10 w-full my-auto py-4">
        <ScratchCanvas
          onCompleted={completeScratch}
          isCompleted={scratchCompleted}
        >
          {/* Revealed Secret Card Content */}
          <div className="relative w-full h-full flex flex-col justify-between items-center text-center p-6 bg-gradient-to-b from-plum-800 to-plum-950 text-ivory rounded-2xl border border-gold-400/30">
            {/* Corner Filigrees */}
            <div className="absolute top-2 left-2 text-gold-400/40 text-xs">✦</div>
            <div className="absolute top-2 right-2 text-gold-400/40 text-xs">✦</div>
            <div className="absolute bottom-2 left-2 text-gold-400/40 text-xs">✦</div>

            {/* Secret Easter Egg Star in bottom-right */}
            <button
              onClick={handleEasterEgg}
              className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                easterEggFound ? 'text-amber-300 scale-125 animate-spin' : 'text-gold-400/40 hover:text-gold-300'
              }`}
              title="A secret little constellation star"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>

            {/* Card Header */}
            <div className="pt-2">
              <span className="text-[11px] tracking-widest uppercase text-gold-400/80 font-medium">
                {easterEggFound ? "✦ Celestial Blessing Unlocked ✦" : "Personal Keepsake"}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-semibold text-ivory tracking-wide mt-1">
                For {BIRTHDAY_DATA.sisterName}
              </h2>
            </div>

            {/* Hidden Message Body */}
            <p className="font-serif italic text-base sm:text-lg text-gold-300/95 leading-relaxed px-2 py-3 max-w-sm">
              &ldquo;{BIRTHDAY_DATA.hiddenMessage}&rdquo;
            </p>

            {/* Card Footer */}
            <div className="pb-1 text-xs text-ivory/60 font-sans tracking-wider">
              <span>With admiration & love</span>
            </div>
          </div>
        </ScratchCanvas>
      </main>

      {/* Bottom Transition Control */}
      <footer className="relative z-10 flex flex-col items-center justify-center w-full max-w-md mb-6">
        {scratchCompleted ? (
          <div className="flex flex-col items-center gap-3 animate-fadeIn">
            <p className="text-xs text-gold-400/80 tracking-widest uppercase">
              There is more waiting for you
            </p>
            <button
              onClick={() => goToScene('scene_3_memories')}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-gold-500 to-amber-500 text-plum-950 font-semibold text-xs tracking-widest uppercase shadow-lg shadow-gold-500/20 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-400"
            >
              <span>Step into the Memory Universe</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-ivory/40 tracking-wider text-center">
            (Use your touch or mouse to brush away the golden veil)
          </p>
        )}
      </footer>
    </div>
  );
};
