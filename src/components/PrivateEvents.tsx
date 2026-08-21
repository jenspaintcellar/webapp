'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import SectionHeading from './SectionHeading';
import styles from './PrivateEvents.module.css';

const eventTypes = [
  {
    icon: '▪',
    title: 'Birthday Celebrations',
    description: 'Celebrate with a creative experience in our studio',
  },
  {
    icon: '▪',
    title: 'Group Sessions',
    description: 'A professional creative gathering with friends',
  },
  {
    icon: '▪',
    title: 'Special Occasions',
    description: 'Create together for anniversaries and milestones',
  },
  {
    icon: '▪',
    title: 'Family Events',
    description: 'Quality time creating together as a family',
  },
  {
    icon: '▪',
    title: 'Corporate Events',
    description: 'Team building and corporate creative experiences',
  },
  {
    icon: '▪',
    title: 'Custom Experiences',
    description: 'Personalized creative sessions tailored to your needs',
  },
];

export default function PrivateEvents() {
  return (
    <section className={styles.privateEvents} id="private-events">
      <div className={styles.container}>
        <SectionHeading
          title="Private Events and Custom Experiences"
          subtitle="Host a professional, personalized creative session for your group or celebration"
        />

        <div className={styles.grid}>
          {eventTypes.map((event, index) => (
            <motion.div
              key={event.title}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className={styles.icon}>{event.icon}</div>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.ctaSection}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className={styles.ctaContent}>
            <Sparkles className={styles.sparkleIcon} />
            <h3>Ready to plan your private event?</h3>
            <p>
              Contact Jen's Paint Cellar to discuss your vision and create a custom experience.
            </p>
            <Link href="/#contact" className={styles.ctaButton}>
              Contact for Private Events
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
