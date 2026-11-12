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
  avatarUrl?: string;
  allowPhoto?: boolean;
}

export default function TemplateGraduate({ fullName, email, phone, website, summary, skills, experience }: TemplateProps) {
  return (
    <div className="w-full max-w-[816px] bg-white text-slate-900 min-h-[1056px] font-serif p-12 flex flex-col justify-between border border-slate-200 shadow-xl print:shadow-none print:p-0 print:border-0">
      <div className="space-y-6">
        
        <div className="space-y-2 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">{fullName || "YOUR FULL NAME"}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
            {email && <span>{email}</span>}
            {phone && <span>{phone}</span>}
            {website && <span>{website}</span>}
          </div>
        </div>

        {summary && (
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-700 border-b border-slate-200 pb-1">Objective</h3>
            <p className="text-xs text-slate-800 leading-relaxed text-justify">{summary}</p>
          </div>
        )}

        {skills && (
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-700 border-b border-slate-200 pb-1">Core Skills & Competencies</h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.split(',').map((s, i) => s.trim() ? (
                <span key={i} className="bg-slate-100 text-slate-900 px-2.5 py-1 rounded text-[10px] border border-slate-200 font-medium">{s.trim()}</span>
              ) : null)}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-700 border-b border-slate-200 pb-1">Experience</h3>
          <div className="space-y-4">
            {experience.map((exp) => (exp.company || exp.role) ? (
              <div key={exp.id} className="space-y-1 text-xs">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{exp.role}{exp.company ? ` | ${exp.company}` : ""}</span>
                  <span className="text-[10px] text-slate-600">{exp.dates}</span>
                </div>
                <p className="text-slate-800 leading-relaxed pl-3 border-l-2 border-slate-300 whitespace-pre-wrap">{exp.bullets}</p>
              </div>
            ) : null)}
          </div>
        </div>
      </div>
      <div className="text-[8px] text-slate-400 text-center border-t border-slate-100 pt-4">DevCraft Career Graduate Hybrid Layout.</div>
    </div>
  );
}