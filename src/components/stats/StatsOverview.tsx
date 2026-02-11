import { useStatsStore } from '../../stores/statsStore';
import { Button } from '../ui/Button';
import { stratagemMap } from '../../data/stratagems';
import type { Direction } from '../../types';
import { SessionHistory } from './SessionHistory';

interface StatsOverviewProps {
  onClose: () => void;
}

export function StatsOverview({ onClose }: StatsOverviewProps) {
  const stats = useStatsStore();

  const totalMinutes = Math.floor(stats.totalPlayTimeMs / 60000);
  const directionTotals = stats.directionErrorCounts;

  // Find most practiced stratagem
  const stratagemEntries = Object.values(stats.stratagemStats);
  const mostPracticed = stratagemEntries.sort((a, b) => b.totalAttempts - a.totalAttempts)[0];
  const mostFailed = stratagemEntries.sort((a, b) => b.failures - a.failures)[0];
  const fastest = stratagemEntries
    .filter((s) => s.bestTimeMs < Infinity)
    .sort((a, b) => a.bestTimeMs - b.bestTimeMs)[0];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full p-6 overflow-y-auto">
      <h2 className="font-display text-2xl text-hd-yellow uppercase tracking-wider">
        Statistics
      </h2>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Sessions" value={String(stats.totalSessions)} />
        <StatCard label="Play Time" value={`${totalMinutes}m`} />
        <StatCard label="Completed" value={String(stats.totalStratagemsCompleted)} />
        <StatCard label="Total Errors" value={String(stats.totalErrors)} />
      </div>

      {/* Best scores */}
      {Object.keys(stats.bestScores).length > 0 && (
        <div>
          <h3 className="font-heading text-sm text-hd-gray uppercase tracking-wider mb-3">
            Best Scores
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats.bestScores).map(([mode, score]) => (
              <div key={mode} className="bg-hd-dark border border-hd-border rounded p-3">
                <div className="text-xs text-hd-gray uppercase">{mode.replace('-', ' ')}</div>
                <div className="font-display text-lg text-hd-yellow">
                  {(score as number).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notable stratagems */}
      <div>
        <h3 className="font-heading text-sm text-hd-gray uppercase tracking-wider mb-3">
          Highlights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mostPracticed && (
            <HighlightCard
              label="Most Practiced"
              value={stratagemMap.get(mostPracticed.stratagemId)?.name ?? mostPracticed.stratagemId}
              sub={`${mostPracticed.totalAttempts} attempts`}
            />
          )}
          {mostFailed && mostFailed.failures > 0 && (
            <HighlightCard
              label="Most Failed"
              value={stratagemMap.get(mostFailed.stratagemId)?.name ?? mostFailed.stratagemId}
              sub={`${mostFailed.failures} failures`}
            />
          )}
          {fastest && (
            <HighlightCard
              label="Fastest"
              value={stratagemMap.get(fastest.stratagemId)?.name ?? fastest.stratagemId}
              sub={`${(fastest.bestTimeMs / 1000).toFixed(2)}s`}
            />
          )}
        </div>
      </div>

      {/* Direction error heatmap */}
      <div>
        <h3 className="font-heading text-sm text-hd-gray uppercase tracking-wider mb-3">
          Direction Errors
        </h3>
        <DirectionHeatmap errors={directionTotals} />
      </div>

      {/* Accuracy over time (simple SVG chart) */}
      {stats.sessions.length > 1 && (
        <div>
          <h3 className="font-heading text-sm text-hd-gray uppercase tracking-wider mb-3">
            Accuracy Over Time
          </h3>
          <AccuracyChart sessions={stats.sessions.slice(-30)} />
        </div>
      )}

      {/* Session History */}
      {stats.sessions.length > 0 && (
        <div>
          <h3 className="font-heading text-sm text-hd-gray uppercase tracking-wider mb-3">
            Session History
          </h3>
          <SessionHistory sessions={stats.sessions} />
        </div>
      )}

      <div className="flex gap-4">
        <Button variant="ghost" onClick={onClose}>Back</Button>
        <Button variant="danger" size="sm" onClick={() => {
          if (confirm('Clear all statistics? This cannot be undone.')) {
            stats.clearAllStats();
          }
        }}>
          Clear Stats
        </Button>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-hd-dark border border-hd-border rounded p-3 text-center">
      <div className="text-xs text-hd-gray uppercase tracking-wider font-heading">{label}</div>
      <div className="font-display text-2xl text-hd-white mt-1">{value}</div>
    </div>
  );
}

function HighlightCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-hd-dark border border-hd-border rounded p-3">
      <div className="text-xs text-hd-gray uppercase tracking-wider font-heading">{label}</div>
      <div className="font-heading text-sm text-hd-yellow mt-1">{value}</div>
      <div className="text-xs text-hd-gray mt-0.5">{sub}</div>
    </div>
  );
}

