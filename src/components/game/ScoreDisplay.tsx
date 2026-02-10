import { motion, AnimatePresence } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  className?: string;
}

export function ScoreDisplay({ score, className = '' }: ScoreDisplayProps) {
  return (
    <div className={`font-display text-hd-white ${className}`}>
      <div className="text-xs text-hd-gray uppercase tracking-widest mb-1">Score</div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={score}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl tabular-nums"
        >
          {score.toLocaleString()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
