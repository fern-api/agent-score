export default function SiteFooter() {
  return (
    <footer className="footer-grid">
      <div className="footer-cell">
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#444', marginRight: 8 }}>
          Developed by
        </span>
        <a href="https://buildwithfern.com" target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/fern-labs-dark.svg" alt="fern labs" style={{ height: 13, display: 'block', opacity: 0.55 }} />
        </a>
      </div>
      <div className="footer-cell footer-cell-right">
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#444' }}>
          Built on the{' '}
          <a
            href="https://github.com/agent-ecosystem/agent-docs-spec"
            target="_blank"
            rel="noopener"
            style={{ color: '#555', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            Agent-Friendly Documentation Spec
          </a>
        </span>
      </div>
    </footer>
  );
}
