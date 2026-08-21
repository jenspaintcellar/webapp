import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: 'Registration is not configured yet.' }, { status: 503 });
  const body = await request.json() as { customerId?: string; eventId?: string; email?: string; attendees?: unknown[] };
  if (!body.customerId || !body.eventId || !body.email || !Array.isArray(body.attendees)) return NextResponse.json({ error: 'Registration details are incomplete.' }, { status: 400 });
  const supabase = createClient(url, serviceKey);
  const { data, error } = await supabase.rpc('complete_email_registration', { requested_customer_id: body.customerId, requested_event_id: body.eventId, requested_email: body.email, requested_attendees: body.attendees });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ bookingId: data });
}
