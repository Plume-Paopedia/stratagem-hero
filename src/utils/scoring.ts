import type { ScoreBreakdown } from '../types';

const BASE_SCORE = 100;

const MAX_SPEED_BONUS = 150;

const TARGET_TIME_MS = 2000;

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

export function getStreakMultiplier(streak: number): number {
  if (streak >= 12) return 4;
  if (streak >= 8) return 3;
  if (streak >= 4) return 2;
  return 1;
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 1000) / 10;
}

export function getDailySeed(date: Date = new Date()): number {
  const str = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
