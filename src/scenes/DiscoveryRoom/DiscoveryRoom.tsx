import React from 'react';
import { ApartmentGame } from './ApartmentGame';

export const DiscoveryRoom: React.FC = () => {
  return (
    <div className="relative h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden bg-gradient-to-b from-[#F0FDF4] via-[#FFFDF8] to-[#FDF4FF] select-none">
      {/* The Playable Top-Down Apartment Game in 16:10 Landscape Aspect */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full h-full max-w-5xl">
        <ApartmentGame />
      </main>
    </div>
  );
};
