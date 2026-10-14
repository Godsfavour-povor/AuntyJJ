import React, { useEffect } from 'react';
import { X, Sparkles, Heart, Star, Feather } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';

export const MemoryModal: React.FC = () => {
  const { activeModalMemory, closeMemoryModal } = useAdventure();

  // Handle ESC key
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
    switch (activeModalMemory.accentIcon) {
      case 'sparkles':
        return <Sparkles className="w-6 h-6 text-gold-400 animate-pulse" />;
      case 'heart':
        return <Heart className="w-6 h-6 text-rose-400 animate-pulse" />;
      case 'feather':
        return <Feather className="w-6 h-6 text-gold-300 animate-pulse" />;
      default:
        return <Star className="w-6 h-6 text-amber-400 animate-pulse" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-plum-950/85 backdrop-blur-xl transition-all duration-500 animate-fadeIn"
      onClick={closeMemoryModal}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-b from-plum-800/90 to-plum-900/95 border border-gold-400/35 p-6 sm:p-8 shadow-2xl shadow-black/80 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner filigree */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-gold-400/40 rounded-tl-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-gold-400/40 rounded-tr-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-gold-400/40 rounded-bl-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-gold-400/40 rounded-br-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeMemoryModal}
          className="absolute top-4 right-4 p-2 rounded-full bg-plum-900/80 hover:bg-gold-400/20 text-ivory/70 hover:text-gold-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
          aria-label="Close memory modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {/* Accent icon container */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400/20 to-amber-500/10 border border-gold-400/30 flex items-center justify-center shadow-inner">
            {renderIcon()}
          </div>

          {/* Subtitle & Date Badge */}
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold-400/80 font-medium">
            <span>{activeModalMemory.subtitle || 'Memory'}</span>
            {activeModalMemory.date && (
              <>
                <span className="w-1 h-1 rounded-full bg-gold-400/50" />
                <span className="text-ivory/60">{activeModalMemory.date}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h2
            id="memory-title"
            className="text-2xl sm:text-3xl font-serif font-bold text-ivory tracking-wide"
          >
            {activeModalMemory.title}
          </h2>

          {/* Decorative Divider */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

          {/* Description */}
          <p className="text-sm sm:text-base text-ivory/85 leading-relaxed font-sans max-w-md pt-2">
            {activeModalMemory.description}
          </p>

          {/* Optional Sister Quote */}
          {activeModalMemory.quote && (
            <div className="mt-4 p-4 rounded-xl bg-plum-950/50 border border-gold-400/15 italic font-serif text-sm sm:text-base text-gold-300/90 max-w-sm">
              &ldquo;{activeModalMemory.quote}&rdquo;
            </div>
          )}

          {/* Dismiss button */}
          <button
            onClick={closeMemoryModal}
            className="mt-4 px-6 py-2.5 rounded-full bg-gold-400/20 hover:bg-gold-400/30 text-gold-300 border border-gold-400/40 text-xs tracking-widest uppercase font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400"
          >
            Keep Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
