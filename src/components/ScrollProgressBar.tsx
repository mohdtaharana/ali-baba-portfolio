import { useEffect, useRef } from 'react';

interface ScrollProgressBarProps {
  theme?: 'light' | 'dark';
}

function fract(x: number): number {
  return x - Math.floor(x);
}

function hash(a: number, b: number): number {
  return fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);
}

export function ScrollProgressBar({ theme = 'light' }: ScrollProgressBarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef<'light' | 'dark'>(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let rafId = 0;
    let W = window.innerWidth;
    const H = 10;
    let DPR = 1;

    let targetProgress = 0;
    let smoothProgress = 0;
    let hoverX = -999;
    let hoverEnergy = 0;
    let targetHoverEnergy = 0;
    let isDragging = false;

    const computeScrollProgress = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    const resize = () => {
      W = window.innerWidth;
      DPR = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    };

    targetProgress = computeScrollProgress();
    smoothProgress = targetProgress;
    resize();

    const scrollToClientX = (clientX: number) => {
      const ratio = Math.min(1, Math.max(0, clientX / Math.max(1, W)));
      const doc = document.documentElement;
      const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
      window.scrollTo({
        top: ratio * maxScroll,
        behavior: 'auto',
      });
    };

    const onScroll = () => {
      targetProgress = computeScrollProgress();
    };

    const onPointerMove = (e: PointerEvent) => {
      hoverX = e.clientX;
      targetHoverEnergy = 1;
      if (isDragging) {
        scrollToClientX(e.clientX);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      hoverX = e.clientX;
      targetHoverEnergy = 1;
      scrollToClientX(e.clientX);
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onPointerLeave = () => {
      if (!isDragging) {
        targetHoverEnergy = 0;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerleave', onPointerLeave);

    const startTime = performance.now();

    const frame = (now: number) => {
      if (disposed) return;

      const t = (now - startTime) / 1000;
      smoothProgress = reducedMotion
        ? targetProgress
        : smoothProgress + (targetProgress - smoothProgress) * 0.22;
      hoverEnergy += (targetHoverEnergy - hoverEnergy) * 0.16;

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const step = W < 640 ? 6 : 7;
      const cols = Math.floor(W / step);
      const offsetX = (W - (cols - 1) * step) / 2;
      const isDark = themeRef.current === 'dark';
      const activeRgb = isDark ? '243, 243, 240' : '17, 17, 17';
      const tick = Math.floor(t * 9);

      const filledCols = smoothProgress * cols;

      for (let i = 0; i < cols; i++) {
        const x = offsetX + i * step;
        let y = 3.5;

        const distFromHead = i - filledCols;
        const isFilled = distFromHead <= 0;
        const isHeadFront = Math.abs(distFromHead) < 3.5 && smoothProgress > 0.005;

        let alpha = isFilled ? 0.92 : 0.13;
        let radius = isFilled ? 1.75 : 0.95;

        // Sparkling pixel leading edge
        if (isHeadFront && !reducedMotion) {
          const frontFactor = 1 - Math.abs(distFromHead) / 3.5;
          const flicker = hash(i + tick, 3.7) > 0.35 ? 1 : 0.35;
          radius = 1.2 + frontFactor * 1.45 * flicker;
          alpha = Math.max(alpha, 0.35 + frontFactor * 0.65 * flicker);
        }

        // Interactive pointer ripple along the pixel progress bar
        if (hoverEnergy > 0.02 && !reducedMotion) {
          const dPtr = Math.abs(x - hoverX);
          const hoverRadius = 72;
          if (dPtr < hoverRadius) {
            const p = (1 - dPtr / hoverRadius) * hoverEnergy;
            const wave = Math.sin(p * Math.PI);
            radius += wave * 1.35;
            y += wave * 2.2;
            alpha = Math.min(1, alpha + wave * 0.55);
          }
        }

        ctx.fillStyle = `rgba(${activeRgb}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div
      aria-label="Scroll progress bar — click or drag to jump"
      className="no-print fixed left-0 right-0 top-0 z-50 h-[10px]"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-pointer touch-none"
      />
    </div>
  );
}
