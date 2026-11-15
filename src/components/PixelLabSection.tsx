import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { Magnetic } from './Magnetic';
import { ScrollReveal } from './ScrollReveal';
import { ScrollWordReveal } from './ScrollWordReveal';

type InteractionMode = 'repel' | 'attract' | 'ripple' | 'draw';

interface PixelNode {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  painted: number;
  letterWeight: number;
  seed: number;
}

const FONT_5X7: Record<string, string[]> = {
  A: [
    '01110',
    '10001',
    '10001',
    '11111',
    '10001',
    '10001',
    '10001',
  ],
  L: [
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '11111',
  ],
  I: [
    '11111',
    '00100',
    '00100',
    '00100',
    '00100',
    '00100',
    '11111',
  ],
  B: [
    '11110',
    '10001',
    '10001',
    '11110',
    '10001',
    '10001',
    '11110',
  ],
};

function buildWordRows(word: string): string[] {
  const glyphs = word.split('').map((ch) => FONT_5X7[ch]);
  const rows: string[] = [];
  for (let r = 0; r < 7; r++) {
    rows.push(glyphs.map((g) => g[r]).join('0'));
  }
  return rows;
}

const ALI_ROWS = buildWordRows('ALI'); // 17 cols x 7 rows
const BABA_ROWS = buildWordRows('BABA'); // 23 cols x 7 rows

// Build unified 23 cols x 17 rows centered bitmap with ALI on top and BABA below
const ALI_BABA_BITMAP: string[] = (() => {
  const totalCols = 23;
  const padEachSide = (totalCols - ALI_ROWS[0].length) / 2; // 3
  const padStr = '0'.repeat(padEachSide);
  const topLines = ALI_ROWS.map((row) => `${padStr}${row}${padStr}`);
  const spacer = Array.from({ length: 3 }, () => '0'.repeat(totalCols));
  return [...topLines, ...spacer, ...BABA_ROWS];
})();

function fract(x: number): number {
  return x - Math.floor(x);
}

function hash(a: number, b: number): number {
  return fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);
}

function computeLetterWeight(col: number, row: number, cols: number, rows: number): number {
  const bmpH = ALI_BABA_BITMAP.length; // 17
  const bmpW = ALI_BABA_BITMAP[0].length; // 23

  // Scale cleanly to fill the canvas with comfortable padding
  const scale = Math.max(1, Math.floor(Math.min((cols - 4) / bmpW, (rows - 4) / bmpH)));
  const drawW = bmpW * scale;
  const drawH = bmpH * scale;
  const startCol = Math.floor((cols - drawW) / 2);
  const startRow = Math.floor((rows - drawH) / 2);

  const bx = Math.floor((col - startCol) / scale);
  const by = Math.floor((row - startRow) / scale);

  if (by >= 0 && by < bmpH && bx >= 0 && bx < bmpW && ALI_BABA_BITMAP[by][bx] === '1') {
    return 1;
  }
  return 0.14;
}

interface PixelLabSectionProps {
  theme?: 'light' | 'dark';
}

