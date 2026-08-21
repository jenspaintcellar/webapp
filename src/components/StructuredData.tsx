'use client';

import { useEffect } from 'react';
import { siteConfig } from '@/data/site';

export default function StructuredData() {
  useEffect(() => {
    // Create and append structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      image: siteConfig.ogImage,
      telephone: siteConfig.contact.phone !== '[PHONE]' ? siteConfig.contact.phone : undefined,
      email: siteConfig.contact.email !== '[EMAIL]' ? siteConfig.contact.email : undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress:
          siteConfig.contact.address !== '[ADDRESS]'
            ? siteConfig.contact.address.split(',')[0]
            : undefined,
        addressCountry: 'US',
      },
      openingHoursSpecification:
        siteConfig.contact.hours !== '[BUSINESS HOURS]'
          ? {
              '@type': 'OpeningHoursSpecification',
              description: siteConfig.contact.hours,
            }
          : undefined,
      sameAs: [
        siteConfig.contact.social.instagram !== '[INSTAGRAM URL]'
          ? siteConfig.contact.social.instagram
          : null,
        siteConfig.contact.social.facebook !== '[FACEBOOK URL]'
          ? siteConfig.contact.social.facebook
          : null,
      ].filter(Boolean),
    });
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
