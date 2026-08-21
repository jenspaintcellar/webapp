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
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) await supabase.auth.exchangeCodeForSession(code);
      const destination = sessionStorage.getItem('registration_destination') || '/#events';
      router.replace(destination);
    };
    finishSignIn();
  }, [router]);

  return <main style={{ padding: '8rem 2rem', textAlign: 'center' }}>Checking your email sign-in...</main>;
}