import { describe, it, expect } from 'vitest';
import { shuffleArray } from './array';

describe('shuffleArray', () => {
  it('returns a new array (does not mutate original)', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffleArray(original);
    expect(original).toEqual(copy);
  });

  it('preserves all elements', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = shuffleArray(arr);
    expect(result.sort((a, b) => a - b)).toEqual(arr);
  });

  it('handles empty array', () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it('handles single element', () => {
    expect(shuffleArray([42])).toEqual([42]);
  });

  it('uses provided RNG for deterministic shuffle', () => {
    let seed = 0.5;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const arr = [1, 2, 3, 4, 5];

    seed = 0.5;
    const result1 = shuffleArray(arr, rng);

    seed = 0.5;
    const result2 = shuffleArray(arr, rng);

    expect(result1).toEqual(result2);
  });

  it('produces different orders for large arrays (probabilistic)', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const result = shuffleArray(arr);

    const isIdentical = arr.every((v, i) => v === result[i]);
    expect(isIdentical).toBe(false);
  });
});
