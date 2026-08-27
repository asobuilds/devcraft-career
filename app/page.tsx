export const dynamic = 'force-static';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Dynamic Header */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white tracking-wider">
            {"DC"}
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            {"DevCraft Career"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            {"Sign In"}
          </Link>
          <Link href="/register" className="text-sm font-medium bg-white text-slate-950 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
            {"Get Started"}
          </Link>
        </div>
      </header>

      {/* Main Structural Layout Container */}
      <main className="max-w-4xl mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center relative">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-medium">
            {"🚀 Next-Gen Dual Career Engine Workspace"}
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {"Build proof of work."} <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {"Secure the opportunity."}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            {"One platform optimized for two distinct job-seeking tracks. Pick your placement strategy below to match modern automated recruitment filters cleanly."}
          </p>
        </div>

        {/* Modular Grid Path Selectors */}
        <div className="grid md:grid-cols-2 gap-8 w-full mt-12">
          {/* Path A: Engineers */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-all">
            <h3 className="text-lg font-bold text-white">{"Programmer Portfolio System"}</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              {"Showcase live application cards with native GitHub stream sync, direct deployment preview linkages, and beautiful automatic print-to-PDF styles."}
            </p>
            <Link href="/register?type=programmer" className="mt-6 w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white font-medium text-xs py-3 hover:bg-indigo-500 transition-all">
              {"Build Software Portfolio →"}
            </Link>
          </div>

          {/* Path B: General Public */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 backdrop-blur-sm hover:border-purple-500/30 transition-all">
            <h3 className="text-lg font-bold text-white">{"ATS-Optimized CV Engine"}</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              {"Clean, structured standard typographic single-column hierarchies engineered directly for automated processing machines to maximize keyword scores."}
            </p>
            <Link href="/register?type=general" className="mt-6 w-full inline-flex items-center justify-center rounded-xl bg-purple-600 text-white font-medium text-xs py-3 hover:bg-purple-500 transition-all">
              {"Build Standard CV →"}
            </Link>
          </div>
        </div>

        {/* FAQ section block element */}
        <div className="w-full mt-16 border-t border-slate-900 pt-12 max-w-2xl space-y-4">
          <h2 className="text-xl font-bold text-white text-center mb-6">{"Frequently Asked Questions"}</h2>
          <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl">
            <h4 className="text-xs font-semibold text-white">{"Is my data secure if I choose a full-stack account path?"}</h4>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{"Yes. Data nodes are governed securely by Supabase Cloud systems with strict Row Level Security rules enabled."}</p>
          </div>
          <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl">
            <h4 className="text-xs font-semibold text-white">{"Can I download my outputs for real-world physical submissions?"}</h4>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{"Absolutely. The engine prints clean formats that strip away web borders cleanly when standard printing buttons are selected."}</p>
          </div>
        </div>
      </main>

      {/* Footer layout element */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-6 text-center text-xs text-slate-600">
        {"© "}{new Date().getFullYear()}{" DevCraft Career Engine. All Rights Reserved."}
      </footer>
    </div>
  );
}
