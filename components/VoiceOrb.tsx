'use client';

import { useState, useRef, useEffect } from 'react';

// Layout constants
const CANVAS_SIZE = 80; // total container size in px
const BTN_SIZE    = 40;
const OFFSET      = (CANVAS_SIZE - BTN_SIZE) / 2; // 20 — gap between container edge and button

// Radial bar constants
const BAR_COUNT = 48;
const INNER_R   = 23; // px from canvas center to bar inner edge (just outside button radius 20)
const MAX_BAR   = 11; // max bar length in px
const MIN_BAR   = 2;  // min bar length in px

type OrbState = 'idle' | 'loading' | 'playing';

export default function VoiceOrb({ text }: { text: string }) {
  const [state, setState] = useState<OrbState>('idle');
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const barsRef    = useRef(
    Array.from({ length: BAR_COUNT }, () => ({ current: MIN_BAR, target: MIN_BAR }))
  );
  const animRef = useRef(0);

  // Drive the canvas animation while playing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (state !== 'playing') {
      cancelAnimationFrame(animRef.current);
      barsRef.current.forEach(b => { b.current = MIN_BAR; b.target = MIN_BAR; });
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    let lastTargetUpdate = 0;

    const tick = (time: number) => {
      // Randomise bar targets every ~80 ms
      if (time - lastTargetUpdate > 80) {
        barsRef.current.forEach(b => {
          b.target = MIN_BAR + Math.random() * (MAX_BAR - MIN_BAR);
        });
        lastTargetUpdate = time;
      }

      // Lerp each bar toward its target
      barsRef.current.forEach(b => {
        b.current += (b.target - b.current) * 0.3;
      });

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.lineWidth  = 1.5;
      ctx.lineCap    = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';

      barsRef.current.forEach((b, i) => {
        const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(cx + cos * INNER_R,              cy + sin * INNER_R);
        ctx.lineTo(cx + cos * (INNER_R + b.current), cy + sin * (INNER_R + b.current));
        ctx.stroke();
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [state]);

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
    <div
      style={{
        position: 'absolute',
        top: OFFSET - OFFSET,   // = 0 — container top-right corner of co-hero-right
        right: OFFSET - OFFSET, // = 0
        width:  CANVAS_SIZE,
        height: CANVAS_SIZE,
        zIndex: 10,
        pointerEvents: 'none',  // let canvas clicks fall through to the button
      }}
    >
      {/* Radial-bar canvas — behind the button */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width:  CANVAS_SIZE,
          height: CANVAS_SIZE,
          pointerEvents: 'none',
          opacity: state === 'playing' ? 1 : 0,
          transition: 'opacity 0.4s',
        }}
      />

      {/* Play / pause button — centered inside the canvas container */}
      <button
        onClick={handleClick}
        style={{
          position: 'absolute',
          top:  OFFSET,
          left: OFFSET,
          width:  BTN_SIZE,
          height: BTN_SIZE,
          borderRadius: '50%',
          background:   'rgba(0,0,0,0.55)',
          border:       `1px solid ${state === 'playing' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)'}`,
          backdropFilter: 'blur(6px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          transition: 'background 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.75)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
        aria-label={state === 'playing' ? 'Stop audio' : 'Play executive summary'}
        title={state === 'playing' ? 'Stop' : 'Listen to executive summary'}
      >
        {state === 'loading' ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
            <path d="M8 2a6 6 0 016 6" stroke="white" strokeWidth="2" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" values="0 8 8;360 8 8" dur="0.75s" repeatCount="indefinite" />
            </path>
          </svg>
        ) : state === 'playing' ? (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="white">
            <rect x="1.5" y="1.5" width="4" height="10" rx="1" />
            <rect x="7.5" y="1.5" width="4" height="10" rx="1" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="white">
            <path d="M3 1.5l8 5-8 5V1.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
