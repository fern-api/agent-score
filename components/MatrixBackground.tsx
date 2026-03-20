'use client';

import { useRef, useEffect, useCallback } from 'react';

const CHARS = '01{}/*><=-+_.:;|~^%#@&[]()'.split('');
const FONT_SIZE = 11;
const CELL_SIZE = 13;
const CORNER_SIZE = 32;
const CORNER_LINE_WIDTH = 2;
const EDGE_PAD = 16;
const WAVE_SPEED = 200;
const WAVE_WIDTH = 120;
const WAVE_COUNT = 3;
const MOVE_THRESHOLD = 30;
const BASE_OPACITY = 0.08;
const PEAK_OPACITY = 0.4;
const BASE_OPACITY_LIGHT = 0.18;
const PEAK_OPACITY_LIGHT = 0.55;
const LERP_SPEED = 0.08;

function getLightMode(): boolean {
  if (typeof window === 'undefined') return false;
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light') return true;
  if (attr === 'dark') return false;
  return window.matchMedia('(prefers-color-scheme: light)').matches;
}

interface Cell {
  char: string;
  baseChar: string;
  smoothOpacity: number;
}

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    grid: [] as Cell[][],
    cols: 0,
    rows: 0,
    canvasW: 0,
    canvasH: 0,
    innerLeft: 0,
    innerRight: 0,
    innerTop: 0,
    innerBottom: 0,
    mouseX: -9999,
    mouseY: -9999,
    mouseActive: false,
    lastMouseX: -9999,
    lastMouseY: -9999,
    waves: [] as { x: number; y: number; startTime: number }[],
    maxWaveRadius: WAVE_WIDTH * WAVE_COUNT,
    animId: 0,
    mobileActive: false,
    mobileActiveTimer: undefined as ReturnType<typeof setTimeout> | undefined,
  });

  const initGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const dpr = window.devicePixelRatio || 1;

    s.canvasW = w;
    s.canvasH = h;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    s.innerLeft = EDGE_PAD;
    s.innerRight = w - EDGE_PAD;
    s.innerTop = EDGE_PAD;
    s.innerBottom = h - EDGE_PAD;

    const innerW = s.innerRight - s.innerLeft;
    const innerH = s.innerBottom - s.innerTop;
    s.cols = Math.ceil(innerW / CELL_SIZE);
    s.rows = Math.ceil(innerH / CELL_SIZE);

    s.grid = [];
    for (let r = 0; r < s.rows; r++) {
      s.grid[r] = [];
      for (let c = 0; c < s.cols; c++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        s.grid[r][c] = { char: ch, baseChar: ch, smoothOpacity: BASE_OPACITY };
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const isMobile = () => window.innerWidth < 768;

    initGrid();

    // Returns the edge-band mask factor for a cell at (x, y) on mobile.
    // A cell near ANY edge (left, right, top, bottom) returns 1.
    // Only cells far from all edges (true center) return 0.
    function getMobileEdgeMask(x: number, y: number): number {
      if (!isMobile() || s.mobileActive) return 1;
      const bandX = s.canvasW * 0.25;
      const bandY = s.canvasH * 0.25;
      // Normalized distance from nearest horizontal/vertical edge (0=at edge, 1=at center)
      const hFactor = Math.min(Math.min(x, s.canvasW - x) / bandX, 1);
      const vFactor = Math.min(Math.min(y, s.canvasH - y) / bandY, 1);
      const nearestEdge = Math.min(hFactor, vFactor);
      const fadeStart = 0.6;
      if (nearestEdge <= fadeStart) return 1;
      if (nearestEdge >= 1) return 0;
      return 1 - (nearestEdge - fadeStart) / (1 - fadeStart);
    }

    // Spawn an auto-pulse wave; on mobile keeps wave near edges unless active.
    function spawnAutoPulse() {
      if (s.canvasW <= 0 || s.canvasH <= 0) return;
      let x: number;
      let y: number;
      if (isMobile() && !s.mobileActive) {
        // Pick one of four edges at random
        const edge = Math.floor(Math.random() * 4);
        const bandX = s.canvasW * 0.22;
        const bandY = s.canvasH * 0.22;
        if (edge === 0) { // left
          x = s.innerLeft + Math.random() * bandX;
          y = s.innerTop + Math.random() * (s.innerBottom - s.innerTop);
        } else if (edge === 1) { // right
          x = s.innerRight - Math.random() * bandX;
          y = s.innerTop + Math.random() * (s.innerBottom - s.innerTop);
        } else if (edge === 2) { // top
          x = s.innerLeft + Math.random() * (s.innerRight - s.innerLeft);
          y = s.innerTop + Math.random() * bandY;
        } else { // bottom
          x = s.innerLeft + Math.random() * (s.innerRight - s.innerLeft);
          y = s.innerBottom - Math.random() * bandY;
        }
      } else {
        x = s.innerLeft + Math.random() * (s.innerRight - s.innerLeft);
        y = s.innerTop + Math.random() * (s.innerBottom - s.innerTop);
      }
      s.waves.push({ x, y, startTime: performance.now() });
    }

    // Auto-pulse for mobile: spawn a wave at a random position every 2.5s
    let autoPulseInterval: ReturnType<typeof setInterval> | null = null;
    if (isMobile()) {
      autoPulseInterval = setInterval(spawnAutoPulse, 2500);
    }

    const handleResize = () => {
      initGrid();
      if (isMobile()) {
        if (!autoPulseInterval) {
          autoPulseInterval = setInterval(spawnAutoPulse, 2500);
        }
      } else {
        if (autoPulseInterval) { clearInterval(autoPulseInterval); autoPulseInterval = null; }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile()) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Only active if mouse is within the canvas bounds
      if (x < 0 || x > s.canvasW || y < 0 || y > s.canvasH) {
        s.mouseActive = false;
        s.mouseX = -9999;
        s.mouseY = -9999;
        return;
      }
      s.mouseX = x;
      s.mouseY = y;
      s.mouseActive = true;
      const dx = x - s.lastMouseX;
      const dy = y - s.lastMouseY;
      if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
        s.waves.push({ x, y, startTime: performance.now() });
        s.lastMouseX = x;
        s.lastMouseY = y;
      }
    };

    const handleMouseLeave = () => {
      s.mouseActive = false;
      s.mouseX = -9999;
      s.mouseY = -9999;
      s.waves = [];
      for (let r = 0; r < s.rows; r++) {
        for (let c = 0; c < s.cols; c++) {
          if (s.grid[r]?.[c]) s.grid[r][c].smoothOpacity = BASE_OPACITY;
        }
      }
    };

    function getWaveIntensity(dist: number, now: number, wave: { x: number; y: number; startTime: number }) {
      const elapsed = (now - wave.startTime) / 1000;
      const currentRadius = elapsed * WAVE_SPEED;
      let intensity = 0;

      for (let i = 0; i < WAVE_COUNT; i++) {
        const ringRadius = currentRadius - i * (WAVE_WIDTH * 0.6);
        if (ringRadius < 0) continue;
        const ringDist = Math.abs(dist - ringRadius);
        if (ringDist < WAVE_WIDTH / 2) {
          let ringFactor = 1 - ringDist / (WAVE_WIDTH / 2);
          ringFactor = ringFactor * ringFactor * (3 - 2 * ringFactor);
          const ageFade = Math.max(0, 1 - currentRadius / (s.maxWaveRadius + 200));
          intensity = Math.max(intensity, ringFactor * ageFade);
        }
      }
      return intensity;
    }

    function drawCorners() {
      const isLight = getLightMode();
      ctx!.strokeStyle = isLight ? 'rgba(4, 166, 90, 0.4)' : 'rgba(0, 232, 123, 0.4)';
      ctx!.lineWidth = CORNER_LINE_WIDTH;

      // Top-left
      ctx!.beginPath();
      ctx!.moveTo(s.innerLeft, s.innerTop + CORNER_SIZE);
      ctx!.lineTo(s.innerLeft, s.innerTop);
      ctx!.lineTo(s.innerLeft + CORNER_SIZE, s.innerTop);
      ctx!.stroke();

      // Top-right
      ctx!.beginPath();
      ctx!.moveTo(s.innerRight - CORNER_SIZE, s.innerTop);
      ctx!.lineTo(s.innerRight, s.innerTop);
      ctx!.lineTo(s.innerRight, s.innerTop + CORNER_SIZE);
      ctx!.stroke();

      // Bottom-left
      ctx!.beginPath();
      ctx!.moveTo(s.innerLeft, s.innerBottom - CORNER_SIZE);
      ctx!.lineTo(s.innerLeft, s.innerBottom);
      ctx!.lineTo(s.innerLeft + CORNER_SIZE, s.innerBottom);
      ctx!.stroke();

      // Bottom-right
      ctx!.beginPath();
      ctx!.moveTo(s.innerRight - CORNER_SIZE, s.innerBottom);
      ctx!.lineTo(s.innerRight, s.innerBottom);
      ctx!.lineTo(s.innerRight, s.innerBottom - CORNER_SIZE);
      ctx!.stroke();
    }

    function animate() {
      const now = performance.now();
      const isLight = getLightMode();

      // Prune old waves
      s.waves = s.waves.filter((w) => {
        const elapsed = (now - w.startTime) / 1000;
        return elapsed * WAVE_SPEED < s.maxWaveRadius + 300;
      });

      ctx!.clearRect(0, 0, s.canvasW, s.canvasH);
      ctx!.font = `${FONT_SIZE}px "Geist Mono", "JetBrains Mono", "SF Mono", monospace`;
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';

      for (let r = 0; r < s.rows; r++) {
        for (let c = 0; c < s.cols; c++) {
          const cell = s.grid[r]?.[c];
          if (!cell) continue;

          const x = s.innerLeft + c * CELL_SIZE + CELL_SIZE / 2;
          const y = s.innerTop + r * CELL_SIZE + CELL_SIZE / 2;
          let waveIntensity = 0;

          for (let wi = 0; wi < s.waves.length; wi++) {
            const wave = s.waves[wi];
            const dx = x - wave.x;
            const dy = y - wave.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            waveIntensity = Math.max(waveIntensity, getWaveIntensity(dist, now, wave));
          }

          if (s.mouseActive) {
            const cdx = x - s.mouseX;
            const cdy = y - s.mouseY;
            const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
            if (cdist < 80) {
              const cursorGlow = (1 - cdist / 80) * 0.5;
              waveIntensity = Math.max(waveIntensity, cursorGlow);
            }
          }

          // On mobile (inactive), suppress wave intensity away from all edges
          const edgeMask = getMobileEdgeMask(x, y);
          waveIntensity *= edgeMask;

          const baseOp = isLight ? BASE_OPACITY_LIGHT : BASE_OPACITY;
          const peakOp = isLight ? PEAK_OPACITY_LIGHT : PEAK_OPACITY;
          // On mobile (inactive), also fade base opacity toward center
          const effectiveBase = isMobile() && !s.mobileActive ? baseOp * edgeMask : baseOp;
          const targetOpacity = waveIntensity > 0
            ? effectiveBase + (peakOp - effectiveBase) * waveIntensity
            : effectiveBase;

          // Lerp smoothOpacity toward target
          cell.smoothOpacity += (targetOpacity - cell.smoothOpacity) * LERP_SPEED;

          // Scramble character during active wave
          if (waveIntensity > 0.2) {
            cell.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          } else if (cell.smoothOpacity < baseOp + 0.01) {
            // Only reset to baseChar when fully settled
            cell.char = cell.baseChar;
          }

          ctx!.fillStyle = isLight
            ? `rgba(4, 166, 90, ${cell.smoothOpacity.toFixed(3)})`
            : `rgba(0, 232, 123, ${cell.smoothOpacity.toFixed(3)})`;
          ctx!.fillText(cell.char, x, y);
        }
      }

      drawCorners();
      s.animId = requestAnimationFrame(animate);
    }

    const handleRipple = (e: Event) => {
      const detail = (e as CustomEvent).detail as { clientX: number; clientY: number };
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = detail.clientX - rect.left;
      const y = detail.clientY - rect.top;
      if (x >= 0 && x <= s.canvasW && y >= 0 && y <= s.canvasH) {
        s.waves.push({ x, y, startTime: performance.now() });
      }
      // On mobile, unlock the center for a few seconds after interaction
      if (isMobile()) {
        s.mobileActive = true;
        clearTimeout(s.mobileActiveTimer);
        s.mobileActiveTimer = setTimeout(() => { s.mobileActive = false; }, 4000);
      }
    };

    window.addEventListener('resize', handleResize);
    if (!isMobile()) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }
    window.addEventListener('matrix-ripple', handleRipple);

    s.animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(s.animId);
      if (autoPulseInterval) clearInterval(autoPulseInterval);
      clearTimeout(s.mobileActiveTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('matrix-ripple', handleRipple);
    };
  }, [initGrid]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'auto' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </div>
  );
}
