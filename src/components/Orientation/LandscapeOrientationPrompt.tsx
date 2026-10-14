import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw } from 'lucide-react';

export const LandscapeOrientationPrompt: React.FC = () => {
  const [isPortraitMobile, setIsPortraitMobile] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if screen is mobile-sized (<= 920px) AND in portrait orientation
      const isMobileSize = window.innerWidth <= 920;
      const isPortrait =
        window.innerHeight > window.innerWidth ||
        (window.screen.orientation && window.screen.orientation.type.includes('portrait')) ||
        window.matchMedia('(orientation: portrait)').matches;

      setIsPortraitMobile(isMobileSize && isPortrait);
    };

    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // When orientation changes to landscape, reset dismissed state for next time
  useEffect(() => {
    if (!isPortraitMobile) {
      setDismissed(false);
    }
  }, [isPortraitMobile]);

  if (!isPortraitMobile || dismissed) {
    return null;
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-deep-ink/90 backdrop-blur-md text-white select-none animate-fade-in"
    >
      <div className="relative max-w-sm w-full bg-[#FFFDF8] text-deep-ink border-4 border-deep-ink rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1E1B4B] flex flex-col items-center text-center space-y-5">
        {/* Animated Phone Rotation Graphic */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Rotating halo ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-turquoise animate-spin [animation-duration:8s]" />

          {/* Central phone tilting animation */}
          <div className="relative z-10 flex items-center justify-center text-coral animate-[wiggle_2s_ease-in-out_infinite]">
            <Smartphone className="w-16 h-16 drop-shadow-md transform -rotate-12 transition-transform" />
            <RotateCw className="absolute -top-1 -right-1 w-6 h-6 text-turquoise animate-spin [animation-duration:3s]" />
          </div>
        </div>

        {/* Title & Instructions */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-yellow text-deep-ink font-display font-bold text-[11px] uppercase tracking-wider border border-deep-ink shadow-sm">
            Optimal Game Mode 🎮
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-deep-ink leading-tight">
            Please Hold Your Phone Sideways!
          </h2>
          <p className="text-xs sm:text-sm font-sans font-medium text-deep-ink/75 leading-relaxed">
            Turn your phone to <strong>Landscape mode</strong> for the best widescreen view of the Birthday Apartment and full game controls! 🔄
          </p>
        </div>

        {/* Action / Dismiss Buttons */}
        <div className="flex flex-col items-center gap-2 w-full pt-1">
          <div className="flex items-center gap-2 text-xs font-display font-bold text-coral animate-pulse">
            <span>Rotate Device Now</span>
            <span>📱➔🔄</span>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="mt-2 text-[11px] font-sans font-semibold text-deep-ink/50 hover:text-deep-ink underline transition-colors"
          >
            Continue in Portrait anyway
          </button>
        </div>
      </div>
    </div>
  );
};
