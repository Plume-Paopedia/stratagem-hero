import { describe, it, expect, beforeEach } from 'vitest';
import { loadFromStorage, saveToStorage } from './storage';

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
    it('saves value as JSON', () => {
      saveToStorage('key', { x: 10 });
      expect(JSON.parse(localStorage.getItem('key')!)).toEqual({ x: 10 });
    });

    it('overwrites existing value', () => {
      saveToStorage('key', 1);
      saveToStorage('key', 2);
      expect(loadFromStorage('key', 0)).toBe(2);
    });
  });
});
