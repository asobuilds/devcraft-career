-- Migration 0023: Career Vault
-- Private document storage with owner-only access.

-- 1. Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_name text not null,
  file_type text not null,
  storage_path text not null,
  extracted_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents (user_id);

-- 2. Row level security: users can only read, add and remove their own documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'documents' AND policyname = 'Users read own documents'
  ) THEN
    CREATE POLICY "Users read own documents"
      ON public.documents FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'documents' AND policyname = 'Users insert own documents'
  ) THEN
    CREATE POLICY "Users insert own documents"
      ON public.documents FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'documents' AND policyname = 'Users delete own documents'
  ) THEN
    CREATE POLICY "Users delete own documents"
      ON public.documents FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

GRANT SELECT, INSERT, DELETE ON public.documents TO authenticated;

-- 3. Private storage bucket for vault files
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault', 'vault', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies: files are kept in <user_id>/ folders and owned by that user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users read own vault files'
  ) THEN
    CREATE POLICY "Users read own vault files"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'vault'
        AND auth.uid()::text = owner
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users upload own vault files'
  ) THEN
    CREATE POLICY "Users upload own vault files"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'vault'
        AND auth.uid()::text = owner
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users delete own vault files'
  ) THEN
    CREATE POLICY "Users delete own vault files"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'vault'
        AND auth.uid()::text = owner
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END
$$;

NOTIFY pgrst, 'reload schema';
