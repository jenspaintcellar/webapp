import type { SupabaseClient } from '@supabase/supabase-js';

type BookingSeatRow = {
  event_id: string;
  guest_count: number | null;
  metadata: unknown;
};

function refundedAttendeeCount(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') return 0;
  const ids = (metadata as Record<string, unknown>).refunded_attendee_ids;
  return Array.isArray(ids) ? ids.length : 0;
}

function effectiveBookedSeats(booking: BookingSeatRow) {
  const guestCount = Number(booking.guest_count || 0);
  const refundedCount = refundedAttendeeCount(booking.metadata);
  return Math.max(guestCount - refundedCount, 0);
}

export async function getEventSpotsRemaining(
  supabase: SupabaseClient,
  eventId: string,
  capacity: number
) {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('event_id, guest_count, metadata')
    .eq('event_id', eventId)
    .eq('status', 'confirmed');

  if (error) throw error;

  const bookedSeats = ((bookings || []) as BookingSeatRow[]).reduce(
    (total, booking) => total + effectiveBookedSeats(booking),
    0
  );

  return Math.max(Number(capacity || 0) - bookedSeats, 0);
}

export async function getEventSpotsRemainingMap(
  supabase: SupabaseClient,
  eventIds: string[],
  capacitiesByEventId: Record<string, number>
) {
  if (!eventIds.length) return {} as Record<string, number>;

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('event_id, guest_count, metadata')
    .in('event_id', eventIds)
    .eq('status', 'confirmed');

  if (error) throw error;

  const bookedByEvent = new Map<string, number>();
  for (const booking of (bookings || []) as BookingSeatRow[]) {
    const current = bookedByEvent.get(booking.event_id) || 0;
    bookedByEvent.set(booking.event_id, current + effectiveBookedSeats(booking));
  }

  const result: Record<string, number> = {};
  for (const eventId of eventIds) {
    const capacity = Number(capacitiesByEventId[eventId] || 0);
    const booked = bookedByEvent.get(eventId) || 0;
    result[eventId] = Math.max(capacity - booked, 0);
  }

  return result;
}