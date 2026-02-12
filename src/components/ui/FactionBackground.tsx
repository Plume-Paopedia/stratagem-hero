import { useEffect, useRef } from 'react';
import { useFactionStore } from '../../stores/factionStore';
import { FACTIONS } from '../../types/factions';
import type { Faction } from '../../types/factions';

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function drawTerminids(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const { r, g, b } = hexToRgb(FACTIONS.terminids.colors.primary);
  const accentRgb = hexToRgb(FACTIONS.terminids.colors.accent);

  const hexSize = 60;
  const pulse = Math.sin(time * 0.8) * 0.3 + 0.7;

  ctx.strokeStyle = `rgba(${r},${g},${b},${0.04 * pulse})`;
  ctx.lineWidth = 0.5;

  for (let row = -1; row < h / (hexSize * 0.87) + 1; row++) {
    for (let col = -1; col < w / hexSize + 1; col++) {
      const x = col * hexSize * 1.5 + (row % 2 === 0 ? 0 : hexSize * 0.75);
      const y = row * hexSize * 0.87;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const px = x + Math.cos(angle) * hexSize * 0.45;
        const py = y + Math.sin(angle) * hexSize * 0.45;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  for (let i = 0; i < 5; i++) {
    const bx = (w * (0.15 + i * 0.18)) + Math.sin(time * 0.3 + i * 2) * 30;
    const by = (h * 0.5) + Math.cos(time * 0.4 + i * 1.5) * 40;
    const bPulse = Math.sin(time * 0.5 + i) * 0.5 + 0.5;
    const grad = ctx.createRadialGradient(bx, by, 0, bx, by, 80 + bPulse * 40);
    grad.addColorStop(0, `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},${0.03 * bPulse})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(bx - 120, by - 120, 240, 240);
  }
}

function drawAutomatons(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const { r, g, b } = hexToRgb(FACTIONS.automatons.colors.primary);

  const gridSpacing = 80;
  const flicker = Math.sin(time * 2) * 0.02;
  ctx.strokeStyle = `rgba(${r},${g},${b},${0.035 + flicker})`;
  ctx.lineWidth = 0.5;

  for (let x = 0; x < w; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.strokeStyle = `rgba(${r},${g},${b},0.02)`;
  for (let d = -h; d < w + h; d += 40) {
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d - h, h);
    ctx.stroke();
  }

  const sparkSeed = Math.floor(time * 2) % 20;
  for (let i = 0; i < 3; i++) {
    const si = (sparkSeed + i * 7) % 20;
    const sx = ((si * 137) % Math.floor(w / gridSpacing)) * gridSpacing;
    const sy = ((si * 89) % Math.floor(h / gridSpacing)) * gridSpacing;
    const sparkAlpha = Math.max(0, 1 - ((time * 2) % 1));
    if (sparkAlpha > 0.5) {
      const sparkGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 15);
      sparkGrad.addColorStop(0, `rgba(255,100,0,${0.15 * sparkAlpha})`);
      sparkGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sparkGrad;
      ctx.fillRect(sx - 15, sy - 15, 30, 30);
    }
  }

  const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, `rgba(${r},0,0,0.04)`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function drawIlluminate(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const { r, g, b } = hexToRgb(FACTIONS.illuminate.colors.primary);
  const accentRgb = hexToRgb(FACTIONS.illuminate.colors.accent);
  const cx = w / 2;
  const cy = h / 2;

  ctx.save();
  ctx.translate(cx, cy);

  for (let ring = 0; ring < 5; ring++) {
    const radius = 80 + ring * 70;
    const rotation = time * (0.2 + ring * 0.05) * (ring % 2 === 0 ? 1 : -1);
    const alpha = 0.03 - ring * 0.004;
    if (alpha <= 0) continue;

    ctx.save();
    ctx.rotate(rotation);

    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([8, 12 + ring * 4]);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const nodeCount = 3 + ring;
    for (let n = 0; n < nodeCount; n++) {
      const angle = (Math.PI * 2 * n) / nodeCount;
      const nx = Math.cos(angle) * radius;
      const ny = Math.sin(angle) * radius;
      ctx.fillStyle = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},${alpha * 2})`;
      ctx.fillRect(nx - 2, ny - 2, 4, 4);
    }

    ctx.restore();
  }

  ctx.restore();

  const pulse = Math.sin(time * 1.2) * 0.3 + 0.7;
  const centralGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 * pulse);
  centralGlow.addColorStop(0, `rgba(${r},${g},${b},0.04)`);
  centralGlow.addColorStop(0.5, `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.015)`);
  centralGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = centralGlow;
  ctx.fillRect(cx - 200, cy - 200, 400, 400);
}

const DRAW_MAP: Record<Faction, (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void> = {
  terminids: drawTerminids,
  automatons: drawAutomatons,
  illuminate: drawIlluminate,
};

export function FactionBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeFaction = useFactionStore((s) => s.activeFaction);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeFaction) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SCALE = 0.5;
    const FRAME_INTERVAL = 1000 / 30;
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * SCALE);
      canvas.height = Math.floor(window.innerHeight * SCALE);
    };
    resize();
    window.addEventListener('resize', resize);
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';

    const drawFn = DRAW_MAP[activeFaction];
    const startTime = performance.now();
    let lastFrame = 0;

    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (now - lastFrame < FRAME_INTERVAL) return;
      lastFrame = now;
      const time = (now - startTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawFn(ctx, canvas.width, canvas.height, time);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [activeFaction]);

  if (!activeFaction) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[2]"
      style={{ opacity: 0.8 }}
    />
  );
}
