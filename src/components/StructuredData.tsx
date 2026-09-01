import { siteConfig } from '@/data/site';

export default function StructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    telephone: '+13308312594',
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
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
