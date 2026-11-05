-- Migration: 0001_job_matches.sql
-- Description: Create job_applications table and policies for job tracking and cron scraper leads.

create table if not exists public.job_applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company_name text not null,
  job_title text not null,
  status text not null default 'lead' check (status in ('lead', 'applied', 'interview', 'offer', 'rejected')),
  salary_range text,
  apply_url text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.job_applications enable row level security;

-- Create RLS policies
create policy "Users can view their own job applications"
  on public.job_applications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own job applications"
  on public.job_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own job applications"
  on public.job_applications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own job applications"
  on public.job_applications for delete
  using (auth.uid() = user_id);

-- Create index on user_id for performance
create index if not exists job_applications_user_id_idx on public.job_applications(user_id);
