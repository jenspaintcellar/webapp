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
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>{siteConfig.footer.copyright}</p>
          <p className={styles.credits}>
            Professionally designed and built.
          </p>
        </div>
      </div>
    </footer>
  );
}
