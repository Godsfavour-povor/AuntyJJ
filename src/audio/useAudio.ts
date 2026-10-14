import { useCallback } from 'react';
import { soundEngine } from './SoundEngine';
import type { SceneId } from '../types';

export function useAudio() {
  const unlockAudio = useCallback(() => {
    soundEngine.unlock();
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    soundEngine.setMuted(muted);
  }, []);

  const startMusic = useCallback(() => {
    soundEngine.startMusic();
  }, []);

  const stopMusic = useCallback(() => {
    soundEngine.stopMusic();
  }, []);

  const setScene = useCallback((scene: SceneId) => {
    soundEngine.setScene(scene);
  }, []);

  const duckMusic = useCallback((duck: boolean) => {
    soundEngine.duckMusic(duck);
  }, []);

  const playPop = useCallback(() => {
    soundEngine.playPop();
  }, []);

  const playFootstep = useCallback(() => {
    soundEngine.playFootstep();
  }, []);

  const playCollect = useCallback(() => {
    soundEngine.playCollect();
  }, []);

  const playGreeting = useCallback(() => {
    soundEngine.playGreeting();
  }, []);

  const playCandleBlow = useCallback(() => {
    soundEngine.playCandlePuff();
  }, []);

  const playPartyHorn = useCallback(() => {
    soundEngine.playPartyHorn();
  }, []);

  const playScratchChime = useCallback(() => {
    soundEngine.playScratchChime();
  }, []);

  const playFinaleFanfare = useCallback(() => {
    soundEngine.playFinaleFanfare();
  }, []);

  const playCardReveal = useCallback(() => {
    soundEngine.playCollect();
  }, []);

  return {
    unlockAudio,
    setMuted,
    startMusic,
    stopMusic,
    setScene,
    duckMusic,
    playPop,
    playFootstep,
    playCollect,
    playCardReveal,
    playGreeting,
    playCandleBlow,
    playPartyHorn,
    playScratchChime,
    playFinaleFanfare,
  };
}
