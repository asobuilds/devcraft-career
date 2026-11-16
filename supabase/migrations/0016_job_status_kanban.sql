-- Migration 0015: Align job application statuses with the Kanban board.

alter table public.job_applications
  drop constraint if exists job_applications_status_check;

update public.job_applications
  set status = 'interviewing'
  where status = 'interview';

update public.job_applications
  set status = 'offered'
  where status = 'offer';

alter table public.job_applications
  add constraint job_applications_status_check
  check (status in ('lead', 'applied', 'interviewing', 'offered', 'rejected'));
