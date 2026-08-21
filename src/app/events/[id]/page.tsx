'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

const emptyAttendee = () => ({ first_name: '', last_name: '', phone: '', age: '', emergency_contact_name: '', emergency_contact_phone: '', waiver_accepted: false });
type Attendee = ReturnType<typeof emptyAttendee>;
type EventRecord = { id: string; starts_at: string; capacity: number; price: number; classes: { name: string; description: string | null } | null; locations: { name: string; city: string } | null };
type Step = 1 | 2 | 3 | 4 | 5;
type Customer = { id: string; first_name: string; last_name: string; phone: string | null };

export default function RegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
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
  }, [id, supabase]);

  function updateAttendee(index: number, field: keyof Attendee, value: string | boolean) {
    setAttendees((current) => current.map((attendee, attendeeIndex) => attendeeIndex === index ? { ...attendee, [field]: value } : attendee));
  }

  async function lookupCustomer(formEvent: FormEvent) {
    formEvent.preventDefault(); setLoading(true); setMessage('');
    const response = await fetch('/api/registration/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const result = await response.json() as { customerId?: string; existing?: boolean; profile?: { first_name: string; last_name: string; phone: string | null }; error?: string };
    if (!response.ok || !result.customerId || !result.profile) { setMessage(result.error || 'Could not look up this email.'); setLoading(false); return; }
    setCustomer({ id: result.customerId, first_name: result.profile.first_name || '', last_name: result.profile.last_name || '', phone: result.profile.phone || '' });
    setPurchaser({ first_name: result.profile.first_name || '', last_name: result.profile.last_name || '', phone: result.profile.phone || '' });
    setMessage(result.existing ? 'Existing customer found. We loaded the saved information.' : 'New customer record started. Add the purchaser information below.');
    setStep(2); setLoading(false);
  }

  async function completeRegistration(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!customer) return setMessage('Look up the customer email first.');
    setLoading(true); setMessage('');
    const requestedAttendees = attendees.map((attendee, index) => index === 0 ? { ...attendee, ...purchaser, age: Number(attendee.age) } : { ...attendee, age: Number(attendee.age) });
    const response = await fetch('/api/registration/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId: customer.id, eventId: id, email, attendees: requestedAttendees }) });
    const result = await response.json() as { bookingId?: string; error?: string };
    if (!response.ok || !result.bookingId) { setMessage(result.error || 'Could not create this reservation.'); setLoading(false); return; }
    setBookingId(result.bookingId); setStep(5); setMessage('Your seats are held. Complete payment to confirm the registration.'); setLoading(false);
  }

  async function startPayment() {
    if (!bookingId || !customer) return setMessage('Your reservation is missing. Please start again.');
    setPaymentLoading(true); setMessage('');
    const response = await fetch('/api/registration/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId, customerId: customer.id }) });
    const result = await response.json() as { confirmed?: boolean; error?: string };
    if (result.confirmed) { setMessage('Registration confirmed. Payment is in demo mode for now.'); setPaymentLoading(false); }
    else { setMessage(result.error || 'Could not confirm registration.'); setPaymentLoading(false); }
  }

  function validateAttendees() {
    if (attendees.some((attendee) => !attendee.first_name.trim() || !attendee.last_name.trim() || !attendee.phone.trim() || !attendee.age || !attendee.emergency_contact_name.trim() || !attendee.emergency_contact_phone.trim())) { setMessage('Please complete every attendee name, phone, age, and emergency contact.'); return false; }
    if (attendees.some((attendee) => !attendee.waiver_accepted)) { setMessage('Each attendee must accept the waiver.'); return false; }
    return true;
  }

  if (notFound) return <main className="registration-page"><h1>Class not found</h1><Link href="/#events">Back to events</Link></main>;
  if (!event) return <main className="registration-page">Loading class...</main>;
  return <main className="registration-page"><div className="registration-card">
    <Link href="/#events" className="registration-back">Back to events</Link><p className="registration-kicker">Step {step} of 5</p><h1>{event.classes?.name || 'Paint class'}</h1><p className="registration-summary">{new Date(event.starts_at).toLocaleString()} · {event.locations?.name}, {event.locations?.city}</p><p className="registration-price">${Number(event.price).toFixed(2)} per person</p>
    <div className="registration-progress" aria-label={`Registration step ${step} of 5`}><span className={step >= 1 ? 'active' : ''} /><span className={step >= 2 ? 'active' : ''} /><span className={step >= 3 ? 'active' : ''} /><span className={step >= 4 ? 'active' : ''} /><span className={step >= 5 ? 'active' : ''} /></div>
    {step === 1 && <form onSubmit={lookupCustomer} className="registration-form"><div className="registration-section"><h2>1. Find your customer record</h2><p>Enter an email to load an existing customer or start a new record. No password or email is required.</p><label>Email address<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label></div><button disabled={loading} className="primary-button" type="submit">{loading ? 'Looking up customer...' : 'Find customer'}</button></form>}
    {step === 2 && <form onSubmit={(formEvent) => { formEvent.preventDefault(); if (purchaser.first_name && purchaser.last_name && purchaser.phone) setStep(3); else setMessage('Enter the purchaser name and phone number.'); }} className="registration-form"><div className="registration-section"><h2>2. Who is registering?</h2><p>{customer?.first_name ? 'Existing customer found. Confirm or update the saved information.' : 'Add the person responsible for this reservation.'}</p><div className="attendee-grid"><label>First name<input required autoComplete="given-name" value={purchaser.first_name} onChange={(e) => setPurchaser({ ...purchaser, first_name: e.target.value })} /></label><label>Last name<input required autoComplete="family-name" value={purchaser.last_name} onChange={(e) => setPurchaser({ ...purchaser, last_name: e.target.value })} /></label></div><label>Phone number<input required type="tel" autoComplete="tel" value={purchaser.phone} onChange={(e) => setPurchaser({ ...purchaser, phone: e.target.value })} /></label><p className="registration-help">Email: {email}</p></div><div className="registration-actions"><button type="button" className="secondary-button" onClick={() => setStep(1)}>Back</button><button className="primary-button" type="submit">Continue</button></div></form>}
    {step === 3 && <form onSubmit={(formEvent) => { formEvent.preventDefault(); setStep(4); }} className="registration-form"><div className="registration-section"><div className="registration-section-heading"><div><h2>3. Who is attending?</h2><p>Add each person, including age and an emergency contact.</p></div><span>{attendees.length} {attendees.length === 1 ? 'person' : 'people'}</span></div>{attendees.map((attendee, index) => <fieldset key={index} className="attendee-fields"><legend>Person {index + 1}{index === 0 ? ' - purchaser' : ''}</legend>{index > 0 && <button type="button" className="remove-attendee" onClick={() => setAttendees((current) => current.filter((_, attendeeIndex) => attendeeIndex !== index))}>Remove person</button>}<div className="attendee-grid"><label>First name<input required disabled={index === 0} value={index === 0 ? purchaser.first_name : attendee.first_name} onChange={(e) => updateAttendee(index, 'first_name', e.target.value)} /></label><label>Last name<input required disabled={index === 0} value={index === 0 ? purchaser.last_name : attendee.last_name} onChange={(e) => updateAttendee(index, 'last_name', e.target.value)} /></label></div>{index > 0 && <label>Phone number<input required type="tel" value={attendee.phone} onChange={(e) => updateAttendee(index, 'phone', e.target.value)} /></label>}<label>Age<input required type="number" min="1" max="120" value={attendee.age} onChange={(e) => updateAttendee(index, 'age', e.target.value)} /></label><div className="emergency-contact"><p>Emergency contact</p><div className="attendee-grid"><label>Name<input required value={attendee.emergency_contact_name} onChange={(e) => updateAttendee(index, 'emergency_contact_name', e.target.value)} /></label><label>Phone<input required type="tel" value={attendee.emergency_contact_phone} onChange={(e) => updateAttendee(index, 'emergency_contact_phone', e.target.value)} /></label></div></div></fieldset>)}{attendees.length < Math.min(event.capacity, 12) && <button type="button" className="secondary-button" onClick={() => setAttendees((current) => [...current, emptyAttendee()])}>+ Add another person</button>}</div><div className="registration-actions"><button type="button" className="secondary-button" onClick={() => setStep(2)}>Back</button><button className="primary-button" type="submit">Continue</button></div></form>}
    {step === 4 && <form onSubmit={(formEvent) => { formEvent.preventDefault(); if (validateAttendees()) completeRegistration(formEvent); }} className="registration-form"><div className="registration-section"><h2>4. Waiver for each person</h2><p>Every participant must accept the waiver individually.</p>{attendees.map((attendee, index) => <label key={index} className="waiver-check"><input required type="checkbox" checked={attendee.waiver_accepted} onChange={(e) => updateAttendee(index, 'waiver_accepted', e.target.checked)} /><span><strong>{index === 0 ? `${purchaser.first_name} ${purchaser.last_name}` : `${attendee.first_name} ${attendee.last_name}`}</strong> accepts the participant waiver.</span></label>)}</div><div className="registration-actions"><button type="button" className="secondary-button" onClick={() => setStep(3)}>Back</button><button disabled={loading} className="primary-button" type="submit">{loading ? 'Holding seats...' : 'Continue to payment'}</button></div></form>}
    {step === 5 && <div className="registration-success"><h2>5. Confirm registration</h2><p>Your seats are held as a pending reservation. Payment is temporarily simulated while Stripe is being configured.</p><button className="primary-button" type="button" disabled={paymentLoading} onClick={startPayment}>{paymentLoading ? 'Confirming...' : 'Complete demo payment'}</button><Link className="secondary-button" href="/#events">Return to events</Link></div>}
    {message && <p role="status" className="registration-message">{message}</p>}
  </div></main>;
}
