import type { CustomModeConfig } from '../types/customMode';
import { defaultConfig } from '../stores/customModeStore';

export function encodeConfig(config: CustomModeConfig): string {
  try {
    const json = JSON.stringify(config);
    return btoa(json);
  } catch {
    return '';
  }
}

export function decodeConfig(encoded: string): CustomModeConfig | null {
  try {
    const json = atob(encoded);
    const parsed = JSON.parse(json);
    // Validate required fields
    if (typeof parsed.name !== 'string') return null;
    if (!['none', 'countdown', 'countup', 'survival'].includes(parsed.timerType)) return null;
    return { ...defaultConfig, ...parsed };
  } catch {
    return null;
  }
}

export function getShareUrl(config: CustomModeConfig): string {
  const encoded = encodeConfig(config);
  return `${window.location.origin}${window.location.pathname}#custom=${encoded}`;
}

export function getConfigFromUrl(): CustomModeConfig | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#custom=')) return null;
  const encoded = hash.slice('#custom='.length);
  return decodeConfig(encoded);
}
