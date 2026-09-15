'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Trash2, Loader2, Briefcase, Zap, Terminal, ExternalLink, CheckCircle2, Radar } from 'lucide-react';
import Link from 'next/link';

interface ApplicationItem {
  id: string;
  company_name: string;
  job_title: string;
  status: 'lead' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  salary_range?: string;
  apply_url?: string;
  notes?: string;
}

const SCAN_LOG_STEPS = [
  '[INIT] Connecting to job source network...',
  '[SCAN] Querying Adzuna, Jooble, RemoteOK...',
  '[SCAN] Querying Himalayas, Remotive, The Muse...',
  '[SCAN] Querying JSearch and custom sources...',
  '[FILTER] Scoring matches against your skills...',
  '[FILTER] Applying location filter...',
  '[DONE] Compiling results...',
];

export default function JobTracker() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [apps, setApps] = useState<ApplicationItem[]>([]);

  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [salary, setSalary] = useState('');

  const [scanning, setScanning] = useState(false);
  const [scanLogIndex, setScanLogIndex] = useState(0);
  const [scanMessage, setScanMessage] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id);

      if (data) setApps(data as ApplicationItem[]);
      setLoading(false);
    };

    fetchApplications();
  }, [router]);

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !company || !title) return;

    const newRow = {
      user_id: userId,
      company_name: company,
      job_title: title,
      status: 'applied' as const,
      salary_range: salary,
    };

    const { data, error } = await supabase
      .from('job_applications')
      .insert([newRow])
      .select()
      .single();

    if (!error && data) {
      setApps([...apps, data as ApplicationItem]);
      setCompany('');
      setTitle('');
      setSalary('');
    }
  };

  // --- UPGRADE: Optimistic UI State Updates Strategy ---
  const handleUpdateStatus = async (id: string, nextStatus: ApplicationItem['status']) => {
    // 1. Instantly save original state backup configuration in case server fails
    const originalApps = [...apps];

    // 2. Perform Optimistic Update: Change the visual UI state instantly before writing to DB
    setApps(apps.map(a => a.id === id ? { ...a, status: nextStatus } : a));

    // 3. Silently dispatch the write instruction payload to Supabase background threads
    const { error } = await supabase
      .from('job_applications')
      .update({ status: nextStatus })
      .eq('id', id);

    // 4. Rollback visual state if a server dropout error occurs
    if (error) {
      setApps(originalApps);
      alert('⚠️ Cloud sync drop detected. Rolling back card state parameters.');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    const originalApps = [...apps];
    setApps(apps.filter(a => a.id !== id));

    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);

    if (error) {
      setApps(originalApps);
      alert('⚠️ Erase sequence failed. Card rolled back.');
    }
  };

  const handleApplyClick = (card: ApplicationItem) => {
    if (card.apply_url) {
      window.open(card.apply_url, '_blank', 'noopener,noreferrer');
    }
    handleUpdateStatus(card.id, 'applied');
  };

  const handleFindJobsNow = async () => {
    if (!userId) return;

    setScanning(true);
    setScanLogIndex(0);
    setScanMessage('');

    const logInterval = setInterval(() => {
      setScanLogIndex((prev) => (prev < SCAN_LOG_STEPS.length - 1 ? prev + 1 : prev));
    }, 500);

    try {
      const response = await fetch('/api/source-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, location: 'Nigeria' }),
      });
      const result = await response.json();

      clearInterval(logInterval);
      setScanLogIndex(SCAN_LOG_STEPS.length - 1);

      if (!result.success) {
        setScanMessage(result.message || 'Job leads are a Premium feature.');
        setTimeout(() => setScanning(false), 1800);
        return;
      }

      const leads = (result.leads || []).slice(0, 8);

      if (leads.length === 0) {
        setScanMessage('No new matches found this time. We will keep checking.');
        setTimeout(() => setScanning(false), 1800);
        return;
      }

      const newRows = leads.map((job: any) => ({
        user_id: userId,
        company_name: job.company,
        job_title: job.title,
        status: 'lead' as const,
        salary_range: job.salary || 'Not listed',
        apply_url: job.url,
        notes: 'Sourced from ' + job.source + ' (' + job.matchScore + '% match).',
      }));

      const { data: inserted, error: insertError } = await supabase
        .from('job_applications')
        .insert(newRows)
        .select();

      if (!insertError && inserted) {
        setApps((prev) => [...prev, ...(inserted as ApplicationItem[])]);
        setScanMessage(inserted.length + ' new match(es) added to Scraped Matches.');
      } else {
        setScanMessage('Found matches but could not save them. Try again.');
      }

      setTimeout(() => setScanning(false), 1800);
    } catch (error: any) {
      clearInterval(logInterval);
      setScanMessage('Scan failed: ' + error.message);
      setTimeout(() => setScanning(false), 1800);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-indigo-500" size={20} />
        <span>Synchronizing Core CRM Engine...</span>
      </div>
    );
  }

  const sections: Array<{ key: ApplicationItem['status']; label: string }> = [
    { key: 'lead', label: 'Scraped Matches' },
    { key: 'applied', label: 'Applied' },
    { key: 'interviewing', label: 'Interviewing' },
    { key: 'offered', label: 'Offered' },
    { key: 'rejected', label: 'Archived' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">

      {scanning ? (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-950 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-900 bg-slate-900/60">
              <Terminal size={14} className="text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400">scraper-engine.log</span>
            </div>
            <div className="p-4 font-mono text-[11px] text-emerald-400 space-y-1.5 min-h-[160px]">
              {SCAN_LOG_STEPS.slice(0, scanLogIndex + 1).map((line, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index < scanLogIndex ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0" /> : <Loader2 size={11} className="animate-spin text-emerald-400 shrink-0" />}
                  <span>{line}</span>
                </div>
              ))}
              {scanMessage ? (
                <p className="text-slate-300 pt-2 border-t border-slate-900 mt-2">{scanMessage}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-900">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Job Search Board Terminal</h1>
            <p className="text-xs text-slate-500 mt-0.5">Optimistic Live Sync Engine Active.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleFindJobsNow}
            disabled={scanning}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            <Radar size={14} /> Find Jobs Now
          </button>

          <form onSubmit={handleAddApplication} className="flex flex-wrap items-center gap-2 bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl max-w-2xl w-full">
            <input type="text" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 flex-1 min-w-[120px]" required />
            <input type="text" placeholder="Position" value={title} onChange={e => setTitle(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 flex-1 min-w-[120px]" required />
            <input type="text" placeholder="Salary" value={salary} onChange={e => setSalary(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 w-28" />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1">
              <Plus size={12} /> Add
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
        {sections.map(({ key: columnKey, label }) => {
          const filteredCards = apps.filter(item => item.status === columnKey);
          return (
            <div key={columnKey} className="bg-slate-900/20 border border-slate-900 rounded-2xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 font-mono font-bold border border-slate-800">{filteredCards.length}</span>
              </div>

              <div className="space-y-3 min-h-[250px]">
                {filteredCards.map(card => (
                  <div key={card.id} className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl space-y-3 shadow-md hover:border-slate-700 transition-all group relative">
                    <button onClick={() => handleDeleteApplication(card.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400 hidden group-hover:block transition-colors">
                      <Trash2 size={12} />
                    </button>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white tracking-wide truncate pr-4">{card.job_title}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Briefcase size={10} className="text-slate-500" />
                        <span className="truncate">{card.company_name}</span>
                      </div>
                    </div>
                    {card.salary_range ? <p className="text-[10px] text-slate-500 font-mono">{card.salary_range}</p> : null}

                    {columnKey === 'lead' && card.apply_url ? (
                      <button
                        onClick={() => handleApplyClick(card)}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/20 text-[10px] font-semibold py-2 rounded-lg transition-colors"
                      >
                        <ExternalLink size={11} /> Apply &amp; Move to Applied
                      </button>
                    ) : (
                      <div className="pt-2 border-t border-slate-900 flex justify-end gap-1">
                        <select
                          value={card.status}
                          onChange={(e) => handleUpdateStatus(card.id, e.target.value as any)}
                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-400 font-medium focus:outline-none"
                        >
                          <option value="lead">Move to Scraped Matches</option>
                          <option value="applied">Move to Applied</option>
                          <option value="interviewing">Move to Interview</option>
                          <option value="offered">Move to Offered</option>
                          <option value="rejected">Move to Archived</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
                {filteredCards.length === 0 ? <p className="text-center text-[10px] text-slate-700 py-10 italic">Lane clear</p> : null}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}