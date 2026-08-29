'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Loader2, Code2, ArrowRight, Globe, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Helper to normalize tech_stack into a clean array of strings
const getTechArray = (tech: any): string[] => {
  if (!tech) return [];
  if (Array.isArray(tech)) return tech.map(t => t.trim()).filter(Boolean);
  if (typeof tech === 'string') return tech.split(',').map(t => t.trim()).filter(Boolean);
  return [];
};

export default function RecruiterDirectory() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [portfolios, setPortfolios] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllPublicPortfolios = async () => {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .not('custom_subdomain', 'is', null);

      if (!error && data) setPortfolios(data);
      setLoading(false);
    };
    fetchAllPublicPortfolios();
  }, []);

  // Semantic synonym mapping (unchanged)
  const semanticSynonymsMap: Record<string, string[]> = {
    'backend': ['sql', 'postgres', 'python', 'node', 'api', 'docker', 'aws', 'database'],
    'frontend': ['react', 'typescript', 'javascript', 'tailwind', 'next.js', 'css', 'ui'],
    'cloud': ['aws', 'docker', 'kubernetes', 'ci/cd', 'deployment', 'security']
  };

  // Filter with safe tech_stack handling
  const filteredPortfolios = portfolios.filter(p => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

    const techArray = getTechArray(p.tech_stack);
    const techString = techArray.join(' ').toLowerCase();
    const bio = (p.bio || '').toLowerCase();
    const title = (p.title || '').toLowerCase();

    // Direct match
    if (techString.includes(query) || bio.includes(query) || title.includes(query)) {
      return true;
    }

    // Semantic proximity
    let hasSemanticMatch = false;
    Object.keys(semanticSynonymsMap).forEach(key => {
      if (query.includes(key) || key.includes(query)) {
        const synonyms = semanticSynonymsMap[key];
        synonyms.forEach(word => {
          if (techString.includes(word) || bio.includes(word)) {
            hasSemanticMatch = true;
          }
        });
      }
    });

    return hasSemanticMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-indigo-500" size={20} />
        <span>Compiling Smart Candidate Board...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-900 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">Candidate Marketplace</h1>
              <p className="text-xs text-slate-500 mt-1">Browse verified candidate profiles and live project code streams.</p>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concepts (e.g. backend, cloud)..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-slate-700 placeholder-slate-600"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolios.map((p) => {
            const techArray = getTechArray(p.tech_stack);
            return (
              <div key={p.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-sm hover:border-indigo-500/40 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Code2 size={18} />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-950 border border-slate-900 px-2 py-0.5 rounded">
                      {p.custom_subdomain}.devcraft.com
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                      {p.title || 'Untitled Portfolio'}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 text-justify leading-relaxed">
                      {p.bio || 'No professional biography synchronized yet.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mt-6 pt-4 border-t border-slate-900">
                  {/* Tech stack tags */}
                  {techArray.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {techArray.slice(0, 4).map((tech, idx) => (
                        <span key={idx} className="bg-slate-950 border border-slate-800/80 text-slate-400 text-[9px] font-mono px-1.5 py-0.5 rounded">
                          {tech}
                        </span>
                      ))}
                      {techArray.length > 4 && (
                        <span className="text-[9px] text-slate-500">+{techArray.length - 4} more</span>
                      )}
                    </div>
                  )}
                  {/* Link to profile */}
                  <Link
                    href={`/p/${p.custom_subdomain}`}
                    className="w-full bg-slate-800 group-hover:bg-indigo-600 text-white font-medium text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-700/60 group-hover:border-transparent"
                  >
                    <Globe size={12} /> Inspect Live Engine <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* No results */}
        {filteredPortfolios.length === 0 && (
          <p className="text-center text-xs text-slate-700 italic py-20">
            No portfolios matched the semantic threshold query.
          </p>
        )}
      </div>
    </div>
  );
}