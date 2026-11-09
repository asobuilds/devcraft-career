const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;
const FINDWORK_API_KEY = process.env.FINDWORK_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_JOBBERMAN_ACTOR_ID = process.env.APIFY_JOBBERMAN_ACTOR_ID;

import { getCachedJobs, setCachedJobs } from './jobs-cache';

function normalizeKeywords(techStackString) {
  return (techStackString || '')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function safeFetchJson(url, options) {
  return fetch(url, options)
    .then((res) => {
      if (!res.ok) {
        throw new Error('Request failed with status ' + res.status);
      }
      return res.json();
    })
    .catch((error) => {
      console.error('Source fetch failed: ' + url + ' -> ' + error.message);
      return null;
    });
}

function getValueByPath(obj, path) {
  if (!path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

async function fetchAdzunaJobs(keywords, country) {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) return [];
  const query = encodeURIComponent(keywords.slice(0, 3).join(' '));
  const url =
    'https://api.adzuna.com/v1/api/jobs/' + country + '/search/1?app_id=' + ADZUNA_APP_ID +
    '&app_key=' + ADZUNA_APP_KEY + '&results_per_page=20&what=' + query + '&content-type=application/json';
  const data = await safeFetchJson(url);
  if (!data || !data.results) return [];
  return data.results.map((job) => ({
    source: 'Adzuna', title: job.title,
    company: job.company ? job.company.display_name : 'Unknown Company',
    location: job.location ? job.location.display_name : '',
    url: job.redirect_url, description: job.description || '',
    salary: job.salary_min ? '₦' + Math.round(job.salary_min).toLocaleString() + '+' : null,
    postedDate: job.created || null,
  }));
}

async function fetchJoobleJobs(keywords, location) {
  if (!JOOBLE_API_KEY) return [];
  const url = 'https://jooble.org/api/' + JOOBLE_API_KEY;
  const data = await safeFetchJson(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords: keywords.slice(0, 3).join(' '), location: location || 'Nigeria' }),
  });
  if (!data || !data.jobs) return [];
  return data.jobs.map((job) => ({
    source: 'Jooble', title: job.title, company: job.company || 'Unknown Company',
    location: job.location || '', url: job.link, description: job.snippet || '', salary: job.salary || null,
    postedDate: job.updated || null,
  }));
}

async function fetchRemoteOKJobs(keywords) {
  const data = await safeFetchJson('https://remoteok.com/api');
  if (!Array.isArray(data)) return [];
  return data.filter((job) => job && job.position).filter((job) => {
    const text = (job.position + ' ' + (job.tags || []).join(' ')).toLowerCase();
    return keywords.some((k) => text.includes(k));
  }).map((job) => ({
    source: 'RemoteOK', title: job.position, company: job.company || 'Unknown Company',
    location: 'Remote', url: job.url, description: job.description || '',
    salary: job.salary_min ? '$' + job.salary_min.toLocaleString() + '+' : null,
    postedDate: job.date || null,
  }));
}

async function fetchArbeitnowJobs(keywords) {
  const data = await safeFetchJson('https://www.arbeitnow.com/api/job-board-api');
  if (!data || !data.data) return [];
  return data.data.filter((job) => {
    const text = (job.title + ' ' + (job.tags || []).join(' ')).toLowerCase();
    return keywords.some((k) => text.includes(k));
  }).map((job) => ({
    source: 'Arbeitnow', title: job.title, company: job.company_name || 'Unknown Company',
    location: job.location || (job.remote ? 'Remote' : ''), url: job.url,
    description: job.description || '', salary: null,
    postedDate: job.created_at ? new Date(job.created_at * 1000).toISOString() : null,
  }));
}

async function fetchReliefWebJobs(keywords) {
  const query = encodeURIComponent(keywords.slice(0, 2).join(' OR '));
  const url = 'https://api.reliefweb.int/v1/jobs?appname=devcraft-career&query[value]=' + query + '&limit=15';
  const data = await safeFetchJson(url);
  if (!data || !data.data) return [];
  return data.data.map((item) => ({
    source: 'ReliefWeb (NGO)', title: item.fields ? item.fields.title : 'Untitled Role',
    company: item.fields && item.fields.source && item.fields.source[0] ? item.fields.source[0].name : 'NGO / Humanitarian Organization',
    location: item.fields && item.fields.country && item.fields.country[0] ? item.fields.country[0].name : '',
    url: item.fields ? item.fields.url_alias : null, description: '', salary: null,
    postedDate: item.fields && item.fields.date ? item.fields.date.created : null,
  }));
}

