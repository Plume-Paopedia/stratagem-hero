import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { GameMode, Stratagem } from '../../types';
import { useCustomModeStore } from '../../stores/customModeStore';
import { useGameEffects } from '../../hooks/useGameEffects';
import { useGameLogic } from '../../hooks/useGameLogic';
import { useGameKeyboard } from '../../hooks/useGameKeyboard';
import { ComboDisplay } from '../stratagem/ComboDisplay';
import { InputFeedback } from '../stratagem/InputFeedback';
import { ParticleEffect } from '../ui/ParticleEffect';
import { HellpodDrop } from '../ui/HellpodDrop';
import { StreakFire } from '../ui/StreakFire';
import { GlitchEffect } from '../ui/GlitchEffect';
import { StreakAnnouncement } from '../ui/StreakAnnouncement';
import { BossIndicator } from '../ui/BossIndicator';
import { ArcadeInitialEntry } from '../leaderboard/ArcadeInitialEntry';
import { Countdown } from './Countdown';
import { Timer } from './Timer';
import { ScoreDisplay } from './ScoreDisplay';
import { StreakIndicator } from './StreakIndicator';
import { ComboQueue } from './ComboQueue';
import { GameOverScreen } from './GameOverScreen';

interface GameScreenProps {
  mode: GameMode;
  queue: Stratagem[];
  onExit: () => void;
  onViewLeaderboard?: (mode: GameMode) => void;
}

export function GameScreen({ mode, queue, onExit, onViewLeaderboard }: GameScreenProps) {
  const effects = useGameEffects();
  const game = useGameLogic({ mode, queue, effects });
  const customConfig = useCustomModeStore((s) => s.activeConfig);

  // Continuous shake at x4 multiplier
  useEffect(() => {
    if (game.isPlaying && game.multiplier >= 4) {
      effects.startContinuousShake(1.5);
    } else {
      effects.stopContinuousShake();
    }
  }, [game.isPlaying, game.multiplier, effects.startContinuousShake, effects.stopContinuousShake]);

  useGameKeyboard({
    gameState: game.state,
    showInitialEntry: game.showInitialEntry,
    onEndGame: game.endGame,
    onRestart: game.restart,
    onExit,
  });

  return (
    <div ref={effects.shakeRef} className="relative h-full flex flex-col">
      {/* Visual effects layers */}
      <InputFeedback successTrigger={effects.successTrigger} errorTrigger={effects.errorTrigger} multiplier={game.multiplier} />
      <HellpodDrop trigger={effects.hellpodTrigger} stratagemName={effects.lastCompletedName} multiplier={game.multiplier} />
      <GlitchEffect trigger={effects.glitchTrigger} />
      <StreakFire multiplier={game.multiplier} active={game.isPlaying} />
      <StreakAnnouncement multiplier={game.multiplier} trigger={effects.streakAnnounceTrigger} />

      {/* Countdown */}
      <AnimatePresence>
        {game.state === 'countdown' && <Countdown onComplete={game.onCountdownComplete} />}
      </AnimatePresence>

      {/* Game Over */}
      {game.state === 'game-over' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <GameOverScreen
            mode={mode}
            score={game.score}
            attempts={game.attempts}
            bestStreak={game.bestStreak}
            totalTimeMs={game.totalTimeMs}
            isNewRecord={game.isNewRecord}
            onRestart={game.restart}
            onMenu={onExit}
            onViewLeaderboard={onViewLeaderboard ? () => onViewLeaderboard(mode) : undefined}
          />
        </div>
      )}

      {/* Arcade initial entry overlay */}
      <AnimatePresence>
        {game.showInitialEntry && game.leaderboardRank != null && (
          <ArcadeInitialEntry
            score={game.score}
            rank={game.leaderboardRank}
            onConfirm={game.handleInitialConfirm}
            onCancel={game.handleInitialCancel}
          />
        )}
      </AnimatePresence>

      {/* Playing state */}
      {game.state === 'playing' && game.currentStratagem && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
          {/* Top bar */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <ScoreDisplay score={game.score} />
              <StreakIndicator streak={game.streak} multiplier={game.multiplier} />
            </div>

            <div className="flex flex-col items-end gap-2">
              {game.useCountdownTimer && <Timer timeMs={game.timeMs} />}
              {!game.useCountdownTimer && mode !== 'free-practice' && (
                <Timer timeMs={mode === 'speed-run' ? game.elapsedMs + game.penaltyMs : game.elapsedMs} warningMs={0} />
              )}
              {mode === 'quiz' && (
                <div className="font-display text-lg text-hd-white">
                  Lives: {'\u2764\uFE0F'.repeat(game.lives)}{'\u{1F5A4}'.repeat(3 - game.lives)}
                </div>
              )}
              {mode === 'custom' && customConfig && customConfig.lives > 0 && (
                <div className="font-display text-lg text-hd-white">
                  Lives: {'\u2764\uFE0F'.repeat(game.lives)}{'\u{1F5A4}'.repeat(Math.max(0, customConfig.lives - game.lives))}
                </div>
              )}
              {(mode === 'accuracy' || mode === 'speed-run' || mode === 'category-challenge') && (
                <div className="text-sm font-heading text-hd-gray">
                  {game.currentIndex + 1} / {queue.length}
                </div>
              )}
              {mode === 'speed-run' && game.penaltyMs > 0 && (
                <div className="text-xs font-heading text-hd-red">
                  +{(game.penaltyMs / 1000).toFixed(0)}s penalty
                </div>
              )}
              {mode === 'endless' && (
                <div className="text-sm font-heading text-hd-gray">
                  Distance: {game.streak}
                </div>
              )}
              {mode === 'custom' && customConfig?.timerType === 'countup' && (
                <Timer timeMs={game.elapsedMs + game.penaltyMs} warningMs={0} />
              )}
              {mode === 'custom' && game.penaltyMs > 0 && (
                <div className="text-xs font-heading text-hd-red">
                  +{(game.penaltyMs / 1000).toFixed(0)}s penalty
                </div>
              )}
            </div>
          </div>

          {/* Boss indicator */}
          {mode === 'boss-rush' && <BossIndicator active={game.isBoss} />}

          {/* Center: Combo display */}
          <div className="relative">
            <ComboDisplay
              stratagem={game.currentStratagem}
              currentIndex={game.inputIndex}
              error={game.error}
              showName={true}
              hideSequence={mode === 'quiz'}
            />
            <ParticleEffect trigger={effects.particleTrigger} multiplier={game.multiplier} />

            {mode === 'quiz' && (
              <p className="text-sm text-hd-gray mt-2 text-center">Enter the combo from memory!</p>
            )}
          </div>

          {/* Queue */}
          <ComboQueue queue={queue} currentIndex={game.currentIndex} />

          {/* Controls hint */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <div className="flex gap-4 text-xs text-hd-gray/50 font-heading uppercase tracking-wider">
              <span>WASD / Arrows = Directions</span>
              <span>Esc = Quit</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
