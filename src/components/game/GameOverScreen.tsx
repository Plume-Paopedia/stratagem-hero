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

  // Find fastest/slowest
  const successAttempts = attempts.filter((a) => a.success);
  const fastest = successAttempts.length > 0
    ? successAttempts.reduce((a, b) => (a.timeMs < b.timeMs ? a : b))
    : null;

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
        Mission Complete
      </motion.h1>

      {isNewRecord && (
        <motion.div
          className="font-display text-lg text-hd-yellow animate-pulse-yellow px-4 py-2 rounded border border-hd-yellow"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          NEW RECORD!
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

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <StatBlock label="Completed" value={`${successes}/${attempts.length}`} />
        <StatBlock label="Accuracy" value={`${accuracy}%`} />
        <StatBlock label="Best Streak" value={String(bestStreak)} />
        <StatBlock label="Avg Time" value={avgTime > 0 ? `${(avgTime / 1000).toFixed(2)}s` : '-'} />
        <StatBlock label="Total Time" value={`${(totalTimeMs / 1000).toFixed(1)}s`} />
        {fastest && (
          <StatBlock
            label="Fastest"
            value={`${(fastest.timeMs / 1000).toFixed(2)}s`}
            sub={stratagemMap.get(fastest.stratagemId)?.name}
          />
        )}
      </div>

      {/* Leaderboard mini */}
      {mode !== 'free-practice' && (
        <LeaderboardMini mode={mode} highlightScore={score} />
      )}

      <div className="flex gap-3 mt-4">
        <Button variant="primary" size="lg" onClick={onRestart}>
          Retry (R)
        </Button>
        {onViewLeaderboard && (
          <Button variant="secondary" size="lg" onClick={onViewLeaderboard}>
            Scores
          </Button>
        )}
        <Button variant="secondary" size="lg" onClick={onMenu}>
          Menu (Esc)
        </Button>
      </div>

      <p className="text-xs text-hd-gray/50 font-heading uppercase tracking-wider mt-4">
        Mode: {mode.replace('-', ' ')}
      </p>
    </motion.div>
  );
}

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
    <div className="bg-hd-dark border border-hd-border rounded p-3">
      <div className="text-xs text-hd-gray uppercase tracking-wider font-heading">{label}</div>
      <div className="font-display text-xl text-hd-white mt-1">{value}</div>
      {sub && <div className="text-xs text-hd-gray mt-0.5">{sub}</div>}
    </div>
  );
}
