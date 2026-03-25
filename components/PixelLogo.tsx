'use client';

import { useRef, useEffect } from 'react';

const PX = 4;
const COLS = 13;
const ROWS = 17;
const W = COLS * PX; // 52
const H = ROWS * PX; // 68

type Pixel = [number, number];

// 7 frames mapping to biological fern growth stages
// Grid: 13 cols (0-12), 17 rows (0-16), stem at center col 6, base row 15
const FRAMES: Pixel[][] = [
  // 0: Bud — spore germination: single sprout
  [[6, 15]],

  // 1: Bud — prothallus: tiny reversed-r hook
  [[7, 11], [7, 12], [6, 12], [6, 13], [6, 14], [6, 15]],

  // 2: Bud — sporophyte emergence: growing q/9 shape
  [[6, 8], [7, 8],
   [7, 9], [7, 10], [6, 10],
   [6, 11], [6, 12], [6, 13], [6, 14], [6, 15]],

  // 3: Unfurling — fiddlehead starts: square loop forming
  [[5, 6], [6, 6], [7, 6],
   [7, 7], [7, 8],
   [5, 8], [6, 8], [5, 7],
   [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [6, 15]],

  // 4: Unfurling — crozier: full concentric spiral (fiddlehead)
  [[5, 3], [6, 3], [7, 3], [8, 3],
   [8, 4], [8, 5], [8, 6], [8, 7],
   [5, 4], [6, 4], [7, 4],
   [5, 5], [5, 6], [5, 7],
   [5, 8], [6, 8], [7, 8],
   [4, 4], [4, 5], [4, 6], [4, 7], [4, 8], [4, 9],
   [4, 10], [5, 10], [6, 10], [7, 10], [8, 10],
   [6, 11], [6, 12], [6, 13], [6, 14], [6, 15]],

  // 5: Mature — fronds just emerging
  [[6, 4],
   [5, 5], [6, 5], [7, 5],
   [4, 6], [5, 6], [6, 6], [7, 6], [8, 6],
   [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7],
   [4, 8], [5, 8], [6, 8], [7, 8], [8, 8],
   [5, 9], [6, 9], [7, 9],
   [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [6, 15]],

  // 6: Mature — full bushy fern (sways in wind)
  [[6, 2],
   [5, 3], [6, 3], [7, 3],
   [4, 4], [5, 4], [6, 4], [7, 4], [8, 4],
   [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5],
   [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6],
   [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7],
   [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8],
   [4, 9], [5, 9], [6, 9], [7, 9], [8, 9],
   [5, 10], [6, 10], [7, 10],
   [6, 11], [6, 12], [6, 13], [6, 14], [6, 15]],
];

// Frame start times (ms) based on biological proportions within 2000ms total:
//   spore germination (fast) → prothallus (1-3mo) → emergence → fiddlehead × 2 → mature × 2
const FRAME_STARTS = [0, 100, 300, 600, 900, 1300, 1650];
const ANIM_DURATION = 2000;

const SWAY_PERIOD = 3500; // ms per full sway cycle
const SWAY_MAX = 2;       // max pixel offset at top of fern
const BASE_ROW = 15;      // root — no sway here

function getLightMode(): boolean {
  if (typeof window === 'undefined') return false;
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light') return true;
  if (attr === 'dark') return false;
  return window.matchMedia('(prefers-color-scheme: light)').matches;
}

export default function PixelLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<number>(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    startRef.current = performance.now();

    function draw(now: number) {
      const elapsed = now - startRef.current;
      const isLight = getLightMode();
      const color = isLight ? 'rgba(4, 166, 90, 0.9)' : 'rgba(0, 232, 123, 0.9)';

      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = color;

      let pixels: Pixel[];
      let sway = 0;

      if (elapsed < ANIM_DURATION) {
        let frameIdx = 0;
        for (let i = FRAME_STARTS.length - 1; i >= 0; i--) {
          if (elapsed >= FRAME_STARTS[i]) { frameIdx = i; break; }
        }
        pixels = FRAMES[frameIdx];
      } else {
        pixels = FRAMES[FRAMES.length - 1];
        const t = (elapsed - ANIM_DURATION) / SWAY_PERIOD;
        sway = Math.sin(t * 2 * Math.PI) * SWAY_MAX;
      }

      for (const [col, row] of pixels) {
        const swayFactor = Math.max(0, (BASE_ROW - row) / BASE_ROW);
        ctx!.fillRect(col * PX + sway * swayFactor, row * PX, PX, PX);
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="hero-logo-canvas"
    />
  );
}
