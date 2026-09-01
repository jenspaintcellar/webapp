import Stripe from 'stripe';
import { rejectUntrustedBrowserRequest } from '@/lib/requestSecurity';

export async function POST(request: Request) {
  const rejectedRequest = rejectUntrustedBrowserRequest(request);
  if (rejectedRequest) return rejectedRequest;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return Response.json({ error: 'Shop checkout is not configured.' }, { status: 503 });

  const body = await request.json().catch(() => null) as { priceId?: string } | null;
  if (!body?.priceId || !/^price_[a-zA-Z0-9]+$/.test(body.priceId)) return Response.json({ error: 'Choose a valid product before checking out.' }, { status: 400 });

  const stripe = new Stripe(secretKey);
  try {
    const price = await stripe.prices.retrieve(body.priceId);
    if (!price.active || price.type !== 'one_time') return Response.json({ error: 'That product is no longer available.' }, { status: 400 });
    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${origin}/shop?checkout=success`,
      cancel_url: `${origin}/shop?checkout=cancelled`,
    });
    return Response.json({ url: session.url });
  } catch {
    return Response.json({ error: 'Unable to start checkout for that product.' }, { status: 502 });
  }
}