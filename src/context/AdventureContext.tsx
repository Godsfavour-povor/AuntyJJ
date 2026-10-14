import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { SceneId, MemoryItem } from '../types';
import { useAudio } from '../audio/useAudio';

interface AdventureContextType {
  currentScene: SceneId;
  isAudioMuted: boolean;
  isAudioStarted: boolean;
  reducedMotion: boolean;
  candleExtinguished: boolean;
  scratchCompleted: boolean;
  exploredMemoryIds: string[];
  activeModalMemory: MemoryItem | null;
  letterOpened: boolean;
  celebrationFired: boolean;
  
  // Actions
  goToScene: (scene: SceneId) => void;
  toggleAudio: () => void;
  startAudioExperience: () => void;
  extinguishCandle: () => void;
  completeScratch: () => void;
  exploreMemory: (id: string) => void;
  openMemoryModal: (memory: MemoryItem) => void;
  closeMemoryModal: () => void;
  openLetter: () => void;
  fireCelebration: () => void;
  replayAdventure: () => void;
}

const AdventureContext = createContext<AdventureContextType | undefined>(undefined);

export const AdventureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScene, setCurrentScene] = useState<SceneId>('scene_1_spark');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isAudioStarted, setIsAudioStarted] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [candleExtinguished, setCandleExtinguished] = useState<boolean>(false);
  const [scratchCompleted, setScratchCompleted] = useState<boolean>(false);
  const [exploredMemoryIds, setExploredMemoryIds] = useState<string[]>([]);
  const [activeModalMemory, setActiveModalMemory] = useState<MemoryItem | null>(null);
  const [letterOpened, setLetterOpened] = useState<boolean>(false);
  const [celebrationFired, setCelebrationFired] = useState<boolean>(false);

  const audio = useAudio();

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const startAudioExperience = useCallback(() => {
    if (!isAudioStarted) {
      audio.unlockAudio();
      audio.startAmbient();
      setIsAudioStarted(true);
    }
  }, [audio, isAudioStarted]);

  const toggleAudio = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      audio.setMuted(next);
      return next;
    });
    startAudioExperience();
  }, [audio, startAudioExperience]);

  const goToScene = useCallback((scene: SceneId) => {
    setCurrentScene(scene);
    startAudioExperience();
  }, [startAudioExperience]);

  const extinguishCandle = useCallback(() => {
    if (candleExtinguished) return;
    setCandleExtinguished(true);
    startAudioExperience();
    audio.playCandleBlow();

    // After smoke & ember expansion, transition to Scene 2
    setTimeout(() => {
      goToScene('scene_2_scratch');
    }, 2400);
  }, [candleExtinguished, startAudioExperience, audio, goToScene]);

  const completeScratch = useCallback(() => {
    if (scratchCompleted) return;
    setScratchCompleted(true);
    audio.playCardReveal();
  }, [scratchCompleted, audio]);

  const exploreMemory = useCallback((id: string) => {
    setExploredMemoryIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const openMemoryModal = useCallback((memory: MemoryItem) => {
    setActiveModalMemory(memory);
    exploreMemory(memory.id);
    audio.playCardReveal();
  }, [audio, exploreMemory]);

  const closeMemoryModal = useCallback(() => {
    setActiveModalMemory(null);
  }, []);

  const openLetter = useCallback(() => {
    if (letterOpened) return;
    setLetterOpened(true);
    audio.playSealBreak();
  }, [letterOpened, audio]);

  const fireCelebration = useCallback(() => {
    setCelebrationFired(true);
    audio.playCelebration();
  }, [audio]);

  const replayAdventure = useCallback(() => {
    setCandleExtinguished(false);
    setScratchCompleted(false);
    setExploredMemoryIds([]);
    setActiveModalMemory(null);
    setLetterOpened(false);
    setCelebrationFired(false);
    setCurrentScene('scene_1_spark');
  }, []);

  return (
    <AdventureContext.Provider
      value={{
        currentScene,
        isAudioMuted,
        isAudioStarted,
        reducedMotion,
        candleExtinguished,
        scratchCompleted,
        exploredMemoryIds,
        activeModalMemory,
        letterOpened,
        celebrationFired,
        goToScene,
        toggleAudio,
        startAudioExperience,
        extinguishCandle,
        completeScratch,
        exploreMemory,
        openMemoryModal,
        closeMemoryModal,
        openLetter,
        fireCelebration,
        replayAdventure,
      }}
    >
      {children}
    </AdventureContext.Provider>
  );
};

export const useAdventure = (): AdventureContextType => {
  const context = useContext(AdventureContext);
  if (!context) {
    throw new Error('useAdventure must be used within an AdventureProvider');
  }
  return context;
};
