import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // CRITICAL FIX: Explicitly ignore all authorization and authentication paths
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/auth') ||
    path === '/' ||
    path === '/login' ||
    path === '/register' ||
    path === '/dashboard' ||
    path === '/cv-builder' ||
    path.startsWith('/tracker') ||
    path.startsWith('/analyzer') ||
    path.startsWith('/portfolio-builder')
  ) {
    return NextResponse.next();
  }

  const slug = path.replace('/', '');

  if (slug.length > 0) {
    url.pathname = `/dashboard`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
