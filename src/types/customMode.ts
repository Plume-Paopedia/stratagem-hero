import type { StratagemCategory, StratagemTier } from './index';

export interface CustomModeConfig {
  name: string;
  timerType: 'none' | 'countdown' | 'countup' | 'survival';
  timerDuration: number; // in seconds, for countdown/survival
  lives: number; // 0 = unlimited
  errorBehavior: 'reset-streak' | 'lose-life' | 'time-penalty' | 'end-game';
  timePenaltyMs: number; // for time-penalty error behavior
  queueSource: 'all' | 'category' | 'tier' | 'custom';
  category?: StratagemCategory;
  tier?: StratagemTier;
  customStratagemIds?: string[];
  queueLength: number; // 0 = all matching
  shuffle: boolean;
  scoreMultiplier: number; // 0.5 - 3
}

export interface CustomModePreset {
  id: string;
  config: CustomModeConfig;
  createdAt: number;
}
