/**
 * Weighted scoring module — port of afdocs PR #10 (spec v0.3.0).
 *
 * Overall score = round( sum(earnedScore) / sum(maxScore) × 100 )
 * where earnedScore = proportion × (baseWeight × coefficient)
 *
 * Hard caps are applied after the raw score.
 */

export type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface CheckResult {
  id: string;
  category: string;
  status: 'pass' | 'warn' | 'fail' | 'skip' | 'error';
  message: string;
  details?: Record<string, unknown>;
}

export interface ScoreCap {
  cap: number;
  checkId: string;
  reason: string;
}

export interface ScoreResult {
  overall: number;
  grade: Grade;
  cap?: ScoreCap;
}

// ---------------------------------------------------------------------------
// Weights
// ---------------------------------------------------------------------------

const WEIGHTS: Record<string, number> = {
  // Critical (10)
  'llms-txt-exists':                10,
  'rendering-strategy':             10,
  'auth-gate-detection':            10,
  // High (7)
  'llms-txt-size':                   7,
  'llms-txt-links-resolve':          7,
  'llms-txt-links-markdown':         7,
  'markdown-url-support':            7,
  'page-size-html':                  7,
  'page-size-markdown':              7,
  'http-status-codes':               7,
  'llms-txt-directive':              7,
  // Medium (4)
  'llms-txt-valid':                  4,
  'content-negotiation':             4,
  'content-start-position':          4,
  'tabbed-content-serialization':    4,
  'markdown-code-fence-validity':    4,
  'llms-txt-freshness':              4,
  'markdown-content-parity':         4,
  'auth-alternative-access':         4,
  'redirect-behavior':               4,
  // Low (2)
  'section-header-quality':          2,
  'cache-header-hygiene':            2,
};

// Warn coefficient: how much partial credit a warn earns (default 0.5)
const WARN_COEFFICIENTS: Record<string, number> = {
  'rendering-strategy':           0.5,
  'auth-gate-detection':          0.5,
  'llms-txt-size':                0.5,
  'llms-txt-links-resolve':       0.75,
  'llms-txt-links-markdown':      0.25,
  'llms-txt-valid':               0.75,
  'llms-txt-directive':           0.6,
  'llms-txt-freshness':           0.75,
  'content-negotiation':          0.75,
  'page-size-html':               0.5,
  'page-size-markdown':           0.5,
  'http-status-codes':            0.5,
  'redirect-behavior':            0.6,
  'content-start-position':       0.5,
  'tabbed-content-serialization': 0.5,
  'markdown-content-parity':      0.75,
  'auth-alternative-access':      0.5,
  'section-header-quality':       0.5,
  'cache-header-hygiene':         0.5,
};

// ---------------------------------------------------------------------------
// Proportions — bucket-based for multi-page checks
// ---------------------------------------------------------------------------

function getProportion(result: CheckResult): number | undefined {
  if (result.status === 'skip' || result.status === 'error') return undefined;

  const d = result.details as Record<string, number> | undefined;

  // rendering-strategy: (serverRendered + sparseContent × 0.5) / testedPages
  if (result.id === 'rendering-strategy' && d?.testedPages) {
    return Math.min(1, ((d.serverRendered ?? 0) + (d.sparseContent ?? 0) * 0.5) / d.testedPages);
  }

  // auth-gate-detection: accessible / testedPages
  if (result.id === 'auth-gate-detection' && d?.testedPages) {
    return Math.min(1, (d.accessible ?? 0) / d.testedPages);
  }

  // http-status-codes: pass pages / total tested
  if (result.id === 'http-status-codes' && d?.testedPages) {
    const pass = (d.testedPages as number) - ((d.errors ?? 0) as number) - ((d.redirects ?? 0) as number);
    return Math.max(0, Math.min(1, pass / d.testedPages));
  }

  // llms-txt-directive: foundCount / testedPages
  if (result.id === 'llms-txt-directive' && d?.testedPages) {
    return Math.min(1, (d.foundCount ?? 0) / d.testedPages);
  }

  // llms-txt-links-resolve: resolved / testedLinks (resolveRate is a 0-100 percentage)
  if (result.id === 'llms-txt-links-resolve') {
    if (d?.testedLinks) return Math.min(1, (d.resolved ?? 0) / d.testedLinks);
    if (d?.resolveRate !== undefined) return (d.resolveRate as number) / 100;
  }

  // Bucket-based checks: (passBucket + warnBucket × 0.5) / testedPages
  if (result.id === 'content-start-position' && d?.testedPages) {
    return Math.min(1, ((d.passBucket ?? 0) + (d.warnBucket ?? 0) * 0.5) / d.testedPages);
  }
  if (result.id === 'page-size-markdown' && d?.testedPages) {
    return Math.min(1, ((d.passBucket ?? 0) + (d.warnBucket ?? 0) * 0.5) / d.testedPages);
  }
  if (result.id === 'page-size-html' && d?.testedPages) {
    return Math.min(1, ((d.passBucket ?? 0) + (d.warnBucket ?? 0) * 0.5) / d.testedPages);
  }
  if (result.id === 'cache-header-hygiene') {
    const total = (d?.testedPages ?? d?.testedEndpoints) as number | undefined;
    if (total) return Math.min(1, ((d?.passBucket ?? 0) + (d?.warnBucket ?? 0) * 0.5) / total);
  }
  if (result.id === 'markdown-content-parity') {
    const total = (d?.testedPages ?? d?.pagesCompared) as number | undefined;
    if (total) return Math.min(1, ((d?.passBucket ?? 0) + (d?.warnBucket ?? 0) * 0.5) / total);
  }

  // Fall back to status-based proportion
  if (result.status === 'pass') return 1.0;
  if (result.status === 'warn') return WARN_COEFFICIENTS[result.id] ?? 0.5;
  return 0.0; // fail
}

