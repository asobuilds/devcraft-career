'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AIAssistant from '@/app/components/AIAssistant';

interface Resume {
  id: string;
  resume_title: string;
  skills: string[];
  summary?: string | null;
  experience?: Array<Record<string, unknown>> | null;
  created_at: string;
}

interface CoverLetterState {
  resumeId: string | null;
  skillsInput: string;
  jobDescription: string;
  generatedCoverLetter: string | null;
  isGenerating: boolean;
}

function buildResumeContext(resumes: Resume[], userName: string, userEmail: string, userSkills: string[], state: CoverLetterState): string {
  const selectedResume = state.resumeId ? resumes.find((resume) => resume.id === state.resumeId) : undefined;

  const skills = state.resumeId
    ? selectedResume?.skills?.join(', ') || userSkills.join(', ')
    : state.skillsInput;

  const experienceLines = selectedResume?.experience
    ? selectedResume.experience.map((entry) => {
        const item = entry as Record<string, unknown>;
        return `${String(item.role ?? item.title ?? '')} at ${String(item.company ?? '')}: ${String(item.bullets ?? item.description ?? '')}`;
      })
    : [];

  const parts = [
    `Name: ${selectedResume ? userName || 'Candidate' : userName || 'Candidate'}`,
    `Email: ${userEmail}`,
    selectedResume?.summary ? `Summary: ${selectedResume.summary}` : '',
    skills ? `Skills: ${skills}` : '',
    experienceLines.length > 0 ? `Experience:\n${experienceLines.join('\n')}` : '',
  ].filter(Boolean);

  return parts.join('\n');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [state, setState] = useState<CoverLetterState>({
    resumeId: null,
    skillsInput: '',
    jobDescription: '',
    generatedCoverLetter: null,
    isGenerating: false,
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
        .select('full_name, email, tech_stack')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserName(profile.full_name || '');
        setUserEmail(profile.email || '');
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

    if (!jobDescription.trim()) {
      alert('Please paste a job description first.');
      return;
    }

    const selectedResume = resumeId
      ? resumes.find((resume) => resume.id === resumeId)
      : undefined;

    const resumeData = selectedResume
      ? {
          name: userName || 'Candidate',
          email: userEmail,
          summary: selectedResume.summary || '',
          skills: Array.isArray(selectedResume.skills) ? selectedResume.skills : [],
          experience: Array.isArray(selectedResume.experience)
            ? selectedResume.experience.map((entry) => {
                const item = entry as Record<string, unknown>;
                return {
                  role: String(item.role ?? ''),
                  company: String(item.company ?? ''),
                  description: String(item.bullets ?? ''),
                };
              })
            : [],
        }
      : {
          name: userName || 'Candidate',
          email: userEmail,
          summary: '',
          skills: skillsInput
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean),
          experience: [],
        };

    setIsCopied(false);
    setState((prev) => ({ ...prev, isGenerating: true, generatedCoverLetter: null }));

    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeData, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }

      setState((prev) => ({
        ...prev,
        generatedCoverLetter: data.coverLetter,
        isGenerating: false,
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(error);
      alert('Failed to generate cover letter: ' + (error.message || 'Unknown error'));
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [state, resumes, userName, userEmail]);

  const handleDownloadPdf = useCallback(() => {
    const { generatedCoverLetter } = state;
    if (!generatedCoverLetter) return;

    const existingFrame = document.getElementById('cover-letter-print-frame');
    if (existingFrame) existingFrame.remove();

    const frame = document.createElement('iframe');
    frame.id = 'cover-letter-print-frame';
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';

    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      window.setTimeout(() => frame.remove(), 1000);
    };

    document.body.appendChild(frame);

    const printDocument = frame.contentWindow?.document;
    if (!printDocument) {
      frame.remove();
      return;
    }

    printDocument.open();
    printDocument.write(
      '<!doctype html><html><head><title>Cover Letter</title><style>' +
        "@page { margin: 1in; } body { font-family: Georgia, 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #111; white-space: pre-wrap; }" +
        '</style></head><body>' +
        escapeHtml(generatedCoverLetter) +
        '</body></html>'
    );
    printDocument.close();
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
    const skillsInput = resume && Array.isArray(resume.skills) ? resume.skills.join(', ') : '';
    setState((prev) => ({ ...prev, resumeId, skillsInput }));
  }, [resumes]);

  const handleCopy = useCallback(async () => {
    if (!state.generatedCoverLetter) return;

    try {
      await navigator.clipboard.writeText(state.generatedCoverLetter);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy cover letter:', err);
      alert('Could not copy to clipboard. Please try selecting and copying the text manually.');
    }
  }, [state.generatedCoverLetter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="flex w-full min-h-[calc(100vh-3rem)] gap-0">
        <div
          className={
            isAiOpen
              ? 'flex-1 xl:w-[calc(100%-420px)] transition-all duration-300 pr-4'
              : 'flex-1 transition-all duration-300 pr-4'
          }
        >
          <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 print:hidden">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 transition-colors hover:text-white"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={16} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Generate a Winning Cover Letter</h1>
                <p className="mt-1 max-w-3xl text-xs text-slate-500">
                  Don&apos;t send a generic &quot;I am writing to apply&quot; letter. Use AI to write a
                  compelling, tailored letter that highlights your specific skills for the job.
                </p>
              </div>
            </div>
          </header>

          <section className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-10">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-slate-400">
              <span className="font-bold text-amber-400">💡 Pro Tip:</span>{' '}
              The best cover letters are 3 paragraphs: The Hook (why you love the company), The Proof
              (your top achievement), and The Close (call to action).
            </div>

            {/* Resume Selection Section */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <FileText size={16} className="text-orange-400" />
                <h2 className="font-semibold text-slate-200">Select Resume</h2>
              </div>
              <select
                onChange={handleResumeChange}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 focus:border-orange-500/50 focus:outline-none"
              >
                <option value="">Paste skills manually</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.resume_title || 'Untitled Resume'}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-xs text-slate-500">Or paste your skills manually below</p>
              <textarea
                value={state.skillsInput}
                onChange={handleSkillsChange}
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-orange-500/50 focus:outline-none"
                placeholder="e.g. React, TypeScript, SQL, AWS"
              ></textarea>
            </div>

            {/* Job Description Section */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <Briefcase size={16} className="text-emerald-400" />
                <h2 className="font-semibold text-slate-200">Job Description</h2>
              </div>
              <textarea
                value={state.jobDescription}
                onChange={handleJobDescriptionChange}
                rows={6}
                className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none"
                placeholder="Paste the job description here..."
              ></textarea>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={state.isGenerating || !state.jobDescription.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:pointer-events-none disabled:opacity-50"
            >
              {state.isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Cover Letter
                </>
              )}
            </button>

            {/* Generated Cover Letter */}
            {state.generatedCoverLetter && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400" />
                    <h2 className="font-semibold text-slate-200">Generated Cover Letter</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={!state.generatedCoverLetter}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle2 size={14} className="text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy to Clipboard
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={state.isGenerating}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={state.isGenerating ? 'animate-spin' : ''} /> Regenerate
                    </button>
                  </div>
                </div>
                <textarea
                  value={state.generatedCoverLetter}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, generatedCoverLetter: e.target.value }))
                  }
                  rows={12}
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-100 focus:border-indigo-500/50 focus:outline-none"
                ></textarea>
              </div>
            )}
          </section>
        </div>

        {isAiOpen ? (
          <div className="hidden w-[420px] shrink-0 xl:block">
            <AIAssistant
              title="Cover Letter Copilot"
              triggerLabel="Make it more professional"
              prompt="Rewrite my cover letter to sound more professional and tailored to this job."
              context={{
                page: 'cover-letter',
                jobDescription: state.jobDescription,
                coverLetter: state.generatedCoverLetter ?? '',
                resumeText: buildResumeContext(resumes, userName, userEmail, userSkills, state),
              }}
              userName={userName}
              userSkills={userSkills}
              forceOpen
            />
          </div>
        ) : null}
      </div>

      {!isAiOpen ? (
        <AIAssistant
          title="Cover Letter Copilot"
          triggerLabel="Make it more professional"
          prompt="Rewrite my cover letter to sound more professional and tailored to this job."
          context={{
            page: 'cover-letter',
            jobDescription: state.jobDescription,
            coverLetter: state.generatedCoverLetter ?? '',
            resumeText: buildResumeContext(resumes, userName, userEmail, userSkills, state),
          }}
          userName={userName}
          userSkills={userSkills}
          onOpenChange={setIsAiOpen}
        />
      ) : null}
    </div>
  );
}
