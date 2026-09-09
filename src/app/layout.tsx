import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import { siteConfig } from '@/data/site';

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | Make Something Memorable`,
    template: `${siteConfig.name} | %s`,
  },
  description: siteConfig.description,
  keywords: ['painting classes Salem Ohio', 'art classes Salem Ohio', 'creative studio Salem Ohio', 'private painting events', 'Jen\'s Paint Cellar'],
  authors: [{ name: "Jen's Paint Cellar" }],
  creator: "Jen's Paint Cellar",
  publisher: "Jen's Paint Cellar",
  category: 'Arts & Entertainment',
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Make Something Memorable`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | Make Something Memorable`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#d878a1" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <StructuredData />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
