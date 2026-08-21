'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

const emptyAttendee = () => ({ first_name: '', last_name: '', phone: '', waiver_accepted: false });
type Attendee = ReturnType<typeof emptyAttendee>;
type EventRecord = { id: string; starts_at: string; capacity: number; price: number; classes: { name: string; description: string | null } | null; locations: { name: string; city: string } | null };

export default function RegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [email, setEmail] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([emptyAttendee()]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.from('events').select('id, starts_at, capacity, price, classes(name, description), locations(name, city)').eq('id', id).eq('status', 'published').single().then(({ data }) => { setEvent(data as EventRecord | null); setNotFound(!data); });
    const saved = sessionStorage.getItem(`registration_${id}`);
    if (saved) try {
      const draft = JSON.parse(saved) as { email?: string; attendees?: Attendee[] };
      setEmail(draft.email || ''); setAttendees(draft.attendees?.length ? draft.attendees : [emptyAttendee()]);
    } catch { sessionStorage.removeItem(`registration_${id}`); }
    const callbackError = sessionStorage.getItem('registration_error');
    const callbackSuccess = sessionStorage.getItem('registration_complete');
    if (callbackError) { setMessage(callbackError); sessionStorage.removeItem('registration_error'); }
    if (callbackSuccess) { setMessage(callbackSuccess); sessionStorage.removeItem('registration_complete'); }
  }, [id, supabase]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((remaining) => Math.max(0, remaining - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  function updateAttendee(index: number, field: keyof Attendee, value: string | boolean) {
    setAttendees((current) => current.map((attendee, attendeeIndex) => attendeeIndex === index ? { ...attendee, [field]: value } : attendee));
  }

  async function beginRegistration(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!supabase) return setMessage('Registration is not configured yet.');
    if (cooldown > 0) {
      setMessage(`Please wait ${cooldown} seconds before requesting another email.`);
      return;
    }
    setLoading(true); setMessage('');
    const { data: intentId, error: intentError } = await supabase.rpc('begin_registration', { requested_event_id: id, requested_email: email, requested_attendees: attendees });
    if (intentError) {
      setMessage(intentError.message.includes('begin_registration') ? 'Registration setup is incomplete. The site administrator needs to run the latest Supabase registration migration.' : intentError.message);
      setLoading(false);
      return;
    }
    const destination = `/events/${id}?registration=${intentId}`;
    sessionStorage.setItem(`registration_${id}`, JSON.stringify({ email, attendees }));
    const { error: emailError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?intent=${intentId}&next=${encodeURIComponent(destination)}` } });
    if (!emailError) setCooldown(60);
    setMessage(emailError?.message.includes('rate limit') ? 'Too many email requests. Wait a few minutes, then try once. Check your spam folder before requesting another link.' : emailError ? emailError.message : 'Check your email. Open the secure link on any device to finish your registration.');
    setLoading(false);
  }

  if (notFound) return <main className="registration-page"><h1>Class not found</h1><Link href="/#events">Back to events</Link></main>;
  if (!event) return <main className="registration-page">Loading class...</main>;
  return <main className="registration-page">
    <div className="registration-card">
      <Link href="/#events" className="registration-back">Back to events</Link>
      <p className="registration-kicker">Reserve your seats</p>
      <h1>{event.classes?.name || 'Paint class'}</h1>
      <p className="registration-summary">{new Date(event.starts_at).toLocaleString()} · {event.locations?.name}, {event.locations?.city}</p>
      <p>{event.classes?.description || 'Join us for a guided creative experience.'}</p>
      <p className="registration-price">${Number(event.price).toFixed(2)} per person</p>
      <form onSubmit={beginRegistration} className="registration-form">
        <div className="registration-section"><h2>Your email</h2><p>We will send a secure sign-in link here. No password required.</p><label>Email address<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label></div>
        <div className="registration-section"><div className="registration-section-heading"><div><h2>Who is attending?</h2><p>Add every person who will participate.</p></div><span>{attendees.length} {attendees.length === 1 ? 'person' : 'people'}</span></div>
          {attendees.map((attendee, index) => <fieldset key={index} className="attendee-fields"><legend>Person {index + 1}</legend>{index > 0 && <button type="button" className="remove-attendee" onClick={() => setAttendees((current) => current.filter((_, attendeeIndex) => attendeeIndex !== index))}>Remove person</button>}<div className="attendee-grid"><label>First name<input required value={attendee.first_name} onChange={(e) => updateAttendee(index, 'first_name', e.target.value)} /></label><label>Last name<input required value={attendee.last_name} onChange={(e) => updateAttendee(index, 'last_name', e.target.value)} /></label></div><label>Phone number<input required type="tel" autoComplete="tel" value={attendee.phone} onChange={(e) => updateAttendee(index, 'phone', e.target.value)} /></label><label className="waiver-check"><input required type="checkbox" checked={attendee.waiver_accepted} onChange={(e) => updateAttendee(index, 'waiver_accepted', e.target.checked)} /><span>I agree to the participant waiver for this person.</span></label></fieldset>)}
          {attendees.length < Math.min(event.capacity, 12) && <button type="button" className="secondary-button" onClick={() => setAttendees((current) => [...current, emptyAttendee()])}>+ Add another person</button>}
        </div>
        <button disabled={loading || cooldown > 0} className="primary-button" type="submit">{loading ? 'Sending secure link...' : cooldown > 0 ? `Email sent - wait ${cooldown}s` : 'Continue with email verification'}</button>
      </form>
      {message && <p role="status" className="registration-message">{message}</p>}
    </div>
  </main>;
}
