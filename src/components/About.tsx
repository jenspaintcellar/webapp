'use client';

import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import { siteConfig } from '@/data/site';
import styles from './About.module.css';

export default function About() {
  return (
    <section className={styles.about} id="about">
      <div className={styles.container}>
        <SectionHeading title={siteConfig.about.headline} />

        <div className={styles.content}>
          <motion.div
            className={styles.textColumn}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className={styles.section}>
              <h3>Our Story</h3>
              <p>{siteConfig.about.story}</p>
            </div>

            <div className={styles.section}>
              <h3>Meet Jen</h3>
              <p>{siteConfig.about.meetJen}</p>
            </div>

            <div className={styles.section}>
              <h3>What We Believe</h3>
              <p>{siteConfig.about.whyPaint}</p>
            </div>
          </motion.div>

          <motion.div
            className={styles.imageColumn}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className={styles.imagePlaceholder}>
              <div className={styles.placeholderContent}>
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="80" height="80" fill="var(--pink-light)" />
                  <path
                    d="M40 30L50 50H30L40 30Z"
                    fill="var(--accent)"
                    opacity="0.6"
                  />
                  <circle cx="35" cy="45" r="3" fill="var(--accent)" />
                  <circle cx="45" cy="45" r="3" fill="var(--accent)" />
                </svg>
                <p>Studio Photo</p>
                <small>[REPLACE WITH ACTUAL IMAGE]</small>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
