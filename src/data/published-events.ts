export type PublishedEvent = {
  id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  price: number;
  classes: { name: string; description: string | null; audience: 'all_ages' | 'adults' | 'family'; image_url: string | null } | null;
  locations: { name: string; city: string } | null;
  audience?: 'all_ages' | 'adults' | 'family' | null;
  bookings?: { guest_count: number | null; status: string }[];
  spots_remaining?: number;
};

export async function getPublishedEvents() {
  const response = await fetch('/api/public/events', { cache: 'no-store' });
  if (!response.ok) {
    console.error('Could not load published events:', response.statusText);
    return [] as PublishedEvent[];
  }

  const payload = await response.json() as { events?: PublishedEvent[] };
  return payload.events || [];
}