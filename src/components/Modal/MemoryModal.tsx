import React, { useEffect } from 'react';
import { X, Award, Image, Bookmark, Sparkles } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';

export const MemoryModal: React.FC = () => {
  const { activeModalMemory, closeMemoryModal } = useAdventure();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMemoryModal();
      }
    };
    if (activeModalMemory) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalMemory, closeMemoryModal]);

  if (!activeModalMemory) return null;

  const renderIcon = () => {
    switch (activeModalMemory.iconType) {
      case 'trophy':
        return <Award className="w-8 h-8 text-yellow-dark" />;
      case 'polaroid':
        return <Image className="w-8 h-8 text-coral" />;
      case 'origami':
        return <Bookmark className="w-8 h-8 text-turquoise-dark" />;
      default:
        return <Sparkles className="w-8 h-8 text-lilac-dark" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-deep-ink/60 backdrop-blur-sm transition-all duration-300 animate-fadeIn"
      onClick={closeMemoryModal}
    >
      <div
        className="relative w-full max-w-lg bg-cream border-[3px] border-deep-ink rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1E1B4B] animate-comic-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeMemoryModal}
          className="absolute top-4 right-4 p-2 rounded-full bg-white border-2 border-deep-ink hover:bg-coral hover:text-white transition-all shadow-[2px_2px_0px_#1E1B4B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus:outline-none"
          aria-label="Close memory modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Accent Icon Circle */}
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-deep-ink shadow-[3px_3px_0px_#1E1B4B] flex items-center justify-center">
            {renderIcon()}
          </div>

          {/* Badge */}
          <span className="inline-block px-3 py-1 rounded-full bg-yellow border border-deep-ink text-xs font-display font-bold uppercase tracking-wider text-deep-ink">
            {activeModalMemory.badge}
          </span>

          {/* Title */}
          <h2
            id="memory-title"
            className="text-2xl sm:text-3xl font-display font-bold text-deep-ink tracking-wide"
          >
            {activeModalMemory.title}
          </h2>

          <p className="text-xs uppercase font-sans font-semibold tracking-wider text-coral">
            {activeModalMemory.funnySubtitle}
          </p>

          <div className="w-16 h-1 bg-deep-ink rounded-full my-2" />

          {/* Description */}
          <p className="text-sm sm:text-base text-deep-ink/90 leading-relaxed font-sans max-w-md">
            {activeModalMemory.description}
          </p>

          {/* Pip's comic commentary */}
          <div className="mt-4 p-3.5 rounded-2xl bg-white border-2 border-deep-ink text-xs sm:text-sm font-sans font-medium text-deep-ink shadow-[2px_2px_0px_#1E1B4B] flex items-center gap-2 text-left">
            <span className="text-xl">💬</span>
            <span className="italic">
              <strong>Pip says:</strong> &ldquo;{activeModalMemory.pipComment}&rdquo;
            </span>
          </div>

          {/* Close CTA */}
          <button
            onClick={closeMemoryModal}
            className="mt-4 px-6 py-2.5 rounded-full bg-turquoise hover:bg-turquoise-dark text-deep-ink hover:text-white border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] hover:shadow-[1px_1px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            Got It! Keep Exploring ✨
          </button>
        </div>
      </div>
    </div>
  );
};
