# Quick Reference Card

## Essential Files to Update

### Content (Most Important!)
| What | File | Edit What |
|------|------|-----------|
| Business name & info | `src/data/site.ts` | address, phone, email, hours |
| Classes | `src/data/classes.ts` | Add your class offerings |
| Events | `src/data/events.ts` | Add upcoming events |
| Testimonials | `src/data/testimonials.ts` | Add customer quotes |
| Gallery images | `src/data/gallery.ts` | Update image paths |

### Design (Colors & Fonts)
| Item | File | Edit What |
|------|------|-----------|
| Brand colors | `src/app/globals.css` | --pink, --black, --cream, --tan |
| Fonts | `src/app/globals.css` | --font-serif, --font-sans |

### Static Files
| Item | Path |
|------|------|
| Logo | `public/logo.png` |
| Gallery images | `public/images/` |
| Favicon | `public/favicon.ico` |

## Most Common Updates

### Add a Class
Edit `src/data/classes.ts`:
```typescript
{
  id: "your-class",
  title: "Your Class Name",
  description: "What people will learn",
  image: "/images/your-image.jpg",
  imageAlt: "Description for accessibility",
  learnMoreUrl: "#classes",
}
```

### Add an Event
Edit `src/data/events.ts`:
```typescript
{
  id: "event-1",
  name: "Event Name",
  date: "2026-09-15",
  time: "7:00 PM",
  description: "What the event is about",
  availability: "10 spots remaining",
  bookingUrl: "https://booking-link.com",
}
```

### Add Testimonial
Edit `src/data/testimonials.ts`:
```typescript
{
  id: "testimonial-1",
  name: "Customer Name",
  quote: "Their experience in one sentence",
  rating: 5,
}
```

### Change Brand Color
Edit `src/app/globals.css`:
```css
:root {
  --pink: #YOUR_NEW_COLOR;  /* Was #E8C8C0 */
}
```

## Commands You'll Use

```bash
# Development - see changes live
npm run dev
# Visit http://localhost:3000

# Production build - prepare for deployment
npm run build

# Run production build locally (tests final result)
npm start

# Check code quality
npm run lint
```

## File Organization

```
Edit CONTENT here:
src/data/ ← Business info, classes, events, testimonials

Edit STYLING here:
src/app/globals.css ← Colors, fonts

Add IMAGES here:
public/images/ ← Gallery and page images

Update LOGO here:
public/logo.png ← Your brand logo
```

## Key Sections of the Website

1. **Hero** - Main headline and CTA
   - Edit: `src/data/site.ts` → hero section

2. **About** - Your story
   - Edit: `src/data/site.ts` → about section

3. **Classes** - Class offerings
   - Edit: `src/data/classes.ts`

4. **Events** - Upcoming events
   - Edit: `src/data/events.ts`

5. **Gallery** - Your work and studio
   - Edit: `src/data/gallery.ts` + add images to `public/images/`

6. **Private Events** - Custom experiences
   - Pre-configured, no edits needed

7. **Testimonials** - Customer reviews
   - Edit: `src/data/testimonials.ts` (auto-hides if empty)

8. **Contact** - Get in touch
   - Auto-populated from `src/data/site.ts`

## Deployment Steps (One-Time)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Add custom domain
5. Update `src/data/site.ts` with your domain
6. Done

## Troubleshooting Quick Fixes

**"npm command not found"**
- Ensure you have Node.js installed
- Restart terminal

**"Port 3000 already in use"**
- Kill process: `lsof -i :3000` then `kill -9 <PID>`
- Or use different port: `PORT=3001 npm run dev`

**"Changes not showing"**
- Save file (Ctrl+S)
- Refresh browser (F5)
- Check console for errors (F12)

**"Images not loading"**
- Check image path starts with `/`
- Verify image file exists
- Check spelling and capitalization

## Need Help?

- **How do I...?** → Check `README.md`
- **Where do I put...?** → Check `PROJECT_STRUCTURE.md`
- **How do I deploy?** → Check `DEPLOYMENT.md`
- **Is everything working?** → Check `TESTING.md`

## Contact Form

Currently sends to console. To make it work:
1. Sign up for email service (SendGrid, Mailgun, etc.)
2. Create API route in `src/app/api/contact/route.ts`
3. Connect form to your email service

Or use form service like Formspree (easiest).

---

**Remember:** Most edits go in `src/data/` files, not component files!
