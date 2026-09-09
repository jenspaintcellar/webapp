import type { Metadata } from 'next';
import { siteConfig } from '@/data/site';

type BuildMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

function toCanonical(path: string) {
  if (!path.startsWith('/')) return `/${path}`;
  return path;
}

export function buildPageMetadata({ title, description, path, keywords = [], noIndex = false }: BuildMetadataOptions): Metadata {
  const canonicalPath = toCanonical(path);
  const canonicalUrl = new URL(canonicalPath, siteConfig.url).toString();
  const imageUrl = new URL(siteConfig.ogImage, siteConfig.url).toString();
  const fullTitle = `${siteConfig.name} | ${title}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}
