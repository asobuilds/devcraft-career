import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { findMatchingJobs } from '@/lib/jobSources';
import { sendEmail, buildJobLeadEmailHtml } from '@/lib/sendEmail';

export async function POST(request) {
  try {
    const { userId, location } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email, tech_stack, is_premium')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile lookup failed' }, { status: 404 });
    }

    if (!profile.is_premium) {
      return NextResponse.json({
        success: false,
        opportunityFound: false,
        message: 'Job lead sourcing and notifications are a Premium feature. Upgrade to activate automatic job matching.',
      }, { status: 200 });
    }

    const techStack = profile.tech_stack || '';
    const matchedJobs = await findMatchingJobs(techStack, { country: 'ng', location: location || 'Nigeria', minScore: 15 });

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
      apply_url: job.url,
      notes:
        'Auto-sourced from ' +
        job.source +
        ' (' +
        job.matchScore +
        '% match).',
    }));

    const { error: insertError } = await supabase.from('job_applications').insert(trackingCardRows);

    if (insertError) {
      return NextResponse.json({ error: 'Failed to save leads: ' + insertError.message }, { status: 500 });
    }

    if (profile.email) {
      const emailHtml = buildJobLeadEmailHtml(profile.full_name, topMatches);
      await sendEmail(profile.email, topMatches.length + ' new job match' + (topMatches.length === 1 ? '' : 'es') + ' found — DevCraft Career', emailHtml);
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