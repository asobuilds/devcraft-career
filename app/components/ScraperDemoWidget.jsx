'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const DEMO_LOG_STEPS = [
  '[INIT] Connecting to job source network...',
  '[SCAN] Querying RemoteOK...',
  '[SCAN] Querying Arbeitnow...',
  '[SCAN] Querying Remotive...',
  '[DONE] Compiling live results...',
];

const EXAMPLE_KEYWORDS = [
  'Frontend Engineer',
  'Data Analyst',
  'Product Manager',
  'Remote Developer',
  'Lagos Accountant',
  'Graduate Trainee',
  'Digital Marketer',
  'Backend Developer',
];

const STEPS = [
  { number: 1, title: 'Search', text: 'Type a role or tap one of the example keywords.' },
  { number: 2, title: 'See real results', text: 'Jobs pulled live from multiple Nigerian job boards.' },
  { number: 3, title: 'Tailor your CV', text: 'Free account lets you match your CV to any job you find.' },
];

export default function ScraperDemoWidget() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState('');
  const [scanning, setScanning] = useState(false);
  const [logIndex, setLogIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
      setAuthChecked(true);
    });
  }, []);

  const handleTestScraper = async () => {
    if (!jobTitle.trim()) return;

    setScanning(true);
    setResults(null);
    setErrorMessage('');
    setLogIndex(0);

    const logInterval = setInterval(function () {
      setLogIndex(function (prev) {
        return prev < DEMO_LOG_STEPS.length - 1 ? prev + 1 : prev;
      });
    }, 450);

    try {
      const response = await fetch('/api/demo-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: jobTitle }),
      });
      const result = await response.json();

      clearInterval(logInterval);
      setLogIndex(DEMO_LOG_STEPS.length - 1);

      if (!result.success) {
        setErrorMessage(result.error || 'Could not run the demo scan.');
        setScanning(false);
        return;
      }

      setTimeout(function () {
        setResults(result.jobs || []);
        setScanning(false);
      }, 500);
    } catch {
      clearInterval(logInterval);
      setErrorMessage('Something went wrong. Please try again.');
      setScanning(false);
    }
  };

  const handleExampleClick = (keyword) => {
    setJobTitle(keyword);
    handleTestScraper();
  };

  const saveDemoKeyword = () => {
    if (jobTitle.trim()) {
      try { localStorage.setItem('devcraft_demo_keyword', jobTitle.trim()); } catch (_) {}
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 border-t border-slate-900 scroll-mt-20">
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <span className="text-emerald-400 font-mono text-sm uppercase tracking-widest block">LIVE DEMO</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Search Real Nigerian Jobs — Right Here</h2>
        <p className="text-slate-400 text-sm">Type a job title or tap an example below. We search real job boards live. No signup needed for the demo.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
        {STEPS.map((step) => (
          <div key={step.number} className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-sm mb-3">
              {step.number}
            </div>
            <p className="text-sm font-semibold text-white mb-1">{step.title}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto mb-6">
        <p className="text-xs text-slate-500 text-center mb-3">Try one of these:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_KEYWORDS.map((keyword) => (
            <button
              key={keyword}
              type="button"
              onClick={() => handleExampleClick(keyword)}
              disabled={scanning}
              className="rounded-full border border-slate-700 bg-slate-900/60 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-emerald-500/60 hover:text-emerald-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/70 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <div className="ml-3 flex-1 rounded-md border border-slate-800 bg-slate-900/70 px-3 py-1 text-[10px] text-slate-500">
            app.devcraft.ng/scraper-demo
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={jobTitle}
              onChange={function (e) { setJobTitle(e.target.value); }}
              onKeyDown={function (e) { if (e.key === 'Enter') handleTestScraper(); }}
              placeholder="e.g. Frontend Engineer"
              disabled={scanning}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
            />
            <button
              onClick={handleTestScraper}
              disabled={scanning || !jobTitle.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50 w-full sm:w-auto justify-center"
            >
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Search
            </button>
          </div>

          {scanning ? (
            <div className="space-y-3 pt-2">
              <div className="animate-pulse space-y-3">
                <div className="rounded-lg bg-slate-800/60 h-16" />
                <div className="rounded-lg bg-slate-800/60 h-16" />
                <div className="rounded-lg bg-slate-800/60 h-16" />
              </div>
              <p className="text-sm text-slate-400">Searching job boards…</p>
              <div className="font-mono text-[11px] text-emerald-400 space-y-1.5 pt-2">
                {DEMO_LOG_STEPS.slice(0, logIndex + 1).map(function (line, index) {
                  return (
                    <div key={index} className="flex items-center gap-2">
                      {index < logIndex ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0" /> : <Loader2 size={11} className="animate-spin text-emerald-400 shrink-0" />}
                      <span>{line}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <p className="text-xs text-red-400">{errorMessage}</p>
          ) : null}

          {results !== null && results.length > 0 ? (
            <div className="space-y-2 pt-2">
              {results.map(function (job, index) {
                const card = (
                  <div
                    key={index}
                    className={`rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-4 flex flex-col gap-1${job.url ? ' transition-colors hover:border-emerald-500/40' : ''}`}
                  >
                    <p className="text-sm font-semibold text-white">{job.title}</p>
                    <p className="text-xs text-slate-400">{job.company} • {job.location}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        {job.source}
                      </span>
                      {job.url ? (
                        <span className="text-xs font-medium text-emerald-400">Apply</span>
                      ) : null}
                    </div>
                  </div>
                );
                if (job.url) {
                  return (
                    <a key={index} href={job.url} target="_blank" rel="noopener noreferrer" className="block">
                      {card}
                    </a>
                  );
                }
                return card;
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">Your results will appear here.</p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 md:p-8 text-center">
        {authChecked && isAuthenticated ? (
          <>
            <h3 className="text-lg font-bold text-white mb-2">You&apos;re in!</h3>
            <p className="text-slate-300 text-sm mb-4">Tailor your CV to any of these jobs using our AI co-editor.</p>
            <button
              onClick={() => { saveDemoKeyword(); router.push('/cv-builder'); }}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
            >
              <ArrowRight size={14} />
              Tailor my CV
            </button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold text-white mb-2">Found a job you like?</h3>
            <p className="text-slate-300 text-sm mb-4">Create your free DevCraft account to tailor your CV to any of these jobs in minutes — ATS templates, AI suggestions, everything free.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                onClick={() => { saveDemoKeyword(); }}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
              >
                <UserPlus size={14} />
                Create free account
              </Link>
              <Link
                href="/login"
                onClick={() => { saveDemoKeyword(); }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-emerald-500/60 hover:text-emerald-400 transition-colors"
              >
                <LogIn size={14} />
                Log in
              </Link>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-slate-500 max-w-xl mx-auto mt-6 text-center">
        DevCraft searches multiple Nigerian job boards in one go — then our AI helps you tailor your CV to each role. Free, no card required.
      </p>
    </section>
  );
}