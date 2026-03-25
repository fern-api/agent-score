export default function CTASection() {
  return (
    <section className="cta-built">
      <div className="cta-built-inner">
        <h2 className="cta-built-title">Built by Fern</h2>
        <p className="cta-built-sub">Fern-powered docs are agent-ready by default.</p>
        <div className="cta-built-btns">
          <a href="https://buildwithfern.com/contact" target="_blank" rel="noreferrer" className="cta-built-btn-primary">
            Book a demo ›
          </a>
          <a href="https://buildwithfern.com" target="_blank" rel="noreferrer" className="cta-built-btn-secondary">
            Get started for free ›
          </a>
        </div>
        <div className="cta-built-trusted-label">Trusted by</div>
        <div className="cta-built-logos">
          <img src="/nvidia-top.svg"     alt="NVIDIA"     className="cta-logo" />
          <img src="/square-top.svg"     alt="Square"     className="cta-logo" />
          <img src="/elevenlabs-top.svg" alt="ElevenLabs" className="cta-logo" />
          <img src="/twilio-top.svg"     alt="Twilio"     className="cta-logo" />
          <img src="/adobe-top.svg"      alt="Adobe"      className="cta-logo" />
        </div>
      </div>
    </section>
  );
}
