import React from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { BIRTHDAY_DATA } from '../../config/birthdayData';

export const PersonalLetter: React.FC = () => {
  const { fireCelebration, celebrationFired, replayAdventure } = useAdventure();

  const handleCelebrate = () => {
    fireCelebration();

    // Trigger elegant starlight and champagne gold confetti
    const count = 120;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#D9B779', '#F3BD70', '#F8F0E5', '#D9A3AA', '#C29D5B'],
      disableForReducedMotion: true,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  return (
    <article className="w-full flex flex-col items-center text-center space-y-6 max-h-[70vh] sm:max-h-[60vh] overflow-y-auto px-2 sm:px-4 py-2">
      {/* Letter Header */}
      <div className="space-y-1.5">
        <span className="text-xs uppercase tracking-widest text-gold-400/80 font-medium">
          A Brother&apos;s Birthday Dedication
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-ivory tracking-wide">
          {BIRTHDAY_DATA.letter.heading}
        </h2>
        <div className="w-20 h-0.5 mx-auto bg-gradient-to-r from-transparent via-gold-400/60 to-transparent my-2" />
      </div>

      {/* Salutation */}
      <div className="text-left w-full max-w-lg">
        <p className="font-serif italic text-lg sm:text-xl text-gold-300">
          {BIRTHDAY_DATA.letter.salutation}
        </p>
      </div>

      {/* Body Paragraphs */}
      <div className="text-left w-full max-w-lg space-y-4 text-sm sm:text-base text-ivory/90 leading-relaxed font-sans font-light">
        {BIRTHDAY_DATA.letter.paragraphs.map((p, idx) => (
          <p key={idx} className="first-letter:text-xl first-letter:font-serif first-letter:text-gold-300">
            {p}
          </p>
        ))}
      </div>

      {/* Closing & Handwritten Signature */}
      <div className="text-right w-full max-w-lg pt-4 space-y-1">
        <p className="text-xs sm:text-sm font-sans tracking-wide text-ivory/70">
          {BIRTHDAY_DATA.letter.closing}
        </p>
        <p className="text-3xl sm:text-4xl font-script text-gold-300 tracking-wider pt-1">
          {BIRTHDAY_DATA.letter.signature}
        </p>
      </div>

      {/* Climax Action: Celebrate Her */}
      <div className="pt-6 pb-2 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleCelebrate}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-gold-500 via-amber-500 to-gold-400 text-plum-950 font-bold text-xs tracking-widest uppercase shadow-xl shadow-gold-500/25 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-400"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Celebrate Her ✨</span>
        </button>

        <button
          onClick={replayAdventure}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-plum-900/80 hover:bg-gold-400/20 text-gold-300 border border-gold-400/40 text-xs tracking-widest uppercase transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gold-400"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Relive This Universe</span>
        </button>
      </div>

      {celebrationFired && (
        <p className="text-xs text-gold-300/80 italic font-serif animate-fadeIn">
          ✦ Wishing you a year filled with boundless grace, triumph, and endless light ✦
        </p>
      )}
    </article>
  );
};
