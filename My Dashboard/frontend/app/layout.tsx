import type { Metadata } from 'next';
import './globals.css';
import { LayoutClient } from './layout-client';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
