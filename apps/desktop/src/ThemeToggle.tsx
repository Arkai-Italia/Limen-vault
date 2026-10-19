import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'limen-theme';

export function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch {
    // fallback se localStorage non accessibile
  }
  return 'light';
}

export function applyTheme(theme: ThemeMode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignora errore storage
  }

  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
  }

  window.dispatchEvent(new CustomEvent('limen-theme-change', { detail: { theme } }));
}

export interface ThemeToggleProps {
  style?: React.CSSProperties;
  onThemeChange?: (theme: ThemeMode) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ style, onThemeChange }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    // Assicura che il DOM iniziale rifletta il tema salvato
    applyTheme(theme);
  }, []);

  const handleToggle = (newTheme: ThemeMode) => {
    if (newTheme === theme) return;
    setThemeState(newTheme);
    applyTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const isDark = theme === 'dark';

  return (
    <div
      role="radiogroup"
      aria-label="Selettore tema chiaro o scuro"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: isDark ? '#1a1a1a' : '#f1f5f9',
        borderRadius: 16,
        padding: '2px',
        border: isDark ? '1px solid #333333' : '1px solid #cbd5e1',
        userSelect: 'none',
        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {/* Light Theme Button */}
      <button
        type="button"
        role="radio"
        aria-checked={!isDark}
        title="Tema Chiaro"
        aria-label="Attiva tema chiaro"
        onClick={() => handleToggle('light')}
        style={{
          border: 'none',
          padding: '4px 8px',
          borderRadius: 14,
          backgroundColor: !isDark ? '#ffffff' : 'transparent',
          color: !isDark ? '#0f172a' : '#71717a',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          fontSize: 11,
          fontWeight: !isDark ? 700 : 500,
          boxShadow: !isDark ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <Sun size={13} color={!isDark ? '#d97706' : '#71717a'} />
      </button>

      {/* Dark Theme Button */}
      <button
        type="button"
        role="radio"
        aria-checked={isDark}
        title="Tema Scuro"
        aria-label="Attiva tema scuro"
        onClick={() => handleToggle('dark')}
        style={{
          border: 'none',
          padding: '4px 8px',
          borderRadius: 14,
          backgroundColor: isDark ? '#8d632d' : 'transparent',
          color: isDark ? '#ffffff' : '#64748b',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          fontSize: 11,
          fontWeight: isDark ? 700 : 500,
          boxShadow: isDark ? '0 1px 4px rgba(141, 99, 45, 0.4)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <Moon size={13} color={isDark ? '#ffffff' : '#64748b'} />
      </button>
    </div>
  );
};
