import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthContext } from '../auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const likeSchema = z.object({
  post_id: z.string().uuid(),
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

  const parsed = likeSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join('; ') },
      { status: 400 }
    );
  }

  const { post_id } = parsed.data;
  const { user, supabase } = auth;

  try {
    const { data: existing, error: findError } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    let liked: boolean;

    if (existing) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existing.id);

      if (error) {
        throw error;
      }

      liked = false;
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ post_id, user_id: user.id });

      if (error) {
        throw error;
      }

      liked = true;
    }

    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post_id);

    return NextResponse.json({ liked, likeCount: count ?? 0 });
  } catch (err) {
    console.error('[community/likes] POST error:', err);
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 });
  }
}
