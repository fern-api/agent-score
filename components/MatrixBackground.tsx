'use client';

import { useRef, useEffect, useState } from 'react';
import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext';

const CELL_DESKTOP = 14;
const CELL_MOBILE  = 9;
const SOIL_CELL    = 7; // fixed density for soil lookup table
const CYCLE_MS  = 5_000;

const PT     = [0, 0.20, 0.50, 1.0];
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

// Frond pixels for the mature state.
// t = growT threshold (0→1 spanning unfurling+mature) at which each pixel appears.
// Ordered top-to-bottom, closer to stem first within each row.
const FRONDS: { x: number; y: number; t: number }[] = [
  // y=-15
  { x:-2, y:-15, t:0.05 }, { x: 2, y:-15, t:0.07 },
  // y=-14
  { x:-2, y:-14, t:0.09 }, { x: 2, y:-14, t:0.11 },
  // y=-13
  { x:-1, y:-13, t:0.13 }, { x: 1, y:-13, t:0.15 }, { x:-2, y:-13, t:0.17 }, { x: 2, y:-13, t:0.19 },
  // y=-12
  { x:-1, y:-12, t:0.22 }, { x: 1, y:-12, t:0.24 },
  // y=-11
  { x:-3, y:-11, t:0.28 }, { x: 3, y:-11, t:0.30 }, { x:-4, y:-11, t:0.32 }, { x: 4, y:-11, t:0.34 },
  // y=-10
  { x:-2, y:-10, t:0.37 }, { x: 2, y:-10, t:0.39 }, { x:-3, y:-10, t:0.41 }, { x: 3, y:-10, t:0.43 },
  // y=-9
  { x:-1, y: -9, t:0.46 }, { x: 1, y: -9, t:0.48 }, { x:-2, y: -9, t:0.50 }, { x: 2, y: -9, t:0.52 },
  // y=-8
  { x:-3, y: -8, t:0.56 }, { x: 3, y: -8, t:0.58 },
  // y=-7
  { x:-2, y: -7, t:0.61 }, { x: 2, y: -7, t:0.63 }, { x:-3, y: -7, t:0.65 }, { x: 3, y: -7, t:0.67 },
  // y=-6
  { x:-1, y: -6, t:0.70 }, { x: 1, y: -6, t:0.72 }, { x:-2, y: -6, t:0.74 }, { x: 2, y: -6, t:0.76 },
  // y=-4
  { x:-2, y: -4, t:0.80 }, { x: 2, y: -4, t:0.82 }, { x:-3, y: -4, t:0.84 }, { x: 3, y: -4, t:0.86 },
  // y=-3
  { x:-1, y: -3, t:0.88 }, { x: 1, y: -3, t:0.90 }, { x:-2, y: -3, t:0.92 }, { x: 2, y: -3, t:0.94 },
];

