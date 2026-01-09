import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import LayoutWrapper from '@/components/layout/LayoutWrapper';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#667eea',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'ORIYET - Educational Events & Learning Platform',
    template: '%s | ORIYET',
  },
  description:
    'Your gateway to knowledge and growth. Join educational events, earn certificates, and connect with experts in your field.',
  keywords: [
    'education',
    'events',
    'workshops',
    'seminars',
    'certificates',
    'online learning',
    'Bangladesh',
    'professional development',
    'skill building',
  ],
  authors: [{ name: 'ORIYET', url: 'https://oriyet.com' }],
  creator: 'ORIYET',
  publisher: 'ORIYET',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://oriyet.com',
    siteName: 'ORIYET',
    title: 'ORIYET - Educational Events & Learning Platform',
    description:
      'Your gateway to knowledge and growth. Join educational events, earn certificates, and connect with experts.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ORIYET Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ORIYET - Educational Events & Learning Platform',
    description:
      'Your gateway to knowledge and growth. Join educational events, earn certificates.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </div>
        </Providers>
      </body>
    </html>
  );
}
