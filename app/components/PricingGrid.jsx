'use client';

import React from 'react';
import { Check, X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const FREE_FEATURES = [
  'Unlimited resumes and portfolios',
  'AI guided interview builder',
  'AI writing assist',
  '3 professional templates',
  'Upload and AI-restructure an old resume',
  'Attach certificates and documents',
  'Interview prep questions and practice feedback',
  'Manual job application tracker',
];

const PREMIUM_FEATURES = [
  'Everything in Free',
  '2 additional premium templates',
  'Real ATS-safe PDF export',
  'Print and data export',
  'Automatic job lead sourcing across 11+ sources',
  'Email alerts when new leads are found',
  'Custom shareable portfolio subdomain',
];

export default function PricingGrid() {
  return (
    <section id="pricing" className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900 scroll-mt-20">
      <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Simple, Honest Pricing</h2>
        <p className="text-slate-400 text-sm">Everything you need to build your CV and portfolio is free. Upgrade only if you want automatic job leads and downloads.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-1">Free</h3>
          <p className="text-xs text-slate-500 mb-6">Everything you need to get started.</p>
          <ul className="space-y-2.5 flex-1">
            {FREE_FEATURES.map(function (feature, index) {
              return (
                <li key={index} className="flex items-start gap-2 text-xs text-slate-300">
                  <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              );
            })}
          </ul>
          <Link
            href="/register"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 border border-slate-700 text-slate-200 text-sm font-semibold py-3 rounded-xl hover:border-slate-600 transition-colors"
          >
            Get Started Free
          </Link>
        </div>

        <div className="p-6 rounded-2xl border border-indigo-500/40 bg-gradient-to-b from-indigo-950/60 to-slate-900/40 flex flex-col relative">
          <div className="absolute -top-3 left-6 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={10} /> Premium
          </div>
          <h3 className="text-lg font-semibold text-white mb-1 mt-2">Premium</h3>
          <p className="text-xs text-indigo-300 mb-6">For serious job hunting, automated.</p>
          <ul className="space-y-2.5 flex-1">
            {PREMIUM_FEATURES.map(function (feature, index) {
              return (
                <li key={index} className="flex items-start gap-2 text-xs text-slate-200">
                  <Check size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              );
            })}
          </ul>
          
            href="https://paystack.shop/pay/kqrkkfueyh"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
          >
            Upgrade to Premium <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}