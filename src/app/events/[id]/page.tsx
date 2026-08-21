'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

const emptyAttendee = () => ({ first_name: '', last_name: '', phone: '', waiver_accepted: false });
type Attendee = ReturnType<typeof emptyAttendee>;
type EventRecord = { id: string; starts_at: string; capacity: number; price: number; classes: { name: string; description: string | null } | null; locations: { name: string; city: string } | null };

type Step = 1 | 2 | 3 | 4 | 5;

export default function RegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [purchaser, setPurchaser] = useState({ first_name: '', last_name: '', phone: '' });
  const [attendees, setAttendees] = useState<Attendee[]>([emptyAttendee()]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.from('events').select('id, starts_at, capacity, price, classes(name, description), locations(name, city)').eq('id', id).eq('status', 'published').single().then(({ data }) => { setEvent(data as EventRecord | null); setNotFound(!data); });
    const saved = sessionStorage.getItem(`registration_${id}`);
    if (saved) try {
      const draft = JSON.parse(saved) as { email?: string; purchaser?: typeof purchaser; attendees?: Attendee[] };
      setEmail(draft.email || ''); setPurchaser(draft.purchaser || { first_name: '', last_name: '', phone: '' }); setAttendees(draft.attendees?.length ? draft.attendees : [emptyAttendee()]);
    } catch { sessionStorage.removeItem(`registration_${id}`); }
    const paymentStatus = new URLSearchParams(window.location.search).get('payment');
    if (paymentStatus === 'success') { setStep(5); setMessage('Payment submitted. Your confirmation will appear after Stripe verifies the payment.'); }
    if (paymentStatus === 'cancelled') { setMessage('Payment was cancelled. Your pending reservation is still available while you return to checkout.'); }
  }, [id, supabase]);

  function updateAttendee(index: number, field: keyof Attendee, value: string | boolean) {
    setAttendees((current) => current.map((attendee, attendeeIndex) => attendeeIndex === index ? { ...attendee, [field]: value } : attendee));
  }

  async function startPayment() {
    if (!supabase || !bookingId) return setMessage('Your reservation is missing. Please start again.');
    setPaymentLoading(true); setMessage('');
    const { data: sessionData } = await supabase.auth.getSession();
    const response = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionData.session?.access_token || ''}` }, body: JSON.stringify({ bookingId }) });
    const result = await response.json() as { url?: string; error?: string };
    if (result.url) window.location.href = result.url;
    else { setMessage(result.error || 'Could not start payment.'); setPaymentLoading(false); }
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

  async function authenticateCustomer() {
    if (!supabase) return false;
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInError && signInData.session) return true;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError || !signUpData.session) {
      setMessage(signUpError?.message.includes('already registered') ? 'This email already has an account. Check the password and try again.' : signUpError?.message || 'Account created, but email confirmation is required before continuing.');
      return false;
    }
    return true;
  }

  async function completeRegistration(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!supabase) return setMessage('Registration is not configured yet.');
    setLoading(true); setMessage('');
    if (!await authenticateCustomer()) { setLoading(false); return; }
    if (!purchaser.first_name.trim() || !purchaser.last_name.trim() || !purchaser.phone.trim()) { setMessage('Enter the purchaser name and phone number first.'); setLoading(false); return; }
    const requestedAttendees = attendees.map((attendee, index) => index === 0 ? { ...attendee, ...purchaser } : attendee);
    const { data: intentId, error: intentError } = await supabase.rpc('begin_registration', { requested_event_id: id, requested_email: email, requested_attendees: requestedAttendees });
    if (intentError) { setMessage(intentError.message.includes('begin_registration') ? 'Registration setup is incomplete. The latest Supabase migration must be run.' : intentError.message); setLoading(false); return; }
    const { data: newBookingId, error: completeError } = await supabase.rpc('complete_registration', { requested_intent_id: intentId });
    if (completeError) { setMessage(completeError.message); setLoading(false); return; }
    sessionStorage.removeItem(`registration_${id}`); setBookingId(newBookingId); setStep(5); setMessage('Your seats are held. Complete payment to confirm the registration.'); setLoading(false);
  }

  if (notFound) return <main className="registration-page"><h1>Class not found</h1><Link href="/#events">Back to events</Link></main>;
  if (!event) return <main className="registration-page">Loading class...</main>;
  return <main className="registration-page"><div className="registration-card">
    <Link href="/#events" className="registration-back">Back to events</Link>
    <p className="registration-kicker">Step {step} of 5</p>
    <h1>{event.classes?.name || 'Paint class'}</h1>
    <p className="registration-summary">{new Date(event.starts_at).toLocaleString()} · {event.locations?.name}, {event.locations?.city}</p>
    <p className="registration-price">${Number(event.price).toFixed(2)} per person</p>
    <div className="registration-progress" aria-label={`Registration step ${step} of 5`}><span className={step >= 1 ? 'active' : ''} /><span className={step >= 2 ? 'active' : ''} /><span className={step >= 3 ? 'active' : ''} /><span className={step >= 4 ? 'active' : ''} /><span className={step >= 5 ? 'active' : ''} /></div>
    {step === 1 && <form onSubmit={async (formEvent) => { formEvent.preventDefault(); setLoading(true); setMessage(''); if (await authenticateCustomer()) setStep(2); setLoading(false); }} className="registration-form"><div className="registration-section"><h2>1. Find your account</h2><p>Enter your email and password. Existing customers go straight to registration; new customers are created automatically.</p><label>Email address<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input required type="password" minLength={8} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label><p className="registration-help">Use at least 8 characters. Your account keeps your registration history together.</p></div><button disabled={loading} className="primary-button" type="submit">{loading ? 'Checking account...' : 'Find account and continue'}</button></form>}
    {step === 2 && <form onSubmit={(formEvent) => { formEvent.preventDefault(); setMessage(''); setStep(3); }} className="registration-form"><div className="registration-section"><h2>2. Who is registering?</h2><p>This is the primary contact and account holder for the reservation.</p><div className="attendee-grid"><label>First name<input required autoComplete="given-name" value={purchaser.first_name} onChange={(e) => setPurchaser({ ...purchaser, first_name: e.target.value })} /></label><label>Last name<input required autoComplete="family-name" value={purchaser.last_name} onChange={(e) => setPurchaser({ ...purchaser, last_name: e.target.value })} /></label></div><label>Phone number<input required type="tel" autoComplete="tel" value={purchaser.phone} onChange={(e) => setPurchaser({ ...purchaser, phone: e.target.value })} /></label><p className="registration-help">Account email: {email}</p></div><div className="registration-actions"><button type="button" className="secondary-button" onClick={() => setStep(1)}>Back</button><button className="primary-button" type="submit">Continue to attendees</button></div></form>}
    {step === 3 && <form onSubmit={(formEvent) => { formEvent.preventDefault(); setMessage(''); setStep(4); }} className="registration-form"><div className="registration-section"><div className="registration-section-heading"><div><h2>3. Add attendees</h2><p>Add each person separately. The purchaser is included as person 1.</p></div><span>{attendees.length} {attendees.length === 1 ? 'person' : 'people'}</span></div>{attendees.map((attendee, index) => <fieldset key={index} className="attendee-fields"><legend>Person {index + 1}{index === 0 ? ' - purchaser' : ''}</legend>{index > 0 && <button type="button" className="remove-attendee" onClick={() => setAttendees((current) => current.filter((_, attendeeIndex) => attendeeIndex !== index))}>Remove person</button>}<div className="attendee-grid"><label>First name<input required value={index === 0 ? purchaser.first_name : attendee.first_name} disabled={index === 0} onChange={(e) => updateAttendee(index, 'first_name', e.target.value)} /></label><label>Last name<input required value={index === 0 ? purchaser.last_name : attendee.last_name} disabled={index === 0} onChange={(e) => updateAttendee(index, 'last_name', e.target.value)} /></label></div>{index > 0 && <label>Phone number<input required type="tel" value={attendee.phone} onChange={(e) => updateAttendee(index, 'phone', e.target.value)} /></label>}</fieldset>)}{attendees.length < Math.min(event.capacity, 12) && <button type="button" className="secondary-button" onClick={() => setAttendees((current) => [...current, emptyAttendee()])}>+ Add another person</button>}</div><div className="registration-actions"><button type="button" className="secondary-button" onClick={() => setStep(2)}>Back</button><button className="primary-button" type="submit">Continue to waivers</button></div></form>}
    {step === 4 && <form onSubmit={(formEvent) => { formEvent.preventDefault(); if (validateAttendees()) completeRegistration(formEvent); }} className="registration-form"><div className="registration-section"><h2>4. Waivers</h2><p>Each participant must accept the waiver before the reservation can be submitted.</p>{attendees.map((attendee, index) => <label key={index} className="waiver-check"><input required type="checkbox" checked={attendee.waiver_accepted} onChange={(e) => updateAttendee(index, 'waiver_accepted', e.target.checked)} /><span><strong>{index === 0 ? `${purchaser.first_name} ${purchaser.last_name}` : `${attendee.first_name} ${attendee.last_name}`}</strong> accepts the participant waiver.</span></label>)}</div><div className="registration-actions"><button type="button" className="secondary-button" onClick={() => setStep(3)}>Back</button><button disabled={loading} className="primary-button" type="submit">{loading ? 'Holding seats...' : 'Continue to payment'}</button></div></form>}
    {step === 5 && <div className="registration-success"><h2>5. Payment</h2><p>Your seats are held as a pending reservation. Secure Stripe checkout will change this reservation to confirmed after payment.</p><button className="primary-button" type="button" disabled={paymentLoading} onClick={startPayment}>{paymentLoading ? 'Opening secure checkout...' : `Pay $${Number(event.price * attendees.length).toFixed(2)}`}</button><Link className="secondary-button" href="/#events">Return to events</Link></div>}
    {message && <p role="status" className="registration-message">{message}</p>}
  </div></main>;
}
