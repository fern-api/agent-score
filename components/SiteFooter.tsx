import Image from 'next/image';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="footer-developed-by mono">
              Developed by
            </div>
            <Image
              src="/fern-labs-dark.svg"
              alt="Fern Labs"
              width={80}
              height={20}
              className="footer-fern-logo fern-logo-dark"
            />
            <Image
              src="/fern-labs-light.svg"
              alt="Fern Labs"
              width={80}
              height={20}
              className="footer-fern-logo fern-logo-light"
            />
          </div>
          <div className="footer-right">
            Built on the{' '}
            <a href="https://github.com/agent-ecosystem/agent-docs-spec" target="_blank" rel="noopener">
              Agent-Friendly Documentation Spec
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
