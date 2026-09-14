'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Upload, Loader2, ArrowLeft, FileText } from 'lucide-react';

export default function ImportResume() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('That file is too large. Please upload a file under 10MB.');
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.error || 'Could not process that file.');
        setUploading(false);
        return;
      }

      if (result.message) {
        setInfoMessage(result.message);
      }

      const parsed = result.data;
      const skillsArray = (parsed.skills || '')
        .split(',')
        .map(function (s) { return s.trim(); })
        .filter(Boolean);

      const { data: inserted, error: insertError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          resume_title: (parsed.fullName ? parsed.fullName + ' - ' : '') + 'Imported Resume',
          summary: parsed.summary || '',
          skills: skillsArray,
          experience: parsed.experience && parsed.experience.length > 0
            ? parsed.experience
            : [{ id: '1', company: '', role: '', dates: '', bullets: '' }],
          active_template: 'modern-indigo',
          attachments: [],
          full_name: parsed.fullName || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          website: parsed.website || '',
        })
        .select('id')
        .single();

      if (insertError) {
        setErrorMessage('Could not save the imported resume: ' + insertError.message);
        setUploading(false);
        return;
      }

      router.push('/cv-builder?resumeId=' + inserted.id);
    } catch (error) {
      setErrorMessage('Something went wrong: ' + error.message);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <Link href="/resumes" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white">
          <ArrowLeft size={14} /> Back to My Resumes
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">Upload Your Old Resume</h1>
          <p className="text-sm text-slate-400">
            We will read it, pull out your details, and turn it into a professional, ATS-safe resume you can edit and improve.
          </p>
        </div>

        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-800 rounded-2xl py-12 cursor-pointer hover:border-indigo-500/50 transition-colors">
          {uploading ? (
            <Loader2 size={28} className="text-indigo-400 animate-spin" />
          ) : (
            <Upload size={28} className="text-slate-500" />
          )}
          <span className="text-sm text-slate-300">
            {uploading ? 'Reading your resume...' : 'Click to upload a PDF or Word document'}
          </span>
          <span className="text-xs text-slate-600">.pdf or .docx, up to 10MB</span>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {errorMessage ? (
          <p className="text-sm text-red-400 text-center">{errorMessage}</p>
        ) : null}

        {infoMessage ? (
          <p className="text-xs text-amber-400 text-center bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            {infoMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}