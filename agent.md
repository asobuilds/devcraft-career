# 🌍 agent.md: Comprehensive Architectural Blueprint & Product Specification

## 1. Executive Summary & Problem Space Definition
DevCraft Career was conceived out of a fundamental mismatch in the modern global hiring ecosystem. Job applicants confront two vastly different barriers depending on their discipline:
- **The Software Engineering Disconnect:** Developers are evaluated based on their portfolio of work, open-source repositories, and technical stack ratios. However, traditional presentation mediums (like static LinkedIn profiles or text documents) fail to show live, mined data.
- **The Applicant Tracking System (ATS) Wall:** General candidates find their resumes rejected by automated scanning bots because of multi-column templates, complex tables, and passive phrasing that algorithms cannot index.

### 🔬 Real-Life Research & Competitive Landscape
Platforms like **Canva** or **FlowCV** prioritize visual aesthetics over code standards, producing documents that break when passed through an ATS. Recruitment boards like **Indeed** or **LinkedIn Jobs** place the burden of data entry on the applicant, requiring them to type out data points repeatedly, which introduces massive drop-off rates. DevCraft Career changes this paradigm through structural layout formatting and local processing algorithms.

---

## 2. Platform Novelty & Unique Value Propositions (UVP)

DevCraft Career is an automated, conversion-driven placement pipeline featuring four unique core upgrades:
1. **The Single-Source Data Architecture:** Instead of managing separate text layers, a single user dataset dynamically feeds their public portfolios, print layout views, and text documentation exports simultaneously.
2. **Local Token Proximity Filtering (No-Cost AI Matchmaking):** Uses localized synonym mapping models (e.g., matching "backend" with "SQL, Python, Docker") inside the recruiter directory to calculate talent scores without incurring expensive cloud processing fees.
3. **Optimistic Real-Time CRM Synchronization:** Shifting task cards inside the Kanban tracking panel updates the screen layout instantly, executing database write requests silently in the background to bypass network latency.
4. **The Fixed-Interval Monetization Engine:** Integrates a native quarterly payment structure (₦1,500 for 3 months) that stops automatically upon expiry, preventing recurring credit card billing traps while unlocking premium automated job-scout radars.

---

## 3. Comprehensive Feature Ecosystem Breakdown

### 💻 Track A: Developer Portfolio Automation Engine
- **Vanity Handle Subdomains:** Grants programmers un-locked public landing screens mapped to customizable web addresses (`/p/username`).
- **GitHub Repository Stack Miner:** Hits backend REST endpoints to fetch language structures and repository variables, auto-populating production proof-of-work cards without manual inputs.
- **Dynamic README Auto-Exporter:** Compiles typed developer profile summaries into clean markdown code blocks ready to copy into GitHub profile repositories.

### 📄 Track B: ATS Typography Curriculum Engine
- **High-Density Typography Templates:** Switch between the "Silicon Tech Indigo Accent" style for private startups or the strict "Civil Service Minimalist" style for government ministries.
- **Real-Time Phrasing Scanner:** Parses achievements as the user types, throwing live alerts when passive words like "responsible for" are used and recommending active expressions (e.g., *Engineered*, *Spearheaded*).

### 🔍 Automated Job-Scouting Radar & Monetization
- **Premium Radar System:** Available exclusively to Premium members. It scans available vacancies based on user skills, automatically places matching opportunity tracking cards into their Kanban board, and dispatches real-time alerts.

---

## 4. End-to-End System Infrastructure Architecture

Use code with caution.┌───────────────────────────────┐│      DEVCRAFT MAIN CORE       │└───────────────┬───────────────┘│┌─────────────────────────────┴─────────────────────────────┐▼                                                           ▼[ Next.js Front-End UI ]                                  [ Supabase Backend Cloud ]App Router Structure                                    - PostgreSQL Database SchemaClient-Side State Caching                               - JWT Session GuardDynamic Print Media CSS                                 - Object Storage Bucket Vault│                                                           │└─────────────────────────────┬─────────────────────────────┘▼┌───────────────────────────────┐│   THIRD-PARTY API GATEWAYS    │├───────────────────────────────┤│  - Paystack NGN Payments Link ││  - GitHub Developer OAuth App │└───────────────────────────────┘
### 📂 Directory Architecture Specification
```text
devcraft-career/
├── app/
│   ├── admin/                 # Restricted Control Panels Node
│   │   └── logs/              # Live Telemetry Log Streaming UI
│   ├── api/                   # Serverless Backend Route Channels
│   │   ├── cron-scraper/      # Automated Job Sourcing Radar
│   │   ├── github-sync/       # GitHub Repository Language Miner
│   │   └── notify/            # Telemetry Alert Dispatcher
│   ├── cv-builder/            # Typographic Resume Orchestrator
│   │   └── components/        # Decentralized Design Templates Sheet
│   ├── directory/             # Public Recruiter Search Marketplace
│   ├── forgot-password/       # Security Request Link Generation
│   ├── reset-password/        # Token Recovery Form Receiver
│   ├── settings/              # Configurations & View Toggle Station
│   ├── dashboard/             # Central Workspace Switchboard Control
│   └── page.tsx               # Interactive Landing Portal Core
└── middleware.ts              # Traffic Interception Security Gate
```

---

## 5. Execution Deployment & Pipeline Lifecycle

To ship modifications or apply updates securely into your live production build hosting network, execute these three command steps within your PowerShell console terminal:

```bash
# Step 1: Stage all edited files for commit bundling
git add .

# Step 2: Bind staged changes into a secure local tracking snapshot
git commit -m "feat: complete master core dashboard links configuration and agent.md blueprint documentation"

# Step 3: Align branch histories and launch updates live to Vercel
git pull origin main --rebase
git push origin main
```