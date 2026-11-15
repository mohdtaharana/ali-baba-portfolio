import { useEffect, useRef } from 'react';

const HAND_SHEET_URL =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261030_025250_100df7b8-31fd-4614-aa4a-c1b7d5b6b273.png&w=1600&q=85';

const SRC_RECTS = {
  LA: [0, 0.06, 0.47, 0.4] as const,
  RA: [0.53, 0.06, 0.47, 0.4] as const,
  LB: [0, 0.55, 0.47, 0.4] as const,
  RB: [0.53, 0.55, 0.47, 0.4] as const,
};

const LOOP = 20;
const LEVELS = [0, 0.26, 0.52, 0.78, 1];
const SHEET_ASPECT = (0.4 * 1520) / (0.47 * 2688);

declare global {
  interface Window {
    __render?: (tSec: number) => void;
  }
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function fract(x: number): number {
  return x - Math.floor(x);
}

function hash(a: number, b: number): number {
  return fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);
}

function smooth(a: number, b: number, x: number): number {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function mixAt(t: number, on: number, off: number, dur: number): number {
  return smooth(on, on + dur, t) * (1 - smooth(off, off + dur, t));
}

function createProceduralFallbackTile(isLeft: boolean, isOpenPose: boolean): HTMLCanvasElement {
  const tileW = 420;
  const tileH = Math.round(tileW * SHEET_ASPECT);
  const c = document.createElement('canvas');
  c.width = tileW;
  c.height = tileH;
  const ctx = c.getContext('2d');
  if (!ctx) return c;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, tileW, tileH);

  ctx.save();
  if (!isLeft) {
    ctx.translate(tileW, 0);
    ctx.scale(-1, 1);
  }

  const grad = ctx.createLinearGradient(0, tileH * 0.2, tileW * 0.9, tileH * 0.8);
  grad.addColorStop(0, '#5a5a5a');
  grad.addColorStop(0.55, '#8a8a8a');
  grad.addColorStop(1, '#b5b5b5');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, tileH * 0.36);
  ctx.quadraticCurveTo(tileW * 0.35, tileH * 0.38, tileW * 0.62, tileH * 0.34);
  ctx.quadraticCurveTo(tileW * 0.72, tileH * 0.45, tileW * 0.64, tileH * 0.63);
  ctx.quadraticCurveTo(tileW * 0.35, tileH * 0.64, 0, tileH * 0.68);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(tileW * 0.56, tileH * (isOpenPose ? 0.3 : 0.33), tileW * 0.38, tileH * 0.11, 18);
  ctx.fill();

  const fingers = isOpenPose ? [0.42, 0.53, 0.63] : [0.44, 0.52];
  fingers.forEach((yf, idx) => {
    ctx.beginPath();
    const len = isOpenPose ? tileW * (0.31 - idx * 0.03) : tileW * (0.21 - idx * 0.04);
    ctx.roundRect(tileW * 0.55, tileH * yf, len, tileH * 0.095, 16);
    ctx.fill();
  });

  ctx.restore();
  return c;
}

interface DotMatrixHandsCanvasProps {
  theme?: 'light' | 'dark';
}

