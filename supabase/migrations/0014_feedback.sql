-- Migration 0014: Store landing page feedback submissions.

create table if not exists public.feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  rating integer check (rating between 1 and 5),
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.feedback enable row level security;

create policy "Anyone can submit feedback"
  on public.feedback for insert
  to anon, authenticated
  with check (true);

create index if not exists feedback_created_at_idx
  on public.feedback(created_at desc);

grant insert on public.feedback to anon, authenticated;
