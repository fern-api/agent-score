import Image from 'next/image';
import { getLeaderboard } from '@/lib/scores';
import Leaderboard from './leaderboard';
import ScoreChecker from '@/components/ScoreChecker';
import MatrixBackground from '@/components/MatrixBackground';
import CTASection from '@/components/CTASection';
import SiteFooter from '@/components/SiteFooter';
import DotDivider from '@/components/DotDivider';
import PingPongVideo from '@/components/PingPongVideo';

export const dynamic = 'force-dynamic';

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
    checks: '4 checks',
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

const testimonials = [
  {
    name: 'Zeno Rocha',
    role: 'CEO, Resend',
    avatar: '/social/zeno-social.png',
    companyLogo: '/social/resend-social.svg',
    company: 'Resend',
    docsUrl: 'https://resend.com/docs',
    companySlug: 'resend',
    quote: 'Making our docs agent-ready was one of the best investments we made. When Cursor and Claude can read your API reference cleanly, developers ship integrations without ever opening a browser tab.',
  },
  // {
  //   name: 'Alex Atallah',
  //   role: 'CEO, OpenRouter',
  //   avatar: '/social/alex-social.png',
  //   companyLogo: '/social/openrouter-social.svg',
  //   company: 'OpenRouter',
  //   docsUrl: 'https://openrouter.ai/docs',
  //   quote: 'At OpenRouter we see firsthand how much traffic comes through AI coding agents. If your llms.txt isn\'t structured right, you\'re invisible to your fastest-growing user segment.',
  // },
  {
    name: 'Balaji Raghavan',
    role: 'Head of Engineering, Postman',
    avatar: '/social/balaji-social.png',
    companyLogo: '/social/postman-social.svg',
    company: 'Postman',
    docsUrl: 'https://learning.postman.com/docs',
    companySlug: 'postman',
    quote: 'Postman\'s agent mode, like all agents, relies on LLM-ready docs to use APIs accurately with less hallucination. Agent Score gives you a concrete target to close that gap.',
  },
  {
    name: 'Dave Nunez',
    role: 'CEO, Falconer',
    avatar: '/social/dave-social.png',
    companyLogo: '/social/falconer-social.svg',
    company: 'Falconer',
    docsUrl: 'https://falconer.ai',
    companySlug: 'falconer',
    quote: 'We spend a lot of time on our content, but it doesn\'t matter if agents can\'t discover it. Agent Score is a beautifully designed tool that tells us how we suck.',
  },
  // {
  //   name: 'Paul Asjes',
  //   role: 'DevEx, ElevenLabs',
  //   avatar: '/social/paul-social.png',
  //   companyLogo: '/social/elevenlabs-social.svg',
  //   company: 'ElevenLabs',
  //   docsUrl: 'https://elevenlabs.io/docs',
  //   quote: 'The developers who find us through AI agents convert at a higher rate than any other channel. Agent-readable docs aren\'t a nice-to-have. They\'re a growth lever.',
  // },
  // {
  //   name: 'Gil Feig',
  //   role: 'CEO, Merge',
  //   avatar: '/social/gil-social.png',
  //   companyLogo: '/social/merge-social.svg',
  //   company: 'Merge',
  //   docsUrl: 'https://docs.merge.dev',
  //   quote: 'We treat Agent Score like Lighthouse: a real quality signal that drives engineering work. The companies winning in the agentic era are the ones whose docs just work for AI.',
  // },
];

