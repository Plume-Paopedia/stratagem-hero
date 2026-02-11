import { motion, AnimatePresence } from 'framer-motion';

interface HellpodDropProps {
  trigger: number;
  stratagemName?: string;
  multiplier?: number;
}

/**
 * Hellpod-style launch animation when a stratagem combo is completed.
 * Scales dramatically with streak multiplier.
 */
export function HellpodDrop({ trigger, stratagemName, multiplier = 1 }: HellpodDropProps) {
  const m = Math.min(multiplier, 4);
  const isMax = m >= 4;
  const isHigh = m >= 3;

  const flashScale = m === 1 ? 3 : m === 2 ? 4 : m === 3 ? 5 : 6;
  const flashOpacity = m === 1 ? 0.35 : m === 2 ? 0.45 : 0.55;
  const particleCount = m === 1 ? 6 : m === 2 ? 12 : m === 3 ? 16 : 24;
  const stampText = isMax ? 'ORBITAL CONFIRMED' : 'CONFIRMED';
  const stampSize = m === 1 ? 'text-lg' : m === 2 ? 'text-xl' : m === 3 ? 'text-2xl' : 'text-3xl';
  const duration = m === 1 ? 0.6 : m === 2 ? 0.7 : m === 3 ? 0.8 : 0.9;

  return (
    <AnimatePresence>
      {trigger > 0 && (
        <div
          key={`hellpod-${trigger}`}
          className="fixed inset-x-0 top-0 pointer-events-none z-40 flex flex-col items-center pt-16"
        >
          {/* x4: Full-screen white flash */}
          {isMax && (
            <motion.div
              className="fixed inset-0 bg-white"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}

          {/* Radial flash */}
          <motion.div
            className="absolute top-12 rounded-full"
            style={{
              width: m >= 3 ? 40 : 24,
              height: m >= 3 ? 40 : 24,
              background: `radial-gradient(circle, rgba(245,197,24,${flashOpacity}) 0%, transparent 70%)`,
            }}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: flashScale, opacity: 0 }}
            transition={{ duration: duration * 0.7, ease: 'easeOut' }}
          />

          {/* x2+: Expanding shockwave ring */}
          {m >= 2 && (
            <motion.div
              className="absolute top-14 rounded-full border-2 border-hd-yellow"
              style={{ width: 20, height: 20 }}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: m >= 3 ? 15 : 10, opacity: 0 }}
              transition={{ duration: duration * 0.6, ease: 'easeOut' }}
            />
          )}

          {/* x3+: Scanline burst — horizontal lines flash */}
          {isHigh && (
            <>
              {[0.3, 0.5, 0.7].map((yPos, i) => (
                <motion.div
                  key={`scan-${i}`}
                  className="fixed left-0 right-0 h-px bg-hd-yellow/40"
                  style={{ top: `${yPos * 100}%` }}
                  initial={{ scaleX: 0, opacity: 0.8 }}
                  animate={{ scaleX: 1, opacity: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                />
              ))}
            </>
          )}

          {/* Arrow shooting up */}
          <motion.div
            className="absolute top-16"
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -200, opacity: 0, scale: 0.5 }}
            transition={{ duration: duration * 0.6, ease: 'easeIn' }}
          >
            <svg width="28" height="42" viewBox="0 0 40 60">
              <polygon
                points="20,0 40,25 30,25 30,60 10,60 10,25 0,25"
                fill="#f5c518"
                filter="drop-shadow(0 0 10px rgba(245,197,24,0.8))"
              />
            </svg>
          </motion.div>

          {/* x3+: Arrow trail copies (motion blur) */}
          {isHigh && [1, 2, 3].map((i) => (
            <motion.div
              key={`trail-${i}`}
              className="absolute top-16"
              initial={{ y: 0, opacity: 0.3 / i, scale: 1 }}
              animate={{ y: -200, opacity: 0, scale: 0.5 }}
              transition={{ duration: duration * 0.6, ease: 'easeIn', delay: i * 0.03 }}
            >
              <svg width="28" height="42" viewBox="0 0 40 60">
                <polygon points="20,0 40,25 30,25 30,60 10,60 10,25 0,25" fill="#f5c518" opacity="0.3" />
              </svg>
            </motion.div>
          ))}

          {/* Trail particles */}
          {Array.from({ length: particleCount }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-20 rounded-full"
              style={{
                width: m >= 3 ? 3 : 2,
                height: m >= 3 ? 3 : 2,
                backgroundColor: '#f5c518',
              }}
              initial={{
                x: (Math.random() - 0.5) * 20,
                y: 0,
                opacity: 1,
              }}
              animate={{
                x: (Math.random() - 0.5) * (40 + m * 10),
                y: 20 + Math.random() * 30,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.3, delay: i * 0.015 }}
            />
          ))}

          {/* CONFIRMED / ORBITAL CONFIRMED stamp */}
          <motion.div
            className={`${stampSize} font-display text-hd-yellow tracking-[0.3em] uppercase`}
            style={{
              textShadow: isHigh
                ? '0 0 40px rgba(245,197,24,0.6), 0 0 80px rgba(245,197,24,0.3)'
                : '0 0 20px rgba(245,197,24,0.4)',
              filter: isMax ? 'drop-shadow(0 0 20px rgba(245,197,24,0.8))' : undefined,
            }}
            initial={{ scale: isMax ? 4 : 2, opacity: 0, rotate: -3 }}
            animate={{
              scale: 1,
              opacity: [0, 1, 1, 0],
              rotate: 0,
            }}
            transition={{
              duration,
              times: [0, 0.15, 0.6, 1],
              scale: isMax ? { type: 'spring', stiffness: 300, damping: 15 } : undefined,
            }}
          >
            {stampText}
          </motion.div>

          {/* x4: "HELL DIVE" subtitle */}
          {isMax && (
            <motion.div
              className="font-heading text-sm text-hd-red uppercase tracking-[0.2em] mt-0.5"
              style={{ textShadow: '0 0 20px rgba(255,51,51,0.5)' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1, times: [0, 0.2, 0.6, 1] }}
            >
              HELL DIVE
            </motion.div>
          )}

          {/* Stratagem name */}
          {stratagemName && (
            <motion.div
              className="font-heading text-xs text-hd-white/50 uppercase tracking-wider mt-1"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0, 0.7, 0.7, 0], y: 0 }}
              transition={{ duration, delay: 0.05, times: [0, 0.15, 0.6, 1] }}
            >
              {stratagemName}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
