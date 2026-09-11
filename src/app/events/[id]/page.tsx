'use client';

import { useEffect, useRef, useState, type UIEvent } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

const emptyAttendee = () => ({ first_name: '', last_name: '', phone: '', birth_date: '', emergency_contact_name: '', emergency_contact_phone: '', waiver_accepted: false });
type Attendee = ReturnType<typeof emptyAttendee>;
type EventRecord = { id: string; starts_at: string; capacity: number; price: number; spots_remaining?: number; classes: { name: string; description: string | null } | null; locations: { name: string; city: string } | null };
type Step = 1 | 2 | 3 | 4;
type RegistrationDraft = {
  email: string;
  attendees: Attendee[];
  sameEmergencyContact: boolean;
  waiverScrolled: boolean;
  waiverConfirmed: boolean;
  step: Step;
};
type PaymentStatus = 'success' | 'cancelled' | null;
type PaymentSummary = {
  className: string;
  startsAt?: string;
  location: string;
  email: string;
  attendees: number;
  totalPaid: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\(\d{3}\) \d{3}-\d{4}$/;

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatName(value: string) {
  const cleaned = value.replace(/[^a-zA-Z\s'\-]/g, '').replace(/\s+/g, ' ').trimStart();
  return toTitleCase(cleaned).slice(0, 25);
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (!digits) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function RegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const draftStorageKey = `registration-draft:${id}`;
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
  const [waiverScrolled, setWaiverScrolled] = useState(false);
  const [waiverConfirmed, setWaiverConfirmed] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const previousStepRef = useRef<Step>(step);
  const maxAllowedAttendees = event ? Math.max(0, event.spots_remaining ?? event.capacity) : 1;

  function persistDraft(stepOverride?: Step) {
    if (!id || paymentStatus === 'success') return;
    const draft: RegistrationDraft = {
      email,
      attendees,
      sameEmergencyContact,
      waiverScrolled,
      waiverConfirmed,
      step: stepOverride ?? step,
    };
    window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }

  function goToStep(nextStep: Step) {
    if (paymentStatus === 'cancelled') {
      setPaymentStatus(null);
      window.history.replaceState(null, '', `/events/${id}`);
    }
    setMessage('');
    setStep(nextStep);
  }

  useEffect(() => {
    fetch(`/api/public/events/${id}`, { cache: 'no-store' })
      .then(async (response) => {
        if (response.status === 404) {
          setNotFound(true);
          setMessage('This class is no longer available.');
          return;
        }

        if (!response.ok) {
          setNotFound(true);
          setMessage('This page is temporarily unavailable because website database settings are missing.');
          return;
        }

        const payload = await response.json() as { event?: EventRecord | null };
        setEvent(payload.event || null);
        setNotFound(!payload.event);
      })
      .catch(() => {
        setNotFound(true);
        setMessage('This page is temporarily unavailable right now. Please try again shortly.');
      });
  }, [id]);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    if (payment === 'success' || (!payment && !!sessionId)) {
      setPaymentStatus('success');
      setStep(4);
      return;
    }
    if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      setStep(4);
      return;
    }
    setPaymentStatus(null);
  }, [searchParams]);

  function isCheckoutReturn() {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    return payment === 'success' || payment === 'cancelled' || !!sessionId;
  }

  useEffect(() => {
    if (!id || paymentStatus === 'success' || isCheckoutReturn()) {
      setDraftHydrated(true);
      return;
    }
    const rawDraft = window.sessionStorage.getItem(draftStorageKey);
    if (!rawDraft) {
      setDraftHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(rawDraft) as Partial<RegistrationDraft>;
      if (typeof parsed.email === 'string') setEmail(parsed.email);
      if (Array.isArray(parsed.attendees) && parsed.attendees.length > 0) setAttendees(parsed.attendees as Attendee[]);
      if (typeof parsed.sameEmergencyContact === 'boolean') setSameEmergencyContact(parsed.sameEmergencyContact);
      if (typeof parsed.waiverScrolled === 'boolean') setWaiverScrolled(parsed.waiverScrolled);
      if (typeof parsed.waiverConfirmed === 'boolean') setWaiverConfirmed(parsed.waiverConfirmed);
      if (parsed.step === 1 || parsed.step === 2 || parsed.step === 3) setStep(parsed.step);
    } catch {
      window.sessionStorage.removeItem(draftStorageKey);
    } finally {
      setDraftHydrated(true);
    }
  }, [draftStorageKey, id, paymentStatus, searchParams]);

  useEffect(() => {
    if (!id || paymentStatus === 'success' || !draftHydrated || isCheckoutReturn()) return;
    persistDraft();
  }, [attendees, draftHydrated, draftStorageKey, email, id, paymentStatus, sameEmergencyContact, searchParams, step, waiverConfirmed, waiverScrolled]);

  useEffect(() => {
    setDraftHydrated(false);
  }, [id]);

  useEffect(() => {
    if (paymentStatus !== 'success') return;
    window.sessionStorage.removeItem(draftStorageKey);
    setEmail('');
    setAttendees([emptyAttendee()]);
    setSameEmergencyContact(false);
    setWaiverScrolled(false);
    setWaiverConfirmed(false);
    setMessage('');
  }, [draftStorageKey, paymentStatus]);

  useEffect(() => {
    setMessage('');
  }, [paymentStatus, step]);

  useEffect(() => {
    if (!event || paymentStatus === 'success') return;
    if (attendees.length <= maxAllowedAttendees) return;
    const safeCount = Math.max(1, maxAllowedAttendees);
    setAttendees((current) => current.slice(0, safeCount));
    setMessage(`Only ${maxAllowedAttendees} ${maxAllowedAttendees === 1 ? 'seat is' : 'seats are'} currently available for this class.`);
  }, [attendees.length, event, maxAllowedAttendees, paymentStatus]);

  useEffect(() => {
    if (previousStepRef.current === step) return;
    previousStepRef.current = step;

    const scrollTarget = document.querySelector('.registration-form, .registration-card');
    if (scrollTarget) {
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (paymentStatus !== 'success' || !sessionId) return;
    setConfirmError('');
    setPaymentSummary(null);
    setConfirming(true);
    fetch('/api/stripe/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) })
      .then((response) => response.json())
      .then((result: { confirmed?: boolean; error?: string; summary?: PaymentSummary }) => {
        if (!result.confirmed && result.error) {
          setConfirmError(result.error);
          return;
        }
        if (result.confirmed && result.summary) setPaymentSummary(result.summary);
      })
      .finally(() => setConfirming(false));
  }, [paymentStatus, searchParams]);

  function updateAttendee(index: number, field: keyof Attendee, value: string | boolean) {
    setMessage('');
    setAttendees((current) => current.map((attendee, attendeeIndex) => {
      if (attendeeIndex === index) return { ...attendee, [field]: value };
      if (sameEmergencyContact && index === 0 && (field === 'emergency_contact_name' || field === 'emergency_contact_phone')) {
        return { ...attendee, [field]: value };
      }
      return attendee;
    }));
  }

  function validateBasics() {
    if (attendees.length > maxAllowedAttendees) {
      setMessage(`Only ${maxAllowedAttendees} ${maxAllowedAttendees === 1 ? 'seat is' : 'seats are'} available for this class.`);
      return false;
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      setMessage('Enter a valid email address, including @ and domain.');
      return false;
    }

    if (attendees.some((attendee) => !attendee.first_name.trim() || !attendee.last_name.trim() || !attendee.birth_date)) {
      setMessage('Complete each attendee first name, last name, and birthday.');
      return false;
    }

    if (attendees.some((attendee) => !PHONE_PATTERN.test(attendee.phone))) {
      setMessage('Each attendee phone number must be in the format (999) 999-9999.');
      return false;
    }

    return true;
  }

  function validateEmergency() {
    const contactsToCheck = sameEmergencyContact ? attendees.slice(0, 1) : attendees;
    if (contactsToCheck.some((attendee) => !attendee.emergency_contact_name.trim() || !PHONE_PATTERN.test(attendee.emergency_contact_phone))) {
      setMessage('Enter a valid emergency contact name and phone number in the format (999) 999-9999.');
      return false;
    }

    if (sameEmergencyContact && attendees[0]) {
      const contact = {
        emergency_contact_name: attendees[0].emergency_contact_name,
        emergency_contact_phone: attendees[0].emergency_contact_phone,
      };
      setAttendees((current) => current.map((attendee) => ({ ...attendee, ...contact })));
    }

    return true;
  }

  function handleWaiverScroll(event: UIEvent<HTMLDivElement>) {
    const target = event.currentTarget;
    const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 12;
    if (reachedBottom) setWaiverScrolled(true);
  }

  async function goToPayment() {
    if (!waiverScrolled || !waiverConfirmed) {
      setMessage('Read the full waiver, then confirm before continuing to checkout.');
      return;
    }
    if (attendees.some((attendee) => !attendee.waiver_accepted)) { setMessage('Each attendee must accept the waiver.'); return; }

    if (attendees.length > maxAllowedAttendees) {
      setMessage(`Only ${maxAllowedAttendees} ${maxAllowedAttendees === 1 ? 'seat is' : 'seats are'} available for this class.`);
      return;
    }

    persistDraft(3);
    setPaymentLoading(true); setMessage('');

    try {
      const registrationAttendees = sameEmergencyContact ? attendees.map((attendee) => ({ ...attendee, emergency_contact_name: attendees[0].emergency_contact_name, emergency_contact_phone: attendees[0].emergency_contact_phone })) : attendees;
      const response = await fetch('/api/registration/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: id, email, attendees: registrationAttendees }) });
      const result = await response.json().catch(() => ({ error: 'Could not start secure payment.' })) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setMessage(result.error || 'Could not start secure payment.');
        setPaymentLoading(false);
        return;
      }
      window.location.href = result.url;
    } catch {
      setMessage('Secure checkout is temporarily unavailable. Please try again.');
      setPaymentLoading(false);
    }
  }

  if (notFound) return <main className="registration-page"><h1>Class not found</h1><p>{message || 'This class is no longer available.'}</p><Link href="/#events">Back to events</Link></main>;
  if (!event) return <main className="registration-page">Loading class...</main>;
  const totalPrice = (Number(event.price) * attendees.length).toFixed(2);
  return <main className="registration-page"><div className="registration-card"><Link href="/#events" className="registration-back">Back to events</Link><p className="registration-kicker">{paymentStatus ? 'Payment' : `Step ${step} of 3`}</p><h1>{event.classes?.name || 'Paint class'}</h1><p className="registration-summary">{new Date(event.starts_at).toLocaleString()} · {event.locations?.name}, {event.locations?.city}</p>{!paymentStatus && !!event.classes?.description && <p className="registration-class-description">{event.classes.description}</p>}{!paymentStatus && <p className="registration-price">${Number(event.price).toFixed(2)} per person · {attendees.length} {attendees.length === 1 ? 'person' : 'people'} · ${totalPrice} total</p>}{!paymentStatus && <div className="registration-progress" aria-label={`Registration step ${step} of 3`}><span className={step >= 1 ? 'active' : ''} /><span className={step >= 2 ? 'active' : ''} /><span className={step >= 3 ? 'active' : ''} /></div>}
    {step === 1 && <form className="registration-form" onSubmit={(e) => { e.preventDefault(); if (validateBasics()) goToStep(2); }}><div className="registration-section"><h2>1. Who is attending?</h2><p>Enter the reservation email and add each participant. Names are automatically capitalized and limited to 25 characters.</p><p className="registration-help">{maxAllowedAttendees === 0 ? 'This class is currently full.' : `${maxAllowedAttendees} ${maxAllowedAttendees === 1 ? 'seat is' : 'seats are'} currently available.`}</p><label>Email address<input required type="email" value={email} onChange={(e) => { setMessage(''); setEmail(e.target.value.trim()); }} /></label>{attendees.map((attendee, index) => <fieldset className="attendee-fields" key={index}><legend>Person {index + 1}</legend>{index > 0 && <button type="button" className="remove-attendee" onClick={() => { setMessage(''); setAttendees((current) => current.filter((_, attendeeIndex) => attendeeIndex !== index)); }}>Remove person</button>}<div className="attendee-grid"><label>First name<input required maxLength={25} value={attendee.first_name} onChange={(e) => updateAttendee(index, 'first_name', formatName(e.target.value))} /></label><label>Last name<input required maxLength={25} value={attendee.last_name} onChange={(e) => updateAttendee(index, 'last_name', formatName(e.target.value))} /></label></div><label>Phone<input required type="tel" inputMode="numeric" maxLength={14} placeholder="(999) 999-9999" value={attendee.phone} onChange={(e) => updateAttendee(index, 'phone', formatPhone(e.target.value))} /></label><label>Birthday<input required type="date" value={attendee.birth_date} onChange={(e) => updateAttendee(index, 'birth_date', e.target.value)} /></label></fieldset>)}{attendees.length < maxAllowedAttendees && <button type="button" className="secondary-button add-attendee-button" onClick={() => { setMessage(''); setAttendees((current) => [...current, emptyAttendee()]); }}>+ Add another person</button>}</div><button className="primary-button" type="submit" disabled={maxAllowedAttendees === 0}>Continue</button></form>}
    {step === 2 && <form className="registration-form" onSubmit={(e) => { e.preventDefault(); if (validateEmergency()) { setWaiverScrolled(false); setWaiverConfirmed(false); goToStep(3); } }}><div className="registration-section"><h2>2. Emergency contact</h2><p>Add a contact for each participant, or use one contact for everyone.</p>{attendees.length > 1 && <label className="waiver-check"><input type="checkbox" checked={sameEmergencyContact} onChange={(e) => { setMessage(''); setSameEmergencyContact(e.target.checked); }} /><span>Use the same emergency contact for everyone</span></label>}{attendees.map((attendee, index) => <fieldset className="attendee-fields" key={index}><legend>{attendee.first_name} {attendee.last_name}</legend>{sameEmergencyContact && index > 0 ? <p className="registration-help">Using the first person&apos;s emergency contact.</p> : <div className="attendee-grid"><label>Contact name<input required maxLength={25} value={attendee.emergency_contact_name} onChange={(e) => updateAttendee(index, 'emergency_contact_name', formatName(e.target.value))} /></label><label>Contact phone<input required type="tel" inputMode="numeric" maxLength={14} placeholder="(999) 999-9999" value={attendee.emergency_contact_phone} onChange={(e) => updateAttendee(index, 'emergency_contact_phone', formatPhone(e.target.value))} /></label></div>}</fieldset>)}</div><div className="registration-actions"><button type="button" className="secondary-button" onClick={() => goToStep(1)}>Back</button><button className="primary-button" type="submit">Continue</button></div></form>}
    {step === 3 && <form className="registration-form" onSubmit={(e) => { e.preventDefault(); goToPayment(); }}><div className="registration-section"><h2>3. Participant waiver & secure checkout</h2><p>Please review and acknowledge the waiver before continuing to secure checkout.</p><div className="waiver-panel"><p className="waiver-title">Jen&apos;s Paint Cellar Studio Participation Waiver</p><div className="waiver-scroll" onScroll={handleWaiverScroll}><p>Jen&apos;s Paint Cellar provides guided paint experiences for guests of all skill levels. By joining this class, each participant confirms they are voluntarily participating in a creative activity that may involve standing, reaching, handling paint supplies, and using shared studio equipment.</p><p>Participants agree to follow instructor guidance and posted studio safety rules, including careful use of stools, easels, brushes, and tools. Participants also agree to use materials responsibly and to report spills, injuries, or unsafe conditions to staff immediately.</p><p>Each participant accepts responsibility for their own behavior during class and agrees to act respectfully toward instructors, staff, and other guests. Jen&apos;s Paint Cellar may remove participants for unsafe, disruptive, or inappropriate conduct.</p><p>To the fullest extent allowed by law, participants release Jen&apos;s Paint Cellar and its staff from liability for ordinary risks related to participation, including minor injury, accidental paint damage, or personal property loss.</p><p>Participants authorize staff to contact the listed emergency contact and arrange reasonable emergency assistance if needed. By confirming below, you acknowledge that you have read and understood this waiver and agree on behalf of all listed participants.</p></div><label className="waiver-check waiver-confirm"><input type="checkbox" checked={waiverConfirmed} disabled={!waiverScrolled} onChange={(e) => { setMessage(''); setWaiverConfirmed(e.target.checked); if (!e.target.checked) setAttendees((current) => current.map((attendee) => ({ ...attendee, waiver_accepted: false }))); }} /><span>I have read the full waiver and agree to these terms.</span></label>{!waiverScrolled && <p className="registration-help">Scroll through the waiver text to enable confirmation.</p>}</div>{attendees.map((attendee, index) => <label className="waiver-check" key={index}><input required type="checkbox" disabled={!waiverConfirmed} checked={attendee.waiver_accepted} onChange={(e) => updateAttendee(index, 'waiver_accepted', e.target.checked)} /><span><strong>{attendee.first_name} {attendee.last_name}</strong> confirms acceptance of the participant waiver.</span></label>)}</div><div className="registration-actions"><button type="button" className="secondary-button" onClick={() => goToStep(2)} disabled={paymentLoading}>Back</button><button className="primary-button payment-button" type="submit" disabled={paymentLoading || !waiverConfirmed || !waiverScrolled}>{paymentLoading ? 'Redirecting to secure checkout...' : 'Continue to Secure Checkout'}</button></div></form>}
    {paymentStatus === 'success' && step === 4 && <div className="registration-success"><h2>{confirming ? 'Confirming your payment...' : confirmError ? 'Payment received, but...' : 'Payment confirmed'}</h2><p>{confirming ? 'Please wait a moment while we confirm your reservation.' : confirmError || 'Your booking is confirmed. A confirmation email will be sent shortly.'}</p>{paymentSummary && !confirming && !confirmError && <div className="registration-section"><h3>Booking overview</h3><p>{paymentSummary.className}</p>{paymentSummary.startsAt ? <p>{new Date(paymentSummary.startsAt).toLocaleString()} · {paymentSummary.location}</p> : <p>{paymentSummary.location}</p>}<p>{paymentSummary.attendees} {paymentSummary.attendees === 1 ? 'participant' : 'participants'} · ${paymentSummary.totalPaid} paid</p><p>Confirmation email: {paymentSummary.email}</p></div>}{!confirming && <Link className="secondary-button" href="/#events">Return to events</Link>}</div>}
    {paymentStatus === 'cancelled' && step === 4 && <div className="registration-success"><h2>Payment not completed</h2><p>Nothing was booked or charged. You can go back and try again whenever you&apos;re ready.</p><button className="primary-button" type="button" onClick={() => goToStep(3)}>Try again</button></div>}
    {message && <p role="status" className="registration-message">{message}</p>}</div></main>;
}
