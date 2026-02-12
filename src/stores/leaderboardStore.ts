import { create } from 'zustand';
import type { GameMode, LeaderboardEntry, Leaderboards } from '../types';
import { loadVersioned, saveVersioned } from '../utils/storage';

const STORAGE_KEY = 'hd2-leaderboard';
const SCHEMA_VERSION = 1;
const MAX_ENTRIES = 10;

interface LeaderboardStore {
  boards: Leaderboards;
  qualifiesForLeaderboard: (mode: GameMode, score: number) => boolean;
  getRankForScore: (mode: GameMode, score: number) => number | null;
  addEntry: (mode: GameMode, entry: LeaderboardEntry) => void;
  getEntries: (mode: GameMode) => LeaderboardEntry[];
}

export const useLeaderboardStore = create<LeaderboardStore>((set, get) => {
  const saved = loadVersioned<{ boards: Leaderboards }>(
    STORAGE_KEY,
    SCHEMA_VERSION,
    (raw) => ({ boards: {}, ...(raw as Partial<{ boards: Leaderboards }>) }),
    { boards: {} },
  );

  const persist = () => {
    saveVersioned(STORAGE_KEY, SCHEMA_VERSION, { boards: get().boards });
  };

  return {
    boards: saved.boards,

    qualifiesForLeaderboard: (mode, score) => {
      if (mode === 'free-practice' || score <= 0) return false;
      const entries = get().boards[mode] ?? [];
      if (entries.length < MAX_ENTRIES) return true;
      return score > entries[entries.length - 1].score;
    },

    getRankForScore: (mode, score) => {
      if (mode === 'free-practice' || score <= 0) return null;
      const entries = get().boards[mode] ?? [];
      if (entries.length < MAX_ENTRIES) {

        const rank = entries.findIndex((e) => score > e.score);
        return rank === -1 ? entries.length + 1 : rank + 1;
      }
      if (score > entries[entries.length - 1].score) {
        const rank = entries.findIndex((e) => score > e.score);
        return rank === -1 ? MAX_ENTRIES : rank + 1;
      }
      return null;
    },

    addEntry: (mode, entry) => {
      set((state) => {
        const current = [...(state.boards[mode] ?? [])];
        current.push(entry);

        current.sort((a, b) => b.score - a.score || b.date - a.date);
        const trimmed = current.slice(0, MAX_ENTRIES);
        return { boards: { ...state.boards, [mode]: trimmed } };
      });
      persist();
    },

    getEntries: (mode) => get().boards[mode] ?? [],
  };
});
