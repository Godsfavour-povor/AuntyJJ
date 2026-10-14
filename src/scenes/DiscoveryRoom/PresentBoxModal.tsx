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

    // 1. Slow & steady emergence of large 3D gift box to center screen (1.65s, power2.inOut)
    tl.to(giftBoxWrapperRef.current, {
      x: 0,
      y: 10,
      scale: 1.4,
      rotationY: 0,
      rotationX: 0,
      duration: 1.65,
      ease: 'power2.inOut',
    })
      .to(
        presentGlowRef.current,
        { opacity: 0.75, scale: 1.4, duration: 1.4, ease: 'power1.out' },
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
        scale: 1.45,
        duration: 0.28,
        ease: 'sine.inOut',
      })
      .to(giftBoxWrapperRef.current, { rotationZ: 4, duration: 0.28, ease: 'sine.inOut' })
      .to(giftBoxWrapperRef.current, { rotationZ: -2.5, duration: 0.24, ease: 'sine.inOut' })
      .to(giftBoxWrapperRef.current, {
        rotationZ: 0,
        scale: 1.42,
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
        scale: 2.2,
        duration: 1.2,
        ease: 'power2.out',
      })
      .to(
        giftBoxLidRef.current,
        {
          y: -160,
          x: 60,
          rotationZ: 24,
          rotationX: 35,
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
          y: 260,
          scale: 0.65,
          opacity: 0.1,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-deep-ink/80 backdrop-blur-md select-none overflow-hidden"
      style={{ perspective: '1600px' }}
    >
      {/* Ambient Radial Glow matching the box color */}
      <div
        ref={presentGlowRef}
        className="w-[600px] h-[600px] rounded-full blur-3xl absolute pointer-events-none opacity-0"
        style={{
          backgroundColor: present.boxColor,
          filter: 'blur(100px)',
        }}
      />

      <div className="relative w-full max-w-4xl flex flex-col items-center justify-center min-h-[500px]">
        {/* Step Status Pill using direct ref (visible only while box is opening, removed when picture appears) */}
        <div
          ref={hintTextRef}
          className="px-4 py-1.5 rounded-full bg-white border-[3px] border-deep-ink shadow-[3px_3px_0px_#1E1B4B] text-xs font-display font-extrabold uppercase tracking-wider text-deep-ink mb-6 z-30 animate-fade-in"
        >
          ✨ Bringing your present out of the room...
        </div>

        {/* 3D Gift Box Stage */}
        <div
          className="relative w-72 sm:w-80 h-72 sm:h-80 flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* RISING KEEPSAKE CARD: Occupies exact width of the actual photo! */}
          <div
            ref={presentCardRef}
            className={`w-fit max-w-[94vw] max-h-[92vh] border-[4px] border-deep-ink shadow-[10px_10px_0px_#1E1B4B] rounded-3xl p-4 sm:p-6 flex flex-col items-center text-center z-20 ${
              isDone ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{
              backgroundColor: getCardBg(present.boxColor),
            }}
          >
            {/* Custom Photo Frame: hugs photo's exact dimensions with no letterboxing */}
            <div className="relative rounded-2xl border-[3.5px] border-deep-ink overflow-hidden bg-black/5 shadow-inner flex items-center justify-center mb-3">
              <img
                src={photoUrl}
                alt={present.title}
                className="max-h-[64vh] sm:max-h-[70vh] max-w-[88vw] w-auto h-auto object-contain block rounded-xl"
              />
            </div>

            {/* Just beneath the picture with the handwriting stuff: spans exact width */}
            <div className="w-full py-1">
              <p className="font-handwritten text-3xl sm:text-4xl md:text-5xl font-bold text-coral text-center tracking-wide leading-tight">
                {present.message}
              </p>
            </div>

            {/* Action Button: spans exact width of the photo */}
            <button
              onClick={handleCollect}
              className="w-full py-3.5 mt-2.5 rounded-2xl bg-turquoise hover:bg-turquoise-dark text-deep-ink border-[3.5px] border-deep-ink font-display font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-[4px_4px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2 pointer-events-auto"
            >
              <Check className="w-5 h-5" />
              <span>Keep Memory &amp; Continue Exploring ✨</span>
            </button>
          </div>

          {/* THE 3D GIFT BOX WRAPPER (Bigger, bolder dimensions) */}
          <div
            ref={giftBoxWrapperRef}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Inner Golden Light Burst */}
            <div
              ref={boxInnerLightRef}
              className="w-48 h-48 rounded-full bg-amber-300 blur-2xl absolute opacity-0"
            />

            {/* Gift Box Lid (Lifts & Tilts off slowly in 3D) */}
            <div
              ref={giftBoxLidRef}
              className="w-64 sm:w-72 h-16 relative z-20 flex flex-col items-center"
            >
              {/* Ribbon Bow on Top */}
              <div className="w-28 h-10 -mb-1 flex items-center justify-center relative">
                <div className="w-12 h-9 rounded-full border-[3.5px] border-deep-ink bg-yellow -rotate-12 -mr-1" />
                <div className="w-12 h-9 rounded-full border-[3.5px] border-deep-ink bg-yellow rotate-12 -ml-1" />
                <div className="w-7 h-7 rounded-full border-[3px] border-deep-ink bg-amber-500 absolute" />
              </div>
              {/* Lid Rim */}
              <div
                className="w-64 sm:w-72 h-12 border-[3.5px] border-deep-ink rounded-xl shadow-md relative flex justify-center overflow-hidden"
                style={{ backgroundColor: present.boxColor }}
              >
                <div className="w-10 h-full bg-yellow border-x-[2.5px] border-deep-ink" />
              </div>
            </div>

            {/* Gift Box Base */}
            <div
              className="w-60 sm:w-64 h-48 border-[3.5px] border-t-0 border-deep-ink rounded-b-2xl shadow-[0_14px_0px_#1E1B4B] relative flex justify-center overflow-hidden -mt-0.5 z-10"
              style={{ backgroundColor: present.boxColor }}
            >
              {/* Vertical Ribbon */}
              <div className="w-10 h-full bg-yellow border-x-[2.5px] border-deep-ink" />
              {/* Polka dot highlight shine */}
              <div className="w-4 h-4 rounded-full bg-white/40 absolute top-5 left-6" />
              <div className="w-5 h-5 rounded-full bg-white/40 absolute bottom-8 right-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
