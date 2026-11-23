'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScraperDemoWidget from './components/ScraperDemoWidget';
import { supabase } from '@/lib/supabase';
import {
  Sparkles,
  ChevronDown,
  Star,
  Send,
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  Layout,
  Search,
  Bell,
  BadgeCheck,
  MousePointerClick,
  MapPin,
} from 'lucide-react';

const faqData = [
  { question: 'What is DevCraft Naija?', answer: "It's a free, Nigeria-focused tool that helps you build a professional CV in minutes, then automatically searches for Nigerian jobs that fit your skills — private, government, or freelance — so you don't have to keep scrolling job boards." },
  { question: 'Can the AI really edit my CV?', answer: 'Yes, our AI Co-Editor can rewrite summaries, add skills, and tailor your experience to specific job descriptions.' },
  { question: 'How does it find jobs for me?', answer: 'Once your CV or portfolio is ready, the system scans Nigerian job platforms, company career pages, government postings, and freelance networks for roles that match your skills and location. When it finds a strong match, it sends you the application link.' },
  { question: 'Do I need a photo on my CV?', answer: 'No. You can choose a template with a photo or one without, depending on the kind of role you are applying for in Nigeria.' },
  { question: 'Can I attach my NYSC certificate, diplomas, and transcripts?', answer: 'Yes. While building your CV you can upload supporting documents like your NYSC certificate, degree, transcripts, certificates, and other files so they travel with your application.' },
  { question: 'Is it free to use?', answer: 'Yes. Building your CV and getting job matches is completely free. DevCraft Naija was built to make career tools accessible to everyone in Nigeria, no matter your location or budget.' },
];

const testimonials = [
  { name: 'Amaka O.', role: 'Frontend Developer (Lagos)', text: 'I built my CV in ten minutes. Got an interview at a fintech in Yaba within a week.' },
  { name: 'Tunde A.', role: 'Data Analyst (Abuja)', text: 'The job alerts matched me to a remote analytics role at a health-tech startup, so I stopped scrolling irrelevant boards.' },
  { name: 'Chiamaka N.', role: 'Recent Graduate (Enugu)', text: 'Attaching my NYSC discharge certificate and transcripts took one click and made my CV feel complete.' },
];

