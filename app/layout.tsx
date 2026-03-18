import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YouTube Video Analyzer',
  description: 'AI-powered video intelligence — cliff notes, timestamps, and visual insights.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#09090f] text-[#e2e8f0] antialiased">
        {children}
      </body>
    </html>
  );
}
