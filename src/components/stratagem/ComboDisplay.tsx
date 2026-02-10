import { motion, AnimatePresence } from 'framer-motion';
import type { Stratagem } from '../../types';
import { DirectionArrow } from './DirectionArrow';

interface ComboDisplayProps {
  stratagem: Stratagem;
  currentIndex: number;
  error: boolean;
  showName?: boolean;
  hideSequence?: boolean;
}

export function ComboDisplay({
  stratagem,
  currentIndex,
  error,
  showName = true,
  hideSequence = false,
}: ComboDisplayProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      animate={error ? { x: [0, -6, 6, -6, 6, 0] } : {}}
      transition={{ duration: 0.3 }}
    >
      {showName && (
        <AnimatePresence mode="wait">
          <motion.div
            key={stratagem.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-center"
          >
            <span className="text-3xl mb-1 block">{stratagem.icon}</span>
            <h2 className="font-display text-xl text-hd-yellow tracking-wider uppercase">
              {stratagem.name}
            </h2>
            <p className="text-xs text-hd-gray font-body mt-1">{stratagem.description}</p>
          </motion.div>
        </AnimatePresence>
      )}

      {!hideSequence && (
        <div className="flex items-center gap-3">
          {stratagem.sequence.map((dir, i) => (
            <DirectionArrow
              key={`${stratagem.id}-${i}`}
              direction={dir}
              state={
                error && i === 0
                  ? 'wrong'
                  : i < currentIndex
                    ? 'correct'
                    : 'pending'
              }
              size={48}
            />
          ))}
        </div>
      )}

      {/* Progress dots */}
      <div className="flex gap-2">
        {stratagem.sequence.map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < currentIndex ? 'bg-hd-yellow' : 'bg-hd-border'
            }`}
            animate={i < currentIndex ? { scale: [1, 1.5, 1] } : {}}
            transition={{ duration: 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
