'use client';

import { useEffect, useState } from 'react';

const key = 'avante-theme';
const systemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = (() => { try { return localStorage.getItem(key); } catch { return null; } })();
    const initial = saved === 'dark' || saved === 'light' ? saved : systemTheme();
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    document.documentElement.style.colorScheme = initial;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystem = () => { try { if (!localStorage.getItem(key)) setTheme(systemTheme()); } catch { setTheme(systemTheme()); } };
    const onStorage = event => { if (event.key === key || event.key === null) setTheme(event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : systemTheme()); };
    media.addEventListener('change', onSystem);
    window.addEventListener('storage', onStorage);
    return () => { media.removeEventListener('change', onSystem); window.removeEventListener('storage', onStorage); };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const label = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
  return (
    <button type="button" className="theme-toggle m-iconbtn" aria-label={label} title={label} aria-pressed={theme === 'dark'} onClick={() => {
      const next = theme === 'dark' ? 'light' : 'dark';
      setTheme(next);
      try { localStorage.setItem(key, next); } catch { /* Current session remains functional. */ }
    }}>
      <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg>
      <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20 15A8.5 8.5 0 0 1 9 4a8.5 8.5 0 1 0 11 11Z" /></svg>
      <span className="sr-only">{label}</span>
    </button>
  );
}
