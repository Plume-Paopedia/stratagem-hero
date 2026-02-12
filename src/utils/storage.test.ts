import { describe, it, expect, beforeEach } from 'vitest';
import { loadFromStorage, saveToStorage, loadVersioned, saveVersioned } from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadFromStorage', () => {
    it('returns fallback when key does not exist', () => {
      expect(loadFromStorage('missing', 42)).toBe(42);
    });

    it('returns parsed value when key exists', () => {
      localStorage.setItem('test', JSON.stringify({ a: 1 }));
      expect(loadFromStorage('test', {})).toEqual({ a: 1 });
    });

    it('returns fallback for invalid JSON', () => {
      localStorage.setItem('bad', 'not json');
      expect(loadFromStorage('bad', 'default')).toBe('default');
    });
  });

  describe('saveToStorage', () => {
    it('saves value as JSON and returns true', () => {
      const result = saveToStorage('key', { x: 10 });
      expect(result).toBe(true);
      expect(JSON.parse(localStorage.getItem('key')!)).toEqual({ x: 10 });
    });

    it('overwrites existing value', () => {
      saveToStorage('key', 1);
      saveToStorage('key', 2);
      expect(loadFromStorage('key', 0)).toBe(2);
    });
  });

  describe('loadVersioned', () => {
    it('returns fallback when key does not exist', () => {
      const result = loadVersioned('missing', 1, () => ({ x: 0 }), { x: 0 });
      expect(result).toEqual({ x: 0 });
    });

    it('loads data at current version directly', () => {
      localStorage.setItem('test', JSON.stringify({ _v: 1, data: { name: 'hello' } }));
      const result = loadVersioned('test', 1, () => ({ name: 'migrated' }), { name: '' });
      expect(result).toEqual({ name: 'hello' });
    });

    it('migrates legacy unversioned data (v0)', () => {
      localStorage.setItem('test', JSON.stringify({ oldField: 42 }));
      const result = loadVersioned<{ newField: number }>(
        'test',
        1,
        (raw) => ({ newField: (raw as { oldField: number }).oldField }),
        { newField: 0 },
      );
      expect(result).toEqual({ newField: 42 });
    });

    it('migrates from older version to current', () => {
      localStorage.setItem('test', JSON.stringify({ _v: 1, data: { count: 5 } }));
      const result = loadVersioned<{ count: number; label: string }>(
        'test',
        2,
        (raw, fromV) => {
          if (fromV === 1) {
            return { ...(raw as { count: number }), label: 'default' };
          }
          return { count: 0, label: '' };
        },
        { count: 0, label: '' },
      );
      expect(result).toEqual({ count: 5, label: 'default' });
    });

    it('returns fallback for corrupted data', () => {
      localStorage.setItem('test', 'not json at all');
      const result = loadVersioned('test', 1, () => ({ x: 99 }), { x: 0 });
      expect(result).toEqual({ x: 0 });
    });
  });

  describe('saveVersioned', () => {
    it('saves data in versioned envelope', () => {
      saveVersioned('test', 1, { name: 'hello' });
      const raw = JSON.parse(localStorage.getItem('test')!);
      expect(raw).toEqual({ _v: 1, data: { name: 'hello' } });
    });

    it('round-trips correctly with loadVersioned', () => {
      const original = { count: 42, items: ['a', 'b'] };
      saveVersioned('test', 3, original);
      const loaded = loadVersioned('test', 3, () => original, { count: 0, items: [] as string[] });
      expect(loaded).toEqual(original);
    });

    it('returns true on success', () => {
      expect(saveVersioned('test', 1, { x: 1 })).toBe(true);
    });
  });
});
