# DevCraft Career

DevCraft Career is a free platform that helps anyone build a professional CV and developer portfolio, then automatically searches the internet for jobs that match their skills - private, government, NGO, or remote - and delivers the leads straight to their dashboard.

Live URL: https://devcraft-career.vercel.app

---

## Tech Stack

- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- Icons: Lucide React
- Database & Auth: Supabase (PostgreSQL + JWT Auth)
- File Storage: Supabase Storage (certificates bucket)
- PDF Generation: @react-pdf/renderer
- Email: Resend
- Payments: Paystack (payment page + webhook)
- Deployment: Vercel

---

## Core Features

### Multi-Resume Library (/resumes)
- Users can create, duplicate, and delete unlimited resumes - one per job application, each independently editable and saved.
- Each resume is loaded and saved by its own ID (/cv-builder?resumeId=...), not tied to a single record per user.

### CV Builder (/cv-builder)
- Requires a resumeId in the URL - always entered through the Resumes Library.
- Guided AI interview wizard - answers a series of simple questions and auto-fills the whole resume.
- AI writing assist - improves summary and experience bullet points on request (free for every user; uses Claude if ANTHROPIC_API_KEY is set, otherwise falls back to rule-based rewriting).
- 5 templates: Silicon Tech Indigo, Civil Service Minimalist, Executive Slate (free), Creative Teal, Compact Euro (Premium only).
- Upload certificates, transcripts, and other supporting documents (stored in Supabase Storage).
- Real, ATS-safe PDF export - single column, standard font, real selectable text - matches all 5 visual templates. Premium only.
- Print - Premium only.

### Portfolio Builder (/portfolio-builder)
- Same guided AI interview wizard and AI writing assist as the CV builder.
- Custom shareable subdomain link - Premium only.

### Job Matching Engine
Aggregates real job listings from legitimate, key-free or free-tier APIs - no scraping of sites that block bots (Google, LinkedIn, Indeed are intentionally excluded; see AGENT.md for reasoning):

- Adzuna (needs ADZUNA_APP_ID + ADZUNA_APP_KEY)
- Jooble (needs JOOBLE_API_KEY)
- RemoteOK (no key)
- Arbeitnow (no key)
- ReliefWeb - NGO/humanitarian roles (no key)
- Jobicy (no key)
- Himalayas (no key)
- Findwork (needs FINDWORK_API_KEY)
- Remotive (no key)
- The Muse (no key)
- JSearch via RapidAPI (needs RAPIDAPI_KEY)
- Up to 3 additional custom APIs, added entirely through .env - no code changes needed (see lib/jobSources.js for the field-mapping format).

Supports explicit location filtering (e.g. location: "Nigeria") on every request. Matched leads are gated to Premium accounts, land automatically in the user's tracker, and trigger an email notification.

### Job Lead Notifications
Premium users get an email (via Resend) whenever new matching jobs are found, in addition to the leads appearing in their tracker.

### Subscription & Payments
- Paystack payment page: https://paystack.shop/pay/kqrkkfueyh (email pre-filled from the user's profile).
- app/api/paystack-webhook verifies the payment signature and automatically sets is_premium = true on the matching profile - no manual upgrade step.

### Landing Page (/)
Sidebar navigation, plain-language explanation of the product, FAQ, user reviews + feedback form, and an About section.

### Job Application Tracker (/tracker)
Kanban-style board for tracking application status.

---

## Environment Variables
Supabase

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

Job sources (all optional - missing keys just mean that source is skipped)

ADZUNA_APP_ID=
ADZUNA_APP_KEY=
JOOBLE_API_KEY=
FINDWORK_API_KEY=
RAPIDAPI_KEY=

Custom job API slots (optional, up to 3: _1, _2, _3)

CUSTOM_JOB_API_1_NAME=
CUSTOM_JOB_API_1_URL=
CUSTOM_JOB_API_1_RESULTS_PATH=
CUSTOM_JOB_API_1_FIELD_MAP=
CUSTOM_JOB_API_1_HEADERS=

AI writing assist (optional - falls back to rule-based rewriting if unset)

ANTHROPIC_API_KEY=

Email notifications

RESEND_API_KEY=
NOTIFY_FROM_EMAIL=

Payments

PAYSTACK_SECRET_KEY=


---

## Deployment Workflow

```bash
git add -A
git commit -m "describe your change"
git push origin main
```
Vercel auto-deploys on every push to main. Always run npm run build locally first to catch errors before pushing.

---

*Built by Aso (Agene Sunday Okoh) - a fellow at the Learn2Earn Nigeria fellowship program.*