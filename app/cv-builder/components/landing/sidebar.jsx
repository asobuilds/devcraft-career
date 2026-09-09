'use client';
import { useState } from 'react';
import { Menu, X, Home, Workflow, Sparkles, HelpCircle, MessageSquare, User, Rocket } from 'lucide-react';

const links = [
  { href: '#hero', label: 'Home', icon: Home },
  { href: '#how-it-works', label: 'How It Works', icon: Workflow },
  { href: '#features', label: 'Features', icon: Sparkles },
  { href: '#faq', label: 'FAQ', icon: HelpCircle },
  { href: '#reviews', label: 'Reviews', icon: MessageSquare },
  { href: '#about', label: 'About', icon: User },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden bg-slate-900 text-white p-2 rounded-lg shadow-lg"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={
          'fixed top-0 left-0 h-full w-64 bg-slate-900 text-slate-100 z-40 flex flex-col justify-between transition-transform duration-300 ' +
          (open ? 'translate-x-0' : '-translate-x-full') + ' md:translate-x-0'
        }
      >
        <div>
          <div className="px-6 py-6 border-b border-slate-800">
            <span className="text-xl font-bold tracking-tight">
              DevCraft <span className="text-indigo-400">Career</span>
            </span>
          </div>
          <nav className="px-3 py-6 space-y-1">
            {links.map((item) => (
              
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <item.icon size={18} />
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="p-4">
          
            href="/cv-builder"
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-3 rounded-lg transition-colors"
          >
            <Rocket size={16} />
            Get Started
          </a>
        </div>
      </aside>
    </>
  );
}