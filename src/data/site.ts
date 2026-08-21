/**
 * Site-wide configuration and content
 * Business information and settings
 */

export const siteConfig = {
  name: "Jen's Paint Cellar",
  description: "A creative studio offering painting classes, group events, and personalized creative experiences in a welcoming, professional environment.",
  url: "https://jenspaintcellar.com",
  ogImage: "/logo.jpg",
  
  // Navigation
  navigation: [
    { name: "Home", href: "/" },
    { name: "About", href: "/#about" },
    { name: "Classes", href: "/#classes" },
    { name: "Events", href: "/#events" },
    { name: "Gallery", href: "/#gallery" },
    { name: "Private Events", href: "/#private-events" },
    { name: "Contact", href: "/#contact" },
  ],
  
  // CTA Buttons
  primaryCTA: {
    text: "Explore Classes",
    href: "/#classes",
  },
  secondaryCTA: {
    text: "Book a Session",
    href: "/#contact",
  },
  bookNowCTA: {
    text: "Book Now",
    href: "/#contact",
  },
  
  // Hero Section
  hero: {
    headline: "Create Something Beautiful.",
    subheadline: "Welcome to Jen's Paint Cellar. A professional art studio offering classes, private events, and creative experiences in downtown Salem.",
    image: "/logo.jpg",
  },
  
  // About Section
  about: {
    headline: "A Studio for Creative Expression.",
    description: "Jen's Paint Cellar is a professional art studio dedicated to providing quality instruction and a welcoming space for artists of all skill levels.",
    story: "[ADD STUDIO STORY HERE]",
    meetJen: "[ADD JEN'S BIOGRAPHY HERE]",
    whyPaint: "[ADD ARTISTIC PHILOSOPHY HERE]",
    imageAlt: "Jen's Paint Cellar Studio",
  },
  
  // Contact Information
  contact: {
    address: "435 E. State St., Salem, OH 44460",
    phone: "(330) 831-2594",
    email: "[EMAIL]",
    hours: "[BUSINESS HOURS]",
    social: {
      instagram: "[INSTAGRAM URL]",
      facebook: "[FACEBOOK URL]",
    },
  },
  
  // Footer
  footer: {
    copyright: "© 2026 Jen's Paint Cellar. All rights reserved.",
  },
};