export default function HomeLandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(-1);
    } else {
      setOpenFaqIndex(index);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setFeedbackError('');
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('feedback').insert({
      user_id: user?.id ?? null,
      rating,
      message: feedbackText.trim(),
    });

    if (error) {
      setFeedbackError('Could not submit feedback: ' + error.message);
      return;
    }

    setFeedbackSubmitted(true);
    setFeedbackText('');
  };

  return (
    <div className="relative isolate min-h-screen bg-slate-950 text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <section
        id="hero"
        className="relative isolate overflow-hidden scroll-mt-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/landing-hero.jpg"
            alt="Nigerian professionals"
            fill
            className="object-cover object-center"
            preload
          />
          {/* The Overlay: Crucial for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-slate-950/40" /> {/* Extra darkening for mobile */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />
        </div>

        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage:
              'radial-gradient(ellipse 70% 60% at 50% 0%, #000 45%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 60% at 50% 0%, #000 45%, transparent 100%)',
          }}
        />

        <div className="pointer-events-none absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-orange-500/20 blur-[128px] animate-pulse motion-reduce:animate-none [animation-duration:9s]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-[128px] animate-pulse motion-reduce:animate-none [animation-duration:11s]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-20 text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-400/40 bg-orange-500/15 backdrop-blur-md text-orange-200 text-xs font-semibold shadow-[0_0_45px_-10px_rgba(249,115,22,0.65)] ring-1 ring-orange-400/20">
            <Sparkles size={14} className="text-orange-400" />
            <span>Build once. Get matched. Get hired.</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Your CV, your portfolio, and your next Nigerian job,{' '}
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-emerald-400 bg-clip-text text-transparent">
              all in one place.
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            DevCraft Naija helps you build a professional CV in minutes, then quietly searches Nigerian job boards, government portals, and freelance platforms for roles you actually qualify for and sends you the link to apply.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/register" className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold shadow-lg shadow-orange-950/40 transition-all inline-flex items-center gap-2">
              <span>Get Started Free</span>
              <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 backdrop-blur-md text-slate-200 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors">
              See how it works
            </a>
            <p className="w-full text-slate-500 text-[11px]">
              Built for roles at <span className="text-slate-400">Flutterwave</span>,{' '}
              <span className="text-slate-400">Paystack</span>,{' '}
              <span className="text-slate-400">Google</span>,{' '}
              <span className="text-slate-400">Andela</span>, and more.
            </p>
            <p className="w-full text-slate-500 text-xs">
              No credit card required • Free forever plan
            </p>
          </div>
        </div>
      </section>

        <section id="how-it-works" className="relative isolate max-w-5xl mx-auto px-6 py-16 scroll-mt-20">
          <div
            className="pointer-events-none absolute inset-x-0 -top-24 h-24 md:-top-32 md:h-32 bg-gradient-to-b from-transparent via-slate-950/35 to-slate-950 z-0"
            aria-hidden="true"
          />
          <div className="relative z-10">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-emerald-400 font-mono text-sm uppercase tracking-widest">The Journey</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How It Works</h2>
            <p className="text-slate-400 text-sm">Four simple steps, explained plainly.</p>
          </div>
          <div className="relative isolate">
            <div
              className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-11 -z-10 hidden h-0.5 animate-timeline bg-gradient-to-r from-orange-500/50 via-emerald-500/50 to-transparent blur-[2px] lg:block"
              aria-hidden="true"
            />
            <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-orange-500/30">
                <span className="pointer-events-none absolute -right-2 -top-4 -z-10 select-none text-8xl font-black leading-none text-white/5" aria-hidden="true">01</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-[0.2em] text-orange-400">STEP 01</span>
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 shadow-[0_0_25px_rgba(249,115,22,0.2)]">
                    <span className="absolute inset-0 rounded-xl bg-orange-500/20 blur-xl" aria-hidden="true" />
                    <FileText size={20} className="relative z-10 text-orange-300" />
                  </div>
                </div>
                <h3 className="mt-6 text-sm font-semibold text-white">Build your CV</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">Fill in your details, work history, and skills using our simple builder.</p>
              </div>
              <div className="relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-orange-500/30">
                <span className="pointer-events-none absolute -right-2 -top-4 -z-10 select-none text-8xl font-black leading-none text-white/5" aria-hidden="true">02</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-[0.2em] text-orange-400">STEP 02</span>
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 shadow-[0_0_25px_rgba(249,115,22,0.2)]">
                    <span className="absolute inset-0 rounded-xl bg-orange-500/20 blur-xl" aria-hidden="true" />
                    <Layout size={20} className="relative z-10 text-orange-300" />
                  </div>
                </div>
                <h3 className="mt-6 text-sm font-semibold text-white">Pick a template</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">Choose a design that fits the Nigerian role you want, with or without a photo.</p>
              </div>
              <div className="relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-orange-500/30">
                <span className="pointer-events-none absolute -right-2 -top-4 -z-10 select-none text-8xl font-black leading-none text-white/5" aria-hidden="true">03</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-[0.2em] text-orange-400">STEP 03</span>
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 shadow-[0_0_25px_rgba(249,115,22,0.2)]">
                    <span className="absolute inset-0 rounded-xl bg-orange-500/20 blur-xl" aria-hidden="true" />
                    <Search size={20} className="relative z-10 text-orange-300" />
                  </div>
                </div>
                <h3 className="mt-6 text-sm font-semibold text-white">We scan Nigerian job boards</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">Our system searches local platforms, government portals, and company career pages for matches.</p>
              </div>
              <div className="relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-orange-500/30">
                <span className="pointer-events-none absolute -right-2 -top-4 -z-10 select-none text-8xl font-black leading-none text-white/5" aria-hidden="true">04</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-[0.2em] text-orange-400">STEP 04</span>
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 shadow-[0_0_25px_rgba(249,115,22,0.2)]">
                    <span className="absolute inset-0 rounded-xl bg-orange-500/20 blur-xl" aria-hidden="true" />
                    <Bell size={20} className="relative z-10 text-orange-300" />
                  </div>
                </div>
                <h3 className="mt-6 text-sm font-semibold text-white">You get notified</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">When a matching role is found, you receive a message with the direct application link.</p>
              </div>
            </div>
          </div>
          </div>
        </section>

        <section id="features" className="relative max-w-5xl mx-auto overflow-hidden px-6 py-16 border-t border-slate-900 scroll-mt-20 bg-slate-950">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-emerald-400 font-mono text-sm uppercase tracking-widest">The Workspace</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">One dashboard. Your whole job search.</h2>
            <p className="text-slate-400 text-sm">CV, applications, job matches, and an AI copilot — together.</p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-x-8 top-8 bottom-4 rounded-[2rem] bg-orange-500/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-[0_0_50px_rgba(249,115,22,0.2)] backdrop-blur-xl transition-transform duration-500 md:-rotate-2 md:hover:rotate-0">
              <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/70 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <div className="ml-3 flex-1 rounded-md border border-slate-800 bg-slate-900/70 px-3 py-1 text-[10px] text-slate-500">
                  app.devcraft.ng/dashboard
                </div>
              </div>

              <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.5fr_1fr]">
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white">Job-Ready Checklist</p>
                      <span className="text-[10px] font-semibold text-orange-300">3 of 5 complete</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-orange-500 to-emerald-400" />
                    </div>
                    <div className="mt-3 grid gap-2 text-[10px] text-slate-400 sm:grid-cols-2">
                      {['CV uploaded', 'Portfolio linked', 'Skills added'].map((item) => (
                        <div key={item} className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          <span>{item}</span>
                        </div>
                      ))}
                      {['Cover letter drafted', 'NYSC certificate attached'].map((item) => (
                        <div key={item} className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-full border border-slate-700" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white">Application Tracker</p>
                      <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[9px] font-semibold text-orange-300">
                        Live
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Applied
                        </div>
                        <div className="mt-2 space-y-2">
                          <div className="rounded-md border border-slate-800 bg-slate-950/70 p-2">
                            <p className="text-[11px] font-semibold text-white">Google</p>
                            <p className="text-[10px] text-slate-500">Frontend Engineer</p>
                          </div>
                          <div className="rounded-md border border-slate-800 bg-slate-950/70 p-2">
                            <p className="text-[11px] font-semibold text-white">Flutterwave</p>
                            <p className="text-[10px] text-slate-500">React Developer</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Interviewing
                        </div>
                        <div className="mt-2 rounded-md border border-slate-800 bg-slate-950/70 p-2">
                          <p className="text-[11px] font-semibold text-white">Paystack</p>
                          <p className="text-[10px] text-slate-500">Product Designer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                      <Bot size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">AI Copilot</p>
                      <p className="text-[9px] text-slate-500">Context-aware assistant</p>
                    </div>
                  </div>
                  <div className="mt-4 flex-1 space-y-3 text-[11px] leading-relaxed">
                    <div className="ml-auto max-w-[85%] rounded-xl bg-orange-500 px-3 py-2 text-white">
                      Which job should I prioritize?
                    </div>
                    <div className="max-w-[92%] rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-slate-300">
                      <p>
                        <span className="font-semibold text-white">Flutterwave</span> is your strongest fit right now. Your React work lines up with the role and you are already interviewing.
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1.5 text-[10px] text-emerald-300">
                        <CheckCircle2 size={11} />
                        <span>87% skill match · Interview stage</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                    <span className="flex-1 text-[10px] text-slate-600">Ask a follow-up...</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500 text-white">
                      <Send size={11} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-sm font-medium text-slate-400">
            Your entire job search, <span className="text-white">in one AI-powered workspace.</span>
          </p>
        </section>

        <ScraperDemoWidget />

        <section id="faq" className="max-w-3xl mx-auto px-6 py-16 border-t border-slate-900 scroll-mt-20">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-emerald-400 font-mono text-sm uppercase tracking-widest">FAQ</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm">Everything explained simply.</p>
          </div>
          <div className="space-y-3">
            {faqData.map(function (item, index) {
              const isOpen = openFaqIndex === index;
              const arrowClass = isOpen === true ? 'text-orange-400 transition-transform rotate-180' : 'text-orange-400 transition-transform';
              return (
                <div key={index} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/20">
                  <button onClick={() => toggleFaq(index)} type="button" className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-900/40 transition-colors">
                    <span className="text-sm font-semibold text-white">{item.question}</span>
                    <ChevronDown size={18} className={arrowClass} />
                  </button>
                  {isOpen === true ? (
                    <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-900 pt-4">
                      {item.answer}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section id="reviews" className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900 scroll-mt-20">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-emerald-400 font-mono text-sm uppercase tracking-widest">Reviews</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">What Users Are Saying</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {testimonials.map(function (t) {
              return (
                <div key={t.name} className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(2,6,23,0.35)]">
                  <div className="flex gap-0.5 mb-3 text-amber-400">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{t.text}</p>
                  <p className="text-xs font-semibold text-white">{t.name}</p>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                </div>
              );
            })}
          </div>

          <div className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 md:p-8">
            <p className="text-xs font-semibold tracking-widest text-emerald-400 block mb-4">FEEDBACK</p>
            <h3 className="text-center text-xl md:text-2xl font-bold text-white mb-2">
              How is DevCraft working for you?
            </h3>
            <p className="text-center text-sm text-slate-400 mb-6">
              Takes 30 seconds — your feedback shapes what we build next.
            </p>
            {feedbackSubmitted === true ? (
              <p className="text-center text-sm text-emerald-400">Thank you for your feedback!</p>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                <div className="flex justify-center gap-1.5 mb-6">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star size={28} className={rating >= n ? 'text-amber-400' : 'text-slate-600'} fill={rating >= n ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                  placeholder="Tell us what you think..."
                  className="w-full min-h-[110px] rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 resize-none"
                />
                {feedbackError ? <p className="text-xs text-red-400 mt-2">{feedbackError}</p> : null}
                <div className="flex flex-col-reverse gap-3 mt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">Logged-in users only</p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 w-full sm:w-auto justify-center shadow-lg shadow-orange-500/20"
                  >
                    <Send size={14} />
                    <span>Submit</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        <section id="about" className="max-w-3xl mx-auto px-6 py-16 border-t border-slate-900 scroll-mt-20 text-center">
          <span className="text-xs font-semibold tracking-widest text-emerald-400 block mb-4">
            WHY DEVCRAFT EXISTS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">100% free. Zero gatekeeping. Built for your career.</h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl mx-auto mb-10">
            DevCraft Naija exists for one simple reason: world-class career tools should not cost a kobo. Every feature — the CV Builder, ATS Analyzer, Cover Letter writer, Job Tracker, and Community — is completely free, easy to use, and designed around how Nigerians actually search for work. No trials, no paywalls, no premium tiers hiding the good templates.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-3">
                <BadgeCheck size={16} />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Free, Forever</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every template, every AI feature, every tool. No card details, no expiry dates.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 mb-3">
                <MousePointerClick size={16} />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Easy by Design</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Build a professional, ATS-ready CV in minutes. If you can use WhatsApp, you can use DevCraft.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-3">
                <MapPin size={16} />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Made for Naija</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Local copy, Nigerian demo profiles, and a community that understands the local job market.
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-orange-500/20 bg-black px-6 py-8 text-center">
          <p className="text-[11px] text-slate-500">
            © 2026 DevCraft Naija 🇳🇬. Built in Nigeria for every Nigerian job seeker.
          </p>
        </footer>
    </div>
  );
}