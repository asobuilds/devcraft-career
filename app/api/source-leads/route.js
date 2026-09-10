import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { findMatchingJobs } from '@/lib/jobSources';

export async function POST(request) {
  try {
    const { userId, country } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tech_stack, is_premium')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile lookup failed' }, { status: 404 });
    }

    if (!profile.is_premium) {
      return NextResponse.json({
        success: false,
        leads: [],
        message: 'Job leads are a Premium feature. Upgrade to see matching opportunities.',
      }, { status: 200 });
    }

    const jobs = await findMatchingJobs(profile.tech_stack || '', { country: country || 'ng', minScore: 10 });

    return NextResponse.json({ success: true, leads: jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Lead sourcing failed: ' + error.message }, { status: 500 });
  }
}