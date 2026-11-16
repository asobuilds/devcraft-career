import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

const VALID_STATUSES = ['lead', 'applied', 'interview', 'offer', 'rejected'];

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const jobId = payload.jobId as string | undefined;
    const status = payload.status as string | undefined;

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json({ error: 'jobId is required and must be a string.' }, { status: 400 });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'status is required and must be one of: ' + VALID_STATUSES.join(', ') },
        { status: 400 },
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('job_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', jobId)
      .eq('user_id', user.id)
      .select('id, user_id, company_name, job_title, status, salary_range, apply_url, notes, created_at, updated_at')
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (!updated) {
      return NextResponse.json({ error: 'Job application not found or does not belong to you.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, job: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update job status: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 },
    );
  }
}
