import { useState } from 'react';
import type { SessionStats, GameMode } from '../../types';

interface SessionHistoryProps {
  sessions: SessionStats[];
}

const modeLabels: Partial<Record<GameMode, string>> = {
  'free-practice': 'Entrainement',
  'time-attack': 'Contre-la-Montre',
  'accuracy': 'Precision',
  'survival': 'Survie',
  'quiz': 'Quiz',
  'daily-challenge': 'Defi du Jour',
  'speed-run': 'Speed Run',
  'endless': 'Infini',
  'category-challenge': 'Categorie',
  'boss-rush': 'Boss Rush',
  'custom': 'Personnalise',
};

export function SessionHistory({ sessions }: SessionHistoryProps) {
  const [filterMode, setFilterMode] = useState<GameMode | 'all'>('all');

  const filtered = filterMode === 'all'
    ? sessions
    : sessions.filter((s) => s.mode === filterMode);

  const modes = [...new Set(sessions.map((s) => s.mode))];

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-hd-gray font-heading text-sm">
        Aucune session. Jouez pour voir l'historique !
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Mode filter */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-2 py-1 text-xs font-heading rounded border cursor-pointer transition-colors ${
            filterMode === 'all'
              ? 'border-hd-yellow text-hd-yellow bg-hd-yellow/10'
              : 'border-hd-border text-hd-gray hover:text-hd-white'
          }`}
        >
          Tous
        </button>
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => setFilterMode(m)}
            className={`px-2 py-1 text-xs font-heading rounded border cursor-pointer transition-colors ${
              filterMode === m
                ? 'border-hd-yellow text-hd-yellow bg-hd-yellow/10'
                : 'border-hd-border text-hd-gray hover:text-hd-white'
            }`}
          >
            {modeLabels[m] ?? m}
          </button>
        ))}
      </div>

      {/* Session list */}
      <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
        {filtered.slice().reverse().map((session, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2 bg-hd-dark border border-hd-border rounded text-sm"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-heading text-hd-white text-xs">
                {modeLabels[session.mode] ?? session.mode}
              </span>
              <span className="text-[10px] text-hd-gray">
                {new Date(session.date).toLocaleDateString()} {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="text-hd-yellow font-display">{session.totalScore.toLocaleString()}</span>
              <span className="text-hd-gray">{session.accuracy}%</span>
              <span className="text-hd-gray">x{session.bestStreak}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
