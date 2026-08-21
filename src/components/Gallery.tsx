'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { galleryImages } from '@/data/gallery';
import styles from './Gallery.module.css';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <section className={styles.gallery} id="gallery">
      <div className={styles.container}>
        <SectionHeading
          title="Our Gallery"
          subtitle="A glimpse into the creative space and work at Jen's Paint Cellar"
        />

        <div className={styles.grid}>
          {galleryImages.map((image, index) => (
            <motion.button
              key={image.id}
              className={styles.imageCard}
              onClick={() => setSelectedImage(index)}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={styles.imagePlaceholder}>
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <rect width="60" height="60" fill="var(--pink-light)" />
                  <circle cx="18" cy="18" r="4" fill="var(--accent)" />
                  <path
                    d="M0 45L20 20L40 35L60 10"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                <div className={styles.overlay}>
                  <span>View</span>
                </div>
              </div>
              {image.title && <p className={styles.imageTitle}>{image.title}</p>}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              className={styles.closeButton}
              onClick={() => setSelectedImage(null)}
              whileHover={{ scale: 1.1 }}
            >
              <X size={24} />
            </motion.button>

            <motion.div
              className={styles.lightboxContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.lightboxImage}>
                <svg width="100%" height="100%" viewBox="0 0 600 400" fill="none">
                  <rect width="600" height="400" fill="var(--pink-light)" />
                  <circle cx="150" cy="150" r="40" fill="var(--accent)" opacity="0.6" />
                  <rect x="200" y="200" width="100" height="100" fill="var(--accent)" opacity="0.4" />
                </svg>
              </div>

              {galleryImages[selectedImage]?.title && (
                <p className={styles.imageCaption}>
                  {galleryImages[selectedImage].title}
                </p>
              )}

              <div className={styles.nav}>
                <button
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev === 0 ? galleryImages.length - 1 : (prev ?? 0) - 1
                    )
                  }
                  className={styles.navButton}
                >
                  ←
                </button>
                <span className={styles.counter}>
                  {(selectedImage ?? 0) + 1} / {galleryImages.length}
                </span>
                <button
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev === galleryImages.length - 1 ? 0 : (prev ?? 0) + 1
                    )
                  }
                  className={styles.navButton}
                >
                  →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
