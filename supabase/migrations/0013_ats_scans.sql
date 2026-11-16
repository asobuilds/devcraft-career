-- Migration 0013: Persist ATS analysis results per user.

create table if not exists public.ats_scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  resume_text text not null default '',
  job_description text not null default '',
  score integer,
  missing_keywords jsonb not null default '[]'::jsonb,
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ats_scans enable row level security;

create policy "Users can view their own ATS scans"
  on public.ats_scans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own ATS scans"
  on public.ats_scans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own ATS scans"
  on public.ats_scans for update
  using (auth.uid() = user_id);

create policy "Users can delete their own ATS scans"
  on public.ats_scans for delete
  using (auth.uid() = user_id);

create index if not exists ats_scans_user_id_created_at_idx
  on public.ats_scans(user_id, created_at desc);

grant select, insert, update, delete on public.ats_scans to authenticated;
