'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Trash2, Loader2, Briefcase, Terminal, ExternalLink, CheckCircle2, Radar, X, AlertCircle } from 'lucide-react';
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

type BoardStatus = 'lead' | 'applied' | 'interviewing' | 'offered';

const BOARD_COLUMNS: Array<{ key: BoardStatus; label: string; dot: string }> = [
  { key: 'lead', label: 'Wishlist', dot: 'bg-slate-400' },
  { key: 'applied', label: 'Applied', dot: 'bg-sky-400' },
  { key: 'interviewing', label: 'Interviewing', dot: 'bg-amber-400' },
  { key: 'offered', label: 'Offer', dot: 'bg-emerald-400' },
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
  const [isPremium, setIsPremium] = useState(false);

  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [salary, setSalary] = useState('');

  const [scanning, setScanning] = useState(false);
  const [scanLogIndex, setScanLogIndex] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

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
        .select('full_name, tech_stack, is_premium')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserName(profile.full_name || '');
        setIsPremium(Boolean(profile.is_premium));
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
      setToast({ type: 'success', message: 'Application added successfully.' });
    } else if (error) {
      setToast({ type: 'error', message: 'Failed to add application. Please try again.' });
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
        setScanMessage(result.message || 'Job leads are a Premium feature.');
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
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {['Wishlist', 'Applied', 'Interviewing', 'Offer'].map((label, i) => (
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <main className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {BOARD_COLUMNS.map((column) => {
            const filteredCards = apps.filter((item) => item.status === column.key);
            return (
              <Droppable droppableId={column.key} key={column.key}>
                {(provided, snapshot) => (
                  <div className={`flex flex-col gap-4 rounded-2xl border p-4 transition-colors ${snapshot.isDraggingOver ? 'border-orange-500/40 bg-orange-500/5' : 'border-slate-900 bg-slate-900/20'}`}>
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <span className={`h-2 w-2 rounded-full ${column.dot}`} />
                        {column.label}
                      </span>
                      <span className="rounded-full border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-500">
                        {filteredCards.length}
                      </span>
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
                              <div className={`group relative space-y-3 rounded-xl border p-4 shadow-md transition-all ${dragSnapshot.isDragging ? 'border-orange-500/60 bg-slate-800 shadow-2xl' : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'}`}>
                                <button
                                  onClick={() => handleDeleteApplication(card.id)}
                                  className="absolute top-4 right-4 hidden text-slate-600 transition-colors hover:text-red-400 group-hover:block"
                                  aria-label={`Delete ${card.job_title}`}
                                >
                                  <Trash2 size={12} />
                                </button>
                                <div className="space-y-1">
                                  <h4 className="truncate pr-4 text-xs font-bold tracking-wide text-white">
                                    {card.job_title}
                                  </h4>
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                    <Briefcase size={10} className="text-slate-500" />
                                    <span className="truncate">{card.company_name}</span>
                                  </div>
                                  <p className="font-mono text-[10px] text-slate-500">
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
                                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/10 py-2 text-[10px] font-semibold text-emerald-300 transition-colors hover:bg-emerald-600/20"
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
        </main>
      </DragDropContext>

      <AIAssistant
        title="Job Tracker Copilot"
        triggerLabel="Which job should I prioritize?"
        prompt="Based on my tracked applications, which job should I prioritize and why?"
        context={{ page: 'tracker', applications: apps }}
        userName={userName}
        userSkills={userSkills}
        isPremium={isPremium}
      />
    </div>
  );
}