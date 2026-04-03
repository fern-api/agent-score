/**
 * Weighted scoring module — port of afdocs 0.8.2 scoring.
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
// Weights  (afdocs 0.7.2)
// ---------------------------------------------------------------------------

const TIER_WEIGHTS = { critical: 10, high: 7, medium: 4, low: 2 } as const;
type Tier = keyof typeof TIER_WEIGHTS;

interface WeightDef { tier: Tier; weight: number; warnCoefficient?: number }

function w(tier: Tier, warnCoefficient?: number): WeightDef {
  return { tier, weight: TIER_WEIGHTS[tier], warnCoefficient };
}

const CHECK_WEIGHTS: Record<string, WeightDef> = {
  // Critical
  'llms-txt-exists':              w('critical', 0.5),
  'rendering-strategy':           w('critical', 0.5),
  'auth-gate-detection':          w('critical', 0.5),
  // High
  'llms-txt-size':                w('high', 0.5),
  'llms-txt-links-resolve':       w('high', 0.75),
  'markdown-url-support':         w('high', 0.5),
  'page-size-markdown':           w('high', 0.5),
  'page-size-html':               w('high', 0.5),
  'http-status-codes':            w('high'),
  'llms-txt-directive':           w('high', 0.6),
  // Medium
  'llms-txt-valid':               w('medium', 0.75),
  'content-negotiation':          w('medium', 0.75),
  'content-start-position':       w('medium', 0.5),
  'tabbed-content-serialization': w('medium', 0.5),
  'markdown-code-fence-validity': w('medium'),
  'llms-txt-freshness':           w('medium', 0.75),
  'markdown-content-parity':      w('medium', 0.75),
  'auth-alternative-access':      w('medium', 0.5),
  'redirect-behavior':            w('medium', 0.6),
  // Medium  (llms-txt-links-markdown back to high in 0.8.2 with warnCoeff 0.25)
  'llms-txt-links-markdown':      w('high', 0.25),
  // Low
  'section-header-quality':       w('low', 0.5),
  'cache-header-hygiene':         w('low', 0.5),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusToProportion(
  status: 'pass' | 'warn' | 'fail',
  warnCoeff: number | undefined,
): number {
  if (status === 'pass') return 1.0;
  if (status === 'warn') return warnCoeff ?? 0.5;
  return 0.0;
}

/** Count pass/warn/fail items (skip/error excluded) → 0–1 proportion. */
function countByStatus(
  items: Array<{ status: string }>,
  warnCoefficient: number | undefined,
): number | undefined {
  let pass = 0, warn = 0, total = 0;
  for (const item of items) {
    const s = item.status;
    if (s === 'pass') { pass++; total++; }
    else if (s === 'warn') { warn++; total++; }
    else if (s === 'fail') { total++; }
    // skip/error excluded
  }
  if (total === 0) return undefined;
  const wc = warnCoefficient ?? 0.5;
  return (pass + warn * wc) / total;
}

/** Bucket-based proportion: (pass + warn × wc) / (pass + warn + fail) */
function bucketProportion(
  d: Record<string, unknown>,
  warnCoeff: number | undefined,
): number | undefined {
  const pass = (d.passBucket as number) ?? 0;
  const warn = (d.warnBucket as number) ?? 0;
  const fail = (d.failBucket as number) ?? 0;
  const total = pass + warn + fail;
  if (total === 0) return undefined;
  const wc = warnCoeff ?? 0.5;
  return (pass + warn * wc) / total;
}

// ---------------------------------------------------------------------------
// Proportions — one extractor per check (afdocs 0.7.2)
// ---------------------------------------------------------------------------