export function PixelLabSection({ theme = 'light' }: PixelLabSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef<'light' | 'dark'>(theme);
  themeRef.current = theme;

  const [mode, setMode] = useState<InteractionMode>('repel');
  const [gridInfo, setGridInfo] = useState<{ cols: number; rows: number }>({ cols: 0, rows: 0 });

  const modeRef = useRef<InteractionMode>(mode);
  const pitchRef = useRef<number>(14);
  const radiusRef = useRef<number>(115);

  const nodesRef = useRef<PixelNode[]>([]);
  const pointerRef = useRef<{ x: number; y: number; active: boolean; down: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
    down: false,
  });
  const ripplesRef = useRef<Array<{ x: number; y: number; born: number }>>([]);

  modeRef.current = mode;

  const rebuildGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const W = Math.max(280, Math.round(rect.width));
    const H = Math.max(300, Math.round(rect.height));
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    // Choose pitch dynamically so 23x17 ALI / BABA fits sharply on both mobile and desktop
    const step = W < 640 ? Math.max(9, Math.floor((W - 24) / 31)) : 14;
    pitchRef.current = step;
    radiusRef.current = W < 640 ? 85 : 120;

    const cols = Math.max(27, Math.floor((W - 20) / step));
    const rows = Math.max(19, Math.floor((H - 20) / step));
    const offsetX = (W - (cols - 1) * step) / 2;
    const offsetY = (H - (rows - 1) * step) / 2;

    const nextNodes: PixelNode[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bx = offsetX + c * step;
        const by = offsetY + r * step;
        nextNodes.push({
          baseX: bx,
          baseY: by,
          x: bx,
          y: by,
          vx: 0,
          vy: 0,
          painted: 0,
          letterWeight: computeLetterWeight(c, r, cols, rows),
          seed: hash(c, r),
        });
      }
    }

    nodesRef.current = nextNodes;
    setGridInfo({ cols, rows });
  }, []);

  useEffect(() => {
    rebuildGrid();
    const onResize = () => rebuildGrid();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [rebuildGrid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    const startTime = performance.now();

    const frame = (now: number) => {
      const t = (now - startTime) / 1000;
      const DPR = Math.min(2, window.devicePixelRatio || 1);
      const W = canvas.width / DPR;
      const H = canvas.height / DPR;

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const ptr = pointerRef.current;
      const activeMode = modeRef.current;
      const radius = radiusRef.current;
      const step = pitchRef.current;
      const maxDotR = step * 0.41;

      ripplesRef.current = ripplesRef.current.filter((rp) => now - rp.born < 1500);

      const nodes = nodesRef.current;
      const isDark = themeRef.current === 'dark';

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        const springK = 0.14;
        const damping = 0.78;
        n.vx += (n.baseX - n.x) * springK;
        n.vy += (n.baseY - n.y) * springK;

        if (ptr.active && !reducedMotion) {
          const dx = n.x - ptr.x;
          const dy = n.y - ptr.y;
          const dist = Math.hypot(dx, dy);

          if (dist < radius && dist > 0.001) {
            const force = (1 - dist / radius) * 1.15;
            if (activeMode === 'repel') {
              n.vx += (dx / dist) * force * 8.5;
              n.vy += (dy / dist) * force * 8.5;
            } else if (activeMode === 'attract') {
              n.vx -= (dx / dist) * force * 6.5;
              n.vy -= (dy / dist) * force * 6.5;
            } else if (activeMode === 'draw' && ptr.down) {
              n.painted = Math.min(1, n.painted + force * 0.45);
            } else if (activeMode === 'ripple') {
              const wave = Math.sin(dist * 0.12 - t * 9) * force * 3.5;
              n.vx += (dx / dist) * wave;
              n.vy += (dy / dist) * wave;
            }
          }
        }

        if (!reducedMotion) {
          for (const rp of ripplesRef.current) {
            const age = (now - rp.born) / 1000;
            const rpRadius = age * 360;
            const dx = n.baseX - rp.x;
            const dy = n.baseY - rp.y;
            const dist = Math.hypot(dx, dy);
            const band = Math.abs(dist - rpRadius);
            if (band < 48 && dist > 0.001) {
              const amp = (1 - band / 48) * Math.max(0, 1 - age / 1.5) * 5.2;
              n.vx += (dx / dist) * amp;
              n.vy += (dy / dist) * amp;
            }
          }
        }

        n.vx *= damping;
        n.vy *= damping;
        n.x += n.vx;
        n.y += n.vy;

        let intensity = n.letterWeight;
        if (!reducedMotion && n.letterWeight > 0.5) {
          intensity = n.letterWeight * (0.9 + 0.1 * Math.sin(t * 2.8 + n.seed * 12));
        }
        intensity = Math.min(1, Math.max(intensity, n.painted));

        if (ptr.active) {
          const dPtr = Math.hypot(n.x - ptr.x, n.y - ptr.y);
          if (dPtr < radius) {
            const boost = (1 - dPtr / radius) * 0.4;
            intensity = Math.min(1, intensity + boost);
          }
        }

        const rDot = Math.max(1.0, maxDotR * intensity);
        const speed = Math.hypot(n.vx, n.vy);

        if (n.painted > 0.55 || speed > 2.4 || n.letterWeight > 0.5) {
          ctx.fillStyle = isDark ? '#f3f3f0' : '#111111';
        } else {
          ctx.fillStyle = isDark
            ? `rgba(243, 243, 240, ${0.14 + intensity * 0.45})`
            : `rgba(17, 17, 17, ${0.14 + intensity * 0.45})`;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, rDot, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const updatePointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    pointerRef.current.x = clientX - rect.left;
    pointerRef.current.y = clientY - rect.top;
    pointerRef.current.active = true;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    updatePointer(e.clientX, e.clientY);
    pointerRef.current.down = true;
    ripplesRef.current.push({
      x: pointerRef.current.x,
      y: pointerRef.current.y,
      born: performance.now(),
    });
  };

  const handleReset = () => {
    setMode('repel');
    ripplesRef.current = [];
    for (const n of nodesRef.current) {
      n.painted = 0;
      n.vx = 0;
      n.vy = 0;
      n.x = n.baseX;
      n.y = n.baseY;
    }
  };

  return (
    <section
      id="lab"
      className="mt-20 scroll-mt-12 border-t border-black/10 pt-12 dark:border-white/10 md:mt-24"
    >
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <ScrollReveal delayMs={0}>
            <div className="font-mono-tabular text-xs text-[#7b7b7b] dark:text-[#9a9aa0]">
              04 · Interactive Pixel Lab
            </div>
          </ScrollReveal>
          <ScrollWordReveal
            as="h2"
            text="Play With the Dot Matrix"
            offset={['start 0.92', 'start 0.62']}
            className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] dark:text-[#f3f3f0] sm:text-3xl"
          />
          <ScrollWordReveal
            text="Move your cursor, click to send kinetic ripples, or switch to Draw mode to paint directly on the live pixel field."
            offset={['start 0.92', 'end 0.62']}
            className="mt-2 max-w-xl text-sm leading-relaxed text-[#4a4a4a] dark:text-[#b4b4ba]"
          />
        </div>

        <ScrollReveal delayMs={160}>
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              role="group"
              aria-label="Pixel interaction mode"
              className="flex flex-wrap items-center gap-1 rounded-lg bg-black/[0.04] p-1 dark:bg-white/[0.06]"
            >
              {(
                [
                  { id: 'repel', label: 'Repel' },
                  { id: 'attract', label: 'Attract' },
                  { id: 'ripple', label: 'Ripple' },
                  { id: 'draw', label: 'Draw' },
                ] as const
              ).map((item) => {
                const active = mode === item.id;
                return (
                  <Magnetic key={item.id} strength={0.18}>
                    <button
                      type="button"
                      onClick={() => setMode(item.id)}
                      className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-white text-[#111111] shadow-xs dark:bg-[#232327] dark:text-[#f3f3f0]'
                          : 'text-[#666666] hover:text-[#111111] dark:text-[#9a9aa0] dark:hover:text-[#f3f3f0]'
                      }`}
                    >
                      {item.label}
                    </button>
                  </Magnetic>
                );
              })}
            </div>

            <Magnetic strength={0.22}>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset pixel lab"
                className="inline-flex h-[34px] items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-black/15 bg-white px-3 text-xs font-medium text-[#111111] transition-colors hover:border-black/40 dark:border-white/15 dark:bg-[#17171a] dark:text-[#f3f3f0] dark:hover:border-white/40 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </Magnetic>
          </div>
        </ScrollReveal>
      </div>

      {/* Clean Interactive Canvas Stage without Settings Bar */}
      <ScrollReveal delayMs={180}>
        <div className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-white/80 dark:border-white/10 dark:bg-[#131316]">
          <div ref={containerRef} className="relative h-[320px] w-full select-none sm:h-[400px]">
            <canvas
              ref={canvasRef}
              onPointerMove={(e) => updatePointer(e.clientX, e.clientY)}
              onPointerDown={handlePointerDown}
              onPointerUp={() => {
                pointerRef.current.down = false;
              }}
              onPointerLeave={() => {
                pointerRef.current.active = false;
                pointerRef.current.down = false;
              }}
              className="block h-full w-full touch-none cursor-crosshair"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/10 px-5 py-2.5 text-xs text-[#7b7b7b] dark:border-white/10 dark:text-[#9a9aa0]">
            <span>
              Mode:{' '}
              <strong className="font-medium capitalize text-[#111111] dark:text-[#f3f3f0]">
                {mode}
              </strong>{' '}
              · Click anywhere to pulse
            </span>
            <span className="font-mono-tabular">
              {gridInfo.cols} × {gridInfo.rows} · {(gridInfo.cols * gridInfo.rows).toLocaleString()} pixels
            </span>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
