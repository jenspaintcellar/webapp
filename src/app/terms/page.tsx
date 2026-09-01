import type { Metadata } from 'next';
import SectionHeading from '@/components/SectionHeading';
import { siteConfig } from '@/data/site';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: `Terms of Service | ${siteConfig.name}`,
  description: `Terms of service for booking classes and events with ${siteConfig.name}.`,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <section className={styles.page}>
      <SectionHeading title="Terms of Service" subtitle={`Please read these terms before booking a class or event with ${siteConfig.name}.`} />
      <p className={styles.updated}>Last updated: August 22, 2026</p>

      <div className={styles.content}>
        <section>
          <h2>Bookings & Reservations</h2>
          <p>
            When you register for a class or event, you reserve a seat for a specific date, time, and instructor. Seats are limited and
            confirmed on a first-come, first-served basis. Please arrive on time, as seats may be released to waitlisted guests for
            no-shows after a short grace period.
          </p>
        </section>

        <section>
          <h2>Payments</h2>
          <p>
            Full payment is due at the time of booking unless otherwise noted. Prices are listed per seat and may vary by class, event,
            or private booking. We reserve the right to change prices for future bookings at any time.
          </p>
        </section>

        <section>
          <h2>Age & Audience Guidelines</h2>
          <p>
            Some classes and events are designated for specific audiences (all ages, adults only, or kids & family). Please check the
            audience listed on each class before booking and ensure attendees meet any age guidance provided.
          </p>
        </section>

        <section>
          <h2>Conduct</h2>
          <p>
            We want every guest to feel welcome. Guests who are disruptive, unsafe, or disrespectful to staff or other attendees may be
            asked to leave without a refund.
          </p>
        </section>

        <section>
          <h2>Liability</h2>
          <p>
            Painting and craft materials are provided for use in the studio. Guests participate at their own risk and are responsible
            for any damage caused to studio property beyond normal use.
          </p>
        </section>

        <section>
          <h2>Changes to These Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of our booking system after changes are posted means you accept
            the updated terms.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these terms can be directed to{' '}
            <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a> or{' '}
            <a href={`tel:${siteConfig.contact.phone}`}>{siteConfig.contact.phone}</a>.
          </p>
        </section>
      </div>
    </section>
  );
}
