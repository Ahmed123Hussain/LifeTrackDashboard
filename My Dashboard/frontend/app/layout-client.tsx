'use client';

import { ThemeProvider } from '@/lib/theme';
import { ReactNode } from 'react';

export function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
