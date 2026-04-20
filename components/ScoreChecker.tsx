'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { lines_3 } from 'cli-loaders';
import DemoModal from './DemoModal';
import NotifyModal from './NotifyModal';

type CheckerState = 'idle' | 'running' | 'complete' | 'error';

const PROGRESS_STEPS = [
  'Checking llms.txt...',
  'Checking markdown format...',
  'Analyzing page structure...',
  'Checking authentication docs...',
  'Calculating score...',
];

function scoreColor(s: number): string {
  if (s >= 90) return '#00ff66';
  if (s >= 80) return '#ccff44';
  if (s >= 70) return '#ffcc00';
  if (s >= 60) return '#ff8800';
  return '#ff4444';
}

export default function ScoreChecker() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<CheckerState>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [stepFrame, setStepFrame] = useState(0);
  const [error, setError] = useState('');
  const [isTimeout, setIsTimeout] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [result, setResult] = useState<{ score: number; grade: string } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const jobIdRef = useRef<string | null>(null);
  const scoringUrlRef = useRef<string>('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const notifyError = useCallback((errorUrl: string, message: string) => {
    fetch('/agent-score/api/score-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: errorUrl, message }),
    }).catch(() => {});
  }, []);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const startPolling = useCallback((jobId: string, slug?: string, since?: number) => {
    stopPolling();
    const deadline = process.env.NODE_ENV === 'development' ? Infinity : Date.now() + 300_000;
    const params = new URLSearchParams();
    if (slug) params.set('slug', slug);
    if (since) params.set('since', String(since));
    const query = params.toString() ? `?${params}` : '';
    pollRef.current = setInterval(async () => {
      if (Date.now() > deadline) {
        stopPolling();
        const timeoutMsg = 'Scoring timed out — the docs site may be slow or blocking automated requests.';
        setIsTimeout(true);
        setError(timeoutMsg);
        setState('error');
        notifyError(scoringUrlRef.current, timeoutMsg);
        return;
      }
      try {
        const res = await fetch(`/agent-score/api/score/${jobId}${query}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'complete') {
          stopPolling();
          setResult({ score: data.score, grade: data.grade });
          if (data.slug && data.slug !== 'unknown') { window.location.href = `/agent-score/company/${data.slug}`; }
          else { setState('complete'); }
        } else if (data.status === 'error') {
          stopPolling();
          const msg = data.message ?? 'Scoring failed';
          setIsTimeout(!!data.isTimeout);
          setError(msg);
          setState('error');
          notifyError(scoringUrlRef.current, msg);
        }
      } catch { /* keep polling */ }
    }, 2000);
  }, []);

  const runCheck = useCallback(async () => {
    if (!url.trim()) return;
    setState('running'); setCurrentStep(0); setError(''); setIsTimeout(false); setNotifyOpen(false); jobIdRef.current = null; scoringUrlRef.current = rawUrl;
    const rawUrl = url.trim();
    try {
      const res = await fetch('/agent-score/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.message ?? errData.error ?? 'Failed to score';
        const suggestion = errData.suggestion ? ` Try: ${errData.suggestion}` : '';
        throw new Error(msg + suggestion);
      }
      const data = await res.json();
      if (data.existing && data.slug && data.slug !== 'unknown') {
        window.location.href = `/agent-score/company/${data.slug}`;
        return;
      }
      jobIdRef.current = data.jobId;
      // cached=true means slug already exists in Supabase — no since needed
      // new jobs pass since so the poll only accepts results scored after this run started
      startPolling(data.jobId, data.slug, data.cached ? undefined : Date.now());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not score this URL. Please check and try again.';
      setError(msg);
      setState('error');
      notifyError(rawUrl, msg);
    }
  }, [url, startPolling, notifyError]);

  useEffect(() => {
    if (state !== 'running') return;
    let step = 0;
    const stepId = setInterval(() => {
      step = Math.min(step + 1, PROGRESS_STEPS.length - 1);
      setCurrentStep(step);
    }, 8000);
    return () => clearInterval(stepId);
  }, [state]);

  useEffect(() => {
    if (state !== 'running') return;
    const id = setInterval(() => setStepFrame(f => (f + 1) % lines_3.keyframes.length), lines_3.speed);
    return () => clearInterval(id);
  }, [state]);

  useEffect(() => {
    if (state !== 'running') { setElapsed(0); return; }
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  useEffect(() => () => stopPolling(), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state !== 'running') runCheck();
  };

  if (state === 'running') {
    return (
      <div className="hsf-running">
        <div className="hsf-running-url-row">
          <span className="hsf-timer">{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</span>
          <span className="hsf-running-url">{url}</span>
        </div>
        {PROGRESS_STEPS.map((step, i) => (
          <div key={step} className={`hsf-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'}`}>
            <span className="hsf-step-icon">
              {i < currentStep ? '✓' : i === currentStep ? lines_3.keyframes[stepFrame] : ' '}
            </span>
            {step}
          </div>
        ))}
      </div>
    );
  }

  if (state === 'complete' && result) {
    return (
      <div className="hsf-complete">
        <span style={{ fontSize: '40px', fontFamily: "'Geist Mono', monospace", color: scoreColor(result.score) }}>
          {result.score}
        </span>
        <span style={{ fontSize: '14px', color: '#555', marginLeft: '12px', fontFamily: "'Geist Mono', monospace" }}>
          {result.score >= 80 ? 'Good readiness' : result.score >= 55 ? 'Improvements needed' : 'Gaps found'}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="hsf-container-outer">
        <div className="hsf-container">
          <form onSubmit={handleSubmit} className="hsf-form">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => {}}
              placeholder="https://docs.yourcompany.com"
              autoComplete="off"
              className="hsf-input"
            />
            <div className="hsf-btn-container">
              <button type="submit" className="hsf-btn">Score your docs</button>
            </div>
            {error && (
              <div className="hsf-error">
                {isTimeout ? (
                  <>
                    Wow! That&apos;s a really big site.{' '}
                    <button className="hsf-timeout-link" onClick={() => setDemoOpen(true)}>Give us your email</button>
                    {' '}and we&apos;ll run the score locally and get back to you.
                  </>
                ) : (
                  <>
                    {error}{' '}
                    <button type="button" className="hsf-timeout-link" onClick={() => setNotifyOpen(true)}>Get notified</button>
                    {' '}when scoring is available.
                  </>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} source="scoring timeout" />}
      {notifyOpen && <NotifyModal url={url} onClose={() => setNotifyOpen(false)} />}
    </>
  );
}
