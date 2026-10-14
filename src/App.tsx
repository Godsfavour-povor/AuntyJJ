import React, { useEffect } from 'react';
import { AdventureProvider, useAdventure } from './context/AdventureContext';
import { AudioToggle } from './components/HUD/AudioToggle';
import { SceneNav } from './components/HUD/SceneNav';
import { MemoryModal } from './components/Modal/MemoryModal';
import { Scene1Spark } from './scenes/Scene1Spark/Scene1Spark';
import { Scene2Scratch } from './scenes/Scene2Scratch/Scene2Scratch';
import { Scene3Memories } from './scenes/Scene3Memories/Scene3Memories';
import { Scene4Finale } from './scenes/Scene4Finale/Scene4Finale';

const AdventureContent: React.FC = () => {
  const { currentScene, startAudioExperience } = useAdventure();

  // Wake up Web Audio on first interaction anywhere on page
  useEffect(() => {
    const handleFirstGesture = () => {
      startAudioExperience();
    };
    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [startAudioExperience]);

  return (
    <div className="relative min-h-screen w-full bg-plum-950 text-ivory font-sans overflow-x-hidden selection:bg-gold-400 selection:text-plum-950">
      {/* Global Fixed HUD (Safe for iOS notch and Android status bar) */}
      <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between p-4 sm:p-6 pointer-events-none">
        <div className="pointer-events-auto">
          <AudioToggle />
        </div>
        <div className="pointer-events-auto">
          <SceneNav />
        </div>
      </header>

      {/* Main Interactive Scene Switcher */}
      <main className="w-full min-h-screen">
        {currentScene === 'scene_1_spark' && <Scene1Spark />}
        {currentScene === 'scene_2_scratch' && <Scene2Scratch />}
        {currentScene === 'scene_3_memories' && <Scene3Memories />}
        {currentScene === 'scene_4_finale' && <Scene4Finale />}
      </main>

      {/* Global Focused Memory Modal */}
      <MemoryModal />
    </div>
  );
};

export default function App() {
  return (
    <AdventureProvider>
      <AdventureContent />
    </AdventureProvider>
  );
}
