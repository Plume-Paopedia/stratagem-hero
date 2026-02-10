import { motion } from 'framer-motion';

interface TimerProps {
  timeMs: number;
  warningMs?: number;
  className?: string;
}

export function Timer({ timeMs, warningMs = 5000, className = '' }: TimerProps) {
  const seconds = Math.max(0, timeMs / 1000);
  const isWarning = timeMs > 0 && timeMs <= warningMs;

  const display = seconds >= 60
    ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}.${String(Math.floor((seconds % 1) * 10))}`
    : `${seconds.toFixed(1)}s`;

  return (
    <motion.div
      className={`font-display text-2xl tabular-nums ${
        isWarning ? 'text-hd-red' : 'text-hd-white'
      } ${className}`}
      animate={isWarning ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.5, repeat: isWarning ? Infinity : 0 }}
    >
      {display}
    </motion.div>
  );
}
