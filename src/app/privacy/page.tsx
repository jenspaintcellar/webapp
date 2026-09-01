import type { Metadata } from 'next';
import SectionHeading from '@/components/SectionHeading';
import { siteConfig } from '@/data/site';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description: `How ${siteConfig.name} collects, uses, and protects your information.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <section className={styles.page}>
      <SectionHeading title="Privacy Policy" subtitle={`How ${siteConfig.name} collects, uses, and protects your information.`} />
      <p className={styles.updated}>Last updated: August 22, 2026</p>

      <div className={styles.content}>
        <section>
          <h2>Information We Collect</h2>
          <p>
            When you book a class or event, we collect information such as your name, email address, phone number, and payment details
            needed to process your reservation. For certain events, we may also collect attendee details like birth date or emergency
            contact information for safety and waiver purposes.
          </p>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <ul>
            <li>To confirm and manage your class or event bookings</li>
            <li>To send booking confirmations, reminders, and updates</li>
            <li>To process payments securely</li>
            <li>To respond to questions sent through our contact channels</li>
          </ul>
        </section>

        <section>
          <h2>How We Protect Your Information</h2>
          <p>
            Booking and payment data is stored with our database provider using industry-standard security practices, including access
            controls that restrict customer data to authorized staff only. We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2>Sharing of Information</h2>
          <p>
            We share information only with the service providers necessary to run our business, such as payment processors and our
            booking platform, and only to the extent needed to provide our services.
          </p>
        </section>

        <section>
          <h2>Your Choices</h2>
          <p>
            You can ask us to update or remove your personal information at any time by contacting us using the details below.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about this privacy policy can be directed to{' '}
            <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a> or{' '}
            <a href={`tel:${siteConfig.contact.phone}`}>{siteConfig.contact.phone}</a>.
          </p>
        </section>
      </div>
    </section>
  );
}
