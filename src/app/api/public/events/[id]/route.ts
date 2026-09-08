import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type EventRecord = {
  id: string;
  starts_at: string;
  capacity: number;
  price: number;
  classes: { name: string; description: string | null } | { name: string; description: string | null }[] | null;
  locations: { name: string; city: string } | { name: string; city: string }[] | null;
};

function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUB;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase variables are not configured in this deployment.' }, { status: 503 });
  }

  const { id } = await context.params;

  const { data, error } = await supabase
    .from('events')
    .select('id, starts_at, capacity, price, classes(name, description), locations(name, city)')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ event: null }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const event = data as EventRecord;
  const classes = Array.isArray(event.classes) ? event.classes[0] || null : event.classes;
  const locations = Array.isArray(event.locations) ? event.locations[0] || null : event.locations;

  return NextResponse.json({ event: { ...event, classes, locations } }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