// ---------------------------------------------------------------------------
// Coefficients — contextual scaling of effective weight
// ---------------------------------------------------------------------------

function getCoefficient(checkId: string, results: Map<string, CheckResult>): number {
  // Discovery coefficient: for markdown-url-support only
  if (checkId === 'markdown-url-support') {
    const cn = results.get('content-negotiation');
    if (cn?.status === 'pass') return 1.0;
    const directive = results.get('llms-txt-directive');
    if (directive?.status === 'pass' || directive?.status === 'warn') return 0.8;
    const linksMarkdown = results.get('llms-txt-links-markdown');
    if (linksMarkdown?.status === 'pass' || linksMarkdown?.status === 'warn') return 0.5;
    return 0.0;
  }

  // HTML path coefficient: for HTML page-size and content-start-position
  if (checkId === 'page-size-html' || checkId === 'content-start-position') {
    const rs = results.get('rendering-strategy');
    if (!rs?.details) return 1.0;
    const d = rs.details as Record<string, number>;
    const total = d.testedPages ?? 1;
    return Math.min(1, ((d.serverRendered ?? 0) + (d.sparseContent ?? 0) * 0.5) / total);
  }

  // Index truncation coefficient: for llms-txt-valid, llms-txt-freshness, llms-txt-links-markdown
  if (['llms-txt-valid', 'llms-txt-freshness', 'llms-txt-links-markdown'].includes(checkId)) {
    const sizeResult = results.get('llms-txt-size');
    if (!sizeResult) return 1.0;
    if (sizeResult.status === 'pass') return 1.0;
    if (sizeResult.status === 'warn') return 0.8;
    const d = sizeResult.details as Record<string, number> | undefined;
    const maxSize = d?.maxSize ?? d?.size ?? 0;
    return maxSize > 0 ? Math.min(1, 100_000 / maxSize) : 0.5;
  }

  return 1.0;
}

// ---------------------------------------------------------------------------
// Hard caps
// ---------------------------------------------------------------------------

function computeCap(results: Map<string, CheckResult>): ScoreCap | undefined {
  const llmsTxt = results.get('llms-txt-exists');
  if (llmsTxt?.status === 'fail') {
    return { cap: 59, checkId: 'llms-txt-exists', reason: 'No llms.txt found' };
  }

  const rs = results.get('rendering-strategy');
  const rsProportion = rs ? (getProportion(rs) ?? 1) : 1;

  const auth = results.get('auth-gate-detection');
  const authProportion = auth ? (getProportion(auth) ?? 1) : 1;

  const minCritical = Math.min(rsProportion, authProportion);

  if (minCritical <= 0.25) {
    const checkId = rsProportion <= authProportion ? 'rendering-strategy' : 'auth-gate-detection';
    return { cap: 39, checkId, reason: 'Critical accessibility failure' };
  }
  if (minCritical <= 0.50) {
    const checkId = rsProportion <= authProportion ? 'rendering-strategy' : 'auth-gate-detection';
    return { cap: 59, checkId, reason: 'Significant accessibility issues' };
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// toGrade
// ---------------------------------------------------------------------------

export function toGrade(score: number): Grade {
  if (score === 100) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// ---------------------------------------------------------------------------
// computeScore — main entry point
// ---------------------------------------------------------------------------

export function computeScore(results: CheckResult[]): ScoreResult {
  const resultMap = new Map(results.map((r) => [r.id, r]));

  let totalEarned = 0;
  let totalMax = 0;

  for (const result of results) {
    const baseWeight = WEIGHTS[result.id];
    if (!baseWeight) continue; // unknown check, skip

    const proportion = getProportion(result);
    if (proportion === undefined) continue; // skip/error — excluded

    const coefficient = getCoefficient(result.id, resultMap);
    const effectiveWeight = baseWeight * coefficient;

    totalEarned += proportion * effectiveWeight;
    totalMax += effectiveWeight;
  }

  const raw = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
  const cap = computeCap(resultMap);
  const overall = cap ? Math.min(raw, cap.cap) : raw;

  return { overall, grade: toGrade(overall), cap };
}
