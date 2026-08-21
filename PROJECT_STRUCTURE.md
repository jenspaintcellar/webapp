# Project Structure Guide

## Overview

```
jen-paint-cellar/
├── public/                    # Static files served directly
│   ├── logo.jpg              # Brand logo
│   ├── robots.txt            # SEO: Search engine crawling rules
│   ├── sitemap.xml           # SEO: Site map for indexing
│   ├── images/               # Gallery and page images
│   │   ├── gallery-1.jpg     # Place your images here
│   │   ├── class-1.jpg       # Update paths in data files
│   │   └── ...
│   └── favicon.ico           # Browser tab icon
│
├── src/
│   ├── app/
│   │   ├── globals.css       # Global styles and design system
│   │   ├── layout.tsx        # Root layout with navbar and footer
│   │   ├── page.tsx          # Home page (combines all sections)
│   │   └── _not-found.tsx    # 404 page
│   │
│   ├── components/           # Reusable React components
│   │   ├── Navbar.tsx        # Top navigation bar
│   │   ├── Navbar.module.css
│   │   ├── Hero.tsx          # Hero section
│   │   ├── Hero.module.css
│   │   ├── About.tsx         # About section
│   │   ├── About.module.css
│   │   ├── Classes.tsx       # Classes grid
│   │   ├── Classes.module.css
│   │   ├── Events.tsx        # Events section
│   │   ├── Events.module.css
│   │   ├── Gallery.tsx       # Image gallery with lightbox
│   │   ├── Gallery.module.css
│   │   ├── PrivateEvents.tsx # Private events section
│   │   ├── PrivateEvents.module.css
│   │   ├── Testimonials.tsx  # Customer testimonials
│   │   ├── Testimonials.module.css
│   │   ├── Contact.tsx       # Contact form
│   │   ├── Contact.module.css
│   │   ├── Footer.tsx        # Site footer
│   │   ├── Footer.module.css
│   │   ├── SectionHeading.tsx        # Reusable heading component
│   │   ├── SectionHeading.module.css
│   │   └── StructuredData.tsx        # JSON-LD schema for SEO
│   │
│   └── data/                 # Edit these files to update content
│       ├── site.ts          # Business info, navigation, contact details
│       ├── classes.ts       # Class offerings
│       ├── events.ts        # Upcoming events
│       ├── gallery.ts       # Gallery images
│       └── testimonials.ts  # Customer testimonials
│
├── .next/                    # Build output (ignore)
├── node_modules/             # Dependencies (ignore)
│
├── .gitignore               # Git ignore rules
├── eslint.config.js         # Code style rules
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies and scripts
├── package-lock.json        # Locked versions
├── tailwind.config.ts       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
│
├── README.md                # How to use this site
└── TESTING.md              # Testing checklist
```

## Key Directories to Know

### `src/data/` - YOUR CONTENT LIVES HERE
This is where you customize everything without touching components:
- `site.ts` - Business name, address, phone, hours, social links
- `classes.ts` - Add/remove/edit class offerings
- `events.ts` - Add upcoming events
- `gallery.ts` - Update image paths
- `testimonials.ts` - Add customer reviews

### `src/components/` - Pre-built UI Components
Each component has a `.tsx` (React) file and `.module.css` (styling):
- Don't edit components unless you need to change HTML structure
- Most customization should be in `src/data/` instead

### `public/` - Images and Static Files
- Logo: `public/logo.jpg` - Brand logo
- Images: `public/images/` - Add all your photos here
- SEO: `robots.txt` and `sitemap.xml`

### `src/app/globals.css` - Design System
All colors and typography are defined here:
```css
--pink: #E8C8C0        /* Brand pink */
--black: #1A1A1A       /* Text color */
--cream: #FDFBF8       /* Background */
--tan: #D4A574         /* Accent */
--font-serif: 'Cormorant Garamond'  /* Elegant headings */
--font-sans: 'Inter'               /* Body text */
```

Change these to rebrand the entire site.

## Component Hierarchy

```
layout.tsx (Root)
├── Navbar
├── main (page content)
│   ├── Hero
│   ├── About
│   ├── Classes
│   ├── Events
│   ├── Gallery
│   ├── PrivateEvents
│   ├── Testimonials
│   └── Contact
└── Footer
```

## File Naming Conventions

- `.tsx` files = React components
- `.module.css` files = Component-specific styles (scoped)
- `src/data/*.ts` = Content data (NO UI components)
- `src/components/*.tsx` = UI components (reusable)

## Configuration Files

- `next.config.ts` - Next.js build settings
- `tailwind.config.ts` - Tailwind CSS settings
- `tsconfig.json` - TypeScript settings
- `eslint.config.js` - Code quality rules
- `package.json` - Dependencies and scripts

## Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create production build
npm start        # Run production build
npm run lint     # Check code quality
```

## Quick Edit Guide

Want to update something? Here's where to look:

| What to Change | Where to Edit |
|---|---|
| Business name/address/phone | `src/data/site.ts` |
| Add a class | `src/data/classes.ts` |
| Add an event | `src/data/events.ts` |
| Gallery images | `src/data/gallery.ts` + `public/images/` |
| Testimonials | `src/data/testimonials.ts` |
| Colors/fonts | `src/app/globals.css` |
| Hero headline | `src/data/site.ts` |
| Footer content | `src/data/site.ts` |
| Navigation menu | `src/data/site.ts` |

That's it! Most changes don't require touching component files. The site is designed to be edited through data files.
