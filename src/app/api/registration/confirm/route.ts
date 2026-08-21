import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: 'Registration is not configured yet.' }, { status: 503 });
  const { bookingId } = await request.json() as { bookingId?: string };
  if (!bookingId) return NextResponse.json({ error: 'Reservation is incomplete.' }, { status: 400 });
  const supabase = createClient(url, serviceKey);
  const { error } = await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId).eq('status', 'pending');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ confirmed: true });
}