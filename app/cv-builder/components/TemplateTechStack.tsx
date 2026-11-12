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

export default function TemplateTechStack({ fullName, email, phone, website, summary, skills, experience }: TemplateProps) {
  return (
    <div className="w-full max-w-[816px] bg-white text-slate-900 min-h-[1056px] font-sans grid grid-cols-[200px_1fr] shadow-xl print:shadow-none print:p-0">
      
      {/* LEFT COLUMN: Compact Skills Sidebar */}
      <div className="bg-slate-900 text-slate-100 p-6 flex flex-col gap-6 print:bg-slate-900 print:text-slate-100">
        <div className="space-y-1.5">
          <h1 className="text-lg font-black tracking-tight leading-tight uppercase text-white break-words">
            {fullName || "FULL NAME"}
          </h1>
          <p className="text-[9px] text-indigo-400 font-mono font-bold tracking-wider uppercase">Tech Stack Profile</p>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 font-mono">Contact</h4>
          <div className="space-y-2 text-[10px] text-slate-300 font-medium break-all">
            {email && <div className="flex flex-col"><span className="text-[8px] uppercase font-bold text-slate-500">Email</span><span>{email}</span></div>}
            {phone && <div className="flex flex-col"><span className="text-[8px] uppercase font-bold text-slate-500">Phone</span><span>{phone}</span></div>}
            {website && <div className="flex flex-col"><span className="text-[8px] uppercase font-bold text-slate-500">Portfolio</span><span className="text-indigo-400 font-semibold">{website}</span></div>}
          </div>
        </div>

        {skills && (
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 font-mono">Expertise Matrix</h4>
            <div className="flex flex-col gap-1 font-mono">
              {skills.split(',').map((s, i) => s.trim() ? (
                <span key={i} className="text-[10px] text-slate-300 flex items-center gap-1 font-medium py-0.5 border-b border-slate-800/40">
                  <span className="text-indigo-400">▸</span>{s.trim()}
                </span>
              ) : null)}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Professional Timeline */}
      <div className="p-8 bg-white flex flex-col justify-between h-full">
        <div className="space-y-5">
          
          {summary && (
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1">Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed text-justify pr-2">{summary}</p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1">Experience</h3>
            <div className="space-y-4">
              {experience.map((exp) => (exp.company || exp.role) ? (
                <div key={exp.id} className="space-y-1 text-xs relative group pl-3 border-l border-slate-200">
                  <div className="absolute h-1.5 w-1.5 rounded-full bg-indigo-600 -left-[3.75px] top-1.5" />
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-sm font-black text-slate-900">{exp.role}<span className="font-semibold text-slate-500"> @ {exp.company}</span></span>
                    <span className="text-[10px] text-indigo-600 font-mono font-semibold shrink-0 ml-4">{exp.dates}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-justify pr-2 whitespace-pre-wrap">{exp.bullets}</p>
                </div>
              ) : null)}
            </div>
          </div>

        </div>

        <div className="text-[8px] text-slate-400 text-center pt-6 border-t border-slate-100">
          DevCraft Tech Stack Compact Layout.
        </div>
      </div>
    </div>
  );
}