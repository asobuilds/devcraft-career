import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // SYSTEM COMPLIANCE MATRIX: Explicitly ignore assets, APIs, and ALL feature folder page paths
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
    path.startsWith('/portfolio-builder') ||
    path.startsWith('/settings') ||   // Open traffic channels cleanly
    path.startsWith('/directory') ||     // Open traffic channels cleanly
    path.startsWith('/fix-database') 

  ) {
    return NextResponse.next();
  }

  const slug = path.replace('/', '');

  // Safeguard vanity profile links pathing parameters structures
  if (slug.length > 0 && !slug.includes('.')) {
    url.pathname = `/dashboard`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - favicon.ico (favicon file)
     */
    '/((?!favicon\\.ico).*)',
  ],
};
