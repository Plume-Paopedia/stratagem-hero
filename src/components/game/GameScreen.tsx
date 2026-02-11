import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Direction, Stratagem, GameMode, StratagemAttempt } from '../../types';
import { useStratagemInput } from '../../hooks/useStratagemInput';
import { useAudio } from '../../hooks/useAudio';
import { useTimer } from '../../hooks/useTimer';
import { useScreenShake } from '../../hooks/useScreenShake';
import { useSettingsStore } from '../../stores/settingsStore';
import { useStatsStore } from '../../stores/statsStore';
import { useFactionStore } from '../../stores/factionStore';
import { useLeaderboardStore } from '../../stores/leaderboardStore';
import { getStreakMultiplier, calculateScore, calculateAccuracy } from '../../utils/scoring';
import { ComboDisplay } from '../stratagem/ComboDisplay';
import { InputFeedback } from '../stratagem/InputFeedback';
import { ParticleEffect } from '../ui/ParticleEffect';
import { HellpodDrop } from '../ui/HellpodDrop';
import { StreakFire } from '../ui/StreakFire';
import { GlitchEffect } from '../ui/GlitchEffect';
import { StreakAnnouncement } from '../ui/StreakAnnouncement';
import { ArcadeInitialEntry } from '../leaderboard/ArcadeInitialEntry';
import { Countdown } from './Countdown';
import { Timer } from './Timer';
import { ScoreDisplay } from './ScoreDisplay';
import { StreakIndicator } from './StreakIndicator';
import { ComboQueue } from './ComboQueue';
import { GameOverScreen } from './GameOverScreen';

interface GameScreenProps {
  mode: GameMode;
  queue: Stratagem[];
  onExit: () => void;
  onViewLeaderboard?: (mode: GameMode) => void;
}

