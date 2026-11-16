-- Migration 0015: Kanban Tracker Status Column
-- Adds/normalizes the status column on job_applications, indexes it, and ensures
-- users can update their own rows.

-- 1. Add status column if it does not exist
ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'applied';

-- 2. Index status for faster Kanban board grouping/filtering
CREATE INDEX IF NOT EXISTS job_applications_status_idx ON public.job_applications(status);

-- 3. Ensure RLS is enabled
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 4. Ensure a policy allows users to update their own rows
DROP POLICY IF EXISTS "Users can update their own job applications" ON public.job_applications;
CREATE POLICY "Users can update their own job applications"
  ON public.job_applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
