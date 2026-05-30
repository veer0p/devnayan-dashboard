import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dentease.theme';
const VALID = ['dark', 'light'];

const readInitial = () => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (VALID.includes(stored)) return stored;
  } catch { /* ignore */ }
  return 'dark';
};

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
    root.classList.remove('dark');
  } else {
    root.removeAttribute('data-theme');
    root.classList.add('dark');
  }
};

export function useTheme() {
  const [theme, setThemeState] = useState(readInitial);

  // Apply on mount (and whenever theme changes)
  useEffect(() => {
    applyTheme(theme);
    try { window.localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const setTheme = useCallback((t) => {
    if (VALID.includes(t)) setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((cur) => (cur === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggleTheme };
}

// Apply the stored theme as soon as the module loads — avoids first-paint flash
applyTheme(readInitial());
