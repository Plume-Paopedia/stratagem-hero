import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  isStar: boolean;
  trail: { x: number; y: number }[];
}

interface ParticleEffectProps {
  trigger: number;
  color?: string;
  count?: number;
  multiplier?: number;
  className?: string;
}

export function ParticleEffect({
  trigger,
  color = '#f5c518',
  count = 12,
  multiplier = 1,
  className = '',
}: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const m = Math.min(multiplier, 4);
  const totalCount = count * m;
  const maxSize = m >= 3 ? 8 : m >= 2 ? 5 : 3;

  const spawn = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Regular burst
    for (let i = 0; i < totalCount; i++) {
      const angle = (Math.PI * 2 * i) / totalCount + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      particlesRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.4 + Math.random() * 0.4,
        size: 2 + Math.random() * maxSize,
        color,
        isStar: m >= 3 && Math.random() > 0.6,
        trail: [],
      });
    }

    // x4: Ring explosion — 24 uniform particles
    if (m >= 4) {
      const ringCount = 24;
      for (let i = 0; i < ringCount; i++) {
        const angle = (Math.PI * 2 * i) / ringCount;
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * 5,
          vy: Math.sin(angle) * 5,
          life: 1,
          maxLife: 0.5,
          size: 3,
          color: '#ffffff',
          isStar: false,
          trail: [],
        });
      }
    }
  }, [color, totalCount, maxSize, m]);

  useEffect(() => {
    if (trigger > 0) spawn();
  }, [trigger, spawn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const alive: Particle[] = [];
      for (const p of particlesRef.current) {
        // Store trail position
        if (m >= 3 && p.trail.length < 3) {
          p.trail.push({ x: p.x, y: p.y });
        } else if (m >= 3) {
          p.trail.shift();
          p.trail.push({ x: p.x, y: p.y });
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 4 * dt;
        p.life -= dt / p.maxLife;

        if (p.life > 0) {
          ctx.globalAlpha = p.life;

          // Draw trail
          if (m >= 3 && p.trail.length > 1) {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size * 0.4;
            ctx.globalAlpha = p.life * 0.3;
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let i = 1; i < p.trail.length; i++) {
              ctx.lineTo(p.trail[i].x, p.trail[i].y);
            }
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.globalAlpha = p.life;
          }

          ctx.fillStyle = p.color;

          if (p.isStar) {
            // Draw 4-point star
            const s = p.size;
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
              const angle = (Math.PI * 2 * i) / 8;
              const r = i % 2 === 0 ? s : s * 0.4;
              const px = p.x + Math.cos(angle) * r;
              const py = p.y + Math.sin(angle) * r;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          }

          alive.push(p);
        }
      }
      ctx.globalAlpha = 1;
      particlesRef.current = alive;

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [m]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
    />
  );
}
