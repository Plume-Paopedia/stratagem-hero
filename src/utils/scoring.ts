import type { ScoreBreakdown } from '../types';

/** Base score per completed stratagem */
const BASE_SCORE = 100;

/** Maximum speed bonus when completed under target time */
const MAX_SPEED_BONUS = 150;

/** Target time in ms to earn full speed bonus */
const TARGET_TIME_MS = 2000;

/** Calculate score for a single stratagem completion */
export function calculateScore(
  timeMs: number,
  comboLength: number,
  streakMultiplier: number,
): ScoreBreakdown {
  const base = BASE_SCORE + comboLength * 10;
  const speedRatio = Math.max(0, 1 - timeMs / (TARGET_TIME_MS + comboLength * 500));
  const speedBonus = Math.round(MAX_SPEED_BONUS * speedRatio);
  const total = Math.round((base + speedBonus) * streakMultiplier);

  return { base, speedBonus, streakMultiplier, total };
}

/** Get streak multiplier from consecutive successes */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 12) return 4;
  if (streak >= 8) return 3;
  if (streak >= 4) return 2;
  return 1;
}

/** Calculate accuracy percentage */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 1000) / 10;
}

/** Generate deterministic daily seed from date */
export function getDailySeed(date: Date = new Date()): number {
  const str = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Seeded pseudo-random number generator */
export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
