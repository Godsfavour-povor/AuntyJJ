import React from 'react';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { Sparkles } from 'lucide-react';

interface LetterEnvelopeProps {
  onOpen: () => void;
  isOpen: boolean;
  children: React.ReactNode;
}

export const LetterEnvelope: React.FC<LetterEnvelopeProps> = ({
  onOpen,
  isOpen,
  children,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* 3D Envelope Container */}
      <div className="relative w-full transition-all duration-700">
        {!isOpen ? (
          /* Sealed Envelope View */
          <div
            onClick={onOpen}
            className="group relative w-full aspect-[16/10] sm:aspect-[16/9] max-w-md mx-auto rounded-3xl bg-gradient-to-b from-plum-800 to-plum-900 border-2 border-gold-400/50 shadow-2xl shadow-black/80 p-6 flex flex-col items-center justify-between cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen();
              }
            }}
            aria-label="Sealed birthday letter: click to break wax seal and read"
          >
            {/* Top decorative envelope triangular flap effect */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-plum-700/30 rounded-t-3xl border-b border-gold-400/20 [clip-path:polygon(0_0,100%_0,50%_100%)] pointer-events-none" />

            {/* Recipient Caligraphy on Envelope Face */}
            <div className="relative z-10 pt-4 text-center">
              <span className="text-[11px] uppercase tracking-widest text-gold-400/80 font-medium">
                Privately Written For
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-ivory tracking-wide mt-1">
                {BIRTHDAY_DATA.sisterName}
              </h3>
            </div>

            {/* Glowing Golden Wax Seal (Touch Target) */}
            <div className="relative z-20 my-auto flex flex-col items-center">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gold-400 via-amber-500 to-gold-600 p-0.5 shadow-xl shadow-gold-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center border border-gold-300/40">
                  <Sparkles className="w-7 h-7 text-gold-300 animate-pulse" />
                </div>
                {/* Pulsing ring */}
                <div className="absolute inset-0 rounded-full border border-gold-300 animate-ping opacity-35" />
              </div>
              <span className="mt-2 text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-gold-300/90">
                Tap to Break Seal
              </span>
            </div>

            {/* Envelope Base Details */}
            <div className="relative z-10 pb-1 text-center text-xs text-ivory/50 font-sans tracking-widest">
              From {BIRTHDAY_DATA.brotherName} &bull; With All My Heart
            </div>
          </div>
        ) : (
          /* Unfolded Letter Paper Sheet */
          <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#24172a] via-[#1c1122] to-[#170e1c] border-2 border-gold-400/40 p-6 sm:p-10 shadow-2xl shadow-black/90 animate-fadeIn transition-all duration-500">
            {/* Elegant corner ornaments */}
            <div className="absolute top-3 left-3 text-gold-400/40 text-sm">✦</div>
            <div className="absolute top-3 right-3 text-gold-400/40 text-sm">✦</div>
            <div className="absolute bottom-3 left-3 text-gold-400/40 text-sm">✦</div>
            <div className="absolute bottom-3 right-3 text-gold-400/40 text-sm">✦</div>

            {children}
          </div>
        )}
      </div>
    </div>
  );
};
