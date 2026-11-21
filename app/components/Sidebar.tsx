'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  FileText,
  Code2,
  FileSearch,
  ListChecks,
  Users,
  Settings,
  LogOut,
  Folder,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  isNew?: boolean;
}

const navItems: NavItem[] = [
  { name: 'My Hub', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Build CV', href: '/cv-builder', icon: FileText },
  { name: 'My Portfolio', href: '/portfolio-builder', icon: Code2 },
  { name: 'Write Cover Letter', href: '/cover-letter', icon: Folder, isNew: true },
  { name: 'Beat the ATS', href: '/analyzer', icon: FileSearch, isNew: true },
  { name: 'Job Tracker', href: '/tracker', icon: ListChecks },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Desktop: fixed w-20 icon rail by default, expand to w-64 on hover via group-hover
  // Mobile: hidden drawer with hamburger menu (handled by isMenuOpen state)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/');
  };

  return (
    <>
      {/* Mobile Top Header & Hamburger Button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
            DC
          </div>
          <span className="text-sm font-semibold text-white">DevCraft Console</span>
        </div>
        <button
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Slide-out Drawer */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md md:hidden flex"
        >
          <div className="flex flex-col h-full w-72 bg-slate-900 border-r border-slate-800 p-6 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                  DC
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">DevCraft Console</span>
                  <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
                    🇳🇬 Naija Mode
                  </span>
                </div>
              </div>
              <button
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-orange-500/10 text-orange-400 border-r-2 border-orange-500' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} strokeWidth={1.5} />
                    <span>{item.name}</span>
                    {item.isNew && (
                      <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full">NEW</span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
              >
                <LogOut size={20} strokeWidth={1.5} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Rail: fixed w-20 icon rail, group-hover expands to w-64 */}
      <aside
        className="group fixed inset-y-0 left-0 hidden md:flex md:flex-col w-20 hover:w-64 overflow-hidden bg-slate-900 border-r border-slate-800 shadow-xl transition-all z-50"
      >
        <div className="flex items-center h-16 px-3 shrink-0 border-b border-slate-800/60 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              DC
            </div>
            <span className="text-sm font-semibold text-white whitespace-nowrap hidden group-hover:block">
              DevCraft Console
            </span>
          </div>
        </div>

        <div className="px-2 pt-2 shrink-0">
          <div className="flex items-center justify-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300 whitespace-nowrap">
            <span>🇳🇬</span>
            <span className="hidden group-hover:inline">Naija Mode</span>
          </div>
        </div>

        <nav className="flex-1 pt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-orange-500/10 text-orange-400 border-r-2 border-orange-500' : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <item.icon size={16} strokeWidth={1.5} />
                <span className="hidden group-hover:inline whitespace-nowrap">
                  {item.name}
                  {item.isNew && (
                    <span className="ml-1.5 text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full align-middle">NEW</span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-slate-800/60">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs font-medium whitespace-nowrap transition-colors text-slate-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={14} strokeWidth={1.5} />
            <span className="hidden group-hover:inline whitespace-nowrap">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}