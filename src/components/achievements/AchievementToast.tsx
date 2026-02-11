import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievementStore } from '../../stores/achievementStore';
import { achievementMap } from '../../data/achievements';
import { useAudio } from '../../hooks/useAudio';

export function AchievementToast() {
  const popToast = useAchievementStore((s) => s.popToast);
  const markNotified = useAchievementStore((s) => s.markNotified);
  const [current, setCurrent] = useState<string | null>(null);
  const audio = useAudio();

  const showNext = useCallback(() => {
    const next = popToast();
    if (next) {
      setCurrent(next);
      markNotified(next);
      audio.successJingle();
    }
  }, [popToast, markNotified, audio]);

  // Poll for new toasts
  useEffect(() => {
    if (current) return;
    const id = setInterval(showNext, 500);
    return () => clearInterval(id);
  }, [current, showNext]);

  // Auto-dismiss after 5s
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => setCurrent(null), 5000);
    return () => clearTimeout(timer);
  }, [current]);

  const def = current ? achievementMap.get(current) : null;

  return (
    <AnimatePresence>
      {def && (
        <motion.div
          key={current}
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-3 bg-hd-dark/95 border border-hd-yellow rounded-lg shadow-lg shadow-hd-yellow/10 backdrop-blur-sm cursor-pointer max-w-sm"
          onClick={() => setCurrent(null)}
        >
          <span className="text-3xl flex-shrink-0">{def.icon}</span>
          <div className="min-w-0">
            <div className="text-xs text-hd-yellow uppercase tracking-wider font-heading">
              Achievement Unlocked
            </div>
            <div className="font-heading font-bold text-hd-white text-sm truncate">
              {def.name}
            </div>
            <div className="text-xs text-hd-gray truncate">{def.description}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
