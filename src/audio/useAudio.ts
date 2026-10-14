import { useCallback } from 'react';
import { soundEngine } from './SoundEngine';

export function useAudio() {
  const unlockAudio = useCallback(() => {
    soundEngine.unlock();
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    soundEngine.setMuted(muted);
  }, []);

  const startAmbient = useCallback(() => {
    soundEngine.startAmbientLoop();
  }, []);

  const stopAmbient = useCallback(() => {
    soundEngine.stopAmbientLoop();
  }, []);

  const playCandleBlow = useCallback(() => {
    soundEngine.playCandlePuff();
  }, []);

  const playScratchChime = useCallback(() => {
    soundEngine.playScratchChime();
  }, []);

  const playCardReveal = useCallback(() => {
    soundEngine.playCardReveal();
  }, []);

  const playSealBreak = useCallback(() => {
    soundEngine.playSealBreak();
  }, []);

  const playCelebration = useCallback(() => {
    soundEngine.playCelebrationArpeggio();
  }, []);

  return {
    unlockAudio,
    setMuted,
    startAmbient,
    stopAmbient,
    playCandleBlow,
    playScratchChime,
    playCardReveal,
    playSealBreak,
    playCelebration,
  };
}
