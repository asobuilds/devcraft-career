import { NextResponse } from 'next/server';

// The aggregator runs up to a 12s overall budget; make sure a platform default
// 10s function limit cannot terminate it mid-scan.
export const maxDuration = 30;

// DevCraft landing-page demo job aggregator.
//
// Abuse / contact: https://devcraft-career.vercel.app (see USER_AGENT below).
// Every outbound request is identified with a descriptive User-Agent. Sources were
// vetted against their robots.txt before being added:
//
//   • Hot Nigerian Jobs — official RSS feed at /feed/ (robots.txt: Allow: /).       ADDED (RSS)
//   • Jobzilla          — official RSS feed at /feed/ (robots.txt: Allow: /).        ADDED (RSS)
//   • MyJobMag          — server-rendered /jobs-by-date/today listing page only      ADDED (HTML)
//                         (robots.txt permits this path; query-string search is
//                         disallowed, so we fetch the plain listing and filter
//                         locally — no detail-page crawling).
//   • Jobberman         — SKIPPED: robots.txt disallows /job/ detail pages, /api/
//                         and all query/filter paths; its sitemaps expose job URLs
//                         only (no company/location), so it cannot be used without
//                         inventing data.
//
// International boards (RemoteOK, Arbeitnow, Remotive) remain as a fallback so the
// demo never renders empty when the Nigerian sources have no match.
//
// Diagnostics: POST /api/demo-scraper?debug=1 returns a `sources` array describing
// each upstream (attempted / ok / jobsFound / error / timing / itemsScanned). The
// normal response shape is unchanged when the param is absent.

const USER_AGENT = 'DevCraftDemoBot/1.0 (+https://devcraft-career.vercel.app)';
// Nigerian sources are heavier (a ~600-item RSS feed and a full HTML listing) and
// were observed taking 6s+ from slow networks. Aborting them at 8s silently starved
// the demo of Nigerian results, so they get a slightly larger slice of the budget.
const NG_PER_SOURCE_TIMEOUT_MS = 10000;
const PER_SOURCE_TIMEOUT_MS = 8000;
const OVERALL_BUDGET_MS = 12000;
const CACHE_TTL_MS = 10 * 60 * 1000;
// If every Nigerian source failed, only hold the (international-only) result briefly
// so a poisoned/empty-Nigerian entry can't mask a recovered upstream for 10 minutes.
const FAILED_NG_CACHE_TTL_MS = 60 * 1000;
// Raw upstream payloads (RSS/HTML/JSON) are cached by URL so searching many different
// keywords does not re-hit the boards every time (they are not keyword-addressable).
const SOURCE_CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const MAX_SOURCE_CACHE_ENTRIES = 60;
const MAX_RESULTS = 12;
const MAX_PER_SOURCE = 8;
const MAX_KEYWORD = 60;
const MAX_TITLE = 120;
const MAX_COMPANY = 80;
const MAX_LOCATION = 80;

// Keyword-based cache. Key is the normalized keyword that was actually searched
// (trimmed, lowercased, capped at MAX_KEYWORD). A fresh deploy / cold instance
// starts with an empty Map (module scope).
const cache = new Map();
// Raw-payload cache keyed by upstream URL.
const sourceCache = new Map();

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'Abuja',
];
const STATE_PATTERN = new RegExp(
  '\\b(' +
    NIGERIAN_STATES.slice()
      .sort((a, b) => b.length - a.length)
      .join('|') +
    ')\\b',
  'i',
);

function safeCodePoint(code) {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return '';
  try {
    return String.fromCodePoint(code);
  } catch {
    return '';
  }
}