function getProportion(result: CheckResult, weight: WeightDef): number | undefined {
  if (result.status === 'skip' || result.status === 'error') return undefined;

  const d = result.details as Record<string, unknown> | undefined;

  switch (result.id) {
    // --- Rendering strategy ---
    case 'rendering-strategy': {
      if (!d) break;
      const sr = (d.serverRendered as number) ?? 0;
      const sc = (d.sparseContent as number) ?? 0;
      const spa = (d.spaShells as number) ?? 0;
      const total = sr + sc + spa;
      if (total === 0) break;
      return (sr + sc * (weight.warnCoefficient ?? 0.5)) / total;
    }

    // --- Auth gate detection ---
    case 'auth-gate-detection': {
      if (!d) break;
      const pages = d.pageResults as Array<{ classification: string }> | undefined;
      if (pages && pages.length > 0) {
        return countByStatus(
          pages.map((p) => {
            if (p.classification === 'accessible') return { status: 'pass' };
            if (p.classification === 'soft-auth-gate') return { status: 'warn' };
            if (p.classification === 'auth-required' || p.classification === 'auth-redirect') return { status: 'fail' };
            return { status: 'skip' };
          }),
          weight.warnCoefficient,
        );
      }
      // Fallback to legacy field
      const accessible = (d.accessible as number) ?? 0;
      const testedPages = (d.testedPages as number) ?? 0;
      if (testedPages > 0) return Math.min(1, accessible / testedPages);
      break;
    }

    // --- HTTP status codes ---
    case 'http-status-codes': {
      if (!d) break;
      const pages = d.pageResults as Array<{ classification: string }> | undefined;
      if (pages && pages.length > 0) {
        return countByStatus(
          pages.map((p) => {
            if (p.classification === 'correct-error') return { status: 'pass' };
            if (p.classification === 'soft-404') return { status: 'fail' };
            return { status: 'skip' };
          }),
          weight.warnCoefficient,
        );
      }
      // Legacy
      const tp = (d.testedPages as number) ?? 0;
      if (tp > 0) {
        const bad = ((d.errors as number) ?? 0) + ((d.redirects as number) ?? 0);
        return Math.max(0, (tp - bad) / tp);
      }
      break;
    }

    // --- llms-txt-directive ---
    case 'llms-txt-directive': {
      if (!d) break;
      const pages = d.pageResults as Array<{ found?: boolean; positionPercent?: number; error?: boolean }> | undefined;
      if (pages && pages.length > 0) {
        return countByStatus(
          pages.filter((p) => !p.error).map((p) => {
            if (!p.found) return { status: 'fail' };
            if ((p.positionPercent ?? 0) > 50) return { status: 'warn' };
            return { status: 'pass' };
          }),
          weight.warnCoefficient,
        );
      }
      // Legacy
      const tp = (d.testedPages as number) ?? 0;
      if (tp > 0) return Math.min(1, ((d.foundCount as number) ?? 0) / tp);
      break;
    }

    // --- llms-txt-links-resolve ---
    case 'llms-txt-links-resolve': {
      if (!d) break;
      const resolveRate = d.resolveRate as number | undefined;
      if (resolveRate !== undefined) return resolveRate / 100;
      const tl = d.testedLinks as number | undefined;
      if (tl) return Math.min(1, ((d.resolved as number) ?? 0) / tl);
      break;
    }

    // --- llms-txt-links-markdown ---
    case 'llms-txt-links-markdown': {
      if (!d) break;
      const mr = d.markdownRate as number | undefined;
      if (mr !== undefined) return mr / 100;
      break;
    }

    // --- llms-txt-valid ---
    case 'llms-txt-valid': {
      if (!d) break;
      const validations = d.validations as Array<{ linkCount?: number; hasH1?: boolean; hasBlockquote?: boolean }> | undefined;
      if (validations && validations.length > 0) {
        return countByStatus(
          validations.map((v) => {
            if ((v.linkCount ?? 0) === 0) return { status: 'fail' };
            if (v.hasH1 && v.hasBlockquote) return { status: 'pass' };
            return { status: 'warn' };
          }),
          weight.warnCoefficient,
        );
      }
      break;
    }

    // --- llms-txt-size ---
    case 'llms-txt-size': {
      if (!d) break;
      const sizes = d.sizes as Array<{ characters?: number }> | undefined;
      const thresholds = d.thresholds as { pass?: number; fail?: number } | undefined;
      if (sizes && sizes.length > 0) {
        const passThreshold = thresholds?.pass ?? 50_000;
        const failThreshold = thresholds?.fail ?? 100_000;
        return countByStatus(
          sizes.map((s) => {
            const chars = s.characters ?? 0;
            if (chars <= passThreshold) return { status: 'pass' };
            if (chars <= failThreshold) return { status: 'warn' };
            return { status: 'fail' };
          }),
          weight.warnCoefficient,
        );
      }
      break;
    }

    // --- llms-txt-freshness ---
    case 'llms-txt-freshness': {
      if (!d) break;
      const cr = d.coverageRate as number | undefined;
      if (cr !== undefined) return cr / 100;
      break;
    }

    // --- Bucket-based checks ---
    case 'page-size-html':
    case 'page-size-markdown':
    case 'content-start-position':
    case 'cache-header-hygiene':
    case 'markdown-content-parity': {
      if (!d) break;
      return bucketProportion(d, weight.warnCoefficient);
    }

    // --- pageResults with status field ---
    case 'markdown-code-fence-validity': {
      if (!d) break;
      const pages = d.pageResults as Array<{ status: string }> | undefined;
      if (pages && pages.length > 0) return countByStatus(pages, weight.warnCoefficient);
      break;
    }

    // --- markdown-url-support ---
    case 'markdown-url-support': {
      if (!d) break;
      const pages = d.pageResults as Array<{ supported?: boolean; skipped?: boolean }> | undefined;
      if (pages && pages.length > 0) {
        return countByStatus(
          pages.filter((p) => !p.skipped).map((p) => ({ status: p.supported ? 'pass' : 'fail' })),
          weight.warnCoefficient,
        );
      }
      break;
    }

    // --- content-negotiation ---
    case 'content-negotiation': {
      if (!d) break;
      const pages = d.pageResults as Array<{ classification?: string; skipped?: boolean }> | undefined;
      if (pages && pages.length > 0) {
        return countByStatus(
          pages.filter((p) => !p.skipped).map((p) => {
            if (p.classification === 'markdown-with-correct-type') return { status: 'pass' };
            if (p.classification === 'markdown-with-wrong-type') return { status: 'warn' };
            if (p.classification === 'html') return { status: 'fail' };
            return { status: 'skip' };
          }),
          weight.warnCoefficient,
        );
      }
      break;
    }

    // --- tabbed-content-serialization ---
    case 'tabbed-content-serialization': {
      if (!d) break;
      const pages = d.tabbedPages as Array<{ status: string }> | undefined;
      if (pages && pages.length > 0) return countByStatus(pages, weight.warnCoefficient);
      break;
    }

    // --- section-header-quality ---
    case 'section-header-quality': {
      if (!d) break;
      const analyses = d.analyses as Array<{ hasGenericMajority?: boolean; hasCrossGroupGeneric?: boolean }> | undefined;
      if (analyses && analyses.length > 0) {
        return countByStatus(
          analyses.map((a) => ({
            status: a.hasGenericMajority ? 'fail' : a.hasCrossGroupGeneric ? 'warn' : 'pass',
          })),
          weight.warnCoefficient,
        );
      }
      break;
    }

    // --- redirect-behavior ---
    case 'redirect-behavior': {
      if (!d) break;
      const pages = d.pageResults as Array<{ classification?: string }> | undefined;
      if (pages && pages.length > 0) {
        return countByStatus(
          pages.map((p) => {
            if (p.classification === 'no-redirect' || p.classification === 'same-host') return { status: 'pass' };
            if (p.classification === 'cross-host') return { status: 'warn' };
            if (p.classification === 'js-redirect') return { status: 'fail' };
            return { status: 'skip' };
          }),
          weight.warnCoefficient,
        );
      }
      break;
    }
  }

  // Fallback: status-based proportion
  return statusToProportion(result.status as 'pass' | 'warn' | 'fail', weight.warnCoefficient);
}

