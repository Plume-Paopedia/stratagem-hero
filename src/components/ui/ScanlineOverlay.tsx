/**
 * CRT scanline + vignette + subtle screen flicker overlay.
 * Pure CSS — zero performance impact from JS.
 */
export function ScanlineOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {/* Animated scanline sweep */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          animation: 'scanlines 8s linear infinite',
        }}
      />

      {/* Single moving scan line */}
      <div
        className="absolute left-0 right-0 h-[2px] opacity-[0.06]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(245,197,24,0.4), transparent)',
          animation: 'scan-line 4s linear infinite',
        }}
      />

      {/* Heavy vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Corner decorations — military HUD brackets */}
      <svg className="absolute top-3 left-3 w-8 h-8 text-hd-yellow/20">
        <path d="M0 24 L0 0 L24 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <svg className="absolute top-3 right-3 w-8 h-8 text-hd-yellow/20">
        <path d="M8 0 L32 0 L32 24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 32 32" />
      </svg>
      <svg className="absolute bottom-3 left-3 w-8 h-8 text-hd-yellow/20">
        <path d="M0 8 L0 32 L24 32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 32 32" />
      </svg>
      <svg className="absolute bottom-3 right-3 w-8 h-8 text-hd-yellow/20">
        <path d="M8 32 L32 32 L32 8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 32 32" />
      </svg>
    </div>
  );
}
