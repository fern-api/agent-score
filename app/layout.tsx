import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agent Score | Is Your Documentation AI-Ready?',
  description:
    '21 checks. 8 categories. One score. Agent Score evaluates how well your docs serve AI coding agents like Cursor, Copilot, and Claude Code.',
  openGraph: {
    title: 'Agent Score | Is Your Documentation AI-Ready?',
    description:
      '21 checks. 8 categories. One score. Agent Score evaluates how well your docs serve AI coding agents.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="page-shell">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
