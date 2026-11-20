-- Migration 0019: Seed portfolios table with demo candidate data
-- Inserts one portfolio per demo profile so the public directory resolves
-- without 404s. tech_stack is a comma-separated text column.

INSERT INTO public.portfolios (
  id,
  user_id,
  title,
  bio,
  tech_stack,
  custom_subdomain,
  selected_template,
  projects,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Chinedu Okafor — Portfolio',
    'Full-stack developer from Lagos building fast, accessible web apps.',
    'React, Node.js, TypeScript, Tailwind CSS',
    'chinedu-dev',
    'developer',
    '[]'::jsonb,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'a1b2c3d4-0002-4000-8000-000000000002',
    'Aisha Bello — Portfolio',
    'Frontend engineer crafting pixel-perfect, performant interfaces.',
    'JavaScript, HTML, CSS, Vue, Vite',
    'aisha-frontend',
    'minimal',
    '[]'::jsonb,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'a1b2c3d4-0003-4000-8000-000000000003',
    'Emeka Nwosu — Portfolio',
    'Full-stack engineer focused on scalable backends and cloud infrastructure.',
    'Next.js, Python, FastAPI, PostgreSQL, Docker',
    'emeka-fullstack',
    'developer',
    '[]'::jsonb,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'a1b2c3d4-0004-4000-8000-000000000004',
    'Fatima Yusuf — Portfolio',
    'Data analyst turning messy data into clear, actionable dashboards.',
    'Python, SQL, Pandas, Tableau, Power BI',
    'fatima-data',
    'creative',
    '[]'::jsonb,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'a1b2c3d4-0005-4000-8000-000000000005',
    'Tunde Adebayo — Portfolio',
    'Mobile-first engineer shipping cross-platform apps with React Native.',
    'React Native, TypeScript, Firebase, GraphQL',
    'tunde-mobile',
    'minimal',
    '[]'::jsonb,
    now(),
    now()
  );

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
