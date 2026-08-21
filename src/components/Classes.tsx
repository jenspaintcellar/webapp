'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import SectionHeading from './SectionHeading';
import { classExperiences } from '@/data/classes';
import styles from './Classes.module.css';

export default function Classes() {
  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = document.getElementById('classes-carousel');
    carousel?.scrollBy({ left: direction === 'right' ? 360 : -360, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className={styles.classes} id="classes">
      <div className={styles.container}>
        <SectionHeading
          title="Experiences & Classes"
          subtitle="Explore professional creative experiences designed for every skill level"
        />

        <div className={styles.carouselControls}>
          <p className={styles.carouselNote}>Explore our studio experiences</p>
          <div className={styles.arrows}>
            <button type="button" onClick={() => scrollCarousel('left')} aria-label="Previous experiences">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => scrollCarousel('right')} aria-label="Next experiences">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <motion.div
          id="classes-carousel"
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {classExperiences.map((cls) => (
            <motion.div key={cls.id} className={styles.card} variants={itemVariants}>
              <div className={styles.imageWrapper}>
                <div className={styles.imagePlaceholder}>
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" aria-hidden="true">
                    <rect width="60" height="60" fill="url(#cardGradient)" />
                    <circle cx="30" cy="25" r="8" fill="white" opacity="0.85" />
                    <path
                      d="M20 45C20 40 25 35 30 35C35 35 40 40 40 45"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.6"
                    />
                    <defs>
                      <linearGradient id="cardGradient" x1="0" y1="0" x2="60" y2="60">
                        <stop stopColor="#e8a6bd" />
                        <stop offset="1" stopColor="#d878a1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className={styles.content}>
                <h3 className={styles.title}>{cls.title}</h3>
                <p className={styles.description}>{cls.description}</p>
                <Link href={cls.learnMoreUrl} className={styles.link}>
                  View Experience
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
