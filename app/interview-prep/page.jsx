'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Loader2, Sparkles, MessageCircle, CheckCircle2, Send, ClipboardCheck, ChevronDown, Briefcase } from 'lucide-react';

export default function InterviewPrep() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [trackedJobs, setTrackedJobs] = useState([]);

  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [skills, setSkills] = useState('');

  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [tips, setTips] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [feedbackByQuestion, setFeedbackByQuestion] = useState({});
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase.from('profiles').select('tech_stack').eq('id', user.id).single();
      if (profile && profile.tech_stack) {
        setSkills(profile.tech_stack);
      }

      const { data: jobs } = await supabase
        .from('job_applications')
        .select('id, job_title, company_name, notes')
        .eq('user_id', user.id)
        .in('status', ['lead', 'applied', 'interviewing']);

      setTrackedJobs(jobs || []);
    };
    init();
  }, [router]);

  const handleSelectTrackedJob = (jobId) => {
    const job = trackedJobs.find(function (j) { return j.id === jobId; });
    if (job) {
      setJobTitle(job.job_title || '');
      setCompany(job.company_name || '');
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setQuestions([]);
    setTips([]);
    setFeedbackByQuestion({});
    setActiveQuestionIndex(null);

    try {
      const response = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, company, jobDescription, skills }),
      });
      const result = await response.json();

      if (result.success && result.data) {
        setQuestions(result.data.questions || []);
        setTips(result.data.tips || []);
      }
    } catch (error) {
      alert('Could not generate interview prep. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenPractice = (index) => {
    setActiveQuestionIndex(activeQuestionIndex === index ? null : index);
    setPracticeAnswer('');
  };

  const handleSubmitAnswer = async (question, index) => {
    if (!practiceAnswer.trim()) return;
    setFeedbackLoading(true);

    try {
      const response = await fetch('/api/interview-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer: practiceAnswer }),
      });
      const result = await response.json();

      if (result.success) {
        setFeedbackByQuestion(function (prev) {
          const next = Object.assign({}, prev);
          next[index] = result.feedback;
          return next;
        });
      }
    } catch (error) {
      alert('Could not get feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-bold text-sm text-white">Interview Prep</h1>
          <p className="text-xs text-slate-500">Practice questions and feedback, tailored to the role you're prepping for.</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-8">

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          {trackedJobs.length > 0 ? (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Prep for a tracked application (optional)
              </label>
              <select
                onChange={function (e) { handleSelectTrackedJob(e.target.value); }}
                defaultValue=""
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
              >
                <option value="" disabled>Select a job from your tracker...</option>
                {trackedJobs.map(function (job) {
                  return (
                    <option key={job.id} value={job.id}>{job.job_title} at {job.company_name}</option>
                  );
                })}
              </select>
            </div>
          ) : null}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={function (e) { setJobTitle(e.target.value); }}
                placeholder="e.g. Frontend Developer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Company</label>
              <input
                type="text"
                value={company}
                onChange={function (e) { setCompany(e.target.value); }}
                placeholder="e.g. DevCraft Labs"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Job Description (optional, but improves accuracy)</label>
            <textarea
              value={jobDescription}
              onChange={function (e) { setJobDescription(e.target.value); }}
              rows={4}
              placeholder="Paste the job posting here for more tailored questions..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white resize-none"
            ></textarea>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? 'Generating...' : 'Generate Questions and Tips'}
          </button>
        </div>

        {tips.length > 0 ? (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 space-y-3">
            <h2 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
              <ClipboardCheck size={16} /> Work Ethics and Professionalism Tips
            </h2>
            <ul className="space-y-2">
              {tips.map(function (tip, index) {
                return (
                  <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {questions.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageCircle size={16} /> Practice Questions
            </h2>
            {questions.map(function (question, index) {
              const isOpen = activeQuestionIndex === index;
              return (
                <div key={index} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/30">
                  <button
                    onClick={function () { handleOpenPractice(index); }}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-900/50"
                  >
                    <span className="text-xs font-medium text-slate-200 pr-3">{question}</span>
                    <ChevronDown size={14} className={'text-slate-500 shrink-0 transition-transform ' + (isOpen ? 'rotate-180' : '')} />
                  </button>

                  {isOpen ? (
                    <div className="p-4 pt-0 space-y-3 border-t border-slate-900">
                      <textarea
                        value={practiceAnswer}
                        onChange={function (e) { setPracticeAnswer(e.target.value); }}
                        rows={4}
                        placeholder="Type your practice answer here..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white resize-none mt-3"
                      ></textarea>
                      <button
                        onClick={function () { handleSubmitAnswer(question, index); }}
                        disabled={feedbackLoading || !practiceAnswer.trim()}
                        className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
                      >
                        {feedbackLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Get Feedback
                      </button>

                      {feedbackByQuestion[index] ? (
                        <p className="text-xs text-indigo-200 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                          {feedbackByQuestion[index]}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}