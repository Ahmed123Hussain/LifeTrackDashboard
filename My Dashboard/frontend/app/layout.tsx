import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LayoutClient } from './layout-client';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LifeTrack Dashboard',
  description: 'Manage your certifications, degrees, todos, and goals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
