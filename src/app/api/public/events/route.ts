import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type PublishedEvent = {
  id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  price: number;
  audience: 'all_ages' | 'adults' | 'family' | null;
  classes: { name: string; description: string | null; audience: 'all_ages' | 'adults' | 'family'; image_url: string | null } | { name: string; description: string | null; audience: 'all_ages' | 'adults' | 'family'; image_url: string | null }[] | null;
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

export async function GET() {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase variables are not configured in this deployment.' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('events')
    .select('id, starts_at, ends_at, capacity, price, audience, classes(name, description, audience, image_url), locations(name, city)')
    .eq('status', 'published')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const events = await Promise.all(
    ((data || []) as PublishedEvent[]).map(async (event) => {
      const classes = Array.isArray(event.classes) ? event.classes[0] || null : event.classes;
      const locations = Array.isArray(event.locations) ? event.locations[0] || null : event.locations;
      const { data: spots } = await supabase.rpc('get_event_spots_remaining', { requested_event_id: event.id });
      return {
        ...event,
        classes,
        locations,
        spots_remaining: typeof spots === 'number' ? spots : 0,
      };
    })
  );

  return NextResponse.json({ events }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
