export type AchievementCategory =
  | 'speed'
  | 'streak'
  | 'completion'
  | 'score'
  | 'collection'
  | 'special';

/** When the achievement condition is evaluated */
export type AchievementCheckType =
  | 'session'     // checked after each game session
  | 'live'        // checked in real-time during gameplay
  | 'cumulative'; // checked against cumulative stats

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
