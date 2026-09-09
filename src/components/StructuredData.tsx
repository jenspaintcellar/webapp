import { siteConfig } from '@/data/site';

export default function StructuredData() {
  const siteUrl = siteConfig.url.replace(/\/$/, '');
  const logoUrl = new URL(siteConfig.ogImage, siteUrl).toString();

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: 'en-US',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: siteConfig.name,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: logoUrl,
        },
        sameAs: [siteConfig.contact.social.facebook],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+1-330-831-2594',
            contactType: 'customer support',
            email: siteConfig.contact.email,
            areaServed: 'US',
            availableLanguage: ['en'],
          },
        ],
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${siteUrl}/#localbusiness`,
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteUrl,
        image: logoUrl,
        telephone: '+1-330-831-2594',
        email: siteConfig.contact.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: '435 E. State St.',
          addressLocality: 'Salem',
          addressRegion: 'OH',
          postalCode: '44460',
          addressCountry: 'US',
        },
        sameAs: [siteConfig.contact.social.facebook],
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
