'use client';

import { useState, useRef, useEffect } from 'react';

export default function LeaderboardRequestButton({ pageUrl, slug }: { pageUrl: string; slug: string }) {
  const [state, setState] = useState<'idle' | 'modal' | 'submitting' | 'sent' | 'error'>('idle');
  const [email, setEmail] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state === 'modal') inputRef.current?.focus();
  }, [state]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === 'submitting') return;
    setState('submitting');
    try {
      const res = await fetch('/agent-score/api/leaderboard-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, url: pageUrl, slug }),
      });
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'error') {
    return <span className="co-lb-request co-lb-request--error">Something went wrong. Please try again.</span>;
  }

  const showModal = state === 'modal' || state === 'submitting' || state === 'sent';

  return (
    <>
      {state !== 'sent' && (
        <>
          {' · '}
          <span
            className="co-lb-request"
            role="button"
            tabIndex={0}
            onClick={() => setState('modal')}
            onKeyDown={e => e.key === 'Enter' && setState('modal')}
          >
            Request listing
          </span>
        </>
      )}

      {showModal && (
        <div className="co-lb-modal-overlay" onClick={() => setState('idle')}>
          <div className="co-lb-modal" onClick={e => e.stopPropagation()}>
            {state === 'sent' ? (
              <div className="co-lb-modal-success">
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
                  <path d="M328.955 114.556H419.757L419.73 123.791H328.928L328.955 114.556Z" fill="#51C233"/>
                  <path d="M183.521 169.121C192.989 169.117 272.476 168.268 274.391 169.685L274.382 177.813C272.673 179.114 192.766 178.352 183.521 178.348V169.121Z" fill="#51C233"/>
                  <path d="M183.521 151.071H274.351V160.117H183.521V151.071Z" fill="#51C233"/>
                  <path d="M328.928 151.073H419.757V160.118H328.928V151.073Z" fill="#51C233"/>
                  <path d="M347.278 78.2384H438.108V87.2798H347.278V78.2384Z" fill="#51C233"/>
                  <path d="M201.426 187.414H292.702V196.409H201.426V187.414Z" fill="#51C233"/>
                  <path d="M347.297 96.5163L438.117 96.5172V105.535H347.297V96.5163Z" fill="#51C233"/>
                  <path d="M183.521 132.825H274.351V141.838H183.521V132.825Z" fill="#51C233"/>
                  <path d="M328.928 132.829H419.757V141.843H328.928V132.829Z" fill="#51C233"/>
                  <path d="M183.549 114.559H256.006L255.979 123.793H183.521L183.549 114.559Z" fill="#51C233"/>
                  <path d="M238.107 278.264L282.31 278.249C291.191 278.228 301.115 277.982 309.871 278.348C310.878 279.224 310.547 279.137 310.748 280.935C310.668 282.303 310.511 283.377 310.807 284.719C310.731 285.802 310.82 286.475 310.109 287.267C307.948 287.672 292.623 287.463 289.218 287.462L238.107 287.435V278.264Z" fill="#51C233"/>
                  <path d="M56 205.622H128.932V214.699H56V205.622Z" fill="#51C233"/>
                  <path d="M165.171 351.146H238.103V360.131H165.171V351.146Z" fill="#51C233"/>
                  <path d="M365.182 296.573H438.113V305.552H365.182V296.573Z" fill="#51C233"/>
                  <path d="M165.171 405.72L217.422 405.693C220.174 405.693 236.036 405.38 237.799 405.971L238.143 407.165C238.13 409.233 238.031 411.286 238.354 413.318L237.866 414.351C235.535 414.977 219.79 414.74 216.196 414.74L165.171 414.714V405.72Z" fill="#51C233"/>
                  <path d="M110.547 298.001L110.878 296.829C114.135 295.715 175.287 296.565 183.51 296.574V305.554C176.248 305.558 112.019 305.907 110.793 305.169L110.547 304.122V298.001Z" fill="#51C233"/>
                  <path d="M383.567 60H438.118L438.096 69.2306H383.531L383.567 60Z" fill="#51C233"/>
                  <path d="M328.95 169.122H383.515L383.479 178.349H328.928L328.95 169.122Z" fill="#51C233"/>
                  <path d="M219.756 205.619H274.343V214.696H219.756V205.619Z" fill="#51C233"/>
                  <path d="M201.499 314.699H256.001L255.992 323.858H201.414C201.391 320.806 201.418 317.75 201.499 314.699Z" fill="#51C233"/>
                  <path d="M219.756 296.575H274.343V305.555H219.756V296.575Z" fill="#51C233"/>
                  <path d="M201.435 332.839H238.115V341.963H201.426L201.435 332.839Z" fill="#51C233"/>
                  <path d="M165.207 423.779H201.413L201.395 433.005H165.171L165.207 423.779Z" fill="#51C233"/>
                  <path d="M292.705 223.691H328.934L328.889 232.898H292.691L292.705 223.691Z" fill="#51C233"/>
                  <path d="M347.292 223.691H383.52L383.476 232.898H347.278L347.292 223.691Z" fill="#51C233"/>
                  <path d="M238.121 223.691H274.35L274.305 232.898H238.107L238.121 223.691Z" fill="#51C233"/>
                  <path d="M310.596 205.622H347.285V214.699H310.596V205.622Z" fill="#51C233"/>
                  <path d="M146.914 314.699H183.519L183.51 323.858H146.829C146.807 320.806 146.833 317.75 146.914 314.699Z" fill="#51C233"/>
                  <path d="M201.382 100.139C201.405 98.6245 201.208 98.0017 201.83 96.7435C205.074 96.2557 211.083 96.4795 214.569 96.4849L238.113 96.5148V105.533C229.168 105.541 209.879 106.117 201.754 105.338C201.248 104.083 201.374 103.291 201.401 101.946L201.382 100.139Z" fill="#51C233"/>
                  <path d="M165.171 442.003H201.413V451.055H165.171V442.003Z" fill="#51C233"/>
                  <path d="M165.18 332.842H183.516V341.965H165.171L165.18 332.842Z" fill="#51C233"/>
                  <path d="M201.426 78.2339H219.771V87.2752H201.426V78.2339Z" fill="#51C233"/>
                  <path d="M328.928 96.5163L347.281 96.5168V105.535H328.928V96.5163Z" fill="#51C233"/>
                  <path d="M328.928 187.414H347.273V196.409H328.928V187.414Z" fill="#51C233"/>
                  <path d="M74.3506 187.414H92.248V196.409H74.3506V187.414Z" fill="#51C233"/>
                  <path d="M401.863 405.72H419.765V414.714H401.863V405.72Z" fill="#51C233"/>
                </svg>
                <p className="demo-success-text">We&apos;ll review your site and be in touch soon.</p>
              </div>
            ) : (
              <>
                <p className="co-lb-modal-title">Request leaderboard listing</p>
                <p className="co-lb-modal-desc">Enter your email and we&apos;ll review your site for inclusion.</p>
                <form onSubmit={handleSubmit} className="co-lb-modal-form">
                  <input
                    ref={inputRef}
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="co-lb-modal-input"
                    disabled={state === 'submitting'}
                  />
                  <button type="submit" className="co-lb-modal-btn" disabled={state === 'submitting'}>
                    {state === 'submitting' ? 'Sending…' : 'Submit'}
                  </button>
                </form>
              </>
            )}
            <button className="co-lb-modal-close" onClick={() => setState('idle')} aria-label="Close">✕</button>
          </div>
        </div>
      )}
    </>
  );
}
