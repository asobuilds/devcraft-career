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
  Download,
} from 'lucide-react';
import Link from 'next/link';

type Profile = {
  full_name?: string;
  is_admin?: boolean;
  avatar_url?: string | null;
  cover_url?: string | null;
};

const checklistTasks = [
  { label: 'Build or Upload your CV', href: '/cv-builder' },
  { label: 'Run an ATS scan against a job description', href: '/analyzer' },
  { label: 'Generate a custom Cover Letter', href: '/cover-letter' },
  { label: 'Claim your public portfolio link (devcraft-career.com/p/your-name)', href: '/portfolio-builder' },
];

const toolkit = [
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
  const [downloadingCv, setDownloadingCv] = useState(false);
  const [cvDownloadError, setCvDownloadError] = useState('');

  const completedCount = completedSteps.filter(Boolean).length;

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.map((done, i) => (i === index ? !done : done))
    );
  };

  const handleDownloadLatestCv = async () => {
    setDownloadingCv(true);
    setCvDownloadError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please sign in again to download your CV.');
      }

      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (resumeError) throw resumeError;
      if (!resumeData) {
        throw new Error('No CV found yet. Build your CV first.');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone, website')
        .eq('id', user.id)
        .maybeSingle();

      const { pdf } = await import('@react-pdf/renderer');
      const { default: PdfDocumentRouter } = await import(
        '@/app/cv-builder/components/PdfDocumentRouter'
      );

      const skills = Array.isArray(resumeData.skills)
        ? resumeData.skills.join(', ')
        : typeof resumeData.skills === 'string'
          ? resumeData.skills
          : '';

      const pdfDocument = (
        <PdfDocumentRouter
          theme={resumeData.active_template || 'modern-indigo'}
          fullName={profile?.full_name || userProfile?.full_name || 'Your Name'}
          email={profile?.email || user.email || ''}
          phone={profile?.phone || ''}
          website={profile?.website || ''}
          summary={resumeData.summary || ''}
          skills={skills}
          experience={Array.isArray(resumeData.experience) ? resumeData.experience : []}
        />
      );

      const blob = await pdf(pdfDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeTitle = String(resumeData.resume_title || 'devcraft-cv')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      link.href = url;
      link.download = `${safeTitle || 'devcraft-cv'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not export your CV.';
      setCvDownloadError(message);
    } finally {
      setDownloadingCv(false);
    }
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
    <div className="w-full max-w-[1400px] mx-auto px-4 py-6 md:p-10">
      {/* Cover Banner */}
      {userProfile?.cover_url && (
        <div className="relative -mx-4 sm:-mx-6 md:-mx-10 mb-6 overflow-hidden rounded-2xl border border-slate-800">
          <img
            src={userProfile.cover_url}
            alt="Cover"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>
      )}

      {/* Top Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {userProfile?.avatar_url && (
            <img
              src={userProfile.avatar_url}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-orange-500 ring-offset-4 ring-offset-slate-950 shrink-0"
            />
          )}
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              Welcome back, <span className="text-orange-400">{userProfile?.full_name || 'User'}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Account Session Status: Verified. Active.</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            onClick={handleDownloadLatestCv}
            disabled={downloadingCv}
            className="inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-xs font-semibold text-orange-300 transition-colors hover:bg-orange-500/20 disabled:opacity-50"
          >
            {downloadingCv ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {downloadingCv ? 'Preparing PDF...' : 'Download Latest CV'}
          </button>
          {cvDownloadError ? (
            <span className="max-w-xs text-[10px] text-red-400">{cvDownloadError}</span>
          ) : null}
          {userProfile?.is_admin && (
            <Link
              href="/admin"
              className="text-[10px] bg-red-950/20 border border-red-900/30 text-red-400 px-3 py-1 rounded-md uppercase font-mono font-bold tracking-wider hover:bg-red-950/40"
            >
              Open Admin Terminal
            </Link>
          )}
        </div>
      </div>

      {/* Job-Ready Checklist */}
      <section className="relative mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-slate-950/50" />
        <div className="relative z-10">
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
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${done ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-600 text-transparent hover:border-emerald-500/60'}`}
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
        </div>
      </section>

      {/* Next Step Hero */}
      <Link
        href="/cv-builder"
        className="group relative mb-10 flex flex-col justify-between overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-600 via-orange-500 to-emerald-600 px-4 py-6 md:p-8"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolkit.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                style={{ animationDelay: `${(index + 1) * 50}ms` }}
                className="animate-toolkit-in group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:bg-slate-800/60 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-5 top-5 select-none font-mono text-[11px] font-bold tracking-widest text-slate-700"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="relative z-10 flex h-full flex-col">
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${tool.accent}`}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    <span className="font-semibold text-slate-300">How to use:</span> {tool.howTo}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-orange-400">
                    Open <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
