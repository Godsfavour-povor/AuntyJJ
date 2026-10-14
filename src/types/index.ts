export type SceneId = 
  | 'intro'
  | 'scene_1_spark'
  | 'scene_2_scratch'
  | 'scene_3_memories'
  | 'scene_4_finale';

export interface MemoryItem {
  id: string;
  title: string;
  date?: string;
  subtitle?: string;
  description: string;
  image?: string;
  imageAlt?: string;
  quote?: string;
  accentIcon?: 'sparkles' | 'heart' | 'star' | 'feather';
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
  subtitle: string;
  openingPrompt: string;
  hiddenMessage: string;
  scratchHint: string;
  memoriesPrompt: string;
  memories: MemoryItem[];
  letter: BirthdayLetter;
  audio: {
    enableProceduralAudio: boolean;
    bgMusicUrl?: string;
  };
}

export interface AdventureState {
  currentScene: SceneId;
  isAudioMuted: boolean;
  isAudioInitialized: boolean;
  reducedMotion: boolean;
  exploredMemoryIds: string[];
  activeModalMemory: MemoryItem | null;
  candleExtinguished: boolean;
  scratchCompleted: boolean;
  letterOpened: boolean;
  celebrationFired: boolean;
}
