# AgentScore by Fern

AgentScore evaluates how well company documentation sites work with AI agents, powered by the [afdocs](https://www.npmjs.com/package/afdocs) npm package.

## Architecture

- **Next.js 14 App Router** — static pages for 30 company scores, API routes for on-demand scoring
- **afdocs** — fetches and evaluates documentation sites (requires Node.js runtime)
- **Vercel** — hosting with static generation at build time

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Generate Scores

Pre-generate score data for all 30 companies:

```bash
npm run generate-scores
```

This runs `afdocs` against each company's documentation site and writes results to `data/scores/`.

## Deploy to Vercel

### Via CLI

```bash
npx vercel --prod
```

### Via Git

Push to `main` and Vercel will automatically build and deploy.

## Project Structure

```
app/                  # Next.js App Router pages and layouts
  api/                # API routes (Node.js runtime)
  company/[slug]/     # Dynamic company score pages
data/
  scores/             # Pre-generated score JSON files
scripts/
  generate-scores.ts  # Score generation script
public/               # Static assets (logos, images)
```

## Environment Variables

See `.env.example`. Currently no env vars are required — `afdocs` runs without API keys.
