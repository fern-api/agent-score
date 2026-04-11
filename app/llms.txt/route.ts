import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/scores';

const BASE_URL = 'https://buildwithfern.com/agent-score';

export const dynamic = 'force-dynamic';

export async function GET() {
  const companies = await getLeaderboard();

  const lines: string[] = [
    '# Agent Score',
    '',
    'A Lighthouse-style benchmark for AI-agent readiness. Grades documentation 0–100 across 22 checks in 7 categories.',
    '',
    `> ${BASE_URL}`,
    '',
    '## Pages',
    '',
    `- [Home](${BASE_URL}/llms.txt): Leaderboard index and about`,
    '',
    '## Leaderboard',
    '',
    'Ranked list of API documentation sites graded on agent-readiness. Each entry links to a full llms.txt report for that company.',
    '',
  ];

  for (const company of companies) {
    lines.push(
      `- [${company.name}](${BASE_URL}/company/${company.slug}/llms.txt): Score ${company.score}/100 (${company.grade}) | ${company.docsUrl}`
    );
  }

  lines.push('');
  lines.push('## About');
  lines.push('');
  lines.push('Agent Score is built by Fern Labs in partnership with Dachary Carey, creator of the AFDocs standard.');
  lines.push('The scoring engine is open-source at https://github.com/agent-ecosystem/afdocs');
  lines.push('Every check is transparent and community-reviewable.');

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    },
  });
}
