'use client';

import { useRef, useEffect, useState } from 'react';
import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext';

const CELL = 14;
const CYCLE_MS = 90_000;

const PT     = [0, 0.28, 0.58, 1.0];
const PNAMES = ['BUD', 'UNFURLING', 'MATURE'];

// Crozier — square spiral fiddlehead: 5×5 outer ring + 3×3 inner ring
// openT: pixel drawn while within < openT (higher = coiled longer = inner core)
const CROZIER: { x: number; y: number; openT: number }[] = [
  // === Outer 5×5 ring (y: -5 to -1, x: -2 to +2) ===
  { x:-2, y:-5, openT:0.12 }, { x:-1, y:-5, openT:0.14 }, { x:0, y:-5, openT:0.16 },
  { x: 1, y:-5, openT:0.18 }, { x: 2, y:-5, openT:0.20 },
  { x:2, y:-4, openT:0.24 }, { x:2, y:-3, openT:0.28 },
  { x:2, y:-2, openT:0.32 }, { x:2, y:-1, openT:0.36 },
  { x:1, y:-1, openT:0.40 },
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

// Organic alternating pinnae along the stalk
const FRONDS: { x: number; y: number; t: number }[] = [
  { x: 1, y:-12, t:0.32 }, { x: 2, y:-13, t:0.34 }, { x: 3, y:-13, t:0.36 },
  { x:-1, y:-11, t:0.38 }, { x:-2, y:-11, t:0.40 },
  { x: 1, y:-10, t:0.42 }, { x: 2, y:-10, t:0.44 }, { x: 3, y:-10, t:0.46 },
  { x:-1, y: -9, t:0.48 }, { x:-2, y: -9, t:0.50 }, { x:-3, y: -9, t:0.52 },
  { x: 1, y: -8, t:0.54 }, { x: 2, y: -8, t:0.56 },
  { x:-1, y: -7, t:0.58 }, { x:-2, y: -7, t:0.60 },
  { x: 1, y: -6, t:0.62 }, { x: 2, y: -6, t:0.64 },
  { x:-1, y: -5, t:0.66 }, { x:-2, y: -5, t:0.68 },
  { x: 1, y: -4, t:0.70 },
];

// ── Pretext-measured soil palette ────────────────────────────────────────────
// Characters, weights and styles to sample. Brightness is measured by rendering
// each glyph to a 28×28 canvas and summing the alpha channel (exact technique
// from chenglou/pretext variable-typographic-ascii demo).
const PROP_FAMILY = 'Georgia, Palatino, "Times New Roman", serif';
// Soil chars only — no letters or digits, purely symbolic/punctuation
// Ordered roughly dense→sparse so the brightness range is well-covered
const CHARSET = '@#%&$*+=~^-_:;,.\'"·•';
const SOIL_WEIGHTS = [300, 500, 800] as const;
const SOIL_STYLES  = ['normal', 'italic'] as const;

type SoilEntry = { char: string; font: string };
// Cached after first build; persists for the lifetime of the page
let soilLookup: SoilEntry[] | null = null;

function buildSoilLookup(): SoilEntry[] {
  const size = 28;
  const bCanvas = document.createElement('canvas');
  bCanvas.width = size; bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d', { willReadFrequently: true })!;

  function estimateBrightness(ch: string, font: string): number {
    bCtx.clearRect(0, 0, size, size);
    bCtx.font = font; bCtx.fillStyle = '#fff'; bCtx.textBaseline = 'middle';
    bCtx.fillText(ch, 1, size / 2);
    const data = bCtx.getImageData(0, 0, size, size).data;
    let sum = 0;
    for (let i = 3; i < data.length; i += 4) sum += data[i]!;
    return sum / (255 * size * size);
  }

  type E = { char: string; font: string; width: number; brightness: number };
  const palette: E[] = [];
  for (const style of SOIL_STYLES) {
    for (const weight of SOIL_WEIGHTS) {
      const font = `${style === 'italic' ? 'italic ' : ''}${weight} ${CELL}px ${PROP_FAMILY}`;
      for (const ch of CHARSET) {
        const prepared = prepareWithSegments(ch, font);
        let width = 0;
        walkLineRanges(prepared, Infinity, line => { width = line.width; });
        if (width <= 0) continue;
        palette.push({ char: ch, font, width, brightness: estimateBrightness(ch, font) });
      }
    }
  }

  const maxB = Math.max(...palette.map(e => e.brightness));
  if (maxB > 0) for (const e of palette) e.brightness /= maxB;
  palette.sort((a, b) => a.brightness - b.brightness);

  function findBest(targetBrightness: number): E {
    let lo = 0, hi = palette.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (palette[mid]!.brightness < targetBrightness) lo = mid + 1; else hi = mid;
    }
    let best = palette[lo]!, bestScore = Infinity;
    for (let i = Math.max(0, lo - 15); i < Math.min(palette.length, lo + 15); i++) {
      const e = palette[i]!;
      const score = Math.abs(e.brightness - targetBrightness) * 2.5
                  + Math.abs(e.width - CELL) / CELL;
      if (score < bestScore) { bestScore = score; best = e; }
    }
    return best;
  }

  const lookup: SoilEntry[] = [];
  for (let b = 0; b < 256; b++) {
    const brightness = b / 255;
    if (brightness < 0.03) {
      lookup.push({ char: '.', font: `300 ${CELL}px ${PROP_FAMILY}` });
    } else {
      const match = findBest(brightness);
      lookup.push({ char: match.char, font: match.font });
    }
  }
  return lookup;
}

