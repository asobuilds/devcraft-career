'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, FileText, Briefcase, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AIAssistant from '@/app/components/AIAssistant';

export default function ATSAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: latestScan } = await supabase
        .from('ats_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestScan) {
        setResumeText(latestScan.resume_text || '');
        setJobDescription(latestScan.job_description || '');
        setScore(typeof latestScan.score === 'number' ? latestScan.score : null);
        setMissingKeywords(
          Array.isArray(latestScan.missing_keywords) ? latestScan.missing_keywords : []
        );
        setFeedback(latestScan.feedback || '');
      }

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

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both resume text and job description.');
      return;
    }

    setError('');
    setAnalyzing(true);
    setScore(null);
    setMissingKeywords([]);
    setFeedback('');

    try {
      const res = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      const nextMissingKeywords = Array.isArray(data.missingKeywords) ? data.missingKeywords : [];
      const nextFeedback = data.feedback || '';

      setScore(data.score ?? null);
      setMissingKeywords(nextMissingKeywords);
      setFeedback(nextFeedback);

      if (userId) {
        const { error: saveError } = await supabase.from('ats_scans').insert({
          user_id: userId,
          resume_text: resumeText,
          job_description: jobDescription,
          score: typeof data.score === 'number' ? data.score : null,
          missing_keywords: nextMissingKeywords,
          feedback: nextFeedback,
        });

        if (saveError) {
          console.error('Failed to save ATS scan:', saveError);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="pb-6 border-b border-slate-900">
          <h1 className="text-xl font-bold text-white">Beat the ATS Bot</h1>
          <p className="text-xs text-slate-500 mt-1">Our system analyzes your CV against specific job descriptions (both local and international) to ensure you get past the automated screening.</p>
        </header>

        <main className="grid md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText size={12} /> Resume Text
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none resize-none leading-relaxed placeholder-slate-600"
                placeholder="Paste or type your resume content here..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Briefcase size={12} /> Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none resize-none leading-relaxed placeholder-slate-600"
                placeholder="Paste the target job description here..."
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>

          {/* Results */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-6">
            {!score && !analyzing ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3 min-h-[200px]">
                <Sparkles size={24} className="opacity-50" />
                <p className="text-sm font-medium">Ready to analyze</p>
                <p className="text-xs text-slate-600 max-w-[220px]">Paste your documents on the left and run the analysis to see results here.</p>
              </div>
            ) : analyzing ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
                <Loader2 size={24} className="animate-spin text-indigo-400" />
                <p className="text-sm text-slate-400">Running AI-powered matching...</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Score Card */}
                {(() => {
                  const displayScore = score ?? 0;
                  return (
                    <>
                      <div className="flex items-center gap-4 pb-5 border-b border-slate-800">
                        <div className={`h-16 w-16 rounded-full border-2 flex items-center justify-center text-lg font-black ${
                          displayScore >= 75 ? 'border-green-500 text-green-400 bg-green-500/10' :
                          displayScore >= 50 ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' :
                          'border-red-500 text-red-400 bg-red-500/10'
                        }`}>
                          {displayScore}%
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wider">Match Score</p>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{feedback}</p>
                        </div>
                      </div>

                      {/* Missing Keywords */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3 flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-500" /> Missing Keywords ({missingKeywords.length})
                        </span>
                        {missingKeywords.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {missingKeywords.map((kw, i) => (
                              <span key={i} className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-[10px] px-2.5 py-1 rounded-md font-mono">
                                {kw}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-emerald-400">All relevant keywords present!</p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </main>
      </div>

      <AIAssistant
        title="ATS Analyzer Copilot"
        triggerLabel="Ask AI for Advice"
        prompt="Review my resume against this job description and tell me how to improve my match."
        context={{ page: 'analyzer', resumeText, jobDescription }}
        userName={userName}
        userSkills={userSkills}
        isPremium={isPremium}
      />
    </div>
  );
}
