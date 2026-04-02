export default function DotDivider() {
  return (
    <div className="dot-divider" style={{
      height: 56,
      width: '100%',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, #333333 1px, transparent 1px)',
        backgroundSize: '6px 6px',
        maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
      }} />
    </div>
  );
}
