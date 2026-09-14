'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Plus, Copy, Trash2, FileText, Loader2, ArrowLeft, Upload } from 'lucide-react';

interface ResumeRow {
  id: string;
  resume_title: string;
  updated_at: string;
  target_role: string | null;
}

export default function ResumesLibrary() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchResumes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from('resumes')
        .select('id, resume_title, updated_at, target_role')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      setResumes(data || []);
      setLoading(false);
    };
    fetchResumes();
  }, [router]);

  const handleCreateNew = async () => {
    if (!userId) return;
    setCreating(true);
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        resume_title: 'Untitled Resume',
        summary: '',
        skills: [],
        experience: [{ id: '1', company: '', role: '', dates: '', bullets: '' }],
        active_template: 'modern-indigo',
        attachments: [],
      })
      .select('id')
      .single();
    setCreating(false);

    if (error) {
      alert('Could not create a new resume: ' + error.message);
      return;
    }

    router.push('/cv-builder?resumeId=' + data.id);
  };

  const handleDuplicate = async (resumeId: string) => {
    const { data: original, error: fetchError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (fetchError || !original) {
      alert('Could not load that resume to duplicate.');
      return;
    }

    const { id, created_at, updated_at, ...copyFields } = original;

    const { data: inserted, error: insertError } = await supabase
      .from('resumes')
      .insert({
        ...copyFields,
        resume_title: (original.resume_title || 'Untitled Resume') + ' (Copy)',
      })
      .select('id')
      .single();

    if (insertError) {
      alert('Could not duplicate: ' + insertError.message);
      return;
    }

    setResumes((prev) => [
      { id: inserted.id, resume_title: copyFields.resume_title + ' (Copy)', updated_at: new Date().toISOString(), target_role: original.target_role },
      ...prev,
    ]);
  };

  const handleDelete = async (resumeId: string) => {
    const confirmed = window.confirm('Delete this resume? This cannot be undone.');
    if (!confirmed) return;

    const { error } = await supabase.from('resumes').delete().eq('id', resumeId);
    if (error) {
      alert('Could not delete: ' + error.message);
      return;
    }

    setResumes((prev) => prev.filter((r) => r.id !== resumeId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-purple-500" size={20} />
        <span>Loading your resumes...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="font-bold text-sm text-white">My Resumes</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/cv-builder/import"
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-800 bg-slate-900 text-slate-300 rounded-xl text-xs font-semibold hover:border-slate-700"
          >
            <Upload size={14} /> Upload Old Resume
          </Link>
          <button
            onClick={handleCreateNew}
            disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-500 disabled:opacity-50"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} New Resume
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {resumes.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <FileText size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">You don't have any resumes yet.</p>
            <p className="text-xs mt-1">Create one to get started, or upload an old resume to import it.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{resume.resume_title || 'Untitled Resume'}</h3>
                    {resume.target_role ? (
                      <p className="text-xs text-purple-400 mt-0.5">For: {resume.target_role}</p>
                    ) : null}
                    <p className="text-[11px] text-slate-500 mt-1">
                      Updated {new Date(resume.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <Link
                    href={'/cv-builder?resumeId=' + resume.id}
                    className="flex-1 text-center text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDuplicate(resume.id)}
                    title="Duplicate"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    title="Delete"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}