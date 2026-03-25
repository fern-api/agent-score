import '../company.css';

export default function CompanyLoading() {
  return (
    <main className="company-page">
      {/* Back nav skeleton */}
      <div className="company-back-nav">
        <span className="v3-skeleton-block" style={{ display: 'inline-block', width: '180px', height: '14px', verticalAlign: 'middle' }} />
      </div>

      {/* Hero skeleton */}
      <div className="v3-skeleton-hero">
        <div className="v3-skeleton-left">
          <div className="v3-skeleton-block" style={{ width: '140px', height: '13px' }} />
          <div className="v3-skeleton-block" style={{ width: '280px', height: '52px', marginTop: '12px' }} />
          <div className="v3-skeleton-block" style={{ width: '200px', height: '14px', marginTop: '8px' }} />
        </div>
        <div className="v3-skeleton-right">
          <div className="v3-skeleton-block" style={{ width: '120px', height: '96px' }} />
          <div className="v3-skeleton-block" style={{ width: '80px', height: '20px' }} />
        </div>
      </div>

      {/* Stats bar skeleton */}
      <div className="v3-skeleton-grid" style={{ borderBottom: '1px solid #1a1a1a' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="v3-skeleton-cell" style={{ borderBottom: 'none' }}>
            <div className="v3-skeleton-block" style={{ width: '80px', height: '12px' }} />
            <div className="v3-skeleton-block" style={{ width: '60px', height: '22px' }} />
          </div>
        ))}
      </div>

      {/* Category grid skeleton */}
      <div style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div className="v3-skeleton-header">
          <div className="v3-skeleton-block" style={{ width: '200px', height: '18px' }} />
          <div className="v3-skeleton-block" style={{ width: '80px', height: '14px' }} />
        </div>
        <div className="v3-skeleton-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="v3-skeleton-cell">
              <div className="v3-skeleton-block" style={{ width: '120px', height: '14px' }} />
              <div className="v3-skeleton-block" style={{ width: '80px', height: '12px' }} />
              <div className="v3-skeleton-block" style={{ width: '100%', height: '2px' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Checks skeleton */}
      <div style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div className="v3-skeleton-header">
          <div className="v3-skeleton-block" style={{ width: '160px', height: '18px' }} />
          <div className="v3-skeleton-block" style={{ width: '80px', height: '14px' }} />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: '16px', padding: '14px 24px', borderBottom: '1px solid #1a1a1a' }}>
            <div className="v3-skeleton-block" style={{ height: '16px', width: '60%' }} />
            <div className="v3-skeleton-block" style={{ width: '80px', height: '2px' }} />
            <div className="v3-skeleton-block" style={{ width: '28px', height: '18px' }} />
            <div className="v3-skeleton-block" style={{ width: '20px', height: '18px' }} />
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontFamily: "'VT323', monospace", fontSize: '20px', letterSpacing: '4px', color: '#555', textTransform: 'uppercase' }}>
          // LOADING_REPORT
        </span>
        <span className="v3-skeleton-block" style={{ display: 'inline-block', width: '10px', height: '18px' }} />
      </div>
    </main>
  );
}
