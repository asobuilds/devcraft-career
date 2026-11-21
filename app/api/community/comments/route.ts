import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthContext } from '../auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const commentSchema = z.object({
  post_id: z.string().uuid(),
  content: z.string().min(1).max(1000),
});

export async function POST(req: NextRequest) {
  const auth = await getAuthContext(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = commentSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join('; ') },
      { status: 400 }
    );
  }

  const { post_id, content } = parsed.data;
  const { user, supabase } = auth;

  try {
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({ post_id, user_id: user.id, content })
      .select('id, post_id, user_id, content, created_at')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error('[community/comments] POST error:', err);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
