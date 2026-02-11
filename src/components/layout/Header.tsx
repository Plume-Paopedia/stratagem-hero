import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useSettingsStore } from '../../stores/settingsStore';

interface HeaderProps {
  onStats: () => void;
  onSettings: () => void;
  onLeaderboard: () => void;
  onHome: () => void;
  showBack?: boolean;
}

export function Header({ onStats, onSettings, onLeaderboard, onHome, showBack = false }: HeaderProps) {
  const musicEnabled = useSettingsStore((s) => s.musicEnabled);
  const toggleMusic = useSettingsStore((s) => s.toggleMusic);

  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-3 border-b border-hd-border bg-hd-dark/80 backdrop-blur-sm">
      <motion.div
        className="flex items-center gap-3 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        onClick={onHome}
      >
        {showBack && (
          <span className="text-hd-gray text-sm font-heading">&larr;</span>
        )}
        <span className="text-2xl">&#x1F985;</span>
        <div>
          <h1 className="font-display text-sm text-hd-yellow tracking-[0.2em] uppercase leading-none">
            Stratagem
          </h1>
          <h1 className="font-display text-xs text-hd-white/60 tracking-[0.15em] uppercase leading-none">
            Hero
          </h1>
        </div>
      </motion.div>

      <div className="flex gap-2 items-center">
        {/* Music toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleMusic}
          className={`w-8 h-8 flex items-center justify-center rounded cursor-pointer transition-colors ${
            musicEnabled
              ? 'text-hd-yellow bg-hd-yellow/10'
              : 'text-hd-gray hover:text-hd-white'
          }`}
          title={musicEnabled ? 'Music ON' : 'Music OFF'}
        >
          {musicEnabled ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </motion.button>

        <Button variant="ghost" size="sm" onClick={onLeaderboard}>
          Scores
        </Button>
        <Button variant="ghost" size="sm" onClick={onStats}>
          Stats
        </Button>
        <Button variant="ghost" size="sm" onClick={onSettings}>
          Settings
        </Button>
      </div>
    </header>
  );
}
