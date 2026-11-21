'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Trash2, Loader2, Briefcase, Terminal, ExternalLink, CheckCircle2, X, AlertCircle, Sparkles, Calendar, Search } from 'lucide-react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import AIAssistant from '@/app/components/AIAssistant';

interface ApplicationItem {
  id: string;
  company_name: string;
  job_title: string;
  status: 'lead' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  salary_range?: string;
  apply_url?: string;
  notes?: string;
  created_at?: string;
}

type BoardStatus = 'lead' | 'applied' | 'interviewing' | 'offered' | 'rejected';

const BOARD_COLUMNS: Array<{ key: BoardStatus; label: string; dot: string; subtext: string }> = [
  { key: 'lead', label: 'Wishlist', dot: 'bg-slate-400', subtext: 'Jobs you want to apply for.' },
  { key: 'applied', label: 'Applied', dot: 'bg-sky-400', subtext: 'Applications sent.' },
  { key: 'interviewing', label: 'Interviewing', dot: 'bg-amber-400', subtext: 'Active conversations.' },
  { key: 'offered', label: 'Offer', dot: 'bg-emerald-400', subtext: 'Congratulations!' },
  { key: 'rejected', label: 'Rejected', dot: 'bg-red-400', subtext: 'Keep for reference.' },
];

