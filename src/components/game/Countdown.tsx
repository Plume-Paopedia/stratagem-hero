import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../../hooks/useAudio';

interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3);
  const { countdownBeep, deploySound } = useAudio();

  useEffect(() => {
    countdownBeep(count);

    if (count === 0) {
      deploySound();
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setCount((c) => c - 1), 900);
    return () => clearTimeout(t);
  }, [count, onComplete, countdownBeep, deploySound]);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-hd-black/90">
      {/* Orbital targeting rings */}
      <div className="absolute">
        <motion.div
          className="w-64 h-64 rounded-full border border-hd-yellow/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border border-hd-yellow/15"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-10 rounded-full border border-dashed border-hd-yellow/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-[1px] bg-hd-yellow/10" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-[1px] bg-hd-yellow/10" />
        </div>

        {/* Corner ticks on ring */}
        {[0, 90, 180, 270].map((deg) => (
          <motion.div
            key={deg}
            className="absolute top-1/2 left-1/2 w-4 h-[2px] bg-hd-yellow/40"
            style={{
              transformOrigin: '0 50%',
              transform: `rotate(${deg}deg) translateX(128px)`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: deg / 360 }}
          />
        ))}
      </div>

      {/* Status text at top */}
      <motion.div
        className="absolute top-[20%] font-heading text-sm text-hd-yellow/40 uppercase tracking-[0.5em]"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Orbital Lock Acquired
      </motion.div>

      {/* Main countdown number */}
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.3, opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center relative z-10"
        >
          {count > 0 ? (
            <>
              <span className="font-display text-[8rem] leading-none text-hd-yellow drop-shadow-[0_0_60px_rgba(245,197,24,0.6)]">
                {count}
              </span>
              {/* Pulse ring per count */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="w-32 h-32 rounded-full border-2 border-hd-yellow/40" />
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ letterSpacing: '0.5em' }}
              animate={{ letterSpacing: '0.3em' }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-display text-5xl md:text-7xl text-hd-yellow tracking-[0.3em] drop-shadow-[0_0_60px_rgba(245,197,24,0.8)]">
                DEPLOY!
              </span>
              {/* Explosion flash */}
              <motion.div
                className="fixed inset-0 bg-hd-yellow/20"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom status text */}
      <motion.div
        className="absolute bottom-[20%] font-heading text-xs text-hd-gray/30 uppercase tracking-[0.4em]"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Super Destroyer Standing By
      </motion.div>
    </div>
  );
}
