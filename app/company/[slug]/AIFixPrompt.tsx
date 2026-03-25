'use client';

import type { CheckResult } from '@/lib/scores';
import CollapsiblePanel from './CollapsiblePanel';
import CopyButton from './CopyButton';
import '../company.css';

function buildPrompt(name: string, url: string, score: number, grade: string, results: CheckResult[]): string {
  const fails = results.filter(r => r.status === 'fail' || r.status === 'error');
  const warns = results.filter(r => r.status === 'warn');

  const fmt = (r: CheckResult) =>
    `- [${r.category}] ${r.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ${r.message}`;

  const failBlock = fails.length > 0
    ? `## Failing Checks (${fails.length})\n${fails.map(fmt).join('\n')}`
    : '';

  const warnBlock = warns.length > 0
    ? `## Warnings (${warns.length})\n${warns.map(fmt).join('\n')}`
    : '';

  return `# Agent Score Fix Report — ${name}
URL: ${url}
Score: ${score}/100 (Grade ${grade})

I need help improving the AI-readiness of the documentation at ${url}.
Agent Score found ${fails.length} failing checks and ${warns.length} warnings.

${failBlock}

${warnBlock}

## Fix Instructions

For each issue above, please:
1. Analyze the documentation site at ${url}
2. Implement the specific fix
3. Verify the fix would cause the check to pass

### Common fixes:
- **No llms.txt**: Create /llms.txt following https://llmstxt.org — list all doc pages in markdown format
- **No .md URL support**: Configure your docs platform to serve pages at equivalent .md URLs (e.g. /docs/quickstart.md)
- **No content negotiation**: Return markdown when request includes Accept: text/markdown header
- **Large page size**: Reduce nav boilerplate, inline scripts, and repetitive markup
- **No sitemap**: Generate /sitemap.xml listing all documentation URLs
- **Auth walls**: Ensure docs pages return 200 without requiring login cookies or tokens
- **No Last-Modified header**: Configure your server/CDN to include Last-Modified response headers
- **Tab content hidden**: Ensure tabbed content is rendered in the HTML (not JS-only) so agents can read all variants
`.trim();
}

export default function AIFixPrompt({
  name,
  url,
  score,
  grade,
  results,
}: {
  name: string;
  url: string;
  score: number;
  grade: string;
  results: CheckResult[];
}) {
  const issues = results.filter(r => r.status === 'fail' || r.status === 'error' || r.status === 'warn');
  if (issues.length === 0) return null;

  const prompt = buildPrompt(name, url, score, grade, results);

  return (
    <CollapsiblePanel
      title={`Agent Prompt to fix ${issues.length} issue${issues.length !== 1 ? 's' : ''}`}
      copySlot={<CopyButton text={prompt} />}
    >
      <pre className="co-ai-pre">{prompt}</pre>
    </CollapsiblePanel>
  );
}
