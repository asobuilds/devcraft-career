'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileDownload, Flag, ChevronDown } from 'lucide-react';
import CoverLetterPdf from '@/components/CoverLetterPdf';

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
    } catch (err: any) {
      console.error(err);
      alert('Failed to generate cover letter: ' + (err.message || 'Unknown error'));
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [state]);

  const handleDownloadPdf = useCallback(() => {
    const { generatedCoverLetter } = state;
    if (!generatedCoverLetter) return;

    const { resumeId, skillsInput } = state;

    // Get resume skills if a resume is selected
    let skillsText = skillsInput;
    if (resumeId) {
      const resume = resumes.find((r) => r.id === resumeId);
      if (resume && resume.skills) {
        skillsText = resume.skills.join(', ');
      }
    }

    // Create a simple cover letter text for PDF
    const coverLetterText = `Dear Hiring Manager,

I am writing to express my strong interest in the position. With my background in ${skillsText}, I am confident that I can contribute effectively to your team.

${generatedCoverLetter || 'Please generate a cover letter first.'}

Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experience align with your needs.

Sincerely,

[Your Name]`;

    // Trigger PDF download by setting showPdf state
    setState((prev) => ({ ...prev, showPdf: true }));
  }, [state, resumes, generatedCoverLetter]);

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </Link>
          <h1 className="font-bold text-xl text-white">Cover Letter Generator</h1>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 md:p-10">

        {/* Resume Selection Section */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="font-semibold text-slate-200 mb-4">Select Resume</h2>
          <Select onValueChange={handleResumeChange} className="w-full">
            <SelectTrigger className="bg-slate-900 border border-slate-700 rounded-md text-slate-100">
              <SelectValue placeholder="Select a resume or paste skills below" />
              <SelectContent>
                <SelectItem value="">Paste skills manually</SelectItem>
                {resumes.map((resume) => (
                  <SelectItem key={resume.id} value={resume.id}>
                    {resume.resume_title || 'Untitled Resume'}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectTrigger>
            <SelectValue
              value={state.skillsInput}
              onChange={(e) => handleSkillsChange(e)}
            />
          </Select>
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
          <Button
            onClick={handleGenerate}
            disabled={state.isGenerating || !state.jobDescription.trim()}
            className="w-full"
          >
            {state.isGenerating ? (
              <Loader2 size={18} className="mr-2 animate-spin" /> Generating...
            ) : (
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 5 19"></polyline>
              </svg>
              Generate Cover Letter
            )}
          </Button>
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
              <Button onClick={handleDownloadPdf} disabled={!state.generatedCoverLetter}>
                <FileDownload size={16} /> Download PDF
              </Button>
              {state.showPdf && (
                <Button size="icon">
                  <Flag size={16} /> View PDF
                </Button>
              )}
            </div>
          </div>
        )}

        {/* PDF Preview */}
        {state.showPdf && (
          <div className="mt-8">
            <CoverLetterPdf coverLetterText={state.generatedCoverLetter || ''} />
            <Button onClick={() => setState((prev) => ({ ...prev, showPdf: false }))}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="3" x2="21" y2="21"></line>
                <line x1="3" y1="21" x2="21" y2="3"></line>
              </svg>
              Close
            </Button>
          </div>
        )}

      </main>
    </div>
  );
}