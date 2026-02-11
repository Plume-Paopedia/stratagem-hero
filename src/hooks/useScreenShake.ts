import { useCallback, useRef } from 'react';

interface ShakeConfig {
  intensity: number;
  duration: number;
}

export function useScreenShake(targetRef: React.RefObject<HTMLDivElement | null>) {
  const rafRef = useRef(0);
  const continuousRafRef = useRef(0);

  const shake = useCallback(
    ({ intensity, duration }: ShakeConfig) => {
      const el = targetRef.current;
      if (!el) return;

      const start = performance.now();
      const loop = (now: number) => {
        const elapsed = now - start;
        if (elapsed >= duration) {
          el.style.transform = '';
          return;
        }
        const decay = 1 - elapsed / duration;
        const dx = (Math.random() - 0.5) * 2 * intensity * decay;
        const dy = (Math.random() - 0.5) * 2 * intensity * decay;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        rafRef.current = requestAnimationFrame(loop);
      };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    },
    [targetRef],
  );

  const startContinuousShake = useCallback(
    (intensity: number) => {
      const el = targetRef.current;
      if (!el) return;

      const loop = () => {
        const dx = (Math.random() - 0.5) * 2 * intensity;
        const dy = (Math.random() - 0.5) * 2 * intensity;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        continuousRafRef.current = requestAnimationFrame(loop);
      };
      cancelAnimationFrame(continuousRafRef.current);
      continuousRafRef.current = requestAnimationFrame(loop);
    },
    [targetRef],
  );

  const stopContinuousShake = useCallback(() => {
    cancelAnimationFrame(continuousRafRef.current);
    const el = targetRef.current;
    if (el) el.style.transform = '';
  }, [targetRef]);

  return { shake, startContinuousShake, stopContinuousShake };
}