// ---------------------------------------------------------------------------
// Coefficients  (afdocs 0.7.2)
// ---------------------------------------------------------------------------

const DISCOVERY_CHECKS = new Set([
  'page-size-markdown',
  'markdown-code-fence-validity',
  'markdown-content-parity',
]);

const HTML_PATH_CHECKS = new Set([
  'page-size-html',
  'content-start-position',
  'tabbed-content-serialization',
  'section-header-quality',
]);

const INDEX_TRUNCATION_CHECKS = new Set([
  'llms-txt-links-resolve',
  'llms-txt-valid',
  'llms-txt-freshness',
  'llms-txt-links-markdown',
]);

function getCoefficient(checkId: string, results: Map<string, CheckResult>): number {
  if (DISCOVERY_CHECKS.has(checkId)) {
    const cn = results.get('content-negotiation');
    if (cn?.status === 'pass') return 1.0;
    const directive = results.get('llms-txt-directive');
    if (directive?.status === 'pass') return 0.8;
    const linksMd = results.get('llms-txt-links-markdown');
    if (linksMd?.status === 'pass') return 0.5;
    return 0.0;
  }

  if (HTML_PATH_CHECKS.has(checkId)) {
    const rs = results.get('rendering-strategy');
    if (!rs || rs.status === 'skip' || rs.status === 'error') return 1.0;
    const d = rs.details as Record<string, number> | undefined;
    if (!d) return 1.0;
    const sr = d.serverRendered ?? 0;
    const sc = d.sparseContent ?? 0;
    const spa = d.spaShells ?? 0;
    const total = sr + sc + spa;
    if (total === 0) return 1.0;
    return (sr + sc * 0.5) / total;
  }

  if (INDEX_TRUNCATION_CHECKS.has(checkId)) {
    const sizeResult = results.get('llms-txt-size');
    if (!sizeResult) return 1.0;
    if (sizeResult.status === 'pass') return 1.0;
    if (sizeResult.status === 'warn') return 0.8;
    if (sizeResult.status === 'fail') {
      const d = sizeResult.details as Record<string, unknown> | undefined;
      if (!d) return 0.5;
      const sizes = d.sizes as Array<{ characters?: number }> | undefined;
      if (sizes && sizes.length > 0) {
        const maxSize = Math.max(...sizes.map((s) => s.characters ?? 0));
        if (maxSize <= 0) return 0.5;
        return Math.min(1, 100_000 / maxSize);
      }
      // Legacy fallback
      const maxSize = (d.maxSize as number) ?? (d.size as number) ?? 0;
      return maxSize > 0 ? Math.min(1, 100_000 / maxSize) : 0.5;
    }
    return 1.0;
  }

  return 1.0;
}

