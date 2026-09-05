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

export default function TemplateExecutiveSlate({ fullName, email, phone, website, summary, skills, experience }: TemplateProps) {
  return (
    <div className="w-full max-w-[816px] bg-slate-50 text-slate-900 min-h-[1056px] p-12 flex flex-col justify-between border-l-8 border-slate-800 shadow-xl print:shadow-none print:p-0 print:border-l-0">
      <div className="space-y-6">
        
        {/* Bold Executive Banner Grid Alignment Layout Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-5">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase font-sans">{fullName || "YOUR FULL NAME"}</h1>
            <p className="text-xs text-indigo-600 font-mono font-bold tracking-widest uppercase">Verified Senior Executive Blueprint Dossier</p>
          </div>
          <div className="text-right text-[11px] text-slate-600 font-sans space-y-0.5 tracking-wide font-medium">
            {email && <p>{email}</p>}
            {phone && <p>{phone}</p>}
            {website && <p className="text-slate-900 font-semibold">{website}</p>}
          </div>
        </div>

        {summary && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans bg-slate-200/60 px-3 py-1 rounded">Executive Leadership Summary</h3>
            <p className="text-xs text-slate-700 leading-relaxed text-justify px-3">{summary}</p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans bg-slate-200/60 px-3 py-1 rounded">Core Professional History Timeline</h3>
          <div className="space-y-5 px-3">
            {experience.map((exp) => (exp.company || exp.role) ? (
              <div key={exp.id} className="space-y-1 text-xs">
                <div className="flex justify-between items-baseline font-sans font-bold text-slate-950">
                  <span className="text-sm font-extrabold">{exp.role}<span className="text-slate-500 font-normal"> — {exp.company}</span></span>
                  <span className="text-[11px] text-slate-600 font-mono font-medium shrink-0">{exp.dates}</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-justify whitespace-pre-wrap pl-3 border-l border-slate-300">{exp.bullets}</p>
              </div>
            ) : null)}
          </div>
        </div>

        {skills && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans bg-slate-200/60 px-3 py-1 rounded">Core Strategic Competencies Matrix</h3>
            <div className="flex flex-wrap gap-2 pt-1 px-3">
              {skills.split(',').map((s, i) => s.trim() ? (
                <span key={i} className="bg-slate-900 text-white px-3 py-1 rounded-md text-[10px] font-sans font-semibold tracking-wide border border-transparent shadow-sm">
                  {s.trim()}
                </span>
              ) : null)}
            </div>
          </div>
        )}
      </div>

      <div className="text-[9px] text-slate-400 font-sans text-center pt-8 border-t border-slate-100">
        DevCraft Career Lifecycle Framework Platform Engine • Certified Transmission Entry.
      </div>
    </div>
  );
}
