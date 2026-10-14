import React, { useEffect } from 'react';
import { AdventureProvider, useAdventure } from './context/AdventureContext';
import { AudioToggle } from './components/HUD/AudioToggle';
import { SceneNav } from './components/HUD/SceneNav';
import { MemoryModal } from './components/Modal/MemoryModal';
import { BirthdayPortal } from './scenes/BirthdayPortal/BirthdayPortal';
import { WishMakingParty } from './scenes/WishMakingParty/WishMakingParty';
import { DiscoveryRoom } from './scenes/DiscoveryRoom/DiscoveryRoom';
import { BirthdayFinale } from './scenes/BirthdayFinale/BirthdayFinale';

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
    <div className="relative min-h-screen w-full bg-cream text-deep-ink font-sans overflow-x-hidden selection:bg-yellow selection:text-deep-ink">
      {/* Global Fixed HUD (Responsive & notch-safe) */}
      <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between p-3.5 sm:p-6 pointer-events-none">
        <div className="pointer-events-auto">
          <AudioToggle />
        </div>
        <div className="pointer-events-auto">
          <SceneNav />
        </div>
      </header>

      {/* Main Interactive Scene Switcher */}
      <main className="w-full min-h-screen">
        {currentScene === 'scene_1_portal' && <BirthdayPortal />}
        {currentScene === 'scene_2_party' && <WishMakingParty />}
        {currentScene === 'scene_3_discovery' && <DiscoveryRoom />}
        {currentScene === 'scene_4_finale' && <BirthdayFinale />}
      </main>

      {/* Global Focused Keepsake Modal */}
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
