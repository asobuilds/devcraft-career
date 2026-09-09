'use client';

import React from 'react';

export default function TemplateCreativeTeal({ fullName, email, phone, website, summary, skills, experience, avatarUrl }) {
  return (
    <div className="w-full max-w-[816px] bg-white text-slate-800 min-h-[1056px] font-sans p-10 flex flex-col justify-between border-t-8 border-teal-600 shadow-xl print:shadow-none print:p-0">
      <div className="space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
          {avatarUrl && (
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-teal-50/60 shadow-md shrink-0">
              <img src={avatarUrl} alt="Creative Avatar" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{fullName || "YOUR FULL NAME"}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-teal-600 font-semibold font-mono">
              {email && <span>📬 {email}</span>}
              {phone && <span>📞 {phone}</span>}
              {website && <span className="underline">{website}</span>}
            </div>
          </div>
        </div>

        {summary && (
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-teal-600 font-mono">01 // Executive Statement</h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-4 border-l-2 border-teal-500 text-justify">{summary}</p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-teal-600 font-mono">02 // Professional Experience Record</h3>
          <div className="space-y-4 pl-4">
            {experience.map((exp) => (exp.company || exp.role) ? (
              <div key={exp.id} className="space-y-1 text-xs">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span className="text-sm font-black text-slate-800">{exp.role} <span className="text-teal-600 font-medium">@ {exp.company}</span></span>
                  <span className="text-[10px] text-slate-400 font-mono">{exp.dates}</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">{exp.bullets}</p>
              </div>
            ) : null)}
          </div>
        </div>

        {skills && (
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-teal-600 font-mono">03 // Technical Skill Matrix</h3>
            <div className="flex flex-wrap gap-1.5 pl-4 pt-1">
              {skills.split(',').map((s, i) => s.trim() ? (
                <span key={i} className="bg-teal-50 text-teal-900 border border-teal-100 px-2.5 py-0.5 rounded text-[10px] font-medium font-mono">{s.trim()}</span>
              ) : null)}
            </div>
          </div>
        )}
      </div>
      <div className="text-[8px] text-slate-400 text-center font-mono">DevCraft Creative Automation Sheet Matrix Layout.</div>
    </div>
  );
}
