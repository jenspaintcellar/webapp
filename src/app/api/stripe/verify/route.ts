import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { finalizeBookingFromSession } from '@/lib/finalizeBooking';
import { rejectUntrustedBrowserRequest } from '@/lib/requestSecurity';
import { createStripeClient } from '@/lib/stripeClient';

type EventSummaryRow = {
  starts_at: string;
  classes: { name: string } | { name: string }[] | null;
  locations: { name: string; city: string } | { name: string; city: string }[] | null;
};

// Confirms a booking directly from the Checkout Session, so payment confirmation
// doesn't depend on a webhook reaching this server (useful in local/sandbox testing
// where Stripe can't call back to localhost). The webhook route does the same for production.
export async function POST(request: Request) {
  const rejectedRequest = rejectUntrustedBrowserRequest(request);
  if (rejectedRequest) return rejectedRequest;
  const stripeSecret = (process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY || '').trim();
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim();
  if (!stripeSecret || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Payment is not configured yet. Missing Stripe or Supabase server credentials in deployment environment.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { sessionId?: string } | null;
  if (!body?.sessionId || !/^cs_(test|live)_[a-zA-Z0-9]+$/.test(body.sessionId)) return NextResponse.json({ error: 'A valid session is required.' }, { status: 400 });

  const stripe = createStripeClient(stripeSecret);
  const session = await stripe.checkout.sessions.retrieve(body.sessionId);
  if (session.payment_status !== 'paid') return NextResponse.json({ confirmed: false });

  const supabase = createClient(supabaseUrl, serviceKey);
  try {
    const { bookingId, soldOut } = await finalizeBookingFromSession(supabase, stripe, session);
    if (soldOut) return NextResponse.json({ confirmed: false, soldOut: true, error: 'This class sold out while your payment was processing. You have been refunded automatically.' });

    const eventId = session.metadata?.event_id || '';
    const attendeeCount = Number(session.metadata?.guest_count || '0') || 1;
    const amountPaid = typeof session.amount_total === 'number' ? (session.amount_total / 100).toFixed(2) : '0.00';
    const summaryEmail = (session.customer_details?.email || session.metadata?.email || '').trim();

    let className = 'Paint class';
    let startsAt = '';
    let location = "Jen's Paint Cellar";

    if (eventId) {
      const { data: eventSummary } = await supabase
        .from('events')
        .select('starts_at, classes(name), locations(name, city)')
        .eq('id', eventId)
        .single();

      if (eventSummary) {
        const typedSummary = eventSummary as EventSummaryRow;
        const eventClass = Array.isArray(typedSummary.classes) ? typedSummary.classes[0] : typedSummary.classes;
        const eventLocation = Array.isArray(typedSummary.locations) ? typedSummary.locations[0] : typedSummary.locations;
        className = eventClass?.name || className;
        startsAt = typedSummary.starts_at || startsAt;
        if (eventLocation?.name && eventLocation?.city) location = `${eventLocation.name}, ${eventLocation.city}`;
      }
    }

    return NextResponse.json({
      confirmed: true,
      bookingId,
      summary: {
        className,
        startsAt,
        location,
        email: summaryEmail,
        attendees: attendeeCount,
        totalPaid: amountPaid,
      },
    });
  } catch (err) {
    return NextResponse.json({ confirmed: false, error: err instanceof Error ? err.message : 'Could not confirm this booking.' }, { status: 400 });
  }
}
