import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { useSettingsStore } from '../../stores/settingsStore';

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
  interactive?: 'press-w' | 'do-combo';
}

const steps: TutorialStep[] = [
  {
    title: 'Welcome to Stratagem Hero!',
    description: 'Train your Helldivers 2 stratagem inputs and master every combo. For Super Earth!',
    icon: '\u{1F985}',
  },
  {
    title: 'This is a Stratagem Combo',
    description: 'Each stratagem has a directional sequence. Match the arrows from left to right to complete it.',
    icon: '\u2B06\uFE0F',
  },
  {
    title: 'Input with Keyboard or Gamepad',
    description: 'Use W/A/S/D or Arrow keys. Gamepads are also supported. Try pressing W or Up now!',
    icon: '\u2328\uFE0F',
    interactive: 'press-w',
  },
  {
    title: 'Complete Sequences',
    description: 'Chain correct inputs to complete combos. Speed and accuracy earn you more points.',
    icon: '\u26A1',
  },
  {
    title: 'Build Streaks',
    description: 'Consecutive correct combos build your streak multiplier: x2, x3, x4... The higher the multiplier, the more points you earn!',
    icon: '\u{1F525}',
  },
  {
    title: 'Choose Your Mode',
    description: "11 game modes await: Time Attack, Survival, Speed Run, Boss Rush, and more. You're ready, soldier!",
    icon: '\u{1F3AE}',
  },
];

interface TutorialOverlayProps {
  onComplete: () => void;
}

export function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const [interactionDone, setInteractionDone] = useState(false);
  const completeTutorial = useSettingsStore((s) => s.completeTutorial);

  const current = steps[step];

  const advance = useCallback(() => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      setInteractionDone(false);
    } else {
      completeTutorial();
      onComplete();
    }
  }, [step, completeTutorial, onComplete]);

  const skip = useCallback(() => {
    completeTutorial();
    onComplete();
  }, [completeTutorial, onComplete]);

  // Listen for W/ArrowUp on interactive step
  useEffect(() => {
    if (current.interactive !== 'press-w') return;

    const handler = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        setInteractionDone(true);
        setTimeout(advance, 600);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current.interactive, advance]);

  const canAdvance = !current.interactive || interactionDone;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-hd-panel border border-hd-border rounded-xl p-8 text-center"
      >
        <div className="text-5xl mb-4">{current.icon}</div>
        <h2 className="font-display text-xl text-hd-yellow uppercase tracking-wider mb-3">
          {current.title}
        </h2>
        <p className="text-sm text-hd-gray leading-relaxed mb-6">
          {current.description}
        </p>

        {/* Interactive feedback */}
        {current.interactive === 'press-w' && (
          <div className="mb-6">
            <AnimatePresence mode="wait">
              {!interactionDone ? (
                <motion.div
                  key="waiting"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-hd-dark border border-hd-yellow/50 rounded-lg"
                >
                  <span className="font-display text-lg text-hd-yellow">W</span>
                  <span className="text-xs text-hd-gray">or</span>
                  <span className="font-display text-lg text-hd-yellow">{'\u2191'}</span>
                </motion.div>
              ) : (
                <motion.div
                  key="done"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="text-3xl text-green-400"
                >
                  {'\u2705'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? 'bg-hd-yellow' : i < step ? 'bg-hd-yellow/40' : 'bg-hd-border'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <Button variant="ghost" size="sm" onClick={skip}>
            Skip Tutorial
          </Button>
          {canAdvance && (
            <Button variant="primary" size="sm" onClick={advance}>
              {step === steps.length - 1 ? "Let's Go!" : 'Next'}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
