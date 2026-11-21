-- Migration 0022: Community security hardening
-- Ensures RLS is strictly enforced on all community tables and adds
-- explicit deny-all fallbacks where no policy exists for a role.

-- Circles: authenticated users can only read. No INSERT/UPDATE/DELETE.
-- The service_role bypasses RLS, so admin seeding still works.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'circles' AND policyname = 'Authenticated users read circles'
  ) THEN
    CREATE POLICY "Authenticated users read circles"
      ON public.circles FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END
$$;

-- Ensure no authenticated write access to circles
REVOKE INSERT, UPDATE, DELETE ON public.circles FROM authenticated;
GRANT SELECT ON public.circles TO authenticated;

-- Posts: ensure owner-only writes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'posts' AND policyname = 'Users insert own posts'
  ) THEN
    CREATE POLICY "Users insert own posts"
      ON public.posts FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'posts' AND policyname = 'Users update own posts'
  ) THEN
    CREATE POLICY "Users update own posts"
      ON public.posts FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'posts' AND policyname = 'Users delete own posts'
  ) THEN
    CREATE POLICY "Users delete own posts"
      ON public.posts FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Comments: ensure owner-only writes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'comments' AND policyname = 'Users insert own comments'
  ) THEN
    CREATE POLICY "Users insert own comments"
      ON public.comments FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'comments' AND policyname = 'Users update own comments'
  ) THEN
    CREATE POLICY "Users update own comments"
      ON public.comments FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'comments' AND policyname = 'Users delete own comments'
  ) THEN
    CREATE POLICY "Users delete own comments"
      ON public.comments FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Likes: ensure owner-only writes, no UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'likes' AND policyname = 'Users insert own likes'
  ) THEN
    CREATE POLICY "Users insert own likes"
      ON public.likes FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'likes' AND policyname = 'Users delete own likes'
  ) THEN
    CREATE POLICY "Users delete own likes"
      ON public.likes FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

REVOKE UPDATE ON public.likes FROM authenticated;

-- Ensure RLS is enabled on all community tables
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
