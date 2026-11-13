'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Code2,
  FileSearch,
  ListChecks,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'CV Builder', href: '/cv-builder', icon: FileText },
  { name: 'Portfolio Builder', href: '/portfolio-builder', icon: Code2 },
  { name: 'ATS Analyzer', href: '/analyzer', icon: FileSearch },
  { name: 'Tracker', href: '/tracker', icon: ListChecks },
  { name: 'Directory', href: '/directory', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <aside className="group/sidebar fixed inset-y-0 left-0 w-16 z-50">
      <div className="h-full w-full bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-200 ease-in-out group-hover/sidebar:w-60">
        {/* Logo row */}
        <div className="flex items-center h-16 px-4 shrink-0">
          <div className="flex items-center gap-3 w-full">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
              DC
            </div>
            <span className="text-sm font-semibold text-white whitespace-nowrap opacity-0 invisible group-hover/sidebar:opacity-100 group-hover/sidebar:visible transition-all duration-200">
              DevCraft Console
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <item.icon size={20} strokeWidth={1.5} />
                <span className="w-0 opacity-0 invisible group-hover/sidebar:opacity-100 group-hover/sidebar:visible group-hover/sidebar:w-auto transition-all duration-200 whitespace-nowrap text-sm font-medium text-slate-200 ml-2">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} strokeWidth={1.5} />
            <span className="w-0 opacity-0 invisible group-hover/sidebar:opacity-100 group-hover/sidebar:visible group-hover/sidebar:w-auto transition-all duration-200 whitespace-nowrap text-sm font-medium text-red-400 ml-2">
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
