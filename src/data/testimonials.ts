/**
 * Testimonials Data
 * Add customer testimonials here
 */

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  rating: number;
  image?: string;
}

export const testimonials: Testimonial[] = [
  // Add testimonials in this format:
  // {
  //   id: "testimonial-1",
  //   name: "Customer Name",
  //   quote: "Share what they said about their experience",
  //   rating: 5,
  // },
];

export const hasTestimonials = testimonials.length > 0;
