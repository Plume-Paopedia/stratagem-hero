import { useAchievementStore } from '../../stores/achievementStore';

interface AchievementBadgeProps {
  className?: string;
}

export function AchievementBadge({ className = '' }: AchievementBadgeProps) {
  const unlocked = useAchievementStore((s) => s.getUnlockedCount());
  const total = useAchievementStore((s) => s.getTotalCount());
  const pct = Math.round((unlocked / total) * 100);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="text-xs font-heading text-hd-gray uppercase tracking-wider">
        Achievements
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1.5 bg-hd-border rounded-full overflow-hidden">
          <div
            className="h-full bg-hd-yellow rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-heading text-hd-yellow">
          {unlocked}/{total}
        </span>
      </div>
    </div>
  );
}
