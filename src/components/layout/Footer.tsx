interface FooterProps {
  onHelp?: () => void;
}

export function Footer({ onHelp }: FooterProps) {
  return (
    <footer className="relative z-10 flex items-center justify-center px-6 py-2 border-t border-hd-border bg-hd-dark/80">
      <div className="flex gap-6 text-xs text-hd-gray/40 font-heading uppercase tracking-wider">
        <span>W/&#x2191; S/&#x2193; A/&#x2190; D/&#x2192;</span>
        <span>|</span>
        <span>Manette compatible</span>
        {onHelp && (
          <>
            <span>|</span>
            <button onClick={onHelp} className="hover:text-hd-yellow transition-colors cursor-pointer">
              Comment Jouer
            </button>
          </>
        )}
        <span>|</span>
        <span>Pour Super Terre !</span>
        <span>|</span>
        <a
          href="https://github.com/nvigneux/Helldivers-2-Stratagems-icons-svg"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-hd-yellow transition-colors"
        >
          Icones : nvigneux
        </a>
        <span>|</span>
        <span>Musique : Wilbert Roget, II</span>
        <span>|</span>
        <span>HD2 © Arrowhead / Sony</span>
      </div>
    </footer>
  );
}
