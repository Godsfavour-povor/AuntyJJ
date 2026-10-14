import React from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { BIRTHDAY_DATA } from '../../config/birthdayData';

interface FoldingLetterProps {
  isOpen: boolean;
  onOpen: () => void;
}

export const FoldingLetter: React.FC<FoldingLetterProps> = ({ isOpen, onOpen }) => {
  const { fireCelebration, celebrationFired, replayAdventure } = useAdventure();

  const handleFireConfetti = () => {
    fireCelebration();

    // Vibrant colorful confetti burst
    const count = 150;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#FB7185', '#38BDF8', '#2DD4BF', '#FDE047', '#C084FC'],
      disableForReducedMotion: true,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 30, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      {!isOpen ? (
        /* Sealed Illustrated Party Envelope */
        <div
          onClick={onOpen}
          className="group relative w-full aspect-[16/10] sm:aspect-[16/9] max-w-md mx-auto rounded-3xl bg-gradient-to-b from-white via-cream to-[#FEF9C3] border-4 border-deep-ink shadow-[8px_8px_0px_#1E1B4B] p-6 flex flex-col items-center justify-between cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[5px_5px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-200"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpen();
            }
          }}
          aria-label="Sealed birthday letter: tap to unwrap ribbon and read"
        >
          {/* Envelope Header */}
          <div className="text-center pt-2">
            <span className="inline-block px-3 py-1 rounded-full bg-coral text-white text-xs font-display font-bold uppercase tracking-wider">
              Special Delivery 💌
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-deep-ink mt-2">
              For {BIRTHDAY_DATA.sisterName}
            </h3>
          </div>

          {/* Central Party Ribbon & Bow (Tap target) */}
          <div className="relative my-auto flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-turquoise border-3 border-deep-ink flex items-center justify-center shadow-[3px_3px_0px_#1E1B4B] group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-current animate-spin" />
            </div>
            <span className="mt-2 text-xs font-display font-bold uppercase tracking-wider text-deep-ink">
              Tap To Unwrap Ribbon 🎀
            </span>
          </div>

          {/* Footer note */}
          <div className="text-xs font-sans font-semibold text-deep-ink/60 tracking-wider">
            Written with love by {BIRTHDAY_DATA.brotherName}
          </div>
        </div>
      ) : (
        /* Unfolded Birthday Letter Sheet */
        <article className="relative w-full rounded-3xl bg-white border-4 border-deep-ink p-6 sm:p-10 shadow-[8px_8px_0px_#1E1B4B] animate-comic-pop text-deep-ink max-h-[70vh] overflow-y-auto">
          {/* Header */}
          <div className="text-center space-y-1 mb-6">
            <span className="inline-block px-3.5 py-1 rounded-full bg-yellow border border-deep-ink text-xs font-display font-bold uppercase tracking-wider text-deep-ink">
              A Brother&apos;s Dedication
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-deep-ink">
              {BIRTHDAY_DATA.letter.heading}
            </h2>
            <div className="w-20 h-1 bg-coral rounded-full mx-auto my-2" />
          </div>

          {/* Salutation */}
          <p className="font-display font-bold text-xl sm:text-2xl text-coral mb-4">
            {BIRTHDAY_DATA.letter.salutation}
          </p>

          {/* Body Paragraphs */}
          <div className="space-y-4 text-sm sm:text-base font-sans font-medium text-deep-ink/90 leading-relaxed text-left">
            {BIRTHDAY_DATA.letter.paragraphs.map((p, idx) => (
              <p key={idx} className="first-letter:text-2xl first-letter:font-display first-letter:font-bold first-letter:text-coral">
                {p}
              </p>
            ))}
          </div>

          {/* Closing & Handwritten Signature */}
          <div className="text-right pt-6 space-y-1">
            <p className="text-xs sm:text-sm font-sans font-semibold text-deep-ink/70">
              {BIRTHDAY_DATA.letter.closing}
            </p>
            <p className="text-3xl sm:text-5xl font-handwritten font-bold text-coral tracking-wider pt-1">
              {BIRTHDAY_DATA.letter.signature}
            </p>
          </div>

          {/* Interactive Climax Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleFireConfetti}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-coral to-peach text-white border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Launch Confetti Fireworks! 🎊</span>
            </button>

            <button
              onClick={replayAdventure}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-yellow text-deep-ink border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Adventure Again ↺</span>
            </button>
          </div>

          {celebrationFired && (
            <p className="text-center text-xs font-display font-bold text-turquoise-dark mt-4 animate-fade-in">
              🌟 Here&apos;s to your happiest, brightest, and most blessed year yet! 🌟
            </p>
          )}
        </article>
      )}
    </div>
  );
};
