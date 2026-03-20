'use client';

interface GradeBadgeProps {
  grade: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function GradeBadge({ grade, size = 'md' }: GradeBadgeProps) {
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { fontSize: '12px', padding: '2px 8px' },
    md: { fontSize: '14px', padding: '4px 10px' },
    lg: { fontSize: '24px', padding: '8px 20px' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Geist Mono', 'SF Mono', monospace",
        fontWeight: 700,
        borderRadius: 0,
        background: 'rgba(0, 232, 123, 0.12)',
        border: '1px solid rgba(0, 232, 123, 0.3)',
        color: '#00e87b',
        transition: 'background 0.2s ease, border-color 0.2s ease',
        ...sizeStyles[size],
      }}
    >
      {grade}
    </span>
  );
}
