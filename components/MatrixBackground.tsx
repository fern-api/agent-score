'use client';

import { useRef, useEffect, useState } from 'react';

const CELL = 14;
const CYCLE_MS = 90_000;
const SOIL_CHARS = ['@','#','&','%','+','=','-',':','.'];

const PT     = [0, 0.28, 0.58, 1.0];
const PNAMES = ['BUD', 'UNFURLING', 'MATURE'];

// Crozier — square spiral fiddlehead: 5×5 outer ring + 3×3 inner ring
// openT: pixel is drawn while within < openT, so higher = stays coiled longer (inner core)
// Outer ring uncoils first (low openT), inner core last (high openT)
const CROZIER: { x: number; y: number; openT: number }[] = [
  // === Outer 5×5 ring (y: -5 to -1, x: -2 to +2) ===
  // Top row
  { x:-2, y:-5, openT:0.12 }, { x:-1, y:-5, openT:0.14 }, { x:0, y:-5, openT:0.16 },
  { x: 1, y:-5, openT:0.18 }, { x: 2, y:-5, openT:0.20 },
  // Right column
  { x:2, y:-4, openT:0.24 }, { x:2, y:-3, openT:0.28 },
  { x:2, y:-2, openT:0.32 }, { x:2, y:-1, openT:0.36 },
  // Bottom-right (near stem)
  { x:1, y:-1, openT:0.40 },
  // Left column
  { x:-2, y:-1, openT:0.44 }, { x:-2, y:-2, openT:0.48 },
  { x:-2, y:-3, openT:0.52 }, { x:-2, y:-4, openT:0.56 },

  // === Inner 3×3 ring (y: -4 to -2, x: -1 to +1) ===
  { x:-1, y:-4, openT:0.62 }, { x:0, y:-4, openT:0.66 }, { x:1, y:-4, openT:0.70 },
  { x: 1, y:-3, openT:0.74 }, { x:1, y:-2, openT:0.78 },
  { x:-1, y:-2, openT:0.82 }, { x:-1, y:-3, openT:0.86 },

  // === Core (last to uncoil) ===
  { x:0, y:-3, openT:0.92 },
  { x:0, y:-2, openT:0.96 },
  { x:0, y:-1, openT:1.00 },
];

const STEM_MAX = 15;

// Organic fern pinnae — alternating diagonal fronds along the stalk
// x = offset from stem (rootX), y = rows above soil (negative)
// t values used for progressive reveal order (lower = appears first in MATURE)
const FRONDS: { x: number; y: number; t: number }[] = [
  // Tip frond — diagonal upper-right from stalk top
  { x: 1, y:-12, t:0.32 }, { x: 2, y:-13, t:0.34 }, { x: 3, y:-13, t:0.36 },
  // Left pinna 1 (y=-11)
  { x:-1, y:-11, t:0.38 }, { x:-2, y:-11, t:0.40 },
  // Right pinna 1 (y=-10)
  { x: 1, y:-10, t:0.42 }, { x: 2, y:-10, t:0.44 }, { x: 3, y:-10, t:0.46 },
  // Left pinna 2 (y=-9)
  { x:-1, y: -9, t:0.48 }, { x:-2, y: -9, t:0.50 }, { x:-3, y: -9, t:0.52 },
  // Right pinna 2 (y=-8)
  { x: 1, y: -8, t:0.54 }, { x: 2, y: -8, t:0.56 },
  // Left pinna 3 (y=-7)
  { x:-1, y: -7, t:0.58 }, { x:-2, y: -7, t:0.60 },
  // Right pinna 3 (y=-6)
  { x: 1, y: -6, t:0.62 }, { x: 2, y: -6, t:0.64 },
  // Left pinna 4 (y=-5)
  { x:-1, y: -5, t:0.66 }, { x:-2, y: -5, t:0.68 },
  // Small right pinna (y=-4)
  { x: 1, y: -4, t:0.70 },
];

function noise(x: number, y: number, t: number) {
  return Math.sin(x*0.1+t) + Math.cos(y*0.1-t) + Math.sin((x+y)*0.05+t*0.5);
}

