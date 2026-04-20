import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { PHProvider } from './posthog-provider';
import Navbar from '@/components/Navbar';
import './globals.css';
import './bones/registry';

export const metadata: Metadata = {
  metadataBase: new URL('https://buildwithfern.com/agent-score'),
  title: 'Agent Score | Is Your Documentation AI-Ready?',
  description:
    'AI agents can\'t use docs they can\'t read. Run 22 checks and get a letter grade in seconds.',
  openGraph: {
    title: 'Agent Score | Is Your Documentation AI-Ready?',
    description:
      'AI agents can\'t use docs they can\'t read. Run 22 checks and get a letter grade in seconds.',
    type: 'website',
    images: [{ url: 'https://buildwithfern.com/agent-score/agent-score-og.png', width: 1200, height: 630, alt: 'Agent Score' }],
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
        <link rel="icon" href="/agent-score/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/agent-score/apple-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PHProvider>
          <SpeedInsights />
          <div className="page-shell">
            <Navbar />
            {children}
          </div>
        </PHProvider>
      </body>
    </html>
  );
}
