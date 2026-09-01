import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { finalizeBookingFromSession } from '@/lib/finalizeBooking';

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !webhookSecret || !serviceKey) return NextResponse.json({ error: 'Stripe webhook is not configured.' }, { status: 503 });
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });

  const stripe = new Stripe(secret);
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret); } catch { return NextResponse.json({ error: 'Invalid Stripe signature.' }, { status: 400 }); }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === 'paid') {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
      try { await finalizeBookingFromSession(supabase, stripe, session); } catch (err) {
        console.error('Could not finalize booking from webhook:', err instanceof Error ? err.message : 'Unknown error');
        return NextResponse.json({ error: 'Could not finalize booking.' }, { status: 503 });
      }
    }
  }
  return NextResponse.json({ received: true });
}
