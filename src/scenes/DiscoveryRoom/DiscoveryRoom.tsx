import React, { useState, useEffect } from 'react';
import { ApartmentGame } from './ApartmentGame';

export const DiscoveryRoom: React.FC = () => {
  const [isMobilePortrait, setIsMobilePortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 && window.innerHeight > window.innerWidth;
  });

  useEffect(() => {
    const checkOrientation = () => {
      const isPortrait = window.innerWidth < 768 && window.innerHeight > window.innerWidth;
      setIsMobilePortrait(isPortrait);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return (
    <div
      className={
        isMobilePortrait
          ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 w-[100dvh] h-[100dvw] flex flex-col items-center justify-center p-2 overflow-hidden bg-gradient-to-b from-[#F0FDF4] via-[#FFFDF8] to-[#FDF4FF] select-none z-30"
          : "relative h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex flex-col items-center justify-center p-2 sm:p-5 overflow-hidden bg-gradient-to-b from-[#F0FDF4] via-[#FFFDF8] to-[#FDF4FF] select-none"
      }
    >
      {/* The Playable Top-Down Apartment Game in Landscape */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full h-full max-w-5xl">
        <ApartmentGame isRotated={isMobilePortrait} />
      </main>
    </div>
  );
};
