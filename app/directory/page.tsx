'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Flag } from 'lucide-react';

interface Portfolio {
  id: string;
  title: string;
  bio: string | null;
  tech_stack: string | null;
  custom_subdomain: string | null;
  image_url: string | null;
}

export default function CandidateDirectory() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await fetch('/api/directory');
        const data = await res.json();
        setPortfolios(data as Portfolio[]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const filteredPortfolios = portfolios.filter((p) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

    const techStack = p.tech_stack ? p.tech_stack.toLowerCase() : '';
    const bio = p.bio ? p.bio.toLowerCase() : '';
    const title = p.title ? p.title.toLowerCase() : '';

    return (
      techStack.includes(query) ||
      bio.includes(query) ||
      title.includes(query)
    );
  });

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          
          <h1 className="text-xl font-bold text-white">Candidate Directory</h1>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 md:p-12">
        {/* Search Bar */}
        <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="relative">
            <Flag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Candidate Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center">
              <Loader2 className="mx-auto mb-4 animate-spin text-indigo-500" size={32} />
              <span className="text-slate-400">Loading candidates...</span>
            </div>
          ) : filteredPortfolios.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <span className="text-slate-500">No candidates matched your search.</span>
            </div>
          ) : filteredPortfolios.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/20 transition-all cursor-pointer"
            >
              {/* Avatar */}
              <div className="h-20 w-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                {p.image_url
                  ? <Flag size={48} className="text-indigo-400" />
                  : <div className="bg-indigo-600 text-xs font-bold text-white rounded-full w-10 h-10 flex items-center justify-center">
                    {getInitials(p.custom_subdomain || p.title)}
                  </div>
                }
              </div>

              {/* Details */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white truncate">
                  {p.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2">
                  {p.bio || 'No biography added.'}
                </p>
              </div>

              {/* Tech Stack Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {p.tech_stack
                  ?.split(',')
                  .map((tag) => techStackBadge(tag))
                  .filter(Boolean)}
              </div>

              {/* View Portfolio Button */}
              <div className="mt-4">
                <Link
                  href={`/p/${p.custom_subdomain}`
                  }
                  className="w-full bg-indigo-600 text-white font-medium text-sm py-2.5 rounded-xl transition-all hover:bg-indigo-500"
                >
                  View Portfolio
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  const techStackBadge = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return null;
    return (
      <span
        key={trimmed}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-indigo-500/20 text-indigo-300"
      >
        {trimmed}
      </span>
    );
  };
}