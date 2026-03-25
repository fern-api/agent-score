'use client';

import { useRef, useEffect } from 'react';

const LOGO_PIXELS = [
  [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0],
  [0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
];

const PX = 4;
const SIZE = 44;

export default function PixelLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, SIZE, SIZE);

    LOGO_PIXELS.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          ctx.fillStyle = '#00ff66';
          ctx.fillRect(x * PX, y * PX, PX, PX);
        }
      });
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="hero-logo-canvas"
    />
  );
}
