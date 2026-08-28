'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Code, FileText, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const checkUserSession = async () => {
      // 1. Get the current active user session
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // If not logged in, redirect them back to the registration page safely
        router.push('/register');
        return;
      }

      // 2. Query our public.profiles database table for user type records
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }
      setLoading(false);
    };

    checkUserSession();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-indigo-500" size={20} />
        <span>Syncing Cloud Profile Workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Dashboard Sidebar Workspace */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-900/20 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">DC</div>
            <span className="font-bold text-sm tracking-tight text-white">Console Engine</span>
          </div>

          <nav className="space-y-1">
            <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors">
              <Settings size={14} /> {"Account Configurations"}
            </Link>
            <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors">
              <Settings size={14} /> {"Account Configurations"}
            </Link>
          </nav>
        </div>

        <button onClick={handleSignOut} className="mt-8 flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-red-400 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-500/5 border border-transparent hover:border-red-500/10">
          <LogOut size={14} /> {"Disconnect Session"}
        </button>
      </aside>

      {/* Main Workspace Switchboard Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">{"Welcome back, "}{userProfile?.full_name || "Applicant"}</h1>
          <p className="text-xs text-slate-500 mt-1">{"Account Session Status: Verified. Active."}</p>
        </div>

        {/* Corporate Console Usage Indicators Metrics Grid panel rows containers */}
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Storage Vault Data weight</span>
            <span className="text-xl font-bold font-mono text-green-400 mt-1 block">1.2 <span className="text-[10px] text-slate-600 font-normal">MB of 50MB</span></span>
          </div>
        </div>

        {/* Dynamic Branch Rendering Based on User Type Category fields */}
        {userProfile?.user_type === 'programmer' ? (
          /* DEVELOPER WORKSPACE */
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-wider uppercase">
                    <Code size={10} /> {"Developer Portfolio Engine Active"}
                  </div>
                  <h2 className="text-lg font-bold text-white">{"Your Live Portfolio Status"}</h2>
                  <p className="text-xs text-slate-400 max-w-xl">
                    {"Connect your repository networks to import projects instantly. When printed physically, this view changes to a streamlined recruiter summary page."}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/portfolio-builder">
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all">
                    {"🛠️ Open Programmer Portfolio Builder"}
                  </button>
                </Link>
                <button className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:border-slate-700 transition-all">
                  {"Preview Online View"}
                </button>
              </div>
            </div>

            {/* Placeholder Container For Repository Layout Blocks */}
            <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-600">
              {"No repositories synced yet. Link GitHub above to populate workspace projects."}
            </div>
          </div>
        ) : (
          /* GENERAL PUBLIC CV WORKSPACE */
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold tracking-wider uppercase">
                    <FileText size={10} /> {"ATS-Optimized CV Engine Active"}
                  </div>
                  <h2 className="text-lg font-bold text-white">{"Your Professional Resume Blueprint"}</h2>
                  <p className="text-xs text-slate-400 max-w-xl">
                    {"Type your work history details below. The system automatically structures margins, text hierarchies, and keywords so parsing machines can index your content cleanly."}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/cv-builder" className="inline-block">
                  <span className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer inline-block">
                    {"+ Create New CV Version"}
                  </span>
                </Link>
                <Link href="/tracker" className="inline-block">
                  <span className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all cursor-pointer inline-block">
                    {"📋 Track Sent Applications"}
                  </span>
                </Link>
                <Link href="/analyzer" className="inline-block">
                  <span className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all cursor-pointer inline-block">
                    {"🔍 Scan Job Keyword Match"}
                  </span>
                </Link>
              </div>
            </div>

            {/* Placeholder Container For Resumes Histories Layout Blocks */}
            <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-600">
              {"No CV versions initialized yet. Click above to start building an ATS-friendly draft."}
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
