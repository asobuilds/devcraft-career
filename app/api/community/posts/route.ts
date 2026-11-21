import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const postCreateSchema = z.object({
  circle_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  );
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    );

    const { data: posts, error } = await supabaseClient
      .from('posts')
      .select('id, circle_id, user_id, content, created_at, circles ( id, name ), profiles:author ( full_name, avatar_url )')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const { data: allPosts, error: allError } = await supabaseClient
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
  const user = await getAuthenticatedUser(req);
  if (!user) {
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

  try {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    );

    const { data: post, error } = await supabaseClient
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
