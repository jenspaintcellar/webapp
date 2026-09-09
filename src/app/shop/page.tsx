import type { Metadata } from 'next';
import ShopCatalog from '@/components/ShopCatalog';
import styles from './shop.module.css';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Shop',
  description: 'Shop paint supplies, gifts, and handmade items from Jen\'s Paint Cellar.',
  path: '/shop',
  keywords: ['paint supplies Salem Ohio', 'art gifts', 'handmade studio shop'],
});

export default function ShopPage() {
  return (
    <section className={styles.shop}>
      <div className={styles.container}>
        <div className={styles.catalog}>
          <h2>Available now</h2>
          <ShopCatalog />
        </div>
      </div>
    </section>
  );
}
