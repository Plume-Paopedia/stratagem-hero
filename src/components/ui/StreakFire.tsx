import { useEffect, useRef } from 'react';
import { useFactionStore } from '../../stores/factionStore';
import { FACTIONS } from '../../types/factions';

interface StreakFireProps {
  multiplier: number;
  active: boolean;
}

function hslToRgba(h: number, s: number, l: number, a: number): string {
  const hk = h / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const t = [hk + 1 / 3, hk, hk - 1 / 3].map((t) => {
    const tc = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tc < 1 / 6) return p + (q - p) * 6 * tc;
    if (tc < 1 / 2) return q;
    if (tc < 2 / 3) return p + (q - p) * (2 / 3 - tc) * 6;
    return p;
  });
  return `rgba(${Math.round(t[0] * 255)},${Math.round(t[1] * 255)},${Math.round(t[2] * 255)},${a})`;
}

/**
 * Fire / lightning / energy border effect based on streak multiplier.
 * x1 = nothing, x2 = ember glow, x3 = inferno, x4 = absolute hellfire with lightning.
 * Colors adapt to active faction.
 */
export function StreakFire({ multiplier, active }: StreakFireProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const faction = useFactionStore((s) => s.activeFaction);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl || !active || multiplier < 2) {
      if (canvasEl) {
        const ctx = canvasEl.getContext('2d');
        ctx?.clearRect(0, 0, canvasEl.width, canvasEl.height);
      }
      return;
    }
    // After guard, canvas is guaranteed non-null
    const canvas = canvasEl;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const ctx = canvas.getContext('2d')!;

    // Faction-aware color hues
    const factionTheme = faction ? FACTIONS[faction] : null;
    const hues = factionTheme ? factionTheme.particleHues : [30, 15, 0]; // default orange/red

    interface Ember {
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      size: number; hue: number;
    }

    interface Lightning {
      points: { x: number; y: number }[];
      life: number;
      hue: number;
    }

    const embers: Ember[] = [];
    const lightnings: Lightning[] = [];
    const spawnRate = multiplier === 2 ? 4 : multiplier === 3 ? 12 : 25;
    let lastFlare = 0;
    let time = 0;

    function spawnEmber(fromTop: boolean) {
      const side = fromTop ? 1 : Math.floor(Math.random() * 4);
      let x: number, y: number;
      switch (side) {
        case 0: x = Math.random() * canvas.width; y = canvas.height; break;
        case 1: x = Math.random() * canvas.width; y = 0; break;
        case 2: x = 0; y = Math.random() * canvas.height; break;
        default: x = canvas.width; y = Math.random() * canvas.height; break;
      }
      embers.push({
        x, y,
        vx: (Math.random() - 0.5) * 2,
        vy: fromTop ? 1 + Math.random() * 2 : -1 - Math.random() * 3,
        life: 1,
        maxLife: 0.5 + Math.random() * 1.0,
        size: 1 + Math.random() * (multiplier * 1.5),
        hue: hues[Math.floor(Math.random() * hues.length)],
      });
    }

    function spawnLightning() {
      const side = Math.floor(Math.random() * 4);
      let sx: number, sy: number, ex: number, ey: number;
      const len = 30 + Math.random() * 60;
      switch (side) {
        case 0: sx = Math.random() * canvas.width; sy = canvas.height; ex = sx + (Math.random() - 0.5) * 40; ey = sy - len; break;
        case 1: sx = Math.random() * canvas.width; sy = 0; ex = sx + (Math.random() - 0.5) * 40; ey = sy + len; break;
        case 2: sx = 0; sy = Math.random() * canvas.height; ex = sx + len; ey = sy + (Math.random() - 0.5) * 40; break;
        default: sx = canvas.width; sy = Math.random() * canvas.height; ex = sx - len; ey = sy + (Math.random() - 0.5) * 40; break;
      }
      // Midpoint displacement for jagged bolt
      const points: { x: number; y: number }[] = [{ x: sx, y: sy }];
      const segments = 6;
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        points.push({
          x: sx + (ex - sx) * t + (Math.random() - 0.5) * 20,
          y: sy + (ey - sy) * t + (Math.random() - 0.5) * 20,
        });
      }
      points.push({ x: ex, y: ey });
      lightnings.push({ points, life: 1, hue: hues[0] });
    }

    const loop = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn embers
      for (let i = 0; i < spawnRate; i++) spawnEmber(false);
      // x4: rain from top too
      if (multiplier >= 4) {
        for (let i = 0; i < 8; i++) spawnEmber(true);
      }

      // x3+: flare bursts every ~0.5s
      if (multiplier >= 3 && time - lastFlare > 0.5) {
        lastFlare = time;
        const bx = Math.random() * canvas.width;
        const by = canvas.height;
        for (let i = 0; i < 20; i++) {
          embers.push({
            x: bx, y: by,
            vx: (Math.random() - 0.5) * 6,
            vy: -3 - Math.random() * 5,
            life: 1, maxLife: 0.3 + Math.random() * 0.5,
            size: 2 + Math.random() * 4,
            hue: hues[Math.floor(Math.random() * hues.length)],
          });
        }
      }

      // x4: lightning bolts every ~0.8s
      if (multiplier >= 4 && Math.random() < 0.02) {
        spawnLightning();
      }

      // Update and draw embers
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        e.life -= 0.016 / e.maxLife;
        if (e.life <= 0) { embers.splice(i, 1); continue; }

        const color = hslToRgba(e.hue, 1, 0.5, e.life * 0.8);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();

        if (multiplier >= 3) {
          ctx.fillStyle = hslToRgba(e.hue, 1, 0.5, e.life * 0.15);
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw lightning
      for (let i = lightnings.length - 1; i >= 0; i--) {
        const l = lightnings[i];
        l.life -= 0.08;
        if (l.life <= 0) { lightnings.splice(i, 1); continue; }

        // White-hot core
        ctx.strokeStyle = `rgba(255,255,255,${l.life * 0.9})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(l.points[0].x, l.points[0].y);
        for (let j = 1; j < l.points.length; j++) {
          ctx.lineTo(l.points[j].x, l.points[j].y);
        }
        ctx.stroke();

        // Colored glow
        ctx.strokeStyle = hslToRgba(l.hue, 1, 0.5, l.life * 0.5);
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Edge glows — all 4 sides at x4, bottom + sides at x3
      const intensity = multiplier === 2 ? 0.06 : multiplier === 3 ? 0.14 : 0.25;
      const edgeW = multiplier === 2 ? 60 : multiplier === 3 ? 100 : 120;
      const pulse = Math.sin(time * 3) * 0.03;

      // Bottom
      const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - edgeW);
      grad.addColorStop(0, hslToRgba(hues[0], 1, 0.5, intensity + pulse));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, canvas.height - edgeW, canvas.width, edgeW);

      // Sides
      const sideI = multiplier >= 4 ? intensity * 0.7 : intensity * 0.4;
      const sideW = multiplier >= 4 ? 80 : 50;
      const gradL = ctx.createLinearGradient(0, 0, sideW, 0);
      gradL.addColorStop(0, hslToRgba(hues[0], 1, 0.5, sideI));
      gradL.addColorStop(1, 'transparent');
      ctx.fillStyle = gradL;
      ctx.fillRect(0, 0, sideW, canvas.height);

      const gradR = ctx.createLinearGradient(canvas.width, 0, canvas.width - sideW, 0);
      gradR.addColorStop(0, hslToRgba(hues[0], 1, 0.5, sideI));
      gradR.addColorStop(1, 'transparent');
      ctx.fillStyle = gradR;
      ctx.fillRect(canvas.width - sideW, 0, sideW, canvas.height);

      // Top edge at x4
      if (multiplier >= 4) {
        const gradT = ctx.createLinearGradient(0, 0, 0, edgeW * 0.6);
        gradT.addColorStop(0, hslToRgba(hues[0], 1, 0.5, sideI));
        gradT.addColorStop(1, 'transparent');
        ctx.fillStyle = gradT;
        ctx.fillRect(0, 0, canvas.width, edgeW * 0.6);
      }

      // x3+: flame tongues at bottom
      if (multiplier >= 3) {
        for (let fx = 0; fx < canvas.width; fx += 40) {
          const flameH = 20 + Math.sin(time * 2 + fx * 0.05) * 15 + Math.sin(time * 5 + fx * 0.1) * 8;
          ctx.fillStyle = hslToRgba(hues[0], 1, 0.55, 0.06);
          ctx.beginPath();
          ctx.moveTo(fx, canvas.height);
          ctx.quadraticCurveTo(fx + 20, canvas.height - flameH, fx + 40, canvas.height);
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
  }, [multiplier, active, faction]);

  if (!active || multiplier < 2) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      aria-hidden="true"
    />
  );
}
