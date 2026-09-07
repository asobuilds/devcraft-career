'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Printer, Plus, Trash2, Loader2, Download, Layers, Sparkles, CreditCard } from 'lucide-react';
import Link from 'next/link';

// Import our isolated sub-component styling template modules cleanly
import TemplateMinimalist from './components/TemplateMinimalist';
import TemplateModernIndigo from './components/TemplateModernIndigo';
import TemplateExecutiveSlate from './components/TemplateExecutiveSlate';

export default function CVBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  // Form states
  const [resumeTitle, setResumeTitle] = useState('My Professional CV');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState([
    { id: '1', company: '', role: '', dates: '', bullets: '' },
  ]);
  const [theme, setTheme] = useState('modern-indigo');
  const [isPremium, setIsPremium] = useState(false);

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

      const { data: profile } = await supabase.from('profiles').select('full_name, email, phone, website, is_premium').eq('id', user.id).single();
      if (profile) {
        setFullName(profile.full_name || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
        setWebsite(profile.website || '');
        setIsPremium(profile.is_premium ?? false);
      }

      const { data: cv } = await supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (cv) {
        setResumeTitle(cv.resume_title || 'My Professional CV');
        setSummary(cv.summary || '');
        setSkills(cv.skills ? cv.skills.join(', ') : '');
        setTheme(cv.active_template || 'modern-indigo');
        setExperience(Array.isArray(cv.experience) && cv.experience.length > 0 ? cv.experience : [{ id: '1', company: '', role: '', dates: '', bullets: '' }]);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleAddExperience = () => {
    setExperience([...experience, { id: Date.now().toString(), company: '', role: '', dates: '', bullets: '' }]);
  };

  const handleRemoveExperience = (id) => {
    if (experience.length === 1) return;
    setExperience(experience.filter((exp) => exp.id !== id));
  };

  const handleExperienceChange = (id, field, value) => {
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
      alert('✅ CV tracking data coordinates saved successfully!');
    } catch (error) {
      alert('❌ Error: ' + error.message);
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
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
            <ArrowLeft size={16} />
          </Link>
          <input type="text" value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} className="bg-transparent border-b border-transparent font-bold text-sm text-white px-2 py-1 focus:outline-none" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs">
            <Layers size={12} className="text-slate-500 mr-2" />
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer">
              <option value="modern-indigo">Template: Silicon Tech Indigo</option>
              <option value="minimalist">Template: Civil Service Minimalist</option>
              <option value="executive-slate">Template: Executive Slate Grid</option>
            </select>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-500 disabled:opacity-50">
            Save Matrix
          </button>
        </div>
      </header>

      {/* PREMIUM GATEWAY UPGRADE BANNER PROMPT */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-purple-950 to-slate-900 border-b border-purple-500/20 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2 text-purple-300">
            <Sparkles size={14} className="animate-pulse" />
            <span><strong>DevCraft Premium Upgrade:</strong> Enable continuous web-scraping radars to match your curriculum data against global freelance boards automatically!</span>
          </div>
          <a href="https://paystack.com" target="_blank" rel="noopener noreferrer" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-all">
            <CreditCard size={12} /> Unlock AI Radar (₦1,500)
          </a>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-2 min-h-[calc(100vh-65px)] print:block">
        <div className="p-6 md:p-10 border-r border-slate-900 space-y-6 overflow-y-auto max-h-[calc(100vh-70px)] print:hidden">
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="Full Name" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="Email" />
          </div>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white resize-none" placeholder="Executive Summary Statement..." />
          
          <div className="space-y-4">
            <button onClick={handleAddExperience} className="text-xs font-bold text-purple-400">+ Add Job Entry</button>
            {experience.map((exp) => (
              <div key={exp.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3 relative">
                <button onClick={() => handleRemoveExperience(exp.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400"><Trash2 size={12} /></button>
                <input type="text" placeholder="Company" value={exp.company} onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                {/* FIXED TYPO COMPONENT CHANNEL LAYOUT ANCHOR */}
                <input type="text" placeholder="Official Role Position" value={exp.role} onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                <textarea rows={2} placeholder="Accomplishments..." value={exp.bullets} onChange={(e) => handleExperienceChange(exp.id, 'bullets', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white resize-none" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-12 bg-slate-900/10 flex items-start justify-center overflow-y-auto max-h-[calc(100vh-70px)] print:max-h-none print:p-0 print:bg-white">
          {theme === 'minimalist' ? (
            <TemplateMinimalist fullName={fullName} email={email} phone={phone} website={website} summary={summary} skills={skills} experience={experience} />
          ) : theme === 'executive-slate' ? (
            <TemplateExecutiveSlate fullName={fullName} email={email} phone={phone} website={website} summary={summary} skills={skills} experience={experience} />
          ) : (
            <TemplateModernIndigo fullName={fullName} email={email} phone={phone} website={website} summary={summary} skills={skills} experience={experience} />
          )}
        </div>
      </div>
    </div>
  );
}
