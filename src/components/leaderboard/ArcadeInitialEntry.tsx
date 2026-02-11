import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../../hooks/useAudio';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?_'.split('');

interface ArcadeInitialEntryProps {
  score: number;
  rank: number;
  onConfirm: (initials: string) => void;
  onCancel: () => void;
}

export function ArcadeInitialEntry({ score, rank, onConfirm, onCancel }: ArcadeInitialEntryProps) {
  const [slots, setSlots] = useState([0, 0, 0]); // indices into ALPHABET
  const [activeSlot, setActiveSlot] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const audio = useAudio();
  const lastKeyTime = useRef(0);

  const cycleUp = useCallback(() => {
    setDirection('up');
    setSlots((prev) => {
      const next = [...prev];
      next[activeSlot] = (next[activeSlot] + 1) % ALPHABET.length;
      return next;
    });
    audio.letterTick();
  }, [activeSlot, audio]);

  const cycleDown = useCallback(() => {
    setDirection('down');
    setSlots((prev) => {
      const next = [...prev];
      next[activeSlot] = (next[activeSlot] - 1 + ALPHABET.length) % ALPHABET.length;
      return next;
    });
    audio.letterTick();
  }, [activeSlot, audio]);

  const moveLeft = useCallback(() => {
    if (activeSlot > 0) {
      setActiveSlot((s) => s - 1);
      audio.menuClick();
    }
  }, [activeSlot, audio]);

  const moveRight = useCallback(() => {
    if (activeSlot < 2) {
      setActiveSlot((s) => s + 1);
      audio.menuClick();
    } else {
      // On last slot, right = confirm
      doConfirm();
    }
  }, [activeSlot, audio]);

  const doConfirm = useCallback(() => {
    if (confirmed) return;
    setConfirmed(true);
    audio.recordFanfare();
    const initials = slots.map((i) => ALPHABET[i]).join('');
    setTimeout(() => onConfirm(initials), 500);
  }, [confirmed, slots, audio, onConfirm]);

  useEffect(() => {
    if (confirmed) return;

    const handler = (e: KeyboardEvent) => {
      // Throttle rapid inputs (allow hold-to-scroll at ~8/sec)
      const now = performance.now();
      if (e.repeat && now - lastKeyTime.current < 100) return;
      lastKeyTime.current = now;

      e.preventDefault();
      e.stopPropagation();

      switch (e.code) {
        case 'KeyW': case 'ArrowUp': cycleUp(); break;
        case 'KeyS': case 'ArrowDown': cycleDown(); break;
        case 'KeyA': case 'ArrowLeft': moveLeft(); break;
        case 'KeyD': case 'ArrowRight': moveRight(); break;
        case 'Enter': case 'Space': doConfirm(); break;
        case 'Escape': onCancel(); break;
      }
    };

    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [confirmed, cycleUp, cycleDown, moveLeft, moveRight, doConfirm, onCancel]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-hd-black/85 backdrop-blur-sm" />

      <motion.div
        className="relative flex flex-col items-center gap-6 p-8 border border-hd-yellow/30 rounded-lg bg-hd-dark/95"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Title */}
        <div className="text-center">
          <h2 className="font-display text-2xl text-hd-red uppercase tracking-[0.3em]">
            Entrez vos Initiales
          </h2>
          <p className="font-heading text-sm text-hd-gray uppercase tracking-wider mt-1">
            Meilleur Score !
          </p>
        </div>

        {/* Letter slots */}
        <div className="flex gap-4">
          {slots.map((charIdx, slotIdx) => {
            const isActive = slotIdx === activeSlot && !confirmed;
            return (
              <div key={slotIdx} className="flex flex-col items-center gap-1">
                {/* Up arrow hint */}
                <motion.div
                  className={`text-xs ${isActive ? 'text-hd-yellow' : 'text-transparent'}`}
                  animate={isActive ? { opacity: [0.3, 0.8, 0.3] } : { opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ▲
                </motion.div>

                {/* Letter box */}
                <motion.div
                  className={`w-16 h-20 flex items-center justify-center rounded border-2 ${
                    isActive
                      ? 'border-hd-yellow shadow-[0_0_20px_rgba(245,197,24,0.3)]'
                      : confirmed
                        ? 'border-hd-yellow/60'
                        : 'border-hd-border'
                  }`}
                  animate={isActive ? {
                    borderColor: ['rgba(245,197,24,1)', 'rgba(245,197,24,0.5)', 'rgba(245,197,24,1)'],
                  } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={charIdx}
                      className={`font-display text-5xl ${
                        isActive ? 'text-hd-yellow' : 'text-hd-white'
                      }`}
                      initial={{ y: direction === 'up' ? 20 : -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: direction === 'up' ? -20 : 20, opacity: 0 }}
                      transition={{ duration: 0.06 }}
                    >
                      {ALPHABET[charIdx]}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>

                {/* Down arrow hint */}
                <motion.div
                  className={`text-xs ${isActive ? 'text-hd-yellow' : 'text-transparent'}`}
                  animate={isActive ? { opacity: [0.3, 0.8, 0.3] } : { opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ▼
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Score and rank */}
        <div className="text-center">
          <div className="font-display text-3xl text-hd-yellow">
            {score.toLocaleString()}
          </div>
          <div className="font-heading text-sm text-hd-yellow/70 uppercase tracking-wider mt-1">
            Rang #{rank}
          </div>
        </div>

        {/* Controls hint */}
        <div className="flex flex-wrap justify-center gap-3 text-xs text-hd-gray/50 font-heading uppercase tracking-wider">
          <span>↑↓ Lettre</span>
          <span>←→ Case</span>
          <span>Entree = OK</span>
          <span>Echap = Passer</span>
        </div>

        {/* Confirmed flash */}
        <AnimatePresence>
          {confirmed && (
            <motion.div
              className="absolute inset-0 bg-hd-yellow/20 rounded-lg"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
