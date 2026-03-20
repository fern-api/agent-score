'use client';

import { useEffect, useState } from 'react';

const sections = [
  { id: 'section-1', label: '1. Executive Summary' },
  { id: 'section-2', label: '2. Product Vision & Positioning' },
  { id: 'section-3', label: '3. Brand & Messaging' },
  { id: 'section-4', label: '4. User Personas' },
  { id: 'section-5', label: '5. Scoring Methodology' },
  { id: 'section-6', label: '6. Feature Roadmap' },
  { id: 'section-7', label: '7. Leaderboard Design' },
  { id: 'section-8', label: '8. SEO Strategy' },
  { id: 'section-9', label: '9. Launch Strategy' },
  { id: 'section-10', label: '10. Viral Mechanics' },
  { id: 'section-11', label: '11. Content Marketing Plan' },
  { id: 'section-12', label: '12. Social Media Strategy' },
  { id: 'section-13', label: '13. Paid Acquisition & Budget' },
  { id: 'section-14', label: '14. Conversion Funnel' },
  { id: 'section-15', label: '15. Outreach & Partnerships' },
  { id: 'section-16', label: '16. PR Strategy' },
  { id: 'section-17', label: '17. Email Marketing' },
  { id: 'section-18', label: '18. Competitive Moat' },
  { id: 'section-19', label: '19. Risk Assessment' },
  { id: 'section-20', label: '20. KPIs & Milestones' },
  { id: 'section-21', label: '21. Execution Timeline' },
  { id: 'section-22', label: '22. Full Budget Summary' },
  { id: 'section-23', label: '23. Docs Site Detection Heuristics' },
];

export default function TOC() {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        let current = '';
        const offset = 120;
        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i].id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= offset) {
              current = sections[i].id;
              break;
            }
          }
        }
        setActiveId(current);
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="toc-title">Table of Contents</div>
      <ol className="toc-list">
        {sections.map((s) => (
          <li key={s.id} data-toc={s.id}>
            <a href={`#${s.id}`} className={activeId === s.id ? 'active' : ''}>
              {s.label}
            </a>
          </li>
        ))}
      </ol>
    </>
  );
}
