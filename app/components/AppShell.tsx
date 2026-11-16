'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import SidebarClient from './SidebarClient';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalizedPath =
    pathname && pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
  const isPublicRoute =
    normalizedPath === '/' ||
    PUBLIC_ROUTES.includes(normalizedPath) ||
    normalizedPath.startsWith('/p/');

  if (isPublicRoute) {
    return (
      <main className="min-h-screen w-full bg-slate-950">{children}</main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <SidebarClient />
      <main className="md:pl-20 relative min-h-screen">{children}</main>
    </div>
  );
}
