-- Store participant age and emergency contact details.
alter table public.booking_attendees add column if not exists age integer;
alter table public.booking_attendees add column if not exists birth_date date;
alter table public.booking_attendees add column if not exists emergency_contact_name text;
alter table public.booking_attendees add column if not exists emergency_contact_phone text;

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.booking_attendees'::regclass and conname = 'booking_attendees_age_check') then
    alter table public.booking_attendees add constraint booking_attendees_age_check check (age is null or age between 1 and 120);
  end if;
end $$;
