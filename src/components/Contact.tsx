'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import { siteConfig } from '@/data/site';
import styles from './Contact.module.css';

const inquiryTypes = [
  'General Question',
  'Class Information',
  'Private Event',
  'Birthday / Celebration',
  'Group Event',
  'Other',
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'General Question',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to a backend service
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', inquiryType: 'General Question', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <section className={styles.contact} id="contact">
      <div className={styles.container}>
        <SectionHeading
          title="Get In Touch"
          subtitle="We'd love to hear from you. Reach out with questions or to book an experience."
        />

        <div className={styles.content}>
          <motion.div
            className={styles.info}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className={styles.infoGroup}>
              <h3>Contact Information</h3>
              <div className={styles.infoItem}>
                <span className={styles.label}>Address</span>
                <p>{siteConfig.contact.address}</p>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Phone</span>
                <a href={`tel:${siteConfig.contact.phone}`}>{siteConfig.contact.phone}</a>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Email</span>
                <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Hours</span>
                <p>{siteConfig.contact.hours}</p>
              </div>
            </div>

            <div className={styles.socialGroup}>
              <h3>Follow Us</h3>
              <div className={styles.socialLinks}>
                {siteConfig.contact.social.instagram !== '[INSTAGRAM URL]' && (
                  <a
                    href={siteConfig.contact.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    Instagram
                  </a>
                )}
                {siteConfig.contact.social.facebook !== '[FACEBOOK URL]' && (
                  <a
                    href={siteConfig.contact.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    Facebook
                  </a>
                )}
                {siteConfig.contact.social.instagram === '[INSTAGRAM URL]' &&
                  siteConfig.contact.social.facebook === '[FACEBOOK URL]' && (
                    <p className={styles.placeholder}>Social links coming soon</p>
                  )}
              </div>
            </div>
          </motion.div>

          <motion.form
            className={styles.form}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className={styles.formGroup}>
              <label htmlFor="name">Name (Required)</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email (Required)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="inquiryType">Inquiry Type</label>
              <select
                id="inquiryType"
                name="inquiryType"
                value={formData.inquiryType}
                onChange={handleChange}
              >
                {inquiryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Message (Required)</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitted}
            >
              {submitted ? 'Message Sent' : 'Send Message'}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