export function DotMatrixHandsCanvas({ theme = 'light' }: DotMatrixHandsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef<'light' | 'dark'>(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tiles: Record<keyof typeof SRC_RECTS, HTMLCanvasElement> | null = null;
    let disposed = false;
    let rafId = 0;

    let W = 0;
    let H = 0;
    let DPR = 1;
    let step = 7;
    let rowStep = 14.35;
    let cols = 1;
    let rows = 1;
    let R = 3.22;
    let seeds = new Float32Array(0);

    const fA = document.createElement('canvas');
    const fB = document.createElement('canvas');
    const ctxA = fA.getContext('2d', { willReadFrequently: true });
    const ctxB = fB.getContext('2d', { willReadFrequently: true });

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      W = Math.max(320, Math.round(rect?.width || window.innerWidth));
      H = Math.max(480, Math.round(rect?.height || window.innerHeight));
      DPR = Math.min(2, window.devicePixelRatio || 1);

      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;

      const isMobile = W < 768;
      step = isMobile ? Math.max(2.5, W / 145) : Math.max(5, W / 205);
      rowStep = step * (isMobile ? 1.85 : 2.05);
      cols = Math.ceil(W / step);
      rows = Math.ceil(H / rowStep);
      R = step * (isMobile ? 0.48 : 0.46);

      fA.width = cols;
      fA.height = rows;
      fB.width = cols;
      fB.height = rows;

      seeds = new Float32Array(cols * rows);
      for (let j = 0; j < rows; j++) {
        const rowBias = hash(j * 3.1, 7.7);
        for (let i = 0; i < cols; i++) {
          seeds[j * cols + i] = 0.55 * hash(i, j) + 0.45 * rowBias;
        }
      }
    };

    const drawHandIntoField = (
      fCtx: CanvasRenderingContext2D,
      tile: HTMLCanvasElement,
      isLeft: boolean,
      a: number,
      isPortrait: boolean
    ) => {
      const ph = isLeft ? 0 : Math.PI;
      const hw = W * (isPortrait ? 0.56 : 0.53);
      const hh = hw * SHEET_ASPECT;
      const cy = H * (isPortrait ? 0.67 : 0.54);

      const reach = (0.035 * Math.sin(a + ph) + 0.012 * Math.sin(2 * a + 1.3 + ph)) * W;
      const scale = 1 + 0.07 * Math.sin(a + 0.9 + ph);
      const rot = (isLeft ? 1 : -1) * 0.045 * Math.sin(a + 2.1 + ph);

      const x = isLeft ? reach - W * 0.045 : W - hw + W * 0.045 - reach;
      const pivotX = isLeft ? 0 : W;

      fCtx.save();
      fCtx.globalCompositeOperation = 'darken';
      fCtx.scale(cols / W, rows / H);
      fCtx.translate(pivotX, cy);
      fCtx.rotate(rot);
      fCtx.scale(scale, scale);
      fCtx.translate(-pivotX, -cy);
      fCtx.drawImage(tile, x, cy - hh / 2, hw, hh);
      fCtx.restore();
    };

    const render = (rawSec: number) => {
      if (disposed || !ctxA || !ctxB) return;

      const t = ((rawSec % LOOP) + LOOP) % LOOP;
      const a = (2 * Math.PI * t) / LOOP;
      const isPortrait = H > W;

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (!tiles) return;

      ctxA.fillStyle = '#ffffff';
      ctxA.fillRect(0, 0, cols, rows);
      ctxB.fillStyle = '#ffffff';
      ctxB.fillRect(0, 0, cols, rows);

      drawHandIntoField(ctxA, tiles.LA, true, a, isPortrait);
      drawHandIntoField(ctxA, tiles.RA, false, a, isPortrait);
      drawHandIntoField(ctxB, tiles.LB, true, a, isPortrait);
      drawHandIntoField(ctxB, tiles.RB, false, a, isPortrait);

      const dataA = ctxA.getImageData(0, 0, cols, rows).data;
      const dataB = ctxB.getImageData(0, 0, cols, rows).data;

      const mL = mixAt(t, 6.2, 14.6, 1.6);
      const mR = mixAt(t, 2.4, 10.4, 1.6);
      const tick = Math.floor(t * 7);
      const halfCols = cols / 2;

      const quietX = isPortrait ? 0.44 : 0.2;
      const quietCenterY = isPortrait ? 0.33 : 0.385;

      ctx.fillStyle = themeRef.current === 'dark' ? '#f2f2ef' : '#0d0d0d';

      for (let j = 0; j < rows; j++) {
        const y = (j + 0.5) * rowStep;
        const yNorm = y / H;
        const ey = (yNorm - quietCenterY) / 0.085;
        const rowShift = hash(j, tick) > 0.965 ? Math.round((hash(tick, j) - 0.5) * 8) : 0;

        for (let i = 0; i < cols; i++) {
          const sampleI = clamp(i - rowShift, 0, cols - 1);
          const idx = j * cols + sampleI;
          const seed = seeds[idx];
          const m = i < halfCols ? mL : mR;

          const useB = seed < m;
          const pxIdx = idx * 4;
          const lum = (useB ? dataB[pxIdx] : dataA[pxIdx]) / 255;

          let v = clamp((1 - lum - 0.16) / 0.42, 0, 1);
          if (v <= 0) continue;

          if (m > 0.001 && m < 0.999) {
            const dist = Math.abs(seed - m);
            if (dist < 0.12) {
              v *= dist / 0.12;
              if (hash(i + tick, j) <= 0.4) {
                v *= 0.3;
              }
            }
          }

          v *= 0.86 + 0.14 * Math.sin(t * 3.2 + seed * 40);

          const cx = Math.abs((i + 0.5) / cols - 0.5);
          v *= smooth(isPortrait ? 0.012 : 0.035, isPortrait ? 0.05 : 0.11, cx);

          const ex = cx / quietX;
          v *= smooth(0.85, 1.25, Math.hypot(ex, ey));

          let chosenLevel = 0;
          for (let k = LEVELS.length - 1; k >= 1; k--) {
            if (v >= LEVELS[k] - 0.13) {
              chosenLevel = LEVELS[k];
              break;
            }
          }

          if (chosenLevel === 0) continue;

          const radius =
            chosenLevel === 0.26
              ? Math.max(0.7, R * 0.38)
              : Math.max(0.9, R * chosenLevel);
          const x = (i + 0.5) * step;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    window.__render = render;
    resize();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();

    const startLoop = () => {
      if (disposed) return;
      if (prefersReducedMotion) {
        render(0);
        return;
      }
      const frame = (now: number) => {
        if (disposed) return;
        render((now - t0) / 1000);
        rafId = requestAnimationFrame(frame);
      };
      rafId = requestAnimationFrame(frame);
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (disposed) return;
      const sliced = {} as Record<keyof typeof SRC_RECTS, HTMLCanvasElement>;
      (Object.keys(SRC_RECTS) as Array<keyof typeof SRC_RECTS>).forEach((key) => {
        const [fx, fy, fw, fh] = SRC_RECTS[key];
        const sx = fx * img.naturalWidth;
        const sy = fy * img.naturalHeight;
        const sw = fw * img.naturalWidth;
        const sh = fh * img.naturalHeight;

        const tileW = 420;
        const tileH = Math.round(tileW * (sh / sw));
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = tileW;
        tileCanvas.height = tileH;
        const tCtx = tileCanvas.getContext('2d');
        if (tCtx) {
          tCtx.imageSmoothingEnabled = true;
          tCtx.imageSmoothingQuality = 'high';
          tCtx.drawImage(img, sx, sy, sw, sh, 0, 0, tileW, tileH);
        }
        sliced[key] = tileCanvas;
      });
      tiles = sliced;
      startLoop();
    };

    img.onerror = () => {
      if (disposed) return;
      tiles = {
        LA: createProceduralFallbackTile(true, false),
        RA: createProceduralFallbackTile(false, false),
        LB: createProceduralFallbackTile(true, true),
        RB: createProceduralFallbackTile(false, true),
      };
      startLoop();
    };

    img.src = HAND_SHEET_URL;

    const handleResize = () => {
      resize();
      if (prefersReducedMotion && tiles) {
        render(0);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      if (window.__render === render) {
        delete window.__render;
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="dots"
      aria-hidden="true"
      className="absolute inset-0 block h-full w-full pointer-events-none"
    />
  );
}
