import { NextResponse } from 'next/server';

export function rejectUntrustedBrowserRequest(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 16_000) {
    return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
  }

  return null;
}