-- Migration 0020: Community schema (circles, posts, comments, likes)

-- 1. Circles table
CREATE TABLE IF NOT EXISTS public.circles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references public.circles(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE INDEX IF NOT EXISTS posts_circle_id_idx ON public.posts (circle_id);
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts (user_id);

-- 3. Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments (post_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments (user_id);

-- 4. Likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS likes_post_id_idx ON public.likes (post_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes (user_id);

-- 5. RLS policies
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Circles: anyone authenticated can read, only service role can write
CREATE POLICY "Authenticated users read circles"
  ON public.circles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Posts: anyone authenticated can read, owners can insert/update/delete
CREATE POLICY "Authenticated users read posts"
  ON public.posts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users insert own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- Comments: anyone authenticated can read, owners can insert/update/delete
CREATE POLICY "Authenticated users read comments"
  ON public.comments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users insert own comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Likes: anyone authenticated can read, users can insert/delete their own
CREATE POLICY "Authenticated users read likes"
  ON public.likes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users insert own likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Grants
GRANT SELECT ON public.circles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;

-- 7. Seed default circles
INSERT INTO public.circles (id, name, description) VALUES
  (
    gen_random_uuid(),
    'Tech & Engineering',
    'Discuss roles, salaries, and hiring at Nigerian and international tech companies.'
  ),
  (
    gen_random_uuid(),
    'NYSC & Graduate Roles',
    'Tips for NYSC posting, graduate programs, and first-job applications.'
  ),
  (
    gen_random_uuid(),
    'Lagos Fintech',
    'Everything about the Lagos fintech ecosystem: banks, payments, and startups.'
  ),
  (
    gen_random_uuid(),
    'Remote Opportunities',
    'Share and discuss fully remote roles open to candidates in Nigeria and Africa.'
  );

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
