import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GameMode, Stratagem, StratagemCategory, AppScreen } from './types';
import { stratagems, getByCategory } from './data/stratagems';
import type { CustomModeConfig } from './types/customMode';
import { CategorySelect } from './components/game/CategorySelect';
import { CustomModeBuilder } from './components/customMode/CustomModeBuilder';
import { useCustomModeStore } from './stores/customModeStore';
import { getConfigFromUrl } from './utils/customModeEncoding';
import { getDailySeed, seededRandom } from './utils/scoring';
import { useSettingsStore } from './stores/settingsStore';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { GameScreen } from './components/game/GameScreen';
import { Button } from './components/ui/Button';
import { ScanlineOverlay } from './components/ui/ScanlineOverlay';
import { AmbientParticles } from './components/ui/AmbientParticles';
import { FactionBackground } from './components/ui/FactionBackground';
import { LoadingSkeleton } from './components/ui/LoadingSkeleton';
import { ScreenErrorBoundary } from './components/errors/ScreenErrorBoundary';
import { useAudio } from './hooks/useAudio';
import { useFactionStore } from './stores/factionStore';

import { AchievementToast } from './components/achievements/AchievementToast';

// Lazy-loaded screens
const StratagemGrid = lazy(() => import('./components/stratagem/StratagemGrid').then(m => ({ default: m.StratagemGrid })));
const SettingsPanel = lazy(() => import('./components/settings/SettingsPanel').then(m => ({ default: m.SettingsPanel })));
const StatsOverview = lazy(() => import('./components/stats/StatsOverview').then(m => ({ default: m.StatsOverview })));
const LeaderboardScreen = lazy(() => import('./components/leaderboard/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })));
const AchievementsScreen = lazy(() => import('./components/achievements/AchievementsScreen').then(m => ({ default: m.AchievementsScreen })));

function shuffleArray<T>(arr: T[], rng: () => number = Math.random): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const gameModes: { id: GameMode; name: string; icon: string; desc: string }[] = [
  { id: 'free-practice', name: 'Free Practice', icon: '\u{1F3CB}\uFE0F', desc: 'Practice at your own pace. No timer, no pressure.' },
  { id: 'time-attack', name: 'Time Attack', icon: '\u23F1\uFE0F', desc: 'Score as many combos as possible before time runs out.' },
  { id: 'accuracy', name: 'Accuracy Challenge', icon: '\u{1F3AF}', desc: 'Complete a set number of combos with maximum precision.' },
  { id: 'survival', name: 'Survival', icon: '\u{1F525}', desc: 'Endless combos with decreasing time limits. One mistake = game over.' },
  { id: 'quiz', name: 'Quiz', icon: '\u{1F4DA}', desc: 'Enter combos from memory. Only the name is shown. 3 lives.' },
  { id: 'daily-challenge', name: 'Daily Challenge', icon: '\u{1F3B2}', desc: 'Same challenge for everyone today. One attempt!' },
  { id: 'speed-run', name: 'Speed Run', icon: '\u{1F3C3}', desc: 'Complete all 61 stratagems ASAP. Errors add +2s penalty.' },
  { id: 'endless', name: 'Endless', icon: '\u267E\uFE0F', desc: 'Timer resets on success. Errors subtract 3s. How far can you go?' },
  { id: 'category-challenge', name: 'Category', icon: '\u{1F4C2}', desc: 'Master one category. Pick your specialty and race the clock.' },
  { id: 'boss-rush', name: 'Boss Rush', icon: '\u{1F480}', desc: 'Every 10 combos a boss appears. Harder combos, double points.' },
  { id: 'custom', name: 'Custom', icon: '\u{1F6E0}\uFE0F', desc: 'Build your own rules. Save presets. Share via URL.' },
];

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [leaderboardMode, setLeaderboardMode] = useState<GameMode | undefined>(undefined);
  const [selectedStratagems, setSelectedStratagems] = useState<Set<string>>(new Set());
  const [gameQueue, setGameQueue] = useState<Stratagem[]>([]);
  const settings = useSettingsStore();
  const audio = useAudio();
  const activeFaction = useFactionStore((s) => s.activeFaction);

  const handleModeSelect = useCallback((mode: GameMode) => {
    audio.menuClick();
    setSelectedMode(mode);

    if (mode === 'daily-challenge') {
      const seed = getDailySeed();
      const rng = seededRandom(seed);
      const queue = shuffleArray(stratagems, rng).slice(0, 30);
      setGameQueue(queue);
      setScreen('game');
      return;
    }

    if (mode === 'time-attack' || mode === 'survival' || mode === 'quiz' || mode === 'endless' || mode === 'boss-rush') {
      const queue = shuffleArray(stratagems).concat(shuffleArray(stratagems)).concat(shuffleArray(stratagems));
      setGameQueue(queue);
      setScreen('game');
      return;
    }

    if (mode === 'accuracy') {
      const queue = shuffleArray(stratagems).slice(0, settings.accuracyTargetCount);
      setGameQueue(queue);
      setScreen('game');
      return;
    }

    if (mode === 'speed-run') {
      const queue = shuffleArray(stratagems);
      setGameQueue(queue);
      setScreen('game');
      return;
    }

    if (mode === 'category-challenge') {
      setScreen('category-select');
      return;
    }

    if (mode === 'custom') {
      setScreen('custom-builder');
      return;
    }

    setScreen('stratagem-select');
  }, [audio, settings.accuracyTargetCount]);

  const handleCategorySelect = useCallback((category: StratagemCategory) => {
    audio.menuClick();
    const catStratagems = getByCategory(category);
    setGameQueue(shuffleArray(catStratagems));
    setScreen('game');
  }, [audio]);

  const setActiveConfig = useCustomModeStore((s) => s.setActiveConfig);

  const handleCustomStart = useCallback((config: CustomModeConfig) => {
    audio.menuClick();
    setActiveConfig(config);
    setSelectedMode('custom');

    // Build queue based on config
    let pool = [...stratagems];
    if (config.queueSource === 'category' && config.category) {
      pool = getByCategory(config.category);
    } else if (config.queueSource === 'tier' && config.tier) {
      pool = stratagems.filter((s) => s.tier === config.tier);
    }

    let queue = config.shuffle ? shuffleArray(pool) : pool;
    if (config.queueLength > 0) {
      queue = queue.slice(0, config.queueLength);
    }

    // For looping modes (survival/countdown), repeat the queue
    if (config.timerType === 'survival' || config.timerType === 'countdown') {
      queue = queue.concat(shuffleArray(pool)).concat(shuffleArray(pool));
    }

    setGameQueue(queue);
    setScreen('game');
  }, [audio, setActiveConfig]);

  // Detect #custom=... URL hash on mount
  useEffect(() => {
    const config = getConfigFromUrl();
    if (config) {
      window.history.replaceState(null, '', window.location.pathname);
      handleCustomStart(config);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleStratagem = useCallback((id: string) => {
    setSelectedStratagems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleStartFreePractice = useCallback(() => {
    if (selectedStratagems.size === 0) return;
    const selected = stratagems.filter((s) => selectedStratagems.has(s.id));
    const repeated: Stratagem[] = [];
    for (let i = 0; i < 10; i++) {
      repeated.push(...shuffleArray(selected));
    }
    setGameQueue(repeated);
    setScreen('game');
  }, [selectedStratagems]);

  const handleSelectAll = useCallback(() => {
    if (selectedStratagems.size === stratagems.length) {
      setSelectedStratagems(new Set());
    } else {
      setSelectedStratagems(new Set(stratagems.map((s) => s.id)));
    }
  }, [selectedStratagems.size]);

  const goHome = useCallback(() => {
    setScreen('menu');
    setSelectedMode(null);
  }, []);

  const goToLeaderboard = useCallback((mode?: GameMode) => {
    setLeaderboardMode(mode);
    setScreen('leaderboard');
  }, []);

  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  return (
    <div className="h-full flex flex-col relative z-10" data-faction={activeFaction ?? undefined}>
      {/* Global ambient effects */}
      {!reducedMotion && <AmbientParticles />}
      <FactionBackground />
      <ScanlineOverlay />

      <Header
        onStats={() => setScreen('stats')}
        onSettings={() => setScreen('settings')}
        onLeaderboard={() => goToLeaderboard()}
        onAchievements={() => setScreen('achievements')}
        onHome={goHome}
        showBack={screen !== 'menu'}
      />

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {screen === 'menu' && (
            <PageTransition key="menu">
              <MainMenu onModeSelect={handleModeSelect} />
            </PageTransition>
          )}

          {screen === 'category-select' && (
            <PageTransition key="category-select">
              <CategorySelect onSelect={handleCategorySelect} onBack={goHome} />
            </PageTransition>
          )}

          {screen === 'stratagem-select' && (
            <PageTransition key="stratagem-select">
              <ScreenErrorBoundary onReset={goHome}>
                <div className="h-full flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl text-hd-yellow uppercase tracking-wider">
                      Select Stratagems
                    </h2>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                        {selectedStratagems.size === stratagems.length ? 'Deselect All' : 'Select All'}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleStartFreePractice}
                        disabled={selectedStratagems.size === 0}
                      >
                        Start ({selectedStratagems.size})
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <Suspense fallback={<LoadingSkeleton lines={5} />}>
                      <StratagemGrid
                        selected={selectedStratagems}
                        onToggle={handleToggleStratagem}
                      />
                    </Suspense>
                  </div>
                </div>
              </ScreenErrorBoundary>
            </PageTransition>
          )}

          {screen === 'game' && selectedMode && (
            <PageTransition key="game">
              <ScreenErrorBoundary onReset={goHome}>
                <GameScreen
                  mode={selectedMode}
                  queue={gameQueue}
                  onExit={goHome}
                  onViewLeaderboard={goToLeaderboard}
                />
              </ScreenErrorBoundary>
            </PageTransition>
          )}

          {screen === 'stats' && (
            <PageTransition key="stats">
              <ScreenErrorBoundary onReset={goHome}>
                <Suspense fallback={<LoadingSkeleton lines={4} />}>
                  <StatsOverview onClose={goHome} />
                </Suspense>
              </ScreenErrorBoundary>
            </PageTransition>
          )}

          {screen === 'settings' && (
            <PageTransition key="settings">
              <ScreenErrorBoundary onReset={goHome}>
                <Suspense fallback={<LoadingSkeleton lines={4} />}>
                  <SettingsPanel onClose={goHome} />
                </Suspense>
              </ScreenErrorBoundary>
            </PageTransition>
          )}

          {screen === 'leaderboard' && (
            <PageTransition key="leaderboard">
              <ScreenErrorBoundary onReset={goHome}>
                <Suspense fallback={<LoadingSkeleton lines={4} />}>
                  <LeaderboardScreen onClose={goHome} initialMode={leaderboardMode} />
                </Suspense>
              </ScreenErrorBoundary>
            </PageTransition>
          )}

          {screen === 'custom-builder' && (
            <PageTransition key="custom-builder">
              <ScreenErrorBoundary onReset={goHome}>
                <CustomModeBuilder onStart={handleCustomStart} onClose={goHome} />
              </ScreenErrorBoundary>
            </PageTransition>
          )}

          {screen === 'achievements' && (
            <PageTransition key="achievements">
              <ScreenErrorBoundary onReset={goHome}>
                <Suspense fallback={<LoadingSkeleton lines={4} />}>
                  <AchievementsScreen onClose={goHome} />
                </Suspense>
              </ScreenErrorBoundary>
            </PageTransition>
          )}
        </AnimatePresence>
      </main>

      <AchievementToast />
      <Footer />
    </div>
  );
}

function MainMenu({ onModeSelect }: { onModeSelect: (mode: GameMode) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-5xl mb-3">&#x1F985;</div>
        <h1 className="font-display text-3xl md:text-4xl text-hd-yellow tracking-[0.3em] uppercase">
          Stratagem Hero
        </h1>
        <p className="font-heading text-hd-gray mt-2 tracking-wider uppercase text-sm">
          Helldivers 2 Combo Trainer
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {gameModes.map((mode, i) => (
          <motion.button
            key={mode.id}
            onClick={() => onModeSelect(mode.id)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="flex flex-col items-start gap-2 p-5 bg-hd-panel border border-hd-border rounded-lg
                       hover:border-hd-yellow/50 transition-colors text-left cursor-pointer
                       hover:shadow-[0_0_20px_rgba(245,197,24,0.08)]"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{mode.icon}</span>
              <span className="font-heading font-bold text-hd-white uppercase tracking-wider">
                {mode.name}
              </span>
            </div>
            <p className="text-xs text-hd-gray leading-relaxed">{mode.desc}</p>
          </motion.button>
        ))}
      </motion.div>

      <div className="text-xs text-hd-gray/30 text-center font-heading uppercase tracking-wider md:hidden">
        Best experienced with a keyboard or gamepad
      </div>
    </div>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
