'use client';

import { useState, useRef } from 'react';

export default function RerunButton({ url, slug }: { url: string; slug: string }) {
  const [state, setState] = useState<'idle' | 'running' | 'error'>('idle');
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function handleRerun() {
    setState('running');
    setError('');

    try {
      const res = await fetch('/api/score', {
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

      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/score/${jobId}`);
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
  }

  if (state === 'running') {
    return <span className="rerun-running">Rerunning…</span>;
  }

  return (
    <>
      <span className="rerun-btn" onClick={handleRerun} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleRerun()}>Rerun test</span>
      {state === 'error' && <span className="rerun-error"> {error}</span>}
    </>
  );
}
