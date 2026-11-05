# Backend Job Matching & Caching Architecture

## Overview
DevCraft Career features a robust backend job aggregation engine capable of fetching real-time job listings from 11 distinct sources (Adzuna, Jooble, RemoteOK, Arbeitnow, ReliefWeb, Jobicy, Himalayas, Findwork, Remotive, The Muse, JSearch) plus custom API integrations configured via `.env`.

## Components
1. **Aggregator (`lib/jobSources.js`)**: Queries enabled sources in parallel, normalizes job payloads, deduplicates by title and company, and computes skill match scores based on user tech stack.
2. **Type Definitions (`lib/jobSources.types.ts`)**: Provides strict TypeScript interfaces (`Job`, `JobSearchOptions`) for the aggregator and search endpoints.
3. **In-Memory Cache (`lib/jobs-cache.ts`)**: Caches search results for 5 minutes with automatic TTL expiration to optimize performance and prevent rate-limiting on upstream job boards.
4. **Database Schema (`supabase/migrations/0001_job_matches.sql`)**: Establishes the `job_applications` table with Row Level Security (RLS) policies and performance indexes for user application tracking and auto-sourced leads.

## API Endpoints
- **`POST /api/cron-scraper`**: Background sweep for Premium users, fetching top matches and automatically inserting leads into `job_applications` while triggering email notifications.
- **`POST /api/source-leads`**: On-demand lead sourcing for users.

## Security & RLS
All job application records and leads are protected via Supabase RLS policies ensuring users can only read, insert, update, and delete their own records (`auth.uid() = user_id`).
