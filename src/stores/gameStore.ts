import { create } from 'zustand';
import type {
  GameMode,
  GameState,
  Stratagem,
  StratagemAttempt,
  Direction,
} from '../types';
import { getStreakMultiplier, calculateScore } from '../utils/scoring';

interface GameStore {
  // State
  mode: GameMode | null;
  state: GameState;
  queue: Stratagem[];
  currentIndex: number;
  currentInputIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  multiplier: number;
  attempts: StratagemAttempt[];
  currentAttemptStart: number;
  currentAttemptErrors: number;
  currentInputSequence: Direction[];
  timeRemainingMs: number;
  totalTimeMs: number;
  lives: number;
  survivalInterval: number;
  isPaused: boolean;

  // Actions
  setMode: (mode: GameMode) => void;
  setQueue: (queue: Stratagem[]) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  recordCorrectInput: (dir: Direction) => void;
  recordComboComplete: () => void;
  recordError: (dir: Direction) => void;
  loseLife: () => void;
  tickTimer: (deltaMs: number) => void;
  setTimeRemaining: (ms: number) => void;
  advanceSurvivalDifficulty: () => void;
  setState: (state: GameState) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode: null,
  state: 'idle',
  queue: [],
  currentIndex: 0,
  currentInputIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  multiplier: 1,
  attempts: [],
  currentAttemptStart: 0,
  currentAttemptErrors: 0,
  currentInputSequence: [],
  timeRemainingMs: 0,
  totalTimeMs: 0,
  lives: 3,
  survivalInterval: 8000,
  isPaused: false,

  setMode: (mode) => set({ mode }),
  setQueue: (queue) => set({ queue }),

  startGame: () =>
    set({
      state: 'playing',
      currentIndex: 0,
      currentInputIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      multiplier: 1,
      attempts: [],
      currentAttemptStart: performance.now(),
      currentAttemptErrors: 0,
      currentInputSequence: [],
      lives: 3,
      survivalInterval: 8000,
      isPaused: false,
    }),

  pauseGame: () => set({ isPaused: true, state: 'paused' }),
  resumeGame: () => set({ isPaused: false, state: 'playing' }),

  endGame: () => set({ state: 'game-over' }),

  resetGame: () =>
    set({
      state: 'idle',
      currentIndex: 0,
      currentInputIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      multiplier: 1,
      attempts: [],
      currentAttemptStart: 0,
      currentAttemptErrors: 0,
      currentInputSequence: [],
      timeRemainingMs: 0,
      totalTimeMs: 0,
      lives: 3,
      survivalInterval: 8000,
      isPaused: false,
    }),

  recordCorrectInput: (dir) =>
    set((s) => ({
      currentInputIndex: s.currentInputIndex + 1,
      currentInputSequence: [...s.currentInputSequence, dir],
    })),

  recordComboComplete: () => {
    const s = get();
    const current = s.queue[s.currentIndex];
    if (!current) return;

    const timeMs = performance.now() - s.currentAttemptStart;
    const newStreak = s.streak + 1;
    const newMultiplier = getStreakMultiplier(newStreak);
    const scoreBreakdown = calculateScore(timeMs, current.sequence.length, newMultiplier);

    const attempt: StratagemAttempt = {
      stratagemId: current.id,
      success: true,
      timeMs,
      errors: s.currentAttemptErrors,
      inputSequence: s.currentInputSequence,
      timestamp: Date.now(),
    };

    set({
      currentIndex: s.currentIndex + 1,
      currentInputIndex: 0,
      score: s.score + scoreBreakdown.total,
      streak: newStreak,
      bestStreak: Math.max(s.bestStreak, newStreak),
      multiplier: newMultiplier,
      attempts: [...s.attempts, attempt],
      currentAttemptStart: performance.now(),
      currentAttemptErrors: 0,
      currentInputSequence: [],
    });
  },

  recordError: (_dir) =>
    set((s) => ({
      streak: 0,
      multiplier: 1,
      currentInputIndex: 0,
      currentAttemptErrors: s.currentAttemptErrors + 1,
      currentInputSequence: [],
      attempts: s.currentAttemptErrors === 0
        ? s.attempts
        : s.attempts,
    })),

  loseLife: () => {
    const s = get();
    const newLives = s.lives - 1;
    if (newLives <= 0) {
      set({ lives: 0, state: 'game-over' });
    } else {
      set({ lives: newLives });
    }
  },

  tickTimer: (deltaMs) =>
    set((s) => {
      const newTime = s.timeRemainingMs - deltaMs;
      const newTotal = s.totalTimeMs + deltaMs;
      if (newTime <= 0) {
        return { timeRemainingMs: 0, totalTimeMs: newTotal, state: 'game-over' };
      }
      return { timeRemainingMs: newTime, totalTimeMs: newTotal };
    }),

  setTimeRemaining: (ms) => set({ timeRemainingMs: ms }),
  setState: (state) => set({ state }),

  advanceSurvivalDifficulty: () =>
    set((s) => ({
      survivalInterval: Math.max(2000, s.survivalInterval - 300),
    })),
}));
