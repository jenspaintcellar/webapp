import type { Metadata } from 'next';
import About from '@/components/About';

export const metadata: Metadata = {
  title: "About | Jen's Paint Cellar",
  description: "Meet Jen and learn the story behind Jen's Paint Cellar.",
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <About />;
}