function noise(x: number, y: number, t: number) {
  return Math.sin(x*0.1+t) + Math.cos(y*0.1-t) + Math.sin((x+y)*0.05+t*0.5);
}


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

    // Build brightness→char lookup once (measures real glyph brightness via canvas)
    if (!soilLookup) soilLookup = buildSoilLookup();

    let cols = 0, rows = 0, logW = 0, logH = 0, frame = 0, animId = 0;
    const cycleStart = Date.now();

    function resize() {
      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      logW = width; logH = height;
      canvas.width  = Math.round(width  * dpr);
      canvas.height = Math.round(height * dpr);
      // Scale all drawing to physical pixels — keeps text and rects sharp on retina
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.textBaseline = 'top';
      cols = Math.ceil(width  / CELL);
      rows = Math.ceil(height / CELL);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      const elapsed = (Date.now() - cycleStart) % CYCLE_MS;
      const pinned  = pinnedPhaseRef.current;
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
      ctx.fillRect(0, 0, logW, logH);

      const baseSoil = Math.floor(rows * 0.60);
      const rootX    = Math.floor(cols / 2);
      const curSurf  = Math.floor(baseSoil + (Math.sin(rootX * 0.12 + frame * 0.014) * 1.5 + Math.cos(rootX * 0.06) * 1.5));

      // ── Soil (pretext brightness-mapped Georgia chars) ────────
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (let x = 0; x < cols; x++) {
        const off  = Math.sin(x * 0.12 + frame * 0.014) * 1.5 + Math.cos(x * 0.06) * 1.5;
        const surf = Math.floor(baseSoil + off);
        for (let y = surf; y < rows; y++) {
          const depth = y - surf;
          const flow  = noise(x, y, frame * 0.022);
          // depth drives base brightness; noise adds organic variation
          const alpha = depth < 2 ? 0.72 : depth < 7 ? 0.48 : 0.22;
          const targetB = Math.max(0.03, Math.min(1, alpha + flow * 0.08));
          const entry = soilLookup![Math.round(targetB * 255)]!;
          ctx.font = entry.font;
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fillText(entry.char, x * CELL, y * CELL);
        }
      }

      // ── Fern (pixel squares, above soil) ─────────────────────
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
        for (let i = 1; i <= STEM_MAX; i++) {
          const baseAlpha = 0.92;
          ctx.fillStyle = `rgba(255,255,255,${baseAlpha})`;
          ctx.fillRect(rootX * CELL + 1, (curSurf - i) * CELL + 1, CELL - 2, CELL - 2);
          if (i <= 4) {
            const w = (4 - i + 1) / 4;
            ctx.fillStyle = `rgba(255,255,255,${baseAlpha * w * 0.5})`;
            ctx.fillRect((rootX - 1) * CELL + 2, (curSurf - i) * CELL + 2, CELL - 3, CELL - 3);
            ctx.fillRect((rootX + 1) * CELL + 2, (curSurf - i) * CELL + 2, CELL - 3, CELL - 3);
          }
        }
        for (const px of FRONDS) {
          const depth = (-px.y) / 19;
          const dist  = Math.abs(px.x) / 7;
          const sway  = Math.round(Math.sin(frame * 0.028 + depth * 1.6) * 0.32 * depth * 2.4);
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
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
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
