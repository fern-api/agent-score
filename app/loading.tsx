import { SkeletonRow } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Hero skeleton */}
      <section style={{ padding: '100px 0 60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '48px',
              paddingTop: '40px',
              paddingBottom: '40px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="h-4 w-64 bg-white/[0.06] animate-pulse" style={{ borderRadius: 0 }} />
              <div className="h-12 w-96 bg-white/[0.06] animate-pulse" style={{ borderRadius: 0 }} />
              <div className="h-12 w-80 bg-white/[0.06] animate-pulse" style={{ borderRadius: 0 }} />
              <div className="h-5 w-full max-w-xl bg-white/[0.06] animate-pulse mt-4" style={{ borderRadius: 0 }} />
              <div className="h-5 w-96 bg-white/[0.06] animate-pulse" style={{ borderRadius: 0 }} />
            </div>
            <div style={{ width: '520px', maxWidth: '100%', flexShrink: 0 }}>
              <div
                style={{
                  border: '1px solid rgba(0, 232, 123, 0.12)',
                  background: 'var(--color-bg)',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                <div className="h-6 w-32 bg-white/[0.06] animate-pulse" style={{ borderRadius: 0 }} />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="flex-1 h-14 bg-white/[0.06] animate-pulse" style={{ borderRadius: 0 }} />
                  <div className="h-14 w-28 bg-white/[0.06] animate-pulse" style={{ borderRadius: 0 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard skeleton */}
      <section style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div className="h-8 w-64 bg-white/[0.06] animate-pulse mb-3" style={{ borderRadius: 0 }} />
          <div className="h-5 w-96 bg-white/[0.06] animate-pulse mb-12" style={{ borderRadius: 0 }} />

          {/* Filter tabs skeleton */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '32px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-9 bg-white/[0.06] animate-pulse"
                style={{ width: `${60 + i * 12}px`, borderRadius: 0 }}
              />
            ))}
          </div>

          {/* Rows skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
