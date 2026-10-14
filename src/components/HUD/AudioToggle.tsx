import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';

export const AudioToggle: React.FC = () => {
  const { isAudioMuted, toggleAudio, isAudioStarted } = useAdventure();

  return (
    <button
      onClick={toggleAudio}
      className="group relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border-2 border-deep-ink text-deep-ink shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-coral"
      aria-label={isAudioMuted ? "Unmute cheerful party audio" : "Mute audio"}
      title={isAudioMuted ? "Audio is muted — click to unmute" : "Music is playing — click to mute"}
    >
      {isAudioMuted ? (
        <VolumeX className="w-4 h-4 text-coral" />
      ) : (
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-turquoise-dark group-hover:scale-110 transition-transform" />
          {isAudioStarted && (
            <span className="flex items-end gap-0.5 h-3">
              <span className="w-1 h-2 bg-coral rounded-full animate-bounce" />
              <span className="w-1 h-3 bg-yellow-dark rounded-full animate-bounce delay-75" />
              <span className="w-1 h-1.5 bg-turquoise rounded-full animate-bounce delay-150" />
            </span>
          )}
        </div>
      )}
      <span className="text-xs font-display font-semibold tracking-wider text-deep-ink">
        {isAudioMuted ? "Sound Off" : "Music Box"}
      </span>
    </button>
  );
};
