'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const finishSignIn = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const intent = params.get('intent');
      const next = params.get('next') || '/#events';
      if (code) await supabase.auth.exchangeCodeForSession(code);
      const { data: sessionData } = await supabase.auth.getSession();
      if (intent && sessionData.session) {
        const { error } = await supabase.rpc('complete_registration', { requested_intent_id: intent });
        if (error) sessionStorage.setItem('registration_error', error.message);
        else sessionStorage.setItem('registration_complete', 'Your registration is confirmed and your waiver details were saved.');
      }
      router.replace(next);
    };
    finishSignIn();
  }, [router]);

  return <main style={{ padding: '8rem 2rem', textAlign: 'center' }}>Checking your email sign-in...</main>;
}