'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <nav style={{
      borderBottom: '1px solid var(--border)',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      justifyContent: 'space-between',
      background: 'var(--bg)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{ width: 10, height: 10, background: 'var(--accent)', flexShrink: 0 }} />
        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: '13px',
          fontWeight: 400,
          color: 'var(--fg)',
          letterSpacing: '0.5px',
        }}>
          Agent Score
        </span>
      </Link>

      {/* Center nav links — Geist Mono */}
      <div style={{
        display: 'flex',
        gap: '32px',
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        {[
          { label: 'Why it matters', href: '#why' },
          { label: 'Leaderboard',    href: '#leaderboard' },
          { label: 'Methodology',    href: '#methodology' },
        ].map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              fontWeight: 400,
              color: 'var(--fg-dim)',
              textDecoration: 'none',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-dim)')}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--fg-dim)',
          fontFamily: "'Geist Mono', monospace",
          fontSize: '11px',
          padding: '3px 10px',
          cursor: 'pointer',
          letterSpacing: '1px',
          lineHeight: 1.6,
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--fg-dim)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        {theme === 'dark' ? 'light' : 'dark'}
      </button>
    </nav>
  );
}