// Pixel art for the Why section ──────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const companies = await getLeaderboard();
  const categories = Array.from(new Set(companies.map((c) => c.category)))
    .sort((a, b) => {
      if (a === 'Other') return 1;
      if (b === 'Other') return -1;
      return a.localeCompare(b);
    });

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
              <a className="agent-badge" href="https://docs.cursor.com" target="_blank" rel="noopener noreferrer"><img src="/cursor-simple-logo.svg" alt="Cursor" style={{width:'12px',height:'14px',display:'block',flexShrink:0}} /> Cursor</a>,{' '}
              <a className="agent-badge" href="https://docs.anthropic.com" target="_blank" rel="noopener noreferrer"><img src="/claude-simple-logo.svg" alt="Claude" style={{width:'14px',height:'14px',display:'block',flexShrink:0}} /> Claude</a> and{' '}
              <a className="agent-badge" href="https://platform.openai.com/docs" target="_blank" rel="noopener noreferrer"><img src="/openai-simple-logo.svg" alt="ChatGPT" style={{width:'14px',height:'14px',display:'block',flexShrink:0}} /> ChatGPT</a>.
            </p>
            <p className="hero-attribution">
              <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}>
                Developed by
                <a href="https://buildwithfern.com" target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center'}}>
                  <Image src="/fern-labs-dark.svg" alt="Fern Labs" width={77} height={14} className="fern-logo-dark" style={{ marginBottom: '3px' }} />
                </a>
              </span>
              <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}>
                in partnership with
                <a href="https://github.com/dacharyc" target="_blank" rel="noreferrer">Dachary Carey.</a>
              </span>
            </p>
          </div>
          <div className="hero-form-strip" id="hero-score-btn">
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

      <DotDivider />

      {/* WHY */}
      <section className="why-section" id="why-it-matters">
        <div className="why-header">
          <span className="why-label">WHY IT MATTERS</span>
          <h2 className="why-heading">
            Your docs have a new reader:{' '}
            <span className="accent">AI agents</span>
          </h2>
        </div>

        <div className="why-grid">
          {/* Row 1 */}
          <div className="why-cell why-cell-img">
            <video autoPlay muted playsInline loop className="why-cell-video"><source src="/invisible-audience.mp4" type="video/mp4" /></video>
          </div>
          <div className="why-cell why-cell-text">
            <div className="why-cell-title">The invisible audience</div>
            <p className="why-cell-body">
              AI coding agents are reading your API docs millions of times a day. If your docs
              aren&apos;t optimized for these agents, you&apos;re invisible to the fastest-growing
              segment of your user base.
            </p>
          </div>
          <div className="why-cell why-cell-img">
            <video autoPlay muted playsInline loop className="why-cell-video"><source src="/lighthouse.mp4" type="video/mp4" /></video>
          </div>
          <div className="why-cell why-cell-text">
            <div className="why-cell-title">Lighthouse for AI agents</div>
            <p className="why-cell-body">
              Agent Score is the first industry benchmark for AI-agent readiness. Think Lighthouse,
              but for how effectively AI agents can discover, parse, and use your documentation.
              0 to 100, 22 checks, 7 categories.
            </p>
          </div>

          {/* Row 2 */}
          <div className="why-cell why-cell-img">
            <video autoPlay muted playsInline loop className="why-cell-video"><source src="/agent-readiness.mp4" type="video/mp4" /></video>
          </div>
          <div className="why-cell why-cell-text">
            <div className="why-cell-title">Agent readiness = competitive moat</div>
            <p className="why-cell-body">
              API platforms with higher agent readability are already seeing outsized adoption.
              Agent readiness isn&apos;t a nice-to-have. It&apos;s the new SEO. 73% of top API
              docs still lack an llms.txt.
            </p>
          </div>
          <div className="why-cell why-cell-img">
            <PingPongVideo src="/open-source.mp4" className="why-cell-video" />
          </div>
          <div className="why-cell why-cell-text">
            <div className="why-cell-title">Open source, no black boxes</div>
            <p className="why-cell-body">
              Built on the open-source{' '}
              <a href="https://github.com/agent-ecosystem/agent-docs-spec" target="_blank" rel="noopener">
                Agent-Friendly Docs Spec
              </a>{' '}
              with no gatekeeping, no black boxes. Every check is transparent and community-driven, by{' '}
              <a href="https://github.com/dacharyc" target="_blank" rel="noreferrer">Dachary Carey</a>.
            </p>
          </div>
        </div>
      </section>

      <DotDivider />

      {/* SOCIAL PROOF */}
      <section className="sp-section" id="humans">
        <div className="sp-top-row">
          <div className="sp-header">
            <span className="why-label">SOCIAL PROOF</span>
            <h2 className="why-heading">
              Here&apos;s what <span className="accent">humans</span> are saying about it
            </h2>
          </div>
          <div className="sp-featured">
            <div className="sp-featured-text-wrap">
              <div className="sp-quote-mark-wrap">
                <svg className="sp-quote-mark" width="24" height="20" viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 9.5H8V19H1V9.5Z"/>
                  <path d="M1 9.5C1 5 3.5 2 8 1"/>
                  <path d="M13 9.5H20V19H13V9.5Z"/>
                  <path d="M13 9.5C13 5 15.5 2 20 1"/>
                </svg>
                <div className="sp-quote-gray-bar"></div>
              </div>
              <p className="sp-featured-text">
                My agent couldn&apos;t use the docs and I started digging into why. The result is AFDocs, a standard that codifies what agents need to help developers complete their tasks. Agent Score makes that standard measurable.
              </p>
            </div>
            <div className="sp-author">
              <div className="sp-avatar-ring"><img src="/social/dachary-social.png" alt="Dachary Carey" className="sp-avatar sp-avatar-img" /></div>
              <div>
                <div className="sp-author-name">Dachary Carey</div>
                <div className="sp-author-role">Defined the AFDocs standard</div>
              </div>
            </div>
          </div>
        </div>
        <div className="sp-grid">
          {testimonials.map((t) => (
            <div key={t.name} className="sp-card">
              <div className="sp-author">
                {t.avatar && (
                  <div className="sp-avatar-ring"><img src={t.avatar} alt={t.name} className="sp-avatar sp-avatar-img" /></div>
                )}
                <div>
                  <div className="sp-author-name">{t.name}</div>
                  <div className="sp-author-role">{t.role}</div>
                </div>
              </div>
              <p className="sp-quote">{t.quote}</p>
              <a href={t.companySlug ? `/company/${t.companySlug}` : t.docsUrl} {...(!t.companySlug ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="sp-company-logo-link">
                <img src={t.companyLogo} alt={t.company} className="sp-company-logo" />
              </a>
            </div>
          ))}
        </div>
      </section>

      <DotDivider />

      {/* METHODOLOGY */}
      <section className="method-section" id="methodology">
        <div className="method-header">
          <h2 className="method-header-title">22 checks across 7 categories</h2>
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

      <DotDivider />

      <CTASection />
      <DotDivider />
      <SiteFooter />
    </main>
  );
}
