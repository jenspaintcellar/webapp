# Jen's Paint Cellar - Website

A professional website for Jen's Paint Cellar creative studio.

## Quick Start

### Installation
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the site in development.

### Production Build
```bash
npm run build
npm start
```

## Updating Content

All editable content is stored in the `src/data/` directory. No need to touch component files - just update the data files:

### Site Configuration
**File:** `src/data/site.ts`

Update:
- Business name and description
- Navigation links
- Contact information (address, phone, email, hours)
- Social media links
- Hero section text and CTA buttons

### Classes
**File:** `src/data/classes.ts`

Add or edit class offerings with:
- Title
- Description
- Link to more details

### Events
**File:** `src/data/events.ts`

Add upcoming events with:
- Event name
- Date and time
- Description
- Availability
- Booking URL

Events section will automatically show "Coming soon" if empty.

### Gallery Images
**File:** `src/data/gallery.ts`

Update gallery image references. Replace placeholder URLs with actual image paths in `public/images/`.

### Testimonials
**File:** `src/data/testimonials.ts`

Add customer testimonials with:
- Customer name
- Quote
- Rating (1-5 stars)

Testimonials section will hide if empty (keep it clean during launch).

## Images

Place images in `public/images/` directory:
- Gallery images: `gallery-1.jpg`, `gallery-2.jpg`, etc.
- Class images: `class-1.jpg`, `class-2.jpg`, etc.

Update file paths in the data files.

## Colors and Design

All colors are defined as CSS variables in `src/app/globals.css`:

```css
--pink: #E8C8C0          /* Primary brand color */
--pink-light: #F5E8E6    /* Light accent */
--cream: #FDFBF8         /* Background */
--black: #1A1A1A         /* Text */
--tan: #D4A574           /* Accent (brush handles) */
```

Change any color here and it updates throughout the entire site automatically.

## Components

Pre-built components in `src/components/`:
- **Navbar** - Sticky navigation with responsive mobile menu
- **Hero** - Professional header section
- **About** - Story and studio information
- **Classes** - Classes offerings grid
- **Events** - Upcoming events display
- **Gallery** - Image gallery with lightbox
- **PrivateEvents** - Private event options
- **Testimonials** - Customer reviews (auto-hides if empty)
- **Contact** - Contact form and information
- **Footer** - Site footer

## Features

- Fully responsive (mobile, tablet, desktop)
- Smooth animations with Framer Motion
- Accessible (WCAG compliant)
- Fast performance optimized
- SEO optimized with metadata
- Contact form ready
- Gallery with lightbox
- Mobile hamburger menu
- Placeholder content for easy updates

## SEO

The site includes:
- Open Graph metadata for social sharing
- Twitter card support
- robots.txt
- sitemap.xml
- Semantic HTML structure
- Fast Core Web Vitals

Update the domain in `src/data/site.ts` to your actual domain.

## Contact Form

The contact form is set up and displays submitted data in the console. In production, connect it to:
- Email service (SendGrid, Mailgun, etc.)
- CRM (ConvertKit, HubSpot, etc.)
- Webhook service

## Deployment

Ready to deploy to:
- **Vercel** (recommended): `npm i -g vercel` then `vercel`
- **Netlify**: Connect GitHub repository
- **Any Node.js host**: `npm run build` then `npm start`

## Support

This site is production-ready but designed to be customized. Update the data files, add your actual images, and you are ready to launch!

For technical questions about Next.js, visit: https://nextjs.org/docs

---

**Built with:**
- Next.js 16.3.1
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
