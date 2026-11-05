# Agreement — Multi-Agent Operating Rules

**Version:** 1.0
**Last updated:** 2026-11-05
**Signatories:** OpenCode, Gemini CLI
**Human overseer:** asobuilds (agenesunday143@gmail.com)

---

## 1. Purpose

Two AI agents work on this repo in parallel. This file defines **where each may write**, **how conflicts are prevented**, and **what to do when blocked**. Both agents MUST read this file at the start of every session.

---

## 2. File Ownership Map

### Zone A — OpenCode owns (write)
- `app/dashboard/jobs/**`
- `app/components/jobs/**`
- `app/cv-builder/components/JobMatchesPanel.tsx`
- `app/api/jobs/**`
- `documentation/features/job-matches-ui.md`

### Zone B — Gemini owns (write)
- `supabase/functions/findwork-jobs/**`
- `supabase/functions/adzuna-jobs/**`
- `supabase/functions/_shared/**`
- `supabase/migrations/**`
- `lib/jobs-cache.ts`
- `lib/jobSources.types.ts` (new file only)
- `documentation/features/backend-jobs.md`

### Zone C — Shared (READ-ONLY for both agents)
Neither agent may modify these without human approval logged in `resolution.md`:
- `lib/supabase.ts`
- `lib/jobSources.js` (existing aggregator — change only via approved refactor)
- `lib/robotsCheck.js`
- `lib/emailNotify.js`
- `lib/sendEmail.js`
- `package.json` / `package-lock.json`
- `.env.local` / `.env.example`
- `next.config.js`
- `tsconfig.json`
- `eslint.config.mjs`
- `postcss.config.mjs`
- `proxy.js`
- `agent.md`, `AGENTS.md`, `CLAUDE.md`, `README.md`
- `agreement.md`, `resolution.md`, `agents/**`

**Rule:** If an agent needs a change in Zone C, it writes the request to `resolution.md` under `## CHANGE REQUEST` and waits for human approval.

---

## 3. Rules of Engagement

1. **Read before write.** Every session starts by reading `agreement.md`, `resolution.md`, and your own task file in `agents/`.
2. **Claim before edit.** Before touching any file, add a row to the "Active Claims" table in `resolution.md` with: your name, file path, ISO timestamp, branch.
3. **One file at a time.** Do not batch-edit multiple files across your zone without logging each.
4. **Release when done.** When finished with a file, move your claim from "Active" to "Resolved" with the commit hash.
5. **No cross-zone edits.** If you need to touch a file outside your zone, write a `CHANGE REQUEST` in `resolution.md` and stop.
6. **Build must pass.** Before claiming a task complete, run `npm run build` and `npm run lint`. If either fails, do NOT mark complete — log the error under `## BLOCKERS`.
7. **Stop-the-line.** If `main` build breaks, both agents stop feature work and log in `resolution.md` under `## STOP THE LINE`.
8. **No secrets in code.** All keys come from `.env.local` (local) or Supabase secrets (deployed). Never hardcode.
9. **Preserve `agent.md`'s Next.js warning.** Next 16 has breaking changes — read `node_modules/next/dist/docs/` before writing Next-specific code.

---

## 4. Commit Convention

Every commit must start with one of:

| Prefix | Meaning |
|--------|---------|
| `feat(opencode):` | OpenCode feature work |
| `feat(gemini):` | Gemini feature work |
| `fix(shared):` | Fix in a shared file (requires human approval) |
| `chore(agents):` | Updates to `agreement.md`, `resolution.md`, `agents/*` |
| `docs(opencode):` / `docs(gemini):` | Documentation |

Example:
feat(opencode): add job matches panel to cv-builder page

Creates app/cv-builder/components/JobMatchesPanel.tsx

Wires to /api/jobs/search

Claims: app/cv-builder/components/JobMatchesPanel.tsx

text

---

## 5. Branch Policy

- Both agents work on `multi-agent-workspace`.
- Each agent may create a personal sub-branch: `opencode/<slug>` or `gemini/<slug>`.
- Merge to `multi-agent-workspace` only after:
  1. `npm run build` passes
  2. `npm run lint` passes
  3. No active claim conflicts
  4. `resolution.md` is updated

---

## 6. Escalation

When blocked or uncertain, log in `resolution.md`:
NEEDS HUMAN
Agent: OpenCode

File: lib/jobSources.js

Question: Should we refactor findMatchingJobs to accept a type filter, or add a new function?

Suggested options:

Refactor existing function (breaks callers)
Add findMatchingJobsByType (no breakage)
Blocked on: Human decision

text

Do NOT proceed until a human responds in the same section.

---

## 7. Acknowledgment

By editing any file in this repo, an agent implicitly accepts this agreement.

