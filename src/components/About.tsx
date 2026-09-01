'use client';

import { motion } from 'framer-motion';
import { siteConfig } from '@/data/site';
import styles from './About.module.css';

export default function About() {
  return (
    <>
      <section className={styles.hero} id="about">
        <motion.div className={styles.heroPanel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <p className={styles.eyebrow}>Jen&apos;s Paint Cellar</p>
          <h1>A welcoming place to make something meaningful.</h1>
          <p>{siteConfig.about.description}</p>
        </motion.div>
      </section>

      <section className={styles.story}>
        <div className={styles.container}>
          <motion.div className={styles.imageColumn} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }} viewport={{ once: true }}>
            <div className={styles.studioPanel} role="img" aria-label={siteConfig.about.imageAlt}>
              <span>JP</span>
              <p>Jen&apos;s Paint Cellar</p>
              <small>Salem, Ohio</small>
            </div>
          </motion.div>
          <motion.div className={styles.copyColumn} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }} viewport={{ once: true }}>
            <p className={styles.kicker}>The Cellar story</p>
            <h2>Creative experiences, thoughtfully hosted.</h2>
            <p>{siteConfig.about.story}</p>
            <h3>Meet Jen</h3>
            <p>{siteConfig.about.meetJen}</p>
          </motion.div>
        </div>
      </section>

      <section className={styles.promise}>
        <div className={styles.container}>
          <p className={styles.kicker}>Our approach</p>
          <h2>Everyone deserves a seat at the creative table.</h2>
          <p>{siteConfig.about.whyPaint}</p>
        </div>
      </section>
    </>
  );
}
