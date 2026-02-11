import { motion } from 'framer-motion';
import type { GameMode } from '../../types';
import { useLeaderboardStore } from '../../stores/leaderboardStore';

interface LeaderboardMiniProps {
  mode: GameMode;
  highlightScore?: number;
}

export function LeaderboardMini({ mode, highlightScore }: LeaderboardMiniProps) {
  const getEntries = useLeaderboardStore((s) => s.getEntries);
  const entries = getEntries(mode);

  if (entries.length === 0) return null;

  const top5 = entries.slice(0, 5);

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="text-xs font-heading uppercase tracking-wider text-hd-gray mb-2 text-center">
        Meilleurs Scores
      </div>

      <div className="border border-hd-border/50 rounded overflow-hidden">
        {top5.map((entry, i) => {
          const rank = i + 1;
          const isHighlighted = highlightScore != null && entry.score === highlightScore;
          const rankColors = ['text-hd-yellow', 'text-hd-gray', 'text-amber-600'];

          return (
            <div
              key={i}
              className={`grid grid-cols-[1.5rem_2.5rem_1fr_2.5rem] gap-1 px-2 py-1.5 text-sm border-b border-hd-border/20 last:border-b-0 ${
                isHighlighted ? 'bg-hd-yellow/10' : ''
              }`}
            >
              <span className={`font-display ${rank <= 3 ? rankColors[rank - 1] : 'text-hd-gray/50'}`}>
                {rank}
              </span>
              <span className="font-display text-hd-white">{entry.initials}</span>
              <span className={`font-display text-right ${isHighlighted ? 'text-hd-yellow' : 'text-hd-white/70'}`}>
                {entry.score.toLocaleString()}
              </span>
              <span className="font-heading text-xs text-hd-gray text-right self-center">
                x{entry.bestStreak}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
