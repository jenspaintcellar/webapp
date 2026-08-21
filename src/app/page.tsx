import Hero from '@/components/Hero';
import About from '@/components/About';
import Classes from '@/components/Classes';
import Events from '@/components/Events';
import Gallery from '@/components/Gallery';
import PrivateEvents from '@/components/PrivateEvents';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <div id="main-content">
      <Hero />
      <About />
      <Classes />
      <Events />
      <Gallery />
      <PrivateEvents />
      <Testimonials />
      <Contact />
    </div>
  );
}
