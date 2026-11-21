-- Migration 0021: Seed community posts with realistic demo data
-- Inserts 5 demo posts across the 4 seeded circles so the community
-- page is not empty for new users. Uses the demo profile user_ids
-- from migration 0017.

INSERT INTO public.posts (id, circle_id, user_id, content, created_at) VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM public.circles WHERE name = 'Lagos Fintech' LIMIT 1),
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Just got an offer from a fintech in Yaba! The ATS Analyzer on this platform was a lifesaver. Happy to share tips.',
    now() - interval '2 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.circles WHERE name = 'Tech & Engineering' LIMIT 1),
    'a1b2c3d4-0003-4000-8000-000000000003',
    'Is anyone else finding that remote US startups are asking for 5+ years of experience for mid-level roles? How are you guys navigating this?',
    now() - interval '1 day'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.circles WHERE name = 'NYSC & Graduate Roles' LIMIT 1),
    'a1b2c3d4-0002-4000-8000-000000000002',
    'NYSC just ended and I''m looking for entry-level product design roles in Abuja. Any leads?',
    now() - interval '12 hours'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.circles WHERE name = 'Remote Opportunities' LIMIT 1),
    'a1b2c3d4-0004-4000-8000-000000000004',
    'Landed a remote data analyst role paying in USD after 3 months of applying. The secret: I tailored my CV keywords for every single application. Took screenshots of my score improvements from 52% to 89%.',
    now() - interval '6 hours'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.circles WHERE name = 'Tech & Engineering' LIMIT 1),
    'a1b2c3d4-0005-4000-8000-000000000005',
    'Built a portfolio using the DevCraft templates and got 4 interview invites within a week. The React Native template especially stood out. Sharing my setup thread here for anyone starting out.',
    now() - interval '2 hours'
  );

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
