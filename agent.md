# 🌍 agent.md: Comprehensive Architectural Blueprint & Product Specification

## 1. Executive Summary & Problem Space Definition
DevCraft Career was conceived out of a fundamental mismatch in the modern global hiring ecosystem. Job applicants confront two vastly different barriers depending on their discipline:
- **The Software Engineering Disconnect:** Developers are evaluated based on their portfolio of work, open-source repositories, and technical stack ratios. However, traditional presentation mediums (like static LinkedIn profiles or text documents) fail to show live, mined data.
- **The Applicant Tracking System (ATS) Wall:** General candidates find their resumes rejected by automated scanning bots because of multi-column templates, complex tables, and passive phrasing that algorithms cannot index.

### 🔬 Real-Life Research & Competitive Landscape
Platforms like **Canva** or **FlowCV** prioritize visual aesthetics over code standards, producing documents that break when passed through an ATS. Recruitment boards like **Indeed** or **LinkedIn Jobs** place the burden of data entry on the applicant, requiring them to type out data points repeatedly, which introduces massive drop-off rates. DevCraft Career changes this paradigm through structural layout formatting, multi-variant high-density templates, and local processing algorithms.

---

## 2. Platform Novelty & Unique Value Propositions (UVP)

DevCraft Career is an automated, conversion-driven placement pipeline featuring four unique core upgrades:
1. **The Single-Source Data Architecture:** Instead of managing separate text layers, a single user dataset dynamically feeds their public portfolios, print layout views, and text documentation exports simultaneously.
2. **Local Token Proximity Filtering (No-Cost AI Matchmaking):** Uses localized synonym mapping models (e.g., matching "backend" with "SQL, Python, Docker") inside the recruiter directory to calculate talent scores without incurring expensive cloud processing fees.
3. **Optimistic Real-Time CRM Synchronization:** Shifting task cards inside the Kanban tracking panel updates the screen layout instantly, executing database write requests silently in the background to bypass network latency.
4. **The Fixed-Interval Monetization Engine:** Integrates a native quarterly payment structure (₦1,500 for 3 months via Paystack) that stops automatically upon expiry, preventing recurring credit card billing traps while unlocking premium automated job-scout radars.

---

## 3. Comprehensive Feature Ecosystem Breakdown

### 💻 Track A: Developer Portfolio Automation Engine
- **Vanity Handle Subdomains:** Grants programmers un-locked public landing screens mapped to customizable web addresses (`/p/username`).
- **GitHub Repository Stack Miner:** Hits backend REST endpoints to fetch language structures and repository variables, auto-populating production proof-of-work cards without manual inputs.
- **Dynamic README Auto-Exporter:** Compiles typed developer profile summaries into clean markdown code blocks ready to copy into GitHub profile repositories.
- **Automated Lead Sourcing Radar:** Scans typed technical stack keywords to calculate matching scores and display active contract openings on screen.

### 📄 Track B: ATS Typography Curriculum Engine
- **Zety-Inspired & High-Density Layout Templates:** Switch seamlessly between:
  1. *Silicon Tech Indigo Accent:* A modern, high-conversion asymmetric two-column layout with a dark sidebar column (Zety standard) preferred by startup hubs.
  2. *Civil Service Minimalist:* A clean, high-density, centralized single-column structure explicitly required by Government Ministries and Civil Service screening algorithms.
  3. *Executive Slate Grid:* A bold, top-heavy executive layout with structural border anchors favored by enterprise consulting agencies.
- **Real-Time Phrasing Scanner:** Parses achievements as the user types, throwing live alerts when passive words like "responsible for" are used and recommending active expressions (e.g., *Engineered*, *Spearheaded*).

### 🔍 Automated Job-Scouting Radar & Monetization
- **Premium Radar System:** Available exclusively to Premium members. It scans available vacancies based on user skills, automatically places matching opportunity tracking cards into their Kanban board, and dispatches real-time alerts.
- **Paystack Subscription Gateway:** An embedded gateway pointing to a live custom subscription page link (`https://paystack.shop`) configured to handle ₦1,500 for a fixed 3-month cycle.

