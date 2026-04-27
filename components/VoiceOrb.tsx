'use client';

import { useState, useRef, useEffect } from 'react';

type OrbState = 'idle' | 'loading' | 'playing';

// Inline equalizer bars rendered via canvas when playing
function EqBars({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef   = useRef([
    { current: 3, target: 3 },
    { current: 7, target: 7 },
    { current: 4, target: 4 },
    { current: 9, target: 9 },
    { current: 3, target: 3 },
  ]);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const dpr = window.devicePixelRatio || 1;
    const W = 13, H = 13;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    let lastUpdate = 0;
    const tick = (time: number) => {
      if (time - lastUpdate > 85) {
        barsRef.current.forEach(b => { b.target = 2 + Math.random() * 10; });
        lastUpdate = time;
      }
      barsRef.current.forEach(b => { b.current += (b.target - b.current) * 0.3; });

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color;
      const barW = 1.5, gap = 1.3;
      const totalW = barsRef.current.length * barW + (barsRef.current.length - 1) * gap;
      let x = (W - totalW) / 2;
      for (const b of barsRef.current) {
        const h = Math.max(2, b.current);
        ctx.fillRect(x, H - h, barW, h);
        x += barW + gap;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [color]);

  return <canvas ref={canvasRef} style={{ width: 13, height: 13, display: 'block', flexShrink: 0 }} />;
}

export default function VoiceOrb({ text }: { text: string }) {
  const [state, setState] = useState<OrbState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleClick = async () => {
    if (state === 'playing' || state === 'loading') {
      audioRef.current?.pause();
      audioRef.current = null;
      setState('idle');
      return;
    }

    setState('loading');
    try {
      const res = await fetch('/agent-score/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) { setState('idle'); return; }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(objectUrl);
      audioRef.current = audio;
      audio.onended = () => { setState('idle'); URL.revokeObjectURL(objectUrl); };
      audio.onerror = () => { setState('idle'); };
      await audio.play();
      setState('playing');
    } catch {
      setState('idle');
    }
  };

  return (
    <button
      className="co-copy-btn"
      onClick={handleClick}
      aria-label={state === 'playing' ? 'Stop audio' : 'Listen to executive summary'}
    >
      {state === 'loading' ? (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" />
          <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 8 8;360 8 8" dur="0.75s" repeatCount="indefinite" />
          </path>
        </svg>
      ) : state === 'playing' ? (
        <EqBars color="var(--fg-mid, #888)" />
      ) : (
        // Speaker + sound waves icon — viewBox has room for the waves on the right
        <svg width="13" height="13" viewBox="0 0 22 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3,7 8,7 13,3 13,17 8,13 3,13" fill="currentColor" stroke="none" />
          <path d="M15.5 7.5a3.5 3.5 0 010 5" />
          <path d="M18.5 5a7 7 0 010 10" />
        </svg>
      )}
      <span>{state === 'playing' ? 'Stop' : state === 'loading' ? 'Loading…' : 'Listen'}</span>
    </button>
  );
}
