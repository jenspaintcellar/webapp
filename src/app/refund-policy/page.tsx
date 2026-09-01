import type { Metadata } from 'next';
import SectionHeading from '@/components/SectionHeading';
import { siteConfig } from '@/data/site';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: `Refund Policy | ${siteConfig.name}`,
  description: `Cancellation and refund policy for classes and events at ${siteConfig.name}.`,
  alternates: { canonical: '/refund-policy' },
};

export default function RefundPolicyPage() {
  return (
    <section className={styles.page}>
      <SectionHeading title="Refund Policy" subtitle="Our policy for cancellations, rescheduling, and refunds." />
      <p className={styles.updated}>Last updated: August 22, 2026</p>

      <div className={styles.content}>
        <section>
          <h2>Cancelling Your Booking</h2>
          <p>
            If you need to cancel a class or event, please contact us as soon as possible. Cancellations made at least 48 hours before
            the scheduled start time are eligible for a full refund or credit toward a future class.
          </p>
        </section>

        <section>
          <h2>Late Cancellations & No-Shows</h2>
          <p>
            Cancellations made less than 48 hours before the class or event, and no-shows, are not eligible for a refund. We understand
            emergencies happen, so please reach out and we will do our best to work with you.
          </p>
        </section>

        <section>
          <h2>Rescheduling</h2>
          <p>
            If you would like to move your seat to a different date, contact us before your scheduled class or event and we will help
            find another available session, based on seat availability.
          </p>
        </section>

        <section>
          <h2>Studio-Initiated Cancellations</h2>
          <p>
            If we need to cancel or reschedule a class or event, guests will be notified as soon as possible and offered a full refund
            or the option to move to another available date.
          </p>
        </section>

        <section>
          <h2>Gift Cards</h2>
          <p>
            Gift cards are non-refundable but do not expire and can be used toward any class, event, or private booking.
          </p>
        </section>

        <section>
          <h2>Requesting a Refund</h2>
          <p>
            To request a refund or ask about a specific booking, contact us at{' '}
            <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a> or{' '}
            <a href={`tel:${siteConfig.contact.phone}`}>{siteConfig.contact.phone}</a>, and include your name and booking date.
          </p>
        </section>
      </div>
    </section>
  );
}
