'use client';

import React from 'react';

export default function TemplateModernIndigo({ fullName, email, phone, website, summary, skills, experience, avatarUrl }) {
  return (
    <div className="w-full max-w-[816px] bg-white text-slate-900 min-h-[1056px] font-sans grid grid-cols-3 shadow-xl print:shadow-none print:p-0">
      
      {/* LEFT SIDEBAR PANEL */}
      <div className="col-span-1 bg-slate-900 text-slate-100 p-8 flex flex-col gap-6 print:bg-slate-900 print:text-slate-100">
        
        {/* Profile Picture Uploader (Available for Free & Premium) */}
        {avatarUrl && (
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500 mx-auto shadow-md">
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="space-y-1 text-center">
          <h1 className="text-xl font-black tracking-tight uppercase text-white break-words">
            {fullName || "FULL NAME"}
          </h1>
          <p className="text-[9px] text-indigo-400 font-mono tracking-wider uppercase">Verified Candidate Dossier</p>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300 font-medium break-all">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 font-mono">Contact Info</h4>
          {email && <div className="flex flex-col"><span className="text-[9px] uppercase font-bold text-slate-500">Email</span><span>{email}</span></div>}
          {phone && <div className="flex flex-col"><span className="text-[9px] uppercase font-bold text-slate-500">Phone</span><span>{phone}</span></div>}
          {website && <div className="flex flex-col"><span className="text-[9px] uppercase font-bold text-slate-500">Portfolio</span><span className="text-indigo-400 font-semibold">{website}</span></div>}
        </div>

        {skills && (
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 font-mono">Expertise Matrix</h4>
            <div className="flex flex-col gap-1 font-mono text-[11px] text-slate-300">
              {skills.split(',').map((s, i) => s.trim() ? <span key={i} className="py-0.5 border-b border-slate-800/40">⚡ {s.trim()}</span> : null)}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT METRICS TIMELINE */}
      <div className="col-span-2 p-10 bg-white flex flex-col justify-between h-full">
        <div className="space-y-6">
          {summary && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1">Professional Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed text-justify">{summary}</p>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1">Employment History</h3>
            <div className="space-y-4">
              {experience.map((exp) => (exp.company || exp.role) ? (
                <div key={exp.id} className="space-y-1 text-xs relative pl-4 border-l border-slate-200">
                  <div className="absolute h-2 w-2 rounded-full bg-indigo-600 -left-[4.5px] top-1.5" />
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{exp.role}<span className="text-slate-500 font-semibold"> at {exp.company}</span></span>
                    <span className="text-[10px] text-indigo-600 font-mono shrink-0 ml-4">{exp.dates}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-justify pr-2 whitespace-pre-wrap">{exp.bullets}</p>
                </div>
              ) : null)}
            </div>
          </div>
        </div>
        <div className="text-[8px] text-slate-400 text-center border-t border-slate-100 pt-4 font-mono">Generated via DevCraft Ecosystem Nodes.</div>
      </div>
    </div>
  );
}
