-- Migration 0017: Seed Public Directory with Demo Candidate Profiles
-- Inserts 5 fake but realistic Nigerian candidate profiles so the directory is
-- not empty for new users. All rows are non-premium, visible in the portfolio
-- directory, and use tech_stack as comma-separated text to match the UI.

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  phone,
  website,
  is_admin,
  is_premium,
  show_dev_portfolio,
  show_cv_engine,
  system_theme,
  avatar_url,
  profile_photo_url,
  tech_stack,
  created_at,
  updated_at
) VALUES
  (
    'a1b2c3d4-0001-4000-8000-000000000001',
    'chinedu.okafor@example.com',
    'Chinedu Okafor',
    '+2348012345678',
    'chinedu-dev',
    false,
    false,
    true,
    true,
    'slate-black',
    NULL,
    NULL,
    'React, Node.js, TypeScript, Tailwind CSS',
    now(),
    now()
  ),
  (
    'a1b2c3d4-0002-4000-8000-000000000002',
    'aisha.bello@example.com',
    'Aisha Bello',
    '+2348023456789',
    'aisha-frontend',
    false,
    false,
    true,
    true,
    'slate-black',
    NULL,
    NULL,
    'JavaScript, HTML, CSS, Vue, Vite',
    now(),
    now()
  ),
  (
    'a1b2c3d4-0003-4000-8000-000000000003',
    'emeka.nwosu@example.com',
    'Emeka Nwosu',
    '+2348034567890',
    'emeka-fullstack',
    false,
    false,
    true,
    true,
    'slate-black',
    NULL,
    NULL,
    'Next.js, Python, FastAPI, PostgreSQL, Docker',
    now(),
    now()
  ),
  (
    'a1b2c3d4-0004-4000-8000-000000000004',
    'fatima.yusuf@example.com',
    'Fatima Yusuf',
    '+2348045678901',
    'fatima-data',
    false,
    false,
    true,
    true,
    'slate-black',
    NULL,
    NULL,
    'Python, SQL, Pandas, Tableau, Power BI',
    now(),
    now()
  ),
  (
    'a1b2c3d4-0005-4000-8000-000000000005',
    'tunde.adebayo@example.com',
    'Tunde Adebayo',
    '+2348056789012',
    'tunde-mobile',
    false,
    false,
    true,
    true,
    'slate-black',
    NULL,
    NULL,
    'React Native, TypeScript, Firebase, GraphQL',
    now(),
    now()
  );

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
