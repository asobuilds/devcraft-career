'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Plus, Trash2, Loader2, Code2, Copy, Check, Sparkles, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function PortfolioBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState(null);

  const [fullName, setFullName] = useState('');
  const [portfolioTitle, setPortfolioTitle] = useState('My Developer Portfolio');
  const [bio, setBio] = useState('');
  const [techStack, setTechStack] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [projects, setProjects] = useState([
    { id: '1', title: '', description: '', liveUrl: '', repoUrl: '', languages: '' }
  ]);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase.from('profiles').select('full_name, is_premium').eq('id', user.id).single();
      if (profile) {
        setFullName(profile.full_name || '');
        setIsPremium(profile.is_premium ?? false);
      }

      const { data: portfolio } = await supabase.from('portfolios').select('*').eq('user_id', user.id).maybeSingle();
      if (portfolio) {
        setPortfolioTitle(portfolio.title || 'My Developer Portfolio');
        setBio(portfolio.bio || '');
        setTechStack(portfolio.tech_stack || '');
        setSubdomain(portfolio.custom_subdomain || '');
        if (portfolio.projects && Array.isArray(portfolio.projects)) {
          setProjects(portfolio.projects);
        }
      }
      setLoading(false);
    };

    fetchPortfolioData();
  }, [router]);

  const handleAddProject = () => {
    setProjects([...projects, { id: Date.now().toString(), title: '', description: '', liveUrl: '', repoUrl: '', languages: '' }]);
  };

  const handleRemoveProject = (id) => {
    if (projects.length === 1) return;
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleProjectChange = (id, field, value) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  const handleSavePortfolio = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from('portfolios').upsert({
      user_id: userId,
      title: portfolioTitle,
      bio: bio,
      tech_stack: techStack,
      custom_subdomain: subdomain ? subdomain.toLowerCase().trim() : null,
      projects: projects,
    }, { onConflict: 'user_id' });
    setSaving(false);
    alert(!error ? '✅ Portfolio metrics matching catalog saved successfully!' : '❌ Error: ' + error.message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-indigo-500" size={20} />
        <span>Initializing Dev Workspace Console...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
            <ArrowLeft size={16} />
          </Link>
          <input type="text" value={portfolioTitle} onChange={(e) => setPortfolioTitle(e.target.value)} className="bg-transparent border-b border-transparent font-bold text-sm text-white px-2 py-1 focus:outline-none" />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSavePortfolio} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {"Save Engine"}
          </button>
        </div>
      </header>

      {/* SITE-WIDE EMBEDDED UPGRADE ADVERTISEMENT PROMPT */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border-b border-indigo-500/20 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-300">
            <Sparkles size={14} className="animate-pulse" />
            <span><strong>DevCraft Premium Upgrade:</strong> Activate your web-scraping lead finder radar to auto-populate cards directly onto your tracking boards!</span>
          </div>
          <a href="https://paystack.com" target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-all">
            <CreditCard size={12} /> Unlock AI Radar (₦1,500)
          </a>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-2 min-h-[calc(100vh-65px)]">
        <div className="p-6 md:p-10 border-r border-slate-900 space-y-6 overflow-y-auto h-[calc(100vh-70px)]">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Custom Vanity Subdomain Address</label>
            <input type="text" value={subdomain} onChange={(e) => setSubdomain(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="my-handle" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Primary Tech Stack Keywords Matrix</label>
            <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="React, TypeScript..." />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Professional Engineering Biography Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white resize-none" placeholder="Full-Stack Engineer specialized..." />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-900">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Production Card Matrix</label>
              <button onClick={handleAddProject} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300">+ Add Card</button>
            </div>
            {projects.map((proj) => (
              <div key={proj.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3 relative group">
                <button onClick={() => handleRemoveProject(proj.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400"><Trash2 size={12} /></button>
                <input type="text" placeholder="Application Title" value={proj.title} onChange={(e) => handleProjectChange(proj.id, 'title', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                <textarea rows={2} placeholder="Brief summary of application features..." value={proj.description} onChange={(e) => handleProjectChange(proj.id, 'description', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white resize-none" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-10 bg-slate-900/10 flex items-start justify-center h-[calc(100vh-70px)] overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-xl relative">
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">{fullName || "YOUR NAME"}</h1>
            <p className="text-xs text-slate-400 font-mono tracking-wide">{subdomain ? `${subdomain.toLowerCase()}.devcraft.com` : "://devcraft.com"}</p>
            {bio && <p className="text-xs text-slate-300 bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl">{bio}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
