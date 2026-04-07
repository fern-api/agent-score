'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { lines_3 } from 'cli-loaders';

const PROGRESS_STEPS = [
  'Checking llms.txt...',
  'Checking markdown format...',
  'Analyzing page structure...',
  'Checking authentication docs...',
  'Calculating score...',
];

export default function RerunButton({ url, slug }: { url: string; slug: string }) {
  const [state, setState] = useState<'idle' | 'running' | 'error'>('idle');
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [stepFrame, setStepFrame] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleRerun = useCallback(async () => {
    setState('running');
    setCurrentStep(0);
    setElapsed(0);
    setError('');

    try {
      const res = await fetch('/agent-score/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, slug, force: true, skipDetection: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(res.status === 429 ? 'Rate limit reached. Try again later.' : (data.message ?? 'Failed to start rerun.'));
        setState('error');
        return;
      }

      const { jobId } = data;
      const since = Date.now();

      const deadline = since + 150_000; // 2.5 minute timeout
      pollRef.current = setInterval(async () => {
        if (Date.now() > deadline) {
          clearInterval(pollRef.current!);
          setError('Scoring timed out — the docs site may be slow or blocking automated requests.');
          setState('error');
          return;
        }
        try {
          const statusRes = await fetch(`/agent-score/api/score/${jobId}?slug=${encodeURIComponent(slug)}&since=${since}`);
          if (!statusRes.ok) return;
          const job = await statusRes.json();

          if (job.status === 'complete') {
            clearInterval(pollRef.current!);
            window.location.reload();
          } else if (job.status === 'error') {
            clearInterval(pollRef.current!);
            setError(job.message ?? 'Scoring failed.');
            setState('error');
          }
        } catch { /* network glitch, keep polling */ }
      }, 2000);
    } catch {
      setError('Failed to start rerun.');
      setState('error');
    }
  }, [url, slug]);

  if (state === 'running') {
    return (
      <div className="rerun-overlay">
        <div className="hsf-running" style={{ padding: '0' }}>
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
      </div>
    );
  }

  return (
    <>
      <span className="rerun-btn" onClick={handleRerun} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleRerun()}>Rerun</span>
      {state === 'error' && <span className="rerun-error"> {error}</span>}
    </>
  );
}
