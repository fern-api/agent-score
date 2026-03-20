import { Suspense } from 'react';
import React from 'react';
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
  { name: 'AWS', score: 42, tier: 'low' },
  { name: 'Slack', score: 39, tier: 'low' },
  { name: 'SAP', score: 18, tier: 'fail' },
];

function TickerSet() {
  return (
    <>
      {tickerItems.map((item, i) => (
        <span key={i}>
          <span className={`ticker-item${item.tier === 'low' ? ' ticker-item-low' : item.tier === 'fail' ? ' ticker-item-fail' : ''}`}>
            {item.name} <strong>{item.score}</strong>
          </span>
          <span className="ticker-separator">·</span>
        </span>
      ))}
    </>
  );
}

const methodCards: { icon: React.ReactNode; name: string; checks: string; desc: string }[] = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    name: 'llms.txt',
    checks: '5 checks',
    desc: 'Can agents discover and parse your documentation index?',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    name: 'Markdown availability',
    checks: '2 checks',
    desc: 'Can agents get clean markdown instead of bloated HTML?',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9"/>
        <polyline points="9 21 3 21 3 15"/>
        <line x1="21" y1="3" x2="14" y2="10"/>
        <line x1="3" y1="21" x2="10" y2="14"/>
      </svg>
    ),
    name: 'Page size',
    checks: '3 checks',
    desc: "Will your pages fit in an agent's context window?",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    ),
    name: 'Content structure',
    checks: '3 checks',
    desc: 'Are tabs, headers, and code fences agent-parseable?',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
      </svg>
    ),
    name: 'URL stability',
    checks: '2 checks',
    desc: 'Do your URLs resolve cleanly without traps?',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    name: 'Agent discoverability',
    checks: '1 check',
    desc: 'Can agents find your llms.txt from any page?',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    name: 'Observability',
    checks: '3 checks',
    desc: 'Is your agent-facing content fresh and accurate?',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    name: 'Authentication',
    checks: '2 checks',
    desc: 'Can agents access your docs without hitting auth walls?',
  },
];

