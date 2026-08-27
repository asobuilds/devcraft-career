'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileSearch,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

// Extended common industry keywords (more comprehensive)
const INDUSTRY_KEYWORDS = [
  'react',
  'typescript',
  'javascript',
  'python',
  'sql',
  'node',
  'aws',
  'docker',
  'agile',
  'scrum',
  'git',
  'ci/cd',
  'rest api',
  'graphql',
  'tailwind',
  'next.js',
  'project management',
  'communication',
  'leadership',
  'optimization',
  'deployment',
  'testing',
  'database',
  'cloud',
  'architecture',
  'security',
  'linux',
  'kubernetes',
  'mongodb',
  'postgresql',
  'express',
  'vue',
  'angular',
  'flask',
  'django',
  'fastapi',
  'jenkins',
  'ansible',
  'terraform',
  'azure',
  'gcp',
  'machine learning',
  'data analysis',
  'problem solving',
  'team collaboration',
];

export default function ATSAnalyzer() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Resume data fetched from DB
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [resumeSummary, setResumeSummary] = useState('');

  // Analysis results
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [passedKeywords, setPassedKeywords] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load resume data on mount
  useEffect(() => {
    const fetchResumeData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
        setResumeSkills(cv.skills || []);
        setResumeSummary(cv.summary || '');
      }
      setLoading(false);
    };

    fetchResumeData();
  }, [router]);

  // Run the ATS analysis
  const runAnalysisMatrix = () => {
    if (!jobDescription.trim()) {
      alert('Please paste a job description first.');
      return;
    }

    setAnalyzing(true);

    // Simulate async processing (we could make this a real API call later)
    setTimeout(() => {
      const cleanedJob = jobDescription.toLowerCase();
      // Combine summary and skills into one searchable text
      const resumeText = (resumeSummary + ' ' + resumeSkills.join(' ')).toLowerCase();

      // Find which keywords appear in the job description
      const foundInJob = INDUSTRY_KEYWORDS.filter((kw) =>
        cleanedJob.includes(kw)
      );

      // Categorise into passed / missing
      const passed: string[] = [];
      const missing: string[] = [];

      foundInJob.forEach((kw) => {
        if (resumeText.includes(kw)) {
          passed.push(kw);
        } else {
          missing.push(kw);
        }
      });

      // Calculate match score (if no keywords found in job, default to 75)
      let calculatedScore = 100;
      if (foundInJob.length > 0) {
        calculatedScore = Math.round((passed.length / foundInJob.length) * 100);
      } else {
        calculatedScore = 75; // baseline if job description lacks our keywords
      }

      // Generate suggestions
      const generatedSuggestions: string[] = [];
      if (calculatedScore < 50) {
        generatedSuggestions.push(
          '⚠️ Critical match warning: Score below 65%. Consider adding more technical keywords.'
        );
      }
      if (missing.length > 0) {
        const topMissing = missing.slice(0, 3).join(', ');
        generatedSuggestions.push(
          `📌 Integrate missing tools: add phrases like "Experienced in ${topMissing}" in your experience bullets.`
        );
      }
      if (!resumeSummary || resumeSummary.length < 50) {
        generatedSuggestions.push(
          '📝 Expand your professional summary with measurable achievements to improve parsing.'
        );
      } else if (calculatedScore >= 75) {
        generatedSuggestions.push(
          '✅ Great! Your summary is well-balanced for ATS scanning.'
        );
      }

      // If no suggestions generated, add a generic one
      if (generatedSuggestions.length === 0) {
        generatedSuggestions.push('💡 Your profile looks solid. Keep optimizing with targeted keywords.');
      }

      setMatchScore(calculatedScore);
      setPassedKeywords(passed);
      setMissingKeywords(missing);
      setSuggestions(generatedSuggestions);
      setAnalyzing(false);
    }, 1000); // simulated delay
  };

  // Reset analysis state
  const clearAnalysis = () => {
    setMatchScore(null);
    setPassedKeywords([]);
    setMissingKeywords([]);
    setSuggestions([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-indigo-500" size={20} />
        <span>Synchronising Scanner Parameters...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center gap-4 pb-6 border-b border-slate-900">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">ATS Keyword Scanner Hub</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cross‑reference your live resume sections against job requirements instantly.
            </p>
          </div>
        </header>

        {/* Main grid */}
        <main className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left: Input panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Target Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={14}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-slate-700 resize-none leading-relaxed placeholder-slate-600"
                placeholder="Paste the raw text of the vacancy advertisement or target position requirements sheet here..."
              />
            </div>

            <button
              onClick={runAnalysisMatrix}
              disabled={analyzing}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 transform active:scale-[0.99] disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Compiling Metric Variances...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Audit Current Match Score
                </>
              )}
            </button>

            {matchScore !== null && (
              <button
                onClick={clearAnalysis}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors mt-2"
              >
                Clear Results
              </button>
            )}
          </div>

          {/* Right: Results panel */}
          <div className="lg:col-span-3 space-y-6">
            {matchScore === null ? (
              // Empty state
              <div className="border border-dashed border-slate-800/80 rounded-2xl p-20 text-center flex flex-col items-center justify-center space-y-3">
                <FileSearch className="text-slate-700 h-10 w-10" />
                <h4 className="text-sm font-semibold text-slate-400">Analysis System Idle</h4>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  Paste your target recruitment job description on the left to run standard keyword metrics.
                </p>
              </div>
            ) : (
              // Active results
              <div className="space-y-6 animate-fade-in">
                {/* Score card */}
                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center gap-6">
                  <div
                    className={`h-24 w-24 rounded-full border-4 flex items-center justify-center text-2xl font-black font-mono shrink-0 shadow-lg ${
                      matchScore >= 75
                        ? 'border-green-500/30 text-green-400 bg-green-500/5'
                        : matchScore >= 50
                        ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5'
                        : 'border-red-500/30 text-red-400 bg-red-500/5'
                    }`}
                  >
                    {matchScore}%
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">Your Optimization Index Match</h3>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                      {matchScore >= 75
                        ? 'Excellent alignment! Your profile metadata features clean compatibility with standard automated tracking engines.'
                        : matchScore >= 50
                        ? 'Moderate match. Injecting a few more targeted skill terms will push you into top‑tier candidate placement.'
                        : 'Low keyword volume. Machine filters may prioritise other profiles. Apply the adjustments below.'}
                    </p>
                  </div>
                </div>

                {/* Passed / Missing keywords side‑by‑side */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Passed */}
                  <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-2 mb-3">
                      <CheckCircle size={14} /> Matches Found ({passedKeywords.length})
                    </h4>
                    {passedKeywords.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No matches caught</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {passedKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="text-xs bg-green-500/10 text-green-300 px-2 py-1 rounded-full border border-green-500/20"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Missing */}
                  <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2 mb-3">
                      <XCircle size={14} /> Missing Terms ({missingKeywords.length})
                    </h4>
                    {missingKeywords.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Zero omissions verified</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {missingKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="text-xs bg-red-500/10 text-red-300 px-2 py-1 rounded-full border border-red-500/20"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} /> Strategic Profile Adjustments
                  </h4>
                  <ul className="space-y-2">
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