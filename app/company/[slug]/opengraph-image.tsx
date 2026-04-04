import { ImageResponse } from 'next/og';
import { getCompanyWithFallback } from '@/lib/scores';
import { scoreColor, scoreBg } from '@/lib/gradeColors';
import {
  inter_latin_400_normal,
  inter_latin_700_normal,
  geist_mono_latin_400_normal,
  geist_mono_latin_700_normal,
} from './og-fonts';
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

export async function generateStaticParams() {
  try {
    const { getAllScores } = await import('@/lib/supabase');
    const scores = await getAllScores();
    return scores.map(s => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  try {
    const company = await getCompanyWithFallback(params.slug);
    if (!company) return new Response('Not found', { status: 404 });

    const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }[] = [
      { name: 'Inter', data: b64ToArrayBuffer(inter_latin_400_normal), weight: 400, style: 'normal' },
      { name: 'Inter', data: b64ToArrayBuffer(inter_latin_700_normal), weight: 700, style: 'normal' },
      { name: 'Geist Mono', data: b64ToArrayBuffer(geist_mono_latin_400_normal), weight: 400, style: 'normal' },
      { name: 'Geist Mono', data: b64ToArrayBuffer(geist_mono_latin_700_normal), weight: 700, style: 'normal' },
    ];

    const { score, grade, name, docsUrl } = company;

    const color = scoreColor(score);
    const bg = scoreBg(score);
    const gradeImgSrc = gradeImageSrc(grade);

    // Score ring math (r=68, circumference≈427.3)
    const r = 68;
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
                letterSpacing: '-1px',
              }}
            >
              {`Is ${name} ready for AI agents?`}
            </div>

            {/* Domain */}
            <div
              style={{
                fontSize: `${domainFontSize}px`,
                color: '#666666',
                fontFamily: 'monospace',
                letterSpacing: '0.2px',
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
              <div style={{ display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <g transform={`rotate(-90 80 80)`}>
                    <circle cx="80" cy="80" r={r} fill="none" stroke="#1a1a1a" strokeWidth="8" />
                    <circle
                      cx="80"
                      cy="80"
                      r={r}
                      fill="none"
                      stroke={color}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={String(circumference)}
                      strokeDashoffset={String(offset)}
                    />
                  </g>
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '80px',
                    fontWeight: '700',
                    fontFamily: 'Geist Mono',
                    color: '#ffffff',
                    letterSpacing: '-2px',
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
                  border: `1px solid ${color}`,
                  padding: '10px 24px',
                }}
              >
                <span style={{ fontSize: '32px', fontWeight: '700', color: color, fontFamily: 'Geist Mono' }}>
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
                objectFit: 'cover',
                objectPosition: 'center top',
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
