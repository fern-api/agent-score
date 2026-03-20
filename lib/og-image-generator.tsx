import { ImageResponse } from 'next/og';
import type { CompanyScore } from './scores';
import fs from 'fs';
import path from 'path';

function loadLocalFont(weight: 400 | 500 | 700): ArrayBuffer {
  const file = `inter-latin-${weight}-normal.woff`;
  const buf = fs.readFileSync(
    path.join(process.cwd(), 'node_modules/@fontsource/inter/files', file)
  );
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export async function generateOgImageBuffer(company: CompanyScore): Promise<Buffer> {
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: 'normal' }[] = [
    { name: 'Inter', data: loadLocalFont(400), weight: 400, style: 'normal' },
    { name: 'Inter', data: loadLocalFont(500), weight: 500, style: 'normal' },
    { name: 'Inter', data: loadLocalFont(700), weight: 700, style: 'normal' },
  ];

  const { score, grade, name, docsUrl } = company;

  const circumference = 565.48;
  const offset = ((1 - score / 100) * circumference).toFixed(2);

  const gradeColor =
    score >= 90 ? '#00e87b' : score >= 70 ? '#f59e0b' : score >= 50 ? '#f97316' : '#ef4444';

  let domain = docsUrl;
  try {
    domain = new URL(docsUrl).hostname.replace(/^www\./, '');
  } catch {}

  const nameFontSize = name.length > 20 ? 52 : name.length > 14 ? 64 : 76;

  const imageResponse = new ImageResponse(
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
        {/* Corner brackets */}
        <svg
          style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          viewBox="0 0 1200 630"
        >
          <line x1="460" y1="60" x2="460" y2="570" stroke="#1a1a1a" strokeWidth="1" />
          <path d="M36 84 L36 36 L84 36" stroke="#00e87b" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M1116 36 L1164 36 L1164 84" stroke="#00e87b" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M36 546 L36 594 L84 594" stroke="#00e87b" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M1116 594 L1164 594 L1164 546" stroke="#00e87b" strokeWidth="2" fill="none" opacity="0.5" />
        </svg>

        {/* Left panel — score ring */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '460px',
            gap: '16px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              <g transform="rotate(-90 100 100)">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#1a1a1a" strokeWidth="12" />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke={gradeColor}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={offset}
                />
              </g>
            </svg>
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '72px',
                fontWeight: '500',
                color: '#ffffff',
                letterSpacing: '-3px',
              }}
            >
              {score}
            </div>
          </div>

          {/* Grade badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#111',
              border: `1px solid ${gradeColor}30`,
              borderRadius: '8px',
              padding: '6px 20px',
            }}
          >
            <span style={{ fontSize: '28px', fontWeight: '700', color: gradeColor }}>{grade}</span>
            <span style={{ fontSize: '14px', color: '#555', marginTop: '2px' }}>grade</span>
          </div>
        </div>

        {/* Right panel — company info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 64px 60px 52px',
            gap: '28px',
            flex: '1',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: `${nameFontSize}px`,
              fontWeight: '700',
              color: '#ffffff',
              letterSpacing: '-1.5px',
              lineHeight: '1.1',
            }}
          >
            {name}
          </div>

          <div
            style={{
              fontSize: '22px',
              color: '#555',
              fontFamily: 'monospace',
              letterSpacing: '0.2px',
              marginTop: '8px',
            }}
          >
            {domain}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );

  return Buffer.from(await imageResponse.arrayBuffer());
}
