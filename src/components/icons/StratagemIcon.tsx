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
  return (
    <img
      src={`${import.meta.env.BASE_URL}icons/${iconId}.svg`}
      alt={iconId}
      width={size}
      height={size}
      className={`${className} ${glow ? 'drop-shadow-[0_0_8px_rgba(245,197,24,0.6)]' : ''}`}
      loading="lazy"
      onError={(e) => {
        if (fallbackEmoji) {
          const span = document.createElement('span');
          span.style.fontSize = `${size * 0.8}px`;
          span.textContent = fallbackEmoji;
          (e.target as HTMLElement).replaceWith(span);
        }
      }}
    />
  );
}
