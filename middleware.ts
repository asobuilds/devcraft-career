import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Ignore system configurations, asset folders, and root path setups
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path === '/' ||
    path === '/login' ||
    path === '/register' ||
    path === '/dashboard' ||
    path === '/cv-builder' ||
    path.startsWith('/tracker')
  ) {
    return NextResponse.next();
  }

  // Extract the trailing username tag string identifier slug from the link
  const slug = path.replace('/', '');

  if (slug.length > 0) {
    // Dynamically forward the request back to the internal data collection paths
    url.pathname = `/dashboard`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
