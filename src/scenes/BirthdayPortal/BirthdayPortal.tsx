import React, { useState } from 'react';
import { useAdventure } from '../../context/AdventureContext';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { PipCharacter } from '../../components/Character/PipCharacter';
import { SpeechBubble } from '../../components/SpeechBubble/SpeechBubble';
import { PortalButton } from './PortalButton';

export const BirthdayPortal: React.FC = () => {
  const { goToScene, characterMood, setCharacterMood } = useAdventure();
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    setCharacterMood('celebrating');
    setTimeout(() => {
      goToScene('scene_2_party');
    }, 700);
  };

  return (
    <div className="relative h-screen max-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden bg-gradient-to-b from-[#BAE6FD] via-[#E0F2FE] to-[#FFFDF8] select-none">
      {/* Festive Bunting Garland across Top */}
      <div className="absolute top-0 inset-x-0 flex justify-between pointer-events-none px-2 z-10 overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] transform transition-transform"
            style={{
              borderTopColor: ['#FB7185', '#38BDF8', '#2DD4BF', '#FDE047', '#C084FC'][i % 5],
              transform: `translateY(${Math.sin(i * 0.5) * 4}px)`,
            }}
          />
        ))}
      </div>

      {/* Animated Clouds & Gentle Sunlight */}
      <div className="absolute top-10 left-4 sm:left-12 w-44 h-16 bg-white/90 rounded-full blur-[1px] animate-cloud-drift pointer-events-none shadow-sm" />
      <div className="absolute top-16 right-6 sm:right-16 w-52 h-18 bg-white/90 rounded-full blur-[1px] animate-cloud-drift delay-1000 pointer-events-none shadow-sm" />

      {/* Floating Helium Balloons */}
      <div className="absolute top-20 left-4 sm:left-20 animate-balloon-float pointer-events-none hidden xs:block">
        <div className="w-12 h-16 sm:w-14 sm:h-18 rounded-full bg-coral border-2 border-deep-ink shadow-md" />
        <div className="w-0.5 h-16 bg-deep-ink/30 mx-auto" />
      </div>

      <div className="absolute top-24 right-4 sm:right-24 animate-balloon-float delay-700 pointer-events-none hidden xs:block">
        <div className="w-12 h-16 sm:w-14 sm:h-18 rounded-full bg-turquoise border-2 border-deep-ink shadow-md" />
        <div className="w-0.5 h-16 bg-deep-ink/30 mx-auto" />
      </div>

      {/* Floating Sparkle Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${(i % 3) * 3 + 4}px`,
              height: `${(i % 3) * 3 + 4}px`,
              backgroundColor: ['#FB7185', '#38BDF8', '#2DD4BF', '#FDE047', '#C084FC'][i % 5],
              top: `${(i * 19) % 95}%`,
              left: `${(i * 23) % 95}%`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Top Title Card (Compact, no empty gap) */}
      <header className="relative z-10 text-center max-w-lg mt-8 sm:mt-10 space-y-1">
        <div className="inline-block px-3.5 py-1 rounded-full bg-white/95 border-2 border-deep-ink text-[11px] sm:text-xs font-display font-bold uppercase tracking-widest text-deep-ink shadow-[2px_2px_0px_#1E1B4B]">
          🎈 Welcome to the Birthday Adventure!
        </div>

        <h1 className="text-2xl sm:text-4xl font-display font-bold text-deep-ink tracking-tight drop-shadow-sm">
          A Celebration Made Just For You
        </h1>
      </header>

      {/* Center Character & Tactile Button */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-md space-y-3">
        {/* Pip's Comic Speech Bubble */}
        <SpeechBubble tailPosition="bottom-left">
          <p className="font-display font-bold text-deep-ink text-sm sm:text-base">
            {BIRTHDAY_DATA.portalGreeting}
          </p>
          <p className="font-sans text-xs sm:text-sm text-deep-ink/75 mt-0.5 font-medium">
            {BIRTHDAY_DATA.portalPrompt}
          </p>
        </SpeechBubble>

        {/* Pip The Mascot */}
        <div className="pt-1">
          <PipCharacter mood={characterMood} size={120} />
        </div>

        {/* Squishy Portal Button */}
        <div className={`pt-2 transition-transform duration-500 ${isOpening ? 'scale-110' : ''}`}>
          <PortalButton onClick={handleOpen} disabled={isOpening} />
        </div>
      </main>

      {/* Footer Hint */}
      <footer className="relative z-10 text-center mb-2">
        <p className="text-[11px] sm:text-xs font-sans font-semibold text-deep-ink/50 tracking-wider">
          (Tap the button to unlock your birthday world)
        </p>
      </footer>
    </div>
  );
};
