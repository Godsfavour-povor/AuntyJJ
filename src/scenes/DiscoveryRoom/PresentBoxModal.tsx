import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { Check } from 'lucide-react';
import { useAudio } from '../../audio/useAudio';

export interface PresentItem {
  id: string;
  type: 'present';
  title: string;
  cardHeading: string;
  badge: string;
  boxColor: string;
  x: number;
  y: number;
  unlocked: boolean;
  photoUrl: string;
  message: string;
}

interface PresentBoxModalProps {
  present: PresentItem;
  onClose: (unlockedId: string, updatedPhotoUrl?: string) => void;
}

// Helper to get matching soft background for the card based on box color
const getCardBg = (boxColor: string) => {
  if (boxColor === '#F472B6' || boxColor.toLowerCase().includes('f472b6')) return '#FDF2F8'; // Pinkish
  if (boxColor === '#38BDF8' || boxColor.toLowerCase().includes('38bdf8')) return '#F0F9FF'; // Blue
  return '#FEFCE8'; // Yellow
};

export const PresentBoxModal: React.FC<PresentBoxModalProps> = ({ present, onClose }) => {
  const audio = useAudio();
  const [photoUrl] = useState<string>(present.photoUrl);
  const [isDone, setIsDone] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const hintTextRef = useRef<HTMLDivElement>(null);
  const presentGlowRef = useRef<HTMLDivElement>(null);
  const giftBoxWrapperRef = useRef<HTMLDivElement>(null);
  const giftBoxLidRef = useRef<HTMLDivElement>(null);
  const boxInnerLightRef = useRef<HTMLDivElement>(null);
  const presentCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Locate the room item on screen to start emergence animation directly from its coordinates
    const nodeEl = document.getElementById(`node-${present.id}`);
    const rect = nodeEl ? nodeEl.getBoundingClientRect() : {
      left: window.innerWidth / 2,
      top: window.innerHeight / 2,
      width: 50,
      height: 50,
    };
    const startDeltaX = rect.left + rect.width / 2 - window.innerWidth / 2;
    const startDeltaY = rect.top + rect.height / 2 - window.innerHeight / 2;

    // Reset initial transforms for GSAP
    gsap.set(presentGlowRef.current, { opacity: 0, scale: 0.6 });
    gsap.set(giftBoxWrapperRef.current, {
      x: startDeltaX,
      y: startDeltaY,
      scale: 0.25,
      rotationY: -25,
      rotationX: 15,
      opacity: 1,
    });
    gsap.set(giftBoxLidRef.current, { y: 0, x: 0, rotationZ: 0, rotationX: 0, opacity: 1 });
    gsap.set(boxInnerLightRef.current, { opacity: 0, scale: 0.4 });
    gsap.set(presentCardRef.current, {
      y: 90,
      scale: 0.35,
      opacity: 0,
      rotationX: 12,
    });

    if (hintTextRef.current) {
      hintTextRef.current.style.display = 'block';
      hintTextRef.current.style.opacity = '1';
      hintTextRef.current.textContent = '✨ Bringing your present out of the room...';
    }

    audio.playPop();

    const tl = gsap.timeline();

    // 1. Slow & steady emergence of 3D gift box to center screen (1.65s, power2.inOut)
    tl.to(giftBoxWrapperRef.current, {
      x: 0,
      y: 0,
      scale: 1.18,
      rotationY: 0,
      rotationX: 0,
      duration: 1.65,
      ease: 'power2.inOut',
    })
      .to(
        presentGlowRef.current,
        { opacity: 0.75, scale: 1.3, duration: 1.4, ease: 'power1.out' },
        '-=1.2'
      )

      // 2. Gentle anticipation breath & slow wobble (1.1s)
      .call(() => {
        if (hintTextRef.current) {
          hintTextRef.current.textContent = '🎀 Untying the birthday ribbon...';
        }
      })
      .to(giftBoxWrapperRef.current, {
        rotationZ: -4,
        scale: 1.22,
        duration: 0.28,
        ease: 'sine.inOut',
      })
      .to(giftBoxWrapperRef.current, { rotationZ: 4, duration: 0.28, ease: 'sine.inOut' })
      .to(giftBoxWrapperRef.current, { rotationZ: -2.5, duration: 0.24, ease: 'sine.inOut' })
      .to(giftBoxWrapperRef.current, {
        rotationZ: 0,
        scale: 1.18,
        duration: 0.25,
        ease: 'sine.inOut',
      })

      // 3. Slow, majestic 3D lid lift & golden light reveal (1.8s, power2.inOut)
      .call(() => {
        if (hintTextRef.current) {
          hintTextRef.current.textContent = '✨ Opening the box...';
        }
        audio.playScratchChime();
      })
      .to(boxInnerLightRef.current, {
        opacity: 0.95,
        scale: 2.0,
        duration: 1.2,
        ease: 'power2.out',
      })
      .to(
        giftBoxLidRef.current,
        {
          y: -110,
          x: 45,
          rotationZ: 20,
          rotationX: 25,
          opacity: 0,
          duration: 1.8,
          ease: 'power2.inOut',
        },
        '-=1.0'
      )

      // 4. As the main picture comes out, remove the status pill completely
      .to(
        hintTextRef.current,
        {
          opacity: 0,
          y: -20,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            if (hintTextRef.current) {
              hintTextRef.current.style.display = 'none';
            }
          },
        },
        '-=1.2'
      )

      // Keepsake photo card rises slowly out of the box while box settles downward (2.2s)
      .call(() => {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.55 },
          colors: ['#FF6B8B', '#FBBF24', '#2DD4BF', '#F472B6', '#FFFFFF'],
        });
      })
      .to(
        giftBoxWrapperRef.current,
        {
          y: 160,
          scale: 0.65,
          opacity: 0.05,
          duration: 2.1,
          ease: 'power2.inOut',
        },
        '-=0.4'
      )
      .to(
        presentCardRef.current,
        {
          y: 0,
          scale: 1,
          rotationX: 0,
          opacity: 1,
          duration: 2.2,
          ease: 'power2.out',
          onComplete: () => {
            setIsDone(true);
          },
        },
        '-=1.85'
      );

    return () => {
      tl.kill();
    };
    // Intentionally run once per present ID to avoid any timeline resets or re-render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present.id]);

  const handleCollect = () => {
    audio.playCollect();
    onClose(present.id, photoUrl);
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-deep-ink/80 backdrop-blur-md select-none h-[100dvh] max-h-[100dvh] overflow-hidden"
      style={{ perspective: '1600px' }}
    >
      {/* Ambient Radial Glow matching the box color */}
      <div
        ref={presentGlowRef}
        className="w-[500px] h-[500px] rounded-full blur-3xl absolute pointer-events-none opacity-0"
        style={{
          backgroundColor: present.boxColor,
          filter: 'blur(90px)',
        }}
      />

      <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center overflow-hidden">
        {/* Step Status Pill using direct ref (visible only while box is opening, removed when picture appears) */}
        <div
          ref={hintTextRef}
          className="px-4 py-1.5 rounded-full bg-white border-[3px] border-deep-ink shadow-[3px_3px_0px_#1E1B4B] text-xs font-display font-extrabold uppercase tracking-wider text-deep-ink mb-3 z-30 animate-fade-in flex-shrink-0"
        >
          ✨ Bringing your present out of the room...
        </div>

        {/* 3D Gift Box Stage & Card Container */}
        <div
          className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* RISING KEEPSAKE CARD: Stays strictly within view height, non-scrollable */}
          <div
            ref={presentCardRef}
            className={`w-[94vw] max-w-lg sm:max-w-xl md:max-w-2xl max-h-[92dvh] border-[3.5px] sm:border-[4px] border-deep-ink shadow-[8px_8px_0px_#1E1B4B] sm:shadow-[10px_10px_0px_#1E1B4B] rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-between text-center z-20 ${
              isDone ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{
              backgroundColor: getCardBg(present.boxColor),
            }}
          >
            {/* Custom Photo Frame: Head guaranteed to show, brought down with top padding, zero cropping */}
            <div className="w-full flex-1 min-h-0 h-[48dvh] sm:h-[54dvh] max-h-[48dvh] sm:max-h-[500px] rounded-xl sm:rounded-2xl border-[3px] sm:border-[3.5px] border-deep-ink overflow-hidden bg-amber-50/70 shadow-inner p-2 pt-3 sm:p-3 sm:pt-4 mb-1.5 relative flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={photoUrl}
                  alt={present.title}
                  className="absolute inset-0 w-full h-full block rounded-lg sm:rounded-xl shadow-sm"
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'center top',
                  }}
                />
              </div>
            </div>

            {/* Just beneath the picture with handwriting: single line */}
            <div className="w-full py-0.5 flex-shrink-0">
              <p className="font-handwritten text-2xl sm:text-4xl md:text-5xl font-bold text-coral text-center tracking-wide leading-tight">
                {present.message}
              </p>
            </div>

            {/* Action Button: 'Continue Exploring ✨' */}
            <button
              onClick={handleCollect}
              className="w-full py-2.5 sm:py-3.5 mt-1 sm:mt-2 rounded-xl sm:rounded-2xl bg-turquoise hover:bg-turquoise-dark text-deep-ink border-[3px] sm:border-[3.5px] border-deep-ink font-display font-extrabold text-xs sm:text-base uppercase tracking-wider shadow-[3.5px_3.5px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2 flex-shrink-0 pointer-events-auto"
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>Continue Exploring ✨</span>
            </button>
          </div>

          {/* THE 3D GIFT BOX WRAPPER */}
          <div
            ref={giftBoxWrapperRef}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Inner Golden Light Burst */}
            <div
              ref={boxInnerLightRef}
              className="w-44 h-44 rounded-full bg-amber-300 blur-2xl absolute opacity-0"
            />

            {/* Gift Box Lid (Lifts & Tilts off slowly in 3D) */}
            <div
              ref={giftBoxLidRef}
              className="w-60 sm:w-72 h-15 sm:h-16 relative z-20 flex flex-col items-center"
            >
              {/* Ribbon Bow on Top */}
              <div className="w-24 sm:w-28 h-9 sm:h-10 -mb-1 flex items-center justify-center relative">
                <div className="w-11 sm:w-12 h-8 sm:h-9 rounded-full border-[3px] sm:border-[3.5px] border-deep-ink bg-yellow -rotate-12 -mr-1" />
                <div className="w-11 sm:w-12 h-8 sm:h-9 rounded-full border-[3px] sm:border-[3.5px] border-deep-ink bg-yellow rotate-12 -ml-1" />
                <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full border-[2.5px] sm:border-[3px] border-deep-ink bg-amber-500 absolute" />
              </div>
              {/* Lid Rim */}
              <div
                className="w-60 sm:w-72 h-11 sm:h-12 border-[3px] sm:border-[3.5px] border-deep-ink rounded-xl shadow-md relative flex justify-center overflow-hidden"
                style={{ backgroundColor: present.boxColor }}
              >
                <div className="w-9 sm:w-10 h-full bg-yellow border-x-[2.5px] border-deep-ink" />
              </div>
            </div>

            {/* Gift Box Base */}
            <div
              className="w-56 sm:w-64 h-44 sm:h-48 border-[3px] sm:border-[3.5px] border-t-0 border-deep-ink rounded-b-2xl shadow-[0_12px_0px_#1E1B4B] relative flex justify-center overflow-hidden -mt-0.5 z-10"
              style={{ backgroundColor: present.boxColor }}
            >
              {/* Vertical Ribbon */}
              <div className="w-9 sm:w-10 h-full bg-yellow border-x-[2.5px] border-deep-ink" />
              {/* Polka dot highlight shine */}
              <div className="w-3.5 h-3.5 rounded-full bg-white/40 absolute top-5 left-6" />
              <div className="w-4 h-4 rounded-full bg-white/40 absolute bottom-8 right-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
