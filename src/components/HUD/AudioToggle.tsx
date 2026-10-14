import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';

export const AudioToggle: React.FC = () => {
  const { isAudioMuted, toggleAudio, isAudioStarted } = useAdventure();

  return (
    <button
      onClick={toggleAudio}
      className="group relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-plum-900/80 backdrop-blur-md border border-gold-400/25 hover:border-gold-400/60 text-ivory transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-400/50 shadow-lg shadow-black/40"
      aria-label={isAudioMuted ? "Unmute audio" : "Mute audio"}
      title={isAudioMuted ? "Sound is off — click to turn on" : "Sound is on — click to mute"}
    >
      {isAudioMuted ? (
        <VolumeX className="w-4 h-4 text-gold-400/70 group-hover:text-gold-400 transition-colors" />
      ) : (
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
          {isAudioStarted && (
            <span className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-2 bg-gold-400/80 animate-pulse" />
              <span className="w-0.5 h-3 bg-gold-400 animate-pulse delay-75" />
              <span className="w-0.5 h-1.5 bg-gold-400/80 animate-pulse delay-150" />
            </span>
          )}
        </div>
      )}
      <span className="text-xs tracking-wider uppercase font-medium text-ivory/80 group-hover:text-ivory">
        {isAudioMuted ? "Sound Off" : "Atmosphere"}
      </span>
    </button>
  );
};
