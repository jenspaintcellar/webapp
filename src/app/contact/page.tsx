import type { Metadata } from 'next';
import Contact from '@/components/Contact';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact',
  description: 'Contact Jen\'s Paint Cellar for class questions, private events, and studio support.',
  path: '/contact',
  keywords: ['contact paint studio', 'Salem Ohio painting classes contact', 'book private painting event'],
});

export default function ContactPage() {
  return <Contact />;
}
