# Launch HN Draft

---

**Please say in one sentence what your company does.**

Fern builds tools that make API documentation readable by AI agents, so developers using Cursor, Claude, and ChatGPT can discover and call your APIs without opening a browser tab.

---

**Describe again what your company does — but phrase it differently.**

We help API companies become visible to the fastest-growing segment of their user base: AI coding agents that read documentation millions of times a day.

---

**Why do you want to launch on HN? What would make it successful for you?**

HN is where the developers and engineering leaders who own API documentation spend time. A successful launch means getting Agent Score in front of teams who haven't thought about AI-agent readiness yet. We'd consider it a win if companies we've never spoken to score their docs and reach out.

---

**What's the current status of your product? Will it exist in a public form that HN users can try out?**

Yes. Agent Score is live at buildwithfern.com/agent-score. Anyone can paste a docs URL and get a score in under 60 seconds, no signup required. We've already scored 87 companies and the full leaderboard is public.

---

**What pain does your product solve? Why does it matter?**

AI coding agents are now a primary way developers discover and integrate APIs. But most documentation was written for humans: it assumes you can click around, follow links, read context. Agents can't do that reliably. If your docs don't have an `llms.txt`, aren't structured in clean markdown, or hide authentication details behind logins, agents can't use your API. Developers using those agents will reach for a competitor whose docs work. You don't get an error. You just get ignored.

---

**What is your backstory? Where were you when you encountered this problem?**

Fern has been building API documentation infrastructure for years: SDK generators, API reference sites, developer portals. When coding agents took off in late 2023 and 2024, customers started asking whether their docs were ready for it. We had no good answer. We started auditing manually and realized there was no standard, no benchmark, no score. The Agent-Friendly Documentation Spec (built by Dachary Carey) gave us the framework. We built Agent Score to make it measurable.

---

**How does your product solve the problem?**

Agent Score runs 22 automated checks across 7 categories: discoverability (does `llms.txt` exist?), content format (is it clean markdown?), page structure (is navigation machine-readable?), authentication (are docs publicly accessible?), API reference quality, SDK availability, and observability. You get a score from 0 to 100, a letter grade, and a breakdown of exactly what's failing and why. The whole thing runs in under 2 minutes.

---

**What makes the problem hard to solve?**

Two things. First, there's no single standard for what "agent-readable" means, so we had to define it. The Agent-Friendly Documentation Spec is the result of research across real agent behavior and failure modes. Second, documentation structure varies wildly: some companies use hosted platforms (Fern, Mintlify, ReadMe), some hand-roll HTML, some use Notion or GitHub wikis. Writing checks that work reliably across all of these is genuinely hard.

---

**Where were you when you realized how to solve it?**

Watching a Claude Code session fail to call an API correctly because the auth docs were behind a login wall, and realizing the developer had no idea why it was failing. The problem wasn't the agent. It was the docs. That's when we knew a score was the right output: simple enough to share, specific enough to act on.

---

**What's different about your solution?**

Most "AI readiness" tools are checklists you fill out manually. Agent Score is fully automated: paste a URL, get a grade. It's built on an open spec, so the scoring criteria are transparent and forkable. And unlike generic SEO tools retrofitted for AI, we built this specifically for API documentation and AI coding agents.

---

**How does your product work? Technical details are good.**

We fetch the docs URL, crawl key pages, and run 22 checks using the open-source `afdocs` CLI. Checks include fetching and parsing `llms.txt`, validating markdown structure, checking for authentication barriers, detecting SDK links and API reference pages, and testing `robots.txt` for agent access. Results are stored in Supabase. Scoring is 0 to 100 with a weighted pass/warn/fail model per category, bucketed into letter grades. The pipeline runs server-side in under 2 minutes for most sites.

---

**What are the most surprising or little-known details you've learned?**

- Most companies score between 40 and 70. Very few have thought about `llms.txt` at all.
- Docs that require login to view the API reference are common among large enterprises, and agents simply cannot use them.
- Some of the highest-scoring docs belong to companies you'd expect (Stripe, Anthropic). Some of the lowest belong to well-funded, well-known API companies whose docs look great to humans and are nearly useless to agents.
- "Clean markdown" is harder than it sounds. Many platforms render markdown to HTML and serve that. Agents want the source.

---

**Do you have credentials or experience relevant to this problem?**

Fern has spent years building API documentation tooling for hundreds of API companies. We've seen what makes docs succeed and fail at scale. Dachary Carey, who authored the Agent-Friendly Documentation Spec, has deep experience in developer documentation standards.

---

**What weird or surprising things have you learned while working on this?**

Docs that look beautiful to humans are often the worst for agents: heavy JavaScript rendering, no clean text, navigation hidden in dropdowns. Plain, boring docs often score higher. The more "designed" the docs experience, the harder it is for an agent to parse.

---

**What are some examples of what customers have used your product to do?**

- Engineering teams have shared their Agent Score internally to make the case for documentation investment.
- Developer relations teams have used the leaderboard to benchmark against competitors.
- Companies have fixed their `llms.txt` and re-run their score within hours of seeing their result.

---

**How will you make money?**

Agent Score is top-of-funnel for Fern's core product. Companies that score poorly and want to fix it can use Fern to rebuild their docs to be agent-ready by default. Fern charges for hosted docs, SDK generation, and developer portals.

---

**Is pricing transparent on your website?**

Fern's pricing is at buildwithfern.com. Agent Score is free.

---

**What user data do you collect and what tracking does your product do?**

Agent Score stores the URL you submit, the resulting score, and check results to power the public leaderboard. We don't require an account or collect personal information to run a score. The "book a demo" form collects an email if you choose to submit one. We don't sell data.

---

**Is your product open source?**

The Agent-Friendly Documentation Spec is open source (GitHub: agent-ecosystem/agent-docs-spec). The `afdocs` CLI is also open source. The Agent Score web application is not.

---

**Do you have a demo video?**

[TODO: add link]

---

**Have you posted about this on HN before?**

[TODO: check and fill in]

---

**Has your startup done a Launch HN before?**

[TODO: fill in]

---

**Have you done a Launch Bookface and/or Launch YC?**

[TODO: fill in if applicable]
