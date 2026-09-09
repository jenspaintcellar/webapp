import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Authentication Callback',
  description: 'Secure callback endpoint for account sign-in and registration completion.',
  path: '/auth/callback',
  noIndex: true,
});

export default function AuthCallbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
