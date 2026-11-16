-- Migration 0013: Create Core Tables
-- Creates resumes, portfolios, ats_scans, and feedback tables with proper foreign keys.

-- 1. Resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  resume_title text default 'Untitled Resume',
  summary text default '',
  skills text[] default '{}',
  experience jsonb default '[]',
  active_template text default 'modern-indigo',
  attachments jsonb default '[]',
  target_job_type text default 'tech',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text default 'My Portfolio',
  bio text default '',
  tech_stack text default '',
  custom_subdomain text,
  selected_template text default 'minimal',
  projects jsonb default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ATS scans table
CREATE TABLE IF NOT EXISTS public.ats_scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_title text,
  score integer,
  missing_keywords text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid default gen_random_uuid() primary key,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own resumes"
  ON public.resumes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own portfolios"
  ON public.portfolios FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own ats scans"
  ON public.ats_scans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users submit feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ats_scans TO authenticated;
GRANT INSERT ON public.feedback TO authenticated;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
