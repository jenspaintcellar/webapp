import type { Metadata } from 'next';
import Contact from '@/components/Contact';

export const metadata: Metadata = {
  title: "Contact | Jen's Paint Cellar",
  description: "Get in touch with Jen's Paint Cellar for classes, private events, and questions.",
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return <Contact />;
}
