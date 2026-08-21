'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { siteConfig } from '@/data/site';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <nav className={styles.navbar} aria-label="Main navigation">
        <div className={styles.container}>
          <Link href="/" className={styles.logo} aria-label="Jen's Paint Cellar home">
            <div className={styles.logoImage}>
              <img src="/logo.jpg" alt="Jen's Paint Cellar logo" />
            </div>
            <span className={styles.logoText}>{siteConfig.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className={styles.desktopNav} role="menubar">
            {siteConfig.navigation.map((item) => (
              <Link key={item.name} href={item.href} className={styles.navLink} role="menuitem">
                {item.name}
              </Link>
            ))}
            <Link
              href={siteConfig.bookNowCTA.href}
              className={styles.ctaButton}
              role="menuitem"
            >
              {siteConfig.bookNowCTA.text}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={styles.menuButton}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className={styles.mobileNav} id="mobile-menu" role="menu">
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={styles.mobileNavLink}
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href={siteConfig.bookNowCTA.href}
              className={styles.mobileCtaButton}
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              {siteConfig.bookNowCTA.text}
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