// ── Pretext-measured soil palette ────────────────────────────────────────────
// Characters, weights and styles to sample. Brightness is measured by rendering
// each glyph to a 28×28 canvas and summing the alpha channel (exact technique
// from chenglou/pretext variable-typographic-ascii demo).
const PROP_FAMILY = 'Georgia, Palatino, "Times New Roman", serif';
// Soil chars only — no letters or digits, purely symbolic/punctuation
// Ordered roughly dense→sparse so the brightness range is well-covered
const CHARSET = '-*';
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
      const font = `${style === 'italic' ? 'italic ' : ''}${weight} ${SOIL_CELL}px ${PROP_FAMILY}`;
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
                  + Math.abs(e.width - SOIL_CELL) / SOIL_CELL;
      if (score < bestScore) { bestScore = score; best = e; }
    }
    return best;
  }

  const lookup: SoilEntry[] = [];
  for (let b = 0; b < 256; b++) {
    const brightness = b / 255;
    if (brightness < 0.03) {
      lookup.push({ char: '-', font: `300 ${SOIL_CELL}px ${PROP_FAMILY}` });
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

export default function MatrixBackground({ color = '#ffffff' }: { color?: string }) {
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

    const cr = parseInt(color.slice(1, 3), 16);
    const cg = parseInt(color.slice(3, 5), 16);
    const cb = parseInt(color.slice(5, 7), 16);

    // Build brightness→char lookup once (measures real glyph brightness via canvas)
    if (!soilLookup) soilLookup = buildSoilLookup();

    let CELL = window.innerWidth < 640 ? CELL_MOBILE : CELL_DESKTOP;
    let cols = 0, rows = 0, soilCols = 0, soilRows = 0, logW = 0, logH = 0, frame = 0, animId = 0;
    const cycleStart = Date.now();

    function resize() {
      const { width, height } = container.getBoundingClientRect();
      CELL = width < 640 ? CELL_MOBILE : CELL_DESKTOP;
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
      soilCols = Math.ceil(width  / SOIL_CELL);
      soilRows = Math.ceil(height / SOIL_CELL);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      const elapsed = Math.min(Date.now() - cycleStart, CYCLE_MS);
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

      const SOIL_Y   = 0.78;
      const baseSoil = Math.floor(rows * SOIL_Y);
      const rootX    = Math.floor(cols / 2);
      const curSurf  = Math.floor(baseSoil + (Math.sin(rootX * 0.12 + frame * 0.014) * 1.5 + Math.cos(rootX * 0.06) * 1.5));

      // ── Soil (pretext brightness-mapped chars, 2× density) ───
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const SC = CELL / SOIL_CELL; // = 2
      for (let x = 0; x < soilCols; x++) {
        const off  = Math.sin(x / SC * 0.12 + frame * 0.014) * 1.5 * SC + Math.cos(x / SC * 0.06) * 1.5 * SC;
        const surf = Math.floor(rows * SOIL_Y * SC + off);
        for (let y = surf; y < soilRows; y++) {
          const depth = y - surf;
          const flow  = noise(x / SC, y / SC, frame * 0.022);
          const alpha = depth < 2 * SC ? 0.72 : depth < 7 * SC ? 0.48 : 0.22;
          const targetB = Math.max(0.03, Math.min(1, alpha + flow * 0.08));
          const entry = soilLookup![Math.round(targetB * 255)]!;
          ctx.font = entry.font;
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
          ctx.fillText(entry.char, x * SOIL_CELL, y * SOIL_CELL);
        }
      }

      // ── Fern (pixel squares, above soil) ─────────────────────
      ctx.font = `${CELL}px "VT323",monospace`;

      // ─── BUD ─────────────────────────────────────────────────
      if (phaseIdx === 0) {
        const stemCells = Math.max(1, Math.ceil(within * STEM_MAX * 0.55));
        ctx.fillStyle = color;
        for (let i = 1; i <= stemCells; i++) {
          ctx.fillRect(rootX * CELL + 1, (curSurf - i) * CELL + 1, CELL - 2, CELL - 2);
        }
        const tipY = curSurf - stemCells;
        for (const c of CROZIER) {
          ctx.fillRect((rootX + c.x) * CELL + 1, (tipY + c.y) * CELL + 1, CELL - 2, CELL - 2);
        }
      }

      // ─── UNFURLING ───────────────────────────────────────────
      else if (phaseIdx === 1) {
        const stemCells = Math.min(STEM_MAX, Math.ceil(STEM_MAX * 0.55 + within * STEM_MAX * 0.45));
        ctx.fillStyle = color;
        for (let i = 1; i <= stemCells; i++) {
          ctx.fillRect(rootX * CELL + 1, (curSurf - i) * CELL + 1, CELL - 2, CELL - 2);
        }
        ctx.fillRect(rootX * CELL + 1, (curSurf - stemCells - 1) * CELL + 1, CELL - 2, CELL - 2);
        ctx.fillRect(rootX * CELL + 1, (curSurf - stemCells - 2) * CELL + 1, CELL - 2, CELL - 2);
        // Crozier uncoiling
        const tipY = curSurf - stemCells;
        for (const c of CROZIER) {
          if (within < c.openT) {
            ctx.fillRect((rootX + c.x) * CELL + 1, (tipY + c.y) * CELL + 1, CELL - 2, CELL - 2);
          }
        }
        // Fronds growing outward from stem — growT 0→0.5 during unfurling
        const growT = within * 0.5;
        for (const px of FRONDS) {
          if (growT >= px.t) {
            ctx.fillRect((rootX + px.x) * CELL + 1, (curSurf + px.y) * CELL + 1, CELL - 2, CELL - 2);
          }
        }
      }

      // ─── MATURE ───────────────────────────────────────────────
      else {
        ctx.fillStyle = color;
        for (let i = 1; i <= STEM_MAX; i++) {
          ctx.fillRect(rootX * CELL + 1, (curSurf - i) * CELL + 1, CELL - 2, CELL - 2);
        }
        // Fronds finish growing — growT 0.5→1.0 during mature
        const growT = 0.5 + within * 0.5;
        // Wave band: ~3 rows travel up and down the stem
        const wavePos = (frame * 0.05) % 15 + 1;
        for (const px of FRONDS) {
          if (growT >= px.t) {
            const depth = (-px.y) / 19;
            const distFromWave = Math.abs((-px.y) - wavePos);
            const envelope = Math.max(0, 1 - distFromWave / 1.5);
            const sway  = Math.round(Math.sin(frame * 0.028 + depth * 1.6) * envelope * (0.6 + depth * 0.5));
            ctx.fillRect((rootX + px.x + sway) * CELL + 1, (curSurf + px.y) * CELL + 1, CELL - 2, CELL - 2);
            // Fill gap only for stem-adjacent pixels so branches stay connected
            if (Math.abs(px.x) === 1 && sway !== 0) {
              ctx.fillRect((rootX + px.x) * CELL + 1, (curSurf + px.y) * CELL + 1, CELL - 2, CELL - 2);
            }
          }
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
  }, [color]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      <div
        className="matrix-overlay"
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
        <span className="matrix-sim-label">Simulation: </span>Fern //{' '}
        <span style={{ color: '#00ff66' }}>{overlay.phase.toLowerCase()}</span>
        {pinnedPhase !== null && (
          <span style={{ color: '#00ff66', marginLeft: 4 }}>●</span>
        )}
        <br />
        Day <span style={{ color: '#888' }}>{overlay.pct}</span>
      </div>
    </div>
  );
}
