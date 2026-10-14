import React from 'react';

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
  tailPosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'left';
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  children,
  className = '',
  tailPosition = 'bottom-left',
}) => {
  return (
    <div className={`relative animate-comic-pop max-w-sm sm:max-w-md ${className}`}>
      {/* Comic Bubble Body */}
      <div className="relative z-10 bg-white border-[2.5px] border-deep-ink px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-3xl shadow-[4px_4px_0px_#1E1B4B] text-deep-ink font-sans text-sm sm:text-base leading-relaxed">
        {children}
      </div>

      {/* Comic Tail Indicator */}
      {tailPosition === 'bottom-left' && (
        <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-b-[2.5px] border-r-[2.5px] border-deep-ink transform rotate-45 z-20" />
      )}
      {tailPosition === 'bottom-right' && (
        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b-[2.5px] border-r-[2.5px] border-deep-ink transform rotate-45 z-20" />
      )}
      {tailPosition === 'left' && (
        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white border-b-[2.5px] border-l-[2.5px] border-deep-ink transform rotate-45 z-20" />
      )}
    </div>
  );
};
