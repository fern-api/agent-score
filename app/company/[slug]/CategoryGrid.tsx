interface Category {
  name: string;
  score: number;
  meta: string;
}

function barColor(score: number) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
}

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="categories-grid">
      {categories.map((cat) => (
        <div key={cat.name} className="category-card">
          <div className="category-header">
            <span className="category-name">{cat.name}</span>
            <span className="category-meta">{cat.meta}</span>
          </div>
          <div className="category-bar-wrapper">
            <div className="category-bar-track">
              <div
                className={`category-bar-fill ${barColor(cat.score)} animated`}
                style={{ '--bar-target': `${cat.score}%` } as React.CSSProperties}
              />
            </div>
            <span className="category-score">{cat.score}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
