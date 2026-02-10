import { useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import type { Direction } from '../types';

/** Maps a keyboard event code to a direction, or null */
export function useKeyBindings() {
  const keyBindings = useSettingsStore((s) => s.keyBindings);

  const codeToDirection = useCallback(
    (code: string): Direction | null => {
      if (keyBindings.up.includes(code)) return 'up';
      if (keyBindings.down.includes(code)) return 'down';
      if (keyBindings.left.includes(code)) return 'left';
      if (keyBindings.right.includes(code)) return 'right';
      return null;
    },
    [keyBindings],
  );

  const isConfirm = useCallback(
    (code: string) => keyBindings.confirm.includes(code),
    [keyBindings],
  );

  const isBack = useCallback(
    (code: string) => keyBindings.back.includes(code),
    [keyBindings],
  );

  const isRestart = useCallback(
    (code: string) => keyBindings.restart.includes(code),
    [keyBindings],
  );

  return { codeToDirection, isConfirm, isBack, isRestart };
}
