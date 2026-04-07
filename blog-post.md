**I built a Lighthouse-style benchmark for AI-agent readiness, ran it on our own docs, and shipped the fixes in public. Here's what I found.**

> **TL;DR** AI agents are reading your API docs, and most docs aren't built for them. Not because the content is bad, but because the scaffolding around it breaks for non-human readers. I partnered with Dachary Carey to build [Agent Score](https://labs.buildwithfern.com/agent-score), a free, open-source benchmark that grades your docs 0–100 on agent-readiness. I ran it on our own docs, found three structural gaps, shipped the fixes publicly, and reached the top of the leaderboard. Your run takes 30 seconds.

## The invisible audience

Your docs can look great (well-designed, good IA, clean writing) and still be broken for the audience that's growing fastest. Developers increasingly get their information through AI agents, not by browsing your site. If an agent can't parse your docs, those developers get hallucinated answers or nothing at all, and you never know it happened.

That's what makes this problem so hard to see. JavaScript-rendered docs return an empty shell. Auth walls return a login form instead of a 401. Bloated HTML burns the token budget before reaching a single endpoint description. The agent doesn't throw an error. It just answers anyway, with whatever it can hallucinate.

Sometimes the problem is the content, but more often it's the scaffolding around it: how pages render, how agents discover them, whether the structure is parseable at all. Great writing doesn't help if the delivery mechanism is invisible to a non-human reader.

No error logs. No bounce rate spike. Just developers getting bad suggestions and integrations that never get built.

[Alex Atallah](https://www.linkedin.com/in/alexatallah/), CEO of [OpenRouter](https://openrouter.ai):

> "At OpenRouter we see firsthand how much traffic comes through AI coding agents. If your docs aren't well-indexed and agent-optimized, you're invisible to the fastest-growing buyer segment."

## What agents actually need: the AFDocs standard

I found Dachary through [LinkedIn](https://www.linkedin.com/in/dacharyc/). She was publishing some of the most rigorous, well-researched content on agent-friendly documentation I had seen anywhere. While the rest of the industry was still debating whether this mattered, she was already deep in the empirical work.

![Dachary Carey LinkedIn post about the Agent-Friendly Docs Spec](placeholder-dachary-linkedin.png)

Dachary has spent the past few months researching how AI agents actually consume documentation. Not in theory, but empirically: validating hundreds of coding patterns across languages and agent platforms, reverse-engineering how tools like [Claude Code](https://claude.ai/code) fetch and truncate HTML, and documenting the access patterns that work and the ones that silently fail.

She kept finding the same structural failures across documentation sites, so she started codifying what agents actually need into a testable, open-source standard: [AFDocs (the Agent-Friendly Docs Spec)](https://afdocs.dev/). It defines 22 checks across 7 categories, every one transparent and community-driven.

The checks cover the full surface area of the problem. Can agents discover your docs at all? Do they get clean markdown or a wall of CSS? Will your pages fit in a context window, or does the agent silently work with a truncated version? Do your URLs resolve cleanly? Do auth walls block access? Are tabs and code blocks still parseable when there's no browser to render them?

`llms.txt` is one of the most foundational checks: a simple index file that gives agents a map of your documentation. 73% of top API docs sites still lack one. Without it, an agent approaching your docs cold may find your OpenAPI spec, or it may not. It may find your authentication guide, or it may hallucinate one based on similar APIs in its training data. But `llms.txt` alone isn't enough. A site can have a perfect index and still fail if its pages are too bloated to parse or its content is locked behind client-side rendering.

## Agent Score: making it measurable

I partnered with Dachary to make the standard measurable. Agent Score is the result: a Lighthouse-style benchmark that takes any docs URL, runs it against the full AFDocs spec, and returns a score from 0 to 100 with a letter grade and a concrete list of failures.

Dachary was initially hesitant to assign a score. She worried that reducing a set of pass/warn/fail checks to a single number would flatten the nuance, overstating some problems and understating others. Our technical writer, Devin, pushed back: she found the score galvanizing. It turned something with muddy signal into a clear target to iterate against. So Dachary built a scoring system designed to preserve that nuance.

The system uses weight tiers: failing foundational checks like discovery or auth access acts as a score cap, regardless of how well you perform on everything else. You can't score an A if agents can't find your docs at all. Multi-page checks use proportional scoring (3 out of 50 pages failing is different from 48 out of 50), and interaction effects between categories model how failures compound. The scoring engine is fully open-source at [github.com/agent-ecosystem/afdocs](http://github.com/agent-ecosystem/afdocs).

[Gil Feig](https://www.linkedin.com/in/gilfeig/), CTO at [Merge](https://merge.dev):

> "Developers who discover us through AI agents convert at a higher rate than any other channel. That's why our agent-readable docs are a key growth lever."

Agent Score gives you a number for that lever.

## What I found in our own docs

Once Agent Score existed, I did the only honest thing: I ran it on `buildwithfern.com/learn`.

The results were humbling. The content was fine, but the scaffolding around it wasn't. Rather than fix things quietly, I fixed them publicly, and because these are platform-level changes, every team building on [Fern](https://buildwithfern.com) benefits automatically.

**Our `llms.txt` was too big.** On multi-product sites, our root `llms.txt` dumped every page across every product and version into a single flat list, well over AFDocs' 50,000-character limit. The fix restructures it hierarchically: root links to product-level indexes, which link to version-level indexes, which list individual pages. Agents navigate to exactly what they need instead of ingesting a 300-page dump. ([#9182](https://github.com/fern-api/fern-platform/pull/9182))

**Agents couldn't find `llms.txt` from individual pages.** AFDocs requires that agents can discover the index from any page, not just the root. A new `agents.page-directive` field in `docs.yml` lets you set one string that Fern prepends to every page's markdown automatically. No manual edits, no pages that slip through. ([#4654](https://github.com/fern-api/docs/pull/4654))

**Page descriptions weren't helping agents decide what to fetch.** Each `llms.txt` entry has a one-line description agents use to decide whether a page is worth fetching. A new `pageDescriptionSource` config option lets teams choose which frontmatter field to pull from. Small change, meaningful improvement in retrieval quality. ([#9373](https://github.com/fern-api/fern-platform/pull/9373))

[Paul Asjes](https://www.linkedin.com/in/paulasjes/), DevEx at [ElevenLabs](https://elevenlabs.io):

> "Like moving from punch cards to IDEs or machine code to syntactic languages, agents are the next big leap in software engineering. Agent experience is now at the forefront of how products are adopted and it all starts with good, agent-first documentation."

## Run your score

The invisible audience is already here. Agents are deciding which APIs to surface, shaping which integrations get built and which never start. The spec is open-source, the leaderboard is public, and your run takes 30 seconds.

[**Check your score at labs.buildwithfern.com/agent-score**](https://labs.buildwithfern.com/agent-score)

*Agent Score is built by Fern Labs in partnership with [Dachary Carey](https://github.com/dacharyc), creator of the AFDocs standard. The scoring engine is open-source at [github.com/agent-ecosystem/afdocs](https://github.com/agent-ecosystem/afdocs). Every check is transparent and community-reviewable.*
