import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!stripeSecret || !supabaseUrl || !serviceKey) return NextResponse.json({ error: 'Payment is not configured yet.' }, { status: 503 });

  const { bookingId, customerId, email } = await request.json() as { bookingId?: string; customerId?: string; email?: string };
  if (!bookingId || !customerId || !email) return NextResponse.json({ error: 'A booking is required.' }, { status: 400 });

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: profile } = await supabase.from('profiles').select('id, email').eq('id', customerId).ilike('email', email).single();
  if (!profile) return NextResponse.json({ error: 'Customer lookup could not be completed.' }, { status: 403 });
  const { data: booking, error: bookingError } = await supabase.from('bookings').select('id, guest_count, total_amount, payment_status, event_id, events(classes(name), starts_at)').eq('id', bookingId).eq('customer_id', customerId).single();
  if (bookingError || !booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (booking.payment_status === 'paid') return NextResponse.json({ error: 'This booking has already been paid.' }, { status: 409 });

  const stripe = new Stripe(stripeSecret);
  const event = (Array.isArray(booking.events) ? booking.events[0] : booking.events) as { starts_at: string; classes: { name: string } | { name: string }[] | null } | null;
  const eventClass: { name: string } | null = event ? (Array.isArray(event.classes) ? event.classes[0] : event.classes) : null;
  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: profile.email,
    line_items: [{ price_data: { currency: 'usd', product_data: { name: eventClass?.name || 'Paint class', description: event?.starts_at ? new Date(event.starts_at).toLocaleString() : undefined }, unit_amount: Math.round(Number(booking.total_amount) * 100) / Number(booking.guest_count || 1) }, quantity: booking.guest_count || 1 }],
    metadata: { booking_id: booking.id, event_id: booking.event_id },
    success_url: `${origin}/events/${booking.event_id}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/events/${booking.event_id}?payment=cancelled`,
  });
  return NextResponse.json({ url: session.url });
}
