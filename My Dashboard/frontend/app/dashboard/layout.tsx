'use client';

import { ThemeProvider } from '@/lib/theme';
import { Sidebar } from '@/components/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import './layout.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ProtectedRoute>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-8">{children}</div>
          </main>
        </div>
      </ProtectedRoute>
    </ThemeProvider>
  );
}
