import { useEffect, type RefObject } from 'react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;

    const root = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const first = root.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [ref, active]);
}
