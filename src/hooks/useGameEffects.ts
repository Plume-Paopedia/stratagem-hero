import { useState, useCallback, useRef } from 'react';
import { useScreenShake } from './useScreenShake';

export interface GameEffects {
  shakeRef: React.RefObject<HTMLDivElement | null>;
  successTrigger: number;
  errorTrigger: number;
  particleTrigger: number;
  hellpodTrigger: number;
  glitchTrigger: number;
  streakAnnounceTrigger: number;
  lastCompletedName: string;
  fireSuccess: (name: string, multiplier: number) => void;
  fireError: () => void;
  fireStreakUp: () => void;
  shake: (config: { intensity: number; duration: number }) => void;
  startContinuousShake: (intensity: number) => void;
  stopContinuousShake: () => void;
  resetEffects: () => void;
}

export function useGameEffects(): GameEffects {
  const shakeRef = useRef<HTMLDivElement>(null);
  const { shake, startContinuousShake, stopContinuousShake } = useScreenShake(shakeRef);

  const [successTrigger, setSuccessTrigger] = useState(0);
  const [errorTrigger, setErrorTrigger] = useState(0);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [hellpodTrigger, setHellpodTrigger] = useState(0);
  const [glitchTrigger, setGlitchTrigger] = useState(0);
  const [streakAnnounceTrigger, setStreakAnnounceTrigger] = useState(0);
  const [lastCompletedName, setLastCompletedName] = useState('');

  const fireSuccess = useCallback((name: string, newMult: number) => {
    setSuccessTrigger((t) => t + 1);
    setParticleTrigger((t) => t + 1);
    setHellpodTrigger((t) => t + 1);
    setLastCompletedName(name);
    shake({ intensity: newMult * 2, duration: 150 + newMult * 50 });
  }, [shake]);

  const fireError = useCallback(() => {
    setErrorTrigger((t) => t + 1);
    setGlitchTrigger((t) => t + 1);
  }, []);

  const fireStreakUp = useCallback(() => {
    setStreakAnnounceTrigger((t) => t + 1);
  }, []);

  const resetEffects = useCallback(() => {
    setHellpodTrigger(0);
    setGlitchTrigger(0);
  }, []);

  return {
    shakeRef,
    successTrigger,
    errorTrigger,
    particleTrigger,
    hellpodTrigger,
    glitchTrigger,
    streakAnnounceTrigger,
    lastCompletedName,
    fireSuccess,
    fireError,
    fireStreakUp,
    shake,
    startContinuousShake,
    stopContinuousShake,
    resetEffects,
  };
}
