'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Printer, Plus, Trash2, Loader2, Download, Layers, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Import our isolated sub-component styling template modules cleanly
import TemplateMinimalist from './components/TemplateMinimalist';
import TemplateModernIndigo from './components/TemplateModernIndigo';
import TemplateExecutiveSlate from './components/TemplateExecutiveSlate';
import TemplateCreativeTeal from './components/TemplateCreativeTeal';
import TemplateCompactEuro from './components/TemplateCompactEuro';

export default function CVBuilderWizard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  // Form state elements variables
  const [resumeTitle, setResumeTitle] = useState('My Automated CV');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState([
    { id: '1', company: '', role: '', dates: '', bullets: '' },
  ]);
  const [theme, setTheme] = useState('modern-indigo');
  const [isPremium, setIsPremium] = useState(false);

  // Contact layout details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // 🤖 AI CONVERSATIONAL INTERVIEW WIZARD CONTEXT CHAT STATES
  const [currentStep, setCurrentStep] = useState(1);
  const [chatInputValue, setChatInputValue] = useState('');

  // Comprehensive step specification properties structure parameters array mapping
  const wizardStepsConfig = [
    {
      step: 1,
      title: "Identity Header",
      question: "Hello! Welcome to your DevCraft placement builder. Let's draft your document. What is your full legal name?",
      hint: "Tip: Write it exactly as it appears on your official graduation certificates or state identity profiles.",
      field: "fullName"
    },
    {
      step: 2,
      title: "Contact Links",
      question: "Excellent. Now, type your email address and primary telephone number, separated by a comma.",
      hint: "Format Example: name@example.com, +2348012345678",
      field: "contact"
    },
    {
      step: 3,
      title: "Vanity URL Subdomain",
      question: "Next, enter your preferred username handle to structure your online public portfolio dashboard link.",
      hint: "Example: typing 'agene' creates your public profile link at: ://devcraft.com",
      field: "website"
    },
    {
      step: 4,
      title: "Executive Profile Summary",
      question: "Perfect! Now write a brief introductory summary describing your skills and highest career achievements.",
      hint: "ATS Tip: Focus on numeric volume achievements. Use active expressions like 'Engineered systems scaling output by 20%' over 'Responsible for fixing bugs'.",
      field: "summary"
    },
    {
      step: 5,
      title: "Core Skill Competencies",
      question: "List your primary professional tools and core technical stack keywords, separated by commas.",
      hint: "Example: React, TypeScript, SQL, Node.js, Project Management, Sales Strategy",
      field: "skills"
    },
    {
      step: 6,
      title: "Onboarding Complete",
      question: "Fantastic job! Your core profile datasets are compiled. You can now use the traditional data inputs block below to add detailed employment timeline cards or tap 'Save Matrix' at the top toolbar header.",
      hint: "You can click on the 'Template' menu option in the top bar to test switching across all 5 styles instantly!",
      field: "complete"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase.from('profiles').select('full_name, email, phone, website, is_premium, avatar_url').eq('id', user.id).maybeSingle();
      if (profile) {
        setFullName(profile.full_name || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
        setWebsite(profile.website || '');
        setIsPremium(profile.is_premium ?? false);
        setAvatarUrl(profile.avatar_url || '');
      }

      const { data: cv } = await supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (cv) {
        setResumeTitle(cv.resume_title || 'My Automated CV');
        setSummary(cv.summary || '');
        setSkills(cv.skills ? cv.skills.join(', ') : '');
        setTheme(cv.active_template || 'modern-indigo');
        setExperience(Array.isArray(cv.experience) && cv.experience.length > 0 ? cv.experience : [{ id: '1', company: '', role: '', dates: '', bullets: '' }]);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleProcessInterviewResponse = (e) => {
    e.preventDefault();
    if (!chatInputValue.trim()) return;

    const currentConfig = wizardStepsConfig.find(s => s.step === currentStep);
    
    if (currentConfig.field === "fullName") {
      setFullName(chatInputValue);
    } else if (currentConfig.field === "contact") {
      const parts = chatInputValue.split(',');
      if (parts[0]) setEmail(parts[0].trim());
      if (parts[1]) setPhone(parts[1].trim());
    } else if (currentConfig.field === "website") {
      setWebsite(chatInputValue.toLowerCase().replace(/\s+/g, '').trim());
    } else if (currentConfig.field === "summary") {
      setSummary(chatInputValue);
    } else if (currentConfig.field === "skills") {
      setSkills(chatInputValue);
    }

    setChatInputValue('');
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

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
      await supabase.from('profiles').upsert({ id: userId, full_name: fullName, email, phone, website, avatar_url: avatarUrl, updated_at: new Date().toISOString() });
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      await supabase.from('resumes').upsert({ user_id: userId, resume_title: resumeTitle, summary, skills: skillsArray, experience, active_template: theme, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      alert('✅ Your document parameters and profile custom domain assets saved successfully!');
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-4">
        <Loader2 className="animate-spin text-indigo-500 h-8 w-8" />
        <div className="text-sm font-semibold tracking-wide text-white">Synchronizing AI Workspace Core...</div>
      </div>
    );
  }

  const currentActiveStepConfig = wizardStepsConfig.find(s => s.step === currentStep);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 print:bg-white print:text-black font-sans">
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
            <ArrowLeft size={16} />
          </Link>
          <input 
            type="text" 
            value={resumeTitle} 
            onChange={(e) => setResumeTitle(e.target.value)} 
            className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-purple-500 font-bold text-sm text-white px-2 py-1 focus:outline-none" 
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs">
            <Layers size={12} className="text-slate-500 mr-2" />
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)} 
              className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="modern-indigo">Template: Silicon Tech Indigo (Free)</option>
              <option value="minimalist">Template: Civil Service Minimalist (Free)</option>
              <option value="executive-slate">Template: Executive Slate Grid (Premium)</option>
              <option value="creative-teal">Template: Zety Creative Teal (Premium)</option>
              <option value="compact-euro">Template: Compact European (Premium)</option>
            </select>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-all shadow-md"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Matrix'}
          </button>
          <button 
            onClick={() => window.print()} 
            className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:border-slate-700 transition-all"
          >
            Print / PDF
          </button>
        </div>
      </header>

      {/* SITE-WIDE UPGRADE ADVERTISEMENT CARD BANNER */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-indigo-500/20 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2 text-indigo-300">
            <Sparkles size={14} className="animate-pulse" />
            <span><strong>Premium Track:</strong> Unlock templates 3, 4, & 5 alongside background continuous web-scraping lead hunters!</span>
          </div>
          <a 
            href="https://paystack.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition-all"
          >
            <CreditCard size={12} /> Unlock AI Radar (₦1,500)
          </a>
        </div>
      )}

      {/* Main Layout Splitting Grid */}
      <div className="max-w-[1700px] mx-auto grid lg:grid-cols-2 min-h-[calc(100vh-65px)] print:block">
        
        {/* LEFT COMPONENT: Conversational Chat UI Interface Panel */}
        <div className="p-6 md:p-10 border-r border-slate-900 space-y-8 overflow-y-auto max-h-[calc(100vh-70px)] print:hidden">
          
          {/* THE CHAT GUIDED COMPONENT COMPLIANCE PANEL BOX */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider">
                🤖 AI Career Guide Interview Box
              </span>
              <span className="text-[11px] font-mono text-slate-500">Stage {currentStep} of 6</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-white leading-relaxed font-medium bg-slate-950 p-4 rounded-xl border border-slate-900 shadow-inner">
                {currentActiveStepConfig.question}
              </p>
              <p className="text-[11px] text-slate-500 pt-1 px-1 italic">
                {currentActiveStepConfig.hint}
              </p>
            </div>

            {currentStep < 6 ? (
              <form onSubmit={handleProcessInterviewResponse} className="flex gap-2 pt-2">
                <input 
                  type="text" 
                  value={chatInputValue}
                  onChange={(e) => setChatInputValue(e.target.value)}
                  placeholder="Type your response here..." 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-slate-700"
                  required
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-colors">
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              <button 
                type="button" 
                onClick={() => setCurrentStep(1)} 
                className="w-full text-center text-[11px] text-indigo-400 hover:underline font-mono font-semibold pt-1"
              >
                ← Restart AI Interview Guided Workflow Process
              </button>
            )}
          </div>

          {/* FREE USER AVATAR PICTURE IMAGE URL STRING INJECTOR PANEL */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Append Profile Avatar Image URL
            </label>
            <input 
              type="text" 
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Paste image web link (e.g. https://unsplash.com...)" 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* MANUAL BACKGROUND CHRONOLOGY APPLICATION ROAD LISTS MAP PANELS */}
          <div className="space-y-4 pt-4 border-t border-slate-900">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Map Detailed Employment History Timeline Cards</label>
              <button 
                type="button" 
                onClick={handleAddExperience} 
                className="text-[10px] font-black font-mono text-indigo-400 hover:underline uppercase tracking-wider"
              >
                + Append Job Row
              </button>
            </div>

            {experience.map((exp) => (
              <div key={exp.id} className="p-4 bg-gradient-to-b from-slate-900/50 to-slate-900/20 border border-slate-800 rounded-xl space-y-3 relative">
                <button 
                  type="button" 
                  onClick={() => handleRemoveExperience(exp.id)} 
                  className="absolute top-4 right-4 text-slate-600 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
                <div className="grid sm:grid-cols-3 gap-2.5">
                  <input 
                    type="text" 
                    placeholder="Company/Institution" 
                    value={exp.company} 
                    onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)} 
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" 
                  />
                  <input 
                    type="text" 
                    placeholder="Official Role Position" 
                    value={exp.role} 
                    onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)} 
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" 
                  />
                  <input 
                    type="text" 
                    placeholder="Dates (e.g. 2024 - Present)" 
                    value={exp.dates} 
                    onChange={(e) => handleExperienceChange(exp.id, 'dates', e.target.value)} 
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" 
                  />
                </div>
                <textarea 
                  rows={2} 
                  placeholder="Detail core accomplishments and numeric volume metrics optimized..." 
                  value={exp.bullets} 
                  onChange={(e) => handleExperienceChange(exp.id, 'bullets', e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white resize-none focus:outline-none" 
                />
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT PANEL COLUMN: Live Active Presentation Layout Sheet Previewer Canvas */}
        <div className="p-6 md:p-12 bg-slate-900/10 flex items-start justify-center overflow-y-auto max-h-[calc(100vh-70px)] print:max-h-none print:p-0 print:bg-white">
          {theme === 'minimalist' ? (
            <TemplateMinimalist 
              fullName={fullName} 
              email={email} 
              phone={phone} 
              website={website} 
              summary={summary} 
              skills={skills} 
              experience={experience} 
              avatarUrl={avatarUrl} 
            />
          ) : theme === 'modern-indigo' ? (
            <TemplateModernIndigo 
              fullName={fullName} 
              email={email} 
              phone={phone} 
              website={website} 
              summary={summary} 
              skills={skills} 
              experience={experience} 
              avatarUrl={avatarUrl} 
            />
          ) : theme === 'executive-slate' ? (
            <TemplateExecutiveSlate 
              fullName={fullName} 
              email={email} 
              phone={phone} 
              website={website} 
              summary={summary} 
              skills={skills} 
              experience={experience} 
              avatarUrl={avatarUrl} 
            />
          ) : theme === 'creative-teal' ? (
            <TemplateCreativeTeal 
              fullName={fullName} 
              email={email} 
              phone={phone} 
              website={website} 
              summary={summary} 
              skills={skills} 
              experience={experience} 
              avatarUrl={avatarUrl} 
            />
          ) : theme === 'compact-euro' ? (
            <TemplateCompactEuro 
              fullName={fullName} 
              email={email} 
              phone={phone} 
              website={website} 
              summary={summary} 
              skills={skills} 
              experience={experience} 
              avatarUrl={avatarUrl} 
            />
          ) : (
            <TemplateModernIndigo 
              fullName={fullName} 
              email={email} 
              phone={phone} 
              website={website} 
              summary={summary} 
              skills={skills} 
              experience={experience} 
              avatarUrl={avatarUrl} 
            />
          )}
        </div>
      </div>
    </div>
  );
}