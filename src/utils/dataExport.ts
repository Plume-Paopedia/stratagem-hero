import { loadFromStorage } from './storage';

const STATS_KEY = 'hd2-stats';
const SETTINGS_KEY = 'hd2-settings';
const ACHIEVEMENTS_KEY = 'hd2-achievements';
const CUSTOM_MODES_KEY = 'hd2-custom-modes';
const LEADERBOARD_KEY = 'hd2-leaderboard';

interface ExportData {
  version: 1;
  exportDate: string;
  stats: unknown;
  settings: unknown;
  achievements: unknown;
  customModes: unknown;
  leaderboard: unknown;
}

export function exportAllData(): string {
  const data: ExportData = {
    version: 1,
    exportDate: new Date().toISOString(),
    stats: loadFromStorage(STATS_KEY, null),
    settings: loadFromStorage(SETTINGS_KEY, null),
    achievements: loadFromStorage(ACHIEVEMENTS_KEY, null),
    customModes: loadFromStorage(CUSTOM_MODES_KEY, null),
    leaderboard: loadFromStorage(LEADERBOARD_KEY, null),
  };
  return JSON.stringify(data, null, 2);
}

export function downloadExport() {
  const json = exportAllData();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stratagem-hero-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(json: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(json) as ExportData;
    if (!data.version || data.version !== 1) {
      return { success: false, error: 'Version du fichier de sauvegarde invalide' };
    }

    if (data.stats) localStorage.setItem(STATS_KEY, JSON.stringify(data.stats));
    if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
    if (data.achievements) localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(data.achievements));
    if (data.customModes) localStorage.setItem(CUSTOM_MODES_KEY, JSON.stringify(data.customModes));
    if (data.leaderboard) localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data.leaderboard));

    return { success: true };
  } catch {
    return { success: false, error: 'Fichier JSON invalide' };
  }
}

export function getDataSizeKB(): number {
  let total = 0;
  for (const key of [STATS_KEY, SETTINGS_KEY, ACHIEVEMENTS_KEY, CUSTOM_MODES_KEY, LEADERBOARD_KEY]) {
    const val = localStorage.getItem(key);
    if (val) total += val.length * 2;
  }
  return Math.round(total / 1024);
}
