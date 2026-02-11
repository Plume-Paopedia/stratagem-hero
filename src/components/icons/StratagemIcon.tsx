import { iconData } from '../../data/icons';

interface StratagemIconProps {
  iconId: string;
  size?: number;
  className?: string;
  glow?: boolean;
  fallbackEmoji?: string;
}

export function StratagemIcon({
  iconId,
  size = 24,
  className = '',
  glow = false,
  fallbackEmoji,
}: StratagemIconProps) {
  const icon = iconData[iconId];

  if (!icon) {
    if (fallbackEmoji) {
      return <span style={{ fontSize: size * 0.8 }}>{fallbackEmoji}</span>;
    }
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="12">?</text>
      </svg>
    );
  }

  const vb = icon.viewBox ?? '0 0 24 24';

  return (
    <svg
      width={size}
      height={size}
      viewBox={vb}
      className={`${className} ${glow ? 'drop-shadow-[0_0_6px_currentColor]' : ''}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {icon.paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={icon.stroke ? 'none' : 'currentColor'}
          stroke={icon.stroke ? 'currentColor' : undefined}
          strokeWidth={icon.stroke ? (icon.strokeWidth ?? 2) : undefined}
          strokeLinecap={icon.stroke ? 'round' : undefined}
          strokeLinejoin={icon.stroke ? 'round' : undefined}
        />
      ))}
    </svg>
  );
}
