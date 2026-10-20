'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

import { THEME_STORAGE_KEY } from '@/lib/theme';

type Theme = 'dark' | 'light';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);

  const select = (next: Theme) => {
    setTheme(next);
    if (next === 'light') document.documentElement.dataset.theme = 'light';
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  };

  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      {(['dark', 'light'] as const).map((t) => {
        const Icon = t === 'dark' ? Moon : Sun;
        const label = t === 'dark' ? 'Dark theme' : 'Light theme';
        return (
          <button
            key={t}
            type="button"
            className={`theme-toggle-btn${theme === t ? ' active' : ''}`}
            aria-pressed={theme === t}
            aria-label={label}
            title={label}
            onClick={() => select(t)}
          >
            <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
