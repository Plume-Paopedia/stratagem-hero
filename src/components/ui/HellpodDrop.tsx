import { motion, AnimatePresence } from 'framer-motion';

interface HellpodDropProps {
  trigger: number;
  stratagemName?: string;
}

/**
 * Hellpod-style launch animation when a stratagem combo is completed.
 * Shows "CONFIRMED" stamp at the top so it doesn't block the next combo.
 */
export function HellpodDrop({ trigger, stratagemName }: HellpodDropProps) {
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <div
          key={`hellpod-${trigger}`}
          className="fixed inset-x-0 top-0 pointer-events-none z-40 flex flex-col items-center pt-20"
        >
          {/* Radial flash — small, positioned at top */}
          <motion.div
            className="absolute top-16 w-20 h-20 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(245,197,24,0.35) 0%, transparent 70%)',
            }}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />

          {/* Arrow shooting up */}
          <motion.div
            className="absolute top-20"
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -200, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4, ease: 'easeIn' }}
          >
            <svg width="28" height="42" viewBox="0 0 40 60">
              <polygon
                points="20,0 40,25 30,25 30,60 10,60 10,25 0,25"
                fill="#f5c518"
                filter="drop-shadow(0 0 10px rgba(245,197,24,0.8))"
              />
            </svg>
          </motion.div>

          {/* Trail particles */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-24 w-1 h-1 bg-hd-yellow rounded-full"
              initial={{
                x: (Math.random() - 0.5) * 16,
                y: 0,
                opacity: 1,
              }}
              animate={{
                x: (Math.random() - 0.5) * 40,
                y: 20 + Math.random() * 30,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
            />
          ))}

          {/* CONFIRMED stamp */}
          <motion.div
            className="font-display text-lg text-hd-yellow tracking-[0.3em] uppercase
                       drop-shadow-[0_0_20px_rgba(245,197,24,0.6)]"
            style={{ textShadow: '0 0 20px rgba(245,197,24,0.4)' }}
            initial={{ scale: 2, opacity: 0, rotate: -3 }}
            animate={{ scale: 1, opacity: [0, 1, 1, 0], rotate: 0 }}
            transition={{ duration: 0.6, times: [0, 0.15, 0.6, 1] }}
          >
            CONFIRMED
          </motion.div>

          {/* Stratagem name below */}
          {stratagemName && (
            <motion.div
              className="font-heading text-xs text-hd-white/50 uppercase tracking-wider mt-1"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0, 0.7, 0.7, 0], y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, times: [0, 0.15, 0.6, 1] }}
            >
              {stratagemName}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