export default async function HomePage() {
  const companies = await getLeaderboard();
  const categories = Array.from(new Set(companies.map((c) => c.category))).sort();

  return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Hero section */}
      <section className="hero" id="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <MatrixBackground />
        <div className="container">
          <div className="hero-left">
            <h1 className="hero-headline">
              Is your documentation<br />
              ready for <span className="accent">AI agents</span>?
            </h1>
            <p className="hero-subtitle">
              Agent Score evaluates how well your docs serve AI coding agents like{' '}
              <AgentPill name="Cursor" />,{' '}
              <AgentPill name="Claude" /> and{' '}
              <AgentPill name="ChatGPT" />.
            </p>
            <p className="hero-attribution">
              Developed by{' '}
              <a href="https://buildwithfern.com" target="_blank" rel="noopener">Fern Labs</a>
              {' '}in partnership with{' '}
              <a href="https://github.com/dacharyc" target="_blank" rel="noopener">Dachary Carey</a>
            </p>
          </div>
          <div className="hero-right" id="hero-checker">
            <ScoreChecker />
          </div>
        </div>
        <a href="#why" className="hero-scroll-indicator">
          Why it matters
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v10M4 9l4 4 4-4" />
          </svg>
        </a>
      </section>

      {/* Why section */}
      <section id="why" className="fade-section visible">
        <div className="container">
          <p className="why-eyebrow mono">Why it matters</p>
          <h2 className="why-headline">
            Your docs have a new audience: <span className="accent">AI is reading them now</span>
          </h2>

          <div className="why-ticker">
            <div className="why-ticker-track">
              <TickerSet />
              <TickerSet />
            </div>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
              <h3 className="why-card-title">The invisible audience</h3>
              <p className="why-card-body">
                AI coding agents are reading your API docs millions of times a day. If your docs
                aren&apos;t optimized for these agents, you&apos;re invisible to the fastest-growing
                segment of your user base.
              </p>
            </div>
            <div className="why-card">
              <div className="why-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>
              <h3 className="why-card-title">Lighthouse for AI agents</h3>
              <p className="why-card-body">
                Agent Score is the first industry benchmark for AI-agent readiness. Think Lighthouse,
                but for how effectively AI agents can discover, parse, and use your documentation. 0
                to 100, 21 checks, 8 categories.
              </p>
            </div>
            <div className="why-card">
              <div className="why-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
              <h3 className="why-card-title">Agent readiness = competitive moat</h3>
              <p className="why-card-body">
                API platforms with higher agent readability are already seeing outsized adoption.
                Agent readiness isn&apos;t a nice-to-have. It&apos;s the new SEO. 73% of top API
                docs still lack an llms.txt.
              </p>
            </div>
            <div className="why-card">
              <div className="why-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg></div>
              <h3 className="why-card-title">Open source, no black boxes</h3>
              <p className="why-card-body">
                Built on the open-source{' '}
                <a href="https://github.com/agent-ecosystem/agent-docs-spec" target="_blank" rel="noopener">
                  Agent-Friendly Docs Spec
                </a>{' '}
                with no gatekeeping, no black boxes. Every check is transparent and community-driven.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard section */}
      <section id="leaderboard">
        <div className="container">
          <div className="leaderboard-header">
            <div className="leaderboard-header-text">
              <h2 className="section-title">Agent score directory</h2>
              <p className="section-subtitle">
                How the top API documentation sites score on agent-readiness
              </p>
            </div>
            <div className="stats-banner">
              <StatsBannerItem number={String(companies.length)} label="companies scored" />
              <StatsBannerItem
                number={String(companies.filter((c) => c.score >= 80).length)}
                label="passing (80+)"
              />
              <StatsBannerItem
                number={
                  companies.length > 0
                    ? String(Math.round(companies.reduce((a, b) => a + b.score, 0) / companies.length))
                    : '0'
                }
                label="average score"
              />
            </div>
          </div>

          <Suspense fallback={<LeaderboardSkeleton />}>
            <Leaderboard companies={companies} categories={categories} />
          </Suspense>
        </div>
      </section>

      {/* Methodology section */}
      <section id="methodology" className="fade-section visible">
        <div className="container">
          <h2 className="section-title">21 checks across 8 categories</h2>
          <p className="section-subtitle">
            A comprehensive framework for evaluating agent-readiness
          </p>
          <div className="method-grid">
            {methodCards.map((card) => (
              <div key={card.name} className="method-card">
                <div className="method-icon">{card.icon}</div>
                <h3 className="method-name">{card.name}</h3>
                <p className="method-checks">{card.checks}</p>
                <p className="method-desc">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <SiteFooter />
    </main>
  );
}

function StatsBannerItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="stats-banner-item">
      <span className="stats-number">{number}</span>
      <span className="stats-label">{label}</span>
    </div>
  );
}

