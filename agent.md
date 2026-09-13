# AGENT.md — Project Blueprint

## 1. Problem Space

Job seekers face two separate barriers:
- Developers need to prove real skill (projects, stack, work) but static resumes and LinkedIn profiles don't show that well.
- General applicants get filtered out by Applicant Tracking Systems (ATS) because of multi-column templates, tables, and weak wording that scanning software can't parse.

DevCraft Career addresses both: a real CV/portfolio builder plus a job-matching engine that finds relevant openings automatically, all free at the core, with paid features layered on top rather than gating basic access.

## 2. What Makes This Different

1. **One data source, multiple outputs.** Fill in your info once (or use the guided interview); it feeds the CV, the portfolio, and the PDF export.
2. **A real job-matching engine, not a static "browse jobs" list.** Aggregates 11 legitimate sources plus unlimited custom APIs, filtered by skill match score and location.
3. **AI assist available to every tier**, not paywalled — only the *output* features (print, PDF, sharing, and job leads) are Premium.
4. **Honest scraping policy.** Google, LinkedIn, and Indeed are deliberately excluded because scraping them violates their Terms of Service and gets IPs blocked. Instead, the platform uses providers built for this (Adzuna, Jooble, RapidAPI's JSearch, etc.) and a robots.txt-respecting checker (`lib/robotsCheck.js`) is in place for any future site-specific crawling — though robots.txt permission is necessary, not sufficient; each new target site still needs a human to confirm its actual Terms of Service allow it before it's added.

## 3. Feature Breakdown

### CV Builder (`app/cv-builder`)
- Guided AI interview (`components/AIInterviewGuide.jsx`) — step-by-step Q&A with hints, ends by auto-filling the CV form.
- AI writing assist (`app/api/ai-assist`) — improves summary/bullet text. Uses Claude (`claude-sonnet-4-6`) if `ANTHROPIC_API_KEY` is set; otherwise a rule-based fallback (fixes weak phrasing like "responsible for", capitalizes, punctuates).
- Certificate/document uploads (`components/CertificateUploader.jsx`) — stores files in the Supabase `certificates` bucket, metadata saved in `resumes.attachments` (jsonb).
- 5 templates — 3 free (Modern Indigo, Minimalist, Executive Slate), 2 Premium (Creative Teal, Compact Euro).
- Real PDF export (`components/CVPdfDocument.jsx`, via `@react-pdf/renderer`) — single-column, standard Helvetica font, real selectable text (ATS-safe). Premium only.
- Browser print — Premium only.

### Portfolio Builder (`app/portfolio-builder`)
- Same guided interview pattern (`components/PortfolioInterviewGuide.jsx`) and AI assist.
- Custom subdomain — Premium only; enforced both in the UI and at save time.

### Job Matching (`lib/jobSources.js`)
`findMatchingJobs(techStack, { country, location, minScore })` queries all sources in parallel, dedupes by title+company, scores by keyword overlap against the user's stack, filters by location (remote jobs always pass through), and returns sorted results.

Sources: Adzuna, Jooble, RemoteOK, Arbeitnow, ReliefWeb, Jobicy, Himalayas, Findwork, Remotive, The Muse, JSearch (RapidAPI), plus up to 3 custom sources defined entirely via `.env` (`CUSTOM_JOB_API_{1,2,3}_URL/NAME/RESULTS_PATH/FIELD_MAP/HEADERS`) — no code changes needed to add a new source.

Consumed by:
- `app/api/cron-scraper` — background sweep, inserts top 5 matches into `job_applications` for Premium users.
- `app/api/source-leads` — on-demand lead lookup for Premium users.

### Payments (`app/api/paystack-webhook`)
Verifies Paystack's HMAC-SHA512 signature on `charge.success` events, then sets `profiles.is_premium = true` by matching the paying customer's email. The upgrade buttons across the app link to `https://paystack.shop/pay/kqrkkfueyh` with the user's email pre-filled so the webhook can match it.

### Landing Page (`app/page.tsx`)
Sidebar nav, hero, "how it works," features, FAQ accordion, reviews + feedback form, about section.

## 4. Directory Structure
devcraft-career/
â”œâ”€â”€ app/
â”‚ â”œâ”€â”€ page.tsx # Landing page
â”‚ â”œâ”€â”€ api/
â”‚ â”‚ â”œâ”€â”€ ai-assist/ # AI writing assist (Claude + fallback)
â”‚ â”‚ â”œâ”€â”€ cron-scraper/ # Background job-matching sweep (Premium)
â”‚ â”‚ â”œâ”€â”€ source-leads/ # On-demand job lead lookup (Premium)
â”‚ â”‚ â”œâ”€â”€ paystack-webhook/ # Signature-verified auto-upgrade
â”‚ â”‚ â””â”€â”€ notify/ # Portfolio visit telemetry (simulated)
â”‚ â”œâ”€â”€ cv-builder/
â”‚ â”‚ â”œâ”€â”€ page.tsx
â”‚ â”‚ â””â”€â”€ components/
â”‚ â”‚ â”œâ”€â”€ AIInterviewGuide.jsx
â”‚ â”‚ â”œâ”€â”€ CertificateUploader.jsx
â”‚ â”‚ â”œâ”€â”€ CVPdfDocument.jsx
â”‚ â”‚ â”œâ”€â”€ TemplateMinimalist.tsx
â”‚ â”‚ â”œâ”€â”€ TemplateModernIndigo.tsx
â”‚ â”‚ â”œâ”€â”€ TemplateExecutiveSlate.tsx
â”‚ â”‚ â”œâ”€â”€ TemplateCreativeTeal.jsx # Premium
â”‚ â”‚ â””â”€â”€ TemplateCompactEuro.jsx # Premium
â”‚ â”œâ”€â”€ portfolio-builder/
â”‚ â”‚ â”œâ”€â”€ page.jsx
â”‚ â”‚ â””â”€â”€ components/
â”‚ â”‚ â””â”€â”€ PortfolioInterviewGuide.jsx
â”‚ â”œâ”€â”€ tracker/
â”‚ â”œâ”€â”€ dashboard/
â”‚ â”œâ”€â”€ directory/
â”‚ â”œâ”€â”€ settings/
â”‚ â””â”€â”€ p/[subdomain]/ # Public portfolio pages
â”œâ”€â”€ lib/
â”‚ â”œâ”€â”€ supabase.ts
â”‚ â”œâ”€â”€ jobSources.js # 11-source aggregator + custom API connector
â”‚ â””â”€â”€ robotsCheck.js # robots.txt gate for future site-specific scraping
â””â”€â”€ middleware.ts


## 5. Status

### Done
- Auth (email + GitHub OAuth), password recovery.
- Landing page redesign (sidebar, FAQ, reviews, about).
- CV builder: guided interview, AI assist, 5 templates, certificate uploads, real PDF export.
- Portfolio builder: guided interview, AI assist, subdomain gating.
- Premium tier gating: templates, print, PDF export, subdomain, job leads.
- Job matching: 11 sources + unlimited custom APIs via `.env` + location filtering.
- Paystack payment page + signature-verified auto-upgrade webhook.
- `robotsCheck.js` utility, ready for future scraping work.

### Paused (deliberately)
- Puppeteer-based site-specific scraping — needs `puppeteer-core` + `@sparticuz/chromium`, which adds deploy size/cold-start cost on Vercel. Held until there's a specific site to target with a confirmed-compliant robots.txt + Terms of Service.

### Not Done Yet
- Email/SMS notifications when a new job lead is found (leads currently land silently in the tracker).
- PDF export for the Premium visual templates (Teal, Euro) — currently one canonical ATS layout is used regardless of selected theme.
- PDF/export for the portfolio builder.
- GitHub repository auto-sync for portfolio project cards (mentioned in earlier docs, not yet built).

