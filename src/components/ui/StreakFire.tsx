import { useEffect, useRef } from 'react';

interface StreakFireProps {
  multiplier: number; // 1-4
  active: boolean;
}

/**
 * Fire / lightning / energy border effect based on streak multiplier.
 * x1 = nothing, x2 = ember glow, x3 = orange flames, x4 = intense inferno.
 */
export function StreakFire({ multiplier, active }: StreakFireProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active || multiplier < 2) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d')!;

    interface Ember {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
    }

    const embers: Ember[] = [];
    const spawnRate = multiplier === 2 ? 2 : multiplier === 3 ? 5 : 10;

    const colors = {
      2: ['rgba(245,197,24,', 'rgba(255,150,50,'],
      3: ['rgba(255,120,20,', 'rgba(255,80,0,', 'rgba(245,197,24,'],
      4: ['rgba(255,60,0,', 'rgba(255,30,0,', 'rgba(255,200,50,', 'rgba(255,100,0,'],
    } as const;

    const palette = colors[multiplier as 2 | 3 | 4] ?? colors[2];

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new embers along edges
      for (let i = 0; i < spawnRate; i++) {
        const side = Math.floor(Math.random() * 4);
        let x: number, y: number;

        switch (side) {
          case 0: x = Math.random() * canvas.width; y = canvas.height; break; // bottom
          case 1: x = Math.random() * canvas.width; y = 0; break; // top
          case 2: x = 0; y = Math.random() * canvas.height; break; // left
          default: x = canvas.width; y = Math.random() * canvas.height; break; // right
        }

        embers.push({
          x, y,
          vx: (Math.random() - 0.5) * 2,
          vy: -1 - Math.random() * 3,
          life: 1,
          maxLife: 0.5 + Math.random() * 1.0,
          size: 1 + Math.random() * (multiplier),
        });
      }

      // Update and draw
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        e.life -= 0.016 / e.maxLife;

        if (e.life <= 0) {
          embers.splice(i, 1);
          continue;
        }

        const c = palette[Math.floor(Math.random() * palette.length)];
        ctx.globalAlpha = e.life * 0.8;
        ctx.fillStyle = `${c}${e.life})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        if (multiplier >= 3) {
          ctx.fillStyle = `${c}${e.life * 0.2})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      // Edge glow
      const intensity = multiplier === 2 ? 0.05 : multiplier === 3 ? 0.1 : 0.2;
      const edgeColor = multiplier >= 4 ? '255,60,0' : multiplier >= 3 ? '255,120,20' : '245,197,24';

      // Bottom glow
      const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 80);
      grad.addColorStop(0, `rgba(${edgeColor},${intensity})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

      // Side glows
      const gradL = ctx.createLinearGradient(0, 0, 40, 0);
      gradL.addColorStop(0, `rgba(${edgeColor},${intensity * 0.5})`);
      gradL.addColorStop(1, 'transparent');
      ctx.fillStyle = gradL;
      ctx.fillRect(0, 0, 40, canvas.height);

      const gradR = ctx.createLinearGradient(canvas.width, 0, canvas.width - 40, 0);
      gradR.addColorStop(0, `rgba(${edgeColor},${intensity * 0.5})`);
      gradR.addColorStop(1, 'transparent');
      ctx.fillStyle = gradR;
      ctx.fillRect(canvas.width - 40, 0, 40, canvas.height);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [multiplier, active]);

  if (!active || multiplier < 2) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      aria-hidden="true"
    />
  );
}
