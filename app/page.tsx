import Image from 'next/image';
import { getLeaderboard } from '@/lib/scores';
import Leaderboard from './leaderboard';
import ScoreChecker from '@/components/ScoreChecker';
import MatrixBackground from '@/components/MatrixBackground';
import CTASection from '@/components/CTASection';
import SiteFooter from '@/components/SiteFooter';

export const dynamic = 'force-dynamic';

const tickerItems = [
  { name: 'Stripe', score: 96 },
  { name: 'ElevenLabs', score: 94 },
  { name: 'Square', score: 89 },
  { name: 'Cloudflare', score: 88 },
  { name: 'Anthropic', score: 86 },
  { name: 'Vercel', score: 85 },
  { name: 'Cohere', score: 83 },
  { name: 'OpenAI', score: 78 },
  { name: 'Sentry', score: 71 },
  { name: 'Datadog', score: 70 },
  { name: 'Resend', score: 65 },
  { name: 'Supabase', score: 62 },
  { name: 'Clerk', score: 58 },
  { name: 'Shopify', score: 52 },
  { name: 'HubSpot', score: 48 },
  { name: 'AWS', score: 42 },
  { name: 'Slack', score: 39 },
  { name: 'Twilio', score: 35 },
  { name: 'Zendesk', score: 30 },
  { name: 'Salesforce', score: 25 },
  { name: 'SAP', score: 18 },
];

function TickerSet() {
  return (
    <>
      {tickerItems.map((item, i) => {
        const cls = item.score >= 80 ? ' hi' : item.score < 40 ? ' lo' : '';
        return (
          <span key={i} className={`tick-item${cls}`}>
            {item.name}{' '}
            <span className="tick-score">{item.score}</span>
          </span>
        );
      })}
    </>
  );
}

const methodCells = [
  {
    name: 'llms.txt',
    checks: '5 checks',
    desc: 'Can agents discover and parse your documentation index?',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h8l4 4v12H4V2z"/><path d="M12 2v4h4"/><line x1="7" y1="9" x2="13" y2="9"/><line x1="7" y1="12" x2="13" y2="12"/><line x1="7" y1="15" x2="11" y2="15"/></svg>,
  },
  {
    name: 'Markdown',
    checks: '2 checks',
    desc: 'Can agents get clean markdown instead of bloated HTML?',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="7" x2="15" y2="7"/><line x1="5" y1="13" x2="15" y2="13"/><line x1="8" y1="3" x2="7" y2="17"/><line x1="13" y1="3" x2="12" y2="17"/></svg>,
  },
  {
    name: 'Page size',
    checks: '3 checks',
    desc: "Will your pages fit in an agent's context window?",
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13,3 17,3 17,7"/><polyline points="7,17 3,17 3,13"/><line x1="17" y1="3" x2="11" y2="9"/><line x1="3" y1="17" x2="9" y2="11"/></svg>,
  },
  {
    name: 'Content structure',
    checks: '3 checks',
    desc: 'Are tabs, headers, and code fences agent-parseable?',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="14" height="3"/><rect x="3" y="8.5" width="10" height="3"/><rect x="3" y="14" width="6" height="3"/></svg>,
  },
  {
    name: 'URL stability',
    checks: '2 checks',
    desc: 'Do your URLs resolve cleanly without traps?',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13H5a4 4 0 0 1 0-8h2"/><path d="M13 7h2a4 4 0 0 1 0 8h-2"/><line x1="7" y1="10" x2="13" y2="10"/></svg>,
  },
  {
    name: 'Discoverability',
    checks: '1 check',
    desc: 'Can agents find your llms.txt from any page?',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="5"/><line x1="14" y1="14" x2="17" y2="17"/></svg>,
  },
  {
    name: 'Observability',
    checks: '3 checks',
    desc: 'Is your agent-facing content fresh and accurate?',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/><circle cx="10" cy="10" r="2.5"/></svg>,
  },
  {
    name: 'Authentication',
    checks: '2 checks',
    desc: 'Can agents access your docs without hitting auth walls?',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="10" r="4"/><path d="M11 10h7"/><path d="M15 10v2.5"/><path d="M17.5 10v2"/></svg>,
  },
];

// Pixel art for the Why section ──────────────────────────────────────────────
function WhyPixelArt({ grid, px = 9 }: { grid: string[]; px?: number }) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  return (
    <svg
      width={cols * px}
      height={rows * px}
      viewBox={`0 0 ${cols * px} ${rows * px}`}
      fill="var(--accent)"
      style={{ imageRendering: 'pixelated', opacity: 0.8 } as React.CSSProperties}
    >
      {grid.flatMap((row, r) =>
        row.split('').map((cell, c) =>
          cell === '1'
            ? <rect key={`${r}-${c}`} x={c * px} y={r * px} width={px} height={px} />
            : null
        )
      )}
    </svg>
  );
}

// Ghost — hooded phantom figure (12 × 14)
const GHOST_GRID = [
  '000111111000',
  '011111111110',
  '111111111111',
  '111111111111',
  '111001001111',
  '111111111111',
  '111111111111',
  '011111111110',
  '011111111110',
  '001111111100',
  '001111111100',
  '000111111000',
  '000011110000',
  '000001100000',
];

