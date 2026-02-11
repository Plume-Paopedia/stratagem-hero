import { motion, AnimatePresence } from 'framer-motion';

interface BossIndicatorProps {
  active: boolean;
}

export function BossIndicator({ active }: BossIndicatorProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-30"
        >
          <div className="flex items-center gap-2 px-4 py-1.5 bg-hd-red/20 border border-hd-red rounded-full">
            <motion.span
              className="text-lg"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              {'\u{1F480}'}
            </motion.span>
            <span className="font-display text-sm text-hd-red uppercase tracking-wider">
              Boss Stratagem
            </span>
            <span className="text-xs text-hd-red/70 font-heading">x2 Points</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
