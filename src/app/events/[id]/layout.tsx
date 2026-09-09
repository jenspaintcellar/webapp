import type { Metadata } from 'next';
import { siteConfig } from '@/data/site';
import { buildPageMetadata } from '@/lib/seo';

type EventLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EventLayoutProps): Promise<Metadata> {
  const { id } = await params;
  return buildPageMetadata({
    title: 'Class Registration',
    description: `Reserve your class spot with ${siteConfig.name}.`,
    path: `/events/${id}`,
    keywords: ['class registration', 'book painting class', 'paint class reservation'],
  });
}

export default function EventRegistrationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
