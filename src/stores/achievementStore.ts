import { create } from 'zustand';
import type { AchievementProgress } from '../types/achievements';
import { achievements } from '../data/achievements';
import { loadVersioned, saveVersioned } from '../utils/storage';

const STORAGE_KEY = 'hd2-achievements';
const SCHEMA_VERSION = 1;

interface AchievementState {
  progress: Record<string, AchievementProgress>;

  toastQueue: string[];
}

interface AchievementStore extends AchievementState {
  unlock: (id: string) => void;
  setProgress: (id: string, value: number) => void;
  incrementProgress: (id: string, delta?: number) => void;
  isUnlocked: (id: string) => boolean;
  getProgress: (id: string) => AchievementProgress;
  popToast: () => string | undefined;
  markNotified: (id: string) => void;
  getUnlockedCount: () => number;
  getTotalCount: () => number;
  reset: () => void;
}

const defaultProgress: AchievementProgress = {
  unlocked: false,
  progress: 0,
  notified: false,
};

function buildDefaults(): Record<string, AchievementProgress> {
  const map: Record<string, AchievementProgress> = {};
  for (const a of achievements) {
    map[a.id] = { ...defaultProgress };
  }
  return map;
}

export const useAchievementStore = create<AchievementStore>((set, get) => {
  const defaults = buildDefaults();
  const saved = loadVersioned<AchievementState>(
    STORAGE_KEY,
    SCHEMA_VERSION,
    (raw) => ({ progress: defaults, toastQueue: [], ...(raw as Partial<AchievementState>) }),
    { progress: defaults, toastQueue: [] },
  );

  const merged: Record<string, AchievementProgress> = { ...defaults };
  for (const [id, prog] of Object.entries(saved.progress)) {
    if (merged[id]) {
      merged[id] = prog;
    }
  }

  const persist = () => {
    const s = get();
    saveVersioned<AchievementState>(STORAGE_KEY, SCHEMA_VERSION, {
      progress: s.progress,
      toastQueue: s.toastQueue,
    });
  };

  return {
    progress: merged,
    toastQueue: saved.toastQueue ?? [],

    unlock: (id) => {
      const current = get().progress[id];
      if (!current || current.unlocked) return;
      set((s) => ({
        progress: {
          ...s.progress,
          [id]: { ...current, unlocked: true, unlockedAt: Date.now(), progress: current.progress },
        },
        toastQueue: [...s.toastQueue, id],
      }));
      persist();
    },

    setProgress: (id, value) => {
      const current = get().progress[id];
      if (!current || current.unlocked) return;
      const def = achievements.find(a => a.id === id);
      const shouldUnlock = def?.maxProgress ? value >= def.maxProgress : false;
      set((s) => ({
        progress: {
          ...s.progress,
          [id]: {
            ...current,
            progress: value,
            unlocked: shouldUnlock || current.unlocked,
            unlockedAt: shouldUnlock ? Date.now() : current.unlockedAt,
          },
        },
        toastQueue: shouldUnlock ? [...s.toastQueue, id] : s.toastQueue,
      }));
      persist();
    },

    incrementProgress: (id, delta = 1) => {
      const current = get().progress[id];
      if (!current || current.unlocked) return;
      get().setProgress(id, current.progress + delta);
    },

    isUnlocked: (id) => get().progress[id]?.unlocked ?? false,

    getProgress: (id) => get().progress[id] ?? { ...defaultProgress },

    popToast: () => {
      const queue = get().toastQueue;
      if (queue.length === 0) return undefined;
      const [first, ...rest] = queue;
      set({ toastQueue: rest });
      persist();
      return first;
    },

    markNotified: (id) => {
      const current = get().progress[id];
      if (!current) return;
      set((s) => ({
        progress: {
          ...s.progress,
          [id]: { ...current, notified: true },
        },
      }));
      persist();
    },

    getUnlockedCount: () => {
      return Object.values(get().progress).filter(p => p.unlocked).length;
    },

    getTotalCount: () => achievements.length,

    reset: () => {
      const defaults = buildDefaults();
      set({ progress: defaults, toastQueue: [] });
      saveVersioned(STORAGE_KEY, SCHEMA_VERSION, { progress: defaults, toastQueue: [] });
    },
  };
});
