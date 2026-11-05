# OpenCode — Task Brief

**Agent:** OpenCode
**Branch:** `opencode/jobs-ui`
**Zone:** A (see `agreement.md` §2)
**Depends on:** `agents/gemini-task.md` for backend API contract

---

## Feature: Job Matches UI

Build a Job Matches experience inside the CV Builder that uses the existing `lib/jobSources.js` aggregator (already wired to Findwork, Jooble, Adzuna, RemoteOK, etc.).

---

## Deliverables

1. **`app/api/jobs/search/route.ts`**
   - POST endpoint accepting `{ techStack: string[], location?: string, country?: string, minScore?: number }`
   - Calls `findMatchingJobs()` from `lib/jobSources.js`
   - Returns `{ jobs: [...], count: number }`
   - Caches result in memory for 5 minutes (key = hash of input)
   - Handles errors: missing env keys, upstream 429, timeouts

2. **`app/components/jobs/JobMatchesPanel.tsx`**
   - Client component, `'use client'`
   - Props: `techStack: string[]`
   - Fetches from `/api/jobs/search`
   - Displays cards: role, company, location, remote badge, skill match %, source, Apply link
   - Loading skeleton, empty state, error state
   - Filter row: All / Remote / On-site / by source
   - "Refresh" button (bypasses cache)

3. **`app/cv-builder/components/JobMatchesToggle.tsx`**
   - Tab toggle next to the live preview: "Preview" | "Jobs"
   - When "Jobs" selected, renders `<JobMatchesPanel techStack={...} />`
   - Reads tech stack from the CV form state already in `app/cv-builder/page.tsx`

4. **`documentation/features/job-matches-ui.md`**
   - Screenshot placeholder
   - Props table
   - API contract
   - Known limitations

---

## Acceptance Criteria

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `/api/jobs/search` returns real jobs from at least 2 sources given `["react","typescript"]`
- [ ] Panel renders without layout shift on mobile
- [ ] No edits outside Zone A
- [ ] `resolution.md` updated with each file claim + release

---

## Do NOT Touch

- `lib/jobSources.js` (Zone C — read only)
- `lib/supabase.ts` (Zone C)
- `app/cv-builder/page.tsx` beyond adding the toggle import (log a CHANGE REQUEST if a bigger edit is needed)
- Any `supabase/functions/**` file (Zone B — Gemini's)
- `package.json` (Zone C)

---

## Notes

- `lib/jobSources.js` already exports `findMatchingJobs(techStack, opts)` — read it before designing the API.
- Next 16 is installed — check `node_modules/next/dist/docs/` if unsure about `app/` router conventions.
- If `findMatchingJobs` needs a type filter (e.g. only remote), log a CHANGE REQUEST rather than editing it.