// ---------------------------------------------------------------------------
// Hard caps  (afdocs 0.7.2)
// ---------------------------------------------------------------------------

function computeCap(results: Map<string, CheckResult>): ScoreCap | undefined {
  const caps: ScoreCap[] = [];

  const llmsTxt = results.get('llms-txt-exists');
  if (llmsTxt?.status === 'fail') {
    caps.push({ cap: 59, checkId: 'llms-txt-exists', reason: 'No llms.txt found. Agents lose primary navigation.' });
  }

  for (const checkId of ['rendering-strategy', 'auth-gate-detection'] as const) {
    const r = results.get(checkId);
    if (!r) continue;
    const weight = CHECK_WEIGHTS[checkId];
    const prop = getProportion(r, weight);
    if (prop === undefined) continue;
    if (prop <= 0.25) caps.push({ cap: 39, checkId, reason: `${checkId}: 75%+ of pages affected` });
    else if (prop <= 0.5) caps.push({ cap: 59, checkId, reason: `${checkId}: 50%+ of pages affected` });
  }

  if (caps.length === 0) return undefined;
  caps.sort((a, b) => a.cap - b.cap);
  return caps[0];
}

// ---------------------------------------------------------------------------
// toGrade
// ---------------------------------------------------------------------------

export function toGrade(score: number): Grade {
  if (score >= 100) return 'A+';
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
    const weight = CHECK_WEIGHTS[result.id];
    if (!weight) continue;

    const proportion = getProportion(result, weight);
    if (proportion === undefined) continue; // skip/error — excluded

    const coefficient = getCoefficient(result.id, resultMap);
    const effectiveWeight = weight.weight * coefficient;

    totalEarned += proportion * effectiveWeight;
    totalMax += effectiveWeight;
  }

  const raw = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
  const cap = computeCap(resultMap);
  const overall = cap ? Math.min(raw, cap.cap) : raw;

  return { overall, grade: toGrade(overall), cap };
}
