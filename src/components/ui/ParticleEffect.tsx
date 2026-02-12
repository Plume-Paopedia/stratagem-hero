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
  trailX: number;
  trailY: number;
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
  const runningRef = useRef(false);

  const m = Math.min(multiplier, 4);
  const totalCount = Math.min(count * m, 60);
  const maxSize = m >= 3 ? 8 : m >= 2 ? 5 : 3;

  const startLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (m >= 3) {
          p.trailX = p.x;
          p.trailY = p.y;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 4 * dt;
        p.life -= dt / p.maxLife;

        if (p.life <= 0) {

          particles[i] = particles[particles.length - 1];
          particles.pop();
          continue;
        }

        aliveCount++;
        ctx.globalAlpha = p.life;

        if (m >= 3) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.4;
          ctx.globalAlpha = p.life * 0.3;
          ctx.beginPath();
          ctx.moveTo(p.trailX, p.trailY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.globalAlpha = p.life;
        }

        ctx.fillStyle = p.color;

        if (p.isStar) {
          const s = p.size;
          ctx.beginPath();
          for (let j = 0; j < 8; j++) {
            const angle = (Math.PI * 2 * j) / 8;
            const r = j % 2 === 0 ? s : s * 0.4;
            const px = p.x + Math.cos(angle) * r;
            const py = p.y + Math.sin(angle) * r;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
      }

      ctx.globalAlpha = 1;

      if (aliveCount > 0) {
        rafRef.current = requestAnimationFrame(loop);
      } else {

        runningRef.current = false;
      }
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [m]);

  const spawn = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let i = 0; i < totalCount; i++) {
      const angle = (Math.PI * 2 * i) / totalCount + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      particlesRef.current.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.4 + Math.random() * 0.4,
        size: 2 + Math.random() * maxSize,
        color,
        isStar: m >= 3 && Math.random() > 0.6,
        trailX: cx, trailY: cy,
      });
    }

    if (m >= 4) {
      const ringCount = 24;
      for (let i = 0; i < ringCount; i++) {
        const angle = (Math.PI * 2 * i) / ringCount;
        particlesRef.current.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * 5,
          vy: Math.sin(angle) * 5,
          life: 1, maxLife: 0.5,
          size: 3,
          color: '#ffffff',
          isStar: false,
          trailX: cx, trailY: cy,
        });
      }
    }

    startLoop();
  }, [color, totalCount, maxSize, m, startLoop]);

  useEffect(() => {
    if (trigger > 0) spawn();
  }, [trigger, spawn]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
    />
  );
}
