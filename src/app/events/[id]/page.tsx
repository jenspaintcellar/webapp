'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

const emptyAttendee = () => ({ first_name: '', last_name: '', phone: '', waiver_accepted: false });
type Attendee = ReturnType<typeof emptyAttendee>;
type EventRecord = { id: string; starts_at: string; capacity: number; price: number; classes: { name: string; description: string | null } | null; locations: { name: string; city: string } | null };

type Step = 1 | 2 | 3 | 4;

export default function RegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([emptyAttendee()]);
  const [code, setCode] = useState('');
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
  }, [id, supabase]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((remaining) => Math.max(0, remaining - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  function updateAttendee(index: number, field: keyof Attendee, value: string | boolean) {
    setAttendees((current) => current.map((attendee, attendeeIndex) => attendeeIndex === index ? { ...attendee, [field]: value } : attendee));
  }

  function validateAttendees() {
    if (attendees.some((attendee) => !attendee.first_name.trim() || !attendee.last_name.trim() || !attendee.phone.trim())) {
      setMessage('Please complete the name and phone number for every person.'); return false;
    }
    if (attendees.some((attendee) => !attendee.waiver_accepted)) {
      setMessage('Each person must accept the participant waiver before continuing.'); return false;
    }
    return true;
  }

  async function requestCode(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!supabase) return setMessage('Registration is not configured yet.');
    if (cooldown > 0) return setMessage(`Please wait ${cooldown} seconds before requesting another code.`);
    setLoading(true); setMessage('');
    const { data: intentId, error: intentError } = await supabase.rpc('begin_registration', { requested_event_id: id, requested_email: email, requested_attendees: attendees });
    if (intentError) { setMessage(intentError.message.includes('begin_registration') ? 'Registration setup is incomplete. The latest Supabase migration must be run.' : intentError.message); setLoading(false); return; }
    sessionStorage.setItem(`registration_${id}`, JSON.stringify({ email, attendees, intentId }));
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) { setMessage(error.message.includes('rate limit') ? 'Too many requests. Wait a few minutes, then try again once.' : error.message); setLoading(false); return; }
    setCooldown(60); setStep(3); setMessage('We sent a 6-digit verification code. Enter it below.'); setLoading(false);
  }

  async function verifyCode(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!supabase) return;
    setLoading(true); setMessage('');
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'email' });
    if (verifyError) { setMessage('That code is invalid or expired. Request a new code and try again.'); setLoading(false); return; }
    const saved = sessionStorage.getItem(`registration_${id}`);
    const intentId = saved ? (JSON.parse(saved) as { intentId?: string }).intentId : undefined;
    if (!intentId) { setMessage('Your registration expired. Please start again.'); setLoading(false); return; }
    const { error: completeError } = await supabase.rpc('complete_registration', { requested_intent_id: intentId });
    if (completeError) { setMessage(completeError.message); setLoading(false); return; }
    sessionStorage.removeItem(`registration_${id}`); setStep(4); setMessage('Your registration is confirmed.'); setLoading(false);
  }

  if (notFound) return <main className="registration-page"><h1>Class not found</h1><Link href="/#events">Back to events</Link></main>;
  if (!event) return <main className="registration-page">Loading class...</main>;
  return <main className="registration-page"><div className="registration-card">
    <Link href="/#events" className="registration-back">Back to events</Link>
    <p className="registration-kicker">Step {step} of 4</p>
    <h1>{event.classes?.name || 'Paint class'}</h1>
    <p className="registration-summary">{new Date(event.starts_at).toLocaleString()} · {event.locations?.name}, {event.locations?.city}</p>
    <p className="registration-price">${Number(event.price).toFixed(2)} per person</p>
    <div className="registration-progress" aria-label={`Registration step ${step} of 4`}><span className={step >= 1 ? 'active' : ''} /><span className={step >= 2 ? 'active' : ''} /><span className={step >= 3 ? 'active' : ''} /><span className={step >= 4 ? 'active' : ''} /></div>
    {step === 1 && <form onSubmit={(formEvent) => { formEvent.preventDefault(); setMessage(''); setStep(2); }} className="registration-form"><div className="registration-section"><h2>Find your account</h2><p>Use your email to find an existing customer record or create one automatically.</p><label>Email address<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label></div><button className="primary-button" type="submit">Continue</button></form>}
    {step === 2 && <form onSubmit={(formEvent) => { formEvent.preventDefault(); if (validateAttendees()) requestCode(formEvent); }} className="registration-form"><div className="registration-section"><div className="registration-section-heading"><div><h2>Who is attending?</h2><p>Add each person separately. Each person accepts their own waiver.</p></div><span>{attendees.length} {attendees.length === 1 ? 'person' : 'people'}</span></div>{attendees.map((attendee, index) => <fieldset key={index} className="attendee-fields"><legend>Person {index + 1}</legend>{index > 0 && <button type="button" className="remove-attendee" onClick={() => setAttendees((current) => current.filter((_, attendeeIndex) => attendeeIndex !== index))}>Remove person</button>}<div className="attendee-grid"><label>First name<input required value={attendee.first_name} onChange={(e) => updateAttendee(index, 'first_name', e.target.value)} /></label><label>Last name<input required value={attendee.last_name} onChange={(e) => updateAttendee(index, 'last_name', e.target.value)} /></label></div><label>Phone number<input required type="tel" autoComplete="tel" value={attendee.phone} onChange={(e) => updateAttendee(index, 'phone', e.target.value)} /></label><label className="waiver-check"><input required type="checkbox" checked={attendee.waiver_accepted} onChange={(e) => updateAttendee(index, 'waiver_accepted', e.target.checked)} /><span>I agree to the participant waiver for this person.</span></label></fieldset>)}{attendees.length < Math.min(event.capacity, 12) && <button type="button" className="secondary-button" onClick={() => setAttendees((current) => [...current, emptyAttendee()])}>+ Add another person</button>}</div><div className="registration-actions"><button type="button" className="secondary-button" onClick={() => setStep(1)}>Back</button><button disabled={loading} className="primary-button" type="submit">{loading ? 'Saving...' : 'Continue'}</button></div></form>}
    {step === 3 && <form onSubmit={verifyCode} className="registration-form"><div className="registration-section"><h2>Verify your email</h2><p>Enter the 6-digit code sent to <strong>{email}</strong>. This works on any device and does not require a password.</p><label>Verification code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} /></label></div><div className="registration-actions"><button type="button" className="secondary-button" onClick={() => setStep(2)}>Back</button><button disabled={loading} className="primary-button" type="submit">{loading ? 'Verifying...' : 'Verify and confirm'}</button></div><p className="registration-help">{cooldown > 0 ? `You can request another code in ${cooldown}s.` : 'Need another code? Go back and continue again.'}</p></form>}
    {step === 4 && <div className="registration-success"><h2>Registration confirmed</h2><p>You are registered for this class. Payment checkout will be the next step once Stripe is connected.</p><Link className="primary-button" href="/#events">Return to events</Link></div>}
    {message && <p role="status" className="registration-message">{message}</p>}
  </div></main>;
}
