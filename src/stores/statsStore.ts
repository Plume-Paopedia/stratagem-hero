import { create } from 'zustand';
import type { GlobalStats, SessionStats, StratagemStats, Direction, GameMode } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const STORAGE_KEY = 'hd2-stats';

const defaultStats: GlobalStats = {
  totalSessions: 0,
  totalPlayTimeMs: 0,
  totalStratagemsCompleted: 0,
  totalErrors: 0,
  sessions: [],
  stratagemStats: {},
  bestScores: {} as Record<GameMode, number>,
  dailyChallengeScores: {},
  directionErrorCounts: { up: 0, down: 0, left: 0, right: 0 },
};

interface StatsStore extends GlobalStats {
  recordSession: (session: SessionStats) => void;
  recordDirectionError: (expected: Direction, actual: Direction) => void;
  getStratagemStats: (id: string) => StratagemStats | undefined;
  clearAllStats: () => void;
}

export const useStatsStore = create<StatsStore>((set, get) => {
  const saved = loadFromStorage<GlobalStats>(STORAGE_KEY, defaultStats);

  const persist = () => {
    const s = get();
    saveToStorage<GlobalStats>(STORAGE_KEY, {
      totalSessions: s.totalSessions,
      totalPlayTimeMs: s.totalPlayTimeMs,
      totalStratagemsCompleted: s.totalStratagemsCompleted,
      totalErrors: s.totalErrors,
      sessions: s.sessions.slice(-100), // Keep last 100 sessions
      stratagemStats: s.stratagemStats,
      bestScores: s.bestScores,
      dailyChallengeScores: s.dailyChallengeScores,
      directionErrorCounts: s.directionErrorCounts,
    });
  };

  return {
    ...defaultStats,
    ...saved,

    recordSession: (session) => {
      set((s) => {
        const newStratagemStats = { ...s.stratagemStats };

        for (const attempt of session.attempts) {
          const existing = newStratagemStats[attempt.stratagemId] ?? {
            stratagemId: attempt.stratagemId,
            totalAttempts: 0,
            successes: 0,
            failures: 0,
            bestTimeMs: Infinity,
            averageTimeMs: 0,
            errorsByPosition: [],
          };

          const updated: StratagemStats = {
            ...existing,
            totalAttempts: existing.totalAttempts + 1,
            successes: existing.successes + (attempt.success ? 1 : 0),
            failures: existing.failures + (attempt.success ? 0 : 1),
            bestTimeMs: attempt.success
              ? Math.min(existing.bestTimeMs, attempt.timeMs)
              : existing.bestTimeMs,
            averageTimeMs: attempt.success
              ? (existing.averageTimeMs * existing.successes + attempt.timeMs) /
                (existing.successes + 1)
              : existing.averageTimeMs,
          };

          newStratagemStats[attempt.stratagemId] = updated;
        }

        const completedCount = session.attempts.filter((a) => a.success).length;
        const errorCount = session.attempts.reduce((sum, a) => sum + a.errors, 0);

        const newBestScores = { ...s.bestScores };
        if (session.totalScore > (newBestScores[session.mode] ?? 0)) {
          newBestScores[session.mode] = session.totalScore;
        }

        return {
          totalSessions: s.totalSessions + 1,
          totalPlayTimeMs: s.totalPlayTimeMs + session.duration,
          totalStratagemsCompleted: s.totalStratagemsCompleted + completedCount,
          totalErrors: s.totalErrors + errorCount,
          sessions: [...s.sessions, session],
          stratagemStats: newStratagemStats,
          bestScores: newBestScores,
        };
      });
      persist();
    },

    recordDirectionError: (expected, _actual) => {
      set((s) => ({
        directionErrorCounts: {
          ...s.directionErrorCounts,
          [expected]: s.directionErrorCounts[expected] + 1,
        },
      }));
      persist();
    },

    getStratagemStats: (id) => get().stratagemStats[id],

    clearAllStats: () => {
      saveToStorage(STORAGE_KEY, defaultStats);
      set(defaultStats);
    },
  };
});
