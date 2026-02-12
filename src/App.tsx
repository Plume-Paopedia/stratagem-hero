import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { GameMode, Stratagem, StratagemCategory, AppScreen } from './types';
import { stratagems, getByCategory } from './data/stratagems';
import type { CustomModeConfig } from './types/customMode';
import { shuffleArray } from './utils/array';
import { CategorySelect } from './components/game/CategorySelect';
import { CustomModeBuilder } from './components/customMode/CustomModeBuilder';
import { useCustomModeStore } from './stores/customModeStore';
import { getConfigFromUrl } from './utils/customModeEncoding';
import { getDailySeed, seededRandom } from './utils/scoring';
import { useSettingsStore } from './stores/settingsStore';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MainMenu } from './components/layout/MainMenu';
import { PageTransition } from './components/layout/PageTransition';
import { GameScreen } from './components/game/GameScreen';
import { Button } from './components/ui/Button';
import { ScanlineOverlay } from './components/ui/ScanlineOverlay';
import { AmbientParticles } from './components/ui/AmbientParticles';
import { FactionBackground } from './components/ui/FactionBackground';
import { LoadingSkeleton } from './components/ui/LoadingSkeleton';
import { ScreenErrorBoundary } from './components/errors/ScreenErrorBoundary';
import { useAudio } from './hooks/useAudio';
import { useFactionStore } from './stores/factionStore';
import { switchTrack } from './utils/music';

import { AchievementToast } from './components/achievements/AchievementToast';
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { OfflineBanner } from './components/pwa/OfflineBanner';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';
import { SkipToContent } from './components/a11y/SkipToContent';

const StratagemGrid = lazy(() => import('./components/stratagem/StratagemGrid').then(m => ({ default: m.StratagemGrid })));
const SettingsPanel = lazy(() => import('./components/settings/SettingsPanel').then(m => ({ default: m.SettingsPanel })));
const StatsOverview = lazy(() => import('./components/stats/StatsOverview').then(m => ({ default: m.StatsOverview })));
const LeaderboardScreen = lazy(() => import('./components/leaderboard/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })));
const AchievementsScreen = lazy(() => import('./components/achievements/AchievementsScreen').then(m => ({ default: m.AchievementsScreen })));
const HowToPlayScreen = lazy(() => import('./components/help/HowToPlayScreen').then(m => ({ default: m.HowToPlayScreen })));

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [leaderboardMode, setLeaderboardMode] = useState<GameMode | undefined>(undefined);
  const [selectedStratagems, setSelectedStratagems] = useState<Set<string>>(new Set());
  const [gameQueue, setGameQueue] = useState<Stratagem[]>([]);
  const settings = useSettingsStore();
  const audio = useAudio();
  const activeFaction = useFactionStore((s) => s.activeFaction);
  const hasCompletedTutorial = useSettingsStore((s) => s.hasCompletedTutorial);
  const [showTutorial, setShowTutorial] = useState(!hasCompletedTutorial);

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

    if (config.timerType === 'survival' || config.timerType === 'countdown') {
      queue = queue.concat(shuffleArray(pool)).concat(shuffleArray(pool));
    }

    setGameQueue(queue);
    setScreen('game');
  }, [audio, setActiveConfig]);

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
    switchTrack('menu');
  }, []);

  const goToLeaderboard = useCallback((mode?: GameMode) => {
    setLeaderboardMode(mode);
    setScreen('leaderboard');
  }, []);

  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const colorblindMode = useSettingsStore((s) => s.colorblindMode);
  const highContrastMode = useSettingsStore((s) => s.highContrastMode);

  return (
    <div
      className="h-full flex flex-col relative z-10"
      data-faction={activeFaction ?? undefined}
      data-colorblind={colorblindMode !== 'default' ? colorblindMode : undefined}
      data-high-contrast={highContrastMode ? 'true' : undefined}
    >
      <SkipToContent />
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

      <main id="main-content" className="flex-1 overflow-hidden">
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
                      Selection des Stratagemes
                    </h2>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                        {selectedStratagems.size === stratagems.length ? 'Tout deselectionner' : 'Tout selectionner'}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleStartFreePractice}
                        disabled={selectedStratagems.size === 0}
                      >
                        Jouer ({selectedStratagems.size})
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

          {screen === 'help' && (
            <PageTransition key="help">
              <ScreenErrorBoundary onReset={goHome}>
                <Suspense fallback={<LoadingSkeleton lines={4} />}>
                  <HowToPlayScreen onClose={goHome} />
                </Suspense>
              </ScreenErrorBoundary>
            </PageTransition>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showTutorial && <TutorialOverlay onComplete={() => setShowTutorial(false)} />}
      </AnimatePresence>

      <AchievementToast />
      <OfflineBanner />
      <InstallPrompt />
      <Footer onHelp={() => setScreen('help')} />
    </div>
  );
}