async function fetchJobicyJobs(keywords) {
  const data = await safeFetchJson('https://jobicy.com/api/v2/remote-jobs?count=30');
  if (!data || !data.jobs) return [];
  return data.jobs.filter((job) => {
    const text = (job.jobTitle + ' ' + (job.jobIndustry || []).join(' ')).toLowerCase();
    return keywords.some((k) => text.includes(k));
  }).map((job) => ({
    source: 'Jobicy', title: job.jobTitle, company: job.companyName || 'Unknown Company',
    location: job.jobGeo || 'Remote', url: job.url, description: job.jobExcerpt || '',
    salary: job.annualSalaryMin ? '$' + job.annualSalaryMin.toLocaleString() + '+' : null,
    postedDate: job.pubDate || null,
  }));
}

async function fetchHimalayasJobs(keywords) {
  const data = await safeFetchJson('https://himalayas.app/jobs/api?limit=40');
  if (!data || !data.jobs) return [];
  return data.jobs.filter((job) => {
    const text = (job.title + ' ' + (job.categories || []).join(' ')).toLowerCase();
    return keywords.some((k) => text.includes(k));
  }).map((job) => ({
    source: 'Himalayas', title: job.title, company: job.companyName || 'Unknown Company',
    location: 'Remote', url: job.applicationLink || job.guid, description: job.excerpt || '', salary: null,
    postedDate: job.pubDate ? new Date(job.pubDate).toISOString() : null,
  }));
}

async function fetchFindworkJobs(keywords) {
  if (!FINDWORK_API_KEY) return [];
  const query = encodeURIComponent(keywords.slice(0, 3).join(' '));
  const url = 'https://findwork.dev/api/jobs/?search=' + query;
  const data = await safeFetchJson(url, { headers: { Authorization: 'Token ' + FINDWORK_API_KEY } });
  if (!data || !data.results) return [];
  return data.results.map((job) => ({
    source: 'Findwork', title: job.role, company: job.company_name || 'Unknown Company',
    location: job.location || (job.remote ? 'Remote' : ''), url: job.url, description: job.text || '', salary: null,
    postedDate: job.date_posted || null,
  }));
}

async function fetchRemotiveJobs(keywords) {
  const query = encodeURIComponent(keywords.slice(0, 2).join(' '));
  const url = 'https://remotive.com/api/remote-jobs?search=' + query;
  const data = await safeFetchJson(url);
  if (!data || !data.jobs) return [];
  return data.jobs.map((job) => ({
    source: 'Remotive', title: job.title, company: job.company_name || 'Unknown Company',
    location: job.candidate_required_location || 'Remote', url: job.url,
    description: job.description ? job.description.replace(/<[^>]*>/g, '').slice(0, 300) : '',
    salary: job.salary || null,
    postedDate: job.publication_date || null,
  }));
}

async function fetchTheMuseJobs(keywords) {
  const query = encodeURIComponent(keywords.slice(0, 1).join(' '));
  const url = 'https://www.themuse.com/api/public/jobs?page=1&category=' + query;
  const data = await safeFetchJson(url);
  if (!data || !data.results) return [];
  return data.results.map((job) => ({
    source: 'The Muse',
    title: job.name,
    company: job.company ? job.company.name : 'Unknown Company',
    location: job.locations && job.locations[0] ? job.locations[0].name : '',
    url: job.refs ? job.refs.landing_page : null,
    description: job.contents ? job.contents.replace(/<[^>]*>/g, '').slice(0, 300) : '',
    salary: null,
    postedDate: job.publication_date || null,
  }));
}

async function fetchJSearchJobs(keywords, location) {
  if (!RAPIDAPI_KEY) return [];
  const query = encodeURIComponent(keywords.slice(0, 3).join(' ') + (location ? ' in ' + location : ''));
  const url = 'https://jsearch.p.rapidapi.com/search?query=' + query + '&page=1&num_pages=1';
  const data = await safeFetchJson(url, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
  });
  if (!data || !data.data) return [];
  return data.data.map((job) => ({
    source: 'JSearch (RapidAPI)',
    title: job.job_title,
    company: job.employer_name || 'Unknown Company',
    location: job.job_city ? job.job_city + ', ' + (job.job_country || '') : (job.job_country || ''),
    url: job.job_apply_link,
    description: job.job_description ? job.job_description.slice(0, 400) : '',
    salary: job.job_min_salary ? '₦' + Math.round(job.job_min_salary).toLocaleString() + '+' : null,
    postedDate: job.job_posted_at_datetime_utc || null,
  }));
}

async function fetchApifyJobs(keywords, location) {
  if (!APIFY_API_TOKEN || !APIFY_JOBBERMAN_ACTOR_ID) return [];
  const query = keywords.slice(0, 3).join(' ');
  const url = `https://api.apify.com/v2/acts/${APIFY_JOBBERMAN_ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}&memory=1024`;
  const data = await safeFetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ search: query, location: location || 'Nigeria', maxItems: 25 }),
  });
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    source: 'Jobberman (Apify)',
    title: item.title || item.position || '',
    company: item.company || item.companyName || 'Unknown Company',
    location: item.location || 'Nigeria',
    url: item.url || item.link || null,
    description: item.description || item.snippet || '',
    salary: item.salary || null,
    postedDate: item.postedDate || null,
  }));
}

