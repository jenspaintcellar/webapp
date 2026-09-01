'use client';

import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from '@/app/shop/shop.module.css';

type Product = {
  id: string;
  priceId: string;
  name: string;
  description: string | null;
  image: string | null;
  amount: number;
  currency: string;
};

export default function ShopCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/shop/products')
      .then(async (response) => {
        const result = await response.json() as { products?: Product[]; configured?: boolean };
        setProducts(result.products || []);
        setConfigured(result.configured !== false);
      })
      .catch(() => setMessage('The shop is temporarily unavailable. Please contact the studio for assistance.'))
      .finally(() => setLoading(false));
  }, []);

  async function checkout(priceId: string) {
    setMessage('');
    const response = await fetch('/api/shop/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });
    const result = await response.json() as { url?: string; error?: string };
    if (result.url) window.location.assign(result.url);
    else setMessage(result.error || 'Unable to start checkout.');
  }

  if (loading) return <p className={styles.catalogStatus}>Loading shop items...</p>;
  if (!configured || !products.length) return <p className={styles.catalogStatus}>New studio items will be available here soon.</p>;

  return <>
    <div className={styles.productGrid}>
      {products.map((product) => <article className={styles.productCard} key={product.priceId}>
        {product.image && <img src={product.image} alt={product.name} />}
        <div className={styles.productBody}>
          <h3>{product.name}</h3>
          {product.description && <p>{product.description}</p>}
          <div className={styles.productFooter}>
            <strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.amount / 100)}</strong>
            <button type="button" onClick={() => checkout(product.priceId)}><ShoppingBag size={16} />Buy now</button>
          </div>
        </div>
      </article>)}
    </div>
    {message && <p className={styles.catalogMessage} role="status">{message}</p>}
  </>;
}