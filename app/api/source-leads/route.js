import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { findMatchingJobs } from '@/lib/jobSources';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { country, location } = await request.json().catch(() => ({}));

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tech_stack')
      .eq('id', user.id)
      .maybeSingle();

      if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile lookup failed' }, { status: 404 });
    }

    const jobs = await findMatchingJobs(profile.tech_stack || '', {
      country: country || 'ng',
      location: location || null,
      minScore: 10,
    });

    return NextResponse.json({ success: true, leads: jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Lead sourcing failed: ' + error.message }, { status: 500 });
  }
}