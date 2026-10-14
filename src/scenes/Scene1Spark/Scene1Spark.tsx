import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { CandleCanvas } from './CandleCanvas';
import { MicBlowDetector } from './MicBlowDetector';

export const Scene1Spark: React.FC = () => {
  const { candleExtinguished, extinguishCandle } = useAdventure();
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const blowDetectorRef = useRef<MicBlowDetector | null>(null);

  const handleExtinguish = () => {
    if (blowDetectorRef.current) {
      blowDetectorRef.current.stop();
      setMicActive(false);
    }
    extinguishCandle();
  };

  const toggleMic = async () => {
    if (micActive) {
      if (blowDetectorRef.current) {
        blowDetectorRef.current.stop();
      }
      setMicActive(false);
      setMicError(null);
    } else {
      setMicError(null);
      const detector = new MicBlowDetector(() => {
        handleExtinguish();
      });
      blowDetectorRef.current = detector;
      const success = await detector.start();
      if (success) {
        setMicActive(true);
      } else {
        setMicError("Microphone access not available. Tap the flame instead!");
        setMicActive(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (blowDetectorRef.current) {
        blowDetectorRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden bg-radial from-plum-900 via-plum-950 to-black select-none">
      {/* Subtle ambient background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          className={`w-96 h-96 rounded-full bg-amber-500/10 blur-3xl transition-opacity duration-1000 ${
            candleExtinguished ? 'opacity-10 scale-75' : 'opacity-70 animate-ambient-glow'
          }`}
        />
      </div>

      {/* Floating micro-ember particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold-400/40 animate-pulse"
            style={{
              top: `${(i * 19) % 100}%`,
              left: `${(i * 23) % 100}%`,
              animationDuration: `${3 + (i % 5)}s`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Top Header / Prologue */}
      <header className="relative z-10 text-center max-w-lg mt-8 sm:mt-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum-900/60 border border-gold-400/20 text-xs tracking-widest uppercase text-gold-400/90 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>Chapter I &middot; The First Spark</span>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-ivory/90 font-normal leading-relaxed tracking-wide px-4">
          {candleExtinguished
            ? "Your wish is carried into the stars..."
            : BIRTHDAY_DATA.subtitle}
        </h1>
      </header>

      {/* Center 3D Candle Element */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto w-full">
        <CandleCanvas
          isExtinguished={candleExtinguished}
          onExtinguish={handleExtinguish}
        />

        {/* Prompt and Instructions */}
        <div className="text-center mt-2 space-y-2">
          <p
            className={`text-sm sm:text-base font-light tracking-wider transition-all duration-500 ${
              candleExtinguished ? 'text-gold-300 font-serif text-lg italic' : 'text-ivory/80'
            }`}
          >
            {candleExtinguished
              ? "Opening the universe for you..."
              : BIRTHDAY_DATA.openingPrompt}
          </p>

          {!candleExtinguished && (
            <p className="text-xs text-ivory/40 tracking-wider">
              (Tap the candle flame to blow it out)
            </p>
          )}
        </div>
      </main>

      {/* Bottom Controls: Microphone Toggle & Accessible Action */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mb-4">
        {!candleExtinguished && (
          <>
            {/* Optional Mic Blow Button */}
            <button
              onClick={toggleMic}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs tracking-wider uppercase transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                micActive
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                  : 'bg-plum-900/60 border-gold-400/20 text-ivory/60 hover:text-ivory hover:border-gold-400/40'
              }`}
              title="Blow gently into your microphone"
            >
              {micActive ? (
                <>
                  <Mic className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                  <span>Listening... Blow now!</span>
                </>
              ) : (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Blow into mic (Optional)</span>
                </>
              )}
            </button>

            {/* Direct Tap Alternative Button */}
            <button
              onClick={handleExtinguish}
              className="px-5 py-2 rounded-full bg-gold-400/20 hover:bg-gold-400/30 border border-gold-400/40 text-gold-300 text-xs tracking-widest uppercase font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400"
            >
              Make A Wish ✨
            </button>
          </>
        )}

        {micError && (
          <p className="text-xs text-rose-300/80 text-center col-span-full">
            {micError}
          </p>
        )}
      </footer>
    </div>
  );
};
