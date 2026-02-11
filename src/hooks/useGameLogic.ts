import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { Direction, Stratagem, GameMode, StratagemAttempt } from '../types';
import { useStratagemInput } from './useStratagemInput';
import { useAudio } from './useAudio';
import { useTimer } from './useTimer';
import { useSettingsStore } from '../stores/settingsStore';
import { useStatsStore } from '../stores/statsStore';
import { useFactionStore } from '../stores/factionStore';
import { useLeaderboardStore } from '../stores/leaderboardStore';
import { getStreakMultiplier, calculateScore, calculateAccuracy } from '../utils/scoring';
import type { GameEffects } from './useGameEffects';

interface UseGameLogicOptions {
  mode: GameMode;
  queue: Stratagem[];
  effects: GameEffects;
}

export function useGameLogic({ mode, queue, effects }: UseGameLogicOptions) {
  const audio = useAudio();
  const timeAttackDuration = useSettingsStore((s) => s.timeAttackDuration);
  const randomizeFaction = useFactionStore((s) => s.randomizeFaction);
  const setFaction = useFactionStore((s) => s.setFaction);
  const qualifiesForLeaderboard = useLeaderboardStore((s) => s.qualifiesForLeaderboard);
  const getRankForScore = useLeaderboardStore((s) => s.getRankForScore);
  const addLeaderboardEntry = useLeaderboardStore((s) => s.addEntry);
  const recordStats = useStatsStore((s) => s.recordSession);
  const bestScores = useStatsStore((s) => s.bestScores);

  // Game state
  const [state, setState] = useState<'countdown' | 'playing' | 'game-over'>('countdown');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputIndex, setInputIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [attempts, setAttempts] = useState<StratagemAttempt[]>([]);
  const [error, setError] = useState(false);
  const [lives, setLives] = useState(3);
  const [survivalTimeLimit, setSurvivalTimeLimit] = useState(8000);
  const [showInitialEntry, setShowInitialEntry] = useState(false);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);

  const attemptStartRef = useRef(performance.now());
  const attemptErrorsRef = useRef(0);
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

  const { timeMs: elapsedMs } = useTimer({
    initialMs: 0,
    countDown: false,
    active: isPlaying && !useCountdownTimer,
  });

  const endGame = useCallback(() => {
    setState('game-over');
    audio.gameOver();
    effects.stopContinuousShake();
    setFaction(null);
    totalTimeRef.current = useCountdownTimer ? timerInitialMs - timeMs : elapsedMs;
  }, [audio, timerInitialMs, timeMs, elapsedMs, useCountdownTimer, effects, setFaction]);

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

      // Trigger effects
      effects.fireSuccess(strat.name, newMult);
      audio.successJingle();

      if (newMult >= 3) audio.powerSurge(newMult);
      if (newMult >= 4) audio.orbitalStrike();

      if (newMult > multiplier) {
        audio.streakUp(newMult);
        effects.fireStreakUp();
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
    [streak, multiplier, currentIndex, queue.length, mode, audio, endGame, resetTimer, survivalTimeLimit, effects],
  );

  const handleError = useCallback(
    (_expected: Direction, _actual: Direction) => {
      setError(true);
      setInputIndex(0);
      attemptErrorsRef.current += 1;
      audio.errorBuzz();

      effects.fireError();

      if (streak > 0) audio.streakLost();
      setStreak(0);
      setMultiplier(1);
      effects.stopContinuousShake();

      if (mode === 'quiz') {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) { endGame(); return; }
      }

      if (mode === 'survival') { endGame(); }

      setTimeout(() => setError(false), 300);
    },
    [streak, mode, lives, audio, endGame, effects],
  );

  useStratagemInput({
    stratagem: currentStratagem,
    active: isPlaying,
    onCorrectInput: handleCorrectInput,
    onComboComplete: handleComboComplete,
    onError: handleError,
  });

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

    if (qualifiesForLeaderboard(mode, score)) {
      const rank = getRankForScore(mode, score);
      setLeaderboardRank(rank);
      setShowInitialEntry(true);
    }
  }, [state]);

  const handleInitialConfirm = useCallback((initials: string) => {
    addLeaderboardEntry(mode, { initials, score, bestStreak, date: Date.now() });
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
    attemptStartRef.current = performance.now();
    attemptErrorsRef.current = 0;
    totalTimeRef.current = 0;
    effects.resetEffects();
    setState('countdown');
  }, [effects]);

  const onCountdownComplete = useCallback(() => {
    attemptStartRef.current = performance.now();
    if (useCountdownTimer) resetTimer(timerInitialMs);
    randomizeFaction();
    setState('playing');
  }, [resetTimer, timerInitialMs, useCountdownTimer, randomizeFaction]);

  const isNewRecord = state === 'game-over' && score > (bestScores[mode] ?? 0) && score > 0;

  return {
    state,
    currentIndex,
    inputIndex,
    score,
    streak,
    bestStreak,
    multiplier,
    attempts,
    error,
    lives,
    currentStratagem,
    isPlaying,
    useCountdownTimer,
    timeMs,
    elapsedMs,
    showInitialEntry,
    leaderboardRank,
    isNewRecord,
    totalTimeMs: totalTimeRef.current,
    endGame,
    restart,
    onCountdownComplete,
    handleInitialConfirm,
    handleInitialCancel,
  };
}
