import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { GameMode, StratagemAttempt } from '../../types';
import { Button } from '../ui/Button';
import { calculateAccuracy } from '../../utils/scoring';
import { stratagemMap } from '../../data/stratagems';
import { LeaderboardMini } from '../leaderboard/LeaderboardMini';

interface GameOverScreenProps {
  mode: GameMode;
  score: number;
  attempts: StratagemAttempt[];
  bestStreak: number;
  totalTimeMs: number;
  isNewRecord: boolean;
  onRestart: () => void;
  onMenu: () => void;
  onViewLeaderboard?: () => void;
}

export function GameOverScreen({
  mode,
  score,
  attempts,
  bestStreak,
  totalTimeMs,
  isNewRecord,
  onRestart,
  onMenu,
  onViewLeaderboard,
}: GameOverScreenProps) {
  const successes = attempts.filter((a) => a.success).length;
  const accuracy = calculateAccuracy(successes, attempts.length);
  const avgTime = successes > 0
    ? attempts.filter((a) => a.success).reduce((s, a) => s + a.timeMs, 0) / successes
    : 0;

  const [copied, setCopied] = useState(false);

  // Find fastest/slowest
  const successAttempts = attempts.filter((a) => a.success);
  const fastest = successAttempts.length > 0
    ? successAttempts.reduce((a, b) => (a.timeMs < b.timeMs ? a : b))
    : null;

  const modeLabel = mode.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const handleShare = useCallback(() => {
    const text = [
      'Stratagem Hero',
      `Mode : ${modeLabel} | Score : ${score.toLocaleString()}`,
      `Serie : ${bestStreak} | Precision : ${accuracy}%`,
      '#StratagemHero #Helldivers2',
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [modeLabel, score, bestStreak, accuracy]);

  return (
    <motion.div
      className="flex flex-col items-center gap-6 max-w-md mx-auto text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="font-display text-4xl text-hd-red uppercase tracking-widest"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        Mission Accomplie
      </motion.h1>

      {isNewRecord && (
        <motion.div
          className="font-display text-lg text-hd-yellow animate-pulse-yellow px-4 py-2 rounded border border-hd-yellow"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          NOUVEAU RECORD !
        </motion.div>
      )}

      {/* Score */}
      <motion.div
        className="font-display text-6xl text-hd-yellow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {score.toLocaleString()}
      </motion.div>

      {/* Stats grid - staggered reveal */}
      <motion.div
        className="grid grid-cols-2 gap-4 w-full"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } } }}
      >
        <StatBlock label="Completes" value={`${successes}/${attempts.length}`} />
        <StatBlock label="Precision" value={`${accuracy}%`} />
        <StatBlock label="Meilleure Serie" value={String(bestStreak)} />
        <StatBlock label="Temps Moyen" value={avgTime > 0 ? `${(avgTime / 1000).toFixed(2)}s` : '-'} />
        <StatBlock label="Temps Total" value={`${(totalTimeMs / 1000).toFixed(1)}s`} />
        {fastest && (
          <StatBlock
            label="Le Plus Rapide"
            value={`${(fastest.timeMs / 1000).toFixed(2)}s`}
            sub={stratagemMap.get(fastest.stratagemId)?.name}
          />
        )}
      </motion.div>

      {/* Leaderboard mini */}
      {mode !== 'free-practice' && (
        <LeaderboardMini mode={mode} highlightScore={score} />
      )}

      <div className="flex gap-3 mt-4">
        <Button variant="primary" size="lg" onClick={onRestart}>
          Rejouer (R)
        </Button>
        {onViewLeaderboard && (
          <Button variant="secondary" size="lg" onClick={onViewLeaderboard}>
            Scores
          </Button>
        )}
        <Button variant="secondary" size="lg" onClick={onMenu}>
          Menu (Echap)
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={handleShare}>
        {copied ? 'Copie !' : 'Partager'}
      </Button>

      <p className="text-xs text-hd-gray/50 font-heading uppercase tracking-wider mt-2">
        Mode : {modeLabel}
      </p>
    </motion.div>
  );
}

const statVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

function StatBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <motion.div variants={statVariants} className="bg-hd-dark border border-hd-border rounded p-3">
      <div className="text-xs text-hd-gray uppercase tracking-wider font-heading">{label}</div>
      <div className="font-display text-xl text-hd-white mt-1">{value}</div>
      {sub && <div className="text-xs text-hd-gray mt-0.5">{sub}</div>}
    </motion.div>
  );
}
