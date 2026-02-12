import { memo } from 'react';
import { motion } from 'framer-motion';
import type { Stratagem } from '../../types';
import { DirectionArrow } from './DirectionArrow';
import { StratagemIcon } from '../icons/StratagemIcon';

interface StratagemCardProps {
  stratagem: Stratagem;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const tierColors = {
  basic: 'border-hd-green/30',
  advanced: 'border-hd-yellow/30',
  expert: 'border-hd-red/30',
};

export const StratagemCard = memo(function StratagemCard({
  stratagem,
  selected = false,
  compact = false,
  onClick,
}: StratagemCardProps) {
  if (compact) {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded border transition-colors
          cursor-pointer
          ${selected
            ? 'bg-hd-yellow/10 border-hd-yellow text-hd-yellow'
            : 'bg-hd-panel border-hd-border text-hd-white hover:border-hd-yellow/50'
          }
        `}
      >
        <StratagemIcon iconId={stratagem.iconId} size={24} fallbackEmoji={stratagem.icon} />
        <span className="font-heading text-sm truncate">{stratagem.name}</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`
        flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all
        cursor-pointer w-full
        ${selected
          ? `bg-hd-yellow/10 border-hd-yellow shadow-[0_0_20px_rgba(245,197,24,0.15)]`
          : `bg-hd-panel ${tierColors[stratagem.tier]} hover:border-hd-yellow/40`
        }
      `}
    >
      <StratagemIcon iconId={stratagem.iconId} size={40} fallbackEmoji={stratagem.icon} glow={selected} />
      <span className="font-heading font-semibold text-sm uppercase tracking-wide text-center leading-tight">
        {stratagem.name}
      </span>
      <div className="flex gap-1.5">
        {stratagem.sequence.map((dir, i) => (
          <DirectionArrow key={i} direction={dir} state="pending" size={20} />
        ))}
      </div>
      <span className={`text-xs font-heading uppercase ${
        stratagem.tier === 'basic' ? 'text-hd-green'
          : stratagem.tier === 'advanced' ? 'text-hd-yellow'
            : 'text-hd-red'
      }`}>
        {stratagem.tier}
      </span>
    </motion.button>
  );
});
