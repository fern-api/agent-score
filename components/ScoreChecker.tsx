'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { dots_1, lines_3 } from 'cli-loaders';

type CheckerState = 'idle' | 'running' | 'complete' | 'error';

const PROGRESS_STEPS = [
  'Checking llms.txt...',
  'Checking markdown format...',
  'Analyzing page structure...',
  'Evaluating URL patterns...',
  'Checking authentication docs...',
  'Calculating score...',
];

export default function ScoreChecker() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<CheckerState>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [stepFrame, setStepFrame] = useState(0);
  const [result, setResult] = useState<{ score: number; grade: string } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const jobIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = useCallback((jobId: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/score/${jobId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'complete') {
          stopPolling();
          setResult({ score: data.score, grade: data.grade });
          if (data.slug) {
            window.location.href = `/company/${data.slug}`;
          } else {
            setState('complete');
          }
        } else if (data.status === 'error') {
          stopPolling();
          setError(data.message ?? 'Scoring failed');
          setState('error');
        }
        // status === 'running' → keep polling
      } catch {
        // network glitch, keep polling
      }
    }, 2000);
  }, []);

  const runCheck = useCallback(async () => {
    if (!url.trim()) return;
    setState('running');
    setCurrentStep(0);
    setError('');
    jobIdRef.current = null;

    const rawUrl = url.trim();
    const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.message ?? errData.error ?? 'Failed to score';
        const suggestion = errData.suggestion ? ` Try: ${errData.suggestion}` : '';
        throw new Error(msg + suggestion);
      }

      const data = await res.json();
      jobIdRef.current = data.jobId;
      startPolling(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not score this URL. Please check and try again.');
      setState('error');
    }
  }, [url, startPolling]);

  // Animate progress steps while running
  useEffect(() => {
    if (state !== 'running') return;
    let step = 0;
    const stepId = setInterval(() => {
      step = Math.min(step + 1, PROGRESS_STEPS.length - 1);
      setCurrentStep(step);
    }, 4000); // slower — real job can take 30–60s
    return () => clearInterval(stepId);
  }, [state]);

  // cli-loaders spinners
  useEffect(() => {
    if (state !== 'running') return;
    const id1 = setInterval(() => setSpinnerFrame(f => (f + 1) % dots_1.keyframes.length), dots_1.speed);
    const id2 = setInterval(() => setStepFrame(f => (f + 1) % lines_3.keyframes.length), lines_3.speed);
    return () => { clearInterval(id1); clearInterval(id2); };
  }, [state]);

  // Ripples during scoring
  useEffect(() => {
    if (state !== 'running') return;
    const id = setInterval(() => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;
      window.dispatchEvent(new CustomEvent('matrix-ripple', { detail: { clientX: x, clientY: y } }));
    }, 450);
    return () => clearInterval(id);
  }, [state]);

  // Cleanup polling on unmount
  useEffect(() => () => stopPolling(), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state !== 'running') runCheck();
  };

  return (
    <div className="hero-checker-card" ref={cardRef}>
      <div className="hero-checker-title">Score your docs</div>

      {state === 'idle' || state === 'error' ? (
        <>
          <form onSubmit={handleSubmit} className="hero-checker-input-row">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                const rect = e.currentTarget.getBoundingClientRect();
                window.dispatchEvent(new CustomEvent('matrix-ripple', {
                  detail: {
                    clientX: rect.left + rect.width / 2,
                    clientY: rect.top + rect.height / 2,
                  }
                }));
              }}
              placeholder="https://docs.yourcompany.com"
              autoComplete="off"
              className="hero-checker-input"
            />
            <button type="submit" className="hero-checker-btn btn-primary">
              Analyze
            </button>
          </form>
          {error && (
            <p style={{ marginTop: '12px', fontSize: '14px', color: '#ef4444' }}>{error}</p>
          )}
        </>
      ) : state === 'running' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{
            fontFamily: "'Geist Mono', 'SF Mono', monospace",
            fontSize: '14px',
            color: 'var(--color-accent)',
          }}>
            Running afdocs checks
            <span style={{ fontFamily: 'monospace', marginLeft: '8px', color: 'var(--color-accent)' }}>
              {dots_1.keyframes[spinnerFrame]}
            </span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PROGRESS_STEPS.map((step, i) => (
              <div
                key={step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontFamily: "'Geist Mono', 'SF Mono', monospace",
                  color:
                    i < currentStep
                      ? 'var(--color-accent)'
                      : i === currentStep
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-muted)',
                  transition: 'color 0.3s ease',
                }}
              >
                {i < currentStep ? (
                  <svg
                    style={{ width: '14px', height: '14px', color: 'var(--color-accent)', flexShrink: 0 }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : i === currentStep ? (
                  <span style={{ width: '14px', height: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-accent)' }}>
                    {lines_3.keyframes[stepFrame]}
                  </span>
                ) : (
                  <span style={{ width: '14px', height: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-text-muted)' }} />
                  </span>
                )}
                {step}
              </div>
            ))}
          </div>
          <div style={{ height: '4px', borderRadius: 0, background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden', marginTop: '16px' }}>
            <div style={{ height: '100%', borderRadius: 0, background: 'var(--color-accent)', transition: 'width 0.7s ease-out', width: `${((currentStep + 1) / PROGRESS_STEPS.length) * 100}%` }} />
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          {result && (
            <>
              <div style={{ fontSize: '64px', fontWeight: '500', color: '#fff', letterSpacing: '-2px', lineHeight: 1 }}>{result.score}</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-accent)', marginTop: '8px' }}>{result.grade}</div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', fontFamily: 'monospace', marginTop: '12px' }}>Score complete</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
