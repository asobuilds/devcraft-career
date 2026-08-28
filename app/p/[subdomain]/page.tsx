'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Code2, Globe, ExternalLink } from 'lucide-react'; // <-- removed Github, using Code2 instead

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  liveUrl: string;
  repoUrl: string;
  languages: string;
}

export default function PublicPortfolioView() {
  const params = useParams();
  const subdomainSlug = (params?.subdomain ? String(params.subdomain) : '').toLowerCase().trim();

  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [developerName, setDeveloperName] = useState('');

  useEffect(() => {
    if (!subdomainSlug) {
      setLoading(false);
      return;
    }

    const fetchPublicPortfolio = async () => {
      const { data: portfolioData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('custom_subdomain', subdomainSlug)
        .maybeSingle();

      if (portfolioData) {
        setPortfolio(portfolioData);
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', portfolioData.user_id)
          .maybeSingle();

        if (profile) setDeveloperName(profile.full_name || '');
      }
      setLoading(false);
    };

    fetchPublicPortfolio();
  }, [subdomainSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-indigo-500" size={20} />
        <span>Compiling Public Engineering Canvas...</span>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-sm italic">
        The requested subdomain profile was not found on this platform network.
      </div>
    );
  }

  const techStackItems = Array.isArray(portfolio.tech_stack)
    ? portfolio.tech_stack
    : [];

  const projectArray = Array.isArray(portfolio.projects) ? portfolio.projects : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 flex justify-center font-sans">
      <div className="w-full max-w-3xl bg-slate-900/40 border border-slate-800 rounded-2xl p-8 md:p-12 space-y-8 backdrop-blur-md shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="border-b border-slate-800 pb-6 space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            {developerName || 'DevCraft Engineer'}
          </h1>
          <p className="text-xs text-indigo-400 font-mono flex items-center gap-1.5">
            <Globe size={12} /> {subdomainSlug}.devcraft.com
          </p>
        </div>

        {portfolio.bio && (
          <div className="space-y-2">
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl text-justify">
              {portfolio.bio}
            </p>
          </div>
        )}

        {techStackItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Engine Core Stack Matrix</h4>
            <div className="flex flex-wrap gap-1.5">
              {techStackItems.map((tech: string, i: number) => (
                <span
                  key={i}
                  className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] px-2.5 py-0.5 rounded-md font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {projectArray.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-800/60">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Verified Production Cards</h3>
            <div className="space-y-4">
              {projectArray.map((p: ProjectItem, i: number) => {
                if (!p.title) return null;
                return (
                  <div
                    key={p.id || i}
                    className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Code2 size={12} className="text-indigo-400" /> {p.title}
                      </h4>
                      {p.languages && (
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {p.languages}
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-xs text-slate-400 leading-relaxed text-justify">
                        {p.description}
                      </p>
                    )}
                    <div className="flex gap-4 pt-1 text-[11px] font-mono text-indigo-400">
                      {p.liveUrl && (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={10} /> Live Preview
                        </a>
                      )}
                      {p.repoUrl && (
                        <a
                          href={p.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <Code2 size={10} /> Git Repository  {/* <-- replaced Github with Code2 */}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}