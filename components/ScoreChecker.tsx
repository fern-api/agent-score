'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { lines_3 } from 'cli-loaders';

type CheckerState = 'idle' | 'running' | 'complete' | 'error';

const PROGRESS_STEPS = [
  'Checking llms.txt...',
  'Checking markdown format...',
  'Analyzing page structure...',
  'Evaluating URL patterns...',
  'Checking authentication docs...',
  'Calculating score...',
];

function scoreColor(s: number): string {
  if (s >= 80) return '#00ff66';
  if (s >= 65) return '#ccff44';
  if (s >= 45) return '#ffcc00';
  if (s >= 30) return '#ff8800';
  return '#ff4444';
}

export default function ScoreChecker() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<CheckerState>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [stepFrame, setStepFrame] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ score: number; grade: string } | null>(null);
  const jobIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
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
          if (data.slug) { window.location.href = `/company/${data.slug}`; }
          else { setState('complete'); }
        } else if (data.status === 'error') {
          stopPolling();
          setError(data.message ?? 'Scoring failed');
          setState('error');
        }
      } catch { /* keep polling */ }
    }, 2000);
  }, []);

  const runCheck = useCallback(async () => {
    if (!url.trim()) return;
    setState('running'); setCurrentStep(0); setError(''); jobIdRef.current = null;
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
      if (data.existing && data.slug) {
        window.location.href = `/company/${data.slug}`;
        return;
      }
      jobIdRef.current = data.jobId;
      startPolling(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not score this URL. Please check and try again.');
      setState('error');
    }
  }, [url, startPolling]);

  useEffect(() => {
    if (state !== 'running') return;
    let step = 0;
    const stepId = setInterval(() => {
      step = Math.min(step + 1, PROGRESS_STEPS.length - 1);
      setCurrentStep(step);
    }, 4000);
    return () => clearInterval(stepId);
  }, [state]);

  useEffect(() => {
    if (state !== 'running') return;
    const id = setInterval(() => setStepFrame(f => (f + 1) % lines_3.keyframes.length), lines_3.speed);
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
    <div className="hsf-container-outer">
      <div className="hsf-container">
        <form onSubmit={handleSubmit} className="hsf-form">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => {
              const v = url.trim();
              if (v && !/^https?:\/\//i.test(v)) setUrl(`https://${v}`);
            }}
            placeholder="https://docs.yourcompany.com"
            autoComplete="off"
            className="hsf-input"
          />
          <div className="hsf-btn-container">
            <button type="submit" className="hsf-btn">Score your docs</button>
          </div>
          {error && <div className="hsf-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}