function DirectionHeatmap({ errors }: { errors: Record<Direction, number> }) {
  const max = Math.max(1, ...Object.values(errors));

  const getIntensity = (dir: Direction) => {
    const ratio = errors[dir] / max;
    return ratio;
  };

  return (
    <div className="flex items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* Up */}
        <rect x="55" y="10" width="50" height="50" rx="4"
          fill={`rgba(255,51,51,${0.1 + getIntensity('up') * 0.8})`}
          stroke="#2a2a3a" strokeWidth="1" />
        <text x="80" y="35" textAnchor="middle" fill="#e8e6e3" fontSize="10" fontFamily="Rajdhani">UP</text>
        <text x="80" y="50" textAnchor="middle" fill="#e8e6e3" fontSize="12" fontFamily="Orbitron">{errors.up}</text>

        {/* Left */}
        <rect x="0" y="65" width="50" height="50" rx="4"
          fill={`rgba(255,51,51,${0.1 + getIntensity('left') * 0.8})`}
          stroke="#2a2a3a" strokeWidth="1" />
        <text x="25" y="90" textAnchor="middle" fill="#e8e6e3" fontSize="10" fontFamily="Rajdhani">LEFT</text>
        <text x="25" y="105" textAnchor="middle" fill="#e8e6e3" fontSize="12" fontFamily="Orbitron">{errors.left}</text>

        {/* Right */}
        <rect x="110" y="65" width="50" height="50" rx="4"
          fill={`rgba(255,51,51,${0.1 + getIntensity('right') * 0.8})`}
          stroke="#2a2a3a" strokeWidth="1" />
        <text x="135" y="90" textAnchor="middle" fill="#e8e6e3" fontSize="10" fontFamily="Rajdhani">RIGHT</text>
        <text x="135" y="105" textAnchor="middle" fill="#e8e6e3" fontSize="12" fontFamily="Orbitron">{errors.right}</text>

        {/* Down */}
        <rect x="55" y="120" width="50" height="50" rx="4"
          fill={`rgba(255,51,51,${0.1 + getIntensity('down') * 0.8})`}
          stroke="#2a2a3a" strokeWidth="1" />
        <text x="80" y="145" textAnchor="middle" fill="#e8e6e3" fontSize="10" fontFamily="Rajdhani">DOWN</text>
        <text x="80" y="160" textAnchor="middle" fill="#e8e6e3" fontSize="12" fontFamily="Orbitron">{errors.down}</text>

        {/* Center */}
        <rect x="55" y="65" width="50" height="50" rx="4"
          fill="rgba(42,42,58,0.5)" stroke="#2a2a3a" strokeWidth="1" />
      </svg>
    </div>
  );
}

function AccuracyChart({ sessions }: { sessions: { accuracy: number; date: number }[] }) {
  const w = 500;
  const h = 120;
  const pad = 20;

  if (sessions.length < 2) return null;

  const points = sessions.map((s, i) => ({
    x: pad + (i / (sessions.length - 1)) * (w - 2 * pad),
    y: pad + (1 - s.accuracy / 100) * (h - 2 * pad),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 150 }}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((v) => {
        const y = pad + (1 - v / 100) * (h - 2 * pad);
        return (
          <g key={v}>
            <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#2a2a3a" strokeWidth="0.5" />
            <text x={pad - 5} y={y + 3} textAnchor="end" fill="#6a6a7a" fontSize="8">{v}%</text>
          </g>
        );
      })}

      {/* Line */}
      <path d={pathD} fill="none" stroke="#f5c518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#f5c518" />
      ))}
    </svg>
  );
}
