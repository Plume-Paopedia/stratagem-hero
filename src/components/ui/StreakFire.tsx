import { useEffect, useRef } from 'react';
import { useFactionStore } from '../../stores/factionStore';
import { FACTIONS } from '../../types/factions';

interface StreakFireProps {
  multiplier: number;
  active: boolean;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
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
  return [Math.round(t[0] * 255), Math.round(t[1] * 255), Math.round(t[2] * 255)];
}

interface Ember {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; hueIdx: number;
  alive: boolean;
}

interface Lightning {
  points: { x: number; y: number }[];
  life: number;
  hueIdx: number;
}

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
    const canvas = canvasEl;

    const SCALE = 0.5;
    let w = 0, h = 0;
    const resize = () => {
      w = Math.floor(window.innerWidth * SCALE);
      h = Math.floor(window.innerHeight * SCALE);
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener('resize', resize);
    const ctx = canvas.getContext('2d')!;

    const factionTheme = faction ? FACTIONS[faction] : null;
    const hues = factionTheme ? factionTheme.particleHues : [30, 15, 0];
    const hueRgb = hues.map((h) => hslToRgb(h, 1, 0.5));

    const MAX_EMBERS = multiplier === 2 ? 120 : multiplier === 3 ? 200 : 300;
    const pool: Ember[] = [];
    for (let i = 0; i < MAX_EMBERS; i++) {
      pool.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 1, hueIdx: 0, alive: false });
    }
    let aliveCount = 0;

    const lightnings: Lightning[] = [];

    const spawnsPerSec = multiplier === 2 ? 60 : multiplier === 3 ? 150 : 300;
    const topSpawnsPerSec = multiplier >= 4 ? 100 : 0;
    let spawnAccum = 0;
    let topSpawnAccum = 0;
    let lastFlare = 0;
    let time = 0;

    function spawnEmber(fromTop: boolean) {
      if (aliveCount >= MAX_EMBERS) return;

      let e: Ember | null = null;
      for (let i = 0; i < pool.length; i++) {
        if (!pool[i].alive) { e = pool[i]; break; }
      }
      if (!e) return;

      const side = fromTop ? 1 : Math.floor(Math.random() * 4);
      switch (side) {
        case 0: e.x = Math.random() * w; e.y = h; break;
        case 1: e.x = Math.random() * w; e.y = 0; break;
        case 2: e.x = 0; e.y = Math.random() * h; break;
        default: e.x = w; e.y = Math.random() * h; break;
      }
      e.vx = (Math.random() - 0.5) * 2 * SCALE;
      e.vy = (fromTop ? 1 + Math.random() * 2 : -1 - Math.random() * 3) * SCALE;
      e.life = 1;
      e.maxLife = 0.5 + Math.random() * 1.0;
      e.size = (1 + Math.random() * (multiplier * 1.2)) * SCALE;
      e.hueIdx = Math.floor(Math.random() * hues.length);
      e.alive = true;
      aliveCount++;
    }

    function spawnFlare() {
      const bx = Math.random() * w;
      const by = h;
      const count = Math.min(12, MAX_EMBERS - aliveCount);
      for (let i = 0; i < count; i++) {
        let e: Ember | null = null;
        for (let j = 0; j < pool.length; j++) {
          if (!pool[j].alive) { e = pool[j]; break; }
        }
        if (!e) return;
        e.x = bx; e.y = by;
        e.vx = (Math.random() - 0.5) * 6 * SCALE;
        e.vy = (-3 - Math.random() * 5) * SCALE;
        e.life = 1; e.maxLife = 0.3 + Math.random() * 0.5;
        e.size = (2 + Math.random() * 3) * SCALE;
        e.hueIdx = Math.floor(Math.random() * hues.length);
        e.alive = true;
        aliveCount++;
      }
    }

    function spawnLightning() {
      const side = Math.floor(Math.random() * 4);
      let sx: number, sy: number, ex: number, ey: number;
      const len = (30 + Math.random() * 60) * SCALE;
      switch (side) {
        case 0: sx = Math.random() * w; sy = h; ex = sx + (Math.random() - 0.5) * 40 * SCALE; ey = sy - len; break;
        case 1: sx = Math.random() * w; sy = 0; ex = sx + (Math.random() - 0.5) * 40 * SCALE; ey = sy + len; break;
        case 2: sx = 0; sy = Math.random() * h; ex = sx + len; ey = sy + (Math.random() - 0.5) * 40 * SCALE; break;
        default: sx = w; sy = Math.random() * h; ex = sx - len; ey = sy + (Math.random() - 0.5) * 40 * SCALE; break;
      }
      const points: { x: number; y: number }[] = [{ x: sx, y: sy }];
      const segments = 5;
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        points.push({
          x: sx + (ex - sx) * t + (Math.random() - 0.5) * 15 * SCALE,
          y: sy + (ey - sy) * t + (Math.random() - 0.5) * 15 * SCALE,
        });
      }
      points.push({ x: ex, y: ey });
      lightnings.push({ points, life: 1, hueIdx: 0 });
    }

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      time += dt;

      ctx.clearRect(0, 0, w, h);

      spawnAccum += spawnsPerSec * dt;
      while (spawnAccum >= 1) { spawnEmber(false); spawnAccum--; }

      if (topSpawnsPerSec > 0) {
        topSpawnAccum += topSpawnsPerSec * dt;
        while (topSpawnAccum >= 1) { spawnEmber(true); topSpawnAccum--; }
      }

      if (multiplier >= 3 && time - lastFlare > 0.5) {
        lastFlare = time;
        spawnFlare();
      }

      if (multiplier >= 4 && lightnings.length < 3 && Math.random() < 0.02) {
        spawnLightning();
      }

      aliveCount = 0;
      for (let i = 0; i < pool.length; i++) {
        const e = pool[i];
        if (!e.alive) continue;

        e.x += e.vx;
        e.y += e.vy;
        e.life -= dt / e.maxLife;

        if (e.life <= 0) { e.alive = false; continue; }
        aliveCount++;

        const rgb = hueRgb[e.hueIdx];
        const alpha = e.life * 0.8;
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
        const s = e.size;
        ctx.fillRect(e.x - s * 0.5, e.y - s * 0.5, s, s);

        if (multiplier >= 3 && s > 1.5 * SCALE) {
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${e.life * 0.1})`;
          const gs = s * 3;
          ctx.fillRect(e.x - gs * 0.5, e.y - gs * 0.5, gs, gs);
        }
      }

      for (let i = lightnings.length - 1; i >= 0; i--) {
        const l = lightnings[i];
        l.life -= dt * 5;
        if (l.life <= 0) { lightnings.splice(i, 1); continue; }

        ctx.strokeStyle = `rgba(255,255,255,${l.life * 0.9})`;
        ctx.lineWidth = 1.5 * SCALE;
        ctx.beginPath();
        ctx.moveTo(l.points[0].x, l.points[0].y);
        for (let j = 1; j < l.points.length; j++) {
          ctx.lineTo(l.points[j].x, l.points[j].y);
        }
        ctx.stroke();

        const rgb = hueRgb[l.hueIdx];
        ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${l.life * 0.4})`;
        ctx.lineWidth = 4 * SCALE;
        ctx.stroke();
      }

      const intensity = multiplier === 2 ? 0.06 : multiplier === 3 ? 0.14 : 0.25;
      const edgeW = (multiplier === 2 ? 60 : multiplier === 3 ? 100 : 120) * SCALE;
      const pulse = Math.sin(time * 3) * 0.03;
      const rgb0 = hueRgb[0];

      const grad = ctx.createLinearGradient(0, h, 0, h - edgeW);
      grad.addColorStop(0, `rgba(${rgb0[0]},${rgb0[1]},${rgb0[2]},${intensity + pulse})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, h - edgeW, w, edgeW);

      const sideI = multiplier >= 4 ? intensity * 0.7 : intensity * 0.4;
      const sideW = (multiplier >= 4 ? 80 : 50) * SCALE;

      const gradL = ctx.createLinearGradient(0, 0, sideW, 0);
      gradL.addColorStop(0, `rgba(${rgb0[0]},${rgb0[1]},${rgb0[2]},${sideI})`);
      gradL.addColorStop(1, 'transparent');
      ctx.fillStyle = gradL;
      ctx.fillRect(0, 0, sideW, h);

      const gradR = ctx.createLinearGradient(w, 0, w - sideW, 0);
      gradR.addColorStop(0, `rgba(${rgb0[0]},${rgb0[1]},${rgb0[2]},${sideI})`);
      gradR.addColorStop(1, 'transparent');
      ctx.fillStyle = gradR;
      ctx.fillRect(w - sideW, 0, sideW, h);

      if (multiplier >= 4) {
        const topW = edgeW * 0.6;
        const gradT = ctx.createLinearGradient(0, 0, 0, topW);
        gradT.addColorStop(0, `rgba(${rgb0[0]},${rgb0[1]},${rgb0[2]},${sideI})`);
        gradT.addColorStop(1, 'transparent');
        ctx.fillStyle = gradT;
        ctx.fillRect(0, 0, w, topW);
      }

      if (multiplier >= 3) {
        const step = 60;
        ctx.fillStyle = `rgba(${rgb0[0]},${rgb0[1]},${rgb0[2]},0.06)`;
        for (let fx = 0; fx < w; fx += step) {
          const flameH = (20 + Math.sin(time * 2 + fx * 0.05) * 15 + Math.sin(time * 5 + fx * 0.1) * 8) * SCALE;
          ctx.beginPath();
          ctx.moveTo(fx, h);
          ctx.quadraticCurveTo(fx + step * 0.5, h - flameH, fx + step, h);
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
      style={{ imageRendering: 'auto', width: '100vw', height: '100vh' }}
      aria-hidden="true"
    />
  );
}
