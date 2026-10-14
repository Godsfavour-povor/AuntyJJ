import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { SceneId, CharacterMood, MemoryItem } from '../types';
import { useAudio } from '../audio/useAudio';

interface AdventureContextType {
  currentScene: SceneId;
  characterMood: CharacterMood;
  wishStage: 'intro' | 'making_wish' | 'blow_candles' | 'candles_blown';
  isAudioMuted: boolean;
  isAudioStarted: boolean;
  reducedMotion: boolean;
  scratchCompleted: boolean;
  exploredMemoryIds: string[];
  activeModalMemory: MemoryItem | null;
  letterOpened: boolean;
  celebrationFired: boolean;

  // Actions
  goToScene: (scene: SceneId) => void;
  setCharacterMood: (mood: CharacterMood) => void;
  setWishStage: (stage: 'intro' | 'making_wish' | 'blow_candles' | 'candles_blown') => void;
  toggleAudio: () => void;
  startAudioExperience: () => void;
  extinguishCandles: () => void;
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
  const [currentScene, setCurrentScene] = useState<SceneId>('scene_1_portal');
  const [characterMood, setCharacterMood] = useState<CharacterMood>('happy');
  const [wishStage, setWishStage] = useState<'intro' | 'making_wish' | 'blow_candles' | 'candles_blown'>('intro');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isAudioStarted, setIsAudioStarted] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [scratchCompleted, setScratchCompleted] = useState<boolean>(false);
  const [exploredMemoryIds, setExploredMemoryIds] = useState<string[]>([]);
  const [activeModalMemory, setActiveModalMemory] = useState<MemoryItem | null>(null);
  const [letterOpened, setLetterOpened] = useState<boolean>(false);
  const [celebrationFired, setCelebrationFired] = useState<boolean>(false);

  const audio = useAudio();

  // Reduced motion preference
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
      audio.startMusic();
      setIsAudioStarted(true);
    }
  }, [audio, isAudioStarted]);

  const toggleAudio = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      audio.setMuted(next);
      return next;
    });
  }, [audio]);

  const goToScene = useCallback((scene: SceneId) => {
    setCurrentScene(scene);
    startAudioExperience();
    audio.playPop();

    // Scene-specific character reaction
    if (scene === 'scene_2_party') {
      setCharacterMood('curious');
      setWishStage('intro');
    } else if (scene === 'scene_3_discovery') {
      setCharacterMood('pointing');
    } else if (scene === 'scene_4_finale') {
      setCharacterMood('celebrating');
    }
  }, [audio, startAudioExperience]);

  const extinguishCandles = useCallback(() => {
    if (wishStage === 'candles_blown') return;
    setWishStage('candles_blown');
    setCharacterMood('celebrating');
    audio.playCandleBlow();
    setTimeout(() => {
      audio.playPartyHorn();
    }, 350);
  }, [wishStage, audio]);

  const completeScratch = useCallback(() => {
    if (scratchCompleted) return;
    setScratchCompleted(true);
    setCharacterMood('celebrating');
    audio.playCardReveal();
  }, [scratchCompleted, audio]);

  const exploreMemory = useCallback((id: string) => {
    setExploredMemoryIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const openMemoryModal = useCallback((memory: MemoryItem) => {
    setActiveModalMemory(memory);
    exploreMemory(memory.id);
    setCharacterMood('happy');
    audio.playPop();
  }, [audio, exploreMemory]);

  const closeMemoryModal = useCallback(() => {
    setActiveModalMemory(null);
  }, []);

  const openLetter = useCallback(() => {
    if (letterOpened) return;
    setLetterOpened(true);
    setCharacterMood('celebrating');
    audio.playCardReveal();
  }, [letterOpened, audio]);

  const fireCelebration = useCallback(() => {
    setCelebrationFired(true);
    setCharacterMood('celebrating');
    audio.playFinaleFanfare();
  }, [audio]);

  const replayAdventure = useCallback(() => {
    setCurrentScene('scene_1_portal');
    setCharacterMood('happy');
    setWishStage('intro');
    setScratchCompleted(false);
    setExploredMemoryIds([]);
    setActiveModalMemory(null);
    setLetterOpened(false);
    setCelebrationFired(false);
    audio.playPop();
  }, [audio]);

  return (
    <AdventureContext.Provider
      value={{
        currentScene,
        characterMood,
        wishStage,
        isAudioMuted,
        isAudioStarted,
        reducedMotion,
        scratchCompleted,
        exploredMemoryIds,
        activeModalMemory,
        letterOpened,
        celebrationFired,
        goToScene,
        setCharacterMood,
        setWishStage,
        toggleAudio,
        startAudioExperience,
        extinguishCandles,
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
