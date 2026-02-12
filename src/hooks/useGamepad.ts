import { useEffect, useRef, useState, useCallback } from 'react';
import type { Direction } from '../types';
import { useSettingsStore } from '../stores/settingsStore';

interface GamepadState {
  connected: boolean;
  direction: Direction | null;
}

export function useGamepad(onDirection: (dir: Direction) => void) {
  const deadzone = useSettingsStore((s) => s.gamepadDeadzone);
  const [connected, setConnected] = useState(false);
  const lastDirection = useRef<Direction | null>(null);
  const rafRef = useRef<number>(0);
  const onDirectionRef = useRef(onDirection);
  onDirectionRef.current = onDirection;

  const getStickDirection = useCallback(
    (axisX: number, axisY: number): Direction | null => {
      if (Math.abs(axisX) < deadzone && Math.abs(axisY) < deadzone) return null;
      if (Math.abs(axisX) > Math.abs(axisY)) {
        return axisX > 0 ? 'right' : 'left';
      }
      return axisY > 0 ? 'down' : 'up';
    },
    [deadzone],
  );

  const getDpadDirection = useCallback((gamepad: Gamepad): Direction | null => {

    if (gamepad.buttons[12]?.pressed) return 'up';
    if (gamepad.buttons[13]?.pressed) return 'down';
    if (gamepad.buttons[14]?.pressed) return 'left';
    if (gamepad.buttons[15]?.pressed) return 'right';
    return null;
  }, []);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);

    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (gp) { setConnected(true); break; }
    }

    const poll = () => {
      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        if (!gp) continue;

        const dpad = getDpadDirection(gp);
        const stick = getStickDirection(gp.axes[0] ?? 0, gp.axes[1] ?? 0);
        const dir = dpad ?? stick;

        if (dir && dir !== lastDirection.current) {
          onDirectionRef.current(dir);
        }
        lastDirection.current = dir;
        break;
      }
      rafRef.current = requestAnimationFrame(poll);
    };

    rafRef.current = requestAnimationFrame(poll);

    return () => {
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
      cancelAnimationFrame(rafRef.current);
    };
  }, [getDpadDirection, getStickDirection]);

  return { connected } as GamepadState;
}
