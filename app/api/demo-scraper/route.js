import { NextResponse } from 'next/server';

function safeFetchJson(url, options) {
  return fetch(url, options)
    .then((res) => {
      if (!res.ok) throw new Error('Request failed with status ' + res.status);
      return res.json();
    })
    .catch((error) => {
      console.error('Demo source fetch failed: ' + url + ' -> ' + error.message);
      return null;
    });
}

async function fetchRemoteOKDemo(keyword) {
  const data = await safeFetchJson('https://remoteok.com/api');
  if (!Array.isArray(data)) return [];
  return data
    .filter((job) => job && job.position)
    .filter((job) => job.position.toLowerCase().includes(keyword))
    .slice(0, 3)
    .map((job) => ({ source: 'RemoteOK', title: job.position, company: job.company || 'Unknown Company', location: 'Remote' }));
}

async function fetchArbeitnowDemo(keyword) {
  const data = await safeFetchJson('https://www.arbeitnow.com/api/job-board-api');
  if (!data || !data.data) return [];
  return data.data
    .filter((job) => job.title.toLowerCase().includes(keyword))
    .slice(0, 3)
    .map((job) => ({ source: 'Arbeitnow', title: job.title, company: job.company_name || 'Unknown Company', location: job.remote ? 'Remote' : (job.location || '') }));
}

async function fetchRemotiveDemo(keyword) {
  const data = await safeFetchJson('https://remotive.com/api/remote-jobs?search=' + encodeURIComponent(keyword));
  if (!data || !data.jobs) return [];
  return data.jobs.slice(0, 3).map((job) => ({
    source: 'Remotive', title: job.title, company: job.company_name || 'Unknown Company', location: job.candidate_required_location || 'Remote',
  }));
}

export async function POST(request) {
  try {
    const { jobTitle } = await request.json();

    if (!jobTitle || jobTitle.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter a job title.' }, { status: 400 });
    }

    const keyword = jobTitle.trim().toLowerCase().slice(0, 40);

    const results = await Promise.all([
      fetchRemoteOKDemo(keyword),
      fetchArbeitnowDemo(keyword),
      fetchRemotiveDemo(keyword),
    ]);

    const combined = results.flat().slice(0, 3);

    return NextResponse.json({ success: true, jobs: combined }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Demo scan failed: ' + error.message }, { status: 500 });
  }
}