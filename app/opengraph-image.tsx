import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Agent Score | Is Your Documentation AI-Ready?';

function loadLocalFont(weight: 400 | 700): ArrayBuffer {
  const file = `inter-latin-${weight}-normal.woff`;
  const buf = fs.readFileSync(
    path.join(process.cwd(), 'node_modules/@fontsource/inter/files', file)
  );
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

// ASCII matrix fills the entire image
const COLS = 66;
const ROWS = 29;
const CHARS = '01{}/*><=-+_.:;|~^%#@&[]()'.split('');
const GRID_CHARS = Array.from({ length: COLS * ROWS }, (_, i) => CHARS[(i * 7 + i * 3) % CHARS.length]);
const GRID_OPACITIES = Array.from({ length: COLS * ROWS }, (_, i) =>
  i % 5 === 0 ? 0.45 : i % 3 === 0 ? 0.2 : 0.08
);

export default async function Image() {
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }[] = [
    { name: 'Inter', data: loadLocalFont(400), weight: 400, style: 'normal' },
    { name: 'Inter', data: loadLocalFont(700), weight: 700, style: 'normal' },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          background: '#0a0a0a',
          fontFamily: 'Inter, sans-serif',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ASCII matrix — full image */}
        <div
          style={{
            position: 'absolute',
            inset: '0',
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'flex-start',
            padding: '8px',
            gap: '0',
            overflow: 'hidden',
          }}
        >
          {GRID_CHARS.map((ch, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#00e87b',
                width: '18px',
                height: '22px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: GRID_OPACITIES[i],
              }}
            >
              {ch}
            </span>
          ))}
        </div>

        {/* Gradient overlay + corner brackets */}
        <svg
          style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          viewBox="0 0 1200 630"
        >
          <defs>
            <linearGradient id="fadeLeft" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#0a0a0a" stopOpacity="0.94" />
              <stop offset="45%" stopColor="#0a0a0a" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#0a0a0a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="1200" height="630" fill="url(#fadeLeft)" />
          {/* Corner brackets */}
          <path d="M48 96 L48 48 L96 48" stroke="#00e87b" strokeWidth="2.5" fill="none" opacity="0.6" />
          <path d="M1104 48 L1152 48 L1152 96" stroke="#00e87b" strokeWidth="2.5" fill="none" opacity="0.6" />
          <path d="M48 534 L48 582 L96 582" stroke="#00e87b" strokeWidth="2.5" fill="none" opacity="0.6" />
          <path d="M1104 582 L1152 582 L1152 534" stroke="#00e87b" strokeWidth="2.5" fill="none" opacity="0.6" />
        </svg>

        {/* Main content — left */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 0 80px 80px',
            gap: '32px',
            width: '760px',
            position: 'relative',
          }}
        >
          {/* Eyebrow — no border */}
          <span
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#555',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            AGENT SCORE
          </span>

          {/* Headline */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: '700',
              color: '#ffffff',
              lineHeight: '1.05',
              letterSpacing: '-2.5px',
              maxWidth: '620px',
            }}
          >
            Is Your Documentation AI-Ready?
          </div>

          {/* Subtitle — no underline bar */}
          <div
            style={{
              fontSize: '20px',
              color: '#555',
              fontFamily: 'monospace',
              letterSpacing: '0.3px',
            }}
          >
            21 checks · 8 categories · 200+ API docs scored
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
