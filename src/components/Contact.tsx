'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
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
    website: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.website) return;
    const subject = `${formData.inquiryType} from ${formData.name}`;
    const message = `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || 'Not provided'}\n\n${formData.message}`;
    window.location.href = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    setSubmitted(true);
  };

  return (
    <>
      <section className={styles.hero} id="contact">
        <motion.div className={styles.heroPanel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <p className={styles.eyebrow}>Contact Jen&apos;s Paint Cellar</p>
          <h1>Let&apos;s plan something creative.</h1>
          <p>Questions about classes, private events, or a project idea? Reach out and we&apos;ll help you find the right next step.</p>
        </motion.div>
      </section>

      <section className={styles.contact}>
        <div className={styles.container}>
          <div className={styles.sectionIntro}><p className={styles.kicker}>Get in touch</p><h2>We&apos;d love to hear from you.</h2></div>
          <div className={styles.content}>
          <motion.div
            className={styles.info}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className={styles.infoGroup}><h3>Contact information</h3>
              <a className={styles.infoItem} href={`tel:${siteConfig.contact.phone}`}><Phone size={19} aria-hidden="true" /><span><small>Call the studio</small>{siteConfig.contact.phone}</span></a>
              <a className={styles.infoItem} href={`mailto:${siteConfig.contact.email}`}><Mail size={19} aria-hidden="true" /><span><small>Email</small>{siteConfig.contact.email}</span></a>
              <div className={styles.infoItem}><MapPin size={19} aria-hidden="true" /><span><small>Visit</small>{siteConfig.contact.address}</span></div>
            </div>
            <div className={styles.note}><h3>A personal note from Jen</h3><p>Whether you&apos;re joining your first class or planning a celebration, every gathering starts with a conversation.</p></div>
          </motion.div>

          <motion.form
            className={styles.form}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className={styles.formHeader}><h3>Send a message</h3><p>Your message opens in your email app, so your details are never stored on this website.</p></div>
            <input className={styles.botTrap} type="text" name="website" value={formData.website} onChange={handleChange} tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className={`${styles.formGroup} ${styles.messageGroup}`}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                maxLength={100}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                maxLength={254}
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
                autoComplete="tel"
                maxLength={30}
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
                maxLength={2000}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitted}
            >
              <Send size={17} aria-hidden="true" />
              {submitted ? 'Email app opened' : 'Continue to email'}
            </button>
            {submitted && <p className={styles.submitted} role="status">Review and send the message in your email app to reach Jen&apos;s Paint Cellar.</p>}
          </motion.form>
        </div>
      </div>
      </section>
    </>
  );
}
