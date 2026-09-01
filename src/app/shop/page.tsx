import type { Metadata } from 'next';
import ShopCatalog from '@/components/ShopCatalog';
import styles from './shop.module.css';

export const metadata: Metadata = {
  title: "Shop | Jen's Paint Cellar",
  description: 'Paint supplies, gifts, and handmade pieces from Jen\'s Paint Cellar.',
  alternates: { canonical: '/shop' },
};

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
