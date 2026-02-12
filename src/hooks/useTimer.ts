import { useEffect, useRef, useCallback, useState } from 'react';

interface UseTimerOptions {
  initialMs: number;
  countDown?: boolean;
  onComplete?: () => void;
  active?: boolean;
}

export function useTimer({ initialMs, countDown = true, onComplete, active = false }: UseTimerOptions) {
  const [timeMs, setTimeMs] = useState(initialMs);
  const lastFrameRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const reset = useCallback((newMs?: number) => {
    setTimeMs(newMs ?? initialMs);
  }, [initialMs]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;

      setTimeMs((prev) => {
        const next = countDown ? prev - delta : prev + delta;
        if (countDown && next <= 0) {
          onCompleteRef.current?.();
          return 0;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [active, countDown]);

  return { timeMs, reset };
}
