'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Code, FileText, Folder, Briefcase } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar is now rendered globally in layout.jsx */}

      {/* Offset container - shifts when sidebar expands on desktop, slides on mobile */}
      <div className="md:pl-64 transition-all duration-300">
        <main className="p-6 md:p-10 max-w-5xl">
          {/* Welcome Section */}
          <div className="mb-8 animate-in" style={{ transitionDelay: '0s' }}>
            <div className="border-b border-slate-900 pb-6">
              <h1 className="text-3xl font-bold text-slate-100">Welcome back, {userProfile?.full_name || 'User'}</h1>
              <p className="text-xs text-slate-500 mt-1">Account Session Status: Verified. Active.</p>
            </div>
            <p className="text-slate-400 text-lg mt-4 leading-relaxed">
              Your personal career optimization dashboard. Track applications, analyze resumes,
              build cover letters, and discover matching job opportunities all in one place.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-in" style={{ transitionDelay: '0.1s' }}>
            {/* CV Builder Card */}
            <div className="group rounded-2xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors cursor-pointer">
              <div className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                  <Code size={24} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-100 group-hover:text-indigo-300 transition-colors">CV Builder</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Create professional, ATS-optimized resumes with drag-and-drop sections, template themes, and real-time content analysis.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/cv-builder" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all">
                  Get Started
                </Link>
              </div>
            </div>

            {/* ATS Analyzer Card */}
            <div className="group rounded-2xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors cursor-pointer">
              <div className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <FileText size={24} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-100 group-hover:text-purple-300 transition-colors">ATS Analyzer</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Run your resume through advanced ATS scoring to identify keyword gaps and optimization opportunities.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/analyzer" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-all">
                  Analyze Resume
                </Link>
              </div>
            </div>

            {/* Cover Letter Card */}
            <div className="group rounded-2xl border border-indigo-600/20 bg-indigo-600/5 hover:bg-indigo-600/10 transition-colors cursor-pointer">
              <div className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors">
                  <Folder size={24} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-100 group-hover:text-indigo-300 transition-colors">Cover Letter Generator</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Generate personalized cover letters in seconds by pasting a job description and your skills.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/cover-letter" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all">
                  Write Cover Letter
                </Link>
              </div>
            </div>

            {/* Job Tracker Card */}
            <div className="group rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer">
              <div className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Briefcase size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-100 group-hover:text-emerald-300 transition-colors">Job Tracker</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Track job applications, monitor status changes, and manage your job search pipeline.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/tracker" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all">
                  Track Applications
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}