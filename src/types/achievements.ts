export type AchievementCategory =
  | 'speed'
  | 'streak'
  | 'completion'
  | 'score'
  | 'collection'
  | 'special';

export type AchievementCheckType =
  | 'session'
  | 'live'
  | 'cumulative';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  checkType: AchievementCheckType;
  icon: string;
  maxProgress?: number;
  hidden?: boolean;
}

export interface AchievementProgress {
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  notified: boolean;
}
