import React from 'react';
import { Sun, Moon } from '@phosphor-icons/react';
import { useTheme } from '../../lib/useTheme';

export default function ThemeToggle({ size = 'md' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`${sizes[size]} flex items-center justify-center rounded-full border border-border-color bg-bg-card text-text-main hover:bg-bg-body hover:border-text-muted/40 transition-colors`}
    >
      {isDark ? <Sun size={18} weight="duotone" /> : <Moon size={18} weight="duotone" />}
    </button>
  );
}
