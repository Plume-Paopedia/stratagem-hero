import { describe, it, expect } from 'vitest';
import { stratagems, getByCategory, stratagemMap, categories } from './stratagems';

describe('stratagems data', () => {
  it('has 61 stratagems', () => {
    expect(stratagems.length).toBe(61);
  });

  it('all stratagems have required fields', () => {
    for (const s of stratagems) {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.category).toBeTruthy();
      expect(s.sequence.length).toBeGreaterThan(0);
      expect(s.iconId).toBeTruthy();
      expect(['basic', 'advanced', 'expert']).toContain(s.tier);
    }
  });

  it('all IDs are unique', () => {
    const ids = stratagems.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('stratagemMap matches array', () => {
    expect(stratagemMap.size).toBe(stratagems.length);
    for (const s of stratagems) {
      expect(stratagemMap.get(s.id)).toBe(s);
    }
  });

  it('getByCategory returns non-empty results for all categories', () => {
    for (const cat of categories) {
      const result = getByCategory(cat);
      expect(result.length).toBeGreaterThan(0);
    }
  });

  it('categories cover all stratagems', () => {
    let total = 0;
    for (const cat of categories) {
      total += getByCategory(cat).length;
    }
    expect(total).toBe(stratagems.length);
  });
});
