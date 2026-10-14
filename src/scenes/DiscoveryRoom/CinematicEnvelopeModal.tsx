import React, { useState } from 'react';
import { Mail, Sparkles, X, Check } from 'lucide-react';
import { useAudio } from '../../audio/useAudio';

export interface EnvelopeData {
  id: string;
  roomName: string;
  title: string;
  badge: string;
  subtitle: string;
  message: string;
  pipRemark: string;
  accentColor: string;
}

interface CinematicEnvelopeModalProps {
  envelope: EnvelopeData;
  onClose: () => void;
}

export const CinematicEnvelopeModal: React.FC<CinematicEnvelopeModalProps> = ({
  envelope,
  onClose,
}) => {
  const audio = useAudio();

  // Slow, deliberate multi-stage opening: 'sealed' -> 'flap_open' -> 'letter_unfolded'
  const [openingStage, setOpeningStage] = useState<'sealed' | 'flap_open' | 'letter_unfolded'>('sealed');

  // Stage 1 -> 2: Break seal and open flap
  const handleOpenFlap = () => {
    audio.playPop();
    setOpeningStage('flap_open');
  };

  // Stage 2 -> 3: Pull out and unfold the letter
  const handleUnfoldLetter = () => {
    audio.playCollect();
    setOpeningStage('letter_unfolded');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-ink/70 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button on top-right */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 rounded-full bg-white border-2 border-deep-ink hover:bg-coral hover:text-white transition-all shadow-[2px_2px_0px_#1E1B4B]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ================= STAGE 1: SEALED ENVELOPE ================= */}
        {openingStage === 'sealed' && (
          <div className="w-full aspect-[16/10] max-w-md bg-cream border-4 border-deep-ink rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1E1B4B] flex flex-col items-center justify-between text-center transition-all duration-500">
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-deep-ink border border-deep-ink text-xs font-display font-bold uppercase tracking-wider"
                style={{ backgroundColor: envelope.accentColor }}
              >
                {envelope.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-deep-ink mt-2">
                {envelope.title}
              </h3>
              <p className="text-xs text-deep-ink/70 font-medium">Found in {envelope.roomName}</p>
            </div>

            {/* Central Wax Seal Button */}
            <div className="my-auto flex flex-col items-center gap-2">
              <button
                onClick={handleOpenFlap}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-coral hover:bg-coral-dark border-3 border-deep-ink shadow-[4px_4px_0px_#1E1B4B] flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Mail className="w-8 h-8" />
              </button>
              <span className="text-xs font-display font-bold uppercase tracking-wider text-deep-ink">
                Tap Seal To Open 🎀
              </span>
            </div>

            <div className="text-[11px] font-sans font-semibold text-deep-ink/60">
              A private letter written by Godsfavour
            </div>
          </div>
        )}

        {/* ================= STAGE 2: FLAP OPENED, LETTER SLIDING OUT ================= */}
        {openingStage === 'flap_open' && (
          <div className="w-full aspect-[16/10] max-w-md bg-cream border-4 border-deep-ink rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1E1B4B] flex flex-col items-center justify-between text-center transition-all duration-500">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-turquoise text-deep-ink border border-deep-ink text-xs font-display font-bold uppercase tracking-wider">
                Seal Broken! ✨
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-deep-ink mt-2">
                {envelope.title}
              </h3>
            </div>

            {/* Folded Sheet sliding halfway out */}
            <div className="w-3/4 h-24 bg-white border-2 border-deep-ink rounded-xl shadow-md p-3 flex flex-col items-center justify-center my-auto transition-transform">
              <div className="w-full h-1 bg-coral/40 rounded-full mb-1" />
              <div className="w-3/4 h-1 bg-deep-ink/20 rounded-full mb-1" />
              <div className="w-1/2 h-1 bg-deep-ink/20 rounded-full" />
              <span className="text-[11px] font-sans font-bold text-coral mt-2 uppercase tracking-wider">
                Folded Parchment Inside
              </span>
            </div>

            <button
              onClick={handleUnfoldLetter}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-yellow hover:bg-yellow-dark text-deep-ink border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Unfold Letter 📜</span>
            </button>
          </div>
        )}

        {/* ================= STAGE 3: FULLY UNFOLDED LETTER ================= */}
        {openingStage === 'letter_unfolded' && (
          <div className="w-full max-w-lg bg-white border-4 border-deep-ink rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1E1B4B] flex flex-col text-center space-y-3 transition-all duration-500 max-h-[80vh] overflow-y-auto">
            {/* Header Badge */}
            <div className="flex justify-center">
              <span
                className="inline-block px-3.5 py-1 rounded-full text-deep-ink border border-deep-ink text-xs font-display font-bold uppercase tracking-wider"
                style={{ backgroundColor: envelope.accentColor }}
              >
                {envelope.badge}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-bold text-deep-ink">
              {envelope.title}
            </h2>

            <p className="text-xs uppercase font-sans font-semibold tracking-wider text-coral">
              {envelope.subtitle}
            </p>

            <div className="w-16 h-1 bg-deep-ink rounded-full mx-auto my-1" />

            {/* Letter Body */}
            <p className="text-sm sm:text-base text-deep-ink/90 font-sans leading-relaxed text-left max-w-md mx-auto pt-2">
              {envelope.message}
            </p>

            {/* Pip's Commentary */}
            <div className="mt-3 p-3 rounded-2xl bg-cream border-2 border-deep-ink text-xs sm:text-sm font-sans font-medium text-deep-ink shadow-[2px_2px_0px_#1E1B4B] flex items-center gap-2 text-left">
              <span className="text-xl">💬</span>
              <span className="italic">
                <strong>Pip says:</strong> &ldquo;{envelope.pipRemark}&rdquo;
              </span>
            </div>

            {/* Close / Return to Game CTA */}
            <div className="pt-3">
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto px-6 py-2.5 rounded-full bg-turquoise hover:bg-turquoise-dark text-deep-ink border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Keep Exploring Apartment ➔</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
