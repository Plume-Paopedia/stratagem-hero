import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  getStreakMultiplier,
  calculateAccuracy,
  getDailySeed,
  seededRandom,
} from './scoring';

describe('calculateScore', () => {
  it('returns base score for slow completion', () => {
    const result = calculateScore(10000, 4, 1);
    expect(result.base).toBe(140);
    expect(result.speedBonus).toBe(0);
    expect(result.total).toBe(140);
  });

  it('applies speed bonus for fast completion', () => {
    const result = calculateScore(500, 4, 1);
    expect(result.speedBonus).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(result.base);
  });

  it('applies streak multiplier', () => {
    const x1 = calculateScore(1000, 4, 1);
    const x2 = calculateScore(1000, 4, 2);
    expect(x2.total).toBe(x1.total * 2);
  });

  it('handles zero time', () => {
    const result = calculateScore(0, 4, 1);
    expect(result.speedBonus).toBe(150);
  });
});

describe('getStreakMultiplier', () => {
  it('returns 1 for streak < 4', () => {
    expect(getStreakMultiplier(0)).toBe(1);
    expect(getStreakMultiplier(3)).toBe(1);
  });

  it('returns 2 for streak 4-7', () => {
    expect(getStreakMultiplier(4)).toBe(2);
    expect(getStreakMultiplier(7)).toBe(2);
  });

  it('returns 3 for streak 8-11', () => {
    expect(getStreakMultiplier(8)).toBe(3);
    expect(getStreakMultiplier(11)).toBe(3);
  });

  it('returns 4 for streak 12+', () => {
    expect(getStreakMultiplier(12)).toBe(4);
    expect(getStreakMultiplier(100)).toBe(4);
  });
});

describe('calculateAccuracy', () => {
  it('returns 100 for empty', () => {
    expect(calculateAccuracy(0, 0)).toBe(100);
  });

  it('returns correct percentage', () => {
    expect(calculateAccuracy(7, 10)).toBe(70);
    expect(calculateAccuracy(10, 10)).toBe(100);
  });

  it('rounds to one decimal', () => {
    expect(calculateAccuracy(1, 3)).toBe(33.3);
  });
});

describe('getDailySeed', () => {
  it('returns same seed for same UTC date', () => {
    const d1 = new Date('2025-01-15T08:00:00Z');
    const d2 = new Date('2025-01-15T20:00:00Z');
    expect(getDailySeed(d1)).toBe(getDailySeed(d2));
  });

  it('returns different seeds for different dates', () => {
    const d1 = new Date('2025-01-15T00:00:00Z');
    const d2 = new Date('2025-01-16T00:00:00Z');
    expect(getDailySeed(d1)).not.toBe(getDailySeed(d2));
  });
});

describe('seededRandom', () => {
  it('returns values between 0 and 1', () => {
    const rng = seededRandom(42);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('is deterministic', () => {
    const rng1 = seededRandom(42);
    const rng2 = seededRandom(42);
    for (let i = 0; i < 20; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it('different seeds produce different sequences', () => {
    const rng1 = seededRandom(1);
    const rng2 = seededRandom(2);
    const same = Array.from({ length: 10 }, () => rng1() === rng2()).every(Boolean);
    expect(same).toBe(false);
  });
});
