import Link from 'next/link';
import { siteConfig } from '@/data/site';
import styles from './Hero.module.css';

const experiences = [
  { title: 'Painting Classes', description: 'Guided instruction for artists of every level.', tone: 'blue' },
  { title: 'Paint and Create', description: 'A relaxed studio experience with room to explore.', tone: 'aqua' },
  { title: 'Private Sessions', description: 'Personalized time and guidance for your group.', tone: 'green' },
  { title: 'Open Studio', description: 'Bring your ideas and make something of your own.', tone: 'teal' },
];

export default function Hero() {
  return (
    <section className={styles.heroShell}>
      <section className={styles.promoBar}>
        <p>Creative instruction and private events in downtown Salem</p>
      </section>

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.brandBadge}>
            <div className={styles.logoFrame}>
              <img src={siteConfig.hero.image} alt="Jen's Paint Cellar logo" />
            </div>
            <p>Jen&apos;s Paint Cellar</p>
          </div>

          <h1 className={styles.headline}>{siteConfig.hero.headline}</h1>
          <p className={styles.subline}>{siteConfig.hero.subheadline}</p>

          <div className={styles.ctaButton}>
            <Link href={siteConfig.primaryCTA.href} className={styles.primaryLink}>
              {siteConfig.primaryCTA.text}
            </Link>
            <Link href={siteConfig.secondaryCTA.href} className={styles.secondaryLink}>
              {siteConfig.secondaryCTA.text}
            </Link>
          </div>
        </div>

        <div className={styles.carouselViewport} aria-label="Featured studio experiences">
          <div className={styles.carouselTrack}>
            {[...experiences, ...experiences].map((experience, index) => (
              <article
                key={`${experience.title}-${index}`}
                className={`${styles.characterCard} ${styles[`character${experience.tone}`]}`}
              >
                <div className={styles.cardArtwork}>
                  <span>Jen&apos;s Paint Cellar</span>
                </div>
                <div className={styles.cardContent}>
                  <h2>{experience.title}</h2>
                  <p>{experience.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
