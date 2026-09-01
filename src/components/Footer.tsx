import Link from 'next/link';
import { siteConfig } from '@/data/site';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <h3>{siteConfig.name}</h3>
            <p>Professional art instruction and creative experiences in downtown Salem.</p>
          </div>

          <nav className={styles.nav}>
            <h4>Navigation</h4>
            <ul>
              {siteConfig.navigation.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.contact}>
            <h4>Contact</h4>
            <ul>
              <li>
                <a href={`tel:${siteConfig.contact.phone}`}>
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.contact.email}`}>
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>{siteConfig.contact.address}</li>
            </ul>
          </div>

          <div className={styles.social}>
            <h4>Social media</h4>
            <a href={siteConfig.contact.social.facebook} className={styles.socialIcon} target="_blank" rel="noreferrer" aria-label="Visit Jen's Paint Cellar on Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-8h2.75l.41-3h-3.16V8.08c0-.87.25-1.47 1.5-1.47H16.6V3.93c-.28-.04-1.23-.12-2.34-.12-2.31 0-3.89 1.41-3.89 4v2.19H7.75v3h2.62v8h3.13Z" /></svg>
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>{siteConfig.footer.copyright}</p>
          <nav className={styles.legalLinks} aria-label="Legal">
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/refund-policy">Refund Policy</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
