# Deployment Guide

Your Jen's Paint Cellar website is production-ready. Follow this guide to deploy.

## Quick Start (Recommended)

### Vercel Deployment (Easiest)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow prompts**
   - Connect your GitHub account (optional but recommended)
   - Select your project folder
   - Vercel handles the rest!

4. **Update domain**
   - Add your custom domain in Vercel dashboard
   - Update `siteConfig.url` in `src/data/site.ts`

### Netlify Deployment

1. **Connect repository**
   - Push to GitHub
   - Go to netlify.com
   - Click "New site from Git"
   - Select your repository

2. **Configure**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Deploy**
   - Netlify automatically builds and deploys on every push

### Manual Deployment (VPS/Server)

1. **Build**
   ```bash
   npm run build
   ```

2. **Copy files to server**
   ```bash
   # Copy these folders:
   # - .next/
   # - public/
   # - node_modules/
   # - package.json
   # - package-lock.json
   ```

3. **Install dependencies on server**
   ```bash
   npm install --production
   ```

4. **Start server**
   ```bash
   npm start
   # Runs on port 3000
   ```

5. **Use process manager** (recommended)
   ```bash
   npm install -g pm2
   pm2 start npm -- start
   pm2 save
   pm2 startup
   ```

6. **Set up reverse proxy** (e.g., Nginx)
   ```nginx
   server {
       listen 80;
       server_name jenspaintcellar.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Before Deploying

### Checklist

- [ ] Update business name in `src/data/site.ts`
- [ ] Update address, phone, email, hours
- [ ] Add social media links
- [ ] Replace `public/logo.jpg` with actual logo
- [ ] Add all images to `public/images/`
- [ ] Update image paths in data files
- [ ] Add testimonials (or leave empty - section hides)
- [ ] Add events (or leave empty - section hides)
- [ ] Add classes and descriptions
- [ ] Update hero headline and CTA text
- [ ] Review all placeholder content
- [ ] Test form submission (add backend integration)
- [ ] Test on mobile devices
- [ ] Update SEO metadata

### Domain Setup

1. **Point domain to your host**
   - If Vercel: Add domain in Vercel dashboard
   - If Netlify: Add domain in Netlify dashboard
   - If VPS: Point DNS to your server IP

2. **Set up SSL/HTTPS**
   - Vercel & Netlify: Automatic
   - VPS: Use Let's Encrypt (free)
     ```bash
     sudo apt install certbot python3-certbot-nginx
     sudo certbot certonly --nginx -d jenspaintcellar.com
     ```

## Contact Form Integration

The contact form currently logs to console. For production, integrate with:

### Option 1: Email Service (Recommended)

**Using SendGrid:**
1. Get API key at sendgrid.com
2. Create API route: `src/app/api/contact/route.ts`
3. Handle form submission securely

**Using Mailgun:**
1. Similar setup as SendGrid
2. Create backend endpoint

### Option 2: Webhook Service

Use services like:
- Formspree (formspree.io)
- Getform (getform.io)
- Basin (usebasin.com)

Just update the form's `onSubmit` handler.

### Option 3: Database/CRM

Connect to:
- Airtable
- Supabase
- Firebase
- MongoDB

## Environment Variables

For backend services, create `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://jenspaintcellar.com
SENDGRID_API_KEY=your_key_here
DATABASE_URL=your_db_url
```

## Performance Optimization

After deployment, optimize:

1. **Images**
   - Use WebP format where possible
   - Optimize size (max 2MB each)
   - Use appropriate dimensions
   - Next.js will auto-optimize

2. **Fonts**
   - Google Fonts are loaded from CDN
   - Consider serving locally for better performance

3. **Analytics** (Optional)
   - Add Google Analytics
   - Add to `layout.tsx`

4. **Monitoring** (Optional)
   - Set up Sentry for error tracking
   - Monitor performance with Web Vitals

## Maintenance

### Regular Tasks

- **Update content monthly** - Events, testimonials, gallery
- **Monitor form submissions** - Reply to inquiries
- **Check for updates** - Run `npm update` periodically
- **Test on devices** - Verify mobile experience
- **Backup database** - If using one
- **Review analytics** - See what visitors view

### Security

- Keep dependencies updated: `npm update`
- Use HTTPS everywhere (automatic with Vercel/Netlify)
- Validate form inputs on backend
- Never expose API keys in client code
- Use `.env.local` for secrets

## Troubleshooting

### Site won't load
- Check build logs in hosting dashboard
- Verify all dependencies installed: `npm install`
- Test locally: `npm run build && npm start`

### Images not showing
- Verify paths in data files
- Check that images are in `public/images/`
- Use relative paths (e.g., `/images/photo.jpg`)

### Form not working
- Check browser console for errors
- Verify backend endpoint (if using one)
- Test locally first
- Check CORS headers

### Slow performance
- Compress images
- Use Next.js Image component
- Check Lighthouse score
- Enable caching headers

### Domain issues
- DNS might take 24-48 hours to propagate
- Verify DNS settings with registrar
- Test with `nslookup` or `dig`

## Getting Help

- Next.js docs: https://nextjs.org/docs
- React docs: https://react.dev
- Vercel support: https://vercel.com/help
- GitHub issues: This repo's issue tracker

---

**Your site is ready to go live.**

Questions? The README.md and PROJECT_STRUCTURE.md files have more details.