// Unicode root system — each entry is a grid cell offset from stem base
// t = cycleT threshold to appear; fades in over ~0.025 cycle time
const ROOTS: { x: number; y: number; char: string; t: number }[] = [
  // ── Stage 1: taproot descends ────────────────────
  { x: 0, y:1, char:'│', t:0.06 },
  { x: 0, y:2, char:'│', t:0.09 },
  { x: 0, y:3, char:'│', t:0.12 },
  { x: 0, y:4, char:'│', t:0.15 },
  { x: 0, y:5, char:'│', t:0.18 },
  { x: 0, y:6, char:'│', t:0.20 },
  { x: 0, y:7, char:'╵', t:0.23 },

  // ── Stage 2: outer laterals ──────────────────────
  { x:-1, y:2, char:'─', t:0.27 }, { x: 1, y:2, char:'─', t:0.27 },
  { x:-2, y:2, char:'─', t:0.29 }, { x: 2, y:2, char:'─', t:0.29 },
  { x:-3, y:2, char:'╮', t:0.31 }, { x: 3, y:2, char:'╭', t:0.31 },
  { x:-4, y:3, char:'╲', t:0.33 }, { x: 4, y:3, char:'╱', t:0.33 },
  { x:-5, y:4, char:'╲', t:0.35 }, { x: 5, y:4, char:'╱', t:0.35 },
  { x:-6, y:5, char:'╴', t:0.37 }, { x: 6, y:5, char:'╶', t:0.37 },

  // ── Stage 2: inner laterals ──────────────────────
  { x:-1, y:4, char:'─', t:0.30 }, { x: 1, y:4, char:'─', t:0.30 },
  { x:-2, y:4, char:'╮', t:0.32 }, { x: 2, y:4, char:'╭', t:0.32 },
  { x:-3, y:5, char:'╲', t:0.34 }, { x: 3, y:5, char:'╱', t:0.34 },
  { x:-4, y:6, char:'╴', t:0.36 }, { x: 4, y:6, char:'╶', t:0.36 },

  // ── Stage 3: secondaries off outer laterals ──────
  { x:-5, y:3, char:'┤', t:0.52 }, { x: 5, y:3, char:'├', t:0.52 },
  { x:-6, y:3, char:'─', t:0.54 }, { x: 6, y:3, char:'─', t:0.54 },
  { x:-6, y:4, char:'╲', t:0.56 }, { x: 6, y:4, char:'╱', t:0.56 },
  { x:-7, y:5, char:'╴', t:0.58 }, { x: 7, y:5, char:'╶', t:0.58 },

  // ── Stage 3: secondaries off inner laterals ──────
  { x:-3, y:4, char:'┤', t:0.53 }, { x: 3, y:4, char:'├', t:0.53 },
  { x:-4, y:4, char:'─', t:0.55 }, { x: 4, y:4, char:'─', t:0.55 },
  { x:-5, y:5, char:'╲', t:0.57 }, { x: 5, y:5, char:'╱', t:0.57 },
  { x:-6, y:6, char:'╴', t:0.59 }, { x: 6, y:6, char:'╶', t:0.59 },

  // ── Stage 3: hair roots ──────────────────────────
  { x:-4, y:7, char:'╵', t:0.62 }, { x: 4, y:7, char:'╵', t:0.62 },
  { x:-2, y:8, char:'╵', t:0.63 }, { x: 2, y:8, char:'╵', t:0.63 },
  { x: 0, y:8, char:'╵', t:0.63 },
  { x:-6, y:7, char:'·', t:0.64 }, { x: 6, y:7, char:'·', t:0.64 },
  { x:-8, y:6, char:'·', t:0.65 }, { x: 8, y:6, char:'·', t:0.65 },
  { x:-7, y:7, char:'·', t:0.66 }, { x: 7, y:7, char:'·', t:0.66 },
];

