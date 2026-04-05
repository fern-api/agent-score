export default function SiteFooter() {
  return (
    <footer className="footer-grid">
      <div className="footer-cell">
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: 'var(--fg-mid)'}}>
          Developed by
        </span>
        <a href="https://buildwithfern.com" target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/fern-labs-dark.svg" alt="fern labs" style={{ height: 13, display: 'block', opacity: 1}} />
        </a>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: 'var(--fg-mid)' }}>·</span>
        <a
          href="mailto:support@buildwithfern.com?subject=Agent%20Score%20Issues"
          className="footer-link"
          style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11 }}
        >
          Contact us
        </a>
      </div>
      <div className="footer-cell footer-cell-right">
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: 'var(--fg-mid)' }}>
          Built on the{' '}
          <a
            href="https://github.com/agent-ecosystem/agent-docs-spec"
            target="_blank"
            rel="noopener"
            className="footer-link"
          >
            Agent-Friendly Documentation Spec
          </a>
          {' '}by{' '}
          <a
            href="https://github.com/dacharyc"
            target="_blank"
            rel="noopener"
            className="footer-link"
          >
            Dachary Carey
          </a>
        </span>
      </div>
    </footer>
  );
}
