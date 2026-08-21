/**
 * Events Data
 * Add upcoming events here
 */

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  description: string;
  availability: string;
  bookingUrl: string;
  image?: string;
}

export const events: Event[] = [
  // Add your events here in this format:
  // {
  //   id: "event-1",
  //   name: "Event Name",
  //   date: "2026-09-15",
  //   time: "7:00 PM",
  //   description: "Event description",
  //   availability: "8 spots remaining",
  //   bookingUrl: "[BOOKING URL]",
  // },
];

export const hasUpcomingEvents = events.length > 0;
