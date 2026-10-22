interface Category {
  name: string;
  score: number;
  meta: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--score-a)';
  if (score >= 65) return 'var(--score-b)';
  if (score >= 45) return 'var(--score-c)';
  if (score >= 30) return 'var(--score-d)';
  return 'var(--score-f)';
}

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="co-cat-grid">
      {categories.map((cat) => {
        const color = scoreColor(cat.score);
        return (
          <div key={cat.name} className="co-cat-card">
            <div className="co-cat-name">{cat.name}</div>
            <div className="co-cat-meta">{cat.meta}</div>
            <div className="co-cat-bar-track">
              <div
                className="co-cat-bar-fill"
                style={{ width: `${cat.score}%`, background: color } as React.CSSProperties}
              />
            </div>
            <span className="co-cat-score" style={{ color }}>{cat.score}</span>
          </div>
        );
      })}
    </div>
  );
}
