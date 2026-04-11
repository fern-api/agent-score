import { NextResponse } from 'next/server';
import { getCompanyWithFallback } from '@/lib/scores';
import type { CheckResult } from '@/lib/scores';

const BASE_URL = 'https://buildwithfern.com/agent-score';

const STATUS_LABEL: Record<string, string> = {
  pass:  '[pass]',
  warn:  '[warn]',
  fail:  '[fail]',
  error: '[fail]',
  skip:  '[skip]',
};

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const company = await getCompanyWithFallback(params.slug);
  if (!company) {
    return new NextResponse('Not found', { status: 404 });
  }

  const checkedDate = new Date(company.scoredAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const lines: string[] = [
    `# ${company.name} — Agent Score`,
    '',
    `> Score: ${company.score}/100 (Grade: ${company.grade}) | Docs: ${company.docsUrl} | Checked: ${checkedDate}`,
    '',
    `${company.name} scored ${company.score}/100 (${company.grade}) on Agent Score. ${company.checks.pass} of ${company.checks.total} agent-readiness checks passed.`,
    '',
    `[View full report](${BASE_URL}/company/${company.slug})`,
    `[All companies](${BASE_URL}/llms.txt)`,
    '',
    '## Summary',
    '',
    `- Total checks: ${company.checks.total}`,
    `- Passed: ${company.checks.pass}`,
    `- Warnings: ${company.checks.warn}`,
    `- Failed: ${company.checks.fail}`,
    '',
  ];

  if (company.categoryScores && Object.keys(company.categoryScores).length > 0) {
    lines.push('## Category Scores');
    lines.push('');
    for (const [cat, score] of Object.entries(company.categoryScores)) {
      lines.push(`- ${cat}: ${score}/100`);
    }
    lines.push('');
  }

  if (company.results?.length) {
    lines.push('## Check Results');
    lines.push('');

    const byCategory = new Map<string, CheckResult[]>();
    for (const r of company.results) {
      if (!byCategory.has(r.category)) byCategory.set(r.category, []);
      byCategory.get(r.category)!.push(r);
    }

    for (const [cat, checks] of byCategory) {
      lines.push(`### ${cat}`);
      lines.push('');
      for (const check of checks) {
        const label = STATUS_LABEL[check.status] ?? '[unknown]';
        lines.push(`- ${label} ${check.message}`);
      }
      lines.push('');
    }
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    },
  });
}
