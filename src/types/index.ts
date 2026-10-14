export type SceneId = 
  | 'scene_1_portal'
  | 'scene_2_party'
  | 'scene_3_discovery'
  | 'scene_4_finale';

export type CharacterMood = 
  | 'idle'
  | 'curious'
  | 'surprised'
  | 'happy'
  | 'wishing'
  | 'celebrating'
  | 'pointing';

export interface MemoryItem {
  id: string;
  title: string;
  badge: string;
  funnySubtitle: string;
  description: string;
  pipComment: string;
  accentColor: 'coral' | 'turquoise' | 'yellow' | 'lilac';
  iconType: 'trophy' | 'polaroid' | 'origami' | 'star';
}

export interface BirthdayLetter {
  heading: string;
  salutation: string;
  paragraphs: string[];
  closing: string;
  signature: string;
}

export interface BirthdayConfig {
  sisterName: string;
  brotherName: string;
  portalGreeting: string;
  portalPrompt: string;
  wishIntro: string;
  wishSilentPrompt: string;
  scratchTitle: string;
  scratchHint: string;
  scratchSecretMessage: string;
  memories: MemoryItem[];
  letter: BirthdayLetter;
  audio: {
    enableProceduralAudio: boolean;
  };
}

export interface AdventureState {
  currentScene: SceneId;
  characterMood: CharacterMood;
  isAudioMuted: boolean;
  isAudioStarted: boolean;
  reducedMotion: boolean;
  wishStage: 'intro' | 'making_wish' | 'blow_candles' | 'candles_blown';
  scratchCompleted: boolean;
  exploredMemoryIds: string[];
  activeModalMemory: MemoryItem | null;
  letterOpened: boolean;
  celebrationFired: boolean;
}
