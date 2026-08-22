'use client';

import Link from 'next/link';
import { CalendarDays, MapPin, Search, ShieldCheck, SlidersHorizontal, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getPublishedEvents, type PublishedEvent } from '@/data/published-events';
import styles from './classes.module.css';

const categoryImages = [
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=900&q=85',
];

function eventTitle(event: PublishedEvent) { return event.classes?.name || 'Paint class'; }

export default function ClassesPage() {
  const [events, setEvents] = useState<PublishedEvent[]>([]);
  const [query, setQuery] = useState('');
  const [when, setWhen] = useState('all');

  useEffect(() => { getPublishedEvents().then(setEvents); }, []);

  const filteredEvents = useMemo(() => events.filter((event) => {
    const text = `${eventTitle(event)} ${event.classes?.description || ''} ${event.locations?.name || ''}`.toLowerCase();
    const matchesQuery = !query.trim() || text.includes(query.trim().toLowerCase());
    const date = new Date(event.starts_at);
    const matchesWhen = when === 'all' || (when === 'weekend' && [0, 6].includes(date.getDay())) || (when === 'weekday' && ![0, 6].includes(date.getDay()));
    return matchesQuery && matchesWhen;
  }), [events, query, when]);

  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.heroCopy}><p className={styles.eyebrow}>Jen&apos;s Paint Cellar · Salem, Ohio</p><h1>Find your next creative experience.</h1><p>Browse upcoming workshops, painting classes, and hands-on gatherings. Choose a date, see what is available, and reserve your seats.</p></div>
      <div className={styles.searchPanel} role="search"><label><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Painting, resin, family..." /></label><label><span>When</span><select value={when} onChange={(event) => setWhen(event.target.value)}><option value="all">Any date</option><option value="weekday">Weekdays</option><option value="weekend">Weekends</option></select></label><button type="button" aria-label="Search classes"><Search size={20} /></button></div>
    </section>
    <section className={styles.content}>
      <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Explore</p><h2>Creative workshops</h2></div><div className={styles.controls}><span>{filteredEvents.length} available</span><button type="button"><SlidersHorizontal size={17} /> Filters</button></div></div>
      <div className={styles.categories}>{['Painting', 'Make & take', 'Family friendly'].map((category, index) => <button type="button" key={category} onClick={() => setQuery(index === 0 ? 'paint' : index === 1 ? 'create' : 'family')}><img src={categoryImages[index]} alt="" /><span>{category}</span></button>)}</div>
      <div className={styles.resultsHeader}><h2>Upcoming experiences</h2><p>Published events update from the studio schedule.</p></div>
      {!filteredEvents.length ? <div className={styles.empty}><Search size={25} /><h3>No experiences match that search.</h3><p>Try another search or choose any date.</p><button type="button" onClick={() => { setQuery(''); setWhen('all'); }}>Clear search</button></div> : <div className={styles.grid}>{filteredEvents.map((event) => <article className={styles.card} key={event.id}><div className={styles.imageWrap}><img src={categoryImages[eventTitle(event).toLowerCase().includes('family') ? 2 : eventTitle(event).toLowerCase().includes('paint') ? 0 : 1]} alt="" /><span className={styles.dateBadge}><CalendarDays size={14} />{new Date(event.starts_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span></div><div className={styles.cardBody}><div className={styles.cardMeta}><span>{new Date(event.starts_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span><span>{event.spots_remaining} spots</span></div><h3>{eventTitle(event)}</h3><p>{event.classes?.description || 'A guided creative experience for all skill levels.'}</p><div className={styles.cardFooter}><span><MapPin size={14} />{event.locations?.name || 'Salem studio'}</span><Link href={`/events/${event.id}`}>View details</Link></div></div></article>)}</div>}
      <div className={styles.trust}><ShieldCheck size={21} /><div><strong>Secure registration</strong><p>Your reservation is handled through the studio&apos;s protected booking system.</p></div><Users size={21} /><div><strong>Small-group experiences</strong><p>Availability is shown from the live event schedule.</p></div></div>
    </section>
  </main>;
}