function decodeEntities(input) {
  return String(input || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => safeCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => safeCodePoint(parseInt(dec, 10)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&');
}

function unwrapCdata(input) {
  return String(input || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

function stripTags(input) {
  return decodeEntities(unwrapCdata(input))
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clean(input, maxLength) {
  const text = stripTags(input);
  return text.length > maxLength ? text.slice(0, maxLength).trim() : text;
}

function cleanUrl(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.toString();
  } catch {
    return '';
  }
}

function splitTitleCompany(raw) {
  const full = clean(raw, MAX_TITLE + MAX_COMPANY + 10);
  const match = full.match(/^(.*?)\s+(?:at|@)\s+(.+)$/i);
  if (match && match[1].trim() && match[2].trim()) {
    return { title: match[1].trim(), company: match[2].trim() };
  }
  return { title: full, company: '' };
}

function extractLocation(raw) {
  const text = stripTags(raw).split(
    /employment type|job type|job description|responsibilities|requirements|qualifications/i,
  )[0];
  const patterns = [
    /located in\s+([^.;]+)/i,
    /position (?:is\s+)?(?:located\s+)?in\s+([^.;]+)/i,
    /locations?\s*:?\s*([^.;]+)/i,
    /\bin\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*\s+State)\b/,
  ];
  let longValue = '';
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const value = match[1].replace(/^[\s:;,.\-\u2013]+/, '').trim();
    if (value.length < 2 || !/[a-z]/i.test(value)) continue;
    if (value.length <= 40) return value;
    if (!longValue) longValue = value;
  }
  const stateMatch = text.match(STATE_PATTERN);
  if (stateMatch) return stateMatch[1].trim();
  if (longValue) return longValue;
  if (/\bremote\b/i.test(text)) return 'Remote';
  return '';
}

function buildJob({ source, title, company, location, url }) {
  const safeTitle = clean(title, MAX_TITLE);
  const safeUrl = cleanUrl(url);
  if (!safeTitle || !safeUrl) return null;
  return {
    source,
    title: safeTitle,
    company: clean(company, MAX_COMPANY) || 'Unknown Company',
    location: clean(location, MAX_LOCATION) || 'Not specified',
    url: safeUrl,
  };
}

function normalizeUrlKey(url) {
  return url.toLowerCase().replace(/\/+$/, '');
}

function normalizeTitleCompanyKey(title, company) {
  return (title + '|' + company).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function finalizeJobs(nigerianJobs, internationalJobs) {
  const ordered = [...nigerianJobs, ...internationalJobs];
  const seenUrls = new Set();
  const seenTitleCompany = new Set();
  const jobs = [];

  for (const job of ordered) {
    if (!job) continue;
    const urlKey = normalizeUrlKey(job.url);
    const titleCompanyKey = normalizeTitleCompanyKey(job.title, job.company);
    if (!urlKey || seenUrls.has(urlKey) || seenTitleCompany.has(titleCompanyKey)) continue;
    seenUrls.add(urlKey);
    seenTitleCompany.add(titleCompanyKey);
    jobs.push(job);
    if (jobs.length >= MAX_RESULTS) break;
  }

  return jobs;
}

function getCached(keyword) {
  const entry = cache.get(keyword);
  if (!entry) return null;
  if (Date.now() - entry.ts > entry.ttl) {
    cache.delete(keyword);
    return null;
  }
  return entry.jobs;
}

function setCached(keyword, jobs, ttl) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(keyword, { ts: Date.now(), ttl: ttl || CACHE_TTL_MS, jobs });
}

function isNetworkError(error) {
  if (!error) return false;
  if (error instanceof TypeError) return true;
  return /fetch failed|network|ECONN|ENOTFOUND|EAI_AGAIN|socket|connection/i.test(
    String(error.message),
  );
}

async function fetchText(url, accept, timeoutMs) {
  const limit = timeoutMs || PER_SOURCE_TIMEOUT_MS;
  let lastError = null;

  // One retry for transient connection resets ("fetch failed"), which were observed
  // intermittently on Jobzilla. Timeouts and HTTP errors are not retried: retrying a
  // timeout would just burn the overall budget.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), limit);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        cache: 'no-store',
        headers: {
          'User-Agent': USER_AGENT,
          Accept: accept || '*/*',
        },
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (error && (error.name === 'AbortError' || /abort/i.test(String(error.message)))) {
        throw new Error('Timed out after ' + limit + 'ms');
      }
      if (attempt === 0 && isNetworkError(error)) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        continue;
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error('Request failed');
}

async function fetchCachedText(url, accept, bypassCache, timeoutMs) {
  if (!bypassCache) {
    const entry = sourceCache.get(url);
    if (entry && Date.now() - entry.ts < SOURCE_CACHE_TTL_MS) return entry.text;
  }
  const text = await fetchText(url, accept, timeoutMs);
  if (!bypassCache) {
    if (sourceCache.size >= MAX_SOURCE_CACHE_ENTRIES) {
      const oldest = sourceCache.keys().next().value;
      if (oldest !== undefined) sourceCache.delete(oldest);
    }
    sourceCache.set(url, { ts: Date.now(), text });
  }
  return text;
}

async function fetchCachedJson(url, bypassCache, timeoutMs) {
  return JSON.parse(await fetchCachedText(url, 'application/json', bypassCache, timeoutMs));
}

function xmlTag(block, tag) {
  const match = String(block).match(
    new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>', 'i'),
  );
  return match ? match[1] : '';
}

function matchesKeyword(haystack, keyword) {
  return haystack.toLowerCase().includes(keyword);
}

// ---------------------------------------------------------------------------
// Nigerian sources. Each returns { jobs, itemsScanned } and throws on failure so
// the debug report can distinguish "fetch failed" from "fetched, 0 matches".
// RSS feeds are not keyword-addressable, so we scan the entire feed (not a prefix)
// before filtering locally. Observed depth: Hot Nigerian Jobs ~600 items, Jobzilla
// ~200 items — both well above the 100-item minimum.
// ---------------------------------------------------------------------------

const HOT_NIGERIAN_JOBS_FEED = 'https://www.hotnigerianjobs.com/feed/';
const JOBZILLA_FEED = 'https://www.jobzilla.ng/feed/';
const MYJOBMAG_LISTING = 'https://www.myjobmag.com/jobs-by-date/today';

async function fetchHotNigerianJobs(keyword, bypassCache) {
  const xml = await fetchCachedText(
    HOT_NIGERIAN_JOBS_FEED,
    'application/rss+xml,application/xml,text/xml',
    bypassCache,
    NG_PER_SOURCE_TIMEOUT_MS,
  );
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  if (!items.length) {
    const looksLikeRss = /<rss[\s>]|<feed[\s>]/i.test(xml);
    throw new Error(looksLikeRss ? 'RSS feed returned 0 items' : 'Unexpected response (not RSS)');
  }
  const jobs = [];
  for (const item of items) {
    const rawTitle = xmlTag(item, 'title');
    const link = xmlTag(item, 'link');
    const description = xmlTag(item, 'description');
    const searchable = stripTags(rawTitle) + ' ' + stripTags(description);
    if (!matchesKeyword(searchable, keyword)) continue;
    const parts = splitTitleCompany(rawTitle);
    const job = buildJob({
      source: 'Hot Nigerian Jobs',
      title: parts.title,
      company: parts.company,
      location: extractLocation(description),
      url: link.trim(),
    });
    if (job) jobs.push(job);
    if (jobs.length >= MAX_PER_SOURCE) break;
  }
  return { jobs, itemsScanned: items.length };
}

async function fetchJobzilla(keyword, bypassCache) {
  const xml = await fetchCachedText(
    JOBZILLA_FEED,
    'application/rss+xml,application/xml,text/xml',
    bypassCache,
    NG_PER_SOURCE_TIMEOUT_MS,
  );
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  if (!items.length) {
    const looksLikeRss = /<rss[\s>]|<feed[\s>]/i.test(xml);
    throw new Error(looksLikeRss ? 'RSS feed returned 0 items' : 'Unexpected response (not RSS)');
  }
  const jobs = [];
  for (const item of items) {
    const rawTitle = xmlTag(item, 'title');
    const link = xmlTag(item, 'link');
    const description = stripTags(xmlTag(item, 'description'));
    const searchable = stripTags(rawTitle) + ' ' + description;
    if (!matchesKeyword(searchable, keyword)) continue;
    const parts = splitTitleCompany(rawTitle);
    const job = buildJob({
      source: 'Jobzilla',
      title: parts.title,
      company: parts.company,
      location: extractLocation(description),
      url: link.trim(),
    });
    if (job) jobs.push(job);
    if (jobs.length >= MAX_PER_SOURCE) break;
  }
  return { jobs, itemsScanned: items.length };
}

async function fetchMyJobMag(keyword, bypassCache) {
  const html = await fetchCachedText(
    MYJOBMAG_LISTING,
    'text/html',
    bypassCache,
    NG_PER_SOURCE_TIMEOUT_MS,
  );
  const blocks = html.split('class="job-list-li"').slice(1);
  if (!blocks.length) throw new Error('Unexpected response (no listing blocks)');
  let scanned = 0;
  const jobs = [];
  for (const block of blocks) {
    const linkMatch = block.match(
      /<h2>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>/i,
    );
    if (!linkMatch) continue;
    scanned += 1;
    const rawTitle = linkMatch[2];
    if (!matchesKeyword(stripTags(rawTitle), keyword)) continue;
    const href = linkMatch[1];
    const locationMatch = block.match(
      /href=['"]\/jobs-location\/[^'"]+['"][^>]*>([\s\S]*?)<\/a>/i,
    );
    const parts = splitTitleCompany(rawTitle);
    const job = buildJob({
      source: 'MyJobMag',
      title: parts.title,
      company: parts.company,
      location: locationMatch ? stripTags(locationMatch[1]) : '',
      url: href.startsWith('http') ? href : 'https://www.myjobmag.com' + href,
    });
    if (job) jobs.push(job);
    if (jobs.length >= MAX_PER_SOURCE) break;
  }
  if (scanned === 0) throw new Error('Unexpected response (no job cards parsed)');
  return { jobs, itemsScanned: scanned };
}

// ---------------------------------------------------------------------------
// International fallback sources
// ---------------------------------------------------------------------------

async function fetchRemoteOKDemo(keyword, bypassCache) {
  const data = await fetchCachedJson('https://remoteok.com/api', bypassCache);
  if (!Array.isArray(data)) throw new Error('Unexpected response (not an array)');
  const jobs = [];
  for (const item of data) {
    if (!item || !item.position || !item.url) continue;
    if (!item.position.toLowerCase().includes(keyword)) continue;
    const job = buildJob({
      source: 'RemoteOK',
      title: item.position,
      company: item.company,
      location: 'Remote',
      url: item.url,
    });
    if (job) jobs.push(job);
    if (jobs.length >= MAX_PER_SOURCE) break;
  }
  return { jobs, itemsScanned: data.length };
}

async function fetchArbeitnowDemo(keyword, bypassCache) {
  const data = await fetchCachedJson('https://www.arbeitnow.com/api/job-board-api', bypassCache);
  if (!data || !Array.isArray(data.data)) throw new Error('Unexpected response (no data array)');
  const jobs = [];
  for (const item of data.data) {
    if (!item || !item.title || !item.url) continue;
    if (!item.title.toLowerCase().includes(keyword)) continue;
    const job = buildJob({
      source: 'Arbeitnow',
      title: item.title,
      company: item.company_name,
      location: item.remote ? 'Remote' : item.location,
      url: item.url,
    });
    if (job) jobs.push(job);
    if (jobs.length >= MAX_PER_SOURCE) break;
  }
  return { jobs, itemsScanned: data.data.length };
}

async function fetchRemotiveDemo(keyword, bypassCache) {
  const data = await fetchCachedJson(
    'https://remotive.com/api/remote-jobs?search=' + encodeURIComponent(keyword),
    bypassCache,
  );
  if (!data || !Array.isArray(data.jobs)) throw new Error('Unexpected response (no jobs array)');
  const jobs = [];
  for (const item of data.jobs) {
    if (!item || !item.title || !item.url) continue;
    // Remotive's `search` query is not a reliable relevance filter (it returns a
    // generic latest-jobs sample), so gate on the title locally like the RSS sources.
    if (!matchesKeyword(item.title, keyword)) continue;
    const job = buildJob({
      source: 'Remotive',
      title: item.title,
      company: item.company_name,
      location: item.candidate_required_location || 'Remote',
      url: item.url,
    });
    if (job) jobs.push(job);
    if (jobs.length >= MAX_PER_SOURCE) break;
  }
  return { jobs, itemsScanned: data.jobs.length };
}

const SOURCE_DEFS = [
  { name: 'Hot Nigerian Jobs', group: 'ng', run: fetchHotNigerianJobs },
  { name: 'Jobzilla', group: 'ng', run: fetchJobzilla },
  { name: 'MyJobMag', group: 'ng', run: fetchMyJobMag },
  { name: 'RemoteOK', group: 'intl', run: fetchRemoteOKDemo },
  { name: 'Arbeitnow', group: 'intl', run: fetchArbeitnowDemo },
  { name: 'Remotive', group: 'intl', run: fetchRemotiveDemo },
];

// Orchestration: parallel fetch with per-source timeout + overall budget. Each
// source is caught independently, so a failure/timeout in one cannot break the
// route. Slots are filled as results arrive; if the overall budget is hit we still
// return whatever finished in time (and report the rest as timed out).
async function gatherJobs(keyword, bypassCache) {
  const slots = new Array(SOURCE_DEFS.length).fill(null);
  const reports = SOURCE_DEFS.map((source) => ({
    source: source.name,
    attempted: true,
    ok: false,
    jobsFound: 0,
    error: null,
    ms: 0,
    itemsScanned: 0,
  }));

  const tasks = SOURCE_DEFS.map((source, index) => {
    const started = Date.now();
    return Promise.resolve()
      .then(() => source.run(keyword, bypassCache))
      .then((value) => {
        const jobs = value && Array.isArray(value.jobs) ? value.jobs : [];
        slots[index] = jobs;
        reports[index].ok = true;
        reports[index].jobsFound = jobs.length;
        reports[index].itemsScanned =
          value && typeof value.itemsScanned === 'number' ? value.itemsScanned : 0;
      })
      .catch((error) => {
        slots[index] = [];
        reports[index].ok = false;
        reports[index].error = error && error.message ? error.message : String(error);
        // Visible in Vercel function logs even when nobody calls ?debug=1.
        console.warn('[demo-scraper] ' + source.name + ' failed: ' + reports[index].error);
      })
      .finally(() => {
        reports[index].ms = Date.now() - started;
      });
  });

  await Promise.race([
    Promise.allSettled(tasks),
    new Promise((resolve) => setTimeout(resolve, OVERALL_BUDGET_MS)),
  ]);

  reports.forEach((report, index) => {
    if (slots[index] === null) {
      report.error =
        report.error || 'Timed out at overall ' + OVERALL_BUDGET_MS + 'ms budget';
    }
  });

  const nigerian = [];
  const international = [];
  SOURCE_DEFS.forEach((source, index) => {
    if (!slots[index]) return;
    if (source.group === 'ng') nigerian.push(...slots[index]);
    else international.push(...slots[index]);
  });

  return { nigerian, international, reports };
}

export async function POST(request) {
  const debug = new URL(request.url).searchParams.get('debug') === '1';

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const rawKeyword = payload ? payload.jobTitle : '';
  if (typeof rawKeyword !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Please enter a job title.' },
      { status: 400 },
    );
  }

  const trimmed = rawKeyword.trim();
  if (trimmed.length < 2) {
    return NextResponse.json(
      { success: false, error: 'Please enter a job title.' },
      { status: 400 },
    );
  }

  // Cache key IS the searched keyword (normalized for case/whitespace only).
  const keyword = trimmed.slice(0, MAX_KEYWORD).toLowerCase();

  if (!debug) {
    const cached = getCached(keyword);
    if (cached) {
      return NextResponse.json({ success: true, jobs: cached }, { status: 200 });
    }
  }

  try {
    // debug=1 bypasses both the keyword cache and the raw-payload cache so the
    // report reflects the live upstream state right now.
    const { nigerian, international, reports } = await gatherJobs(keyword, debug);
    const jobs = finalizeJobs(nigerian, international);

    const nigerianReachable = reports.some(
      (report, index) => SOURCE_DEFS[index].group === 'ng' && report.ok,
    );
    const ttl = nigerianReachable ? CACHE_TTL_MS : FAILED_NG_CACHE_TTL_MS;
    // Diagnostics are read-only: don't let a debug run warm or poison the cache.
    if (!debug) setCached(keyword, jobs, ttl);

    if (debug) {
      return NextResponse.json(
        {
          success: true,
          jobs,
          keyword,
          cacheBypassed: true,
          cachedForMs: ttl,
          sources: reports,
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ success: true, jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Demo scan failed: ' + error.message },
      { status: 500 },
    );
  }
}
