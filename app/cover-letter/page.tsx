'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AIAssistant from '@/app/components/AIAssistant';

interface Resume {
  id: string;
  resume_title: string;
  skills: string[];
  created_at: string;
}

interface CoverLetterState {
  resumeId: string | null;
  skillsInput: string;
  jobDescription: string;
  generatedCoverLetter: string | null;
  isGenerating: boolean;
  showPdf: boolean;
}

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [userName, setUserName] = useState('');
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [state, setState] = useState<CoverLetterState>({
    resumeId: null,
    skillsInput: '',
    jobDescription: '',
    generatedCoverLetter: null,
    isGenerating: false,
    showPdf: false,
  });

  useEffect(() => {
    const fetchResumes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) console.error('Error fetching resumes:', error);
      else setResumes(data || []);
    };
    fetchResumes();
  }, []);

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

  const handleGenerate = useCallback(async () => {
    const { resumeId, skillsInput, jobDescription } = state;

    if (!resumeId && !skillsInput.trim()) {
      alert('Please select a resume or enter skills.');
      return;
    }

    setState((prev) => ({ ...prev, isGenerating: true, generatedCoverLetter: null }));

    try {
      const response = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
          skillsInput,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }

      setState((prev) => ({
        ...prev,
        generatedCoverLetter: data.coverLetter,
        isGenerating: false,
        showPdf: true,
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(error);
      alert('Failed to generate cover letter: ' + (error.message || 'Unknown error'));
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [state]);

  const handleDownloadPdf = useCallback(() => {
    const { generatedCoverLetter } = state;
    if (!generatedCoverLetter) return;

    // Trigger download by creating a blob and simulating a click
    const blob = new Blob([generatedCoverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const handleSkillsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState((prev) => ({ ...prev, skillsInput: e.target.value }));
  }, []);

  const handleJobDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState((prev) => ({ ...prev, jobDescription: e.target.value }));
  }, []);

  const handleResumeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const resumeId = e.target.value || null;
    const resume = resumes.find((r) => r.id === resumeId);
    const skillsInput = resume ? resume.skills.join(', ') : '';
    setState((prev) => ({ ...prev, resumeId, skillsInput }));
  }, [resumes]);

  return (
    <div className="bg-slate-950 text-slate-100">
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </Link>
          <div>
            <h1 className="font-bold text-xl text-white">Generate a Winning Cover Letter</h1>
            <p className="text-xs text-slate-500 mt-1">Don&apos;t send a generic &quot;I am writing to apply&quot; letter. Use AI to write a compelling, tailored letter that highlights your specific skills for the job.</p>
          </div>
        </div>
      </header>

      <section className="max-w-[1600px] mx-auto p-6 md:p-10">

        {/* Resume Selection Section */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="font-semibold text-slate-200 mb-4">Select Resume</h2>
          <select
            onChange={(e) => handleResumeChange(e)}
            className="bg-slate-900 border border-slate-700 rounded-md w-full text-slate-100 py-2 px-3"
          >
            <option value="">Paste skills manually</option>
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.resume_title || 'Untitled Resume'}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            Or paste your skills manually below
          </p>
          <textarea
            value={state.skillsInput}
            onChange={handleSkillsChange}
            rows={3}
            className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-100"
            placeholder="e.g. React, TypeScript, SQL, AWS"
          ></textarea>
        </div>

        {/* Job Description Section */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="font-semibold text-slate-200 mb-4">Job Description</h2>
          <textarea
            value={state.jobDescription}
            onChange={handleJobDescriptionChange}
            rows={5}
            className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-100 resize-none"
            placeholder="Paste the job description here..."
          ></textarea>
        </div>

        {/* Generate Button */}
        <div className="mb-6">
          <button
            onClick={handleGenerate}
            disabled={state.isGenerating || !state.jobDescription.trim()}
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-400/20 disabled:text-indigo-300/50 py-2 px-4"
          >
            {state.isGenerating ? (
              <span>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg> Generating...
              </span>
            ) : (
              'Generate Cover Letter'
            )}
          </button>
        </div>

        {/* Generated Cover Letter */}
        {state.generatedCoverLetter && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-semibold text-slate-200 mb-4">Generated Cover Letter</h2>
            <textarea
              value={state.generatedCoverLetter}
              onChange={(e) => setState((prev) => ({ ...prev, generatedCoverLetter: e.target.value }))}
              rows={8}
              className="w-full bg-slate-900 border border-purple-500 rounded-md p-3 text-slate-100 resize-none"
            ></textarea>
            <div className="mt-4 flex gap-2">
              <button onClick={handleDownloadPdf} disabled={!state.generatedCoverLetter} className="inline-flex items-center justify-center rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-400/20 disabled:text-indigo-300/50 py-1 px-2">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 5 19"></polyline>
                </svg> Download PDF
              </button>
              {state.showPdf && (
                <button className="rounded-full bg-slate-700 p-1">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="3" x2="21" y2="21"></line>
                    <line x1="3" y1="21" x2="21" y2="3"></line>
                  </svg> View PDF
                </button>
              )}
            </div>
          </div>
        )}

      </section>

      <AIAssistant
        title="Cover Letter Copilot"
        triggerLabel="Make it more professional"
        prompt="Rewrite my cover letter to sound more professional and tailored to this job."
        context={{
          page: 'cover-letter',
          jobDescription: state.jobDescription,
          coverLetter: state.generatedCoverLetter ?? '',
        }}
        userName={userName}
        userSkills={userSkills}
        isPremium={isPremium}
      />
    </div>
  );
}