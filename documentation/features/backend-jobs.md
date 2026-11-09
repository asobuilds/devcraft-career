# Backend Job Matching & Caching Architecture

## Overview
DevCraft Career features a robust backend job aggregation engine capable of fetching real-time job listings from 11 distinct sources (Adzuna, Jooble, RemoteOK, Arbeitnow, ReliefWeb, Jobicy, Himalayas, Findwork, Remotive, The Muse, JSearch) plus custom API integrations configured via `.env`.

## Components
1. **Aggregator (`lib/jobSources.js`)**: Queries enabled sources in parallel, normalizes job payloads, deduplicates by title and company, and computes skill match scores based on user tech stack.
2. **Type Definitions (`lib/jobSources.types.ts`)**: Provides strict TypeScript interfaces (`Job`, `JobSearchOptions`) for the aggregator and search endpoints.
3. **In-Memory Cache (`lib/jobs-cache.ts`)**: Caches search results for 5 minutes with automatic TTL expiration to optimize performance and prevent rate-limiting on upstream job boards.
4. **Database Schema (`supabase/migrations/0001_job_matches.sql`)**: Establishes the `job_applications` table with Row Level Security (RLS) policies and performance indexes for user application tracking and auto-sourced leads.

## API Endpoints & Edge Functions
- **`POST /api/cron-scraper`**: Background sweep for Premium users, fetching top matches and automatically inserting leads into `job_applications` while triggering email notifications.
- **`POST /api/source-leads`**: On-demand lead sourcing for users.
- **`jooble-jobs` Edge Function (`supabase/functions/jooble-jobs/index.ts`)**: Proxies search requests (`?search=...&location=...` or JSON body) securely to Jooble API using secret `JOOBLE_API_KEY` with CORS headers and error handling.

## Security & RLS
All job application records and leads are protected via Supabase RLS policies ensuring users can only read, insert, update, and delete their own records (`auth.uid() = user_id`).
# Backend Jobs & Scraping Architecture

## Overview
DevCraft Career features a robust multi-source job aggregation and matching engine (`lib/jobSources.js`) that aggregates listings from 12+ standard and custom platforms, in addition to cloud-based scraping via Apify for regional job boards like Jobberman.

## Key Components

### 1. Multi-Source Aggregator (`lib/jobSources.js`)
- **Sources:** Adzuna, Jooble, RemoteOK, Arbeitnow, ReliefWeb, Jobicy, Himalayas, Findwork, Remotive, The Muse, JSearch (RapidAPI), Custom APIs (1-3), and Apify (Jobberman).
- **Parallel Execution:** Fetches all enabled sources concurrently via `Promise.all` with robust error isolation (`safeFetchJson`).
- **Normalization:** Standardizes all job items into a unified schema:
  - `source`: Platform name
  - `title`: Job role/title
  - `company`: Employer name
  - `location`: Geographic location or Remote
  - `url`: Direct application link
  - `description`: Job summary/description
  - `salary`: Normalized or raw salary indicator
  - `postedDate`: ISO timestamp when available

### 2. Caching Layer (`lib/jobs-cache.js`)
- **TTL Cache:** In-memory caching with a 1-hour TTL (`60 * 60 * 1000 ms`).
- **Cache Keying:** Composite key based on normalized tech stack keywords, country, location, and minimum score threshold.
- **Benefits:** Prevents rate limit exhaustion on external APIs and reduces response latency for repeated queries.

### 3. Supabase Edge Function (`supabase/functions/jobberman-jobs/index.ts`)
- Serverless Deno Edge Function providing direct integration with the Apify REST API (`APIFY_API_TOKEN` and `APIFY_JOBBERMAN_ACTOR_ID`).
- Triggers actor runs, fetches dataset items, and returns normalized job listings.

### 4. Scoring & Filtering
- **Keyword Matching:** `scoreJobMatch(job, keywords)` calculates percentage keyword overlap between job title/description and the user's tech stack.
- **Location Filtering:** `applyLocationFilter` ensures location-specific relevance while allowing remote listings to pass through.
- **Deduplication:** Merges duplicates by matching normalized `title + company` keys.
