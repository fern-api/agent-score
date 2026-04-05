import { ImageResponse } from 'next/og';
import { getCompanyWithFallback } from '@/lib/scores';
import { scoreColor, scoreBg } from '@/lib/gradeColors';
import { inter_latin_400_normal, inter_latin_700_normal } from './og-fonts';
import {
  dynamic_og_a_image,
  dynamic_og_b_image,
  dynamic_og_c_image,
  dynamic_og_d_image,
  dynamic_og_f_image,
} from './og-grade-images';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function b64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = Buffer.from(b64, 'base64');
  return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength) as ArrayBuffer;
}

function gradeImageSrc(grade: string): string {
  if (grade.startsWith('A')) return dynamic_og_a_image;
  if (grade === 'B') return dynamic_og_b_image;
  if (grade === 'C') return dynamic_og_c_image;
  if (grade === 'D') return dynamic_og_d_image;
  return dynamic_og_f_image;
}

export default async function Image({ params }: { params: { slug: string } }) {
  try {
    const company = await getCompanyWithFallback(params.slug);
    if (!company) return new Response('Not found', { status: 404 });

    const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }[] = [
      { name: 'Inter', data: b64ToArrayBuffer(inter_latin_400_normal), weight: 400, style: 'normal' },
      { name: 'Inter', data: b64ToArrayBuffer(inter_latin_700_normal), weight: 700, style: 'normal' },
    ];

    const { score, grade, name, docsUrl } = company;

    const color = scoreColor(score);
    const bg = scoreBg(score);
    const gradeImgSrc = gradeImageSrc(grade);

    // Score ring math (r=90, circumference≈565.5)
    const r = 90;
    const circumference = +(2 * Math.PI * r).toFixed(2);
    const offset = +((1 - score / 100) * circumference).toFixed(2);

    // Domain display: strip https://, http://, www.
    let domain = docsUrl;
    try {
      const parsed = new URL(docsUrl);
      const full = parsed.hostname.replace(/^www\./, '') + parsed.pathname;
      domain = full.replace(/\/$/, '');
    } catch {}

    // Adaptive title font size based on name length
    const titleFontSize = name.length > 22 ? 48 : name.length > 14 ? 56 : 64;

    // Adaptive domain font size based on domain length
    const domainFontSize = domain.length > 40 ? 20 : domain.length > 28 ? 26 : 32;

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
          }}
        >
          {/* Left panel */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '800px',
              padding: '80px',
              gap: '24px',
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: `${titleFontSize}px`,
                fontWeight: '300',
                color: '#ffffff',
                lineHeight: '1.15',
                letterSpacing: -1,
              }}
            >
              {`Is ${name} ready for AI agents?`}
            </div>

            {/* Domain */}
            <div
              style={{
                fontSize: `${domainFontSize}px`,
                color: '#666666',
                fontFamily: 'Inter',
                letterSpacing: 0.2,
              }}
            >
              {domain}
            </div>

            {/* Score ring + grade badge row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '28px',
                marginTop: '8px',
              }}
            >
              {/* Score ring */}
              <div style={{ display: 'flex', position: 'relative', width: '200px', height: '200px' }}>
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <g transform={`rotate(-90 100 100)`}>
                    <circle cx="100" cy="100" r={r} fill="none" stroke="#1a1a1a" strokeWidth="10" />
                    <circle
                      cx="100"
                      cy="100"
                      r={r}
                      fill="none"
                      stroke={color}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={String(circumference)}
                      strokeDashoffset={String(offset)}
                    />
                  </g>
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '200px',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '88px',
                    fontWeight: '700',
                    fontFamily: 'Inter',
                    color: '#ffffff',
                    letterSpacing: -2,
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
                  background: bg,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: color,
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                }}
              >
                <span style={{ fontSize: '32px', fontWeight: '700', color: color, fontFamily: 'Inter' }}>
                  {`Grade ${grade}`}
                </span>
              </div>
            </div>
          </div>

          {/* Vertical separator */}
          <div style={{ width: '1px', background: '#1a1a1a', alignSelf: 'stretch', flexShrink: 0 }} />

          {/* Right panel — grade image */}
          <div
            style={{
              display: 'flex',
              flex: '1',
              overflow: 'hidden',
            }}
          >
            <img
              src={gradeImgSrc}
              style={{
                width: '400px',
                height: '630px',
              }}
            />
          </div>
        </div>
      ),
      { ...size, fonts }
    );
  } catch (err) {
    console.error('[opengraph-image] error:', err);
    return new Response(`OG image error: ${String(err)}`, { status: 500 });
  }
}
