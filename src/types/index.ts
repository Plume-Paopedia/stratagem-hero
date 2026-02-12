
export type Direction = 'up' | 'down' | 'left' | 'right';

export type StratagemCategory =
  | 'Patriotic Administration Center'
  | 'Orbital Cannons'
  | 'Hangar'
  | 'Bridge'
  | 'Engineering Bay'
  | 'Robotics Workshop'
  | 'General Stratagems'
  | 'Mission Stratagems';

export type StratagemTier = 'basic' | 'advanced' | 'expert';

export interface Stratagem {
  id: string;
  name: string;
  category: StratagemCategory;
  sequence: Direction[];
  cooldown: number;
  uses: number | 'infinite';
  description: string;
  icon: string;
  iconId: string;
  tier: StratagemTier;
}

export type GameMode =
  | 'free-practice'
  | 'time-attack'
  | 'accuracy'
  | 'survival'
  | 'quiz'
  | 'daily-challenge'
  | 'speed-run'
  | 'endless'
  | 'category-challenge'
  | 'boss-rush'
  | 'custom';

export type GameState = 'idle' | 'countdown' | 'playing' | 'paused' | 'game-over';

export type InputResult = 'correct' | 'wrong' | 'pending';

export interface StratagemAttempt {
  stratagemId: string;
  success: boolean;
  timeMs: number;
  errors: number;
  inputSequence: Direction[];
  timestamp: number;
}

export interface ScoreBreakdown {
  base: number;
  speedBonus: number;
  streakMultiplier: number;
  total: number;
}

export interface SessionStats {
  mode: GameMode;
  date: number;
  duration: number;
  attempts: StratagemAttempt[];
  totalScore: number;
  accuracy: number;
  bestStreak: number;
  averageTimeMs: number;
}

export interface StratagemStats {
  stratagemId: string;
  totalAttempts: number;
  successes: number;
  failures: number;
  bestTimeMs: number;
  averageTimeMs: number;
  errorsByPosition: number[];
}

export interface GlobalStats {
  totalSessions: number;
  totalPlayTimeMs: number;
  totalStratagemsCompleted: number;
  totalErrors: number;
  sessions: SessionStats[];
  stratagemStats: Record<string, StratagemStats>;
  bestScores: Record<GameMode, number>;
  dailyChallengeScores: Record<string, number>;
  directionErrorCounts: Record<Direction, number>;
}

export interface KeyBindings {
  up: string[];
  down: string[];
  left: string[];
  right: string[];
  confirm: string[];
  back: string[];
  restart: string[];
  pause: string[];
}

export interface UserSettings {
  masterVolume: number;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  keyBindings: KeyBindings;
  gamepadDeadzone: number;
  colorblindMode: 'default' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  highContrastMode: boolean;
  reducedMotion: boolean;
  timeAttackDuration: number;
  accuracyTargetCount: number;
  hasCompletedTutorial: boolean;
}

export type TimeAttackDuration = 60 | 90 | 120;

export type AccuracyTargetCount = 20 | 50 | 100;

export interface LeaderboardEntry {
  initials: string;
  score: number;
  bestStreak: number;
  date: number;
}

export type Leaderboards = Partial<Record<GameMode, LeaderboardEntry[]>>;

export type AppScreen =
  | 'menu'
  | 'mode-select'
  | 'stratagem-select'
  | 'category-select'
  | 'game'
  | 'game-over'
  | 'stats'
  | 'settings'
  | 'leaderboard'
  | 'achievements'
  | 'custom-builder'
  | 'help';
