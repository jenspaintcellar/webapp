'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

type EventRecord = {
  id: string;
  starts_at: string;
  capacity: number;
  price: number;
  classes: { name: string; description: string | null } | null;
  locations: { name: string; city: string } | null;
};

export default function RegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [guestCount, setGuestCount] = useState('1');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.from('events').select('id, starts_at, capacity, price, classes(name, description), locations(name, city)').eq('id', id).eq('status', 'published').single().then(({ data }) => { setEvent(data as EventRecord | null); setNotFound(!data); });
    const saved = sessionStorage.getItem(`registration_${id}`);
    if (saved) try {
      const draft = JSON.parse(saved) as { firstName?: string; lastName?: string; phone?: string; email?: string; guestCount?: string };
      setFirstName(draft.firstName || ''); setLastName(draft.lastName || ''); setPhone(draft.phone || ''); setEmail(draft.email || ''); setGuestCount(draft.guestCount || '1');
    } catch { sessionStorage.removeItem(`registration_${id}`); }
  }, [id, supabase]);

  async function register(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!supabase) return setMessage('Registration is not configured yet.');
    setLoading(true);
    setMessage('');
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      sessionStorage.setItem('registration_destination', `/events/${id}`);
      sessionStorage.setItem(`registration_${id}`, JSON.stringify({ firstName, lastName, phone, email, guestCount }));
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      setMessage(error ? error.message : 'Check your email for a secure sign-in link, then return here to finish registration.');
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setMessage('Please sign in again.');
      setLoading(false);
      return;
    }
    const { error: profileError } = await supabase.from('profiles').upsert({ id: userData.user.id, email, first_name: firstName, last_name: lastName, phone, role: 'customer' }, { onConflict: 'id' });
    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }
    const { error } = await supabase.rpc('create_pending_booking', { requested_event_id: id, requested_guest_count: Number(guestCount) });
    setMessage(error ? error.message : 'Registration saved. We will send payment instructions shortly.');
    if (!error) sessionStorage.removeItem(`registration_${id}`);
    setLoading(false);
  }

  if (notFound) return <main style={{ padding: '8rem 2rem', textAlign: 'center' }}><h1>Class not found</h1><Link href="/#events">Back to events</Link></main>;
  if (!event) return <main style={{ padding: '8rem 2rem', textAlign: 'center' }}>Loading class...</main>;
  return <main style={{ maxWidth: 720, margin: '0 auto', padding: '8rem 2rem' }}>
    <Link href="/#events">Back to events</Link>
    <h1 style={{ marginTop: '2rem' }}>{event.classes?.name || 'Paint class'}</h1>
    <p>{event.classes?.description}</p>
    <p>{new Date(event.starts_at).toLocaleString()} · {event.locations?.name}, {event.locations?.city}</p>
    <p>${Number(event.price).toFixed(2)} per guest</p>
    <form onSubmit={register} style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
      <label>First name<input required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label>
      <label>Last name<input required value={lastName} onChange={(e) => setLastName(e.target.value)} /></label>
      <label>Phone<input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
      <label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Guests<select value={guestCount} onChange={(e) => setGuestCount(e.target.value)}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select></label>
      <button disabled={loading} type="submit">{loading ? 'Processing...' : 'Continue registration'}</button>
    </form>
    {message && <p role="status" style={{ marginTop: '1rem' }}>{message}</p>}
  </main>;
}