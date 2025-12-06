'use client';

import React, { ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Ensure a single shared ThemeContext across HMR / multiple module instances
declare global {
  var __MY_APP_THEME_CONTEXT__: React.Context<ThemeContextType | undefined> | undefined;
}

const getSharedThemeContext = () => {
  if (typeof globalThis !== 'undefined' && (globalThis as any).__MY_APP_THEME_CONTEXT__) {
    return (globalThis as any).__MY_APP_THEME_CONTEXT__ as React.Context<ThemeContextType | undefined>;
  }

  const ctx = React.createContext<ThemeContextType | undefined>(undefined);
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__MY_APP_THEME_CONTEXT__ = ctx;
  }
  return ctx;
};

export const ThemeContext = getSharedThemeContext();

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } catch (e) {
      // localStorage may be unavailable in some environments
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {}
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
