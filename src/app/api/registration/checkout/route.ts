import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { encodeAttendeesToMetadata, validateAttendees, type AttendeeInput } from '@/lib/registration';
import { rejectUntrustedBrowserRequest } from '@/lib/requestSecurity';
import { getEventSpotsRemaining } from '@/lib/seatAvailability';
import { createStripeClient } from '@/lib/stripeClient';

// Nothing is written to the database here. Attendee details travel only in the Stripe
// Checkout Session's metadata and are only saved as a real booking once Stripe confirms
// the payment (see /api/stripe/webhook and /api/stripe/verify).
export async function POST(request: Request) {
  const rejectedRequest = rejectUntrustedBrowserRequest(request);
  if (rejectedRequest) return rejectedRequest;
  const stripeSecret = (process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY || '').trim();
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const supabaseReadKey =
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUB
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SERVICE_KEY
    || '').trim();
  if (!stripeSecret || !supabaseUrl || !supabaseReadKey) {
    return NextResponse.json({ error: 'Payment is not configured yet. Missing Stripe or Supabase credentials in deployment environment.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { eventId?: string; email?: string; attendees?: AttendeeInput[] } | null;
  if (!body?.eventId || !body.email || !Array.isArray(body.attendees) || !/^[0-9a-f-]{36}$/i.test(body.eventId)) return NextResponse.json({ error: 'Registration details are incomplete.' }, { status: 400 });
  if (!validateAttendees(body.attendees)) return NextResponse.json({ error: 'Every attendee needs a name, phone number, birthday, and emergency contact.' }, { status: 400 });

  const supabase = createClient(supabaseUrl, supabaseReadKey);
  const { data: event, error: eventError } = await supabase.from('events').select('id, price, capacity, status, starts_at, classes(name)').eq('id', body.eventId).eq('status', 'published').single();
  if (eventError || !event || new Date(event.starts_at) <= new Date()) return NextResponse.json({ error: 'This class is no longer available.' }, { status: 400 });

  const guestCount = body.attendees.length;
  let availableSeats = 0;
  try {
    availableSeats = await getEventSpotsRemaining(supabase, body.eventId, event.capacity);
  } catch (spotsError) {
    return NextResponse.json({ error: spotsError instanceof Error ? spotsError.message : 'Could not check available seats.' }, { status: 400 });
  }
  if (guestCount > availableSeats) return NextResponse.json({ error: `Only ${availableSeats} ${availableSeats === 1 ? 'seat is' : 'seats are'} available for this class.` }, { status: 400 });

  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  const eventClass = Array.isArray(event.classes) ? event.classes[0] : event.classes;
  const origin = new URL(request.url).origin;
  try {
    const stripe = createStripeClient(stripeSecret);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      billing_address_collection: 'required',
      automatic_tax: { enabled: true },
      line_items: [{ price_data: { currency: 'usd', product_data: { name: eventClass?.name || 'Paint class' }, unit_amount: Math.round(Number(event.price) * 100) }, quantity: guestCount }],
      metadata: {
        event_id: body.eventId,
        email,
        guest_count: String(guestCount),
        ...encodeAttendeesToMetadata(body.attendees),
      },
      success_url: `${origin}/events/${body.eventId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events/${body.eventId}?payment=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Could not start secure payment right now.' }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    return NextResponse.json({ error: 'Secure checkout is temporarily unavailable. Please try again in a moment.' }, { status: 502 });
  }
}
