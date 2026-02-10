import { motion } from 'framer-motion';
import type { Stratagem } from '../../types';

interface ComboQueueProps {
  queue: Stratagem[];
  currentIndex: number;
  maxVisible?: number;
}

export function ComboQueue({ queue, currentIndex, maxVisible = 5 }: ComboQueueProps) {
  const upcoming = queue.slice(currentIndex + 1, currentIndex + 1 + maxVisible);

  if (upcoming.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-hd-gray uppercase tracking-widest font-heading">Next</span>
      <div className="flex gap-2">
        {upcoming.map((strat, i) => (
          <motion.div
            key={`${strat.id}-${currentIndex + 1 + i}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1 - i * 0.2, x: 0 }}
            className="flex items-center gap-1.5 px-2 py-1 bg-hd-dark rounded border border-hd-border"
          >
            <span className="text-sm">{strat.icon}</span>
            <span className="text-xs font-heading text-hd-gray truncate max-w-[80px]">
              {strat.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
