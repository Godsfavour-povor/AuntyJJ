import React from 'react';
import { Sparkles, ArrowRight, Wind } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { BirthdayCake } from './BirthdayCake';
import { PipCharacter } from '../../components/Character/PipCharacter';
import { SpeechBubble } from '../../components/SpeechBubble/SpeechBubble';

export const WishMakingParty: React.FC = () => {
  const {
    wishStage,
    setWishStage,
    extinguishCandles,
    characterMood,
    setCharacterMood,
    goToScene,
  } = useAdventure();

  const handleStartWish = () => {
    setWishStage('making_wish');
    setCharacterMood('wishing');
  };

  const handleWishDone = () => {
    setWishStage('blow_candles');
    setCharacterMood('pointing');
  };

  const handleBlow = () => {
    extinguishCandles();
  };

  const getSpeechContent = () => {
    switch (wishStage) {
      case 'making_wish':
        return (
          <>
            <p className="font-display font-bold text-base sm:text-lg">
              {BIRTHDAY_DATA.wishSilentPrompt}
            </p>
            <p className="text-xs text-deep-ink/70 font-medium mt-1">
              (Take all the time you need, Big Sis!)
            </p>
          </>
        );
      case 'blow_candles':
        return (
          <>
            <p className="font-display font-bold text-base sm:text-lg text-coral">
              Now blow out the candles!
            </p>
            <p className="text-xs text-deep-ink/70 font-medium mt-1">
              Tap the cake or use the button below!
            </p>
          </>
        );
      case 'candles_blown':
        return (
          <>
            <p className="font-display font-bold text-base sm:text-lg text-turquoise-dark">
              🎉 WISH SECURED & SENT TO THE STARS!
            </p>
            <p className="text-xs text-deep-ink/75 font-medium mt-1">
              Look! A mystery keepsake was hidden behind the cake!
            </p>
          </>
        );
      default:
        return (
          <>
            <p className="font-display font-bold text-base sm:text-lg">
              {BIRTHDAY_DATA.wishIntro}
            </p>
            <p className="text-xs text-deep-ink/70 font-medium mt-1">
              Ready to make your official birthday wish?
            </p>
          </>
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden bg-gradient-to-b from-[#FEF3C7] via-[#FFFDF8] to-[#FDF4FF] select-none">
      {/* Top Header */}
      <header className="relative z-10 text-center max-w-lg mt-8 sm:mt-10 space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border-2 border-deep-ink text-xs font-display font-bold uppercase tracking-widest text-deep-ink shadow-[2px_2px_0px_#1E1B4B]">
          <Sparkles className="w-3.5 h-3.5 text-yellow-dark" />
          <span>Chapter II &middot; Wish Time</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-display font-bold text-deep-ink tracking-tight">
          Make A Wish, {BIRTHDAY_DATA.sisterName}!
        </h1>
      </header>

      {/* Center Cake & Pip Dialogue */}
      <main className="relative z-10 flex flex-col items-center my-auto w-full max-w-xl space-y-3">
        {/* Pip's Dynamic Speech Bubble */}
        <SpeechBubble tailPosition="bottom-left" className="mb-1">
          {getSpeechContent()}
        </SpeechBubble>

        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
          {/* Pip The Mascot */}
          <div className="sm:absolute sm:left-4 sm:bottom-4 z-20">
            <PipCharacter mood={characterMood} size={110} />
          </div>

          {/* Birthday Cake */}
          <div className="z-10">
            <BirthdayCake
              candlesBlown={wishStage === 'candles_blown'}
              onBlowCandles={handleBlow}
            />
          </div>
        </div>

        {/* Ritual Interactive Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          {wishStage === 'intro' && (
            <button
              onClick={handleStartWish}
              className="px-8 py-3.5 rounded-full bg-yellow hover:bg-yellow-dark text-deep-ink border-2 border-deep-ink font-display font-bold text-sm tracking-wider uppercase shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Start My Birthday Wish ✨
            </button>
          )}

          {wishStage === 'making_wish' && (
            <button
              onClick={handleWishDone}
              className="px-8 py-3.5 rounded-full bg-coral hover:bg-coral-dark text-white border-2 border-deep-ink font-display font-bold text-sm tracking-wider uppercase shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all animate-pulse"
            >
              I&apos;ve Made My Wish! ✨
            </button>
          )}

          {wishStage === 'blow_candles' && (
            <button
              onClick={handleBlow}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-turquoise hover:bg-turquoise-dark text-deep-ink hover:text-white border-2 border-deep-ink font-display font-bold text-sm tracking-wider uppercase shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <Wind className="w-4 h-4" />
              <span>Blow Out the Candles! 🌬️</span>
            </button>
          )}

          {wishStage === 'candles_blown' && (
            <button
              onClick={() => goToScene('scene_3_discovery')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-coral to-peach text-white border-2 border-deep-ink font-display font-bold text-sm tracking-wider uppercase shadow-[4px_4px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all animate-bounce"
            >
              <span>Open the Surprise Keepsake 🎁</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>

      {/* Footer Instructions */}
      <footer className="relative z-10 text-center mb-4">
        <p className="text-xs font-sans font-medium text-deep-ink/50 tracking-wider">
          {wishStage === 'candles_blown'
            ? "Your wish has been launched into the universe!"
            : "(Tap the cake or buttons to participate in the wish ritual)"}
        </p>
      </footer>
    </div>
  );
};
