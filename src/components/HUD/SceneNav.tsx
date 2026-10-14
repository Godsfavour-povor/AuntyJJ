import React from 'react';
import { useAdventure } from '../../context/AdventureContext';
import type { SceneId } from '../../types';

interface SceneStep {
  id: SceneId;
  label: string;
}

const SCENE_STEPS: SceneStep[] = [
  { id: 'scene_1_spark', label: 'The Spark' },
  { id: 'scene_2_scratch', label: 'The Mystery' },
  { id: 'scene_3_memories', label: 'Memories' },
  { id: 'scene_4_finale', label: 'Finale' },
];

export const SceneNav: React.FC = () => {
  const { currentScene, goToScene, candleExtinguished, scratchCompleted } = useAdventure();

  const getIsAccessible = (index: number): boolean => {
    // Allows forward navigation if previously unlocked, or free navigation if tested
    if (index === 0) return true;
    if (index === 1) return candleExtinguished || currentScene !== 'scene_1_spark';
    if (index === 2) return scratchCompleted || currentScene === 'scene_3_memories' || currentScene === 'scene_4_finale';
    if (index === 3) return currentScene === 'scene_4_finale';
    return false;
  };

  const currentIndex = SCENE_STEPS.findIndex(s => s.id === currentScene);

  return (
    <nav
      aria-label="Experience progression"
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-plum-900/60 backdrop-blur-md border border-gold-400/20 shadow-md shadow-black/30"
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
            className={`group relative flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-gold-400 ${
              isActive
                ? 'bg-gold-400/20 text-gold-300 font-semibold'
                : isPast
                ? 'text-ivory/80 hover:text-gold-300'
                : isUnlocked
                ? 'text-ivory/50 hover:text-ivory/80'
                : 'text-ivory/25 cursor-not-allowed'
            }`}
            title={`Go to ${step.label}`}
            aria-current={isActive ? 'step' : undefined}
          >
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-gold-400 ring-2 ring-gold-400/50 scale-125'
                  : isPast
                  ? 'bg-gold-400/70'
                  : 'bg-ivory/25'
              }`}
            />
            <span className="hidden sm:inline tracking-wider font-light">
              {step.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
