import React, { useState, useEffect, useRef } from 'react';
import type { CharacterMood } from '../../types';
import { useAudio } from '../../audio/useAudio';

interface PipCharacterProps {
  mood?: CharacterMood;
  className?: string;
  size?: number;
  onClick?: () => void;
}

export const PipCharacter: React.FC<PipCharacterProps> = ({
  mood = 'idle',
  className = '',
  size = 120,
  onClick,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isSquished, setIsSquished] = useState(false);
  const characterRef = useRef<HTMLDivElement>(null);
  const audio = useAudio();

  // Natural Blinking Loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3600);
    return () => clearInterval(blinkInterval);
  }, []);

  // Eye tracking: pupils follow mouse/pointer
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!characterRef.current) return;
      const rect = characterRef.current.getBoundingClientRect();
      const charCenterX = rect.left + rect.width / 2;
      const charCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - charCenterX;
      const deltaY = e.clientY - charCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.hypot(deltaX, deltaY) / 60, 4);

      setEyeOffset({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const handleClick = () => {
    setIsSquished(true);
    audio.playGreeting();
    setTimeout(() => setIsSquished(false), 250);
    if (onClick) onClick();
  };

  // Render Mouth based on mood
  const renderMouth = () => {
    switch (mood) {
      case 'surprised':
        return <ellipse cx="50" cy="58" rx="5" ry="7" fill="#1E1B4B" />;
      case 'celebrating':
        return (
          <path
            d="M40 54 Q50 68 60 54 Z"
            fill="#FB7185"
            stroke="#1E1B4B"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        );
      case 'wishing':
        return (
          <path
            d="M44 56 Q50 59 56 56"
            fill="none"
            stroke="#1E1B4B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      default: // idle / happy / curious / pointing
        return (
          <path
            d="M42 55 Q50 64 58 55"
            fill="none"
            stroke="#1E1B4B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
    }
  };

  // Render Eyes
  const renderEyes = () => {
    if (isBlinking || mood === 'wishing') {
      // Closed peaceful / blinking eyes
      return (
        <g stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round">
          <path d="M32 44 Q38 48 44 44" fill="none" />
          <path d="M56 44 Q62 48 68 44" fill="none" />
        </g>
      );
    }

    if (mood === 'celebrating') {
      // Joyful upside down arc eyes (^ ^)
      return (
        <g stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round">
          <path d="M32 46 Q38 40 44 46" fill="none" />
          <path d="M56 46 Q62 40 68 46" fill="none" />
        </g>
      );
    }

    // Normal expressive eyes with pointer-tracked pupils
    return (
      <g>
        {/* Left Eye */}
        <circle cx="38" cy="44" r="8.5" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="2" />
        <circle cx={38 + eyeOffset.x} cy={44 + eyeOffset.y} r="4.2" fill="#1E1B4B" />
        <circle cx={36.5 + eyeOffset.x * 0.5} cy={42 + eyeOffset.y * 0.5} r="1.6" fill="#FFFFFF" />

        {/* Right Eye */}
        <circle cx="62" cy="44" r="8.5" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="2" />
        <circle cx={62 + eyeOffset.x} cy={44 + eyeOffset.y} r="4.2" fill="#1E1B4B" />
        <circle cx={60.5 + eyeOffset.x * 0.5} cy={42 + eyeOffset.y * 0.5} r="1.6" fill="#FFFFFF" />
      </g>
    );
  };

  return (
    <div
      ref={characterRef}
      onClick={handleClick}
      style={{ width: size, height: size * 1.15 }}
      className={`relative cursor-pointer select-none transition-transform duration-300 ${
        isSquished ? 'scale-x-115 scale-y-85' : 'hover:scale-105 active:scale-95'
      } ${mood === 'celebrating' ? 'animate-bounce' : ''} ${className}`}
      title="Pip, your personal birthday guide! Tap him!"
      role="button"
      tabIndex={0}
      aria-label="Pip, the animated celebration guide mascot"
    >
      <svg
        viewBox="0 0 100 115"
        className="w-full h-full drop-shadow-lg overflow-visible"
      >
        {/* Feet */}
        <ellipse cx="38" cy="98" rx="8" ry="4" fill="#FDBA74" stroke="#1E1B4B" strokeWidth="2" />
        <ellipse cx="62" cy="98" rx="8" ry="4" fill="#FDBA74" stroke="#1E1B4B" strokeWidth="2" />

        {/* Main Body (Soft buttery yellow bean/pear shape) */}
        <path
          d="M 22,65 C 20,38 35,26 50,26 C 65,26 80,38 78,65 C 76,88 66,97 50,97 C 34,97 24,88 22,65 Z"
          fill="#FDE047"
          stroke="#1E1B4B"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* Soft Tummy Highlight */}
        <ellipse cx="50" cy="72" rx="16" ry="14" fill="#FEF08A" opacity="0.8" />

        {/* Rosy Cheeks */}
        <circle cx="28" cy="52" r="5" fill="#FB7185" opacity="0.65" />
        <circle cx="72" cy="52" r="5" fill="#FB7185" opacity="0.65" />

        {/* Eyebrows */}
        <g stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round">
          <path d={mood === 'curious' ? "M 32,32 Q 38,30 44,34" : "M 32,34 Q 38,31 44,34"} fill="none" />
          <path d="M 56,34 Q 62,31 68,34" fill="none" />
        </g>

        {/* Eyes */}
        {renderEyes()}

        {/* Mouth */}
        {renderMouth()}

        {/* Hands & Arms */}
        {mood === 'pointing' ? (
          // Pointing hand gesture
          <g>
            <path d="M 22,64 Q 10,72 20,78" fill="#FDE047" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 78,64 Q 92,54 96,62" fill="#FDE047" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ) : mood === 'wishing' ? (
          // Hands brought up covering / closing eyes while making a silent wish
          <g>
            {/* Left Arm reaching up to eye */}
            <path d="M 24,68 C 18,54 26,46 35,45" fill="none" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" />
            <path d="M 24,68 C 18,54 26,46 35,45" fill="none" stroke="#FDE047" strokeWidth="2.2" strokeLinecap="round" />
            {/* Left Hand over left eye */}
            <ellipse cx="36" cy="45" rx="7" ry="5.5" fill="#FDE047" stroke="#1E1B4B" strokeWidth="2.2" transform="rotate(-15 36 45)" />
            <line x1="33" y1="44" x2="38" y2="44" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" />

            {/* Right Arm reaching up to eye */}
            <path d="M 76,68 C 82,54 74,46 65,45" fill="none" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" />
            <path d="M 76,68 C 82,54 74,46 65,45" fill="none" stroke="#FDE047" strokeWidth="2.2" strokeLinecap="round" />
            {/* Right Hand over right eye */}
            <ellipse cx="64" cy="45" rx="7" ry="5.5" fill="#FDE047" stroke="#1E1B4B" strokeWidth="2.2" transform="rotate(15 64 45)" />
            <line x1="62" y1="44" x2="67" y2="44" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ) : (
          // Normal little resting hands
          <g>
            <ellipse cx="23" cy="68" rx="4.5" ry="6" fill="#FDE047" stroke="#1E1B4B" strokeWidth="2.5" />
            <ellipse cx="77" cy="68" rx="4.5" ry="6" fill="#FDE047" stroke="#1E1B4B" strokeWidth="2.5" />
          </g>
        )}

        {/* Birthday Party Hat */}
        <g transform="translate(0, -2)">
          {/* Hat Cone with playful stripes */}
          <path
            d="M 50,4 L 38,28 L 62,28 Z"
            fill="#FB7185"
            stroke="#1E1B4B"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Striped patterns on hat */}
          <path d="M 43,14 L 57,14" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" />
          <path d="M 40,21 L 60,21" stroke="#FDE047" strokeWidth="3.5" strokeLinecap="round" />

          {/* Pom-pom on top */}
          <circle cx="50" cy="4" r="4.5" fill="#2DD4BF" stroke="#1E1B4B" strokeWidth="2" className="animate-pulse" />
        </g>
      </svg>
    </div>
  );
};
