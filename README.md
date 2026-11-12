# DevCraft Career

DevCraft Career is a professional platform that helps job seekers build high-impact CVs and developer portfolios, search relevant job openings automatically (including regional boards via Apify and 11+ global/local sources), and track their career progress.

Live URL: https://devcraft-career.vercel.app

---

## Architecture

- **Multi-Agent Workflow:** Developed collaboratively using a multi-agent engineering workflow (OpenCode + Gemini CLI) managing distinct codebase zones.
- **Backend Job Aggregator (`lib/jobSources.js`):** Aggregates real-time listings from 11+ standard sources (Adzuna, Jooble, RemoteOK, Arbeitnow, ReliefWeb, Jobicy, Himalayas, Findwork, Remotive, The Muse, JSearch) plus cloud scraping for regional boards like Jobberman via Apify.
- **Supabase Edge Functions:** Serverless Deno functions handling secure proxying and background job aggregation (`supabase/functions/`).
- **Caching Layer:** In-memory TTL caching (1-hour) for optimized response times and upstream rate-limit prevention.

---

## Core Features

### 1. CV Builder (`/cv-builder`)
- **8 Professional Templates:**
  - Silicon Tech Indigo (Standard ATS)
  - Civil Service Minimalist (Clean ATS)
  - Executive Slate Grid (Leadership)
  - Creative Teal (Creative / Portfolio)
  - Compact Euro (European layout)
  - Lagos Corporate (Regional corporate styling)
  - Tech Stack (Developer-focused)
  - Graduate (Entry-level & NYSC friendly)
- **Guided AI Interview Wizard & Writing Assist:** Step-by-step Q&A and AI-powered text enhancement.
- **Certificate & Photo Uploads:** Secure storage via Supabase buckets.
- **ATS-Safe PDF Export & Printing:** Native PDF rendering via `@react-pdf/renderer`.

### 2. Portfolio Builder (`/portfolio-builder`)
- Guided interview workflow and custom subdomain support.

### 3. Application Tracker (`/tracker`)
- Kanban-style board for tracking job applications and auto-sourced leads.

### 4. AI Interview Prep (`/interview-prep`)
- Interactive interview preparation and feedback tools.

---

## Environment Variables

| Variable | Description | Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | **Yes** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public API key | **Yes** |
| `APIFY_API_TOKEN` | Apify API token for Jobberman / regional scraping | Optional |
| `APIFY_JOBBERMAN_ACTOR_ID` | Apify Actor ID for Jobberman scraping | Optional |
| `ADZUNA_APP_ID` | Adzuna API App ID | Optional |
| `ADZUNA_APP_KEY` | Adzuna API App Key | Optional |
| `JOOBLE_API_KEY` | Jooble API Key | Optional |
| `FINDWORK_API_KEY` | Findwork API Key | Optional |
| `RAPIDAPI_KEY` | JSearch RapidAPI Key | Optional |
| `PAYSTACK_SECRET_KEY` | Paystack webhook & payment verification key | Optional |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key for AI assist | Optional |
| `RESEND_API_KEY` | Resend API key for email notifications | Optional |

---

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account & project

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/devcraft-career.git
   cd devcraft-career
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` in the root directory and populate required environment variables (Supabase URL & Anon Key).
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment & Verification

```bash
npm run build
```
Vercel automatically builds and deploys on every push to `main`.
