'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Flag } from 'lucide-react';

interface DirectoryProfile {
  full_name: string | null;
  tech_stack: string | null;
  avatar_url: string | null;
  website: string | null;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  const initials = parts
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  return initials || 'U';
}

function techStackBadges(techStack: string | null) {
  if (!techStack) return null;
  return techStack
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (
      <span
        key={tag}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-indigo-500/20 text-indigo-300"
      >
        {tag}
      </span>
    ));
}

export default function CandidateDirectory() {
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchProfiles = async () => {
      try {
        const res = await fetch('/api/directory');
        if (!res.ok) {
          throw new Error(`Directory request failed with status ${res.status}`);
        }

        const data: unknown = await res.json();
        if (!cancelled) {
          setProfiles(Array.isArray(data) ? (data as DirectoryProfile[]) : []);
        }
      } catch (error) {
        console.error('Error fetching directory profiles:', error);
        if (!cancelled) {
          setProfiles([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProfiles();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProfiles = profiles.filter((profile) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

    const name = profile.full_name ? profile.full_name.toLowerCase() : '';
    const techStack = profile.tech_stack ? profile.tech_stack.toLowerCase() : '';

    return name.includes(query) || techStack.includes(query);
  });

  return (
    <div className="text-slate-100">
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
          ) : filteredProfiles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <span className="text-slate-500">No candidates found.</span>
            </div>
          ) : (
            filteredProfiles.map((profile, index) => (
              <div
                key={`${profile.website ?? profile.full_name ?? 'candidate'}-${index}`}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/20 transition-all"
              >
                {/* Avatar */}
                <div className="h-20 w-20 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <div
                      role="img"
                      aria-label={profile.full_name || 'Candidate avatar'}
                      className="h-20 w-20 rounded-full bg-center bg-cover"
                      style={{ backgroundImage: `url(${profile.avatar_url})` }}
                    />
                  ) : (
                    <div className="bg-indigo-600 text-lg font-bold text-white rounded-full w-20 h-20 flex items-center justify-center">
                      {getInitials(profile.full_name)}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-bold text-white truncate">
                    {profile.full_name || 'Anonymous Candidate'}
                  </h3>
                  <p className="text-sm text-slate-400 truncate">
                    {profile.website || 'No website added.'}
                  </p>
                </div>

                {/* Tech Stack Badges */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {techStackBadges(profile.tech_stack)}
                </div>

                {/* View Portfolio Button */}
                <div className="mt-4">
                  <Link
                    href={profile.website ? `/p/${profile.website}` : '/directory'}
                    className="block w-full text-center bg-indigo-600 text-white font-medium text-sm py-2.5 rounded-xl transition-all hover:bg-indigo-500"
                  >
                    View Portfolio
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
