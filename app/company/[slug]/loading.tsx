import '../company.css';

export default function CompanyLoading() {
  return (
    <main className="co-page">
      {/* Breadcrumb skeleton */}
      <div className="co-breadcrumb">
        <span className="co-skeleton-block" style={{ display: 'inline-block', width: '180px', height: '13px', verticalAlign: 'middle' }} />
      </div>

      {/* Hero skeleton */}
      <div className="co-hero">
        <div className="co-hero-left">
          <div className="co-skeleton-block" style={{ width: '340px', height: '44px' }} />
          <div className="co-skeleton-block" style={{ width: '200px', height: '14px', marginTop: '6px' }} />
        </div>
        <div className="co-hero-right">
          <div className="co-skeleton-block" style={{ width: '120px', height: '120px', borderRadius: '50%' }} />
          <div className="co-skeleton-block" style={{ width: '80px', height: '24px' }} />
          <div className="co-skeleton-block" style={{ width: '120px', height: '13px' }} />
        </div>
      </div>

      {/* Panels row skeleton */}
      <div className="co-panels-row">
        <div className="co-panel" style={{ padding: '14px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="co-skeleton-block" style={{ width: '160px', height: '14px' }} />
        </div>
        <div className="co-panel" style={{ padding: '14px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="co-skeleton-block" style={{ width: '200px', height: '14px' }} />
        </div>
      </div>

      {/* Check results skeleton */}
      <div className="co-checks-section">
        <h2 className="co-checks-title">
          <span className="co-skeleton-block" style={{ display: 'inline-block', width: '160px', height: '22px' }} />
        </h2>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="co-check-row" style={{ cursor: 'default' }}>
            <div className="co-skeleton-block" style={{ height: '14px', width: '50%' }} />
            <div className="co-check-bar-track">
              <div className="co-skeleton-block" style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }} />
            </div>
            <div className="co-skeleton-block" style={{ width: '28px', height: '14px', justifySelf: 'end' }} />
            <div className="co-skeleton-block" style={{ width: '16px', height: '14px' }} />
          </div>
        ))}
      </div>
    </main>
  );
}