---

## 4. End-to-End System Infrastructure Architecture

┌───────────────────────────────┐│      DEVCRAFT MAIN CORE       │└───────────────┬───────────────┘│┌─────────────────────────────┴─────────────────────────────┐▼                                                           ▼[ Next.js Front-End UI ]                                  [ Supabase Backend Cloud ]App Router Structure                                    - PostgreSQL Database SchemaClient-Side State Caching                               - JWT Session GuardDynamic Print Media CSS                                 - Object Storage Bucket Vault│                                                           │└─────────────────────────────┬─────────────────────────────┘▼┌───────────────────────────────┐│   THIRD-PARTY API GATEWAYS    │├───────────────────────────────┤│  - Paystack NGN Payments Link ││  - GitHub Developer OAuth App │└───────────────────────────────┘
### 📂 Directory Architecture Specification
```text
devcraft-career/
├── app/
│   ├── admin/                 # Restricted Control Panels Node
│   │   └── logs/              # Live Telemetry Log Streaming UI
│   ├── api/                   # Serverless Backend Route Channels
│   │   ├── cron-scraper/      # Automated Job Sourcing Radar
│   │   ├── github-sync/       # GitHub Repository Language Miner
│   │   └── parse-resume/      # ATS Automated Resume Data Parser Engine
│   ├── cv-builder/            # Typographic Resume Orchestrator
│   │   └── components/        # Decentralized Design Templates Sheet
│   │       ├── TemplateMinimalist.tsx     # Government Center Style
│   │       ├── TemplateModernIndigo.tsx   # Zety Two-Column Style
│   │       └── TemplateExecutiveSlate.tsx # Enterprise Slate Style
│   ├── directory/             # Public Recruiter Search Marketplace (Candidate Directory)
│   ├── forgot-password/       # Security Request Link Generation
│   ├── reset-password/        # Token Recovery Form Receiver
│   ├── settings/              # Configurations & View Toggle Station (Account Configurations)
│   ├── dashboard/             # Central Workspace Switchboard Control
│   └── page.tsx               # Interactive Landing Portal Core
└── middleware.ts              # Traffic Interception Security Gate
```

---

## 5. Current Implementation Lifecycle Status

### 🟢 Completed & Fully Coded
1. **Core Workspace Authentication:** Local credential sign-ins and full **GitHub Social OAuth handshakes** fully configured and operating without 404 blockages.
2. **Account Security Pathways:** Token-based recovery flows (`/forgot-password` and `/reset-password`) completely wired.
3. **Database Security Framework:** PostgreSQL Row-Level Security (RLS) active on all schema tracks, along with the unique constraints fix on `portfolios(user_id)`.
4. **Monetized Settings Engine (`/settings`):** Fully operational settings page containing user toggle views (hide/show sections) and the live **Paystack ₦1,500 billing portal link**.
5. **Decoupled CV Template Engine (`/cv-builder`):** Fragmented into sub-components featuring **Zety-style asymmetric two-column structures**, Executive Slate styles, and the Government Minimalist style with the real-time passive wording scanner.
6. **Automated API Integrations:** Back-end routers for public **Candidate Marketplace Filtering (`/directory`)** and background **GitHub Repository Language Miners**.

### 🟡 In-Progress (Trapped in Caching)
- **Dashboard UI Update Rendering:** The local code files are 100% written, error-free, and complete. However, due to an initial broken GitHub link configuration setup, the live production server on Vercel is currently frozen, continuing to serve the old cached build placeholder layout.

### 🔴 Not Done Yet (Future Roadmap)
- **Live SMS/Email Alert Hooks Integration:** Linking the background cron-scraper output triggers to a live notification API (like Twilio or Termii) to send text notifications directly to users' phones.
- **True Multi-File Binary PDF Parsing:** Upgrading the simulated text classification endpoint to process real uploaded PDF byte arrays using deep semantic OCR text readers.

---

