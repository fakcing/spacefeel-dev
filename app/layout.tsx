import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastProvider from '@/components/ToastProvider';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'spacefeel — Movie Discovery Platform',
  description: 'Watch movies, series, anime, and cartoons. Your ultimate entertainment destination.',
  keywords: ['movies', 'series', 'anime', 'cartoons', 'streaming', 'cinema', 'entertainment'],
  authors: [{ name: 'spacefeel' }],
  openGraph: {
    title: 'spacefeel — Movie Discovery Platform',
    description: 'Watch movies, series, anime, and cartoons',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ToastProvider />
        <div className="min-h-screen bg-primary">
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}