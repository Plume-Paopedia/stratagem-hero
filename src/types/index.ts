/** Directional input for stratagem combos */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** Categories matching in-game stratagem groupings */
export type StratagemCategory =
  | 'Patriotic Administration Center'
  | 'Orbital Cannons'
  | 'Hangar'
  | 'Bridge'
  | 'Engineering Bay'
  | 'Robotics Workshop'
  | 'General Stratagems'
  | 'Mission Stratagems';

/** Difficulty tier based on combo length */
export type StratagemTier = 'basic' | 'advanced' | 'expert';

/** A single stratagem definition */
export interface Stratagem {
  id: string;
  name: string;
  category: StratagemCategory;
  sequence: Direction[];
  cooldown: number;
  uses: number | 'infinite';
  description: string;
  icon: string;
  tier: StratagemTier;
}

/** Available game modes */
export type GameMode =
  | 'free-practice'
  | 'time-attack'
  | 'accuracy'
  | 'survival'
  | 'quiz'
  | 'daily-challenge';

/** Game states */
export type GameState = 'idle' | 'countdown' | 'playing' | 'paused' | 'game-over';

/** Input result for a single direction */
export type InputResult = 'correct' | 'wrong' | 'pending';

/** Result for a completed stratagem attempt */
export interface StratagemAttempt {
  stratagemId: string;
  success: boolean;
  timeMs: number;
  errors: number;
  inputSequence: Direction[];
  timestamp: number;
}

/** Score breakdown */
export interface ScoreBreakdown {
  base: number;
  speedBonus: number;
  streakMultiplier: number;
  total: number;
}

/** Session statistics */
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

/** Per-stratagem statistics */
export interface StratagemStats {
  stratagemId: string;
  totalAttempts: number;
  successes: number;
  failures: number;
  bestTimeMs: number;
  averageTimeMs: number;
  errorsByPosition: number[];
}

/** Global persistent statistics */
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

/** Key binding configuration */
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

/** User settings */
export interface UserSettings {
  masterVolume: number;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  keyBindings: KeyBindings;
  gamepadDeadzone: number;
  colorblindMode: boolean;
  reducedMotion: boolean;
  timeAttackDuration: number;
  accuracyTargetCount: number;
}

/** Time attack duration options */
export type TimeAttackDuration = 60 | 90 | 120;

/** Accuracy target count options */
export type AccuracyTargetCount = 20 | 50 | 100;

/** A single leaderboard entry */
export interface LeaderboardEntry {
  initials: string;
  score: number;
  bestStreak: number;
  date: number;
}

/** All leaderboards, keyed by game mode */
export type Leaderboards = Partial<Record<GameMode, LeaderboardEntry[]>>;

/** App screen/route */
export type AppScreen =
  | 'menu'
  | 'mode-select'
  | 'stratagem-select'
  | 'game'
  | 'game-over'
  | 'stats'
  | 'settings'
  | 'leaderboard';
