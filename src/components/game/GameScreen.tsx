import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { GameMode, Stratagem } from '../../types';
import { useCustomModeStore } from '../../stores/customModeStore';
import { useGameEffects } from '../../hooks/useGameEffects';
import { useGameLogic } from '../../hooks/useGameLogic';
import { useGameKeyboard } from '../../hooks/useGameKeyboard';
import { switchTrack } from '../../utils/music';
import { modeDisplayConfig } from '../../config/modeConfig';
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
  const display = modeDisplayConfig[mode];

  useEffect(() => {
    if (game.state === 'countdown') switchTrack('countdown');
    else if (game.state === 'playing') switchTrack('gameplay');
    else if (game.state === 'game-over') switchTrack('gameover');
  }, [game.state]);

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
      <InputFeedback successTrigger={effects.successTrigger} errorTrigger={effects.errorTrigger} multiplier={game.multiplier} />
      <HellpodDrop trigger={effects.hellpodTrigger} stratagemName={effects.lastCompletedName} multiplier={game.multiplier} />
      <GlitchEffect trigger={effects.glitchTrigger} />
      <StreakFire multiplier={game.multiplier} active={game.isPlaying} />
      <StreakAnnouncement multiplier={game.multiplier} trigger={effects.streakAnnounceTrigger} />

      <AnimatePresence>
        {game.state === 'countdown' && <Countdown onComplete={game.onCountdownComplete} />}
      </AnimatePresence>

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

      {game.state === 'playing' && game.currentStratagem && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <ScoreDisplay score={game.score} />
              <StreakIndicator streak={game.streak} multiplier={game.multiplier} />
            </div>

            <div className="flex flex-col items-end gap-2">
              {game.useCountdownTimer && <Timer timeMs={game.timeMs} />}
              {!game.useCountdownTimer && mode !== 'free-practice' && (
                <Timer timeMs={display.showPenalty ? game.elapsedMs + game.penaltyMs : game.elapsedMs} warningMs={0} />
              )}
              {display.showLives && (
                <div className="font-display text-lg text-hd-white">
                  Vies : {'\u2764\uFE0F'.repeat(game.lives)}{'\u{1F5A4}'.repeat(3 - game.lives)}
                </div>
              )}
              {mode === 'custom' && customConfig && customConfig.lives > 0 && (
                <div className="font-display text-lg text-hd-white">
                  Vies : {'\u2764\uFE0F'.repeat(game.lives)}{'\u{1F5A4}'.repeat(Math.max(0, customConfig.lives - game.lives))}
                </div>
              )}
              {display.showProgress && (
                <div className="text-sm font-heading text-hd-gray">
                  {game.currentIndex + 1} / {queue.length}
                </div>
              )}
              {display.showPenalty && game.penaltyMs > 0 && (
                <div className="text-xs font-heading text-hd-red">
                  +{(game.penaltyMs / 1000).toFixed(0)}s penalite
                </div>
              )}
              {display.showDistance && (
                <div className="text-sm font-heading text-hd-gray">
                  Distance : {game.streak}
                </div>
              )}
              {mode === 'custom' && customConfig?.timerType === 'countup' && (
                <Timer timeMs={game.elapsedMs + game.penaltyMs} warningMs={0} />
              )}
              {mode === 'custom' && game.penaltyMs > 0 && (
                <div className="text-xs font-heading text-hd-red">
                  +{(game.penaltyMs / 1000).toFixed(0)}s penalite
                </div>
              )}
            </div>
          </div>

          {display.showBossIndicator && <BossIndicator active={game.isBoss} />}

          <div className="relative">
            <ComboDisplay
              stratagem={game.currentStratagem}
              currentIndex={game.inputIndex}
              error={game.error}
              showName={true}
              hideSequence={display.hideSequence}
            />
            <ParticleEffect trigger={effects.particleTrigger} multiplier={game.multiplier} />

            {display.quizHint && (
              <p className="text-sm text-hd-gray mt-2 text-center">Entrez le combo de memoire !</p>
            )}
          </div>

          <ComboQueue queue={queue} currentIndex={game.currentIndex} />

          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <div className="flex gap-4 text-xs text-hd-gray/50 font-heading uppercase tracking-wider">
              <span>ZQSD / Fleches = Directions</span>
              <span>Echap = Quitter</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
