# DevCraft Career

DevCraft Career is a professional, 100% free platform that helps job seekers build high-impact CVs and developer portfolios, search relevant job openings automatically (including regional boards via Apify and 11+ global/local sources), and track their career progress.

Live URL: https://devcraft-career.vercel.app

---

## Features

- **AI Co-Editor:** The AI can read, write, and update the CV and Cover Letter.
- **ATS Analyzer:** Real-time keyword matching and suggestions.
- **Community Circles:** A space to connect with other Nigerian job seekers.
- **Job Tailoring:** Paste a job description and let the AI rewrite your CV to match.
- **Kanban Tracker:** 5-column drag-and-drop board (Wishlist, Applied, Interviewing, Offer, Rejected).
- **Portfolio Generator:** Custom subdomains and 3 templates.
- **Naija Modern Design:** The orange/emerald color palette and localized Nigerian copy.

---

## Community

A public feed of job-seeker discussions organized into **Circles**. Each Circle is a topic-specific space (e.g., Lagos Fintech, Remote Opportunities) where users can:

- Read and post discussions with comments
- Like posts to signal helpfulness
- Discover peers facing similar hiring challenges

Powered by Supabase tables `circles`, `posts`, `comments`, and `likes` with full RLS.

---

## Multi-Provider AI

All AI-powered features use a failover chain: **Groq → Gemini → Agnes**. Each provider is wrapped with `@ai-sdk/openai-compatible`; if the first provider is unavailable (missing API key or request failure), the next one in the chain is tried automatically. No user-facing error is surfaced unless all three providers are down, in which case a fallback stream message is returned.

---

## Architecture

- **Multi-Provider AI Failover:** Groq → Gemini → Agnes.
- **Supabase Storage:** Certificates bucket with RLS.
- **Database:** All core tables (resumes, portfolios, job_applications, ats_scans, feedback).

---

## Environment Variables

| Variable | Description | Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | **Yes** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public API key | **Yes** |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `GROQ_API_KEY` | Groq API key for LLM failover | Optional |
| `GEMINI_API_KEY` | Gemini API key for LLM failover | Optional |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | **Yes** |
| `APIFY_API_TOKEN` | Apify API token for Jobberman / regional scraping | Optional |
| `APIFY_JOBBERMAN_ACTOR_ID` | Apify Actor ID for Jobberman scraping | Optional |
| `ADZUNA_APP_ID` | Adzuna API App ID | Optional |
| `ADZUNA_APP_KEY` | Adzuna API App Key | Optional |
| `JOOBLE_API_KEY` | Jooble API Key | Optional |
| `FINDWORK_API_KEY` | Findwork API Key | Optional |
| `RAPIDAPI_KEY` | JSearch RapidAPI Key | Optional |
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
2. Run Supabase migrations:
   ```bash
   supabase db push
   ```
   Or apply them manually via the Supabase SQL Editor in order (migrations in `supabase/migrations/`).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create `.env.local` in the root directory and populate the required environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   OPENAI_API_KEY=<your-openai-key>
   GROQ_API_KEY=<your-groq-key>
   GEMINI_API_KEY=<your-gemini-key>
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment & Verification

```bash
npm run build
```
Vercel automatically builds and deploys on every push to `main`.
