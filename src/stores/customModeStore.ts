import { create } from 'zustand';
import type { CustomModeConfig, CustomModePreset } from '../types/customMode';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const STORAGE_KEY = 'hd2-custom-modes';

export const defaultConfig: CustomModeConfig = {
  name: 'My Custom Mode',
  timerType: 'countdown',
  timerDuration: 60,
  lives: 0,
  errorBehavior: 'reset-streak',
  timePenaltyMs: 2000,
  queueSource: 'all',
  queueLength: 0,
  shuffle: true,
  scoreMultiplier: 1,
};

interface CustomModeState {
  presets: CustomModePreset[];
  activeConfig: CustomModeConfig | null;
}

interface CustomModeStore extends CustomModeState {
  savePreset: (config: CustomModeConfig) => string;
  deletePreset: (id: string) => void;
  loadPreset: (id: string) => CustomModeConfig | null;
  setActiveConfig: (config: CustomModeConfig | null) => void;
}

export const useCustomModeStore = create<CustomModeStore>((set, get) => {
  const saved = loadFromStorage<CustomModeState>(STORAGE_KEY, {
    presets: [],
    activeConfig: null,
  });

  const persist = () => {
    const s = get();
    saveToStorage<CustomModeState>(STORAGE_KEY, {
      presets: s.presets,
      activeConfig: s.activeConfig,
    });
  };

  return {
    presets: saved.presets ?? [],
    activeConfig: saved.activeConfig,

    savePreset: (config) => {
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const preset: CustomModePreset = { id, config, createdAt: Date.now() };
      set((s) => ({ presets: [...s.presets, preset] }));
      persist();
      return id;
    },

    deletePreset: (id) => {
      set((s) => ({ presets: s.presets.filter((p) => p.id !== id) }));
      persist();
    },

    loadPreset: (id) => {
      return get().presets.find((p) => p.id === id)?.config ?? null;
    },

    setActiveConfig: (config) => {
      set({ activeConfig: config });
      persist();
    },
  };
});
