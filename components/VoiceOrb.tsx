'use client';

import { useState, useRef, useEffect } from 'react';

type OrbState = 'idle' | 'loading' | 'playing';

// Inline equalizer bars rendered via canvas when playing
function EqBars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef   = useRef([
    { current: 3, target: 3 },
    { current: 6, target: 6 },
    { current: 4, target: 4 },
    { current: 8, target: 8 },
    { current: 3, target: 3 },
  ]);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const dpr = window.devicePixelRatio || 1;
    const W = 14, H = 13;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    let lastUpdate = 0;
    const tick = (time: number) => {
      if (time - lastUpdate > 90) {
        barsRef.current.forEach(b => { b.target = 2 + Math.random() * 9; });
        lastUpdate = time;
      }
      barsRef.current.forEach(b => { b.current += (b.target - b.current) * 0.35; });

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'currentColor';
      const barW = 1.5, gap = 1.2;
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 14, height: 13, display: 'block', color: 'inherit' }}
    />
  );
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
        <EqBars />
      ) : (
        // Speaker + sound waves icon
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3,7 8,7 13,3 13,17 8,13 3,13" fill="currentColor" stroke="none" />
          <path d="M16 7a4 4 0 010 6" />
          <path d="M18.5 4.5a8 8 0 010 11" />
        </svg>
      )}
      <span>{state === 'playing' ? 'Stop' : state === 'loading' ? 'Loading…' : 'Listen'}</span>
    </button>
  );
}
