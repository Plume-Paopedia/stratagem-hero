import { motion } from 'framer-motion';
import type { Direction, InputResult } from '../../types';

interface DirectionArrowProps {
  direction: Direction;
  state: InputResult;
  size?: number;
  showLabel?: boolean;
}

const arrowPaths: Record<Direction, string> = {
  up: 'M12 4 L20 14 L16 14 L16 22 L8 22 L8 14 L4 14 Z',
  down: 'M12 22 L20 12 L16 12 L16 4 L8 4 L8 12 L4 12 Z',
  left: 'M4 12 L14 4 L14 8 L22 8 L22 16 L14 16 L14 20 Z',
  right: 'M22 12 L12 4 L12 8 L4 8 L4 16 L12 16 L12 20 Z',
};

const stateColors: Record<InputResult, { fill: string; stroke: string; glow: string }> = {
  pending: { fill: '#2a2a3a', stroke: '#6a6a7a', glow: 'transparent' },
  correct: { fill: '#f5c518', stroke: '#f5c518', glow: 'rgba(245,197,24,0.5)' },
  wrong: { fill: '#ff3333', stroke: '#ff3333', glow: 'rgba(255,51,51,0.5)' },
};

export function DirectionArrow({
  direction,
  state,
  size = 40,
  showLabel = false,
}: DirectionArrowProps) {
  const colors = stateColors[state];

  return (
    <motion.div
      className="relative inline-flex flex-col items-center"
      animate={
        state === 'correct'
          ? { scale: [1, 1.3, 1], transition: { duration: 0.2 } }
          : state === 'wrong'
            ? { x: [0, -4, 4, -4, 4, 0], transition: { duration: 0.3 } }
            : {}
      }
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 26 26"
        className="drop-shadow-lg"
        aria-label={direction}
      >
        {state !== 'pending' && (
          <motion.circle
            cx="13"
            cy="13"
            r="12"
            fill="transparent"
            stroke={colors.glow}
            strokeWidth="2"
            initial={{ opacity: 0, r: 8 }}
            animate={{ opacity: [0.8, 0], r: [8, 16] }}
            transition={{ duration: 0.4 }}
          />
        )}
        <path
          d={arrowPaths[direction]}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      {showLabel && (
        <span className="text-xs font-heading text-hd-gray mt-1 uppercase">
          {direction}
        </span>
      )}
    </motion.div>
  );
}
