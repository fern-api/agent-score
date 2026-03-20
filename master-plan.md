# Agent Score by Fern — Master Plan

> **Mission:** Make Fern the arbiter of agent-ready documentation — the way Scale AI's SEAL Leaderboard became the arbiter of model quality — while driving SEO, building authority, and generating leads for Fern's docs platform.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Positioning](#2-product-vision--positioning)
3. [Brand & Messaging](#3-brand--messaging)
4. [User Personas](#4-user-personas)
5. [Scoring Methodology](#5-scoring-methodology)
6. [Feature Roadmap (MVP → V2 → V3)](#6-feature-roadmap)
7. [Leaderboard Design](#7-leaderboard-design)
8. [SEO Strategy](#8-seo-strategy)
9. [Launch Strategy (Weeks 1-4)](#9-launch-strategy)
10. [Viral Mechanics](#10-viral-mechanics)
11. [Content Marketing Plan](#11-content-marketing-plan)
12. [Social Media Strategy](#12-social-media-strategy)
13. [Paid Acquisition & Budget](#13-paid-acquisition--budget)
14. [Conversion Funnel & Lead Generation](#14-conversion-funnel--lead-generation)
15. [Outreach & Partnerships](#15-outreach--partnerships)
16. [PR Strategy](#16-pr-strategy)
17. [Email Marketing](#17-email-marketing)
18. [Competitive Moat](#18-competitive-moat)
19. [Risk Assessment](#19-risk-assessment)
20. [KPIs & Milestones](#20-kpis--milestones)
21. [Execution Timeline](#21-execution-timeline)
22. [Full Budget Summary](#22-full-budget-summary)

---

## 1. Executive Summary

AI coding agents (Cursor, Copilot, Claude Code, Windsurf) are now the primary consumers of API documentation. Most docs were built for humans, not machines. **Agent Score by Fern** is the first public benchmark that scores how agent-friendly documentation sites are — think Lighthouse for PageSpeed, but for agent-readiness.

Built on the open-source [afdocs CLI](https://github.com/agent-ecosystem/afdocs) (by Dachary Carey) and the [Agent-Friendly Documentation Spec](https://agentdocsspec.com/), it evaluates docs across **21 checks in 8 categories** and publishes a public leaderboard of 200+ API documentation sites.

**The flywheel:** Companies check their score → discover their docs are agent-hostile → look for solutions → find that Fern is the platform purpose-built to fix it. Every company that checks their score is one CTA away from becoming a Fern lead.

**Year 1 investment:** ~$230K–320K (paid ads, conferences, content, PR)
**Year 1 target:** 80K monthly organic visitors, 20K email list, 80+ new customers attributed to Agent Score

---

## 2. Product Vision & Positioning

### One-Line Pitch
Agent Score is the definitive public benchmark that rates how well API documentation serves AI coding agents — think Lighthouse for PageSpeed, but for agent-readiness.

### Elevator Pitch (30 seconds)
AI coding agents are becoming the primary consumers of API documentation. But most docs were built for humans, not machines. Agent Score by Fern scores documentation sites on a 0–100 scale across 21 checks — from llms.txt availability to markdown serving to context-window fit. We publish a public leaderboard of 200+ API docs sites, let anyone check their own score for free, and give teams a concrete roadmap to make their docs agent-ready. Companies with better scores get more agent traffic, which means more adoption.

### Positioning Statement
For API platform teams and DevRel leaders who need to ensure their documentation works for AI coding agents, **Agent Score by Fern** is the industry-standard benchmark that objectively measures agent-readiness across 21 checks and 8 categories. Unlike ad-hoc manual testing, Agent Score provides automated, reproducible scoring backed by the Agent-Friendly Documentation Spec and powered by the open-source afdocs CLI. Fern — the company that builds documentation infrastructure for Square, ElevenLabs, and Webflow — is uniquely positioned to define what "good" looks like because they ship agent-friendly docs every day.

---

## 3. Brand & Messaging

### Name: **Agent Score by Fern**

| Alternative | Pros | Cons |
|-------------|------|------|
| Agent Score by Fern | Clear, descriptive, brand-linked | Slightly long |
| AgentReady | Catchy | Misses the scoring/benchmark angle |
| DocsScore | Simple | Too generic, misses the "agent" angle |
| Agent Readiness Index | Sounds rigorous | Long, clinical |

**Domain options:** `agentscore.dev`, `agentscore.fern.dev`, `score.buildwithfern.com`

### Taglines (Ranked)

1. **"Is your documentation ready for the agent economy?"**
2. **"The benchmark for agent-ready docs."**
3. **"21 checks. 8 categories. One score."**
4. **"Agents are reading your docs. Are your docs ready?"**
5. **"The Lighthouse score for your documentation."**
6. "Don't just document for developers. Document for their agents."
7. "If agents can't read your docs, developers can't use your API."
8. "Score your docs. Fix what matters. Win agent integrations."
9. "Your docs have a new audience. Score how well you serve them."
10. "The first public benchmark for AI-agent-friendly documentation."

### Core Messaging Pillars

**Pillar 1: "Agents are the new developers"**
AI coding agents are now the primary consumers of API documentation. When a developer asks their agent to integrate Stripe, the agent reads Stripe's docs — not the developer. If those docs are agent-hostile, the agent fails, and the developer moves to a competitor.

**Pillar 2: "What gets measured gets improved"**
There is currently no standard for measuring agent-friendliness of documentation. No benchmark. No public score. Agent Score creates the measurement layer the industry needs — turning an invisible problem into a visible, actionable number.

**Pillar 3: "Agent readiness is a competitive advantage"**
Companies whose docs score high will win disproportionate integration traffic. This is the new SEO: instead of optimizing for Google's crawlers, you optimize for coding agents.

**Pillar 4: "Open standard, no gatekeeping"**
Built on an open spec, using an open-source tool. Anyone can run the checks. The methodology is transparent. The scores are public. This is about raising the bar for the entire ecosystem.

### Tone of Voice

**Authoritative but generous.** The friend who happens to be an expert and tells you what you need to hear without making you feel stupid.

- **Never punitive.** A low score is a "growth opportunity," not a failure.
- **Data-first.** Lead with numbers. "73% of the top 200 API docs sites lack an llms.txt file" > "most docs aren't ready."
- **Developer-native.** Use terms the audience uses: "context window," "token budget," "content negotiation."
- **Respectful.** Acknowledge these standards are new. Nobody could have scored perfectly last year because the spec didn't exist.
- **Slightly opinionated.** "llms.txt should be as standard as robots.txt" is a stance worth taking.

---

## 4. User Personas

### Persona 1: DevRel Lead / Head of Documentation ("Dana")
- **Goal:** Justify budget for docs improvements; benchmark against competitors
- **Motivation:** "Our Agent Score is 43. Stripe's is 87. Here's what we need to do."
- **Conversion path:** "Improve your score" CTA → Fern Docs product

### Persona 2: CTO / VP Engineering ("Carlos")
- **Goal:** Ensure their API is discoverable by AI coding agents
- **Motivation:** Competitive paranoia. If Stripe's docs work with Claude Code and theirs don't, developers choose Stripe.
- **Conversion path:** Sees leaderboard on HN → checks where they rank → requests Fern demo

### Persona 3: Individual Developer ("Dev")
- **Goal:** Pick the API with the best agent compatibility for their project
- **Motivation:** Wants to use Cursor/Claude Code with the API. If docs don't serve markdown or have llms.txt, the agent experience is terrible.
- **Conversion path:** Generates backlinks, SEO, and social sharing

### Persona 4: API Founder / PM ("Priya")
- **Goal:** Build best-in-class docs from day one
- **Motivation:** Uses Agent Score as a checklist during docs buildout; targets an A grade
- **Conversion path:** Adopts Fern Docs to get automatic high scores out of the box

### Persona 5: Investor / Analyst ("Alex")
- **Goal:** Evaluate developer experience quality of portfolio companies
- **Motivation:** Agent-readiness as a proxy for engineering quality
- **Conversion path:** Recommends Fern to portfolio companies

---

## 5. Scoring Methodology

### From 21 Pass/Fail Checks to a 0–100 Score

**Step 1: Point assignments (total = 100 points)**

| Category | Check | Max Pts | Rationale |
|----------|-------|---------|-----------|
| **llms.txt** | llms-txt-exists | 10 | Foundational — without this, agents have no index |
| | llms-txt-valid | 5 | Structure matters for parsing |
| | llms-txt-size | 5 | Truncation defeats the purpose |
| | llms-txt-links-resolve | 5 | Broken links = dead ends |
| | llms-txt-links-markdown | 5 | MD links are the whole point |
| **Markdown** | markdown-url-support | 10 | Primary agent content delivery |
| | content-negotiation | 5 | Standards-based alternative |
| **Page Size** | page-size-markdown | 7 | Truncation is #1 agent failure mode |
| | page-size-html | 5 | Fallback quality matters |
| | content-start-position | 3 | Boilerplate wastes context budget |
| **Structure** | tabbed-content-serialization | 3 | Common bloated output cause |
| | section-header-quality | 2 | Agents need contextual headers |
| | markdown-code-fence-validity | 3 | Broken fences corrupt downstream content |
| **URL Stability** | http-status-codes | 4 | Soft 404s silently mislead agents |
| | redirect-behavior | 3 | Cross-host redirects break workflows |
| **Discoverability** | llms-txt-directive | 3 | Helps agents find index from any page |
| **Health** | llms-txt-freshness | 4 | Stale index = stale agent knowledge |
| | markdown-content-parity | 3 | Divergent content = unreliable answers |
| | cache-header-hygiene | 2 | Enables timely updates |
| **Auth** | auth-gate-detection | 8 | Gated docs are invisible to agents |
| | auth-alternative-access | 5 | Escape hatch for gated content |
| | **TOTAL** | **100** | |

**Step 2: Score each check**
- **pass** = 100% of max points
- **warn** = 50% of max points
- **fail** = 0% of max points
- **skip** (not yet implemented) = excluded from denominator; normalized

**Step 3: Normalization formula**
```
Raw Score = SUM(points earned for non-skipped checks)
Max Possible = SUM(max points for non-skipped checks)
Final Score = ROUND((Raw Score / Max Possible) × 100)
```

This is critical for fairness during v0.x when 7 checks return `skip`. Category sub-scores use the same formula per-category.

### Letter Grade Tiers

| Grade | Score | Label | Color |
|-------|-------|-------|-------|
| A+ | 95–100 | Exceptional | Dark green |
| A | 85–94 | Excellent | Green |
| B | 70–84 | Good | Light green |
| C | 50–69 | Fair | Yellow |
| D | 30–49 | Poor | Orange |
| F | 0–29 | Failing | Red |

### Edge Cases
- **All checks skip in a category:** Category score = "N/A"
- **Site unreachable:** Score = 0, Grade = F, with note
- **New checks added:** All sites re-scanned simultaneously; normalization ensures comparability
- **Methodology versioned:** "Methodology v1.0, effective March 2026" with public changelog

### Transparency
Full methodology page on the site explaining weights, formula, grade thresholds, with links to the Agent-Friendly Documentation Spec and the afdocs repo.

---

## 6. Feature Roadmap

### MVP (4–6 weeks to launch)

**Public Leaderboard**
- Pre-seeded with 200+ API documentation sites, scored and ranked
- Sortable table: rank, company, score (0–100), letter grade, category breakdown
- Filterable by industry (Payments, AI/ML, Infrastructure, Communication, etc.) and grade tier
- Search by company name

**Individual Company Score Pages (SEO engine)**
- Dedicated URL per company: `/agentscore/stripe`, `/agentscore/twilio`
- Overall score + letter grade + category-by-category breakdown with pass/fail/warn per check
- Plain-English explanation of each result ("Your llms.txt is 142K chars — agents will truncate this")
- "How to improve" recommendations for each failing check
- Social sharing meta tags — score card looks great shared on Twitter/LinkedIn
- "Last checked" timestamp

**Free Score Checker**
- Input: "Enter your docs URL"
- Runs afdocs against the URL in near-real-time via queue
- Returns same score page format
- Email capture: "Get notified when your score changes"

**Static Content**
- Methodology page, About page, FAQ page

**Technical Implementation**
- Pre-compute scores via batch job (store in DB or static JSON)
- On-demand scoring via queue/worker for free checker
- Re-scan full leaderboard weekly/biweekly
- Next.js or Astro static site with dynamic checker functionality

### V2 (2–3 months post-launch)

**Badges and Seals**
- Embeddable SVG/PNG: "Agent Score: A" with Fern branding
- Dynamic badge (like shields.io) that updates on re-scan
- "Certified Agent-Ready" seal for A-tier sites
- Every embed = a backlink to Agent Score

**Historical Tracking**
- Score-over-time chart on each company page
- Delta indicators on leaderboard (trending arrows)

**API Access**
- `GET /api/v1/score?url=docs.stripe.com` — JSON response
- Rate-limited free tier (100 req/day), authenticated tier for higher limits

**CI/CD Integration**
- GitHub Action: `fern/agent-score-check@v1` — runs on PR, fails if score drops
- Outputs score as PR comment

**Category Leaderboards**
- "Best Agent-Friendly Payment APIs", "Best Agent-Friendly AI/ML APIs"
- Vertical-specific rankings for targeted SEO

**Claim Your Page**
- Companies verify domain ownership → verified checkmark
- Claimed pages: add logo, get notified on changes, access dashboard

### V3 (6–12 months post-launch)

**Paid Tier: Agent Score Pro ($99–299/month)**
- Daily scans instead of weekly
- Private scores for staging/pre-production URLs
- Detailed remediation reports with prioritized fix list
- Slack/email alerts on regressions
- Industry benchmark reports

**Enterprise Reports (custom pricing, bundled with Fern enterprise)**
- White-labeled PDF reports
- Executive summaries + quarterly trend analysis
- Custom check configurations

**Consulting ($5K–15K per engagement)**
- "Agent-Ready Docs Audit" — Fern reviews your docs, provides remediation plan
- Natural upsell to Fern Docs platform

**Community Features**
- "Submit a site" — anyone can request additions
- Annual "State of Agent-Friendly Documentation" report

---

## 7. Leaderboard Design

### Table Structure

| Rank | Company | Docs URL | Score | Grade | llms.txt | Markdown | Size | Structure | URLs | Discovery | Health | Auth |
|------|---------|----------|-------|-------|----------|----------|------|-----------|------|-----------|--------|------|

- **Score**: Bold number 0–100
- **Grade**: Color-coded letter badge
- **Category columns**: Mini-indicator (filled circle = all pass, half = mixed, empty = all fail, dash = skipped)

### Companies to Pre-Seed (200+ targets by category)

**Payments & Fintech (20):** Stripe*, Square*, Plaid*, Adyen, Braintree/PayPal, Recurly, Chargebee, Wise, Moov, Marqeta, Checkout.com, GoCardless, Rapyd, Dwolla, Finix, Increase*, Column, Unit, Lithic, Modern Treasury*

**AI/ML (25):** OpenAI*, Anthropic*, Cohere*, Google AI/Gemini, Mistral, Hugging Face, Replicate, Pinecone*, ElevenLabs*, Deepgram, AssemblyAI, Stability AI, Fireworks AI, Together AI, Groq, Voyage AI, Anyscale, Weights & Biases, LangChain, LlamaIndex, Unstructured, Writer, Jasper, Perplexity, Scale AI

**Infrastructure & Cloud (20):** AWS, Google Cloud, Azure, Cloudflare*, Vercel*, Netlify, Supabase*, PlanetScale, Neon, Upstash, Fly.io, Railway, Render, DigitalOcean, Linode/Akamai, Heroku, MongoDB Atlas, CockroachDB, Timescale, Turso

**Communication (15):** Twilio*, SendGrid, Vonage, Mailgun, Postmark, Resend*, Knock, Courier, Stream, Sendbird, Ably, Pusher, Liveblocks, Novu, OneSignal

**Developer Tools (25):** GitHub, GitLab, Postman, Swagger/SmartBear, ReadMe, Mintlify, LaunchDarkly*, Sentry, Datadog, New Relic, PagerDuty, Snyk, Sonar, CircleCI, Buildkite, Depot, Temporal, Inngest, Trigger.dev, Clerk*, WorkOS*, Stytch, Auth0/Okta, Firebase, Linear

**Data & Analytics (15):** Snowflake, Databricks, Segment, Mixpanel, Amplitude, PostHog, Heap, Algolia, Typesense, Meilisearch, Elastic, Confluent, Airbyte, Fivetran, dbt

**Commerce (10):** Shopify, BigCommerce, Saleor, Medusa, Webflow*, Contentful, Sanity, Storyblok, Prismic, Builder.io

**Security & Identity (10):** Auth0*, Okta, Clerk*, WorkOS*, Stytch, CrowdStrike, SentinelOne, Snyk, HashiCorp Vault, Pangea

**CRM & Business (10):** Salesforce, HubSpot, Intercom*, Zendesk, Front, Linear, Notion, Airtable, Retool, Zapier

**High-Profile APIs (15):** Discord, Slack, Spotify, X/Twitter, Reddit, Meta Graph API, YouTube Data API, Figma, Canva, Zoom, Calendly, Cal.com, Mapbox, Twitch, Notion

*\* = Fern customers or high-priority targets*

### Visual Design Notes
- Clean, minimal, consistent with Fern brand
- Each row clickable → detailed score page
- Top 3 companies: gold/silver/bronze highlight
- CTA in header and footer: "Your docs aren't listed? Check your score now"

---

## 8. SEO Strategy

### Keyword Targets

**Head Terms (long-term targets)**

| Keyword | Est. Monthly Volume | Difficulty |
|---------|-------------------|------------|
| llms.txt | 8,000–12,000 | Medium |
| API documentation best practices | 3,500–5,000 | High |
| AI-ready documentation | 1,500–2,500 | Low-Medium |

**Mid-Tail (primary targets)**

| Keyword | Est. Monthly Volume | Difficulty |
|---------|-------------------|------------|
| agent-friendly documentation | 500–1,200 | Low |
| llms.txt checker | 200–500 | Very Low |
| llms.txt validator | 200–400 | Very Low |
| how to create llms.txt | 800–1,500 | Low |
| API docs for AI agents | 300–800 | Low |
| agent-ready API documentation | 200–500 | Low |

**Long-Tail / Branded (owned terms)**

| Keyword | Volume | Difficulty |
|---------|--------|------------|
| is [company] docs agent-ready | <100 each × 200+ pages | None |
| [company] API documentation score | <100 each | None |
| Stripe vs Twilio documentation | 50–150 | Very Low |

**Estimated total addressable traffic:** 30K–50K monthly visits within 12 months, potential for 100K+ as category matures.

### Page Architecture

```
agentscore.dev/
├── /leaderboard                        (main leaderboard, sortable/filterable)
├── /leaderboard/payments               (category pages)
├── /leaderboard/ai-ml
├── /leaderboard/developer-tools
├── /leaderboard/infrastructure
├── /leaderboard/...
│
├── /agentscore/stripe                  (200+ individual company pages)
├── /agentscore/twilio
├── /agentscore/openai
├── /agentscore/...
│
├── /compare/stripe-vs-twilio           (20-30 head-to-head comparison pages)
├── /compare/openai-vs-anthropic
│
├── /check                              (free tool — lead magnet)
├── /check/results/[hash]               (shareable results)
│
├── /methodology                        (scoring explanation)
├── /methodology/llms-txt               (8 category deep-dives)
├── /methodology/markdown
├── /methodology/...
│
└── /blog/                              (content marketing)
    ├── state-of-agent-ready-docs-2026
    └── [topical posts]
```

**Total pages at launch: ~250–300** (200+ company pages, 10–15 category pages, 20–30 comparison pages, 8 methodology pages, blog posts)

### Individual Company Page Template (SEO-critical)

1. **Hero:** Company name, logo, overall score, letter grade, "last checked" date
2. **Score breakdown:** Visual scorecard — pass/warn/fail for each of 21 checks
3. **Category analysis:** 2–3 auto-generated sentences per category explaining results
4. **Recommendations:** Specific, actionable improvements (auto-generated from failed checks)
5. **Historical trend:** Score-over-time chart (once re-scans run monthly)
6. **Comparison CTAs:** "See how Stripe compares to Twilio" / "See all payment APIs"
7. **Bottom CTA:** "Want to improve your score? Fern generates agent-ready docs automatically."

**Unique content per page:** 800–1,200 words (unique combination of 21 check results generates genuinely unique analysis text).

**Meta tags template:**
- Title: `[Company] Agent Score: [Score]/100 | How Agent-Ready Are [Company] Docs?`
- Description: `[Company] documentation scores [Score]/100 on agent-friendliness. See detailed results across llms.txt, markdown, page size, and 5 more categories.`
- OG Image: Dynamic card — company name, score, letter grade, mini radar chart

### Technical SEO

- **Schema markup:** `WebApplication` (checker tool), `Dataset` (leaderboard), `Review` (score pages), `FAQPage` (methodology), `BreadcrumbList`
- **Sitemaps:** Separate sub-sitemaps for scores, comparisons, methodology, blog. Auto-update on re-scans.
- **SSR:** Server-side rendering for all score pages (critical for Google indexing)
- **Core Web Vitals:** LCP <2.5s, CLS <0.1, INP <200ms
- **Internal linking:** Every company page links to category leaderboard, comparisons, methodology

---

## 9. Launch Strategy

### Pre-Launch (Weeks 1–2)

**Seed the leaderboard:**
- Run afdocs against 200+ documentation sites
- Curate results, verify edge cases, fix scoring bugs
- Ensure Fern customers score well (validates the "Fern helps" narrative)
- Generate all company pages, comparison pages, category pages

**Prepare content:**
- Launch blog post: "Introducing Agent Score: How Agent-Ready Are Your Docs?" with key findings ("Only 23% have a valid llms.txt")
- Twitter/X thread draft (10–12 tweets)
- Hacker News "Show HN" post
- Product Hunt listing
- 2-minute demo video
- Shareable OG images and score badges

**DevRel influencer outreach:**
- Send personalized preview emails to 30–50 DevRel professionals at scored companies: "We scored [Company]'s docs — here's what we found"
- Reach out to newsletter authors (TLDR, Bytes, Changelog) for launch-day coverage
- Brief 3–5 friendly journalists (The New Stack, InfoWorld)

**Critical:** Engage Dachary Carey early. Share the plan, offer co-branding, discuss partnership structure.

### Launch Day (Week 3 — target Tuesday or Wednesday)

| Time (PT) | Channel | Action |
|-----------|---------|--------|
| 6:00 AM | Hacker News | "Show HN: Agent Score — We scored 200+ docs sites on agent-friendliness" |
| 8:00 AM | Twitter/X | 10-tweet data thread: "We scored 200+ API docs. The results are rough." |
| 9:00 AM | LinkedIn | Business-framed posts from Fern company page + founder accounts |
| 12:01 AM | Product Hunt | Launch in Developer Tools category |
| 9:00 AM | Email | Blast to Fern's existing customer/prospect list |

**Hacker News strategy:**
- Lead with data, not product pitch: "Only 23% have a valid llms.txt. Here's the leaderboard."
- 2–3 team members ready to answer questions for 4 hours
- Acknowledge limitations: "14 of 21 checks implemented; the remaining 7 are stubbed"

**Twitter thread structure:**
1. Hook: "We scored 200+ API docs for agent-friendliness. The results are... not great."
2. Key stat: "Average score: 41/100. Only 23% have llms.txt."
3. Winner reveal: "Best score: [Company] at 94/100. Here's why..."
4. Surprising low scorer (tactful)
5–8. Category highlights with specific examples
9. "Check your own docs for free: [link]"
10. "Built by @buildwithfern, now part of @getpostman"
- Tag high-scoring companies (they will retweet)

### Post-Launch (Weeks 3–4)

**Company-specific outreach (Days 2–7):**
- High scorers (80+): "Congratulations! Here's your badge to embed."
- Medium (50–79): "Here are 3 specific improvements that could push you above 80."
- Low (<50): "We found opportunities to make your docs more agent-friendly."

**Content amplification (Days 3–14):**
- Blog: "The 10 Most Agent-Friendly API Docs in 2026"
- Blog: "5 Quick Wins to Make Your Docs Agent-Ready"
- Cross-post to dev.to, Hashnode, Medium
- Submit to r/programming, r/webdev, r/devops, r/machinelearning
- Podcast outreach: Changelog, Software Engineering Daily

**Follow-up PR:**
- Pitch "State of Agent-Ready Docs" findings to The New Stack, TechCrunch
- Offer exclusive data to 1–2 outlets

---

## 10. Viral Mechanics

### Shareable Score Badges (V2)
```
[Agent Score: A+ (94/100)]  — green
[Agent Score: B  (72/100)]  — yellow
[Agent Score: D  (38/100)]  — red
```
- Embed code (HTML, Markdown) on each company's score page
- Badges link back → free backlinks from high-authority doc sites
- If 15–20% of high-scoring companies embed → 30–40 backlinks

### "Check Your Docs" Tool as Lead Magnet
1. Enter URL (no gate) — captures intent
2. See score + high-level results (no gate) — creates desire
3. "Get detailed report with recommendations" — email gate
4. Retargeting pixel fires on all visitors

### Competitive Framing
- Comparison pages: "Stripe vs Twilio: Who Has More Agent-Ready Docs?"
- Twitter polls: "Which API docs do you think scored higher?"
- Monthly "Biggest Improver" award

### Recurring Reports
- **Monthly:** Re-scan all 200+ companies, publish "Agent Score Monthly Update" with biggest movers
- **Quarterly:** Full "State of Agent-Ready Docs" report with trends, industry breakdowns
- **Annually:** Comprehensive report designed for maximum PR value

### Social Proof Loops
- Tweet when companies improve: "[Company] just went from 54 to 82! Here's what they changed."
- "Hall of Fame" for 90+ companies
- "Agent Score Certified" designation for 90+ sites

---

## 11. Content Marketing Plan

### Tier 1: Launch Content

| Content | Format | Distribution |
|---------|--------|-------------|
| "Introducing Agent Score: The First Benchmark for Agent-Ready Documentation" | Blog post | Fern blog, Postman blog, HN, Twitter, LinkedIn |
| "We Scored 200 API Docs Sites — Here's What We Found" | Video (2–3 min) | YouTube, embedded in blog, clips for social |
| Launch thread | 10-tweet thread | Twitter/X |

### Tier 2: Evergreen / SEO Content (Months 1–3)

| Title | Target Keyword | Format |
|-------|---------------|--------|
| "The State of Agent-Ready Documentation 2026" | agent-ready documentation report | Downloadable PDF + interactive web |
| "What is llms.txt? The Complete Guide for API Teams" | llms.txt | Long-form blog + diagram |
| "Why AI Agents Can't Read Your Documentation" | agent-friendly documentation | Blog post |
| "The 21 Checks Every Docs Site Needs for Agent Readiness" | agent-ready docs checklist | Listicle + checklist PDF |
| "Page Size and AI Agents: Why Your 150KB Page Is Invisible" | documentation page size | Technical blog |
| "Content Negotiation for Docs: Serving Markdown to Agents" | content negotiation markdown | Tutorial |
| "llms.txt vs. robots.txt vs. sitemap.xml" | llms.txt vs robots.txt | Comparison post |
| "How to Score 90+ on Agent Score: A Step-by-Step Guide" | improve agent score | Tutorial |

### Tier 3: Company Spotlights (ongoing, 2/week)

- "How [Company] Scores on Agent Readiness"
- Launch batch prioritized:
  - **High scorers (Fern customers):** ElevenLabs, Square, Webflow
  - **High scorers (non-customers):** Stripe, Cloudflare, Anthropic (credibility through praising non-customers)
  - **Surprising mid-scorers:** Choose carefully — "even great companies have room to improve"

### Tier 4: Co-Marketing & Guest Content (Months 2–6)

- **Dachary Carey collaboration:**
  - Co-authored: "From Spec to Score: How We Built the Agent-Friendly Documentation Benchmark"
  - Guest post on Fern blog: "Why I Built the Agent-Friendly Docs Spec"
  - Joint webinar: "Making Your Docs Agent-Ready: A Live Scoring Session"
- **Guest posts:** The New Stack, InfoQ, Dev.to, Postman blog
- **Podcast appearances:** Fern founder + Dachary on Changelog, Software Engineering Daily

---

## 12. Social Media Strategy

### Twitter/X (3–5 tweets/week)

- **"Score of the week"** — spotlight one company's score
- **Data drops** — "Only 27% of top 200 docs sites have a valid llms.txt"
- **Quick tips** — "Want to improve your Agent Score? Start here: add llms.txt"
- **Community engagement** — retweet/comment on anyone discussing agent-friendly docs
- **Improvement callouts** — congratulate companies that ship llms.txt improvements

### LinkedIn (2–3 posts/week)

- Thought leadership from founders: "The docs team is about to become the most strategic team in your API organization"
- Data insights from Agent Score
- Celebrate high-scoring companies publicly (they reshare)
- Monthly long-form articles

### Reddit (authentic, value-first)

| Subreddit | Angle |
|-----------|-------|
| r/programming | "I built a tool that scores how well docs work for AI agents. Here's what I learned." |
| r/webdev | "TIL most docs sites are invisible to AI agents. Here's why." |
| r/ExperiencedDevs | "For Cursor/Copilot users: agent quality varies by API. We measured why." |
| r/devops | "21 checks to make internal docs work with AI coding tools." |

### Hacker News

Best format: "Show HN: Agent Score — We scored 200+ docs sites on AI-agent readiness." Link directly to the live site. Top comment explains methodology, shares surprising findings, acknowledges limitations, emphasizes open-source tooling.

---

## 13. Paid Acquisition & Budget

### Total Budget Recommendation

| Period | Monthly Budget |
|--------|---------------|
| Month 1 (Launch) | $8,000–10,000 |
| Months 2–3 (Ramp) | $12,000–15,000/month |
| Months 4–6 (Optimize) | $15,000–18,000/month |
| Months 7–12 (Scale) | $18,000–25,000/month |
| **Year 1 Total** | **$180,000–240,000** |

### Channel Allocation (Steady State, Months 4+)

| Channel | Monthly | % | Goal |
|---------|---------|---|------|
| Google Ads (Search) | $5,000–6,000 | 30% | Capture intent-driven traffic |
| LinkedIn Ads | $4,000–5,000 | 25% | Target decision-makers (VP Eng, CTO, DevRel) |
| Twitter/X Ads | $2,000–3,000 | 15% | Dev community awareness |
| Reddit Ads | $1,500–2,000 | 10% | Subreddit-targeted awareness |
| Newsletter Sponsorships | $3,000–5,000 | 20% | TLDR, Bytes, Changelog |
| **Total** | **$15,500–21,000** | 100% | |

### Google Ads Detail

**Campaign 1: Tool Keywords (highest intent)**

| Keyword | Est. CPC | Monthly Budget | Est. Clicks |
|---------|----------|---------------|-------------|
| llms.txt checker | $1.50–2.50 | $400 | 180–270 |
| llms.txt validator | $1.50–2.50 | $300 | 130–200 |
| agent-friendly docs checker | $2.00–3.00 | $300 | 100–150 |
| documentation score tool | $2.00–3.50 | $300 | 90–150 |

**Campaign 2: Problem-Aware (medium intent)**

| Keyword | Est. CPC | Monthly Budget | Est. Clicks |
|---------|----------|---------------|-------------|
| AI-ready documentation | $3.00–5.00 | $500 | 100–170 |
| llms.txt how to create | $2.00–3.50 | $400 | 115–200 |
| API docs for AI agents | $3.00–5.00 | $500 | 100–170 |

**Campaign 3: Category Keywords (brand building)**

| Keyword | Est. CPC | Monthly Budget | Est. Clicks |
|---------|----------|---------------|-------------|
| API documentation best practices | $4.00–7.00 | $600 | 85–150 |
| developer documentation tools | $5.00–8.00 | $500 | 60–100 |

**Google total:** $5K–6K/month → ~1,000–1,800 clicks/month → **$25–50 cost per lead**

### LinkedIn Ads Detail

- **Targeting:** VP Eng, CTO, DevRel Manager, Developer Advocate, Technical Writer, API PM. Company size 50–10K. Industries: SaaS, Fintech, AI/ML.
- **Formats:** Sponsored Content (single image $2K, carousel $1K), Text Ads ($500), Conversation Ads/InMail ($1K)
- **Expected:** CPC $5–8, CTR 0.4–0.8%, **$60–120 cost per lead**, 35–75 leads/month

### Twitter/X Ads Detail

- Promoted posts (top organic) $1K, Follower campaign $500, Website traffic to checker $1K
- **Expected:** CPC $1–2, **$15–35 cost per lead**

### Reddit Ads Detail

- Promoted posts in dev subreddits: $1.5K/month
- **Expected:** CPC $1–2.50, **$20–40 cost per lead**

### Newsletter Sponsorships

| Newsletter | Audience | Cost/Placement | Frequency |
|-----------|---------|---------------|-----------|
| TLDR (main) | 1.4M+ devs | $10K–15K | 1x/quarter (launch) |
| TLDR Web Dev | 400K devs | $3K–5K | 1x/month |
| Bytes.dev | 250K JS devs | $2K–4K | 1x/quarter |
| Changelog Weekly | 500K devs | $2K–3.5K | 1x/quarter |
| Postman newsletter | Internal | $0 (Postman synergy) | 1x/month |
| Console.dev | 30K dev tools | $500–1K | 1x/month |

**Launch month:** Invest heavily in TLDR main ($15K) for maximum visibility.

### Retargeting

- Pixels on all pages (Google, LinkedIn, Twitter, Meta)
- Segments: visited leaderboard but didn't check → used checker but no email → provided email but no demo
- Budget: $1.5K–2K/month (included in channel budgets above)

---

## 14. Conversion Funnel & Lead Generation

### Funnel Architecture

```
AWARENESS → ENGAGEMENT → ACTIVATION → CAPTURE → CONSIDERATION → CONVERSION
   |             |            |           |            |              |
 Organic     Leaderboard   "Check     Email for    "Improve      Demo
 search,     browsing,     your       detailed     with Fern"    request
 social,     company       docs"      report       CTA
 PR, ads     pages         tool
```

### Expected Conversion Rates

| Stage | Metric | Month 3 | Month 6 | Month 12 |
|-------|--------|---------|---------|----------|
| Visitors | Monthly unique | 12,000 | 35,000 | 80,000 |
| Engaged | 2+ pages | 5,400 (45%) | 17,500 (50%) | 44,000 (55%) |
| Checker users | Used free tool | 720 (6%) | 2,800 (8%) | 8,000 (10%) |
| Email captures | Provided email | 215 (30%) | 980 (35%) | 2,800 (35%) |
| Fern page visits | Clicked "Improve with Fern" | 43 (20%) | 196 (20%) | 700 (25%) |
| Demo requests | Requested demo | 9 (20%) | 39 (20%) | 140 (20%) |
| Customers | Closed | 2 (22%) | 9 (23%) | 35 (25%) |

### CTA Placement Strategy

**On the leaderboard:**
- Banner: "Built by Fern — the docs platform that makes your docs agent-ready by default"
- Footer: "Want to score in the top 10? See how Fern gets you there."
- Subtle: "Fern Docs customers average a score of [X]"

**On individual score pages (tailored by score):**
- Score 80+: "Your docs are great. Fern maintains this score automatically."
- Score 50–79: "You're close. Fern can fix [specific failures] and push you above 80."
- Score <50: "Your docs need work. Fern serves llms.txt, markdown, and more — out of the box."
- For each failing check, expandable "How to fix this" section. Where Fern handles it automatically: "Fern Docs handles this automatically. [Learn more →]"

**On the free checker results:**
- Primary: "Get your full report with recommendations" (email gate)
- Secondary: "See how Fern can improve your score"
- Tertiary: "Share your score" (social buttons)

**Persistent:**
- "Powered by Fern" in footer
- Fern logo in nav
- "Agent Score by Fern" branding throughout

---

## 15. Outreach & Partnerships

### Dachary Carey Partnership (CRITICAL)

This is the single most important relationship. Without Dachary, Agent Score is "Fern's proprietary scoring." With her, it's "the industry standard, powered by Fern."

- Engage early and transparently — share the plan before launch
- Co-branding: "Built on the Agent-Friendly Documentation Spec by Dachary Carey"
- Formal partnership: Fern sponsors afdocs development, Dachary gets attribution + voice in methodology
- Contribute upstream: submit PRs to afdocs, not fork
- Co-present at conferences, joint content

### Direct Outreach Templates

**High-Score Email (80+)**
> Subject: Your docs scored [X]/100 on agent readiness — that's exceptional
>
> Hi [Name], We recently launched Agent Score, a public benchmark for agent-ready documentation. [Company]'s docs scored [X]/100, putting you in the top [Y]% of 200+ sites. Your [specific strength] is something most sites haven't implemented. We'd love to feature [Company] in our Agent-Ready Documentation Spotlight series. Would that be of interest?

**Low-Score Email (<40)**
> Subject: How AI agents experience [Company]'s docs — free assessment
>
> Hi [Name], We launched Agent Score to measure how well docs work for AI coding agents. [Company]'s score is [X]/100 — in line with the industry average. The three highest-impact improvements: [1] [2] [3]. These are straightforward fixes. Happy to walk through the details.

### DevRel Influencer List (Top 12)

| Person | Platform | Engagement |
|--------|----------|-----------|
| Dachary Carey | Blog, social | Deep partnership (creator of spec) |
| Angie Jones | Twitter, conferences | Score her employer's docs |
| Cassidy Williams | Twitter, YouTube | Personalized score of associated companies |
| Kelsey Hightower | Twitter | Tag in data tweets |
| Kin Lane | API Evangelist | Exclusive early data |
| Phil Sturgeon | APIs You Won't Hate | Review scoring methodology |
| Swyx (Shawn Wang) | Twitter, blog | Perfect audience overlap — send data |
| Taylor Barnett | Twitter | Direct outreach with employer's score |
| James Governor (RedMonk) | Analyst reports | Briefing with exclusive data |
| Mary Thengvall | DevRel community | LinkedIn business-case framing |
| Adam DuVander | EveryDeveloper | Expert source for annual report |
| Jason Lengstorf | YouTube, Twitch | Live scoring session on his stream |

### Twitter/X Influencer Outreach List (20 Additional Profiles)

**Engagement strategy:** Score each person's company's docs, then tag them with the results. People who score well will amplify ("We're Agent Score Certified!"). People who don't will quietly fix their docs and come back.

#### Tier 1 — Score Their Company's Docs and Tag Them (Highest Conversion)

| Person | Handle | Followers | Company | Engagement |
|--------|--------|-----------|---------|------------|
| Ian McCrystal | @ianmst | Niche | Stripe (AI DX Lead) | Score Stripe's docs — he added llms.txt there. If Stripe scores well, he'll amplify as validation |
| Lincoln Murr | @MurrLincoln | Moderate | Coinbase (DevPlatform AI Lead) | Score Coinbase dev docs — he implemented llms.txt at Coinbase |
| Logan Kilpatrick | @OfficialLoganK | ~1.4M | Google AI Studio / Gemini API | Score Gemini API docs and tag him — he's responsive to developer feedback |
| Lee Robinson | @leerob | ~224K | Cursor (Head of AI Education) | Frame as "Before you point Cursor at an API, check if the docs are agent-ready" |
| Philipp Schmid | @_philschmid | ~62K | Google DeepMind (ex-HuggingFace) | Tweeted about llms.txt directly — show how Agent Score goes beyond it |

#### Tier 2 — Share Data/Leaderboard, Invite Reaction (Thought Leaders Who Amplify)

| Person | Handle | Followers | Why | Engagement |
|--------|--------|-----------|-----|------------|
| Simon Willison | @simonw | ~132K | Most trusted indie voice on LLM tooling | Send early dataset — he'll likely write a blog post analyzing results |
| Gergely Orosz | @GergelyOrosz | ~318K | Pragmatic Engineer (1.1M newsletter subs) | Pitch exclusive data story: "We scored 200 API doc sites" |
| Addy Osmani | @addyosmani | ~355K | Google Cloud AI, wrote "Beyond Vibe Coding" | Tag with Google ADK docs score — he cares about AI dev benchmarks |
| Andrej Karpathy | @karpathy | ~1.7M | Coined "vibe coding," ex-OpenAI/Tesla | Frame results as data supporting his thesis on the vibe coding era |
| Theo Browne | @theo | ~300K | T3 Chat CEO, dev YouTuber | Share leaderboard — he loves ranking/comparing tools. Offer live scoring session |

#### Tier 3 — Strategic / Coopetition (Industry Positioning)

| Person | Handle | Followers | Company | Engagement |
|--------|--------|-----------|---------|------------|
| Han Wang | @handotdev | Growing | Mintlify CEO (a16z-backed docs platform) | Score Mintlify-powered docs fairly — coopetition play |
| Gregory Koberger | @gkoberger | Moderate | ReadMe CEO | Score ReadMe-powered docs — decade of API docs thought leadership |
| Abhinav Asthana | @a85 | ~12.5K | Postman CEO | Score Postman docs — frame as supporting his "API-first, now agent-first" narrative |
| Guillermo Rauch | @rauchg | ~303K | Vercel CEO | Score Vercel docs — reference their inline `text/llms.txt` proposal |

#### Tier 4 — Broad Reach Amplifiers (Share Data That Supports Their Narrative)

| Person | Handle | Followers | Why | Engagement |
|--------|--------|-----------|-----|------------|
| Allie K. Miller | @alliekmiller | ~2M | #1 AI business voice, reaches enterprise decision-makers | Frame as enterprise readiness signal |
| Greg Isenberg | @gregisenberg | Large | Startup ideas podcaster | Frame Agent Score as insight: "APIs with agent-ready docs get more AI integrations" |
| Peter Steinberger | @steipete | Massive | OpenClaw creator, now at OpenAI | Score OpenClaw + popular framework docs |
| Riley Brown | @rileybrown_ai | ~163K | "Vibecode king," builds entirely with AI agents | Frame as essential for vibe coders |
| Shubham Saboo | @Saboo_Shubham_ | ~103K | Google AI PM, tweeted about ADK's llms.txt | Tag when scoring Google ADK docs |
| Lars Grammel | @lgrammel | Niche | Vercel AI SDK engineer | Score Vercel AI SDK docs — he tweeted "llms.txt is great for AI SDK docs" |

### Conference Strategy

| Conference | Action | Est. Cost |
|-----------|--------|-----------|
| API Platform Conference (Sep 2026, Lille) | Talk + sponsor (CFP closes March 22 — **URGENT**) | $5K–8K |
| DevRelCon NY | Talk: "What 200 Docs Sites Tell Us About the Future of DevRel" | $5K–8K |
| Write the Docs Portland | Lightning talk + community table | $2K–3K |
| API World (Oct 2026) | Full talk: "State of Agent-Ready API Docs" | $5K–8K |
| AI Engineer World's Fair | Booth + demo | $8K–15K |
| Postman POST/CON | Home-field presentation | Internal |
| DeveloperWeek (Feb 2027) | Speaking slot + sponsor | $3K–5K |

**Total conference budget (Year 1): $25K–40K**

---

## 16. PR Strategy

### Primary Press Angle
**"First-ever industry benchmark reveals [X]% of API documentation fails basic agent-readiness checks"**

Frame around the data, not the product. Journalists cover findings. The story is "most documentation is invisible to AI agents" — Agent Score is the source.

### Target Publications

**Tier 1:** Hacker News (self-submitted), TechCrunch, The New Stack, InfoQ
**Tier 2:** Dev.to, API Evangelist, Smashing Magazine
**Tier 3:** RedMonk, Business Insider (broader narrative: "AI is creating a new web most companies aren't ready for")

### Executive Thought Leadership

Fern founders publish 1–2 LinkedIn/blog posts per month:
- "Why we built Agent Score"
- "What Postman's 30M developers taught us about the agent documentation gap"
- "Agent readiness is the new SEO"
- Podcast circuit: Software Engineering Daily, Changelog, API Intersection

---

## 17. Email Marketing

### Lead Nurture Sequence (Post-Score-Check)

| Email | Timing | Subject | Content |
|-------|--------|---------|---------|
| 1 | Immediate | "Your Agent Score: [X]/100 — here's what it means" | Score summary, top 3 findings, link to breakdown |
| 2 | Day 3 | "The #1 thing agents struggle with on your docs" | Deep-dive on lowest-scoring category |
| 3 | Day 7 | "How [high scorer in their industry] scores [X]/100" | Company spotlight from their vertical |
| 4 | Day 14 | "3 fixes that would raise your score by [Y] points" | Specific recommendations. Soft mention: "Fern handles this automatically" |
| 5 | Day 21 | "Your docs vs. your competitors'" | Anonymous comparison against industry averages. First hard Fern CTA |

### Monthly "Agent Score Digest" Newsletter

Sections:
1. **Score of the Month:** Spotlight one company that improved
2. **Industry Benchmark:** Average scores by vertical + trend
3. **New Check Alert:** When new checks ship, explain what they measure
4. **Top 10 Leaderboard:** Current top 10
5. **Quick Tip:** One implementable improvement
6. **Community:** Links to blog posts, talks, discussions

### Triggered Outreach

- **Company ships llms.txt:** "Noticed you just shipped llms.txt — nice work. Your updated score: [X]"
- **Score drops:** "Heads up: your Agent Score dropped from [X] to [Y]. Here's which check failed."
- **New API company launches:** "Scored your new docs — here's where you stand"

---

## 18. Competitive Moat

### Why Fern Should Own This

1. **Fern builds the thing being measured.** Unique credibility — they ship agent-friendly docs daily. Like a car manufacturer running safety testing, except the scoring is transparent, open-source, and reproducible.

2. **Open-source tool, proprietary leaderboard.** Anyone can run `npx afdocs check`. But the curated, pre-computed, SEO-optimized leaderboard with 200+ companies, historical tracking, and beautiful score pages — that's Fern's value-add.

3. **Customer base seeds credibility.** Fern customers (Square, ElevenLabs, Webflow) presumably score well → natural proof point: "Companies that use Fern score in the top 10."

4. **Fern + Postman = distribution.** Access to 30M+ Postman users. Leaderboard promoted through Postman's channels, integrated into Postman's platform.

5. **First-mover advantage.** Nobody else has this. Competitors (Mintlify, ReadMe, GitBook) would have to build their own (looks reactive) or acknowledge Fern's as the standard (benefits Fern).

### Defensibility Layers
- **Data moat:** Historical scoring data for 200+ sites cannot be replicated retroactively
- **Brand moat:** "Agent Score" becomes the standard reference, like "Lighthouse score"
- **SEO moat:** 200+ indexed pages with ongoing updates build domain authority
- **Relationship moat:** Companies that claim pages, embed badges, and engage create switching costs

---

## 19. Risk Assessment

### Risk 1: Companies Angry About Low Scores
**Likelihood:** High | **Impact:** Medium
**Mitigation:**
- Frame as constructive ("How to improve" on every page)
- Allow companies to request re-scans after improvements
- Objective, reproducible methodology — "Run it yourself and verify"
- Soft launch: share scores privately with top companies before going public
- Disclaimer on every page: "Scores reflect point-in-time automated assessment"

### Risk 2: Dachary Carey Relationship
**Likelihood:** Medium | **Impact:** High
**Mitigation:**
- Engage early and transparently before launch
- Co-branding + compensation for content contributions
- Contribute engineering to afdocs upstream
- afdocs is MIT-licensed (legal right to use), but invest in goodwill

### Risk 3: Gaming the Score
**Likelihood:** High | **Impact:** Medium
**Mitigation:**
- Checks are designed around real agent behavior — "gaming" mostly means actually improving docs
- Layered checks prevent superficial gaming (llms.txt exists + valid + sized + links resolve + links markdown)
- Evolve methodology over time; publish changelog
- Add harder-to-game checks (content parity, freshness, real-world agent success)

### Risk 4: afdocs Tool Accuracy / False Results
**Likelihood:** Medium | **Impact:** High
**Mitigation:**
- Manually verify top 20–30 highest-profile companies before launch
- Skip-adjusted scoring so unimplemented checks don't distort
- Confidence indicators: "Based on 14 of 21 checks"
- Feedback mechanism: "Think this score is wrong? Let us know."

### Risk 5: Rate Limiting / Blocking by Scanned Sites
**Likelihood:** Medium | **Impact:** Medium
**Mitigation:**
- afdocs has responsible defaults (200ms delay, max 3 concurrent, honors Retry-After)
- Scan during off-peak hours
- Cache aggressively; weekly re-scans max
- "Unable to scan" label (not a low score) for blocked sites

### Risk 6: Competitors Use Leaderboard Against Fern
**Likelihood:** Medium | **Impact:** Low (actually a win)
**Mitigation:**
- Embrace it — validates the leaderboard as the standard
- Ensure Fern's own platform produces top scores
- Lead gen mechanics capture value regardless of which platform powers top sites

### Risk 7: Low Traction
**Likelihood:** Medium | **Impact:** High
**Mitigation:**
- HN + PH + newsletter launch blitz
- Pre-seed influencers with high scores (they'll share)
- Controversial content: "We tested 200 sites. Most are failing."
- Postman distribution channel
- Monthly content cadence for sustained traffic

---

## 20. KPIs & Milestones

### Month 1

| KPI | Target | Stretch |
|-----|--------|---------|
| Companies scored | 200 | 300 |
| Site visitors | 15,000 | 30,000 |
| Checker tool uses | 500 | 1,500 |
| Email captures | 150 | 400 |
| Fern demo requests | 5 | 15 |
| HN front page | Yes | Top 5 |
| Product Hunt | Top 10 | Top 3 |
| Press mentions | 3 | 8 |
| Twitter impressions | 200K | 500K |

### Month 3

| KPI | Target | Stretch |
|-----|--------|---------|
| Companies scored | 350 | 500 |
| Monthly organic visitors | 12,000 | 20,000 |
| Monthly checker uses | 1,500 | 3,000 |
| Monthly email captures | 400 | 800 |
| Total email list | 1,000 | 2,000 |
| Monthly demo requests | 15 | 30 |
| Cumulative new customers | 5 | 12 |
| Referring domains | 50 | 100 |
| Badge embeds | 20 | 40 |

### Month 6

| KPI | Target | Stretch |
|-----|--------|---------|
| Companies scored | 500 | 750 |
| Monthly organic visitors | 35,000 | 60,000 |
| Monthly checker uses | 3,500 | 7,000 |
| Monthly email captures | 1,000 | 2,000 |
| Total email list | 4,000 | 8,000 |
| Monthly demo requests | 40 | 80 |
| Cumulative customers | 20 | 45 |
| Referring domains | 150 | 300 |
| Rank for "llms.txt checker" | Top 3 | #1 |
| Companies that improved score | 30 | 60 |

### Month 12

| KPI | Target | Stretch |
|-----|--------|---------|
| Companies scored | 1,000 | 1,500 |
| Monthly organic visitors | 80,000 | 150,000 |
| Monthly checker uses | 8,000 | 15,000 |
| Total email list | 20,000 | 40,000 |
| Monthly demo requests | 140 | 250 |
| Cumulative customers | 80 | 150 |
| Referring domains | 500 | 1,000 |
| Rank for "agent-friendly docs" | #1 | #1 |
| Conference talks delivered | 4 | 8 |
| Domain authority (Ahrefs DR) | 50 | 65 |

### What Success Looks Like

**At 6 months:** Agent Score is the go-to resource when anyone asks "how agent-friendly are my docs?" Ranks #1 for llms.txt checker queries. 20+ companies have actively improved their scores. 20+ customers attributable to Agent Score.

**At 12 months:** Industry standard. Companies proactively check before launching docs. "Agent Score" is as recognized in DevRel as "Lighthouse Score" is in web dev. Annual report cited by analysts. 80K+ monthly organic visitors. $500K+ pipeline for Fern/Postman annually.

---

## 21. Execution Timeline

| Week | Milestone |
|------|-----------|
| 1–2 | Finalize scoring methodology. Build batch scanner. Begin scanning 200 sites. Build leaderboard frontend (table, filters, search). |
| 2–3 | Build individual score pages (template + data). Build free score checker (queue + worker + UI). |
| 3–4 | QA: manually verify top 30 company scores. Write all launch content. |
| 4 | Reach out to Dachary Carey about partnership. |
| 4–5 | Soft launch: share with 10–15 DevRel contacts for feedback. Iterate. |
| 5–6 | **Public launch:** HN, blog, social, PH, PR, email blast. Begin company outreach. |
| 6–8 | Company spotlight series (2/week). Guest post submissions. Podcast outreach. |
| 8–10 | Publish "State of Agent-Ready Documentation 2026" report. PR push with aggregate data. |
| Month 3 | Conference talk submissions (API Platform Conference CFP deadline March 22 — **URGENT**). Begin V2 planning (badges, historical tracking, API). |
| Month 4–6 | V2 development + launch. Monthly newsletter cadence. Weekly social. Quarterly re-scans. |
| Month 6–12 | V3 planning (paid tier). Scale paid acquisition. Annual report. |

---

## 22. Full Budget Summary (Year 1)

| Category | Annual Budget |
|----------|--------------|
| **Paid Ads** | |
| Google Ads | $60,000–72,000 |
| LinkedIn Ads | $48,000–60,000 |
| Twitter/X Ads | $24,000–36,000 |
| Reddit Ads | $18,000–24,000 |
| Newsletter Sponsorships | $36,000–60,000 |
| **Events** | |
| Conferences/Speaking | $25,000–40,000 |
| **Other** | |
| PR/Media | $10,000–15,000 |
| Design/Creative (badges, reports, OG images) | $10,000–15,000 |
| **Total Year 1** | **$231,000–322,000** |

---

## Questions for Kapil

Before finalizing certain decisions, input needed on:

1. **Domain:** Preference for `agentscore.dev` vs `score.buildwithfern.com` vs something else?
2. **Relationship with Dachary:** Has Fern had any prior contact with her? Level of partnership to pursue?
3. **Fern customer scores:** Have you run afdocs against any Fern-powered docs sites yet? Need to confirm they score well before positioning "Fern = high scores."
4. **Postman distribution:** What Postman channels (newsletter, in-app, API network) can we leverage for launch?
5. **Internal engineering capacity:** How many weeks of eng time can we allocate to build the site + scanner infrastructure?
6. **Paid budget comfort level:** The plan proposes $230K–320K/year. Is that within range, or should we adjust?
7. **API Platform Conference CFP:** Closes March 22, 2026 — should we submit a talk? If so, who presents?
8. **Timeline priority:** Is 6 weeks to launch aggressive enough, or do we want to move faster?

---

## References

- [Agent-Friendly Documentation Spec](https://agentdocsspec.com/)
- [afdocs on npm](https://www.npmjs.com/package/afdocs)
- [afdocs on GitHub](https://github.com/agent-ecosystem/afdocs)
- [Dachary Carey — Agent-Friendly Docs](https://dacharycarey.com/2026/02/18/agent-friendly-docs/)
- [Dachary Carey — LLMs vs Agents as Docs Consumers](https://dacharycarey.com/2026/02/26/llms-vs-agents-as-docs-consumers/)
- [SEAL LLM Leaderboards — Scale AI](https://scale.com/leaderboard)
- [Fern — SDKs and Docs for your API](https://buildwithfern.com/)
- [llms.txt Specification](https://llmstxt.org/)
