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
import { checkSessionAchievements, checkLiveAchievement } from '../utils/achievementChecker';
import { useStatsStore as getStatsState } from '../stores/statsStore';
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
  const [penaltyMs, setPenaltyMs] = useState(0);
  const [isBoss, setIsBoss] = useState(false);

  const attemptStartRef = useRef(performance.now());
  const attemptErrorsRef = useRef(0);
  const totalTimeRef = useRef(0);
  const consecutiveFastRef = useRef(0);

  const currentStratagem = queue[currentIndex] ?? null;
  const isPlaying = state === 'playing';

  // Timer setup based on mode
  const timerInitialMs = useMemo(() => {
    switch (mode) {
      case 'time-attack': return timeAttackDuration * 1000;
      case 'survival': return survivalTimeLimit;
      case 'endless': return 10000;
      case 'boss-rush': return survivalTimeLimit;
      default: return 0;
    }
  }, [mode, timeAttackDuration, survivalTimeLimit]);

  const useCountdownTimer = mode === 'time-attack' || mode === 'survival' || mode === 'endless' || mode === 'boss-rush';

  const { timeMs, reset: resetTimer } = useTimer({
    initialMs: timerInitialMs,
    countDown: useCountdownTimer,
    active: isPlaying && useCountdownTimer,
    onComplete: () => {
      if (mode === 'survival' || mode === 'time-attack' || mode === 'endless' || mode === 'boss-rush') {
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

      // Boss Rush: x2 score during boss combos
      const bossMultiplier = isBoss ? 2 : 1;
      setScore((s) => s + scoreBreak.total * bossMultiplier);
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

      // Track consecutive fast completions
      if (timeMs < 1000) {
        consecutiveFastRef.current += 1;
      } else {
        consecutiveFastRef.current = 0;
      }

      // Live achievement checks
      checkLiveAchievement('combo-complete', {
        timeMs,
        consecutiveFastCount: consecutiveFastRef.current,
      });
      checkLiveAchievement('streak', { streak: newStreak, multiplier: newMult });

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
      const loopingModes: GameMode[] = ['survival', 'time-attack', 'endless', 'boss-rush'];
      if (nextIndex >= queue.length) {
        if (loopingModes.includes(mode)) {
          setCurrentIndex(0);
        } else {
          endGame();
        }
      } else {
        setCurrentIndex(nextIndex);
      }

      // Boss Rush: detect boss every 10 combos, speed up every 5
      if (mode === 'boss-rush') {
        setIsBoss(newStreak % 10 === 9); // next combo will be boss
        if (newStreak % 5 === 0) {
          setSurvivalTimeLimit((t) => Math.max(3000, t - 200));
          resetTimer(Math.max(3000, survivalTimeLimit - 200));
        } else {
          resetTimer(isBoss ? Math.max(3000, survivalTimeLimit - 2000) : survivalTimeLimit);
        }
      }

      // Survival: speed up every 5
      if (mode === 'survival' && newStreak % 5 === 0) {
        setSurvivalTimeLimit((t) => Math.max(2000, t - 300));
        resetTimer(Math.max(2000, survivalTimeLimit - 300));
      } else if (mode === 'survival') {
        resetTimer(survivalTimeLimit);
      }

      // Endless: reset timer to 10s on success
      if (mode === 'endless') {
        resetTimer(10000);
      }
    },
    [streak, multiplier, currentIndex, queue.length, mode, isBoss, audio, endGame, resetTimer, survivalTimeLimit, effects],
  );

  const handleError = useCallback(
    (_expected: Direction, _actual: Direction) => {
      setError(true);
      setInputIndex(0);
      attemptErrorsRef.current += 1;
      consecutiveFastRef.current = 0;
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

      if (mode === 'survival' || mode === 'boss-rush') { endGame(); return; }

      // Speed Run: +2s penalty
      if (mode === 'speed-run') {
        setPenaltyMs((p) => p + 2000);
      }

      // Endless: -3s from timer
      if (mode === 'endless') {
        resetTimer(Math.max(0, timeMs - 3000));
      }

      setTimeout(() => setError(false), 300);
    },
    [streak, mode, lives, audio, endGame, effects, resetTimer, timeMs],
  );

  useStratagemInput({
    stratagem: currentStratagem,
    active: isPlaying,
    onCorrectInput: handleCorrectInput,
    onComboComplete: handleComboComplete,
    onError: handleError,
  });

  // Record stats on game over + check leaderboard + achievements
  useEffect(() => {
    if (state !== 'game-over') return;
    const duration = totalTimeRef.current;
    const successes = attempts.filter((a) => a.success).length;
    const sessionStats = {
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
    };
    recordStats(sessionStats);

    // Check achievements with updated global stats
    checkSessionAchievements(sessionStats, getStatsState.getState());

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
    setPenaltyMs(0);
    setIsBoss(false);
    setSurvivalTimeLimit(8000);
    attemptStartRef.current = performance.now();
    attemptErrorsRef.current = 0;
    consecutiveFastRef.current = 0;
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
    penaltyMs,
    isBoss,
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