function AgentPill({ name }: { name: 'Cursor' | 'Claude' | 'ChatGPT' }) {
  return (
    <span className="agent-pill">
      {name === 'Cursor' && (
        <svg width="18" height="20" viewBox="0 0 87 99" fill="none" aria-hidden>
          <path d="M84.6121 24.0437L45.3833 1.39519C44.1236 0.667748 42.5692 0.667748 41.3095 1.39519L2.08269 24.0437C1.02375 24.6551 0.369965 25.7858 0.369965 27.0105V72.6814C0.369965 73.9042 1.02375 75.0368 2.08269 75.6482L41.3114 98.2966C42.5711 99.0241 44.1255 99.0241 45.3852 98.2966L84.6138 75.6482C85.6728 75.0368 86.3266 73.9059 86.3266 72.6814V27.0105C86.3266 25.7877 85.6728 24.6551 84.6138 24.0437H84.6121ZM82.148 28.8411L44.2782 94.433C44.0223 94.8749 43.3465 94.6944 43.3465 94.1823V51.2336C43.3465 50.3754 42.8878 49.5815 42.1438 49.1506L4.95012 27.6772C4.50813 27.4213 4.68861 26.7452 5.20058 26.7452H80.9398C82.0153 26.7452 82.6876 27.9111 82.1497 28.843H82.148V28.8411Z" fill="white"/>
        </svg>
      )}
      {name === 'Claude' && (
        <svg width="18" height="18" viewBox="0 0 91 91" fill="none" aria-hidden>
          <path d="M18.2165 60.1511L35.8116 50.3108L36.106 49.4531L35.8116 48.9792H34.9511L32.0073 48.7986L21.9529 48.5278L13.2346 48.1667L4.78806 47.7153L2.65944 47.2639L0.666687 44.6458L0.870491 43.3368L2.65944 42.1406L5.21832 42.3663L10.8795 42.75L19.3714 43.3368L25.5308 43.6979L34.6567 44.6458H36.106L36.3098 44.059L35.8116 43.6979L35.4267 43.3368L26.6404 37.4011L17.1295 31.1268L12.1477 27.5156L9.45292 25.6875L8.09422 23.9722L7.50546 20.2257L9.95111 17.5399L13.2346 17.7656L14.0725 17.9913L17.4013 20.5417L24.5118 26.0261L33.7962 32.842L35.1549 33.9705L35.6984 33.5868L35.7663 33.316L35.1549 32.3004L30.1051 23.2049L24.7156 13.9514L22.3152 10.1146L21.6812 7.81252C21.4547 6.8646 21.2962 6.07467 21.2962 5.10419L24.0815 1.33509L25.6214 0.838562L29.3352 1.33509L30.8977 2.68926L33.2074 7.94794L36.9439 16.2309L42.741 27.4931L44.4393 30.8334L45.3451 33.9254L45.6848 34.8733H46.2736V34.3316L46.7491 27.9896L47.6323 20.2031L48.4928 10.1823L48.7872 7.36113L50.1911 3.97571L52.9765 2.14759L55.1504 3.18578L56.9393 5.73613L56.6902 7.3837L55.6259 14.2674L53.5426 25.0556L52.1839 32.2778H52.9765L53.8823 31.375L57.5507 26.5226L63.7102 18.849L66.4276 15.8021L69.5978 12.4393L71.6359 10.8368H75.4855L78.3161 15.0347L77.048 19.3681L73.0852 24.3785L69.8017 28.6215L65.0915 34.941L62.1477 39.9965L62.4194 40.4028L63.1214 40.3351L73.7645 38.0781L79.5163 37.0399L86.3777 35.8663L89.4801 37.3108L89.8198 38.7778L88.5969 41.7795L81.26 43.5851L72.6549 45.3004L59.8379 48.3247L59.6794 48.4375L59.8605 48.6632L65.635 49.2049L68.1033 49.3403H74.1495L85.404 50.1754L88.3478 52.1163L90.1142 54.4861L89.8198 56.2917L85.2908 58.5938L79.1766 57.1493L64.9103 53.7639L60.019 52.5452H59.3397V52.9514L63.4158 56.9236L70.8886 63.6493L80.241 72.316L80.7165 74.4601L79.5163 76.1528L78.2482 75.9722L70.0281 69.8108L66.8578 67.0347L59.6794 61.0087H59.2038V61.6406L60.8569 64.0556L69.5978 77.1458L70.0507 81.1632L69.4167 82.4722L67.1522 83.2622L64.6613 82.8108L59.5435 75.6563L54.2672 67.599L50.01 60.3768L49.4891 60.6702L46.9756 87.6406L45.798 89.0174L43.0806 90.0556L40.8161 88.3403L39.616 85.5642L40.8161 80.0799L42.2654 72.9254L43.443 67.2379L44.5073 60.1736L45.1413 57.8264L45.096 57.6684L44.5752 57.7361L39.231 65.0486L31.1015 75.9948L24.6703 82.8559L23.1305 83.4653L20.4584 82.0886L20.7074 79.6285L22.202 77.4392L31.1015 66.1545L36.4683 59.158L39.933 55.1181L39.9103 54.5313H39.7065L16.0652 69.8333L11.8533 70.375L10.0417 68.6823L10.2681 65.9063L11.1286 65.0035L18.2392 60.1285L18.2165 60.1511Z" fill="white"/>
        </svg>
      )}
      {name === 'ChatGPT' && (
        <svg width="18" height="18" viewBox="0 0 81 80" fill="none" aria-hidden>
          <path d="M30.8217 29.2252V21.6718C30.8217 21.0356 31.0605 20.5584 31.6168 20.2407L46.8035 11.4948C48.8706 10.3022 51.3355 9.74589 53.8794 9.74589C63.4203 9.74589 69.4635 17.1404 69.4635 25.0114C69.4635 25.5679 69.4635 26.204 69.3838 26.8402L53.6408 17.6169C52.6869 17.0607 51.7324 17.0607 50.7784 17.6169L30.8217 29.2252ZM66.2827 58.6437V40.5948C66.2827 39.4814 65.8053 38.6863 64.8515 38.1299L44.8948 26.5217L51.4146 22.7845C51.971 22.4668 52.4482 22.4668 53.0047 22.7845L68.1912 31.5305C72.5645 34.0751 75.506 39.4814 75.506 44.7287C75.506 50.7711 71.9284 56.3371 66.2827 58.643V58.6437ZM26.1308 42.742L19.611 38.9258C19.0548 38.6081 18.816 38.1307 18.816 37.4946V20.0028C18.816 11.4956 25.3357 5.05491 34.1614 5.05491C37.5012 5.05491 40.6014 6.16829 43.2259 8.15594L27.5626 17.2202C26.6088 17.7765 26.1316 18.5716 26.1316 19.6851V42.7427L26.1308 42.742ZM40.1643 50.8517L30.8217 45.6043V34.4734L40.1643 29.226L49.5061 34.4734V45.6043L40.1643 50.8517ZM46.1671 75.0228C42.8275 75.0228 39.7273 73.9094 37.1028 71.9219L52.7659 62.8574C53.7199 62.3012 54.1971 61.5061 54.1971 60.3926V37.335L60.7967 41.1512C61.353 41.4689 61.5918 41.9461 61.5918 42.5824V60.0742C61.5918 68.5814 54.9922 75.0221 46.1671 75.0221V75.0228ZM27.3233 57.2924L12.1367 48.5465C7.76336 46.0018 4.8219 40.5956 4.8219 35.3482C4.8219 29.226 8.47938 23.74 14.1242 21.434V39.5619C14.1242 40.6753 14.6016 41.4704 15.5554 42.0268L35.433 53.5552L28.9133 57.2924C28.357 57.61 27.8796 57.61 27.3233 57.2924ZM26.4492 70.3318C17.4646 70.3318 10.8652 63.5735 10.8652 55.225C10.8652 54.5889 10.9449 53.9527 11.024 53.3166L26.6872 62.3809C27.641 62.9373 28.5956 62.9373 29.5494 62.3809L49.5061 50.8525V58.4059C49.5061 59.0421 49.2675 59.5193 48.7111 59.8369L33.5246 68.5829C31.4572 69.7755 28.9923 70.3318 26.4484 70.3318H26.4492ZM46.1671 79.793C55.7879 79.793 63.8178 72.9554 65.6472 63.8911C74.5521 61.5852 80.2768 53.2367 80.2768 44.7295C80.2768 39.1636 77.8918 33.7574 73.5982 29.8613C73.9957 28.1915 74.2343 26.5217 74.2343 24.8527C74.2343 13.4831 65.0111 4.97504 54.3567 4.97504C52.2105 4.97504 50.1431 5.2927 48.0757 6.00872C44.4973 2.51016 39.5677 0.284058 34.1614 0.284058C24.5408 0.284058 16.5108 7.12144 14.6814 16.1857C5.77654 18.4917 0.0518799 26.8402 0.0518799 35.3474C0.0518799 40.9133 2.43689 46.3194 6.73051 50.2155C6.33298 51.8854 6.09436 53.5552 6.09436 55.2243C6.09436 66.594 15.3176 75.1018 25.9718 75.1018C28.1182 75.1018 30.1856 74.7842 32.2529 74.0681C35.8305 77.5667 40.7601 79.793 46.1671 79.793Z" fill="white"/>
        </svg>
      )}
      <span>{name}</span>
    </span>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="leaderboard-list">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-block" style={{ height: '14px', width: '32px' }} />
          <div className="skeleton-block" style={{ height: '14px', width: '128px' }} />
          <div className="skeleton-block" style={{ height: '14px', width: '80px' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-block" style={{ height: '6px', maxWidth: '200px' }} />
          </div>
          <div className="skeleton-block" style={{ height: '14px', width: '32px' }} />
          <div className="skeleton-block" style={{ height: '24px', width: '40px' }} />
        </div>
      ))}
    </div>
  );
}
