import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthContext } from '../auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const postCreateSchema = z.object({
  circle_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

export async function GET(req: NextRequest) {
  const auth = await getAuthContext(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { user, supabase } = auth;

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, circle_id, user_id, content, created_at, circles ( id, name ), profiles:author ( full_name, avatar_url )')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const { data: allPosts, error: allError } = await supabase
      .from('posts')
      .select('id, circle_id, user_id, content, created_at, circles ( id, name ), profiles:author ( full_name, avatar_url ), comments ( id, user_id, content, created_at, profiles:commenter ( full_name, avatar_url ) ), likes ( user_id )')
      .order('created_at', { ascending: false });

    if (allError) {
      throw allError;
    }

    return NextResponse.json({
      myPosts: posts ?? [],
      allPosts: allPosts ?? [],
    });
  } catch (err) {
    console.error('[community/posts] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

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

  const parsed = postCreateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join('; ') },
      { status: 400 }
    );
  }

  const { user, supabase } = auth;

  try {
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        circle_id: parsed.data.circle_id,
        user_id: user.id,
        content: parsed.data.content,
      })
      .select('id, circle_id, user_id, content, created_at')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error('[community/posts] POST error:', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
