'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

type Theme = 'dark' | 'light' | 'system';

function SunIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="3"/>
      <line x1="8" y1="1" x2="8" y2="2.5"/>
      <line x1="8" y1="13.5" x2="8" y2="15"/>
      <line x1="1" y1="8" x2="2.5" y2="8"/>
      <line x1="13.5" y1="8" x2="15" y2="8"/>
      <line x1="3.05" y1="3.05" x2="4.1" y2="4.1"/>
      <line x1="11.9" y1="11.9" x2="12.95" y2="12.95"/>
      <line x1="12.95" y1="3.05" x2="11.9" y2="4.1"/>
      <line x1="4.1" y1="11.9" x2="3.05" y2="12.95"/>
    </svg>
  );
}

function MoonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z"/>
    </svg>
  );
}

function MonitorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2" width="14" height="10" rx="1"/>
      <line x1="5" y1="15" x2="11" y2="15"/>
      <line x1="8" y1="12" x2="8" y2="15"/>
    </svg>
  );
}

function getEffectiveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

function applyTheme(theme: Theme) {
  const effective = getEffectiveTheme(theme);
  document.documentElement.setAttribute('data-theme', effective);
}

export default function Navbar() {
  const [theme, setTheme] = useState<Theme>('system');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>('dark');
  const [hovered, setHovered] = useState<Theme | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // On mount: read from localStorage, default to 'system'
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    const initial: Theme =
      saved === 'dark' || saved === 'light' || saved === 'system' ? saved : 'system';
    setTheme(initial);
    applyTheme(initial);
    setEffectiveTheme(getEffectiveTheme(initial));
  }, []);

  // Listen to system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') {
      setEffectiveTheme(theme);
      return;
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const next = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      setEffectiveTheme(next);
    };

    mq.addEventListener('change', handler);
    setEffectiveTheme(mq.matches ? 'dark' : 'light');

    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const selectTheme = (next: Theme) => {
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
    setDropdownOpen(false);
  };

  const options: { value: Theme; label: string; Icon: React.FC<{ size?: number }> }[] = [
    { value: 'dark',   label: 'Dark',   Icon: MoonIcon },
    { value: 'light',  label: 'Light',  Icon: SunIcon },
    { value: 'system', label: 'System', Icon: MonitorIcon },
  ];

  const ActiveButtonIcon =
    theme === 'system'
      ? MonitorIcon
      : effectiveTheme === 'light'
      ? SunIcon
      : MoonIcon;

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

      {/* Theme toggle — icon button + dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          aria-label="Toggle theme"
          onClick={() => setDropdownOpen(prev => !prev)}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-dim)')}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--fg-dim)',
            cursor: 'pointer',
            padding: 0,
            borderRadius: 4,
          }}
        >
          <ActiveButtonIcon size={16} />
        </button>

        {dropdownOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            zIndex: 200,
            minWidth: 130,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {options.map(({ value, label, Icon }) => {
              const isSelected = theme === value;
              const isHovered = hovered === value;
              return (
                <button
                  key={value}
                  onClick={() => selectTheme(value)}
                  onMouseEnter={() => setHovered(value)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    background: isHovered ? 'var(--border)' : 'transparent',
                    border: 'none',
                    color: isSelected ? 'var(--accent)' : 'var(--fg-dim)',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    letterSpacing: '0.3px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', width: 14, height: 14 }}>
                    <Icon size={14} />
                  </span>
                  <span style={{ flex: 1 }}>{label}</span>
                  {isSelected && (
                    <span style={{ marginLeft: 4, fontSize: '11px' }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
