'use client';

import React, { useState, useEffect } from 'react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Check if we're on a mobile device
    const checkMobile = () => {
      setIsExpanded(window.innerWidth > 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/');
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex flex-col">
      {/* Desktop Sidebar Rail */}
      <aside
        className={`group/rail fixed inset-y-0 left-0 ${isExpanded ? 'w-64' : 'w-16'} bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out hover:w-64 group-hover:w-64 z-50`}
      >
        <div className="h-full w-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center h-14 px-4 shrink-0">
            <div className="flex items-center gap-3 w-full">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                DC
              </div>
              <span className="text-sm font-semibold text-white whitespace-nowrap opacity-0 invisible group-hover/rail:opacity-100 group-hover/rail:visible group-hover/rail:transition-all duration-200">
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
                  <span className="w-0 opacity-0 invisible group-hover/rail:opacity-100 group-hover/rail:visible group-hover/rail:w-auto transition-all duration-200 whitespace-nowrap text-sm font-medium text-slate-200 ml-2">
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
              <span className="w-0 opacity-0 invisible group-hover/rail:opacity-100 group-hover/rail:visible group-hover/rail:w-auto transition-all duration-200 whitespace-nowrap text-sm font-medium text-red-400 ml-2">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Hamburger Menu */}
      <button
        className={`absolute top-4 left-4 z-50 p-2 rounded-lg hover:bg-slate-800 transition-colors lg:hidden ${
          isMenuOpen ? 'bg-indigo-600/20' : ''
        }`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Open menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Slide-out Drawer */}
      {isMenuOpen && (
        <div
          className={`fixed inset-0 z-40 bg-slate-900/90 backdrop-blur-md transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'left-0' : 'left-full'
          }`}
        >
          <nav className="flex flex-col h-screen p-8">
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
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-slate-100'
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
      )}
    </div>
  );
}
