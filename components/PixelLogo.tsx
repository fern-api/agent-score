'use client';

import { useRef, useEffect, useState } from 'react';

const PX = 4;
const COLS = 13;
const ROWS = 17;
const W = COLS * PX; // 52
const H = ROWS * PX; // 68

type Pixel = [number, number];

// 7 frames mapping to biological fern growth stages
// Grid: 13 cols (0-12), 17 rows (0-16), stem at center col 6, base row 15
const FRAMES: Pixel[][] = [
  // 0: Bud — single pixel
  [[6, 15]],

  // 1: Sprout — tiny hook forming
  [[7, 11], [7, 12], [6, 12], [6, 13], [6, 14], [6, 15]],

  // 2: Elongated hook with curl
  [
    [6, 8], [7, 8], [7, 9], [7, 10], [6, 10],
    [6, 11], [6, 12], [6, 13], [6, 14], [6, 15],
  ],

  // 3: Unfurling — tight fiddlehead pod: complete 3×3 hollow ring + stem
  [
    [5, 6], [6, 6], [7, 6],   // top
    [5, 7],         [7, 7],   // sides (hollow center at 6,7)
    [5, 8], [6, 8], [7, 8],   // bottom
    // Stalk stays fixed from here down
    [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [6, 15],
  ],

  // 4: Unfurling — large concentric pod: 7×7 outer ring + 3×3 inner ring (1-pixel gap between)
  [
    // Outer 7×7 ring (rows 2–8, cols 3–9)
    [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2],
    [3, 3],                                         [9, 3],
    [3, 4],                                         [9, 4],
    [3, 5],                                         [9, 5],
    [3, 6],                                         [9, 6],
    [3, 7],                                         [9, 7],
    [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8],
    // Inner 3×3 ring (rows 4–6, cols 5–7) — 1-pixel gap to outer
    [5, 4], [6, 4], [7, 4],
    [5, 5],         [7, 5],   // hollow at (6,5) shows both rings clearly
    [5, 6], [6, 6], [7, 6],
    // Stalk
    [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [6, 15],
  ],

  // 5: Mature — stalk fixed, small fronds emerging (3 tiers)
  [
    [6, 4],
    [5, 5], [6, 5], [7, 5],
    [4, 6], [5, 6], [6, 6], [7, 6], [8, 6],
    [5, 7], [6, 7], [7, 7],
    [6, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [6, 15],
  ],

  // 6: Mature — organic fern with alternating diagonal pinnae and tip frond going upper-right
  [
    // Tip frond: diagonal up-right from stalk top
    [6, 3], [7, 3], [8, 2], [9, 2],
    // Left pinna 1 (row 4, going up-left)
    [4, 4], [5, 4], [6, 4],
    // Right pinna 1 (row 5, going right)
    [6, 5], [7, 5], [8, 5], [9, 5],
    // Left pinna 2 (row 6, going left)
    [3, 6], [4, 6], [5, 6], [6, 6],
    // Right pinna 2 (row 7)
    [6, 7], [7, 7], [8, 7],
    // Left pinna 3 (row 8)
    [4, 8], [5, 8], [6, 8],
    // Right pinna 3 (row 9)
    [6, 9], [7, 9], [8, 9],
    // Left pinna 4 (row 10)
    [4, 10], [5, 10], [6, 10],
    // Small right pinna (row 11)
    [6, 11], [7, 11],
    // Stalk base (fixed spine)
    [6, 12], [6, 13], [6, 14], [6, 15],
  ],
];

// Frame start times (ms) based on biological proportions within 2000ms total:
//   spore germination (fast) → prothallus (1-3mo) → emergence → fiddlehead × 2 → mature × 2
const FRAME_STARTS = [0, 100, 300, 600, 900, 1300, 1650];
const ANIM_DURATION = 2000;

const FRAME_LABELS = ['Bud', 'Sprout', 'Hook', 'Unfurling', 'Crozier', 'Fronds', 'Mature'];

const SWAY_PERIOD = 3500; // ms per full sway cycle
const SWAY_MAX = 2;       // max pixel offset at top of fern
const BASE_ROW = 15;      // root — no sway here


export default function PixelLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<number>(0);
  const animRef = useRef<number>(0);
  // null = live animation; 0-6 = pinned to that frame
  const [pinnedFrame, setPinnedFrame] = useState<number | null>(null);
  const pinnedRef = useRef<number | null>(null);

  // Keep ref in sync so the draw loop sees latest value without re-subscribing
  useEffect(() => { pinnedRef.current = pinnedFrame; }, [pinnedFrame]);

  const cycleFrame = () => {
    setPinnedFrame(prev => {
      if (prev === null) return 0;
      if (prev >= FRAMES.length - 1) return null; // back to live
      return prev + 1;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    startRef.current = performance.now();

    function draw(now: number) {
      const color = 'rgba(0, 232, 123, 0.9)';
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = color;

      const pinned = pinnedRef.current;
      let pixels: Pixel[];
      let sway = 0;

      if (pinned !== null) {
        pixels = FRAMES[pinned];
      } else {
        const elapsed = now - startRef.current;
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="hero-logo-canvas"
        onClick={cycleFrame}
        title={pinnedFrame !== null ? `Frame ${pinnedFrame}: ${FRAME_LABELS[pinnedFrame]} — click to advance` : 'Click to step through frames'}
        style={{ cursor: 'pointer' }}
      />
      {pinnedFrame !== null && (
        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: '9px',
          color: 'var(--accent)',
          letterSpacing: '0.5px',
          lineHeight: 1,
          opacity: 0.8,
        }}>
          {pinnedFrame} / {FRAME_LABELS[pinnedFrame]}
        </span>
      )}
    </div>
  );
}
