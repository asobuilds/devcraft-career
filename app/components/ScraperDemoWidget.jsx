'use client';

import React, { useState } from 'react';
import { Terminal, Search, Loader2, CheckCircle2, ArrowRight, Radar } from 'lucide-react';
import Link from 'next/link';

const DEMO_LOG_STEPS = [
  '[INIT] Connecting to job source network...',
  '[SCAN] Querying RemoteOK...',
  '[SCAN] Querying Arbeitnow...',
  '[SCAN] Querying Remotive...',
  '[DONE] Compiling live results...',
];

export default function ScraperDemoWidget() {
  const [jobTitle, setJobTitle] = useState('');
  const [scanning, setScanning] = useState(false);
  const [logIndex, setLogIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

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
    } catch (error) {
      clearInterval(logInterval);
      setErrorMessage('Something went wrong. Please try again.');
      setScanning(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-16 border-t border-slate-900 scroll-mt-20">
      <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold mb-2">
          <Radar size={14} /> Live Demo
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">See the Scraper Work</h2>
        <p className="text-slate-400 text-sm">Type a job title and watch it search real job boards, live, right now.</p>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-900 bg-slate-900/60">
          <Terminal size={14} className="text-emerald-400" />
          <span className="text-xs font-mono text-emerald-400">devcraft-scraper-demo</span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={jobTitle}
              onChange={function (e) { setJobTitle(e.target.value); }}
              onKeyDown={function (e) { if (e.key === 'Enter') handleTestScraper(); }}
              placeholder="e.g. Frontend Engineer"
              disabled={scanning}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleTestScraper}
              disabled={scanning || !jobTitle.trim()}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Test Scraper
            </button>
          </div>

          {scanning ? (
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
          ) : null}

          {errorMessage ? (
            <p className="text-xs text-red-400">{errorMessage}</p>
          ) : null}

          {results !== null ? (
            <div className="space-y-2 pt-2">
              {results.length === 0 ? (
                <p className="text-xs text-slate-500">No live matches for that title right now — try a broader term like "developer" or "engineer".</p>
              ) : (
                results.map(function (job, index) {
                  return (
                    <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">{job.title}</p>
                        <p className="text-[11px] text-slate-400">{job.company} — {job.location}</p>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">{job.source}</span>
                    </div>
                  );
                })
              )}

              <Link
                href="/register"
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-3 rounded-xl transition-colors"
              >
                Get results like this automatically <ArrowRight size={14} />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}