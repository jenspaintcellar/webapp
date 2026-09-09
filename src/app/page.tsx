import ClassIndex from '@/components/ClassIndex';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { siteConfig } from '@/data/site';

const homeMetadata = buildPageMetadata({
  title: 'Make Something Memorable',
  description: 'Jen\'s Paint Cellar offers painting classes, group events, and creative experiences in Salem, Ohio.',
  path: '/',
  keywords: [
    'paint classes near me',
    'painting classes Salem OH',
    'art studio Salem Ohio',
    'private paint parties',
    'creative events Salem Ohio',
  ],
});

export const metadata: Metadata = {
  ...homeMetadata,
  title: {
    absolute: `${siteConfig.name} | Make Something Memorable`,
  },
};

export default function Home() {
  return <ClassIndex />;
}
