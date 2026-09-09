'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Code2, 
  FileText, 
  ArrowRight, 
  ChevronDown, 
  Layers, 
  Zap, 
  Terminal,
  User,
  HelpCircle,
  Briefcase,
  MessagesSquare,
  Sparkles,
  CreditCard
} from 'lucide-react';

export default function HomeLandingPage() {
  // Floating Dynamic Background Skin Switches State Management
  const [bgTheme, setBgTheme] = useState('slate-black');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "How does the Single-Source Data Architecture optimize my career presence?",
      answer: "Instead of managing multiple files, you input your profile details once inside our interactive step-by-step conversational guide. The engine immediately syncs that structured dataset across your public vanity portfolio layout, your copyable GitHub profile README, and all your printable ATS resume layouts simultaneously."
    },
    {
      question: "Can standard free tier accounts upload profile portrait images?",
      answer: "Yes! Adding a professional portrait photograph to personalize your resume layouts and candidate marketplace cards is 100% free for everyone. Premium tier upgrades are exclusively for continuous background web-scraping radar operations and automated tracker board injections."
    },
    {
      question: "How does the 'Approve-to-Apply' Radar channel verify matching vacancies?",
      answer: "Our core background scraper actively crawls Google indices, private software networks, and global government recruitment portals. When a job matching your exact technical toolsets hits the matrix, it generates a pending tracking entry. The platform sends an instant alert notification to your device; once you tap approve, it submits the application variables and activates the CRM tracking card automatically."
    }
  ];

  // Dynamic Tailwind Layout Color Mappings Matrix
  const wrapperThemeClasses = 
    bgTheme === 'clean-white' ? 'bg-slate-50 text-slate-900 border-slate-200' :
    bgTheme === 'cyberpunk-navy' ? 'bg-slate-900 text-slate-100 border-slate-800' : 
    'bg-slate-950 text-slate-100 border-slate-900/60';

  const asideThemeClasses = 
    bgTheme === 'clean-white' ? 'bg-white border-slate-200 text-slate-600' : 
    'bg-slate-950/80 border-slate-900 bg-slate-950/80';

  const cardBackgroundClasses = 
    bgTheme === 'clean-white' ? 'bg-white border-slate-200/80 shadow-md text-slate-900' : 
    'bg-slate-900/40 border-slate-800 text-slate-100';

  const headingTextClasses = bgTheme === 'clean-white' ? 'text-slate-900' : 'text-white';
  const descriptiveTextClasses = bgTheme === 'clean-white' ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className={`min-h-screen flex selection:bg-indigo-500 selection:text-white scroll-smooth relative font-sans transition-colors duration-300 ${wrapperThemeClasses}`}>
      
      {/* Visual Tech Ambient Glow Orbs */}
      {bgTheme !== 'clean-white' && (
        <>
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />
        </>
      )}

      {/* FLOATING FIXED INTERACTIVE SHORTBAR NAVIGATION & THEME SKIN SWITCHER WIDGET */}
      <aside className={`hidden lg:flex flex-col items-center justify-between py-8 px-4 border-r backdrop-blur-md sticky top-0 h-screen w-20 z-50 ${asideThemeClasses}`}>
        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-indigo-600/20">DC</div>
        
        <nav className="flex flex-col gap-6 items-center">
          <a href="#hero" className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-900/40 transition-all" title="Home Hero"><Zap size={18} /></a>
          <a href="#workflow" className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-900/40 transition-all" title="System Workflow"><Layers size={18} /></a>
          <a href="#capabilities" className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-900/40 transition-all" title="Dual Capabilities"><Briefcase size={18} /></a>
          <a href="#faq" className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-900/40 transition-all" title="System FAQ"><HelpCircle size={18} /></a>
        </nav>

        {/* Floating Toggle Color Circle Buttons Row */}
        <div className="flex flex-col gap-3 items-center bg-slate-950/40 p-2 rounded-2xl border border-slate-800/40">
          <button onClick={() => setBgTheme('slate-black')} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all transform active:scale-95 ${bgTheme === 'slate-black' ? 'border border-indigo-500 scale-105' : 'opacity-60'}`} title="Slate Black">⚫</button>
          <button onClick={() => setBgTheme('clean-white')} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all transform active:scale-95 ${bgTheme === 'clean-white' ? 'border border-indigo-600 scale-105' : 'opacity-60'}`} title="Clean White">⚪</button>
          <button onClick={() => setBgTheme('cyberpunk-navy')} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all transform active:scale-95 ${bgTheme === 'cyberpunk-navy' ? 'border border-indigo-500 scale-105' : 'opacity-60'}`} title="Cyberpunk Navy">🔵</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        
        {/* Sticky Header Bar */}
        <header className="border-b border-slate-900/40 bg-transparent backdrop-blur-md sticky top-0 z-40 px-6 sm:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">DC</div>
            <span className={`font-extrabold text-base tracking-tight uppercase font-mono ${headingTextClasses}`}>DevCraft</span>
          </div>
          <div className="hidden lg:block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
            {"[ Core System Deployment Terminal Portal ]"}
          </div>
          <div className="flex items-center gap-6 ml-auto">
            <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider">Log In</Link>
            <Link href="/register" className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-500 transition-all uppercase tracking-wider shadow-md">Launch Console</Link>
          </div>
        </header>

        <div className="flex-1">
          
          {/* HERO HOOK INTRO */}
          <section id="hero" className="max-w-4xl mx-auto px-6 sm:px-12 pt-20 pb-16 text-center space-y-6 scroll-mt-28">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles size={12} className="animate-pulse" /> Unified Placement Engineering Infrastructure
            </div>
            <h1 className={`text-4xl md:text-6xl font-black tracking-tight leading-tight uppercase ${headingTextClasses}`}>
              Unify Your Career Placement <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                With Automated Data Systems
              </span>
            </h1>
            <p className={`text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed ${descriptiveTextClasses}`}>
              Input your placement datasets once. Our single-source system immediately streams your background info to compile professional programmer portfolios, vanity subdomains, and recruiter-compliant typographic sheets simultaneously.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a href="#workflow" className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold hover:border-slate-700 text-white transition-all">Explore Platform Workflow ↓</a>
              <Link href="/register" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all inline-flex items-center gap-1.5 shadow-lg">Get Started Free <ArrowRight size={14} /></Link>
            </div>
          </section>

          {/* THE STEP-BY-STEP PLATFORM LOGIC & WORKFLOW EXPLANATION */}
          <section id="workflow" className="max-w-6xl mx-auto px-6 sm:px-12 py-16 border-t border-slate-900/40 scroll-mt-20">
            <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
              <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${headingTextClasses}`}>How the System Works</h2>
              <p className={`text-xs sm:text-sm ${descriptiveTextClasses}`}>A clear, direct mapping of how users achieve professional career conversions smoothly.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative">
              <div className={`p-6 rounded-2xl border transition-all ${cardBackgroundClasses}`}>
                <span className="text-2xl font-black text-indigo-500/20 font-mono block mb-3">01 //</span>
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4"><MessagesSquare size={16} /></div>
                <h3 className="text-sm font-bold uppercase tracking-tight">The AI Interview Guide</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2 text-justify">
                  Skip empty text boxes. Our conversational career guide assistant interviews you step-by-step, providing smart hints to format metrics and highlight high-velocity action verbs.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border transition-all ${cardBackgroundClasses}`}>
                <span className="text-2xl font-black text-purple-500/20 font-mono block mb-3">02 //</span>
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4"><Layers size={16} /></div>
                <h3 className="text-sm font-bold uppercase tracking-tight">Single-Source Mapping</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2 text-justify">
                  Your details flow immediately onto the canvas. Toggle across 5 specialized, image-supported layouts (Zety Asymmetric, Minimalist, Executive, Teal, Euro) on click.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border transition-all ${cardBackgroundClasses}`}>
                <span className="text-2xl font-black text-emerald-500/20 font-mono block mb-3">03 //</span>
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4"><Briefcase size={16} /></div>
                <h3 className="text-sm font-bold uppercase tracking-tight">Approve-to-Apply Radar</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2 text-justify">
                  Our core automated scraper crawls Google search indices, private, and government databases. When a technical stack match hits, you get notified to auto-apply instantly.
                </p>
              </div>
            </div>
          </section>

          {/* DUAL EXECUTION CAPABILITIES & FREEMIUM MONETIZATION RULES */}
          <section id="capabilities" className="max-w-6xl mx-auto px-6 sm:px-12 py-16 border-t border-slate-900/40 scroll-mt-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${headingTextClasses}`}>Dual Output Architecture</h2>
                <p className={`text-xs sm:text-sm leading-relaxed ${descriptiveTextClasses}`}>
                  We protect your professional freedom. Users can construct comprehensive resumes, upload portrait photos, and access data configurations completely free. Link sharing, high-density print downloads, and advanced full-web background scraping trackers are reserved for subscribed accounts.
                </p>
                <div className="space-y-2 text-xs text-slate-400 pt-2 font-mono">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">✓ Link Profile Portrait Images (Free for Everyone)</div>
                  <div className="flex items-center gap-2">✓ Compile 5 Typographic Sheet Formats (Free Workspace)</div>
                  <div className="flex items-center gap-2 text-purple-400 font-bold">🔒 Deploy Vanity Subdomain Addresses (Premium Only)</div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">🔒 Multi-Sovereign Government & Web Radar Scrapers (Premium Only)</div>
                </div>
              </div>
              
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
                <Terminal size={18} className="text-indigo-400 mb-3" />
                <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
{`$ devcraft system --status
🚀 Conversational Interview: Active.
📸 Portrait Image Uploader: Connected.
$ devcraft compile --subdomain "agene"
🔒 Action Halted: Upgrade account to map live link to ://devcraft.com
$ devcraft subscription --pricing
👉 Fixed Access Cost: ₦1,500 for 3 Months.`}
                </pre>
              </div>
            </div>
          </section>

          {/* FAQ ACCORDION PANEL */}
          <section id="faq" className="max-w-4xl mx-auto px-6 sm:px-12 py-16 border-t border-slate-900/40 scroll-mt-20">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${headingTextClasses}`}>System Inquiries Manual</h2>
              <p className={`text-xs sm:text-sm ${descriptiveTextClasses}`}>Critical operational capabilities and parameters of the platform explained simply.</p>
            </div>
            
            <div className="space-y-3">
              {faqData.map((item, index) => (
                <div key={index} className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/20">
                  <button
                    onClick={() => toggleFaq(index)}
                    type="button"
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-900/40 transition-colors focus:outline-none"
                  >
                    <span className="text-xs font-bold uppercase text-white tracking-wide">{item.question}</span>
                    <span className="text-indigo-400 transition-transform duration-200">{openFaqIndex === index ? '▲' : '▼'}</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-5 pt-0 text-xs text-slate-400 leading-relaxed text-justify border-t border-slate-900/40 mt-1">
                      {item.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Operational Footer */}
          <footer className="border-t border-slate-900/40 bg-transparent px-6 sm:px-12 py-8 text-center md:text-left">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-600">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">DC</div>
                <span className="font-bold uppercase tracking-wider">DevCraft Systems Node</span>
              </div>
              <div>
                {"© 2026 DevCraft Career Placement Automation Engine Infrastructure. All privileges registered."}
              </div>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}
