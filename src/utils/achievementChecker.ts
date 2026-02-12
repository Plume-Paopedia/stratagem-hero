import type { SessionStats, GlobalStats } from '../types';
import { stratagems } from '../data/stratagems';
import { useAchievementStore } from '../stores/achievementStore';

const store = () => useAchievementStore.getState();

const categoryStratagemIds: Record<string, string[]> = {};
const tierStratagemIds: Record<string, string[]> = {};
for (const s of stratagems) {
  (categoryStratagemIds[s.category] ??= []).push(s.id);
  (tierStratagemIds[s.tier] ??= []).push(s.id);
}

export function checkSessionAchievements(
  session: SessionStats,
  stats: GlobalStats,
): void {
  const { unlock, setProgress, incrementProgress, isUnlocked } = store();

  const successes = session.attempts.filter(a => a.success);
  const successCount = successes.length;

  if (session.totalScore >= 1000) unlock('score-1k');
  if (session.totalScore >= 5000) unlock('score-5k');
  if (session.totalScore >= 10000) unlock('score-10k');
  if (session.totalScore >= 25000) unlock('score-25k');
  if (session.totalScore >= 50000) unlock('score-50k');

  if (session.mode === 'time-attack' && session.totalScore >= 15000) unlock('time-attack-expert');
  if (session.mode === 'survival' && session.totalScore >= 10000) unlock('survival-specialist');
  if (session.mode === 'accuracy' && session.totalScore >= 10000) unlock('accuracy-ace');

  const totalAttempts = session.attempts.length;
  if (totalAttempts > 0 && successCount === totalAttempts) {
    if (successCount >= 10) unlock('flawless-10');
    if (successCount >= 25) unlock('flawless-25');
    if (successCount >= 20) unlock('perfectionist');
  }

  if (successCount >= 10 && session.averageTimeMs < 1500) {
    unlock('blitz');
  }

  const hour = new Date(session.date).getHours();
  if (hour >= 2 && hour < 5) unlock('night-owl');

  const totalSessions = stats.totalSessions;
  if (totalSessions >= 1) setProgress('first-deployment', totalSessions);
  if (!isUnlocked('regular')) setProgress('regular', Math.min(totalSessions, 10));
  if (!isUnlocked('veteran')) setProgress('veteran', Math.min(totalSessions, 50));
  if (!isUnlocked('hero-of-super-earth')) setProgress('hero-of-super-earth', Math.min(totalSessions, 500));

  const totalTime = stats.totalPlayTimeMs;
  if (!isUnlocked('marathon')) setProgress('marathon', Math.min(totalTime, 3600000));
  if (!isUnlocked('endurance')) setProgress('endurance', Math.min(totalTime, 18000000));
  if (!isUnlocked('dedicated')) setProgress('dedicated', Math.min(totalTime, 36000000));

  const totalCompleted = stats.totalStratagemsCompleted;
  if (!isUnlocked('centurion')) setProgress('centurion', Math.min(totalCompleted, 100));
  if (!isUnlocked('millennium')) setProgress('millennium', Math.min(totalCompleted, 1000));

  const totalErrors = stats.totalErrors;
  if (!isUnlocked('button-masher')) setProgress('button-masher', Math.min(totalErrors, 100));

  if (!isUnlocked('all-rounder')) {
    const modes = new Set(stats.sessions.map(s => s.mode));
    setProgress('all-rounder', modes.size);
  }

  checkCollectionAchievements(stats);

  const fastCount = successes.filter(a => a.timeMs < 1000).length;
  if (fastCount > 0) {
    incrementProgress('speed-demon', fastCount);

    const totalFast = countFastCompletions(stats);
    if (!isUnlocked('quick-deploy')) setProgress('quick-deploy', Math.min(totalFast, 50));
    if (!isUnlocked('rapid-response')) setProgress('rapid-response', Math.min(totalFast, 100));
  }

  if (!isUnlocked('persistent')) {
    incrementProgress('persistent');
  }
}

export function checkLiveAchievement(
  type: 'combo-complete' | 'streak' | 'first-stratagem',
  data: {
    timeMs?: number;
    streak?: number;
    multiplier?: number;
    consecutiveFastCount?: number;
    totalStratagemsCompleted?: number;
  },
): void {
  const { unlock, isUnlocked } = store();

  if (type === 'first-stratagem') {
    unlock('first-blood');
    return;
  }

  if (type === 'combo-complete') {
    const ms = data.timeMs ?? Infinity;
    if (ms < 1000) unlock('lightning-reflexes');
    if (ms < 500) unlock('supersoldier');
    if (ms < 300) unlock('hyperspeed');

    if ((data.consecutiveFastCount ?? 0) >= 5) unlock('no-hesitation');

    if (data.totalStratagemsCompleted === 1 && !isUnlocked('first-blood')) {
      unlock('first-blood');
    }
  }

  if (type === 'streak') {
    const streak = data.streak ?? 0;
    if (streak >= 4) unlock('getting-warm');
    if (streak >= 8) unlock('on-fire');
    if (streak >= 12) unlock('unstoppable');
    if (streak >= 20) unlock('streak-20');
    if (streak >= 50) unlock('streak-50');
    if (streak >= 100) unlock('streak-100');
  }
}

function checkCollectionAchievements(stats: GlobalStats): void {
  const { setProgress, isUnlocked } = store();
  const completed = new Set<string>();

  for (const [id, stat] of Object.entries(stats.stratagemStats)) {
    if (stat.successes > 0) completed.add(id);
  }

  const categoryMap: Record<string, string> = {
    'Patriotic Administration Center': 'eagle-scout',
    'Orbital Cannons': 'orbital-commander',
    'Bridge': 'bridge-officer',
    'Engineering Bay': 'engineer',
    'Robotics Workshop': 'roboticist',
    'Hangar': 'pilot',
    'General Stratagems': 'general',
    'Mission Stratagems': 'mission-specialist',
  };

  for (const [category, achievementId] of Object.entries(categoryMap)) {
    if (!isUnlocked(achievementId)) {
      const ids = categoryStratagemIds[category] ?? [];
      const done = ids.filter(id => completed.has(id)).length;
      setProgress(achievementId, done);
    }
  }

  if (!isUnlocked('arsenal')) {
    setProgress('arsenal', completed.size);
  }

  if (!isUnlocked('completionist')) {
    let count = 0;
    for (const s of stratagems) {
      if ((stats.stratagemStats[s.id]?.successes ?? 0) >= 10) count++;
    }
    setProgress('completionist', count);
  }

  if (!isUnlocked('strategist')) {
    const expertIds = tierStratagemIds['expert'] ?? [];
    const doneExperts = expertIds.filter(id => completed.has(id)).length;
    if (doneExperts >= expertIds.length && expertIds.length > 0) {
      store().unlock('strategist');
    }
  }
}

function countFastCompletions(stats: GlobalStats): number {
  let count = 0;
  for (const session of stats.sessions) {
    for (const a of session.attempts) {
      if (a.success && a.timeMs < 1000) count++;
    }
  }
  return count;
}
