'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [showScoreBtn, setShowScoreBtn] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const target = document.getElementById('hero-score-btn');
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowScoreBtn(!entry!.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (showScoreBtn) {
      // double rAF ensures the browser paints the initial off-screen state before transitioning
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
    }
  }, [showScoreBtn]);

  return (
    <>
    {showScoreBtn && <div style={{ height: 44, flexShrink: 0 }} />}
    <nav style={{
      borderBottom: '1px solid var(--border)',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      justifyContent: 'space-between',
      gap: '24px',
      background: 'var(--bg)',
      position: showScoreBtn ? 'fixed' : 'sticky',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      transform: showScoreBtn && !visible ? 'translateY(-100%)' : 'translateY(0)',
      transition: 'transform 0.25s ease',
    }}>
      {/* Logo */}
      <Link href="/agent-score" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
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

      {/* Center nav links -- Geist Mono, hidden on mobile */}
      <div style={{ display: isMobile ? 'none' : 'flex', gap: '32px', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        {[
          { label: 'Leaderboard',    href: '/agent-score#leaderboard' },
          { label: 'Why it matters', href: '/agent-score#why-it-matters' },
          { label: 'From the field', href: '/agent-score#humans' },
          { label: 'Methodology',    href: '/agent-score#methodology' },
        ].map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              fontWeight: 400,
              color: 'var(--fg-mid)',
              textDecoration: 'none',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-mid)')}
          >
            {label}
          </Link>
        ))}

      </div>

      {/* Score docs CTA -- always in DOM to reserve space, slides in from right */}
      <Link
        href="/agent-score"
        onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: '12px',
          fontWeight: 500,
          color: '#000',
          background: 'var(--accent)',
          textDecoration: 'none',
          letterSpacing: '0.3px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          alignSelf: 'stretch',
          marginRight: '-24px',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease',
          pointerEvents: visible ? 'auto' : 'none',
          visibility: showScoreBtn ? 'visible' : 'hidden',
        }}
      >
        Score docs
      </Link>
    </nav>
    </>
  );
}
