'use client';

import { useState, useEffect, useRef } from 'react';

export default function NotifyModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState('loading');
    try {
      const res = await fetch('/agent-score/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), url }),
      });
      if (!res.ok) throw new Error();
      setState('success');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="demo-backdrop" onClick={onClose}>
      <div className="demo-modal" onClick={e => e.stopPropagation()}>
        <button className="demo-close" onClick={onClose} aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
          </svg>
        </button>

        {state === 'success' ? (
          <div className="demo-success">
            <svg className="demo-crt-svg" width="64" height="64" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M165.176 387.424H401.864V396.503H165.171L165.176 387.424Z" fill="#51C233"/>
              <path d="M165.216 369.232H383.52L383.506 378.431H165.171L165.216 369.232Z" fill="#51C233"/>
              <path d="M238.107 260.167H438.111V269.281H238.107V260.167Z" fill="#51C233"/>
              <path d="M238.107 241.991H419.766V250.976H238.107V241.991Z" fill="#51C233"/>
              <path d="M255.968 407.164L256.178 406.278C257.395 405.285 299.512 405.728 305.048 405.728L401.868 405.719V414.713L290.877 414.708C285.74 414.708 259.069 415.321 256.335 414.475L255.758 413.317C256.08 411.285 255.982 409.232 255.968 407.164Z" fill="#51C233"/>
              <path d="M328.772 280.937C328.951 279.221 328.642 279.203 329.591 278.354C341.748 277.713 359.6 278.253 372.138 278.254L456.001 278.267V287.437C434.318 287.442 356.629 287.548 329.577 287.346C329.376 287.157 329.175 286.969 328.973 286.78L328.714 284.722C329.009 283.379 328.852 282.306 328.772 280.937Z" fill="#51C233"/>
              <path d="M274.361 423.781L355.191 423.754C360.511 423.754 379.706 423.128 383.169 423.987L383.603 425.436C383.558 427.638 383.442 429.441 383.791 431.624L383.446 432.452C383.187 432.631 382.923 432.81 382.663 432.989C376.502 433.02 363.338 433.007 357.696 433.007L274.361 432.998V423.781Z" fill="#51C233"/>
              <path d="M56.0156 223.691H165.174L165.129 232.898H56L56.0156 223.691Z" fill="#51C233"/>
              <path d="M74.364 278.264H183.525L183.471 287.435H74.3506L74.364 278.264Z" fill="#51C233"/>
              <path d="M74.3506 260.166H183.525V269.279H74.3506V260.166Z" fill="#51C233"/>
              <path d="M56 241.991H165.174V250.976H56V241.991Z" fill="#51C233"/>
              <path d="M256.011 351.151H365.185V360.135H256.011V351.151Z" fill="#51C233"/>
              <path d="M165.171 351.146H238.103V360.131H165.171V351.146Z" fill="#51C233"/>
            </svg>
            <p className="demo-success-text">We&apos;ll let you know when scoring is ready for this site.</p>
          </div>
        ) : (
          <>
            <p className="demo-label">Get notified</p>
            <p className="demo-subtitle">Enter your email and we&apos;ll reach out when scoring is available for this site.</p>
            <form onSubmit={handleSubmit} className="demo-form">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="demo-input"
                required
              />
              <button type="submit" className="demo-submit" disabled={state === 'loading'}>
                {state === 'loading' ? 'Sending...' : 'Notify me'}
              </button>
            </form>
            {state === 'error' && (
              <p className="demo-error">Something went wrong. Please try again.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
