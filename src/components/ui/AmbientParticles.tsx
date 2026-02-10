import { useEffect, useRef } from 'react';

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number; // 0 = white, 45 = yellow
}

/**
 * Full-screen ambient floating particles.
 * Tiny glowing specks drift slowly across the screen like embers / space dust.
 */
export function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<FloatingParticle[]>([]);
  const rafRef = useRef(0);

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
      vy: -0.2 - Math.random() * 0.4, // Drift upward like embers
      size: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.3,
      hue: Math.random() > 0.7 ? 45 : 0, // Some yellow, mostly white
    }));

    const ctx = canvas.getContext('2d')!;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 16.67; // Normalize to ~60fps
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Wrap around
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        // Flicker
        const flicker = 0.7 + Math.sin(time * 0.003 + p.x) * 0.3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        if (p.hue === 45) {
          ctx.fillStyle = `rgba(245, 197, 24, ${p.opacity * flicker})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * flicker * 0.5})`;
        }
        ctx.fill();

        // Glow for yellow particles
        if (p.hue === 45 && p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 197, 24, ${p.opacity * flicker * 0.08})`;
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
