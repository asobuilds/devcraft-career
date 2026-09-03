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
    <div className="w-full max-w-[816px] bg-white text-slate-900 min-h-[1056px] font-sans grid grid-cols-3 shadow-xl print:shadow-none print:p-0">
      
      {/* LEFT COLUMN PANEL: High-Density Sidebar Profile Info Section */}
      <div className="col-span-1 bg-slate-900 text-slate-100 p-8 flex flex-col gap-8 print:bg-slate-900 print:text-slate-100">
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight leading-tight uppercase text-white break-words">
            {fullName || "FULL NAME"}
          </h1>
          <p className="text-[10px] text-indigo-400 font-mono font-bold tracking-wider uppercase">Verified Dossier Candidate</p>
        </div>

        {/* Contact Links Block Grid element labels templates */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 font-mono">Contact Details</h4>
          <div className="space-y-2.5 text-xs text-slate-300 font-medium break-all">
            {email && <div className="flex flex-col"><span className="text-[9px] uppercase font-bold text-slate-500 font-sans">Email</span><span>{email}</span></div>}
            {phone && <div className="flex flex-col"><span className="text-[9px] uppercase font-bold text-slate-500 font-sans">Phone</span><span>{phone}</span></div>}
            {website && <div className="flex flex-col"><span className="text-[9px] uppercase font-bold text-slate-500 font-sans">Portfolio</span><span className="text-indigo-400 font-semibold">{website}</span></div>}
          </div>
        </div>

        {/* Skill Tokens Inventory blocks wrappers renders items map */}
        {skills && (
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 font-mono">Expertise Matrix</h4>
            <div className="flex flex-col gap-1.5 font-mono">
              {skills.split(',').map((s, i) => s.trim() ? (
                <span key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5 font-medium py-0.5 border-b border-slate-800/40">
                  ⚡ {s.trim()}
                </span>
              ) : null)}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN PANEL: High-Velocity Professional Timeline Canvas */}
      <div className="col-span-2 p-10 bg-white flex flex-col justify-between h-full">
        <div className="space-y-6">
          
          {/* Executive Section Summary Profile */}
          {summary && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1">Professional Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed text-justify pr-2">{summary}</p>
            </div>
          )}

          {/* Professional Core History Mapping Timeline */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1">Employment History</h3>
            <div className="space-y-5">
              {experience.map((exp) => (exp.company || exp.role) ? (
                <div key={exp.id} className="space-y-1.5 text-xs relative group pl-4 border-l border-slate-200">
                  <div className="absolute h-2 w-2 rounded-full bg-indigo-600 -left-[4.5px] top-1.5" />
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-sm font-black text-slate-900">{exp.role}<span className="font-semibold text-slate-500"> at {exp.company}</span></span>
                    <span className="text-[11px] text-indigo-600 font-mono font-semibold shrink-0 ml-4">{exp.dates}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-justify pr-2 whitespace-pre-wrap">{exp.bullets}</p>
                </div>
              ) : null)}
            </div>
          </div>

        </div>

        <div className="text-[9px] text-slate-400 text-center pt-8 border-t border-slate-100">
          Generated with DevCraft Career Lifecycle Platform Engine Nodes System.
        </div>
      </div>

    </div>
  );
}
