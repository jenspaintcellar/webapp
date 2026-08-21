'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import SectionHeading from './SectionHeading';
import { useEffect, useState } from 'react';
import { getPublishedEvents, type PublishedEvent } from '@/data/published-events';
import styles from './Events.module.css';

export default function Events() {
  const [events, setEvents] = useState<PublishedEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  useEffect(() => {
    getPublishedEvents().then((data) => { setEvents(data); setLoaded(true); });
  }, []);

  return (
    <section className={styles.events} id="events">
      <div className={styles.container}>
        <SectionHeading
          title="Upcoming Events"
          subtitle="Join us for these special creative gatherings"
        />

        {!configured ? <div className={styles.emptyState}>
          <h3>Events are being connected.</h3>
          <p>Supabase configuration is missing from this website deployment.</p>
        </div> : !events.length && loaded ? <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">&#128197;</div>
          <h3>New creative experiences are coming soon.</h3>
          <p>Check back soon for upcoming classes and events.</p>
        </div> : <div className={styles.grid}>
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
                <time dateTime={event.starts_at}>{new Date(event.starts_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</time>
                <span className={styles.time}>{new Date(event.starts_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
              </div>

              <div className={styles.details}>
                <h3>{event.classes?.name || 'Paint class'}</h3>
                <p className={styles.description}>{event.classes?.description || 'Join us for a creative experience.'}</p>
                <p className={styles.availability}>{event.spots_remaining} spots remaining</p>

                <Link href={`/events/${event.id}`} className={styles.bookButton}>
                  Register
                </Link>
              </div>
            </motion.div>
          ))}
        </div>}
      </div>
    </section>
  );
}
