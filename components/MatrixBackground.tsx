'use client';

import { useRef, useEffect, useState } from 'react';

const CELL = 14;
const CYCLE_MS = 90_000;
const SOIL_CHARS = ['@','#','&','%','+','=','-',':','.'];

const PT     = [0, 0.28, 0.58, 1.0];
const PNAMES = ['BUD', 'UNFURLING', 'MATURE'];

// Crozier curl pixels — a tight shepherd's crook at the stem tip
const CROZIER: { x: number; y: number; openT: number }[] = [
  { x: 0,  y: -1, openT: 1.00 },
  { x: 1,  y: -1, openT: 0.70 },
  { x: 2,  y: -1, openT: 0.50 },
  { x: 2,  y: -2, openT: 0.38 },
  { x: 1,  y: -3, openT: 0.26 },
  { x: 0,  y: -3, openT: 0.18 },
  { x: -1, y: -3, openT: 0.12 },
  { x: -1, y: -2, openT: 0.08 },
  { x: -1, y: -1, openT: 0.05 },
];

const STEM_MAX = 15;

// Frond pixels sorted by t — bottom pairs reveal first
const FRONDS: { x: number; y: number; t: number }[] = [
  { x:-1,y:-2,t:0.32 },{ x:1,y:-2,t:0.32 },
  { x:-2,y:-3,t:0.33 },{ x:2,y:-3,t:0.33 },
  { x:-1,y:-4,t:0.35 },{ x:1,y:-4,t:0.35 },
  { x:-2,y:-4,t:0.36 },{ x:2,y:-4,t:0.36 },
  { x:-3,y:-5,t:0.37 },{ x:3,y:-5,t:0.37 },
  { x:-2,y:-5,t:0.38 },{ x:2,y:-5,t:0.38 },
  { x:-1,y:-6,t:0.40 },{ x:1,y:-6,t:0.40 },
  { x:-2,y:-6,t:0.41 },{ x:2,y:-6,t:0.41 },
  { x:-3,y:-6,t:0.42 },{ x:3,y:-6,t:0.42 },
  { x:-3,y:-7,t:0.43 },{ x:3,y:-7,t:0.43 },
  { x:-4,y:-7,t:0.44 },{ x:4,y:-7,t:0.44 },
  { x:-4,y:-8,t:0.45 },{ x:4,y:-8,t:0.45 },
  { x:-1,y:-8,t:0.46 },{ x:1,y:-8,t:0.46 },
  { x:-2,y:-8,t:0.47 },{ x:2,y:-8,t:0.47 },
  { x:-3,y:-8,t:0.48 },{ x:3,y:-8,t:0.48 },
  { x:-3,y:-9,t:0.49 },{ x:3,y:-9,t:0.49 },
  { x:-4,y:-9,t:0.50 },{ x:4,y:-9,t:0.50 },
  { x:-5,y:-9,t:0.51 },{ x:5,y:-9,t:0.51 },
  { x:-4,y:-10,t:0.52},{ x:4,y:-10,t:0.52},
  { x:-5,y:-10,t:0.53},{ x:5,y:-10,t:0.53},
  { x:-6,y:-10,t:0.54},{ x:6,y:-10,t:0.54},
  { x:-1,y:-10,t:0.55},{ x:1,y:-10,t:0.55},
  { x:-2,y:-10,t:0.56},{ x:2,y:-10,t:0.56},
  { x:-3,y:-10,t:0.57},{ x:3,y:-10,t:0.57},
  { x:-3,y:-11,t:0.58},{ x:3,y:-11,t:0.58},
  { x:-4,y:-11,t:0.59},{ x:4,y:-11,t:0.59},
  { x:-5,y:-11,t:0.60},{ x:5,y:-11,t:0.60},
  { x:-4,y:-12,t:0.61},{ x:4,y:-12,t:0.61},
  { x:-5,y:-12,t:0.62},{ x:5,y:-12,t:0.62},
  { x:-6,y:-12,t:0.63},{ x:6,y:-12,t:0.63},
  { x:-1,y:-12,t:0.64},{ x:1,y:-12,t:0.64},
  { x:-2,y:-12,t:0.65},{ x:2,y:-12,t:0.65},
  { x:-3,y:-12,t:0.66},{ x:3,y:-12,t:0.66},
  { x:-3,y:-13,t:0.67},{ x:3,y:-13,t:0.67},
  { x:-4,y:-13,t:0.68},{ x:4,y:-13,t:0.68},
  { x:-4,y:-14,t:0.69},{ x:4,y:-14,t:0.69},
  { x:-5,y:-14,t:0.70},{ x:5,y:-14,t:0.70},
  { x:-1,y:-14,t:0.71},{ x:1,y:-14,t:0.71},
  { x:-2,y:-14,t:0.72},{ x:2,y:-14,t:0.72},
  { x:-1,y:-15,t:0.73},{ x:1,y:-15,t:0.73},
  { x:-2,y:-15,t:0.74},{ x:2,y:-15,t:0.74},
  { x:-3,y:-15,t:0.75},{ x:3,y:-15,t:0.75},
  { x:-1,y:-16,t:0.76},{ x:1,y:-16,t:0.76},
  // Extended mature crown
  { x:-2,y:-16,t:0.77},{ x:2,y:-16,t:0.77},
  { x: 0,y:-17,t:0.78},
  { x:-1,y:-17,t:0.79},{ x:1,y:-17,t:0.79},
  { x: 0,y:-18,t:0.80},
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

export default function MatrixBackground() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlay, setOverlay] = useState({ phase: 'BUD', pct: 0 });

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
      const cycleT  = elapsed / CYCLE_MS;
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

        const frondT = 0.32 + within * 0.48;
        for (const px of FRONDS) {
          if (px.t > frondT) continue;
          const depth = (-px.y) / 17;
          const sway  = Math.round(Math.sin(frame * 0.038 + depth * 1.4) * 0.15 * depth * 1.8);
          const alpha = 0.65 + 0.27 * Math.sin(frame * 0.025 + depth * 1.5);
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fillRect((rootX + px.x + sway) * CELL + 1, (curSurf + px.y) * CELL + 1, CELL - 2, CELL - 2);
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
        // Crown
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.fillRect(rootX * CELL + 1, (curSurf - STEM_MAX - 1) * CELL + 1, CELL - 2, CELL - 2);
        ctx.fillRect(rootX * CELL + 1, (curSurf - STEM_MAX - 2) * CELL + 1, CELL - 2, CELL - 2);

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

        // Pinnule detail pass — tiny sub-pixels between fronds for density
        for (const px of FRONDS) {
          if (Math.abs(px.x) < 2) continue; // skip centre column
          const depth = (-px.y) / 19;
          const sway  = Math.round(Math.sin(frame * 0.028 + depth * 1.6) * 0.32 * depth * 2.4);
          const detailAlpha = 0.18 + 0.12 * Math.abs(Math.sin(frame * 0.015 + depth * 2.1));
          ctx.fillStyle = `rgba(255,255,255,${detailAlpha})`;
          // Draw a half-cell detail pixel on the inner edge of each frond pixel
          const innerX = px.x > 0 ? px.x - 1 : px.x + 1;
          const sz = Math.floor((CELL - 2) * 0.5);
          ctx.fillRect(
            (rootX + innerX + sway) * CELL + Math.floor(CELL * 0.5),
            (curSurf + px.y) * CELL + Math.floor(CELL * 0.25),
            sz, sz
          );
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
      <div style={{
        position: 'absolute', bottom: 24, right: 24,
        fontFamily: "'Geist Mono', monospace", fontSize: 12,
        color: '#555', letterSpacing: '1px',
        textAlign: 'right',
        pointerEvents: 'none', lineHeight: 1.8,
      }}>
        Simulation: Fern //{' '}
        <span style={{ color: '#00ff66' }}>{overlay.phase.toLowerCase()}</span><br />
        Day <span style={{ color: '#888' }}>{overlay.pct}</span>
      </div>
    </div>
  );
}
