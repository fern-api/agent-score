'use client';

import { useState } from 'react';
import DemoModal from './DemoModal';

export default function CTASection() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="cta-built">
        <div className="cta-built-inner">
          <h2 className="cta-built-title">Built by Fern</h2>
          <p className="cta-built-sub">Fern-powered docs are agent-ready by default.</p>
          <div className="cta-built-btns">
            <button onClick={() => setOpen(true)} className="cta-built-btn-primary">
              Book a demo ›
            </button>
            <a href="https://dashboard.buildwithfern.com/" target="_blank" rel="noreferrer" className="cta-built-btn-secondary">
              Get started for free ›
            </a>
          </div>
          <div className="cta-built-trusted-label">Trusted by</div>
          <div className="cta-built-logos">
            <img src="/agent-score/nvidia-top.svg"     alt="NVIDIA"     className="cta-logo" />
            <img src="/agent-score/square-top.svg"     alt="Square"     className="cta-logo" />
            <img src="/agent-score/elevenlabs-top.svg" alt="ElevenLabs" className="cta-logo" />
            <img src="/agent-score/twilio-top.svg"     alt="Twilio"     className="cta-logo" />
            <img src="/agent-score/adobe-top.svg"      alt="Adobe"      className="cta-logo" />
          </div>
        </div>
      </section>
      {open && <DemoModal onClose={() => setOpen(false)} source="Built by Fern CTA" />}
    </>
  );
}
