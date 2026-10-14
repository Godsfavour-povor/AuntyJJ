import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, ArrowRight, X } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { useAudio } from '../../audio/useAudio';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { ScratchCard } from './ScratchCard';

interface FinalScratchModalProps {
  onClose: () => void;
}

export const FinalScratchModal: React.FC<FinalScratchModalProps> = ({ onClose }) => {
  const { scratchCompleted, completeScratch, goToScene } = useAdventure();
  const audio = useAudio();

  // Step flow: 'clouds_parting' -> 'envelope_closed' -> 'scratching' -> 'revealed'
  const [phase, setPhase] = useState<'clouds_parting' | 'envelope_closed' | 'scratching' | 'revealed'>('clouds_parting');

  // Clouds parting reveal timer (calm, slow, cinematic)
  useEffect(() => {
    audio.playFinaleFanfare();
    const timer = setTimeout(() => {
      setPhase(scratchCompleted ? 'revealed' : 'envelope_closed');
    }, 1200);
    return () => clearTimeout(timer);
  }, [audio, scratchCompleted]);

  const handleOpenEnvelope = () => {
    audio.playCollect();
    setPhase('scratching');
  };

  const handleScratchComplete = () => {
    completeScratch();
    audio.playCollect();
    setPhase('revealed');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-ink/75 backdrop-blur-md select-none overflow-hidden"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 rounded-full bg-white border-2 border-deep-ink hover:bg-coral hover:text-white transition-all shadow-[2px_2px_0px_#1E1B4B]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ================= CLOUDS PARTING CINEMATIC ================= */}
        {phase === 'clouds_parting' && (
          <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Left Cloud moving left */}
            <div className="absolute w-48 h-32 bg-white/90 rounded-full blur-[1px] border-2 border-deep-ink shadow-lg -left-10 animate-cloud-drift" />
            {/* Right Cloud moving right */}
            <div className="absolute w-48 h-32 bg-white/90 rounded-full blur-[1px] border-2 border-deep-ink shadow-lg -right-10 animate-cloud-drift delay-300" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <Crown className="w-12 h-12 text-yellow-dark animate-spin" />
              <span className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Unlocking Final Vault...
              </span>
            </div>
          </div>
        )}

        {/* ================= ENVELOPE CLOSED (Step 2) ================= */}
        {phase === 'envelope_closed' && (
          <div className="w-full aspect-[16/10] max-w-md bg-gradient-to-b from-[#FEFCE8] to-[#FFFDF8] border-4 border-deep-ink rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1E1B4B] flex flex-col items-center justify-between text-center transition-all duration-500">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-coral text-white text-xs font-display font-bold uppercase tracking-wider">
                👑 The Grand Final Surprise
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-deep-ink mt-2">
                For {BIRTHDAY_DATA.sisterName}
              </h3>
              <p className="text-xs text-deep-ink/70 font-medium">The crowning birthday keepsake</p>
            </div>

            {/* Central Golden Seal */}
            <div className="my-auto flex flex-col items-center gap-2">
              <button
                onClick={handleOpenEnvelope}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-yellow to-peach border-3 border-deep-ink shadow-[4px_4px_0px_#1E1B4B] flex items-center justify-center text-deep-ink transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Crown className="w-8 h-8" />
              </button>
              <span className="text-xs font-display font-bold uppercase tracking-wider text-deep-ink">
                Tap To Open Sealed Envelope ✨
              </span>
            </div>

            <div className="text-[11px] font-sans font-semibold text-deep-ink/60">
              Contains your top secret birthday decree
            </div>
          </div>
        )}

        {/* ================= SCRATCHING PHASE (Step 3) ================= */}
        {phase === 'scratching' && (
          <div className="w-full max-w-md bg-cream border-4 border-deep-ink rounded-3xl p-5 sm:p-7 shadow-[8px_8px_0px_#1E1B4B] flex flex-col items-center transition-all duration-500">
            <div className="text-center mb-3">
              <span className="inline-block px-3 py-1 rounded-full bg-coral text-white text-[11px] font-display font-bold uppercase tracking-wider">
                👑 Rub Foil To Reveal Secret Message!
              </span>
              <h3 className="text-lg sm:text-xl font-display font-bold text-deep-ink mt-1">
                Scratch across the card with touch or mouse
              </h3>
            </div>

            {/* Real High-DPI Canvas Scratch Card */}
            <ScratchCard onCompleted={handleScratchComplete} isCompleted={scratchCompleted}>
              <div className="w-full h-full flex flex-col justify-between items-center text-center p-4 bg-gradient-to-b from-[#FEFCE8] to-[#FFFDF8] rounded-2xl border-2 border-deep-ink">
                <span className="text-xs font-display font-bold uppercase text-coral">
                  👑 Official Birthday Decree
                </span>
                <p className="font-sans font-medium text-xs sm:text-sm text-deep-ink leading-relaxed px-1">
                  &ldquo;{BIRTHDAY_DATA.scratchSecretMessage}&rdquo;
                </p>
                <div className="text-[10px] font-sans font-semibold text-deep-ink/60 uppercase tracking-wider">
                  With all my love &bull; Godsfavour
                </div>
              </div>
            </ScratchCard>
          </div>
        )}

        {/* ================= REVEALED CARD (Step 4: Full Letter) ================= */}
        {phase === 'revealed' && (
          <div className="w-full max-w-md bg-white border-4 border-deep-ink rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1E1B4B] flex flex-col text-center space-y-3 transition-all duration-500">
            <div className="flex justify-center">
              <span className="inline-block px-3.5 py-1 rounded-full bg-yellow border border-deep-ink text-xs font-display font-bold uppercase tracking-wider text-deep-ink">
                🌟 Decree Unsealed!
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-bold text-deep-ink">
              To {BIRTHDAY_DATA.sisterName}
            </h2>

            <div className="w-16 h-1 bg-deep-ink rounded-full mx-auto my-1" />

            <p className="text-sm sm:text-base text-deep-ink/90 font-sans leading-relaxed text-left max-w-md mx-auto pt-2">
              &ldquo;{BIRTHDAY_DATA.scratchSecretMessage}&rdquo;
            </p>

            <p className="text-xs font-sans font-medium text-coral italic pt-1">
              &ldquo;May your new year be as radiant, joyful, and deeply blessed as you are!&rdquo;
            </p>

            {/* Climax Button: Proceed to Finale */}
            <div className="pt-3">
              <button
                onClick={() => goToScene('scene_4_finale')}
                className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto px-6 py-3 rounded-full bg-gradient-to-r from-coral to-peach text-white border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Proceed to Grand Finale! 🎈</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
