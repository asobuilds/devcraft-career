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
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'CV Builder', href: '/cv-builder', icon: FileText },
  { name: 'Portfolio Builder', href: '/portfolio-builder', icon: Code2 },
  { name: 'Cover Letter', href: '/cover-letter', icon: Folder },
  { name: 'ATS Analyzer', href: '/analyzer', icon: FileSearch },
  { name: 'Tracker', href: '/tracker', icon: ListChecks },
  { name: 'Directory', href: '/directory', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Expanded state based on screen width - no resize listener to avoid
  // console-open toggle issues (innerWidth changes when DevTools opens)
  const isExpanded = window.innerWidth > 768;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/');
  };

  return (
    <>
      {/* Desktop Sidebar - fixed position */
      <div className={`fixed inset-y-0 left-0 z-50 ${isExpanded ? 'w-64' : 'w-16'} bg-slate-900 border-r border-slate-800 transition-all duration-300 h-full`}
        style={{ transition: isExpanded ? 'width 0.3s ease' : 'width 0.2s ease' }}
      >
        <div className="h-full w-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center h-14 px-4 shrink-0">
            <div className="flex items-center gap-3 w-full">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                DC
              </div>
              <span className="text-sm font-semibold text-white whitespace-nowrap">
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
                    isActive ? 'bg-indigo-600/15 text-indigo-400' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'}
                  }`}
                >
                  <item.icon size={20} strokeWidth={1.5} />
                  <span className="block text-sm font-medium text-slate-200">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800">
            <button
              onClick={handleSignOut}
              className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={20} strokeWidth={1.5} />
              <span className="block text-xs font-medium text-red-400">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </div>
      }

      {/* Mobile Hamburger Menu (only on mobile: innerWidth <= 768) */}
      {window.innerWidth <= 768 && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-40 bg-slate-900/90 backdrop-blur-md transition-all duration-300 pointer-events-none opacity-0 {
          isMenuOpen ? 'pointer-events-auto opacity-100' : ''
        } transition-opacity">
          <button
            className="absolute top-4 left-4 z-50 p-2 rounded-lg hover:bg-slate-800 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Open menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile drawer content - visible when menu is open */}
          <div className="pointer-events-auto">
            <nav className="h-screen w-64 bg-slate-900 border-r border-slate-800 p-8 flex flex-col">
              <button
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={28} />
              </button>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block p-3 rounded-lg text-lg font-medium transition-colors ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-slate-100'}
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="mt-8 pt-8 border-t border-slate-800">
                <button
                  onClick={handleSignOut}
                  className="w-full py-3 rounded-lg text-left text-slate-400 hover:text-red-400 transition-colors flex items-center"
                >
                  <LogOut size={16} className="mr-2 inline" /> Sign Out
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}