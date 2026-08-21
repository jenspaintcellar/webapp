import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: 'Registration is not configured yet.' }, { status: 503 });
  const { email } = await request.json() as { email?: string };
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });

  const supabase = createClient(url, serviceKey);
  const { data: existingProfile } = await supabase.from('profiles').select('id, first_name, last_name, phone, role').ilike('email', normalizedEmail).maybeSingle();
  if (existingProfile?.role && existingProfile.role !== 'customer') return NextResponse.json({ error: 'This email is not available for public registration.' }, { status: 403 });
  const existingUser = existingProfile ? await supabase.auth.admin.getUserById(existingProfile.id) : { data: { user: null } };
  let user = existingUser.data.user;
  let existing = Boolean(existingProfile);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({ email: normalizedEmail, email_confirm: true, password: crypto.randomBytes(32).toString('hex') });
    if (error || !data.user) return NextResponse.json({ error: error?.message || 'Could not create customer.' }, { status: 500 });
    user = data.user;
  }
  const { data: profile, error: profileError } = await supabase.from('profiles').upsert({ id: user.id, email: normalizedEmail, role: 'customer' }, { onConflict: 'id' }).select('first_name, last_name, phone').single();
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });
  return NextResponse.json({ customerId: user.id, existing, profile: profile || { first_name: '', last_name: '', phone: '' } });
}
