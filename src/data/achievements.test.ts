import { describe, it, expect } from 'vitest';
import { achievements, achievementMap, achievementsByCategory } from './achievements';

describe('achievements data', () => {
  it('has 50 achievements', () => {
    expect(achievements.length).toBe(50);
  });

  it('all achievements have required fields', () => {
    for (const a of achievements) {
      expect(a.id).toBeTruthy();
      expect(a.name).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.category).toBeTruthy();
      expect(a.checkType).toBeTruthy();
      expect(a.icon).toBeTruthy();
    }
  });

  it('all IDs are unique', () => {
    const ids = achievements.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('achievementMap matches array', () => {
    expect(achievementMap.size).toBe(achievements.length);
  });

  it('categories sum matches total', () => {
    let total = 0;
    for (const cat of Object.values(achievementsByCategory)) {
      total += cat.length;
    }
    expect(total).toBe(achievements.length);
  });
});
