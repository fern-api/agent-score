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
  { id: 'CAT_01', name: 'LLMS.TXT', checks: '5 CHECKS', desc: 'Can agents discover and parse your documentation index?' },
  { id: 'CAT_02', name: 'MARKDOWN', checks: '2 CHECKS', desc: 'Can agents get clean markdown instead of bloated HTML?' },
  { id: 'CAT_03', name: 'PAGE SIZE', checks: '3 CHECKS', desc: "Will your pages fit in an agent's context window?" },
  { id: 'CAT_04', name: 'CONTENT STRUCTURE', checks: '3 CHECKS', desc: 'Are tabs, headers, and code fences agent-parseable?' },
  { id: 'CAT_05', name: 'URL STABILITY', checks: '2 CHECKS', desc: 'Do your URLs resolve cleanly without traps?' },
  { id: 'CAT_06', name: 'DISCOVERABILITY', checks: '1 CHECK', desc: 'Can agents find your llms.txt from any page?' },
  { id: 'CAT_07', name: 'OBSERVABILITY', checks: '3 CHECKS', desc: 'Is your agent-facing content fresh and accurate?' },
  { id: 'CAT_08', name: 'AUTHENTICATION', checks: '2 CHECKS', desc: 'Can agents access your docs without hitting auth walls?' },
];

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
                  <img src="/fern-labs-dark.svg" alt="fern labs" style={{height:'13px',display:'block',opacity:0.6}} />
                </a>
              </span>
              <span style={{color:'#2a2a2a'}}>·</span>
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
        <div className="why-panel">
          <span className="panel-num">// 01</span>
          <div className="panel-title">The <span className="accent">invisible</span> audience</div>
          <p className="panel-body">
            AI coding agents read your API docs millions of times daily. If your docs aren&apos;t
            optimized, you&apos;re invisible to the fastest-growing segment of your user base.
          </p>
        </div>
        <div className="why-panel">
          <span className="panel-num">// 02</span>
          <div className="panel-title">Lighthouse for <span className="accent">AI</span></div>
          <p className="panel-body">
            Agent Score is the first industry benchmark for AI-agent readiness. 0 to 100, 21 checks,
            8 categories. Think Lighthouse, but for how AI agents experience your docs.
          </p>
        </div>
        <div className="why-panel">
          <span className="panel-num">// 03</span>
          <div className="panel-title">Readiness = <span className="accent">moat</span></div>
          <p className="panel-body">
            API platforms with higher agent readability are seeing outsized adoption. Agent readiness
            isn&apos;t a nice-to-have — it&apos;s the new SEO. 73% of top docs still lack llms.txt.
          </p>
        </div>
        <div className="why-panel">
          <span className="panel-num">// 04</span>
          <div className="panel-title">No <span className="accent">black</span> boxes</div>
          <p className="panel-body">
            Built on the open-source Agent-Friendly Docs Spec. No gatekeeping, no hidden scoring.
            Every check is transparent and community-driven.
          </p>
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
        <div className="section-header">
          <div className="section-header-title">Methodology</div>
          <div className="section-header-meta">
            21 checks // 8 categories // framework: agent_friendly_docs_spec
          </div>
        </div>
        <div className="method-grid">
          {methodCells.map((cell) => (
            <div key={cell.id} className="method-cell">
              <span className="mc-id">{cell.id}</span>
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
