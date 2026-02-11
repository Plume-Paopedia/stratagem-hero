import { motion, AnimatePresence } from 'framer-motion';
import { useFactionStore } from '../../stores/factionStore';
import { FactionIcon } from './FactionIcon';

interface StreakAnnouncementProps {
  multiplier: number;
  trigger: number;
}

const ANNOUNCEMENTS: Record<number, { text: string; color: string; glowColor: string }> = {
  2: {
    text: 'DOUBLE TIME',
    color: 'text-hd-yellow',
    glowColor: 'rgba(245,197,24,0.5)',
  },
  3: {
    text: 'FIRE SUPERIORITY',
    color: 'text-orange-400',
    glowColor: 'rgba(255,150,50,0.5)',
  },
  4: {
    text: 'ORBITAL AUTHORITY',
    color: 'text-hd-red',
    glowColor: 'rgba(255,51,51,0.6)',
  },
};

export function StreakAnnouncement({ multiplier, trigger }: StreakAnnouncementProps) {
  const faction = useFactionStore((s) => s.activeFaction);
  const m = Math.min(multiplier, 4);
  const config = ANNOUNCEMENTS[m];

  if (!config || trigger <= 0) return null;

  const isMax = m >= 4;
  const duration = m === 2 ? 0.5 : m === 3 ? 0.7 : 1.0;

  return (
    <AnimatePresence>
      <div
        key={`announcement-${trigger}`}
        className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      >
        {/* x4: Darkened backdrop */}
        {isMax && (
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: duration * 0.8, times: [0, 0.1, 0.5, 1] }}
          />
        )}

        {/* Horizontal decorative lines (x3+) */}
        {m >= 3 && (
          <>
            <motion.div
              className="absolute h-px w-0"
              style={{ backgroundColor: config.glowColor, top: '47%' }}
              initial={{ width: 0 }}
              animate={{ width: ['0%', '60%', '60%', '0%'] }}
              transition={{ duration, times: [0, 0.2, 0.6, 1] }}
            />
            <motion.div
              className="absolute h-px w-0"
              style={{ backgroundColor: config.glowColor, top: '53%' }}
              initial={{ width: 0 }}
              animate={{ width: ['0%', '60%', '60%', '0%'] }}
              transition={{ duration, times: [0, 0.2, 0.6, 1] }}
            />
          </>
        )}

        {/* Main text */}
        <motion.div
          className={`font-display ${m >= 4 ? 'text-4xl' : m >= 3 ? 'text-3xl' : 'text-2xl'} ${config.color} tracking-[0.4em] uppercase`}
          style={{
            textShadow: `0 0 30px ${config.glowColor}, 0 0 60px ${config.glowColor}`,
          }}
          initial={{ scale: isMax ? 5 : 2.5, opacity: 0 }}
          animate={{
            scale: [isMax ? 5 : 2.5, 1, 1, 0.9],
            opacity: [0, 1, 1, 0],
          }}
          transition={
            isMax
              ? { duration, times: [0, 0.15, 0.6, 1], scale: { type: 'spring', stiffness: 200, damping: 12 } }
              : { duration, times: [0, 0.15, 0.6, 1] }
          }
        >
          {config.text}
        </motion.div>

        {/* Multiplier badge */}
        <motion.div
          className={`absolute font-display ${config.color} text-lg tracking-[0.2em]`}
          style={{
            top: '55%',
            textShadow: `0 0 15px ${config.glowColor}`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 0.8, 0.8, 0], y: 0 }}
          transition={{ duration: duration * 0.8, delay: 0.1, times: [0, 0.2, 0.6, 1] }}
        >
          x{m} MULTIPLIER
        </motion.div>

        {/* x4: Faction icon */}
        {isMax && faction && (
          <motion.div
            className="absolute"
            style={{ top: '60%' }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.6, 0.6, 0], scale: [0, 1.2, 1, 0.8] }}
            transition={{ duration: 0.8, delay: 0.2, times: [0, 0.2, 0.6, 1] }}
          >
            <FactionIcon faction={faction} size={40} glow />
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
