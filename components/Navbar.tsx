'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'agent-score-theme';

type Theme = 'system' | 'light' | 'dark';

const themeIcons: Record<Theme, React.ReactNode> = {
  system: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="0" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  light: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
};

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');
  const [checkerVisible, setCheckerVisible] = useState(true);

  useEffect(() => {
    // Scroll listener
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', window.scrollY > 10);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Observe hero checker visibility
    const checkerEl = document.getElementById('hero-checker');
    let observer: IntersectionObserver | null = null;
    if (checkerEl) {
      observer = new IntersectionObserver(
        ([entry]) => setCheckerVisible(entry.isIntersecting),
        { threshold: 0.1 }
      );
      observer.observe(checkerEl);
    }

    // Initialize theme from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored) {
        setTheme(stored);
        applyTheme(stored);
      }
    } catch {}

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer?.disconnect();
    };
  }, []);

  function applyTheme(t: Theme) {
    document.documentElement.removeAttribute('data-theme');
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  }

  function selectTheme(t: Theme) {
    setTheme(t);
    applyTheme(t);
    setMenuOpen(false);
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
  }

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  return (
    <nav ref={navRef} className="navbar">
      <div className="container">
        <Link href="/" className="nav-logo">
          <span className="nav-cursor">&#9610;</span>
          <div>AGENT SCORE</div>
        </Link>

        <div className="nav-tabs">
          <a href="/#why" className="nav-tab">Why it matters</a>
          <a href="/#leaderboard" className="nav-tab">Leaderboard</a>
          <a href="/#methodology" className="nav-tab">Methodology</a>
        </div>

        <div className="nav-actions">
          {!checkerVisible && (
            <a href="/#hero-checker" className="btn-primary nav-cta">
              <span className="btn-full">Check your score</span>
              <span className="btn-short">Score</span>
            </a>
          )}
          <div className="theme-dropdown" onClick={(e) => e.stopPropagation()}>
            <button
              className="theme-dropdown-btn"
              aria-label="Toggle theme"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {themeIcons[theme]}
            </button>
            <div className={`theme-dropdown-menu${menuOpen ? ' open' : ''}`}>
              <button
                className={`theme-option${theme === 'system' ? ' active' : ''}`}
                onClick={() => selectTheme('system')}
              >
                {themeIcons.system}
                System
              </button>
              <button
                className={`theme-option${theme === 'light' ? ' active' : ''}`}
                onClick={() => selectTheme('light')}
              >
                {themeIcons.light}
                Light
              </button>
              <button
                className={`theme-option${theme === 'dark' ? ' active' : ''}`}
                onClick={() => selectTheme('dark')}
              >
                {themeIcons.dark}
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
