import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: 'Email registration needs SUPABASE_SERVICE_ROLE_KEY configured on the webapp server.' }, { status: 503 });
  const body = await request.json() as { customerId?: string; eventId?: string; email?: string; attendees?: unknown[] };
  if (!body.eventId || !body.email || !Array.isArray(body.attendees)) return NextResponse.json({ error: 'Registration details are incomplete.' }, { status: 400 });
  const supabase = createClient(url, serviceKey);
  let customerId = body.customerId;
  if (!customerId) {
    const { data: existingProfile } = await supabase.from('profiles').select('id, email').ilike('email', body.email).maybeSingle();
    customerId = existingProfile?.id;
    if (!customerId) {
      const { data: newUser, error: userError } = await supabase.auth.admin.createUser({ email: body.email.trim().toLowerCase(), email_confirm: true });
      if (userError || !newUser.user) return NextResponse.json({ error: userError?.message || 'Could not create customer record.' }, { status: 400 });
      customerId = newUser.user.id;
    }
  }
  const { data: event, error: eventError } = await supabase.from('events').select('id, price, capacity, status, starts_at').eq('id', body.eventId).eq('status', 'published').single();
  if (eventError || !event || new Date(event.starts_at) <= new Date()) return NextResponse.json({ error: 'This class is no longer available.' }, { status: 400 });
  const attendees = body.attendees as { first_name?: string; last_name?: string; phone?: string; birth_date?: string; emergency_contact_name?: string; emergency_contact_phone?: string; waiver_accepted?: boolean }[];
  const calculateAge = (birthDate: string) => { const birth = new Date(`${birthDate}T00:00:00`); const today = new Date(); let age = today.getFullYear() - birth.getFullYear(); if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--; return age; };
  if (!attendees.length || attendees.length > 12 || attendees.some((attendee) => !attendee.first_name?.trim() || !attendee.last_name?.trim() || !attendee.phone?.trim() || !attendee.birth_date || calculateAge(attendee.birth_date) < 1 || calculateAge(attendee.birth_date) > 120 || !attendee.emergency_contact_name?.trim() || !attendee.emergency_contact_phone?.trim() || attendee.waiver_accepted !== true)) return NextResponse.json({ error: 'Every attendee needs a name, phone number, birthday, emergency contact, and waiver acceptance.' }, { status: 400 });
  const { data: bookings, error: countError } = await supabase.from('bookings').select('guest_count, status').eq('event_id', body.eventId).neq('status', 'cancelled');
  if (countError) return NextResponse.json({ error: countError.message }, { status: 400 });
  const bookedSeats = (bookings || []).reduce((total, booking) => total + (booking.guest_count || 1), 0);
  if (bookedSeats + attendees.length > event.capacity) return NextResponse.json({ error: 'There are not enough seats available.' }, { status: 400 });
  const { data: booking, error: bookingError } = await supabase.from('bookings').insert({ event_id: body.eventId, customer_id: customerId, guest_count: attendees.length, total_amount: Number(event.price) * attendees.length, status: 'pending' }).select('id').single();
  if (bookingError || !booking) return NextResponse.json({ error: bookingError?.message || 'Could not create reservation.' }, { status: 400 });
  const attendeeRows = attendees.map((attendee, index) => ({ booking_id: booking.id, first_name: attendee.first_name!.trim(), last_name: attendee.last_name!.trim(), email: body.email!.trim().toLowerCase(), phone: attendee.phone!.trim(), birth_date: attendee.birth_date, age: calculateAge(attendee.birth_date!), emergency_contact_name: attendee.emergency_contact_name!.trim(), emergency_contact_phone: attendee.emergency_contact_phone!.trim(), is_primary: index === 0 }));
  const { data: savedAttendees, error: attendeeError } = await supabase.from('booking_attendees').insert(attendeeRows).select('id');
  if (attendeeError || !savedAttendees) return NextResponse.json({ error: attendeeError?.message?.includes('birth_date') ? 'The database needs the attendee birthday migration. Run supabase/migrations/20260821_attendee_age_emergency.sql, then try again.' : attendeeError?.message || 'Could not save attendees.' }, { status: 400 });
  const { error: waiverError } = await supabase.from('attendee_waivers').insert(savedAttendees.map((attendee) => ({ attendee_id: attendee.id })));
  if (waiverError) return NextResponse.json({ error: waiverError.message }, { status: 400 });
  return NextResponse.json({ bookingId: booking.id });
}