function formatAppliedDate(value?: string): string {
  if (!value) return 'No date';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'No date';
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface SourcedLead {
  company?: string;
  title?: string;
  salary?: string;
  url?: string;
  source?: string;
  matchScore?: number;
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
  const [userName, setUserName] = useState('');
  const [userSkills, setUserSkills] = useState<string[]>([]);

  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const [scanning, setScanning] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [scanLogIndex, setScanLogIndex] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      try {
        const { data } = await supabase
          .from('job_applications')
          .select('*')
          .eq('user_id', user.id);

        if (data) setApps(data as ApplicationItem[]);
      } catch {
        setToast({ type: 'error', message: 'Failed to load applications. Please refresh.' });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, tech_stack')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserName(profile.full_name || '');
        setUserSkills(
          typeof profile.tech_stack === 'string'
            ? profile.tech_stack.split(',').map((skill: string) => skill.trim()).filter(Boolean)
            : []
        );
      }
    };

    loadProfile();
  }, []);

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !company || !title) return;

    const newRow = {
      user_id: userId,
      company_name: company,
      job_title: title,
      status: 'applied' as const,
      salary_range: salary,
      created_at: appliedDate ? new Date(appliedDate).toISOString() : new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('job_applications')
      .insert([newRow])
      .select()
      .maybeSingle();

    if (!error && data) {
      setApps([...apps, data as ApplicationItem]);
      setCompany('');
      setTitle('');
      setSalary('');
      setAppliedDate('');
      setShowAddModal(false);
      setToast({ type: 'success', message: 'Application added successfully.' });
    } else if (error) {
      setToast({ type: 'error', message: 'Failed to add application. Please try again.' });
    }
  };

  const handleLoadDemoData = async () => {
    if (!userId || loadingDemo) return;
    setLoadingDemo(true);

    const now = Date.now();
    const demoApplications = [
      {
        user_id: userId,
        company_name: 'Google',
        job_title: 'Frontend Engineer',
        status: 'applied',
        salary_range: '₦1,200,000 / mo',
        apply_url: 'https://careers.google.com',
        notes: 'Lagos, Nigeria · Hybrid',
        created_at: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_id: userId,
        company_name: 'Flutterwave',
        job_title: 'React Developer',
        status: 'interviewing',
        salary_range: '₦900,000 / mo',
        apply_url: 'https://flutterwave.com/careers',
        notes: 'Lagos, Nigeria · Remote-friendly',
        created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_id: userId,
        company_name: 'Paystack',
        job_title: 'Product Designer',
        status: 'lead',
        salary_range: '₦850,000 / mo',
        apply_url: 'https://paystack.com/careers',
        notes: 'Lagos, Nigeria · Full-time',
        created_at: new Date(now).toISOString(),
      },
    ];

    const { error } = await supabase.from('job_applications').insert(demoApplications);

    if (error) {
      setToast({ type: 'error', message: 'Could not load demo applications. Please try again.' });
      setLoadingDemo(false);
      return;
    }

    const { data } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setApps(data as ApplicationItem[]);
    setToast({ type: 'success', message: 'Demo applications loaded.' });
    setLoadingDemo(false);
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
      setToast({ type: 'error', message: 'Cloud sync drop detected. Rolling back card state parameters.' });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const nextStatus = destination.droppableId as BoardStatus;
    const originalApps = apps;
    const card = apps.find((item) => item.id === draggableId);
    if (!card || card.status === nextStatus) return;

    setApps((prev) =>
      prev.map((item) =>
        item.id === draggableId ? { ...item, status: nextStatus } : item
      )
    );

    const { error } = await supabase
      .from('job_applications')
      .update({ status: nextStatus })
      .eq('id', draggableId);

    if (error) {
      setApps(originalApps);
      setToast({ type: 'error', message: 'Cloud sync failed. The card was moved back.' });
    }
  };

  const handleDeleteApplication = async (id: string) => {    const originalApps = [...apps];
    setApps(apps.filter(a => a.id !== id));

    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);

    if (error) {
      setApps(originalApps);
      setToast({ type: 'error', message: 'Erase sequence failed. Card rolled back.' });
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
        },
        body: JSON.stringify({ location: 'Nigeria' }),
      });
      const result = await response.json();

      clearInterval(logInterval);
      setScanLogIndex(SCAN_LOG_STEPS.length - 1);

      if (!result.success) {
        setScanMessage(result.message || 'Could not fetch job leads right now.');
        setTimeout(() => setScanning(false), 1800);
        return;
      }

      const leads: SourcedLead[] = (result.leads || []).slice(0, 8);

      if (leads.length === 0) {
        setScanMessage('No new matches found this time. We will keep checking.');
        setTimeout(() => setScanning(false), 1800);
        return;
      }

      const newRows = leads.map((job: SourcedLead) => ({
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
    } catch (error) {
      clearInterval(logInterval);
      setScanMessage('Scan failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setTimeout(() => setScanning(false), 1800);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-800 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-48 bg-slate-800 rounded animate-pulse" />
              <div className="h-3 w-36 bg-slate-900 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-9 w-28 bg-emerald-700/20 rounded-xl animate-pulse" />
            <div className="h-9 flex-1 min-w-[200px] bg-slate-800/60 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
          {['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'].map((label, i) => (
            <div key={i} className="bg-slate-900/20 border border-slate-900 rounded-2xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <div className="h-3 w-24 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-6 bg-slate-800 rounded-full animate-pulse" />
              </div>
              <div className="space-y-3 min-h-[250px]">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-2 animate-pulse">
                    <div className="h-3 w-3/4 bg-slate-800 rounded" />
                    <div className="h-2.5 w-1/2 bg-slate-800/60 rounded" />
                    <div className="h-5 w-full bg-slate-800/40 rounded mt-2" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">

      {toast && (
        <div className={`fixed top-4 right-4 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-xs font-medium max-w-sm ${
          toast.type === 'success' ? 'bg-green-950/90 border-green-500/30 text-green-300' :
          toast.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-300' :
          'bg-indigo-950/90 border-indigo-500/30 text-indigo-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={12} />
          </button>
        </div>
      )}

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
            <h1 className="text-xl font-bold text-white">Your Job Application Tracker</h1>
            <p className="text-xs text-slate-500 mt-0.5">Keep track of every application. From &apos;Applied&apos; to &apos;Interview&apos; to &apos;Offer&apos;. Never lose track of a job lead again.</p>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 leading-relaxed">
              Track every application in one place. Drag and drop cards to update your status. Use the AI Copilot to analyze your pipeline and find out where to focus your energy.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            <Plus size={14} /> Add Job
          </button>

          {apps.length === 0 && (
            <button
              onClick={handleLoadDemoData}
              disabled={loadingDemo || scanning}
              className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {loadingDemo ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Load Demo Applications
            </button>
          )}

            <button
              onClick={handleFindJobsNow}
              disabled={scanning}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Find Jobs Now
            </button>
        </div>
      </header>

      {showInstructions && (
        <div className="max-w-7xl mx-auto mb-6 flex items-start gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-xs text-slate-400">
          <Sparkles size={14} className="mt-0.5 shrink-0 text-indigo-400" />
          <p className="flex-1 leading-relaxed">
            Drag and drop job cards between columns to track your progress. Start in Wishlist, move to Applied when you submit, and update as you get interviews and offers. If a company rejects you, move the card to Rejected to keep your board clean.
          </p>
          <button
            onClick={() => setShowInstructions(false)}
            className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Dismiss instructions"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-job-title"
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="add-job-title" className="text-sm font-bold text-white">Add Job Application</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
                aria-label="Close add job form"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAddApplication} className="space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Company</label>
                <input type="text" placeholder="e.g. Google" value={company} onChange={e => setCompany(e.target.value)} className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-orange-500 focus:outline-none" required />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</label>
                <input type="text" placeholder="e.g. Frontend Engineer" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-orange-500 focus:outline-none" required />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</label>
                <input type="date" value={appliedDate} onChange={e => setAppliedDate(e.target.value)} className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white [color-scheme:dark] focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Salary <span className="normal-case text-slate-600">(optional)</span></label>
                <input type="text" placeholder="e.g. ₦900,000 / mo" value={salary} onChange={e => setSalary(e.target.value)} className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-orange-500 focus:outline-none" />
              </div>
              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-orange-400"
              >
                <Plus size={14} /> Add to Board
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={`flex w-full transition-all duration-300 ${isAiOpen ? 'xl:w-[calc(100%-420px)]' : 'w-full'}`}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <main className="w-full overflow-x-auto">
            <div className="mx-auto grid grid-cols-5 gap-4 items-start min-w-[1000px] xl:min-w-0 max-w-7xl">
          {BOARD_COLUMNS.map((column) => {
            const filteredCards = apps.filter((item) => item.status === column.key);
            return (
              <Droppable droppableId={column.key} key={column.key}>
                {(provided, snapshot) => (
                  <div className={`flex flex-col gap-4 rounded-2xl border p-4 backdrop-blur-md transition-colors ${snapshot.isDraggingOver ? 'border-orange-500/40 bg-orange-500/5' : 'border-slate-800 bg-slate-900/60'}`}>
                    <div className="sticky top-0 z-10 flex flex-col gap-1 border-b border-slate-800 bg-slate-950/95 px-2 pb-3 backdrop-blur-md">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                          <span className={`h-2 w-2 rounded-full ${column.dot}`} />
                          {column.label}
                        </span>
                        <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-orange-300">
                          {filteredCards.length}
                        </span>
                      </div>
                      <p className="pl-4 text-[10px] text-slate-500">{column.subtext}</p>
                    </div>

                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 space-y-3 min-h-[300px]"
                    >
                      {filteredCards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              style={dragProvided.draggableProps.style}
                            >
                              <div className={`group relative space-y-3 rounded-xl border p-4 shadow-md backdrop-blur-md transition-all ${dragSnapshot.isDragging ? 'border-orange-500/60 bg-slate-800 shadow-2xl' : 'border-slate-800 bg-slate-900/60 hover:border-orange-500/50 hover:shadow-lg'}`}>
                                <button
                                  onClick={() => handleDeleteApplication(card.id)}
                                  className="absolute top-4 right-4 hidden text-slate-600 transition-colors hover:text-red-400 group-hover:block"
                                  aria-label={`Delete ${card.job_title}`}
                                >
                                  <Trash2 size={12} />
                                </button>
                                <div className="space-y-1">
                                  <p className="truncate pr-4 text-sm font-bold text-white">
                                    {card.company_name}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                    <Briefcase size={10} className="text-slate-500" />
                                    <span className="truncate">{card.job_title}</span>
                                  </div>
                                  <p className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                                    <Calendar size={10} className="text-slate-600" />
                                    {formatAppliedDate(card.created_at)}
                                  </p>
                                </div>
                                {card.salary_range ? (
                                  <p className="font-mono text-[10px] text-slate-500">
                                    {card.salary_range}
                                  </p>
                                ) : null}
                                {column.key === 'lead' && card.apply_url ? (
                                  <button
                                    onClick={() => handleApplyClick(card)}
                                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 py-2 text-[10px] font-semibold text-orange-300 transition-colors hover:bg-orange-500/20"
                                  >
                                    <ExternalLink size={11} /> Apply &amp; Move to Applied
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {filteredCards.length === 0 ? (
                        <p className="py-10 text-center text-[10px] italic text-slate-700">
                          Drop a card here
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
            </div>
          </main>
        </DragDropContext>
      </div>

      <AIAssistant
        title="Job Tracker Copilot"
        triggerLabel="Which job should I prioritize?"
        prompt="Based on my tracked applications, which job should I prioritize and why?"
        context={{ page: 'tracker', applications: apps }}
        userName={userName}
        userSkills={userSkills}
        onOpenChange={setIsAiOpen}
      />
    </div>
  );
}