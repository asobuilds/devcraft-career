'use client';

import React from 'react';

export default function TemplateCompactEuro({ fullName, email, phone, website, summary, skills, experience, avatarUrl }) {
  return (
    <div className="w-full max-w-[816px] bg-white text-slate-900 min-h-[1056px] font-sans p-8 flex flex-col justify-between shadow-xl print:shadow-none print:p-0">
      <div className="space-y-4">
        
        {/* High Density Column Layout */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
          <div className="space-y-1 flex items-center gap-4">
            {avatarUrl && (
              <div className="w-16 h-16 rounded overflow-hidden border border-slate-200 shrink-0">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{fullName || "YOUR NAME"}</h1>
              {website && <p className="text-[11px] text-slate-500 font-mono">{website}</p>}
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-500 font-medium space-y-0.5 font-mono">
            {email && <p>✉️ {email}</p>}
            {phone && <p>📞 {phone}</p>}
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-4 gap-4 text-xs border-b border-slate-100 pb-3">
            <span className="col-span-1 font-bold uppercase tracking-wider text-slate-400 text-[10px] font-mono">Summary</span>
            <p className="col-span-3 text-slate-600 text-justify leading-relaxed">{summary}</p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Experience Timeline</h3>
          <div className="space-y-3">
            {experience.map((exp) => (exp.company || exp.role) ? (
              <div key={exp.id} className="grid grid-cols-4 gap-4 text-xs border-b border-slate-50/60 pb-2">
                <span className="col-span-1 text-[11px] font-mono font-semibold text-slate-500">{exp.dates}</span>
                <div className="col-span-3 space-y-1">
                  <h4 className="font-bold text-slate-900">{exp.role} <span className="font-normal text-slate-400">— {exp.company}</span></h4>
                  <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">{exp.bullets}</p>
                </div>
              </div>
            ) : null)}
          </div>
        </div>

        {skills && (
          <div className="grid grid-cols-4 gap-4 text-xs pt-2">
            <span className="col-span-1 font-bold uppercase tracking-wider text-slate-400 text-[10px] font-mono">Core Skills</span>
            <div className="col-span-3 flex flex-wrap gap-1">
              {skills.split(',').map((s, i) => s.trim() ? (
                <span key={i} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-700 font-medium">{s.trim()}</span>
              ) : null)}
            </div>
          </div>
        )}
      </div>
      <div className="text-[7px] text-slate-300 font-mono text-center pt-4">DevCraft Curriculum Core Systems Block Matrix Framework.</div>
    </div>
  );
}
