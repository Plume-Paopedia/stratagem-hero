import type { Faction } from '../../types/factions';
import { FACTIONS } from '../../types/factions';

interface FactionIconProps {
  faction: Faction;
  size?: number;
  className?: string;
  glow?: boolean;
}

function TerminidPath() {
  return (
    <g>
      <ellipse cx="50" cy="55" rx="18" ry="22" fill="currentColor" opacity="0.9" />
      <ellipse cx="50" cy="30" rx="12" ry="14" fill="currentColor" />
      <path d="M38 22 Q32 12 28 8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M62 22 Q68 12 72 8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="44" cy="26" r="3" fill="black" />
      <circle cx="56" cy="26" r="3" fill="black" />
      <path d="M34 42 L18 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M66 42 L82 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 52 L14 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M68 52 L86 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M34 64 L20 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M66 64 L80 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 77 L50 90 L46 95" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function AutomatonPath() {
  return (
    <g>
      <rect x="30" y="10" width="40" height="32" rx="3" fill="currentColor" opacity="0.9" />
      <rect x="36" y="20" width="10" height="4" rx="1" fill="black" />
      <rect x="54" y="20" width="10" height="4" rx="1" fill="black" />
      <rect x="37" y="21" width="8" height="2" rx="0.5" fill="#ff0000" opacity="0.8" />
      <rect x="55" y="21" width="8" height="2" rx="0.5" fill="#ff0000" opacity="0.8" />
      <rect x="35" y="32" width="30" height="6" rx="1" fill="currentColor" opacity="0.7" />
      <line x1="40" y1="33" x2="40" y2="37" stroke="black" strokeWidth="1" />
      <line x1="46" y1="33" x2="46" y2="37" stroke="black" strokeWidth="1" />
      <line x1="52" y1="33" x2="52" y2="37" stroke="black" strokeWidth="1" />
      <line x1="58" y1="33" x2="58" y2="37" stroke="black" strokeWidth="1" />
      <line x1="50" y1="10" x2="50" y2="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="2" r="2.5" fill="currentColor" />
      <rect x="44" y="38" width="12" height="6" fill="currentColor" opacity="0.6" />
      <rect x="28" y="44" width="44" height="30" rx="2" fill="currentColor" opacity="0.8" />
      <line x1="50" y1="48" x2="50" y2="70" stroke="black" strokeWidth="1.5" />
      <line x1="34" y1="56" x2="66" y2="56" stroke="black" strokeWidth="1" />
      <rect x="18" y="46" width="10" height="22" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="72" y="46" width="10" height="22" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="34" y="74" width="12" height="20" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="54" y="74" width="12" height="20" rx="2" fill="currentColor" opacity="0.7" />
    </g>
  );
}

function IlluminatePath() {
  return (
    <g>
      <polygon points="50,5 90,80 10,80" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.7" />
      <polygon points="50,65 30,30 70,30" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <ellipse cx="50" cy="45" rx="18" ry="12" fill="none" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="50" cy="45" rx="10" ry="7" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="45" r="5" fill="currentColor" opacity="0.9" />
      <circle cx="50" cy="45" r="2" fill="black" />
      <line x1="50" y1="5" x2="50" y2="25" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="25" y1="68" x2="35" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="75" y1="68" x2="65" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <circle cx="50" cy="45" r="24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <circle cx="50" cy="45" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 3" />
    </g>
  );
}

export function FactionIcon({ faction, size = 48, className = '', glow = false }: FactionIconProps) {
  const theme = FACTIONS[faction];
  const glowFilter = glow
    ? `drop-shadow(0 0 8px ${theme.colors.glow}) drop-shadow(0 0 16px ${theme.colors.glow})`
    : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ color: theme.colors.primary, filter: glowFilter }}
    >
      {faction === 'terminids' && <TerminidPath />}
      {faction === 'automatons' && <AutomatonPath />}
      {faction === 'illuminate' && <IlluminatePath />}
    </svg>
  );
}
