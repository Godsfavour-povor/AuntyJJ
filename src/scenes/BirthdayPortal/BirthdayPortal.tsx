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
    setIsOpening(true);
    setCharacterMood('celebrating');
    setTimeout(() => {
      goToScene('scene_2_party');
    }, 850);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden bg-gradient-to-b from-[#BAE6FD] via-[#E0F2FE] to-[#FFFDF8] select-none">
      {/* Decorative Puffy Clouds */}
      <div className="absolute top-12 left-6 w-36 h-14 bg-white/85 rounded-full blur-[1px] animate-cloud-drift pointer-events-none" />
      <div className="absolute top-20 right-10 w-48 h-18 bg-white/85 rounded-full blur-[1px] animate-cloud-drift delay-1000 pointer-events-none" />

      {/* Floating Pastel Balloons */}
      <div className="absolute top-24 left-8 sm:left-24 animate-balloon-float pointer-events-none">
        <div className="w-14 h-18 rounded-full bg-coral border-2 border-deep-ink shadow-md" />
        <div className="w-0.5 h-16 bg-deep-ink/40 mx-auto" />
      </div>

      <div className="absolute top-28 right-8 sm:right-28 animate-balloon-float delay-700 pointer-events-none">
        <div className="w-14 h-18 rounded-full bg-turquoise border-2 border-deep-ink shadow-md" />
        <div className="w-0.5 h-16 bg-deep-ink/40 mx-auto" />
      </div>

      {/* Top Title Card */}
      <header className="relative z-10 text-center max-w-lg mt-10 sm:mt-14 space-y-2">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white border-2 border-deep-ink text-xs font-display font-bold uppercase tracking-widest text-deep-ink shadow-[2px_2px_0px_#1E1B4B]">
          🎈 Welcome to the Adventure!
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-deep-ink tracking-tight">
          A Special World For You
        </h1>
      </header>

      {/* Center Character & Comic Interaction */}
      <main className="relative z-10 flex flex-col items-center my-auto w-full max-w-md space-y-4">
        {/* Pip's Comic Speech Bubble */}
        <SpeechBubble tailPosition="bottom-left">
          <p className="font-display font-semibold text-deep-ink text-base sm:text-lg">
            {BIRTHDAY_DATA.portalGreeting}
          </p>
          <p className="font-sans text-xs sm:text-sm text-deep-ink/75 mt-1 font-medium">
            {BIRTHDAY_DATA.portalPrompt}
          </p>
        </SpeechBubble>

        {/* Pip The Mascot */}
        <div className="pt-2">
          <PipCharacter mood={characterMood} size={135} />
        </div>

        {/* Squishy Portal Button */}
        <div className={`pt-4 transition-transform duration-500 ${isOpening ? 'scale-110' : ''}`}>
          <PortalButton onClick={handleOpen} disabled={isOpening} />
        </div>
      </main>

      {/* Footer Hint */}
      <footer className="relative z-10 text-center mb-4">
        <p className="text-xs font-sans font-semibold text-deep-ink/50 tracking-wider">
          (Tap the button to enter her birthday universe)
        </p>
      </footer>
    </div>
  );
};
