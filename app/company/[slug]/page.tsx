import { getCompanyWithFallback } from '@/lib/scores';
import type { CheckResult } from '@/lib/scores';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import ScoreRing from './ScoreRing';
import CollapsiblePanel from './CollapsiblePanel';
import CopyButton from './CopyButton';
import CopyLinkBtn from './CopyLinkBtn';
import CategoryCheckGroups from './CategoryCheckGroups';
import AIFixPrompt from './AIFixPrompt';
import CTASection from '@/components/CTASection';
import SiteFooter from '@/components/SiteFooter';
import RerunButton from './RerunButton';
import MatrixBackground from '@/components/MatrixBackground';
import DotDivider from '@/components/DotDivider';
import '../company.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const company = await getCompanyWithFallback(params.slug);
  if (!company) return {};
  return {
    title: `${company.name} — Agent Score`,
    description: `${company.name} scored ${company.score}/100 (${company.grade}) on Agent Score — ${company.checks.pass} of ${company.checks.total} agent-readiness checks passed.`,
    openGraph: {
      title: `${company.name} scored ${company.score} (${company.grade}) on Agent Score`,
      description: `${company.checks.pass}/${company.checks.total} agent-readiness checks passed. See how ${company.name}'s docs serve AI coding agents.`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${company.name} scored ${company.score} (${company.grade}) on Agent Score`,
      description: `${company.checks.pass}/${company.checks.total} checks passed.`,
      creator: '@buildwithfern',
    },
  };
}

function buildCategoriesFromResults(results: CheckResult[]) {
  const categoryMap = new Map<string, { pass: number; warn: number; fail: number; skip: number; total: number }>();
  for (const r of results) {
    const cat = categoryMap.get(r.category) || { pass: 0, warn: 0, fail: 0, skip: 0, total: 0 };
    cat.total++;
    if (r.status === 'pass') cat.pass++;
    else if (r.status === 'warn') cat.warn++;
    else if (r.status === 'fail' || r.status === 'error') cat.fail++;
    else cat.skip++;
    categoryMap.set(r.category, cat);
  }
  return Array.from(categoryMap.entries()).map(([name, data]) => {
    const score = data.total > 0 ? Math.round(((data.pass + data.warn * 0.5) / data.total) * 100) : 0;
    return {
      name,
      score: Math.min(100, score),
      meta: `${data.pass}/${data.total} pass${data.warn > 0 ? `, ${data.warn} warn` : ''}`,
    };
  });
}

function buildSyntheticResults(checks: { total: number; pass: number; warn: number; fail: number }): CheckResult[] {
  const { pass, warn, fail } = checks;
  const defs: Array<{ id: string; category: string; passMsg: string; warnMsg?: string; failMsg: string }> = [
    { id: 'llms-txt-exists', category: 'llms.txt', passMsg: 'llms.txt found at /llms.txt', warnMsg: 'llms.txt found but at non-standard path', failMsg: 'No llms.txt found' },
    { id: 'llms-txt-valid', category: 'llms.txt', passMsg: 'Valid structure following llmstxt.org spec', failMsg: 'Invalid llms.txt structure' },
    { id: 'llms-txt-size', category: 'llms.txt', passMsg: 'File size within recommended limits', warnMsg: 'File size approaching the 50,000 character limit', failMsg: 'File exceeds 50,000 character limit' },
    { id: 'llms-txt-links-resolve', category: 'llms.txt', passMsg: 'All linked URLs return 200', failMsg: 'Some linked URLs return errors' },
    { id: 'llms-txt-links-markdown', category: 'llms.txt', passMsg: 'Linked URLs serve markdown content', failMsg: 'Linked URLs do not serve markdown' },
    { id: 'markdown-url-support', category: 'Markdown Availability', passMsg: 'Pages serve markdown at .md URLs', failMsg: 'No .md URL support detected' },
    { id: 'content-negotiation', category: 'Markdown Availability', passMsg: 'Server responds to Accept: text/markdown', warnMsg: 'Partial content negotiation support', failMsg: 'No content negotiation support' },
    { id: 'page-size-markdown', category: 'Page Size', passMsg: 'Markdown content within size limits', warnMsg: 'Markdown pages are large but within limits', failMsg: 'Markdown pages exceed size limits' },
    { id: 'page-size-html', category: 'Page Size', passMsg: 'HTML pages within recommended size', warnMsg: 'HTML pages have significant boilerplate', failMsg: 'HTML pages exceed size limits' },
    { id: 'content-start-position', category: 'Page Size', passMsg: 'Content begins near page start', warnMsg: 'Significant nav/header before content', failMsg: 'Content start position too far into document' },
    { id: 'tab-content-visible', category: 'Content Structure', passMsg: 'Tab content is accessible without JavaScript', warnMsg: 'Tab content requires interaction to reveal', failMsg: 'Tab content is hidden and inaccessible to agents' },
    { id: 'heading-hierarchy', category: 'Content Structure', passMsg: 'Heading hierarchy is well-structured', warnMsg: 'Some heading levels are skipped', failMsg: 'No meaningful heading hierarchy detected' },
    { id: 'code-fences', category: 'Content Structure', passMsg: 'Code blocks use fenced markdown syntax', warnMsg: 'Some code blocks lack language annotations', failMsg: 'Code blocks are not fenced or lack markdown formatting' },
    { id: 'no-redirect-chains', category: 'URL Stability', passMsg: 'URLs resolve without redirect chains', warnMsg: 'Some URLs redirect once before resolving', failMsg: 'Long redirect chains detected on doc URLs' },
    { id: 'no-auth-walls', category: 'URL Stability', passMsg: 'URLs resolve without authentication prompts', failMsg: 'Auth walls block access to documentation URLs' },
    { id: 'llms-txt-discoverable', category: 'Agent Discoverability', passMsg: 'llms.txt is linked from the main docs page', warnMsg: 'llms.txt exists but is not linked from docs', failMsg: 'No mechanism for agents to discover llms.txt' },
    { id: 'last-modified-header', category: 'Observability', passMsg: 'Pages return Last-Modified headers', warnMsg: 'Some pages missing Last-Modified header', failMsg: 'No Last-Modified headers returned' },
    { id: 'sitemap-exists', category: 'Observability', passMsg: 'sitemap.xml found and accessible', warnMsg: 'Sitemap found but missing some doc pages', failMsg: 'No sitemap.xml found' },
    { id: 'changelog-available', category: 'Observability', passMsg: 'Changelog or release notes page detected', warnMsg: 'Changelog exists but is not machine-readable', failMsg: 'No changelog or release notes detected' },
    { id: 'docs-publicly-accessible', category: 'Authentication', passMsg: 'Documentation is publicly accessible without login', failMsg: 'Documentation requires authentication to access' },
    { id: 'api-ref-accessible', category: 'Authentication', passMsg: 'API reference pages are publicly accessible', warnMsg: 'Some API reference pages require authentication', failMsg: 'API reference requires login to access' },
  ];

  let passRem = pass, warnRem = warn, failRem = fail;
  const results: CheckResult[] = [];

  for (const def of defs) {
    let status: CheckResult['status'];
    let message: string;

    if (passRem > 0) { status = 'pass'; message = def.passMsg; passRem--; }
    else if (warnRem > 0 && def.warnMsg) { status = 'warn'; message = def.warnMsg; warnRem--; }
    else if (warnRem > 0) { status = 'warn'; message = def.warnMsg ?? def.failMsg; warnRem--; }
    else if (failRem > 0) { status = 'fail'; message = def.failMsg; failRem--; }
    else { status = 'skip'; message = 'Check skipped'; }

    results.push({ id: def.id, category: def.category, status, message });
  }

  return results;
}

function gradeColor(score: number): string {
  if (score >= 80) return '#00e87b';
  if (score >= 65) return '#a8e63d';
  if (score >= 45) return '#ffaa00';
  return '#ff4444';
}

function buildSummary(company: { name: string; score: number; grade: string; checks: { total: number; pass: number; warn: number; fail: number } }): string {
  const { name, score, grade, checks } = company;
  const passRate = checks.total > 0 ? Math.round((checks.pass / checks.total) * 100) : 0;
  const issueCount = checks.warn + checks.fail;

  if (score >= 90) {
    return `${name} scores ${score}/100 (Grade ${grade}), placing it among the most AI-agent-ready documentation sites evaluated. It passes ${checks.pass} of ${checks.total} checks (${passRate}%), demonstrating strong support for AI coding agents. ${issueCount > 0 ? `${issueCount} item${issueCount > 1 ? 's' : ''} require attention to reach a perfect score.` : 'All critical checks pass.'}`;
  } else if (score >= 70) {
    return `${name} scores ${score}/100 (Grade ${grade}), passing ${checks.pass} of ${checks.total} checks (${passRate}%). The documentation is broadly accessible to AI agents but has ${issueCount} area${issueCount !== 1 ? 's' : ''} that could be improved to better serve automated tooling.`;
  } else if (score >= 50) {
    return `${name} scores ${score}/100 (Grade ${grade}), passing ${checks.pass} of ${checks.total} checks (${passRate}%). There are ${issueCount} issue${issueCount !== 1 ? 's' : ''} limiting AI agent readiness. Addressing llms.txt support and markdown availability would provide the most improvement.`;
  } else {
    return `${name} scores ${score}/100 (Grade ${grade}), passing only ${checks.pass} of ${checks.total} checks (${passRate}%). Significant work is needed to make these docs accessible to AI coding agents. Priority improvements include adding llms.txt, enabling markdown endpoints, and reducing page complexity.`;
  }
}

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const company = await getCompanyWithFallback(params.slug);
  if (!company) notFound();

  const checkResults =
    company.results && company.results.length > 0
      ? company.results
      : buildSyntheticResults(company.checks);

  const categories = buildCategoriesFromResults(checkResults);
  const summary = buildSummary(company);

  const domain = company.docsUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const pageUrl = `https://agentscore.buildwithfern.com/company/${company.slug}`;
  const color = gradeColor(company.score);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${company.name} scored ${company.score}/100 on the Agent Score leaderboard for AI-ready documentation.`
  )}&url=${encodeURIComponent(pageUrl)}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;

  return (
    <main className="co-page">

      {/* Hero */}
      <section className="co-hero-container">
        <div className="co-hero">
          <div className="co-hero-left">
            {/* Breadcrumb */}
            <div className="co-breadcrumb">
              <Link href="/#leaderboard">Leaderboard</Link>
              <span className="co-breadcrumb-sep">/</span>
              <span className="co-breadcrumb-current">{company.name}</span>
            </div>

            {/* Main content */}
            <div className="co-hero-content">
              <h1 className="co-company-name">{company.name}</h1>
              <a href={company.docsUrl} target="_blank" rel="noopener noreferrer" className="co-domain-link">
                {domain}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 1.5H2a.5.5 0 00-.5.5v8a.5.5 0 00.5.5h8a.5.5 0 00.5-.5V7.5" />
                  <path d="M7 1.5h3.5V5" />
                  <path d="M5 7L10.5 1.5" />
                </svg>
              </a>
              <div className="co-score-row">
                <ScoreRing score={company.score} grade={company.grade} />
                <div className="co-score-row-info">
                  <div className="co-grade-badge" style={{ color }}>Grade {company.grade}</div>
                  <div className="co-last-checked">
                    Last checked: {new Date(company.scoredAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {' · '}
                    <RerunButton url={company.docsUrl} slug={company.slug} />
                  </div>
                </div>
              </div>
            </div>

            {/* Share bar */}
            <div className="co-share-section">
              <div className="co-share-row">
                <span className="co-share-label">Share on</span>
                <div className="co-share-icons">
                  <a href={twitterUrl} className="co-share-btn" target="_blank" rel="noopener noreferrer" aria-label="Share on X">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href={linkedinUrl} className="co-share-btn" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <CopyLinkBtn url={pageUrl} />
                </div>
              </div>
            </div>
          </div>
          <div className="co-hero-right">
            <MatrixBackground />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="co-stats-bar">
        <div className="co-stat">
          <span className="co-stat-key">Category</span>
          <span className="co-stat-val">{company.category}</span>
        </div>
        <div className="co-stat">
          <span className="co-stat-key">Checks passed</span>
          <span className="co-stat-val" style={{ color: '#00e87b' }}>{company.checks.pass}/{company.checks.total}</span>
        </div>
        <div className="co-stat">
          <span className="co-stat-key">Warnings</span>
          <span className="co-stat-val" style={{ color: '#ffcc00' }}>{company.checks.warn}</span>
        </div>
        <div className="co-stat">
          <span className="co-stat-key">Failed</span>
          <span className="co-stat-val" style={{ color: '#ff4444' }}>{company.checks.fail}</span>
        </div>
      </section>

      {/* Side-by-side collapsible panels */}
      <section className="co-panels-row">
        <CollapsiblePanel title="Executive Summary" copySlot={<CopyButton text={summary} />}>
          <p className="co-panel-text">{summary}</p>
        </CollapsiblePanel>
        <AIFixPrompt
          name={company.name}
          url={company.docsUrl}
          score={company.score}
          grade={company.grade}
          results={checkResults}
        />
      </section>

      <DotDivider />

      {/* Check results */}
      <section className="co-checks-section">
        <div className="why-header">
          <span className="why-label">CHECK RESULTS</span>
          <h2 className="why-heading">How your docs scored</h2>
        </div>
        <CategoryCheckGroups categories={categories} results={checkResults} />
      </section>

      <CTASection />
      <SiteFooter />
    </main>
  );
}
