interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-white/[0.06] ${className}`}
      style={{ borderRadius: 0 }}
    />
  );
}

export function SkeletonRow() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        border: '1px solid rgba(0, 232, 123, 0.12)',
        background: 'var(--color-bg)',
        padding: '14px 16px',
        borderRadius: 0,
      }}
    >
      <Skeleton className="h-4 w-8 shrink-0" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-20 hidden sm:block" />
      <div className="flex-1 hidden md:block">
        <Skeleton className="h-1.5 w-full max-w-[200px]" />
      </div>
      <Skeleton className="h-4 w-8" />
      <Skeleton className="h-6 w-10" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        border: '1px solid rgba(0, 232, 123, 0.12)',
        background: 'var(--color-surface)',
        padding: '24px',
        borderRadius: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  );
}