function buildCustomApiUrl(template, keywords, location) {
  const keywordString = encodeURIComponent(keywords.slice(0, 3).join(' '));
  const locationString = encodeURIComponent(location || '');
  return template.replace('{keywords}', keywordString).replace('{location}', locationString);
}

async function fetchOneCustomApi(prefix, keywords, location) {
  const template = process.env[prefix + '_URL'];
  if (!template) return [];

  const name = process.env[prefix + '_NAME'] || 'Custom Source';
  const resultsPath = process.env[prefix + '_RESULTS_PATH'] || '';
  const fieldMapRaw = process.env[prefix + '_FIELD_MAP'];
  const headersRaw = process.env[prefix + '_HEADERS'];

  if (!fieldMapRaw) return [];

  let fieldMap;
  try {
    fieldMap = JSON.parse(fieldMapRaw);
  } catch (parseError) {
    console.error(prefix + '_FIELD_MAP is not valid JSON');
    return [];
  }

  let headers;
  try {
    headers = headersRaw ? JSON.parse(headersRaw) : {};
  } catch (parseError) {
    headers = {};
  }

  const url = buildCustomApiUrl(template, keywords, location);
  const data = await safeFetchJson(url, { headers: headers });
  if (!data) return [];

  const resultsArray = resultsPath ? getValueByPath(data, resultsPath) : data;
  if (!Array.isArray(resultsArray)) return [];

  return resultsArray.map((item) => ({
    source: name,
    title: getValueByPath(item, fieldMap.title) || '',
    company: getValueByPath(item, fieldMap.company) || 'Unknown Company',
    location: fieldMap.location ? (getValueByPath(item, fieldMap.location) || '') : '',
    url: fieldMap.url ? getValueByPath(item, fieldMap.url) : null,
    description: fieldMap.description ? (getValueByPath(item, fieldMap.description) || '') : '',
    salary: fieldMap.salary ? getValueByPath(item, fieldMap.salary) : null,
    postedDate: fieldMap.postedDate ? getValueByPath(item, fieldMap.postedDate) : null,
  }));
}

async function fetchCustomApiJobs(keywords, location) {
  const prefixes = ['CUSTOM_JOB_API_1', 'CUSTOM_JOB_API_2', 'CUSTOM_JOB_API_3'];
  const results = await Promise.all(
    prefixes.map((prefix) => fetchOneCustomApi(prefix, keywords, location))
  );
  return results.flat();
}

function scoreJobMatch(job, keywords) {
  const haystack = (job.title + ' ' + job.description).toLowerCase();
  let matchCount = 0;
  for (const keyword of keywords) {
    if (haystack.includes(keyword)) matchCount += 1;
  }
  if (keywords.length === 0) return 0;
  return Math.round((matchCount / keywords.length) * 100);
}

function dedupeJobs(jobs) {
  const seen = new Set();
  const result = [];
  for (const job of jobs) {
    const key = (job.title + '|' + job.company).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(job);
    }
  }
  return result;
}

function applyLocationFilter(jobs, location) {
  if (!location) return jobs;
  const locationLower = location.toLowerCase();
  return jobs.filter((job) => {
    const jobLocation = (job.location || '').toLowerCase();
    if (jobLocation === '') return true;
    if (jobLocation.includes('remote')) return true;
    return jobLocation.includes(locationLower);
  });
}

export async function findMatchingJobs(techStackString, options) {
  const country = (options && options.country) || 'ng';
  const location = options && options.location ? options.location : null;
  const minScore = (options && options.minScore) || 20;
  const keywords = normalizeKeywords(techStackString);
  if (keywords.length === 0) return [];

  const cacheKey = `${techStackString.toLowerCase()}_${country}_${location || 'all'}_${minScore}`;
  const cached = getCachedJobs(cacheKey);
  if (cached) {
    return cached;
  }

  const results = await Promise.all([
    fetchAdzunaJobs(keywords, country),
    fetchJoobleJobs(keywords, location),
    fetchRemoteOKJobs(keywords),
    fetchArbeitnowJobs(keywords),
    fetchReliefWebJobs(keywords),
    fetchJobicyJobs(keywords),
    fetchHimalayasJobs(keywords),
    fetchFindworkJobs(keywords),
    fetchRemotiveJobs(keywords),
    fetchTheMuseJobs(keywords),
    fetchJSearchJobs(keywords, location),
    fetchCustomApiJobs(keywords, location),
    fetchApifyJobs(keywords, location),
  ]);

  let allJobs = dedupeJobs(results.flat());
  allJobs = applyLocationFilter(allJobs, location);

  const scoredJobs = allJobs
    .map((job) => ({ ...job, matchScore: scoreJobMatch(job, keywords) }))
    .filter((job) => job.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore);

  setCachedJobs(cacheKey, scoredJobs);
  return scoredJobs;
}
