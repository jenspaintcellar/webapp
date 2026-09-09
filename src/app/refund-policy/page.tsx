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
      <SectionHeading title="Cancellation & Refund Policy" subtitle="Our standards for cancellations, credits, and refunds." />
      <p className={styles.updated}>Last updated: September 9, 2026</p>

      <div className={styles.content}>
        <section>
          <h2>Policy Overview</h2>
          <p>
            Jen&apos;s Paint Cellar prepares supplies and projects specifically for each registered guest. For that reason, the following
            cancellation and refund terms apply to all class and event bookings.
          </p>
          <div className={styles.policyList}>
            <p className={styles.policyItem}><strong>7 or more days before class:</strong> Cancellations are eligible for a full refund or transfer to another available class.</p>
            <p className={styles.policyItem}><strong>3 to 6 days before class:</strong> Cancellations are eligible for credit toward a future Jen&apos;s Paint Cellar class.</p>
            <p className={styles.policyItem}><strong>Less than 72 hours before class:</strong> Cancellations are not eligible for a refund; however, when feasible, the project may be prepared as a take-home art kit.</p>
            <p className={styles.policyItem}><strong>No-shows:</strong> Bookings are not eligible for a refund or class credit.</p>
            <p className={styles.policyItem}><strong>If Jen&apos;s Paint Cellar cancels a class:</strong> Guests may choose either a full refund or class credit.</p>
          </div>
        </section>

        <section>
          <h2>Why Timing Matters</h2>
          <p>
            Class sizes are limited, and each session is prepared in advance, including canvas setup, paint allocation, project planning,
            and staffing. Timely notice helps us manage seat availability and material use responsibly. As a result, earlier cancellations
            may qualify for refunds or transfers, while short-notice cancellations are generally handled as class credit or, when
            available, a take-home kit.
          </p>
        </section>

        <section>
          <h2>Transfers & Credits</h2>
          <p>
            Transfers and class credits are subject to availability in the requested session. If you need to move your booking, please
            contact us as early as possible and we will make every reasonable effort to accommodate an alternate date.
          </p>
        </section>

        <section>
          <h2>Studio Cancellations</h2>
          <p>
            If Jen&apos;s Paint Cellar must cancel a class or event, registered guests will be notified promptly and may choose either a full
            refund or class credit.
          </p>
        </section>

        <section>
          <h2>No-Show Reminder</h2>
          <p>
            Bookings missed without prior notice are treated as no-shows and are not eligible for refund or credit. If an emergency
            arises, please contact us as soon as possible so we can review any available options.
          </p>
        </section>

        <section>
          <h2>Questions or Requests</h2>
          <p>
            To request a cancellation, transfer, or refund review, please contact us at{' '}
            <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a> or{' '}
            <a href={`tel:${siteConfig.contact.phone}`}>{siteConfig.contact.phone}</a> and include your name, booking date, and class
            title. We appreciate your understanding that each reservation supports advance purchasing and preparation for your studio
            experience.
          </p>
        </section>
      </div>
    </section>
  );
}
