export type AttendeeInput = {
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
};

export function calculateAge(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

export function validateAttendees(attendees: AttendeeInput[]) {
  return Boolean(
    attendees.length &&
    attendees.length <= 12 &&
    !attendees.some((attendee) =>
      !attendee.first_name?.trim() ||
      !attendee.last_name?.trim() ||
      !attendee.phone?.trim() ||
      !attendee.birth_date ||
      calculateAge(attendee.birth_date) < 1 ||
      calculateAge(attendee.birth_date) > 120 ||
      !attendee.emergency_contact_name?.trim() ||
      !attendee.emergency_contact_phone?.trim()
    )
  );
}

// Stripe metadata values are capped at 500 characters each, so attendees are encoded one per key
// with short field names, using compact JSON rather than one large combined value.
export function encodeAttendeesToMetadata(attendees: AttendeeInput[]): Record<string, string> {
  const metadata: Record<string, string> = {};
  attendees.forEach((attendee, index) => {
    metadata[`attendee_${index}`] = JSON.stringify({
      fn: attendee.first_name.trim(),
      ln: attendee.last_name.trim(),
      ph: attendee.phone.trim(),
      bd: attendee.birth_date,
      ecn: attendee.emergency_contact_name.trim(),
      ecp: attendee.emergency_contact_phone.trim(),
    });
  });
  return metadata;
}

export function decodeAttendeesFromMetadata(metadata: Record<string, string>, count: number): AttendeeInput[] {
  const attendees: AttendeeInput[] = [];
  for (let index = 0; index < count; index++) {
    const raw = metadata[`attendee_${index}`];
    if (!raw) continue;
    const parsed = JSON.parse(raw) as { fn: string; ln: string; ph: string; bd: string; ecn: string; ecp: string };
    attendees.push({ first_name: parsed.fn, last_name: parsed.ln, phone: parsed.ph, birth_date: parsed.bd, emergency_contact_name: parsed.ecn, emergency_contact_phone: parsed.ecp });
  }
  return attendees;
}
