import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAudio } from '../../audio/useAudio';

interface PortalButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const PortalButton: React.FC<PortalButtonProps> = ({ onClick, disabled }) => {
  const [isPressed, setIsPressed] = useState(false);
  const audio = useAudio();

  const handlePointerDown = () => {
    if (disabled) return;
    setIsPressed(true);
    audio.playPop();
  };

  const handlePointerUp = () => {
    if (disabled) return;
    setIsPressed(false);
    onClick();
  };

  return (
    <div className="relative inline-block select-none">
      {/* 3D Button Base Shadow */}
      <div className="absolute inset-0 translate-y-3 rounded-3xl bg-coral-dark border-4 border-deep-ink" />

      {/* Main Interactive Button Cap */}
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            audio.playPop();
            onClick();
          }
        }}
        disabled={disabled}
        style={{
          transform: isPressed ? 'translateY(10px)' : 'translateY(0px)',
        }}
        className="relative z-10 flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-3xl bg-gradient-to-b from-coral via-coral to-[#F43F5E] border-4 border-deep-ink text-white font-display font-bold text-lg sm:text-2xl tracking-wide shadow-inner transition-transform duration-100 focus:outline-none focus:ring-4 focus:ring-yellow cursor-pointer hover:brightness-105 active:brightness-95"
        aria-label="Enter the birthday celebration"
      >
        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-yellow fill-current animate-party-wiggle" />
        <span>Open the Celebration! 🎁</span>
      </button>
    </div>
  );
};
