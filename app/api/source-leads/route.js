import { NextResponse } from 'next/server';
import { findMatchingJobs } from '@/lib/jobSources';

export async function POST(request) {
  try {
    const { techStack, country } = await request.json();

    if (!techStack) {
      return NextResponse.json({ error: 'Missing techStack in request body' }, { status: 400 });
    }

    const jobs = await findMatchingJobs(techStack, { country: country || 'ng', minScore: 10 });

    return NextResponse.json({ success: true, leads: jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Lead sourcing failed: ' + error.message }, { status: 500 });
  }
}