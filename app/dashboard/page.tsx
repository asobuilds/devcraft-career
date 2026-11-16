'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Loader2,
  FileText,
  ScanSearch,
  PenLine,
  ListChecks,
  Globe,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

type Profile = {
  full_name?: string;
  is_admin?: boolean;
  is_premium?: boolean;
};

export default function Dashboard() {
  const router = useRouter();

  const [syncing, setSyncing] = useState(true);
  const [loadPercentage, setLoadPercentage] = useState(0);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

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
      }

      setTimeout(() => {
        setSyncing(false);
      }, 300);
    };

    checkUserSession();
    return () => clearInterval(speedInterval);
  }, [router]);

  if (syncing) {
    return (
      <div className="w-full flex flex-col items-center justify-center text-slate-400 gap-4 py-24">
        <Loader2 className="animate-spin text-orange-500 h-8 w-8" />
        <div className="text-sm font-semibold tracking-wide text-white">Synchronizing System Cockpit...</div>
        <div className="w-48 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div className="bg-orange-500 h-full transition-all duration-75" style={{ width: `${loadPercentage}%` }} />
        </div>
        <span className="text-xs font-mono text-orange-400">{loadPercentage}% Loaded</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto p-6 md:p-10">
      {/* Top Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Welcome back, <span className="text-orange-400">{userProfile?.full_name || 'User'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Account Session Status: Verified. Active.</p>
        </div>
        {userProfile?.is_admin && (
          <Link
            href="/admin"
            className="self-start text-[10px] bg-red-950/20 border border-red-900/30 text-red-400 px-3 py-1 rounded-md uppercase font-mono font-bold tracking-wider hover:bg-red-950/40"
          >
            Open Admin Terminal
          </Link>
        )}
      </div>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Dossier Access Count</span>
          <span className="text-base font-bold font-mono text-orange-400 mt-0.5 block">
            14 <span className="text-[10px] text-slate-600 font-normal">views</span>
          </span>
        </div>
        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">ATS Keyword Index</span>
          <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
            85% <span className="text-[10px] text-slate-600 font-normal">score</span>
          </span>
        </div>
        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Subscription Tier</span>
          <span className="text-xs font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1.5 uppercase">
            <Sparkles size={12} className="animate-pulse" />
            {userProfile?.is_premium ? 'Premium Unlocked' : 'Standard Free'}
          </span>
        </div>
      </div>

      {/* Bento Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* CV Builder — Hero Card */}
        <Link
          href="/cv-builder"
          className="group md:col-span-8 relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-600 via-orange-500 to-emerald-600 p-6 md:p-8 flex flex-col justify-between"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-white/15 text-white mb-5">
              <FileText size={22} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Your Next Role Starts Here</h2>
            <p className="mt-3 text-sm md:text-base text-orange-100 max-w-lg">
              Build an ATS-proof CV in minutes. Choose from 8 professional templates and export as PDF.
            </p>
          </div>
          <div className="relative z-10 mt-8">
            <span className="inline-flex items-center gap-2 bg-white text-orange-700 font-semibold text-sm px-5 py-2.5 rounded-xl group-hover:bg-orange-50 transition-colors">
              Build CV Now
              <ArrowRight size={16} />
            </span>
          </div>
        </Link>

        {/* ATS Analyzer */}
        <Link
          href="/analyzer"
          className="group md:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col hover:border-emerald-500/40 transition-colors"
        >
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
            <ScanSearch size={22} />
          </div>
          <h2 className="text-lg font-bold text-white">Beat the Robots</h2>
          <p className="mt-2 text-sm text-slate-400 flex-1">
            Paste a job description and your CV. We&apos;ll show you exactly which keywords you&apos;re missing.
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400">
            Open Analyzer
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>

        {/* Cover Letter */}
        <Link
          href="/cover-letter"
          className="group md:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col hover:border-orange-500/40 transition-colors"
        >
          <div className="h-11 w-11 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-5">
            <PenLine size={22} />
          </div>
          <h2 className="text-lg font-bold text-white">Write in Seconds</h2>
          <p className="mt-2 text-sm text-slate-400 flex-1">
            Generate a tailored cover letter that matches the job description instantly.
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-orange-400">
            Write Cover Letter
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>

        {/* Job Tracker */}
        <Link
          href="/tracker"
          className="group md:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col hover:border-orange-500/40 transition-colors"
        >
          <div className="h-11 w-11 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-5">
            <ListChecks size={22} />
          </div>
          <h2 className="text-lg font-bold text-white">Stay Organized</h2>
          <p className="mt-2 text-sm text-slate-400 flex-1">
            Track every application from &lsquo;Applied&rsquo; to &lsquo;Offer&rsquo; in one simple board.
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-orange-400">
            Open Tracker
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>

        {/* Portfolio */}
        <Link
          href="/portfolio-builder"
          className="group md:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col hover:border-orange-500/40 transition-colors"
        >
          <div className="h-11 w-11 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-5">
            <Globe size={22} />
          </div>
          <h2 className="text-lg font-bold text-white">Show, Don&apos;t Just Tell</h2>
          <p className="mt-2 text-sm text-slate-400 flex-1">
            Turn your CV into a live portfolio website to share with recruiters.
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-orange-400">
            Build Portfolio
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>
    </div>
  );
}
