import { motion, AnimatePresence } from 'framer-motion';

interface StreakIndicatorProps {
  streak: number;
  multiplier: number;
}

const multiplierColors: Record<number, string> = {
  1: 'text-hd-white',
  2: 'text-hd-yellow',
  3: 'text-orange-400',
  4: 'text-hd-red',
};

export function StreakIndicator({ streak, multiplier }: StreakIndicatorProps) {
  if (streak === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-hd-gray uppercase tracking-widest font-heading">Streak</div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={streak}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-display text-xl text-hd-yellow tabular-nums"
        >
          {streak}
        </motion.div>
      </AnimatePresence>

      {multiplier > 1 && (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={multiplier}
            initial={{ scale: 2, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className={`font-display text-lg font-bold ${multiplierColors[multiplier] ?? 'text-hd-red'}`}
          >
            x{multiplier}
            {multiplier >= 2 && <span className="ml-1">&#x1F525;</span>}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
