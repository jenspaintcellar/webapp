import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Classes',
  description: 'Class listings and event availability at Jen\'s Paint Cellar.',
  path: '/classes',
  noIndex: true,
});

export default function ClassesPage() {
  redirect('/');
}
