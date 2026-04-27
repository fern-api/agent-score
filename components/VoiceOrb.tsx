'use client';

import { useState, useRef } from 'react';

type OrbState = 'idle' | 'loading' | 'playing';

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
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setState('idle'); URL.revokeObjectURL(url); };
      audio.onerror = () => { setState('idle'); };
      await audio.play();
      setState('playing');
    } catch {
      setState('idle');
    }
  };

  return (
    <>
      <style>{`
        @keyframes orb-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.15); }
          50% { box-shadow: 0 0 0 8px rgba(255,255,255,0); }
        }
        .voice-orb {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0,0,0,0.55);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(6px);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: background 0.15s, border-color 0.15s;
        }
        .voice-orb:hover {
          background: rgba(0,0,0,0.75);
          border-color: rgba(255,255,255,0.25);
        }
        .voice-orb.playing {
          animation: orb-pulse 1.6s ease-in-out infinite;
          border-color: rgba(255,255,255,0.3);
        }
      `}</style>
      <button
        className={`voice-orb${state === 'playing' ? ' playing' : ''}`}
        onClick={handleClick}
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
    </>
  );
}
