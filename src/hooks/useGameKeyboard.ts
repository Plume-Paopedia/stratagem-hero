import { useEffect } from 'react';

interface UseGameKeyboardOptions {
  gameState: 'countdown' | 'playing' | 'game-over';
  showInitialEntry: boolean;
  onEndGame: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export function useGameKeyboard({
  gameState,
  showInitialEntry,
  onEndGame,
  onRestart,
  onExit,
}: UseGameKeyboardOptions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showInitialEntry) return;
      if (e.code === 'Escape') {
        if (gameState === 'playing') {
          onEndGame();
        } else {
          onExit();
        }
      }
      if (e.code === 'KeyR' && gameState === 'game-over') {
        onRestart();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, onExit, onEndGame, showInitialEntry, onRestart]);
}
