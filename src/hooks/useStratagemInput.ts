import { useCallback, useEffect, useRef } from 'react';
import type { Direction, Stratagem } from '../types';
import { useKeyBindings } from './useKeyBindings';
import { useGamepad } from './useGamepad';

interface UseStratagemInputOptions {
  stratagem: Stratagem | null;
  active: boolean;
  onCorrectInput: (dir: Direction, index: number) => void;
  onComboComplete: (stratagem: Stratagem) => void;
  onError: (expected: Direction, actual: Direction) => void;
}

export function useStratagemInput({
  stratagem,
  active,
  onCorrectInput,
  onComboComplete,
  onError,
}: UseStratagemInputOptions) {
  const { codeToDirection } = useKeyBindings();
  const inputIndexRef = useRef(0);

  const callbacksRef = useRef({ onCorrectInput, onComboComplete, onError });
  callbacksRef.current = { onCorrectInput, onComboComplete, onError };

  const stratagemRef = useRef(stratagem);
  stratagemRef.current = stratagem;

  useEffect(() => {
    inputIndexRef.current = 0;
  }, [stratagem?.id]);

  const handleDirection = useCallback(
    (dir: Direction) => {
      const s = stratagemRef.current;
      if (!s || !active) return;

      const expected = s.sequence[inputIndexRef.current];
      if (!expected) return;

      if (dir === expected) {
        const idx = inputIndexRef.current;
        inputIndexRef.current = idx + 1;
        callbacksRef.current.onCorrectInput(dir, idx);

        if (inputIndexRef.current >= s.sequence.length) {
          callbacksRef.current.onComboComplete(s);
          inputIndexRef.current = 0;
        }
      } else {
        callbacksRef.current.onError(expected, dir);
        inputIndexRef.current = 0;
      }
    },
    [active],
  );

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const dir = codeToDirection(e.code);
      if (dir) {
        e.preventDefault();
        handleDirection(dir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, codeToDirection, handleDirection]);

  useGamepad(handleDirection);

  const resetInput = useCallback(() => {
    inputIndexRef.current = 0;
  }, []);

  return { resetInput, currentIndex: inputIndexRef.current };
}
