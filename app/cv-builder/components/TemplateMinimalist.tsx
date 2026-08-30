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

export default function TemplateMinimalist({ fullName, email, phone, website, summary, skills, experience }: TemplateProps) {
  return (
    <div className="w-full max-w-[816px] bg-white text-slate-950 p-12 min-h-[1056px] font-serif flex flex-col justify-between print:p-0 print:shadow-none">
      <div className="space-y-6">
        {/* Government Grade High Density Centered Header Alignment */}
        <div className="text-center space-y-1.5 border-b-2 border-slate-950 pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">{fullName || "YOUR FULL NAME"}</h1>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-700 font-sans tracking-wide">
            {email && <span>{email}</span>}
            {phone && <span>{phone}</span>}
            {website && <span className="font-semibold">{website}</span>}
          </div>
        </div>

        {summary && (
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans border-b border-slate-200 pb-0.5">Professional Summary Statement</h3>
            <p className="text-xs text-slate-800 leading-relaxed text-justify">{summary}</p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans border-b border-slate-200 pb-0.5">Professional History / Proof of Work</h3>
          <div className="space-y-4">
            {experience.map((exp) => (exp.company || exp.role) ? (
              <div key={exp.id} className="space-y-1 text-xs">
                <div className="flex justify-between items-baseline font-sans font-bold text-slate-950">
                  <span>{exp.role}{exp.company ? ` | ${exp.company}` : ""}</span>
                  <span className="text-[11px] text-slate-600 font-normal">{exp.dates}</span>
                </div>
                <p className="text-slate-800 leading-relaxed text-justify pl-3 border-l-2 border-slate-900">{exp.bullets}</p>
              </div>
            ) : null)}
          </div>
        </div>

        {skills && (
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans border-b border-slate-200 pb-0.5">Technical & Core Competencies Inventory</h3>
            <div className="flex flex-wrap gap-2 pt-1 font-sans">
              {skills.split(',').map((s, i) => s.trim() ? (
                <span key={i} className="bg-slate-100 text-slate-900 px-2.5 py-0.5 rounded text-[11px] border border-slate-200 font-medium">
                  {s.trim()}
                </span>
              ) : null)}
            </div>
          </div>
        )}
      </div>

      <div className="text-[9px] text-slate-400 font-sans text-center border-t border-slate-100 pt-4">
        Verified Official Dossier. Generated via DevCraft Career Infrastructure Platform.
      </div>
    </div>
  );
}
