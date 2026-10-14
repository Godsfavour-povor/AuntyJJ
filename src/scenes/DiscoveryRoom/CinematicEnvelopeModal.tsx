import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
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

type CinematicStage =
  | 'rising'             // Envelope rises up from the table into center view
  | 'opening_flap'       // Top flap unseals and flips open in 3D
  | 'sliding_out'        // Folded letter slides upward out of the envelope
  | 'dropping_envelope'  // Envelope falls downward beneath the screen
  | 'unfolding_tri'      // 3-part letter unfolds (top folds up, bottom folds down)
  | 'revealed';          // Authentic cursive handwriting letter is fully legible

export const CinematicEnvelopeModal: React.FC<CinematicEnvelopeModalProps> = ({
  envelope,
  onClose,
}) => {
  const audio = useAudio();
  const [stage, setStage] = useState<CinematicStage>('rising');

  // Completely automated, button-free cinematic game choreography
  useEffect(() => {
    // 1. Rise from table (1.0s)
    const t1 = setTimeout(() => {
      setStage('opening_flap');
      audio.playPop();
    }, 1100);

    // 2. Open Flap (0.85s)
    const t2 = setTimeout(() => {
      setStage('sliding_out');
      audio.playFootstep();
    }, 2000);

    // 3. Letter slides out (0.85s)
    const t3 = setTimeout(() => {
      setStage('dropping_envelope');
    }, 2850);

    // 4. Envelope drops beneath screen (0.7s)
    const t4 = setTimeout(() => {
      setStage('unfolding_tri');
      audio.playCollect();
    }, 3550);

    // 5. Unfold 3 parts (0.9s) -> fully revealed
    const t5 = setTimeout(() => {
      setStage('revealed');
      audio.playScratchChime();
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [audio]);

  const handleSkip = () => {
    setStage('revealed');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-ink/75 backdrop-blur-md select-none overflow-hidden"
      onClick={stage === 'revealed' ? onClose : undefined}
    >
      {/* Top Header Bar: Room badge & Skip/Close */}
      <div className="absolute top-4 inset-x-0 max-w-lg mx-auto flex items-center justify-between px-6 z-50 pointer-events-auto">
        <span
          className="px-3.5 py-1 rounded-full text-deep-ink border-2 border-deep-ink text-xs font-display font-bold uppercase tracking-wider shadow-sm"
          style={{ backgroundColor: envelope.accentColor }}
        >
          {envelope.badge}
        </span>

        <div className="flex items-center gap-2">
          {stage !== 'revealed' && (
            <button
              onClick={handleSkip}
              className="text-xs font-display font-semibold text-white/80 hover:text-white uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
            >
              Skip ➔
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white border-2 border-deep-ink hover:bg-coral hover:text-white transition-all shadow-[2px_2px_0px_#1E1B4B]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="relative w-full max-w-lg flex flex-col items-center justify-center perspective-[1200px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= PHASES 1 to 3: PHYSICAL 3D ENVELOPE ================= */}
        {(stage === 'rising' || stage === 'opening_flap' || stage === 'sliding_out' || stage === 'dropping_envelope') && (
          <div
            className={`relative w-[340px] sm:w-[420px] aspect-[16/11] transition-all duration-700 ${
              stage === 'rising'
                ? 'translate-y-24 scale-90 opacity-90'
                : stage === 'dropping_envelope'
                ? 'translate-y-[120vh] rotate-6 opacity-0 transition-transform duration-900 ease-in'
                : 'translate-y-0 scale-100 opacity-100'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* The Physical Paper Envelope Shell */}
            <div className="relative w-full h-full bg-[#FFFDF8] border-3 border-deep-ink rounded-2xl shadow-[8px_12px_0px_rgba(30,27,75,0.4)] overflow-visible">
              {/* Envelope Body Shading & Paper Seams */}
              <svg viewBox="0 0 420 290" className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Back interior pocket shadow */}
                <rect x="0" y="0" width="420" height="290" rx="16" fill="#F5EFE6" />

                {/* Left Triangular Paper Fold */}
                <polygon points="0,0 180,165 0,290" fill="#FFFDF8" stroke="#1E1B4B" strokeWidth="2.5" />
                {/* Right Triangular Paper Fold */}
                <polygon points="420,0 240,165 420,290" fill="#FAF5ED" stroke="#1E1B4B" strokeWidth="2.5" />
                {/* Bottom Triangular Fold */}
                <polygon points="0,290 210,140 420,290" fill="#F7F1E5" stroke="#1E1B4B" strokeWidth="2.5" />
              </svg>

              {/* FOLDED LETTER SLIDING OUT FROM INSIDE POCKET */}
              <div
                className={`absolute inset-x-8 top-4 h-[250px] bg-[#FFFBF0] border-2 border-deep-ink rounded-xl shadow-lg p-5 flex flex-col justify-between transition-all duration-700 ease-out z-10 ${
                  stage === 'sliding_out' || stage === 'dropping_envelope'
                    ? '-translate-y-36 scale-105 shadow-2xl'
                    : 'translate-y-2 scale-95 opacity-80'
                }`}
              >
                {/* Visual Creases indicating 3-part tri-fold */}
                <div className="w-full border-b-2 border-dashed border-deep-ink/20 pb-2 flex justify-between items-center text-[10px] font-sans font-bold text-coral">
                  <span>SECRET SISTER KEEPSAKE</span>
                  <span>FOLD 1/3</span>
                </div>
                <div className="w-full border-b-2 border-dashed border-deep-ink/20 py-2 flex justify-between items-center text-[10px] font-sans font-bold text-turquoise-dark">
                  <span>PARCHMENT LETTER</span>
                  <span>FOLD 2/3</span>
                </div>
                <div className="pt-2 flex justify-between items-center text-[10px] font-sans font-bold text-deep-ink/40">
                  <span>AUTHENTIC INK</span>
                  <span>FOLD 3/3</span>
                </div>
              </div>

              {/* 3D ROTATING ENVELOPE TOP LID / FLAP */}
              <div
                className="absolute inset-x-0 top-0 h-[145px] transition-transform duration-700 ease-out origin-top z-20"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: stage === 'rising' ? 'rotateX(0deg)' : 'rotateX(180deg)',
                }}
              >
                <svg viewBox="0 0 420 145" className="w-full h-full drop-shadow-md overflow-visible">
                  {/* Flap Triangle */}
                  <polygon
                    points="0,0 210,142 420,0"
                    fill="#FFFDF8"
                    stroke="#1E1B4B"
                    strokeWidth="2.8"
                  />
                  {/* Wax Seal Stamp (Centered on the tip) */}
                  <g transform="translate(210, 125)">
                    <circle cx="0" cy="0" r="22" fill="#E11D48" stroke="#1E1B4B" strokeWidth="2.5" />
                    <circle cx="0" cy="0" r="16" fill="#F43F5E" />
                    <text x="0" y="6" fontSize="16" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">
                      💌
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ================= PHASES 4 & 5: TRI-FOLD LETTER UNFOLDING ================= */}
        {stage === 'unfolding_tri' && (
          <div className="relative w-full max-w-md flex flex-col items-center perspective-[1200px] animate-fade-in">
            {/* Top Flap unfolding upward */}
            <div
              className="w-full h-24 bg-[#FFFDF8] border-3 border-deep-ink rounded-t-2xl p-4 shadow-md origin-bottom transition-all duration-700"
              style={{
                transform: 'rotateX(0deg)',
                animation: 'unfoldTop 0.8s ease-out forwards',
              }}
            >
              <div className="w-full h-1 bg-deep-ink/20 rounded-full mb-2" />
              <div className="w-3/4 h-1 bg-deep-ink/15 rounded-full" />
            </div>

            {/* Middle Section (Base) */}
            <div className="w-full h-28 bg-[#FFFDF8] border-x-3 border-deep-ink p-4 shadow-inner flex flex-col justify-center">
              <span className="font-display font-bold text-center text-sm text-coral">
                Unfolding your personal letter... 📜
              </span>
            </div>

            {/* Bottom Flap unfolding downward */}
            <div
              className="w-full h-24 bg-[#FFFDF8] border-3 border-deep-ink rounded-b-2xl p-4 shadow-md origin-top transition-all duration-700"
              style={{
                transform: 'rotateX(0deg)',
                animation: 'unfoldBottom 0.8s ease-out forwards',
              }}
            >
              <div className="w-5/6 h-1 bg-deep-ink/20 rounded-full mb-2 ml-auto" />
              <div className="w-1/2 h-1 bg-deep-ink/15 rounded-full ml-auto" />
            </div>
          </div>
        )}

        {/* ================= FINAL PHASE: FULLY UNFOLDED HANDWRITTEN LETTER ================= */}
        {stage === 'revealed' && (
          <div className="w-full max-w-lg bg-[#FFFDF8] border-4 border-deep-ink rounded-3xl p-6 sm:p-8 shadow-[10px_10px_0px_#1E1B4B] flex flex-col text-left space-y-4 animate-fade-in max-h-[85vh] overflow-y-auto">
            {/* Parchment Letterhead */}
            <div className="flex items-center justify-between border-b-2 border-deep-ink/20 pb-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-deep-ink">
                  {envelope.title}
                </h3>
                <p className="text-xs font-sans font-semibold text-coral uppercase tracking-wider">
                  {envelope.subtitle}
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-coral/10 border-2 border-coral flex items-center justify-center text-lg">
                ✨
              </div>
            </div>

            {/* Authentic Cursive Handwriting Body */}
            <div className="py-2 space-y-3">
              <p className="font-handwritten text-2xl sm:text-3xl text-deep-ink/90 font-bold">
                Dearest Sister,
              </p>

              <p className="font-handwritten text-xl sm:text-2xl text-deep-ink leading-relaxed font-semibold pl-2">
                &ldquo;{envelope.message}&rdquo;
              </p>

              <div className="pt-2 text-right">
                <p className="font-handwritten text-2xl sm:text-3xl font-bold text-coral">
                  With all my love & gratitude,
                </p>
                <p className="font-handwritten text-2xl sm:text-3xl font-bold text-deep-ink">
                  Godsfavour ❤️
                </p>
              </div>
            </div>

            {/* Pip's Illustrated Commentary Box */}
            <div className="p-3.5 rounded-2xl bg-cream border-2 border-deep-ink shadow-[2px_2px_0px_#1E1B4B] flex items-center gap-3">
              <span className="text-2xl">🐥</span>
              <p className="text-xs sm:text-sm font-sans font-medium text-deep-ink">
                <strong>Pip&apos;s Note:</strong> &ldquo;{envelope.pipRemark}&rdquo;
              </p>
            </div>

            {/* Clean Action Button: Continue Exploring */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-turquoise hover:bg-turquoise-dark text-deep-ink border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
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
