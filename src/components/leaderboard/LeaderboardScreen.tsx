import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameMode } from '../../types';
import { useLeaderboardStore } from '../../stores/leaderboardStore';
import { Button } from '../ui/Button';

const MODES: { id: GameMode; label: string }[] = [
  { id: 'time-attack', label: 'Contre-la-Montre' },
  { id: 'accuracy', label: 'Precision' },
  { id: 'survival', label: 'Survie' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'daily-challenge', label: 'Quotidien' },
];

interface LeaderboardScreenProps {
  onClose: () => void;
  initialMode?: GameMode;
}

export function LeaderboardScreen({ onClose, initialMode }: LeaderboardScreenProps) {
  const [activeMode, setActiveMode] = useState<GameMode>(initialMode ?? 'time-attack');
  const getEntries = useLeaderboardStore((s) => s.getEntries);
  const entries = getEntries(activeMode);

  return (
    <div className="h-full flex flex-col items-center gap-6 p-6 overflow-y-auto">
      <motion.h2
        className="font-display text-2xl text-hd-yellow uppercase tracking-[0.3em]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Meilleurs Scores
      </motion.h2>

      <div className="flex flex-wrap justify-center gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMode(m.id)}
            className={`px-3 py-1.5 text-xs font-heading uppercase tracking-wider rounded border cursor-pointer transition-colors ${
              activeMode === m.id
                ? 'bg-hd-yellow/20 text-hd-yellow border-hd-yellow/50'
                : 'text-hd-gray border-hd-border hover:text-hd-white hover:border-hd-gray'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-[2.5rem_3rem_1fr_5rem_3.5rem] gap-2 px-3 py-2 text-xs font-heading uppercase tracking-wider text-hd-gray border-b border-hd-border">
          <span>Rang</span>
          <span>Nom</span>
          <span />
          <span className="text-right">Score</span>
          <span className="text-right">Serie</span>
        </div>

        {Array.from({ length: 10 }, (_, i) => {
          const entry = entries[i];
          const rank = i + 1;
          const isTop3 = rank <= 3;
          const rankColors = ['text-hd-yellow', 'text-hd-gray', 'text-amber-600'];

          return (
            <motion.div
              key={i}
              className={`grid grid-cols-[2.5rem_3rem_1fr_5rem_3.5rem] gap-2 px-3 py-2.5 border-b border-hd-border/30 ${
                entry ? 'bg-hd-dark/30' : 'bg-hd-dark/10 opacity-40'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: entry ? 1 : 0.4, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <span className={`font-display text-lg ${isTop3 ? rankColors[rank - 1] : 'text-hd-gray/60'}`}>
                {rank}
              </span>
              <span className={`font-display text-lg ${isTop3 && entry ? 'text-hd-white' : 'text-hd-gray'}`}>
                {entry?.initials ?? '---'}
              </span>
              <span />
              <span className={`font-display text-lg text-right ${isTop3 && entry ? 'text-hd-yellow' : 'text-hd-white/70'}`}>
                {entry ? entry.score.toLocaleString() : ''}
              </span>
              <span className="font-heading text-sm text-right text-hd-gray self-center">
                {entry ? `x${entry.bestStreak}` : ''}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      <Button variant="secondary" size="md" onClick={onClose}>
        Retour
      </Button>
    </div>
  );
}
