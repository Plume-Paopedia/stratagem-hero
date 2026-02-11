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

const multiplierGlows: Record<number, string> = {
  2: '0 0 8px rgba(245,197,24,0.4)',
  3: '0 0 12px rgba(255,150,50,0.5), 0 0 24px rgba(255,150,50,0.2)',
  4: '0 0 16px rgba(255,51,51,0.6), 0 0 32px rgba(255,51,51,0.3), 0 0 48px rgba(255,51,51,0.15)',
};

export function StreakIndicator({ streak, multiplier }: StreakIndicatorProps) {
  if (streak === 0) return null;

  const isMax = multiplier >= 4;

  return (
    <div className="flex items-center gap-3" aria-live="assertive" aria-label={`Streak: ${streak}, multiplier x${multiplier}`}>
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
            animate={{
              scale: isMax ? [1, 1.08, 1] : 1,
              opacity: 1,
              rotate: 0,
            }}
            transition={isMax ? {
              scale: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' },
            } : undefined}
            className={`font-display font-bold ${multiplierColors[multiplier] ?? 'text-hd-red'} ${isMax ? 'text-2xl' : 'text-lg'}`}
            style={{
              textShadow: multiplierGlows[multiplier] ?? undefined,
            }}
          >
            {isMax && (
              <span className="text-[10px] block text-hd-red/80 uppercase tracking-wider -mb-1">
                MAXIMUM
              </span>
            )}
            <span className="flex items-center gap-1">
              x{multiplier}
              {multiplier >= 2 && <span>&#x1F525;</span>}
              {multiplier >= 3 && <span>&#x1F525;</span>}
            </span>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
