import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { findMatchingJobs } from '@/lib/jobSources';

export const runtime = 'nodejs';

const CACHE_TTL_MS = 5 * 60 * 1000;
const SEARCH_TIMEOUT_MS = 20_000;

interface RawJob {
  source?: string;
  title?: string;
  company?: string;
  location?: string;
  url?: string | null;
  description?: string;
  salary?: string | null;
  matchScore?: number;
  remote?: unknown;
}

interface JobMatch {
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

interface SearchInput {
  techStack: string[];
  location: string | null;
  country: string;
  minScore: number;
}

interface CacheEntry {
  expiresAt: number;
  jobs: JobMatch[];
}

const cache = new Map<string, CacheEntry>();

const KEYED_SOURCES = [
  { name: 'Adzuna', env: ['ADZUNA_APP_ID', 'ADZUNA_APP_KEY'] },
  { name: 'Jooble', env: ['JOOBLE_API_KEY'] },
  { name: 'Findwork', env: ['FINDWORK_API_KEY'] },
  { name: 'JSearch (RapidAPI)', env: ['RAPIDAPI_KEY'] },
];

function normalizeTechStack(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  const seen = new Set<string>();
  const stack: string[] = [];

  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const tag = item.trim().toLowerCase();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    stack.push(tag);
  }

  return stack;
}

function readString(value: unknown, fallback: string | null): string | null {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed : fallback;
}

function readMinScore(value: unknown): number {
  const parsed =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

function buildCacheKey(input: SearchInput): string {
  const payload = JSON.stringify({
    techStack: [...input.techStack].sort(),
    location: input.location,
    country: input.country,
    minScore: input.minScore,
  });
  return createHash('sha256').update(payload).digest('hex');
}

function pruneCache(now: number): void {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
}

function cleanDescription(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 280);
}

function isRemote(job: RawJob): boolean {
  const location = (job.location || '').toLowerCase();
  const source = (job.source || '').toLowerCase();
  return (
    job.remote === true ||
    location.includes('remote') ||
    source === 'remoteok' ||
    source === 'himalayas'
  );
}

function normalizeJob(job: RawJob): JobMatch {
  return {
    source: job.source || 'Unknown',
    title: job.title || 'Untitled Role',
    company: job.company || 'Unknown Company',
    location: job.location || '',
    url: job.url || null,
    description: cleanDescription(job.description),
    salary: job.salary || null,
    matchScore: typeof job.matchScore === 'number' ? job.matchScore : 0,
    remote: isRemote(job),
  };
}

function missingKeyWarnings(): string[] {
  const warnings: string[] = [];
  for (const source of KEYED_SOURCES) {
    const missing = source.env.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      warnings.push(`${source.name} skipped: missing ${missing.join(', ')}.`);
    }
  }
  return warnings;
}

class SearchTimeoutError extends Error {
  constructor() {
    super('Job search timed out');
    this.name = 'SearchTimeoutError';
  }
}

async function runSearch(input: SearchInput): Promise<RawJob[]> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new SearchTimeoutError()), SEARCH_TIMEOUT_MS);
  });

  try {
    return await Promise.race([
      findMatchingJobs(input.techStack.join(','), {
        country: input.country,
        location: input.location || undefined,
        minScore: input.minScore,
      }) as Promise<RawJob[]>,
      timeout,
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const techStack = normalizeTechStack(payload.techStack);
  if (techStack.length === 0) {
    return NextResponse.json(
      { error: 'techStack must contain at least one non-empty skill.' },
      { status: 400 },
    );
  }

  const input: SearchInput = {
    techStack,
    location: readString(payload.location, null),
    country: (readString(payload.country, 'ng') || 'ng').toLowerCase(),
    minScore: readMinScore(payload.minScore),
  };

  const bypassCache = payload.refresh === true;
  const now = Date.now();
  pruneCache(now);

  const cacheKey = buildCacheKey(input);
  if (!bypassCache) {
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json({ jobs: cached.jobs, count: cached.jobs.length, cached: true });
    }
  }

  try {
    const rawJobs = await runSearch(input);
    const jobs = rawJobs.map(normalizeJob);
    cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, jobs });

    const warnings = missingKeyWarnings();
    if (jobs.length === 0) {
      warnings.push(
        'No jobs matched. Sources may be rate-limited, unreachable, or have no matching roles.',
      );
    }

    return NextResponse.json({
      jobs,
      count: jobs.length,
      cached: false,
      ...(warnings.length > 0 ? { warnings } : {}),
    });
  } catch (error) {
    if (error instanceof SearchTimeoutError) {
      return NextResponse.json(
        { error: 'Job search timed out. Please try again.', code: 'TIMEOUT' },
        { status: 504 },
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Job search failed: ' + message, code: 'UPSTREAM_ERROR' },
      { status: 502 },
    );
  }
}
