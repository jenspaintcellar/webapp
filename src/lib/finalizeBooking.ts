import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { calculateAge, decodeAttendeesFromMetadata } from './registration';

// The webhook and the success-page verify call can both try to finalize the same
// session at nearly the same instant. This in-process lock serializes those calls so
// only one of them actually inserts a booking; the duplicate-check further below is a
// second safety net in case two separate server instances race instead.
const inFlightSessions = new Map<string, Promise<{ bookingId: string | null; soldOut: boolean }>>();

export async function finalizeBookingFromSession(supabase: SupabaseClient, stripe: Stripe, session: Stripe.Checkout.Session) {
  const inFlight = inFlightSessions.get(session.id);
  if (inFlight) return inFlight;

  const promise = finalizeBookingFromSessionOnce(supabase, stripe, session);
  inFlightSessions.set(session.id, promise);
  try {
    return await promise;
  } finally {
    inFlightSessions.delete(session.id);
  }
}

// Nothing is saved to the database until Stripe confirms payment. This turns a paid
// Checkout Session's metadata into a confirmed booking + attendees, or refunds and
// bails out if the event sold out while payment was in progress.
async function finalizeBookingFromSessionOnce(supabase: SupabaseClient, stripe: Stripe, session: Stripe.Checkout.Session) {
  const { data: existing } = await supabase.from('bookings').select('id').contains('metadata', { stripe_session_id: session.id }).order('created_at', { ascending: true }).limit(1).maybeSingle();
  if (existing) return { bookingId: existing.id as string, soldOut: false };

  const meta = session.metadata || {};
  const eventId = meta.event_id;
  const email = meta.email;
  const guestCount = Number(meta.guest_count || '0');
  if (!eventId || !email || !guestCount) throw new Error('This payment session is missing registration details.');

  const { data: event } = await supabase.from('events').select('id, price, capacity').eq('id', eventId).single();
  if (!event) throw new Error('This class is no longer available.');

  const { data: bookings } = await supabase.from('bookings').select('guest_count').eq('event_id', eventId).eq('status', 'confirmed');
  const bookedSeats = (bookings || []).reduce((total, booking) => total + (booking.guest_count || 1), 0);
  if (bookedSeats + guestCount > event.capacity) {
    if (typeof session.payment_intent === 'string') await stripe.refunds.create({ payment_intent: session.payment_intent });
    return { bookingId: null, soldOut: true };
  }

  let customerId: string | undefined;
  const { data: existingProfile } = await supabase.from('profiles').select('id').ilike('email', email).maybeSingle();
  customerId = existingProfile?.id;
  if (!customerId) {
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({ email, email_confirm: true });
    if (userError || !newUser.user) throw new Error(userError?.message || 'Could not create customer record.');
    customerId = newUser.user.id;
  }

  const totalAmount = Number(event.price) * guestCount;
  const { data: booking, error: bookingError } = await supabase.from('bookings').insert({
    event_id: eventId,
    customer_id: customerId,
    guest_count: guestCount,
    total_amount: totalAmount,
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
    amount_paid: totalAmount,
    metadata: { stripe_session_id: session.id, stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null },
  }).select('id').single();
  if (bookingError || !booking) throw new Error(bookingError?.message || 'Could not save this booking.');

  // Second safety net: if another process slipped in and inserted its own booking for this
  // same session between our check above and our insert, keep only the earliest one.
  const { data: sessionBookings } = await supabase.from('bookings').select('id, created_at').contains('metadata', { stripe_session_id: session.id }).order('created_at', { ascending: true });
  const winner = sessionBookings && sessionBookings.length > 0 ? sessionBookings[0] : booking;
  if (winner.id !== booking.id) {
    await supabase.from('bookings').delete().eq('id', booking.id);
    return { bookingId: winner.id as string, soldOut: false };
  }
  if (sessionBookings && sessionBookings.length > 1) {
    const duplicateIds = sessionBookings.slice(1).map((row) => row.id);
    await supabase.from('bookings').delete().in('id', duplicateIds);
  }

  const attendees = decodeAttendeesFromMetadata(meta, guestCount);
  const attendeeRows = attendees.map((attendee, index) => ({
    booking_id: booking.id,
    first_name: attendee.first_name,
    last_name: attendee.last_name,
    email,
    phone: attendee.phone,
    birth_date: attendee.birth_date,
    age: calculateAge(attendee.birth_date),
    emergency_contact_name: attendee.emergency_contact_name,
    emergency_contact_phone: attendee.emergency_contact_phone,
    is_primary: index === 0,
  }));
  const { data: savedAttendees, error: attendeeError } = await supabase.from('booking_attendees').insert(attendeeRows).select('id');
  if (attendeeError || !savedAttendees) throw new Error(attendeeError.message || 'Could not save attendees.');
  await supabase.from('attendee_waivers').insert(savedAttendees.map((attendee) => ({ attendee_id: attendee.id })));

  return { bookingId: booking.id as string, soldOut: false };
}
