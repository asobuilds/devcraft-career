'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Sparkles, CheckCircle, AlertTriangle, Loader2, FileSearch } from 'lucide-react';
import Link from 'next/link';

export default function ATSAnalyzer() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [resumeSummary, setResumeSummary] = useState('');

  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [passedKeywords, setPassedKeywords] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchResumeData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: cv } = await supabase
        .from('resumes')
        .select('skills, summary')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cv) {
        if (cv.skills) setResumeSkills(cv.skills);
        setResumeSummary(cv.summary || '');
      }
      setLoading(false);
    };

    fetchResumeData();
  }, [router]);

  const runAnalysisMatrix = () => {
    if (!jobDescription.trim()) {
      alert('Please paste a job description first.');
      return;
    }

    setAnalyzing(true);

    setTimeout(() => {
      const commonIndustryKeywords = [
        'react', 'typescript', 'javascript', 'python', 'sql', 'node', 'aws', 'docker',
        'agile', 'scrum', 'git', 'ci/cd', 'graphql', 'tailwind', 'next.js', 'testing',
        'mongodb', 'postgresql', 'express', 'vue', 'angular', 'flask', 'django',
        'kubernetes', 'linux', 'rest api', 'microservices', 'serverless', 'redis'
      ];

      const cleanedJobText = jobDescription.toLowerCase();
      const combinedResumeText = (resumeSummary + ' ' + resumeSkills.join(' ')).toLowerCase();

      const foundInJob = commonIndustryKeywords.filter(keyword => cleanedJobText.includes(keyword));
      const passed: string[] = [];
      const missing: string[] = [];

      foundInJob.forEach(keyword => {
        if (combinedResumeText.includes(keyword)) {
          passed.push(keyword);
        } else {
          missing.push(keyword);
        }
      });

      const calculatedScore = foundInJob.length > 0 ? Math.round((passed.length / foundInJob.length) * 100) : 70;

      const generatedSuggestions: string[] = [];
      if (calculatedScore < 60) {
        generatedSuggestions.push('⚠️ Critical Match Warning: Your score falls below the standard corporate tracking target of 65%.');
      }
      if (missing.length > 0) {
        const topMissing = missing.slice(0, 3).join(', ');
        generatedSuggestions.push(`📌 Integrate missing metrics: Try adding "${topMissing}" to your skills row or weave them into your experience bullets.`);
      }
      if (calculatedScore >= 75) {
        generatedSuggestions.push('✅ Great alignment! Your profile matches well with the job description.');
      }
      if (generatedSuggestions.length === 0) {
        generatedSuggestions.push('💡 Your profile is reasonably aligned. Consider adding more specific keywords for a higher score.');
      }

      setMatchScore(calculatedScore);
      setPassedKeywords(passed);
      setMissingKeywords(missing);
      setSuggestions(generatedSuggestions);
      setAnalyzing(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-indigo-500" size={20} />
        <span>Synchronizing Scanner Parameters Core...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center gap-4 pb-6 border-b border-slate-900">
          <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">ATS Keyword Scanner Hub</h1>
            <p className="text-xs text-slate-500 mt-0.5">Cross-reference your resume layers against job listings instantly.</p>
          </div>
        </header>

        <main className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left Panel */}
          <div className="lg:col-span-2 space-y-4">
            <textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12} 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none resize-none leading-relaxed placeholder-slate-600"
              placeholder="Paste the raw text of the vacancy advertisement or target position requirements here..."
            />
            <button 
              onClick={runAnalysisMatrix} 
              disabled={analyzing} 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} 
              {analyzing ? 'Analyzing...' : 'Audit Current Match Score'}
            </button>
          </div>

          {/* Right Panel – Results */}
          <div className="lg:col-span-3 space-y-6">
            {matchScore === null ? (
              <div className="border border-dashed border-slate-800/80 rounded-2xl p-20 text-center flex flex-col items-center justify-center space-y-2">
                <FileSearch className="text-slate-700 h-10 w-10" />
                <h4 className="text-sm font-semibold text-slate-400">Analysis System Idle</h4>
                <p className="text-xs text-slate-600">Paste a job description and click "Audit" to begin.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Score Card */}
                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center gap-6">
                  <div className={`h-20 w-24 rounded-full border-4 flex items-center justify-center text-xl font-black ${
                    matchScore >= 75 ? 'border-green-500 text-green-400 bg-green-500/5' :
                    matchScore >= 50 ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5' :
                    'border-red-500 text-red-400 bg-red-500/5'
                  }`}>
                    {matchScore}%
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Your Optimization Index Match</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {matchScore >= 75 ? 'Excellent alignment! Your resume matches well.' :
                       matchScore >= 50 ? 'Moderate match. Consider adding missing keywords.' :
                       'Low match. Use the suggestions below to improve.'}
                    </p>
                  </div>
                </div>

                {/* Keyword Lists */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">✅ Matches Found ({passedKeywords.length})</span>
                    <div className="flex flex-wrap gap-1">
                      {passedKeywords.length > 0 ? (
                        passedKeywords.map((tag, i) => (
                          <span key={i} className="bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded font-mono">{tag}</span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No matches caught</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">❌ Missing Terms ({missingKeywords.length})</span>
                    <div className="flex flex-wrap gap-1">
                      {missingKeywords.length > 0 ? (
                        missingKeywords.map((tag, i) => (
                          <span key={i} className="bg-yellow-500/10 text-yellow-400 text-[10px] px-2 py-0.5 rounded font-mono">{tag}</span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Perfect – all found!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestions Panel (new) */}
                <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Strategic Suggestions
                  </span>
                  <ul className="space-y-1.5">
                    {suggestions.map((tip, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-indigo-400">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}