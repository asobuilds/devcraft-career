import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { findMatchingJobs } from '@/lib/jobSources';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, tech_stack')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile lookup failed' }, { status: 404 });
    }

    const techStack = profile.tech_stack || '';

    const matchedJobs = await findMatchingJobs(techStack, { country: 'ng', minScore: 15 });

    if (matchedJobs.length === 0) {
      return NextResponse.json({
        success: true,
        opportunityFound: false,
        message: 'No matching jobs found in this sweep. We keep checking automatically.',
      }, { status: 200 });
    }

    const topMatches = matchedJobs.slice(0, 5);

    const trackingCardRows = topMatches.map((job) => ({
      user_id: userId,
      company_name: job.company,
      job_title: job.title,
      status: 'lead',
      salary_range: job.salary || 'Not listed',
      notes:
        'Auto-sourced from ' +
        job.source +
        ' (' +
        job.matchScore +
        '% match). Apply link: ' +
        job.url,
    }));

    const { error: insertError } = await supabase.from('job_applications').insert(trackingCardRows);

    if (insertError) {
      return NextResponse.json({ error: 'Failed to save leads: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      opportunityFound: true,
      count: topMatches.length,
      jobs: topMatches,
      message: topMatches.length + ' matching job(s) found and added to your tracker.',
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Scraper error: ' + error.message }, { status: 500 });
  }
}