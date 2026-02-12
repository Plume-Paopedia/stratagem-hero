import type { GameMode } from '../types';

export interface ModeDisplayConfig {
  showLives: boolean;
  showProgress: boolean;
  showPenalty: boolean;
  showDistance: boolean;
  showBossIndicator: boolean;
  hideSequence: boolean;
  quizHint: boolean;
}

const defaultDisplay: ModeDisplayConfig = {
  showLives: false,
  showProgress: false,
  showPenalty: false,
  showDistance: false,
  showBossIndicator: false,
  hideSequence: false,
  quizHint: false,
};

export const modeDisplayConfig: Record<GameMode, ModeDisplayConfig> = {
  'free-practice': { ...defaultDisplay },
  'time-attack': { ...defaultDisplay },
  'accuracy': { ...defaultDisplay, showProgress: true },
  'survival': { ...defaultDisplay },
  'quiz': { ...defaultDisplay, showLives: true, hideSequence: true, quizHint: true },
  'daily-challenge': { ...defaultDisplay },
  'speed-run': { ...defaultDisplay, showProgress: true, showPenalty: true },
  'endless': { ...defaultDisplay, showDistance: true },
  'category-challenge': { ...defaultDisplay, showProgress: true },
  'boss-rush': { ...defaultDisplay, showBossIndicator: true },
  'custom': { ...defaultDisplay },
};
