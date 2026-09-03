'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Code, FileText, LogOut, LayoutDashboard, Settings, Sparkles, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  
  const [syncing, setSyncing] = useState(true);
  const [loadPercentage, setLoadPercentage] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Preference visibility parameters layout
  const [showDev, setShowDev] = useState(true);
  const [showCV, setShowCV] = useState(true);

  useEffect(() => {
    let progressTimer = 0;
    const speedInterval = setInterval(() => {
      progressTimer += Math.floor(Math.random() * 25) + 10;
      if (progressTimer >= 100) {
        progressTimer = 100;
        clearInterval(speedInterval);
      }
      setLoadPercentage(progressTimer);
    }, 20);

    const checkUserSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        localStorage.removeItem('devcraft_session_active');
        router.push('/register');
        clearInterval(speedInterval);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
        setShowDev(profile.show_dev_portfolio ?? true);
        setShowCV(profile.show_cv_engine ?? true);
      }
      
      setTimeout(() => {
        setSyncing(false);
      }, 300);
    };

    checkUserSession();
    return () => clearInterval(speedInterval);
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('devcraft_session_active');
    router.push('/');
  };

  if (syncing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <Loader2 className="animate-spin text-indigo-500 h-8 w-8" />
        <div className="text-sm font-semibold tracking-wide text-white">Synchronizing System Cockpit...</div>
        <div className="w-48 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div className="bg-purple-600 h-full transition-all duration-75" style={{ width: `${loadPercentage}%` }} />
        </div>
        <span className="text-xs font-mono text-purple-400">{loadPercentage}% Loaded</span>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation Panel */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-900/20 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">DC</div>
            <span className="font-bold text-sm tracking-tight text-white">Console Engine</span>
          </div>

          <nav className="space-y-1">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <LayoutDashboard size={14} /> {"Overview Terminal"}
            </div>
            
            <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 text-xs font-medium transition-colors border border-transparent">
              <Settings size={14} /> {"Account Configurations"}
            </Link>
          </nav>
        </div>

        <button onClick={handleSignOut} className="mt-8 flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-red-400 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-500/5 border border-transparent hover:border-red-500/10">
          <LogOut size={14} /> {"Disconnect Session"}
        </button>
      </aside>

      {/* Main Content Workspace Panel */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl">
        <div className="mb-8 flex justify-between items-start border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-xl font-bold text-white">{"Welcome back, "}{userProfile?.full_name || "User"}</h1>
            <p className="text-xs text-slate-500 mt-1">{"Account Session Status: Verified. Active."}</p>
          </div>
          {userProfile?.is_admin && (
            <Link href="/admin" className="text-[10px] bg-red-950/20 border border-red-900/30 text-red-400 px-3 py-1 rounded-md uppercase font-mono font-bold tracking-wider hover:bg-red-950/40">
              {"Open Admin Terminal"}
            </Link>
          )}
        </div>

        {/* Global Analytics Usage Indicators Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Dossier Access Count</span>
            <span className="text-xl font-bold font-mono text-indigo-400 mt-1 block">14 <span className="text-[10px] text-slate-600 font-normal">views</span></span>
          </div>
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">ATS Keyword Index</span>
            <span className="text-xl font-bold font-mono text-purple-400 mt-1 block">85% <span className="text-[10px] text-slate-600 font-normal">score</span></span>
          </div>
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl col-span-2 md:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Subscription Tier</span>
            <span className="text-sm font-bold font-mono text-green-400 mt-1 flex items-center gap-1.5 uppercase">
              <Sparkles size={12} className="animate-pulse" /> {userProfile?.is_premium ? 'PREMIUM UNLOCKED' : 'STANDARD FREE'}
            </span>
          </div>
        </div>

        {/* PREMIUM SCARPER RADAR INTERFACE NOTIFICATION */}
        {userProfile?.is_premium && (
          <div className="mb-8 p-5 bg-gradient-to-r from-emerald-950/30 via-slate-900/40 to-slate-900/40 border border-emerald-500/20 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="space-y-1">
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase border border-emerald-500/20">📡 Automated Scraper Radar Scan Active</span>
              <h3 className="text-sm font-bold text-white mt-3 flex items-center gap-1.5"><Briefcase size={14} className="text-emerald-400" /> Sourced Lead Located: Remote Full-Stack Engineer</h3>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed text-justify">
                Our web scrapper has successfully located matching position criteria from local freelance arrays. A custom pipeline application card has been auto-placed into your Sent Tracking Board lanes matrix layout.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* TRACK A: PROGRAMMER PORTFOLIO WORKSPACE */}
          {showDev && (
            <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-wider uppercase">
                  <Code size={10} /> {"Developer Portfolio Engine Active"}
                </div>
                <h2 className="text-lg font-bold text-white">{"Your Engineering Profile"}</h2>
                <p className="text-xs text-slate-400 max-w-xl">
                  {"Connect project data nodes, map technical language badges, and auto-compile copyable profile README files for your GitHub repositories."}
                </p>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/portfolio-builder" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all">
                  {"🛠️ Open Programmer Portfolio Builder"}
                </Link>
                <Link href="/directory" className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:border-slate-700 transition-all">
                  {"🔍 Browse Candidate Marketplace"}
                </Link>
              </div>
            </div>
          )}

          {/* TRACK B: GENERAL APPLICANT CV WORKSPACE */}
          {showCV && (
            <div className="p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 relative overflow-hidden">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold tracking-wider uppercase">
                  <FileText size={10} /> {"ATS-Optimized CV Engine Active"}
                </div>
                <h2 className="text-lg font-bold text-white">{"Your Professional Resume Blueprint"}</h2>
                <p className="text-xs text-slate-400 max-w-xl">
                  {"Structure standard, bot-friendly layout sheets. Uses built-in vocabulary advisors to optimize points for recruitment parsed tracking filters."}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/cv-builder" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-all">
                  {"+ Edit CV Document"}
                </Link>
                <Link href="/tracker" className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:border-slate-700 transition-all">
                  {"📋 Track Sent Applications"}
                </Link>
                <Link href="/analyzer" className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:border-slate-700 transition-all">
                  {"🔍 Scan Job Keyword Match"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
