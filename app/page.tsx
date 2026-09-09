'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Home,
  Workflow,
  Sparkles,
  HelpCircle,
  MessageSquare,
  User,
  Rocket,
  Menu,
  X,
  ChevronDown,
  Star,
  Send,
  ArrowRight,
} from 'lucide-react';

const navLinks = [
  { href: '#hero', label: 'Home', icon: Home },
  { href: '#how-it-works', label: 'How It Works', icon: Workflow },
  { href: '#features', label: 'Features', icon: Sparkles },
  { href: '#faq', label: 'FAQ', icon: HelpCircle },
  { href: '#reviews', label: 'Reviews', icon: MessageSquare },
  { href: '#about', label: 'About', icon: User },
];

const faqData = [
  { question: 'What is DevCraft Career?', answer: "It's a free tool that helps you build a professional CV in minutes, and then automatically looks for jobs that fit your skills so you don't have to search for them yourself." },
  { question: 'How does it find jobs for me?', answer: 'Once your CV or portfolio is ready, the system looks across the internet, including private companies, government postings, and freelance platforms, for roles that match your skills and experience. When it finds a good match, it sends you the job link so you can apply.' },
  { question: 'Do I need a photo on my CV?', answer: 'No. You can choose a template with a photo or one without, whichever fits the kind of job you are applying for.' },
  { question: 'Can I attach my certificates and results?', answer: 'Yes. While building your CV, you can upload supporting documents like certificates, transcripts, and other files to go along with it.' },
  { question: 'Is it free to use?', answer: 'Yes. Building your CV and getting job matches is free. This project was built to help everyone, especially people who may not have easy access to career tools.' },
];

const testimonials = [
  { name: 'Amaka O.', role: 'Frontend Developer', text: 'I built my CV in ten minutes and got matched to a remote job within a week.' },
  { name: 'Tunde A.', role: 'Data Analyst', text: 'The job alerts actually match my skills. I no longer scroll through jobs that do not fit me.' },
  { name: 'Chiamaka N.', role: 'Recent Graduate', text: 'Being able to attach my certificates made my CV feel complete and professional.' },
];

export default function HomeLandingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const sidebarClasses =
    'fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-40 flex flex-col justify-between transition-transform duration-300 ' +
    (sidebarOpen ? 'translate-x-0' : '-translate-x-full') +
    ' lg:translate-x-0';

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed top-4 left-4 z-50 lg:hidden bg-slate-900 text-white p-2 rounded-lg shadow-lg border border-slate-800">
        {sidebarOpen === true ? <X size={20} /> : <Menu size={20} />}
      </button>

      {sidebarOpen === true ? (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      ) : null}

      <aside className={sidebarClasses}>
        <div>
          <div className="px-6 py-6 border-b border-slate-800">
            <span className="text-xl font-bold tracking-tight text-white">
              DevCraft <span className="text-indigo-400">Career</span>
            </span>
          </div>
          <nav className="px-3 py-6 space-y-1">
            {navLinks.map(function (item) {
              return (
                <a key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                  <item.icon size={18} />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
        <div className="p-4 space-y-2">
          <Link href="/register" className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-3 rounded-lg transition-colors">
            <Rocket size={16} />
            Get Started
          </Link>
          <Link href="/login" className="flex items-center justify-center w-full border border-slate-700 text-slate-300 hover:text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
            Log In
          </Link>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 min-w-0">
        <section id="hero" className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center space-y-6 scroll-mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold">
            <Sparkles size={14} />
            <span>Build once. Get matched. Get hired.</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Your CV, your portfolio, and your next job, all in one place.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            DevCraft Career helps you build a professional CV in minutes, then quietly searches the internet for jobs you actually qualify for, private, government, or freelance, and sends you the link to apply.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/register" className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors inline-flex items-center gap-2">
              <span>Get Started Free</span>
              <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:border-slate-600 hover:text-white transition-colors">
              See how it works
            </a>
          </div>
        </section>

        <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900 scroll-mt-20">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How It Works</h2>
            <p className="text-slate-400 text-sm">Four simple steps, explained plainly.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <span className="text-2xl font-bold text-indigo-500/40">1</span>
              <h3 className="text-sm font-semibold text-white mt-2">Build your CV</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Fill in your details, work history, and skills using our simple builder.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <span className="text-2xl font-bold text-indigo-500/40">2</span>
              <h3 className="text-sm font-semibold text-white mt-2">Pick a template</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Choose from CV designs, with or without a photo, that fit the job you want.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <span className="text-2xl font-bold text-indigo-500/40">3</span>
              <h3 className="text-sm font-semibold text-white mt-2">We scan for jobs</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Our system searches the internet for jobs that match your skills and experience.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <span className="text-2xl font-bold text-indigo-500/40">4</span>
              <h3 className="text-sm font-semibold text-white mt-2">You get notified</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">When a matching job is found, you get a message with the link to apply.</p>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900 scroll-mt-20">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">What You Get</h2>
            <p className="text-slate-400 text-sm">Everything you need to find and land a job, in one place.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <h3 className="text-sm font-semibold text-white">Multiple CV Templates</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Choose from several designs, with or without a photo.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <h3 className="text-sm font-semibold text-white">Attach Certificates</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Add your results, certificates, and other documents to your CV.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <h3 className="text-sm font-semibold text-white">Automatic Job Matching</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">We search the internet for jobs that fit your skills.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <h3 className="text-sm font-semibold text-white">Instant Alerts</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Get notified the moment a matching job is found.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <h3 className="text-sm font-semibold text-white">Private and Government Jobs</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">We look across all kinds of work, not just tech jobs.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <h3 className="text-sm font-semibold text-white">Completely Free</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Build your CV and get matched, at no cost.</p>
            </div>
          </div>
        </section>

        <section id="faq" className="max-w-3xl mx-auto px-6 py-16 border-t border-slate-900 scroll-mt-20">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm">Everything explained simply.</p>
          </div>
          <div className="space-y-3">
            {faqData.map(function (item, index) {
              var isOpen = openFaqIndex === index;
              var arrowClass = isOpen === true ? 'text-indigo-400 transition-transform rotate-180' : 'text-indigo-400 transition-transform';
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
            <h2 className="text-2xl sm:text-3xl font-bold text-white">What Users Are Saying</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {testimonials.map(function (t) {
              return (
                <div key={t.name} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
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
                <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} required placeholder="Tell us what you think..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white resize-none h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  <Send size={14} />
                  <span>Submit</span>
                </button>
              </form>
            )}
          </div>
        </section>

        <section id="about" className="max-w-3xl mx-auto px-6 py-16 border-t border-slate-900 scroll-mt-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">About This Project</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            DevCraft Career was built by Aso, a programmer and solution builder from Abuja, Nigeria, with a simple goal: make it easier for anyone to build a professional CV and find real job opportunities, without needing expensive tools or connections.
          </p>
        </section>

        <footer className="border-t border-slate-900 px-6 py-8 text-center">
          <p className="text-[11px] text-slate-600">
            © 2026 DevCraft Career. Built to help everyone find their next opportunity.
          </p>
        </footer>
      </div>
    </div>
  );
}