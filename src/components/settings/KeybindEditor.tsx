import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button } from '../ui/Button';
import type { KeyBindings } from '../../types';

interface KeybindEditorProps {
  onBack: () => void;
}

const bindingLabels: Record<keyof KeyBindings, string> = {
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  confirm: 'Confirm',
  back: 'Back / Pause',
  restart: 'Restart',
  pause: 'Pause',
};

export function KeybindEditor({ onBack }: KeybindEditorProps) {
  const keyBindings = useSettingsStore((s) => s.keyBindings);
  const setKeyBinding = useSettingsStore((s) => s.setKeyBinding);
  const [listening, setListening] = useState<keyof KeyBindings | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!listening) return;
      e.preventDefault();

      if (e.code === 'Escape') {
        setListening(null);
        return;
      }

      const current = keyBindings[listening];
      if (!current.includes(e.code)) {
        setKeyBinding(listening, [...current, e.code]);
      }
      setListening(null);
    },
    [listening, keyBindings, setKeyBinding],
  );

  useEffect(() => {
    if (!listening) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listening, handleKeyDown]);

  const removeKey = (action: keyof KeyBindings, code: string) => {
    const current = keyBindings[action];
    if (current.length > 1) {
      setKeyBinding(action, current.filter((k) => k !== code));
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto w-full p-6">
      <h2 className="font-display text-2xl text-hd-yellow uppercase tracking-wider">
        Key Bindings
      </h2>
      <p className="text-sm text-hd-gray">Click a binding to add a new key. Click a key to remove it.</p>

      <div className="flex flex-col gap-3">
        {(Object.keys(bindingLabels) as (keyof KeyBindings)[]).map((action) => (
          <div key={action} className="flex items-center justify-between gap-4">
            <span className="font-heading text-sm text-hd-white uppercase tracking-wider min-w-[100px]">
              {bindingLabels[action]}
            </span>
            <div className="flex gap-1 flex-wrap flex-1 justify-end">
              {keyBindings[action].map((code) => (
                <button
                  key={code}
                  onClick={() => removeKey(action, code)}
                  className="px-2 py-1 text-xs font-mono bg-hd-dark border border-hd-border rounded
                             hover:border-hd-red hover:text-hd-red transition-colors cursor-pointer"
                  title="Click to remove"
                >
                  {formatKeyCode(code)}
                </button>
              ))}
              <button
                onClick={() => setListening(action)}
                className={`px-2 py-1 text-xs font-mono rounded border cursor-pointer transition-colors ${
                  listening === action
                    ? 'bg-hd-yellow/20 border-hd-yellow text-hd-yellow animate-pulse'
                    : 'bg-hd-dark border-hd-border text-hd-gray hover:text-hd-white'
                }`}
              >
                {listening === action ? 'Press a key...' : '+'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="ghost" onClick={onBack} className="mt-4">
        Back
      </Button>
    </div>
  );
}

function formatKeyCode(code: string): string {
  return code
    .replace('Key', '')
    .replace('Arrow', '')
    .replace('Digit', '')
    .replace('Space', 'Space')
    .replace('Enter', 'Enter')
    .replace('Escape', 'Esc');
}
