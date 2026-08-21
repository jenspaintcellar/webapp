import { getSupabaseClient } from '@/lib/supabase/client';

export type PublishedEvent = {
  id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  price: number;
  classes: { name: string; description: string | null } | null;
  locations: { name: string; city: string } | null;
  bookings?: { guest_count: number | null; status: string }[];
  spots_remaining?: number;
};

export async function getPublishedEvents() {
  const supabase = getSupabaseClient();
  if (!supabase) return [] as PublishedEvent[];

  const { data, error } = await supabase
    .from('events')
    .select('id, starts_at, ends_at, capacity, price, classes(name, description), locations(name, city)')
    .eq('status', 'published')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('Could not load published events:', error.message);
    return [] as PublishedEvent[];
  }

  return (data || []).map((event) => {
    const classes = Array.isArray(event.classes) ? event.classes[0] || null : event.classes;
    const locations = Array.isArray(event.locations) ? event.locations[0] || null : event.locations;
    return { ...event, classes, locations, spots_remaining: event.capacity } as unknown as PublishedEvent;
  });
}