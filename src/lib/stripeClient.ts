import Stripe from 'stripe';

export function createStripeClient(secretKey: string) {
  return new Stripe(secretKey, {
    // Use fetch-based transport so Stripe requests work in Cloudflare Workers.
    httpClient: Stripe.createFetchHttpClient(),
  });
}
