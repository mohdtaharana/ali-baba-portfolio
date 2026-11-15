import { useEffect, useRef } from 'react';

interface PixelParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  square: boolean;
}

interface PixelPointerEffectProps {
  theme?: 'light' | 'dark';
}

const GRID_SNAP = 6;

export function PixelPointerEffect({ theme = 'light' }: PixelPointerEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef<'light' | 'dark'>(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof window === 'undefined') return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (reducedMotion || isCoarsePointer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let disposed = false;
    let rafId: number | null = null;
    let W = window.innerWidth;
    let H = window.innerHeight;
    let DPR = Math.min(2, window.devicePixelRatio || 1);

    const particles: PixelParticle[] = [];
    const pointer = {
      x: -999,
      y: -999,
      smoothX: -999,
      smoothY: -999,
      lastSpawnX: -999,
      lastSpawnY: -999,
      active: false,
      overInteractive: false,
      energy: 0,
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      DPR = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    };

    resize();

    const spawnTrailPixel = (x: number, y: number, speed: number) => {
      const snappedX = Math.round(x / GRID_SNAP) * GRID_SNAP + (Math.random() - 0.5) * 8;
      const snappedY = Math.round(y / GRID_SNAP) * GRID_SNAP + (Math.random() - 0.5) * 8;
      const angle = Math.random() * Math.PI * 2;
      const drift = 0.25 + Math.min(1.1, speed * 0.03);
      particles.push({
        x: snappedX,
        y: snappedY,
        vx: Math.cos(angle) * drift,
        vy: Math.sin(angle) * drift + 0.15,
        size: 1.8 + Math.random() * 2.2,
        life: 0,
        maxLife: 24 + Math.random() * 16,
        square: Math.random() > 0.35,
      });
      if (particles.length > 140) {
        particles.splice(0, particles.length - 140);
      }
    };

    const spawnClickBurst = (x: number, y: number) => {
      const count = 16;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
        const speed = 1.6 + Math.random() * 2.4;
        particles.push({
          x: Math.round(x / 4) * 4,
          y: Math.round(y / 4) * 4,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 2.4,
          life: 0,
          maxLife: 28 + Math.random() * 14,
          square: i % 2 === 0,
        });
      }
    };

    const ensureLoop = () => {
      if (rafId === null && !disposed) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      pointer.overInteractive = Boolean(target?.closest('a, button, input, [role="button"]'));

      if (!pointer.active) {
        pointer.smoothX = e.clientX;
        pointer.smoothY = e.clientY;
        pointer.lastSpawnX = e.clientX;
        pointer.lastSpawnY = e.clientY;
      }

      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.energy = 1;

      const dist = Math.hypot(e.clientX - pointer.lastSpawnX, e.clientY - pointer.lastSpawnY);
      if (dist >= 10) {
        const count = Math.min(3, Math.floor(dist / 12));
        for (let k = 0; k < count; k++) {
          const lerpT = (k + 1) / (count + 1);
          const px = pointer.lastSpawnX + (e.clientX - pointer.lastSpawnX) * lerpT;
          const py = pointer.lastSpawnY + (e.clientY - pointer.lastSpawnY) * lerpT;
          spawnTrailPixel(px, py, dist);
        }
        pointer.lastSpawnX = e.clientX;
        pointer.lastSpawnY = e.clientY;
      }

      ensureLoop();
    };

    const onPointerDown = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.energy = 1;
      spawnClickBurst(e.clientX, e.clientY);
      ensureLoop();
    };

    const onPointerLeave = () => {
      pointer.active = false;
      ensureLoop();
    };

    const tick = () => {
      if (disposed) return;

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const isDark = themeRef.current === 'dark';
      const inkRgb = isDark ? '243, 243, 240' : '17, 17, 17';

      if (pointer.active) {
        pointer.smoothX += (pointer.x - pointer.smoothX) * 0.35;
        pointer.smoothY += (pointer.y - pointer.smoothY) * 0.35;
        pointer.energy += (1 - pointer.energy) * 0.2;
      } else {
        pointer.energy *= 0.86;
      }

      // Update & draw pixel trail particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;

        const progress = p.life / p.maxLife;
        if (progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = (1 - progress) * 0.72;
        const s = p.size * (1 - progress * 0.55);

        ctx.fillStyle = `rgba(${inkRgb}, ${alpha.toFixed(3)})`;
        if (p.square) {
          ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, s * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw crisp 4-pixel corner reticle orbiting the pointer
      if (pointer.energy > 0.04) {
        const spread = pointer.overInteractive ? 12 : 7;
        const dotSize = pointer.overInteractive ? 2.4 : 2.0;
        const alpha = pointer.energy * (pointer.overInteractive ? 0.75 : 0.45);
        ctx.fillStyle = `rgba(${inkRgb}, ${alpha.toFixed(3)})`;

        const offsets: [number, number][] = [
          [-spread, -spread],
          [spread, -spread],
          [spread, spread],
          [-spread, spread],
        ];
        for (const [ox, oy] of offsets) {
          ctx.fillRect(
            Math.round(pointer.smoothX + ox - dotSize / 2),
            Math.round(pointer.smoothY + oy - dotSize / 2),
            dotSize,
            dotSize
          );
        }
      }

      if (particles.length > 0 || pointer.active || pointer.energy > 0.04) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);

    return () => {
      disposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('mouseleave', onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-0 z-40 block h-full w-full"
    />
  );
}
