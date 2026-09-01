'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Gift, Info, MessageCircleQuestion, Menu, Palette, Phone, Store } from 'lucide-react';
import { siteConfig } from '@/data/site';
import styles from './Navbar.module.css';

const navIcons: Record<string, typeof Palette> = {
  Home: Palette,
  About: Info,
  Shop: Store,
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <nav className={styles.navbar} aria-label="Main navigation">
        <div className={styles.container}>
          <Link href="/" className={styles.logo} aria-label="Jen's Paint Cellar home">
            <div className={styles.logoImage}>
              <img src="/logo.png" alt="Jen's Paint Cellar logo" />
            </div>
            <span className={styles.logoGroup}>
              <span className={styles.logoText}>{siteConfig.name}</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className={styles.desktopNav} role="menubar">
            {siteConfig.navigation.map((item) => {
              const Icon = navIcons[item.name] || Palette;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${styles.navTab} ${isActive ? styles.navTabActive : ''}`}
                  role="menuitem"
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className={styles.actions} ref={menuRef}>
            <a href={`tel:${siteConfig.contact.phone}`} className={styles.phoneLink} aria-label={`Call the studio at ${siteConfig.contact.phone}`}>
              <Phone size={18} aria-hidden="true" />
              <span>{siteConfig.contact.phone}</span>
            </a>
            <button
              className={styles.iconButton}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="site-menu"
            >
              <Menu size={18} aria-hidden="true" />
            </button>

            {isOpen && (
              <div className={styles.dropdownMenu} id="site-menu" role="menu">
                <div className={styles.dropdownMobileOnly}>
                  {siteConfig.navigation.map((item) => {
                    const Icon = navIcons[item.name] || Palette;
                    return (
                      <Link key={item.name} href={item.href} className={styles.dropdownRow} role="menuitem" onClick={() => setIsOpen(false)}>
                        <Icon size={20} aria-hidden="true" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  <div className={styles.dropdownDivider} />
                </div>

                <Link href="/contact" className={styles.dropdownFeature} role="menuitem" onClick={() => setIsOpen(false)}>
                  <span>
                    <strong>Contact Us</strong>
                    <p>Questions about classes, celebrations, or creative projects?</p>
                  </span>
                  <span className={styles.dropdownFeatureImage}>
                    <MessageCircleQuestion size={26} aria-hidden="true" />
                  </span>
                </Link>

                <div className={styles.dropdownDivider} />

                <Link href="/" className={styles.dropdownRow} role="menuitem" onClick={() => setIsOpen(false)}>
                  <CalendarDays size={20} aria-hidden="true" />
                  <span>Upcoming Classes & Events</span>
                </Link>
                <Link href="/shop" className={styles.dropdownRow} role="menuitem" onClick={() => setIsOpen(false)}>
                  <Gift size={20} aria-hidden="true" />
                  <span>Gift Cards</span>
                </Link>
                <Link href="/shop" className={styles.dropdownRow} role="menuitem" onClick={() => setIsOpen(false)}>
                  <Store size={20} aria-hidden="true" />
                  <span>Shop Supplies & Gifts</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
