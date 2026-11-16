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
  Users,
  Check,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

type Profile = {
  full_name?: string;
  is_admin?: boolean;
  is_premium?: boolean;
};

const checklistTasks = [
  { label: 'Build or Upload your CV', href: '/cv-builder' },
  { label: 'Run an ATS scan against a job description', href: '/analyzer' },
  { label: 'Generate a custom Cover Letter', href: '/cover-letter' },
  { label: 'Claim your public portfolio link (devcraft-career.com/p/your-name)', href: '/portfolio-builder' },
];

const toolkit = [
  {
    title: 'Build CV',
    href: '/cv-builder',
    icon: FileText,
    accent: 'text-orange-400 bg-orange-500/10',
    howTo: 'Choose from 8 ATS-friendly templates.',
  },
  {
    title: 'Beat the ATS',
    href: '/analyzer',
    icon: ScanSearch,
    accent: 'text-emerald-400 bg-emerald-500/10',
    howTo: 'Paste a job description to see missing keywords.',
  },
  {
    title: 'Write Cover Letter',
    href: '/cover-letter',
    icon: PenLine,
    accent: 'text-orange-400 bg-orange-500/10',
    howTo: 'Generate a tailored letter in seconds.',
  },
  {
    title: 'Job Tracker',
    href: '/tracker',
    icon: ListChecks,
    accent: 'text-orange-400 bg-orange-500/10',
    howTo: 'Log applications and track interviews.',
  },
  {
    title: 'My Portfolio',
    href: '/portfolio-builder',
    icon: Globe,
    accent: 'text-orange-400 bg-orange-500/10',
    howTo: 'Create a shareable link for recruiters.',
  },
  {
    title: 'Find Talent',
    href: '/directory',
    icon: Users,
    accent: 'text-emerald-400 bg-emerald-500/10',
    howTo: 'Browse other candidates in the directory.',
  },
];

export default function Dashboard() {
  const router = useRouter();

  const [syncing, setSyncing] = useState(true);
  const [loadPercentage, setLoadPercentage] = useState(0);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    checklistTasks.map(() => false)
  );

  const completedCount = completedSteps.filter(Boolean).length;

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.map((done, i) => (i === index ? !done : done))
    );
  };

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

      {/* Job-Ready Checklist */}
      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Your Job-Ready Checklist</h2>
            <p className="text-xs text-slate-500 mt-1">A guided path from blank page to interview.</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400">
            {completedCount} of {checklistTasks.length} steps completed
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 mb-6">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(completedCount / checklistTasks.length) * 100}%` }}
          />
        </div>

        <ul className="space-y-2">
          {checklistTasks.map((task, index) => {
            const done = completedSteps[index];
            return (
              <li key={task.label}>
                <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleStep(index)}
                    aria-pressed={done}
                    aria-label={done ? `Mark "${task.label}" as incomplete` : `Mark "${task.label}" as complete`}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      done
                        ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                        : 'border-slate-600 text-transparent hover:border-emerald-500/60'
                    }`}
                  >
                    <Check size={13} strokeWidth={3} />
                  </button>
                  <Link
                    href={task.href}
                    className={`flex-1 text-sm ${done ? 'text-slate-500 line-through' : 'text-slate-200'}`}
                  >
                    {task.label}
                  </Link>
                  <Link
                    href={task.href}
                    className="ml-auto shrink-0 text-[11px] font-semibold text-orange-400 hover:text-orange-300"
                  >
                    Open
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Next Step Hero */}
      <Link
        href="/cv-builder"
        className="group relative mb-10 flex flex-col justify-between overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-600 via-orange-500 to-emerald-600 p-6 md:p-8"
      >
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-white/15 text-white mb-5">
            <FileText size={22} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Step 1: Build Your CV</h2>
          <p className="mt-3 text-sm md:text-base text-orange-100 max-w-lg">
            Whether you&apos;re applying to a Lagos fintech, a remote US startup, or a government parastatal, we&apos;ve got the tools to get you past the bots and in front of a human.
          </p>
        </div>
        <div className="relative z-10 mt-8">
          <span className="inline-flex items-center gap-2 bg-white text-orange-700 font-semibold text-sm px-5 py-2.5 rounded-xl group-hover:bg-orange-50 transition-colors">
            Start Building
            <ArrowRight size={16} />
          </span>
        </div>
      </Link>

      {/* Career Toolkit */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-white">Your Career Toolkit</h2>
          <p className="text-xs text-slate-500 mt-1">Every tool, with a quick guide on how to use it.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {toolkit.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-colors hover:border-orange-500/40"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tool.accent}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-bold text-white">{tool.title}</h3>
                <p className="mt-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-400">How to use:</span> {tool.howTo}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-orange-400">
                  Open <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
