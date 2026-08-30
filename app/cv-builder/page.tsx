'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Printer, Plus, Trash2, Loader2, Download, Layers } from 'lucide-react';
import Link from 'next/link';

// Import our isolated sub-component styling template modules cleanly
import TemplateMinimalist from './components/TemplateMinimalist';
import TemplateModernIndigo from './components/TemplateModernIndigo';

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  dates: string;
  bullets: string;
}

export default function CVBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form states
  const [resumeTitle, setResumeTitle] = useState('My Professional CV');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState<ExperienceItem[]>([
    { id: '1', company: '', role: '', dates: '', bullets: '' },
  ]);
  const [theme, setTheme] = useState<string>('modern-indigo');

  // Contact parameters strings
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase.from('profiles').select('full_name, email, phone, website').eq('id', user.id).single();
      if (profile) {
        setFullName(profile.full_name || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
        setWebsite(profile.website || '');
      }

      const { data: cv } = await supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (cv) {
        setResumeTitle(cv.resume_title || 'My Professional CV');
        setSummary(cv.summary || '');
        setSkills(cv.skills ? cv.skills.join(', ') : '');
        setTheme(cv.active_template || 'modern-indigo');
        setExperience(Array.isArray(cv.experience) && cv.experience.length > 0 ? (cv.experience as ExperienceItem[]) : [{ id: '1', company: '', role: '', dates: '', bullets: '' }]);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleAddExperience = () => {
    setExperience([...experience, { id: Date.now().toString(), company: '', role: '', dates: '', bullets: '' }]);
  };

  const handleRemoveExperience = (id: string) => {
    if (experience.length === 1) return;
    setExperience(experience.filter((exp) => exp.id !== id));
  };

  const handleExperienceChange = (id: string, field: keyof ExperienceItem, value: string) => {
    setExperience(experience.map((exp) => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const exportJSONBackup = () => {
    const backupPayload = { profile: { fullName, email, phone, website }, resume: { summary, skills, experience, theme } };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeTitle.toLowerCase().replace(/\s+/g, '-')}-backup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await supabase.from('profiles').upsert({ id: userId, full_name: fullName, email, phone, website, updated_at: new Date().toISOString() });
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      await supabase.from('resumes').upsert({ user_id: userId, resume_title: resumeTitle, summary, skills: skillsArray, experience, active_template: theme, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      alert('✅ Document tracking coordinates matching matrix saved successfully!');
    } catch (error: any) {
      alert('❌ Server database error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-purple-500" size={20} />
        <span>Syncing Document Fragment Matrices...</span>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-slate-950 text-slate-100 print:bg-white print:text-black">
      
      {/* Structural Header Control Toolbar Block */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
            <ArrowLeft size={16} />
          </Link>
          <input type="text" value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-purple-500 font-bold text-sm text-white px-2 py-1 focus:outline-none" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs">
            <Layers size={12} className="text-slate-500 mr-2" />
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer">
              <option value="modern-indigo">Template: Silicon Tech Indigo</option>
              <option value="minimalist">Template: Civil Service Minimalist</option>
            </select>
          </div>

          <button onClick={exportJSONBackup} className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-800 bg-slate-900 text-slate-300 rounded-xl text-xs font-semibold hover:border-slate-700">
            <Download size={14} /> {"Export Data"}
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-800 bg-slate-900 text-slate-300 rounded-xl text-xs font-semibold hover:border-slate-700">
            <Printer size={14} /> Print / PDF
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-500 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Matrix'}
          </button>
        </div>
      </header>

      {/* Main Framework Grid Splits Layout Panels */}
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-2 min-h-[calc(100vh-65px)] print:block">
        
        {/* LEFT COLUMN: Entry form controller inputs fields */}
        <div className="p-6 md:p-10 border-r border-slate-900 space-y-8 overflow-y-auto max-h-[calc(100vh-70px)] print:hidden">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Placement Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="Agene Okoh" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Verified Contact Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone Contact Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="+234..." />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Vanity Portfolio Handle Link</label>
              <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="://devcraft.com" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Executive Summary Meta Dossier Statement</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white resize-none leading-relaxed" placeholder="State your metrics achievements..." />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Work Experience Mapping Matrix</label>
              <button onClick={handleAddExperience} className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400"><Plus size={12} /> Add Job Entry</button>
            </div>
            {experience.map((exp) => (
              <div key={exp.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3 relative group">
                <button onClick={() => handleRemoveExperience(exp.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400"><Trash2 size={12} /></button>
                <input 
                  type="text" 
                  placeholder="Official Role Position" 
                  value={exp.role} 
                  onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" 
                />

                <textarea rows={2} placeholder="Key accomplishments and data volume variables metrics optimized..." value={exp.bullets} onChange={(e) => handleExperienceChange(exp.id, 'bullets', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white resize-none" />
                
                {exp.bullets.length > 2 && (
                  <div className={`p-2 rounded-lg text-[10px] font-medium border ${
                    exp.bullets.toLowerCase().includes('responsible for') || exp.bullets.toLowerCase().includes('helped with') ? 'bg-red-500/5 border-red-500/20 text-red-400' :
                    exp.bullets.toLowerCase().includes('managed') || exp.bullets.toLowerCase().includes('led') ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400' :
                    !/\d/.test(exp.bullets) ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : 'bg-green-500/5 border-green-500/20 text-green-400'
                  }`}>
                    {exp.bullets.toLowerCase().includes('responsible for') || exp.bullets.toLowerCase().includes('helped with') ? '⚠️ ATS Alert: Replace passive terms with high-velocity action verbs (e.g. Engineered, Architected).' :
                     exp.bullets.toLowerCase().includes('managed') || exp.bullets.toLowerCase().includes('led') ? '🚀 Tip: Maximize your score by explicitly detailing the volume metrics of the squads or resources led.' :
                     !/\d/.test(exp.bullets) ? '💡 Metrics Missing: Government and private selectors look for exact numeric parameters values.' : '✨ Compliance Check: Bullet format satisfies high-impact performance scanning screening metrics rules perfectly!'}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Technical Skill Keywords Matrix (Comma-Separated)</label>
            <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white" placeholder="React, TypeScript, SQL, PostgreSQL, Linux, Docker, AWS" />
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Dynamic Template Canvas Selection */}
        <div className="p-6 md:p-12 bg-slate-900/10 flex items-start justify-center overflow-y-auto max-h-[calc(100vh-70px)] print:max-h-none print:p-0 print:bg-white">
          {theme === 'minimalist' ? (
            <TemplateMinimalist fullName={fullName} email={email} phone={phone} website={website} summary={summary} skills={skills} experience={experience} />
          ) : (
            <TemplateModernIndigo fullName={fullName} email={email} phone={phone} website={website} summary={summary} skills={skills} experience={experience} />
          )}
        </div>

      </div>
    </div>
  );
}
