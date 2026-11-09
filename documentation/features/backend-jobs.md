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
