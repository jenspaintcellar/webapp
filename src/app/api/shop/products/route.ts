import Stripe from 'stripe';
import { createStripeClient } from '@/lib/stripeClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const secretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY;
  if (!secretKey) return Response.json({ products: [], configured: false });

  const stripe = createStripeClient(secretKey);
  try {
    const prices = await stripe.prices.list({ active: true, expand: ['data.product'], limit: 100 });
    const products = prices.data.flatMap((price: Stripe.Price) => {
      const product = typeof price.product === 'string' ? null : price.product;
      if (!product || !('name' in product) || !product.active || price.type !== 'one_time' || !price.unit_amount) return [];
      return [{
        id: product.id,
        priceId: price.id,
        name: product.name,
        description: product.description,
        image: product.images[0] || null,
        amount: price.unit_amount,
        currency: price.currency,
      }];
    });
    return Response.json({ products, configured: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown Stripe error';
    return Response.json({ products: [], configured: false, error: detail }, { status: 502 });
  }
}