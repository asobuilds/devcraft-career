'use client';

import React from 'react';

export default function TemplateExecutiveSlate({ fullName, email, phone, website, summary, skills, experience, avatarUrl }) {
  return (
    <div className="w-full max-w-[816px] bg-slate-50 text-slate-900 min-h-[1056px] p-12 flex flex-col justify-between border-l-8 border-slate-800 shadow-xl print:shadow-none print:p-0 print:border-l-0">
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            {avatarUrl && (
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-300 shadow-inner">
                <img src={avatarUrl} alt="Executive" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">{fullName || "YOUR FULL NAME"}</h1>
              <p className="text-[10px] text-indigo-600 font-mono font-bold tracking-widest uppercase">Senior Executive Portfolio Blueprint</p>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-600 space-y-0.5 font-medium tracking-wide">
            {email && <p>{email}</p>}
            {phone && <p>{phone}</p>}
            {website && <p className="text-slate-900 font-semibold">{website}</p>}
          </div>
        </div>

        {summary && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 bg-slate-200/60 px-3 py-1 rounded">Executive Leadership Summary</h3>
            <p className="text-xs text-slate-700 leading-relaxed text-justify px-3">{summary}</p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 bg-slate-200/60 px-3 py-1 rounded">Professional Timeline</h3>
          <div className="space-y-4 px-3">
            {experience.map((exp) => (exp.company || exp.role) ? (
              <div key={exp.id} className="space-y-1 text-xs">
                <div className="flex justify-between items-baseline font-bold text-slate-950">
                  <span className="text-sm font-extrabold">{exp.role}<span className="text-slate-500 font-normal"> — {exp.company}</span></span>
                  <span className="text-[10px] text-slate-600 font-mono shrink-0">{exp.dates}</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-justify whitespace-pre-wrap pl-3 border-l border-slate-300">{exp.bullets}</p>
              </div>
            ) : null)}
          </div>
        </div>

        {skills && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 bg-slate-200/60 px-3 py-1 rounded">Strategic Competencies</h3>
            <div className="flex flex-wrap gap-1.5 pt-1 px-3">
              {skills.split(',').map((s, i) => s.trim() ? (
                <span key={i} className="bg-slate-900 text-white px-2.5 py-1 rounded-md text-[9px] font-semibold tracking-wide">{s.trim()}</span>
              ) : null)}
            </div>
          </div>
        )}
      </div>
      <div className="text-[8px] text-slate-400 text-center pt-4 border-t border-slate-100">DevCraft Career Lifecycle Framework Platform • Certified Transmission.</div>
    </div>
  );
}
