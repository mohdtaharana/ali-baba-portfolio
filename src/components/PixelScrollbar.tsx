import { useEffect, useRef } from 'react';

interface PixelScrollbarProps {
  theme?: 'light' | 'dark';
}

function fract(x: number): number {
  return x - Math.floor(x);
}

function hash(a: number, b: number): number {
  return fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);
}

export function PixelScrollbar({ theme = 'light' }: PixelScrollbarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef<'light' | 'dark'>(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let rafId = 0;

    let W = 18;
    let H = Math.max(200, window.innerHeight - 28);
    let DPR = 1;

    let scrollTop = window.scrollY;
    let maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    let thumbRatio = 0.25;
    let scrollRatio = 0;
    let smoothRatio = 0;
    let lastScrollTime = 0;

    let hoverY = -999;
    let hoverEnergy = 0;
    let targetHoverEnergy = 0;
    let isDragging = false;
    let dragGrabOffsetPx = 0;

    const syncMetrics = () => {
      const doc = document.documentElement;
      maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
      thumbRatio = Math.min(1, Math.max(0.07, window.innerHeight / Math.max(1, doc.scrollHeight)));
      scrollTop = window.scrollY;
      scrollRatio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      W = Math.max(12, Math.round(rect.width));
      H = Math.max(180, Math.round(rect.height));
      DPR = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      syncMetrics();
    };

    resize();
    smoothRatio = scrollRatio;

    const scrollFromPointerY = (clientY: number, grabOffset = 0) => {
      const rect = canvas.getBoundingClientRect();
      const thumbH = thumbRatio * H;
      const travel = Math.max(1, H - thumbH);
      const localY = clientY - rect.top - grabOffset;
      const ratio = Math.min(1, Math.max(0, localY / travel));
      window.scrollTo({
        top: ratio * maxScroll,
        behavior: 'auto',
      });
    };

    const onScroll = () => {
      syncMetrics();
      lastScrollTime = performance.now();
    };

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const localY = e.clientY - rect.top;
      const thumbH = thumbRatio * H;
      const thumbTop = smoothRatio * (H - thumbH);

      isDragging = true;
      targetHoverEnergy = 1;
      hoverY = localY;

      if (localY >= thumbTop && localY <= thumbTop + thumbH) {
        dragGrabOffsetPx = localY - thumbTop;
      } else {
        dragGrabOffsetPx = thumbH / 2;
      }

      scrollFromPointerY(e.clientY, dragGrabOffsetPx);
    };

    const onPointerMoveWindow = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      hoverY = e.clientY - rect.top;
      if (isDragging) {
        scrollFromPointerY(e.clientY, dragGrabOffsetPx);
      }
    };

    const onPointerMoveCanvas = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      hoverY = e.clientY - rect.top;
      targetHoverEnergy = 1;
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        targetHoverEnergy = 0;
      }
    };

    const onPointerLeave = () => {
      if (!isDragging) {
        targetHoverEnergy = 0;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMoveWindow);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMoveCanvas);
    canvas.addEventListener('pointerleave', onPointerLeave);

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => syncMetrics())
        : null;
    resizeObserver?.observe(document.body);

    const startTime = performance.now();

    const frame = (now: number) => {
      if (disposed) return;

      const t = (now - startTime) / 1000;
      smoothRatio = reducedMotion
        ? scrollRatio
        : smoothRatio + (scrollRatio - smoothRatio) * 0.28;
      hoverEnergy += (targetHoverEnergy - hoverEnergy) * 0.18;

      const scrollVelocityBoost = Math.max(0, 1 - (now - lastScrollTime) / 360);

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const isCompact = W <= 14;
      const cols = isCompact ? 1 : 2;
      const pitchY = 7;
      const pitchX = 6;
      const rows = Math.floor(H / pitchY);
      const offsetY = (H - (rows - 1) * pitchY) / 2;
      const offsetX = cols === 1 ? W * 0.5 : W * 0.5 - pitchX * 0.5;

      const thumbH = thumbRatio * H;
      const thumbTop = smoothRatio * (H - thumbH);
      const thumbBottom = thumbTop + thumbH;

      const isDark = themeRef.current === 'dark';
      const inkRgb = isDark ? '243, 243, 240' : '17, 17, 17';
      const tick = Math.floor(t * 10);

      for (let r = 0; r < rows; r++) {
        const y = offsetY + r * pitchY;

        const inThumb = y >= thumbTop && y <= thumbBottom;
        const distToEdge = Math.min(Math.abs(y - thumbTop), Math.abs(y - thumbBottom));
        const nearEdge = distToEdge < 14;

        for (let c = 0; c < cols; c++) {
          let x = offsetX + c * pitchX;
          let radius = inThumb ? 1.85 : 0.95;
          let alpha = inThumb ? 0.92 : 0.14;

          // Subtle pixel shimmer at the thumb's leading/trailing edges while scrolling
          if (nearEdge && !reducedMotion) {
            const edgeFactor = 1 - distToEdge / 14;
            const spark = hash(r + tick, c * 3.1 + 1.7);
            const activeSpark = spark > 0.45 ? 1 : 0.35;
            if (!inThumb && scrollVelocityBoost > 0.05) {
              alpha += edgeFactor * scrollVelocityBoost * 0.45 * activeSpark;
              radius += edgeFactor * scrollVelocityBoost * 0.75 * activeSpark;
            } else if (inThumb) {
              radius += edgeFactor * 0.35 * activeSpark;
            }
          }

          // Pointer hover / drag pixel wave right on the scrollbar
          if (hoverEnergy > 0.02 && !reducedMotion) {
            const dy = y - hoverY;
            const d = Math.abs(dy);
            const hoverRadius = 52;
            if (d < hoverRadius) {
              const p = (1 - d / hoverRadius) * hoverEnergy;
              const wave = Math.sin(p * Math.PI);
              radius += wave * 1.15;
              alpha = Math.min(1, alpha + wave * 0.5);
              x -= wave * 2.2;
            }
          }

          ctx.fillStyle = `rgba(${inkRgb}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMoveWindow);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMoveCanvas);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-label="Interactive pixel scrollbar — click or drag to scroll"
      className="no-print fixed bottom-3 right-1 top-3.5 z-50 w-[12px] sm:right-1.5 sm:w-[18px]"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-pointer touch-none"
      />
    </div>
  );
}
