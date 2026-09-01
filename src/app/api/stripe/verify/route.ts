import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { finalizeBookingFromSession } from '@/lib/finalizeBooking';
import { rejectUntrustedBrowserRequest } from '@/lib/requestSecurity';

// Confirms a booking directly from the Checkout Session, so payment confirmation
// doesn't depend on a webhook reaching this server (useful in local/sandbox testing
// where Stripe can't call back to localhost). The webhook route does the same for production.
export async function POST(request: Request) {
  const rejectedRequest = rejectUntrustedBrowserRequest(request);
  if (rejectedRequest) return rejectedRequest;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!stripeSecret || !supabaseUrl || !serviceKey) return NextResponse.json({ error: 'Payment is not configured yet.' }, { status: 503 });

  const body = await request.json().catch(() => null) as { sessionId?: string } | null;
  if (!body?.sessionId || !/^cs_(test|live)_[a-zA-Z0-9]+$/.test(body.sessionId)) return NextResponse.json({ error: 'A valid session is required.' }, { status: 400 });

  const stripe = new Stripe(stripeSecret);
  const session = await stripe.checkout.sessions.retrieve(body.sessionId);
  if (session.payment_status !== 'paid') return NextResponse.json({ confirmed: false });

  const supabase = createClient(supabaseUrl, serviceKey);
  try {
    const { bookingId, soldOut } = await finalizeBookingFromSession(supabase, stripe, session);
    if (soldOut) return NextResponse.json({ confirmed: false, soldOut: true, error: 'This class sold out while your payment was processing. You have been refunded automatically.' });
    return NextResponse.json({ confirmed: true, bookingId });
  } catch (err) {
    return NextResponse.json({ confirmed: false, error: err instanceof Error ? err.message : 'Could not confirm this booking.' }, { status: 400 });
  }
}