function drawRoots(ctx: CanvasRenderingContext2D, rootX: number, surf: number, cycleT: number) {
  ctx.font = `${CELL}px "VT323", monospace`;
  ctx.textBaseline = 'top';

  for (const r of ROOTS) {
    if (cycleT < r.t) continue;
    const fadeIn  = Math.min((cycleT - r.t) / 0.025, 1);
    const depth   = r.y / 9;
    const dist    = Math.abs(r.x) / 9;
    const base    = 0.78 * (1 - depth * 0.22) * (1 - dist * 0.35);
    const alpha   = fadeIn * Math.max(0.06, base);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillText(r.char, (rootX + r.x) * CELL, (surf + r.y) * CELL);
  }
}

// null = live animation; 0/1/2 = pinned to that phase index at 85% through it
type PinnedPhase = number | null;

export default function MatrixBackground() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlay, setOverlay] = useState({ phase: 'BUD', pct: 0 });
  const [pinnedPhase, setPinnedPhase] = useState<PinnedPhase>(null);
  const pinnedPhaseRef = useRef<PinnedPhase>(null);
  useEffect(() => { pinnedPhaseRef.current = pinnedPhase; }, [pinnedPhase]);

  const cyclePhase = () => {
    setPinnedPhase(prev => prev === null ? 0 : prev >= PNAMES.length - 1 ? null : prev + 1);
  };

  useEffect(() => {
    const canvas    = canvasRef.current!;
    const container = containerRef.current!;
    const ctx       = canvas.getContext('2d', { alpha: false })!;
    ctx.imageSmoothingEnabled = false;

    let cols = 0, rows = 0, frame = 0, animId = 0;
    const cycleStart = Date.now();

    function resize() {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width; canvas.height = height;
      cols = Math.ceil(width / CELL); rows = Math.ceil(height / CELL);
      ctx.font = `${CELL}px "VT323",monospace`;
      ctx.textBaseline = 'top';
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      const elapsed = (Date.now() - cycleStart) % CYCLE_MS;
      const pinned  = pinnedPhaseRef.current;
      // When pinned: jump to 85% through the chosen phase so it looks fully developed
      const cycleT  = pinned !== null
        ? PT[pinned] + (PT[pinned + 1] - PT[pinned]) * 0.85
        : elapsed / CYCLE_MS;
      const pct     = Math.round(cycleT * 100);

      let phaseIdx = PNAMES.length - 1, within = 1;
      for (let i = 0; i < PNAMES.length; i++) {
        if (cycleT < PT[i + 1]) {
          phaseIdx = i;
          within = (cycleT - PT[i]) / (PT[i + 1] - PT[i]);
          break;
        }
      }

      if (frame % 20 === 0) setOverlay({ phase: PNAMES[phaseIdx], pct });

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${CELL}px "VT323",monospace`;

      const baseSoil = Math.floor(rows * 0.60);
      const rootX    = Math.floor(cols / 2);

      // Soil
      for (let x = 0; x < cols; x++) {
        const off  = Math.sin(x * 0.12 + frame * 0.014) * 1.5 + Math.cos(x * 0.06) * 1.5;
        const surf = Math.floor(baseSoil + off);
        for (let y = surf; y < rows; y++) {
          const depth = y - surf;
          const flow  = noise(x, y, frame * 0.022);
          let ci = Math.floor(depth * 0.4 + flow * 2.5 + 2);
          ci = Math.max(0, Math.min(ci, SOIL_CHARS.length - 2));
          ctx.fillStyle = depth < 2 ? 'rgba(38,38,38,0.9)' : depth < 7 ? 'rgba(22,22,22,0.9)' : 'rgba(12,12,12,0.9)';
          ctx.fillText(SOIL_CHARS[ci], x * CELL, y * CELL);
        }
      }

      const curSurf = Math.floor(baseSoil + (Math.sin(rootX * 0.12 + frame * 0.014) * 1.5 + Math.cos(rootX * 0.06) * 1.5));

      ctx.font = `${CELL}px "VT323",monospace`;

      // ─── BUD ─────────────────────────────────────────────────
      if (phaseIdx === 0) {
        const stemCells = Math.max(1, Math.ceil(within * STEM_MAX * 0.55));
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        for (let i = 1; i <= stemCells; i++) {
          ctx.fillRect(rootX * CELL + 1, (curSurf - i) * CELL + 1, CELL - 2, CELL - 2);
        }
        const tipY = curSurf - stemCells;
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        for (const c of CROZIER) {
          ctx.fillRect((rootX + c.x) * CELL + 1, (tipY + c.y) * CELL + 1, CELL - 2, CELL - 2);
        }
      }

      // ─── UNFURLING ───────────────────────────────────────────
      else if (phaseIdx === 1) {
        const stemCells = Math.min(STEM_MAX, Math.ceil(STEM_MAX * 0.55 + within * STEM_MAX * 0.45));

        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        for (let i = 1; i <= stemCells; i++) {
          ctx.fillRect(rootX * CELL + 1, (curSurf - i) * CELL + 1, CELL - 2, CELL - 2);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(rootX * CELL + 1, (curSurf - stemCells - 1) * CELL + 1, CELL - 2, CELL - 2);
        ctx.fillRect(rootX * CELL + 1, (curSurf - stemCells - 2) * CELL + 1, CELL - 2, CELL - 2);

        const tipY = curSurf - stemCells;
        for (const c of CROZIER) {
          if (within < c.openT) {
            const alpha = 0.9 - (within / c.openT) * 0.3;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.fillRect((rootX + c.x) * CELL + 1, (tipY + c.y) * CELL + 1, CELL - 2, CELL - 2);
          }
        }

      }

      // ─── MATURE ───────────────────────────────────────────────
      else {
        // Stem — slightly wider at the base for a mature, robust look
        for (let i = 1; i <= STEM_MAX; i++) {
          const baseAlpha = 0.92;
          ctx.fillStyle = `rgba(255,255,255,${baseAlpha})`;
          ctx.fillRect(rootX * CELL + 1, (curSurf - i) * CELL + 1, CELL - 2, CELL - 2);
          // Widen stem at lower 4 cells
          if (i <= 4) {
            const w = (4 - i + 1) / 4; // 1.0 at base, 0.25 at cell 4
            ctx.fillStyle = `rgba(255,255,255,${baseAlpha * w * 0.5})`;
            ctx.fillRect((rootX - 1) * CELL + 2, (curSurf - i) * CELL + 2, CELL - 3, CELL - 3);
            ctx.fillRect((rootX + 1) * CELL + 2, (curSurf - i) * CELL + 2, CELL - 3, CELL - 3);
          }
        }
        // Fronds — full sway, density gradient: brighter near stem axis, dimmer at tips
        for (const px of FRONDS) {
          const depth = (-px.y) / 19;
          const dist  = Math.abs(px.x) / 7;
          const sway  = Math.round(Math.sin(frame * 0.028 + depth * 1.6) * 0.32 * depth * 2.4);
          // Richer alpha at centre, natural dimming at outer tips
          const baseA = 0.78 - dist * 0.28;
          const alpha = Math.max(0.18, baseA + 0.22 * Math.abs(Math.sin(frame * 0.018 + depth * 1.3)));
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fillRect((rootX + px.x + sway) * CELL + 1, (curSurf + px.y) * CELL + 1, CELL - 2, CELL - 2);
        }

      }

      frame++;
      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }}
      />
      <div
        onClick={cyclePhase}
        title={pinnedPhase !== null ? `Phase ${pinnedPhase + 1}/${PNAMES.length} — click to advance` : 'Click to pin a phase'}
        style={{
          position: 'absolute', bottom: 24, right: 24,
          fontFamily: "'Geist Mono', monospace", fontSize: 12,
          color: '#555', letterSpacing: '1px',
          textAlign: 'right',
          cursor: 'pointer', lineHeight: 1.8,
          userSelect: 'none',
        }}
      >
        Simulation: Fern //{' '}
        <span style={{ color: '#00ff66' }}>{overlay.phase.toLowerCase()}</span>
        {pinnedPhase !== null && (
          <span style={{ color: '#333', marginLeft: 4 }}>●</span>
        )}
        <br />
        Day <span style={{ color: '#888' }}>{overlay.pct}</span>
      </div>
    </div>
  );
}
