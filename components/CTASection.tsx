import Image from 'next/image';

const trustedLogos = [
  { src: '/nvidia-top.svg', alt: 'Nvidia' },
  { src: '/square-top.svg', alt: 'Square' },
  { src: '/elevenlabs-top.svg', alt: 'ElevenLabs' },
  { src: '/twilio-top.svg', alt: 'Twilio' },
  { src: '/adobe-top.svg', alt: 'Adobe' },
];

export default function CTASection() {
  return (
    <section className="cta-section fade-section visible">
      <div className="container">
        <h2 className="section-title">Built by Fern</h2>
        <p className="cta-description">
          Fern-powered docs are agent-ready by default.
        </p>
        <div className="cta-buttons">
          <a href="https://buildwithfern.com/book-demo" className="btn-primary" target="_blank" rel="noopener">
            Book a demo ›
          </a>
          <a
            href="https://dashboard.buildwithfern.com/sign-up?redirect_on_login=%2Fget-started&utm_source=fern-agent-score"
            className="btn-secondary"
            target="_blank"
            rel="noopener"
          >
            Get started for free ›
          </a>
        </div>
        <p className="cta-trusted">Trusted by</p>
        <div className="cta-logos">
          {trustedLogos.map((logo) => (
            <Image
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              width={80}
              height={28}
              className="cta-logo"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
