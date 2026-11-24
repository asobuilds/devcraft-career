import { NextResponse } from 'next/server';

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

const USER_AGENT = 'DevCraftDemoBot/1.0 (+https://devcraft-career.vercel.app)';
const PER_SOURCE_TIMEOUT_MS = 8000;
const OVERALL_BUDGET_MS = 12000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const MAX_RESULTS = 12;
const MAX_PER_SOURCE = 8;
const MAX_KEYWORD = 60;
const MAX_TITLE = 120;
const MAX_COMPANY = 80;
const MAX_LOCATION = 80;

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

// Simple module-level, per-keyword cache. On a warm server instance this prevents the
// public demo from hammering the upstream boards on every click.
const cache = new Map();

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
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(keyword);
    return null;
  }
  return entry.jobs;
}

function setCached(keyword, jobs) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(keyword, { ts: Date.now(), jobs });
}

async function fetchText(url, accept) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PER_SOURCE_TIMEOUT_MS);
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
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url, 'application/json'));
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
// Nigerian sources
// ---------------------------------------------------------------------------

async function fetchHotNigerianJobs(keyword) {
  try {
    const xml = await fetchText(
      'https://www.hotnigerianjobs.com/feed/',
      'application/rss+xml,application/xml,text/xml',
    );
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
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
    return jobs;
  } catch (error) {
    console.error('Hot Nigerian Jobs source failed: ' + error.message);
    return [];
  }
}

async function fetchJobzilla(keyword) {
  try {
    const xml = await fetchText(
      'https://www.jobzilla.ng/feed/',
      'application/rss+xml,application/xml,text/xml',
    );
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
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
    return jobs;
  } catch (error) {
    console.error('Jobzilla source failed: ' + error.message);
    return [];
  }
}

async function fetchMyJobMag(keyword) {
  try {
    const html = await fetchText('https://www.myjobmag.com/jobs-by-date/today', 'text/html');
    const blocks = html.split('class="job-list-li"').slice(1);
    const jobs = [];
    for (const block of blocks) {
      const linkMatch = block.match(
        /<h2>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>/i,
      );
      if (!linkMatch) continue;
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
    return jobs;
  } catch (error) {
    console.error('MyJobMag source failed: ' + error.message);
    return [];
  }
}

// ---------------------------------------------------------------------------
// International fallback sources
// ---------------------------------------------------------------------------

async function fetchRemoteOKDemo(keyword) {
  try {
    const data = await fetchJson('https://remoteok.com/api');
    if (!Array.isArray(data)) return [];
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
    return jobs;
  } catch (error) {
    console.error('RemoteOK source failed: ' + error.message);
    return [];
  }
}

async function fetchArbeitnowDemo(keyword) {
  try {
    const data = await fetchJson('https://www.arbeitnow.com/api/job-board-api');
    if (!data || !Array.isArray(data.data)) return [];
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
    return jobs;
  } catch (error) {
    console.error('Arbeitnow source failed: ' + error.message);
    return [];
  }
}

async function fetchRemotiveDemo(keyword) {
  try {
    const data = await fetchJson(
      'https://remotive.com/api/remote-jobs?search=' + encodeURIComponent(keyword),
    );
    if (!data || !Array.isArray(data.jobs)) return [];
    const jobs = [];
    for (const item of data.jobs) {
      if (!item || !item.title || !item.url) continue;
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
    return jobs;
  } catch (error) {
    console.error('Remotive source failed: ' + error.message);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Orchestration: parallel fetch, per-source timeout, overall budget.
// Each source resolves to an array and never rejects, so one slow/broken upstream
// can never take down the route. Slots are filled as results arrive, so if the
// 12s budget is hit we still return everything that finished in time.
// ---------------------------------------------------------------------------

async function gatherJobs(keyword) {
  const sources = [
    { group: 'ng', run: fetchHotNigerianJobs },
    { group: 'ng', run: fetchJobzilla },
    { group: 'ng', run: fetchMyJobMag },
    { group: 'intl', run: fetchRemoteOKDemo },
    { group: 'intl', run: fetchArbeitnowDemo },
    { group: 'intl', run: fetchRemotiveDemo },
  ];

  const slots = new Array(sources.length).fill(null);
  const tasks = sources.map((source, index) =>
    Promise.resolve()
      .then(() => source.run(keyword))
      .then((value) => {
        slots[index] = Array.isArray(value) ? value : [];
        return slots[index];
      })
      .catch(() => {
        slots[index] = [];
        return slots[index];
      }),
  );

  await Promise.race([
    Promise.allSettled(tasks),
    new Promise((resolve) => setTimeout(resolve, OVERALL_BUDGET_MS)),
  ]);

  const nigerian = [];
  const international = [];
  sources.forEach((source, index) => {
    if (!slots[index]) return;
    if (source.group === 'ng') nigerian.push(...slots[index]);
    else international.push(...slots[index]);
  });

  return { nigerian, international };
}

export async function POST(request) {
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

  const keyword = trimmed.slice(0, MAX_KEYWORD).toLowerCase();

  const cached = getCached(keyword);
  if (cached) {
    return NextResponse.json({ success: true, jobs: cached }, { status: 200 });
  }

  try {
    const { nigerian, international } = await gatherJobs(keyword);
    const jobs = finalizeJobs(nigerian, international);
    setCached(keyword, jobs);
    return NextResponse.json({ success: true, jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Demo scan failed: ' + error.message },
      { status: 500 },
    );
  }
}
