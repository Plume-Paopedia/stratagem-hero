import { useState } from 'react';
import { motion } from 'framer-motion';
import type { AchievementCategory } from '../../types/achievements';
import { achievements, achievementsByCategory } from '../../data/achievements';
import { useAchievementStore } from '../../stores/achievementStore';
import { AchievementCard } from './AchievementCard';
import { Button } from '../ui/Button';

interface AchievementsScreenProps {
  onClose: () => void;
}

const categoryLabels: Record<AchievementCategory, string> = {
  speed: 'Vitesse',
  streak: 'Serie',
  completion: 'Completion',
  score: 'Score',
  collection: 'Collection',
  special: 'Special',
};

const categoryOrder: AchievementCategory[] = [
  'completion', 'speed', 'streak', 'score', 'collection', 'special',
];

type FilterMode = 'all' | AchievementCategory;

export function AchievementsScreen({ onClose }: AchievementsScreenProps) {
  const [filter, setFilter] = useState<FilterMode>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const progress = useAchievementStore((s) => s.progress);
  const unlockedCount = useAchievementStore((s) => s.getUnlockedCount());
  const totalCount = achievements.length;
  const pct = Math.round((unlockedCount / totalCount) * 100);

  const filteredAchievements = filter === 'all'
    ? achievements
    : (achievementsByCategory[filter] ?? []);

  const displayedAchievements = showUnlockedOnly
    ? filteredAchievements.filter(a => progress[a.id]?.unlocked)
    : filteredAchievements;

  return (
    <div className="h-full flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-hd-yellow uppercase tracking-wider">
            Succes
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-32 h-2 bg-hd-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-hd-yellow rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <span className="text-sm font-heading text-hd-gray">
              {unlockedCount} / {totalCount} ({pct}%)
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Fermer
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="Tous"
        />
        {categoryOrder.map(cat => (
          <FilterButton
            key={cat}
            active={filter === cat}
            onClick={() => setFilter(cat)}
            label={categoryLabels[cat]}
            count={achievementsByCategory[cat]?.filter(a => progress[a.id]?.unlocked).length ?? 0}
            total={achievementsByCategory[cat]?.length ?? 0}
          />
        ))}
        <div className="ml-auto">
          <button
            onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
            className={`text-xs font-heading uppercase tracking-wider px-2 py-1 rounded cursor-pointer transition-colors ${
              showUnlockedOnly ? 'text-hd-yellow bg-hd-yellow/10' : 'text-hd-gray hover:text-hd-white'
            }`}
          >
            {showUnlockedOnly ? 'Debloques' : 'Voir Tout'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {displayedAchievements.map(def => (
            <AchievementCard
              key={def.id}
              def={def}
              progress={progress[def.id] ?? { unlocked: false, progress: 0, notified: false }}
            />
          ))}
        </div>

        {displayedAchievements.length === 0 && (
          <div className="text-center py-12 text-hd-gray font-heading">
            Aucun succes a afficher.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  count,
  total,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  total?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        text-xs font-heading uppercase tracking-wider px-3 py-1.5 rounded border transition-colors cursor-pointer
        ${active
          ? 'border-hd-yellow text-hd-yellow bg-hd-yellow/10'
          : 'border-hd-border text-hd-gray hover:border-hd-yellow/30 hover:text-hd-white'
        }
      `}
    >
      {label}
      {count != null && total != null && (
        <span className="ml-1 opacity-60">{count}/{total}</span>
      )}
    </button>
  );
}
