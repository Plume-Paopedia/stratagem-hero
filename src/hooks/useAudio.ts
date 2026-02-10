import { useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import * as audio from '../utils/audio';

/** Hook providing themed sound effects */
export function useAudio() {
  const masterVolume = useSettingsStore((s) => s.masterVolume);
  const sfxEnabled = useSettingsStore((s) => s.sfxEnabled);

  const vol = sfxEnabled ? masterVolume / 100 : 0;

  const inputBeep = useCallback(() => {
    if (vol > 0) audio.playInputBeep(vol);
  }, [vol]);

  const successJingle = useCallback(() => {
    if (vol > 0) audio.playSuccessJingle(vol);
  }, [vol]);

  const errorBuzz = useCallback(() => {
    if (vol > 0) audio.playErrorBuzz(vol);
  }, [vol]);

  const streakUp = useCallback(
    (level: number) => {
      if (vol > 0) audio.playStreakUp(level, vol);
    },
    [vol],
  );

  const streakLost = useCallback(() => {
    if (vol > 0) audio.playStreakLost(vol);
  }, [vol]);

  const timerWarning = useCallback(() => {
    if (vol > 0) audio.playTimerWarning(vol);
  }, [vol]);

  const gameOver = useCallback(() => {
    if (vol > 0) audio.playGameOver(vol);
  }, [vol]);

  const menuClick = useCallback(() => {
    if (vol > 0) audio.playMenuClick(vol);
  }, [vol]);

  const countdownBeep = useCallback(
    (num: number) => {
      if (vol > 0) audio.playCountdownBeep(num, vol);
    },
    [vol],
  );

  const deploySound = useCallback(() => {
    if (vol > 0) audio.playDeploySound(vol);
  }, [vol]);

  const recordFanfare = useCallback(() => {
    if (vol > 0) audio.playRecordFanfare(vol);
  }, [vol]);

  return {
    inputBeep,
    successJingle,
    errorBuzz,
    streakUp,
    streakLost,
    timerWarning,
    gameOver,
    menuClick,
    countdownBeep,
    deploySound,
    recordFanfare,
  };
}
