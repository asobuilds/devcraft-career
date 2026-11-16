'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ScraperDemoWidget from './components/ScraperDemoWidget';
import {
  Sparkles,
  ChevronDown,
  Star,
  Send,
  ArrowRight,
  FileText,
  Paperclip,
  Zap,
  Bell,
  Building2,
  Gift,
} from 'lucide-react';

const faqData = [
  { question: 'What is DevCraft Naija?', answer: "It's a free, Nigeria-focused tool that helps you build a professional CV in minutes, then automatically searches for Nigerian jobs that fit your skills — private, government, or freelance — so you don't have to keep scrolling job boards." },
  { question: 'How does it find jobs for me?', answer: 'Once your CV or portfolio is ready, the system scans Nigerian job platforms, company career pages, government postings, and freelance networks for roles that match your skills and location. When it finds a strong match, it sends you the application link.' },
  { question: 'Do I need a photo on my CV?', answer: 'No. You can choose a template with a photo or one without, depending on the kind of role you are applying for in Nigeria.' },
  { question: 'Can I attach my NYSC certificate, diplomas, and transcripts?', answer: 'Yes. While building your CV you can upload supporting documents like your NYSC certificate, degree, transcripts, certificates, and other files so they travel with your application.' },
  { question: 'Is it free to use?', answer: 'Yes. Building your CV and getting job matches is completely free. DevCraft Naija was built to make career tools accessible to everyone in Nigeria, no matter your location or budget.' },
];

const testimonials = [
  { name: 'Amaka O.', role: 'Frontend Developer', text: 'I built my CV in ten minutes and got matched to a remote job within a week.' },
  { name: 'Tunde A.', role: 'Data Analyst', text: 'The job alerts actually match my skills. I no longer scroll through jobs that do not fit me.' },
  { name: 'Chiamaka N.', role: 'Recent Graduate', text: 'Being able to attach my certificates made my CV feel complete and professional.' },
];

export default function HomeLandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(-1);
    } else {
      setOpenFaqIndex(index);
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        className="relative isolate overflow-hidden scroll-mt-10 border-b border-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"
      >
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
          </div>
        </div>
      </section>

        <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900 scroll-mt-20 bg-black/50">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-emerald-400 font-mono text-sm uppercase tracking-widest">How It Works</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How It Works</h2>
            <p className="text-slate-400 text-sm">Four simple steps, explained plainly.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(2,6,23,0.35)]">
              <span className="text-2xl font-bold text-orange-500/40">1</span>
              <h3 className="text-sm font-semibold text-white mt-2">Build your CV</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Fill in your details, work history, and skills using our simple builder.</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(2,6,23,0.35)]">
              <span className="text-2xl font-bold text-orange-500/40">2</span>
              <h3 className="text-sm font-semibold text-white mt-2">Pick a template</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Choose a CV design that fits the Nigerian role you want, with or without a photo.</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(2,6,23,0.35)]">
              <span className="text-2xl font-bold text-orange-500/40">3</span>
              <h3 className="text-sm font-semibold text-white mt-2">We scan Nigerian job boards</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Our system searches local platforms, government portals, and company career pages for matches.</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(2,6,23,0.35)]">
              <span className="text-2xl font-bold text-orange-500/40">4</span>
              <h3 className="text-sm font-semibold text-white mt-2">You get notified</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">When a matching role is found, you receive a message with the direct application link.</p>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900 scroll-mt-20 bg-slate-950">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-emerald-400 font-mono text-sm uppercase tracking-widest">Features</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">What You Get</h2>
            <p className="text-slate-400 text-sm">Everything you need to find and land a job, in one place.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(2,6,23,0.35)]">
              <FileText size={20} className="text-orange-400 mb-3" />
              <h3 className="text-sm font-semibold text-white">Multiple CV Templates</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Choose from several professional designs, with or without a photo.</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(2,6,23,0.35)]">
              <Paperclip size={20} className="text-cyan-400 mb-3" />
              <h3 className="text-sm font-semibold text-white">Attach Your NYSC Certificate & Documents</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Upload your NYSC certificate, degree, transcripts, and other proof of qualifications.</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(2,6,23,0.35)]">
              <Zap size={20} className="text-emerald-400 mb-3" />
              <h3 className="text-sm font-semibold text-white">Automatic Job Matching</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">We search Nigerian job boards for roles that fit your skills.</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(2,6,23,0.35)]">
              <Bell size={20} className="text-amber-400 mb-3" />
              <h3 className="text-sm font-semibold text-white">Instant Alerts</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Get notified the moment a matching role is found.</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(2,6,23,0.35)]">
              <Building2 size={20} className="text-purple-400 mb-3" />
              <h3 className="text-sm font-semibold text-white">Private & Government Jobs</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">We scan private companies, federal and state agencies, and freelance platforms.</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(2,6,23,0.35)]">
              <Gift size={20} className="text-emerald-400 mb-3" />
              <h3 className="text-sm font-semibold text-white">Completely Free</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Build your CV and get matched, at no cost.</p>
            </div>
          </div>
        </section>

        <div className="shadow-[0_0_30px_rgba(16,185,129,0.15)] border-emerald-500/30">
          <ScraperDemoWidget />
        </div>

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

          <div className="max-w-lg mx-auto p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            <h3 className="text-sm font-semibold text-white mb-4">Leave Your Feedback</h3>
            {feedbackSubmitted === true ? (
              <p className="text-sm text-green-400">Thank you for your feedback!</p>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <div className="flex gap-1">
                  <button type="button" onClick={() => setRating(1)}><Star size={20} className={rating >= 1 ? 'text-amber-400' : 'text-slate-600'} fill={rating >= 1 ? 'currentColor' : 'none'} /></button>
                  <button type="button" onClick={() => setRating(2)}><Star size={20} className={rating >= 2 ? 'text-amber-400' : 'text-slate-600'} fill={rating >= 2 ? 'currentColor' : 'none'} /></button>
                  <button type="button" onClick={() => setRating(3)}><Star size={20} className={rating >= 3 ? 'text-amber-400' : 'text-slate-600'} fill={rating >= 3 ? 'currentColor' : 'none'} /></button>
                  <button type="button" onClick={() => setRating(4)}><Star size={20} className={rating >= 4 ? 'text-amber-400' : 'text-slate-600'} fill={rating >= 4 ? 'currentColor' : 'none'} /></button>
                  <button type="button" onClick={() => setRating(5)}><Star size={20} className={rating >= 5 ? 'text-amber-400' : 'text-slate-600'} fill={rating >= 5 ? 'currentColor' : 'none'} /></button>
                </div>
                <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} required placeholder="Tell us what you think..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white resize-none h-24 focus:outline-none focus:ring-2 focus:ring-orange-500"></textarea>
                <button type="submit" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  <Send size={14} />
                  <span>Submit</span>
                </button>
              </form>
            )}
          </div>
        </section>

        <section id="about" className="max-w-3xl mx-auto px-6 py-16 border-t border-slate-900 scroll-mt-20 text-center">
          <span className="text-emerald-400 font-mono text-sm uppercase tracking-widest block mb-4">About</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">About This Project</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            DevCraft Naija was built by Aso, a programmer and solution builder from Abuja, Nigeria, with a simple goal: make it easier for every Nigerian professional to build a world-class CV and find real job opportunities, without expensive tools or connections.
          </p>
        </section>

        <footer className="border-t border-orange-500/20 bg-black px-6 py-8 text-center">
          <p className="text-[11px] text-slate-500">
            © 2026 DevCraft Naija 🇳🇬. Built in Nigeria for every Nigerian job seeker.
          </p>
        </footer>
    </div>
  );
}