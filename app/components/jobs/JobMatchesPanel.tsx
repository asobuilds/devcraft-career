'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  ExternalLink,
  Filter,
  Loader2,
  MapPin,
  RefreshCw,
  SearchX,
  Wifi,
} from 'lucide-react';

export interface JobMatch {
  source: string;
  title: string;
  company: string;
  location: string;
  url: string | null;
  description: string;
  salary: string | null;
  matchScore: number;
  remote: boolean;
}

interface SearchResponse {
  jobs?: JobMatch[];
  count?: number;
  error?: string;
  warnings?: string[];
}

interface JobMatchesPanelProps {
  techStack: string[];
}

type RemoteFilter = 'all' | 'remote' | 'onsite';

const SKELETON_KEYS = ['one', 'two', 'three', 'four'];
const REQUEST_TIMEOUT_MS = 30_000;

export default function JobMatchesPanel({ techStack }: JobMatchesPanelProps) {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [remoteFilter, setRemoteFilter] = useState<RemoteFilter>('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  const requestRef = useRef<AbortController | null>(null);

  const techKey = useMemo(
    () =>
      techStack
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .filter((tag, index, list) => list.indexOf(tag) === index)
        .join(','),
    [techStack],
  );

  const hasSkills = techKey.length > 0;

  const loadJobs = useCallback(
    async (options?: { refresh?: boolean; reset?: boolean }) => {
      const refresh = options?.refresh === true;
      const reset = options?.reset === true;
      const skills = techKey.split(',').filter(Boolean);

      if (reset) {
        setJobs([]);
        setWarnings([]);
        setError('');
        setSourceFilter('all');
        setRemoteFilter('all');
      }

      if (skills.length === 0) {
        setWarnings([]);
        setError('');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;

      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch('/api/jobs/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ techStack: skills, refresh }),
          signal: controller.signal,
        });

        const data: SearchResponse = await response.json().catch(() => ({}));

        if (requestRef.current !== controller) return;

        if (!response.ok) {
          throw new Error(data.error || `Search failed with status ${response.status}.`);
        }

        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
        setWarnings(Array.isArray(data.warnings) ? data.warnings : []);
      } catch (requestError) {
        if (requestRef.current !== controller) return;

        if (controller.signal.aborted) {
          setError('The search took too long. Please try again.');
        } else {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not load job matches right now.',
          );
        }
      } finally {
        clearTimeout(timer);
        if (requestRef.current === controller) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [techKey],
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      loadJobs({ reset: true });
    }, 0);

    return () => {
      clearTimeout(handle);
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [loadJobs]);

  const sources = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.source))).sort((a, b) => a.localeCompare(b)),
    [jobs],
  );

  const activeSourceFilter =
    sourceFilter !== 'all' && !sources.includes(sourceFilter) ? 'all' : sourceFilter;

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        if (remoteFilter === 'remote' && !job.remote) return false;
        if (remoteFilter === 'onsite' && job.remote) return false;
        if (activeSourceFilter !== 'all' && job.source !== activeSourceFilter) return false;
        return true;
      }),
    [jobs, remoteFilter, activeSourceFilter],
  );

  const showFilters = jobs.length > 0;
  const showEmpty = !loading && !error && hasSkills && jobs.length === 0;
  const showFilteredEmpty = !loading && filteredJobs.length === 0 && jobs.length > 0;

  return (
    <section className="w-full space-y-4" aria-label="Job matches">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
            <Briefcase size={15} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-white">Job Matches</h2>
            <p className="text-[11px] text-slate-400">
              Live roles scored against your technical skills.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadJobs({ refresh: true })}
          disabled={loading || refreshing || !hasSkills}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <RefreshCw size={13} />
          )}
          Refresh
        </button>
      </header>

      {showFilters ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by work type">
            {(
              [
                { value: 'all', label: 'All' },
                { value: 'remote', label: 'Remote' },
                { value: 'onsite', label: 'On-site' },
              ] as { value: RemoteFilter; label: string }[]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRemoteFilter(option.value)}
                aria-pressed={remoteFilter === option.value}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                  remoteFilter === option.value
                    ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-200'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-[11px] text-slate-400">
            <Filter size={12} className="text-slate-500" />
            <span className="sr-only">Filter by source</span>
            <select
              value={activeSourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {showFilters ? (
        <p className="text-[11px] text-slate-500">
          Showing {filteredJobs.length} of {jobs.length} role{jobs.length === 1 ? '' : 's'}
        </p>
      ) : null}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-label="Loading job matches">
          {SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="min-h-[184px] animate-pulse rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <div className="h-4 w-2/3 rounded bg-slate-800" />
              <div className="mt-2 h-3 w-1/3 rounded bg-slate-800/70" />
              <div className="mt-4 h-3 w-1/2 rounded bg-slate-800/70" />
              <div className="mt-4 h-1.5 w-full rounded bg-slate-800/70" />
              <div className="mt-4 h-3 w-full rounded bg-slate-800/70" />
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-red-300">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => loadJobs({ refresh: true })}
            className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold text-red-200 hover:bg-red-500/20"
          >
            Try again
          </button>
        </div>
      ) : null}

      {!hasSkills && !loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 px-6 py-12 text-center">
          <Briefcase size={22} className="text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-300">Add your technical skills</p>
          <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-slate-500">
            List skills like React, TypeScript, or SQL in your CV to see matching roles here.
          </p>
        </div>
      ) : null}

      {showEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 px-6 py-12 text-center">
          <SearchX size={22} className="text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-300">No matching roles yet</p>
          <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-slate-500">
            Try adding a few more skills, or refresh to run a fresh scan across job sources.
          </p>
          {warnings.length > 0 ? (
            <ul className="mt-3 max-w-sm space-y-1 text-left text-[10px] leading-relaxed text-slate-500">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {showFilteredEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 px-6 py-10 text-center">
          <Filter size={20} className="text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-300">No roles match these filters</p>
          <button
            type="button"
            onClick={() => {
              setRemoteFilter('all');
              setSourceFilter('all');
            }}
            className="mt-3 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:border-slate-700 hover:text-white"
          >
            Clear filters
          </button>
        </div>
      ) : null}

      {!loading && filteredJobs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredJobs.map((job, index) => (
            <article
              key={`${job.source}-${job.title}-${job.company}-${index}`}
              className="flex min-h-[184px] flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition-colors hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-white" title={job.title}>
                    {job.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-slate-400" title={job.company}>
                    {job.company}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  {job.matchScore}% match
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-400">
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin size={11} className="shrink-0 text-slate-500" />
                  <span className="truncate">{job.location || 'Location not listed'}</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    job.remote
                      ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
                      : 'border-slate-700 bg-slate-800/60 text-slate-300'
                  }`}
                >
                  {job.remote ? <Wifi size={10} /> : <Briefcase size={10} />}
                  {job.remote ? 'Remote' : 'On-site'}
                </span>
              </div>

              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800"
                role="img"
                aria-label={`${job.matchScore}% skill match`}
              >
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, Math.max(0, job.matchScore))}%` }}
                />
              </div>

              {job.description ? (
                <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                  {job.description}
                </p>
              ) : null}

              {job.salary ? (
                <p className="text-[11px] font-medium text-indigo-300">{job.salary}</p>
              ) : null}

              <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                <span
                  className="truncate font-mono text-[10px] uppercase tracking-wide text-slate-500"
                  title={job.source}
                >
                  {job.source}
                </span>
                {job.url ? (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
                  >
                    Apply
                    <ExternalLink size={11} />
                  </a>
                ) : (
                  <span className="shrink-0 rounded-lg border border-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
                    No link
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
