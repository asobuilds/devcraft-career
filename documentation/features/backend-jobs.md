# Backend Job Matching & Caching Architecture

## Overview
DevCraft Career features a robust backend job aggregation engine capable of fetching real-time job listings from 11+ distinct sources (Adzuna, Jooble, RemoteOK, Arbeitnow, ReliefWeb, Jobicy, Himalayas, Findwork, Remotive, The Muse, JSearch, Apify Jobberman) plus custom API integrations configured via `.env`.

## Components
1. **Aggregator (`lib/jobSources.js`)**: Queries enabled sources in parallel, normalizes job payloads, deduplicates by title and company, and computes skill match scores based on user tech stack and `targetJobType` domain prioritization.
2. **Type Definitions (`lib/jobSources.types.ts`)**: Provides strict TypeScript interfaces (`Job`, `JobSearchOptions` supporting `targetJobType`) for the aggregator and search endpoints.
3. **In-Memory Cache (`lib/jobs-cache.ts` / `lib/jobs-cache.js`)**: Caches search results with TTL expiration to optimize performance and prevent rate-limiting on upstream job boards.
4. **Database Migrations**:
   - `supabase/migrations/0001_job_matches.sql`: Establishes the `job_applications` table with Row Level Security (RLS).
   - `supabase/migrations/0002_template_upgrades.sql`: Adds `profile_photo_url` (text) to `profiles` and `target_job_type` (text) to `resumes`.

## Target Job Type Filtering & Prioritization
The search API (`app/api/jobs/search/route.ts`) and job sources engine support `targetJobType` (e.g., `'tech'`, `'finance'`, `'creative'`, `'graduate'`). Job match scoring automatically boosts relevant domain roles to ensure candidates receive highly relevant suggestions corresponding to their selected CV template and target industry.

## API Endpoints & Edge Functions
- **`POST /api/jobs/search`**: Main job search endpoint supporting `techStack`, `location`, `country`, `minScore`, and `targetJobType`.
- **`POST /api/cron-scraper`**: Background sweep for Premium users, fetching top matches and automatically inserting leads into `job_applications` while triggering email notifications.
- **`POST /api/source-leads`**: On-demand lead sourcing for users.
- **`jooble-jobs` / `jobberman-jobs` Edge Functions**: Proxies search requests securely to upstream job boards.

## Security & RLS
All job application records and leads are protected via Supabase RLS policies ensuring users can only read, insert, update, and delete their own records (`auth.uid() = user_id`).
