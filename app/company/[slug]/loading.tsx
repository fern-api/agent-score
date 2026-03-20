import Skeleton from '@/components/ui/Skeleton';

export default function CompanyLoading() {
  return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <section style={{ textAlign: 'center', padding: '64px 0 48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          {/* Breadcrumb */}
          <Skeleton className="h-4 w-36 mx-auto mb-6" />

          {/* Company name */}
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          {/* Domain */}
          <Skeleton className="h-4 w-48 mx-auto mb-12" />

          {/* Score ring placeholder */}
          <div
            style={{
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '50%',
              margin: '0 auto 24px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />

          {/* Grade badge */}
          <Skeleton className="h-10 w-16 mx-auto mb-4" />

          {/* Summary block */}
          <div
            style={{
              maxWidth: '640px',
              margin: '32px auto',
              border: '1px solid rgba(0, 232, 123, 0.12)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '8px 16px',
                background: 'var(--color-surface)',
                borderBottom: '1px solid rgba(0, 232, 123, 0.12)',
              }}
            >
              <Skeleton className="h-3 w-32" />
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </section>

      {/* Category breakdown skeleton */}
      <section style={{ padding: '48px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Skeleton className="h-6 w-48 mb-6" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid rgba(0, 232, 123, 0.12)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
