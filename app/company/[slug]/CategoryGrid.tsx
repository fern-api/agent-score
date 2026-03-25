interface Category {
  name: string;
  score: number;
  meta: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return '#00ff66';
  if (score >= 65) return '#ccff44';
  if (score >= 45) return '#ffcc00';
  if (score >= 30) return '#ff8800';
  return '#ff4444';
}

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="v3-categories-grid">
      {categories.map((cat, idx) => {
        const color = scoreColor(cat.score);
        return (
          <div key={cat.name} className="v3-category-card">
            <div className="v3-cat-name">
              <span style={{ color: 'var(--fg-dim)', marginRight: '8px', fontSize: '13px', letterSpacing: '2px' }}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              {cat.name.toUpperCase()}
            </div>
            <div className="v3-cat-meta">{cat.meta.toUpperCase()}</div>
            <div className="v3-cat-score-row">
              <div className="v3-cat-bar-track">
                <div
                  className="v3-cat-bar-fill"
                  style={{ '--bar-width': `${cat.score}%`, background: color } as React.CSSProperties}
                />
              </div>
              <span className="v3-cat-score-num" style={{ color }}>{cat.score}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
