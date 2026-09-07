'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Code2, 
  FileText, 
  ArrowRight, 
  CheckCircle, 
  HelpCircle, 
  Layers, 
  Zap, 
  Terminal,
  User,
  ChevronDown,
  Globe
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function Home() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData: FAQItem[] = [
    {
      question: "Can I download my outputs for real-world physical submissions?",
      answer: "Absolutely. Both the CV layouts and developer portfolio dashboards utilize custom print CSS media engines. When you trigger standard browser printing (Ctrl + P), all navigation dashboards, buttons, and backgrounds strip away instantly, generating a beautifully structured, recruiter-compliant physical document."
    },
    {
      question: "What makes this different from regular layout builders like Canva?",
      answer: "Traditional graphic builders export resumes as non-standard text layers, side-by-side floating canvas frames, or complex vector blocks that automated Applicant Tracking Systems (ATS) cannot index, leading to automatic rejection. DevCraft builds pure semantic HTML and high-density typography structures that scoring algorithms grade perfectly."
    },
    {
      question: "Is my personal data secure if I select a full-stack account path?",
      answer: "Yes. Every credential entry, profile field metadata array, and file byte block is managed securely by Supabase Cloud systems with multi-layered Row Level Security (RLS) rules active at the PostgreSQL database schema layers."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-indigo-500 selection:text-white scroll-smooth relative font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col items-center justify-between py-8 px-4 border-r border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 h-screen w-20 z-50">
        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-indigo-600/20">
          {"DC"}
        </div>
        <nav className="flex flex-col gap-6 items-center">
          <a href="#hero" className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition-all" title="Home"><Zap size={20} /></a>
          <a href="#features" className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition-all" title="Features"><Layers size={20} /></a>
          <a href="#about" className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition-all" title="About Developer"><User size={20} /></a>
          <a href="#faq" className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition-all" title="FAQ"><HelpCircle size={20} /></a>
        </nav>
        <div className="text-[10px] text-slate-600 font-medium rotate-270 whitespace-nowrap tracking-widest uppercase">
          {"v1.0.0"}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        
        {/* Header */}
        <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">{"DC"}</div>
            <span className="font-bold text-base tracking-tight text-white">{"DevCraft"}</span>
          </div>
          <div className="hidden lg:block text-sm text-slate-400 font-medium">
            {"Automated Career Optimization & Matrix Delivery System"}
          </div>
          <div className="flex items-center gap-6 ml-auto">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              {"Sign In"}
            </Link>
            <Link href="/register" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/10">
              {"Launch App"}
            </Link>
          </div>
        </header>

        {/* Sections */}
        <div className="flex-1">
          
          {/* Hero */}
          <section id="hero" className="max-w-5xl mx-auto px-6 sm:px-12 pt-24 pb-16 text-center space-y-6 scroll-mt-28">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-medium">
              <Zap size={12} className="animate-pulse" /> {"Dual-Engine Global Portfolio Pipeline"}
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              {"One architecture built for"} <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {"Every Placement Strategy."}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {"Whether you are an engineer syncing live repository dashboards or an applicant optimizing a standard CV version to survive automated parsing software, DevCraft handles your presentation lifecycle."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a href="#features" className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium hover:border-slate-700 transition-all">
                {"Explore Systems Matrix"}
              </a>
              <Link href="/register" className="px-5 py-2.5 rounded-xl bg-white text-slate-950 text-sm font-semibold hover:bg-slate-200 transition-all inline-flex items-center gap-1.5 shadow-md">
                {"Get Started Free"} <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="max-w-6xl mx-auto px-6 sm:px-12 py-20 border-t border-slate-900/60 scroll-mt-20">
            <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{"Dual Execution Capabilities"}</h2>
              <p className="text-sm text-slate-400">{"Engineered for modern screening algorithms and physical recruitment submissions."}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Programmer Portfolio Card */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-8 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Code2 size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mt-6">{"Programmer Portfolio Framework"}</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  {"Deploy dynamic developer landing pages instantly. Showcase active production card components with integrated deployment preview urls and copyable profile README files."}
                </p>
                <div className="mt-6 space-y-3 border-t border-slate-900 pt-6">
                  <div className="flex gap-2 text-xs text-slate-400">
                    <CheckCircle size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>{"Automated Copy README:"}</strong> {"Generates elegant markdown file schemas with one click for GitHub repositories."}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-slate-400">
                    <CheckCircle size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>{"Vanity Link Infrastructure:"}</strong> {"Claim custom handle subdomains built to share online securely with engineering leaders."}</span>
                  </div>
                </div>
              </div>

              {/* ATS CV Card */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <FileText size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mt-6">{"ATS-Optimized CV Blueprint"}</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  {"Traditional graphic layouts get filtered out by enterprise bots. This engine structures clean single-column typographic matrices that tracking machines log effortlessly."}
                </p>
                <div className="mt-6 space-y-3 border-t border-slate-900 pt-6">
                  <div className="flex gap-2 text-xs text-slate-400">
                    <CheckCircle size={14} className="text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>{"ATS Scoring Engine:"}</strong> {"Real-time keyword match analysis against job descriptions to boost your ranking."}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-slate-400">
                    <CheckCircle size={14} className="text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>{"Print-Ready Output:"}</strong> {"One‑click PDF generation with clean typography for physical submissions."}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* About */}
          <section id="about" className="max-w-6xl mx-auto px-6 sm:px-12 py-20 border-t border-slate-900/60 scroll-mt-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{"Built for engineers, by engineers"}</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {"DevCraft was created to solve a simple problem: your work deserves to be presented in a way that both humans and machines can appreciate. We combine modern design with semantic structure so you can stop worrying about formatting and start focusing on your craft."}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">JD</div>
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300">SK</div>
                    <div className="h-8 w-8 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-xs font-bold text-pink-300">AL</div>
                  </div>
                  <span className="text-xs text-slate-500">{"Trusted by 200+ early adopters"}</span>
                </div>
              </div>
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm">
                <Terminal size={20} className="text-indigo-400 mb-3" />
                <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap">
{`$ devcraft build --portfolio
✅ Portfolio deployed at johndoe.devcraft.com
$ devcraft cv --ats-score 94
✅ CV optimized with 94% keyword match
$ devcraft share --linkedin
✅ Profile shared to LinkedIn feed`}
                </pre>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="max-w-4xl mx-auto px-6 sm:px-12 py-20 border-t border-slate-900/60 scroll-mt-20">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{"Frequently Asked Questions"}</h2>
              <p className="text-sm text-slate-400">{"Everything you need to know about the platform."}</p>
            </div>
            <div className="space-y-3">
              {faqData.map((item, index) => (
                <div key={index} className="border border-slate-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left bg-slate-900/20 hover:bg-slate-900/40 transition-colors"
                  >
                    <span className="text-sm font-medium text-white">{item.question}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-500 transition-transform duration-200 ${
                        openFaqIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-5 pt-0 text-xs text-slate-400 leading-relaxed">
                      {item.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-slate-900/60 bg-slate-950/40 px-6 sm:px-12 py-8">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">{"DC"}</div>
                <span className="text-xs font-medium text-slate-500">{"© 2025 DevCraft — The Career Engineering Platform"}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <a href="#" className="hover:text-white transition-colors"><Globe size={16} /></a>
                <a href="#" className="hover:text-white transition-colors"><Globe size={16} /></a>
                <a href="#" className="hover:text-white transition-colors"><Globe size={16} /></a>
                <Link href="/privacy" className="text-xs hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="text-xs hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}