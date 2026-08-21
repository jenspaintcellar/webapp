'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import SectionHeading from './SectionHeading';
import { events, hasUpcomingEvents } from '@/data/events';
import styles from './Events.module.css';

export default function Events() {
  if (!hasUpcomingEvents) {
    return (
      <section className={styles.events} id="events">
        <div className={styles.container}>
          <SectionHeading
            title="Upcoming Events"
            subtitle="Check back soon for exciting creative experiences"
          />
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="var(--accent)" strokeWidth="2" />
                <path
                  d="M32 16V32L42 42"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3>New creative experiences are coming soon.</h3>
            <p>Subscribe or check back for updates on our upcoming classes and events.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.events} id="events">
      <div className={styles.container}>
        <SectionHeading
          title="Upcoming Events"
          subtitle="Join us for these special creative gatherings"
        />

        <div className={styles.grid}>
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              className={styles.eventCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className={styles.date}>
                <time>{event.date}</time>
                <span className={styles.time}>{event.time}</span>
              </div>

              <div className={styles.details}>
                <h3>{event.name}</h3>
                <p className={styles.description}>{event.description}</p>
                <p className={styles.availability}>{event.availability}</p>

                <Link href={event.bookingUrl} className={styles.bookButton}>
                  Book Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
