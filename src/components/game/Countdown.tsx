import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../../hooks/useAudio';
import { useFactionStore } from '../../stores/factionStore';
import { FACTIONS } from '../../types/factions';
import { FactionIcon } from '../ui/FactionIcon';

interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3);
  const { countdownBeep, deploySound } = useAudio();
  const faction = useFactionStore((s) => s.activeFaction);
  const factionTheme = faction ? FACTIONS[faction] : null;
  const ringColor = factionTheme ? factionTheme.colors.primary : '#f5c518';

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
      <div className="absolute">
        <motion.div
          className="w-64 h-64 rounded-full border"
          style={{ borderColor: `${ringColor}33` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border"
          style={{ borderColor: `${ringColor}26` }}
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-10 rounded-full border border-dashed"
          style={{ borderColor: `${ringColor}1a` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {faction && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FactionIcon faction={faction} size={32} glow />
            </motion.div>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-[1px]" style={{ backgroundColor: `${ringColor}1a` }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-[1px]" style={{ backgroundColor: `${ringColor}1a` }} />
        </div>

        {[0, 90, 180, 270].map((deg) => (
          <motion.div
            key={deg}
            className="absolute top-1/2 left-1/2 w-4 h-[2px]"
            style={{
              backgroundColor: `${ringColor}66`,
              transformOrigin: '0 50%',
              transform: `rotate(${deg}deg) translateX(128px)`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: deg / 360 }}
          />
        ))}
      </div>

      <motion.div
        className="absolute top-[20%] font-heading text-sm uppercase tracking-[0.5em]"
        style={{ color: `${ringColor}66` }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {factionTheme ? `Contact ${factionTheme.name}` : 'Verrouillage Orbital'} — Acquis
      </motion.div>

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
                DEPLOIEMENT !
              </span>
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

      <motion.div
        className="absolute bottom-[20%] font-heading text-xs uppercase tracking-[0.4em]"
        style={{ color: factionTheme ? `${ringColor}4d` : 'rgba(107,114,128,0.3)' }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {factionTheme ? factionTheme.tagline : 'Super Destroyer en Attente'}
      </motion.div>
    </div>
  );
}
