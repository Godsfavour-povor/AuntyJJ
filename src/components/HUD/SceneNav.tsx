import React from 'react';
import { useAdventure } from '../../context/AdventureContext';
import type { SceneId } from '../../types';

interface SceneStep {
  id: SceneId;
  label: string;
  emoji: string;
}

const SCENE_STEPS: SceneStep[] = [
  { id: 'scene_1_portal', label: 'Portal', emoji: '🎁' },
  { id: 'scene_2_party', label: 'Party', emoji: '🎂' },
  { id: 'scene_3_discovery', label: 'Discovery', emoji: '🔍' },
  { id: 'scene_4_finale', label: 'Finale', emoji: '🎈' },
];

export const SceneNav: React.FC = () => {
  const { currentScene, goToScene, wishStage, scratchCompleted } = useAdventure();

  const getIsAccessible = (index: number): boolean => {
    if (index === 0) return true;
    if (index === 1) return wishStage === 'candles_blown' || currentScene !== 'scene_1_portal';
    if (index === 2) return scratchCompleted || currentScene === 'scene_3_discovery' || currentScene === 'scene_4_finale';
    if (index === 3) return currentScene === 'scene_4_finale';
    return false;
  };

  const currentIndex = SCENE_STEPS.findIndex((s) => s.id === currentScene);

  return (
    <nav
      aria-label="Adventure progression"
      className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-full bg-white/95 border-2 border-deep-ink shadow-[3px_3px_0px_#1E1B4B]"
    >
      {SCENE_STEPS.map((step, idx) => {
        const isActive = step.id === currentScene;
        const isPast = idx < currentIndex;
        const isUnlocked = getIsAccessible(idx);

        return (
          <button
            key={step.id}
            onClick={() => isUnlocked && goToScene(step.id)}
            disabled={!isUnlocked}
            className={`group relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-display font-semibold transition-all duration-200 focus:outline-none ${
              isActive
                ? 'bg-yellow text-deep-ink border border-deep-ink shadow-sm'
                : isPast
                ? 'text-deep-ink/80 hover:text-coral'
                : isUnlocked
                ? 'text-deep-ink/50 hover:text-deep-ink'
                : 'text-deep-ink/25 cursor-not-allowed'
            }`}
            title={`Go to ${step.label}`}
            aria-current={isActive ? 'step' : undefined}
          >
            <span>{step.emoji}</span>
            <span className="hidden sm:inline">
              {step.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
