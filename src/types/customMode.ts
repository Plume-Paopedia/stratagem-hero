import type { StratagemCategory, StratagemTier } from './index';

export interface CustomModeConfig {
  name: string;
  timerType: 'none' | 'countdown' | 'countup' | 'survival';
  timerDuration: number;
  lives: number;
  errorBehavior: 'reset-streak' | 'lose-life' | 'time-penalty' | 'end-game';
  timePenaltyMs: number;
  queueSource: 'all' | 'category' | 'tier' | 'custom';
  category?: StratagemCategory;
  tier?: StratagemTier;
  customStratagemIds?: string[];
  queueLength: number;
  shuffle: boolean;
  scoreMultiplier: number;
}

export interface CustomModePreset {
  id: string;
  config: CustomModeConfig;
  createdAt: number;
}
