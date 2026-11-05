# Job Matches UI

**Owner:** OpenCode (Zone A)
**Branch:** `opencode/jobs-ui`
**Status:** Delivered — toggle wiring handled manually in `app/cv-builder/`

---

## Overview

The Job Matches UI surfaces live roles from the existing `lib/jobSources.js`
aggregator, scored against the user's technical skills. It is split into a
server route that wraps the aggregator and a client panel that handles loading,
filtering, and empty/error states.

| Piece | Path |
|-------|------|
| API route | `app/api/jobs/search/route.ts` |
| Panel component | `app/components/jobs/JobMatchesPanel.tsx` |

---

## Screenshot

> Screenshot placeholder: add a capture of the **Jobs** tab in the CV Builder here.

---

## Component: `JobMatchesPanel`

Client component (`'use client'`). Import from `app/components/jobs/JobMatchesPanel`.

```tsx
import JobMatchesPanel from '@/app/components/jobs/JobMatchesPanel';

<JobMatchesPanel techStack={['React', 'TypeScript', 'SQL']} />
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `techStack` | `string[]` | Yes | Skills used to search and score jobs. Empty values are ignored and duplicates are removed (case-insensitive). An empty list renders the "Add your technical skills" state instead of calling the API. |

The component accepts only `techStack`; `location`, `country`, and `minScore`
are intentionally left to the API defaults for this iteration.

### Behaviour

- Fetches `/api/jobs/search` on mount and whenever the normalized skill list changes.
- **Loading:** four skeleton cards with a fixed minimum height to avoid layout shift on mobile.
- **Error:** inline error banner with a retry action; a client-side 30s timeout aborts slow requests.
- **Empty:** separate states for "no skills yet", "no matching roles", and "no roles match the active filters".
- **Filters:** All / Remote / On-site plus a source dropdown built from the returned jobs.
- **Refresh:** sends `refresh: true`, bypassing the server cache.
- Each card shows role, company, location, remote/on-site badge, skill-match percentage with progress bar, optional salary, source, and an Apply link (`target="_blank"`, `rel="noopener noreferrer"`).
- Cards use a responsive `sm:grid-cols-2` grid; all text truncates or clamps to keep card heights stable.

---

## API: `POST /api/jobs/search`

### Request

```json
{
  "techStack": ["react", "typescript"],
  "location": "Lagos",
  "country": "ng",
  "minScore": 20,
  "refresh": false
}
```

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `techStack` | `string[]` or comma-separated `string` | Yes | — | Normalized to lowercase, trimmed, de-duplicated. At least one non-empty skill is required. |
| `location` | `string` | No | `null` | Passed to `findMatchingJobs`; remote jobs always pass the location filter. |
| `country` | `string` | No | `"ng"` | Used by Adzuna. |
| `minScore` | `number` | No | `20` | Clamped to `0–100`. |
| `refresh` | `boolean` | No | `false` | When `true`, skips reading the cache (the fresh result is still cached). |

### Response

`200 OK`

```json
{
  "jobs": [
    {
      "source": "RemoteOK",
      "title": "Senior Software Engineer",
      "company": "Example Co",
      "location": "Remote",
      "url": "https://example.com/job/123",
      "description": "Short plain-text excerpt…",
      "salary": "$100,000+",
      "matchScore": 100,
      "remote": true
    }
  ],
  "count": 1,
  "cached": false,
  "warnings": ["Jooble skipped: missing JOOBLE_API_KEY."]
}
```

`warnings` is omitted when there are none. `remote` is derived by the route
(location contains "remote", or the source is RemoteOK/Himalayas) because the
aggregator does not return a remote flag. Descriptions are stripped of HTML and
truncated to 280 characters.

### Status codes

| Status | Meaning |
|--------|---------|
| `200` | Search completed (possibly with zero jobs). |
| `400` | Malformed JSON, non-object body, or empty/invalid `techStack`. |
| `502` | The aggregator threw an unexpected error. |
| `504` | The aggregator did not respond within 20 seconds. |

### Caching

- In-memory `Map`, TTL **5 minutes**.
- Key is a SHA-256 hash of the normalized inputs: sorted `techStack`, `location`, `country`, `minScore`.
- Expired entries are pruned on each request.
- `refresh: true` bypasses the cache read; the new result replaces the entry.

### Error handling

- **Missing env keys:** the route reports the affected keyed sources (Adzuna, Jooble, Findwork, JSearch) in `warnings`; free sources still run.
- **Upstream 429 / network failure:** `lib/jobSources.js` swallows per-source failures and returns `null`, so the route returns partial results. If nothing survives, the response is `200` with `count: 0` and a warning.
- **Timeout:** a 20s guard returns `504` with `code: "TIMEOUT"`.

---

## Known limitations

- The in-memory cache is per server instance; it is not shared across serverless or multi-instance deployments.
- Upstream rate limits and zero-match results are indistinguishable because `lib/jobSources.js` consumes per-source errors.
- `remote` is a heuristic, not a field supplied by every source.
- Match percentage is keyword overlap, not semantic similarity.
- No pagination; every matching job is returned in one response.
- The API defaults are used; the panel does not expose location/country/minScore controls yet.
- The CV Builder toggle is wired manually by the human to keep `app/cv-builder/` out of the agent's write zone.

---

## Verification

- `npx eslint app/api/jobs/search/route.ts app/components/jobs/JobMatchesPanel.tsx` → clean.
- `npx tsc --noEmit` → clean.
- Live smoke test (`techStack: ["react","typescript"]`) → `200`, 10 jobs from 3 sources (Arbeitnow, Himalayas, RemoteOK).
- `npm run build` compiles and type-checks the new code; full build is blocked in this environment by missing Supabase env vars (see `resolution.md` → Blockers).
