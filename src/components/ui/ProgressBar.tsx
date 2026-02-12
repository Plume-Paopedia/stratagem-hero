import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  className?: string;
}

export function ProgressBar({
  value,
  color = 'bg-hd-yellow',
  height = 4,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`w-full bg-hd-border rounded-full overflow-hidden ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
}
