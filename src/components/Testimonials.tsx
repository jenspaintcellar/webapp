'use client';

import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import { testimonials, hasTestimonials } from '@/data/testimonials';
import styles from './Testimonials.module.css';

export default function Testimonials() {
  if (!hasTestimonials) {
    return null;
  }

  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <SectionHeading
          title="What People Say"
          subtitle="Hear from those who have experienced Jen's Paint Cellar"
        />

        <div className={styles.grid}>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className={styles.card}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className={styles.stars}>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className={styles.quote}>"{testimonial.quote}"</p>
              <p className={styles.author}>— {testimonial.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
