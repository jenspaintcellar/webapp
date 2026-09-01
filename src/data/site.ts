/**
 * Site-wide configuration and content
 * Business information and settings
 */

export const siteConfig = {
  name: "Jen's Paint Cellar",
  description: "A creative studio offering painting classes, group events, and personalized creative experiences in a welcoming, professional environment.",
  url: "https://jenspaintcellar.com",
  ogImage: "/logo.png",
  
  // Navigation
  navigation: [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Shop", href: "/shop" },
  ],
  
  // CTA Buttons
  primaryCTA: {
    text: "Explore Classes",
    href: "/",
  },
  secondaryCTA: {
    text: "Find a Class",
    href: "/",
  },
  bookNowCTA: {
    text: "Schedule an Event",
    href: "/classes",
  },
  
  // Hero Section
  hero: {
    headline: "Create Something Beautiful.",
    subheadline: "Welcome to Jen's Paint Cellar. A professional art studio offering classes, private events, and creative experiences in downtown Salem.",
    image: "/logo.png",
  },
  
  // About Section
  about: {
    headline: "A Studio for Creative Expression.",
    description: "Jen's Paint Cellar is a creative studio in Salem, Ohio, built around hands-on making, welcoming instruction, and time spent creating together.",
    story: "Jen opened Jen's Paint Cellar in 2016 with a simple idea: make creativity feel approachable, social, and worth making time for. What began as a studio for refinishing furniture, paint supplies, gifts, and handmade pieces grew into a place where people gather for workshops, celebrations, and creative projects of their own.",
    meetJen: "Jen Walter is the maker and teacher behind the Cellar. She brings experience in refinishing furniture, a love of practical handmade design, and an easygoing teaching style to every project. Whether she is guiding a first-time painter, helping a family celebrate, or developing a custom piece, Jen meets people where they are and helps them leave with something they are proud of.",
    whyPaint: "We believe the best creative experiences are welcoming, hands-on, and personal. There is room here for beginners, curious kids, experienced makers, and anyone who simply wants a relaxed evening making something with their own hands. Jen's Paint Cellar also celebrates the work of local makers and the friendships that grow around a shared table.",
    imageAlt: "Jen's Paint Cellar Studio",
  },
  
  // Contact Information
  contact: {
    address: "435 E. State St., Salem, OH 44460",
    phone: "(330) 831-2594",
    email: "support@jenspaintcellar.com",
    hours: "[BUSINESS HOURS]",
    social: {
      instagram: "[INSTAGRAM URL]",
      facebook: "https://www.facebook.com/paintcellar/",
    },
  },
  
  // Footer
  footer: {
    copyright: "© 2026 Jen's Paint Cellar. All rights reserved.",
  },
};
