'use client';

import Link from 'next/link';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, PartyPopper, Search, Sparkles, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getPublishedEvents, type PublishedEvent } from '@/data/published-events';
import styles from '@/app/classes/classes.module.css';

const eventImages = [
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=900&q=85',
];

const whenOptions = [
  { value: 'all', label: 'Any date' },
  { value: 'week', label: 'This week' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'month', label: 'Next 30 days' },
];

const audienceOptions = [
  { value: 'all', label: 'All ages', description: 'Everyone is welcome', icon: Sparkles },
  { value: 'adults', label: 'Adults', description: 'Grown-up focused experiences', icon: Users },
  { value: 'family', label: 'Kids & family', description: 'Great for kids and families', icon: PartyPopper },
];

const audienceBadgeLabels: Record<string, string> = { all_ages: 'All ages', adults: 'Adults', family: 'Kids & family' };

function eventTitle(event: PublishedEvent) { return event.classes?.name || 'Paint class'; }
function eventImage(event: PublishedEvent, index: number) { return event.classes?.image_url || eventImages[index % eventImages.length]; }
function eventAudience(event: PublishedEvent) { return event.audience || event.classes?.audience || 'all_ages'; }

function EventCard({ event, index }: { event: PublishedEvent; index: number }) {
  const audience = eventAudience(event);
  return (
    <article className={styles.card}>
      <Link href={`/events/${event.id}`} className={styles.cardLink}>
        <div className={styles.imageWrap}>
          <img src={eventImage(event, index)} alt="" loading="lazy" />
          <span className={styles.dateBadge}>
            <CalendarDays size={14} />
            {new Date(event.starts_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
          {audience !== 'all_ages' && <span className={styles.audienceBadge}>{audienceBadgeLabels[audience]}</span>}
        </div>
        <div className={styles.cardBody}>
          <div className={styles.cardTitleRow}>
            <h3>{eventTitle(event)}</h3>
            <span className={styles.cardPrice}>${event.price}</span>
          </div>
          <p className={styles.cardLocation}>
            <MapPin size={13} />
            {event.locations?.name || 'Salem studio'}
          </p>
          <p className={styles.cardMetaLine}>
            {new Date(event.starts_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            {' · '}
            {event.spots_remaining} spots left
          </p>
        </div>
      </Link>
    </article>
  );
}

function EventRow({ title, events }: { title: string; events: PublishedEvent[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollBy = (amount: number) => trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' });

  return (
    <section className={styles.row}>
      <div className={styles.rowHeader}>
        <h2>{title}</h2>
        <div className={styles.rowNav}>
          <button type="button" aria-label="Scroll left" onClick={() => scrollBy(-600)}><ChevronLeft size={18} /></button>
          <button type="button" aria-label="Scroll right" onClick={() => scrollBy(600)}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className={styles.rowTrack} ref={trackRef}>
        {events.map((event, index) => <EventCard event={event} index={index} key={event.id} />)}
      </div>
    </section>
  );
}

export default function ClassIndex() {
  const [events, setEvents] = useState<PublishedEvent[]>([]);
  const [query, setQuery] = useState('');
  const [when, setWhen] = useState('all');
  const [audience, setAudience] = useState('all');
  const [activePanel, setActivePanel] = useState<'search' | 'when' | 'who' | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getPublishedEvents().then(setEvents); }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) setActivePanel(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => Array.from(new Set(events.map(eventTitle))).slice(0, 5), [events]);

  const filteredEvents = useMemo(() => events.filter((event) => {
    const text = `${eventTitle(event)} ${event.classes?.description || ''} ${event.locations?.name || ''}`.toLowerCase();
    const matchesQuery = !query.trim() || text.includes(query.trim().toLowerCase());

    const date = new Date(event.starts_at);
    const now = new Date();
    const daysAway = (date.getTime() - now.getTime()) / 86400000;
    const matchesWhen = when === 'all'
      || (when === 'week' && daysAway <= 7)
      || (when === 'weekend' && [0, 6].includes(date.getDay()) && daysAway <= 14)
      || (when === 'month' && daysAway <= 30);

    const matchesAudience = audience === 'all' || eventAudience(event) === audience;

    return matchesQuery && matchesWhen && matchesAudience;
  }), [events, query, when, audience]);

  const rows = useMemo(() => {
    const groups = new Map<string, PublishedEvent[]>();
    filteredEvents.forEach((event) => {
      const key = event.locations?.name || 'Salem studio';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(event);
    });
    return Array.from(groups.entries());
  }, [filteredEvents]);

  const whenLabel = whenOptions.find((option) => option.value === when)?.label || 'Any date';
  const audienceLabel = audienceOptions.find((option) => option.value === audience)?.label || 'All ages';

  return <main className={styles.page}>
    <section className={styles.intro}>
      <p className={styles.eyebrow}>Jen&apos;s Paint Cellar · Salem, Ohio</p>
      <h1>Make something memorable.</h1>
      <div className={styles.searchBarWrap} ref={searchBarRef}>
        <div className={styles.searchPanel} role="search">
          <button
            type="button"
            className={`${styles.segment} ${activePanel === 'search' ? styles.segmentActive : ''}`}
            onClick={() => setActivePanel(activePanel === 'search' ? null : 'search')}
          >
            <span>Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setActivePanel('search')}
              placeholder="Painting, resin, family..."
            />
          </button>
          <span className={styles.searchDivider} aria-hidden="true" />
          <button
            type="button"
            className={`${styles.segment} ${activePanel === 'when' ? styles.segmentActive : ''}`}
            onClick={() => setActivePanel(activePanel === 'when' ? null : 'when')}
          >
            <span>When</span>
            <p>{whenLabel}</p>
          </button>
          <span className={styles.searchDivider} aria-hidden="true" />
          <button
            type="button"
            className={`${styles.segment} ${activePanel === 'who' ? styles.segmentActive : ''}`}
            onClick={() => setActivePanel(activePanel === 'who' ? null : 'who')}
          >
            <span>Who</span>
            <p>{audienceLabel}</p>
          </button>
          <button type="button" className={styles.searchButton} aria-label="Search classes" onClick={() => setActivePanel(null)}>
            <Search size={18} />
          </button>
        </div>

        {activePanel === 'search' && (
          <div className={`${styles.dropdown} ${styles.dropdownLeft}`}>
            <p className={styles.dropdownLabel}>Suggested searches</p>
            {suggestions.length ? suggestions.map((title) => (
              <button type="button" key={title} className={styles.suggestionRow} onClick={() => { setQuery(title); setActivePanel(null); }}>
                <span className={styles.suggestionIcon}><Sparkles size={16} /></span>
                <span>
                  <strong>{title}</strong>
                  <p>Search for this experience</p>
                </span>
              </button>
            )) : <p className={styles.dropdownEmpty}>Start typing to search experiences.</p>}
          </div>
        )}

        {activePanel === 'when' && (
          <div className={`${styles.dropdown} ${styles.dropdownCenter}`}>
            <p className={styles.dropdownLabel}>When would you like to go?</p>
            <div className={styles.chipRow}>
              {whenOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`${styles.chip} ${when === option.value ? styles.chipActive : ''}`}
                  onClick={() => { setWhen(option.value); setActivePanel(null); }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activePanel === 'who' && (
          <div className={`${styles.dropdown} ${styles.dropdownRight}`}>
            <p className={styles.dropdownLabel}>Who&apos;s this experience for?</p>
            {audienceOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`${styles.suggestionRow} ${audience === option.value ? styles.suggestionRowActive : ''}`}
                  onClick={() => { setAudience(option.value); setActivePanel(null); }}
                >
                  <span className={styles.suggestionIcon}><Icon size={16} /></span>
                  <span>
                    <strong>{option.label}</strong>
                    <p>{option.description}</p>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
    <section className={styles.content}>
      {!filteredEvents.length ? (
        <div className={styles.empty}>
          <Search size={25} />
          <h3>No experiences match that search.</h3>
          <p>Try another search or choose any date.</p>
          <button type="button" onClick={() => { setQuery(''); setWhen('all'); setAudience('all'); }}>Clear search</button>
        </div>
      ) : rows.map(([location, locationEvents]) => (
        <EventRow title={`Upcoming at ${location}`} events={locationEvents} key={location} />
      ))}
    </section>
  </main>;
}
