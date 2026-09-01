'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

const emptyAttendee = () => ({ first_name: '', last_name: '', phone: '', birth_date: '', emergency_contact_name: '', emergency_contact_phone: '', waiver_accepted: false });
type Attendee = ReturnType<typeof emptyAttendee>;
type EventRecord = { id: string; starts_at: string; capacity: number; price: number; classes: { name: string; description: string | null } | null; locations: { name: string; city: string } | null };
type Step = 1 | 2 | 3 | 4;

export default function RegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([emptyAttendee()]);
  const [sameEmergencyContact, setSameEmergencyContact] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const paymentResult = searchParams.get('payment');
  const supabase = getSupabaseClient();

  useEffect(() => { if (!supabase) return; supabase.from('events').select('id, starts_at, capacity, price, classes(name, description), locations(name, city)').eq('id', id).eq('status', 'published').single().then(({ data }) => { setEvent(data as EventRecord | null); setNotFound(!data); }); }, [id, supabase]);
  useEffect(() => { if (paymentResult) setStep(4); }, [paymentResult]);
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (paymentResult !== 'success' || !sessionId) return;
    setConfirming(true);
    fetch('/api/stripe/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) })
      .then((response) => response.json())
      .then((result: { confirmed?: boolean; error?: string }) => { if (!result.confirmed && result.error) setConfirmError(result.error); })
      .finally(() => setConfirming(false));
  }, [paymentResult, searchParams]);
  function updateAttendee(index: number, field: keyof Attendee, value: string | boolean) { setAttendees((current) => current.map((attendee, attendeeIndex) => { if (attendeeIndex === index) return { ...attendee, [field]: value }; if (sameEmergencyContact && index === 0 && (field === 'emergency_contact_name' || field === 'emergency_contact_phone')) return { ...attendee, [field]: value }; return attendee; })); }
  function validateBasics() { if (!email.trim() || attendees.some((attendee) => !attendee.first_name.trim() || !attendee.last_name.trim() || !attendee.phone.trim() || !attendee.birth_date)) { setMessage('Enter your email and complete every attendee name, phone, and birthday.'); return false; } return true; }
  function validateEmergency() { const contactsToCheck = sameEmergencyContact ? attendees.slice(0, 1) : attendees; if (contactsToCheck.some((attendee) => !attendee.emergency_contact_name.trim() || !attendee.emergency_contact_phone.trim())) { setMessage('Complete the shared emergency contact before continuing.'); return false; } if (sameEmergencyContact && attendees[0]) { const contact = { emergency_contact_name: attendees[0].emergency_contact_name, emergency_contact_phone: attendees[0].emergency_contact_phone }; setAttendees((current) => current.map((attendee) => ({ ...attendee, ...contact }))); } return true; }
  async function goToPayment() {
    if (attendees.some((attendee) => !attendee.waiver_accepted)) { setMessage('Each attendee must accept the waiver.'); return; }
    setPaymentLoading(true); setMessage('');
    const registrationAttendees = sameEmergencyContact ? attendees.map((attendee) => ({ ...attendee, emergency_contact_name: attendees[0].emergency_contact_name, emergency_contact_phone: attendees[0].emergency_contact_phone })) : attendees;
    const response = await fetch('/api/registration/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: id, email, attendees: registrationAttendees }) });
    const result = await response.json() as { url?: string; error?: string };
    if (!response.ok || !result.url) { setMessage(result.error || 'Could not start secure payment.'); setPaymentLoading(false); return; }
    window.location.href = result.url;
  }

  if (notFound) return <main className="registration-page"><h1>Class not found</h1><Link href="/#events">Back to events</Link></main>;
  if (!event) return <main className="registration-page">Loading class...</main>;
  const totalPrice = (Number(event.price) * attendees.length).toFixed(2);
  return <main className="registration-page"><div className="registration-card"><Link href="/#events" className="registration-back">Back to events</Link><p className="registration-kicker">{paymentResult ? 'Payment' : `Step ${step} of 3`}</p><h1>{event.classes?.name || 'Paint class'}</h1><p className="registration-summary">{new Date(event.starts_at).toLocaleString()} · {event.locations?.name}, {event.locations?.city}</p><p className="registration-price">${Number(event.price).toFixed(2)} per person · {attendees.length} {attendees.length === 1 ? 'person' : 'people'} · ${totalPrice} total</p>{!paymentResult && <div className="registration-progress" aria-label={`Registration step ${step} of 3`}><span className={step >= 1 ? 'active' : ''} /><span className={step >= 2 ? 'active' : ''} /><span className={step >= 3 ? 'active' : ''} /></div>}
    {!paymentResult && <p className="registration-help">Nothing is booked until payment is complete &mdash; seats are not held in advance.</p>}
    {step === 1 && <form className="registration-form" onSubmit={(e) => { e.preventDefault(); if (validateBasics()) setStep(2); }}><div className="registration-section"><h2>1. Who is attending?</h2><p>Enter the reservation email and add every participant with their name and birthday. The price is per person.</p><label>Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>{attendees.map((attendee, index) => <fieldset className="attendee-fields" key={index}><legend>Person {index + 1}</legend>{index > 0 && <button type="button" className="remove-attendee" onClick={() => setAttendees((current) => current.filter((_, attendeeIndex) => attendeeIndex !== index))}>Remove person</button>}<div className="attendee-grid"><label>First name<input required value={attendee.first_name} onChange={(e) => updateAttendee(index, 'first_name', e.target.value)} /></label><label>Last name<input required value={attendee.last_name} onChange={(e) => updateAttendee(index, 'last_name', e.target.value)} /></label></div><label>Phone<input required type="tel" value={attendee.phone} onChange={(e) => updateAttendee(index, 'phone', e.target.value)} /></label><label>Birthday<input required type="date" value={attendee.birth_date} onChange={(e) => updateAttendee(index, 'birth_date', e.target.value)} /></label></fieldset>)}{attendees.length < Math.min(event.capacity, 12) && <button type="button" className="secondary-button" onClick={() => setAttendees((current) => [...current, emptyAttendee()])}>+ Add another person (${Number(event.price).toFixed(2)} more)</button>}</div><button className="primary-button" type="submit">Continue</button></form>}
    {step === 2 && <form className="registration-form" onSubmit={(e) => { e.preventDefault(); if (validateEmergency()) setStep(3); }}><div className="registration-section"><h2>2. Emergency contact</h2><p>Add a contact for each participant, or use one contact for everyone.</p><label className="waiver-check"><input type="checkbox" checked={sameEmergencyContact} onChange={(e) => setSameEmergencyContact(e.target.checked)} /><span>Use the same emergency contact for everyone</span></label>{attendees.map((attendee, index) => <fieldset className="attendee-fields" key={index}><legend>{attendee.first_name} {attendee.last_name}</legend>{sameEmergencyContact && index > 0 ? <p className="registration-help">Using the first person&apos;s emergency contact.</p> : <div className="attendee-grid"><label>Contact name<input required value={attendee.emergency_contact_name} onChange={(e) => updateAttendee(index, 'emergency_contact_name', e.target.value)} /></label><label>Contact phone<input required type="tel" value={attendee.emergency_contact_phone} onChange={(e) => updateAttendee(index, 'emergency_contact_phone', e.target.value)} /></label></div>}</fieldset>)}</div><div className="registration-actions"><button type="button" className="secondary-button" onClick={() => setStep(1)}>Back</button><button className="primary-button" type="submit">Continue</button></div></form>}
    {step === 3 && <form className="registration-form" onSubmit={(e) => { e.preventDefault(); goToPayment(); }}><div className="registration-section"><h2>3. Waiver & payment</h2><p>Each participant must accept the waiver. You&apos;ll be redirected to Stripe&apos;s secure checkout to pay ${totalPrice} for {attendees.length} {attendees.length === 1 ? 'person' : 'people'}. Nothing is saved unless payment succeeds.</p>{attendees.map((attendee, index) => <label className="waiver-check" key={index}><input required type="checkbox" checked={attendee.waiver_accepted} onChange={(e) => updateAttendee(index, 'waiver_accepted', e.target.checked)} /><span><strong>{attendee.first_name} {attendee.last_name}</strong> accepts the participant waiver.</span></label>)}</div><div className="registration-actions"><button type="button" className="secondary-button" onClick={() => setStep(2)} disabled={paymentLoading}>Back</button><button className="primary-button" type="submit" disabled={paymentLoading}>{paymentLoading ? 'Redirecting to payment...' : `Pay $${totalPrice} with Stripe`}</button></div></form>}
    {paymentResult === 'success' && <div className="registration-success"><h2>{confirming ? 'Confirming your payment...' : confirmError ? 'Payment received, but...' : 'Payment received'}</h2><p>{confirming ? 'Please wait a moment while we confirm your reservation.' : confirmError || 'Thank you! Your reservation is confirmed. A confirmation email will follow shortly.'}</p>{!confirming && <Link className="secondary-button" href="/#events">Return to events</Link>}</div>}
    {paymentResult === 'cancelled' && <div className="registration-success"><h2>Payment not completed</h2><p>Nothing was booked or charged. You can go back and try again whenever you&apos;re ready.</p><button className="primary-button" type="button" onClick={() => { setStep(3); window.history.replaceState(null, '', `/events/${id}`); }}>Try again</button></div>}
    {message && <p role="status" className="registration-message">{message}</p>}</div></main>;
}