export function GameScreen({ mode, queue, onExit, onViewLeaderboard }: GameScreenProps) {
  const audio = useAudio();
  const timeAttackDuration = useSettingsStore((s) => s.timeAttackDuration);
  const randomizeFaction = useFactionStore((s) => s.randomizeFaction);
  const setFaction = useFactionStore((s) => s.setFaction);
  const qualifiesForLeaderboard = useLeaderboardStore((s) => s.qualifiesForLeaderboard);
  const getRankForScore = useLeaderboardStore((s) => s.getRankForScore);
  const addLeaderboardEntry = useLeaderboardStore((s) => s.addEntry);

  // Screen shake
  const shakeRef = useRef<HTMLDivElement>(null);
  const { shake, startContinuousShake, stopContinuousShake } = useScreenShake(shakeRef);

  // Local game state
  const [state, setState] = useState<'countdown' | 'playing' | 'game-over'>('countdown');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputIndex, setInputIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [attempts, setAttempts] = useState<StratagemAttempt[]>([]);
  const [error, setError] = useState(false);
  const [successTrigger, setSuccessTrigger] = useState(0);
  const [errorTrigger, setErrorTrigger] = useState(0);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [hellpodTrigger, setHellpodTrigger] = useState(0);
  const [glitchTrigger, setGlitchTrigger] = useState(0);
  const [streakAnnounceTrigger, setStreakAnnounceTrigger] = useState(0);
  const [lastCompletedName, setLastCompletedName] = useState('');
  const [showInitialEntry, setShowInitialEntry] = useState(false);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [lives, setLives] = useState(3);
  const [survivalTimeLimit, setSurvivalTimeLimit] = useState(8000);
  const attemptStartRef = useRef(performance.now());
  const attemptErrorsRef = useRef(0);
  const recordStats = useStatsStore((s) => s.recordSession);
  const bestScores = useStatsStore((s) => s.bestScores);
  const totalTimeRef = useRef(0);

  const currentStratagem = queue[currentIndex] ?? null;
  const isPlaying = state === 'playing';

  // Timer setup based on mode
  const timerInitialMs = useMemo(() => {
    switch (mode) {
      case 'time-attack': return timeAttackDuration * 1000;
      case 'survival': return survivalTimeLimit;
      default: return 0;
    }
  }, [mode, timeAttackDuration, survivalTimeLimit]);

  const useCountdownTimer = mode === 'time-attack' || mode === 'survival';

  const { timeMs, reset: resetTimer } = useTimer({
    initialMs: timerInitialMs,
    countDown: useCountdownTimer,
    active: isPlaying && useCountdownTimer,
    onComplete: () => {
      if (mode === 'survival' || mode === 'time-attack') {
        endGame();
      }
    },
  });

  // Elapsed timer for modes that count up
  const { timeMs: elapsedMs } = useTimer({
    initialMs: 0,
    countDown: false,
    active: isPlaying && !useCountdownTimer,
  });

  const endGame = useCallback(() => {
    setState('game-over');
    audio.gameOver();
    stopContinuousShake();
    setFaction(null);
    totalTimeRef.current = useCountdownTimer ? timerInitialMs - timeMs : elapsedMs;
  }, [audio, timerInitialMs, timeMs, elapsedMs, useCountdownTimer, stopContinuousShake, setFaction]);

  const handleCorrectInput = useCallback(
    (_dir: Direction, idx: number) => {
      setInputIndex(idx + 1);
      setError(false);
      audio.inputBeep();
    },
    [audio],
  );

  const handleComboComplete = useCallback(
    (strat: Stratagem) => {
      const timeMs = performance.now() - attemptStartRef.current;
      const newStreak = streak + 1;
      const newMult = getStreakMultiplier(newStreak);
      const scoreBreak = calculateScore(timeMs, strat.sequence.length, newMult);

      setScore((s) => s + scoreBreak.total);
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      setMultiplier(newMult);
      setInputIndex(0);

      const attempt: StratagemAttempt = {
        stratagemId: strat.id,
        success: true,
        timeMs,
        errors: attemptErrorsRef.current,
        inputSequence: strat.sequence,
        timestamp: Date.now(),
      };
      setAttempts((a) => [...a, attempt]);
      attemptStartRef.current = performance.now();
      attemptErrorsRef.current = 0;

      // Effects!
      audio.successJingle();
      setSuccessTrigger((t) => t + 1);
      setParticleTrigger((t) => t + 1);
      setHellpodTrigger((t) => t + 1);
      setLastCompletedName(strat.name);

      // Screen shake proportional to multiplier
      shake({ intensity: newMult * 2, duration: 150 + newMult * 50 });

      // Power audio at high multipliers
      if (newMult >= 3) {
        audio.powerSurge(newMult);
      }
      if (newMult >= 4) {
        audio.orbitalStrike();
      }

      if (newMult > multiplier) {
        audio.streakUp(newMult);
        setStreakAnnounceTrigger((t) => t + 1);
      }

      // Advance to next
      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (mode !== 'survival' && mode !== 'time-attack') {
          endGame();
        } else {
          setCurrentIndex(0);
        }
      } else {
        setCurrentIndex(nextIndex);
      }

      // Survival: speed up every 5
      if (mode === 'survival' && newStreak % 5 === 0) {
        setSurvivalTimeLimit((t) => Math.max(2000, t - 300));
        resetTimer(Math.max(2000, survivalTimeLimit - 300));
      } else if (mode === 'survival') {
        resetTimer(survivalTimeLimit);
      }
    },
    [streak, multiplier, currentIndex, queue.length, mode, audio, endGame, resetTimer, survivalTimeLimit, shake],
  );

  const handleError = useCallback(
    (_expected: Direction, _actual: Direction) => {
      setError(true);
      setInputIndex(0);
      setErrorTrigger((t) => t + 1);
      setGlitchTrigger((t) => t + 1);
      attemptErrorsRef.current += 1;
      audio.errorBuzz();

      if (streak > 0) {
        audio.streakLost();
      }
      setStreak(0);
      setMultiplier(1);
      stopContinuousShake();

      // Quiz mode: lose life
      if (mode === 'quiz') {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          endGame();
          return;
        }
      }

      // Survival: game over on error
      if (mode === 'survival') {
        endGame();
      }

      // Clear error indicator after delay
      setTimeout(() => setError(false), 300);
    },
    [streak, mode, lives, audio, endGame, stopContinuousShake],
  );

  useStratagemInput({
    stratagem: currentStratagem,
    active: isPlaying,
    onCorrectInput: handleCorrectInput,
    onComboComplete: handleComboComplete,
    onError: handleError,
  });

  // Continuous shake at x4
  useEffect(() => {
    if (isPlaying && multiplier >= 4) {
      startContinuousShake(1.5);
    } else {
      stopContinuousShake();
    }
  }, [isPlaying, multiplier, startContinuousShake, stopContinuousShake]);

  // Keyboard shortcuts (blocked during initial entry)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showInitialEntry) return; // ArcadeInitialEntry handles its own keys
      if (e.code === 'Escape') {
        if (state === 'playing') {
          endGame();
        } else {
          onExit();
        }
      }
      if (e.code === 'KeyR' && state === 'game-over') {
        restart();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, onExit, endGame, showInitialEntry]);

  // Record stats on game over + check leaderboard
  useEffect(() => {
    if (state !== 'game-over') return;
    const duration = totalTimeRef.current;
    const successes = attempts.filter((a) => a.success).length;
    recordStats({
      mode,
      date: Date.now(),
      duration,
      attempts,
      totalScore: score,
      accuracy: calculateAccuracy(successes, attempts.length),
      bestStreak,
      averageTimeMs:
        successes > 0
          ? attempts.filter((a) => a.success).reduce((s, a) => s + a.timeMs, 0) / successes
          : 0,
    });

    // Check if score qualifies for leaderboard
    if (qualifiesForLeaderboard(mode, score)) {
      const rank = getRankForScore(mode, score);
      setLeaderboardRank(rank);
      setShowInitialEntry(true);
    }
  }, [state]);

  const handleInitialConfirm = useCallback((initials: string) => {
    addLeaderboardEntry(mode, {
      initials,
      score,
      bestStreak,
      date: Date.now(),
    });
    setShowInitialEntry(false);
  }, [addLeaderboardEntry, mode, score, bestStreak]);

  const handleInitialCancel = useCallback(() => {
    setShowInitialEntry(false);
  }, []);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setInputIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setMultiplier(1);
    setAttempts([]);
    setShowInitialEntry(false);
    setLeaderboardRank(null);
    setLives(3);
    setSurvivalTimeLimit(8000);
    setHellpodTrigger(0);
    setGlitchTrigger(0);
    attemptStartRef.current = performance.now();
    attemptErrorsRef.current = 0;
    totalTimeRef.current = 0;
    setState('countdown');
  }, []);

  const onCountdownComplete = useCallback(() => {
    attemptStartRef.current = performance.now();
    if (useCountdownTimer) {
      resetTimer(timerInitialMs);
    }
    randomizeFaction();
    setState('playing');
  }, [resetTimer, timerInitialMs, useCountdownTimer, randomizeFaction]);

  const isNewRecord = state === 'game-over' && score > (bestScores[mode] ?? 0) && score > 0;

  return (
    <div ref={shakeRef} className="relative h-full flex flex-col">
      {/* Visual effects layers */}
      <InputFeedback successTrigger={successTrigger} errorTrigger={errorTrigger} multiplier={multiplier} />
      <HellpodDrop trigger={hellpodTrigger} stratagemName={lastCompletedName} multiplier={multiplier} />
      <GlitchEffect trigger={glitchTrigger} />
      <StreakFire multiplier={multiplier} active={isPlaying} />
      <StreakAnnouncement multiplier={multiplier} trigger={streakAnnounceTrigger} />

      {/* Countdown */}
      <AnimatePresence>
        {state === 'countdown' && <Countdown onComplete={onCountdownComplete} />}
      </AnimatePresence>

      {/* Game Over */}
      {state === 'game-over' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <GameOverScreen
            mode={mode}
            score={score}
            attempts={attempts}
            bestStreak={bestStreak}
            totalTimeMs={totalTimeRef.current}
            isNewRecord={isNewRecord}
            onRestart={restart}
            onMenu={onExit}
            onViewLeaderboard={onViewLeaderboard ? () => onViewLeaderboard(mode) : undefined}
          />
        </div>
      )}

      {/* Arcade initial entry overlay */}
      <AnimatePresence>
        {showInitialEntry && leaderboardRank != null && (
          <ArcadeInitialEntry
            score={score}
            rank={leaderboardRank}
            onConfirm={handleInitialConfirm}
            onCancel={handleInitialCancel}
          />
        )}
      </AnimatePresence>

      {/* Playing state */}
      {state === 'playing' && currentStratagem && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
          {/* Top bar */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <ScoreDisplay score={score} />
              <StreakIndicator streak={streak} multiplier={multiplier} />
            </div>

            <div className="flex flex-col items-end gap-2">
              {useCountdownTimer && <Timer timeMs={timeMs} />}
              {!useCountdownTimer && mode !== 'free-practice' && (
                <Timer timeMs={elapsedMs} warningMs={0} />
              )}
              {mode === 'quiz' && (
                <div className="font-display text-lg text-hd-white">
                  Lives: {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
                </div>
              )}
              {mode === 'accuracy' && (
                <div className="text-sm font-heading text-hd-gray">
                  {currentIndex + 1} / {queue.length}
                </div>
              )}
            </div>
          </div>

          {/* Center: Combo display */}
          <div className="relative">
            <ComboDisplay
              stratagem={currentStratagem}
              currentIndex={inputIndex}
              error={error}
              showName={true}
              hideSequence={mode === 'quiz'}
            />
            <ParticleEffect trigger={particleTrigger} multiplier={multiplier} />

            {mode === 'quiz' && (
              <p className="text-sm text-hd-gray mt-2 text-center">Enter the combo from memory!</p>
            )}
          </div>

          {/* Queue */}
          <ComboQueue queue={queue} currentIndex={currentIndex} />

          {/* Controls hint */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <div className="flex gap-4 text-xs text-hd-gray/50 font-heading uppercase tracking-wider">
              <span>WASD / Arrows = Directions</span>
              <span>Esc = Quit</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
