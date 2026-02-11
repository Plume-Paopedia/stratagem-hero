import { motion } from 'framer-motion';
import type { AchievementDef, AchievementProgress } from '../../types/achievements';

interface AchievementCardProps {
  def: AchievementDef;
  progress: AchievementProgress;
}

export function AchievementCard({ def, progress }: AchievementCardProps) {
  const unlocked = progress.unlocked;
  const pct = def.maxProgress
    ? Math.min(100, (progress.progress / def.maxProgress) * 100)
    : unlocked ? 100 : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        flex items-start gap-3 p-3 rounded-lg border transition-colors
        ${unlocked
          ? 'bg-hd-yellow/5 border-hd-yellow/30'
          : 'bg-hd-dark/50 border-hd-border opacity-60'
        }
      `}
    >
      <span className={`text-2xl flex-shrink-0 ${unlocked ? '' : 'grayscale'}`}>
        {def.hidden && !unlocked ? '?' : def.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className={`font-heading font-bold text-sm ${unlocked ? 'text-hd-yellow' : 'text-hd-gray'}`}>
          {def.hidden && !unlocked ? '???' : def.name}
        </div>
        <div className="text-xs text-hd-gray mt-0.5">
          {def.hidden && !unlocked ? 'Succes cache' : def.description}
        </div>

        {/* Progress bar */}
        {def.maxProgress && !unlocked && (
          <div className="mt-2">
            <div className="h-1.5 bg-hd-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-hd-yellow/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-[10px] text-hd-gray mt-0.5">
              {progress.progress} / {def.maxProgress}
            </div>
          </div>
        )}

        {unlocked && progress.unlockedAt && (
          <div className="text-[10px] text-hd-gray/50 mt-1">
            {new Date(progress.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
