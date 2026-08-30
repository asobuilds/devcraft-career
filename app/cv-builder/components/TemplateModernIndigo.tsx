'use client';

import React from 'react';

interface TemplateProps {
  fullName: string;
  email: string;
  phone: string;
  website: string;
  summary: string;
  skills: string;
  experience: Array<{ id: string; company: string; role: string; dates: string; bullets: string }>;
}

export default function TemplateModernIndigo({ fullName, email, phone, website, summary, skills, experience }: TemplateProps) {
  return (
    <div className="w-full max-w-[816px] bg-white text-slate-900 p-12 min-h-[1056px] font-sans flex flex-col justify-between border-t-8 border-indigo-600 print:p-0 print:shadow-none print:border-t-0">
      <div className="space-y-6">
        {/* Asymmetric Left-Aligned Identity Header Block */}
        <div className="border-b border-slate-200 pb-5 space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">{fullName || "YOUR FULL NAME"}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-indigo-600 font-mono font-medium">
            {email && <span>{email}</span>}
            {phone && <span className="text-slate-500">{phone}</span>}
            {website && <span className="underline decoration-indigo-300">{website}</span>}
          </div>
        </div>

        {summary && (
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono">01 // Profile Summary</h3>
            <p className="text-xs text-slate-700 leading-relaxed text-justify pl-4 border-l border-indigo-100">{summary}</p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono">02 // Professional Experience</h3>
          <div className="space-y-5 pl-4">
            {experience.map((exp) => (exp.company || exp.role) ? (
              <div key={exp.id} className="space-y-1 text-xs relative group">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span className="text-sm font-black">{exp.role}<span className="font-normal text-slate-500"> @ {exp.company}</span></span>
                  <span className="text-[11px] text-indigo-500 font-mono font-medium">{exp.dates}</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-justify">{exp.bullets}</p>
              </div>
            ) : null)}
          </div>
        </div>

        {skills && (
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono">03 // Technical Skill Matrix</h3>
            <div className="flex flex-wrap gap-1.5 pt-1 pl-4">
              {skills.split(',').map((s, i) => s.trim() ? (
                <span key={i} className="bg-indigo-50/60 text-indigo-900 px-2.5 py-1 rounded-md text-[10px] font-mono border border-indigo-100 font-semibold tracking-wide">
                  {s.trim()}
                </span>
              ) : null)}
            </div>
          </div>
        )}
      </div>

      <div className="text-[9px] text-slate-400 font-mono text-center pt-4">
        DevCraft CV Automation Engine Node // System Verified Delivery.
      </div>
    </div>
  );
}
