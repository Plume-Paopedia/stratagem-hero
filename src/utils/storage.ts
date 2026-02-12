
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    console.warn(`[storage] Failed to save "${key}" — storage may be full`);
    return false;
  }
}

interface VersionedEnvelope<T> {
  _v: number;
  data: T;
}

export function loadVersioned<T>(
  key: string,
  currentVersion: number,
  migrate: (raw: unknown, fromVersion: number) => T,
  fallback: T,
): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;

    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === 'object' && '_v' in parsed && parsed._v === currentVersion) {
      return (parsed as VersionedEnvelope<T>).data;
    }

    if (parsed && typeof parsed === 'object' && '_v' in parsed) {
      return migrate((parsed as VersionedEnvelope<unknown>).data, parsed._v as number);
    }

    return migrate(parsed, 0);
  } catch {
    console.warn(`[storage] Failed to load "${key}", using fallback`);
    return fallback;
  }
}

export function saveVersioned<T>(key: string, version: number, value: T): boolean {
  const envelope: VersionedEnvelope<T> = { _v: version, data: value };
  return saveToStorage(key, envelope);
}
