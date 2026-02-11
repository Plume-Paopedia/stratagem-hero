import { useEffect, useRef } from 'react';
import { useFactionStore } from '../../stores/factionStore';
import { FACTIONS } from '../../types/factions';

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number; // 0 = white, 45 = yellow
}

/** Convert HSL hue to an approximate RGB for canvas rendering */
function hueToRgb(hue: number): [number, number, number] {
  const h = ((hue % 360) + 360) % 360 / 60;
  const x = 1 - Math.abs((h % 2) - 1);
  let r = 0, g = 0, b = 0;
  if (h < 1) { r = 1; g = x; }
  else if (h < 2) { r = x; g = 1; }
  else if (h < 3) { g = 1; b = x; }
  else if (h < 4) { g = x; b = 1; }
  else if (h < 5) { r = x; b = 1; }
  else { r = 1; b = x; }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Full-screen ambient floating particles.
 * Tiny glowing specks drift slowly across the screen like embers / space dust.
 * Shifts hues to match the active faction.
 */
export function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<FloatingParticle[]>([]);
  const rafRef = useRef(0);
  const faction = useFactionStore((s) => s.activeFaction);
  const factionRef = useRef(faction);
  factionRef.current = faction;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn particles
    const count = 60;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.2 - Math.random() * 0.4,
      size: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.3,
      hue: Math.random() > 0.7 ? 45 : 0,
    }));

    const ctx = canvas.getContext('2d')!;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 16.67;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const f = factionRef.current;
      const factionHues = f ? FACTIONS[f].particleHues : null;

      for (const p of particlesRef.current) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        const flicker = 0.7 + Math.sin(time * 0.003 + p.x) * 0.3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (factionHues && p.hue !== 0) {
          const fh = factionHues[Math.floor(Math.abs(p.x)) % factionHues.length];
          const [r, g, b] = hueToRgb(fh);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * flicker})`;
        } else if (p.hue === 45) {
          ctx.fillStyle = `rgba(245, 197, 24, ${p.opacity * flicker})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * flicker * 0.5})`;
        }
        ctx.fill();

        // Glow for colored particles
        if (p.hue !== 0 && p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          if (factionHues) {
            const fh = factionHues[Math.floor(Math.abs(p.x)) % factionHues.length];
            const [r, g, b] = hueToRgb(fh);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * flicker * 0.08})`;
          } else {
            ctx.fillStyle = `rgba(245, 197, 24, ${p.opacity * flicker * 0.08})`;
          }
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      aria-hidden="true"
    />
  );
}
