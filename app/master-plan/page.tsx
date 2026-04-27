import type { Metadata } from 'next';
import Image from 'next/image';
import TOC from './TOC';
import ViewToggle from './ViewToggle';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Master Plan — Agent Score by Fern',
  description:
    'The complete master plan for Agent Score by Fern — the definitive benchmark for agent-ready API documentation.',
};

export default function MasterPlanPage() {
  return (
    <>
      <div className="layout">
        <aside className="sidebar">
          <TOC />
        </aside>

        <main className="content">
          <h1>Agent Score by Fern &mdash; Master Plan</h1>

          <blockquote>
            <p>
              <strong>Mission:</strong> Make Fern the arbiter of agent-ready documentation &mdash; the
              way Scale AI&apos;s SEAL Leaderboard became the arbiter of model quality &mdash; while
              driving SEO, building authority, and generating leads for Fern&apos;s docs platform.
            </p>
          </blockquote>

          <ViewToggle />

          <div className="content-section" data-section="section-1">
          <hr />

          {/* SECTION 1 */}
          <h2 id="section-1">Executive Summary</h2>

          <p>
            AI coding agents (Cursor, Copilot, Claude Code, Windsurf) are now the primary consumers
            of API documentation. Most docs were built for humans, not machines.{' '}
            <strong>Agent Score by Fern</strong> is the first public benchmark that scores how
            agent-friendly documentation sites are &mdash; think Lighthouse for PageSpeed, but for
            agent-readiness.
          </p>

          <p>
            Built on the open-source{' '}
            <a href="https://github.com/agent-ecosystem/afdocs">afdocs CLI</a> (by Dachary Carey)
            and the{' '}
            <a href="https://agentdocsspec.com/">Agent-Friendly Documentation Spec</a>, it evaluates
            docs across <strong>21 checks in 8 categories</strong> and publishes a public leaderboard
            of 200+ API documentation sites.
          </p>

          <p>
            <strong>The flywheel:</strong> Companies check their score &rarr; discover their docs are
            agent-hostile &rarr; look for solutions &rarr; find that Fern is the platform
            purpose-built to fix it. Every company that checks their score is one CTA away from
            becoming a Fern lead.
          </p>

          <p>
            <strong>Year 1 investment:</strong> ~$10K&ndash;20K (targeted ads, content, community)
            <br />
            <strong>Year 1 target:</strong> 80K monthly organic visitors, 20K email list, 80+ new
            customers attributed to Agent Score
          </p>

          </div>

          <div className="content-section" data-section="section-2">
          <hr />

          {/* SECTION 2 */}
          <h2 id="section-2">Product Vision &amp; Positioning</h2>

          <h3>One-Line Pitch</h3>
          <p>
            Agent Score is the definitive public benchmark that rates how well API documentation
            serves AI coding agents &mdash; think Lighthouse for PageSpeed, but for agent-readiness.
          </p>

          <h3>Elevator Pitch (30 seconds)</h3>
          <p>
            AI coding agents are becoming the primary consumers of API documentation. But most docs
            were built for humans, not machines. Agent Score by Fern scores documentation sites on a
            0&ndash;100 scale across 21 checks &mdash; from llms.txt availability to markdown serving
            to context-window fit. We publish a public leaderboard of 200+ API docs sites, let anyone
            check their own score for free, and give teams a concrete roadmap to make their docs
            agent-ready. Companies with better scores get more agent traffic, which means more
            adoption.
          </p>

          <h3>Positioning Statement</h3>
          <p>
            For API platform teams and DevRel leaders who need to ensure their documentation works
            for AI coding agents, <strong>Agent Score by Fern</strong> is the industry-standard
            benchmark that objectively measures agent-readiness across 21 checks and 8 categories.
            Unlike ad-hoc manual testing, Agent Score provides automated, reproducible scoring backed
            by the Agent-Friendly Documentation Spec and powered by the open-source afdocs CLI. Fern
            &mdash; the company that builds documentation infrastructure for Square, ElevenLabs, and
            Webflow &mdash; is uniquely positioned to define what &ldquo;good&rdquo; looks like
            because they ship agent-friendly docs every day.
          </p>

          </div>

          <div className="content-section" data-section="section-3">
          <hr />

          {/* SECTION 3 */}
          <h2 id="section-3">Brand &amp; Messaging</h2>

          <h3>Name: Agent Score by Fern</h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Alternative</th>
                  <th>Pros</th>
                  <th>Cons</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Agent Score by Fern</td><td>Clear, descriptive, brand-linked</td><td>Slightly long</td></tr>
                <tr><td>AgentReady</td><td>Catchy</td><td>Misses the scoring/benchmark angle</td></tr>
                <tr><td>DocsScore</td><td>Simple</td><td>Too generic, misses the &ldquo;agent&rdquo; angle</td></tr>
                <tr><td>Agent Readiness Index</td><td>Sounds rigorous</td><td>Long, clinical</td></tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>Domain options:</strong> <code>agentscore.dev</code>,{' '}
            <code>agentscore.fern.dev</code>, <code>score.buildwithfern.com</code>
          </p>

          <h3>Taglines (Ranked)</h3>
          <ol>
            <li><strong>&ldquo;Is your documentation ready for the agent economy?&rdquo;</strong></li>
            <li><strong>&ldquo;The benchmark for agent-ready docs.&rdquo;</strong></li>
            <li><strong>&ldquo;21 checks. 8 categories. One score.&rdquo;</strong></li>
            <li><strong>&ldquo;Agents are reading your docs. Are your docs ready?&rdquo;</strong></li>
            <li><strong>&ldquo;The Lighthouse score for your documentation.&rdquo;</strong></li>
            <li>&ldquo;Don&rsquo;t just document for developers. Document for their agents.&rdquo;</li>
            <li>&ldquo;If agents can&rsquo;t read your docs, developers can&rsquo;t use your API.&rdquo;</li>
            <li>&ldquo;Score your docs. Fix what matters. Win agent integrations.&rdquo;</li>
            <li>&ldquo;Your docs have a new audience. Score how well you serve them.&rdquo;</li>
            <li>&ldquo;The first public benchmark for AI-agent-friendly documentation.&rdquo;</li>
          </ol>

          <h3>Core Messaging Pillars</h3>

          <h4>Pillar 1: &ldquo;Agents are the new developers&rdquo;</h4>
          <p>
            AI coding agents are now the primary consumers of API documentation. When a developer
            asks their agent to integrate Stripe, the agent reads Stripe&rsquo;s docs &mdash; not the
            developer. If those docs are agent-hostile, the agent fails, and the developer moves to a
            competitor.
          </p>

          <h4>Pillar 2: &ldquo;What gets measured gets improved&rdquo;</h4>
          <p>
            There is currently no standard for measuring agent-friendliness of documentation. No
            benchmark. No public score. Agent Score creates the measurement layer the industry needs
            &mdash; turning an invisible problem into a visible, actionable number.
          </p>

          <h4>Pillar 3: &ldquo;Agent readiness is a competitive advantage&rdquo;</h4>
          <p>
            Companies whose docs score high will win disproportionate integration traffic. This is
            the new SEO: instead of optimizing for Google&rsquo;s crawlers, you optimize for coding
            agents.
          </p>

          <h4>Pillar 4: &ldquo;Open standard, no gatekeeping&rdquo;</h4>
          <p>
            Built on an open spec, using an open-source tool. Anyone can run the checks. The
            methodology is transparent. The scores are public. This is about raising the bar for the
            entire ecosystem.
          </p>

          <h3>Tone of Voice</h3>
          <p>
            <strong>Authoritative but generous.</strong> The friend who happens to be an expert and
            tells you what you need to hear without making you feel stupid.
          </p>
          <ul>
            <li><strong>Never punitive.</strong> A low score is a &ldquo;growth opportunity,&rdquo; not a failure.</li>
            <li><strong>Data-first.</strong> Lead with numbers. &ldquo;73% of the top 200 API docs sites lack an llms.txt file&rdquo; &gt; &ldquo;most docs aren&rsquo;t ready.&rdquo;</li>
            <li><strong>Developer-native.</strong> Use terms the audience uses: &ldquo;context window,&rdquo; &ldquo;token budget,&rdquo; &ldquo;content negotiation.&rdquo;</li>
            <li><strong>Respectful.</strong> Acknowledge these standards are new. Nobody could have scored perfectly last year because the spec didn&rsquo;t exist.</li>
            <li><strong>Slightly opinionated.</strong> &ldquo;llms.txt should be as standard as robots.txt&rdquo; is a stance worth taking.</li>
          </ul>

          </div>

          <div className="content-section" data-section="section-4">
          <hr />

          {/* SECTION 4 */}
          <h2 id="section-4">User Personas</h2>

          <h3>Persona 1: DevRel Lead / Head of Documentation (&ldquo;Dana&rdquo;)</h3>
          <ul>
            <li><strong>Goal:</strong> Justify budget for docs improvements; benchmark against competitors</li>
            <li><strong>Motivation:</strong> &ldquo;Our Agent Score is 43. Stripe&rsquo;s is 87. Here&rsquo;s what we need to do.&rdquo;</li>
            <li><strong>Conversion path:</strong> &ldquo;Improve your score&rdquo; CTA &rarr; Fern Docs product</li>
          </ul>

          <h3>Persona 2: CTO / VP Engineering (&ldquo;Carlos&rdquo;)</h3>
          <ul>
            <li><strong>Goal:</strong> Ensure their API is discoverable by AI coding agents</li>
            <li><strong>Motivation:</strong> Competitive paranoia. If Stripe&rsquo;s docs work with Claude Code and theirs don&rsquo;t, developers choose Stripe.</li>
            <li><strong>Conversion path:</strong> Sees leaderboard on HN &rarr; checks where they rank &rarr; requests Fern demo</li>
          </ul>

          <h3>Persona 3: Individual Developer (&ldquo;Dev&rdquo;)</h3>
          <ul>
            <li><strong>Goal:</strong> Pick the API with the best agent compatibility for their project</li>
            <li><strong>Motivation:</strong> Wants to use Cursor/Claude Code with the API. If docs don&rsquo;t serve markdown or have llms.txt, the agent experience is terrible.</li>
            <li><strong>Conversion path:</strong> Generates backlinks, SEO, and social sharing</li>
          </ul>

          <h3>Persona 4: API Founder / PM (&ldquo;Priya&rdquo;)</h3>
          <ul>
            <li><strong>Goal:</strong> Build best-in-class docs from day one</li>
            <li><strong>Motivation:</strong> Uses Agent Score as a checklist during docs buildout; targets an A grade</li>
            <li><strong>Conversion path:</strong> Adopts Fern Docs to get automatic high scores out of the box</li>
          </ul>

          <h3>Persona 5: Investor / Analyst (&ldquo;Alex&rdquo;)</h3>
          <ul>
            <li><strong>Goal:</strong> Evaluate developer experience quality of portfolio companies</li>
            <li><strong>Motivation:</strong> Agent-readiness as a proxy for engineering quality</li>
            <li><strong>Conversion path:</strong> Recommends Fern to portfolio companies</li>
          </ul>

          </div>

          <div className="content-section" data-section="section-5">
          <hr />

          {/* SECTION 5 */}
          <h2 id="section-5">Scoring Methodology</h2>

          <h3>From 21 Pass/Fail Checks to a 0&ndash;100 Score</h3>

          <h4>Step 1: Point assignments (total = 100 points)</h4>

          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Category</th><th>Check</th><th>Max Pts</th><th>Rationale</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>llms.txt</strong></td><td>llms-txt-exists</td><td>10</td><td>Foundational &mdash; without this, agents have no index</td></tr>
                <tr><td></td><td>llms-txt-valid</td><td>5</td><td>Structure matters for parsing</td></tr>
                <tr><td></td><td>llms-txt-size</td><td>5</td><td>Truncation defeats the purpose</td></tr>
                <tr><td></td><td>llms-txt-links-resolve</td><td>5</td><td>Broken links = dead ends</td></tr>
                <tr><td></td><td>llms-txt-links-markdown</td><td>5</td><td>MD links are the whole point</td></tr>
                <tr><td><strong>Markdown</strong></td><td>markdown-url-support</td><td>10</td><td>Primary agent content delivery</td></tr>
                <tr><td></td><td>content-negotiation</td><td>5</td><td>Standards-based alternative</td></tr>
                <tr><td><strong>Page Size</strong></td><td>page-size-markdown</td><td>7</td><td>Truncation is #1 agent failure mode</td></tr>
                <tr><td></td><td>page-size-html</td><td>5</td><td>Fallback quality matters</td></tr>
                <tr><td></td><td>content-start-position</td><td>3</td><td>Boilerplate wastes context budget</td></tr>
                <tr><td><strong>Structure</strong></td><td>tabbed-content-serialization</td><td>3</td><td>Common bloated output cause</td></tr>
                <tr><td></td><td>section-header-quality</td><td>2</td><td>Agents need contextual headers</td></tr>
                <tr><td></td><td>markdown-code-fence-validity</td><td>3</td><td>Broken fences corrupt downstream content</td></tr>
                <tr><td><strong>URL Stability</strong></td><td>http-status-codes</td><td>4</td><td>Soft 404s silently mislead agents</td></tr>
                <tr><td></td><td>redirect-behavior</td><td>3</td><td>Cross-host redirects break workflows</td></tr>
                <tr><td><strong>Discoverability</strong></td><td>llms-txt-directive-html</td><td>2</td><td>Helps agents find index from HTML pages</td></tr>
                <tr><td></td><td>llms-txt-directive-md</td><td>1</td><td>Helps agents find index from markdown pages</td></tr>
                <tr><td><strong>Health</strong></td><td>llms-txt-coverage</td><td>4</td><td>Sitemap pages missing from llms.txt = invisible to agents</td></tr>
                <tr><td></td><td>markdown-content-parity</td><td>3</td><td>Divergent content = unreliable answers</td></tr>
                <tr><td></td><td>cache-header-hygiene</td><td>2</td><td>Enables timely updates</td></tr>
                <tr><td><strong>Auth</strong></td><td>auth-gate-detection</td><td>8</td><td>Gated docs are invisible to agents</td></tr>
                <tr><td></td><td>auth-alternative-access</td><td>5</td><td>Escape hatch for gated content</td></tr>
                <tr><td></td><td><strong>TOTAL</strong></td><td><strong>100</strong></td><td></td></tr>
              </tbody>
            </table>
          </div>

          <h4>Step 2: Score each check</h4>
          <ul>
            <li><strong>pass</strong> = 100% of max points</li>
            <li><strong>warn</strong> = 50% of max points</li>
            <li><strong>fail</strong> = 0% of max points</li>
            <li><strong>skip</strong> (not yet implemented) = excluded from denominator; normalized</li>
          </ul>

          <h4>Step 3: Normalization formula</h4>
          <pre><code>{`Raw Score = SUM(points earned for non-skipped checks)
Max Possible = SUM(max points for non-skipped checks)
Final Score = ROUND((Raw Score / Max Possible) × 100)`}</code></pre>
          <p>
            This is critical for fairness during v0.x when 7 checks return <code>skip</code>.
            Category sub-scores use the same formula per-category.
          </p>

          <h3>Letter Grade Tiers</h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Grade</th><th>Score</th><th>Label</th><th>Color</th></tr>
              </thead>
              <tbody>
                <tr><td>A+</td><td>95&ndash;100</td><td>Exceptional</td><td>Dark green</td></tr>
                <tr><td>A</td><td>85&ndash;94</td><td>Excellent</td><td>Green</td></tr>
                <tr><td>B</td><td>70&ndash;84</td><td>Good</td><td>Light green</td></tr>
                <tr><td>C</td><td>50&ndash;69</td><td>Fair</td><td>Yellow</td></tr>
                <tr><td>D</td><td>30&ndash;49</td><td>Poor</td><td>Orange</td></tr>
                <tr><td>F</td><td>0&ndash;29</td><td>Failing</td><td>Red</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Edge Cases</h3>
          <ul>
            <li><strong>All checks skip in a category:</strong> Category score = &ldquo;N/A&rdquo;</li>
            <li><strong>Site unreachable:</strong> Score = 0, Grade = F, with note</li>
            <li><strong>New checks added:</strong> All sites re-scanned simultaneously; normalization ensures comparability</li>
            <li><strong>Methodology versioned:</strong> &ldquo;Methodology v1.0, effective March 2026&rdquo; with public changelog</li>
          </ul>

          <h3>Transparency</h3>
          <p>
            Full methodology page on the site explaining weights, formula, grade thresholds, with
            links to the Agent-Friendly Documentation Spec and the afdocs repo.
          </p>

          </div>

          <div className="content-section" data-section="section-6">
          <hr />

          {/* SECTION 6 */}
          <h2 id="section-6">Feature Roadmap</h2>

          <h3>MVP (4&ndash;6 weeks to launch)</h3>

          <h4>Public Leaderboard</h4>
          <ul>
            <li>Pre-seeded with 200+ API documentation sites, scored and ranked</li>
            <li>Sortable table: rank, company, score (0&ndash;100), letter grade, category breakdown</li>
            <li>Filterable by industry (Payments, AI/ML, Infrastructure, Communication, etc.) and grade tier</li>
            <li>Search by company name</li>
          </ul>

          <h4>Individual Company Score Pages (SEO engine)</h4>
          <ul>
            <li>Dedicated URL per company: <code>/agentscore/stripe</code>, <code>/agentscore/twilio</code></li>
            <li>Overall score + letter grade + category-by-category breakdown with pass/fail/warn per check</li>
            <li>Plain-English explanation of each result (&ldquo;Your llms.txt is 142K chars &mdash; agents will truncate this&rdquo;)</li>
            <li>&ldquo;How to improve&rdquo; recommendations for each failing check</li>
            <li>Social sharing meta tags &mdash; score card looks great shared on Twitter/LinkedIn</li>
            <li>&ldquo;Last checked&rdquo; timestamp</li>
          </ul>

          <h4>Free Score Checker</h4>
          <ul>
            <li>Input: &ldquo;Enter your docs URL&rdquo;</li>
            <li>Runs afdocs against the URL in near-real-time via queue</li>
            <li>Returns same score page format</li>
            <li>Email capture: &ldquo;Get notified when your score changes&rdquo;</li>
          </ul>

          <h3>V2 (2&ndash;3 months post-launch)</h3>

          <h4>Badges and Seals</h4>
          <ul>
            <li>Embeddable SVG/PNG: &ldquo;Agent Score: A&rdquo; with Fern branding</li>
            <li>Dynamic badge (like shields.io) that updates on re-scan</li>
            <li>&ldquo;Certified Agent-Ready&rdquo; seal for A-tier sites</li>
            <li>Every embed = a backlink to Agent Score</li>
          </ul>

          <h4>Historical Tracking</h4>
          <ul>
            <li>Score-over-time chart on each company page</li>
            <li>Delta indicators on leaderboard (trending arrows)</li>
          </ul>

          <h4>API Access</h4>
          <ul>
            <li><code>GET /api/v1/score?url=docs.stripe.com</code> &mdash; JSON response</li>
            <li>Rate-limited free tier (100 req/day), authenticated tier for higher limits</li>
          </ul>

          <h4>CI/CD Integration</h4>
          <ul>
            <li>GitHub Action: <code>fern/agent-score-check@v1</code> &mdash; runs on PR, fails if score drops</li>
            <li>Outputs score as PR comment</li>
          </ul>

          <h3>V3 (6&ndash;12 months post-launch)</h3>

          <h4>Paid Tier: Agent Score Pro ($99&ndash;299/month)</h4>
          <ul>
            <li>Daily scans instead of weekly</li>
            <li>Private scores for staging/pre-production URLs</li>
            <li>Detailed remediation reports with prioritized fix list</li>
            <li>Slack/email alerts on regressions</li>
            <li>Industry benchmark reports</li>
          </ul>

          <h4>Community Features</h4>
          <ul>
            <li>&ldquo;Submit a site&rdquo; &mdash; anyone can request additions</li>
            <li>Annual &ldquo;State of Agent-Friendly Documentation&rdquo; report</li>
          </ul>

          </div>

          <div className="content-section" data-section="section-7">
          <hr />

          {/* SECTION 7 */}
          <h2 id="section-7">Leaderboard Design</h2>

          <h3>Table Structure</h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Rank</th><th>Company</th><th>Score</th><th>Grade</th><th>llms.txt</th><th>Markdown</th><th>Size</th><th>Structure</th><th>URLs</th><th>Auth</th></tr>
              </thead>
              <tbody>
                <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Data rows populated from scoring pipeline</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Visual Design Notes</h3>
          <ul>
            <li>Clean, minimal, consistent with Fern brand</li>
            <li>Each row clickable &rarr; detailed score page</li>
            <li>Top 3 companies: gold/silver/bronze highlight</li>
            <li>CTA in header and footer: &ldquo;Your docs aren&rsquo;t listed? Check your score now&rdquo;</li>
          </ul>

          </div>

          <div className="content-section" data-section="section-8">
          <hr />

          {/* SECTION 8 */}
          <h2 id="section-8">SEO Strategy</h2>

          <h3>Keyword Targets</h3>

          <h4>Head Terms (long-term targets)</h4>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Keyword</th><th>Est. Monthly Volume</th><th>Difficulty</th></tr></thead>
              <tbody>
                <tr><td>llms.txt</td><td>8,000&ndash;12,000</td><td>Medium</td></tr>
                <tr><td>API documentation best practices</td><td>3,500&ndash;5,000</td><td>High</td></tr>
                <tr><td>AI-ready documentation</td><td>1,500&ndash;2,500</td><td>Low-Medium</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Page Architecture</h3>

          <pre><code>{`agentscore.dev/
├── /leaderboard                        (main leaderboard)
├── /leaderboard/payments               (category pages)
├── /agentscore/stripe                  (200+ company pages)
├── /compare/stripe-vs-twilio           (comparison pages)
├── /check                              (free tool)
├── /methodology                        (scoring explanation)
└── /blog/                              (content marketing)`}</code></pre>

          <p>
            <strong>Total pages at launch: ~250&ndash;300</strong> (200+ company pages, 10&ndash;15
            category pages, 20&ndash;30 comparison pages, 8 methodology pages, blog posts)
          </p>

          </div>

          <div className="content-section" data-section="section-9">
          <hr />

          {/* SECTION 9 */}
          <h2 id="section-9">Launch Strategy</h2>

          <h3>Pre-Launch (Weeks 1&ndash;2)</h3>

          <h4>Seed the leaderboard:</h4>
          <ul>
            <li>Run afdocs against 200+ documentation sites</li>
            <li>Curate results, verify edge cases, fix scoring bugs</li>
            <li>Ensure Fern customers score well (validates the &ldquo;Fern helps&rdquo; narrative)</li>
          </ul>

          <h3>Launch Day (Week 3)</h3>

          <div className="table-wrap">
            <table>
              <thead><tr><th>Time (PT)</th><th>Channel</th><th>Action</th></tr></thead>
              <tbody>
                <tr><td>6:00 AM</td><td>Hacker News</td><td>&ldquo;Show HN: Agent Score &mdash; We scored 200+ docs sites on agent-friendliness&rdquo;</td></tr>
                <tr><td>8:00 AM</td><td>Twitter/X</td><td>10-tweet data thread</td></tr>
                <tr><td>9:00 AM</td><td>LinkedIn</td><td>Business-framed posts from Fern company page + founders</td></tr>
                <tr><td>12:01 AM</td><td>Product Hunt</td><td>Launch in Developer Tools category</td></tr>
                <tr><td>9:00 AM</td><td>Email</td><td>Blast to Fern&rsquo;s existing customer/prospect list</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Post-Launch (Weeks 3&ndash;4)</h3>

          <h4>Company-specific outreach:</h4>
          <ul>
            <li>High scorers (80+): &ldquo;Congratulations! Here&rsquo;s your badge to embed.&rdquo;</li>
            <li>Medium (50&ndash;79): &ldquo;Here are 3 specific improvements that could push you above 80.&rdquo;</li>
            <li>Low (&lt;50): &ldquo;We found opportunities to make your docs more agent-friendly.&rdquo;</li>
          </ul>

          </div>

          <div className="content-section" data-section="section-10">
          <hr />

          {/* SECTION 10 */}
          <h2 id="section-10">Viral Mechanics</h2>

          <h3>Shareable Score Badges (V2)</h3>
          <pre><code>{`[Agent Score: A+ (94/100)]  — green
[Agent Score: B  (72/100)]  — yellow
[Agent Score: D  (38/100)]  — red`}</code></pre>
          <ul>
            <li>Embed code (HTML, Markdown) on each company&rsquo;s score page</li>
            <li>Badges link back &rarr; free backlinks from high-authority doc sites</li>
          </ul>

          <h3>&ldquo;Check Your Docs&rdquo; Tool as Lead Magnet</h3>
          <ol>
            <li>Enter URL (no gate) &mdash; captures intent</li>
            <li>See score + high-level results (no gate) &mdash; creates desire</li>
            <li>&ldquo;Get detailed report with recommendations&rdquo; &mdash; email gate</li>
            <li>Retargeting pixel fires on all visitors</li>
          </ol>

          <h3>Recurring Reports</h3>
          <ul>
            <li><strong>Monthly:</strong> Re-scan all 200+ companies, publish &ldquo;Agent Score Monthly Update&rdquo; with biggest movers</li>
            <li><strong>Quarterly:</strong> Full &ldquo;State of Agent-Ready Docs&rdquo; report with trends, industry breakdowns</li>
            <li><strong>Annually:</strong> Comprehensive report designed for maximum PR value</li>
          </ul>

          </div>

          <div className="content-section" data-section="section-11">
          <hr />

          {/* SECTION 11 */}
          <h2 id="section-11">Content Marketing Plan</h2>

          <h3>Tier 1: Launch Content</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Content</th><th>Format</th><th>Distribution</th></tr></thead>
              <tbody>
                <tr><td>&ldquo;Introducing Agent Score&rdquo;</td><td>Blog post</td><td>Fern blog, HN, Twitter, LinkedIn</td></tr>
                <tr><td>&ldquo;We Scored 200 API Docs Sites&rdquo;</td><td>Video (2&ndash;3 min)</td><td>YouTube, embedded in blog</td></tr>
                <tr><td>Launch thread</td><td>10-tweet thread</td><td>Twitter/X</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Tier 2: Evergreen / SEO Content (Months 1&ndash;3)</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Target Keyword</th><th>Format</th></tr></thead>
              <tbody>
                <tr><td>&ldquo;The State of Agent-Ready Documentation 2026&rdquo;</td><td>agent-ready documentation report</td><td>PDF + interactive web</td></tr>
                <tr><td>&ldquo;What is llms.txt? The Complete Guide&rdquo;</td><td>llms.txt</td><td>Long-form blog</td></tr>
                <tr><td>&ldquo;Why AI Agents Can&rsquo;t Read Your Docs&rdquo;</td><td>agent-friendly documentation</td><td>Blog post</td></tr>
                <tr><td>&ldquo;The 21 Checks Every Docs Site Needs&rdquo;</td><td>agent-ready docs checklist</td><td>Listicle + checklist PDF</td></tr>
              </tbody>
            </table>
          </div>

          </div>

          <div className="content-section" data-section="section-12">
          <hr />

          {/* SECTION 12 */}
          <h2 id="section-12">Social Media Strategy</h2>

          <h3>Twitter/X (3&ndash;5 tweets/week)</h3>
          <ul>
            <li><strong>&ldquo;Score of the week&rdquo;</strong> &mdash; spotlight one company&rsquo;s score</li>
            <li><strong>Data drops</strong> &mdash; &ldquo;Only 27% of top 200 docs sites have a valid llms.txt&rdquo;</li>
            <li><strong>Quick tips</strong> &mdash; &ldquo;Want to improve your Agent Score? Start here: add llms.txt&rdquo;</li>
            <li><strong>Community engagement</strong> &mdash; retweet/comment on agent-friendly docs discussions</li>
          </ul>

          <h3>LinkedIn (2&ndash;3 posts/week)</h3>
          <ul>
            <li>Thought leadership from founders</li>
            <li>Data insights from Agent Score</li>
            <li>Celebrate high-scoring companies publicly (they reshare)</li>
          </ul>

          </div>

          <div className="content-section" data-section="section-13">
          <hr />

          {/* SECTION 13 */}
          <h2 id="section-13">Paid Acquisition &amp; Budget</h2>

          <h3>Total Budget Recommendation</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Period</th><th>Monthly Budget</th></tr></thead>
              <tbody>
                <tr><td>Month 1 (Launch)</td><td>$2,000&ndash;3,000</td></tr>
                <tr><td>Months 2&ndash;6</td><td>$500&ndash;1,000/month</td></tr>
                <tr><td>Months 7&ndash;12</td><td>$500&ndash;1,000/month</td></tr>
                <tr><td><strong>Year 1 Total</strong></td><td><strong>$10,000&ndash;20,000</strong></td></tr>
              </tbody>
            </table>
          </div>

          </div>

          <div className="content-section" data-section="section-14">
          <hr />

          {/* SECTION 14 */}
          <h2 id="section-14">Conversion Funnel &amp; Lead Generation</h2>

          <h3>Funnel Architecture</h3>
          <pre><code>{`AWARENESS → ENGAGEMENT → ACTIVATION → CAPTURE → CONSIDERATION → CONVERSION
   |             |            |           |            |              |
 Organic     Leaderboard   "Check     Email for    "Improve      Demo
 search,     browsing,     your       detailed     with Fern"    request
 social,     company       docs"      report       CTA
 PR, ads     pages         tool`}</code></pre>

          <h3>Expected Conversion Rates</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Stage</th><th>Metric</th><th>Month 3</th><th>Month 6</th><th>Month 12</th></tr></thead>
              <tbody>
                <tr><td>Visitors</td><td>Monthly unique</td><td>12,000</td><td>35,000</td><td>80,000</td></tr>
                <tr><td>Engaged</td><td>2+ pages</td><td>5,400 (45%)</td><td>17,500 (50%)</td><td>44,000 (55%)</td></tr>
                <tr><td>Checker users</td><td>Used free tool</td><td>720 (6%)</td><td>2,800 (8%)</td><td>8,000 (10%)</td></tr>
                <tr><td>Email captures</td><td>Provided email</td><td>215 (30%)</td><td>980 (35%)</td><td>2,800 (35%)</td></tr>
                <tr><td>Demo requests</td><td>Requested demo</td><td>9 (20%)</td><td>39 (20%)</td><td>140 (20%)</td></tr>
                <tr><td>Customers</td><td>Closed</td><td>2 (22%)</td><td>9 (23%)</td><td>35 (25%)</td></tr>
              </tbody>
            </table>
          </div>

          </div>

          <div className="content-section" data-section="section-15">
          <hr />

          {/* SECTION 15 */}
          <h2 id="section-15">Outreach &amp; Partnerships</h2>

          <h3>Dachary Carey Partnership (CRITICAL)</h3>
          <p>
            This is the single most important relationship. Without Dachary, Agent Score is
            &ldquo;Fern&rsquo;s proprietary scoring.&rdquo; With her, it&rsquo;s &ldquo;the industry
            standard, powered by Fern.&rdquo;
          </p>
          <ul>
            <li>Engage early and transparently &mdash; share the plan before launch</li>
            <li>Co-branding: &ldquo;Built on the Agent-Friendly Documentation Spec by Dachary Carey&rdquo;</li>
            <li>Formal partnership: Fern sponsors afdocs development, Dachary gets attribution + voice in methodology</li>
            <li>Contribute upstream: submit PRs to afdocs, not fork</li>
          </ul>

          <h3>Conference Strategy</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Conference</th><th>Action</th><th>Est. Cost</th></tr></thead>
              <tbody>
                <tr><td>API Platform Conference (Sep 2026)</td><td>Talk + sponsor</td><td>$5K&ndash;8K</td></tr>
                <tr><td>DevRelCon NY</td><td>Talk: &ldquo;What 200 Docs Sites Tell Us&rdquo;</td><td>$5K&ndash;8K</td></tr>
                <tr><td>Write the Docs Portland</td><td>Lightning talk + community table</td><td>$2K&ndash;3K</td></tr>
                <tr><td>API World (Oct 2026)</td><td>Full talk</td><td>$5K&ndash;8K</td></tr>
              </tbody>
            </table>
          </div>

          </div>

          <div className="content-section" data-section="section-16">
          <hr />

          {/* SECTION 16 */}
          <h2 id="section-16">PR Strategy</h2>

          <h3>Primary Press Angle</h3>
          <p>
            <strong>&ldquo;First-ever industry benchmark reveals [X]% of API documentation fails
            basic agent-readiness checks&rdquo;</strong>
          </p>
          <p>
            Frame around the data, not the product. Journalists cover findings. The story is
            &ldquo;most documentation is invisible to AI agents&rdquo; &mdash; Agent Score is the
            source.
          </p>

          <h3>Target Publications</h3>
          <p>
            <strong>Tier 1:</strong> Hacker News, TechCrunch, The New Stack, InfoQ
            <br />
            <strong>Tier 2:</strong> Dev.to, API Evangelist, Smashing Magazine
            <br />
            <strong>Tier 3:</strong> RedMonk, Business Insider
          </p>

          <h3>Executive Thought Leadership</h3>
          <ul>
            <li>&ldquo;Why we built Agent Score&rdquo;</li>
            <li>&ldquo;What Postman&rsquo;s 30M developers taught us about the agent documentation gap&rdquo;</li>
            <li>&ldquo;Agent readiness is the new SEO&rdquo;</li>
          </ul>

          </div>

          <div className="content-section" data-section="section-17">
          <hr />

          {/* SECTION 17 */}
          <h2 id="section-17">Email Marketing</h2>

          <h3>Lead Nurture Sequence (Post-Score-Check)</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Email</th><th>Timing</th><th>Subject</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Immediate</td><td>&ldquo;Your Agent Score: [X]/100 &mdash; here&rsquo;s what it means&rdquo;</td></tr>
                <tr><td>2</td><td>Day 3</td><td>&ldquo;The #1 thing agents struggle with on your docs&rdquo;</td></tr>
                <tr><td>3</td><td>Day 7</td><td>&ldquo;How [high scorer in their industry] scores [X]/100&rdquo;</td></tr>
                <tr><td>4</td><td>Day 14</td><td>&ldquo;3 fixes that would raise your score by [Y] points&rdquo;</td></tr>
                <tr><td>5</td><td>Day 21</td><td>&ldquo;Your docs vs. your competitors&rsquo;&rdquo;</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Monthly &ldquo;Agent Score Digest&rdquo; Newsletter</h3>
          <ol>
            <li><strong>Score of the Month:</strong> Spotlight one company that improved</li>
            <li><strong>Industry Benchmark:</strong> Average scores by vertical + trend</li>
            <li><strong>New Check Alert:</strong> When new checks ship, explain what they measure</li>
            <li><strong>Top 10 Leaderboard:</strong> Current top 10</li>
            <li><strong>Quick Tip:</strong> One implementable improvement</li>
            <li><strong>Community:</strong> Links to blog posts, talks, discussions</li>
          </ol>

          </div>

          <div className="content-section" data-section="section-18">
          <hr />

          {/* SECTION 18 */}
          <h2 id="section-18">Competitive Moat</h2>

          <h3>Why Fern Should Own This</h3>
          <ol>
            <li><strong>Fern builds the thing being measured.</strong> Unique credibility &mdash; they ship agent-friendly docs daily.</li>
            <li><strong>Open-source tool, proprietary leaderboard.</strong> Anyone can run <code>npx afdocs check</code>. But the curated, pre-computed leaderboard is Fern&rsquo;s value-add.</li>
            <li><strong>Customer base seeds credibility.</strong> Fern customers score well &rarr; natural proof point.</li>
            <li><strong>Fern + Postman = distribution.</strong> Access to 30M+ Postman users.</li>
            <li><strong>First-mover advantage.</strong> Nobody else has this benchmark.</li>
          </ol>

          <h3>Defensibility Layers</h3>
          <ul>
            <li><strong>Data moat:</strong> Historical scoring data for 200+ sites cannot be replicated retroactively</li>
            <li><strong>Brand moat:</strong> &ldquo;Agent Score&rdquo; becomes the standard reference</li>
            <li><strong>SEO moat:</strong> 200+ indexed pages with ongoing updates build domain authority</li>
            <li><strong>Relationship moat:</strong> Companies that claim pages, embed badges create switching costs</li>
          </ul>

          </div>

          <div className="content-section" data-section="section-19">
          <hr />

          {/* SECTION 19 */}
          <h2 id="section-19">Risk Assessment</h2>

          <h3>Risk 1: Companies Angry About Low Scores</h3>
          <p><strong>Likelihood:</strong> High | <strong>Impact:</strong> Medium</p>
          <ul>
            <li>Frame as constructive (&ldquo;How to improve&rdquo; on every page)</li>
            <li>Allow companies to request re-scans after improvements</li>
            <li>Objective, reproducible methodology &mdash; &ldquo;Run it yourself and verify&rdquo;</li>
            <li>Disclaimer: &ldquo;Scores reflect point-in-time automated assessment&rdquo;</li>
          </ul>

          <h3>Risk 2: Dachary Carey Relationship</h3>
          <p><strong>Likelihood:</strong> Medium | <strong>Impact:</strong> High</p>
          <ul>
            <li>Engage early and transparently before launch</li>
            <li>Co-branding + compensation for content contributions</li>
            <li>Contribute engineering to afdocs upstream</li>
          </ul>

          <h3>Risk 3: Gaming the Score</h3>
          <p><strong>Likelihood:</strong> High | <strong>Impact:</strong> Medium</p>
          <ul>
            <li>Checks designed around real agent behavior &mdash; &ldquo;gaming&rdquo; mostly means actually improving docs</li>
            <li>Layered checks prevent superficial gaming</li>
            <li>Evolve methodology over time; publish changelog</li>
          </ul>

          <h3>Risk 4: afdocs Tool Accuracy / False Results</h3>
          <p><strong>Likelihood:</strong> Medium | <strong>Impact:</strong> High</p>
          <ul>
            <li>Manually verify top 20&ndash;30 highest-profile companies before launch</li>
            <li>Skip-adjusted scoring so unimplemented checks don&rsquo;t distort</li>
            <li>Feedback mechanism: &ldquo;Think this score is wrong? Let us know.&rdquo;</li>
          </ul>

          <h3>Risk 5: Low Traction</h3>
          <p><strong>Likelihood:</strong> Medium | <strong>Impact:</strong> High</p>
          <ul>
            <li>HN + PH + newsletter launch blitz</li>
            <li>Pre-seed influencers with high scores (they&rsquo;ll share)</li>
            <li>Controversial content: &ldquo;We tested 200 sites. Most are failing.&rdquo;</li>
            <li>Monthly content cadence for sustained traffic</li>
          </ul>

          </div>

          <div className="content-section" data-section="section-20">
          <hr />

          {/* SECTION 20 */}
          <h2 id="section-20">KPIs &amp; Milestones</h2>

          <div className="table-wrap">
            <table>
              <thead><tr><th>KPI</th><th>Month 1</th></tr></thead>
              <tbody>
                <tr><td>Companies scored</td><td>200</td></tr>
                <tr><td>Monthly visitors</td><td>15,000</td></tr>
                <tr><td>Checker uses</td><td>500</td></tr>
                <tr><td>Email list</td><td>150</td></tr>
                <tr><td>Demo requests</td><td>5</td></tr>
                <tr><td>HN / Product Hunt</td><td>Front page / Top 10</td></tr>
              </tbody>
            </table>
          </div>

          </div>

          <div className="content-section" data-section="section-21">
          <hr />

          {/* SECTION 21 */}
          <h2 id="section-21">Execution Timeline</h2>

          <div className="table-wrap">
            <table>
              <thead><tr><th>Week</th><th>Milestone</th></tr></thead>
              <tbody>
                <tr><td>1&ndash;2</td><td>Finalize scoring methodology. Build batch scanner. Begin scanning 200 sites. Build leaderboard frontend.</td></tr>
                <tr><td>2&ndash;3</td><td>Build individual score pages. Build free score checker (queue + worker + UI).</td></tr>
                <tr><td>3&ndash;4</td><td>QA: manually verify top 30 company scores. Write all launch content.</td></tr>
                <tr><td>4</td><td>Reach out to Dachary Carey about partnership.</td></tr>
                <tr><td>4&ndash;5</td><td>Soft launch: share with 10&ndash;15 DevRel contacts for feedback.</td></tr>
                <tr><td>5&ndash;6</td><td><strong>Public launch:</strong> HN, blog, social, PH, PR, email blast. Begin company outreach.</td></tr>
                <tr><td>6&ndash;8</td><td>Company spotlight series (2/week). Guest post submissions. Podcast outreach.</td></tr>
                <tr><td>8&ndash;10</td><td>Publish &ldquo;State of Agent-Ready Documentation 2026&rdquo; report.</td></tr>
                <tr><td>Month 3</td><td>Conference talk submissions. Begin V2 planning (badges, historical tracking, API).</td></tr>
                <tr><td>Month 4&ndash;6</td><td>V2 development + launch. Monthly newsletter cadence. Quarterly re-scans.</td></tr>
                <tr><td>Month 6&ndash;12</td><td>V3 planning (paid tier). Scale paid acquisition. Annual report.</td></tr>
              </tbody>
            </table>
          </div>

          </div>

          <div className="content-section" data-section="section-22">
          <hr />

          {/* SECTION 22 */}
          <h2 id="section-22">Full Budget Summary</h2>

          <div className="table-wrap">
            <table>
              <thead><tr><th>Category</th><th>Annual Budget</th></tr></thead>
              <tbody>
                <tr><td colSpan={2}><strong>Paid Ads</strong></td></tr>
                <tr><td>Google Ads (high-intent keywords only)</td><td>$3,000&ndash;5,000</td></tr>
                <tr><td>Newsletter Sponsorships (Console.dev, niche)</td><td>$2,000&ndash;4,000</td></tr>
                <tr><td colSpan={2}><strong>Content &amp; Community</strong></td></tr>
                <tr><td>Design/Creative (badges, OG images, reports)</td><td>$2,000&ndash;4,000</td></tr>
                <tr><td>Conference submissions (travel, no booth)</td><td>$2,000&ndash;4,000</td></tr>
                <tr><td colSpan={2}><strong>Organic &amp; Viral (zero cost)</strong></td></tr>
                <tr><td>Hacker News, Product Hunt, Twitter/X, LinkedIn</td><td>$0 (sweat equity)</td></tr>
                <tr><td>SEO content, blog posts, founder thought leadership</td><td>$0 (sweat equity)</td></tr>
                <tr><td>Postman distribution channels</td><td>$0 (internal synergy)</td></tr>
                <tr><td><strong>Total Year 1</strong></td><td><strong>$10,000&ndash;20,000</strong></td></tr>
              </tbody>
            </table>
          </div>

          </div>

          <div className="content-section" data-section="section-23">
          <hr />

          {/* SECTION 23 */}
          <h2 id="section-23">Docs Site Detection Heuristics</h2>

          <p>
            Not every URL submitted to the free score checker is a documentation site.
            Marketing homepages, landing pages, and blog-only sites will fail most checks &mdash; not
            because they are poorly maintained, but because they were never meant to serve AI coding
            agents. This section defines the detection logic used to catch non-docs URLs early and
            return a useful error instead of a misleading score.
          </p>

          <h3>Why Detection Matters</h3>
          <p>
            The afdocs CLI makes plain HTTP requests with no browser headers. Sites protected by
            Cloudflare Bot Management, Vercel&rsquo;s bot protection, or similar middleware will silently
            drop these requests &mdash; every check returns &ldquo;Could not fetch&rdquo; and the score
            is 0/F. This is not a real score. A pre-flight docs detection pass prevents noise and
            gives the user an actionable error: <em>&ldquo;This looks like a marketing site. Did you
            mean <code>docs.yourco.com</code>?&rdquo;</em>
          </p>

          <h3>Tier 1: URL-Pattern Heuristics (no network, instant)</h3>
          <p>
            Run before any HTTP call. A single positive match upgrades confidence to &ldquo;likely docs.&rdquo;
          </p>

          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Signal</th><th>Pattern</th><th>Examples</th><th>Confidence</th></tr>
              </thead>
              <tbody>
                <tr><td>Docs subdomain</td><td><code>^(docs|developer|api|reference)\.</code></td><td><code>docs.stripe.com</code>, <code>developer.mozilla.org</code></td><td>High</td></tr>
                <tr><td>Docs path</td><td><code>/(docs|api|reference|guides|developer|sdk|learn)/</code></td><td><code>/docs/intro</code>, <code>/api/v2</code></td><td>High</td></tr>
                <tr><td>Known docs platform</td><td>hostname contains known platform</td><td><code>readme.io</code>, <code>gitbook.io</code>, <code>mintlify.app</code>, <code>buildwithfern.com</code></td><td>High</td></tr>
                <tr><td>Versioned API path</td><td><code>/v\d+/</code> in path</td><td><code>/v3/reference/</code></td><td>Medium</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Tier 2: Fetch-Based Heuristics (1&ndash;2 HTTP calls)</h3>
          <p>
            Run only if Tier 1 is inconclusive. A single browser-like request to the root URL,
            then check the response for docs signals.
          </p>

          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Signal</th><th>How to detect</th><th>Confidence</th></tr>
              </thead>
              <tbody>
                <tr><td><code>llms.txt</code> exists</td><td><code>GET /llms.txt</code> returns 200</td><td>Very High &mdash; definitive docs signal</td></tr>
                <tr><td>Markdown at <code>.md</code> URL</td><td>Append <code>.md</code> to any page URL; check <code>Content-Type: text/markdown</code> or markdown body</td><td>High</td></tr>
                <tr><td>Page title contains docs keywords</td><td><code>&lt;title&gt;</code> contains &ldquo;docs&rdquo;, &ldquo;documentation&rdquo;, &ldquo;API&rdquo;, &ldquo;reference&rdquo;, &ldquo;developer&rdquo;</td><td>Medium</td></tr>
                <tr><td>Code block density</td><td><code>&lt;pre&gt;</code> or <code>&lt;code&gt;</code> appears 3+ times in HTML body</td><td>Medium</td></tr>
                <tr><td>Docs nav keywords</td><td>Page HTML contains &ldquo;Getting Started&rdquo;, &ldquo;API Reference&rdquo;, &ldquo;Quickstart&rdquo;, &ldquo;Guides&rdquo;</td><td>Medium</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Negative Signals (likely NOT a docs site)</h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Signal</th><th>How to detect</th></tr>
              </thead>
              <tbody>
                <tr><td>Marketing/landing page</td><td>HTML contains &ldquo;pricing&rdquo;, &ldquo;testimonials&rdquo;, &ldquo;hero&rdquo;, no <code>&lt;pre&gt;</code> or <code>&lt;code&gt;</code> blocks</td></tr>
                <tr><td>Blog-only site</td><td>All internal links match <code>/blog/</code>, <code>/posts/</code>, <code>/articles/</code></td></tr>
                <tr><td>Auth-gated app</td><td>Returns 401/403 or redirects to <code>/login</code>, <code>/signin</code></td></tr>
                <tr><td>All fetches fail</td><td>Bot protection / Cloudflare is blocking headless requests &mdash; score would be artificially 0</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Decision Tree</h3>
          <pre><code>{`1. URL pattern match?
   YES → run afdocs checks
   NO  → fetch root page

2. Root page fetched OK?
   NO  → "Bot protection detected. Try: docs.yoursite.com"
   YES → check llms.txt, title, code density

3. Docs signals found (≥2)?
   YES → run afdocs checks
   NO  → warn: "This may not be a docs URL"
         suggest: docs.{domain}, {domain}/docs
         let user proceed anyway`}</code></pre>

          <h3>Implementation Notes</h3>
          <ul>
            <li><strong>Use a browser-like User-Agent</strong> for the detection fetch only: <code>Mozilla/5.0 (compatible; AgentScore/1.0)</code>. The afdocs tool itself intentionally uses a headless UA to test what agents actually see.</li>
            <li><strong>Timeout the detection fetch at 5s.</strong> If it times out, assume bot protection and warn the user.</li>
            <li><strong>Cache detection results.</strong> If a domain has already been scored (it&rsquo;s in the leaderboard), skip detection entirely &mdash; we already know it&rsquo;s a docs site.</li>
            <li><strong>Do not block submission</strong> based on detection alone &mdash; only warn. The user may be testing an internal staging URL that doesn&rsquo;t match standard patterns.</li>
            <li><strong>Log detection outcomes</strong> to understand which non-docs URLs are most commonly submitted. This is valuable product data.</li>
          </ul>

          <h3>Known Edge Cases</h3>
          <ul>
            <li><strong>buildwithfern.com</strong> &mdash; The Fern marketing site. Correct docs URL is a sub-path. Protected by Cloudflare. Test with a known docs URL like <code>https://docs.anthropic.com/</code> or one of the leaderboard sites instead.</li>
            <li><strong>readme.com customer portals</strong> &mdash; Pattern: <code>yourco.readme.io</code>. These respond correctly to afdocs. Classify as docs by platform hostname.</li>
            <li><strong>Notion-exported docs</strong> &mdash; Often at <code>yourco.notion.site</code>. Usually fail llms.txt and markdown checks but are valid doc sites. Detect by Notion hostname.</li>
            <li><strong>GitHub Pages docs</strong> &mdash; Pattern: <code>yourco.github.io</code> or <code>github.io/reponame</code>. Legitimate. Classify by GitHub Pages hostname.</li>
          </ul>

          </div>

          <hr />

          <h2 id="section-references" style={{ scrollMarginTop: '80px' }}>References</h2>
          <ul>
            <li><a href="https://agentdocsspec.com/">Agent-Friendly Documentation Spec</a></li>
            <li><a href="https://www.npmjs.com/package/afdocs">afdocs on npm</a></li>
            <li><a href="https://github.com/agent-ecosystem/afdocs">afdocs on GitHub</a></li>
            <li><a href="https://dacharycarey.com/2026/02/18/agent-friendly-docs/">Dachary Carey &mdash; Agent-Friendly Docs</a></li>
            <li><a href="https://scale.com/leaderboard">SEAL LLM Leaderboards &mdash; Scale AI</a></li>
            <li><a href="https://buildwithfern.com/">Fern &mdash; SDKs and Docs for your API</a></li>
            <li><a href="https://llmstxt.org/">llms.txt Specification</a></li>
          </ul>
        </main>
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-left mono">
              Developed by{' '}
              <Image
                src="/fern-labs-dark.svg"
                alt="Fern Labs"
                width={80}
                height={20}
                className="footer-fern-logo fern-logo-dark"
              />
              <Image
                src="/fern-labs-light.svg"
                alt="Fern Labs"
                width={80}
                height={20}
                className="footer-fern-logo fern-logo-light"
              />
            </div>
            <div className="footer-right">
              Built on the{' '}
              <a
                href="https://github.com/agent-ecosystem/agent-docs-spec"
                target="_blank"
                rel="noopener"
              >
                Agent-Friendly Documentation Spec
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
