import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { encodeAttendeesToMetadata, validateAttendees, type AttendeeInput } from '@/lib/registration';
import { rejectUntrustedBrowserRequest } from '@/lib/requestSecurity';

// Nothing is written to the database here. Attendee details travel only in the Stripe
// Checkout Session's metadata and are only saved as a real booking once Stripe confirms
// the payment (see /api/stripe/webhook and /api/stripe/verify).
export async function POST(request: Request) {
  const rejectedRequest = rejectUntrustedBrowserRequest(request);
  if (rejectedRequest) return rejectedRequest;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!stripeSecret || !supabaseUrl || !serviceKey) return NextResponse.json({ error: 'Payment is not configured yet.' }, { status: 503 });

  const body = await request.json().catch(() => null) as { eventId?: string; email?: string; attendees?: AttendeeInput[] } | null;
  if (!body?.eventId || !body.email || !Array.isArray(body.attendees) || !/^[0-9a-f-]{36}$/i.test(body.eventId)) return NextResponse.json({ error: 'Registration details are incomplete.' }, { status: 400 });
  if (!validateAttendees(body.attendees)) return NextResponse.json({ error: 'Every attendee needs a name, phone number, birthday, and emergency contact.' }, { status: 400 });

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: event, error: eventError } = await supabase.from('events').select('id, price, capacity, status, starts_at, classes(name)').eq('id', body.eventId).eq('status', 'published').single();
  if (eventError || !event || new Date(event.starts_at) <= new Date()) return NextResponse.json({ error: 'This class is no longer available.' }, { status: 400 });

  const guestCount = body.attendees.length;
  const { data: bookings, error: countError } = await supabase.from('bookings').select('guest_count').eq('event_id', body.eventId).eq('status', 'confirmed');
  if (countError) return NextResponse.json({ error: countError.message }, { status: 400 });
  const bookedSeats = (bookings || []).reduce((total, booking) => total + (booking.guest_count || 1), 0);
  if (bookedSeats + guestCount > event.capacity) return NextResponse.json({ error: 'There are not enough seats available.' }, { status: 400 });

  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  const eventClass = Array.isArray(event.classes) ? event.classes[0] : event.classes;
  const origin = new URL(request.url).origin;
  const stripe = new Stripe(stripeSecret);
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

  return NextResponse.json({ url: session.url });
}
