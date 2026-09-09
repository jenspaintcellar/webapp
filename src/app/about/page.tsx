import type { Metadata } from 'next';
import About from '@/components/About';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'About',
  description: 'Meet Jen and learn the story behind Jen\'s Paint Cellar in Salem, Ohio.',
  path: '/about',
  keywords: ['about Jen\'s Paint Cellar', 'art studio Salem Ohio', 'local painting studio'],
});

export default function AboutPage() {
  return <About />;
}
