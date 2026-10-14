import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { useAudio } from '../../audio/useAudio';

interface CinematicEnvelopeModalProps {
  onClose: () => void;
}

export const CinematicEnvelopeModal: React.FC<CinematicEnvelopeModalProps> = ({ onClose }) => {
  const { goToScene } = useAdventure();
  const audio = useAudio();

  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [showScrollCue, setShowScrollCue] = useState<boolean>(true);

  const captionRef = useRef<HTMLDivElement>(null);
  const royalEnvelopeRef = useRef<HTMLDivElement>(null);
  const envelopeTopLidRef = useRef<HTMLDivElement>(null);
  const waxSealStampRef = useRef<HTMLDivElement>(null);
  const slidingLetterRef = useRef<HTMLDivElement>(null);
  const fullLetterSheetRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll handler for intuitive peek affordance
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 45;
    setShowScrollCue(!isNearBottom);
  };

  const handleScrollDown = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ top: 220, behavior: 'smooth' });
  };

  useEffect(() => {
    // Check if scroll is needed once letter is revealed
    if (isRevealed && scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      setShowScrollCue(el.scrollHeight - el.clientHeight > 30);
    }
  }, [isRevealed]);

  useEffect(() => {
    // Locate the envelope node on the apartment floor to start emergence from its exact coordinates
    const nodeEl = document.getElementById('node-final-envelope');
    const rect = nodeEl ? nodeEl.getBoundingClientRect() : {
      left: window.innerWidth / 2,
      top: 180,
      width: 60,
      height: 45,
    };
    const startDeltaX = rect.left + rect.width / 2 - window.innerWidth / 2;
    const startDeltaY = rect.top + rect.height / 2 - window.innerHeight / 2;

    // Reset 3D transforms for Envelope
    gsap.set(royalEnvelopeRef.current, {
      x: startDeltaX,
      y: startDeltaY,
      scale: 0.25,
      rotationX: 25,
      rotationY: -12,
      opacity: 1,
      display: 'block',
    });
    gsap.set(envelopeTopLidRef.current, { rotationX: 0, zIndex: 30 });
    gsap.set(waxSealStampRef.current, { scale: 1, opacity: 1 });
    gsap.set(slidingLetterRef.current, { y: 0, scale: 0.96, opacity: 1 });

    // Prepare full seamless letter (hidden initially)
    gsap.set(fullLetterSheetRef.current, {
      scale: 0.82,
      y: 40,
      opacity: 0,
      display: 'none',
    });

    if (captionRef.current) {
      captionRef.current.style.display = 'block';
      captionRef.current.style.opacity = '1';
      captionRef.current.textContent = '✨ Taking the Royal Birthday Envelope from the table...';
    }

    audio.playPaperRustle();

    const tl = gsap.timeline();

    // STEP 1: Envelope rises slowly from the table to screen center and scales up (1.85s, power2.inOut)
    tl.to(royalEnvelopeRef.current, {
      x: 0,
      y: 25,
      scale: 1.06,
      rotationX: 4,
      rotationY: 0,
      duration: 1.85,
      ease: 'power2.inOut',
    })

      // STEP 2: Royal Wax Seal releases & Upper V-Lid opens slowly in 3D (1.85s, power2.inOut)
      .call(() => {
        if (captionRef.current) {
          captionRef.current.textContent = '💌 Breaking the royal wax seal and opening the envelope flap...';
        }
        audio.playScratchChime();
      })
      .to(waxSealStampRef.current, {
        scale: 1.25,
        opacity: 0,
        duration: 0.65,
        ease: 'back.in(1.7)',
      })
      .to(
        envelopeTopLidRef.current,
        {
          rotationX: 180,
          duration: 1.85,
          ease: 'power2.inOut',
          transformOrigin: 'top center',
          onUpdate: function () {
            if (this.progress() > 0.5 && envelopeTopLidRef.current) {
              envelopeTopLidRef.current.style.zIndex = '5';
            }
          },
        },
        '-=0.2'
      )

      // STEP 3: Letter slides out upward WHILE the envelope falls down off the bottom of the screen (2.4s)
      .call(() => {
        if (captionRef.current) {
          captionRef.current.textContent = '📜 Drawing the letter out as the envelope falls away...';
        }
        audio.playPaperRustle();
      })
      .to(slidingLetterRef.current, {
        y: -210,
        scale: 1.03,
        duration: 2.2,
        ease: 'power2.inOut',
      })
      .to(
        royalEnvelopeRef.current,
        {
          y: 650,
          rotationZ: -6,
          rotationX: -18,
          opacity: 0,
          duration: 2.4,
          ease: 'power2.in',
          onComplete: () => {
            if (royalEnvelopeRef.current) {
              royalEnvelopeRef.current.style.display = 'none';
            }
          },
        },
        '-=1.65'
      )

      // STEP 4: Remove top status caption pill completely so no text clutters the screen
      .to(
        captionRef.current,
        {
          opacity: 0,
          y: -20,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            if (captionRef.current) {
              captionRef.current.style.display = 'none';
            }
          },
        },
        '-=1.0'
      )

      // Full Seamless Letter expands smoothly
      .call(
        () => {
          if (fullLetterSheetRef.current) {
            fullLetterSheetRef.current.style.display = 'flex';
          }
        },
        [],
        '-=0.8'
      )
      .to(
        fullLetterSheetRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.3,
          ease: 'power2.out',
        },
        '-=0.8'
      )
      .call(() => {
        setIsRevealed(true);
        audio.playCollect();
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.55 },
          colors: ['#FF6B8B', '#FBBF24', '#2DD4BF', '#F472B6', '#FFFFFF'],
        });
      });

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProceedToFinale = () => {
    audio.playCollect();
    onClose();
    goToScene('scene_4_finale');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-[#0F172A]/85 backdrop-blur-md select-none overflow-y-auto"
      style={{ perspective: '1600px' }}
    >
      {/* Cinematic Status Caption (Top Center) - Only visible during envelope stage */}
      <div
        ref={captionRef}
        className="fixed top-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-amber-100 border-[3px] border-deep-ink text-xs sm:text-sm font-display font-extrabold text-deep-ink z-50 shadow-[3px_3px_0px_#1E1B4B] animate-fade-in text-center max-w-[90vw]"
      >
        ✨ Taking the Royal Birthday Envelope from the table...
      </div>

      <div
        className="relative w-full max-w-2xl h-[92vh] flex items-center justify-center overflow-hidden"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ================= 1. THE REALISTIC TEXTURED ENVELOPE ================= */}
        <div
          ref={royalEnvelopeRef}
          className="w-[340px] sm:w-[440px] h-[230px] sm:h-[290px] relative z-20"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Envelope Back Inside Lining with warm linen weave */}
          <div
            className="absolute inset-0 rounded-2xl border-[4px] border-deep-ink shadow-2xl overflow-hidden"
            style={{
              backgroundColor: '#FDE68A',
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(180, 83, 9, 0.05) 0px, rgba(180, 83, 9, 0.05) 2px, transparent 2px, transparent 4px), repeating-linear-gradient(-45deg, rgba(180, 83, 9, 0.05) 0px, rgba(180, 83, 9, 0.05) 2px, transparent 2px, transparent 4px)',
            }}
          >
            <div className="inset-2 absolute border-2 border-dashed border-amber-700/30 rounded-xl" />
          </div>

          {/* Dummy preview inside envelope */}
          <div
            ref={slidingLetterRef}
            className="absolute left-5 right-5 top-4 bottom-4 rounded-xl border-[3px] border-deep-ink shadow-md z-10 flex flex-col items-center justify-center p-4 bg-[#FFFDF7]"
            style={{
              backgroundImage:
                'radial-gradient(rgba(217, 119, 6, 0.05) 1px, transparent 0), linear-gradient(to right, rgba(245, 158, 11, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 158, 11, 0.04) 1px, transparent 1px)',
              backgroundSize: '20px 20px, 40px 40px, 40px 40px',
            }}
          >
            <div className="w-full border-b-2 border-amber-300 pb-2 mb-2 text-center">
              <span className="font-handwritten text-2xl font-bold text-deep-ink">
                To My Dearest Sister ❤️
              </span>
            </div>
            <div className="w-3/4 h-2 bg-amber-200/70 rounded my-1" />
            <div className="w-2/3 h-2 bg-amber-200/70 rounded my-1" />
          </div>

          {/* Envelope Front Pocket & Side Triangular Folds */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div
              className="absolute inset-0 border-l-[4px] border-deep-ink brightness-95"
              style={{
                clipPath: 'polygon(0 0, 52% 50%, 0 100%)',
                backgroundColor: '#FDE68A',
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(180, 83, 9, 0.05) 0px, rgba(180, 83, 9, 0.05) 2px, transparent 2px, transparent 4px)',
              }}
            />
            <div
              className="absolute inset-0 border-r-[4px] border-deep-ink brightness-95"
              style={{
                clipPath: 'polygon(100% 0, 48% 50%, 100% 100%)',
                backgroundColor: '#FDE68A',
                backgroundImage:
                  'repeating-linear-gradient(-45deg, rgba(180, 83, 9, 0.05) 0px, rgba(180, 83, 9, 0.05) 2px, transparent 2px, transparent 4px)',
              }}
            />
            <div
              className="absolute inset-0 border-b-[4px] border-deep-ink shadow-inner"
              style={{
                clipPath: 'polygon(0 100%, 50% 42%, 100% 100%)',
                backgroundColor: '#FCD34D',
              }}
            />
            <svg viewBox="0 0 440 290" className="w-full h-full absolute inset-0">
              <path
                d="M0 0 L220 150 L440 0"
                fill="none"
                stroke="#1E1B4B"
                strokeWidth="3"
                opacity="0.35"
              />
              <path
                d="M0 290 L220 124 L440 290"
                fill="none"
                stroke="#1E1B4B"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Envelope Top V-Lid */}
          <div
            ref={envelopeTopLidRef}
            className="absolute inset-0 origin-top z-30"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className="w-full h-full brightness-105 relative"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 62%)',
                backgroundColor: '#FEF08A',
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(180, 83, 9, 0.05) 0px, rgba(180, 83, 9, 0.05) 2px, transparent 2px, transparent 4px)',
              }}
            />
            <svg
              viewBox="0 0 440 290"
              className="w-full h-full absolute inset-0 pointer-events-none"
            >
              <polygon
                points="2,2 438,2 220,178"
                fill="none"
                stroke="#1E1B4B"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            </svg>

            {/* Gold & Crimson Royal Wax Seal */}
            <div
              ref={waxSealStampRef}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-rose-500 via-red-600 to-rose-800 border-[3.5px] border-deep-ink shadow-lg absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-amber-200/60 flex items-center justify-center text-lg sm:text-xl">
                👑
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2. THE FULL-PAGE LETTER (SCROLLABLE WITH INTUITIVE PEEK) ================= */}
        <div
          ref={fullLetterSheetRef}
          className="w-full max-w-xl [@media(max-height:560px)]:max-w-2xl h-[88vh] sm:h-[86vh] [@media(max-height:560px)]:h-[96vh] max-h-[720px] bg-[#FFFDF7] border-[3.5px] sm:border-[4px] border-deep-ink rounded-3xl p-4 sm:p-7 [@media(max-height:560px)]:p-3 shadow-[8px_8px_0px_#1E1B4B] flex flex-col relative overflow-hidden z-30"
          style={{
            backgroundImage:
              'radial-gradient(rgba(217, 119, 6, 0.04) 1px, transparent 0), linear-gradient(to right, rgba(245, 158, 11, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 158, 11, 0.03) 1px, transparent 1px)',
            backgroundSize: '20px 20px, 40px 40px, 40px 40px',
          }}
        >
          {/* Header & Salutation (Handwriting typography) */}
          <div className="border-b-2 border-amber-900/15 pb-2.5 mb-2 [@media(max-height:560px)]:pb-1.5 [@media(max-height:560px)]:mb-1 flex-shrink-0">
            <span className="font-handwritten text-base sm:text-xl font-bold uppercase tracking-wider text-coral block">
              Final Birthday Keepsake ✨
            </span>
            <h2 className="font-handwritten text-2xl sm:text-4xl font-bold text-deep-ink mt-0.5 leading-tight">
              My Dearest Sister, My Love ❤️
            </h2>
          </div>

          {/* Main Body Area: Smooth scrollable letter with peek affordance */}
          <div className="relative flex-1 overflow-hidden min-h-0">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="w-full h-full overflow-y-auto pr-2 space-y-4 relative scroll-smooth overscroll-contain pointer-events-auto"
            >
              <p className="font-handwritten text-2xl sm:text-3xl text-deep-ink font-semibold leading-relaxed tracking-wide">
                I don&apos;t even know how to start, but first of all, happy birthday to you. ❤️
              </p>

              <p className="font-handwritten text-2xl sm:text-3xl text-deep-ink font-semibold leading-relaxed tracking-wide">
                You&apos;ve always been the best sister to me. Though it&apos;s only you, I&apos;ve never felt like I was missing anything because you&apos;ve always been there for me.
              </p>

              <p className="font-handwritten text-2xl sm:text-3xl text-deep-ink font-semibold leading-relaxed tracking-wide">
                Many times, I would think to myself, in what way can I actually pay you back? I thought about getting you something, maybe buying you gifts and all, but I couldn&apos;t really put my hands on anything that could actually repay you for everything you&apos;ve done.
              </p>

              <p className="font-handwritten text-2xl sm:text-3xl text-coral font-bold leading-relaxed tracking-wide">
                Then something struck my heart, and I realized that it&apos;s not really about how much I can give you, but about the gratitude and appreciation I have for you.
              </p>

              <p className="font-handwritten text-2xl sm:text-3xl text-deep-ink font-semibold leading-relaxed tracking-wide">
                You&apos;ve always been there for me, never asking for anything in return, but always giving everything you can.
              </p>

              <p className="font-handwritten text-2xl sm:text-3xl text-deep-ink font-semibold leading-relaxed tracking-wide">
                So, with the skills I&apos;ve learned, I decided to make this little something for you.
              </p>

              <p className="font-handwritten text-2xl sm:text-3xl text-deep-ink font-semibold leading-relaxed tracking-wide">
                It&apos;s nothing compared to what you&apos;ve done for me. It&apos;s nothing compared to the love you&apos;ve shown me. It&apos;s nothing compared to the care you&apos;ve had for me.
              </p>

              <p className="font-handwritten text-2xl sm:text-3xl text-coral font-bold leading-relaxed tracking-wide">
                But this is a little token from me to you, just to let you know how much I love and appreciate you.
              </p>

              <p className="font-handwritten text-2xl sm:text-3xl text-deep-ink font-semibold leading-relaxed tracking-wide">
                Happy birthday once again, my love. ❤️
              </p>

              <p className="font-handwritten text-2xl sm:text-3xl text-deep-ink font-semibold leading-relaxed tracking-wide">
                This is a new year for you, and I want you to enjoy it to the fullest. May God bless you, bless the work of your hands, and bless everything you&apos;re doing. May this new year bring you happiness, peace, and everything good that your heart desires.
              </p>

              <p className="font-handwritten text-2xl sm:text-3xl text-coral font-bold leading-relaxed tracking-wide">
                Thank you very much for everything. I love you. ❤️
              </p>

              {/* Footer Quote & Signature */}
              <div className="border-t-2 border-amber-900/15 pt-3 mt-4 space-y-1">
                <p className="font-handwritten text-2xl sm:text-3xl font-bold text-coral">
                  With love,
                </p>
                <p className="font-handwritten text-3xl sm:text-4xl font-bold text-deep-ink">
                  Godsfavour ❤️
                </p>
              </div>

              {/* Grand Finale Action Button */}
              <div className="pt-4 pb-6 flex justify-center">
                <button
                  onClick={handleProceedToFinale}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-yellow hover:bg-yellow-dark text-deep-ink border-[3.5px] border-deep-ink font-display font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-[4px_4px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-3 animate-bounce pointer-events-auto"
                >
                  <Sparkles className="w-5 h-5 text-coral" />
                  <span>Proceed to Grand Finale! 🎈</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bottom Peek Gradient & Scroll Cue */}
            {showScrollCue && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#FFFDF7] via-[#FFFDF7]/85 to-transparent flex items-end justify-center pb-2 z-10">
                <button
                  onClick={handleScrollDown}
                  className="pointer-events-auto px-4 py-1.5 rounded-full bg-yellow hover:bg-yellow-dark text-deep-ink border-2 border-deep-ink shadow-[2px_2px_0px_#1E1B4B] font-display font-extrabold text-xs flex items-center gap-1.5 animate-bounce transition-colors cursor-pointer"
                >
                  <span>Scroll to read more</span>
                  <ChevronDown className="w-3.5 h-3.5 text-deep-ink" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