// Gate — arched gate with vertical bars (12 × 13)
const GATE_GRID = [
  '000011110000',
  '000111111000',
  '001111111100',
  '011000000110',
  '011010010110',
  '011010010110',
  '011010010110',
  '011111111110',
  '011010010110',
  '011010010110',
  '011010010110',
  '011111111110',
  '011111111110',
];
// ─────────────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const companies = await getLeaderboard();
  const categories = Array.from(new Set(companies.map((c) => c.category))).sort();

  return (
    <main>
      {/* HERO */}
      <section className="hero" id="why">
        <div className="hero-left">
          <div className="hero-content">
            <h1 className="hero-headline">
              Is your documentation ready for <span className="accent">AI agents</span>?
            </h1>
            <p className="hero-subtitle">
              Improve your agent readiness to allow AI agents to discover and call APIs directly — evaluated across{' '}
              <span className="agent-badge"><img src="/cursor-simple-logo.svg" alt="Cursor" style={{width:'12px',height:'14px',filter:'brightness(0) invert(0.6)',display:'block',flexShrink:0}} /> Cursor</span>,{' '}
              <span className="agent-badge"><img src="/claude-simple-logo.svg" alt="Claude" style={{width:'14px',height:'14px',filter:'brightness(0) invert(0.6)',display:'block',flexShrink:0}} /> Claude</span> and{' '}
              <span className="agent-badge"><img src="/openai-simple-logo.svg" alt="ChatGPT" style={{width:'14px',height:'14px',filter:'brightness(0) invert(0.6)',display:'block',flexShrink:0}} /> ChatGPT</span>.
            </p>
            <p className="hero-attribution">
              <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}>
                Developed by
                <a href="https://buildwithfern.com" target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center'}}>
                  <Image src="/fern-labs-dark.svg" alt="Fern Labs" width={56} height={13} className="fern-logo-dark" />
                  <Image src="/fern-labs-light.svg" alt="Fern Labs" width={56} height={13} className="fern-logo-light" />
                </a>
              </span>
              <span style={{color:'var(--border)'}}>·</span>
              <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}>
                in partnership with
                <a href="https://github.com/dacharyc" target="_blank" rel="noreferrer">Dachary Carey</a>
              </span>
            </p>
          </div>
          <div className="hero-form-strip">
            <ScoreChecker />
          </div>
        </div>

        <div className="hero-right">
          <MatrixBackground />
        </div>
      </section>

      {/* LEADERBOARD */}
      <section className="lb-section" id="leaderboard">
        <Leaderboard companies={companies} categories={categories} />
      </section>

      {/* WHY */}
      <section className="why-section">
        <div className="why-header">
          <span className="why-label">WHY IT MATTERS</span>
          <h2 className="why-heading">
            Your docs have a new audience:{' '}
            <span className="accent">AI is reading them now</span>
          </h2>
        </div>

        <div className="why-grid">
          {/* Row 1 */}
          <div className="why-cell why-cell-img">
            <WhyPixelArt grid={GHOST_GRID} />
          </div>
          <div className="why-cell why-cell-text">
            <div className="why-cell-title">The invisible audience</div>
            <p className="why-cell-body">
              AI coding agents are reading your API docs millions of times a day. If your docs
              aren&apos;t optimized for these agents, you&apos;re invisible to the fastest-growing
              segment of your user base.
            </p>
          </div>
          <div className="why-cell why-cell-empty" />
          <div className="why-cell why-cell-text">
            <div className="why-cell-title">Lighthouse for AI agents</div>
            <p className="why-cell-body">
              Agent Score is the first industry benchmark for AI-agent readiness. Think Lighthouse,
              but for how effectively AI agents can discover, parse, and use your documentation.
              0 to 100, 21 checks, 8 categories.
            </p>
          </div>

          {/* Row 2 */}
          <div className="why-cell why-cell-empty" />
          <div className="why-cell why-cell-text">
            <div className="why-cell-title">Agent readiness = competitive moat</div>
            <p className="why-cell-body">
              API platforms with higher agent readability are already seeing outsized adoption.
              Agent readiness isn&apos;t a nice-to-have. It&apos;s the new SEO. 73% of top API
              docs still lack an llms.txt.
            </p>
          </div>
          <div className="why-cell why-cell-img">
            <WhyPixelArt grid={GATE_GRID} />
          </div>
          <div className="why-cell why-cell-text">
            <div className="why-cell-title">Open source, no black boxes</div>
            <p className="why-cell-body">
              Built on the open-source{' '}
              <a href="https://github.com/agent-ecosystem/agent-docs-spec" target="_blank" rel="noopener">
                Agent-Friendly Docs Spec
              </a>{' '}
              with no gatekeeping, no black boxes. Every check is transparent and community-driven.
            </p>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-section">
        <div className="ticker-track">
          <TickerSet />
          <TickerSet />
        </div>
      </div>

      {/* METHODOLOGY */}
      <section className="method-section" id="methodology">
        <div className="method-header">
          <h2 className="method-header-title">21 checks across 8 categories</h2>
          <p className="method-header-sub">
            A comprehensive framework for evaluating agent-readiness
          </p>
        </div>
        <div className="method-grid">
          {methodCells.map((cell) => (
            <div key={cell.name} className="method-cell">
              <div className="mc-icon">{cell.icon}</div>
              <div className="mc-name">{cell.name}</div>
              <div className="mc-checks">{cell.checks}</div>
              <div className="mc-desc">{cell.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <CTASection />
      <SiteFooter />
    </main>
  );
}
