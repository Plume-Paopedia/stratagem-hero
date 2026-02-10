import { create } from 'zustand';
import type { UserSettings, KeyBindings } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { startMusic, stopMusic, setMusicVolume } from '../utils/music';

const STORAGE_KEY = 'hd2-settings';

const defaultKeyBindings: KeyBindings = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  confirm: ['Enter', 'Space'],
  back: ['Escape'],
  restart: ['KeyR'],
  pause: ['Escape'],
};

const defaultSettings: UserSettings = {
  masterVolume: 70,
  sfxEnabled: true,
  musicEnabled: false,
  musicVolume: 40,
  keyBindings: defaultKeyBindings,
  gamepadDeadzone: 0.3,
  colorblindMode: false,
  reducedMotion: false,
  timeAttackDuration: 60,
  accuracyTargetCount: 20,
};

interface SettingsState extends UserSettings {
  setVolume: (volume: number) => void;
  toggleSfx: () => void;
  toggleMusic: () => void;
  setMusicVol: (volume: number) => void;
  setKeyBinding: (action: keyof KeyBindings, keys: string[]) => void;
  setGamepadDeadzone: (deadzone: number) => void;
  toggleColorblindMode: () => void;
  toggleReducedMotion: () => void;
  setTimeAttackDuration: (duration: number) => void;
  setAccuracyTargetCount: (count: number) => void;
  resetToDefaults: () => void;
}

function persistAll(state: UserSettings) {
  saveToStorage(STORAGE_KEY, {
    masterVolume: state.masterVolume,
    sfxEnabled: state.sfxEnabled,
    musicEnabled: state.musicEnabled,
    musicVolume: state.musicVolume,
    keyBindings: state.keyBindings,
    gamepadDeadzone: state.gamepadDeadzone,
    colorblindMode: state.colorblindMode,
    reducedMotion: state.reducedMotion,
    timeAttackDuration: state.timeAttackDuration,
    accuracyTargetCount: state.accuracyTargetCount,
  });
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const saved = loadFromStorage<UserSettings>(STORAGE_KEY, defaultSettings);
  const merged = { ...defaultSettings, ...saved };

  const persist = (partial: Partial<UserSettings>) => {
    set((state) => {
      const updated = { ...state, ...partial };
      persistAll(updated);
      return partial;
    });
  };

  return {
    ...merged,
    setVolume: (volume) => persist({ masterVolume: volume }),

    toggleSfx: () => {
      const next = !get().sfxEnabled;
      persist({ sfxEnabled: next });
    },

    toggleMusic: () => {
      const next = !get().musicEnabled;
      persist({ musicEnabled: next });
      if (next) {
        startMusic(get().musicVolume / 100);
      } else {
        stopMusic();
      }
    },

    setMusicVol: (volume) => {
      persist({ musicVolume: volume });
      setMusicVolume(volume / 100);
    },

    setKeyBinding: (action, keys) =>
      set((s) => {
        const keyBindings = { ...s.keyBindings, [action]: keys };
        persist({ keyBindings });
        return { keyBindings };
      }),

    setGamepadDeadzone: (deadzone) => persist({ gamepadDeadzone: deadzone }),

    toggleColorblindMode: () => {
      const next = !get().colorblindMode;
      persist({ colorblindMode: next });
    },

    toggleReducedMotion: () => {
      const next = !get().reducedMotion;
      persist({ reducedMotion: next });
    },

    setTimeAttackDuration: (duration) => persist({ timeAttackDuration: duration }),
    setAccuracyTargetCount: (count) => persist({ accuracyTargetCount: count }),

    resetToDefaults: () => {
      stopMusic();
      saveToStorage(STORAGE_KEY, defaultSettings);
      set(defaultSettings);
    },
  };
});
