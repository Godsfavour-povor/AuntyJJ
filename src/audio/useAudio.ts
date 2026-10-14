import { useCallback } from 'react';
import { soundEngine } from './SoundEngine';

export function useAudio() {
  const unlockAudio = useCallback(() => {
    soundEngine.unlock();
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    soundEngine.setMuted(muted);
  }, []);

  const startMusic = useCallback(() => {
    soundEngine.startMusicLoop();
  }, []);

  const stopMusic = useCallback(() => {
    soundEngine.stopMusicLoop();
  }, []);

  const playPop = useCallback(() => {
    soundEngine.playCartoonPop();
  }, []);

  const playGreeting = useCallback(() => {
    soundEngine.playPipGreeting();
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

  const playCardReveal = useCallback(() => {
    soundEngine.playCardReveal();
  }, []);

  const playFinaleFanfare = useCallback(() => {
    soundEngine.playFinaleFanfare();
  }, []);

  return {
    unlockAudio,
    setMuted,
    startMusic,
    stopMusic,
    playPop,
    playGreeting,
    playCandleBlow,
    playPartyHorn,
    playScratchChime,
    playCardReveal,
    playFinaleFanfare,
  };
}
